# EchoVein - Project Context

## Project Identity

**EchoVein** is a 2D top-down browser/desktop roguelike extraction-mining action game.

The game identity is:

> A tactical underground extraction roguelike where digging is both your economy and your biggest risk.

Core gameplay loop:

```text
Explore the cave.
Mine valuable resources.
Mining creates danger.
Fight increasingly aggressive enemies.
Complete mission objectives.
Defeat the boss.
Reach extraction.
Escape with as much as possible.
Upgrade permanently.
Repeat.
```

---

## Current Platform Targets

### Browser / itch.io Build

- HTML5 Canvas game running in browser.
- Designed for itch.io HTML5 hosting.
- Supports keyboard, mouse, and controller.
- Large-monitor and scaling hotfix has been applied.
- Menu scrolling and controller navigation hotfix has been applied.

### Windows Desktop Build

- Windows downloadable build added using Electron.
- Electron entry file: `electron-main.cjs`
- Build config: `package.json`
- Build command:

```bat
npm run dist:win
```

- Output:

```text
dist/EchoVein 0.1.0.exe
```

---

## Core Architecture

- Engine: Canvas 2D with Web Audio
- Desktop wrapper: Electron
- Main entry: `index.html`
- Styles: `css/style.css`
- Scripts:
  - `main.js`
  - `core.js`
  - `entities.js`
  - `systems.js`
  - `render-ui.js`
  - `progression.js`
  - additional gameplay/debug/config modules as required
- State: Central game state object in `core.js`
- Rendering: Canvas 2D world rendering + UI overlays
- Audio: Web Audio generated effects
- Persistence: Browser local storage / profile persistence
- Input: keyboard, mouse, controller

---

## Recent Technical Hotfixes Completed

### Browser / itch.io Hotfix

Completed after player feedback about browser issues on large monitors and menus bouncing instead of scrolling.

Implemented fixes:

- Fixed large-monitor scaling.
- Added fixed logical game viewport.
- Improved canvas scaling and centring.
- Improved mouse coordinate remapping after scaling.
- Fixed controller cursor scaling.
- Fixed controller cursor initial position.
- Fixed upgrade/menu scroll behaviour.
- Prevented controller focus from forcing `scrollIntoView()` every frame.
- Improved mouse wheel behaviour inside overlays.
- Improved controller stick / D-pad scrolling for tall menus.
- Added safer browser/iframe scroll-lock handling.
- Improved CSS scroll containment for:
  - main menu content
  - class/operator cards
  - level-up upgrade cards
  - run statistics panels

### Desktop Build Hotfix

Completed:

- Added Electron desktop wrapper.
- Added Windows portable executable build support.
- Added `package.json`.
- Added `electron-main.cjs`.
- Confirmed `npm install` and `npm run dist:win` produce Windows executable.

Repository hygiene recommendation:

- Keep:
  - `package.json`
  - `package-lock.json`
  - `electron-main.cjs`
  - source files
- Do not commit or upload:
  - `node_modules/`
  - `dist/`
- Add / keep `.gitignore` entries:

```gitignore
node_modules/
dist/
*.log
```

---

## Key Existing Systems

### Combat

- Heat-based weapon system.
- Overheat mechanics.
- Multiple operator weapons.
- Projectiles, bombs, drones, traps, and special weapons.
- Boss weak points and stagger-style damage windows.

### Progression

- XP and level system.
- Operator classes.
- Permanent upgrades.
- Operator-specific XP.
- Prestige bonuses.
- Milestones and achievements.
- Upgrade synergies.

### Resources

- Ore mining with tiered economy.
- Common / uncommon / rare resource categories.
- Gild Shards.
- Voltarite.
- Boss-specific resources.
- Resource conversion system.

### Enemies

- 20+ enemy types and visual variants.
- A* pathfinding.
- Enemies can interact with terrain.
- Some enemies can mine or break blocks.
- Behaviour-specific enemies including chargers, blinkers, spawners, support units, and flying enemies.

### Missions

Current mission types:

- Hunt
- Survey
- Harvest
- Holdout

Existing mission system works, but next roadmap goal is to make mission types mechanically more distinct.

### Bosses

Current boss roster:

- Hollow Tyrant
- Hex Shard Colossus
- Molten Maw

Boss features:

- Phase transitions.
- Weak points.
- Unique attacks.
- Boss-specific drops.
- Extraction triggered after boss defeat.

### Extraction

