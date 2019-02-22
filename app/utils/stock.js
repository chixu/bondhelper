function getStockIdWithPrefix(id) {
  return getMarket(id) + id;
}

function getMarket(id) {
  if (id == '131990') return 'sz';
  if (['112'].indexOf(id.toString().substr(0, 3)) > -1) {
    return 'sz';
  }
  return 'sh';
}

function isBond(id) {
  return id.toString().substr(0, 1) == "1" || id.toString().substr(0, 2) == "01";
}

function getStockCount(count, code) {
  if (!isBond(code))
    return count;
  return count * (getMarket(code) == 'sh' ? 10 : 1);
}

function isTradingTime() {
  let now = new Date();
  let hr = now.getHours();
  let min = now.getMinutes();
  let t0930 = (new Date()).setHours(9, 15);
  let t1130 = (new Date()).setHours(11, 30);
  let t1300 = (new Date()).setHours(13, 0);
  let t1500 = (new Date()).setHours(15, 0);
  return (now > t0930 && now < t1130) || (now > t1300 && now < t1500);
}

module.exports = {
  getMarket: getMarket,
  isBond: isBond,
  getStockCount: getStockCount,
  getStockIdWithPrefix: getStockIdWithPrefix,
  isTradingTime: isTradingTime
};