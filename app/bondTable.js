let JISILU_URL = "https://www.jisilu.cn/data/bond/?do_search=true&sort_column=&sort_order=&forall=0&treasury=0&from_rating=96&from_issuer_rating=96&from_year_left=0&from_repo=0&from_ytm=7&from_volume=1&from_market=&y1=&y2=&to_rating=99&to_issuer_rating=99&to_year_left=1&to_repo=2&to_ytm=30&to_volume=";
let JISILU_INFO_URL = "https://www.jisilu.cn/data/bond/detail/";
let STOCK_API = "http://hq.sinajs.cn/list=";
let BOND_DATA = {};
let IDX_TABLE_ID = 0;
let IDX_TABLE_NAME = 1;
let IDX_TABLE_XIANJIA = 2;
let IDX_TABLE_QUANJIA = 3;
let IDX_TABLE_ZHANGFU = 4;
let IDX_TABLE_CHENGJIAO = 5;
let IDX_TABLE_JUFUXI = 6;
let IDX_TABLE_NIANXIAN = 7;
let IDX_TABLE_SHUIQIAN = 9;
let IDX_TABLE_SHUIHOU = 10;
let IDX_TABLE_PIAOXI = 11;
let IDX_TABLE_ZHESUAN = 12;
let IDX_TABLE_XINYONG = 14;
let IDX_TABLE_DANBAO = 16;
let IDX_TABLE_DAOQI = 17;
let IDX_TABLE_GUIMO = 18;
let IDX_TABLE_15 = 19;
let IDX_TABLE_16 = 20;
let IDX_TABLE_BEIZHU = 21;
let XINYONG_RANK = ["AAA", "AA+", "AA", "AA-"];
const stockAPIPara = {
  xianjia: 3,
  chengjiao: 9,
  buy1count: 10,
  buy1price: 11,
  sell1count: 20,
  sell1price: 21,
}
const TABLE_COLS = [{
  k: "count",
  v: "数量"
}, {
  k: "id",
  v: "代码"
}, {
  k: "name",
  v: "名称"
}, {
  k: "zhangfu",
  v: "涨幅"
}, {
  k: "xianjia",
  v: "现价"
}, {
  //   k: "quanjia",
  //   v: "全价"
  // }, {
  k: "shuiqian",
  v: "税前"
}, {
  k: "shuiqianhuigou",
  v: "税前+回购"
}, {
  k: "buy1",
  v: "买一"
}, {
  k: "sell1",
  v: "卖一"
}, {
  k: "chengjiao",
  v: "成交"
}, {
  //   k: "jufuxi",
  //   v: "距付息"
  // }, {
  k: "nianxian",
  v: "年限"
}, {
  k: "zhesuan",
  v: "折算"
}, {
  k: "piaoxi",
  v: "票息"
}, {
  k: "xinyong",
  v: "信用"
}, {
  k: "guimo",
  v: "规模"
}, {
  k: "danbao",
  v: "担保"
}, {
  k: "info",
  v: "发行人"
}];

var con;
var DATA_TABLE = {};
var DATA_STOCKINFO = {};
var DATA_COLS = "color,comment,stockcode,name,xianjia,quanjia,zhangfu,chengjiao,jufuxi,nianxian,shuiqian,shuihou,piaoxi,zhesuan,xinyong,danbao,guimo,info,comment".split(',');
const stockUtils = require("./utils/stock");
const dateUtils = require("./utils/date");
// DATA_TABLE = JSON.parse(FS.readFileSync("table.json", "utf8"));
let CUR_TABLE;
let UPDATED_CELLS;




