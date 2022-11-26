var Calendar = function(){

    this.DISPLAYMOD = {
        DAY: 0,
        MONTH: 1,
        YEAR: 2
    };

    Calendar.WEEKDAY = {
        SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6
    };

    var currentDate = new Date(),
        host = [],
        callbacks = {
            show: [],
            hide: [],
            select: [],
            datechange: []
        },
        mod = this.DISPLAYMOD.DAY,
        yearBounds = {
            min: 0,
            max: 0
        },
        skeleton,
        maxHeight = -1,
        firstDay = Calendar.WEEKDAY.SUNDAY,
        defaultMonths = [
            'January','Febuary', 'March','April',
            'May','June', 'July','August',
            'September', 'October','November','December'
        ],
        defaultWeekDays = [
            'Sun', 'Mon', 'Tue',
            'Wed', 'Thu', 'Fri',
            'Sat'
        ],
        markedEvents = {},
        allow = {
            selection: false
        },
        limit = {
            begin: null,
            end: null
        },
        $this = this;

    function fireEvent(ev,arg){
        ev = ev.toLowerCase();
        if(ev in callbacks){
            for(var i in callbacks[ev]){
                callbacks[ev][i](arg);
            }
        }
    }

    this.DateClass = AkaDatetime;

    this.fromDate = function(date){
        var _date = new this.DateClass();
        if(date instanceof this.DateClass){
            _date = date;
        }
        else if(this.DateClass.isDate(date)){
            _date = new this.DateClass(date);
        }
        else if(date instanceof Date && Date != this.DateClass){
            _date = new this.DateClass(date);
        }
        else{
            throw new Error("invalid date given !");
        }
        return _date;
    }

    this.setMaxHeight = function (height){
        maxHeight = height;
        return this;
    }

    this.allow = function(field,val){
        if(field in allow){
            allow[field] = val;
        }
        return this;
    }

    this.setDateBounds = function(begin,end){
        if(begin){
            limit.begin = this.fromDate(begin);
        }
        if(end){
            limit.end = this.fromDate(end);
        }
        if(begin && end){
            this.checkDateBounds();
        }
        return this;
    }

    this.getCurrentDate = function(){
        return currentDate;
    }

    this.setCurrentDate = function(date){
        currentDate = this.fromDate(date);
        date = new Date();
        date.setFullYear(currentDate.getFullYear());
        date.setMonth(currentDate.getMonth()-1);
        date.setDate(currentDate.getDay());
        currentDate = date;
        this.checkDateBounds();
        return this;
    }

    this.setFirstWeekDay = function(weekday){
        if(weekday * 1 >= Calendar.WEEKDAY.SUNDAY && weekday * 1 <= Calendar.WEEKDAY.SATURDAY){
            firstDay = weekday * 1;
        }
        return this;
    }

    this.setMonthNames = function(list){
        if(list.length < 12){
            throw new Error("12 values expected inside the list !");
        }
        defaultMonths = list;
        return this;
    }

    this.setWeekNames = function(list){
        if(list.length < 7){
            throw new Error("7 values expected inside the list !");
        }
        defaultWeekDays = list;
        return this;
    }

    this.addMarkedEvent = function(date,description){
        date = this.fromDate(date);
        date = date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate();
        if(!(date in markedEvents)){
            markedEvents[date] = [];
        }
        markedEvents[date].push(description);
        return this;
    }

    this.getMontConfig = function(coord){
        var completeCircle = currentDate.getFullYear() % 4 == 0,
            month = currentDate.getMonth(),
            previous = month - 1 < 0 ? 11 : month - 1,
            maxDay = function(month){
                month++;
                return month <= 7 ?
                    (month % 2 ? 31 : month == 2 ? completeCircle ? 29 : 28 : 30) :
                    (month % 2 ? 30 : 31);
            },
            config = {
                maxDay : {
                    current: maxDay(month),
                    previous: maxDay(previous)
                },
                rows: {
                    qty: 1,
                    height: 0,
                    width: coord.width / 7
                },
                beginDay: new $this.DateClass(currentDate).getWeekDay() - firstDay + 1,
            };
        //beginDay
        for(var i = currentDate.getDate(); i >= 1; i--){
            config.beginDay--;
            if(config.beginDay < 0){
                config.beginDay = 6;
            }
        }
        //maxRow
        for(var i = 1, j = config.beginDay; i <= config.maxDay.current; i++){
            if(j >= 6){
                config.rows.qty++;
                j = 0;
            }
            else{
                j++;
            }
        }
        coord.height = maxHeight > 0 && coord.height >= maxHeight ? maxHeight : coord.height;
        config.rows.height = coord.height * 0.8 / (config.rows.qty + 1);
        return config;
    }

    this.setSkeleton = function(){
        skeleton = document.createElement('div');
        var header = document.createElement('div'),
            nav = [
                document.createElement('span'),
                document.createElement('span')
            ],
            central = document.createElement('span'),
            month = document.createElement('span'),
            year = document.createElement('span'),
            reset = document.createElement('span');
        skeleton.onselectstart = function(){return false;};
        skeleton.className = 'calendar-ui';
        header.className = 'calendar-header';
        nav[0].className = 'nav previous';
        nav[1].className = 'nav next';
        central.className = 'central';
        month.className = '_date month';
        year.className = '_date year';
        reset.className = '_date';

        skeleton.appendChild(header);
            header.appendChild(nav[0]);
                nav[0].innerHTML = '&laquo;';
            header.appendChild(central);
                central.appendChild(month);
                    month.innerText = defaultMonths[currentDate.getMonth()];
                central.appendChild(year);
                    year.innerText = currentDate.getFullYear();
                central.appendChild(reset);
                    reset.innerHTML = '&larrhk;';
                    reset.style.display = 'none';
            header.appendChild(nav[1]);
                nav[1].innerHTML = '&raquo;';
        skeleton.appendChild(this.getView());
        var $this = this;
        nav[0].addEventListener('click', function(){
            $this.goto(false);
        });
        nav[1].addEventListener('click', function(){
            $this.goto(true);
        });
        month.addEventListener('click', function(){
            mod = $this.DISPLAYMOD.MONTH;
            $this.update();
        });
        year.addEventListener('click', function(){
            mod = $this.DISPLAYMOD.YEAR;
            yearBounds.min = currentDate.getFullYear() - 7;
            yearBounds.max = yearBounds.min + 15;
            $this.update();
        });
        reset.addEventListener('click', function (){
            mod = $this.DISPLAYMOD.DAY;
            currentDate = new Date();
            $this.update();
        })

        return skeleton;
    }

    this.checkDateBounds = function(){
        var targetDate = new $this.DateClass(currentDate);
        if(limit.begin && limit.begin.isMoreThan(targetDate)){
            currentDate.setFullYear(limit.begin.getFullYear());
            currentDate.setMonth(limit.begin.getMonth()-1);
            currentDate.setDate(limit.begin.getDay());
        }
        if(limit.end && limit.end.isLessThan(targetDate)){
            currentDate.setFullYear(limit.end.getFullYear());
            currentDate.setMonth(limit.end.getMonth()-1);
            currentDate.setDate(limit.end.getDay());
        }
    }

    this.goto = function(ahead){
        var date = {
            day: currentDate.getDate(),
            month: currentDate.getMonth(),
            year: currentDate.getFullYear()
        }
        if(mod == this.DISPLAYMOD.DAY && allow.selection){
            date.day += ahead ? 1 : -1;
            if(date.day <= 0){
                date.month--;
                if(date.month < 0){
                    date.year--;
                    date.month = 11;
                }
            }
            var config = this.getMontConfig(date.month);
            if(date.day > config.maxDay.current){
                date.day = 1;
                date.month++;
                if(date.month > 11){
                    date.month = 0;
                    date.year++;
                }
            }
            else if(date.day <= 0){
                date.day = config.maxDay.previous;
            }
        }
        else if(mod == this.DISPLAYMOD.MONTH || (!allow.selection && mod != this.DISPLAYMOD.YEAR)){
            date.month += ahead ? 1 : -1;
            if(date.month > 11){
                date.month = 0;
                date.year++;
            }
            else if(date.month < 0){
                date.month = 11;
                date.year--;
            }
            var config = this.getMontConfig(date.month);
            if(date.day > config.maxDay.current){
                date.day = config.maxDay.current;
                date.month++;
            }
        }
        else{
            yearBounds.min += ahead ? 7 : -7;
            yearBounds.max = yearBounds.min + 15;
        }
        currentDate.setFullYear(date.year);
        currentDate.setDate(date.day);
        currentDate.setMonth(date.month);
        currentDate.setDate(date.day);
        this.checkDateBounds();
        fireEvent('datechange',{
            calendar: $this,
            date: currentDate,
            args: null
        });
        return this.update();
    }

    this.getView = function(){
        if(mod == this.DISPLAYMOD.DAY){
            return this.getDays();
        }
        else if(mod == this.DISPLAYMOD.MONTH){
            return this.getMonths();
        }
        else{
            return this.getYears();
        }
    }

    this.getDays = function(){
        var body = document.createElement('div'),
            weeks = document.createElement('div'), week,
            day, row,
            coord = {
                width : host ? host.offsetWidth : 40,
                height: host ? host.offsetHeight : 40
            },
            $this = this,
            config = this.getMontConfig(coord);
        body.className = 'calendar-body';
        weeks.className = 'weekname row';
        body.appendChild(weeks);
        for(var i in defaultWeekDays){
            week = document.createElement('span');
            week.className = 'week cell current';
            week.style.width = config.rows.width+'px';
            week.style.height = config.rows.height+'px';
            week.innerText = defaultWeekDays[i];
            weeks.appendChild(week);
        }
        //previous month
        row = document.createElement('div');
        row.className = 'row';
        for(var i = 0; i < config.beginDay; i++){
            day = document.createElement('span');
            day.className = 'day cell';
            day.style.width = config.rows.width+'px';
            day.style.height = config.rows.height+'px';
            day.innerText = config.maxDay.previous - (config.beginDay - i - (config.maxDay.previous < 31 ? 1 : 1));
            row.appendChild(day);
        }
        var j = config.beginDay,markEvent, ev,list, taken = 'current', actual = new Date(), _actual;
        for(var i = 1; i <= config.maxDay.current; i++){
            day = document.createElement('span');
            if(limit.begin || limit.end) {
                actual.setFullYear(currentDate.getFullYear());
                actual.setMonth(currentDate.getMonth());
                actual.setDate(i);
                _actual = new AkaDatetime(actual);
                if (limit.begin) {
                    taken = _actual.compareTo(limit.begin) >= AkaDatetime.EQUALS ? 'current' : '';
                }
                if (limit.end && taken !== '') {
                    taken = _actual.compareTo(limit.end) <= AkaDatetime.EQUALS ? 'current' : '';
                }
            }
            day.className = 'day cell '+taken+' '+(currentDate.getDate() == i ? 'today' : '');
            day.style.width = config.rows.width+'px';
            day.style.height = config.rows.height+'px';
            day.innerHTML = i;
            day.setAttribute('name',i);
            if(currentDate.getFullYear()+'-'+currentDate.getMonth()+'-'+i in markedEvents){
                day.className += ' marked';
                markEvent = document.createElement('div');
                markEvent.className = 'markevent';
                list = markedEvents[currentDate.getFullYear()+'-'+currentDate.getMonth()+'-'+i];
                for(var k in list){
                    ev = document.createElement('p');
                    ev.innerHTML = list[k];
                    markEvent.appendChild(ev);
                }
                day.appendChild(markEvent);
            }
            if(taken != '') {
                day.addEventListener('click', function () {
                    if (allow.selection) {
                        currentDate.setDate(this.getAttribute('name'));
                        $this.update();
                        fireEvent('select',{
                            date: currentDate,
                            calendar: $this,
                            args: null
                        });
                        fireEvent('datechange',{
                            date: currentDate,
                            calendar: $this,
                            args: null
                        });
                    }
                });
            }
            row.appendChild(day);
            if(j >= 6){
                body.appendChild(row);
                row = document.createElement('div')
                row.className = 'row';
                j = 0;
            }
            else{
                j++;
            }
        }
        //Next month
        for(var i = j, k = 1; i <= 6; i++, k++){
            day = document.createElement('span');
            day.className = 'day cell';
            day.style.width = config.rows.width+'px';
            day.style.height = config.rows.height+'px';
            day.innerText = k;
            row.appendChild(day);
        }
        body.appendChild(row);
        return body;
    }

    this.getMonths = function(){
        var body = document.createElement('div'),
            row, month,
            coord = {
                width : host ? host.offsetWidth : 40,
                height: host ? host.offsetHeight : 40
            },
            $this = this,
            config = this.getMontConfig(coord);
        body.className = 'calendar-body';

        row = document.createElement('div')
        row.className = 'row';

        for(var i = 0, j = defaultMonths.length; i < j; i++){
            month = document.createElement('span');
            month.className = 'cell month '+(currentDate.getMonth() == i ? 'current' : '');
            month.innerText = defaultMonths[i];
            month.style.height = (coord.height * 0.8 / 4)+'px';
            month.style.width = (coord.width / 3)+'px';
            row.appendChild(month);
            month.addEventListener('click', function(){
                mod = $this.DISPLAYMOD.DAY;
                currentDate.setMonth(defaultMonths.indexOf(this.innerText));
                fireEvent('datechange',{
                    date: currentDate,
                    calendar: $this,
                    args: null
                });
                $this.update();
            });
            if(i > 0 && (i + 1) % 3 == 0){
                body.appendChild(row);
                row = document.createElement('div');
                row.className = 'row';
            }
        }
        body.appendChild(row);

        return body;
    }

    this.getYears = function(){
        var body = document.createElement('div'),
            row, year,
            coord = {
                width : host ? host.offsetWidth : 40,
                height: host ? host.offsetHeight : 40
            },
            $this = this;
        body.className = 'calendar-body';
        row = document.createElement('div')
        row.className = 'row';
        var baseYear = yearBounds.min;
        for(var i = 0; i < 16; i++){
            year = document.createElement('span');
            year.className = 'cell year '+(currentDate.getFullYear() == baseYear + i ? 'current' : '');
            year.innerText = baseYear + i;
            year.style.height = (coord.height * 0.8 / 4)+'px';
            year.style.width = (coord.width / 4)+'px';
            row.appendChild(year);
            year.addEventListener('click', function(){
                mod = $this.DISPLAYMOD.DAY;
                currentDate.setFullYear(this.innerText);
                fireEvent('datechange',{
                    date: currentDate,
                    calendar: $this,
                    args: null
                });
                $this.update();
            });
            if(i > 0 && (i + 1) % 4 == 0){
                body.appendChild(row);
                row = document.createElement('div');
                row.className = 'row';
            }
        }
        return body;
    }

    this.setLimitDom = function(el){
        if(!(el instanceof HTMLElement)){
            if(typeof el == 'string'){
                el = document.querySelector(el);
            }
            else{
                throw new Error("an element from dom is required !");
            }
        }
        host = el;
        return this;
    }

    this.create = function(){
        if(host){
            host.innerHTML = "";
            this.checkDateBounds();
            host.appendChild(this.setSkeleton());
        }
        return this;
    }

    this.update = function(){
        var month = skeleton.childNodes[0].childNodes[1].childNodes[0],
            year = skeleton.childNodes[0].childNodes[1].childNodes[1],
            reset = skeleton.childNodes[0].childNodes[1].childNodes[2];
        year.style.display = 'flex';
        reset.style.display = 'none';
        if(mod != this.DISPLAYMOD.DAY){
            if(mod == this.DISPLAYMOD.YEAR){
                year.style.display = 'none';
                reset.style.display = 'flex';
            }
            month.style.display = 'none';
        }
        else{
            month.style.display = 'flex';
        }
        month.innerText = defaultMonths[currentDate.getMonth()];
        year.innerText = currentDate.getFullYear();
        skeleton.removeChild(skeleton.childNodes[1]);
        skeleton.appendChild(this.getView());
        return this;
    }

    this.on = function(event, callback){
        event = event.toLowerCase();
        if(event in callbacks){
            callbacks[event].push(callback);
        }
        return this;
    }

    this.trigger = function(event, arg){
        fireEvent(event,{
            calendar: $this,
            date: currentDate,
            args: arg
        });
    }
}

Calendar.setMultipleDoms = function(el){
    if(typeof el == 'string'){
        el = document.querySelectorAll(el);
    }
    else{
        throw new Error("string is required !");
    }
    if(el){
        for(var i in el){
            if(/[0-9]+/.test(i)){
                new Calendar().setLimitDom(el[i]).create();
            }
        }
    }
}