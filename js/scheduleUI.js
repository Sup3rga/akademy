if(typeof Zepto == 'undefined' && typeof jQuery == 'undefined'){
    throw new Error("ScheduleUI requires Zepto or jQuery");
}
if(typeof AkaDatetime == 'undefined'){
    throw new Error("ScheduleUI requires AkaDatetime");
}

var ScheduleUI = function(sel){
    var element = $(sel),
        schedule = {},
        config = {
            headerHeight: '70px',
            dayHeight: '40px',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            begin: 0,
            end: 4,
            start: new AkaDatetime('07:00'),
            finish: new AkaDatetime('19:00'),
            data: {}
        },
        utils = {
            init: function(){
                schedule.main = $('<div class="schedule-ui">');
                    schedule.header = $('<div class="schedule-header">');
                        schedule.days = $('<div class="schedule-days">');
                        schedule.banner = $('<div class="schedule-banner">');
                    schedule.header.append(schedule.banner).append(schedule.days);
                    schedule.body = $('<div class="schedule-body">');
                schedule.main.append(schedule.header).append(schedule.body);
                this.setDays();
            },
            positionSize: function(begin,end){
                var interval = AkaDatetime.diff(config.finish, config.start),
                    sub = AkaDatetime.diff(new AkaDatetime(begin), config.start),
                    between = AkaDatetime.diff(new AkaDatetime(end), new AkaDatetime(begin));
                return {
                    start : Math.round(sub.getStamp() / interval.getStamp() * 10000) / 100,
                    height: Math.round(between.getStamp() / interval.getStamp() * 10000) / 100
                };
            },
            schedule: function(){
                var column = {
                    wrapper: null,
                    list: null
                },
                program = {};
                for(var i in config.data){
                    if(i in schedule.columns) {
                        column.wrapper = schedule.columns[i];
                        column.wrapper.html('');
                        column.list = config.data[i];
                        for(var j in column.list){
                            program.item = $('<div class="schedule-item">');
                            program.itemXY = this.positionSize(column.list[j].begin, column.list[j].end);
                            program.item.css({
                                top: program.itemXY.start+'%',
                                height: program.itemXY.height+'%'
                            });
                                program.content = $('<div class="schedule-content">');
                                program.list = column.list[j].data;
                                for(var k in program.list){
                                    program.contentRow = $('<div class="schedule-content-row">');
                                    program.contentRow.html(program.list[k]);
                                    program.content.append(program.contentRow);
                                }
                            program.item.append(program.content);
                            column.wrapper.append(program.item);
                        }
                    }
                }
            },
            setColumns: function(){
                var column;
                schedule.columns = {};
                schedule.body.html('');
                for(var i = config.begin; i <= config.end; i++){
                    column = $('<div class="schedule-column" data-index="'+i+'">');
                    schedule.columns[i] = column;
                    schedule.body.append(column);
                }
                this.schedule();
            },
            setDays: function(){
                schedule.days.html('');
                var day;
                for(var i = config.begin; i <= config.end; i++){
                    day = $('<div class="schedule-day">');
                    day.append(config.days[i]);
                    schedule.days.append(day);
                }
                this.setColumns();
            }
        };

    this.setDaysBounds = function(begin, end){
        begin = typeof begin == 'number' || /^[0-9]$/.test(begin) ? begin * 1 : config.begin;
        end = typeof end == 'number' || /^[0-9]$/.test(end) ? end * 1 : config.end;
        config.begin = begin in config.days ? begin : 0;
        config.end = end in config.days ? end : config.days.length - 1;
        utils.setDays();
        return this;
    }

    this.setDaysList = function(list){
        var len = 0,
            indexOnly = true;
        for(var i in list){
            if(!/^[0-9]$/.test(i)){
                indexOnly = false;
                break;
            }
            len++;
        }
        if(!Array.isArray(list) && !indexOnly){
            throw new Error("argument 0 must be an array !");
        }
        if(len < 7){
            throw new Error("7 element expected from the list " + list.length+ " given !");
        }
        config.days = {};
        for(var i in list){
            config.days[i] = list[i];
        }
        config.days.length = len;
        utils.setDays();
        return this;
    }

    this.setStartHour = function(hour){
        if(!AkaDatetime.isTime(hour)){
            throw new Error("string required in time format");
        }
        config.start = new AkaDatetime(hour);
        utils.setColumns();
        return this;
    }

    this.setFinishHour = function(hour){
        if(!AkaDatetime.isTime(hour)){
            throw new Error("string required in time format");
        }
        config.finish = new AkaDatetime(hour);
        utils.setColumns();
        return this;
    }

    this.setHeaderDaysHeight = function(height){
        config.dayHeight = height;
        schedule.days.css('height', height);
        schedule.banner.css('height', 'calc('+config.headerHeight+' - '+height+')');
        return this;
    }

    this.setHeaderHeight = function(height){
        config.headerHeight = height;
        schedule.header.css('height', config.headerHeight);
        schedule.body.css('height', 'calc(100% - '+config.headerHeight+')');
        return this;
    }

    this.setScheduleData = function(data){
        data = data == undefined || typeof data != 'object' ? {} : data;
        config.data = data;
        utils.schedule();
        return this;
    }

    this.create = function(data){
        element.html(schedule.main);
        this.setScheduleData(data);
        return this;
    }

    //initializing
    utils.init();
    this.setHeaderHeight(config.headerHeight);
    this.setHeaderDaysHeight(config.dayHeight);
}