Existing extraction features:

- Extraction sequence after boss defeat.
- Extraction craft.
- Glowing yellow dotted path from player to extraction.
- Dynamic line-of-sight sampling.
- Blocked path indicator.

Next roadmap goal is to turn extraction into a stronger final escape phase.

---

# Completed Development Phases

## Phase 1: Progression & Meta Overhaul

### Phase 1.1 — Milestones & Achievements ✅

- 30 milestones.
- Locked/unlocked state.
- Progress tracking.
- Persistence.

### Phase 1.2 — Mission Variety ✅

- Hunt, Survey, Harvest, Holdout.
- Mission selection UI.
- Mission tracking.

### Phase 1.3 — Permanent Upgrade Expansion ✅

- 10 upgrade categories.
- Tiered upgrade costs.

### Phase 1.4 — Resource Economy Rebalance ✅

- Gild income reduced.
- Voltarite availability increased.
- Upgrade costs reworked.
- Resource conversion system added.
- Bonus objectives implemented.

### Phase 1.5 — Operator XP & Prestige ✅

- Persistent class-specific XP.
- Level cap.
- Stacking prestige bonuses:
  - HP
  - damage
  - speed
  - mining
  - heat
- Main menu UI.
- In-game HUD support.
- Milestones for operator levels and prestige.
- Debug tools for testing.

### Phase 1.6 — Run History / Hall of Records ⏳

Planned / not yet completed.

Planned scope:

- Add run history to profile.
- Store completed/failed run records.
- Track best runs.
- Track operator-specific records.
- Add Hall of Records UI.
- Show statistics such as:
  - run duration
  - kills
  - resources collected
  - boss defeated
  - operator used
  - mission type
  - extraction success/failure

---

## Phase 2.1 — Upgrade Synergies ✅

Implemented:

- 8 synergies.
- Check/apply logic.
- UI menu.
- Profile persistence.
- In-run hooks.

---

## Phase 2.2 — Boss Rework ✅

Implemented:

- 3 unique bosses:
  - Hollow Tyrant
  - Hex Shard Colossus
  - Molten Maw
- Phase system.
- Weak point mechanic.
- 9 boss-specific attack patterns.
- Boss health bar UI.
- Boss name display.
- Boss drops.
- Boss selection logic.
- Audio:
  - boss roar
  - boss phase
  - boss defeat
  - weak point appear
  - weak point hit

---

## Phase 2.3 — Enemy Behaviours ✅

Implemented behaviours:

- `flyingChase` — ignores terrain collision, moves directly toward player.
- `zigzagChase` — sinusoidal lateral movement.
- `blinkChase` — teleports closer when far away, brief invulnerability.
- `terrainCharger` — charges through mineable terrain and breaks tiles.
- `supportBuffer` — buffs nearby allies.
- `charger` — wind-up charge with telegraph.
- `spawner` — spawns minions periodically.

Associated enemies include:

- gloomBat
- boneSkitter
- voidMite
- fractureBeetle
- echoSiren
- ironMaw
- sporeMother

---

## Phase 2.4 — Boss Fight Improvements ✅

Implemented:

- Reduced boss attack cooldowns.
- Attack telegraphs.
- New attacks:
  - `multiRush`
  - `crystalWall`
  - `lavaPoolBurst`
- Dramatic phase transitions.
- Knockback / stun / particle burst effects.
- Universal telegraph pulse.

---

## Phase 2.5 — Extraction Path ✅

Implemented:

- Glowing yellow dotted line from player to extraction craft.
- Dynamic line-of-sight sampling.
- Pulsing animation.
- Blocked indicator when path is obstructed.

---

## Phase 2.6 — Upgrade Pool Guards ✅

Implemented prerequisite checks:

- Drone upgrades require `Warden Drone Bay`.
- Sifter upgrades require `Sifter Drone`.
- Trap upgrades require `Trap Kit`.
- `Supply Cache` appears only with enough Voltarite.
- Stackable upgrade feedback added.

---

# Boss Details

## Hollow Tyrant

Role:

- Melee / tank boss.

Attacks:

- Phase 1:
  - slow melee swipe
  - charge attack
- Phase 2:
  - faster swipe
  - ground slam
  - shockwave
- Phase 3 / Enrage:
  - attacks 30% faster
  - rage roar
  - multiple shockwaves
  - multiRush

Unique drop:

- Tyrant Core

---

## Hex Shard Colossus

Role:

- Ranged / artillery boss.

Attacks:

- Phase 1:
  - 3-crystal spread
  - spawns 1 Hex Shard
- Phase 2:
  - 5-crystal spread
  - spawns 2 Hex Shards
  - Crystal Rain
  - Crystal Wall
- Phase 3 / Enrage:
  - 7-crystal spread
  - spawns 3 Hex Shards
  - faster Crystal Rain

Unique drop:

- Hex Crystal Fragment

---

## Molten Maw

Role:

- Burrower / fire boss.

Attacks:

- Phase 1:
  - burrow and erupt
  - leaves lava pool
- Phase 2:
  - faster burrow
  - fire trail
  - 3 fireballs
  - Lava Pool Burst
- Phase 3 / Enrage:
  - faster movement
  - longer fire trail
  - tracking fireballs

Unique drop:

- Molten Ember

---

## Boss Rewards

- XP reward.
- Bonus Gild Shards.
- Rare ore drop.
- Boss-specific resource.
- Boss kill milestone progress.
- Triggers extraction sequence.

---

# One-Month Roadmap / Next Major Release Direction

The next major development cycle should focus on gameplay depth, visual atmosphere, and replayability.

Priority areas:

1. Stronger mission variety.
2. Mining resonance / danger system.
3. Improved enemy readability and telegraphs.
4. Enemy nests and cave threats.
5. More interesting upgrade choices.
6. Stronger extraction finale.
7. Cave visual polish.
8. Dynamic lighting and atmosphere.
9. Biomes and cave identity.
10. UI and quality-of-life improvements.
11. Performance and stability improvements.

---

## Phase 3.1 — Mission Objective Rework ⏳

Goal:

Mission types should feel mechanically different, not only use different counters.

Recommended objective structure:

```js
primaryObjectives: required to spawn the boss
secondaryObjectives: optional bonus rewards
pressureObjectives: optional risk/reward objectives
```

### Hunt Missions

Focus:

- combat
- elite targets
- enemy pressure
- tactical routing

Possible objectives:

- Kill a specific elite enemy.
- Eliminate dangerous enemy groups.
- Destroy a boss-linked enemy pack.
- Survive ambushes.

### Harvest Missions

Focus:

- mining
- resources
- greed versus danger

Possible objectives:

- Mine a specific amount of ore.
- Collect rare resources.
- Extract with minimum cargo value.
- Mine unstable resources before danger rises.

### Survey Missions

Focus:

- exploration
- fog of war
- scanning
- route planning

Possible objectives:

- Reveal map sectors.
- Scan relics.
- Find hidden cave structures.
- Reach unexplored zones.

### Holdout Missions

Focus:

- defence
- wave survival
- area control
- terrain preparation

Possible objectives:

- Defend a drill.
- Defend extraction beacon.
- Hold an area for a timer.
- Keep a structure above required health.

Acceptance criteria:

- Boss spawns from primary objective completion only.
- Optional objectives give rewards.
- HUD clearly separates required and optional objectives.
- Existing objective data remains backward compatible where possible.

---

## Phase 3.2 — Mining Resonance / Danger System ⏳

Goal:

Mining should create danger and become a stronger risk/reward decision.

Core concept:

```text
Mining rock creates low resonance.
Mining common ore creates medium resonance.
Mining rare ore creates high resonance.
Mining unstable ore creates very high resonance.
At high resonance, enemies investigate or cave events trigger.
```

Suggested thresholds:

```text
25%: small enemies investigate.
50%: enemy pressure increases.
75%: elite or charging wave chance increases.
100%: resonance rupture event.
```

Required features:

- Resonance meter.
- Per-block/resource resonance values.
- Enemy pressure thresholds.
- Resonance rupture event.
- HUD warning.
- Audio warning.
- Cave pulse VFX.
- Configurable balance values.

Example player-facing log messages:

```text
The cave begins to hum.
Something heard the mining.
Resonance spike detected.
The cave ruptures.
```

Acceptance criteria:

- Mining directly changes enemy danger.
- Rare resources feel valuable but risky.
- Player can understand resonance level from UI/VFX/audio.
- System is configurable.

---

## Phase 3.3 — Ore Chain Reactions ⏳

Goal:

Resources should be tactical objects, not only currency.

Suggested effects:

