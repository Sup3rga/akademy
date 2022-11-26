var KInput = (function($){
    var elements = [],
        types = ['select', 'text', 'textarea', 'radio', 'checkbox', 'date', 'color', 'password','number'],
        body = $('body'),
        attributes = ['placeholder', 'type', 'value', 'mask', 'match', 'manualtype'],
        style = $('<style>');
    $('head').eq(0).prepend(style);

    style.html((function(e){
        var r = '';
        for(var i in e){
            r += i+'{\n';
            for(var j in e[i]){
                r += j+' : '+e[i][j]+';\n';
            }
            r += '}\n';
        }
        return r;
    })(
    {
        'kinputPopup, kbox.float':{
            display: 'none',
            position: 'absolute',
            'z-index': 999
        },
        kinputPopup:{
            width: '100vw',
            height: '100vh',
            'align-items': 'center',
            'justify-content': 'center'
        },
        kBox:{
            display: 'block',
            'background-color': 'white',
            'flex-direction':'column',
            width: '90vmin',
            'box-shadow': '0 0 4px 1px #ccc',
            padding: '.4em',
            'max-height': '80vh',
            'border-radius': '.4em'
        },
        'kBox koption':{
            display: 'block',
            padding: '.4em',
            margin: '.1em 0',
            width: 'inherit',
            'border-radius': '.4em'
        },
        'kBox koption:hover':{
            cursor: 'pointer',
            'background-color': '#eee'
        },
        'kBox koption.selected':{
            'background-color': '#ccc'
        },
        'kBoxHead': {
            display: 'block',
            padding: '.4em',
            'background-color': '#eee'
        },
        'kBoxHead input, kinput input':{
            display: 'inline-block',
            border: 0,
            'font-family': 'inherit',
            'font-size': 'inherit',
            'text-align': 'inherit',
            width: '100%',
            height: '100%',
            'vertical-align': 'middle',
            'background-color': 'unset !important'
        },
        'kinput input':{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0
        },
        kBoxBody: {
            display: 'flex',
            'flex-direction':'column',
            width: '100%',
            'max-height': 'calc(80vmin * 0.8)',
            overflow: 'hidden'
        },
        'kBoxBody kWrapper':{
            display: 'block',
            'width':'100%',
            'height':'100%',
            overflow: 'hidden',
            'overflow-y': 'auto',
            margin: '.2em 0',
            'background-color': '#f7f7f7',
            'border-radius':'.4em'
        },
        'kBoxBody kbutton':{
          display: 'flex',
          'align-items':'center',
          'justify-content':'center',
          padding: '.3em',
          'background-color':'#efefef',
          'font-family': 'inherit',
          'cursor': 'pointer',
          'border-radius': '.4em'
        },
        'kBoxBody kbutton:hover':{
            'background-color': '#ddd'
        },
        kinput:{
            'padding-top': '0 !important',
            'white-space': 'nowrap',
            overflow: 'hidden',
            'text-overflow': 'ellipsis',
            height: '100%',
            position: 'relative'
        },
        'kinput kflex':{
            display: 'flex',
            width: '100%',
            height: 'inherit',
            'align-items': 'center',
            'justify-content': 'center'
        },
        'kinput kflex knav':{
            display: 'inline-flex',
            height: 'inherit',
            'align-items': 'center',
            'justify-content': 'center',
            padding: '0 .4em',
            'background-color': '#ccc'
        },
        'kinput kinputmanualicon':{
            'position': 'relative',
            'top': '-100%',
            'left': '80%',
            'padding': '.4em',
            'background-color': 'inherit',
            'font-size': '14px'
        },
        'kinput kinputmanualicon:hover': {
            cursor: 'pointer',
            'background-color': 'grey'
        }
    }
    ));

    //Class
    var _KInput = function(element){
        var element = $(element != '' ? element : document.createElement('div')),
            popup = null, box = null, input = null,
            $this = this, indexElement = -1,
            popupconfig = {
                multiple: false,
                active: false,
                minWidth: 0,
                width: 0,
                ready: false
            },
            events = {};
        this.options = [];
        this.manualMode = false;
        this.length = element.length;

        function __mask(val){
            if($this.type == 'select'){
                return;
            }
            var mask = $this.mask,
                val_mask = '';
            for(var i in mask){
                if (
                    val[i] == undefined ||
                    (mask[i] == '#' && !/^[0-9]+$/.test(val[i])) ||
                    (mask[i].toUpperCase() == 'X' && !/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/.test(val[i])) ||
                    (mask[i] == '*' && !/^[A-Za-zÀ-ÖØ-öø-ÿ0-9.'_-]$/.test(val[i]))
                ) {
                    break;
                }
                if (['#', 'X', '*'].indexOf(mask[i].toUpperCase()) >= 0) {
                    val_mask += val[i];
                } else {
                    val_mask += mask[i];
                    if(mask[i] != val[i]) {
                        _val = val.substr(0, i) + mask[i] + val.substr(i, val.length);
                        val = _val;
                        i++;
                    }
                }
            }
            $this.value = val_mask;
            $this.val(val_mask);
        }

        function __match(val){
            var reg = $this.match,
                parent = $(this).parent();
            if(!new RegExp(reg,"i").test($this.value)){
                $this.val('');
                // while(!parent.hasClass('field') && parent[0].tagName.toLowerCase() != 'body'){
                //     parent = parent.parent();
                // }
                // if(parent.hasClass('field')){
                //     parent.addClass('invalid')
                // }
            }
        }

        function __setPosition(el){
            if(!popupconfig.active){
                popupconfig.width = el.scrollWidth;
                popupconfig.top = $(el).offset().top+$(el).height();
                popupconfig.left = $(el).offset().left;
                if(popupconfig.top + popup.height() > window.innerHeight){
                    popupconfig.top -= popupconfig.top + popup.height() - window.innerHeight;
                }
                if(popupconfig.left + popupconfig.width > window.innerWidth){
                    popupconfig.left -= popupconfig.left + popupconfig.width - window.innerWidth;
                }
                popup.css({
                    width: (popupconfig.width > popupconfig.minWidth ? popupconfig.width : popupconfig.minWidth)+'px',
                    top: popupconfig.top+'px',
                    left: popupconfig.left+'px'
                });
            }
        }

        function __showPopup(el){
            if(popup != null) {
                setTimeout(function(){
                    popup.css('display', 'flex');
                    __setPosition(el);
                },0)
            }
            if($this.type != 'select'){
                element.find('input').focus();
            }
            $this.focused = true;
            $(el).trigger('gotfocus');
            $(el).trigger('focus');
        }

        function __waitFree(callback,arg){
            function run(state){
                var free = state.timeRemaining() > 1;
                if(free){
                    callback(arg);
                }
                else{
                    requestIdleCallback(run);
                }
            }
            requestIdleCallback(run);
        }

        function __zeptoLoop(elements, callback, finish){
            var ttl = elements.length,
                k = 0;
            if(!ttl){
                finish();
                return;
            }
            function until(n){
                __waitFree(function(el){
                    callback(el);
                    k++;
                    if(k == ttl){
                        finish();
                    }
                    else{
                        until(k);
                    }
                }, elements[n]);
            }
            until(0);
        }

        function __init(){
            for(var i in attributes){
                $this[attributes[i]] = element.attr(attributes[i]);
                if(element.attr(attributes[i]) != undefined){
                    element.removeAttr(element.attr(attributes[i]));
                }
            }
            $this.placeholder = $this.placeholder == undefined ? '' : $this.placeholder;
            $this.hint = element.find('hint');
            $this.value = $this.value == undefined ? '' : $this.value;
            $this.focused = false;
            $this.hint = $this.hint.length ? $this.hint.text() : null;
            element.find('hint').remove();
            popupconfig.active = element.attr('popup') != undefined;
            popupconfig.width = element[0].scrollWidth;
            popupconfig.multiple = element.attr('multiple') != undefined;
            element.find('option').css('display', 'none');
            __zeptoLoop(element.find('option'),function(el){
                $this.options.push(el);
                if(popupconfig.minWidth < el.scrollWidth){
                    popupconfig.minWidth = el.scrollWidth;
                }
                $(el).remove();
            }, function(){
                $this.setType($this.type);
                __trigger('ready');
            });
            $this.permanentType = $this.type;
            // console.log('[Element]',element, $this.value);

            body.on('click', function(e){
                var target = $(e.target),
                    isFocus = false;
                while(target[0].tagName != 'BODY'){
                    if(target[0] == element[0] || ($this.type == 'select' && popup && !popupconfig.active && target[0] == popup[0]) ){
                        isFocus = true;
                        break;
                    }
                    target = target.parent();
                }
                if( popup != null && $this.focused && ( e.target == popup[0] || (!isFocus && !popupconfig.active) ) ){
                    popup.css('display', 'none');
                }
                if(!isFocus && $this.focused){
                    element.trigger('blur');
                    element.trigger('gotblur');
                }
            });

            element.val($this.value).on('click', function(){
                if($this.manualMode){
                    return;
                }
                isActive = true;
                __showPopup(this);
            })
            .on('click', 'kinputmanualicon', function(){
                $(this).remove();
                input.attr('readonly',true);
                $this.manualMode = false;
                element.trigger('click');
            })
            .on('input', 'input', function(){
                if($this.manualMode){
                    element.trigger('input');
                    $this.val($(this).val());
                }
            });
        }

        function __event(){
            input.on('focus', function(){
                $this.focused = true;
            });
            input.on('keydown', function(e){
                if($this.type == 'select' && (e.keyCode == 40 || e.keyCode == 38)){
                    e.preventDefault();
                    if(e.keyCode == 38) {
                        indexElement = indexElement > 0 ? indexElement - 1 : $this.options.length - 1;
                    }else{
                        indexElement = indexElement < $this.options.length - 1 ? indexElement + 1 : 0;
                    }
                    if(indexElement in $this.options){
                        $this.val($($this.options[indexElement]).attr('value'));
                    }
                }
            })
        }

        function __index(init){
            var index = init;
            for(var i in $this.options){
                if($($this.options[i]).hasClass('selected')){
                    index = i;
                    break;
                }
            }
            return index;
        }

        function __seekable(next){
            var index = __index(next ? -1 : 0);
            return next ? index < $this.options.length - 1 : index > 0;
        }

        function __trigger(ev,arg){
            var ev = Array.isArray(ev) ? ev : [ev],
                arg = arg == null ? null : arg;
            for(var i in ev){
                if(ev[i] in events){
                    for(var k in events[ev[i]]){
                        events[ev[i]][k].apply($this, [arg]);
                    }
                }
            }
        }

        function __setOptions(){
            if($this.type != 'select'){
                return;
            }
            var koption = null,
                ctx = document.createElement('canvas').getContext('2d'),
                padding = popupconfig.multiple ? 40 : 10;
                ctx.font = getComputedStyle(element[0]).fontSize+' Roboto'
            for(var i in $this.options){
                koption = document.createElement('koption');
                $(koption).attr('value', $($this.options[i]).attr("value"));
                $(koption).val($($this.options[i]).attr("value"));
                $(koption).attr('class', $($this.options[i]).attr("class"));
                popupconfig.minWidth = popupconfig.minWidth < ctx.measureText($this.options[i].innerHTML).width + padding ? ctx.measureText($this.options[i].innerHTML).width + padding : popupconfig.minWidth;
                if(popupconfig.multiple){
                    koption.innerHTML = '<input type="checkbox" '+($(koption).hasClass('selected') ? 'checked':'')+'> ';
                }
                koption.innerHTML += '<text>'+$this.options[i].innerHTML+'</text>';
                $this.options[i] = koption;
            }
        }

        function __setValue(){
            $this.value = [];
            box.find('koption').each(function(){
               if($(this).hasClass('selected')) {
                   $this.value.push($(this).val());
               }
            });
        }

        function __html(dom,element){
            __waitFree(function(){
                dom.appendChild(element);
            })
        }

        this.setType = function(type){
            type = type == undefined ? '' : type.toLowerCase();
            element.html(''); box = null; popup = null;
            this.type = types.indexOf(type) < 0 ? 'text' : type;
            input = this.type == 'textarea' ? $('<textarea class="input">') : $('<input type="'+this.type+'">');
            element.html(input);
            input.attr('placeholder', this.placeholder);
            if(this.type == 'select'){
                input.attr('readonly', true);
                popup = $('<kinputPopup>');
                box = $('<kBox>');
                box.html('<kBoxHead>' +
                    '<input type="search" placeholder="'+this.hint+'">'+
                    '</kBoxHead>' +
                    '<kBoxBody>' +
                    (popupconfig.multiple ?
                            '<kActions>' +
                            '</kActions>'
                            : ''
                    )+
                        '<kWrapper>' +
                        '</kWrapper>'+
                    (popupconfig.multiple ?
                        '<kActions>' +
                        '</kActions>'
                        : ''
                    )+
                    '</kBoxBody>');
                if(this.hint == null){
                    box.find('kBoxHead').remove();
                }
                __setOptions();
                for(var i in this.options){
                    __html(box.find('kBoxBody kWrapper')[0],this.options[i]);
                    // console.log('[Option]',this.options[i]);
                    if($(this.options[i]).hasClass('selected')){
                        this.value = $(this.options[i]).val();
                    }
                }
                if(popupconfig.multiple){
                    box.find('kBoxBody kActions').eq(1).append('<kbutton>Ok</kbutton>');
                    box.find('kBoxBody kActions').eq(0).append('<input type="checkbox">');
                }
                if(popupconfig.active){
                    popup.append(box);
                }
                else{
                    popup = box;
                    popup.addClass('float');
                }
                // __html(body, popup);
                body.append(popup);
                box.on('input','kBoxHead input', function(){
                    var val = $(this).val();
                    box.find('option').each(function(){
                        if($(this).text().toLowerCase().indexOf(val.toLowerCase()) >= 0 || !val.length){
                            $(this).css('display', 'block');
                        }else{
                            $(this).css('display', 'none');
                        }
                    });
                })
                .on('click', 'koption', function(e,a){
                    if(popupconfig.multiple){
                        var checkbox = $(this).find('input[type="checkbox"]')[0];
                        /**
                         * to avoid checbox dysfunctionality, we undo check to do it later
                         */
                        if(e.target == checkbox){
                            checkbox.checked = !checkbox.checked;
                        }
                        checkbox.checked = !checkbox.checked;
                        if(!checkbox.checked){
                            box.find('kActions input')[0].checked = false;
                        }
                        $(this)[checkbox.checked ? 'addClass' :'removeClass']('selected');
                        __setValue();
                        if(!a){
                            __trigger(['select','change'], $this);
                        }
                    }
                    else {
                        popup.css('display', 'none');
                    }
                    input.focus();
                    if ($(this).attr('manual') != undefined) {
                        $this.manualMode = true;
                        input.val('').removeAttr('readonly');
                        element.trigger('focus').trigger('gotfocus').append('<kinputmanualicon>&times;</kinputmanualicon>');
                    } else {
                        $this.val(popupconfig.multiple ? $this.value : $(this).attr('value'));
                    }
                })
                .on('click', 'kbutton', function(){
                    popup.css('display', 'none');
                    input.focus();
                    if ($(this).attr('manual') != undefined) {
                        $this.manualMode = true;
                        input.val('').removeAttr('readonly');
                        element.trigger('focus').trigger('gotfocus').append('<kinputmanualicon>&times;</kinputmanualicon>');
                    } else {
                        $this.val($(this).attr('value'));
                    }
                })
                .on('click', 'kActions input',function(){
                    var checked = this.checked;
                    box.find('koption').each(function(){
                       if( (!checked && $(this).hasClass('selected')) || (checked && !$(this).hasClass('selected')) ){
                           $(this).trigger('click',true);
                       }
                    });
                    __trigger(['select','change'], $this);
                });
                $(window).on('resize',function(){
                    __setPosition(element[0]);
                })
            }
            else{
                input.on('input', function(e){
                    $this.value = input.val();
                    if($this.mask != undefined){
                        __mask($this.value);
                    }
                    else {
                        element.val($this.value);
                    }
                    element.trigger('input');
                    __trigger('input',e);
                }).on('change', function(e){
                    if($this.match != undefined){
                        __match($(this).val());
                    }
                    element.trigger('change');
                    __trigger('change',e);
                });
            }
            element.val($this.value);
            if(!popupconfig.ready){
                popupconfig.ready = true;
            }
            this.val($this.value);
            __event();
            return this;
        }
        this.val = function(content){
            if(content == undefined){
                return $this.value;
            }
            var _old_value = $this.value;
            this.on('ready', function(){
                if(this.type == 'select') {
                    var isDefined = false, text = null;
                    if (!Array.isArray(content)) {
                        if (popupconfig.multiple) {
                            content = content.split(',');
                        } else {
                            content = [content];
                        }
                    }
                    for(var i in  content){
                        content[i] = content != null ? content[i]+"" : content;
                    }
                    for (var i in this.options) {
                        if (content.indexOf($(this.options[i]).attr('value')) >= 0 && (text == null || popupconfig.multiple)) {
                            if (popupconfig.multiple) {
                                $(this.options[i]).addClass('selected').find('input')[0].checked = true;
                                if (text === null) {
                                    text = '';
                                }
                                text += (text.length ? ',' : '') + ($(this.options[i]).find('text').html().replace(/^[\s]+|[\s]+$/g, ''));
                            } else {
                                $(this.options[i]).addClass('selected');
                                text = $(this.options[i]).find('text').html();
                            }
                            isDefined = true;
                            indexElement = i * 1;
                        } else {
                            $(this.options[i]).removeClass('selected');
                        }
                    }
                    if (!isDefined && content != '' && !popupconfig.multiple) {
                        content = '';
                    }
                    $this.value = popupconfig.multiple ? content : Array.isArray(content) ? content.join(',') : content;
                    text = text ? text : '';
                    element.trigger('change').val($this.value);
                    input.val(text).trigger('change');
                }
                else{
                    $this.value = content;
                    element.val($this.value).trigger('change');
                    input.val($this.value);
                }
                if(_old_value != content) {
                    __trigger('change');
                }
            });
            return this;
        }
        this.setOptions = function(content){
            if($this.type != 'select'){
                return this;
            }
            this.on('ready', function(){
                var r = document.createDocumentFragment();
                if(typeof content != 'object'){
                    $(r).html(content);
                }
                else{
                    var option;
                    for(var i in content){
                        option = document.createElement('option');
                        option.value = i;
                        option.innerHTML = content[i];
                        r.appendChild(option);
                    }
                }
                $this.options = [];
                box.find('kBoxBody kWrapper').html('');
                $(r).find('option').each(function(){
                    $this.options.push(this);
                });
                __setOptions();
                for(var i in $this.options){
                    box.find('kBoxBody kWrapper').append($this.options[i]);
                }
                $this.val('');
            });
            return this;
        }
        this.hasNext = function(){
            if(this.type != 'select'){
                return false;
            }
            return __seekable(true);
        }
        this.hasPrev = function(){
            if(this.type != 'select'){
                return false;
            }
            return __seekable(false);
        }
        this.prev = function(){
            if($this.type != 'select'){
                return;
            }
            var index = __index(-1);
            if(index > 0){
                index--;
                this.val($(this.options[index]).val());
            }
        }
        this.next = function(){
            if($this.type != 'select'){
                return;
            }
            var index = __index(-1);
            if(index < this.options.length - 1){
                index++;
                this.val($(this.options[index]).val());
            }
        }
        this.on = function(ev,callback){
            if(!Array.isArray(ev)){
                ev = ev.split(/ *, */);
            }
            for(var i in ev) {
                if (!(ev[i].toLowerCase() in events)) {
                    events[ev[i].toLowerCase()] = [];
                }
                if(ev[i].toLowerCase() == 'ready' && popupconfig.ready){
                    callback.apply($this,[]);
                }
                else {
                    events[ev[i].toLowerCase()].push(callback);
                }
            }
            return this;
        }
        this.off = function(ev){
            if(!Array.isArray(ev)){
                ev = ev.split(/ *, */);
            }
            for(var i in ev) {
                if (ev[i].toLowerCase() in events) {
                    events[ev[i].toLowerCase()] = [];
                }
            }
            return this;
        }
        this.checkAll = function(){
            if(!popupconfig.multiple){
                return this;
            }
            this.on('ready', function(){
                box.find('kActions input').trigger('click');
            });
            return this;
        }
        __init();
    };

    function initialize(kinput){
        elements.push({
            element: kinput,
            instance: new _KInput(kinput)
        });
    }
    $(function(){
       KInput.watch();
    });
    return {
        watch: function(parent){
            var $this = this,
                parent = parent == undefined ? null : $(parent),
                list = parent ? parent.find('kinput') : $('kinput');
            list.each(function(){
               if(!$this.isInitialized(this)){
                   initialize(this);
               }
            });
        },
        isInitialized: function(kinput){
            var r = false;
            for(var i in elements){
                if(elements[i].element == kinput){
                    r = true;
                    break;
                }
            }
            return r;
        },
        getInstanceOf: function(kinput){
          var r = null;
          if(typeof kinput == 'string'){
              kinput = document.querySelector(kinput);
          }
          if(kinput && 0 in kinput && kinput.length){
            kinput = kinput[0];
          }
            for(var i in elements){
                if(elements[i].element == kinput){
                    r = elements[i].instance;
                    break;
                }
            }
            return r == null ? new _KInput('') : r;
        },
        setOptions: function(kinput,content){
            if(typeof kinput != 'object' || kinput.tagName.toLowerCase() != 'kinput'){
                return this;
            }
            kinput = this.getInstanceOf(kinput);
            if(kinput != null){
                kinput.setOptions(content);
            }
        },
        setType: function(type){

        }
    }
})(Zepto || jQuery);
function $_(kinput){
    return KInput.getInstanceOf(kinput);
}