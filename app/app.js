//import { setTimeout } from "timers";

//import {JsonDb} from "./data";
//const data = require('./data');
var querystring = require('querystring');
const xml = require("./utils/xml");
const lineTableReader = require("./utils/lineTableReader");
const array = require("./utils/array");
const FS = require("fs");
var EXCEL = require('exceljs');
const DOWNLOAD = require('download');
const HTTP = require('http');
const XLSX = require('xlsx');
const MYSQL = require('mysql');
const stockUtils = require("./utils/stock");
const DATE = require("./utils/date");
const TAB = require('./utils/tab.js');
const SQLP = require('./utils/sqlPromise.js');

const URL = "http://www.chinaclear.cn/zdjs/xbzzsl/center_bzzsl.shtml";
const DL_URL = "http://www.chinaclear.cn/zdjs/editor_file/";
//let DATA = JSON.parse(FS.readFileSync("data.json", "utf8"));
// let CONFIG = JSON.parse(FS.readFileSync("config.json", "utf8"));

let DATA_CANGWEI = {};
let DATA_ZHIYA = {};
let ZHIYALV_WATCH_LIST = {};

const BOND_TABLE = require('./bondTable');
const STOCK_BIG_TABLE = require('./stockBig');
const STOCK_TABLE = require('./stockTable');
const STOCK_LIANDONG = require('./stockLiandong');
const NEWS_NOTIFICATION = require('./components/newsNotification');
const STOCK_NOTIFICATION = require('./components/stockNotification');
const BOND_HIGHLIGHT = require('./components/bondHighlight');
const CB_DATA = require('./components/convertableBondData');
// const BOND_NEWS = require('./bondNewsTable');
const CHART = require('./chart');
//const BOND_SELECT = require('./bondSelect');
const URL_WHITE_LIST = ["http://www.chinaclear.cn/zdjs/editor_file/63280dade3884bc18bb39682a7026927.shtml"];
const XLS_WHITE_LIST = ["http://www.chinaclear.cn/zdjs/editor_file/20180115170712295.xls"];

// init();

const nodemailer = require('nodemailer');
// let resultSent = false;
// setInterval(requestTable, 10000);

function requestTable() {
  if (resultSent) return;
  console.log('====???====');
  var post_data = querystring.stringify({
    'filter_EQS_APP_ID': '230103198708265113',
    'sqlkey': 'homepage',
    'sqlval': 'HONG_KAOSHI_SELECT'
  });
  var post_req = HTTP.request({
      hostname: 'person.amac.org.cn',
      path: '/pages/login/resource!search.action',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(post_data)
      }
    },
    function (res) {
      console.log('====zzzz====');
      let rawData = '';
      res.on('data', function (data) {
        rawData += data;
      }).on('end', function () {
        let data = JSON.parse(rawData);
        let count = 0;
        let k;
        for (k in data) {
          count++;
        }
        console.log('count:', count);
        if (count > 2) {
          resultSent = true;
          sendEmail('成绩: ' + data[k]['SSG_GRADE']);
        }
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
      });;
    }
  );
  post_req.write(post_data);
  post_req.end();
}

function sendEmail(content) {
  console.log('发送邮件中...');
  if (content == undefined)
    content = document.getElementById('tosend').innerHTML;
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: 'smtp.163.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: 'chixu163@163.com', // generated ethereal user
        pass: 'chkj1234' // generated ethereal password
      }
    });

    // setup email data with unicode symbols
    let mailOptions = {
      from: 'chixu163@163.com', // sender address
      to: '43809501@qq.com', // list of receivers
      subject: '今日报告', // Subject line
      text: 'Hi Boss this is the today report ', // plain text body
      html: content
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
  });
}

var con = MYSQL.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bond"
});

