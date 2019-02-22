function insertOrUpdate(table, sqlData, numCols, keys) {
    if (numCols == undefined) numCols = [];
    if (keys == undefined) keys = [];
    let colvaluestr = '';
    for (let k in sqlData) {
        let col = k;
        colvaluestr += col + '='
        if (numCols.indexOf(col) == -1)
            colvaluestr += "'" + sqlData[k] + "',";
        else
            colvaluestr += sqlData[k] + ",";
    }
    colvaluestr = colvaluestr.substr(0, colvaluestr.length - 1);
    return insert(table, cols, values, numCols) + ' ON DUPLICATE KEY UPDATE ' + colvaluestr;
}

function insert(table, sqlData, numCols) {
    if (numCols == undefined) numCols = [];
    let colstr = '';
    let valuestr = '';
    let colvaluestr = '';
    for (let k in sqlData) {
        let col = k;
        colstr += col + ','
        if (numCols.indexOf(col) == -1)
            valuestr += "'" + sqlData[k] + "',";
        else
            valuestr += sqlData[k] + ",";
    }
    colstr = colstr.substr(0, colstr.length - 1);
    valuestr = valuestr.substr(0, valuestr.length - 1);

    return `INSERT INTO ${table} (${colstr})
    VALUES(${valuestr})`;
}

module.exports = {
    insertOrUpdate: insertOrUpdate,
    insert: insert,
};