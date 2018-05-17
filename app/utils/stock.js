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

module.exports = {
  getMarket: getMarket,
  getStockIdWithPrefix: getStockIdWithPrefix
};