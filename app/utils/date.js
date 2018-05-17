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
  pad: pad
};

function getNowYYYYMMDD() {
  let now = new Date();
  return now.getFullYear() + pad(now.getMonth(), 2) + pad(now.getDate(), 2);
}


function getNowYYYYMMDDHHmm() {
  let now = new Date();
  return now.getFullYear() + pad(now.getMonth(), 2) + pad(now.getDate(), 2) + pad(now.getHours(), 2) + pad(now.getMinutes(), 2);
}

Date.prototype.addDays = function (days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}