function migrateBondData() {
  const DATA_TABLE = JSON.parse(FS.readFileSync("table.json", "utf8"));
  let count = 0;
  for (let key in DATA_TABLE) {
    count++;
  }
  console.log(count);
  // for (let key in DATA_TABLE) {
  //   let item = DATA_TABLE[key];
  //   let keysStr = "name,xianjia,quanjia,zhangfu,chengjiao,jufuxi,nianxian,shuiqian,shuihou,piaoxi,zhesuan,xinyong,danbao,guimo,info,comment"
  //   let keys = keysStr.split(',');
  //   let valueStr = "";
  //   for (let i = 0; i < keys.length; i++) {
  //     let value = item[keys[i]] == undefined ? "" : item[keys[i]];
  //     if (keys[i] == "zhangfu") {
  //       value = value.replace('%', '');
  //     }
  //     if (['name', 'xinyong', 'danbao', 'info', 'comment'].indexOf(keys[i]) > -1) {
  //       value = '"' + value + '"';
  //     }
  //     valueStr += value;
  //     if (i < keys.length - 1)
  //       valueStr += ',';
  //   }
  //   let query = `insert into bond (code,${keysStr}) values 
  //   (${item.id + "," + valueStr})`;
  //   con.query(query, function (err, result) {
  //     if (err) {
  //       console.log(err);
  //     }
  //   });
  // }
}
let accountInfo = {};
init2();


function getCangweiQuery(table, acc) {
  if (acc == 'all')
    return getCangweiQuery(table, 'tds') + ' union ' + getCangweiQuery(table, 'hz') + ' union ' +
      getCangweiQuery(table, 'ht') + ' union ' + getCangweiQuery(table, 'yds');
  else
    return `select * from ${table} where account = '${acc}' and date = (select max(date) from ${table} where account = '${acc}')`;
}

function getAccountInfo(accName) {
  if (accountInfo[accName]) {
    return Promise.resolve(accountInfo[accName]);
  }
  let cangwei = {};
  // let q = `select * from cangwei where date='${DATE.getNowYYYYMMDD()}' ` + (accName == 'all' ? "" : ` and account = '${accName}'`);
  let q = getCangweiQuery('cangwei', accName);
  console.log(q);
  return SQLP.query(con, q)
    .then(result => {
      for (let i = 0; i < result.length; i++) {
        let res = result[i];
        let count = stockUtils.getStockCount(parseInt(res['count']), res.code);
        if (cangwei[res['code']]) {
          cangwei[res['code']].count += count;
        } else {
          cangwei[res['code']] = {
            count: count,
            price: res.price,
            name: res.name
          };
        }
      }
    })
    .then(() => {
      if (accName == 'all') {
        return SQLP.query(con, "select * from watchlist where type = 'zhiya'")
          .then(result => {
            for (let i = 0; i < result.length; i++) {
              let res = result[i];
              // DATA_ZHIYA[res.code] = {
              ZHIYALV_WATCH_LIST[res.code] = {
                count: 0,
                name: ""
              };
            }
          });
      } else
        return Promise.resolve();
    })
    .then(() => {
      if (accName == 'all') {
        // return SQLP.query(con, `select * from zhiya where account = 'tds' and date = '${DATE.getNowYYYYMMDD()}'`)
        return SQLP.query(con, getCangweiQuery('zhiya', 'tds'))
          .then(result => {
            for (let i = 0; i < result.length; i++) {
              let res = result[i];

              DATA_ZHIYA[res.code] = {
                count: stockUtils.getStockCount(parseInt(res['count']), res.code),
                price: 100,
                name: res.name
              };
              ZHIYALV_WATCH_LIST[res.code] = {
                count: DATA_ZHIYA[res.code].count,
                name: res.name
              }
            }
            for (let k in DATA_ZHIYA) {
              if (cangwei[k] == undefined) {
                cangwei[k] = {
                  count: DATA_ZHIYA[k].count,
                  price: 100,
                  name: DATA_ZHIYA[k].name
                };
              } else {
                cangwei[k].count = cangwei[k].count + DATA_ZHIYA[k].count;
              }
            }
          });
      } else if (accName == 'tds') {
        for (let k in DATA_ZHIYA) {
          if (cangwei[k] == undefined) {
            cangwei[k] = DATA_ZHIYA[k];
          } else {
            cangwei[k].count = cangwei[k].count + DATA_ZHIYA[k].count;
          }
        }
        return Promise.resolve();
      } else
        return Promise.resolve();
    })
    .then(() => {
      let ids = '';
      for (let k in cangwei) {
        ids += "'" + k + "',"
      }
      return SQLP.query(con, `select shuiqian,code from bond where code in (${ids.substr(0, ids.length-1)})`)
        .then(result => {
          for (let k in cangwei) {
            cangwei[k].shuiqian = 0;
            for (let k2 in result) {
              if (k == result[k2].code) {
                cangwei[k].shuiqian = result[k2].shuiqian;
                break;
              }
            }
          }
        });
    })
    .then(() => {
      console.log('XXXXXXXXXXXXXXXXXXXXX');
      // console.log(JSON.stringify(cangwei, 2));
      console.log(JSON.stringify(ZHIYALV_WATCH_LIST, 2));
      accountInfo[accName] = cangwei;
      return Promise.resolve(cangwei);
    });
}

