
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
}

RouteUI.utils.data.getAcademicSection = function(id){
    var r = null;
    for(var i in Modules.data.faculty){
        if(Modules.data.faculty[i].id == id){
            r = Modules.data.faculty[i];
            break;
        }
    }
    return r;
}

RouteUI.utils.view.getSection = RouteUI.utils.data.getAcademicSection;

RouteUI.utils.data.getAcademicSections = function(academicId){
    var r = [];
    for(var i in Modules.data.faculty){
        if(Modules.data.faculty[i].academic == academicId){
            r.push(Modules.data.faculty[i]);
        }
    }
    return r;
}

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
}

RouteUI.utils.view.sortClassroomByGrade = function(list){
    var r = {},
        grade;
    for(var i in list){
        grade = ruidata.getClass(list[i].grade);
        if(!(grade.id in r)){
            r[grade.id] = [];
        }
        r[grade.id].push(list[i]);
    }
    return r;
}

RouteUI.utils.data.getPromotion = function(id){
    var r = null;
    for(var i in Modules.data.promotion){
        if(Modules.data.promotion[i].id == id){
            r = Modules.data.promotion[i];
            break;
        }
    }
    return r;
}

RouteUI.utils.data.promotionContains = function(id,studentId){
    var promo = this.getPromotion(id);
    return promo ? promo.indexOf(studentId) >= 0 : false;
}

RouteUI.utils.data.getPromotionlessStudents = function(classId){
    var r = [],
        promotions = this.getPromotions(classId),
        list = Modules.data.student;
    for(var i in list){
        if(list[i].niveau == classId) {
            for (var j in promotions) {
                if (promotions[j].promotion.indexOf(list[i].id) < 0) {
                    r.push(list[i]);
                }
            }
        }
    }
    return r;
}

RouteUI.utils.data.getPromotions = function(classId){
    var list = [];
    for(var i in Modules.data.promotion){
        if(Modules.data.promotion[i].grade == classId){
            list.push(extend({
                name: ruidata.getClass(Modules.data.promotion[i].grade).notation+" "+ruidata.getRoom(Modules.data.promotion[i].room).name
            },Modules.data.promotion[i]));
        }
    }
    return list;
}

RouteUI.utils.data.getPromotionsByYear = function(yearId){
    var list = [];
    for(var i in Modules.data.promotion){
        if(Modules.data.promotion[i].year == yearId){
            list.push(extend({
                name: ruidata.getClass(Modules.data.promotion[i].grade).notation+" "+ruidata.getRoom(Modules.data.promotion[i].room).name
            },Modules.data.promotion[i]));
        }
    }
    return list;
}

RouteUI.utils.data.getRoom = function(id){
    var r = null;
    for(var i in Modules.data.room){
        if(Modules.data.room[i].id == id){
            r = Modules.data.room[i];
            break;
        }
    }
    return r;
}

RouteUI.utils.data.updater.setWithdefaultCaller('room', 'getRoom');
RouteUI.utils.data.updater.setWithdefaultCaller('promotion','getPromotion');
RouteUI.utils.data.updater.setWithdefaultCaller('faculty','getAcademicSection');
RouteUI.utils.data.updater.workDays = function(old,_new){
    Modules.data.workDays = _new;
}
RouteUI.utils.data.updater.weekDays = function(old,_new){
    Modules.data.weekDays = _new;
}

RouteUI.utils.admin = {
    showPromo: function(year){
        RouteUI.utils.updateView('.promo .list', {
            promotion: ruidata.getPromotionsByYear(year),
            currentYear: year
        });
    }
};

