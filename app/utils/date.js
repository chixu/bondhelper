function getDateString(d) {
  return d.getFullYear().toString() + pad(d.getMonth() + 1, 2) + pad(d.getDate(), 2);
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

module.exports = {
  getDateString: getDateString,
  getNowYYYYMMDD: getNowYYYYMMDD,
  getYYYYMMDD: getYYYYMMDD,
  getDashYYYYMMDD: getDashYYYYMMDD,
  getNowYYYYMMDDHHmm: getNowYYYYMMDDHHmm,
  getNowYYYYMMDDHHmmSS: getNowYYYYMMDDHHmmSS,
  fromYYYYMMDD: fromYYYYMMDD,
  diffInDays: diffInDays,
  diffYYYYMMDDInDays: diffYYYYMMDDInDays,
  pad: pad
};

function getNowYYYYMMDD() {
  // let now = new Date();
  return getYYYYMMDD();
  // return '20190201';
}

function getDashYYYYMMDD(d) {
  if (d == undefined)
    d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2);
}

function getYYYYMMDD(d) {
  if (d == undefined)
    d = new Date();
  return d.getFullYear() + pad(d.getMonth() + 1, 2) + pad(d.getDate(), 2);
}

function getNowYYYYMMDDHHmm() {
  let now = new Date();
  return now.getFullYear() + pad(now.getMonth() + 1, 2) + pad(now.getDate(), 2) + pad(now.getHours(), 2) + pad(now.getMinutes(), 2);
}

function getNowYYYYMMDDHHmmSS() {
  let now = new Date();
  return now.getFullYear() + pad(now.getMonth() + 1, 2) + pad(now.getDate(), 2) + pad(now.getHours(), 2) + pad(now.getMinutes(), 2) + pad(now.getSeconds(), 2);
}

function fromYYYYMMDD(str) {
  return new Date(str.substr(0, 4) + '-' + str.substr(4, 2) + '-' + str.substr(6, 2));
}

//d1 - d2 in days
function diffInDays(d1, d2) {
  // console.log(d1.getTime(), d2.getTime());
  var timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(timeDiff / (1000 * 3600 * 24));
}

//d1 - d2 in days
function diffYYYYMMDDInDays(d1, d2) {
  return diffInDays(fromYYYYMMDD(d1), fromYYYYMMDD(d2));
}

Date.prototype.addDays = function (days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}