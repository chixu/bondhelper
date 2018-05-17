const LineByLineReader = require('line-by-line');

function read(path) {
  let _resolve;
  let res = {
    data: []
  };
  lr = new LineByLineReader(path);
  lr.on('error', function (err) {
    console.log('error on read ' + path);
  });
  lr.on('line', function (line) {
    let arr = line.split('\t');
    if (res.head) {
      res.data.push(arr);
    } else {
      res.head = arr;
    }
  });

  lr.on('end', function () {
    console.log('end', res);
    _resolve(res);
  });

  return new Promise(resolve => {
    _resolve = resolve;
  })
}

module.exports = {
  read: read
};