var con;
const stockUtils = require("../utils/stock");
const dateUtils = require("../utils/date");
const BOND_TABLE = require('../bondTable');
const sqlBuilder = require("../utils/sqlBuilder");
const stockAPIPara = {
    lastclose: 2,
    xianjia: 3,
    chengjiao: 8,
    buy1count: 10,
    buy1price: 11,
    sell1count: 20,
    sell1price: 21,
}

var lastupdate = {};
var checkListExtension = {}
var tick = 0;
var checkTimer = {
    "122927": 4
}
var checkList = {
    // "112188": ["buy1price", "sell1count"],
    "143443": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1count",
        "op": "greater",
        "value": 1000
    }],
    "136448": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1count",
        "op": "greater",
        "value": 1000
    }],
    "124815": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1count",
        "op": "greater",
        "value": 1000
    }],
    // "136137": [{"name":"sell1price"}, {"name":"buy1price"}, {"name":"chengjiao"}],
    // "122446": [{
    //     "name": "sell1price"
    // }, {
    //     "name": "buy1price"
    // }, {
    //     "name": "chengjiao"
    // }, {
    //     "name": "sell1count",
    //     "op": "greater",
    //     "value": 1000
    // }],
    "112316": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1count",
        "op": "greater",
        "value": 1000
    }],
    "136175": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1count",
        "op": "greater",
        "value": 1000
    }],
    //国美
    // "136139": [{
    //     "name": "sell1price"
    // }, {
    //     "name": "buy1price"
    // }, {
    //     "name": "chengjiao"
    // }, {
    //     "name": "sell1count",
    //     "op": "greater",
    //     "value": 1000
    // }],
    "136271": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1count",
        "op": "greater",
        "value": 1000
    }],
    "122125": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1count",
        "op": "greater",
        "value": 1000
    }],
    "136511": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1count",
        "op": "greater",
        "value": 1000
    }],
    "124135": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1count",
        "op": "greater",
        "value": 1000
    }],
    "122213": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1count",
        "op": "greater",
        "value": 1000
    }],
    "122138": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }],
    "136143": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }],
    "122105": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }],
    "127053": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1count",
        "op": "greater",
        "value": 1000
    }],
    "136417": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1count",
        "op": "greater",
        "value": 1000
    }],
    "122927": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1count",
        "op": "greater",
        "value": 1000
    }],
}

function init(_con) {
    con = _con;
    con.query(`select * from bond where deleted=0 and rank>=3 and lastupdated > '${dateUtils.getNowYYYYMMDD()}'`, function (err, r) {
        for (let i = 0; i < r.length; i++) {
            //console.log(r[i]);
            let id = r[i].code;
            if (!checkList[id]) {
                checkListExtension[id] = true;
                checkList[id] = [{
                    "name": "sell1price"
                }, {
                    "name": "chengjiao"
                }];
            }
        }
    });

    checkNews2();
}

// function checkNews() {
//     let promise = Promise.resolve();
//     if (stockUtils.isTradingTime()) {
//         for (let k in checkList) {
//             promise = promise.then(() => getStockInfo(k));
//         }
//     }
//     promise.then(() => new Promise(resolve => setTimeout(resolve, 5000)))
//         .then(() => checkNews());
//     return promise;
// }

function checkNews2() {
    let promise = Promise.resolve();
    let ids = [];
    for (let k in checkList) {
        if (checkTimer[k] == undefined || tick % checkTimer[k] == 0)
            ids.push(k);
    }
    tick++;
    // if (true) {
    if (stockUtils.isTradingTime()) {
        promise = promise.then(() => getStockInfos(ids));
    }
    promise.then(() => new Promise(resolve => setTimeout(resolve, 5000)))
        .then(() => checkNews2());
    return promise;
}

