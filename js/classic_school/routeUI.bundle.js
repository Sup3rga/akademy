if(!('RouteUI' in window) || RouteUI === undefined){
    window.RouteUI = {};
}

RouteUI.str = function(index,arr){
    arr = isset(arr) ? arr : false;
    return index in RouteUI.strings ? RouteUI.strings[index] : (arr ? [] : '');
}

RouteUI.layerFormObjects = {};
RouteUI.utils = {};
RouteUI.utils.view = {};
RouteUI.utils.charts = {};
RouteUI.utils.data = {};
RouteUI.utils.submit = {
    suite:{},
    defaultInvalidation: function(){
        DialogBox.setWith('ion-alert',RouteUI.str("incomplete.data"),'ok').show();
    },
    defaultRequestFail: function(message){
        Loader.popup.hide();
        DialogBox.setWith('ion-alert', message, 'ok').show();
    }
};

//Alias
window.rui = RouteUI;
window.rutils = RouteUI.utils;
window.ruiv = RouteUI.utils.view;
window.ruidata = RouteUI.utils.data;

RouteUI.utils.toggleAcademicNav = function(input){
    $('.academic-chooser.prev')[!input.hasPrev() ? 'addClass' : 'removeClass']('disabled');
    $('.academic-chooser.next')[!input.hasNext() ? 'addClass' : 'removeClass']('disabled');
    var val = input.val();
    if(val.length) {
        var academic = RouteUI.utils.data.getAcademicYear(val);
        $('.academic .session .arrow-data .year').html(academic.academie);
        RouteUI.utils.updateView('card.session', {
            k: 1,
            currentYear: academic
        });
        RouteUI.utils.updateAcademicStats(val);
    }
}

