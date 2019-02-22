const sqlBuilder = require("../utils/sqlBuilder");
var con;
// var lastupdate;
var dataStructrue = [
    {'s':'bond_id','h':'代码','tr':'code'},
    {'s':'bond_nm','h':'转债名','tr':'name'},
    {'s':'stock_id','h':'正股代码','tr':'stockcode'},
    {'s':'stock_nm','h':'正股名','tr':'stockname'},
    {'s':'convert_price','h':'转股价','tr':'zhuangujia'},
    {'s':'convert_dt','h':'转股日','tr':'zhuanguri'},
    {'s':'maturity_dt','h':'到期日','tr':'daoqiri'},
    {'s':'next_put_dt','h':'回售日','tr':'huishouri'},
    {'s':'put_dt','h':'回售天','tr':'huishoutian'},
    {'s':'put_convert_price','h':'回售触发价','tr':'huishouchufajia'},
    {'s':'repo_discount_rt','h':'质押率','tr':'zhiya'}
]
var datatableCols = ['code', 'name', 'stockcode', 'stockname'];
var tableCols = datatableCols;

function getDataStructItem(value, key) {
    if (key == undefined) key = 's'
    for (var i = 0; i < dataStructrue.length; i++) {
        if (dataStructrue[i][key] == value)
            return dataStructrue[i];
    }
    return undefined;
}

function init(_con) {
    con = _con;
    initTable();
    // getConvertBondInfo();
}

function getConvertBondInfo() {
    let _resolve;
    $.ajax({
        url: "https://www.jisilu.cn/data/cbnew/cb_list/",
        context: document.body
    }).done(function (data) {
        console.log(data);
        let rows = data.rows;
        for (let i = 0; i < rows.length; i++) {
            let d = rows[i].cell;
            let query = "";
            let values = [];
            let sqlData = {};
            for (let j = 0; j < datatableCols.length; j++) {
                let value = d[getDataStructItem(datatableCols[j], 'tr')['s']];
                data[datatableCols[j]] = value
                values.push(value);
            }
            // console.log(sqlBuilder.insertOrUpdate('cbond', datatableCols, values));
            con.query(sqlBuilder.insertOrUpdate('convertbond', sqlData));
        }
        _resolve();
    });
    return new Promise((resolve) => {
        _resolve = resolve
    })
}

function initTable() {
    console.log('init table');
    con.query('select * from convertbond', function (err, r) {
        console.log(r);
        let table = document.getElementById("convertableBond");
        table.innerHTML = "";
        //let table = document.createElement("table");
        //tableEle.appendChild(table);
        let header = document.createElement("thead");
        let headerHtml = "<tr>";
        for (let i = 0; i < tableCols.length; i++) {
            headerHtml += `<th>${getDataStructItem(tableCols[i], 'tr')['h']}</th>`;
        }
        headerHtml += "</tr>";
        header.innerHTML = headerHtml;
        table.appendChild(header);
        let tbody = document.createElement("tbody");
        table.appendChild(tbody);
        console.log('+++++++++++++++');
        for (let j = 0; j<r.length; j++) {
            let row = document.createElement("tr");
            let d = r[j];
            let id = d.code;
            row.id = id;

            let rowHtml = "";
            for (let i = 0; i < tableCols.length; i++) {
                let col = tableCols[i];
                rowHtml += `<td id="${id+'_'+col}" `;
                rowHtml += `>${(d[col]===undefined?"":d[col])}</td>`;
            }
            console.log(id, rowHtml);
            row.innerHTML = rowHtml;

            tbody.appendChild(row);
        }
        $("#convertableBond").tablesorter();
    });
}

function updateConvertableBond() {
    getConvertBondInfo().then(() => initTable());
}

module.exports.init = init;
module.exports.updateConvertableBond = updateConvertableBond;