function getStockInfos(stockNums) {
    let _resolve;
    $.ajax({
        //url: `http://q.10jqka.com.cn/gn/detail/order/desc/page/${page}/ajax/1/code/` + obj.id,
        url: `http://hq.sinajs.cn/list=` + stockNums.map(v => stockUtils.getMarket(v) + v).join(),
        context: document.body
    }).done(function (datas) {
        let dataarr = datas.split(';');
        // console.log(dataarr);
        let timeStr = dateUtils.getNowYYYYMMDDHHmmSS();
        for (let i = 0; i < dataarr.length; i++) {
            let data = dataarr[i];
            let stockNum = stockNums[i];
            if (BOND_TABLE.getBondData(stockNum) == undefined) {
                // console.log(stockNum, 'is undefined');
                continue;
            }
            if (data.trim() != "") {
                // console.log(stockNum);
                let quote1 = data.indexOf('"');
                let quote2 = data.lastIndexOf('"');
                let resultStr = data.substr(quote1 + 1, quote2 - quote1 - 1);
                if (resultStr.trim() == "") continue;
                let result = resultStr.split(',');
                let stockName = result[0];
                let trackingData = checkList[stockNum];
                if (lastupdate[stockNum] != undefined) {
                    let lastColse = parseFloat(result[stockAPIPara.lastclose]);
                    let xianjia = parseFloat(result[stockAPIPara.xianjia]);

                    for (let i = 0; i < trackingData.length; i++) {
                        let attrName = trackingData[i].name;
                        let idx = stockAPIPara[attrName];
                        let op = trackingData[i].op;
                        let value = trackingData[i].value;
                        let lastValue = parseFloat(lastupdate[stockNum][idx]);
                        let curValue = parseFloat(result[idx]);

                        if (checkListExtension[stockNum] && attrName == 'sell1price') {
                            if (BOND_TABLE.getStockShouyi(stockNum, curValue) < 4) {
                                // console.log(stockNum, curValue, ' shouyi < 4');
                                continue;
                            }
                        }

                        // console.log(value, lastValue, curValue);
                        if (attrName.indexOf('count') > -1) {
                            let priceAttr = attrName.replace('count', 'price');
                            let priceIdx = stockAPIPara[priceAttr];
                            if (op == "greater") {
                                if (lastupdate[stockNum][priceIdx] == result[priceIdx] && curValue - lastValue >= value) {
                                    let p = document.createElement('p');
                                    p.className = 'w3-text-blue';
                                    str = stockNum + " " + stockName + " " + attrName + ": " + lastValue + " => " + curValue;
                                    p.innerText = str;
                                    showNotification(p);
                                    // console.log(str);
                                }
                            }
                        } else if (lastValue != curValue) {
                            let p = document.createElement('p');
                            p.style.margin = '1px';
                            // if (attrName.indexOf('price') > -1) {
                            //     p.className = curValue > lastValue ? 'w3-text-red' : 'w3-text-green';
                            // }
                            // str = stockNum + " " + stockName + " " + attrName + ": " + lastValue + " => " + curValue;


                            let str = '<a onclick="onStockNoteClick(\'' + stockNum + '\')">' + stockNum + "&nbsp" + stockName + "&nbsp </a>";
                            if (attrName.indexOf('buy') > -1)
                                str += `<span class="w3-text-red">${attrName}</span>`;
                            else if (attrName.indexOf('sell') > -1)
                                str += `<span class="w3-text-green">${attrName}</span>`;
                            else
                                str += attrName;
                            str += ':&nbsp';
                            let sqlData = {
                                code: stockNum,
                                action: attrName,
                                value1: lastValue,
                                value2: curValue,
                                time: timeStr,
                                name: stockName
                            };
                            let highlightThreshold = 0.01;
                            if (attrName.indexOf('price') > -1) {
                                let inc = (curValue - lastColse) / lastColse;
                                // console.log(result, lastColse, xianjia);
                                str += `<span class="w3-text-${getTextColorBy(curValue-lastValue)}">${lastValue + " => " + curValue}</span>`;
                                str += `<span class="w3-text-${getTextColorBy(inc)}">&nbsp${(inc*100).toFixed(2)}&nbsp</span>`;
                                let shouyi = BOND_TABLE.getStockShouyi(stockNum, curValue);
                                str += `(${shouyi})`;
                                sqlData.value3 = shouyi;
                                if ((attrName.indexOf('buy') > -1 && inc >= highlightThreshold) || (attrName.indexOf('sell') > -1 && inc <= -highlightThreshold)) {
                                    p.style.background = "yellow";
                                }
                            } else if (attrName.indexOf('chengjiao') > -1) {
                                let inc = (xianjia - lastColse) / lastColse;
                                str += lastValue + " => " + curValue;
                                str += `<span class="w3-text-${getTextColorBy(inc)}">&nbsp${xianjia}&nbsp${(inc*100).toFixed(2)}&nbsp</span>`;
                                let shouyi = BOND_TABLE.getStockShouyi(stockNum, xianjia);
                                str += `(${shouyi})`;
                                sqlData.value3 = shouyi;
                                if (Math.abs(inc) >= highlightThreshold) {
                                    p.style.background = "yellow";
                                }
                            } else
                                str += lastValue + " => " + curValue;
                            p.innerHTML = str;
                            con.query(sqlBuilder.insert('bondtradehistory', sqlData));
                            showNotification(p);
                            // console.log(str);
                        }
                    }
                }
                lastupdate[stockNum] = result;
            }
        }
        _resolve();
    });
    return new Promise((resolve) => {
        _resolve = resolve
    })
}

function getTextColorBy(n) {
    if (n == 0) return 'black';
    if (n > 0) return 'red';
    if (n < 0) return 'green';
}

function onStockNoteClick(code) {
    console.log(BOND_TABLE.printBondInfo(code));
    window.event.stopPropagation();
}
// function createNotification(attrName, gre) {
//     if (attrName.indexOf('price')) {

//     }
// }


module.exports.init = init;
module.exports.onStockNoteClick = onStockNoteClick;