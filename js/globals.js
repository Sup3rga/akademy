var conform = {
        toFunction: function(e){
            if(/function\(([a-z0-9, ]*?)\)\{([\s\S]*)\}$/.test(e)){
                var args, fn = {
                    args: RegExp.$1,
                    body: RegExp.$2
                }
                args = fn.args.split(',');
                var arg = [];
                foreach(args, function(i){
                    arg.push(i.replace(' ', ''))
                })
                return new Function(arg, fn.body);
            }
            else
                return function(){};
        },
        sortFunction:function(a,b){
            if(a < b)
                return 1;
            else
                return -1;
        },
        toFormalName: function(e){
            var c = false, r = '', e = (e+"").toString().toLowerCase(), k=0;
            for(var i in e){
                if(!k)
                    c = true;
                r += c ? e[i].toUpperCase() : e[i];
                if(inArray(e[i], [' ', '-', '\'']))
                    c = true;
                else
                    c = false;
                k++;
            }
            return r;
        },
        toCamelCase: function(text,pascal){
            var pascal = set(pascal,false), c = false,
                avoid = [' ', '-', '_', '\''],
                r = '', e = text.toLowerCase();
            foreach(e,function(i,j){
                r += !inArray(i,avoid) ? ( c || (j == 0 && pascal) ? i.toUpperCase() : i ) : '';
                if(inArray(i,avoid))
                    c = true;
                else
                    c = false;
            })
            return r;
        },
        toBoolean: function(e){
            return !/false|0|null/i.test(e);
        },
        sortIndex: function(e){
            var e = set(e,{}), t = [], r = {};
            foreach(e, function(i){
                t.push(i);
            })
            t.sort(this.sortFunction);
            foreach(t, function(i){
                foreach(e, function(j,k){
                    if(j == i)
                        r[k] = j;
                })
            })
            return r;
        },
        sortObject: function(e){
            var t = objectIndex(e).sort(), r={};
            foreach(t, function(i,j){
                r[i] = e[i];
            })
            return r;
        }
    },
    detect = {
        isNumber: function(e){
            return /^[0-9]+(\.[0-9]+)?$/.test(e);
        },
        isInt: function(e){
            return /^[0-9]+$/.test(e);
        },
        isEmail: function(e){
            return /^[a-z0-9._-]+@[a-z0-9._-]+\.[a-z0-9]{2,6}$/i.test(e);
        },
        isName: function(e){
            return /^[a-záäąàãâȧéëēèêęėíïįıìĩîóöǫȯòõúüūųùýỹçċñǹ '-]+$/i.test(e);
        },
        isNameCode: function(e){
            return /^[a-záäąàãâȧéëēèêęėíïįıìĩîóöǫȯòõúüūųùýỹçċñǹ@&.'-]+/i.test(e);
        },
        isString: function(e){
            return /^[a-z]/i.test(e) && /[\S\s]+$/i.test(e);
        },
        isFunction: function(e){
            return typeof e == 'function' ||
                ( typeof e == 'string' && /^function([a-z_0-9]+)?\(([a-z0-9, ]*?)\)\{([\s\S]*)\}$/.test(e));
        },
        password: {
            isWeak: function(e){
                var e = e.toString();
                return e.length <= 6 &&
                    (/^[a-z]{1,6}$/i.test(e) || /[^a-z0-9]+/i.test(e) || /^[0-9]{4,6}$/.test(e) ||
                        /^[a-z0-9]{1,6}$/i.test(e));
            },
            isMedium: function(e){
                var e = e.toString();
                return e.length > 6 && e.length < 10 &&
                    (/^[a-z]{6,10}$/i.test(e) || /[^a-z0-9]+/i.test(e) || /^[0-9]{7,10}$/.test(e) ||
                        /^[a-z0-9]{6,10}$/i.test(e));
            },
            isStrong: function(e){
                var e = e.toString();
                return e.length > 8 &&
                    (/^[a-z]{8,}$/i.test(e) || /[^a-z0-9]+/i.test(e) || /^[0-9]{8,}$/.test(e) ||
                        /^[a-z0-9]{8,}$/i.test(e));
            },
            is: function(e){
                var t = ['Weak', 'Medium', 'Strong'], r = '';
                for(var i in t){
                    if(detect.password['is'+t[i]](e)){
                        r = t[i].toLowerCase();
                        break;
                    }
                }
                return r;
            }
        },
        dateComparison(date, date2){
            var d1 = date.split('-'),
                d2 = date2.split('-');
            if(d1.length != 3 || d2.length != 3) return 0;
            var r = 0;
            for(var i in d1){
                if(d1[i] * 1 < d2[i] * 1){
                    r = -1;
                }
                if(d1[i] * 1 > d2[i] * 1){
                    r = 1;
                }
                if(r != 0) break;
            }
            return r;
        }
    };

function inArray(item, array, igcase){
    var rep = false,
        igcase = typeof igcase == 'bool' || igcase == 0 || igcase == 1 ? igcase : false;
    for(var i = 0, j = array.length; i < j; i++){
        if(igcase){
            array[i].toLowerCase(); item = item.toLowerCase();
        }
        if(item == array[i]){
            rep = true;
            break;
        }
    }
    return rep;
}

function isJSON(m){
    if (typeof m == 'object' && m != null) {
        try{ m = JSON.stringify(m); }
        catch(err) { return false; } }

    if (typeof m == 'string') {
        try{ m = JSON.parse(m); }
        catch (err) { return false; } }

    if (typeof m != 'object' || m == null) { return false; }
    return true;

}

function empty(str){
    var rep = true, state = 0;
    if(typeof str != 'object' || str == null){
        if(!((!/^null$/.test(str) && !/undefined/.test(typeof str) && str.toString().length == 0) || /^null$/.test(str)))
            rep = false;
    }
    else{
        for(var i in str){
            rep = empty(str[i]);
            if(!rep)
                state++;
        }
        if(state)
            rep = false;
    }
    return rep
}

function len(data){
    if(data == null) return 0;
    var k = 0;
    for(var i in data){
        k++;
    }
    return k;
}

function removeElement(t, e){
    var n = [];
    for(var i in t){
        if(t[i] != e){
            n.push(t[i]);
        }
    }
    return n;
}

function removeIndex(t,i){
    var n = [];
    for(var k in t){
        if(k != i){
            n.push(t[k]);
        }
    }
    return n;
}

function isset(str){
    return typeof str != 'undefined' && str != null;
}

function set(e, v, s){
    return isset(s) ? (e ? isset(v) ? v : null : isset(s) ? s : null) : (isset(e) ? e : isset(v) ? v : null);
}

function extend(model, options, ref){
    var ref = set(ref, false),
        e = ref ? model : JSON.parse(JSON.stringify(model)),
        r = e;
    for(var i in options){
        r[i] = options[i];
    }
    return r;
}

function deepExtent(dest,src,mergeMethod){
    var mergeMethod = set(mergeMethod, {});
    for(var i in src){
        if(i in dest && typeof src[i] == 'object') {
            if(i in mergeMethod){
                mergeMethod[i](dest[i], src[i]);
            }
            else {
                if (Array.isArray(dest[i]) && Array.isArray(src[i])) {
                    dest[i] = merge(dest[i], src[i]);
                } else {
                    dest[i] = deepExtent(dest[i], src[i]);
                }
            }
        }
        else{
            dest[i] = src[i];
        }
    }
    return dest;
}

function merge(a1, a2, r){
    var rep = [],
        r = isset(r) ? r : false;
    for(var i in a1){
        rep.push(a1[i]);
    }
    for(var i = 0, j = a2.length; i < j; i++){
        if(!r || (r && !inArray(a2[i], rep)))
            rep.push(a2[i])
    }
    return rep;
}

function copy(object){
    return JSON.parse(JSON.stringify(object));
}

localforage.config({
    driver      : localforage.INDEXEDDB,
    name        : 'Akademy',
    version     : 1.0,
    storeName   : 'AkademyDataBase',
    description : 'for storage of Akademy client-side'
});
localforage.ready();

var
Form = {
    serialize : function(form){
        var data = {}, input;
        form.find('[name]').each(function(){
            input = $(this);
            data[input.attr('name')] = input.attr('type') == 'checkbox' ? this.checked : input.val();
        });
        return data;
    },
    getRequiredList: function(form){
        var list = [];
        form.find('[required]').each(function(){
            list.push($(this).attr('name'));
        });
        return list;
    },
    reset: function(form, data){
        data = set(data,{});
        var input, name,type;
        form.find('[name]').each(function(){
            input = $(this);
            name = input.attr('name');
            type = input.attr('type');
            if(this.tagName.toLowerCase() == 'kinput'){
                input = $_(this);
            }
            if(name in data){
                if(type == 'checkbox'){
                    this.checked = data[name];
                }
                else{
                    input.val(data[name]);
                    $(this).find('input').focus();
                }
            }
            else{
                if(type == 'checkbox'){
                    this.checked = false;
                }
                else{
                    input.val('');
                    $(this).find('input').focus();
                }
            }
            data[name] = type == 'checkbox' ? this.checked : input.val();
        })
    },
    isSubmitable : function(data, only){
        var r = true,
            only = Array.isArray(only) ? only : null;
        // console.log('[Data]',data);
        for(var i in data){
            if(only == null || only.indexOf(i) >= 0) {
                if ((!data[i] && typeof data[i] != 'boolean') || data[i].toString().length == 0) {
                    r = false;
                    break;
                }
            }
        }
        return r;
    },
    lock: function(el){
        $(el).attr('locked', "true");
        return this;
    },
    unlock: function(el){
        $(el).removeAttr('locked');
        return this;
    },
    isLocked: function(el){
        return $(el).attr('locked') == "true";
    }
},
Fetch = {
    get: function(url, data){
        return new Promise(function(resolve,reject){
            $.get(url, data, function(e){
                if(isJSON(e)){
                    var r = JSON.parse(e);
                    if('data' in r){
                        Modules.updateData(r.data);
                    }
                    if(r.error){
                        reject(r.message);
                    }
                    else{
                        resolve(r);
                    }
                    User.readCode(r.code);
                }
                else{
                    reject("Une erreur est survénue lors du traitement");
                }
            }, function(){
                reject("Une erreur est survénue lors du traitement");
            });
        });
    },
    post: function(url,data){
        return new Promise(function(res, rej){
            $.post(url, data, function(e){
                if(isJSON(e)){
                    var r = JSON.parse(e);
                    if('data' in r){
                        Modules.updateData(r.data);
                    }
                    if(r.error){
                        rej(r.message);
                    }
                    else{
                        res(r);
                    }
                    User.readCode(r.code);
                }
                else{
                    rej("Une erreur est survénue lors du traitement");
                }
            }, function(){
                rej("Une erreur est survénue lors du traitement");
            });
        });
    }
}
AlertBox = {
hidden : true,
box : null,
set : function(selector){
    this.box = $(selector);
    return this;
},
text : function(text){
    this.box.find('.text').html(text);
    return this;
},
icon : function(cls){
    this.box.find('icon').attr('class', cls);
    return this;
},
show: function(){
    this.box.show(200);
    this.hidden = false;
    return this;
},
hide: function(){
    this.box.hide(200);
    this.hidden = true;
    return this;
},
type: function(type){
    this.box.removeClass('warn').removeClass('success').removeClass('fail')
        .addClass(type);
    return this;
},
toggle: function(){
    this.box[this.hidden ? 'show' : 'hide'](200);
    this.hidden = !this.hidden;
    return this;
}
},
LayerForm = (function(){
    var baseForm = $('.layer-form');
    baseForm.remove().removeClass('ui-hide');
    return function(title){
        var el = baseForm.clone(),
            events = {
                submit: [],
                invalidation: [],
                cancel: [],
                close: [],
                mountform: []
            },
            form = null,
            initForm = null,
            data = {},
            $this = this,
            widthPrefix = ['ui-lg-size-', 'ui-md-size-', 'ui-sm-size-', 'ui-size-'],
            dispatch = {
                submit: function(){
                    data = Form.serialize(form);
                    var required = Form.getRequiredList(form);
                    if(Form.isSubmitable(data, required)) {
                        for (var i in events.submit) {
                            events.submit[i].apply($this, [data, form]);
                        }
                    }
                    else{
                        var toValidate = [];
                        for(var i in required){
                            if(!data[required[i]].length){
                                toValidate.push(required[i]);
                            }
                        }
                        for (var i in events.invalidation) {
                            events.invalidation[i].apply($this, [toValidate, form]);
                        }
                    }
                },
                cancel: function(){
                    data = {};
                    for(var i in events.cancel){
                        events.cancel[i].applay($this,[data,form]);
                    }
                    this.close();
                },
                close: function(){
                    data = {};
                    for(var i in events.close){
                        events.submit[i].apply($this,[data,form]);
                    }
                    el.addClass('down');
                    setTimeout(function(){
                        el.remove();
                        mounted = false;
                    },200);
                },
                mountform: function(){
                    for(var i in events.mountform){
                        events.mountform[i].apply($this, null);
                    }
                }
            },
            mounted = false;
        LayerForm.DIMENSION = {
            SMALL : [4,5,6,7],
            MEDIUM : [6,8,10,11],
            LARGE: [8,9,11,12]
        };
        el.find('.text-bar').html(title);
        this.html = function(content){
            form = $(content).clone();
            initForm = form.clone();
            el.find('.form-view').html(form);
            dispatch.mountform();
            return this;
        }
        this.getForm = function(){
            return form;
        }
        this.show = function(){
            if(!mounted){
                $('body').append(el);
                mounted = true;
                setTimeout(function(){
                    el.removeClass('down');
                },0);
            }
            return this;
        }
        this.hide = function(reset){
            reset = reset ? reset : true;
            if(reset){
                this.html(initForm);
            }
            dispatch.close();
            return this;
        }
        this.off = function(ev){
            ev = Array.isArray(ev) ? ev : [ev];
            for(var i in ev){
                if(ev[i] in events){
                    events[ev[i]] = [];
                }
            }
            return this;
        }
        this.on = function(ev,callback){
            ev = ev.toLowerCase();
            if(ev in events){
                events[ev].push(callback);
                if(ev == 'mountform' && form != null){
                    dispatch.mountform();
                }
            }
            return this;
        }
        this.setUnClosable = function(){
            el.find('.close-zone').css('display', 'none');
            return this;
        }
        this.setClosable = function(){
            el.find('.close-zone').css('display', 'inline-block');
            return this;
        }
        this.setActionless = function(){
            el.find('.actions').css('display', 'none');
            return this;
        }
        this.setHeadless = function(){
            el.find('.header').css('display', 'none');
            return this;
        }
        this.showHeader = function(){
            el.find('.header').css('display', 'inline-block');
            return this;
        }
        this.setAnimationless = function(){
            el.addClass('fixed');
            return this;
        }
        this.setAnimatable= function(){
            el.removeClass('fixed');
            return this;
        }
        this.setAction = function(){
            el.find('.actions').css('display', 'inline-block');
            return this;
        }
        this.setTransparent = function(){
            el.addClass('transparent');
            return this;
        }
        this.setCompact = function(){
            el.removeClass('transparent');
            return this;
        }
        this.setBlurMod = function(activate){
            activate = typeof activate == "undefined" ? true : activate;
            el[activate ? 'addClass' : 'removeClass']('blur');
            return this;
        }
        this.setWidthPrefix = function(prefixes){
            if(!Array.isArray(prefixes)){
                prefixes = [];
            }
            widthPrefix = prefixes;
            return this;
        }
        this.setDimensions = function(dimension){
            if(!Array.isArray(dimension)){
                dimension = LayerForm.DIMENSION.MEDIUM;
            }
            var dimensionOk = true;
            for(var i in dimension){
                if(isNaN(dimension[i] * 1)){
                    dimensionOk = false;
                }
                dimension[i] = parseInt(dimension[i] * 1);
            }
            if(!dimensionOk){
                dimension = LayerForm.DIMENSION.MEDIUM;
            }
            var cls = el.find('.box').attr('class');
            console.log('[El]',el);
            cls = cls.replace(/[a-z-]+[0-9]{1,2}/g, '').replace(/ {2,}/g, ' ');
            for(var i in dimension){
                if(i in widthPrefix){
                    cls = cls+(cls.length ? " " : "")+widthPrefix[i]+dimension[i];
                }
            }
            el.find('.box').attr('class', cls);
            return this;
        }

        el.find('.actions button').on('click', function(){
            var type = $(this).attr('data-btn-type');
            dispatch[type]();
        });
        el.find('.header .close-zone icon').on('click', function(){
            dispatch.close();
        });
    }
})(),
Loader = {
    dom: null,
    popup:{
        instance: new LayerForm().setHeadless().setActionless().setAnimationless().setTransparent(),
        show: function(withProgression){
            withProgression = set(withProgression,false);
            this.instance.html(Loader.dom).show();
            this.instance.getForm().find('.progression').css('display', withProgression ? 'flex' : 'none');
            this.instance.getForm().find('.text').text(RouteUI.str("request.loading.text"));
            Loader.animate(this.instance.getForm());
            return this;
        },
        text: function(text){
            this.instance.getForm().find('.text').text(text);
            return this;
        },
        progressTo: function(percent){
          this.instance.getForm().find('.progression .indicator').css('width', percent+'%');
          return this;
        },
        hide: function(){
            Loader.close(Loader.dom);
            this.instance.hide();
            return this;
        }
    },
    animate: function(selector){
        var loader = $(selector),
            bulbes = loader.find('.bulbe'),
            duration = 200;
        // console.warn('[Called]',bulbes, selector);
        loader.removeClass("stop");
        function t(n){
            bulbes.eq(n - 1 < 0 ? bulbes.length - 1 : n - 1).removeClass("up");
            var time = setTimeout(function(){
                bulbes.eq(n).addClass("up");
                clearTimeout(time);
                time = setTimeout(function(){
                    clearTimeout(time);
                    if(!loader.hasClass('stop')){
                        window.requestAnimationFrame(function(){
                            t( ( n + 1 ) % bulbes.length);
                        });
                    }else{
                        bulbes.removeClass("up");
                    }
                },duration);
            },n % (bulbes.length) ? 0 : 500);
        }
        window.requestAnimationFrame(function(){
            t(0);
        });
    },
    close : function(selector){
        var loader = $(selector),
            bulbes = loader.find('.bulbe');
        loader.addClass("stop");
        bulbes.removeClass("up");
    }
},
DialogBox = {
    ev: function(){
        var box = $('.dialog-box');
        box.find('.action button').off('click');
        box.find('.action button').on('click', function(){
            DialogBox.hide();
        });
    },
    setMessage : function(html){
        this.ev();
        var box = $('.dialog-box');
        box.find('.message').html(html);
        return this;
    },
    set: function(message, type){
        return this.setMessage(message).setType(type);
    },
    setWith: function(icon,message,type){
        return this.set('<icon class="'+icon+' rounded"></icon> <span class="ui-element ui-size-10">'+message+'</span>', type);
    },
    show: function(){
        this.ev();
        var box = $('.dialog-box');
        box.show(400);
        return this;
    },
    onClose: function(fn){
        var box = $('.dialog-box');
        box.find('.action button').on('click',function(){
            fn(this, $(this).hasClass('ok') || $(this).hasClass('yes'))
        });
        return this;
    },
    hide : function(){
        var box = $('.dialog-box');
        box.hide(400);
        return this;
    },
    setType: function(type){
        this.ev();
        var box = $('.dialog-box');
        switch (type.toLowerCase()){
            case 'yesno':
                box.find('.yes, .no').show();
                box.find('.ok').hide();
                break;
            case 'none':
                box.find('.yes, .no, .ok').hide();
                break;
            default:
                box.find('.yes, .no').hide();
                box.find('.ok').show();
                break;
        }
        return this;
    }
},
Modules = {
    data : {},
    res : {
        sidemenu: {
            "/" : {value: 0, content: "", icon: "las la-home", text: "Dashboard"},
            "/academic-year" : {value : 1, content : "", icon: "las la-calendar-alt", text: "Année académique"},
            "/student" : {value : 2, content : "", icon : "las la-user-graduate", text : "Étudiants"},
            "/course" : {value : 3, content : "", icon: "las la-pencil-ruler", text: "Cours"},
            "/notes" : {value : 7, content : "", icon: "las la-sticky-note", text: "Notes et bulletins"},
            "/teacher" : {value : 4, content : "",icon: "las la-chalkboard-teacher", text: "Professeurs"},
            "/admin" : {value : 5, content : "", icon : "las la-university", text: "Administration"},
            "/users" : {value: 6, content : "", icon: "las la-users-cog", text: "Utilisateurs"}
        }
    },
    access : null,
    currentOptions : null,
    search: function(){},
    setSearchVisible: function(visible){
        $('appbar .search-zone .field')[!set(visible, true) ? 'addClass' : 'removeClass']('ui-hide');
    },
    updateData : function(r){
        Modules.data = deepExtent(Modules.data, r, 'RouteUI' in window ? RouteUI.utils.data.updater : {});
        // if(typeof Boot != 'undefined') {
        //     Modules.data = extend(Modules.data, Boot.terminal.getUserById(Modules.data.id));
        // }
        localforage.setItem("akademy-data", JSON.stringify(Modules.data));
    },
    searchTrigger: function(){
        $('appbar .search-bar').trigger('input');
    },
    setSideMenu : function(access){
        return;
        var html = "",
            access = access.split(","),
            res = this.res.sidemenu;
        for(var i in res){
            if(access.indexOf(res[i].value.toString()) != -1){
                html += "<a href='#"+i+"' class=\"super item super-l12 super-flex-center\" access='"+res[i].value+"'>\n" +
                    "     <icon class=\""+res[i].icon+"\"></icon>\n" +
                    "     <span class=\"super text\">\n" +
                    res[i].text+
                    "      </span>\n" +
                    "   </a>";
            }
        }
        // $('sidemenu .links').html(html);
        return this.updateSideMenuUi($('sidemenu').find('.item[href="#'+History.current+'"]'));
    },
    setAppBar: function(data){
        var usr = $('.user-zone');
        usr.find('avatar').text(data.photo != null ? '' : data.prenom[0].toUpperCase())
            .css('background-image', data.photo == null ? '' : 'url(../assets/avatars/'+data.photo+')');
        usr.find('.greeting').text(data.pseudo);
        usr.find('.name').text(data.prenom+" "+data.nom);
        return this;
    },
    allowModule: function(e){
        return Modules.data.privileges.split(',').indexOf(e+"") >= 0;
    },
    hasAccessToFac: function(id){
        return id in Modules.data.attachedBranch;
    },
    hasAccessToGrade: function(grade, fac){
        var r = false;
        grade = parseInt(grade);
        if(fac != null){
            r = this.hasAccessToFac(fac);
            if(r){
                r = Modules.data.attachedBranch[fac].indexOf(grade) >= 0;
            }
        }
        else{
            for(var i in Modules.data.attachedBranch){
                if(Modules.data.attachedBranch[i].indexOf(grade) >= 0){
                    r = true;
                    break;
                }
            }
        }
        return r;
    },
    defaultOptions : function(){
        var options = {};
        options.allowModule = this.allowModule;
        options.utils = extend({
            len: len,
            isPartOf: this.hasAccessToFac,
            isAlsoPartOf: this.hasAccessToGrade,
        }, RouteUI.utils.view, true);
        return options;
    },
    load: function(html, options){
        var options = options == undefined ? {} : options;
        Modules.res.sidemenu[History.current].content = html;
        html = $(html);
        html.find('template').remove();
        html = html[0].outerHTML
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
        // console.log('[HTML]',html);
        options = extend(options, this.defaultOptions());
        this.setSearchVisible();
        html = ejs.render(html, options, {
            strict: false
            // compileDebug: true,
            // debug: function(e){
            //     console.log('[E]',e);
            // }
        });
        $('panel').html(html);
        AkaGlobalEvents();
        KInput.watch();
        if(RouteUI !== undefined && History.current in RouteUI){
            RouteUI.utils.view.filter = null;
            RouteUI[History.current].apply(RouteUI,[]);
        }
        // this.searchTrigger();
    },
    updateSideMenuUi: function(current){
        if(this.currentOptions != null){
            this.currentOptions.removeClass('active')
        }
        this.currentOptions = current;
        this.currentOptions.addClass('active');
        return this;
    }
},
History = {
    current: !window.location.hash.length ? "/" : window.location.hash.replace(/^#/, ''),
    init : function(){
        $(window).on('hashchange', function(){
            History.current = window.location.hash.replace(/^#/, '');
            History.current = History.current.length == 0 ? "/" : History.current;
            RouteUI.url.read();
            // History.reach();
        });
        RouteUI.url.read();
        return this;
    },
    reach: function(ressource,cb){
        var ressource = set(ressource, History.current);
        if(typeof cb != 'function'){
            cb = function(){};
        }
        History.current = ressource;
        if(RouteUI.url.ready(History.current)){
            cb();
            return;
        }
        $('panel').html(Loader.dom);
        $('appbar .search-bar').val('');
        Loader.animate('.panel-loader');
        Modules.updateSideMenuUi($('sidemenu').find('.item[href="#'+ressource+'"]'))
        // console.log('[DATA__]',Modules.data, History.current, ">"+window.location.hash);
        if(ressource in Modules.res.sidemenu && Modules.res.sidemenu[ressource].content.length){
            Loader.close('.panel-load');
            Modules.load(Modules.res.sidemenu[ressource].content, Modules.data);
            cb();
            return;
        }
        Fetch.get('./akademy/akademy', RouteUI.utils.completeRequestData({
            res : ressource,
            akatoken: Modules.data.token
        })).then(function(r){
            Loader.close('.panel-load');
            Modules.res.sidemenu[ressource].content = r.template;
            Modules.load(r.template, Modules.data);
            cb();
        }).catch(function(){  Loader.close('.panel-load'); });
        return this;
    }
},
User = {
    signin: function(data){
        return Fetch.post('./signin', data);
    },
    signout: function(){
        return Fetch.post('./signin', {
            uid : Modules.data.id,
            disconnect: Modules.data.token
        });
    },
    readCode: function(code){
        var path = window.location.pathname.replace(/^\/akademy[a-zA-Z0-9.-]*\/|\/$/gi, '');
        // console.log('[Path]', path, '/', code);
        // return;
        switch (code){
            case 0:
                if(path != ''){
                    DialogBox.setMessage("<icon class='las la-user-lock rounded yellow'></icon> Vous n'êtes plus connecté(e) !")
                        .setType('OK')
                        .show()
                        .onClose(function(){
                            localforage.removeItem('akademy-data');
                            window.location = './';
                        });
                }
                break;
            case 1:
                /**
                 * The public token is required for any secure activity
                 */
                if(!/^ss_[a-zA-Z0-9_.]+$/.test(path) && Modules.data && Modules.data.token){
                    window.location = Modules.data.token;
                }
                else if(!Modules.data){
                    window.location = './';
                }
                break;
        }
    }
},
Card = function(sel){
    this.dom = $(sel);
    this.index = 0;
    var $this = this,
        autoresize = this.dom.attr('autoresize') != undefined,
        ev = [];
    function innerHeight(el){
        var h = 0;
        el.find('*').each(function(){
            if( h < $(this).position().top + $(this).height()){
                h = $(this).position().top + $(this).height();
            }
        });
        return h;
    }
    // function find(sel){
    //     var list = $this.dom.find(sel);
    //     console.log('[List]',list);
    // }
    function resize(){
        if(autoresize){
            var height = innerHeight($this.dom.find('.card.active'));
            $this.dom.find('.card.active').height(height);
            $this.dom.find('.body').css('height', height);
        }
    }
    this.index = this.dom.find('.card.active, cards card.active').length ? this.dom.find('.card.active, cards card.active').attr('data-index') * 1 : 0;
    resize();
    $(window).on('resize', resize);
    this.dom.find('.card-tab,tabs tab').on('click', function(){
        var index = $(this).attr('data-index');
        // $(this).addClass('active');
        $this.switchTo(index)
        for(var i in ev){
            ev[i](index, this);
        }
    });
    this.getIndex = function(){
        return this.index;
    }
    this.switchTo = function(index, ignoreActive){
        var ignoreActive = ignoreActive == undefined ? false : ignoreActive;
        autoresize = this.dom.attr('autoresize') != undefined;
        $this.dom.find('.card.active'+(ignoreActive ? '' : ', .card-tab.active')+',cards card.active'+(ignoreActive ? '' : ', tabs tab.active')).removeClass('active');
        this.index = index;
        $this.dom.find('.card[data-index="' + index + '"], .card-tab[data-index="' + index + '"],cards card[data-index="' + index + '"], tabs tab[data-index="' + index + '"]').addClass('active');
        $this.dom.find('body').css('height', $this.dom.find('.card.active,cards card.active').height());
        for(var i in ev){
            ev[i](index, this);
        }
        resize();
    }
    this.onSwitch = function(fn){
        ev.push(fn);
    }
},
FormPopup = {
        el: null,
        callbacks: null,
        ev: function(){
            FormPopup.el.find('.action button').off('click');
            FormPopup.el.on('click', '.action button', function(){
                var val = $(this).attr('data-value');
                if(val == 'cancel'){
                    FormPopup.hide();
                }
            })
        },
        html: function(html){
            FormPopup.el = FormPopup.el == null ? $('.form-popup') : FormPopup.el;
            FormPopup.el.find('.body').html(html);
            if(this.callbacks){
                this.onAction(this.callbacks);
                this.callbacks = null;
            }
            return this;
        },
        title: function(title){
            FormPopup.el = FormPopup.el == null ? $('.form-popup') : FormPopup.el;
            FormPopup.el.find('.title').html(title);
            return this;
        },
        show: function(){
            if(FormPopup.el == null) return;
            FormPopup.el.addClass('active');
            this.ev();
            return this;
        },
        hide: function(){
            if(FormPopup.el == null) return;
            FormPopup.el.removeClass('active');
            return this;
        },
        onAction: function(fn){
            if(FormPopup.el == null){
                this.callbacks = fn;
                return;
            }
            this.ev();
            FormPopup.el.off('click', '.action button');
            FormPopup.el.on('click', '.action button', function(){
                var submit = $(this).attr('data-value') == 'submit',
                    required = [];
                if(!submit){
                    FormPopup.hide();
                }
                FormPopup.el.find('.body .field .input[required]').each(function(){
                   required.push($(this).attr('name'));
                });
                fn(submit, Form.serialize(FormPopup.el.find('.body').eq(0)), required);
            });
            return this;
        }
    };