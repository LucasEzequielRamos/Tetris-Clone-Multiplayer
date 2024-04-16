import './style.css';

const $canvas = document.querySelector('canvas');
const context = $canvas.getContext('2d');
const $score = document.querySelector('#score');
const $bestScore = document.querySelector('#best-scores');

const BLOCK_SIZE = 20;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
let SCORE = 0;

$canvas.width = BLOCK_SIZE * BOARD_WIDTH;
$canvas.height = BLOCK_SIZE * BOARD_HEIGHT;
$score.innerHTML = SCORE;

context.scale(BLOCK_SIZE, BLOCK_SIZE);
const BESTSCORES = localStorage.getItem('score')
  ? localStorage.getItem('score').split(',')
  : [0, 0, 0];

const board = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const COLORS = ['red', 'green', 'blue', 'yellow', 'purple'];

const PIECES = [
  [
    [1, 1],
    [1, 1],
  ],
  [[1, 1, 1, 1]],
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

const piece = {
  position: { x: 0, y: 0 },
  shape: PIECES[Math.floor(Math.random() * PIECES.length)],
  color: getRandomColor(),
};

let lastTimestamp = 0;
let moveCounter = 0;

function update(timestamp = 0) {
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  moveCounter += deltaTime;

  if (moveCounter >= 1000) {
    piece.position.y++;
    moveCounter = 0;

    if (checkCollision()) {
      piece.position.y--;
      solidifyPiece();
      deleteRows();
    }
  }

  draw();

  window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);

let currentPieceColor = piece.color;

function draw() {
  currentPieceColor =
    piece.color === currentPieceColor ? currentPieceColor : piece.color;
  context.fillStyle = '#333';
  context.fillRect(0, 0, $canvas.width, $canvas.height);

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      context.strokeStyle = 'black';
      context.lineWidth = 0.01;

      context.strokeRect(x, y, 1, 1);
      if (value === 1) {
        context.fillStyle = currentPieceColor;
        context.fillRect(x, y, 1, 1);
      }
    });
  });

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.strokeStyle = 'black';
        context.lineWidth = 0.03;

        context.strokeRect(x + piece.position.x, y + piece.position.y, 1, 1);
        context.fillStyle = piece.color;
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
      }
    });
  });

  $score.innerHTML = SCORE;
  BESTSCORES.sort((a, b) => b - a);
  $bestScore.innerHTML = BESTSCORES.map((score) => `<li>${score}</li>`).join(
    ' '
  );
  localStorage.setItem('score', [...BESTSCORES]);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown') {
    piece.position.y++;
    if (checkCollision()) {
      piece.position.y--;
      solidifyPiece();
      deleteRows();
    }
  }
  if (event.key === 'ArrowLeft') {
    piece.position.x--;
    if (checkCollision()) {
      piece.position.x++;
    }
  }
  if (event.key === 'ArrowRight') {
    piece.position.x++;
    if (checkCollision()) {
      piece.position.x--;
    }
  }
  if (event.key === 'ArrowUp') {
    const rotated = [];

    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = [];
      for (let j = piece.shape.length - 1; j >= 0; j--) {
        row.push(piece.shape[j][i]);
      }
      rotated.push(row);
    }

    const prevShape = piece.shape;
    piece.shape = rotated;
    if (checkCollision()) piece.shape = prevShape;
  }
});

function checkCollision() {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value === 1 && board[y + piece.position.y]?.[x + piece.position.x] !== 0
      );
    });
  });
}

function solidifyPiece() {
  piece.color = getRandomColor();

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = 1;
      }
    });
  });

  piece.position.x = Math.floor(BOARD_WIDTH / 2 - 2);
  piece.position.y = 0;

  piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)];

  SCORE += 10;
  let scoreToPush = [];
  if (checkCollision()) {
    alert('Sorry, game over!');
    scoreToPush.push(SCORE);
    const scoreToRemove = BESTSCORES.findIndex((item) => item < scoreToPush[0]);
    console.log(scoreToRemove);
    if (scoreToRemove !== -1) {
      BESTSCORES.splice(
        scoreToRemove !== 2 ? scoreToRemove + 1 : scoreToRemove,
        1,
        scoreToPush[0]
      );
    }
    SCORE = 0;
    board.forEach((row) => row.fill(0));
  }
}

function deleteRows() {
  const rowsToRemove = [];

  board.forEach((row, y) => {
    if (row.every((val) => val === 1)) {
      rowsToRemove.push(y);
      SCORE += 100;
    }
  });

  rowsToRemove.forEach((y) => {
    board.splice(y, 1);
    const newRow = Array(BOARD_WIDTH).fill(0);
    board.unshift(newRow);
  });
}

update();