function init(_con) {
  con = _con
  //migration
  // for (let k in CONFIG.hint) {
  //   let v = CONFIG.hint[k];
  //   if(v){
  //     //console.log(rgbToHexString(v));
  //     con.query(`update bond set comment = '${v}' where code='${k}'`);
  //   }
  // }
  con.query(`select * from stockinfo`, function (err, r2) {
    for (let i = 0; i < r2.length; i++) {
      let id = r2[i].code;
      let info = '流资' + r2[i].currentasset + ' 流债' + r2[i].currentliabilities + ' 库存' + r2[i].inventories + ' 净利' + r2[i].netprofitinc + ' 总' + (r2[i].currentasset + r2[i].longtermasset).toFixed(2) + ' 债' + (((r2[i].currentliabilities + r2[i].longtermliabilities)) / ((r2[i].currentasset + r2[i].longtermasset))).toFixed(2);
      DATA_STOCKINFO['' + id] = info;
    }
    con.query(`select * from bond where deleted=0 and lastupdated > '${dateUtils.getNowYYYYMMDD()}'`, function (err, r) {
      for (let i = 0; i < r.length; i++) {
        //console.log(r[i]);
        let id = r[i].code;
        let obj = {
          'id': id
        };
        for (let j = 0; j < DATA_COLS.length; j++) {
          obj[DATA_COLS[j]] = r[i][DATA_COLS[j]];
        }
        //migration
        // if (obj.info) {
        //   let m = obj.info.match(/\d{6}/);
        //   if (m)
        //     //console.log(id, m[0]);
        //     con.query(`update bond set stockcode = '${m[0]}' where code='${id}'`);
        // }
        DATA_TABLE[id] = obj;
      }
      createTable();
      setInterval(updateCurrentTable, 10000);
    });
  });
}
//updateTable("112188", "info");
//updateTableAllRows();
//updateInfo();
//getBondTable();

/* <td class="acenter">
    <a href="/data/bond/detail/122483" target="_blank">122483</a>
</td>
<td class="acenter nowrap" title="发行人:新光控股集团有限公司">15新光01
    <span title="合格投资者可买" style="color:#FFA500;">
        <sup>Q</sup>
    </span>
</td>
<td title="最后更新时间:15:00:00">68.400</td>
<td title="应计息：1.799">70.199</td>
<td class=" green">-0.13%</td>
<td>7.48</td>
<td>265</td>
<td class="aleft">0.73/
    <font size="-2">2.73</font>
</td>
<td class="aleft">0.00/
    <font size="-2">2.00</font>
</td>
<td class="aleft" ytm="71.23">
    71.23/
    <font size="-2">23.33%</font>
</td>
<td class="aleft" ytm="68.68">
    68.68/
    <font size="-2">21.40%</font>
</td>
<td>6.50</td>
<td title="有效期：2018-01-04 到 2018-01-04；可新增入库">0.25</td>
<td>35.6%</td>
<td class="aleft">AA</td>
<td class="aleft" title="展望：稳定">AA</td>
<td class="aleft" title="担保:无担保">
    <div class="wfixed" style="width:6em">无担保</div>
</td>
<td class="acenter" nowrap="">2020-09-25</td>
<td title="初始规模：20.00亿元">20.00</td>
<td class="acenter green">盈</td>
<td class="acenter green">盈</td>
<td class="aleft" title="备注:3+2">
    <div class="wfixed" style="width:3em">3+2</div>
</td>
<td class="acenter" id="bondOptTd122483" title="加【15新光01】为自选债">
    <a class="jsl_icon_plus" href="javascript:addOwnedBond('122483','15新光01');">&nbsp;&nbsp;&nbsp;</a>
</td> */
var UPDATED_TICK = 0;

function clearUpdatedCells() {
  for (let k in UPDATED_CELLS) {
    document.getElementById(k).setAttribute("class", "unupdated");
  }
  UPDATED_CELLS = {};
}

function updateCurrentTable() {
  if (!stockUtils.isTradingTime()) return;
  let updatedCols = ["xianjia", "zhangfu", "shuiqian", "chengjiao"];
  //let tempData;
  UPDATED_TICK++;
  con.query(`select * from bond where deleted=0 and lastupdated > '${dateUtils.getNowYYYYMMDD()}'`, function (err, r) {
    for (let i = 0; i < r.length; i++) {
      //console.log(r[i]);
      let id = r[i].code;
      let obj = {
        'id': id
      };
      for (let j = 0; j < DATA_COLS.length; j++) {
        obj[DATA_COLS[j]] = r[i][DATA_COLS[j]];
      }
      DATA_TABLE[id] = obj;
    }
    for (let key in CUR_TABLE) {
      for (let i = 0; i < updatedCols.length; i++) {
        let col = updatedCols[i];
        if (DATA_TABLE[key][col] != CUR_TABLE[key][col]) {
          let k = key + "_" + col;
          //UPDATED_CELLS[k] = UPDATED_TICK;
          CUR_TABLE[key][col] = DATA_TABLE[key][col];
          document.getElementById(k).innerText = DATA_TABLE[key][col];
          document.getElementById(k).setAttribute("class", "updated");
        }
      }
    }
    // for (let key in UPDATED_CELLS) {
    //   if (UPDATED_CELLS[key] < UPDATED_TICK - 10) {
    //     document.getElementById(key).setAttribute("class", "unupdated");
    //     delete UPDATED_CELLS[key];
    //   }
    // }
    // if(Object.keys(UPDATED_CELLS).length > 0)
      // console.log(UPDATED_TICK, UPDATED_CELLS,Object.keys(UPDATED_CELLS));
  });
}