| Resource | Suggested Effect |
|---|---|
| Voltarite | Small red explosion; damages enemies and player |
| Echo Shard | XP burst and temporary light pulse |
| Emberglass | Leaves hot damaging ground |
| Aether Quartz | Freezes or slows nearby enemies |
| Crysalith | Fires crystal fragments outward |
| Gild | High value but loud resonance |
| Lumina Spores | Temporary vision radius |
| Machine Scrap | Mechanical hazard or bonus drop |

Acceptance criteria:

- Some ore types produce gameplay effects when mined.
- Effects are readable and not too punishing.
- Ore effects interact with enemies and terrain where appropriate.

---

## Phase 3.4 — Enemy Telegraph and Readability Pass ⏳

Goal:

Enemies should be challenging but readable.

Enemy role readability:

| Role | Visual Language | Gameplay Cue |
|---|---|---|
| Swarmer | Small, fast, motion trail | Runs directly at player |
| Charger | Ground warning strip, body lean | Charges after wind-up |
| Exploder | Pulsing red ring | Must be killed before contact |
| Ranged | Aim line / charging glow | Fires projectile |
| Miner | Sparks near mouth/front | Digs through rock |
| Support | Cyan/green aura | Buffs nearby enemies |
| Tank | Large body, heavy shadow | High HP / blocks path |
| Spawner | Pulsing core/sac | Creates smaller enemies |
| Blink enemy | Flashing outline | Teleports closer |
| Flying enemy | Shadow underneath | Ignores terrain |

Required telegraphs:

- Charger warning strip.
- Exploder pulse ring.
- Ranged aim line.
- Boss attack warning zones.
- Support enemy aura.
- Mining enemy sparks.

Acceptance criteria:

- Player can identify enemy roles quickly.
- Dangerous attacks are warned before damage.
- Existing enemy behaviours remain intact.

---

## Phase 3.5 — Enemy Nests and Cave Threats ⏳

Goal:

Some enemies should come from visible world sources, not only invisible spawn logic.

Possible world threats:

- Spore nest.
- Crystal rift.
- Lava vent.
- Tunnel breach.
- Resonance crack.
- Machine ruin portal.
- Bone hive.
- Burrow hole.

Each nest/threat should define:

- HP.
- Spawn table.
- Spawn interval.
- Visual effect.
- Reward on destruction.
- Optional map/minimap marker.

Player choices:

- Avoid nest.
- Destroy nest.
- Farm nest.
- Use nest tactically.
- Clear nest before extraction.

Acceptance criteria:

- At least one visible nest/threat type implemented.
- Nest can spawn enemies.
- Nest can be destroyed.
- Destroying nest gives reward or reduces danger.

---

## Phase 3.6 — Behaviour-Changing Upgrade Expansion ⏳

Goal:

Upgrade choices should change playstyle, not only increase numbers.

Keep numeric upgrades, but add mutation upgrades.

Examples:

### Rotary Mauler

- Ricochet Rounds — bullets bounce once from cave walls.
- Suppressive Cone — sustained fire slows enemies.
- Bore Ripper — bullets chip weak rock.
- Shredder Spin — higher fire rate but lower accuracy.
- Heavy Slugs — lower fire rate but higher knockback.

### Thermal Lance

- Glass Trail — flame leaves burning ground.
- Pressure Lance — narrower flame, longer range, higher damage.
- Fan Lance — wider flame, lower damage, better swarm control.
- Thermal Bloom — fire kills burst into flame particles.
- Molten Drill — flame melts weak terrain.

### Vector Burst

- Orbit Pattern — projectiles orbit before firing outward.
- Spiral Pattern — shots curve outward.
- Mirror Burst — fires backward too.
- Phase Split — projectiles split after travelling.
- Return Vector — missed projectiles curve back.

### Borecaster Bomb

- Sticky Charge — bomb attaches to enemies or walls.
- Mining Charge — clears terrain better but gives fewer resources.
- Vacuum Charge — pulls enemies inward before exploding.
- Cluster Charge — splits into smaller charges.
- Seismic Echo — creates delayed second shockwave.

Acceptance criteria:

- At least several mutation upgrades implemented.
- Upgrade descriptions clearly explain behaviour.
- Builds feel more distinct.

---

## Phase 3.7 — Extraction Finale Improvements ⏳

Goal:

Extraction should feel like a dramatic final escape.

Planned features:

- Stronger extraction beacon.
- Off-screen extraction arrow.
- Enemy pressure after boss defeat.
- Optional extraction hold timer.
- Cargo load risk/reward.

