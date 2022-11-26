var AkaGlobalEvents = function(){
    Loader.animate(".panel-load");
    $('body')
        .off('click')
        .off('change')
        .off('input')
        .on('click', '#login', function(){
            var btn = $(this);
            if(btn.attr('locked') != undefined){
                return;
            }
            var data = Form.serialize($('#logger'));
            if(Form.isSubmitable(data)){
                AlertBox.set('#logger .alert-box')
                    .text("Requête en cours...")
                    .icon("ion-load-d")
                    .type("")
                    .show();
                btn.attr('locked', true);
                User.signin(data)
                    .then(function(r){
                        btn.removeAttr('locked');
                        AlertBox.text(r.message)
                            .type(r.code == 1 ? "success" : "warn")
                            .icon(r.code == 1 ? "ion-android-done" : "ion-android-warning")
                    }).catch(function(e){
                    btn.removeAttr('locked');
                    AlertBox.text(e)
                        .icon("ion-alert")
                        .type("fail")
                });
            }
            else{
                AlertBox.set('#logger .alert-box')
                    .type('fail')
                    .text("Veuillez tout remplir correctement !")
                    .icon("ion-compose")
                    .show();
            }
        })
        .on('click', 'sidemenu .item', function (){
            Modules.updateSideMenuUi($(this));
        })
        .on('click', '#user-panel-toggler', function(){
            if($(this).hasClass('ion-chevron-down')){
                $(this).removeClass('ion-chevron-down').addClass('ion-chevron-up');
                $('.user-panel').show();
            }
            else{
                $(this).addClass('ion-chevron-down').removeClass('ion-chevron-up');
                $('.user-panel').hide();
            }
        })
        .on('click', '#logout', function(){
            $('#user-panel-toggler').trigger('click');
            DialogBox.setMessage("<icon class='ion-alert rounded yellow'></icon>Vous allez vous déconnecter")
                .setType('YESNO')
                .show()
                .onClose(function(e,r){
                    if(r){
                        User.signout().catch(function(e){
                            AlertBox.text(e)
                                .icon("ion-alert")
                                .type("fail")
                        });
                    }
                });
        })
        .on('click', 'sidemenu .company-logo', function(){
            menuDraw.apply(menuDraw.getDesign(768)[0]);
            $('sidemenu,view').toggleClass('minimal');
        })
        .on('click', '.form-popup-caller', function(){
            var title = $(this).attr('title'),
                template = $(this).attr('reach');
            FormPopup.title(title ? title : 'show')
            if(template){
                FormPopup.html($('[template="'+template+'"]').html());
            }
            FormPopup.show();
            KInput.watch();
        })
        .on('input', 'appbar .search-bar', function(){
            if(typeof RouteUI.utils.view.filter == 'function'){
                RouteUI.utils.view.filter();
            }
        })
        .on('click', '.list-item .summary', function(){
            var autofold = $(this).hasClass('autofold'),
                open = $(this).parent().hasClass('open');
            $(this).removeClass('autofold');
            $(this).parent().parent().find('.list-item.open.autofold').removeClass('open');
            $(this).parent()[open ? 'removeClass' : 'addClass']('open');
            if(autofold){
                $(this).addClass('autofold');
            }
        })
        .on('click', '.inline-tab .onglet, tabs-wrapper tab', function(){
            $(this).parent().css('width', $(this).parent()[0].scrollWidth+'px');
            var index = parseInt($(this).attr('data-index')),
                total = $(this).parent().find('.onglet,tab').length,
                progress = (index > 0 ? index + 1 : index) / total,
                width = {
                    parent: $(this).parent().width(),
                    el: $(this).width(),
                    wrapper: $(this).parent().parent().width()
                },
                moving = 0;
            if(width.parent > width.wrapper){
                moving = -(width.parent - width.wrapper) * progress;
            }
            $(this).parent().css({
                transitionDuration: '.2s',
                transform: 'translate3d('+moving+'px,0,0)'
            });
        })
        .on('click', '.layer-form-on', function(){
            var name = $(this).attr('data-layer-name'),t,html,
                dimension = $(this).attr('data-layer-size'),
                activesrc = $(this).attr("layerform-src") != undefined;
            if(name in RouteUI.layerFormObjects){
                t = RouteUI.layerFormObjects[name];
            }
            else {
                t = new LayerForm($(this).attr('data-layer-title'));
                html = activesrc ? RouteUI.utils.render($(this).attr('data-layer-target'), Modules.defaultOptions()) :
                    $($(this).attr('data-layer-target'));
                if(dimension){
                    t.setDimensions(dimension.split(/ ?, ?/));
                }
                RouteUI.layerFormObjects[name] = t.html(html);
                t.on('mountform', function(){
                    KInput.watch(this.getForm());
                });
            }
            t.show();
        })
        .on('click', '.input-icon icon', function(){
            $(this).parent().find('input').click();
        })
        .on('change', '.academic-year', function(){
            var val = $_(this).val(),
                options = {
                    sections: {},
                    sessions: {}
                },
                sections,academic;
            if(!Array.isArray(val)){
                val = [val];
            }
            for(var i in val){
                sections = ruidata.getAcademicSections(val[i]),
                academic = ruidata.getAcademicYear(val[i]);
                options.sections = extend(options.sections, ruiv.createOptions(sections, ['id', 'nom']));
                options.sessions = ruiv.createOptions(academic.sessions, ['id', 'number'], RouteUI.str("academic.session.nomenclature")+' ');
            }
            $_($(this).parent().parent().find('.academic-section')).setOptions(options.sections);
            $_($(this).parent().parent().find('.academic-session')).setOptions(options.sessions);
        })
        .on('change', '.academic-section', function(){
            var val = $_(this).val(),
                options = {}, section,gradeSelect,grades;
            if(!Array.isArray(val)){
                val = [val];
            }
            for(var k in val) {
                section = RouteUI.utils.data.getAcademicSection(val[k]);
                gradeSelect = $(this).parent().parent().find('.academic-grade');
                if(section && gradeSelect.length){
                    grades = copy(section.grades);
                    if(gradeSelect.hasClass('promotion')){
                        for(var i in grades){
                            if(!ruidata.getPromotions(grades[i].id).length){
                                delete grades[i];
                            }
                        }
                    }
                    options = extend(options,RouteUI.utils.view.createOptions(grades, ['id', 'notation']));
                }
            }
            $_(gradeSelect[0]).setOptions(options);
        })
        .on('click', '.back-to-prev', function(){
            RouteUI.url.back();
        })
        .on('click', '[trigger]', function(){
            $($(this).attr('trigger')).trigger('click');
        })
        .on('click', '[alternate]', function(){
            if(typeof RouteUI == 'undefined'){
                return;
            }
            var val = $(this).attr('alternate'),
                target = $(this).attr('target'),
                remove = $(this).attr('self') != undefined && $(this).hasClass('active');
            $('[alternate="'+val+'"]').removeClass('active');
            if(!remove){
                $(this).addClass('active');
            }
            if(typeof RouteUI.utils.view.filter == 'function'){
                RouteUI.utils.view.filter();
            }
            if(val == 'autofold' && target){
                $(target).find('.list-item')[!remove ? 'addClass' : 'removeClass']('autofold');
                if(!remove){
                    $(target).find('.list-item').removeClass('open');
                }
            }
        })
        .on('click', '[href]',function(){
            if(this.tagName != 'A'){
                location = '#'+$(this).attr('href');
            }
        })
        .on('click', '.button-bubble', function(){
            console.log('[Click]')
            $(this).find('.bubble-box').toggleClass('ui-hide');
        })
    $('.field .input').trigger('change');
    AkaKomponents();
}
$(AkaGlobalEvents);