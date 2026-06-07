# Echo Vein

Echo Vein is a modular HTML roguelike survivor prototype about Hollowshift Guild subsurface operators descending into unstable alien caverns to extract resonance minerals and survive escalating Hollowborn swarms.

Mission phrase: descend, extract, survive.

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
assets/sprites/         Optional sprite pack PNGs
js/core.js              Constants, global game state, data dictionaries, UI references, helpers, canvas resize
js/assets.js            Optional sprite loading with procedural rendering fallbacks
js/audio.js             Web Audio procedural sound engine
js/entities.js          Player, Enemy, enemy types, makeGame()
js/world.js             Cave generation, tiles, mining helpers, enemy spawning, log
js/systems.js           Update loop logic: player, enemies, weapons, bullets, pickups, Echo, upgrades
js/render-ui.js         HUD updates, drawing functions, menus, game over/start flows
js/main.js              requestAnimationFrame loop, keyboard/mouse input, startup
```

## Identity Pass

- Game title updated to Echo Vein.
- Visible classes are Bulwark, Pathfinder, and Borecaster.
- Visible resources are Gild Shards, Voltarite, and Echo Shards.
- Visible weapons now use original names such as Rotary Mauler, Vector Carbine, Thermal Lance, Warden Drones, Sifter Drone, Storm Lattice, Bore Rail, and Return Disc.
- Optional sprite loading supports mineral nodes, Echo Shard pickups, Warden Drones, and Sifter Drones while preserving procedural fallbacks.

## Current Additions

- Gamepad movement support uses the first connected controller's left analogue stick.
- Upgrade cards use pictorial icons again instead of acronym-only labels.
- Targeting Cursor is a one-time upgrade that switches player weapons into manual mouse fire while the mouse is active; left click shoots purple projectiles, and auto-fire resumes when the mouse goes idle.
- Pathfinder traps can be placed with `E` on keyboard or the Xbox controller `A` button.
- Arc Connection is a repeatable power-up. Right-click enemies to build an ordered green chain, then right-click empty space with two or more linked enemies to detonate electric/fire arc damage. Each upgrade adds one more selectable target.
- Development debug mode adds a Debug button with upgrade application, weapon unlocks, test spawns, clears, player-state controls, and a debug action log.

## Development Notes

The scripts are loaded in dependency order using normal browser scripts, not a bundler. This keeps the game very easy to open locally. Later, this can be converted to ES modules with `import`/`export` once the project grows further.
