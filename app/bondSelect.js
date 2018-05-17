let TIANTIAN_FUND_URL = "http://fund.eastmoney.com/data/fundranking.html#tzq;c0;r;s{0}zf;pn50;ddesc;qsd20170131;qed20180131;qdii;zq;gg;gzbd;gzfs;bbzt;sfbb";
let TIANTIAN_FUND_DETAILS = "http://fund.eastmoney.com/{0}.html";
//519163
let TOP_FUND_STR = "470058,470059,519162,519163,519225,004118,000297,003109,003110,002421,002422,002246,002969,002932,002933,000973,002441,001367,002651";
let TOP_STOCK_FUND_STR = "110003,110022,160222,213010,310398,481012,519671,530015,540012";
let TOP_STOCK_FUND_STR2 = "100038,110003,110022,160127,160222,160628,160716,161721,162213,162307,162509,163808,213010,240014,240016,240019,310398,320010,399001,410008,481012,519100,519671,519706,530015,540009,540012,000835,000854,070023";
let FUND_TYPE = "s";
const IDX_TABLE_ID = 2;
const IDX_TABLE_NAME = 3;
let FUND_DATA;
let FUND_CONTENT_DATA = {};

function fundSelect() {
  let input = document.getElementById("input").value;
  let html = document.createElement("div");
  html.innerHTML = input;
  let list = html.querySelector("tbody");
  let res = {};
  xml.forEachElement(list, (n, i) => {
    let d = {};
    xml.forEachElement(n, (nn, ii) => {
      if (ii == IDX_TABLE_ID) {
        let child = xml.child(nn, 0);
        d.id = child.innerText;
        d.href = xml.attr(child, "href");
      } else if (ii == IDX_TABLE_NAME) {
        let child = xml.child(nn, 0);
        d.name = child.innerText;
      }
      res[d.id] = d;
    });
  });
  if (FUND_DATA) {
    let res2 = {};
    for (let k1 in FUND_DATA) {
      let hasKey = false;
      for (let k2 in res) {
        if (k1 == k2) {
          res2[k1] = FUND_DATA[k1];
          break;
        }
      }
    }
    FUND_DATA = res2;
  } else {
    FUND_DATA = res;
  }
  console.log(FUND_DATA);
  let str = "";
  for (let k in FUND_DATA) {
    str += k + ",";
  }
  console.log(str);
}

let fund_str = FUND_TYPE == "b" ? TOP_FUND_STR : TOP_STOCK_FUND_STR2;

let topfunds = fund_str.split(",");
let p = Promise.resolve();
for (let i = 0; i < topfunds.length; i++) {
  p = p.then(() => getFundDetails(topfunds[i]));
}
p.then(() => {
  let sorted = [];
  for (let k in FUND_CONTENT_DATA) {
    let data = FUND_CONTENT_DATA[k];
    if (sorted.length == 0) {
      sorted.push(FUND_CONTENT_DATA[k]);
    } else {
      for (let i = 0; i < sorted.length; i++) {
        if (data.value <= sorted[i].value) {
          sorted.splice(i, 0, data);
          break;
        }
      }
    }
  }
  //printData(sorted);
  for (let i = sorted.length - 1; i >= 0; i--) {
    console.log(sorted[i].id, sorted[i].value, sorted[i].count);
  }
});

function getFundDetails(stockNum) {
  console.log("start ", stockNum);
  let _resolve;
  $.ajax({
    url: TIANTIAN_FUND_DETAILS.format(stockNum),
    context: document.body
  }).done(function (data) {
    let input = document.getElementById("input").value;
    let html = document.createElement("div");
    html.innerHTML = data;
    let list = html.querySelector("." + (FUND_TYPE == "b" ? "position_bonds" : "position_shares") + " tbody");
    //let res = {};
    xml.forEachElement(list, (n, i) => {
      let d = {
        count: 1
      };
      if (i > 0) {
        xml.forEachElement(n, (nn, ii) => {
          if (ii == 0) {
            let child = xml.child(nn, 0);
            d.id = (child ? child.innerText : nn.innerText).trim();
          } else if (ii == 1) {
            d.value = parseFloat(nn.innerText);
          }
        });
        if (FUND_CONTENT_DATA[d.id]) {
          FUND_CONTENT_DATA[d.id].value += d.value;
          FUND_CONTENT_DATA[d.id].count += 1;
        } else
          FUND_CONTENT_DATA[d.id] = d;
      }
    });
    //printData(FUND_CONTENT_DATA);
    _resolve();
  });
  return new Promise((resolve) => _resolve = resolve);
}

function printData(data) {
  for (let k in data) {
    console.log(data[k].id, data[k].value);
  }
}

// function fundSelect(stockNum) {
//   let _resolve;
//   $.ajax({
//     url: TIANTIAN_FUND_URL.format("3y"),
//     context: document.body
//   }).done(function (data) {
//     let input = document.getElementById("input").value;
//     let html = document.createElement("div");
//     html.innerHTML = data;
//     let list = html.querySelector("#dbtable").querySelector("tbody");
//     console.log(list);
//     xml.forEachElement(list, (n, i) => {
//       console.log(n);
//     });
//     _resolve();
//   });
//   return new Promise((resolve) => _resolve = resolve);
// }

module.exports.fundSelect = fundSelect;