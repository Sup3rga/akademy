
RouteUI.utils.data.updater.setWithdefaultCaller('teacher','getTeacher');

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
}

RouteUI.url.enter('/teacher',function(end,url){
    this.load(url.path).then(function(){
        RouteUI.url.setState(url.path);
        end();
    });
});

RouteUI["/teacher"] = function(){
    console.log('[DAta]',Modules.data);
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

    ruiv.filter = ruiv.defaultFilter('teacher', 'year');

    // function(){
    //     var criterias = [
    //             $_('.teacher .header .academic-year').val(),
    //             $('appbar .search-bar').val().replace(/ */g, '').toLowerCase(),
    //             $('.teacher .header [alternate="sort"].active').length ? $('.teacher .header [alternate="sort"].active').attr('direction') : 'default'
    //         ],
    //         cls = '.teacher-item',
    //         visible = [];
    //     $(cls).each(function(){
    //         var targets = [
    //                 $(this).attr('data-year'),
    //                 $(this).attr('data-filter').toLowerCase()
    //             ],
    //             show = criterias[0].indexOf(targets[0]) >= 0 && targets[1].indexOf(criterias[1]) >= 0;
    //         $(this).removeClass(show ? 'not-super' : 'super').addClass(!show ? 'not-super' : 'super');
    //         if(show){
    //             visible.push($(this).attr('data-filter'));
    //         }
    //     });
    //     if(criterias[2] != 'default'){
    //         visible.sort();
    //         if(criterias[2] == 'up'){
    //             visible.reverse();
    //         }
    //         var primeElement = $(cls).eq(0),
    //             begin = false,
    //             group;
    //         for(var i in visible){
    //             group = primeElement.parent().find('[data-filter="'+visible[i]+'"]');
    //             primeElement[begin ? 'before': 'after'](group);
    //             primeElement = group.eq(group.length - 1);
    //         }
    //     }
    // }
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
}