RouteUI.utils.updateAcademicStats = function(index){
    var ctx = $('.diagramme')[0].getContext('2d'),
        current = RouteUI.utils.data.getAcademicYear(index),
        data = [current.nb_prof, current.nb_etu, current.nb_filiere, current.nb_cours];

    $('.academic #passYear, .academic #editYear')[current.id == Modules.data.currentYear.id ? 'show' : 'hide']();
    $('.academic .switch button[index="0"]')[current.etat != 'F' ? 'addClass' : 'removeClass']('off');
    $('.academic .switch button[index="1"]')[current.etat == 'F' ? 'addClass' : 'removeClass']('off');

    if('academic' in RouteUI.utils.charts){
        RouteUI.utils.charts.academic.data.datasets[0].data = data;
        RouteUI.utils.charts.academic.update();
        return;
    }
    RouteUI.utils.charts.academic = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: RouteUI.str("academic.stats.head.school",true),
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

RouteUI.utils.extractTemplate = function(selector){
    var template = Modules.res.sidemenu[History.current].content,
        selector = selector.split(/ +/),
        template = $(template);
    for(var i in selector){
        if(!template[0].childNodes.length) {
            template = $('<div>'+template.html()+'</div>');
        }
        template = template.find(selector[i]);
    }
    return template.html().replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

RouteUI.utils.render = function(template,options){
    var options = set(options, {}),
        template = /^[#.][a-z0-9._-]+$/i.test(template) ? this.extractTemplate(template) : template;
    return ejs.render(template, extend(Modules.defaultOptions(),options,true))
}

RouteUI.utils.updateView = function(selector, options, template){
    var template = set(template,selector);
    $(selector).html(this.render(this.extractTemplate(template), options));
    return this;
}

RouteUI.utils.waitLayer = function(id, callback){
    if(id in RouteUI.layerFormObjects){
        callback(RouteUI.layerFormObjects[id]);
    }
    else{
        var time = setTimeout(function(){
            clearTimeout(time);
            RouteUI.utils.waitLayer(id,callback);
        },100);
    }
}

RouteUI.utils.completeRequestData = function(options){
    return extend(options,{
        reqtoken: Modules.data.credentials,
        requid: Modules.data.id,
    });
}

RouteUI.utils.groupByPrefix = function(data,prefixes,glue){
    var prefixes = Array.isArray(prefixes) ? prefixes : [],
        glue = set(glue,','),
        r = {},
        caught = false;
    for(var i in data){
        caught = false;
        for(var j in prefixes){
            if(new RegExp('^'+prefixes[j]).test(i)){
                caught = true;
                if(!(prefixes[j] in r)){
                    r[prefixes[j]] = "";
                }
                r[prefixes[j]] += (r[prefixes[j]].length ? glue : '')+data[i];
            }
        }
        if(!caught){
            r[i] = data[i];
        }
    }
    return r;
}

RouteUI.utils.data.pick = function(index){
    var index = Array.isArray(index) ? index : [index],
        r = {};
    for(var i in index){
        if(index[i] in Modules.data){
            r[index[i]] = Modules.data[index[i]];
        }
    }
    return r;
}
RouteUI.utils.data.use = RouteUI.utils.data.pick;

RouteUI.utils.data.getAcademicYear = function(id){
    var r = {};
    for(var i in Modules.data.academic){
        if(Modules.data.academic[i].id == id){
            r = Modules.data.academic[i];
            break;
        }
    }
    return r;
} //

RouteUI.utils.data.getSession = function(id,academic){
    var r = null,
        academic = set(academic,null);
    function findSession(academic){
        var r = null;
        for(var i in academic.sessions){
            if(academic.sessions[i].id == id){
                r = academic.sessions[i];
                break;
            }
        }
        return r;
    }
    if(academic){
        var academic = this.getAcademicYear(academic);
        if(academic){
            r = findSession(academic);
        }
    }
    else {
        for (var i in Modules.data.academic) {
            r = findSession(Modules.data.academic[i]);
            if(r){
                break;
            }
        }
    }
    return r ? r : {};
} //

RouteUI.utils.data.getAcademicSection = function(id){
    var r = null;
    for(var i in Modules.data.faculty){
        if(Modules.data.faculty[i].id == id){
            r = Modules.data.faculty[i];
            break;
        }
    }
    return r;
} //

RouteUI.utils.data.getAcademicSections = function(academicId){
    var r = [];
    for(var i in Modules.data.faculty){
        if(Modules.data.faculty[i].academic == academicId){
            r.push(Modules.data.faculty[i]);
        }
    }
    return r;
} //

RouteUI.utils.data.getClass = function(id,section){
    section = set(section,0);
    section = section ? this.getAcademicSection(section) : null;
    var r = null;
    function find(section){
        var r = null;
        for (var k in section.grades){
            if(section.grades[k].id == id){
                r = section.grades[k];
                break;
            }
        }
        return r;
    }
    if(section){
        r = find(section);
    }
    else {
        for (var i in Modules.data.faculty) {
            r = find(Modules.data.faculty[i]);
            if(r){
                break;
            }
        }
    }
    return r;
} //

RouteUI.utils.data.getRoom = function(id){
    var r = null;
    for(var i in Modules.data.room){
        if(Modules.data.room[i].id == id){
            r = Modules.data.room[i];
            break;
        }
    }
    return r;
} //

RouteUI.utils.data.getAcademicSectionOf = function(classId){
    var r = null;
    for (var i in Modules.data.faculty) {
        for(var k in Modules.data.faculty[i].grades){
            if(Modules.data.faculty[i].grades[k].id == classId){
                r = Modules.data.faculty[i];
                break;
            }
        }
        if(r){
            break;
        }
    }
    return r;
} //

RouteUI.utils.data.getPromotion = function(id){
    var r = null;
    for(var i in Modules.data.promotion){
        if(Modules.data.promotion[i].id == id){
            r = Modules.data.promotion[i];
            break;
        }
    }
    return r;
} //

RouteUI.utils.data.getExamPeriodsGroup = function(sessionId){
    var list = [];
    for(var i in Modules.data.exam_period){
        if(Modules.data.exam_period[i].session == sessionId){
            list.push(Modules.data.exam_period[i]);
            break;
        }
    }
    return list;
} //

RouteUI.utils.data.getStudent = function(id){
    var r = null;
    for(var i in Modules.data.student){
        r = Modules.data.student[i];
        if(r.id == id){
            break;
        }
        r = null;
    }
    return r;
} //

RouteUI.utils.data.getTeacher = function(id){
    var r = null;
    for(var i in Modules.data.teacher){
        r = Modules.data.teacher[i];
        if(r.id == id){
            break;
        }
        r = null;
    }
    return r;
} //

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
} //

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
} //

RouteUI.utils.view.localDate = function(date){
    var date = new AkaDatetime(date);
    return date.getDay() + " " + RouteUI.str("calendar.months", true)[date.getMonth() - 1] + " " + date.getYear();
}

RouteUI.utils.view.sortClassroomByGrade = function(list){
    var r = {};
    for(var i in list){
        if(!(list[i].grade.id in r)){
            r[list[i].grade.id] = [];
        }
        r[list[i].grade.id].push(list[i]);
    }
    return r;
} //

RouteUI.utils.view.createOptions = function(data,model,prefix){
    var model = Array.isArray(model) ? model : [],
        options = {};
    prefix = set(prefix,'');
    if(model.length < 2){
        return options;
    }
    for(var i in data){
        options[data[i][model[0]]] = prefix+data[i][model[1]];
    }
    return options;
}

RouteUI.utils.view.filter = null;
RouteUI.utils.view.getSection = RouteUI.utils.data.getAcademicSection; //

for(var i in RouteUI.utils.data){
    RouteUI.utils.view[i] = RouteUI.utils.data[i];
} //

RouteUI["/"] = function(){
    var canvasContext = {
            timeline : $('#timeline')[0].getContext('2d'),
            promotion : $('#promotion')[0].getContext('2d')
        },
        charts = {},
        data = Modules.data.dashboard,
        datasets = [], colors = {
            background : [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)'
            ],
            border: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
            ]
        };
    Modules.setSearchVisible(false);
    var calendar = new Calendar();
    calendar.setMonthNames(RouteUI.str('calendar.months')).setWeekNames(RouteUI.str("calendar.weeks")).setLimitDom('#calendar')
        .allow('selection', false)
        .create();
    //timeline
    var tmp, k = 0, names = RouteUI.str('dashboard.stats.head.school',true),
        index = [];
    for(var i in data.etudiantTimeLine){
        index.push(i);
    }
    index.sort();
    datasets.push({labels: [], datasets: []});
    for(var i in index){
        i = index[i];
        datasets[0].labels.push(i);
        tmp = [data.etudiantTimeLine[i], data.profTimeLine[i], data.courseTimeLine[i], data.filiereTimeLine[i]];
        if(!datasets[0].datasets.length) {
            for(var k = 0 ; k < tmp.length; k++){
                datasets[0].datasets.push({
                    label: names[k],
                    data: [tmp[k]],
                    borderColor: colors.border[k % 5],
                    backgroundColor: colors.background[(k + 1) % 5],
                    tension: 0.8,
                    borderWidth: 1,
                    fill: true
                });
            }
        }
        else{
            for(var k = 0 ; k < tmp.length; k++){
                datasets[0].datasets[k].data.push(tmp[k])
            }
        }
    }

    charts.timeline = new Chart(canvasContext.timeline, {
        type: 'line',
        data: datasets[0],
        options: {
            indexAxis: 'x',
            scales: {
                x: {
                    beginAtZero: false
                }
            }
        }
    });
    var percent = Math.round(data.lastYearPromotedStudents / (data.lastYearPromotedStudents + data.lastYearStackStudents) * 10000) / 100;
    charts.promotion = new Chart(canvasContext.promotion, {
        type: 'doughnut',
        data:{
            labels: RouteUI.str('dashboard.stats.promotion.head',true),
            datasets: [{
                data: [percent,100-percent],
                backgroundColor: [colors.border[3], colors.border[0]],
                hoverOffset: 8,
                cutout: '60%'
            }]
        }
    });
} //

