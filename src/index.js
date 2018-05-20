import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// ホスト
let g_host = "https://testphpserver1.herokuapp.com/"
if (window.location.search.match(/.*local.*/)) {
  // ローカルモードならローカルホスト
  g_host = "http://localhost:8080/public/";
}

let g_userId = null;
let g_response = null;
let g_width = -1;
let g_height = -1;

let Square = (props) =>
  <button className="square" onClick={() => props.onClick()}>
    {props.value}
  </button>

class Board extends React.Component {
  constructor() {
    super();
    this.state = {
      squares: [],
    };

    setTimeout(() => this.update(), 1000);
  }

  async update() {
    let response = await fetch(g_host + "gomoku/")
    g_response = await response.json();

    // マスの範囲取得
    for (let i in g_response.master) {
      switch (g_response.master[i].key) {
        case "WIDTH":
          g_width = Number(g_response.master[i].value);
          break;
        case "HEIGHT":
          g_height = Number(g_response.master[i].value);
          break;
        default:
          break;
      }
    }

    let squares = Array.from({length: g_height}, e => Array.from({length: g_width}, e => null));
    for (let y = 0; y < g_height; y++) {
      for (let x = 0; x < g_width; x++) {
        let cell = g_response.cell.find(e => e.x === x.toString() && e.y === y.toString())
        if (cell != null) {
          if (cell.user_id === g_userId) {
            console.log(cell)
            squares[y][x] = '◎';
          } else {
            squares[y][x] = '●';
          }
        }
      }
    }
            console.log(squares);

    this.setState({
      squares: squares,
    });

    // 1秒後に再度通信
    setTimeout(() => this.update(), 1000);
  }

  async handleClick(x, y) {
    await fetch(g_host + "gomoku/cell",
      {
        method: "post",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          x: x,
          y: y,
          user_id: g_userId,
        })
      }
    );
  }

  renderSquare(x, y) {
    return <Square key={y * g_width + x} value={this.state.squares[y][x]} onClick={() => this.handleClick(x, y)} />;
  }

  render() {
    let lines = [];
    for (let y = 0; y < g_height; y++) {
      let doms = []
      for (let x = 0; x < g_width; x++) {
        doms.push(this.renderSquare(x, y));
      }
      lines.push(<div key={y} className="board-row">
        {doms}
      </div>);
    }

    return (
      <div>
        {lines}
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================
async function init() {
  g_userId = window.localStorage.getItem("GOMOKU/USER_ID");
  if (g_userId === null) {
    // 新規ユーザー登録
    let response = await fetch(g_host + "gomoku/user", { method: "post" });
    let obj = await response.json();
    g_userId = obj.user_id;

    window.localStorage.setItem("GOMOKU/USER_ID", g_userId);
  }

  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
}
init();

