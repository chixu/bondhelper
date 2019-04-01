//headers = [{key, name}]
class TableRenderer {
  constructor(data) {
    this.data = data;
    this.setDecimal(2);
  }

  setDecimal(v) {
    this.decimal = v;
  }

  addColumn(key, name, format) {
    if (!name) name = key;
    if (!this.columns) this.columns = [];
    if (format) format = JSON.parse(format);
    this.columns.push({
      key: key,
      name: name,
      format: format
    })
  }

  render(container) {
    let table = document.createElement("table");
    let columns = this.columns;
    let data = this.data;
    if (!columns) {
      columns = [];
      for (let k in data[0]) {
        columns.push({
          key: data[0][k],
          name: data[0][k]
        })
      }
    }
    let thead = document.createElement("thead");
    let theadrow = document.createElement("tr");
    for (let i in columns) {
      theadrow.innerHTML += '<th>' + columns[i].name + '</th>';
    }
    thead.appendChild(theadrow);
    let tbody = document.createElement("tbody");
    table.appendChild(thead);
    table.appendChild(tbody);
    for (let i in data) {
      let row = document.createElement('tr');
      if (data[i].color) {
        row.style.background = data[i].color;
      }
      for (let j in columns) {
        let v = data[i][columns[j].key];
        let format = columns[j].format;
        if (format) {
          let color = '';
          if (format.rbcolor) {
            if (v > 0) color = "class='red'";
            if (v < 0) color = "class='green'";
          }
          if (format.percent) {
            v *= 100;
          }
          if (typeof (v) == 'number' && this.decimal > -1)
            v = v.toFixed(2);

          row.innerHTML += `<td ${color}>${v}</td>`;
        } else {
          if (typeof (v) == 'number' && this.decimal > -1)
            v = v.toFixed(2);
          row.innerHTML += '<td>' + v + '</td>';
        }
      }
      tbody.appendChild(row);
    }
    if (container) {
      if (typeof (container) == 'string')
        document.getElementById(container).appendChild(table);
      else
        container.appendChild(table);
    }
    return table;
  }
}

module.exports = {
  TableRenderer: TableRenderer
};