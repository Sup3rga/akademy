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

RouteUI.utils.view.defaultFilter = function(classZone, attrCriteria, extras){
    var emptySearch = RouteUI.utils.view.filterFallback,
        extras = set(extras, {});
    if(!emptySearch){
        emptySearch = $('#empty-search');
        RouteUI.utils.view.filterFallback = emptySearch;
    }
    return function(){
        var criterias = [
                $_('.'+classZone+' .header .academic-'+attrCriteria).val(),
                $('appbar .search-bar').val().replace(/ */g, '').toLowerCase()
            ],
            visible = [];
        for(var i in extras){
            criterias.push($_(i).val());
        }
        criterias.push($('.'+classZone+' .header [alternate="sort"].active').length ? $('.'+classZone+' .header [alternate="sort"].active').attr('direction') : 'default')
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
                show = true;
            for(var i in extras){
                targets.push(extras[i](this));
            }
            for(var i = 0, j = criterias.length - 1; i < j; i++){
                if(i != 1) {
                    show = show && criterias[i].indexOf(targets[i]) >= 0;
                }
                else{
                    show = show && targets[i].indexOf(criterias[i]) >= 0;
                }
            }
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
        var filter_c = criterias[criterias.length - 1];
        if(filter_c != 'default'){
            visible.sort();
            if(filter_c == 'up'){
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