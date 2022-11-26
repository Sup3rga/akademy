if(inspect == undefined){
    var inspect = {};
}
inspect.maxHeight = 70;
inspect["/apply"] = function(){
    KInput.watch('.subscription-form');
    var subscriptionForm = new Card('.subscription-form'),
        subscriptionData = [],
        requiredData = [];
    // KInput.watch();
    AkaKomponents();
    var k = 0;
    function stepTo(next){
        var to = ($('.subscription-wrapper .step').eq(next).position().left + $('.subscription-wrapper .step').eq(next).width() / 2) / $('.subscription-wrapper .line').width();
        var k = 0;
        $('.subscription-wrapper .line.steppable').css({
            width: (to * 100)+'%',
            transitionDuration : '.4s'
        });
        subscriptionForm.switchTo(next);
        $('.subscription-wrapper .step').each(function(){
            $(this)[k <= subscriptionForm.index ? 'addClass' : 'removeClass']('active');
            k++;
        });
    }
    stepTo(0);
    $('card').each(function(){
        subscriptionData[k] = {};
        $(this).find('[name]').each(function(){
            subscriptionData[k][$(this).attr('name')] = $(this).val();
            if($(this).attr('required') != undefined){
                requiredData.push($(this).attr('name'));
            }
        });
        k++;
    });
    console.log('[Subscription]', requiredData, subscriptionData);
    $('body')
    .on('change', '[ref="country"]', function(e){
        var islocal = $(this).val() == 'Haiti',
            options = '',
            parent = $(this).parent().parent().parent();
        var department = $_(parent.find('[ref="department"]')[0]),
            town = $_(parent.find('[ref="town"]')[0]);
        department.setType(islocal ? 'select' : 'text');
        town.setType(islocal ? 'select' : 'text');
        if(!islocal){
            department.val('');
            town.val('');
        }
        if(islocal){
            for(var i in Modules.data.local){
                options += '<option value="'+i+'">'+i+'</option>';
            }
            department.setOptions(options);
        }
    })
    // .on('change', '[ref="country"]', function(e){
    //     var islocal = $(this).val() == 'Haiti',
    //         options = '',
    //         parent = $(this).parent().parent().parent();
    //     var department = $_(parent.find('[ref="department"]')[0]),
    //         town = $_(parent.find('[ref="town"]')[0]);
    //     department.setType(islocal ? 'select' : 'text');
    //     town.setType(islocal ? 'select' : 'text');
    //     if(!islocal){
    //         department.val('');
    //         town.val('');
    //     }
    //     if(islocal){
    //         for(var i in Modules.data.local){
    //             options += '<option value="'+i+'">'+i+'</option>';
    //         }
    //         department.setOptions(options);
    //     }
    // })
    .on('change', '[ref="department"]', function(){
        var options = '',
            parent = $(this).parent().parent().parent(),
            dep = $(this).val(),
            islocal = parent.find('[ref="country"]').val() == 'Haiti';
        if(!islocal){
            return;
        }
        var town = $_(parent.find('[ref="town"]')[0]),
            school = $_(parent.find('[ref="school"]')[0]);
        town.setType(islocal ? 'select' : 'text');
        school.setType(islocal ? 'select' : 'text');
        if(town.length) {
            for (var i in Modules.data.local[dep]) {
                options += '<option value="' + i + '">' + i + '</option>';
            }
            town.setOptions(options);
        }
        if(school.length) {
            options = '';
            for (var i in Modules.data.schools[dep]) {
                options += '<option value="' + i + '">' + i + '</option>';
            }
            school.setOptions(options);
        }
    })
    .on('click', '.card-switch', function(){
        if($(this).hasClass('disabled')){
            return false;
        }
        stepTo($(this).attr('next') * 1);
    })
    .on('change', '[name]', function(){
        if(!($(this).attr('name') in subscriptionData[subscriptionForm.index])){
            return;
        }
        subscriptionData[subscriptionForm.index][$(this).attr('name')] = $(this).val();
        var submit = Form.isSubmitable(subscriptionData[subscriptionForm.index], requiredData);
        // console.log('[Submitable]', subscriptionData[subscriptionForm.index]);
        $('.subscription-form .card[data-index="'+subscriptionForm.index+'"] .validation')[submit ? 'removeClass' : 'addClass']('disabled');
    })
    .on('change', '[name="sub_pseudo"]', function(){
        var val = $(this).val(),
            div = $(this).parent().find('div');
        div.html('');
        if(val.length) {
            div.html('<i class="ion-load-c fast-animate-spin" style="display: inline-block;"></i>');
            Fetch.post('public',{
                sub_chk_pseudo: val
            }).then(function(e){
                if(e.message){
                    div.html('<i class="ion-close" style="display: inline-block; color: red"></i>');
                }else{
                    div.html('<i class="ion-checkmark" style="display: inline-block; color: green;"></i>');
                }
            }).catch(function(e){
                div.html('');
            })
        }
    })
    .on('click', '#finish',function(){
        var data = {};
        for(var i in subscriptionData){
            data = extend(data, subscriptionData[i]);
        }
        if(Form.isSubmitable(data,requiredData)){
            console.log('[Clicked]', data);
            Fetch.post('./public', data).then(function(e){
                console.log('[Res]',e);
            }).catch(function(msg){
                console.error(msg);
            })
        }
    })
}