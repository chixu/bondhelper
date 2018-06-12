var con;
var lastupdate;

function init(_con) {
    con = _con
    con.query('select max(updatetime) as ans from news', function (err, r) {
        lastupdate = r[0].ans;

        setInterval(checkNews, 5000);
    });
}

function checkNews() {
    con.query(`select * from news where updatetime> '${lastupdate}'`, function (err, r) {
        if (r && r.length > 0) {
            lastupdate = r[0].lastupdate;
            for (let i = 0; i < r.length; i++) {
                console.log(r[i].title);
                showNotification(r[i].title);
            }
        }
    });

}

module.exports.init = init;