RouteUI["/academic-year"] = function(){
    var cm = new Card('.academic');
    cm.onSwitch(function(index){
        console.log('[Index]',index);
        $('.academic .var')[index != 2 ? "show" : "hide"]();
        $('.academic .var.session')[index == 2 ? "show" : "hide"]();
    });
    var input = $_('#academic-slide'),
        calendar = new Calendar(),
        session = null,
        submit = RouteUI.utils.submit;
    submit.suite.session = function(id){
        if(id){
            var session = RouteUI.utils.data.getSession(id);
            session.periods = RouteUI.utils.data.getExamPeriodsGroup(session.id);
            $('.academic .session .arrow-data .session').html(session.number);
            RouteUI.utils.updateView('.session-view', extend(session,Modules.defaultOptions()), '#session-view');
        }
        else{
            $('.academic .back-to-prev').trigger('click');
        }
        RouteUI.utils.toggleAcademicNav(input);
    };
    submit.session = function(session,options){
        options = set(options,{});
        session.off(['submit','invalidation']);
        session.on('submit',function(data){
            if(new AkaDatetime(data.sess_end).compareTo(new AkaDatetime(data.sess_begin)) <= AkaDatetime.EQUALS){
                DialogBox
                    .setWith("ion-alert", RouteUI.str("session.incoherent.date"), "OK")
                    .show().onClose(function(){
                    resolve();
                });
                return;
            }
            Loader.popup.show();
            Fetch.post('./submit', RouteUI.utils.completeRequestData(extend(data,options))).then(function(response){
                Loader.popup.hide();
                if(!response.error){
                    submit.suite.session(options.sess_id);
                }
                DialogBox
                    .setWith(response.error ? "ion-alert" : "ion-android-done", response.message, "OK")
                    .show()
                    .onClose(function(){
                        if(!response.error) {
                            session.hide();
                        }
                    });
            }).catch(submit.defaultRequestFail);
        }).on('invalidation', submit.defaultInvalidation);
    };
    submit.academic = function(academic,options){
        return new Promise(function(resolve){
            academic.off('submit');
            academic.on('submit', function(data){
                data = extend(data,options);
                if(new AkaDatetime(data.anneeAka_end).compareTo(new AkaDatetime(data.anneeAka_begin)) <= AkaDatetime.EQUALS){
                    DialogBox
                        .setWith("ion-alert", RouteUI.str("session.incoherent.date"), "OK")
                        .show().onClose(function(){
                        resolve();
                    });
                    return;
                }
                Loader.popup.show();
                Fetch.post('./submit',RouteUI.utils.completeRequestData(data)).then(function(response){
                    Loader.popup.hide();
                    DialogBox
                        .setWith(response.error ? "ion-alert" : "ion-android-done", response.message, "OK")
                        .show().onClose(function(){
                        academic.hide();
                        RouteUI.utils.toggleAcademicNav(input);
                        resolve();
                    });
                }).catch(function(message){
                    Loader.popup.hide();
                    DialogBox.setWith("ion-alert",message, "OK")
                        .onClose(function () {
                            console.log('[Message]',message);
                            History.reach();
                        }).show();
                });
            });
        });
    };
    submit.suite.period = function(id){

    };
    submit.period = function(period,options){
        options = set(options,{});
        period.off(['submit','invalidation'])
            .on('submit',function(data){
                Loader.popup.show();
                if(new AkaDatetime(data.exam_begin))
                    Fetch.post('./submit',RouteUI.utils.completeRequestData(extend(data,options)))
                        .then(function(response){
                            Loader.popup.hide();
                            if(!response.error){
                                submit.suite.period(options.exam_period_id);
                            }
                            DialogBox.setWith(response.error ? 'ion-alert' : 'las la-check', response.message, 'ok')
                                .show().onClose(function(){
                                if(!response.error){
                                    period.hide();
                                }
                            })
                        }).catch(submit.defaultRequestFail);
            })
            .on('invalidation', submit.defaultInvalidation);
    };

    calendar.setMonthNames(RouteUI.str('calendar.months')).setWeekNames(RouteUI.str("calendar.weeks")).setLimitDom('#calendar')
        .allow('selection', true).setMaxHeight(220)
        .on('datechange', function(e){
            $('.calendar-view .currentdate').html(RouteUI.utils.view.localDate(new AkaDatetime(e.date).getDate()));
        });
    input.on('change,ready', function(){
        RouteUI.utils.toggleAcademicNav(input);
    });
    $('body')
        .on('click', '.academic .back-to-prev', function(){
            cm.switchTo(0);
        })
        .on('click', '.aka-form', function(){
            RouteUI.utils.waitLayer('academic',function(academic){
                academic.setDimensions(LayerForm.DIMENSION.SMALL);
                submit.academic(academic,{});
            });
        })
        .on('click', '.academic-chooser', function(){
            input[$(this).hasClass('next') ? 'next' : 'prev']();
        })
        .on('change', '#Aka-yearForm .input', function(){
            var date = new AkaDatetime($(this).val());
            $('#Aka-yearForm .anneeAcademique '+($(this).hasClass('begin') ? '.begin' : '.end')).text(date.getYear());
        })
        .on('click', '.session-box', function(){
            if($(this).hasClass('adder')){
                RouteUI.utils.waitLayer('session', function(session){
                    submit.session(session);
                });
            }
            else{
                var id = $(this).attr('data-id'),
                    target = $(this).attr('data-target');
                session = RouteUI.utils.data.getSession(id, target);
                session.academic = target;
                session.periods = RouteUI.utils.data.getExamPeriodsGroup(session.id);
                $('.academic .session .arrow-data .session').html(session.number);
                RouteUI.utils.updateView('.session-view', extend(session,Modules.defaultOptions()), '#session-view');
                var calendarView = new Card('.calendar-view');
                calendar.setDateBounds(session.begin, session.end).setCurrentDate(new Date());
                calendar.setLimitDom($('.session-view .calendar-zone')[0]).create().trigger('datechange');
                cm.switchTo(2);
                calendarView.switchTo(0);
            }
        })
        .on('click', '.edit-session', function(){
            var id = $(this).attr('data-id'),
                target = $(this).attr('data-target'),
                current = RouteUI.utils.data.getSession(id,target);
            RouteUI.utils.waitLayer('sessionedit', function(session){
                session.html(RouteUI.utils.render(RouteUI.utils.extractTemplate('#academic-session')))
                    .on('submit', function(data){
                        data.sess_id = id;
                        submit.session(data,session).then(function(){
                            RouteUI.utils.waitLayer('sessionview', function(session){
                                session.hide();
                            });
                        });
                    })
                    .on('invalidation', function(){
                        DialogBox.setWith("ion-alert",RouteUI.str("incomplete.data"), "OK").show();
                    });
                KInput.watch();
                Form.reset(session.getForm().parent(), {
                    sess_number: current.number,
                    sess_begin: current.begin,
                    sess_end: current.end
                });

            });
        })
        .on('click', '.delete-session', function(){
            var id = $(this).attr('data-id');
            DialogBox.setWith("las la-question", RouteUI.str("session.deletion.message.alert"), "YesNo")
                .show()
                .onClose(function (e,proceed) {
                    if(proceed){
                        console.trace('[proceed]');
                        Loader.popup.show();
                        Fetch.post('./submit',RouteUI.utils.completeRequestData({
                            sess_del_id : id
                        })).then(function(response){
                            Loader.popup.hide();
                            console.log('[Response]',response);
                            DialogBox.setWith(response.error ? "ion-alert" : "ion-android-done", response.message, "ok").show()
                                .onClose(function(){
                                    if(!response.error) {
                                        History.reach();
                                        RouteUI.utils.waitLayer("sessionview", function (layer) {
                                            layer.hide();
                                        });
                                    }
                                });
                        }).catch(function (message){
                            Loader.popup.hide();
                            console.log('[ID]',id);
                            DialogBox.setWith("ion-alert", message, "ok").show();
                        });
                    }
                });
        })
        .on('click', '.akaction', function(){
            if($(this).hasClass('chart-academic')) {
                $(this).toggleClass('active');
                cm.switchTo($(this).hasClass('active') ? 1 : 0);
            }
            else if($(this).hasClass('edit-academic')){
                var academic = Modules.data.academic[input.val()];
                RouteUI.utils.waitLayer('academic-edition', function(edition){
                    if(academic.etat != 'A'){
                        DialogBox.setWith("ion-alert", RouteUI.str("academic.year.edition.alert"), "YesNo")
                            .show()
                            .onClose(function(e,action){
                                if(!action){
                                    edition.hide();
                                }
                            });
                    }
                    var form = edition.getForm();
                    Form.reset(form,{
                        anneeAka_begin : academic.debut,
                        anneeAka_end: academic.fin
                    });
                    form.find('.anneeAcademique .begin').html(academic.annee_debut);
                    form.find('.anneeAcademique .end').html(academic.annee_fin);
                    submit.academic(edition, {
                        reqeditid: academic.id
                    });
                });
            }
            else if($(this).hasClass('edit-session')){
                RouteUI.utils.waitLayer('session-edition', function(sessionLayer){
                    Form.reset(sessionLayer.getForm(), {
                        sess_number: session.number,
                        sess_begin: session.begin,
                        sess_end: session.end
                    });
                    submit.session(sessionLayer,{
                        sess_id: session.id
                    });
                });
            }
            else if($(this).hasClass('delete-session')){
                DialogBox.setWith('las la-question', RouteUI.str("session.deletion.message.alert"), "yesno")
                    .show().onClose(function(e,proceed){
                    if(proceed){
                        Fetch.post("./submit", RouteUI.utils.completeRequestData({
                            sess_del_id: session.id
                        })).then(function(response){
                            if(!response.error){
                                submit.suite.session();
                            }
                            DialogBox.setWith(response.error ? 'ion-alert' : 'las la-check', response.message, 'ok').show();
                        }).catch(submit.defaultRequestFail);
                    }
                });
            }
        })
        .on('click', '.academic .create-period', function(){
            RouteUI.utils.waitLayer('period', function(period){
                period.html(RouteUI.utils.render('#period-form', {
                    faculty: RouteUI.utils.data.getAcademicSections(session.academic)
                }));
                KInput.watch(period.getForm());
                submit.period(period,{
                    exam_session: session.id
                });
                $_(period.getForm().find('.section-list')[0]).on('change', function(el){
                    var val = el.val(), list = [], options = {};
                    for(var i in val){
                        list = RouteUI.utils.data.getAcademicSection(val[i]).grades;
                        for(var j in list){
                            options[list[j].id] = list[j].notation;
                        }
                    }
                    $_(period.getForm().find('.grade-list')[0]).setOptions(options);
                });
            });
        })
        .on('click', '.academic .period-wrapper', function(){
            $(this).toggleClass('open');
        })
    // .on('click', )
} //