function init2() {
  let mainTab = new TAB.TabContainer('mainTab', 'Table');
  // let accountTab = new TAB.TabContainer('accountTab');
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    // con.query('select * from cangwei', function (err, result) {
    //   if (err) throw err;
    //   console.log(result);
    //   for (let i = 0; i < result.length; i++) {
    //     let res = result[i];
    //     DATA_CANGWEI[res['code']] = {
    //       count: parseInt(res['count']) * (stockUtils.getMarket(res.code) == 'sh' ? 10 : 1),
    //       name: res.name
    //     };
    //   }
    //   con.query('select * from watchlist', function (err, result3) {
    //     if (err) throw err;
    //     for (let i = 0; i < result3.length; i++) {
    //       let res = result3[i];
    //       DATA_ZHIYA[res.code] = {
    //         count: 0,
    //         name: ""
    //       };
    //     }
    //     con.query('select * from zhiya', function (err, result2) {
    //       if (err) throw err;
    //       for (let i = 0; i < result2.length; i++) {
    //         //DATA_ZHIYA[result2[i]['code']] = parseInt(result2[i]['count']);
    //         let res = result2[i];
    //         DATA_ZHIYA[res.code] = {
    //           count: parseInt(res['count']) * (stockUtils.getMarket(res.code) == 'sh' ? 10 : 1),
    //           name: res.name
    //         };
    //       }
    //       for (let k in DATA_ZHIYA) {
    //         if (DATA_CANGWEI[k] == undefined) {
    //           DATA_CANGWEI[k] = DATA_ZHIYA[k];
    //         } else {
    //           DATA_CANGWEI[k].count = DATA_CANGWEI[k].count + DATA_ZHIYA[k].count;
    //         }
    //         // DATA_ZHIYA[k] = {
    //         //   count: DATA_ZHIYA[k]
    //         // };
    //       }
    //       let ids = '';
    //       for (let k in DATA_CANGWEI) {
    //         ids += "'" + k + "',"
    //       }
    //       con.query(`select shuiqian,code from bond where code in (${ids.substr(0, ids.length-1)})`, function (err, result3) {
    //         for (let k in DATA_CANGWEI) {
    //           DATA_CANGWEI[k].shuiqian = 0;
    //           for (let k2 in result3) {
    //             if (k == result3[k2].code) {
    //               DATA_CANGWEI[k].shuiqian = result3[k2].shuiqian;
    //               break;
    //             }
    //           }
    //         }
    //         console.log('DATA_CANGWEI', JSON.stringify(DATA_CANGWEI, null, 2));
    //         console.log('DATA_ZHIYA', JSON.stringify(DATA_ZHIYA, null, 2));
    //         BOND_TABLE.init(con);
    //         CHART.init(con);
    //         NEWS_NOTIFICATION.init(con);
    //         CB_DATA.init(con);
    //         STOCK_NOTIFICATION.init();
    //         //migrateBondData();
    //         initCangwei();
    //         renderTable2();
    //         renderNews();
    //       });
    //     });
    //   });
    // });
    getAccountInfo('all')
      .then(result => {
        DATA_CANGWEI = result;
        BOND_TABLE.init(con);
        STOCK_TABLE.init(con);
        STOCK_BIG_TABLE.init(con);
        STOCK_LIANDONG.init(con);
        CHART.init(con);
        NEWS_NOTIFICATION.init(con);
        CB_DATA.init(con);
        STOCK_NOTIFICATION.init(con);
        BOND_HIGHLIGHT.init(con);
        initCangwei();
        renderZhiyaTable();
        renderNewsDefualt();
        renderWatchlist();
        renderStockWatchlist();
        ////migrateBondData();
      });
  });
}

