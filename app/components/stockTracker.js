var con;
const stockUtils = require("../utils/stock");
const sinaUtils = require("../utils/sina");
const BOND_TABLE = require('../bondTable');

const stockAPIPara = {
    chengjiao: 8,
    buy1count: 10,
    buy1price: 11,
    sell1count: 20,
    sell1price: 21,
}
let interval;
let bondInfoPanel = document.getElementById('bondInfo');
var lastupdate = {};
var ids = [];
var checks = {}

function update(force) {
    if (!force && !stockUtils.isTradingTime())
        return;
    // console.log(ids);
    sinaUtils.getStockInfos(ids).then(results => {
        // console.log(results);
        bondInfoPanel.innerHTML = "";
        for (let id in results) {
            let res = results[id];
            let check = checks[id];
            if (check) {
                for (let i = 0; i < check.length; i++) {
                    let checkitem = check[i];
                    let prop = checkitem.prop;
                    // let name = checkitem.name;
                    let curvalue = parseFloat(res[prop]);
                    // if (!validateChange(id, prop, curvalue))
                    //     continue;
                    updateChange(id, prop, curvalue);
                    let op = checkitem.op;
                    let show = checkitem.notification;
                    let bondname = BOND_TABLE.getBondName(id);
                    let nianxian = BOND_TABLE.getBondData(id).nianxian;
                    let amount;
                    if (prop.indexOf('price') > -1) {
                        amount = parseFloat(res[prop.replace('price', 'count')]);
                    }

                    if (op == 'greater' && curvalue >= checkitem.value) {
                        let shouyi = BOND_TABLE.getStockShouyi(id, curvalue);
                        console.log(id, bondname, curvalue, ' > ', checkitem.value, amount, shouyi);
                        bondInfoPanel.innerHTML += `${bondname}(${id})&nbsp${checkitem.value}->
                        <span class='w3-text-red'>${curvalue}</span>&nbsp${amount}&nbsp<b>${shouyi}</b><br/>`;
                    } else if (op == 'smaller' && curvalue <= checkitem.value) {
                        if (curvalue > 0) {
                            let shouyi = BOND_TABLE.getStockShouyi(id, curvalue);
                            // console.log(id, bondname, curvalue, ' < ', checkitem.value, amount, shouyi);
                            if (shouyi > 4 && show) {
                                bondInfoPanel.innerHTML += `${bondname}(${id})&nbsp(${nianxian})->
                            <span class='w3-text-green'>${curvalue}</span>&nbsp${amount}&nbsp<b>${shouyi}</b><br/>`;
                            } else {
                                if(prop == 'sell1price')
                                    BOND_TABLE.updateTableRow(id, 'sell1', shouyi);
                            }
                        }
                    } else {

                    }
                }
            }
        }
    });
}

function on(_ids, _checks) {
    this.off();
    for (let i = 0; i < _ids.length; i++) {
        let id = _ids[i];
        if (ids.indexOf(id) == -1) {
            ids.push(id);
            checks[id] = _checks[id];
        }
    }
    console.log(ids);
    update(true);
    interval = setInterval(update, 5000);
}

function validateChange(id, prop, curvalue) {
    if (lastupdate[id] == undefined)
        return true;
    if (lastupdate[id][prop] != curvalue)
        return true;
    return false;
}

function updateChange(id, prop, curvalue) {
    if (lastupdate[id]) {

    } else {
        lastupdate[id] = {};
    }
    lastupdate[prop] = curvalue;
}

function off() {
    clearInterval(interval);
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


module.exports = {
    on: on,
    off: off,
};