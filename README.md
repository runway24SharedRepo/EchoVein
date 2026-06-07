# Rockfall Survivor - Modular HTML Roguelike Prototype

This is the same browser game split into separate files so the project is easier to extend.

## Run

Open `index.html` in Chrome, Edge, or Firefox. If your browser blocks local files, run a tiny local server from this folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Structure

```text
index.html              HTML shell and overlays
css/style.css           All UI and canvas styling
js/core.js              Constants, global game state, UI references, helpers, canvas resize
js/audio.js             Web Audio procedural sound engine
js/entities.js          Player, Enemy, enemy types, makeGame()
js/world.js             Cave generation, tiles, mining helpers, enemy spawning, log
js/systems.js           Update loop logic: player, enemies, weapons, bullets, pickups, XP, upgrades
js/render-ui.js         HUD updates, drawing functions, menus, game over/start flows
js/main.js              requestAnimationFrame loop, keyboard/mouse input, startup
```

## Development notes

The scripts are loaded in dependency order using normal browser scripts, not a bundler. This keeps the game very easy to open locally. Later, this can be converted to ES modules with `import`/`export` once the project grows further.


## New additions

- Enhanced multi-layer explosion VFX with shockwaves and spark bursts
- Additional drone-focused upgrades
- New boomerang weapon upgrade


## v3 additions

- Autonomous roaming drones now move around the player and fire their own micro-bullets at enemies.
- Arc Coil now draws visible chain-lightning VFX and applies local electric splash damage around chained targets.
- Scout now has an explosive trap kit. Press `E` to place a trap on the ground; it arms shortly after deployment and explodes when enemies step on it.


## v4 additions

- Sweeper Drone utility upgrade
- Sweeper drones roam independently and collect XP crystals for the player
- Sweeper Optics and Sweeper Turbo improve XP search radius, movement speed, and collection radius