RouteUI.url
.enter('/admin',function(end,url){
    this.load(url.path).then(function(){
        RouteUI.url.setState(url.path);
        Modules.setSearchVisible(false);
        if(!isset(url.args.crd)) {
            RouteUI.utils.admin.cm.switchTo(0);
        }
        end();
    });
})
.enter('/admin/crd:[0-9]+', function(end,url){
    if(url.args.crd == 3){
        Modules.setSearchVisible(true);
    }
    RouteUI.utils.admin.cm.switchTo(url.args.crd);
},true)
.enter('/admin/cls:[0-9]+',function(end,url){
    RouteUI.utils.admin.cm.switchTo(1);
    RouteUI.utils.updateView('.presentations', {
        faculty: RouteUI.utils.data.getAcademicSection(url.args.cls),
        prev: RouteUI.utils.admin.cm.getIndex()
    }, '#classlist');
    RouteUI.utils.admin.cm.switchTo(7, true);
    end();
},true)
.enter('/admin/rm:[0-9]+', function(end,url){
    RouteUI.utils.admin.cm.switchTo(2);
    RouteUI.utils.updateView('.presentations', {
        room: RouteUI.utils.data.getRoom(url.args.rm)
    }, '#showroom');
    RouteUI.utils.admin.cm.switchTo(7, true);
    end();
},true)
.enter('/admin/promo:[0-9]+',function(end,url){
    RouteUI.utils.admin.cm.switchTo(3);
    RouteUI.utils.updateView('.presentations', {
        promotion: RouteUI.utils.data.getPromotion(url.args.promo),

    }, '#promotion-view');
    Modules.setSearchVisible(true);
    RouteUI.utils.admin.cm.switchTo(7, true);
    end();
},true);

