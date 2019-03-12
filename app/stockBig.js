var con;
const DATE = require("./utils/date");


function init(_con) {
  con = _con
  window['updateStockbigTable'] = updateStockbigTable;
}

bigStocks = [
  '601398',
  '601939',
  '601857',
  '601288',
  '601318',
  '601988',
  '600519',
  '600036',
  '601628',
  '600028',
  '601328',
  '601088',
  '601166',
  '601319',
  '600900',
  '600000',
  '002415',
  '600104',
  '000002',
  '000333',
  '601998',
  '601138',
  '000858',
  '601601',
  '600016',
  '000651',
  '600030',
  '600276',
  '601766',
  '601668',
  '000001',
  '601818',
  '603288',
  '600050',
  '300750',
  '600585',
  '300498',
  '002304',
  '601800',
  '601688',
  '601360',
  '001979',
  '600019',
  '600887',
  '601211',
  '601390',
  '600048',
  '002352',
  '300760',
  '601066',
  '601186',
  '000725',
  '601336',
  '600018',
  '601169',
  '601229',
  '600837',
  '002594',
  '601006',
  '600015',
  '601111',
  '600309',
  '000166',
  '601989',
  '601888',
  '000617',
  '000776',
  '000063',
  '002024',
  '600009',
  '600999',
  '601238',
  '603259',
  '300059',
  '600690',
  '002714',
  '002142',
  '002027'
]



let STOCK_DATA;
let INDEX_DATA;
let DATES;
let MAX_VALUE = {
  'v1': 0,
  'v2': 0,
  'v1r': 0,
  'v2r': 0,
};

function updateStockbigTable() {
  if (!STOCK_DATA)
    initStockData(event.target);
  else
    renderStockbigTable(event.target);
}

function getMax(key, value) {
  if (value) {
    if (Math.abs(value) > MAX_VALUE[key])
      MAX_VALUE[key] = Math.min(1000, Math.abs(value));
  }
}


function initStockData(target) {
  // let relative = document.getElementById('stockbig_relative').checked;
  STOCK_DATA = {};
  INDEX_DATA = {};
  let relative = true;
  let date = new Date();
  let todayStr = DATE.getYYYYMMDD(date);
  let startStr = DATE.getYYYYMMDD(date.addDays(-7));
  DATES = ['20181228',
    '20171229',
    '20161230',
    '20151231',
    '20141231',
    '20131231',
    '20121231',
    '20111230',
    '20101231',
    '20091231'
  ];
  con.query(`select * from tradedate where date > '${startStr}' and date<='${todayStr}' order by date desc`, function (err, r) {
    // if (r.length > 0)
    //   date[r[0].date] = r[0].date;
    DATES.unshift(r[0].date);
    // for (let i = 0; i < dates.length; i++)
    //   date[dates[i]] = dates[i];
    console.log("++++++++++++++++");
    console.log(date);
    console.log("++++++++++++++++");
    let datesStr = '';
    let stocksStr = '';
    for (let i = 0; i < DATES.length; i++) {
      datesStr += `,'${DATES[i]}'`
    }
    for (let i = 0; i < bigStocks.length; i++)
      stocksStr += `,'${bigStocks[i]}.${bigStocks[i].substr(0,2)=='60'?'SH':'SZ'}'`
    let sql = `select * from stockhistory 
    left join stockbasic
    on stockhistory.code = stockbasic.ts_code
    where date in (${datesStr.substr(1)}) and
    stockhistory.code in (${stocksStr.substr(1)}) 
    order by stockhistory.code, date desc`;
    console.log(sql);
    con.query(sql, function (err, r2) {
      if (err) console.warn(err);
      if (relative) {
        con.query(`select * from stockhistory where code = '000001.SH' and date in (${datesStr.substr(1)})
          order by date desc`, function (err, r3) {
          // let indexData = {};
          // for (let i = 0; i < r3.length; i++) {
          //   let d = r3[i];
          //   indexData[d.date] = d;
          // }
          let last_close;
          for (let i = 0; i < r3.length; i++) {
            let d = r3[i];
            let code = d.code;
            if (!INDEX_DATA[code]) {
              INDEX_DATA[code] = {
                'code': d.code,
                'close': d.close,
                'data': {
                  'now': {
                    'v1': d.pct_chg,
                    'v2': d.pct_chg
                  }
                }
              }
            } else {
              let year = parseInt(d.date.substr(0, 4)) + 1;
              INDEX_DATA[code]['data'][year] = {
                'v1': Math.round((INDEX_DATA[code].close / d.close - 1) * 10000) / 100,
                'v2': Math.round((last_close / d.close - 1) * 10000) / 100,
              };
            }
            last_close = d.close;
          }
          INDEX_DATA = INDEX_DATA['000001.SH'].data;
          for (let i = 0; i < r2.length; i++) {
            let d = r2[i];
            let code = d.code;
            if (!STOCK_DATA[code]) {
              STOCK_DATA[code] = {
                'name': d.name,
                'code': d.code,
                'close': d.hfq_close,
                'data': {
                  'now': {
                    'v1': d.pct_chg,
                    'v2': d.pct_chg
                  }
                }
              }
              getMax('v1', d.pct_chg);
              getMax('v2', d.pct_chg);
              getMax('v1r', d.pct_chg - INDEX_DATA['now'].v1);
              getMax('v2r', d.pct_chg - INDEX_DATA['now'].v2);
            } else {
              let year = parseInt(d.date.substr(0, 4)) + 1;
              let v1 = Math.round((STOCK_DATA[code].close / d.hfq_close - 1) * 10000) / 100;
              let v2 = Math.round((last_close / d.hfq_close - 1) * 10000) / 100
              STOCK_DATA[code]['data'][year] = {
                'v1': v1,
                'v2': v2,
              };
              getMax('v1', v1);
              getMax('v2', v2);
              getMax('v1r', v1 - INDEX_DATA[year].v1);
              getMax('v2r', v2 - INDEX_DATA[year].v2);
              // console.log
            }
            last_close = d.hfq_close;
          }
          console.log(INDEX_DATA);
          console.log(STOCK_DATA);
          console.log(MAX_VALUE);
          renderStockbigTable(target);
        });
      } else
      ;
      // renderStockbigTable(r2, date);
    });
  });
}




