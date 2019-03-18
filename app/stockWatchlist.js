var con;
const DATE = require("./utils/date");
const sqlPromise = require("./utils/sqlPromise");
STOCK_WATCHTABLE_DATA = {};


function init(_con) {
  con = _con
  window['addStockWatchList'] = addStockWatchList;
  window['updateStockWatchTable'] = updateStockWatchTable;
  window['deleteWatchlist'] = deleteWatchlist;
  window['addWatchList'] = addWatchList;
  renderWatchlist();
  renderStockWatchlist();
}


function renderStockWatchlist() {
  console.log("renderStockWatchlist")
  let table = document.getElementById("stockWatchTable");
  console.log(table)
  table.innerHTML = "<thead><tr><th>代码</th><th>名称</th><th>开始日期</th><th>收益</th><th>相对收益</th><th>评价</th></tr></thead>";
  let tbody = document.createElement("tbody");
  table.appendChild(tbody);
  con.query(`select * from stockwatchlist 
    left join stockbasic
    on stockwatchlist.code = stockbasic.ts_code
    order by startdate`, function (err, r) {
    for (let i = 0; i < r.length; i++) {
      let d = r[i];
      let row = document.createElement("tr");
      row.innerHTML = `<td>${d.code}</td><td>${d.name}</td><td>${d.startdate}</td><td>${d.shouyi}</td><td>${d.shouyiminusindex}</td><td>${d.comment}</td>`;
      //<td><input type="button" onclick="deleteWatchlist('${d.code + '_' + d.type}')"  value="删除"> </button></td>

      tbody.appendChild(row);
    }
    // renderTable();
  });
}


function addStockWatchList() {

  let dateStr = DATE.getNowYYYYMMDD();
  let code = document.getElementById("stockwatch_code").value;
  let comment = document.getElementById("stockwatch_comment").value;
  let date = document.getElementById("stockwatch_date").value;
  if (date)
    dateStr = date;
  if (code) {
    if (code.match(/\d{6}/)) {
      code += code.substr(0, 2) == '60' ? '.SH' : '.SZ';
      con.query(`insert into stockwatchlist (code, comment, startdate) values ('${code}', '${comment}', '${dateStr}')
      ON DUPLICATE KEY UPDATE comment = '${comment}', startdate = '${dateStr}'`, function (err, r) {
        if (!err) renderStockWatchlist();
        else
          console.warn(err);
      });
    } else {
      con.query(`select * from  stockbasic where name = '${code}'`, function (err, r) {
        if (err) console.warn(err);
        if (r && r.length > 0) {
          code = r[0].ts_code;
          con.query(`insert into stockwatchlist (code, comment, startdate) values ('${code}', '${comment}', '${dateStr}')
      ON DUPLICATE KEY UPDATE comment = '${comment}', startdate = '${dateStr}'`, function (err, r) {
            if (!err) renderStockWatchlist();
            else
              console.warn(err);
          });
        }
      });
    }
  }
}


function updateStockWatchTable() {
  STOCK_WATCHTABLE_DATA = {};
  let div = document.getElementById("stockwatchTableContainer");
  let relative = document.getElementById('stockwl_relative').checked;
  console.log(relative);
  div.innerHTML = '';
  // con.query('select distinct startdate from stockwatchlist order by startdate', function (err, r) {
  //   // con.query(`select * from stockhistory where code = '000001.SH' and date>= '${r[0].startdate}'`, function (err, r2) {


  //   // });


  // });
  sqlPromise.getIndexLastDate(con)
    .then(lastday => {
      sqlPromise.query(con, 'select distinct startdate from stockwatchlist order by startdate')
        .then(r => {
          sqlPromise.getStockHistory(con, r[0].startdate).then(r2 => {
            let indexData = {};
            for (let i = 0; i < r2.length; i++) {
              let d = r2[i];
              indexData[d.date] = d;
            }
            for (let i = 0; i < r.length; i++) {
              let date = r[i].startdate;
              renderStockWatchDateTable(date, lastday, indexData, relative);
            }
          });
        })
    })



  // let table = document.getElementById("curStockWatchTable");
  // console.log(table)
  // table.innerHTML = "<th><td>代码</td><td>开始日期</td><td>收益</td><td>相对收益</td><td>评价</td></th>";
  // con.query('select * from stockwatchlist', function (err, r) {
  //   for (let i = 0; i < r.length; i++) {
  //     let d = r[i];
  //     let row = document.createElement("tr");
  //     row.innerHTML = `<td>${d.code}</td><td>${d.startdate}</td><td>${d.shouyi}</td><td>${d.shouyiminusindex}</td><td>${d.comment}</td>`;
  //     //<td><input type="button" onclick="deleteWatchlist('${d.code + '_' + d.type}')"  value="删除"> </button></td>

  //     table.appendChild(row);
  //   }
  //   // renderTable();
  // });
}