RouteUI["/admin"] = function(){
    console.log('[Data]',Modules.data);
    var _admin = RouteUI.utils.admin,
        submit = RouteUI.utils.submit;
    _admin.cm = new Card('.administration .card-manager');
    _admin.transfer = {
        layer: null,
        list: []
    };
    _admin.checkList = [];
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
    submit.suite.assign = function(id){
        RouteUI.utils.updateView(".presentations #promotion-view .list-view", {
            promotion: ruidata.getPromotion(id)
        });
    }

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
    submit.assign = function(promotion, options){
        options = set(options,{});
        promotion.off(['submit', 'invalidation'])
            .on('submit',function(data){
                data.prm_std_list = [];
                if(options.prm_trf){
                    data.prm_std_list = _admin.transfer.list;
                }
                else {
                    promotion.getForm().find('.item [type="checkbox"]').each(function () {
                        if (this.checked) {
                            data.prm_std_list.push(this.value);
                        }
                    });
                }
                if(!data.prm_std_list.length){
                    DialogBox.setWith('ion-alert', RouteUI.str("admin.promotion.assign.empty.alert"), "ok").show();
                    return;
                }
                else {
                    DialogBox.setWith('las la-question', RouteUI.str("admin.promotion.assign.alert"), "yesno").show()
                    .onClose(function(e,proceed){
                        if(proceed){
                            console.log('[Data]',data,options);
                            Loader.popup.show();
                            Fetch.post('./submit', RouteUI.utils.completeRequestData(extend(data,options)))
                            .then(function(response){
                                Loader.popup.hide();
                                if(!response.error){
                                    submit.suite.assign(options.prm_id);
                                }
                                DialogBox.setWith(response.error ? 'ion-alert' : 'las la-check', response.message, 'ok')
                                    .show().onClose(function(){
                                    if(!response.error){
                                        promotion.hide();
                                    }
                                });
                            }).catch(submit.defaultRequestFail);
                        }
                    });
                }
            })
            .on('invalidation',submit.defaultInvalidation);
    }

    $_('.promo .academic-year').on('change', function(){
        _admin.showPromo(this.val());
    });

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
        .on('click', '.student-list .checkable', function(){
            $(this).parent().find('input')[0].checked = !$(this).parent().find('input')[0].checked;
            $(this).parent().find('input').trigger('change');
        })
        .on('change', '.student-list .row input', function(){
            var checked = this.checked,
                current = this;
            if($(this).hasClass('all')){
                $('.student-list input').each(function(){
                    if(this != current) {
                        this.checked = checked;
                    }
                });
            }
            else{
                if(!checked){
                    $('.student-list .row.check-all input')[0].checked = false;
                }
            }
        })
        .on('click', '.transfer-grid .set-transfer', function(){
            var target = $(this).attr('target'),
                empty = _admin.transfer.list.length == 0;
            _admin.transfer.layer.getForm()
            .find((target == 'in' ? '.transfer-source' : '.transfer-destination')+' .item input[type="checkbox"]')
            .each(function(){
                if(!this.checked){
                    return;
                }
                if(target == 'out'){
                    _admin.transfer.list = removeElement(_admin.transfer.list, this.value);
                    $(this).parent().remove();
                    return;
                }
                if(_admin.transfer.list.indexOf(this.value) < 0){
                    _admin.transfer.list.push(this.value);
                    if(!empty){
                        _admin.transfer.layer.getForm().find('.transfer-destination .student-list').append($(this).parent().clone());
                    }
                }
            });
            if(empty){
                rutils.updateView('.transfer-grid .transfer-destination',{
                    students: ruidata.getStudentsFromList(_admin.transfer.list),
                    simpleText: true
                }, '.presentations #promo-assign');
            }
        })
        .on('click', '.administration .promo-action', function(){
            var grade = $(this).attr('data-grade'),
                promo = $(this).attr('data-promo');
            _admin.transfer.list = [];
            rutils
            .waitLayer('assign', function(layer){
                layer.html(rutils.render('.presentations #promo-assign',{
                    students: ruidata.getPromotionlessStudents(grade)
                }));
                submit.assign(layer,{
                    prm_id : promo
                });
            })
            .waitLayer('transfer', function(layer){
                layer.html(rutils.render('.presentations #promo-transfer',{
                    current: promo,
                    promo: ruidata.getPromotions(grade)
                }));
                _admin.transfer.layer = layer;
                $_(layer.getForm().find('.academic-grade')).on('change', function(){
                   rutils.updateView('.transfer-grid .transfer-source',{
                       students: ruidata.getStudentsFromList(ruidata.getPromotion(promo).promotion)
                   }, '.presentations #promo-assign');
                });
                submit.assign(layer,{
                    prm_id : promo,
                    prm_trf: true
                });
            });
        })
    /**
     * event management for work management
     */
        .on('click', '.work .days', function(){
            $(this).toggleClass('active');
            $('.work .workday-setting .set-days').removeClass('inactive');
        })
        .on('click', '.work .workday-setting .set-days', function(){
            var action = $(this).attr('target'),
                list = [];
            if($(this).hasClass('inactive')){
                return;
            }
            if(action == 'cancel'){
                RouteUI.utils.updateView('.work .workday-setting .list',ruidata.pick(['weekDays', 'workDays']));
                $('.work .workday-setting .set-days').addClass('inactive');
            }
            else{
                $('.work .days.active').each(function(){
                    list.push($(this).attr('data-val'));
                });
                $('.work .workday-setting .set-days').addClass('inactive');
                Fetch.post('./submit', RouteUI.utils.completeRequestData({
                    wrk_day: list
                })).then(function(response){
                    RouteUI.utils.updateView('.work .workday-setting .list',ruidata.pick(['weekDays', 'workDays']));
                    DialogBox.setWith('las la-check', response.message, 'ok').show();
                }).catch(function(message){
                    submit.defaultRequestFail(message);
                    $('.work .workday-setting .set-days').removeClass('inactive');
                });
            }
        })
        .on('change', '.work .workhour-setting [name]', function(){
            var data = Form.serialize($(this).parent().parent());
            if(Form.isSubmitable(data)){
                $('.work .workhour-setting .set-days').removeClass('inactive');
            }
            else{
                $('.work .workhour-setting .set-days').addClass('inactive');
            }
        })
        .on('click', '.work .workhour-setting .set-days', function(){
            var action = $(this).attr('target'),
                list = [];
            if($(this).hasClass('inactive')){
                return;
            }
            if(action == 'cancel'){
                RouteUI.utils.updateView('.work .workhour-setting .list',ruidata.pick(['workHours']));
                KInput.watch('.work .workhour-setting .list');
                $('.work .workhour-setting .set-days').addClass('inactive');
            }
            else{
                list = Form.serialize($('.workhour-setting .list'));
                $('.work .workhour-setting .set-days').addClass('inactive');
                Fetch.post('./submit', RouteUI.utils.completeRequestData(list)).then(function(response){
                    RouteUI.utils.updateView('.work .workhour-setting .list',ruidata.pick(['workHours']));
                    KInput.watch('.work .workhour-setting .list');
                    DialogBox.setWith('las la-check', response.message, 'ok').show();
                }).catch(function(message){
                    submit.defaultRequestFail(message);
                    $('.work .workhour-setting .set-days').removeClass('inactive');
                });
            }
        })
}