function renderStockbigTable(target) {
  let btnStockbig = document.getElementById("btnUpdateStockbigTable");
  if (target == btnStockbig) {
    btnStockbig.value = btnStockbig.value == "每年收益" ? "至今收益" : "每年收益";
  }
  let eachYear = btnStockbig.value != "每年收益";
  let btnStockbig2 = document.getElementById("btnUpdateStockbigTable2");
  if (target == btnStockbig2) {
    btnStockbig2.value = btnStockbig2.value == "相对收益" ? "绝对收益" : "相对收益";
  }
  let relative = btnStockbig2.value != "相对收益";
  let btnStockbig3 = document.getElementById("btnUpdateStockbigTable3");
  if (target == btnStockbig3) {
    btnStockbig3.value = btnStockbig3.value == "图形显示" ? "数字显示" : "图形显示";
  }
  let graph = btnStockbig3.value != "图形显示";

  let div = document.getElementById("stockbigTableContainer");
  div.innerHTML = "";
  let table = document.createElement("table");
  div.appendChild(table);
  let thead = document.createElement("thead");
  let theadrow = document.createElement("tr");
  theadrow.innerHTML = '<th>代码</th><th>名称</th><th>now</th>';
  thead.appendChild(theadrow);
  for (let i = 1; i < DATES.length; i++) {
    theadrow.innerHTML += `<th>${DATES[i].substr(0,4)}</th>`
  }
  let tbody = document.createElement("tbody");
  table.appendChild(thead);
  table.appendChild(tbody);

  for (let k in STOCK_DATA) {
    let d = STOCK_DATA[k];
    let row = document.createElement('tr');
    tbody.appendChild(row);
    row.innerHTML = '<td>' + k + '</td><td>' + d.name + '</td>';
    let data = d.data;
    for (let i = 0; i < DATES.length; i++) {
      let date = DATES[i].substr(0, 4);
      if (i == 0) date = 'now';

      // console.log(date, data[date]);
      if (data[date]) {
        let v;
        let color = '';

        if (eachYear) {
          v = relative ? (data[date].v2 - INDEX_DATA[date].v2) : data[date].v2;
          if (v > 0) color = 'red';
          if (v < 0) color = 'green';
          if (graph) {
            let max = (relative ? MAX_VALUE['v2r'] : MAX_VALUE['v2']);
            // v = Math.log2(Math.abs(v) + 1) / max;
            // console.log('relative:', relative, max.toFixed(2), v.toFixed(2));
            v = Math.pow(Math.abs(max / v), .5);
          }
        } else {
          v = relative ? (data[date].v1 - INDEX_DATA[date].v1) : data[date].v1;
          if (v > 0) color = 'red';
          if (v < 0) color = 'green';
          if (graph) {
            let max = (relative ? MAX_VALUE['v1r'] : MAX_VALUE['v1']);
            // v = Math.log2(Math.abs(v) + 1) / max;
            // console.log('relative:', relative, max.toFixed(2), v.toFixed(2));
            v = Math.pow(Math.abs(max / v), .5);
          }
        }
        if (graph) {
          row.innerHTML += `<td><div class="stock-h-bar ${color}-bg" style="width:${60/Math.max(1,v)}px"></div></td>`;
        } else {
          row.innerHTML += `<td class="${color}">${v.toFixed(2)}</td>`;
        }
      } else {
        row.innerHTML += `<td></td>`;
      }
    }
  }


  // for (let i = 0; i < data.length; i++) {
  //   let d = data[i];
  //   if (relative && !idx_start_value) {
  //     idx_start_value = indexData[d.date].close;
  //   }
  //   if (d.code != code) {
  //     if (row) {
  //       tbody.appendChild(row);
  //     }
  //     row = document.createElement('tr');
  //     start_value = d.close;
  //     row.innerHTML = '<td>' + d.code + '</td><td>' + d.name + '</td>';
  //     code = d.code;
  //   }
  //   // console.log(d);
  //   let v = 0,
  //     color = '';
  //   if (relative) {
  //     console.log(d.code, d.name, ((start_value / d.pre_close - 1) * 100).toFixed(2), ((idx_start_value / indexData[d.date].pre_close - 1) * 100).toFixed(2))
  //     v = (start_value / d.pre_close - idx_start_value / indexData[d.date].pre_close) * 100;
  //   } else {
  //     v = (start_value / d.pre_close - 1) * 100;
  //   }
  //   if (v > 0) color = "class='red'";
  //   if (v < 0) color = "class='green'";
  //   row.innerHTML += `<td ${color}>${v.toFixed(2)}</td>`;
  // }
}


module.exports.init = init;