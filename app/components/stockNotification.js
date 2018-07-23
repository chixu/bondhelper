var con;
const stockUtils = require("../utils/stock");
const stockAPIPara = {
    chengjiao: 8,
    buy1count: 10,
    buy1price: 11,
    sell1count: 20,
    sell1price: 21,
}

var lastupdate = {};
var checkList = {
    // "112188": ["buy1price", "sell1count"],
    "136119": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1price",
        "op": "greater",
        "value": 1000
    }],
    // "136137": [{"name":"sell1price"}, {"name":"buy1price"}, {"name":"chengjiao"}],
    "122446": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1price",
        "op": "greater",
        "value": 1000
    }],
    "124999": [{
        "name": "sell1price"
    }, {
        "name": "buy1price"
    }, {
        "name": "chengjiao"
    }, {
        "name": "sell1price",
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
        "name": "sell1price",
        "op": "greater",
        "value": 1000
    }],
}

function init() {
    checkNews2();
}

function checkNews() {
    let promise = Promise.resolve();
    if (stockUtils.isTradingTime()) {
        for (let k in checkList) {
            promise = promise.then(() => getStockInfo(k));
        }
    }
    promise.then(() => new Promise(resolve => setTimeout(resolve, 5000)))
        .then(() => checkNews());
    return promise;
}

function checkNews2() {
    let promise = Promise.resolve();
    let ids = [];
    for (let k in checkList) {
        ids.push(k);
    }
    // if (true) {
    if (stockUtils.isTradingTime()) {
        promise = promise.then(() => getStockInfos(ids));
    }
    promise.then(() => new Promise(resolve => setTimeout(resolve, 2000)))
        .then(() => checkNews2());
    return promise;
}

function getStockInfo(stockNum) {
    let _resolve;
    $.ajax({
        //url: `http://q.10jqka.com.cn/gn/detail/order/desc/page/${page}/ajax/1/code/` + obj.id,
        url: `http://hq.sinajs.cn/list=` + stockUtils.getMarket(stockNum) + stockNum,
        context: document.body
    }).done(function (data) {
        let quote1 = data.indexOf('"');
        let quote2 = data.lastIndexOf('"');
        let result = data.substr(quote1 + 1, quote2 - quote1 - 1).split(',');
        let stockName = result[0];
        let trackingData = checkList[stockNum];
        if (lastupdate[stockNum] != undefined) {
            for (let i = 0; i < trackingData.length; i++) {
                let attrName = trackingData[i].name;
                let idx = stockAPIPara[attrName];
                let op = trackingData[i].op;
                let value = trackingData[i].value;
                if (op == "greater") {
                    if (lastupdate[stockNum][idx] - result[idx] >= value) {
                        str = stockNum + " " + stockName + " " + attrName + ": " + lastupdate[stockNum][idx] + " => " + result[idx];
                        showNotification(str);
                        console.log(str);
                    }
                } else if (lastupdate[stockNum][idx] != result[idx]) {
                    str = stockNum + " " + stockName + " " + attrName + ": " + lastupdate[stockNum][idx] + " => " + result[idx];
                    showNotification(str);
                    console.log(str);
                }
            }
        }
        lastupdate[stockNum] = result;
        _resolve();
    });
    return new Promise((resolve) => {
        _resolve = resolve
    })
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
        for (let i = 0; i < dataarr.length; i++) {
            let data = dataarr[i];
            let stockNum = stockNums[i];
            if (data.trim() != "") {
                // console.log(stockNum);
                let quote1 = data.indexOf('"');
                let quote2 = data.lastIndexOf('"');
                let result = data.substr(quote1 + 1, quote2 - quote1 - 1).split(',');
                let stockName = result[0];
                let trackingData = checkList[stockNum];
                if (lastupdate[stockNum] != undefined) {
                    for (let i = 0; i < trackingData.length; i++) {
                        let attrName = trackingData[i].name;
                        let idx = stockAPIPara[attrName];
                        let op = trackingData[i].op;
                        let value = trackingData[i].value;
                        if (op == "greater") {
                            if (lastupdate[stockNum][idx] - result[idx] >= value) {
                                str = stockNum + " " + stockName + " " + attrName + ": " + lastupdate[stockNum][idx] + " => " + result[idx];
                                showNotification(str);
                                console.log(str);
                            }
                        } else if (lastupdate[stockNum][idx] != result[idx]) {
                            str = stockNum + " " + stockName + " " + attrName + ": " + lastupdate[stockNum][idx] + " => " + result[idx];
                            showNotification(str);
                            console.log(str);
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

module.exports.init = init;