RouteUI["/student"] = function(){
    var submit = RouteUI.utils.submit;
    submit.suite.student = function(id){
        RouteUI.utils.updateView('.student-view', RouteUI.utils.data.pick(['student','currentYear']));
        ruiv.filter();
    }
    submit.student = function(student,options){
        options = set(options,{});
        var ts = new ThunderSpeed();
        ts.filterType(['jpeg','jpg','png'])
            .watch('#picture-file')
            .on('choose',function(e){
                this.files()[0].getDataURL().then(function(result){
                    $('#student-form avatar .background').css('background-image','url('+result+')')
                });
            });
        student.off(['submit','invalidation'])
            .on('submit',function(data){
                data = RouteUI.utils.groupByPrefix(data,['st_address','st_birthplace'], ', ');
                data = extend(data,options);
                console.log('[Data]',data);
                Loader.popup.show(true).text(RouteUI.str("uploading.text"));
                ts.params(RouteUI.utils.completeRequestData(extend(data,{
                    url: './submit',
                    fileIndexName: 'st_avatar',
                    uploadedFileIndexName: 'st_upl_avatar'
                })))
                    .on('progress',function(e){
                        console.log('[E]',e)
                        Loader.popup.progressTo(e.percent);
                        // if(e.)
                    })
                    .start()
                    .then(function(response){
                        Loader.popup.hide();
                        Modules.updateData(response.data);
                        submit.suite.student();
                        DialogBox.setWith('las la-check', response.message, 'ok').show()
                            .onClose(function(){
                                student.hide();
                            });
                    })
                    .catch(submit.defaultRequestFail);
            })
            .on('invalidation', submit.defaultInvalidation);
    };
    ruiv.filter = function(){
        var criterias = [
                $_('.student .header .academic-grade').val(),
                $('appbar .search-bar').val().replace(/ */g, '').toLowerCase(),
                $('.student .header [alternate="sort"].active').length ? $('.student .header [alternate="sort"].active').attr('direction') : 'default'
            ],
            visible = [];
        $('.student-item').each(function(){
            var targets = [
                    $(this).attr('data-grade'),
                    $(this).attr('data-filter').toLowerCase()
                ],
                show = criterias[0].indexOf(targets[0]) >= 0 && targets[1].indexOf(criterias[1]) >= 0;
            $(this).removeClass(show ? 'not-super' : 'super').addClass(!show ? 'not-super' : 'super');
            if(show){
                visible.push($(this).attr('data-filter'));
            }
        });
        if(criterias[2] != 'default'){
            visible.sort();
            if(criterias[2] == 'up'){
                visible.reverse();
            }
            var primeElement = $('.student-item').eq(0),
                begin = false,
                group;
            for(var i in visible){
                group = primeElement.parent().find('[data-filter="'+visible[i]+'"]');
                primeElement[begin ? 'before': 'after'](group);
                primeElement = group.eq(group.length - 1);
                begin = true;
            }
        }
    }

    $_('.criterias .academic-year')
        .on('ready', function(){
            $_('.criterias .academic-section')
                .checkAll()
                .on('ready', function(){
                    $_('.criterias .academic-grade').checkAll()
                        .on(['change','ready'], function(){
                            ruiv.filter();
                        })
                });
        });
    $('body')
        .on('click', '.add-student', function(){
            RouteUI.utils.waitLayer('student', function(student){
                var sections = RouteUI.utils.data.getAcademicSections(Modules.data.currentYear.id);
                submit.student(student);
                KInput.watch(student.getForm());
                $_(student.getForm().find('.academic-section')[0]).setOptions(RouteUI.utils.view.createOptions(sections, ['id','nom']));
            });
        })
        .on('click', '.student-item .edit', function(){
            var student = ruidata.getStudent($(this).attr('data-id'));
            rutils.waitLayer('editstudent', function(layer){
                var address = {
                        resident: student.adresse.split(/ *, */),
                        birth: student.lieu_naissance.split(/ *, */)
                    },
                    sections = RouteUI.utils.data.getAcademicSections(Modules.data.currentYear.id),
                    form = layer.getForm();
                Form.reset(form,{
                    st_nom: student.nom,
                    st_prenom: student.prenom,
                    st_sexe: student.sexe,
                    st_birthplace_town: set(address.birth[0],''),
                    st_birthplace_country: set(address.birth[1],''),
                    st_birthdate: student.date_naissance,
                    st_address_street: set(address.resident[0], ''),
                    st_address_town: set(address.resident[1], ''),
                    st_address_country: set(address.resident[2], ''),
                    st_person_ref: student.personne_ref,
                    st_phone_ref: student.telephone_ref,
                    st_memo: student.memo
                });
                submit.student(layer,{
                    st_id: student.id
                })
                if(student.photo){
                    form.find('avatar .background').css('background-image', 'url(./assets/avatars/'+student.photo+')');
                }
                $_(form.find('.academic-section')[0])
                    .setOptions(RouteUI.utils.view.createOptions(sections, ['id','nom']))
                    .val(ruidata.getAcademicSectionOf(student.niveau).id)
                    .on('ready', function(){
                        $_(form.find('.academic-grade')[0]).val(student.niveau);
                    });
            });
        })
        .on('click', '.student-item .delete', function(){

            DialogBox.setWith('las la-trash', RouteUI.str("student.deletion.alert.school"), 'yesno')
                .show()
                .onClose(function(e,proceed){
                    if(proceed){
                        Loader.popup.show();
                        Fetch.post('./submit',RouteUI.utils.completeRequestData({
                            st_del_id: $(this).attr('data-id')
                        }))
                            .then(function(response){
                                Loader.popup.hide();
                                if(!response.error){
                                    submit.suite.student();
                                }
                                DialogBox.setWith(response.error ? 'las la-check' : 'ion-alert', response.message, 'ok').show();
                            })
                            .catch(submit.defaultRequestFail);
                    }
                });
        });
} //

