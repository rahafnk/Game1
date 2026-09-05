# Flappy Bird

A lightweight remake of the classic **Flappy Bird**, built with plain HTML5 Canvas and
vanilla JavaScript — no libraries, no build step. Guide the bird through the gaps between
pipes and chase a new high score.

## How to Play

| Action | Controls |
|--------|----------|
| Flap / start / restart | `Space`, `↑`, `X`, mouse click, or tap |
| Pause / resume | `P` |

- The game opens on a **start screen** — flap to begin.
- Passing a pair of pipes scores **1 point**.
- Hitting a pipe or the ground ends the run.
- Your **best score is saved** in the browser (`localStorage`) between sessions.

## Run It Locally

The game loads images and audio with relative paths, so serve the folder over HTTP rather
than opening the file directly:

```bash
# Python 3
python3 -m http.server 8000

# or Node
npx serve .
```

Then open `http://localhost:8000`.

## Project Structure

```
Game1/
├── index.html      # Canvas + control hints
├── styles.css      # Page layout and board styling
├── flappybird.js   # Game loop, physics, input, scoring
├── Images/         # Bird, pipes, and background sprites
└── audio/          # Start, hit, and game-over sounds
```

## How It Works

The game runs a single `requestAnimationFrame` loop and moves between four states —
`ready`, `playing`, `paused`, and `over`. Gravity pulls the bird down each frame while a
flap applies an upward velocity; pipes spawn on a timer and scroll left, and simple
axis-aligned bounding-box checks detect collisions.
