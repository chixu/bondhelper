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

module.exports = {
  query: query
};