RouteUI["/teacher"] = function(){
    // console.log('[DAta]',Modules.data);
    var submit = RouteUI.utils.submit;
    submit.suite.teacher = function(){
        RouteUI.utils.updateView('.teacher-view', RouteUI.utils.data.pick(['teacher','currentYear']));
        ruiv.filter();
    }
    submit.teacher = function(teacher, options){
        options = set(options,{});
        var ts = new ThunderSpeed();
        ts.filterType(['jpeg','jpg','png'])
            .watch('#picture-file')
            .on('choose',function(e){
                this.files()[0].getDataURL().then(function(result){
                    $('#teacherForm avatar .background').css('background-image','url('+result+')')
                });
            });
        teacher
            .off(['submit','invalidation'])
            .on('submit',function(data){
                data = RouteUI.utils.groupByPrefix(data,['th_address','th_birthplace'], ', ');
                data = extend(data,options);
                Loader.popup.show(true).text(RouteUI.str("uploading.text"));
                ts.params(RouteUI.utils.completeRequestData(extend(data,{
                    url: './submit',
                    fileIndexName: 'th_avatar',
                    uploadedFileIndexName: 'th_upl_avatar'
                })))
                    .on('progress',function(e){
                        Loader.popup.progressTo(e.percent);
                    })
                    .start()
                    .then(function(response){
                        Loader.popup.hide();
                        Modules.updateData(response.data);
                        submit.suite.teacher();
                        DialogBox.setWith('las la-check', response.message, 'ok').show()
                            .onClose(function(){
                                teacher.hide();
                            });
                    })
                    .catch(submit.defaultRequestFail);
            })
            .on('invalidation',submit.defaultInvalidation)
    }
    ruiv.filter = function(){
        var criterias = [
                $_('.teacher .header .academic-year').val(),
                $('appbar .search-bar').val().replace(/ */g, '').toLowerCase(),
                $('.teacher .header [alternate="sort"].active').length ? $('.teacher .header [alternate="sort"].active').attr('direction') : 'default'
            ],
            cls = '.teacher-item',
            visible = [];
        $(cls).each(function(){
            var targets = [
                    $(this).attr('data-year'),
                    $(this).attr('data-filter').toLowerCase()
                ],
                show = criterias[0].indexOf(targets[0]) >= 0 && targets[1].indexOf(criterias[1]) >= 0;
            $(this).removeClass(show ? 'not-super' : 'super').addClass(!show ? 'not-super' : 'super');
            if(show){
                visible.push($(this).attr('data-filter'));
            }
        });
        if(criterias[2] != 'default'){
            visible.sort();
            if(criterias[2] == 'up'){
                visible.reverse();
            }
            var primeElement = $(cls).eq(0),
                begin = false,
                group;
            for(var i in visible){
                group = primeElement.parent().find('[data-filter="'+visible[i]+'"]');
                primeElement[begin ? 'before': 'after'](group);
                primeElement = group.eq(group.length - 1);
            }
        }
    }
    $_('.teacher .header .academic-year').on('ready', function(){
        this.checkAll();
    })
        .on('change', function(){
            ruiv.filter();
        })
    $('body')
        .on('click', '.add-teacher', function(){
            rutils.waitLayer('teacher', function(teacher){
                submit.teacher(teacher);
            });
        })
        .on('click', '.teacher-item .edit', function(){
            var teacher = ruidata.getTeacher($(this).attr('data-id'));
            rutils.waitLayer('teacheredit', function(layer){
                var address = {
                        resident: teacher.adresse.split(/ *, */),
                        birth: teacher.lieu_naissance.split(/ *, */)
                    },
                    form = layer.getForm();
                Form.reset(form,{
                    th_nom: teacher.nom,
                    th_prenom: teacher.prenom,
                    th_sexe: teacher.sexe,
                    th_birthplace_town: set(address.birth[0],''),
                    th_birthplace_country: set(address.birth[1],''),
                    th_birthdate: teacher.date_naissance,
                    th_address_street: set(address.resident[0], ''),
                    th_address_town: set(address.resident[1], ''),
                    th_address_country: set(address.resident[2], ''),
                    th_status: teacher.status_matrimonial,
                    th_phone: teacher.telephone,
                    th_skill: teacher.niveau_etude,
                    th_email: teacher.email,
                    th_nif: teacher.nif,
                    th_ninu: teacher.ninu,
                    th_memo: teacher.memo
                });
                submit.teacher(layer,{
                    th_id: teacher.id
                });
                if(teacher.photo){
                    form.find('avatar .background').css('background-image', 'url(./assets/avatars/'+teacher.photo+')');
                }
            });
        })
        .on('click', '.teacher-item .delete', function(){
            var id = $(this).attr('data-id');
            DialogBox.setWith('las la-trash', RouteUI.str("teacher.deletion.alert"), "yesno").show()
                .onClose(function(e,proceed){
                    if(proceed){
                        Loader.popup.show();
                        Fetch.post('./submit',RouteUI.utils.completeRequestData({
                            th_del_id: id
                        }))
                            .then(function(response){
                                Loader.popup.hide();
                                if(!response.error){
                                    submit.suite.teacher();
                                }
                                DialogBox.setWith(response.error ? 'ion-alert' : 'las la-check', response.message, 'ok').show();
                            })
                            .catch(submit.defaultRequestFail);
                    }
                });
        })
} //

