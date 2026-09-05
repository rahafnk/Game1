const BOARD_WIDTH = 360;
const BOARD_HEIGHT = 640;

const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const BIRD_START_X = BOARD_WIDTH / 8;
const BIRD_START_Y = BOARD_HEIGHT / 2;

const PIPE_WIDTH = 64;
const PIPE_HEIGHT = 512;
const PIPE_GAP = BOARD_HEIGHT / 4;
const PIPE_INTERVAL = 1500;

const GRAVITY = 0.4;
const FLAP_STRENGTH = -6;
const PIPE_SPEED = -2;

const STATE = { READY: "ready", PLAYING: "playing", OVER: "over", PAUSED: "paused" };

const sounds = {
  start: new Audio("./audio/gameStart.mp3"),
  hit: new Audio("./audio/die-101soundboards.mp3"),
  over: new Audio("./audio/gamrOver.mp3"),
};

const images = {
  bird: loadImage("./Images/flappybird.png"),
  topPipe: loadImage("./Images/toppipe.png"),
  bottomPipe: loadImage("./Images/bottompipe.png"),
};

let board;
let context;
let bird;
let pipes;
let velocityY;
let score;
let bestScore;
let gameState;
let pipeTimer;

window.addEventListener("load", () => {
  board = document.getElementById("board");
  board.width = BOARD_WIDTH;
  board.height = BOARD_HEIGHT;
  context = board.getContext("2d");

  bestScore = Number(localStorage.getItem("flappyBest")) || 0;
  resetGame();

  document.addEventListener("keydown", handleKey);
  board.addEventListener("mousedown", flap);
  board.addEventListener("touchstart", onTouch, { passive: false });

  requestAnimationFrame(loop);
});

function loadImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

function resetGame() {
  bird = { x: BIRD_START_X, y: BIRD_START_Y, width: BIRD_WIDTH, height: BIRD_HEIGHT };
  pipes = [];
  velocityY = 0;
  score = 0;
  gameState = STATE.READY;
  stopPipeSpawner();
}

function startGame() {
  resetGame();
  gameState = STATE.PLAYING;
  velocityY = FLAP_STRENGTH;
  play(sounds.start);
  pipeTimer = setInterval(placePipes, PIPE_INTERVAL);
}

function stopPipeSpawner() {
  if (pipeTimer) {
    clearInterval(pipeTimer);
    pipeTimer = null;
  }
}

function loop() {
  requestAnimationFrame(loop);
  context.clearRect(0, 0, board.width, board.height);

  if (gameState === STATE.PLAYING) {
    updateBird();
    updatePipes();
  } else {
    drawBird();
    drawPipes();
  }

  drawScore();
  drawOverlay();
}

function updateBird() {
  velocityY += GRAVITY;
  bird.y = Math.max(bird.y + velocityY, 0);
  drawBird();

  if (bird.y + bird.height >= board.height) {
    endGame();
  }
}

function updatePipes() {
  for (const pipe of pipes) {
    pipe.x += PIPE_SPEED;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5;
      pipe.passed = true;
    }

    if (collides(bird, pipe)) {
      endGame();
    }
  }

  while (pipes.length > 0 && pipes[0].x < -PIPE_WIDTH) {
    pipes.shift();
  }
}

function drawBird() {
  context.drawImage(images.bird, bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
  for (const pipe of pipes) {
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
  }
}

function placePipes() {
  if (gameState !== STATE.PLAYING) return;

  const topY = 0 - PIPE_HEIGHT / 4 - Math.random() * (PIPE_HEIGHT / 2);

  pipes.push({
    img: images.topPipe,
    x: BOARD_WIDTH,
    y: topY,
    width: PIPE_WIDTH,
    height: PIPE_HEIGHT,
    passed: false,
  });

  pipes.push({
    img: images.bottomPipe,
    x: BOARD_WIDTH,
    y: topY + PIPE_HEIGHT + PIPE_GAP,
    width: PIPE_WIDTH,
    height: PIPE_HEIGHT,
    passed: false,
  });
}

function endGame() {
  if (gameState === STATE.OVER) return;
  gameState = STATE.OVER;
  stopPipeSpawner();

  play(sounds.hit);
  play(sounds.over);

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("flappyBest", String(bestScore));
  }
}

function flap() {
  if (gameState === STATE.READY || gameState === STATE.OVER) {
    startGame();
    return;
  }

  if (gameState === STATE.PLAYING) {
    velocityY = FLAP_STRENGTH;
  }
}

function handleKey(event) {
  if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyX") {
    event.preventDefault();
    flap();
  } else if (event.code === "KeyP") {
    togglePause();
  }
}

function onTouch(event) {
  event.preventDefault();
  flap();
}

function togglePause() {
  if (gameState === STATE.PLAYING) {
    gameState = STATE.PAUSED;
    stopPipeSpawner();
  } else if (gameState === STATE.PAUSED) {
    gameState = STATE.PLAYING;
    pipeTimer = setInterval(placePipes, PIPE_INTERVAL);
  }
}

function collides(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function play(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function drawScore() {
  context.fillStyle = "white";
  context.strokeStyle = "black";
  context.lineWidth = 3;
  context.font = "45px sans-serif";
  const label = Math.floor(score).toString();
  context.strokeText(label, 12, 50);
  context.fillText(label, 12, 50);
}

function drawOverlay() {
  if (gameState === STATE.PLAYING) return;

  context.fillStyle = "rgba(0, 0, 0, 0.45)";
  context.fillRect(0, 0, board.width, board.height);

  context.fillStyle = "white";
  context.textAlign = "center";

  if (gameState === STATE.READY) {
    drawTitle("Flappy Bird");
    drawSubtitle("Press Space or Tap to start");
  } else if (gameState === STATE.PAUSED) {
    drawTitle("Paused");
    drawSubtitle("Press P to resume");
  } else if (gameState === STATE.OVER) {
    drawTitle("Game Over");
    drawSubtitle("Press Space or Tap to play again");
    context.font = "22px sans-serif";
    context.fillText(`Score: ${Math.floor(score)}`, board.width / 2, board.height / 2 + 40);
    context.fillText(`Best: ${Math.floor(bestScore)}`, board.width / 2, board.height / 2 + 72);
  }

  context.textAlign = "left";
}

function drawTitle(text) {
  context.font = "40px sans-serif";
  context.fillText(text, board.width / 2, board.height / 2 - 40);
}

function drawSubtitle(text) {
  context.font = "18px sans-serif";
  context.fillText(text, board.width / 2, board.height / 2);
}
