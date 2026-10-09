"""Capture the real browser game; never redraw or reimplement its gameplay."""
import io
import os
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def main():
    frames = []
    errors = []
    with sync_playwright() as playwright:
        options = {"headless": True}
        if os.environ.get("CHROMIUM_EXECUTABLE"):
            options.update(executable_path=os.environ["CHROMIUM_EXECUTABLE"],
                           args=["--no-sandbox", "--disable-gpu", "--no-zygote", "--single-process"])
        browser = playwright.chromium.launch(**options)
        page = browser.new_page(viewport={"width": 640, "height": 760}, device_scale_factor=1)
        page.on("pageerror", lambda error: errors.append(str(error)))
        # Advance the real application's timers deterministically between screenshots.
        # The app's JS, canvas renderer, physics, and random food placement are unchanged.
        page.clock.install()
        page.goto((ROOT / "snakegame.html").as_uri())
        page.clock.pause_at(page.evaluate("Date.now()"))

        def capture(count):
            for _ in range(count):
                page.clock.run_for(100)
                frames.append(Image.open(io.BytesIO(page.screenshot())).convert("RGB"))

        capture(80)
        score = int(page.locator("#score").inner_text())
        assert score > 0, "Autopilot did not eat food"
        page.keyboard.press("r")
        assert page.locator("#score").inner_text() == "0"
        capture(5)
        page.keyboard.press("ArrowDown")
        assert page.locator("#mode").inner_text() == "Manual"
        capture(20)
        page.keyboard.press("ArrowLeft")
        capture(20)
        assert page.locator("#status").inner_text() == "", "Manual movement collided"
        page.keyboard.press("a")
        assert page.locator("#mode").inner_text() == "Autopilot"
        capture(30)
        page.keyboard.press("r")
        assert page.locator("#score").inner_text() == "0"
        capture(5)
        assert not errors, errors
        browser.close()

    palette = frames[0].quantize(colors=128)
    indexed = [frame.quantize(palette=palette, dither=Image.Dither.NONE) for frame in frames]
    indexed[0].save(ROOT / "Snake-Demo.gif", save_all=True, append_images=indexed[1:],
                    duration=100, loop=0, optimize=True, disposal=1)
    print(f"Captured {len(frames)} real browser frames; autopilot reached score {score}; "
          "manual controls, mode toggle, restart and browser error checks passed.")


if __name__ == "__main__":
    main()
