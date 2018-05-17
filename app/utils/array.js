

function findItemByProperty(items, prop, value) {
  for(var i=0; i<items.length; i++){
    if(items[i][prop] == value)
      return items[i];
  }
  return null;
}

module.exports = {findItemByProperty:findItemByProperty
  
};