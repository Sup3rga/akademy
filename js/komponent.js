var AkaKomponents = function(){
    $('body')
        .on('change', '.field .input', function(){
            var parent = $(this).parent();
            parent = parent.hasClass('combined') ? parent.parent() : parent;
            parent[$(this).val().length ? 'addClass': 'removeClass']('animated');
        })
        .on('gotfocus', '.field .input',function(){
            var parent = $(this).parent();
            // console.log('[focus]')
            parent = parent.hasClass('combined') ? parent.parent() : parent;
            parent.addClass('animated').removeClass('invalid');
        })
        .on('focus','.field .input', function(){
            var parent = $(this).parent();
            parent = parent.hasClass('combined') ? parent.parent() : parent;
            parent.addClass('animated').removeClass('invalid');
        }) //@component
        .on('gotblur', '.field .input', function(){
            if($(this).val().length == 0){
                var parent = $(this).parent();
                parent = parent.hasClass('combined') ? parent.parent() : parent;
                parent.removeClass('animated');
            }
        }) //@component
        .on('blur', '.field .input', function(){
            // console.log('[This]');
            if($(this).val().length == 0){
                var parent = $(this).parent();
                parent = parent.hasClass('combined') ? parent.parent() : parent;
                parent.removeClass('animated');
            }
        }) //@component
        .on('click', '.combined .password-toggler', function(){
            var cls = $(this).attr('alternate').split(","),
                $this = $(this),
                input = $(this).parent().find('.input');
            console.log('[Input]',input);
            if(KInput.isInitialized(input[0])){
                $_(input[0]).setType($this.hasClass(cls[0]) ? 'text' : 'password');
            }
            else {
                input.attr('type', $this.hasClass(cls[0]) ? 'text' : 'password');
            }
            $this.toggleClass(cls[0]).toggleClass(cls[1]);
        }) //@component
        .on('click', '.action .combined button', function(){
            if($(this).parent().hasClass('automatic')) return;
            var lastText = set($(this).parent().attr('last-choice'), "").split(',');
            $(this).parent().removeClass('invalid');
            if(lastText.length == 1 && lastText[0].length == 0){
                lastText = [];
            }
            $(this).parent().find('button').each(function(){
                if(!$(this).hasClass('off')){
                    lastText.push($(this).attr('data-value'));
                    return false;
                }
            });
            $(this).parent().find('button').addClass('off');
            $(this).removeClass('off');
            $(this).parent().val($(this).attr('data-value'));
            if($(this).attr('data-value') != lastText){
                $(this).parent().trigger('change').attr('last-choice', lastText.join(','));
            }
        }) //@component
        .on('rollback', '.action .combined', function(){
            var last = $(this).attr('last-choice').toString().split(),
                $this = $(this),
                set = false;
            if(last.length == 1 && last[0] == "undefined"){
                last = [];
            }
            $(this).find('button').each(function(){
                if($(this).attr('data-value') == last[last.length - 1] && !set){
                    $(this).removeClass('off');
                    last.pop();
                    $this.attr('last-choice', last.join(','));
                    set = true;
                }
                else{
                    $(this).addClass('off');
                }
            });
        }) //@component <-
        .on('click', '.register-n-list-switch', function(){
            var btn = $(this),
                found = false,
                parent = btn.parent();
            while(!parent.hasClass('register-n-list')){
                if(parent[0].tagName.toLowerCase() == 'body'){
                    found = false;
                    break;
                }
                found = true;
                parent = parent.parent();
            }

            if(found){
                parent.toggleClass('fugitif');
                btn.toggleClass('rotate');
                var t = setTimeout(function(){
                    clearTimeout(t);
                    // btn[!parent.hasClass('fugitif') ? 'addClass' : 'removeClass']('la-plus')
                    // [parent.hasClass('fugitif') ? 'addClass' : 'removeClass']('la-step-backward');
                },200);
            }
        }) //@component
        .on('click', '.action .toggler', function(){
            $(this).toggleClass('on').val($(this).hasClass('on')).trigger('change');
        }) //@Component
        .on('rollback', '.action .toggler', function(){
            $(this).toggleClass('on').val($(this).hasClass('on'))
        }) //@Component
        .on('input', '.input[mask]', function(){
            return;
            var mask = $(this).attr('mask'),
                val = $(this).val(),
                val_mask = '';
            /**
             *  mask : ###-###
             *  value : 2344355
             *  result: 234-435
             */
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
            $(this).val(val_mask);
        })
        .on('focus', '.input[match]', function(){
            var parent = $(this).parent();
            while(!parent.hasClass('field') && parent[0].tagName.toLowerCase() != 'body'){
                parent = parent.parent();
            }
            if(parent.hasClass('field')){
                parent.removeClass('invalid')
            }
        })
        .on('blur', '.input[match]', function(){
            var reg = $(this).attr('match'),
                parent = $(this).parent();
            if(!new RegExp(reg,"i").test($(this).val())){
                $(this).val('');
                $(this).trigger('change');
                while(!parent.hasClass('field') && parent[0].tagName.toLowerCase() != 'body'){
                    parent = parent.parent();
                }
                if(parent.hasClass('field')){
                    parent.addClass('invalid')
                }
            }
        })
}