function updateTableAllRows() {
  let proms = [];
  for (let key in CUR_TABLE) {
    //console.log(key);
    proms.push(getStockInfo(key));
  }
  Promise.all(proms).then(() => {
    $("#table").tablesorter();
    console.log("updated...");
  });
}


function getStockShouyi(id, xianjia) {
  let jufuxi = DATA_TABLE[id].jufuxi;
  let piaoxi = parseFloat(DATA_TABLE[id].piaoxi);
  let quanjia = xianjia + piaoxi * (366 - jufuxi) / 365;
  return Math.round(((100 + piaoxi) / quanjia - 1) / jufuxi * 3650000) / 100;
}

function updateTableInfo() {
  let prom = Promise.resolve();
  for (let key in DATA_TABLE) {
    prom = prom.then(() => {
      console.log(key, DATA_TABLE[key].info);
      if (!DATA_TABLE[key].info)
        return getBondInfo(key);
    });
  }
  prom.then(() => saveDataTable());
}

function getStockUrl(id) {
  if (id.startsWith("112"))
    return STOCK_API + "sz" + id;
  else
    return STOCK_API + "sh" + id;
}

function updateTable(id, col, value) {
  let idx = -1;
  for (let i = 0; i < TABLE_COLS.length; i++) {
    if (col == TABLE_COLS[i].k) {
      idx = i;
      break;
    }
  }
  if (idx != -1) {
    let row = document.getElementById(id);
    if (row)
      xml.child(row, idx).innerText = value;
  }
}

function getStockInfo(stockNum) {
  let _resolve;
  $.ajax({
    url: getStockUrl(stockNum),
    context: document.body
  }).done(function (data) {
    let quote1 = data.indexOf('"');
    let quote2 = data.lastIndexOf('"');
    let result = data.substr(quote1 + 1, quote2 - quote1 - 1).split(',');
    let stockName = result[0];
    let buyZhesuan = getZhesuanByPrice(stockNum, parseFloat(result[stockAPIPara["buy1price"]]));
    let sellZhesuan = getZhesuanByPrice(stockNum, parseFloat(result[stockAPIPara["sell1price"]]));
    console.log(result[stockAPIPara["buy1price"]], buyZhesuan);
    updateTable(stockNum, "buy1", buyZhesuan);
    updateTable(stockNum, "sell1", sellZhesuan);
    let chengjiao = Math.round(result[stockAPIPara["chengjiao"]] / 1000) / 10;
    updateTable(stockNum, "chengjiao", chengjiao);
    // let xianjia = parseFloat(result[stockAPIPara["xianjia"]]);
    // updateTable(stockNum, "xianjia", xianjia);
    // let shuiqian = getStockShouyi(stockNum, xianjia);
    // updateTable(stockNum, "shuiqian", shuiqian);
    // updateTable(stockNum, "shuiqianhuigou", getZhesuan(stockNum, shuiqian));

    _resolve();
    // for (var key in trackingData) {
    //   let arr = key.split('_');
    //   let c = arr[0];
    //   let prop = arr[1];
    //   let res = '';
    //   if (c == stockNum) {
    //     let price = result[stockAPIPara[prop + "price"]];
    //     let count = result[stockAPIPara[prop + "count"]] / 10;
    //     res = price + " " + count;
    //     if (trackingData[key] != res) {
    //       console.log(stockNum + " " + stockName + " " + prop + ": " + trackingData[key] + " => " + res);
    //       trackingData[key] = res;
    //     }
    //   }
    // }
  });
  return new Promise((resolve) => _resolve = resolve);
}

