
RouteUI.utils.data.getAcademicYear = function(id){
    var r = {};
    for(var i in Modules.data.academic){
        if(Modules.data.academic[i].id == id){
            r = Modules.data.academic[i];
            break;
        }
    }
    return r;
}

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
}

RouteUI.utils.data.getExamPeriodsGroup = function(sessionId){
    var list = [];
    for(var i in Modules.data.exam_period){
        if(Modules.data.exam_period[i].session == sessionId){
            list.push(Modules.data.exam_period[i]);
            break;
        }
    }
    return list;
}

RouteUI.utils.data.updater.setWithdefaultCaller('academic', 'getAcademicYear');

RouteUI.utils.data.updater.setWithdefaultCaller('sessions', 'getSession');

RouteUI.utils.academic = {
    toggleAcademicNav : function(input){
        $('.academic-chooser.prev')[!input.hasPrev() ? 'addClass' : 'removeClass']('disabled');
        $('.academic-chooser.next')[!input.hasNext() ? 'addClass' : 'removeClass']('disabled');
    },
    setView: function(id){
        var academic = RouteUI.utils.data.getAcademicYear(id);
        $('.academic .session .arrow-data .year').html(academic.academie);
        RouteUI.utils.updateView('card.session', {
            k: 1,
            currentYear: academic
        });
        RouteUI.utils.updateAcademicStats(id);
    }
};

RouteUI.url
.enter('/academic-year',function(end,url){
    this.load(url.path).then(function(){
        if(!isset(url.args.id)){
            RouteUI.utils.academic.cm.switchTo(0);
        }
        RouteUI.url.setState(url.path);
        end();
    });
})
.enter('/academic-year/ay:[0-9]+',function(end,url){
    var _academic = RouteUI.utils.academic;
    _academic.cm.switchTo(_academic.graphicModeBtn.hasClass('active') ? 1 : 0);
    _academic.setView(url.args.ay);
    _academic.input.on('ready', function(){
        if(this.val() != url.args.ay){
            this.val(url.args.ay);
        }
        RouteUI.utils.academic.toggleAcademicNav(this);
    });
    end();
},true)
.enter('/academic-year/id:[0-9]+&ay:[0-9]+',function(end,url){
    var _academic = RouteUI.utils.academic,
        target = url.args.ay;
    _academic.session = RouteUI.utils.data.getSession(url.args.id, target);
    _academic.session.academic = target;
    _academic.session.periods = RouteUI.utils.data.getExamPeriodsGroup(_academic.session.id);
    $('.academic .session .arrow-data .session').html(_academic.session.number);
    RouteUI.utils.updateView('.session-view', extend(_academic.session,Modules.defaultOptions()), '#session-view');
    var calendarView = new Card('.calendar-view');
    _academic.calendar.setDateBounds(_academic.session.begin, _academic.session.end).setCurrentDate(new Date());
    _academic.calendar.setLimitDom($('.session-view .calendar-zone')[0]).create().trigger('datechange');
    _academic.cm.switchTo(2);
    calendarView.switchTo(0);
},true);

RouteUI["/academic-year"] = function(){
    console.log('[Data]',Modules.data);
    var _academic = RouteUI.utils.academic;
    _academic.cm = new Card('.academic');
    _academic.cm.onSwitch(function(index){
        $('.academic .var')[index != 2 ? "show" : "hide"]();
        $('.academic .var.session')[index == 2 ? "show" : "hide"]();
    });
    var submit = RouteUI.utils.submit;
    _academic.input = $_('#academic-slide');
    _academic.calendar = new Calendar();
    _academic.session = null;
    _academic.graphicModeBtn = $('.academic .akaction.chart-academic');
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

    _academic.calendar
        .setMonthNames(RouteUI.str('calendar.months'))
        .setWeekNames(RouteUI.str("calendar.weeks"))
        .setLimitDom('#calendar')
        .allow('selection', true)
        .setMaxHeight(220)
        .on('datechange', function(e){
            $('.calendar-view .currentdate').html(RouteUI.utils.view.localDate(new AkaDatetime(e.date).getDate()));
        });
    _academic.input.on('change', function(){
        RouteUI.url.go('/academic-year',{
            ay: this.val()
        });
    });
    $('body')
        .on('click', '.aka-form', function(){
            RouteUI.utils.waitLayer('academic',function(academic){
                academic.setDimensions(LayerForm.DIMENSION.SMALL);
                submit.academic(academic,{});
            });
        })
        .on('click', '.academic-chooser', function(){
            _academic.input[$(this).hasClass('next') ? 'next' : 'prev']();
        })
        .on('change', '#Aka-yearForm .input', function(){
            var date = new AkaDatetime($(this).val());
            $('#Aka-yearForm .anneeAcademique '+($(this).hasClass('begin') ? '.begin' : '.end')).text(date.getYear());
        })
        .on('click', '.session-box.adder', function(){
            RouteUI.utils.waitLayer('session', function(session){
                submit.session(session);
            });
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
                _academic.cm.switchTo($(this).hasClass('active') ? 1 : 0);
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
                        sess_number: _academic.session.number,
                        sess_begin: _academic.session.begin,
                        sess_end: _academic.session.end
                    });
                    submit.session(sessionLayer,{
                        sess_id: _academic.session.id
                    });
                });
            }
            else if($(this).hasClass('delete-session')){
                DialogBox.setWith('las la-question', RouteUI.str("session.deletion.message.alert"), "yesno")
                    .show().onClose(function(e,proceed){
                    if(proceed){
                        Fetch.post("./submit", RouteUI.utils.completeRequestData({
                            sess_del_id: _academic.session.id
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
                    faculty: RouteUI.utils.data.getAcademicSections(_academic.session.academic)
                }));
                KInput.watch(period.getForm());
                submit.period(period,{
                    exam_session: _academic.session.id
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
        });
}