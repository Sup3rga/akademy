var AkaContextMenu = function(element){
    var menu = $('<akacontextmenu>'),
        element = typeof element == 'string' ? $(element) : element;
    // $(element).attr('oncontextmenu','return false');
    $('body').append(menu);
    menu.css('display', 'none');
    this.show = function(){
        var pos = $(element).offset();
            pos.top += $(element)[0].scrollHeight;
        menu.css({
            display: 'block',
            left: pos.left,
            top: pos.top
        });
        console.log('[Pos]', pos);
    }
}