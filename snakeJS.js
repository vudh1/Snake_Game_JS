    const board_border = 'black';
    const board_background = 'white';
    const snake_col = 'lightblue';
    const snake_border = 'lightblue';

    let snake = [
    {x: 400, y: 400},
    {x: 380, y: 400},
    {x: 360, y: 400},
    {x: 340, y: 400},
    {x: 320, y: 400},
    {x: 300, y: 400},
    {x: 280, y: 400},
    {x: 260, y: 400},
    {x: 240, y: 400},
    {x: 220, y: 400},
    {x: 200, y: 400},
    ]

    let score = 0;
    // True if changing direction
    let changing_direction = false;
    // Horizontal velocity
    let foodX;
    let foodY;
    let dx = 20;
    // Vertical velocity
    let dy = 0;

    let tempo = 100;

    // Get the canvas element
    const snakeboard = document.getElementById("snakeboard");
    // Return a two dimensional drawing context
    const snakeboard_ctx = snakeboard.getContext("2d");
    // Start game
    main();

    // increaseTempo();

    generateFood();

    document.addEventListener("keydown", changeDirection);

    // main function called repeatedly to keep the game running
    function main() {

      if (gameEnded()) return;

      changing_direction = false;
      setTimeout(function onTick() {
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
        // Repeat
        main();
      }, tempo);
    }

    // draw a border around the canvas
    function clearCanvas() {
      //  Select the colour to fill the drawing
      snakeboard_ctx.fillStyle = board_background;
      //  Select the colour for the border of the canvas
      snakeboard_ctx.strokestyle = board_border;
      // Draw a "filled" rectangle to cover the entire canvas
      snakeboard_ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
      // Draw a "border" around the entire canvas
      snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
    }

    // Draw the snake on the canvas
    function drawSnake() {
      // Draw each part
      snake.forEach(drawSnakePart)
    }

    function drawFood() {
      snakeboard_ctx.fillStyle = 'lightgreen';
      snakeboard_ctx.strokestyle = 'darkgreen';
      snakeboard_ctx.fillRect(foodX, foodY, 20, 20);
      snakeboard_ctx.strokeRect(foodX, foodY, 20, 20);
    }

    // Draw one snake part
    function drawSnakePart(snakePart) {

      // Set the colour of the snake part
      snakeboard_ctx.fillStyle = snake_col;
      // Set the border colour of the snake part
      snakeboard_ctx.strokestyle = snake_border;
      // Draw a "filled" rectangle to represent the snake part at the coordinates
      // the part is located
      snakeboard_ctx.fillRect(snakePart.x, snakePart.y, 20, 20);
      // Draw a border around the snake part
      snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, 20, 20);
    }

    function gameEnded() {
      for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
      }

      hitBorder();

      return false;
    }



    function hitBorder(){
    // hit left border
    if (snake[0].x < 0)
    {
      snake[0].x = snakeboard.width - 20;
    }

      // hit right border
      if(snake[0].x > snakeboard.width)
      {
        snake[0].x = 0;
      }

      //hit up border
      if(snake[0].y < 0)
      {
        snake[0].y = snakeboard.height - 20;
      }

      if(snake[0].y > snakeboard.height)
      {
        snake[0].y = 0
      }
    }

    function randomFood(min, max) {
      return Math.round((Math.random() * (max-min) + min) / 20) * 20;
    }

    function generateFood() {
      // Generate a random number the food x-coordinate
      foodX = randomFood(20, snakeboard.width - 40);
      // Generate a random number for the food y-coordinate
      foodY = randomFood(20, snakeboard.height - 40);
      // if the new food location is where the snake currently is, generate a new food location
      snake.forEach(function snakeHasEatenFood(part) {
        const has_eaten = part.x == foodX && part.y == foodY;
        if (has_eaten) generateFood();
      });
    }

    function changeDirection(event) {
      const LEFT_KEY = 37;
      const RIGHT_KEY = 39;
      const UP_KEY = 38;
      const DOWN_KEY = 40;

    // Prevent the snake from reversing

    if (changing_direction) return;
    changing_direction = true;
    const keyPressed = event.keyCode;
    const goingUp = dy === -20;
    const goingDown = dy === 20;
    const goingRight = dx === 20;
    const goingLeft = dx === -20;
    if (keyPressed === LEFT_KEY && !goingRight) {
      dx = -20;
      dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
      dx = 0;
      dy = -20;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
      dx = 20;
      dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
      dx = 0;
      dy = 20;
    }
  }

  function moveSnake() {

    diffs = dfs();

      // Create the new Snake's head
      const head = {x: snake[0].x + diffs[0], y: snake[0].y + diffs[1]};
      // Add the new head to the beginning of snake body
      snake.unshift(head);
      const has_eaten_food = snake[0].x === foodX && snake[0].y === foodY;
      if (has_eaten_food) {
        // Increase score
        score += 10;

        tempo = Math.ceil(tempo * 0.75);

        // Display score on screen
        document.getElementById('score').innerHTML = score;
        // Generate new food location
        generateFood();
      } else {
        // Remove the last part of snake body
        snake.pop();
      }
    }

    function distance(coordinate1, coordinate2){
      inDistanceX = Math.abs(coordinate1[0] - coordinate2[0]);
      inDistanceY = Math.abs(coordinate1[1] - coordinate2[1]);
      outDistanceX = 800 - inDistanceX;
      outDistanceY = 800 - inDistanceY;
      return Math.min(Math.sqrt((inDistanceX)**2 + (inDistanceY)**2),Math.sqrt((outDistanceX)**2 + (outDistanceY)**2)) ;
    }

    function validHead(newSnakeHeadX, newSnakeHeadY){
      for(let i = 0; i < snake.length; i++){
        if(snake[i].x == newSnakeHeadX && snake[i].y == newSnakeHeadY){
          return false;
        }
      }
      return true;
    }

    function dfs(){
      snakeX = snake[0].x;
      snakeY = snake[0].y;

      neighbors = [];

      defaultDirs = [[-20,0],[20,0],[0,-20],[0,20]];

      min = Number.MAX_VALUE;
      minDirection = 0;

      for(var i = 0; i < defaultDirs.length; i++){
        newSnakeHeadX = snakeX + defaultDirs[i][0];
        newSnakeHeadY =snakeY + defaultDirs[i][1];
        if (validHead(newSnakeHeadX,newSnakeHeadY)){
          d = distance([newSnakeHeadX,newSnakeHeadY],[foodX,foodY]);

          if(d < min){
            min = d;
            minDirection = i;
          }
        }
      }

      return defaultDirs[minDirection];
    }

