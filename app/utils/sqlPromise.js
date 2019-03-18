const DATE = require("./date");

function query(con, query) {
  return new Promise((resolve, reject) => {
    con.query(query, function (err, result) {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(result);
    });
  });
}

function getIndexLastDate(con) {
  return query(con, "select date from stockhistory where code = '000001.SH' order by date desc limit 1").then(d => d[0].date);
}

function getStockHistory(con, startdate, code='000001.SH', equal=false) {
  let nextDay = DATE.getYYYYMMDD(DATE.fromYYYYMMDD(startdate).addDays(1));
  return getIndexLastDate(con)
    .then(d => 
      query(con, `select * from stockhistory where code = '${code}' 
      and date >${equal?'=':''} '${startdate}' 
      order by date desc`)
    );
}

function getStockHistoryByWeek(con, startdate, code='000001.SH') {
  let nextDay = DATE.getYYYYMMDD(DATE.fromYYYYMMDD(startdate).addDays(1));
  return getIndexLastDate(con)
    .then(d => 
      query(con, `select * from stockhistory where code = '${code}' 
      and date in (select date from tradedate where (date > '${startdate}' and type = 'l') or date = '${d}' or date = '${nextDay}')
      order by date desc`)
    );
}

// function getStockQueryByWeek(code){
//   return `select * from stockhistory where code = '${code}' and date in (select date
//     ) order by date desc`;
// }

module.exports = {
  query: query,
  getIndexLastDate: getIndexLastDate,
  getStockHistory: getStockHistory,
  getStockHistoryByWeek: getStockHistoryByWeek,
};