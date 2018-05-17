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

const URL = "http://www.chinaclear.cn/zdjs/xbzzsl/center_bzzsl.shtml";
const DL_URL = "http://www.chinaclear.cn/zdjs/editor_file/";
//let DATA = JSON.parse(FS.readFileSync("data.json", "utf8"));
// let CONFIG = JSON.parse(FS.readFileSync("config.json", "utf8"));

let DATA_CANGWEI = {};
let DATA_ZHIYA = {};

const BOND_TABLE = require('./bondTable');
const BOND_NEWS = require('./bondNewsTable');
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

init2();

function init2() {
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query('select * from cangwei', function (err, result) {
      if (err) throw err;
      console.log(result);
      for (let i = 0; i < result.length; i++) {
        let res = result[i];
        DATA_CANGWEI[res['code']] = {
          count: parseInt(res['count']) * (stockUtils.getMarket(res.code) == 'sh' ? 10 : 1),
          name: res.name
        };
      }
      con.query('select * from zhiya', function (err, result2) {
        if (err) throw err;
        for (let i = 0; i < result2.length; i++) {
          //DATA_ZHIYA[result2[i]['code']] = parseInt(result2[i]['count']);
          let res = result2[i];
          DATA_ZHIYA[res.code] = {
            count: parseInt(res['count']) * (stockUtils.getMarket(res.code) == 'sh' ? 10 : 1),
            name: res.name
          };
        }
        for (let k in DATA_ZHIYA) {
          if (DATA_CANGWEI[k] == undefined) {
            DATA_CANGWEI[k] = DATA_ZHIYA[k];
          } else {
            DATA_CANGWEI[k].count = DATA_CANGWEI[k].count + DATA_ZHIYA[k].count;
          }
          // DATA_ZHIYA[k] = {
          //   count: DATA_ZHIYA[k]
          // };
        }
        let ids = '';
        for (let k in DATA_CANGWEI) {
          ids += "'" + k + "',"
        }
        con.query(`select shuiqian,code from bond where code in (${ids.substr(0, ids.length-1)})`, function (err, result3) {
          for (let k in DATA_CANGWEI) {
            DATA_CANGWEI[k].shuiqian = 0;
            for (let k2 in result3) {
              if (k == result3[k2].code) {
                DATA_CANGWEI[k].shuiqian = result3[k2].shuiqian;
                break;
              }
            }
          }
          console.log('DATA_CANGWEI', JSON.stringify(DATA_CANGWEI, null, 2));
          console.log('DATA_ZHIYA', JSON.stringify(DATA_ZHIYA, null, 2));
          BOND_TABLE.init(con);
          CHART.init(con);
          //migrateBondData();
          initCangwei();
          renderTable2();
          renderNews();
        });
      });
    });
  });
}

function initCangwei() {
  let cangwei = document.getElementById("cangwei");
  let table = document.createElement("table");
  cangwei.appendChild(table);
  let total = 0;
  for (let key in DATA_CANGWEI) {
    if (['131990', '888880'].indexOf(key) > -1)
      continue;
    total += DATA_CANGWEI[key].count;
  }
  let sortedCangwei = [];
  for (let key in DATA_CANGWEI) {
    let count = DATA_CANGWEI[key].count;
    let inserted = false;
    for (let i = 0; i < sortedCangwei.length; i++) {
      if (sortedCangwei[i].count < count) {
        sortedCangwei.splice(i, 0, {
          id: key,
          count: count
        })
        inserted = true;
        break;
      }
    }
    if (!inserted)
      sortedCangwei.push({
        id: key,
        count: count
      });
  }
  let maxWidth = 600;
  let totalShouyi = 0;
  for (let i = 0; i < sortedCangwei.length; i++) {
    let key = sortedCangwei[i].id;
    if (['131990', '888880'].indexOf(key) > -1)
      continue;
    let row = document.createElement("tr");
    let count = DATA_CANGWEI[key].count;
    totalShouyi += count / total * DATA_CANGWEI[key].shuiqian;
    row.innerHTML = `<td>${key}</td><td>${DATA_CANGWEI[key].name}</td><td>${DATA_CANGWEI[key].count}(${(count/total*100).toFixed(2)}%)</td>
    <td>${DATA_CANGWEI[key].shuiqian}</td><td><div style="width:${maxWidth*count/total}px;height:10px;background:blue"></div></td>`;
    table.appendChild(row);
  }
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

function updateTableInfo() {
  BOND_TABLE.updateTableInfo();
}
//getNormalBond();

function renderNews() {
  con.query('select * from news', function (err, r) {
    let list = document.createElement('ul');
    list.style.marginLeft = "-15px";
    let res = document.getElementById('bondNews');
    res.appendChild(list);
    for (let i = 0; i < r.length; i++) {
      let d = r[i];
      let row = document.createElement('li');
      row.innerHTML = `<a style="margin-left:-5px" href="${d.url}">${d.date} ${d.title}</a>`;
      list.appendChild(row);
    }
  });
}

function renderTable2() {
  con.query('select distinct date from zhiyalv', function (err, r1) {
    BOND_DATES = [];
    for (let i = 0; i < r1.length; i++) {
      BOND_DATES.push(r1[i]['date']);
    }
    con.query('select * from zhiyalv', function (err, r2) {
      for (let i = 0; i < r2.length; i++) {
        DATA_ZHIYA[r2[i].code][r2[i].date] = [r2[i].value];
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
  for (let key in DATA_ZHIYA) {
    let row = document.createElement("tr");
    let rowtxt = `<td>${key}<br>${DATA_ZHIYA[key].name}</td>`;
    let prevRate;
    for (let i = 0; i < BOND_DATES.length; i++) {
      let rate = parseFloat(DATA_ZHIYA[key][BOND_DATES[i]]);
      if (i == 0) {
        prevRate = rate;
      } else {
        if (prevRate != rate) {
          row.style.backgroundColor = "yellow";
        }
      }
      rowtxt += `<td>${rate}</td>`;
      if (stockUtils.getMarket(key) == 'sz') {
        dateInfo[BOND_DATES[i]].szsum += DATA_ZHIYA[key].count * rate;
      } else {
        dateInfo[BOND_DATES[i]].shsum += DATA_ZHIYA[key].count * rate;
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
      renderTable2();
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
  for (let k in DATA_ZHIYA)
    notFound.push(k);
  while (code) {
    let k = code.v;
    if (DATA_ZHIYA[k]) {
      con.query(`insert into zhiyalv (date, code, value) values ('${date}','${k}',${ws[ratioCol + row].v})`, function (err, result2) {});
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

function notificationClicked(){

}