function renderStockWatchDateTable(date, lastday, indexData, relative = false) {
  let div = document.getElementById("stockwatchTableContainer");
  // con.query(`select * from stockwatchlist
  //   left join stockhistory
  //   on stockwatchlist.code = stockhistory.code
  //   left join stockbasic
  //   on stockwatchlist.code = stockbasic.ts_code
  //   where stockhistory.date >= stockwatchlist.startdate and stockwatchlist.startdate = '${date}'
  //   order by stockwatchlist.code, stockhistory.date`, function (err, r) {
  let nextDay = DATE.getYYYYMMDD(DATE.fromYYYYMMDD(date).addDays(1));
  // console.log(nextDay);
  let query = `select * from stockhistory
  left join stockbasic
  on stockhistory.code = stockbasic.ts_code
  where stockhistory.code in (select code from stockwatchlist where stockwatchlist.startdate = '${date}')
  and stockhistory.date in (select date from tradedate where (date > '${date}' and type = 'l') or date = '${lastday}' or date = '${nextDay}')
  order by stockhistory.code, stockhistory.date`;
  // console.log(query);
  con.query(query, function (err, r) {
    let table = document.createElement("table");
    let thead = document.createElement("thead");
    let theadrow = document.createElement("tr");
    theadrow.innerHTML = '<th>代码</th><th>名称</th>';
    thead.appendChild(theadrow);
    let tbody = document.createElement("tbody");
    table.appendChild(thead);
    table.appendChild(tbody);
    let code = '';
    let dates = {};
    let start_value;

    if (r.length == 0) return;
    let idx_start_value = indexData[r[0].date].pre_close;
    // let last_value;
    let row;
    for (let i = 0; i < r.length; i++) {
      let d = r[i];
      if (dates[d.date]) {
        // theadrow.innerHTML += '<th>收益</th>';
      } else {
        dates[d.date] = d.date;
        theadrow.innerHTML += '<th>' + d.date.substr(4) + '</th>';
      }
      if (d.code != code) {
        if (row) {
          tbody.appendChild(row);
        }
        row = document.createElement('tr');
        start_value = d.pre_close;
        row.innerHTML = '<td>' + d.code + '</td><td>' + d.name + '</td>';
        code = d.code;
      }
      let v = 0,
        color = '';
      if (relative) {
        v = (d.close / start_value - indexData[d.date].close / idx_start_value) * 100;
      } else {
        v = (d.close / start_value - 1) * 100;
      }
      if (v > 0) color = "class='red'";
      if (v < 0) color = "class='green'";
      row.innerHTML += `<td ${color}>${v.toFixed(2)}</td>`;
    }
    tbody.appendChild(row);
    div.appendChild(table);
  });
}



function renderWatchlist() {
  let table = document.getElementById("watchlist");
  table.innerHTML = "";
  con.query('select watchlist.*, name from watchlist left join stockbasic on watchlist.code = stockbasic.code', function (err, r) {
    for (let i = 0; i < r.length; i++) {
      let d = r[i];
      let row = document.createElement("tr");
      row.innerHTML = `<td>${d.code}</td><td>${d.name}</td><td>${d.type}</td><td><input type="button" onclick="deleteWatchlist('${d.code + '_' + d.type}')"  value="删除"> </button></td>
      `;
      table.appendChild(row);
    }
    // renderTable();
  });
}

function deleteWatchlist(str) {
  // console.log('delete', );
  let d = str.split('_');
  con.query(`delete from watchlist where code ='${d[0]}' and type = '${d[1]}' `, function (err, r) {
    if (!err) renderWatchlist();
    else
      console.warn(err);
  });
}

function addWatchList() {
  let code = document.getElementById("watchlist_code").value
  let type = document.getElementById("watchlist_type").value
  if (code && type) {
    if (type == 's')
      type = 'stock';
    else if (type == 'b')
      type = 'bond';
    else if (type == 'z')
      type = 'zhiya';
    else
      return;
    con.query(`insert into watchlist (code, type) values ('${code}', '${type}')`, function (err, r) {
      if (!err) renderWatchlist();
      else
        console.warn(err);
    });
  }
}

module.exports.init = init;