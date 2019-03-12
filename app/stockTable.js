var con;
const DATE = require("./utils/date");


function init(_con) {
  con = _con
  window['updateShangzheng50Table'] = updateShangzheng50Table;
}


function updateShangzheng50Table() {
  let relative = document.getElementById('stockbig_relative').checked;
  let date = new Date();
  let todayStr = DATE.getYYYYMMDD(date);
  let yesterdayStr = DATE.getYYYYMMDD(date.addDays(-1));
  let lastweekStr = DATE.getYYYYMMDD(date.addDays(-7));
  let last2weekStr = DATE.getYYYYMMDD(date.addDays(-14));
  let lastmonthStr = DATE.getYYYYMMDD(date.addDays(-30));
  let last2monthStr = DATE.getYYYYMMDD(date.addDays(-60));
  let lastseasonStr = DATE.getYYYYMMDD(date.addDays(-90));
  let last2seasonStr = DATE.getYYYYMMDD(date.addDays(-180));
  let lastyearStr = DATE.getYYYYMMDD(date.addDays(-365));
  let startStr = DATE.getYYYYMMDD(date.addDays(-400));
  date = {};
  con.query(`select * from tradedate where date > '${startStr}' order by date desc`, function (err, r) {
    for (let i = 0; i < r.length; i++) {
      let d = r[i].date;
      if (!date['last0'] && d <= todayStr)
        date['last0'] = d;
      if (!date['last1'] && d <= yesterdayStr)
        date['last1'] = d;
      if (!date['last7'] && d <= lastweekStr)
        date['last7'] = d;
      if (!date['last14'] && d <= last2weekStr)
        date['last14'] = d;
      if (!date['last30'] && d <= lastmonthStr)
        date['last30'] = d;
      if (!date['last60'] && d <= last2monthStr)
        date['last60'] = d;
      if (!date['last90'] && d <= lastseasonStr)
        date['last90'] = d;
      if (!date['last180'] && d <= last2seasonStr)
        date['last180'] = d;
      if (!date['last365'] && d <= lastyearStr)
        date['last365'] = d;
    }
    console.log(todayStr, yesterdayStr, lastweekStr, lastmonthStr, lastseasonStr, lastyearStr);
    console.log(date);
    let datesStr = '';
    for (let k in date) {
      datesStr += `,'${date[k]}'`
    }
    con.query(`select * from stockhistory 
      left join stockbasic
      on stockhistory.code = stockbasic.ts_code
      where date in (${datesStr.substr(1)}) and
      stockhistory.code in (select code from stocklistbig)
      order by stockhistory.code, date desc`, function (err, r2) {
      if (relative) {
        con.query(`select * from stockhistory where code = '000001.SH' and date in (${datesStr.substr(1)})
          order by date desc`, function (err, r3) {
          let indexData = {};
          for (let i = 0; i < r3.length; i++) {
            let d = r3[i];
            indexData[d.date] = d;
          }
          renderShangzheng50Table(r2, date, indexData, true);
        });
      } else
        renderShangzheng50Table(r2, date);
    });
  });
}

function renderShangzheng50Table(data, dates, indexData, relative = false) {
  let div = document.getElementById("shangzheng50");
  div.innerHTML = "";
  let table = document.createElement("table");
  div.appendChild(table);
  let thead = document.createElement("thead");
  let theadrow = document.createElement("tr");
  theadrow.innerHTML = '<th>代码</th><th>名称</th>';
  thead.appendChild(theadrow);
  for (let k in dates) {
    theadrow.innerHTML += `<th>${k}</th>`
  }
  let tbody = document.createElement("tbody");
  table.appendChild(thead);
  table.appendChild(tbody);
  let code = '';
  let start_value;
  let row;
  let idx_start_value;
  for (let i = 0; i < data.length; i++) {
    let d = data[i];
    if (relative && !idx_start_value) {
      idx_start_value = indexData[d.date].close;
    }
    if (d.code != code) {
      if (row) {
        tbody.appendChild(row);
      }
      row = document.createElement('tr');
      start_value = d.close;
      row.innerHTML = '<td>' + d.code + '</td><td>' + d.name + '</td>';
      code = d.code;
    }
    let v = 0,
      color = '';
    if (relative) {
      console.log(d.code, d.name, ((start_value / d.pre_close - 1) * 100).toFixed(2), ((idx_start_value / indexData[d.date].pre_close - 1) * 100).toFixed(2))
      v = (start_value / d.pre_close - idx_start_value / indexData[d.date].pre_close) * 100;
    } else {
      v = (start_value / d.pre_close - 1) * 100;
    }
    if (v > 0) color = "class='red'";
    if (v < 0) color = "class='green'";
    row.innerHTML += `<td ${color}>${v.toFixed(2)}</td>`;
  }
}


module.exports.init = init;