function saveDataTable() {
  console.log('saveDataTable...');
  FS.writeFileSync("table.json", JSON.stringify(DATA_TABLE, null, 2), "utf8");
  console.log("saved...");
}

function saveConfig() {
  console.log('saveConfig...');
  FS.writeFileSync("config.json", JSON.stringify(CONFIG, null, 2), "utf8");
  console.log("saved...");
}

function parseTable() {
  let input = document.getElementById("input").value;
  let html = document.createElement("div");
  html.innerHTML = input;

  let list = html.querySelector("#bond_table_body");
  xml.forEachElement(list, (n, i) => {
    let d = {};
    xml.forEachElement(n, (nn, ii) => {
      if (ii == IDX_TABLE_ID) {
        d.id = xml.child(nn, 0).innerText;
      } else if (ii == IDX_TABLE_NAME) {
        d.name = nn.innerText;
      } else if (ii == IDX_TABLE_XIANJIA) {
        d.xianjia = nn.innerText;
      } else if (ii == IDX_TABLE_QUANJIA) {
        d.quanjia = nn.innerText;
      } else if (ii == IDX_TABLE_ZHANGFU) {
        d.zhangfu = nn.innerText;
      } else if (ii == IDX_TABLE_CHENGJIAO) {
        d.chengjiao = parseFloat(nn.innerText);
      } else if (ii == IDX_TABLE_JUFUXI) {
        d.jufuxi = nn.innerText;
      } else if (ii == IDX_TABLE_NIANXIAN) {
        d.nianxian = parseFloat(nn.innerText.split('/')[0]);
      } else if (ii == IDX_TABLE_SHUIQIAN) {
        let arr = nn.innerText.trim().split('/');
        if (arr.length == 1) arr.push(0);
        d.shuiqian = parseFloat(arr[0]);
        d.shuiqian2 = parseFloat(arr[0]);
        // if (shuiqian.indexOf('/') > -1) {
        //   d.shuiqian = shuiqian.substr(0, shuiqian.indexOf('/'));
        //   d.shuiqian2 = shuiqian.substr(shuiqian.indexOf('/') + 1, shuiqian.length - shuiqian.indexOf('/') - 2);
        // } else {
        //   d.shuiqian = shuiqian.substr(0, shuiqian.length - 1);
        //   d.shuiqian2 = 0;
        // }
      } else if (ii == IDX_TABLE_SHUIHOU) {
        let shuihou = nn.innerText.trim();
        if (shuihou.indexOf('/') > -1) {
          d.shuihou = shuihou.substr(0, shuihou.indexOf('/'));
          d.shuihou2 = shuihou.substr(shuihou.indexOf('/') + 1, shuihou.length - shuihou.indexOf('/') - 2);
        } else {
          d.shuihou = shuihou.substr(0, shuihou.length - 1);
          d.shuihou2 = "";
        }
      } else if (ii == IDX_TABLE_PIAOXI) {
        d.piaoxi = parseFloat(nn.innerText);
      } else if (ii == IDX_TABLE_ZHESUAN) {
        d.zhesuan = parseFloat(nn.innerText);
      } else if (ii == IDX_TABLE_XINYONG) {
        d.xinyong = nn.innerText;
      } else if (ii == IDX_TABLE_DANBAO) {
        d.danbao = nn.innerText;
      } else if (ii == IDX_TABLE_GUIMO) {
        d.guimo = nn.innerText;
      }
    });
    if (!DATA_TABLE[d.id]) {
      console.warn(d.id + " not found");
      DATA_TABLE[d.id] = d;
    } else {
      for (let k in d) {
        if (DATA_TABLE[d.id][k] != d[k]) {
          console.log(d.id + " " + k + ": " + DATA_TABLE[d.id][k] + " => " + d[k]);
          DATA_TABLE[d.id][k] = d[k];
        }
      }
    }
    //DATA_TABLE[d.id] = d;
  });
  // saveDataTable();
  createTable();
}

