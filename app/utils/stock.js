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

function isTradingTime() {
  let now = new Date();
  let hr = now.getHours();
  let min = now.getMinutes();
  let t0930 = (new Date()).setHours(9, 30);
  let t1130 = (new Date()).setHours(11, 30);
  let t1300 = (new Date()).setHours(13, 0);
  let t1500 = (new Date()).setHours(15, 0);
  return (now > t0930 && now < t1130) || (now > t1300 && now < t1500);
}

module.exports = {
  getMarket: getMarket,
  getStockIdWithPrefix: getStockIdWithPrefix,
  isTradingTime: isTradingTime
};