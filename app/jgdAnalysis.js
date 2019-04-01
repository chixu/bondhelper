var con;
let codeMatch;
let jiaogedanMode;
const DATE = require("./utils/date");
const excel = require("./utils/excelFormula");
const TABLE = require("./utils/table");


function init(_con) {
  con = _con
  window['getJiaogedan'] = getJiaogedan;
}

// jiaogedanPanel
function isActionBuy(action) {
  if (jiaogedanMode == 'zzdx')
    return action.substr(0, 1) == '配';
  return (action == '买入' || action.substr(0, 1) == '配')
}

function isActionSell(action) {
  return action == '卖出';
}

function jgdAnalysis(r, r2, indexData, lastIndexDate) {
  // console.log(excel.XIRR([-6869, 6838.15], [new Date('2017-12-05'), new Date('2017-12-07')]))
  // console.log(excel.XIRR([-5913.12, 5653.21], [new Date('2017-12-12'), new Date('2017-12-15')]))
  // // console.log(excel.XIRR([-2830, 2200.79,553.44], [new Date('2017-12-07'), new Date('2017-12-08'), new Date('2017-12-19')]))
  // return;
  let data = [];
  let totalWinCount = 0;
  let totalCount = 0;
  let totalWin = 0;
  let totalWinIndexCount = 0;
  for (let i = 0; i < r.length; i++) {
    let d = r[i];
    let action = d.caozuo;
    let code = d.code;
    let name = d.name;
    let junjia = d.junjia;
    // let datetime = d.datetime;
    let date = DATE.getYYYYMMDD(d.datetime);
    let count = d.count;
    let price = action.substr(0, 1) == '配' ? -d.junjia * count : d.fashengjine;
    let lastTrade = findLastTrade(data, code);
    let historyData = {
      'date': date,
      'price': price,
      'action': action,
      'count': count,
    };
    if (isActionBuy(action)) {
      if (lastTrade == undefined || lastTrade.count == 0) {
        data.push({
          'code': code,
          'name': name,
          'startdate': date,
          'win': price,
          'count': count,
          'maxcount': count,
          'history': [historyData]
        })
      } else {
        lastTrade.win += price;
        lastTrade.count += count;
        lastTrade.maxcount += count;
        lastTrade.history.push(historyData);
      }
    } else if (isActionSell(action)) {
      if (lastTrade) {
        lastTrade.count -= count;
        lastTrade.win += price;
        lastTrade.history.push(historyData);
        if (lastTrade.count < 0) console.error(code, name, 'lastTrade.count < 0');
        if (lastTrade.count == 0) {
          lastTrade.enddate = date;
          let indexStart = getIndexData(indexData, lastTrade.startdate, lastIndexDate);
          let indexEnd = getIndexData(indexData, lastTrade.enddate, lastIndexDate);
          lastTrade.indexwinrate = getPercentInc(indexStart, indexEnd);
          // data.winrate = xirr();

          // let excelFormula = new excel.ExcelFormulas();
          // console.log(code);
          lastTrade.winrate = xirr(lastTrade.history);
          lastTrade.winindexrate = lastTrade.winrate - lastTrade.indexwinrate;
          if (lastTrade.winrate != NaN) {
            totalWinCount += lastTrade.winrate > 0 ? 1 : 0;
            totalCount++;
            totalWin += lastTrade.win;
            totalWinIndexCount += lastTrade.winindexrate > 0 ? 1 : 0;
          }
        }
      } else {
        console.error(code, name, 'no last trade');
      }
    }
  } //END OF FOR

  //handle cangwei
  for (let i = 0; i < r2.length; i++) {
    let d = r2[i];
    let code = d.code;
    let name = d.name;
    let date = d.date;
    let count = d.count;
    let price = d.price * count;
    let lastTrade = findLastTrade(data, code);
    let historyData = {
      'date': date,
      'price': price,
      'count': count,
    };
    console.log(d, lastTrade);
    if (lastTrade) {
      lastTrade.count -= count;
      lastTrade.win += price;
      lastTrade.history.push(historyData);
      if (lastTrade.count < 0) console.error(code, name, 'lastTrade.count < 0');
      if (lastTrade.count == 0) {
        lastTrade.color = '#ffff00';
        lastTrade.enddate = date;
        let indexStart = getIndexData(indexData, lastTrade.startdate, lastIndexDate);
        let indexEnd = getIndexData(indexData, lastTrade.enddate, lastIndexDate);
        lastTrade.indexwinrate = getPercentInc(indexStart, indexEnd);
        lastTrade.winrate = xirr(lastTrade.history);
        lastTrade.winindexrate = lastTrade.winrate - lastTrade.indexwinrate;
        // if (lastTrade.winrate != NaN && lastTrade.color == undefined) {
        //   totalWinCount += lastTrade.winrate > 0 ? 1 : 0;
        //   totalCount++;
        //   totalWinIndexCount += lastTrade.winindexrate > 0 ? 1 : 0;
        // }
      }
    } else {
      console.error(code, name, 'no last trade');
    }
  } //END OF FOR

  console.log(data);
  console.log(totalWin, totalCount, totalWinCount, totalWinIndexCount);
  let tableRender = new TABLE.TableRenderer(data);
  tableRender.addColumn('code');
  tableRender.addColumn('name');
  tableRender.addColumn('startdate');
  tableRender.addColumn('enddate');
  tableRender.addColumn('win');
  tableRender.addColumn('maxcount');
  tableRender.addColumn('indexwinrate', '指数涨幅', '{"percent":true, "rbcolor":true}');
  tableRender.addColumn('winrate', '收益', '{"percent":true, "rbcolor":true}');
  tableRender.addColumn('winindexrate', '相对收益', '{"percent":true, "rbcolor":true}');
  // tableRender.color(d=>d.color);
  tableRender.render('jiaogedanPanel');
  return data;
}

