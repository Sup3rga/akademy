
RouteUI.utils.data.getCourseGroupBy = function(criteria){
    var group = {},
        list = Modules.data.course;
    for(var i in list){
        if(!(list[i][criteria] in group)){
            group[criteria] = [];
        }
        group[criteria].push(list[i]);
    }
    return group;
}

RouteUI.utils.data.getCourse = function(id){
    var r = null;
    for(var i in Modules.data.course){
        r = Modules.data.course[i];
        if(r.id == id){
            break;
        }
        r = null;
    }
    return r;
}

RouteUI.utils.data.getScheduleDatas = function(grade, session){
    var list = Modules.data.course,
        r = [];
    for(var i in list){
        if(list[i].niveau == grade && list[i].session == session){
            r = merge(r,list[i].horaire);
        }
    }
    return r;
}

RouteUI.utils.data.updater.course = RouteUI.utils.data.updater.defaultCaller('getCourse');

RouteUI.utils.course = {
    createScheduleData: function(data, options){
        var options = typeof options != 'object' || options == undefined ? {} : options,
            r = {}, index, datas = [], course = {};
        options.available = 'available' in options ? options.available : false;
        options.append = 'append' in options ? Array.isArray(options.append) ? options.append : [options.append] : [];
        for(var i in data){
            index = options.available ? i : data[i].day;
            if(!(index in r)){
                r[index] = [];
            }
            if(options.available) {
                for (var k in data[i]) {
                    r[index].push({
                        begin: data[i][k][0],
                        end: data[i][k][1],
                        data: ["",ruiv.localHour(data[i][k][0],true) + " - " + ruiv.localHour(data[i][k][1],true) ]
                    });
                }
            }
            else{
                course.data = ruidata.getCourse(data[i].course);
                datas = [
                    course.data.nom,
                    ruiv.localHour(data[i].begin,true) + " - " + ruiv.localHour(data[i].end,true)
                ];
                if(set(options.teacher, false)){
                    course.teacher = ruidata.getTeacher(course.data[course.data.tp ? 'suppleant' : 'titulaire']);
                    datas.push(course.teacher.prenom+' '+course.teacher.nom);
                }
                if(set(options.room, false)){
                    course.room = ruidata.getRoom(data[i].room);
                    datas.push('('+course.room.name+')');
                }
                datas = merge(datas, options.append);
                r[index].push({
                    begin: data[i].begin,
                    end: data[i].end,
                    data: datas
                });
            }
        }
        return r;
    },
    setScheduleUI: function(course){
        var days = ruidata.pick(['workDays','weekDays','workHours']),
            hours = days.workHours,begin = -1, end = 0;
        for(var i in days.workDays){
            begin = begin >= 0 ? begin : i;
            end = i;
        }
        new ScheduleUI('#course-schedule')
            .setDaysList(days.weekDays)
            .setDaysBounds(begin, end)
            .setStartHour(hours.start)
            .setFinishHour(hours.finish)
            .create(
            rutils.course.createScheduleData(course.horaire)
        );
        new ScheduleUI('#teacher-free-schedule')
            .setDaysList(days.weekDays)
            .setDaysBounds(begin, end)
            .setStartHour(hours.start)
            .setFinishHour(hours.finish)
            .create(
            rutils.course.createScheduleData(ruidata.getTeacher(course.titulaire).available_time,{
                available: true
            })
        );
    },
    setOverallSchedule: function(){
        var grade = $_('.course-scheduler-tab .academic-grade').val(),
            session = $_('.course-scheduler-tab .academic-session').val();
        // console.log({grade,session});
        if(grade.length && session.length){
            var schedule = ruidata.getScheduleDatas(grade, session),
                days = ruidata.pick(['workDays','weekDays','workHours']),
                hours = days.workHours,begin = -1, end = 0;
                for(var i in days.workDays){
                    begin = begin >= 0 ? begin : i;
                    end = i;
                }
            new ScheduleUI('.schedular-box')
            .setHeaderHeight('40px')
            .setDaysList(days.weekDays)
            .setDaysBounds(begin, end)
            .setStartHour(hours.start)
            .setFinishHour(hours.finish)
            .create(
                rutils.course.createScheduleData(schedule,{
                    teacher: true,
                    room : true
                })
            );
        }
    },
    displayCourse: function(id){
        var course = ruidata.getCourse(id);
        RouteUI.utils.updateView('.course .presentations', {
            course: course
        }, '#coursedetails');
        this.nav.prev = this.cm.getIndex();
        this.nav.id = course.id;
        this.list = copy(course.horaire);
        this.currentCourse = course;
        this.currentPromoList = ruidata.getPromotions(course.niveau);
        this.cm.switchTo(4, true);
        var scheduleM = new Card('.course .presentations .schedulers card-manager');
        scheduleM.switchTo(0);
        rutils.course.setScheduleUI(this.currentCourse);
    }
};

