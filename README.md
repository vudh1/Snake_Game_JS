# Snake Game JS

A browser-based Snake game with two play styles:

- **Autopilot** chooses a safe neighboring cell that moves the snake toward the food using toroidal (wrap-around) distance.
- **Manual mode** uses the arrow keys and prevents immediate 180-degree reversals.

The board wraps at every edge, so moving off one side brings the snake back on the opposite side.

## Demo

![Snake gameplay demo](Snake-Demo.gif)

*Captured directly from `snakegame.html` running in Chromium: autopilot eats food, arrow keys steer in manual mode, `A` restores autopilot, and `R` restarts. The actual JavaScript and canvas renderer produce every frame.*

## Controls

- Arrow keys — switch to manual mode and steer
- `A` — toggle autopilot/manual mode
- `R` — restart

Eating food increases the score, grows the snake, and gradually increases game speed.

## Run

No build step is required. Open `snakegame.html` in a browser.

## Test

The game core is also exported for Node-based tests:

```bash
npm test
```

The tests cover edge wrapping, toroidal distance, collision lookup, and autopilot direction selection.

## Re-record the demo

```bash
pip install pillow playwright
python -m playwright install --with-deps chromium
python scripts/generate_demo.py
```

The recorder uses the real page and keyboard inputs, checks scoring/mode/restart behavior and browser errors, and advances the app’s own timers at 100 ms capture intervals. It does not recreate the game. You can also run **Actions → Generate demo GIF** manually.