Concept flow:

```text
Complete objectives.
Boss appears.
Defeat boss.
Extraction craft arrives.
Player carries resources / cargo.
Enemies become more aggressive.
Player reaches extraction zone.
Optional holdout timer begins.
Extraction completes.
```

Cargo concept:

```text
Light cargo: low bonus, normal movement.
Medium cargo: medium bonus, slight speed penalty.
Heavy cargo: high bonus, larger speed penalty, more enemy attraction.
```

Acceptance criteria:

- Extraction is clearer and more dramatic.
- Player has strong visual direction to extraction.
- Enemies increase pressure during final escape.
- Optional cargo or holdout mechanic can be added progressively.

---

## Phase 3.8 — Cave Visual Polish ⏳

Goal:

Caves should look more organic and atmospheric.

Planned improvements:

- Cave edge rendering / autotiling.
- More organic rock shapes.
- Rock variation.
- Ore glow.
- Mining sparks.
- Block damage cracks.
- Lava/crystal/resource effects.
- Dust and debris.

Cave edge concept:

```text
Solid tile next to empty tile: draw exposed edge.
Exposed corner: draw rounded/cracked corner.
Isolated solid tile: draw pillar/chunk.
Damaged tile: draw cracks.
```

Acceptance criteria:

- Terrain looks less square.
- Mining feedback is clearer.
- Ore is easier to identify visually.
- Performance remains acceptable.

---

## Phase 3.9 — Dynamic Lighting and Atmosphere ⏳

Goal:

Use darkness, glow, and light sources more strongly.

Planned light sources:

| Source | Light Style |
|---|---|
| Player equipment | Cyan radius/cone |
| Rare ores | Coloured glow |
| Lava rocks | Orange flicker |
| Enemy cores | Hostile glow |
| Boss weak points | Strong warning light |
| Explosions | Brief flash |
| Projectiles | Small moving light |
| Extraction craft | Yellow beacon |
| Drones | Small cyan light |
| Resonance rupture | Cave-wide pulse |

Implementation direction:

- Use low-resolution offscreen lighting canvas.
- Draw radial gradients.
- Composite over scene.
- Keep fog of war compatible.
- Add quality levels:
  - high
  - medium
  - low
  - off

Acceptance criteria:

- Game looks darker and more atmospheric.
- Important gameplay elements remain readable.
- Lighting quality can be reduced for performance.

---

## Phase 3.10 — Biomes and Cave Identity ⏳

Goal:

Different cave zones should feel unique.

Possible biomes:

| Biome | Palette | Gameplay Identity |
|---|---|---|
| Echo Cavern | Blue/cyan | More fog, energy resources |
| Voltarite Rift | Red/orange | Explosive ores, chargers |
| Fungal Hollow | Green/purple | Spore enemies, poison hazards |
| Machine Grave | Grey/yellow | Drones, turrets, ruins |
| Lava Maw | Orange/black | Heat hazards, burrowers |
| Crystal Depths | Purple/white | Shard enemies, reflective projectiles |

Initial implementation can be simple:

- background colour
- fog tint
- ore weights
- enemy family weights
- ambient particles
- biome label

Acceptance criteria:

- At least one biome config system exists.
- Mission can select or assign a biome.
- Biome affects visuals and gameplay weights.

---

## Phase 3.11 — UI and Quality-of-Life Improvements ⏳

Goal:

Reduce friction and make the game easier to understand.

Planned improvements:

- Better objective display.
- Clearer upgrade descriptions.
- Better menu scrolling.
- Better controller navigation.
- More readable warnings.
- Improved off-screen markers.
- Better extraction direction arrow.
- More consistent gamepad support.
- Continued browser and Windows build improvements.

Important warnings should also appear near the player, not only in the top HUD.

Examples:

| Condition | Suggested Visual |
|---|---|
| Drill overheating | Red/orange ring around player |
| High resonance | Pulsing cave wave |
| Boss attack incoming | Ground danger marker |
| Enemy charge incoming | Directional warning |
| Extraction available | Off-screen arrow |
| Low health | Screen edge pulse |
| Heavy cargo | Weight icon near player |

Acceptance criteria:

- UI communicates current objective clearly.
- Important threats are visible during combat.
- Controller and mouse remain reliable in menus.

---

## Phase 3.12 — Performance and Stability ⏳

Goal:

Maintain performance as new enemies, VFX, lighting, and systems are added.

Planned improvements:

