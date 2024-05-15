"use strict";

let side; // 辺の長さ（マスの数）
let mine; // 地雷の数
const button = document.getElementById("button");
button.addEventListener("click", setGame);
const msTable = document.getElementById("ms-table");
const time = document.getElementById("time");
const property = []; // マスのプロパティを入れるための配列

/**
 * ゲーム用のテーブルを作成する関数
 */
function setGame() {
  while (document.getElementsByTagName("tr").length) {
    const tr = document.getElementsByTagName("tr");
    tr[0].remove();
  }
  side = Number(document.getElementById("side").value);
  mine = Math.trunc(side * side * 0.2);

  for (let i = 0; i < side; i++) {
    const tr = document.createElement("tr");

    for (let j = 0; j < side; j++) {
      const td = document.createElement("td");

      td.addEventListener("click", clickLeft);
      td.addEventListener("contextmenu", clickRight);
      td.isOpen = false;

      // マスの色を交互に設定する
      if (i % 2 === 0) {
        if (j % 2 === 0) {
          td.style.background = "#009933";
        } else {
          td.style.background = "green";
        }
      } else {
        if (j % 2 === 0) {
          td.style.background = "green";
        } else {
          td.style.background = "#009933";
        }
      }
      tr.appendChild(td);
    }
    msTable.appendChild(tr);
  }
}

/**
 * 爆弾を設置する関数
 */
function setMine() {
  for (let i = 0; i < mine; i++) {
    while (true) {
      const y = Math.floor(Math.random() * side);
      const x = Math.floor(Math.random() * side);

      if (property[y][x] === 0) {
        property[y][x] = 1;
        break;
      }
    }
  }
}

/**
 * 左クリックでマスを開ける関数
 */
function clickLeft() {
  const y = this.parentNode.rowIndex;
  const x = this.cellIndex;

  if (this.isOpen || this.flag) {
    return;
  }
  /**
   * 初めてクリックした時,全てのマス分のproperty[]にステータスを入れる.
   * （0：何もなし、1：地雷、2：最初にクリックされたマスとその周り８マス）
   */
  if (!property.length) {
    startTime = Date.now();
    timer();
    for (let i = 0; i < side; i++) {
      property[i] = Array(side).fill(0);
    }
    for (let i = y - 1; i <= y + 1; i++) {
      for (let j = x - 1; j <= x + 1; j++) {
        if (i >= 0 && i < side && j >= 0 && j < side) {
          property[i][j] = 2;
        }
      }
    }
    setMine();
  }

  /**
   * 地雷を踏んだ時
   */
  if (property[y][x] === 1) {
    for (let i = 0; i < side; i++) {
      for (let j = 0; j < side; j++) {
        const td = msTable.rows[i].cells[j];

        if (property[i][j] === 1) {
          td.style.background = "red";
          td.textContent = "💣";
        } else {
          td.style.background = "#8B4513";
          if (countMine(i, j) !== 0) {
            td.textContent = countMine(i, j);
          }
        }
      }
    }

    clearTimeout(timeout);
    setTimeout(function () {
      if (window.confirm("Game over")) {
        location.reload();
      }
    }, 200);
    return;
  }

  /**
   * 何もないマスを踏んだ時
   */
  if (countMine(y, x) === 0) {
    open(y, x);
  } else {
    this.textContent = countMine(y, x);
    this.isOpen = true;
    this.style.background = "#8B4513";
  }

  /**
   * 地雷以外を全て開けられた時
   */
  if (isClear()) {
    for (let i = 0; i < side; i++) {
      for (let j = 0; j < side; j++) {
        const td = msTable.rows[i].cells[j];

        if (property[i][j] === 1) {
          td.style.background = "pink";
          td.textContent = "🌷";
        }
      }
    }
    clearTimeout(timeout);
    party.confetti(this, {
      count: party.variation.range(300, 300),
    });
    setTimeout(function () {
      if (window.confirm("CLEAR！🤩  Time:" + stopTime + "秒")) {
        location.reload();
      }
    }, 2200);
    return;
  }
}

/**
 * 右クリックで旗を立てる関数
 * @param {Event} e
 */
function clickRight(e) {
  e.preventDefault();
  if (this.isOpen) {
    return;
  } else if (this.flag) {
    this.textContent = "";
    this.flag = false;
  } else {
    this.textContent = "🏴";
    this.flag = true;
  }
}

/**
 * 地雷の周りのマスに入れる数字を返す関数
 * @param {number} y :tdの座標
 * @param {number} x :trの座標
 * @returns {number} :そのマスに入る数字
 */
function countMine(y, x) {
  let mines = 0;
  for (let i = y - 1; i <= y + 1; i++) {
    for (let j = x - 1; j <= x + 1; j++) {
      if (i >= 0 && i < side && j >= 0 && j < side) {
        if (property[i][j] === 1) {
          mines++;
        }
      }
    }
  }
  return mines;
}

/**
 * 周囲のマスを開ける関数
 * @param {number} y
 * @param {number} x
 */
function open(y, x) {
  for (let i = y - 1; i <= y + 1; i++) {
    for (let j = x - 1; j <= x + 1; j++) {
      if (i >= 0 && i < side && j >= 0 && j < side) {
        let mines = countMine(i, j);
        const td = msTable.rows[i].cells[j];

        if (td.isOpen || td.flag) {
          continue;
        }
        if (mines === 0) {
          td.isOpen = true;
          td.style.background = "#8B4513";
          open(i, j);
        } else {
          td.textContent = mines;
          td.isOpen = true;
          td.style.background = "#8B4513";
        }
      }
    }
  }
}

/**
 * クリアか確認する関数
 */
function isClear() {
  let openCell = 0;

  for (let i = 0; i < side; i++) {
    for (let j = 0; j < side; j++) {
      if (msTable.rows[i].cells[j].isOpen) {
        openCell++;
      }
    }
  }
  if (side * side - openCell === mine) {
    return true;
  }
}

/**
 * タイマー
 */
let stopTime;
let startTime;
let timeout;

function timer() {
  const seconds = String(new Date(Date.now() - startTime).getSeconds());

  time.textContent = `⏰TIME⏰：${seconds}`;
  stopTime = seconds;
  timeout = setTimeout(() => {
    timer();
  }, 1000);
}
