"use strict";

let data = []; // 1：爆弾、0：何もない、-1：最初にクリックされたマスと周囲
let h, w, bomb;
let startTime;
let timeoutId;

const msTable = document.getElementById("ms-table");
const time = document.getElementById("time");

// 初期化
function init() {
  h = 5; // 縦のマスの数
  w = 5; // 横のマスの数
  bomb = 3; // 爆弾の数

  msTable.innerHTML = "";
  msTable.style.pointerEvents = "auto";
  clearTimeout(timeoutId);

  // ゲームを作る
  for (let i = 0; i < h; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < w; j++) {
      const td = document.createElement("td");
      td.addEventListener("click", leftClicked);
      td.addEventListener("contextmenu", rightClicked);
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

// 爆弾を設置
function putBomb() {
  for (let i = 0; i < bomb; i++) {
    while (true) {
      const y = Math.floor(Math.random() * h);
      const x = Math.floor(Math.random() * w);
      if (data[y][x] === 0) {
        data[y][x] = 1;
        msTable.rows[y].cells[x].bomb = true;
        break;
      }
    }
  }
}

// 左クリック マスを空ける
function leftClicked() {
  const y = this.parentNode.rowIndex;
  const x = this.cellIndex;

  if (this.isOpen || this.flag) {
    return;
  }

  if (!data.length) {
    startTime = Date.now();
    timer();
    for (let i = 0; i < h; i++) {
      data[i] = Array(w).fill(0);
    }
    for (let i = y - 1; i <= y + 1; i++) {
      for (let j = x - 1; j <= x + 1; j++) {
        if (i >= 0 && i < h && j >= 0 && j < w) {
          data[i][j] = -1;
        }
      }
    }
    putBomb();
  }

  // 爆弾を踏んだか判定
  if (data[y][x] === 1) {
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        if (data[i][j] === 1) {
          // 爆弾を全部出す
          msTable.rows[i].cells[j].style.background = "red";
          msTable.rows[i].cells[j].textContent = "💣";
        } else {
          msTable.rows[i].cells[j].style.background = "#8B4513";
          if (countBomb(i, j) !== 0) {
            msTable.rows[i].cells[j].textContent = countBomb(i, j);
          }
        }
      }
    }
    msTable.style.pointerEvents = "none";
    console.log("Game Over");

    clearTimeout(timeoutId);
    // alert & フォワード
    setTimeout(function () {
      if (window.confirm("Game over")) {
        location.reload();
      }
    }, 200);
    return;
  }

  let bombs = countBomb(y, x);
  if (bombs === 0) {
    open(y, x);
    msTable.rows[y].cells[x].style.background = "#8B4513";
  } else {
    this.textContent = bombs;
    this.isOpen = true;
    msTable.rows[y].cells[x].style.background = "#8B4513";
  }

  // クリア判定
  if (countOpenCell()) {
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        if (data[i][j] === 1) {
          const td = msTable.rows[i].cells[j];
          td.style.background = "pink";
          td.textContent = "🌷";
        }
      }
    }
    msTable.style.pointerEvents = "none";
    console.log("Clear");
    clearTimeout(timeoutId);
    // クリアのconfettiエフェクト
    party.confetti(this, {
      count: party.variation.range(300, 300),
    });
    // alert & フォワード
    setTimeout(function () {
      if (window.confirm("CLEAR！🤩  Time:" + stopTime + "秒")) {
        location.reload();
      }
    }, 1500);
    return;
  }
}

// 右クリック
function rightClicked(e) {
  e.preventDefault();
  if (
    this.isOpen
    /*this.className === "open"*/
  ) {
    return;
  } else if (this.flag) {
    this.textContent = "";
    this.flag = false;
  } else {
    this.textContent = "🏴";
    this.flag = true;
  }
}

// マスの周りの爆弾の数を数える
function countBomb(y, x) {
  let bombs = 0;
  for (let i = y - 1; i <= y + 1; i++) {
    for (let j = x - 1; j <= x + 1; j++) {
      if (i >= 0 && i < h && j >= 0 && j < w) {
        if (data[i][j] === 1) {
          bombs++;
        }
      }
    }
  }
  return bombs;
}

// マスを開く
function open(y, x) {
  for (let i = y - 1; i <= y + 1; i++) {
    for (let j = x - 1; j <= x + 1; j++) {
      if (i >= 0 && i < h && j >= 0 && j < w) {
        let bombs = countBomb(i, j);
        const td = msTable.rows[i].cells[j];
        if (td.bomb) {
          td.style.background = "red";
          td.textContent = "💣";
        }
        if (td.isOpen || td.flag) {
          continue;
        }
        if (bombs === 0) {
          td.isOpen = true;
          td.style.background = "#8B4513";
          open(i, j);
        } else {
          td.textContent = bombs;
          td.isOpen = true;
          td.style.background = "#8B4513";
        }
      }
    }
  }
}

// 空いているマスを数える
function countOpenCell() {
  let openCell = 0;
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      if (msTable.rows[i].cells[j].isOpen) {
        openCell++;
      }
    }
  }
  if (h * w - openCell === bomb) {
    return true;
  }
}

// タイマー
let stopTime;
function timer() {
  const d = new Date(Date.now() - startTime);
  const s = String(d.getSeconds()).padStart(3, "0");
  time.textContent = `⏰TIME⏰：${s}`;
  stopTime = s;
  timeoutId = setTimeout(() => {
    timer();
  }, 1000);
}

init();