function sortTable() {
  let dataTable = filterTable(DATA_TABLE, "isq", null, document.getElementById("isq").checked);
  dataTable = filterTable(dataTable, "xinyong", "greater", document.getElementById("xinyong").value);
  dataTable = filterTable(dataTable, "chengjiao", "greater", parseFloat(document.getElementById("chengjiaofrom").value));
  dataTable = filterTable(dataTable, "chengjiao", "less", parseFloat(document.getElementById("chengjiaoto").value));

  dataTable = filterTable(dataTable, "nianxian", "greater", parseFloat(document.getElementById("nianxianfrom").value));
  dataTable = filterTable(dataTable, "nianxian", "less", parseFloat(document.getElementById("nianxianto").value));

  dataTable = filterTable(dataTable, "shuiqian", "greater", parseFloat(document.getElementById("shuiqianfrom").value));
  dataTable = filterTable(dataTable, "shuiqian", "less", parseFloat(document.getElementById("shuiqianto").value));

  dataTable = filterTable(dataTable, "shuiqianhuigou", "greater", parseFloat(document.getElementById("shuiqianhuigoufrom").value));
  dataTable = filterTable(dataTable, "shuiqianhuigou", "less", parseFloat(document.getElementById("shuiqianhuigouto").value));

  //dataTable = filterTableIn(dataTable, "id", CONFIG.blacklist, true);
  if (document.getElementById("isinstock").checked) {
    let values = [];
    for (let key in DATA_CANGWEI) {
      values.push(key);
    }
    dataTable = filterTableIn(dataTable, "id", values);
  }
  createTable(dataTable);
}

function getBondColor(id) {
  return DATA_TABLE[id].color;
}

function getBondHint(id) {
  return DATA_TABLE[id].comment ? DATA_TABLE[id].comment : "";
}

function filterTableIn(dataTable, attr, values, not) {
  if (!values || values.length == 0) return dataTable;
  let res = {};
  for (let key in dataTable) {
    let d = dataTable[key];
    if ((!not && values.indexOf(d[attr]) > -1) ||
      (not && values.indexOf(d[attr]) == -1)) {
      res[key] = d;
    }
  }
  return res;
}

function filterTable(dataTable, attr, op, value) {
  console.log("filterTable", attr, op, value);
  if (attr == "isq" && !value) return dataTable;
  if (!value) return dataTable;
  let res = {};
  for (let key in dataTable) {
    let d = dataTable[key];
    let comp;
    if (attr == "isq")
      comp = compareAttr(d.name, op, value, attr);
    else
      comp = compareAttr(d[attr], op, value, attr);
    if (comp) {
      res[key] = d;
    }
  }
  return res;
}

function compareAttr(v1, op, v2, type) {
  if (type == "isq") {
    return v1.substr(v1.length - 2) != " Q";
  }
  if (type == "xinyong") {
    v1 = -XINYONG_RANK.indexOf(v1);
    v2 = -XINYONG_RANK.indexOf(v2);
  }
  if (op == "equal") {
    return v1 == v2;
  } else if (op == "greater") {
    return v1 >= v2;
  } else if (op == "less") {
    return v1 <= v2;
  }
}

