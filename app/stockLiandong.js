var con;
const DATE = require("./utils/date");
const STOCK = require("./utils/stock");
const sqlBuilder = require("./utils/sqlBuilder");


const FS = require("fs");
//let DATA = JSON.parse(FS.readFileSync("data.json", "utf8"));

const hushen300 = [
    '603993',
    '603986',
    '603858',
    '603833',
    '603799',
    '603288',
    '603260',
    '603259',
    '603160',
    '603156',
    '601998',
    '601997',
    '601992',
    '601991',
    '601989',
    '601988',
    '601985',
    '601939',
    '601933',
    '601919',
    '601901',
    '601899',
    '601898',
    '601888',
    '601881',
    '601878',
    '601877',
    '601857',
    '601838',
    '601828',
    '601818',
    '601808',
    '601800',
    '601788',
    '601766',
    '601727',
    '601688',
    '601669',
    '601668',
    '601633',
    '601628',
    '601618',
    '601611',
    '601607',
    '601601',
    '601600',
    '601555',
    '601398',
    '601390',
    '601377',
    '601360',
    '601336',
    '601333',
    '601328',
    '601318',
    '601288',
    '601238',
    '601229',
    '601228',
    '601225',
    '601216',
    '601212',
    '601211',
    '601198',
    '601186',
    '601169',
    '601166',
    '601155',
    '601138',
    '601117',
    '601111',
    '601108',
    '601088',
    '601066',
    '601021',
    '601018',
    '601012',
    '601009',
    '601006',
    '600999',
    '600998',
    '600977',
    '600958',
    '600926',
    '600919',
    '600909',
    '600900',
    '600893',
    '600887',
    '600886',
    '600867',
    '600837',
    '600816',
    '600809',
    '600795',
    '600760',
    '600741',
    '600739',
    '600705',
    '600704',
    '600703',
    '600690',
    '600688',
    '600674',
    '600660',
    '600637',
    '600606',
    '600588',
    '600585',
    '600583',
    '600570',
    '600566',
    '600549',
    '600547',
    '600535',
    '600522',
    '600519',
    '600518',
    '600516',
    '600498',
    '600489',
    '600487',
    '600482',
    '600438',
    '600436',
    '600415',
    '600406',
    '600398',
    '600390',
    '600383',
    '600372',
    '600369',
    '600362',
    '600352',
    '600346',
    '600340',
    '600339',
    '600332',
    '600309',
    '600297',
    '600276',
    '600271',
    '600233',
    '600221',
    '600219',
    '600208',
    '600196',
    '600188',
    '600177',
    '600176',
    '600170',
    '600157',
    '600153',
    '600118',
    '600115',
    '600111',
    '600109',
    '600104',
    '600100',
    '600089',
    '600085',
    '600068',
    '600066',
    '600061',
    '600050',
    '600048',
    '600038',
    '600036',
    '600031',
    '600030',
    '600029',
    '600028',
    '600027',
    '600025',
    '600023',
    '600019',
    '600018',
    '600016',
    '600015',
    '600011',
    '600010',
    '600009',
    '600004',
    '600000',
    '300433',
    '300408',
    '300296',
    '300251',
    '300144',
    '300142',
    '300136',
    '300124',
    '300122',
    '300072',
    '300070',
    '300059',
    '300033',
    '300024',
    '300017',
    '300015',
    '300003',
    '002925',
    '002797',
    '002773',
    '002736',
    '002714',
    '002673',
    '002625',
    '002624',
    '002602',
    '002601',
    '002594',
    '002572',
    '002558',
    '002555',
    '002508',
    '002493',
    '002475',
    '002468',
    '002466',
    '002460',
    '002456',
    '002450',
    '002422',
    '002415',
    '002411',
    '002352',
    '002311',
    '002310',
    '002304',
    '002294',
    '002271',
    '002252',
    '002241',
    '002236',
    '002230',
    '002202',
    '002179',
    '002153',
    '002146',
    '002142',
    '002120',
    '002085',
    '002081',
    '002065',
    '002050',
    '002044',
    '002032',
    '002027',
    '002024',
    '002008',
    '002007',
    '002001',
    '001979',
    '001965',
    '000983',
    '000963',
    '000961',
    '000959',
    '000938',
    '000898',
    '000895',
    '000876',
    '000858',
    '000839',
    '000826',
    '000792',
    '000786',
    '000783',
    '000776',
    '000768',
    '000728',
    '000725',
    '000709',
    '000703',
    '000671',
    '000661',
    '000651',
    '000630',
    '000627',
    '000625',
    '000568',
    '000553',
    '000538',
    '000503',
    '000425',
    '000423',
    '000415',
    '000413',
    '000408',
    '000402',
    '000338',
    '000333',
    '000166',
    '000157',
    '000100',
    '000069',
    '000063',
    '000002',
    '000001',
    '000001.SH'
]

