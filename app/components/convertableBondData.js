var con;
// var lastupdate;

function init(_con) {
    con = _con
    getConvertBondInfo();
}

function getConvertBondInfo() {
    let _resolve;
    $.ajax({
        url: "https://www.jisilu.cn/data/cbnew/cb_list/",
        context: document.body
    }).done(function (data) {
        console.log(data);
        _resolve();
    });
    return new Promise((resolve) => {
        _resolve = resolve
    })
}

module.exports.init = init;