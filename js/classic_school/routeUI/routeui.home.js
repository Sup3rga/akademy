
RouteUI.url.enter('/',function(end,url){
    this.load(url.path).then(function(){
        RouteUI.url.setState(url.path);
        end();
    });
});
RouteUI["/"] = function(){
    console.log('[Modules]',Modules.data);
    var canvasContext = {
            timeline : $('#timeline')[0].getContext('2d'),
            promotion : $('#promotion')[0].getContext('2d')
        },
        charts = {},
        data = Modules.data.dashboard,
        datasets = [], colors = {
            background : [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)'
            ],
            border: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
            ]
        };
    Modules.setSearchVisible(false);
    var calendar = new Calendar();
    calendar.setMonthNames(RouteUI.str('calendar.months')).setWeekNames(RouteUI.str("calendar.weeks")).setLimitDom('#calendar')
        .allow('selection', false)
        .create();
    //timeline
    var tmp, k = 0, names = RouteUI.str('dashboard.stats.head.school',true),
        index = [];
    for(var i in data.etudiantTimeLine){
        index.push(i);
    }
    index.sort();
    datasets.push({labels: [], datasets: []});
    for(var i in index){
        i = index[i];
        datasets[0].labels.push(i);
        tmp = [data.etudiantTimeLine[i], data.profTimeLine[i], data.courseTimeLine[i], data.filiereTimeLine[i]];
        if(!datasets[0].datasets.length) {
            for(var k = 0 ; k < tmp.length; k++){
                datasets[0].datasets.push({
                    label: names[k],
                    data: [tmp[k]],
                    borderColor: colors.border[k % 5],
                    backgroundColor: colors.background[(k + 1) % 5],
                    tension: 0.8,
                    borderWidth: 1,
                    fill: true
                });
            }
        }
        else{
            for(var k = 0 ; k < tmp.length; k++){
                datasets[0].datasets[k].data.push(tmp[k])
            }
        }
    }

    charts.timeline = new Chart(canvasContext.timeline, {
        type: 'line',
        data: datasets[0],
        options: {
            indexAxis: 'x',
            scales: {
                x: {
                    beginAtZero: false
                }
            }
        }
    });
    var percent = Math.round(data.lastYearPromotedStudents / (data.lastYearPromotedStudents + data.lastYearStackStudents) * 10000) / 100;
    percent = isNaN(percent) ? 0 : percent;
    charts.promotion = new Chart(canvasContext.promotion, {
        type: 'doughnut',
        data:{
            labels: RouteUI.str('dashboard.stats.promotion.head',true),
            datasets: [{
                data: [percent,100-percent],
                backgroundColor: [colors.border[3], colors.border[0]],
                hoverOffset: 8,
                cutout: '60%'
            }]
        }
    });
}