function createTable(dataTable) {
  if (dataTable == undefined) dataTable = DATA_TABLE;
  clearUpdatedCells();
  CUR_TABLE = dataTable;
  let table = document.getElementById("table");
  table.innerHTML = "";
  //let table = document.createElement("table");
  //tableEle.appendChild(table);
  let header = document.createElement("thead");
  let cols = TABLE_COLS;
  let headerHtml = "<tr>";
  for (let i = 0; i < cols.length; i++) {
    headerHtml += `<th>${cols[i].v}</th>`;
  }
  headerHtml += "</tr>";
  header.innerHTML = headerHtml;
  table.appendChild(header);
  let tbody = document.createElement("tbody");
  table.appendChild(tbody);

  for (let key in dataTable) {
    let d = dataTable[key];
    if (d.id) {
      let row = document.createElement("tr");
      //row.innerHTML = `<td>${d.id}<td/><td>${d.name}<td/>`;
      row.id = d.id;
      let rowHtml = "";
      for (let i = 0; i < cols.length; i++) {
        let key = cols[i].k;
        rowHtml += `<td id="${d.id+'_'+key}" onclick="onTableItemClick()"`;
        if ([].indexOf(key) > -1) {

        }
        if (key == "zhangfu") {
          //let v = parseFloat(d[key].substr(0, d[key].length - 1));
          let v = d[key];
          //console.log(v);
          if (v > 0)
            rowHtml += ` class="red">`;
          else if (v < 0)
            rowHtml += ` class="green">`;
          else
            rowHtml += `>`;
          rowHtml += `${d[key]}</td>`;
        } else if (key == "count") {
          let count = getBondCount(d.id);
          if (count)
            row.style.backgroundColor = "yellow";
          else {
            let color = getBondColor(d.id);
            if (color) row.style.backgroundColor = color;
          }
          rowHtml += `>${count || getBondHint(d.id)}</td>`;
        } else if (key == "shuiqianhuigou") {
          let v = getZhesuan(d.id, d.shuiqian);
          // if (d.zhesuan) {
          //   let f = d.zhesuan * 0.8;
          //   v = v + f * 3.5 + f * f * 3.5 + f * f * f * 3.5;
          // }
          rowHtml += `>${v}</td>`;
          d.shuiqianhuigou = v;
        } else if (key == "name") {
          rowHtml += ` ondblclick="showDialog(${d.id})">${(d[key]===undefined?"":d[key])}</td>`;
        } else if (key == "info") {
          rowHtml += `>${(d[key]===undefined?"":d[key]) + ' ' + (DATA_STOCKINFO[d.stockcode]==undefined?"":DATA_STOCKINFO[d.stockcode])}</td>`;
        } else
          rowHtml += `>${(d[key]===undefined?"":d[key])}</td>`;
      }
      row.innerHTML = rowHtml;
      tbody.appendChild(row);
    }
  }
  $("#table").tablesorter();
  // $("#table").tablesorter({
  //   sortList: [
  //     [12, 1]
  //   ]
  // });
}

function showDialog(id) {
  DIALOG_BOX = {
    id: id,
    color: DATA_TABLE[id].color || "",
    selectedColor: DATA_TABLE[id].color || ""
  };
  let coloreles = document.getElementById('dialog_colors');
  xml.forEachElement(coloreles, (e) => {
    if (rgbToHexString(e.style.backgroundColor.toString()) == DIALOG_BOX.color) {
      DIALOG_BOX.element = e;
      e.setAttribute("class", "color-option color-option-selected");
    } else {
      e.setAttribute("class", "color-option");
    }
  })
  var dialog = document.getElementById('dialogbox');
  document.getElementById('dialog_title').innerText = id + " " + DATA_TABLE[id].name;
  document.getElementById('dialog_info').value = DIALOG_BOX.info = DATA_TABLE[id].info || "";
  document.getElementById('dialog_hint').value = DIALOG_BOX.hint = DATA_TABLE[id].comment || "";
  document.getElementById('dialog_stockcode').value = DIALOG_BOX.stockcode = DATA_TABLE[id].stockcode || "";

  dialog.show();
  document.getElementById('dialog_exit').onclick = function () {
    dialog.close();
  };
  document.getElementById('dialog_delete').onclick = function () {
    con.query(`update bond set deleted = 1 where code = '${id}'`);
    dialog.close();
  };
  document.getElementById('dialog_save').onclick = function () {
    console.log(id);
    let hint = document.getElementById('dialog_hint').value;
    let info = document.getElementById('dialog_info').value;
    let stockcode = document.getElementById('dialog_stockcode').value;
    let color = DIALOG_BOX.selectedColor;
    document.getElementById(id + "_info").innerText = info;
    document.getElementById(id + "_count").innerText = hint;
    document.getElementById(DIALOG_BOX.id).style.backgroundColor = color;
    con.query(`update bond set info = '${info}', stockcode = '${stockcode}',comment='${hint}', color='${color}' where code = '${id}'`);
    DATA_TABLE[id].info = info;
    DATA_TABLE[id].comment = hint;
    DATA_TABLE[id].color = color;
    dialog.close();
  };
}

function getZhesuan(id, shuiqian) {
  let zhesuan = DATA_TABLE[id].zhesuan;
  if (zhesuan) {
    let f = zhesuan * 0.85;
    return (shuiqian + f * (shuiqian - 4) + f * f * (shuiqian - 4) + f * f * f * (shuiqian - 4)).toFixed(2);
    //return (shuiqian + f * 5).toFixed(2);
  }
  return shuiqian;
}