RouteUI.url
.enter('/course', function(end,url){
    this.load(url.path).then(function(){
        if(!isset(url.args.card)) {
            RouteUI.utils.course.cm.switchTo(0);
        }
        RouteUI.url.setState(url.path);
        end();
    });
})
.enter('/course/id:[0-9]+', function(end,url){
    RouteUI.utils.course.displayCourse(url.args.id);
    end();
}, true)
.enter('/course/card:2', function(end){
    RouteUI.utils.course.cm.switchTo(1);
    end();
}, true);

RouteUI["/course"] = function() {
    var submit = rutils.submit,
        _course = RouteUI.utils.course,reaction = {
            schedule: false,
            books: false
        };
    _course.list = [];
    _course.cm = new Card('.course .card-manager');
    _course.nav = {
        prev: 0,
        id: 0
    };
    _course.currentCourse = null;
    _course.currentPromoList = [];

    // console.log('[Data]',Modules.data);

    submit.suite.course = function(){
        rutils.updateView('.course-list',ruidata.pick('course'));
        rutils.course.setScheduleUI(currentCourse);
        return this;
    }
    submit.suite.schedule = function(){
        $('.scheduling-card .reactable').css('display',rutils.isSameObject(_course.currentCourse.horaire, _course.list) ? 'none' : 'inline-block');
        RouteUI.utils.updateView('.scheduling-list', {
            horaire: _course.list
        }, '#coursedetails .scheduling-list');
        return this;
    }
    submit.suite.findSchedule = function(id){
        var r = {
            index : -1,
            schedule: null
        };
        for(var i in _course.list){
            if(_course.list[i].id == id || id == 'id'+i){
                r.schedule = _course.list[i];
                r.index = i;
                break;
            }
        }
        return r;
    }
    submit.course = function(course,options){
        options = set(options,{});
        course
            .off(['submit', 'invalidation'])
            .on('submit',function(data){
                console.log('[Data]',data);
                Loader.popup.show();
                Fetch.post('./submit', rutils.completeRequestData(extend(data,options)))
                    .then(function(response){
                        Loader.popup.hide();
                        if(_course.currentCourse) {
                            submit.suite.schedule();
                        }
                        submit.suite.course();
                        DialogBox.setWith('las la-check', response.message,'ok').show()
                            .onClose(function(){
                                course.hide();
                            });
                    })
                    .catch(submit.defaultRequestFail);
            })
            .on('invalidation', submit.defaultInvalidation);
    }
    submit.schedule = function(schedule,options){
        options = set(options,{});
        schedule
        .off(['submit','invalidation'])
        .on('submit',function(data){
            var begin = new AkaDatetime(data.cr_beg_hour),
                end = new AkaDatetime(data.cr_end_hour),
                scheduleItem = 'id' in options ? submit.suite.findSchedule(options.id) : null;
            if(begin.isMoreThan(end)){
                DialogBox.setWith('ion-alert', RouteUI.str("course.schedule.interval.error"), 'ok').show();
                return;
            }
            // console.log('[Data]',data,scheduleItem);
            if(scheduleItem){
                _course.list[scheduleItem.index].day = data.cr_day * 1;
                _course.list[scheduleItem.index].begin = data.cr_beg_hour;
                _course.list[scheduleItem.index].end = data.cr_end_hour;
                _course.list[scheduleItem.index].class = data.cr_clsroom;
                _course.list[scheduleItem.index].room = data.cr_room;
            }
            else {
                _course.list.push({
                    id: 'id' + _course.list.length,
                    day: data.cr_day * 1,
                    begin: data.cr_beg_hour,
                    end: data.cr_end_hour,
                    tp: false,
                    class: data.cr_clsroom,
                    room: data.cr_room
                });
            }
            schedule.hide();
            submit.suite.schedule();
        })
        .on('invalidation',submit.defaultInvalidation);
    }

    ruiv.filter = ruiv.defaultFilter('course', 'grade', {
        '.course .header .academic-session': function(current){
            return $(current).attr('data-session')
        }
    });

    /**
     * events for auto checking selection list into the criterias section
     */
    $_('.course-list-tab .academic-year')
    .on('ready',function(){
        $_('.course-list-tab .academic-section')
        .on('ready', function () {
            this.checkAll();
            $_('.course-list-tab .academic-grade')
            .on('ready', function(){
                this.checkAll();
                $_('.course-list-tab .academic-session').checkAll();
                ruiv.filter();
            })
        });
    });
    $_('.course-list-tab .academic-grade').on('change', function(){
        ruiv.filter();
    })
    $_('.course-list-tab .academic-session').on('change', function(){
        ruiv.filter();
    })
    $_('.course-scheduler-tab .academic-year')
    .on('ready', function(){
        $_('.course-scheduler-tab .academic-section')
        .on('ready', function () {
            this.checkAll();
        });
    });

    $('body')
    .on('click', '.course .add-course', function(){
        // console.log('clicked')
        rutils.waitLayer('course', function(course){
            course.html(rutils.render('#course-form', ruidata.pick(['workDays','teacher'])));
            submit.course(course);
            var form = course.getForm(),
                options = {
                    section : ruiv.createOptions(ruidata.getAcademicSections(Modules.data.currentYear.id), ['id', 'nom']),
                    session : ruiv.createOptions(Modules.data.currentYear.sessions, ['id', 'number'])
                };
            $_(form.find('.academic-section')).setOptions(options.section);
            $_(form.find('.academic-grade')).on('change',function(){
                var val = this.val();
                if(val.length && !ruidata.getPromotions(val).length){
                    DialogBox.setWith('ion-alert', RouteUI.str("course.grade.promotionless"), 'ok').show();
                }
            });
            $_(form.find('.sessions')).setOptions(options.session);
        });
    })
    .on('click', '.course .course-item .action button', function(){
        if($(this).hasClass('configure')){

        }
        else{
            console.log('[Clone]')
        }
    })
    .on('click','.course .back-to-prev',function(){
        _course.currentCourse = null;
        _course.currentPromoList = [];
    })
    .on('click', '.course .schedule-new', function(){
        rutils.waitLayer('newschedule', function(schedule){
            schedule.html(rutils.render("#formScheduler", {
                promotions: _course.currentPromoList
            }));
            submit.schedule(schedule);
            var form = schedule.getForm();
            $_(form.find('.classroom')).on('change', function(){
                var promo = ruidata.getPromotion(this.val());
                $_(form.find('.room'))
                .val(promo.room);
            })
        });
    })
    .on('click', '.schedule-element-box button', function(){
        var id = $(this).attr('data-id'),
            schedule = submit.suite.findSchedule(id);
        if($(this).hasClass('delete')){
            _course.list = removeIndex(_course.list, schedule.index);
            submit.suite.schedule();
        }
        else{
            schedule = schedule.schedule;
            rutils.waitLayer('editschedule', function(layer){
                layer.html(rutils.render("#formScheduler", {
                    promotions: _course.currentPromoList
                }));
                Form.reset(layer.getForm(),{
                    cr_day: schedule.day,
                    cr_beg_hour: schedule.begin,
                    cr_end_hour: schedule.end,
                    cr_clsroom: schedule.class,
                    cr_room: schedule.room
                });
                submit.schedule(layer,{
                    id: id
                });
            });
        }
    })
    .on('click', '.scheduling-card .reactable', function(){
        if($(this).hasClass('undo')){
            _course.list = copy(_course.currentCourse.horaire);
            submit.suite.schedule();
        }
        else{
            Loader.popup.show();
            var scheduling = copy(_course.list);
            for(var i in scheduling){
                if(/^id/.test(scheduling[i].id)){
                    delete scheduling[i].id;
                }
            }
            Fetch.post('./submit', rutils.completeRequestData({
                cr_seances: scheduling,
                cr_schedule_id: _course.currentCourse.id
            }))
            .then(function(response){
                console.log('[Response]',response);
                Loader.popup.hide();
                _course.currentCourse = ruidata.getCourse(_course.currentCourse.id);
                _course.list = copy(_course.currentCourse.horaire);
                submit.suite.schedule();
                submit.suite.course();
                DialogBox.setWith('las la-check', response.message,'ok').show();
            })
            .catch(submit.defaultRequestFail);
        }
    });

    /**
     * event for global scheduling
     */
    $_('.course-scheduler-tab .academic-grade')
        .on('change', _course.setOverallSchedule);
    $_('.course-scheduler-tab .academic-session')
        .on('change', _course.setOverallSchedule);

}