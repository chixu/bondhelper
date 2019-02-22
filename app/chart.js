const stockUtils = require("./utils/stock");
const math = require("./utils/math");
const DATE = require("./utils/date");
var con;
var shHuigouData;
var szHuigouData;
var shHuigouPriceData;
var szHuigouPriceData;

// console.log(math.standardDeviation([0,0,0,0,0,0,0,0,0,0]));
// console.log(math.standardDeviation([727.7,1086.5,1091.0,1361.3,1490.5,1956.1]));

function renderHuigou(market) {
    if (market == undefined) market = 'sh';
    let chartData = {};
    let priceData = {};
    con.query(`select date, code, sum(amount) as sum, sum(amount*price)/sum(amount) as price from jiaogedan where code like 
        '${market=='sh'?'2040':'1318'}%' and commission>0 group by date, code order by date desc`,
        function (err, r) {
            console.log("chart...");
            for (let i = 0; i < r.length; i++) {
                let datestr = r[i].date;
                let date = new Date(datestr.substr(0, 4) + '-' + datestr.substr(4, 2) + '-' + datestr.substr(6, 2));
                let code = r[i].code;
                let sum = r[i].sum > 0 ? 0 : r[i].sum;
                let price = r[i].price;
                if (chartData[datestr] === undefined) {
                    chartData[datestr] = 0;
                    priceData[datestr] = 0;
                }
                let days = 1;
                if (code.substr(0, 3) == '204')
                    days = parseInt(code.substr(code.length - 1));
                else {
                    if (code == '131811')
                        days = 2;
                    else if (code == '131800')
                        days = 3;
                    else if (code == '131809')
                        days = 4;
                    else if (code == '131801')
                        days = 7;
                }
                for (let i = 0; i < days; i++) {
                    let nextstr = DATE.getDateString(date.addDays(i));
                    if (chartData[nextstr] !== undefined) {
                        chartData[nextstr] += sum;
                        priceData[nextstr] += sum * price;
                    }
                }
            }
            if (market == 'sh') {
                shHuigouData = chartData;
                shHuigouPriceData = priceData;
                renderHuigou('sz');
            } else {
                szHuigouData = chartData;
                szHuigouPriceData = priceData;
                let shData = [];
                let szData = [];
                let shPriceData = [];
                let szPriceData = [];
                let sumPriceData = [];
                let sumData = [];
                let chartDate = [];
                for (let k in shHuigouData) {
                    shPriceData.push(shHuigouPriceData[k] / shHuigouData[k]);
                    szPriceData.push(szHuigouPriceData[k] / szHuigouData[k]);
                    let avgPrice = (shHuigouPriceData[k] * 10 + szHuigouPriceData[k]) / (shHuigouData[k] * 10 + szHuigouData[k]);
                    sumPriceData.push(Math.round(avgPrice * 1000) / 1000);
                    shData.push(Math.abs(shHuigouData[k]) / 10);
                    szData.push(Math.abs(szHuigouData[k]) / 100);
                    sumData.push(Math.abs(shHuigouData[k] / 10 + szHuigouData[k] / 100));
                    chartDate.push(k);
                }
                Highcharts.chart('container2', {

                    title: {
                        text: '回购记录'
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle'
                    },

                    plotOptions: {
                        series: {
                            label: {
                                connectorAllowed: false
                            }
                        }
                    },

                    series: [{
                        name: "上海",
                        data: shData
                    }, {
                        name: "深圳",
                        data: szData
                    }, {
                        name: '总和',
                        data: sumData
                    }, {
                        //     yAxis: 1,
                        //     name: '上海',
                        //     data: shPriceData
                        // }, {
                        //     yAxis: 1,
                        //     name: '深圳',
                        //     data: szPriceData
                        // }, {
                        color: "#ff1111",
                        yAxis: 1,
                        name: '价格',
                        data: sumPriceData
                    }],

                    yAxis: [{ // Primary yAxis
                        labels: {
                            // format: '{value}°C',
                            style: {
                                color: Highcharts.getOptions().colors[2]
                            }
                        },
                        title: {
                            text: '回购数量',
                            style: {
                                color: Highcharts.getOptions().colors[2]
                            }
                        }

                    }, { // Secondary yAxis
                        // gridLineWidth: 0,
                        title: {
                            text: '回购价格',
                            style: {
                                color: Highcharts.getOptions().colors[0]
                            }
                        },
                        labels: {
                            // format: '{value} mm',
                            style: {
                                color: Highcharts.getOptions().colors[0]
                            }
                        },
                        opposite: true

                    }],

                    xAxis: {
                        categories: chartDate
                    },

                    responsive: {
                        rules: [{
                            condition: {
                                maxWidth: 500
                            },
                            chartOptions: {
                                legend: {
                                    layout: 'horizontal',
                                    align: 'center',
                                    verticalAlign: 'bottom'
                                }
                            }
                        }]
                    }

                });
            }
        });
}