function renderWatchlist() {
  let table = document.getElementById("watchlist");
  table.innerHTML = "";
  con.query('select * from watchlist', function (err, r) {
    for (let i = 0; i < r.length; i++) {
      let d = r[i];
      let row = document.createElement("tr");
      row.innerHTML = `<td>${d.code}</td><td>${d.type}</td><td><input type="button" onclick="deleteWatchlist('${d.code + '_' + d.type}')"  value="删除"> </button></td>
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

function initCangwei(account) {
  account = account || 'all';
  let cangwei = document.getElementById("cangwei");
  cangwei.innerHTML = "";
  let data_cangwei = accountInfo[account];
  console.log("================");
  console.log(data_cangwei);
  let table = document.createElement("table");
  cangwei.appendChild(table);
  let total = 0;
  for (let key in data_cangwei) {
    if (['131990', '888880'].indexOf(key) > -1)
      continue;
    total += data_cangwei[key].count * data_cangwei[key].price;
  }
  let sortedCangwei = [];
  for (let key in data_cangwei) {
    let totalprice = data_cangwei[key].count * data_cangwei[key].price;
    if (totalprice == 0) continue;
    let inserted = false;
    for (let i = 0; i < sortedCangwei.length; i++) {
      if (sortedCangwei[i].totalprice < totalprice) {
        sortedCangwei.splice(i, 0, {
          id: key,
          count: data_cangwei[key].count,
          price: data_cangwei[key].price,
          totalprice: totalprice
        })
        inserted = true;
        break;
      }
    }
    if (!inserted)
      sortedCangwei.push({
        id: key,
        count: data_cangwei[key].count,
        price: data_cangwei[key].price,
        totalprice: totalprice
      });
  }
  let maxWidth = 600;
  let totalShouyi = 0;
  for (let i = 0; i < sortedCangwei.length; i++) {
    let key = sortedCangwei[i].id;
    if (['131990', '888880'].indexOf(key) > -1)
      continue;
    let row = document.createElement("tr");
    let count = data_cangwei[key].count;
    let price = data_cangwei[key].price;
    let totalprice = count * price;
    totalShouyi += count / total * data_cangwei[key].shuiqian;
    row.innerHTML = `<td>${key}</td><td>${data_cangwei[key].name}</td><td>${count}</td><td>${price}</td><td>${totalprice.toFixed(2)}(${(totalprice/total*100).toFixed(2)}%)</td>
    <td>${data_cangwei[key].shuiqian}</td><td>${BOND_TABLE.getStockNianxian(key)}</td><td><div style="width:${maxWidth*totalprice/total}px;height:10px;background:blue"></div></td>`;
    table.appendChild(row);
  }
  console.log('data_cangwei:', data_cangwei);
  console.log('totalShouyi:', totalShouyi);
}

// function init() {
//   lineTableReader.read('data/cangwei.txt').then((d) => {
//     // console.log('cangwei',JSON.stringify(d, null, 2));
//     for (let i = 0; i < d.data.length; i++) {
//       DATA_CANGWEI[d.data[i][0]] = parseInt(d.data[i][2]);
//     }
//   }).then(() => {
//     lineTableReader.read('data/zhiya.txt').then((d) => {
//       // console.log('zhiya',JSON.stringify(d, null, 2));
//       for (let i = 0; i < d.data.length; i++) {
//         DATA_ZHIYA[d.data[i][0]] = parseInt(d.data[i][2]);
//       }
//       for (let k in DATA_ZHIYA) {
//         if (DATA_CANGWEI[k] == undefined) {
//           DATA_CANGWEI[k] = DATA_ZHIYA[k];
//         } else {
//           DATA_CANGWEI[k] = DATA_CANGWEI[k] + DATA_ZHIYA[k];
//         }
//         DATA_ZHIYA[k] = {
//           count: DATA_ZHIYA[k]
//         };
//       }
//       console.log('DATA_CANGWEI', JSON.stringify(DATA_CANGWEI, null, 2));
//       //console.log('DATA_CANGWEI', DATA_CANGWEI);
//     });
//   }).then(() => BOND_TABLE.init());
// }

let BOND_DATES;



var director = {
  types: [],
  stocks: []
};

function updateConvertableBond() {
  CB_DATA.updateConvertableBond();
}

function fundSelect() {
  BOND_SELECT.fundSelect();
}

function selectDialogColor() {
  BOND_TABLE.selectDialogColor();
}

function showDialog(id) {
  BOND_TABLE.showDialog(id);
}

function parseTable() {
  BOND_TABLE.parseTable();
}

function onTableItemClick() {
  BOND_TABLE.onTableItemClick();
}

function updateTableAllRows() {
  BOND_TABLE.updateTableAllRows();
}

function sortTable() {
  BOND_TABLE.sortTable();
}

function onStockTracker() {
  BOND_TABLE.onStockTracker();
}

function updateTableInfo() {
  BOND_TABLE.updateTableInfo();
}

function onStockNoteClick(code) {
  STOCK_NOTIFICATION.onStockNoteClick(code);
}
//getNormalBond();

function renderNewsDefualt() {
  renderNews("bond','stock")
}

function renderNewsAll() {
  renderNews("cb','eb','bond','stock");
}

function renderNewsBond() {
  renderNews("bond");
}

function renderNewsStock() {
  renderNews("stock");
}

function renderNewsCb() {
  renderNews("cb','eb");
}

function renderNews(type) {
  let date = new Date();
  let dateStr = DATE.getDashYYYYMMDD(date.addDays(-15));
  console.log('datestr ', dateStr)
  con.query(`select * from news where date > '${dateStr}' and type in ('${type}') order by date desc, updatetime desc`, function (err, r) {
    let list = document.createElement('ul');
    list.style.marginLeft = "-15px";
    let res = document.getElementById('bondNews');
    res.innerHTML = '';
    res.appendChild(list);
    for (let i = 0; i < r.length; i++) {
      let d = r[i];
      let row = document.createElement('li');
      row.innerHTML = `<a style="margin-left:-5px" href="${d.url}">${d.date.substr(4,2)+'-'+d.date.substr(6,2)} ${d.title}</a>`;
      list.appendChild(row);
    }
  });
}

function renderZhiyaTable() {
  con.query('select distinct date from zhiyalv', function (err, r1) {
    console.log('renderZhiyaTable');
    console.log(r1);
    BOND_DATES = [];
    for (let i = 0; i < r1.length; i++) {
      BOND_DATES.push(r1[i]['date']);
    }
    con.query('select * from zhiyalv', function (err, r2) {
      for (let i = 0; i < r2.length; i++) {
        if (ZHIYALV_WATCH_LIST[r2[i].code])
          ZHIYALV_WATCH_LIST[r2[i].code][r2[i].date] = [r2[i].value];
      }
      renderTable();
    });
  });
}

function renderTable() {
  let bondRes = document.getElementById("bondResult");
  let bondResTab = document.createElement("table");
  bondResTab.style.textAlign = 'center';
  bondResult.innerHTML = "";
  bondResult.appendChild(bondResTab);
  let top = document.createElement("tr");
  let toptxt = `<th></th>`;
  for (let i = 0; i < BOND_DATES.length; i++) {
    toptxt += `<th>${BOND_DATES[i]}</th>`;
  }
  top.innerHTML = toptxt;
  bondResTab.appendChild(top);
  let dateInfo = {};
  for (let i = 0; i < BOND_DATES.length; i++) {
    dateInfo[BOND_DATES[i]] = {
      shsum: 0,
      szsum: 0
    };
  }
  for (let key in ZHIYALV_WATCH_LIST) {
    let row = document.createElement("tr");
    let rowtxt = `<td>${key}<br>${ZHIYALV_WATCH_LIST[key].name}</td>`;
    let prevRate;
    for (let i = 0; i < BOND_DATES.length; i++) {
      let rate = parseFloat(ZHIYALV_WATCH_LIST[key][BOND_DATES[i]]);
      if (i == 0) {
        prevRate = rate;
      } else {
        if (prevRate != rate) {
          row.style.backgroundColor = "yellow";
        }
      }
      rowtxt += `<td>${rate}</td>`;
      if (stockUtils.getMarket(key) == 'sz') {
        dateInfo[BOND_DATES[i]].szsum += ZHIYALV_WATCH_LIST[key].count * rate;
      } else {
        dateInfo[BOND_DATES[i]].shsum += ZHIYALV_WATCH_LIST[key].count * rate;
      }
      // dateInfo[BOND_DATES[i]].shsum += DATA_ZHIYA[key].count * rate;
    }
    row.innerHTML = rowtxt;
    bondResTab.appendChild(row);
  }
  let shbtm = document.createElement("tr");
  let shbtm2 = document.createElement("tr");
  let shbtmtxt = `<td>上海</td>`;
  let shbtmtxt2 = `<td>上海x0.88</td>`;
  for (let i = 0; i < BOND_DATES.length; i++) {
    shbtmtxt += `<th>${Math.round(dateInfo[BOND_DATES[i]].shsum)}</th>`;
    shbtmtxt2 += `<th>${Math.round(dateInfo[BOND_DATES[i]].shsum * 0.88)}</th>`;
  }
  shbtm.innerHTML = shbtmtxt;
  shbtm2.innerHTML = shbtmtxt2;
  bondResTab.appendChild(shbtm);
  bondResTab.appendChild(shbtm2);


  let szbtm = document.createElement("tr");
  let szbtm2 = document.createElement("tr");
  let szbtmtxt = `<td>深圳</td>`;
  let szbtmtxt2 = `<td>深圳x0.88</td>`;
  for (let i = 0; i < BOND_DATES.length; i++) {
    szbtmtxt += `<th>${Math.round(dateInfo[BOND_DATES[i]].szsum)}</th>`;
    szbtmtxt2 += `<th>${Math.round(dateInfo[BOND_DATES[i]].szsum * 0.88)}</th>`;
  }
  szbtm.innerHTML = szbtmtxt;
  szbtm2.innerHTML = szbtmtxt2;
  bondResTab.appendChild(szbtm);
  bondResTab.appendChild(szbtm2);
}

function getNormalBond() {
  BOND_DATES = [];
  con.query(`truncate table zhiyalv`, function (err, result2) {
    if (err)
      console.log('truncate ', err);
  });
  $.ajax({
    url: URL,
    context: document.body
  }).done(function (data) {
    console.log("Hello");
    var html = document.createElement("div");
    html.innerHTML = data;
    var list = html.querySelector(".pageTabContent ul");
    // xml.forEachElement(list, (node, index) => {
    //   //console.log(node);
    //   if (index < 1) {
    //     let child = xml.child(node, 0);
    //     let title = xml.attr(child, 'title');
    //     let href = xml.attr(child, 'href');
    //     console.log(href, title);
    //     readXls(href);
    //   }
    // });
    let firstDate = xml.child(xml.child(list, 0), 1).innerText;
    let secondDate = xml.child(xml.child(list, 1), 1).innerText;
    //console.log(firstDate, secondDate);
    let from = firstDate == secondDate ? 5 : 6;
    let to = firstDate == secondDate ? 0 : 1;
    let promise = Promise.resolve();
    for (let i = from; i >= to; i--) {
      let node = xml.child(xml.child(list, i), 0);
      let href = xml.attr(node, 'href');
      let title = xml.attr(node, 'title');
      let isSZ = title.indexOf("深圳") > -1;
      promise = promise.then(() => loadXls(href, isSZ));
    }
    // console.log(firstChild);
    // loadXls(firstChild)
    promise.then(() => {
      console.log("done");
      renderZhiyaTable();
    }).catch(e => console.log(e));
    //   .then(() => loadXls(secondChild))
    //   .then(() => console.log("2 done"));
  });
}

function getFileName(str) {
  return str.substr(str.lastIndexOf("/") + 1);
}

function readXls(filename, isSZ) {
  let sheetName = isSZ ? "Sheet1" : "Sheet2";
  let codeCol = isSZ ? "B" : "A";
  let ratioCol = isSZ ? "D" : "C";
  let dateCol = isSZ ? "E" : "D";
  let resultEle = document.querySelector("#result");
  let wb = XLSX.readFile(filename);
  console.log('read done');
  let ws = wb.Sheets[sheetName];
  let row = 4;
  code = ws[codeCol + row];
  let date = ws[dateCol + "5"].v.toString().replace(/-/g, '');
  if (BOND_DATES.indexOf(date) == -1)
    BOND_DATES.push(date);
  let oldCount = 0;
  let newCount = 0;
  let notFound = [];
  for (let k in ZHIYALV_WATCH_LIST)
    notFound.push(k);
  while (code) {
    let k = code.v;
    if (ZHIYALV_WATCH_LIST[k]) {
      let q = `insert into zhiyalv (date, code, value) values ('${date}','${k}',${ws[ratioCol + row].v})`;
      con.query(`insert into zhiyalv (date, code, value) values ('${date}','${k}',${ws[ratioCol + row].v})`, function (err, result2) {
        // console.log(`insert into zhiyalv (date, code, value) values ('${date}','${k}',${ws[ratioCol + row].v})`);
        console.log(q);
        console.log(err);
      });
      if (notFound.indexOf(k) > -1) {
        notFound.splice(notFound.indexOf(k), 1);
      } else {
        console.warn(k, ' not found');
      }
      console.log(k, date, ws[ratioCol + row].v);
      //DATA_ZHIYA[code.v][date] = ws[ratioCol + row].v;
      //DATA_ZHIYA[code.v].isSZ = isSZ;
      // let tag = document.createElement('div');
      // let oldR = parseFloat(DATA[key][0]);
      // let amt = DATA[key][1];
      // let newR = parseFloat(ws[ratioCol + row].v);
      // tag.style = "color:" + (oldR == newR ? "green" : "red");
      // tag.innerText = key + " " + oldR + " " + newR;
      // resultEle.appendChild(tag);
      // oldCount += oldR * amt;
      // newCount += newR * amt;
      //console.log(oldCount, newCount)
    }
    row++;
    code = ws[codeCol + row];
  }
  for (let i = 0; i < notFound.length; i++) {
    let k = notFound[i];
    if (stockUtils.getMarket(k) == (isSZ ? 'sz' : 'sh')) {
      console.warn(k, ' 没有质押率');
      con.query(`insert into zhiyalv (date, code, value) values ('${date}','${notFound[i]}',0)`, function (err, result2) {});
    }
  }
  //console.log(oldCount, newCount)
  //console.log((isSZ ? "深圳" : "上海") + ` ${oldCount}(${oldCount*0.88}) => ${newCount}(${newCount * .88})`);

}

function loadXls(href, isSZ) {
  href = DL_URL + getFileName(href);
  if (URL_WHITE_LIST.indexOf(href) > -1) {
    href = XLS_WHITE_LIST[URL_WHITE_LIST.indexOf(href)];
  }
  return new Promise((resolve) => {
    //let filename = Date.now() + ".xls";
    let filename = "result.xls";
    var file = FS.createWriteStream(filename);
    HTTP.get(href, function (res) {
      res.on('data', function (data) {
        file.write(data);
      }).on('end', function () {
        file.end();
        console.log('reading ' + href);
        setTimeout(() => {
          readXls(filename, isSZ);
          resolve();
        }, 500);
      });
    });
  });
}

var notificationShown = false;
var sound = new Howl({
  src: ['alarm.mp3']
});
sound.play();
var soundPlaying = false;

function showNotification(msg) {
  notificationShown = true;
  let not = document.getElementById('notification');
  if (typeof (msg) == 'string') {
    let p = document.createElement('p');
    p.innerText = msg;
    not.appendChild(p);
  } else {
    not.appendChild(msg);
  }
  playNotificationSound();
}

function playNotificationSound() {
  if (!soundPlaying) {
    soundPlaying = true;
    setTimeout(() => soundPlaying = false, 1000);
    sound.play();
  }
}

// setInterval(showNotification, 3000);

function notificationClicked() {
  // if (notificationShown) {

  // } else {

  // }
  let not = document.getElementById('notification');
  // not.style.display = ''
  not.innerHTML = "";
  notificationShown = false;
}

function onAccountSelect(e) {
  console.log(e.value, 'haha');
  getAccountInfo(e.value)
    .then(() => initCangwei(e.value))
    .then(() => CHART.renderHistory(e.value));
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

STOCK_WATCHTABLE_DATA = {};

function updateStockWatchTable() {
  STOCK_WATCHTABLE_DATA = {};
  let div = document.getElementById("stockwatchTableContainer");
  let relative = document.getElementById('stockwl_relative').checked;
  console.log(relative);
  div.innerHTML = '';
  con.query('select distinct startdate from stockwatchlist order by startdate', function (err, r) {
    con.query(`select * from stockhistory where code = '000001.SH' and date>= '${r[0].startdate}'`, function (err, r2) {
      let indexData = {};
      for (let i = 0; i < r2.length; i++) {
        let d = r2[i];
        indexData[d.date] = d;
      }
      for (let i = 0; i < r.length; i++) {
        let date = r[i].startdate;
        renderStockWatchDateTable(date, indexData, relative);
      }
    });
  });


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



function renderStockWatchDateTable(date, indexData, relative = false) {
  let div = document.getElementById("stockwatchTableContainer");
  con.query(`select * from stockwatchlist
  left join stockhistory
  on stockwatchlist.code = stockhistory.code
  left join stockbasic
  on stockwatchlist.code = stockbasic.ts_code
  where stockhistory.date >= stockwatchlist.startdate and stockwatchlist.startdate = '${date}'
  order by stockwatchlist.code, stockhistory.date`, function (err, r) {
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

function onHideShowTopright(e) {
  console.log(event.target.value);
  let panel = document.getElementById("topRightPanel");
  if (event.target.value == "Hide") {
    panel.style.display = "none";
    event.target.value = "Show";
  } else {
    panel.style.display = "block";
    event.target.value = "Hide";

  }
}