var con;
const stockUtils = require("../utils/stock");
const sinaUtils = require("../utils/sina");
const dateUtils = require("../utils/date");
const BOND_TABLE = require('../bondTable');

let interval;
let panel = document.getElementById('bondHighlight');
// var lastupdate = {};
// var ids = [];
// var checks = {}

function update(force) {
    if (!force && !stockUtils.isTradingTime())
        return;
    // console.log(ids);
    panel.innerHTML = "";
    let table = document.createElement('table');
    panel.appendChild(table);
    con.query(`select * from bond where chengjiao>1 and lastupdated > '${dateUtils.getNowYYYYMMDD()}' order by zhangfu limit 5`, function (err, r) {
        for (let i = 0; i < r.length; i++) {
            //console.log(r[i]);
            let id = r[i].code;
            let name = r[i].name;
            let xianjia = r[i].xianjia;
            let zhangfu = r[i].zhangfu;
            let chengjiao = r[i].chengjiao;
            let shuiqian = parseFloat(r[i].shuiqian).toFixed(1);

            let row = document.createElement("tr");
            row.innerHTML = `<td>${id}</td><td>${name}</td><td>${xianjia}(${shuiqian})</td>
            <td>${zhangfu}</td><td>${chengjiao}</td>`;
            table.appendChild(row);
        }

        con.query(`select * from bond where chengjiao>1 and lastupdated > '${dateUtils.getNowYYYYMMDD()}' order by zhangfu desc limit 5`, function (err, r2) {
            for (let i = 0; i < r2.length; i++) {
                //console.log(r[i]);
                let id = r2[i].code;
                let name = r2[i].name;
                let xianjia = r2[i].xianjia;
                let zhangfu = r2[i].zhangfu;
                let chengjiao = r2[i].chengjiao;
                let shuiqian = parseFloat(r2[i].shuiqian).toFixed(1);

                let row = document.createElement("tr");
                row.innerHTML = `<td>${id}</td><td>${name}</td><td>${xianjia}(${shuiqian})</td>
                <td>${zhangfu}</td><td>${chengjiao}</td>`;
                table.appendChild(row);
            }

            con.query(`select * from bond where lastupdated > '${dateUtils.getNowYYYYMMDD()}' order by chengjiao desc limit 5`, function (err, r3) {
                for (let i = 0; i < r3.length; i++) {
                    //console.log(r[i]);
                    let id = r3[i].code;
                    let name = r3[i].name;
                    let xianjia = r3[i].xianjia;
                    let zhangfu = r3[i].zhangfu;
                    let chengjiao = r3[i].chengjiao;
                    let shuiqian = parseFloat(r3[i].shuiqian).toFixed(1);
    
                    let row = document.createElement("tr");
                    row.innerHTML = `<td>${id}</td><td>${name}</td><td>${xianjia}(${shuiqian})</td>
                    <td>${zhangfu}</td><td>${chengjiao}</td>`;
                    table.appendChild(row);
                }
            });
        });
    });
}

function on() {
    off();
    update(true);
    interval = setInterval(update, 5000);
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
function init(_con) {
    con = _con;
    on();
}

module.exports = {
    init: init,
    on: on,
    off: off,
};