function renderHistory(account){
    let chartData = {};
    account = account || 'all';
    let data_cangwei = accountInfo[account];
    for (let k in data_cangwei) {
        if (k.startsWith('1') && !k.startsWith('127') && !k.startsWith('131')) {
            chartData[k] = [];
            chartData[k].unshift(data_cangwei[k].count);
        }
    }
    let andStatement = account == 'all'?" true":` account = '${account}'`;
    let chartDate = [];
    con.query(`select distinct code from jiaogedan where code like '1%' and code not like '131%' and ${andStatement}`, function (err, r2) {
        for (let i = 0; i < r2.length; i++) {
            let code = r2[i].code;
            if (chartData[code] == undefined) {
                chartData[code] = [0];
            }
        }
        console.log(chartData);
        con.query(`select date, code, sum(amount) as "sum" from jiaogedan where ${andStatement} group by date, code order by date desc`, function (err, r) {
            console.log("chart...");
            for (let i = 0; i < r.length; i++) {
                //console.log(r[i]);
                let date = r[i].date;
                let code = r[i].code;
                let sum = r[i].sum;
                if (chartDate.indexOf(date) == -1) {
                    if (chartDate.length > 20)
                        break;
                    chartDate.unshift(date);
                    for (let k in chartData) {
                        chartData[k].unshift(chartData[k][0]);
                    }
                    // console.log(date);
                }
                if (chartData[code])
                    chartData[code][0] = chartData[code][0] - sum * (stockUtils.getMarket(code) == 'sh' ? 10 : 1);
            }
            let series = [];
            for (let k in chartData) {
                chartData[k].shift();
                let stdDev = math.standardDeviation(chartData[k]);
                //移除第一个数据 因为通过 x天计算的是x-1天的仓位
                // console.log(k, stdDev);
                if (stdDev > 100)
                    series.push({
                        name: k,
                        data: chartData[k]
                    });
            }

            Highcharts.chart('container', {

                title: {
                    text: '仓位记录'
                },
                // yAxis: {
                //     title: {
                //         text: 'Number of Employees'
                //     }
                // },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle'
                },

                plotOptions: {
                    series: {
                        label: {
                            connectorAllowed: false
                        }
                    }
                },

                series: series,

                xAxis: {
                    categories: chartDate
                },

                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions: {
                            legend: {
                                layout: 'horizontal',
                                align: 'center',
                                verticalAlign: 'bottom'
                            }
                        }
                    }]
                }

            });
            // console.log(chartDate);
            // console.log(chartData);
        });
    });
}

function init(_con) {
    con = _con
    renderHistory();
    renderHuigou();
}



// Highcharts.chart('container', {
//     chart: {
//         zoomType: 'xy'
//     },
//     title: {
//         text: 'Average Monthly Weather Data for Tokyo'
//     },
//     subtitle: {
//         text: 'Source: WorldClimate.com'
//     },
//     xAxis: [{
//         categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
//         ],
//         crosshair: true
//     }],
//     yAxis: [{ // Primary yAxis
//         labels: {
//             format: '{value}°C',
//             style: {
//                 color: Highcharts.getOptions().colors[2]
//             }
//         },
//         title: {
//             text: 'Temperature',
//             style: {
//                 color: Highcharts.getOptions().colors[2]
//             }
//         },
//         opposite: true

//     }, { // Secondary yAxis
//         gridLineWidth: 0,
//         title: {
//             text: 'Rainfall',
//             style: {
//                 color: Highcharts.getOptions().colors[0]
//             }
//         },
//         labels: {
//             format: '{value} mm',
//             style: {
//                 color: Highcharts.getOptions().colors[0]
//             }
//         }

//     }, { // Tertiary yAxis
//         gridLineWidth: 0,
//         title: {
//             text: 'Sea-Level Pressure',
//             style: {
//                 color: Highcharts.getOptions().colors[1]
//             }
//         },
//         labels: {
//             format: '{value} mb',
//             style: {
//                 color: Highcharts.getOptions().colors[1]
//             }
//         },
//         opposite: true
//     }],
//     tooltip: {
//         shared: true
//     },
//     legend: {
//         layout: 'vertical',
//         align: 'left',
//         x: 80,
//         verticalAlign: 'top',
//         y: 55,
//         floating: true,
//         backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
//     },
//     series: [{
//         name: 'Rainfall',
//         type: 'column',
//         yAxis: 1,
//         data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
//         tooltip: {
//             valueSuffix: ' mm'
//         }

//     }, {
//         name: 'Sea-Level Pressure',
//         type: 'spline',
//         yAxis: 2,
//         data: [1016, 1016, 1015.9, 1015.5, 1012.3, 1009.5, 1009.6, 1010.2, 1013.1, 1016.9, 1018.2, 1016.7],
//         marker: {
//             enabled: false
//         },
//         dashStyle: 'shortdot',
//         tooltip: {
//             valueSuffix: ' mb'
//         }

//     }, {
//         name: 'Temperature',
//         type: 'spline',
//         data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
//         tooltip: {
//             valueSuffix: ' °C'
//         }
//     }]
// });

module.exports.init = init;
module.exports.renderHistory = renderHistory;