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
js/progression.js       LocalStorage profile, main menu, permanent upgrades, mission/run progression
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
- Enemies now use terrain-aware pursuit: direct line-of-sight movement when possible, grid pathfinding through mined tunnels around obstacles when needed, mining-triggered navigation invalidation, stuck recovery, and a debug toggle for path visualization.
- The prototype now starts through a saved-profile flow, main menu, permanent upgrades, mission/run objectives, boss gating, extraction timer, and persistent resource banking.
- Boss spawns are validated against current terrain with clearance and reachability checks. Elites can fire scaling ranged bolts, and later-run shatter bolts can destroy mineable terrain while permanently losing any ore they hit.

## Development Notes

The scripts are loaded in dependency order using normal browser scripts, not a bundler. This keeps the game very easy to open locally. Later, this can be converted to ES modules with `import`/`export` once the project grows further.


## Hammerfall Salvo

Bulwark can unlock Hammerfall Salvo, a guided missile salvo weapon with target locks, curved flight, retargeting, and upgrade cards for damage, speed, fuel, missile count, and accuracy.


## Upgrade menu and lava obstacles update

- Permanent upgrades are now grouped by category in a table layout.
- Buy buttons are disabled and greyed out when resources are insufficient.
- Mining uses a forward assist cone so corner mining feels smoother.
- Player collision uses a smaller collision radius and corner push assist for smoother tunnel movement.
- Lava Rock is a non-mineable, blocking obstacle tile placed inside open cave areas.

## Movement / Mining / Enemy Bullet update

This build improves low-speed mining contact by evaluating the player's intended input direction before collision sliding. Mining uses a wider forward contact fan, stores optional debug samples, and reduces tangential wall-skating while drilling into mineable blocks.

Enemy pressure now ramps up more gradually during the first minutes of a run. Small enemies can fire low-damage red bullets at low frequency, while elite and boss bullets remain larger, brighter red/red-orange projectiles. Debug tools can toggle enemy bullets, show enemy bullet hitboxes, show the mining contact arc, and enable a low-speed mining test mode.

## v2 Low-Speed Mining Contact Update

This build improves mining contact at low movement speeds. Mining now uses the intended input direction before collision resolution, a wider fan/contact candidate scan, true circle-to-tile-corner contact checks, and a short sticky mining lock so the active rock target does not flicker while pushing into corners. Debug tools include mining arc visualisation and repeatable corner/wall/tunnel/lava test pockets.
