$(function() {
    //Draw sidemenu
    var draw = new PenDraw();
    draw.boardIs('sidemenu')
        .moveTo(0,0)
        .lineTo('85%', 0)
        .cubicBezier('100%', -10, '100%', 70, '85%', 70)
        .quadraticBezier('80%', 70, '80%', 100)
        .lineTo('80%','100%')
        .lineTo(0,'100%')
        .media(560)
        .moveTo(0,0)
        .lineTo('90%', 0)
        .cubicBezier('100%', -10, '100%', 65, '90%', 65)
        .quadraticBezier('87%', 65, '87%', 100)
        .lineTo('87%','100%')
        .lineTo(0,'100%')
        .media(607)
        .moveTo(0,0)
        .lineTo('90%', 0)
        .cubicBezier('100%', -10, '100%', 65, '90%', 65)
        .quadraticBezier('88%', 65, '88%', 100)
        .lineTo('88%','100%')
        .lineTo(0,'100%')
        .media(768)
        .moveTo(0,0)
        .lineTo('90%', 0)
        .quadraticBezier('75%', '20%', '90%', '40%')
        .quadraticBezier('102%', '60%', '87%','77%')
        .quadraticBezier('73%','94%', '90%', '100%')
        .lineTo(0,'100%')
        .draw();
    window.menuDraw = draw;
   localforage.getItem("akademy-data")
    .then(function(userData){
       if (userData == null) {
          DialogBox.setMessage("<icon class='ion-alert rounded red'></icon> Session invalide ! Veuillez vous connecter à nouveau.")
              .show().onClose(function () {
             window.location = "./";
          });
          return;
       }
       Modules.data = JSON.parse(userData);
        // console.log('[User]',Modules.data);

       Fetch.get('./signin', RouteUI.utils.completeRequestData({
          akauid: Modules.data.id,
          akatoken: Modules.data.credentials
       })).then(function (r) {
          if (r.code == 1) {
             Modules
                 // .setSideMenu(Modules.data.privileges)
                 .setAppBar(Modules.data);
             $('.akademy').removeClass('template');
             Loader.dom = $('.waiter-load');
             History.init()//.reach();
          } else {
             localforage.removeItem("akademy-data");
             DialogBox.setMessage("<icon class='ion-alert rounded yellow'></icon> " + r.message)
                 .show().onClose(function () {
                window.location = Modules.data.token;
             });
          }
       }).catch(function (e) {
           console.log('[Error]',e);
          localStorage.removeItem("akademy-data");
          DialogBox.setMessage("<icon class='ion-alert rounded red'></icon> Une erreur est survénue ! Veuillez contacter le service webmastering.")
          .show().onClose(function(){
             window.location = Modules.data.token;
          });
       });
    })
});