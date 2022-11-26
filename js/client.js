var inspect = {
    maxHeight: 300,
    "/" : function(){
        var draw = new PenDraw(),
            stats = new PenDraw(),
            oval = new PenDraw();
        draw.boardIs('.caroussel-simple')
            .moveTo(0,0)
            .lineTo('100%', 0)
            .lineTo('100%', '80%')
            .quadraticBezier('65%', '75%', '20%', '100%')
            .lineTo(0, '97%')
            .draw();
        stats.boardIs('.stats .icon')
            .moveTo('15%', '10%')
            .cubicBezier('30%', 0, '80%', 10, '80%', '60%')
            .quadraticBezier('80%', '100%', '45%', '79%')
            .cubicBezier('30%', '70%', '10%', '80%', '10%', '70%')
            .cubicBezier('10%', '80%', -10, '30%', '15%', '10%')
            .draw();
        oval.boardIs('.oval')
            .moveTo('26%', '20%')
            .quadraticBezier('4%', '70%', 2,'98%')
            .quadraticBezier('4%', '95%', '90%', '97%')
            .quadraticBezier('100%', '97%', '90%', '80%')
            .quadraticBezier('70%', '45%', '80%', '17%')
            .quadraticBezier('80%', '7%', '45%', '37%')
            .quadraticBezier('64%', '45%', '50%', '37%')
            // .cubicBezier('20%', '104%', '80%', '100%', '80%', '80%')
            // .cubicBezier('85%', '40%', '45%', '30%', '45%', '25%')
            // .quadraticBezier('40%', '15%', '25%', '30%')
            // .quadraticBezier('6%', '50%', '16%', '80%')
            .draw();
    }
};
$(function(){
    var root = "/akademy",
        main = $('main'),
        header, menu,
        draw = new PenDraw(),
        res = window.location.pathname.replace(root, "");

    Fetch.get('./public', {
        pub: res,
    }).then(function (r) {
        main.html(ejs.render(r.template, r.data));
        header = $('header');
        menu = $('menu');
        if(res in inspect) {
            inspect[res]();
            draw.boardIs('menu');
            draw.moveTo(0,0)
                .lineTo('100%', 0)
                .lineTo('100%', '100%')
                .quadraticBezier('98%', '95%','95%','95%')
                .lineTo('5%','95%')
                .quadraticBezier(0, '95%',0,'100%')
                .draw();
        }
    });
    $('body').on('click', '.menu-action', function(){
        $(this).toggleClass('close')
        menu.toggleClass('open');
        header[menu.hasClass('open') || $('main')[0].scrollTop >= 300 ? 'addClass' : 'removeClass']('upon');
        header[menu.hasClass('open') || !header.hasClass('upon') ? 'addClass' : 'removeClass']('shadowless');
    })
    $('main').on('scroll', function(e){
        var scroll = this.scrollTop;
        if(scroll >= 60){
            header.addClass('animated');
        }
        if(scroll < 5){
            if(!menu.hasClass('open')){
                header.removeClass('upon');
            }
            header.removeClass('animated');
        }
        if(scroll >= inspect.maxHeight){
            header.addClass('upon');
        }
    })
});