var PenDraw = function(){
    var elements = [],
        draws = [],
        index = 0,
        currentMedia = 0,
        medias = {},
        utils = {
            init : function(){
                if(!(index in draws)){
                    draws.push([]);
                }
            },
            isnumeric: function(e){
                return /^[0-9]+$/.test(e);
            },
            foreach: function(e, fn){
                if(typeof fn != 'function') return;
                for(var i in e){
                    if(utils.isnumeric(i)){
                        fn(e[i], i);
                    }
                }
            },
            valueOf: function(e,ref){
                if(/^(-?[0-9]+(?:\.[0-9]+)?)%$/.test(e)){
                    e = Math.floor(parseInt(RegExp.$1) / 100 * ref);
                }
                else{
                    e = parseInt(e);
                    e = isNaN(e) ? 0 : e;
                }
                return e;
            },
            drawList: function(el, design){
                var isCanvas = el.tagName.toLowerCase() == 'canvas',
                    r = isCanvas ? null : '',
                    width = 0, height = 0,
                    ctx = isCanvas ? el.getContext('2d') : null,
                    screen = window.innerWidth,
                    queries = Object.keys(medias),
                    query = 0, draw = null;
                queries.sort().reverse();
                for(var i in queries){
                    if(queries[i] * 1 < screen){
                        query = queries[i];
                        break;
                    }
                }
                draw = medias[query];
                width = el.clientWidth;
                height = el.clientHeight;
                if(isCanvas){
                    el.width = width;
                    el.height = height;
                    ctx.clearRect(0,0, width, height);
                }
                console.log('[Design]',design);
                if(design){
                    return this.apply(design,isCanvas ? undefined : ctx, width, height);
                }
                for(var i in draw){
                    r = this.apply(draw[i], isCanvas ? undefined : ctx, width, height);
                }
                return r;
            },
            apply: function(draw, ctx, width, height){
                var isCanvas = ctx != undefined,
                    data,
                    r = isCanvas ? null : "";
                for(var k in draw){
                    for(var j in draw[k]) {
                        data = draw[k][j];
                        switch (j) {
                            case "L":
                                if (isCanvas) {
                                    ctx.lineTo(
                                        utils.valueOf(data[0], width),
                                        utils.valueOf(data[1], height)
                                    );
                                } else {
                                    r += j + " " + utils.valueOf(data[0], width) + " " +
                                        utils.valueOf(data[1], height);
                                }
                                break;
                            case "M":
                                if (isCanvas) {
                                    ctx.moveTo(
                                        utils.valueOf(data[0], width),
                                        utils.valueOf(data[1], height)
                                    );
                                } else {
                                    r += j + " " + utils.valueOf(data[0], width) + " " +
                                        utils.valueOf(data[1], height);
                                }
                                break;
                            case "A":
                                if (isCanvas) {
                                    ctx.arc(
                                        utils.valueOf(data[0], width),
                                        utils.valueOf(data[1], height),
                                        utils.valueOf(data[2], width > height ? height : width),
                                        utils.valueOf(data[3], 360) * (Math.PI / 180),
                                        utils.valueOf(data[4], 360) * (Math.PI / 180)
                                    );
                                } else {
                                    r += j + " " + utils.valueOf(data[0], width) + " " +
                                        utils.valueOf(data[1], height) + " " +
                                        utils.valueOf(data[2], width > height ? height : width) + " " +
                                        utils.valueOf(data[3], 360) * (Math.PI / 180) + " " +
                                        utils.valueOf(data[4], 360) * (Math.PI / 180)
                                }
                                break;
                            case "C":
                                if (isCanvas) {
                                    ctx.bezierCurveTo(
                                        utils.valueOf(data[0], width),
                                        utils.valueOf(data[1], height),
                                        utils.valueOf(data[2], width),
                                        utils.valueOf(data[3], height),
                                        utils.valueOf(data[4], width),
                                        utils.valueOf(data[5], height)
                                    );
                                } else {
                                    r += j + " " + utils.valueOf(data[0], width) + " " +
                                        utils.valueOf(data[1], height) + " " +
                                        utils.valueOf(data[2], width) + " " +
                                        utils.valueOf(data[3], height) + " " +
                                        utils.valueOf(data[4], width) + " " +
                                        utils.valueOf(data[5], height)
                                }
                                break;
                            case "Q":
                                if (isCanvas) {
                                    ctx.quadraticBezier(
                                        utils.valueOf(data[0], width),
                                        utils.valueOf(data[1], height),
                                        utils.valueOf(data[2], width),
                                        utils.valueOf(data[3], height)
                                    );
                                } else {
                                    r += j + " " + utils.valueOf(data[0], width) + " " +
                                        utils.valueOf(data[1], height) + " " +
                                        utils.valueOf(data[2], width) + " " +
                                        utils.valueOf(data[3], height) + " "
                                }
                                break;
                        }
                    }
                }
                if(isCanvas){
                    ctx.fill();
                }
                return r;
            },
            setClipPath: function(element, design){
                var r = utils.drawList(element,design);
                if(r != null){
                    element.style.clipPath = 'path("'+r+'")';
                }
            },
            applyToAll: function(){
                var $this = this;
                utils.foreach(elements, $this.setClipPath);
                var observer = typeof ResizeObserver == 'function' ? ResizeObserver : null;
                for(var i in elements){
                    if(observer != null) {
                        new observer(function(){
                            $this.setClipPath(elements[i]);
                        }).observe(elements[i]);
                    }
                }
            }
        }

    this.lineTo = function(x,y){
        utils.init();
        draws[index].push({
            L: [x,y]
        });
        return this;
    }
    this.moveTo = function(x,y){
        utils.init();
        draws[index].push({
            M: [x,y]
        })
        return this;
    }

    this.arc = function(x,y,r,b,e){
        utils.init();
        draws[index].push({
            A: [x,y,r,b,e]
        })
        return this;
    }

    this.cubicBezier = function(cp1x,cp1y,cp2x,cp2y,x,y){
        utils.init();
        draws[index].push({
            C: [cp1x,cp1y,cp2x,cp2y,x,y]
        })
        return this;
    }

    this.quadraticBezier = function(cp1x,cp1y,x,y){
        utils.init();
        draws[index].push({
            Q: [cp1x,cp1y,x,y]
        })
        return this;
    }

    this.boardIs = function(domElement){
        var contains = 0;
        try{
            contains = document.contains(domElement);
        }catch(e){}
        if(contains == true || (contains == 0 && typeof domElement == 'string')) {
            domElement = contains ? [domElement] : document.querySelectorAll(domElement);
            if (domElement != null) {
                utils.foreach(domElement, function(el){
                    if(elements.indexOf(el) < 0){
                        elements.push(el);
                    }
                });
            }
        }
        return this;
    }

    this.save = function(){
        if(!(currentMedia in medias)){
            medias[currentMedia] = [];
        }
        if(!draws[index].length){
            return this;
        }
        medias[currentMedia].push(draws[index]);
        draws[index] = [];
        return this;
    }

    this.draw = function(){
        this.save();
        utils.init();
        utils.applyToAll();
        window.onresize = function(){
            utils.applyToAll();
        }
        index++;
    }

    this.media = function(size){
        this.save();
        if(!/^[0-9]+$/.test(size)){
            console.error('[ERR]', size, 'is not a integer');
            return this;
        }
        currentMedia = size * 1;
        return this;
    }

    this.appendDesign = function(design, screen){
        var screen = screen || currentMedia;
        if(!(screen in medias)){
            medias[screen] = [];
        }
        medias[screen].push(design);
        return this;
    }

    this.apply = function(design){
        console.log('[De]',design)
        for(var i in elements){
            utils.setClipPath(elements[i], design);
        }
        return this;
    }

    this.getDesign = function(screen){
        return medias[screen];
    }
}