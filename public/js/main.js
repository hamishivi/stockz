var chart;
var names = []
var seriesOptions = [];
var socket = io();

$(document).ready(function () {
    $.get('/curlist', function(data) {
        names = data;
        finishSetup();
    });
    function finishSetup() {
        var seriesCounter = 0;
    if (names.length > 0) {
        $.each(names, function (i, name) {
            getSeries(name, function(data) {
                chart.addSeries(data, true, true);
                chart.xAxis[0].setExtremes();
            });
                // As we're loading the data asynchronously, we don't know what order it will arrive. So
                // we keep a counter and create the chart when all the data is loaded.
                seriesCounter += 1;
                if (seriesCounter === names.length) {
                    createChart();
                    chart.xAxis[0].setExtremes();
                }
        })
    } else {
        createChart();
    }
    $(document).on('click', '.delete', function() {
        var name = $(this).attr('id');
        $.get('/removestock/' + name);
        socket.emit('delete', name);
    });
    }
});

function delet(name) {
    $("#" + name).remove();
    for (var i = 0; i < chart.series.length; i++) {
        if (name == chart.series[i].name.toLowerCase()) {
            chart.series[i].remove();
        }
    }
}

$('#add').off().on('click', function() {
    event.stopPropagation();
    $("#error").text("");
    var ticker = $("#stock").val().toUpperCase();
    validTicker(ticker, function(valid) {
        if (valid) {
            $("#stock").val("");
            socket.emit('ticker', ticker);
            $.get('/addstock/' + ticker);
        } else {
           
        }
    });
});

function getSeries(ticker, callback) {
    var curDate = new Date().toJSON().slice(0,10);
    var start_date ='2016-01-01';
    var end_date = curDate;
    var url = "https://www.quandl.com/api/v3/datasets/WIKI/"+ticker+".json?column_index=4&end_date="+end_date+"&collapse=daily&api_key=xZPeXmNG_WhuR9F95m8S";
    $.get(url, function(data) {
        var tickerdata = [];
        $.each(data.dataset.data, function(i, element) {
            var millisecondDate = Date.parse(element[0]);
            tickerdata[i] = [millisecondDate, element[1]];
        });
        tickerdata.sort(function(a, b) {
            return a[0] - b[0];
        })
        var series = {
            name: ticker,
            data: tickerdata
        }
        addCard(data.dataset.name, ticker);
        callback(series);
    });
}


function validTicker(ticker, callback) {
    if ($("#"+ticker).length) {
        callback(false);
        return;
    }
    var url = "https://www.quandl.com/api/v3/datasets/WIKI/"+ticker+".json?column_index=4&collapse=daily&api_key=xZPeXmNG_WhuR9F95m8S";
    $.get(url, function(data) {
        callback(true);
    }).fail(function(e) {
         $("#error").text("Could not find that ticker symbol");
        callback(false);
    });
}

function createChart() {
        chart = Highcharts.stockChart('container', {
            rangeSelector: {
                selected: 1
            },
            title: {
                text: 'Stockz'
            },
            yAxis: {
                labels: {
                    formatter: function () {
                        return (this.value > 0 ? ' + ' : '') + this.value + '%';
                    }
                },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }]
            },
            plotOptions: {
                series: {
                    compare: 'percent',
                    showInNavigator: true
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                valueDecimals: 2,
                split: true
            },
            series: seriesOptions
        });
    }

// Yeah this is gross. Using React would make this much better.
function addCard(name, ticker) {
    var string = '<div class="col s12 m4 l3" id="'+ticker.toLowerCase()+'">' +
                '<div class="card blue-grey darken-1">' +
                    '<div class="card-content white-text">' +
                      ' <span class="card-title">'+ticker.toUpperCase()+'</span>' +
                      '<p>' + name + '</p>' +
                      '<span class="right"><i class="material-icons red-text delete" id="'+ticker.toLowerCase()+'">delete</i></span><br>' +
                    '</div>'+
                '</div>' +
            '</div>'
    $("#stockContainer").prepend(string);
}

socket.on('ticker', function(ticker){
        getSeries(ticker, function(data) {
                chart.addSeries(data, true, true);
                chart.xAxis[0].setExtremes();
        });
});

socket.on('delete', function(ticker){
        delet(ticker);
});