
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
}

RouteUI.utils.data.getStudentsFromList = function(list){
    var r = [];
    for(var i in list){
        r.push(this.getStudent(list[i]));
    }
    return r;
}

RouteUI.utils.data.updater.student = RouteUI.utils.data.updater.defaultCaller('getStudent');

RouteUI.utils.student = {
    cm: {
        view: null,
        head: null,
        folder: null
    }
};

RouteUI.url
.enter('/student',function(end,url){
    this.load(url.path).then(function(){
        RouteUI.url.setState(url.path);
        if(!url.args.id) {
            $('.student .header h1 text').html(RouteUI.str("student.list.title"));
            $('.student .header h1 icon').attr('class', 'las la-user-graduate');
            RouteUI.utils.student.cm.view.switchTo(0);
            RouteUI.utils.student.cm.head.switchTo(0);
            Modules.setSearchVisible(true);
        }
        end();
    });
})
.enter('/student/id:[0-9]+', function(end,url){
    Modules.setSearchVisible(false);
    var student = ruidata.getStudent(url.args.id);
    $('.student .header h1 text').html(RouteUI.str("student.folder.title"));
    $('.student .header h1 icon').attr('class', 'las la-folder-open');
    $('.student .criterias .student-name').html(student.prenom+" "+student.nom);
    // console.log('[Student]',student);
    RouteUI.utils.updateView('.folder',{student: student},'.folder #student-folder');
    RouteUI.utils.student.cm.folder = new Card('.student-data card-manager');
    RouteUI.utils.student.cm.head.switchTo(1);
    RouteUI.utils.student.cm.view.switchTo(1);
    RouteUI.utils.student.cm.folder.switchTo(0);
    end();
},true)

RouteUI["/student"] = function(){
    console.log('[Data]',Modules.data);
    var submit = RouteUI.utils.submit,
        _student = RouteUI.utils.student;
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
    _student.cm.view = new Card(".students-view");
    _student.cm.head = new Card(".student-view-head");

    ruiv.filter = ruiv.defaultFilter('student', 'grade');

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
                var sections = RouteUI.utils.data.getAcademicSections(Modules.data.currentYear);
                submit.student(student);
                KInput.watch(student.getForm());
                $_(student.getForm().find('.academic-section')[0]).setOptions(RouteUI.utils.view.createOptions(sections, ['id','nom']));
            });
        })
        .on('click', '.student .folder .main-panel .edit', function(){
            var student = ruidata.getStudent($(this).attr('data-id'));
            rutils.waitLayer('editstudent', function(layer){
                var address = {
                        resident: student.adresse.split(/ *, */),
                        birth: student.lieu_naissance.split(/ *, */)
                    },
                    sections = RouteUI.utils.data.getAcademicSections(Modules.data.currentYear),
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
        .on('click', '.student .folder .main-panel .delete', function(){
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
}