RouteUI["/course"] = function() {
    var cm = new Card('.course .card-manager'),
        submit = rutils.submit,
        nav = {
            prev: 0,
            id: 0
        },
        list = [], reaction = {
            schedule: false,
            books: false
        };
    submit.suite.course = function(){}
    submit.suite.schedule = function(){
        RouteUI.utils.updateView('.scheduling-list', {
            horaire: list
        }, '#coursedetails .scheduling-list');
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
                        submit.suite.schedule();
                        DialogBox.setWith('las la-check', response.message,'ok').show()
                            .onClose(function(){
                                course.hide();
                            });
                    })
                    .catch(submit.defaultRequestFail);
            })
            .on('invalidation', submit.defaultInvalidation);
    }
    submit.schedule = function(schedule){
        schedule
            .off(['submit','invalidation'])
            .on('submit',function(data){
                var begin = new AkaDatetime(data.cr_beg_hour),
                    end = new AkaDatetime(data.cr_end_hour);
                if(begin.isMoreThan(end)){
                    DialogBox.setWith('ion-alert', RouteUI.str("course.schedule.interval.error"), 'ok').show();
                    return;
                }
                console.log('[Data]',data);
                list.push({
                    day: data.cr_day * 1,
                    begin: data.cr_beg_hour,
                    end: data.cr_end_hour
                });
                schedule.hide();
                submit.suite.schedule();
                // Loader.popup.show();
                // Fetch.post('./submit', rutils.completeRequestData(extend(data,options)))
                // .then(function(response){
                //     console.log('[Response]',response);
                //     Loader.popup.hide();
                //     submit.suite.course();
                //     DialogBox.setWith('las la-check', response.message,'ok').show()
                //     .onClose(function(){
                //         schedule.hide();
                //     });
                // })
                // .catch(submit.defaultRequestFail);
            })
            .on('invalidation',submit.defaultInvalidation);
    }

    console.log('[Data]',Modules.data);
    $('body')
        .on('click', '.course .add-course', function(){
            console.log('clicked')
            rutils.waitLayer('course', function(course){
                course.html(rutils.render('#course-form', ruidata.pick(['workDays','teacher'])));
                submit.course(course);
                var form = course.getForm(),
                    options = {
                        section : ruiv.createOptions(ruidata.getAcademicSections(Modules.data.currentYear.id), ['id', 'nom']),
                        session : ruiv.createOptions(Modules.data.currentYear.sessions, ['id', 'number'])
                    };
                $_(form.find('.academic-section')).setOptions(options.section);
                $_(form.find('.sessions')).setOptions(options.session);
            });
        })
        .on('click', '.course .course-item .action button', function(){
            if($(this).hasClass('configure')){
                var course = ruidata.getCourse($(this).attr('data-id'));
                RouteUI.utils.updateView('.course .presentations', {
                    course: course
                }, '#coursedetails');
                nav.prev = cm.getIndex();
                nav.id = course.id;
                list = course.horaire;
                cm.switchTo(4, true);
                var scheduleM = new Card('.course .presentations .schedulers card-manager');
                scheduleM.switchTo(0);
            }
            else{
                console.log('[Clone]')
            }
        })
        .on('click','.course .back-to-prev',function(){
            cm.switchTo(nav.prev);
        })
        .on('click', '.course .schedule-new', function(){
            rutils.waitLayer('newschedule', function(schedule){
                submit.schedule(schedule);
            });
        })
} //

