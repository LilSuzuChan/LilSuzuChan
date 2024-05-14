"use strict";

const height = 5; // 縦のマスの数
const width = 5; // 横のマスの数
const mine = 3; // 爆弾の数
const msTable = document.getElementById("ms-table");
const time = document.getElementById("time");
const property = [];

/**
 * ゲーム用のテーブルを作成する関数
 */
function resetGame() {
  clearTimeout(timeoutId);

  for (let i = 0; i < height; i++) {
    const tr = document.createElement("tr");

    for (let j = 0; j < width; j++) {
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
      const y = Math.floor(Math.random() * height);
      const x = Math.floor(Math.random() * width);
      if (property[y][x] === 0) {
        property[y][x] = 1;
        break;
      }
    }
  }
}

/**
 * 左クリック
 */
function clickLeft() {
  const y = this.parentNode.rowIndex; //trの座標
  const x = this.cellIndex; //tdの座標

  if (this.isOpen || this.flag) {
    return;
  }
  /**
   * 初めてクリックした時,全てのマス分のproperty[][]にステータスを入れる.
   * （1：爆弾、0：何もない、-1：最初にクリックされたマスとその周り８マス）
   */
  if (!property.length) {
    startTime = Date.now();
    timer();
    for (let i = 0; i < height; i++) {
      property[i] = Array(width).fill(0);
    }
    for (let i = y - 1; i <= y + 1; i++) {
      for (let j = x - 1; j <= x + 1; j++) {
        if (i >= 0 && i < height && j >= 0 && j < width) {
          property[i][j] = -1;
        }
      }
    }
    setMine();
  }

  /**
   * 爆弾を踏んだ時
   */
  if (property[y][x] === 1) {
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const td = msTable.rows[i].cells[j];
        if (property[i][j] === 1) {
          td.style.background = "red";
          td.textContent = "💣";
        } else {
          td.style.background = "#8B4513";
          if (countBomb(i, j) !== 0) {
            td.textContent = countBomb(i, j);
          }
        }
      }
    }

    clearTimeout(timeoutId);
    setTimeout(function () {
      if (window.confirm("Game over")) {
        location.reload();
      }
    }, 200);
    return;
  }

  let mines = countBomb(y, x);
  if (mines === 0) {
    open(y, x);
    msTable.rows[y].cells[x].style.background = "#8B4513";
  } else {
    this.textContent = mines;
    this.isOpen = true;
    msTable.rows[y].cells[x].style.background = "#8B4513";
  }

  // クリア判定
  if (isClear()) {
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (property[i][j] === 1) {
          const td = msTable.rows[i].cells[j];
          td.style.background = "pink";
          td.textContent = "🌷";
        }
      }
    }
    clearTimeout(timeoutId);
    party.confetti(this, {
      count: party.variation.range(300, 300),
    });
    setTimeout(function () {
      if (window.confirm("CLEAR！🤩  Time:" + stopTime + "秒")) {
        location.reload();
      }
    }, 1500);
    return;
  }
}

/**
 * 右クリックで旗を立てる関数
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
 * 爆弾の周りのマスに入れる数字を返す関数
 * @param {number} y :tdの座標
 * @param {number} x :trの座標
 * @returns {number}
 */
function countBomb(y, x) {
  let mines = 0;
  for (let i = y - 1; i <= y + 1; i++) {
    for (let j = x - 1; j <= x + 1; j++) {
      if (i >= 0 && i < height && j >= 0 && j < width) {
        if (property[i][j] === 1) {
          mines++;
        }
      }
    }
  }
  return mines;
}

/**
 * 周囲にマスを開ける関数
 * @param {number} y
 * @param {number} x
 */
function open(y, x) {
  for (let i = y - 1; i <= y + 1; i++) {
    for (let j = x - 1; j <= x + 1; j++) {
      if (i >= 0 && i < height && j >= 0 && j < width) {
        let mines = countBomb(i, j);
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
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (msTable.rows[i].cells[j].isOpen) {
        openCell++;
      }
    }
  }
  if (height * width - openCell === mine) {
    return true;
  }
}

/**
 * タイマー
 */
let stopTime;
let startTime;
let timeoutId;
function timer() {
  const seconds = String(new Date(Date.now() - startTime).getSeconds()); //.padStart(3, "0");
  time.textContent = `⏰TIME⏰：${seconds}`;
  stopTime = seconds;
  // 1秒毎に更新する
  timeoutId = setTimeout(() => {
    timer();
  }, 1000);
}

resetGame();