function getZhesuanByPrice(id, price) {
  if (price == 0) return 0;
  let shuiqian = getStockShouyi(id, price);
  return getZhesuan(id, shuiqian);
}

function getBondCount(id) {
  let item = DATA_CANGWEI[id];
  return item != undefined ? item.count : '';
}

function getBondInfo(id) {
  let _resolve;
  $.ajax({
    url: JISILU_INFO_URL + id,
    context: document.body
  }).done(function (data) {
    let html = document.createElement("div");
    html.innerHTML = data;
    let list = html.querySelectorAll(".jisilu_tcdata")[1];
    let fanxing = xml.child(xml.child(xml.child(list, 0), 0), 1);
    let fanxingTxt = fanxing.innerText.trim();
    console.log(fanxingTxt);
    DATA_TABLE[id].info = fanxingTxt;
    _resolve();
  });
  return new Promise((resolve) => _resolve = resolve);
}

// Object.prototype.filterTable = function (attr, op, value) {
//   return filter(this, attr, op, value)
// }

function onTableItemClick(e) {
  //console.log(event.target);
  let tag = event.target;
  tag.classList.remove("updated");
  let ids = xml.attr(tag, "id").split('_');
  let id = ids[0];
  let prop = ids[1];
  if (["xianjia", "buy1", "sell1"].indexOf(prop) > -1) {
    let price = parseFloat(tag.innerText);
    let shuiqian = getStockShouyi(id, price);
    let zhesuan = getZhesuan(id, shuiqian);
    console.log(id, price, shuiqian, zhesuan);
  }
  // else if (prop == "info") {
  //   let m = stockUtils.getMarket(id);
  //   let info = DATA_TABLE[id].info;
  //   let shangshigongsi;
  //   if (info) {
  //     let matches = DATA_TABLE[id].info.match(/\d{6}/g);
  //     if (matches && matches.length > 0)
  //       shangshigongsi = matches[0];
  //   }
  //   if (m == "sz") {
  //     let idurl = 'http://disclosure.szse.cn/m/zqgg_search.htm?secode=' + id;
  //     console.log(idurl);
  //     window.open(idurl);
  //     if (shangshigongsi) {
  //       let ssgsurl = 'http://disclosure.szse.cn/m/drgg_search.htm?secode=' + shangshigongsi;
  //       console.log(ssgsurl);
  //       window.open(ssgsurl);
  //     }
  //   } else {
  //     let idurl = 'http://www.sse.com.cn/home/search/?webswd=' + id;
  //     console.log(idurl);
  //     window.open(idurl);
  //     if (shangshigongsi) {
  //       let ssgsurl = 'http://www.sse.com.cn/home/search/?webswd=' + shangshigongsi;
  //       console.log(ssgsurl);
  //       window.open(ssgsurl);
  //     }
  //   }
  // }
}

let DIALOG_BOX = {};
//let DIGLOG_ID;

function selectDialogColor() {
  if (DIALOG_BOX.element) {
    if (DIALOG_BOX.element == event.target) {
      event.target.setAttribute("class", "color-option");
      DIALOG_BOX.element = undefined;
    } else {
      DIALOG_BOX.element.setAttribute("class", "color-option");
      event.target.setAttribute("class", "color-option color-option-selected");
      DIALOG_BOX.element = event.target;
    }
  } else {
    DIALOG_BOX.element = event.target;
    event.target.setAttribute("class", "color-option color-option-selected");
  }

  DIALOG_BOX.selectedColor = rgbToHexString(DIALOG_BOX.element ? DIALOG_BOX.element.style.backgroundColor : "");
  //console.log(event.target.style.getPropertyValue("background-color"));
}

function rgbToHexString(x) {
  if (x && x.length > 3 && x.substr(0, 3) == 'rgb')
    return '#' + x.match(/\d+/g).map(y = z => ((+z < 16) ? '0' : '') + (+z).toString(16)).join('');
  else
    return x;
}

module.exports.parseTable = parseTable;
module.exports.sortTable = sortTable;
module.exports.updateTableInfo = updateTableInfo;
module.exports.updateTableAllRows = updateTableAllRows;
module.exports.onTableItemClick = onTableItemClick;
module.exports.showDialog = showDialog;
module.exports.selectDialogColor = selectDialogColor;
module.exports.init = init;