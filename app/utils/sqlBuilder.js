function insertOrUpdate(table, sqlData, numCols, updateCols) {
    if (numCols == undefined) numCols = [];
    if (updateCols == undefined) updateCols = [];
    let colvaluestr = '';
    for (let k in updateCols) {
        let col = updateCols[k];
        colvaluestr += col + '='
        if (numCols.indexOf(col) == -1)
            colvaluestr += "'" + sqlData[col] + "',";
        else
            colvaluestr += sqlData[col] + ",";
    }
    colvaluestr = colvaluestr.substr(0, colvaluestr.length - 1);
    let sql = insert(table, sqlData, numCols) + ' ON DUPLICATE KEY UPDATE ' + colvaluestr;
    // console.log(sql);
    return sql;
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