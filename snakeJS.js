(() => {
  "use strict";

  const CELL_SIZE = 20;
  const INITIAL_TEMPO_MS = 80;
  const MIN_TEMPO_MS = 35;
  const SPEED_UP_FACTOR = 0.92;

  function wrapCoordinate(value, size) {
    return ((value % size) + size) % size;
  }

  function toroidalDistance(pointA, pointB, width, height) {
    const rawX = Math.abs(pointA.x - pointB.x);
    const rawY = Math.abs(pointA.y - pointB.y);
    const dx = Math.min(rawX, width - rawX);
    const dy = Math.min(rawY, height - rawY);
    return Math.hypot(dx, dy);
  }

  function containsPoint(snake, x, y) {
    return snake.some((part) => part.x === x && part.y === y);
  }

  function chooseAutoDirection(snake, food, width, height, cellSize = CELL_SIZE) {
    if (!snake.length) {
      return null;
    }

    const head = snake[0];
    const directions = [
      { x: -cellSize, y: 0 },
      { x: cellSize, y: 0 },
      { x: 0, y: -cellSize },
      { x: 0, y: cellSize },
    ];

    let best = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const direction of directions) {
      const x = wrapCoordinate(head.x + direction.x, width);
      const y = wrapCoordinate(head.y + direction.y, height);

      // Autopilot is conservative: it never intentionally enters the body.
      if (containsPoint(snake, x, y)) {
        continue;
      }

      const distance = toroidalDistance({ x, y }, food, width, height);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = direction;
      }
    }

    return best;
  }

  const core = {
    CELL_SIZE,
    wrapCoordinate,
    toroidalDistance,
    containsPoint,
    chooseAutoDirection,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = core;
  }

  if (typeof document === "undefined") {
    return;
  }

  const board = document.getElementById("snakeboard");
  if (!board) {
    return;
  }

  const context = board.getContext("2d");
  const scoreElement = document.getElementById("score");
  const modeElement = document.getElementById("mode");
  const statusElement = document.getElementById("status");

  const boardBorder = "black";
  const boardBackground = "white";
  const snakeColor = "lightblue";
  const snakeBorder = "steelblue";
  const foodColor = "lightgreen";
  const foodBorder = "darkgreen";

  let snake;
  let score;
  let changingDirection;
  let foodX;
  let foodY;
  let dx;
  let dy;
  let tempo;
  let autopilot;
  let gameOver;
  let timerId;

  function initialSnake() {
    const parts = [];
    for (let x = 400; x >= 200; x -= CELL_SIZE) {
      parts.push({ x, y: 400 });
    }
    return parts;
  }

  function resetGame() {
    if (timerId) {
      clearTimeout(timerId);
    }

    snake = initialSnake();
    score = 0;
    changingDirection = false;
    foodX = 0;
    foodY = 0;
    dx = CELL_SIZE;
    dy = 0;
    tempo = INITIAL_TEMPO_MS;
    autopilot = true;
    gameOver = false;
    timerId = null;

    updateHud();
    generateFood();
    drawFrame();
    scheduleNextTick();
  }

  function updateHud() {
    if (scoreElement) {
      scoreElement.textContent = String(score);
    }
    if (modeElement) {
      modeElement.textContent = autopilot ? "Autopilot" : "Manual";
    }
    if (statusElement) {
      statusElement.textContent = gameOver ? "Game over — press R to restart" : "";
    }
  }

  function scheduleNextTick() {
    if (!gameOver) {
      timerId = setTimeout(tick, tempo);
    }
  }

  function tick() {
    changingDirection = false;

    if (!moveSnake()) {
      gameOver = true;
      updateHud();
      drawFrame();
      return;
    }

    drawFrame();
    scheduleNextTick();
  }

  function clearCanvas() {
    context.fillStyle = boardBackground;
    context.strokeStyle = boardBorder;
    context.fillRect(0, 0, board.width, board.height);
    context.strokeRect(0, 0, board.width, board.height);
  }

  function drawFrame() {
    clearCanvas();
    drawFood();
    snake.forEach(drawSnakePart);
  }

  function drawFood() {
    context.fillStyle = foodColor;
    context.strokeStyle = foodBorder;
    context.fillRect(foodX, foodY, CELL_SIZE, CELL_SIZE);
    context.strokeRect(foodX, foodY, CELL_SIZE, CELL_SIZE);
  }

  function drawSnakePart(part) {
    context.fillStyle = snakeColor;
    context.strokeStyle = snakeBorder;
    context.fillRect(part.x, part.y, CELL_SIZE, CELL_SIZE);
    context.strokeRect(part.x, part.y, CELL_SIZE, CELL_SIZE);
  }

  function randomCell(size) {
    const cellCount = Math.floor(size / CELL_SIZE);
    return Math.floor(Math.random() * cellCount) * CELL_SIZE;
  }

  function generateFood() {
    if (snake.length >= (board.width / CELL_SIZE) * (board.height / CELL_SIZE)) {
      gameOver = true;
      return;
    }

    do {
      foodX = randomCell(board.width);
      foodY = randomCell(board.height);
    } while (containsPoint(snake, foodX, foodY));
  }

  function moveSnake() {
    let direction = { x: dx, y: dy };

    if (autopilot) {
      const autoDirection = chooseAutoDirection(
        snake,
        { x: foodX, y: foodY },
        board.width,
        board.height,
        CELL_SIZE
      );

      if (!autoDirection) {
        return false;
      }

      direction = autoDirection;
      dx = direction.x;
      dy = direction.y;
    }

    const head = {
      x: wrapCoordinate(snake[0].x + direction.x, board.width),
      y: wrapCoordinate(snake[0].y + direction.y, board.height),
    };

    const ateFood = head.x === foodX && head.y === foodY;

    // Moving into the current tail is legal when the tail moves away this tick.
    const occupiedBody = ateFood ? snake : snake.slice(0, -1);
    if (containsPoint(occupiedBody, head.x, head.y)) {
      return false;
    }

    snake.unshift(head);

    if (ateFood) {
      score += 10;
      tempo = Math.max(MIN_TEMPO_MS, Math.ceil(tempo * SPEED_UP_FACTOR));
      generateFood();
      updateHud();
    } else {
      snake.pop();
    }

    return true;
  }

  function changeDirection(event) {
    const key = event.key;

    if (key === "r" || key === "R") {
      resetGame();
      return;
    }

    if (key === "a" || key === "A") {
      autopilot = !autopilot;
      updateHud();
      return;
    }

    const directionByKey = {
      ArrowLeft: { x: -CELL_SIZE, y: 0 },
      ArrowRight: { x: CELL_SIZE, y: 0 },
      ArrowUp: { x: 0, y: -CELL_SIZE },
      ArrowDown: { x: 0, y: CELL_SIZE },
    };

    const next = directionByKey[key];
    if (!next || gameOver || changingDirection) {
      return;
    }

    event.preventDefault();
    autopilot = false;

    const isReverse = next.x === -dx && next.y === -dy;
    if (isReverse) {
      updateHud();
      return;
    }

    dx = next.x;
    dy = next.y;
    changingDirection = true;
    updateHud();
  }

  document.addEventListener("keydown", changeDirection);
  resetGame();
})();