RouteUI["/admin"] = function(){
    var cm = new Card('.administration .card-manager'),
        submit = RouteUI.utils.submit;
    submit.suite.level = function(id){
        id = set(id,0);
        RouteUI.utils
            .updateView('.fac .list', RouteUI.utils.data.pick(['currentYear', 'faculty']))
        if(id) {
            RouteUI.utils
                .updateView('.administration .presentations', {
                    faculty: RouteUI.utils.data.getAcademicSection(id),
                    prev: 1
                }, '#classlist');
        }
    };
    submit.suite.classe = function(id){
        RouteUI.utils.updateView('.administration .classlist-view .list-view', {
            faculty: RouteUI.utils.data.getAcademicSection(id)
        }, '#classlist .list-view');
    };
    submit.suite.room = function(id){
        if(id){
            RouteUI.utils.updateView(".showroom", {
                room: RouteUI.utils.data.getRoom(id),
                prev: 2
            }, '#showroom .showroom');
        }
        else{
            $('.back-to-prev').trigger('click');
        }
        RouteUI.utils.updateView(".room .list", RouteUI.utils.data.pick(['room']));
        this.classroom();
    };
    submit.suite.classroom = function(id){
        if(id){
            RouteUI.utils.updateView('.presentations', {
                promotion: RouteUI.utils.data.getPromotion(id),
                prev: 3
            }, '#promotion-view');
        }
        else{
            $('.back-to-prev').trigger('click');
        }
        RouteUI.utils.updateView(".promo .list", RouteUI.utils.data.pick(['promotion']));
    };
    submit.level = function(level,options){
        var options = set(options,{});
        level.off(['submit', 'invalidation']);
        level.on('submit', function(data){
            Loader.popup.show();
            Fetch.post('./submit', RouteUI.utils.completeRequestData(extend(data, options)))
                .then(function(response){
                    Loader.popup.hide();
                    if(!response.error){
                        submit.suite.level(set(options.lvl_id, 0));
                    }
                    DialogBox.setWith(response.error ? 'ion-alert' : 'ion-android-done', response.message, 'ok')
                        .show().onClose(function(){
                        if(!response.error){
                            level.hide();
                        }
                    });
                })
                .catch(submit.defaultRequestFail)
        }).on('invalidation', submit.defaultInvalidation)
    };
    submit.classe = function(classe,options){
        options = set(options,{});
        classe.off(['submit','invalidation'])
            .on('submit', function(data){
                data = extend(data,options);
                Loader.popup.show();
                Fetch.post('./submit', RouteUI.utils.completeRequestData(data))
                    .then(function(response){
                        Loader.popup.hide();
                        if(!response.error){
                            submit.suite.classe(data.cls_section);
                        }
                        DialogBox.setWith(response.error ? 'ion-alert' : 'las la-check', response.message, 'ok').show()
                            .onClose(function(){
                                if(!response.error){
                                    classe.hide();
                                }
                            });
                    })
                    .catch(submit.defaultRequestFail);
            })
            .on('invalidation', submit.defaultInvalidation)
    };
    submit.room = function(room,options){
        options = set(options,{});
        room.off(['submit','invalidation'])
            .on('submit', function(data){
                Loader.popup.show();
                Fetch.post("./submit",RouteUI.utils.completeRequestData(extend(data,options)))
                    .then(function(response){
                        Loader.popup.hide();
                        console.log('[Response]',response);
                        if(!response.error){
                            submit.suite.room(options.rm_id);
                        }
                        DialogBox.setWith(response.error ?"ion-alert":"las la-check", response.message, "ok")
                            .show()
                            .onClose(function(){
                                if(!response.error){
                                    room.hide();
                                }
                            });
                    })
                    .catch(function(message){
                        Loader.popup.hide();
                        DialogBox.setWith("ion-alert", message, "ok").show();
                    })
            })
            .on('invalidation', submit.defaultInvalidation)
    };
    submit.classroom = function(promotion,options){
        options = set(options,{});
        promotion.off(['submit', 'invalidation'])
            .on('submit',function(data){
                Loader.popup.show();
                Fetch.post('./submit', RouteUI.utils.completeRequestData(extend(data,options)))
                    .then(function(response){
                        Loader.popup.hide();
                        if(!response.error){
                            submit.suite.classroom(options.clroom_id);
                        }
                        DialogBox.setWith(response.error ? 'ion-alert' : 'las la-check', response.message, 'ok')
                            .show().onClose(function(){
                            if(!response.error){
                                promotion.hide();
                            }
                        });
                    }).catch(submit.defaultRequestFail);
            })
            .on('invalidation',submit.defaultInvalidation);
    };
    $('body')
        /**
         * event management for academic level
         */
        .on('click', '#addLevel', function(){
            RouteUI.utils.waitLayer('academiclevel', function(level){
                level.html(RouteUI.utils.render('#level', RouteUI.utils.data.pick('faculty')));
                submit.level(level);
                KInput.watch(level.getForm());
            });
        })
        .on('click', '.level-box .see-more',function(){
            // console.log('[Ok]');
            var id = $(this).attr('data-id');
            RouteUI.utils.updateView('.presentations', {
                faculty: RouteUI.utils.data.getAcademicSection(id),
                prev: cm.getIndex()
            }, '#classlist');
            cm.switchTo(7, true);
        })
        .on('click', '.administration .back-to-prev', function(){
            console.log('[Back to]', $(this).attr('data-index'));
            cm.switchTo($(this).attr('data-index'));
        })
        /**
         * event management for class
         */
        .on('click', '.classlist-view .sector-action', function(){
            var section = RouteUI.utils.data.getAcademicSection($(this).attr('data-id'));
            if($(this).hasClass('layer-form-on')){
                RouteUI.utils.waitLayer('academicleveledit', function(level){
                    level.html(RouteUI.utils.render('#level', RouteUI.utils.data.pick('faculty')));
                    KInput.watch(level.getForm());
                    Form.reset(level.getForm(), {
                        lvl_name: section.nom,
                        lvl_next: 0
                    });
                    submit.level(level,{
                        lvl_id: section.id
                    });
                });
            }else{
                DialogBox.setWith("las la-question", RouteUI.str("admin.academiclevel.deletion.alert"), "yesno")
                    .show().onClose(function(e,proceed){
                    if(proceed){
                        Fetch.post("./submit",RouteUI.utils.completeRequestData({
                            lvl_del_id : section.id
                        })).then(function(response){
                            $('.classlist-view .back-to-prev').trigger('click');
                            DialogBox.setWith(response.error ? "ion-alert" : "las la-check", response.message, "ok")
                                .show()
                                .onClose(function(){
                                    if(!response.error){
                                        submit.suite.level();
                                    }
                                });
                        }).catch(function(message){
                            DialogBox.setWith("ion-alert", message, "ok").show();
                        })
                    }
                });
            }
        })
        .on('click', '#addClass', function(){
            var level = $(this).attr('data-level');
            RouteUI.utils.waitLayer('class', function(classe){
                classe.html(RouteUI.utils.render('#class'));
                submit.classe(classe,{
                    cls_section: level
                });
                KInput.watch(classe.getForm());
            });
        })
        .on('click', '.classlist-view row .act', function(){
            var id = $(this).attr('data-id'),
                section = $(this).attr('data-src'),
                cls = RouteUI.utils.data.getClass(id,section);
            if($(this).hasClass('layer-form-on')){
                RouteUI.utils.waitLayer('classedit', function(classe){
                    classe.html(RouteUI.utils.render('#class'));
                    submit.classe(classe,{
                        cls_id : cls.id,
                        cls_section: cls.filiere
                    });
                    KInput.watch(classe.getForm());
                    Form.reset(classe.getForm(),{
                        cls_name: cls.notation,
                        cls_level: cls.annee
                    });
                });
            }
            else{
                DialogBox.setWith("las la-question", RouteUI.str("admin.class.deletion.alert"), "yesno")
                    .show()
                    .onClose(function(e,proceed){
                        if(proceed){
                            Loader.popup.show();
                            Fetch.post("./submit", RouteUI.utils.completeRequestData({
                                cls_del_id: id
                            }))
                                .then(function(response){
                                    Loader.popup.hide();
                                    if(!response.error) {
                                        submit.suite.classe(section);
                                    }
                                    DialogBox.setWith(response.error ? "ion-alert" : "las la-check", response.message, "ok")
                                        .show();
                                })
                                .catch(function(message){
                                    Loader.popup.hide();
                                    DialogBox.setWith("ion-alert", message, 'ok').show();
                                })
                        }
                    })
            }
        })
        /**
         * event management for room
         */
        .on('click', '#addRoom', function(){
            RouteUI.utils.waitLayer('room',function(room){
                submit.room(room);
            });
        })
        .on('click', '.room-box .see-more', function(){
            var id = $(this).attr('data-id');
            RouteUI.utils.updateView('.presentations', {
                room: RouteUI.utils.data.getRoom(id),
                prev: cm.getIndex()
            }, '#showroom');
            cm.switchTo(7, true);
        })
        .on('click', '.showroom .sector-action', function(){
            var data = RouteUI.utils.data.getRoom($(this).attr('data-id'));
            if($(this).hasClass('layer-form-on')){
                RouteUI.utils.waitLayer('roomedit', function(room){
                    Form.reset(room.getForm(),{
                        rm_name: data.name,
                        rm_code: data.code,
                        rm_capacity: data.capacity,
                        rm_desc: data.description
                    });
                    submit.room(room,{
                        rm_id: data.id
                    })
                });
            }
            else{
                DialogBox.setWith('las la-question', RouteUI.str("admin.room.deletion.alert"), "yesno")
                    .show().onClose(function(e,proceed){
                    if(proceed){
                        Loader.popup.show();
                        Fetch.post('./submit',RouteUI.utils.completeRequestData({
                            rm_del_id: data.id
                        }))
                            .then(function(response){
                                Loader.popup.hide();
                                if(!response.error){
                                    submit.suite.room();
                                }
                                DialogBox.setWith(response.error? 'ion-alert' : 'las la-check', response.message, 'ok')
                                    .show();
                            })
                            .catch(function(message){
                                Loader.popup.hide();
                                DialogBox.setWith('ion-alert', message, 'ok').show();
                            })
                    }
                })
            }
        })
        /**
         * event management for promotion
         */
        .on('click', '#addPromo', function(){
            RouteUI.utils.waitLayer('promotion', function(promotion){
                promotion.html(RouteUI.utils.render("#promo-form", RouteUI.utils.data.pick(['room', 'faculty'])));
                KInput.watch(promotion.getForm());
                submit.classroom(promotion);
            })
        })
        .on('click', '.promo-box .see-more', function(){
            var id = $(this).attr('data-id');
            RouteUI.utils.updateView('.presentations', {
                promotion: RouteUI.utils.data.getPromotion(id),
                prev: cm.getIndex()
            }, '#promotion-view');
            cm.switchTo(7, true);
        })
        .on('click', '.promo-view .sector-action', function(){
            var promo = RouteUI.utils.data.getPromotion($(this).attr('data-id'));
            if($(this).hasClass('layer-form-on')){
                RouteUI.utils.waitLayer('promotionedit', function(promotion){
                    promotion.html(RouteUI.utils.render("#promo-form", RouteUI.utils.data.pick(['room', 'faculty'])));
                    KInput.watch(promotion.getForm());
                    Form.reset(promotion.getForm(),{
                        clroom_room: promo.room.id
                    });
                    console.log('[Ok]',RouteUI.utils.data.getAcademicSectionOf(promo.grade.id));
                    $_(promotion.getForm().find('.academic-section')[0]).val(RouteUI.utils.data.getAcademicSectionOf(promo.grade.id).id);
                    $_(promotion.getForm().find('.academic-grade')[0]).val(promo.grade.id);
                    submit.classroom(promotion,{
                        clroom_id: promo.id
                    });
                });
            }
            else{
                DialogBox.setWith('las la-question', RouteUI.str("admin.promotion.deletion.alert"), "yesno")
                    .show().onClose(function(e,proceed){
                    if(proceed){
                        Loader.popup.show();
                        Fetch.post('./submit',RouteUI.utils.completeRequestData({
                            clroom_del_id: promo.id
                        }))
                            .then(function(response){
                                Loader.popup.hide();
                                if(!response.error){
                                    submit.suite.classroom();
                                }
                                DialogBox.setWith(response.error? 'ion-alert' : 'las la-check', response.message, 'ok')
                                    .show();
                            })
                            .catch(submit.defaultRequestFail)
                    }
                })
            }
        })
} //