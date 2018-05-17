function forEachElement(root, handler) {
  if (!root) {
    return;
  }
  let nodes = root.childNodes;
  let count = nodes.length;
  let idx = 0;
  for (let i = 0; i < count; i++) {
    let node = root.childNodes[i];
    if (node.nodeType === Node.ELEMENT_NODE) {
      handler(node, idx);
      idx++;
    }
  }
}

function child(root, index) {
  if (!root) {
    return;
  }
  let nodes = root.childNodes;
  let count = nodes.length;
  let idx = 0;
  for (let i = 0; i < count; i++) {
    let node = root.childNodes[i];
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (index == idx)
        return node;
      idx++;
    }
  }
}

function attr(node, key, defaultValue) {
  if (!node) {
    return defaultValue;
  }
  if (node.attributes[key]) {
    return node.attributes[key].value;
  }
  return defaultValue;
}

function value(node) {
  if (!node) {
    return;
  }
  return node.innerText;
}

module.exports = {
  forEachElement: forEachElement,
  child: child,
  value: value,
  attr: attr
};


// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != 'undefined' ?
        args[number] :
        match;
    });
  };
}