- More configurable performance settings.
- VFX throttling during heavy combat.
- Improved particle management.
- Better enemy spawn pressure control.
- Continued browser and Windows testing.
- Better fullscreen/large-monitor testing.

Recommended degradation order:

```text
1. Reduce background particles.
2. Reduce decorative sparks.
3. Reduce floating text duration.
4. Reduce glow blur.
5. Reduce minor dynamic lights.
6. Reduce enemy spawn rate.
7. Reduce maximum active enemies.
8. Disable optional VFX.
```

Suggested thresholds:

```js
performanceConfig: {
  healthyFps: 55,
  warningFps: 48,
  criticalFps: 36,
  recoveryFps: 50
}
```

Acceptance criteria:

- Game remains playable during heavy combat.
- Browser and Windows builds remain stable.
- Quality can be reduced before gameplay is heavily affected.

---

# Key Files to Modify by Feature

## Mission Objective Rework

| File | Expected Changes |
|---|---|
| `core.js` | Mission state structure, boss spawn checks |
| `entities.js` | Mission generation if currently located there |
| `systems.js` | Objective progress updates |
| `render-ui.js` | Objective HUD rendering |
| `progression.js` | Optional rewards / profile stats |
| `css/style.css` | Objective UI styling |

## Mining Resonance

| File | Expected Changes |
|---|---|
| `core.js` | Resonance state, config, helper functions |
| `systems.js` | Mining event integration |
| `entities.js` | Enemy pressure spawns |
| `render-ui.js` | Resonance meter and warnings |
| `audio.js` if present | Warning tones |
| `css/style.css` | HUD styling |

## Enemy Telegraphs

| File | Expected Changes |
|---|---|
| `entities.js` | Enemy states and wind-up timers |
| `systems.js` | Behaviour timing / attack execution |
| `render-ui.js` | Telegraph rendering |
| `audio.js` if present | Attack warning sounds |

## Enemy Nests

| File | Expected Changes |
|---|---|
| `entities.js` | Nest entities and spawn tables |
| `systems.js` | Nest update logic |
| `world.js` if present | Nest placement |
| `render-ui.js` | Nest rendering and markers |

## Upgrade Mutation Expansion

| File | Expected Changes |
|---|---|
| `progression.js` | Upgrade definitions and persistence |
| `systems.js` | Upgrade effect hooks |
| `entities.js` | Weapon/projectile behaviour |
| `render-ui.js` | Upgrade card descriptions |

## Extraction Finale

| File | Expected Changes |
|---|---|
| `core.js` | Extraction state |
| `systems.js` | Extraction pressure / hold timer |
| `render-ui.js` | Beacon, arrow, timer |
| `entities.js` | Enemy pressure spawns |

## Cave Visuals / Lighting / Biomes

| File | Expected Changes |
|---|---|
| `render-ui.js` | Cave edge rendering, lighting |
| `world.js` if present | Biome assignment, tile metadata |
| `core.js` | Biome state/config |
| `systems.js` | Hazard interactions |
| `css/style.css` | UI labels/settings |

---

# Coding Guidelines

- Keep the game playable in browser and Windows desktop.
- Do not break controller support.
- Do not reintroduce menu scroll bouncing.
- Keep fixed logical viewport handling intact.
- Preserve existing save/profile data where possible.
- Use config-driven values for balance.
- Avoid hard-coding magic numbers without comments.
- Use existing code style and naming conventions.
- Keep rendering and update side effects separated when possible.
- Performance should degrade visual effects before degrading gameplay.

---

# Acceptance Criteria for Next Major Release

The release should be considered successful if:

```text
Mission types feel more distinct.
Mining creates meaningful danger.
Players understand enemy attacks before being hit.
The cave looks more organic and atmospheric.
Extraction feels more exciting.
Upgrade choices create different playstyles.
Browser and Windows builds remain stable.
Controller and mouse input remain reliable.
Performance remains acceptable during heavy combat.
```

---

# Public Roadmap Summary

Public-facing development direction:

```text
EchoVein is moving toward deeper mission variety, mining danger, stronger enemy telegraphs, cave threats, improved extraction tension, richer upgrades, more atmospheric visuals, dynamic lighting, biome identity, and continued browser/Windows quality-of-life improvements.
```

The long-term vision remains:

> Explore the cave. Mine valuable resources. Make noise. Attract danger. Survive the swarm. Defeat the boss. Escape with as much as you can carry.
