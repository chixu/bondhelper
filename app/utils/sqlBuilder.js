function insertOrUpdate(table, cols, values, numCols, keys) {
    if (numCols == undefined) numCols = [];
    if (keys == undefined) keys = [];
    let colvaluestr = '';
    for (let i = 0; i < cols.length; i++) {
        let col = cols[i];
        colvaluestr += col + '='
        if (numCols.indexOf(col) == -1)
            colvaluestr += "'" + values[i] + "',";
        else
            colvaluestr += values[i] + ",";
    }
    colvaluestr = colvaluestr.substr(0, colvaluestr.length - 1);
    return insert(table, cols, values, numCols) + ' ON DUPLICATE KEY UPDATE ' + colvaluestr;
}

function insert(table, cols, values, numCols) {
    if (numCols == undefined) numCols = [];
    let colstr = '';
    let valuestr = '';
    let colvaluestr = '';
    for (let i = 0; i < cols.length; i++) {
        let col = cols[i];
        colstr += col + ','
        if (numCols.indexOf(col) == -1)
            valuestr += "'" + values[i] + "',";
        else
            valuestr += values[i] + ",";
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