function init(_con) {
    con = _con
    window['getLiandong'] = getLiandong;
}

var RESULT;


function getLiandong() {
    RESULT = {};
    RESULT.config = {
        day: 0,
        startdate: '20180101',
        enddate: '20181231',
    };
    let promise = Promise.resolve();
    console.log('start');

    // getLiandong2({
    //     source: '603993.SH',
    //     target: '601919.SH',
    //     day: RESULT.config.day,
    //     startdate: RESULT.config.startdate,
    //     enddate: RESULT.config.enddate,
    // })
    for (let i = 0; i < hushen300.length; i++) {
        let source = hushen300[i];
        for (let j = 0; j < hushen300.length; j++) {
            let target = hushen300[j];
            if (source != target) {
                let config = {
                    source: source,
                    target: target,
                    day: RESULT.config.day,
                    startdate: RESULT.config.startdate,
                    enddate: RESULT.config.enddate,
                }
                promise = promise.then(() => getLiandong2(config));
            }
        }
        // break;
    }
    promise.then(() => {
        console.log('done');
        // FS.writeFileSync("liandong1.json", JSON.stringify(RESULT, null, 2), "utf8");
    });
}

//source 
//target
//day 1  source day 0101  target day 0102 
//day 0  source day 0101  target day 0101
//day -1  source day 0102  target day 0101
//startdate
//enddate
function getLiandong2(config) {
    let _resolve;

    let source = STOCK.getFullName(config.source);
    let target = STOCK.getFullName(config.target);
    let day = config.day;
    let startdate = config.startdate;
    let enddate = config.enddate;
    let dates = [];
    let results = {};
    results[source] = {};
    results[target] = {};
    let res = {};
    con.query(`select * from tradedate where date >= '${startdate}' and date<='${enddate}' order by date asc`, function (err, r) {
        for (let i = 0; i < r.length; i++) {
            dates.push(r[i].date);
        }
        con.query(`select * from stockhistory where date >= '${startdate}' and date<='${enddate}' 
        and code in ('${source}', '${target}')`, function (err, r2) {
            for (let i = 0; i < r2.length; i++) {
                let d = r2[i];
                results[d.code][d.date] = parseFloat(d.pct_chg);
            }
            let count = 0;
            let sameSignCount = 0;
            let total = 0;
            let totalsqr = 0;
            for (let i = 0; i < dates.length; i++) {
                let sday = dates[i];
                let tday;
                if (day == 1) tday = getNextDay(dates, sday);
                if (day == -1) tday = getPrevDay(dates, sday);
                if (day == 0) tday = sday;
                if (sday && tday && !isNaN(results[source][sday]) && !isNaN(results[target][tday])) {
                    count++;
                    let v1 = results[source][sday];
                    let v2 = results[target][tday];
                    let v = v1 - v2;
                    // results.result.data.push(v);
                    if (v1 * v2 > 0) sameSignCount++;
                    total += v;
                    totalsqr += v * v;
                    // console.log(sday, tday, v1, v2, v, total, totalsqr, sameSignCount, count);
                }
            }
            if (count > 0) {
                res.mean = total / count;
                res.samesign = sameSignCount / count;
                res.standev = totalsqr / count;
                res.count = count;
                // res.target = target;
                RESULT.config.dayscount = day == 0 ? dates.length : dates.length - 1;
                // console.log(source, target);
                // if (RESULT[source] == undefined)
                //     RESULT[source] = {};
                // RESULT[source][target] = res;
                con.query(sqlBuilder.insertOrUpdate('stockliandong', {
                    source: source,
                    target: target,
                    mean: total / count,
                    days: day == 0 ? dates.length : dates.length - 1,
                    standev: totalsqr / count,
                    samesign: sameSignCount / count,
                    count: count,
                    daydiff: day,
                    startdate: startdate,
                    enddate: enddate
                }, ['mean', 'days', 'standev', 'samesign', 'count', 'daydiff'], ['mean', 'days', 'standev', 'samesign', 'count']));
            }
            _resolve();
        });
    });
    return new Promise(resolve => _resolve = resolve);
}

function getNextDay(dates, date) {
    let idx = dates.indexOf(date);
    if (idx > -1 && idx < dates.length - 1)
        return dates[idx + 1];
    return undefined;
}

function getPrevDay(dates, date) {
    let idx = dates.indexOf(date);
    if (idx > 0)
        return dates[idx - 1];
    return undefined;
}

module.exports.init = init;