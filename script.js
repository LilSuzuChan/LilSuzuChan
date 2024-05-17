"use strict";

let level;
let height; // 辺の長さ（縦）
let width; // 辺の長さ（横）
let mine; // 地雷の数
let flag; // 残りの爆弾の数
const property = []; // マスのプロパティを入れるための配列
const button = document.getElementById("button");
button.addEventListener("click", setGame);
const msTable = document.getElementById("ms-table");
const time = document.getElementById("time");

/**
 * ゲーム用のテーブルを作成する関数
 */
function setGame() {
  // 画面にあるゲームを消す
  while (document.getElementsByTagName("tr").length) {
    const tr = document.getElementsByTagName("tr");
    tr[0].remove();
  }
  property.length = 0;

  // 難易度別にtd要素とtr要素の数を変える
  level = document.getElementById("level").value;
  switch (level) {
    case "level1":
      height = 8;
      width = 10;
      break;

    case "level2":
      height = 14;
      width = 18;
      break;

    case "level3":
      height = 20;
      width = 24;
      break;

    default:
      break;
  }
  mine = Math.trunc(height * width * 0.2);
  flag = 0;

  // マスを作る
  for (let i = 0; i < height; i++) {
    const tr = document.createElement("tr");

    for (let j = 0; j < width; j++) {
      const td = document.createElement("td");

      td.addEventListener("click", clickLeft);
      td.addEventListener("contextmenu", clickRight);
      td.isOpen = false;

      // 難易度別にtd要素と上のバーのサイズを変える
      switch (level) {
        case "level1":
          document.getElementById("game-set").style.width = "650px";
          td.style.height = "65px";
          td.style.width = "65px";
          break;

        case "level2":
          document.getElementById("game-set").style.width = "720px";
          td.style.height = "40px";
          td.style.width = "40px";
          break;

        case "level3":
          document.getElementById("game-set").style.width = "720px";
          td.style.height = "30px";
          td.style.width = "30px";
          break;

        default:
          break;
      }

      // マスの色を交互に設定する
      if (i % 2 === 0) {
        if (j % 2 === 0) {
          td.style.background = "rgba(155, 202, 83)";
        } else {
          td.style.background = "rgba(177, 216, 96)";
        }
      } else {
        if (j % 2 === 0) {
          td.style.background = "rgba(177, 216, 96)";
        } else {
          td.style.background = "rgba(155, 202, 83)";
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
    for (let i = 0; i < height; i++) {
      property[i] = Array(width).fill(0);
    }
    for (let i = y - 1; i <= y + 1; i++) {
      for (let j = x - 1; j <= x + 1; j++) {
        if (i >= 0 && i < height && j >= 0 && j < width) {
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
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const td = msTable.rows[i].cells[j];

        if (property[i][j] === 1) {
          const colors = [
            "rgba(240, 150, 61)",
            "rgba(170, 80, 235)",
            "rgba(200, 65, 60)",
            "rgba(60, 135, 70)",
            "rgba(240, 195, 65)",
            "rgba(110, 230, 240)",
            "rgba(75, 120, 240)",
            "rgba(220, 70, 175)",
          ];
          td.style.background = colors[Math.floor(Math.random() * 8)];
          td.textContent = "💣";
        } else {
          // 空いたマスの色を交互に
          if (j % 2 === 0) {
            if (i % 2 === 0) {
              td.style.background = "rgba(210, 185, 157)";
            } else {
              td.style.background = "rgba(223, 195, 163)";
            }
          } else {
            if (i % 2 === 0) {
              td.style.background = "rgba(223, 195, 163)";
            } else {
              td.style.background = "rgba(210, 185, 157)";
            }
          }
          if (countMine(i, j) !== 0) {
            td.textContent = countMine(i, j);

            // 数字によって色を変える
            switch (countMine(i, j)) {
              case 1:
                td.style.color = "rgba(56, 116, 203)";
                break;

              case 2:
                td.style.color = "rgba(80, 140, 70)";
                break;

              case 3:
                td.style.color = "rgba(194, 63, 56)";
                break;

              case 4:
                td.style.color = "rgba(110, 45, 150)";
                break;

              case 5:
                td.style.color = "rgba(218, 147, 60)";
                break;

              default:
                break;
            }
          }
        }
      }
    }

    clearTimeout(timeout);
    party.confetti(this, {
      count: party.variation.range(300, 300),
    });
    setTimeout(function () {
      if (window.confirm("Game over")) {
        location.reload();
      }
    }, 2200);
    return;
  }

  /**
   * 何もないマスを踏んだ時
   */
  if (countMine(y, x) === 0) {
    open(y, x);
  } else {
    this.textContent = countMine(y, x);
    // 数字によって色を変える
    switch (countMine(y, x)) {
      case 1:
        this.style.color = "rgba(56, 116, 203)";
        break;

      case 2:
        this.style.color = "rgba(80, 140, 70)";
        break;

      case 3:
        this.style.color = "rgba(194, 63, 56)";
        break;

      case 4:
        this.style.color = "rgba(110, 45, 150)";
        break;

      case 5:
        this.style.color = "rgba(218, 147, 60)";
        break;

      default:
        break;
    }
    this.isOpen = true;

    // 空いたマスの色を交互に
    if (j % 2 === 0) {
      if (i % 2 === 0) {
        td.style.background = "rgba(210, 185, 157)";
      } else {
        td.style.background = "rgba(223, 195, 163)";
      }
    } else {
      if (i % 2 === 0) {
        td.style.background = "rgba(223, 195, 163)";
      } else {
        td.style.background = "rgba(210, 185, 157)";
      }
    }
  }
  /**
   * 地雷以外を全て開けられた時
   */
  if (isClear()) {
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const td = msTable.rows[i].cells[j];

        if (property[i][j] === 1) {
          td.style.background = "pink";
          td.textContent = "🌷";
        }
      }
    }
    clearTimeout(timeout);
    setTimeout(function () {
      if (window.confirm("CLEAR！🤩  Time:" + stopTime + "秒")) {
        location.reload();
      }
    }, 200);
    return;
  }
  document.getElementById("mine").textContent = "　🚩：" + (mine - flag);
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
    flag = flag - 1;
  } else {
    this.textContent = "🚩";
    this.flag = true;
    flag = flag + 1;
  }
  document.getElementById("mine").textContent = "　🚩：" + (mine - flag);
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
 * マスを開ける関数
 * @param {number} y
 * @param {number} x
 */
function open(y, x) {
  for (let i = y - 1; i <= y + 1; i++) {
    for (let j = x - 1; j <= x + 1; j++) {
      if (i >= 0 && i < height && j >= 0 && j < width) {
        let mines = countMine(i, j);
        const td = msTable.rows[i].cells[j];

        if (td.isOpen || td.flag) {
          continue;
        }
        // 空いたマスの色を交互に
        if (j % 2 === 0) {
          if (i % 2 === 0) {
            td.style.background = "rgba(210, 185, 157)";
          } else {
            td.style.background = "rgba(223, 195, 163)";
          }
        } else {
          if (i % 2 === 0) {
            td.style.background = "rgba(223, 195, 163)";
          } else {
            td.style.background = "rgba(210, 185, 157)";
          }
        }
        td.isOpen = true;

        if (mines === 0) {
          open(i, j);
        } else {
          td.isOpen = true;
          td.textContent = mines;

          // 数字によって色を変える
          switch (mines) {
            case 1:
              td.style.color = "rgba(56, 116, 203)";
              break;

            case 2:
              td.style.color = "rgba(80, 140, 70)";
              break;

            case 3:
              td.style.color = "rgba(194, 63, 56)";
              break;

            case 4:
              td.style.color = "rgba(110, 45, 150)";
              break;

            case 5:
              td.style.color = "rgba(218, 147, 60)";
              break;

            default:
              break;
          }
        }
        // 空いたマスの色を交互に
        if (j % 2 === 0) {
          if (i % 2 === 0) {
            td.style.background = "rgba(210, 185, 157)";
          } else {
            td.style.background = "rgba(223, 195, 163)";
          }
        } else {
          if (i % 2 === 0) {
            td.style.background = "rgba(223, 195, 163)";
          } else {
            td.style.background = "rgba(210, 185, 157)";
          }
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
let timeout;

function timer() {
  const seconds = String(
    new Date(Date.now() - startTime).getSeconds()
  ).padStart(3, "0");
  time.textContent = `⏰TIME⏰：${seconds}`;
  stopTime = seconds;
  timeout = setTimeout(() => {
    timer();
  }, 1000);
}

setGame();
