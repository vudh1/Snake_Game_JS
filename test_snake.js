const assert = require("node:assert/strict");
const {
  wrapCoordinate,
  toroidalDistance,
  containsPoint,
  chooseAutoDirection,
} = require("./snakeJS.js");

assert.equal(wrapCoordinate(-20, 800), 780);
assert.equal(wrapCoordinate(800, 800), 0);
assert.equal(wrapCoordinate(820, 800), 20);

assert.equal(
  toroidalDistance({ x: 0, y: 0 }, { x: 780, y: 0 }, 800, 800),
  20
);
assert.equal(
  toroidalDistance({ x: 0, y: 0 }, { x: 0, y: 780 }, 800, 800),
  20
);

const snake = [
  { x: 0, y: 0 },
  { x: 20, y: 0 },
  { x: 40, y: 0 },
];

assert.equal(containsPoint(snake, 20, 0), true);
assert.equal(containsPoint(snake, 60, 0), false);

const direction = chooseAutoDirection(
  snake,
  { x: 780, y: 0 },
  800,
  800,
  20
);
assert.deepEqual(direction, { x: -20, y: 0 });

const blockedSnake = [
  { x: 0, y: 0 },
  { x: 780, y: 0 },
  { x: 20, y: 0 },
  { x: 0, y: 780 },
];
const escape = chooseAutoDirection(
  blockedSnake,
  { x: 0, y: 40 },
  800,
  800,
  20
);
assert.deepEqual(escape, { x: 0, y: 20 });

console.log("Snake core tests passed.");