function getIndexData(indexData, date, lastIndexDate) {
  if (indexData[date] != undefined)
    return indexData[date];
  else {
    if (lastIndexDate < date) {
      return indexData[lastIndexDate];
    } else {
      console.error('getIndexData', date, lastIndexDate);
    }
  }
}


function getDate(str) {
  return str.substr(0, 4) + str.substr(5, 2) + str.substr(8, 2);
}

function xirr(history) {
  if (history.length < 2) return 0
  // let paras = [];
  let values = [];
  let dates = [];
  for (let i in history) {
    let d = history[i].date;
    // paras.push({
    //   Date: new Date(d.substr(0, 4) + "-" + d.substr(4, 2) + "-" + d.substr(6, 2)),
    //   Flow: history[i].price
    // });
    values.push(history[i].price);
    dates.push(new Date(d.substr(0, 4) + "-" + d.substr(4, 2) + "-" + d.substr(6, 2)));
  }
  var finance = new Finance();
  // let xir = finance.XIRR(values, dates, 0.1);
  let xir = excel.XIRR(values, dates);
  let dateDiff = DATE.diffYYYYMMDDInDays(history[history.length - 1].date, history[0].date);
  // console.log(xir, dateDiff);
  return Math.pow(1 + xir, dateDiff) - 1;
}

function getJiaogedan(mode) {

  //read all trade history

  //select * from trade history order by date asc
  jiaogedanMode = mode;
  let query = `select * from jiaogedan2 order by datetime asc`;
  if (mode == 'zzdx')
    query = `select * from jiaogedan2 where code in (select code from shengou ) or  code in (select stockcode from shengou ) order by datetime asc`;
  con.query(query, function (err, r) {
    // con.query(`select * from jiaogedan2 order by datetime asc`, function (err, r) {
    let firstdate = DATE.getYYYYMMDD(r[0].datetime);
    console.log(typeof (firstdate));
    // firstdate = firstdate.substr(0, 4) + firstdate.substr(5, 2) + firstdate.substr(8, 2);
    con.query(`select * from stockhistory where code = '000001.SH' and date>= '${firstdate}' order by date asc`, function (err, r2) {
      let indexData = {};
      for (let i = 0; i < r2.length; i++) {
        indexData[r2[i].date] = parseFloat(r2[i].close);
      }
      con.query(`select * from bond.cangwei where account = 'cx' and date in (
        SELECT max(date) FROM bond.cangwei where account = 'cx')`, function (err, r3) {
        con.query(`select * from shengou`, function (err, r4) {
          codeMatch = {}
          for (let i = 0; i < r4.length; i++) {
            codeMatch[r4[i].stockcode] = r4[i].code;
          }
          codeMatch['601360'] = '601313';
          jgdAnalysis(r, r3, indexData, r2[r2.length - 1].date);
        });
      });
    });

  });
}

function getPercentInc(from, to) {
  return to / from - 1;
}

function findLastTrade(data, code) {
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].code == code)
      return data[i];
    if (codeMatch[code] && data[i].code == codeMatch[code])
      return data[i];
  }
  return undefined;
}


module.exports.init = init;