if(!('RouteUI' in window) || RouteUI === undefined){
    window.RouteUI = {};
}

RouteUI.str = function(index,arr){
    arr = isset(arr) ? arr : false;
    return index in RouteUI.strings ? RouteUI.strings[index] : (arr ? [] : '');
}

RouteUI.layerFormObjects = {};
RouteUI.utils = {};
RouteUI.url = {};
RouteUI.utils.view = {};
RouteUI.utils.charts = {};
RouteUI.utils.data = {};
RouteUI.utils.data.updater = {};

RouteUI.utils.data.updater.defaultCaller = function(_searcher, src){
    return function(_old,_new) {
        var item, index;
        for (var i in _new) {
            if (item = ruidata[_searcher](_new[i].id)) {
                index = _old.indexOf(item);
                _old[index] = extend(item, _new[i], true);
            } else {
                _old.push(_new[i]);
            }
        }
        return _old;
    }
}

RouteUI.utils.data.updater.setWithdefaultCaller = function(_index, _searcher){
    this[_index] = this.defaultCaller(_searcher, _index);
}

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
        template = /^([#.][a-z0-9._-]+ ?)+$/i.test(template) ? this.extractTemplate(template) : template;
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
    return this;
}

RouteUI.utils.completeRequestData = function(options){
    options = set(options,{});
    return extend(options,{
        reqtoken: options.reqtoken ? options.reqtoken : Modules.data.credentials,
        requid: Modules.data.id,
        reqversion: 'version' in Modules.data ? Modules.data.version.data : '0.0.0',
        reqview_version: 'version' in Modules.data ? Modules.data.version.view : '0.0.0'
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

RouteUI.utils.isSameObject = function(base,object){
    var r = true, ttl = 0;
    for(var i in object){
        ttl++;
        if(i in base && typeof base[i] == typeof object[i]){
            if(typeof base[i] == 'object'){
                r = RouteUI.utils.isSameObject(base[i], object[i]);
            }
            else{
                r = base[i] == object[i];
            }
        }
        else{
            r = false;
        }
        if(!r){
            break;
        }
    }
    if(r){
        r = len(base) == ttl;
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

RouteUI.utils.view.localDate = function(date){
    var date = new AkaDatetime(date);
    return date.getDay() + " " + RouteUI.str("calendar.months", true)[date.getMonth() - 1] + " " + date.getYear();
}

RouteUI.utils.view.localHour = function(hour, imperial){
    var imperial = set(imperial, true),
        string = "",
        format = /^([0-9]{2}):([0-9]{2})(?:\:([0-9]{2}))?$/.exec(hour),
        h = RegExp.$1,
        m = RegExp.$2,
        ext = 'AM';
    h = h > 24 ? 24 : h;
    m = m * 1 > 60 ? '00' : m;
    if(imperial){
        h = h * 1;
        ext = h < 12 || h > 23 ? 'AM' : 'PM';
        h = h % 12;
        h = h === 0 ? 12 : h;
        string = h+'h '+m+' '+ext;
    }
    else{
        h = h * 1 % 24;
        string = h+'h '+m;
    }
    return string;
}

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

RouteUI.utils.view.filterFallback = null;

RouteUI.utils.view.defaultFilter = function(classZone, attrCriteria){
    var emptySearch = RouteUI.utils.view.filterFallback;
    if(!emptySearch){
        emptySearch = $('#empty-search');
        RouteUI.utils.view.filterFallback = emptySearch;
    }
    return function(){
        var criterias = [
                $_('.'+classZone+' .header .academic-'+attrCriteria).val(),
                $('appbar .search-bar').val().replace(/ */g, '').toLowerCase(),
                $('.'+classZone+' .header [alternate="sort"].active').length ? $('.'+classZone+' .header [alternate="sort"].active').attr('direction') : 'default'
            ],
            visible = [];
        var parent = $('.'+classZone+'-item').eq(0).parent();
        if(!parent.find('#empty-search').length){
            parent.append(emptySearch);
        }
        emptySearch.addClass('ui-hide');
        $('.'+classZone+'-item').each(function(){
            var targets = [
                    $(this).attr('data-'+attrCriteria),
                    $(this).attr('data-filter').toLowerCase()
                ],
                show = criterias[0].indexOf(targets[0]) >= 0 && targets[1].indexOf(criterias[1]) >= 0;
            $(this).removeClass(show ? 'not-super' : 'super').addClass(!show ? 'not-super' : 'super');
            $(this)[show ? 'removeClass' : 'addClass']('ui-hide');
            if(show){
                visible.push($(this).attr('data-filter'));
            }
        });
        if(!visible.length){
            emptySearch.removeClass('ui-hide');
            return;
        }
        if(criterias[2] != 'default'){
            visible.sort();
            if(criterias[2] == 'up'){
                visible.reverse();
            }
            var primeElement = $('.'+classZone+'-item').eq(0),
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
};

RouteUI.url.callbacks = {
    enter: [],
    quit: [],
    state: null
};

RouteUI.url.load = function(url){
    return new Promise(function(resolve){
        History.reach(url, function(){
            resolve();
        })
    });
}

RouteUI.url.go = function(url,args){
    var string = '',
        args = typeof args != 'object' ? {} : args;
    for(var i in args){
        string += (string.length ? '&' : '')+i+':'+args[i]
    }
    url += string.length && !/\/$/.test(url) ? '/' :  '';
    window.location = "#"+url+string;
}

RouteUI.url.back = function(){
    history.back();
}

RouteUI.url.read = function(){
    var url = History.current;
    for(var i in this.callbacks.enter){
        if(new RegExp('^'+this.callbacks.enter[i].url.replace(/\//g, '\\/')+'$').test(url)){
            // console.log('[Found]', this.callbacks.enter[i].url);
            RouteUI.url.refresh(this.callbacks.enter[i]);
        }
    }
    return this;
}

RouteUI.url.parse = function(){
    var r = {path: null, args: {}},
        url = location.hash.replace(/^#/, ''),
        path = !url.length ? ['/'] : /^(\/(?:[a-z0-9_/-]+)?)(?:\/([\S]+))?$/.exec(url),
        object = {},arg = path[2] ? path[2].split('&') : [];
    r.path = path[1];
    for(var i in arg){
        path = /^([\S]+):([\S]+)$/.exec(arg[i]);
        if(path.length == 3) {
            object[path[1]] = path[2];
        }
    }
    r.args = object;
    return r;
}

RouteUI.url.refresh = function(url){
    var r = {
        url: null,
        callback: function(){}
    };
    if(typeof url != 'object') {
        for (var i in this.callbacks.enter) {
            if(new RegExp('^'+url.replace(/\//g, '\\/')+'$').test(this.callbacks.enter[i].url)){
                r = this.callbacks.enter[i];
                break;
            }
        }
    }
    else{
        r = url;
    }
    if(r.execBasePath){
        return this.refresh(this.parse().path).then(function(){
            return new Promise(function(resolve){
                r.callback.apply(RouteUI.url,[resolve,RouteUI.url.parse()]);
            });
        });
    }
    return new Promise(function(resolve){
        r.callback.apply(RouteUI.url,[resolve,RouteUI.url.parse()]);
    });
}

RouteUI.url.ready = function(url){
    return this.callbacks.state == url;
}

RouteUI.url.setState = function(url){
    RouteUI.url.callbacks.state = url;
}

RouteUI.url.enter = function(url, callback, execBasePath){
    execBasePath = set(execBasePath,false);
    RouteUI.url.callbacks.enter.push({
        url: url,
        execBasePath: execBasePath,
        callback: callback
    });
    return this;
}

RouteUI.url.quit = function(url, callback){
    RouteUI.url.callbacks.quit.push({
        url: url,
        callback: callback
    });
    return this;
}
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

    ruiv.filter = ruiv.defaultFilter('course', 'grade');

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
RouteUI.url.enter('/',function(end,url){
    this.load(url.path).then(function(){
        RouteUI.url.setState(url.path);
        end();
    });
});
RouteUI["/"] = function(){
    console.log('[Modules]',Modules.data);
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
    percent = isNaN(percent) ? 0 : percent;
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
}
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
for(var i in RouteUI.utils.data){
    RouteUI.utils.view[i] = RouteUI.utils.data[i];
}