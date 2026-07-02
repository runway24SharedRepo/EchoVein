# EchoVein — Master Requirements and Feature Specification

**Audience:** future LLM, JavaScript developer, technical designer, or QA reviewer continuing EchoVein.  
**Purpose:** provide one consolidated reference for the current game requirements, implemented systems, protected areas, known limitations, and next roadmap direction.

This document is intended to sit above the more specialised design documents such as:

```text
HOLLOW_PRESSURE_AND_PRESSURE_OBJECTIVES_DESIGN.md
STRONGER_MISSION_VARIETY.md, if present
PROJECT_CONTEXT.md
PROJECT_ROADMAP.md
README.md
README_WINDOWS_ELECTRON.md, if present
```

Read this before implementing any new gameplay feature or large refactor.

---

## 1. Project identity

**Game title:** Echo Vein / EchoVein  
**Genre:** 2D top-down HTML5 Canvas roguelike extraction-mining action game.  
**Target feel:** tactical, atmospheric, readable, replayable, and mechanically distinct from a generic survivor game.

Core identity:

```text
A tactical underground extraction roguelike where digging is both your economy and your biggest risk.
```

Core loop:

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

Design pillars:

1. **Mining as economy** — digging and ore collection are the main way the player grows.
2. **Mining as risk** — the cave reacts to greed through enemy pressure, pressure objectives, and future resonance mechanics.
3. **Extraction tension** — a run is not fully won until the player reaches extraction after boss defeat.
4. **Readable chaos** — lots of enemies and VFX are allowed, but player goals, threats, and mission status must remain readable.
5. **Permanent progression** — run rewards feed long-term upgrades and operator progression.
6. **Mission variety** — Hunt, Survey, Harvest, and Holdout should feel mechanically different, not just be different counters.
7. **Patch discipline** — changes should be narrow, tested, and packaged as ZIPs containing only updated files.

---

## 2. Platform requirements

### 2.1 Browser / itch.io build

EchoVein must remain playable as a static browser game launched from:

```text
index.html
```

Requirements:

- No mandatory server backend.
- No mandatory build step for the browser version.
- HTML, CSS, and JavaScript loaded directly by script tags.
- Runs in a normal browser and inside itch.io embedding.
- Uses HTML5 Canvas for world rendering.
- Uses DOM overlays for menus, HUD panels, modal decisions, debug panels, and run summary screens.
- Uses Web Audio for generated sound effects and ambience.

### 2.2 Windows desktop / Electron target

EchoVein is also intended to support a Windows desktop build using Electron. Some Electron files may be intentionally omitted from context uploads because they are large or not needed for a specific gameplay patch. Do not automatically treat their absence in a reduced ZIP as a gameplay bug.

Expected Electron design:

```text
Electron BrowserWindow loads index.html.
Gameplay remains browser-like.
Node integration is disabled in the game page.
Context isolation is enabled.
No gameplay logic is moved into Electron.
```

Protected requirement:

```text
Browser launch from index.html must remain valid even when Electron support exists.
```

---

## 3. Protected systems — do not casually modify

The following areas have received hotfixes and are easy to regress. Do not refactor them unless the user explicitly asks or the bug is directly in that system.

```text
1600×900 logical viewport scaling
large-monitor scaling
canvas centring
mouse coordinate mapping
controller cursor coordinate mapping
menu scrolling / bouncing fixes
mouse wheel scrolling in overlays
left-stick / D-pad scrolling in menus
controller menu navigation
mobile runtime detection
virtual joystick runtime policy
manual mouse targeting lock on mobile
mission objective boss gating
boss defeat -> extraction flow
extraction completion -> run completion flow
enemy pathfinding and terrain interaction
Electron configuration / packaging files
```

When a new feature needs to interact with one of these systems, prefer adapter functions and narrow integration points rather than rewriting the subsystem.

---

## 4. High-level architecture

### 4.1 Current file layout

Typical project files:

```text
index.html
css/style.css
css/debug.css
js/core.js
js/assets.js
js/audio.js
js/entities.js
js/world.js
js/systems.js
js/progression.js
js/render-ui.js
js/run-stats.js
js/main.js
js/debug.js
```

### 4.2 Script responsibilities

| File | Primary responsibility |
|---|---|
| `index.html` | Static page shell and script loading order. |
| `css/style.css` | Main UI, overlays, HUD, menus, mobile layout, pressure popup. |
| `css/debug.css` | Debug panel styling. |
| `js/core.js` | Global constants, canvas/view scaling, input helpers, gamepad helpers, mobile runtime helpers, settings. |
| `js/assets.js` | Optional sprite loading and sprite drawing helpers. |
| `js/audio.js` | Web Audio setup, generated SFX, ambience. |
| `js/entities.js` | Game object construction, player, enemies, entity constructors and data. |
| `js/world.js` | Cave generation, tile handling, mission world hooks, resource tiles, path/block helpers. |
| `js/systems.js` | Main gameplay systems: movement, combat, mining, enemy updates, objectives, boss/extraction, pressure timers. |
| `js/progression.js` | Save profile, mission definitions, objective data model, rewards, permanent progression, menus. |
| `js/render-ui.js` | Canvas rendering, HUD rendering, overlays, pressure popup, mission status fade. |
| `js/run-stats.js` | Run statistics and end-of-run summary rendering. |
| `js/main.js` | Main loop and browser input event wiring. |
| `js/debug.js` | Debug tools and test controls. |

### 4.3 Loading model

The game uses ordinary browser scripts, not a bundler. This means functions are intentionally global. Any new shared helper must be defined before the files that use it.

Safe rule:

```text
If several systems need a helper, place it in core.js or progression.js depending on domain and current script order.
```

Do not introduce module imports, bundlers, TypeScript, or external dependencies unless the user explicitly requests a larger architecture migration.

---

## 5. Viewport, scaling, and UI layout requirements

The game uses a fixed logical viewport:

```js
VIEW_CONFIG.baseW = 1600;
VIEW_CONFIG.baseH = 900;
```

The actual displayed canvas can scale and centre on different screens. Mouse/touch positions must be converted into logical coordinates before gameplay use.

Important rule:

```text
Never compare raw DOM pixel coordinates directly against logical world/canvas coordinates.
```

When a DOM panel needs to react to the player position, convert the player’s logical canvas position using the current view transform:

```text
screenX = VIEW.left + logicalX * VIEW.scale
screenY = VIEW.top  + logicalY * VIEW.scale
```

This was important for the mission status panel auto-hide behaviour.

---

## 6. Input requirements

### 6.1 Keyboard / mouse

Expected keyboard/mouse support:

```text
WASD / movement keys: player movement
Mouse: aiming / manual targeting when enabled
Left click: primary manual fire when manual targeting is active
Right click: Arc Connection selection / detonation where applicable
E: Pathfinder trap placement
Dash key binding as implemented in current controls
Mouse wheel: menu/overlay scrolling
```

Manual mouse targeting is a game setting on desktop, but mobile has special restrictions.

### 6.2 Controller

Expected controller support:

```text
Left stick: movement
D-pad / left stick: menu navigation and scrolling
Right stick: controller cursor / aiming support where enabled
A / X / B / Y mappings as implemented by current build
B: decline/cancel modal choices where applicable
Controller cursor must respect viewport scaling
```

Controller menu navigation must remain stable in tall menus and overlays. Avoid calling `scrollIntoView()` every frame; use the existing scroll helper flow.

### 6.3 Mobile / touch

Mobile hotfix requirements:

```text
Detect mobile/coarse pointer runtime without relying only on user-agent.
Show virtual joystick only on mobile runtime.
Track a single joystick touch ID.
Do not block menu/UI scrolling with joystick touch handling.
Disable and lock manual mouse targeting on mobile.
Use auto-targeting or movement-direction aim fallback on mobile.
Support resize and orientation changes.
Show rotate-to-landscape hint in portrait mobile runtime.
Preserve the 1600×900 logical viewport.
```

Mobile targeting policy:

```text
On mobile, manual mouse targeting is forced off.
The saved desktop setting is not deleted.
Desktop behaviour remains unchanged.
```

---

## 7. Save/profile and persistence requirements

The persistent profile stores long-term progress, resources, upgrades, operator data, mission index/run index, achievements, and run history.

Current save key:

```js
SAVE_KEY = 'echoVeinSaveV1'
```

Requirements:

- Existing saved profiles must load after new fields are added.
- Missing fields must be defaulted safely.
- Old objective data without `objectiveType` must be treated as `primary`.
- Reward systems must not double-pay.
- Invalid reward resource keys must be skipped rather than crashing.
- Browser local storage persistence must remain valid.
- Game should survive missing optional docs or Electron files in reduced context ZIPs.

---

## 8. Resource and economy requirements

### 8.1 Runtime resource IDs

Current run resource IDs include:

```text
gild
voltarite
echo
ferriteBark
luminaSpores
aetherQuartz
crysalith
emberglass
```

Main visible resource names:

| Runtime key | Player-facing name |
|---|---|
| `gild` | Gild Shards |
| `voltarite` | Voltarite |
| `echo` | Echo Shards |
| `ferriteBark` | Ferrite Bark |
| `luminaSpores` | Lumina Spores |
| `aetherQuartz` | Aether Quartz |
| `crysalith` | Crysalith |
| `emberglass` | Emberglass |

### 8.2 Profile resource mapping

Rewards may use runtime resource keys but must be mapped safely into profile resource keys.

Known mapping:

```text
gild -> gildShards
echo -> echoQuartz
voltarite -> voltarite
aetherQuartz -> aetherQuartz
```

Invalid reward resource IDs should be ignored or logged safely, not allowed to crash the run completion path.

---

## 9. Mining and terrain requirements

Terrain is a destructible cave grid. Mining must feel direct and reliable, especially at low movement speed and near corners.

Current terrain requirements:

```text
Destructible cave blocks.
Resource-bearing tiles.
Non-mineable lava rock obstacles.
Mining contact should use intended input direction before collision sliding.
Mining should use a forward contact fan / assist cone.
Corner mining should avoid flickering between targets.
Enemies and bullets may interact with terrain.
Mining invalidates navigation/pathing where needed.
```

Design requirement:

```text
Mining should create decisions, not just income. More valuable mining should eventually connect to Hollow Pressure / resonance danger.
```

---

## 10. Objective system requirements

The objective system is one of the most important architectural systems.

### 10.1 Objective data structure

Objectives should be normalised to this safe shape:

```js
{
  id,
  type,
  objectiveType,
  optional,
  displayName,
  description,
  targetAmount,
  currentAmount,
  completed,
  failed,
  reward,
  failConditionType,
  params,
  tags,
  hiddenUntilStarted,
  showProgress
}
```

### 10.2 Objective types

Supported `objectiveType` values:

| Type | Meaning | Blocks boss? | Reward behaviour |
|---|---|---:|---|
| `primary` | Required mission objective. | Yes | Normal mission completion gate. |
| `secondary` | Optional bonus objective. | No | Reward paid on successful extraction if completed and not failed. |
| `pressure` | Optional risk/reward objective. | No | Reward paid on successful extraction if completed and not failed. |

### 10.3 Compatibility rule

Any objective without `objectiveType` must be treated as:

```js
objectiveType: 'primary'
optional: false
```

This preserves old saves and old mission behaviour.

### 10.4 Boss spawning rule

Boss spawning must use:

```js
allPrimaryObjectivesComplete(g)
```

It must **not** use:

```js
allObjectivesComplete(g)
```

because secondary and pressure objectives must never block boss spawning.

### 10.5 Required helpers

Expected objective helpers:

```js
createObjective(data)
normaliseObjective(o)
normaliseObjectives(g)
getObjectivesByType(g, objectiveType)
getPrimaryObjectives(g)
getSecondaryObjectives(g)
getPressureObjectives(g)
allPrimaryObjectivesComplete(g)
```

---

## 11. Mission system requirements

Mission types must feel mechanically distinct.

Current mission types:

```text
Hunt
Survey
Harvest
Holdout
```

Each mission should generate:

```text
at least one primary objective
at least one secondary objective
optional pressure objective offers may appear during the run
```

### 11.1 Hunt mission

Design focus:

```text
Combat priority, marked enemies, elite threats, target hunting.
```

Current hook:

```js
enemy.missionTarget = true;
enemy.missionTargetId = 'hunt_target_X';
```

Expected behaviour:

- Marked enemies render with a visible gold ring/marker.
- Killing marked targets progresses the Hunt primary objective.
- Secondary objective can reward additional combat performance.

### 11.2 Survey mission

Design focus:

```text
Exploration, fog of war, scanning, spatial movement.
```

Current hook:

```js
g.missionPoi = [];
```

Each Echo Relic POI:

```js
{
  id,
  type: 'echoRelic',
  x,
  y,
  scanned,
  scanProgress,
  requiredScanTime,
  scanRadius
}
```

Expected behaviour:

- Relics render with cyan scan circles/progress rings.
- Player stands near relics to scan them.
- Scanning progresses the Survey primary objective.
- Secondary objective may reward extra exploration/reveal percentage.

### 11.3 Harvest mission

Design focus:

```text
Greed, mining, rare resource targeting, extraction value.
```

Current hook:

```js
g.missionHarvestTargets = [];
```

Each target vein:

```js
{
  tx,
  ty,
  resourceId,
  mined,
  pulse
}
```

Expected behaviour:

- Marked veins render with a subtle glow/outline.
- Mining from target veins progresses the Harvest primary objective.
- Secondary objective rewards extra stockpiling.

### 11.4 Holdout mission

Design focus:

```text
Defence, endurance, area control, terrain preparation.
```

Current hook:

```js
g.defenceTarget
```

Drill/beacon structure:

```js
{
  id: 'holdout_drill',
  type: 'holdoutDrill',
  x,
  y,
  r,
  hp,
  maxHp,
  active,
  holdTimer,
  requiredHoldTime
}
```

Expected behaviour:

- Drill/beacon renders in-world with HP and timer bars.
- Enemies near the drill damage it.
- Timer progresses while the drill is alive.
- If the drill is destroyed, the holdout objective fails and the run fails to avoid a softlock.

---

## 12. Pressure Objectives and Hollow Pressure requirements

Pressure Objectives v1 has been implemented and stabilised. It is the first playable layer of the future Hollow Pressure / resonance system.

### 12.1 Design purpose

Pressure objectives represent optional risk/reward signals from the cave.

Player decision:

```text
Accept the signal -> take extra danger and add a RISK objective.
Ignore the signal -> close popup and continue normally with no penalty and no reward.
```

### 12.2 Game-level pressure state

Expected pressure fields:

```js
{
  hollowPressure: 0,
  pressureFlash: 0,
  pressureSystem: {
    offersSeen,
    maxOffers,
    nextOfferTime,
    offer,
    modalOpen,
    lastModalCloseReason,
    lastDeclinedAt,
    activeIds,
    completed,
    failed
  }
}
```

### 12.3 Offer configuration

Current v1 design values:

```js
const PRESSURE_OBJECTIVE_CONFIG = {
  firstOfferTime: 75,
  repeatOfferDelay: 130,
  maxOffersPerRun: 2,
  maxActive: 1
};
```

### 12.4 Current pressure templates

#### Blood Echo Surge

```text
Theme: combat risk.
Accept text: Accept combat risk.
Ignore text: Ignore signal.
Objective: kill enemies before timer expires.
Risk: Hollow Pressure rises and a hostile surge responds.
Reward: XP + Voltarite after successful extraction if completed.
```

#### Unstable Vein Bloom

```text
Theme: mining greed / rare ore.
Accept text: Overmine the vein.
Ignore text: Leave it buried.
Objective: collect rare ore before timer expires.
Risk: Hollow Pressure rises.
Reward: XP + Gild + rare ore after successful extraction if completed.
```

#### Fracture Overbreak

```text
Theme: aggressive mining.
Accept text: Force the fracture.
Ignore text: Stabilise and move on.
Objective: mine blocks before timer expires.
Risk: Hollow Pressure rises and enemy response may occur.
Reward: XP + Gild after successful extraction if completed.
```

### 12.5 Popup behaviour requirement

The Risk Signal popup is modal while open. It may pause or block gameplay input underneath, but it must never soft-lock.

#### Accept button must:

```text
create a pressure objective in g.objectives
mark it objectiveType: 'pressure'
apply the risk modifier / pressure increase
close the popup
resume gameplay
allow the RISK objective to appear in the HUD
```

#### Ignore / Leave It Buried button must:

```text
not create a pressure objective
not increase Hollow Pressure
not spawn enemies
not give reward
not count as failed
close the popup immediately
resume gameplay immediately
start cooldown before another offer
not block boss spawning or extraction
```

This behaviour was bug-fixed and must be preserved.

### 12.6 Hard-close requirement

Because modal softlocks occurred, the pressure popup must have a hard-close fallback. A robust close path should clear both gameplay state and DOM state:

```text
g.awaitingPressureChoice = false
g.pressureSystem.offer = null
g.pressureSystem.modalOpen = false
overlay._pressureOffer = null
overlay.classList.remove('show')
overlay.style.display = 'none'
overlay.style.pointerEvents = 'none'
```

The CSS should also ensure:

```css
.pressureObjectiveOverlay:not(.show) {
  display: none !important;
  pointer-events: none !important;
}
```

### 12.7 Input paths for popup

Popup resolution must work through:

```text
button click
button pointerup
button touchend
overlay delegated click
overlay delegated pointerup
overlay delegated touchend
document-level fallback click/pointerup/touchend
keyboard confirm/decline
controller confirm/decline
```

Keyboard expected mapping while pressure popup is open:

```text
Enter / Space / A / Y = accept
Escape / Backspace / B / N = decline
```

Controller expected mapping:

```text
Confirm button = accept
B / cancel button = decline
```

Keyboard/controller modal choices should consume input with `preventDefault()` and `stopPropagation()` so input does not leak into gameplay.

### 12.8 Reward payout

Pressure objective reward rules:

```text
Completed pressure objective + successful extraction -> reward granted.
Incomplete pressure objective -> no reward.
Failed pressure objective -> no reward.
Accepted but failed objective -> no reward.
Ignored offer -> no objective, no failure, no reward.
```

Pressure rewards should be included in the run summary using the same safe reward mapper as secondary objectives.

---

## 13. Combat and weapon requirements

Current combat feature set includes:

```text
heat-based weapon firing
overheat mechanics
auto-targeting
manual targeting on desktop when enabled
operator-specific starting weapons
secondary/unlockable weapons
projectiles
missiles
bombs
drones
traps
arc connection chain/detonation
boss weak points
enemy bullets
terrain-destructive enemy projectiles in later pressure/runs
```

Known weapon/operator concepts:

| Operator | Identity | Known weapon/theme |
|---|---|---|
| Bulwark | Durable, heavy weapons | Rotary Mauler, Hammerfall Salvo |
| Pathfinder | Mobility, traps, drones | Vector Carbine, Sifter Drone, seismic traps |
| Borecaster | Mining/explosive specialist | Bore Rail, Seismic Charge, Return Disc |

Weapon names should remain original and avoid obvious IP references.

---

## 14. Enemy and AI requirements

Enemy system requirements:

```text
multiple enemy types and visual variants
basic enemies
swarmers
chargers
elites
bosses
support/spawner-style enemies
flying/boomerang-style threats where implemented
terrain-aware pursuit
line-of-sight direct movement when possible
A* pathfinding through tunnels when needed
mining-triggered navigation invalidation
stuck recovery
performance-aware spawn budgeting
some enemies can fire bullets
some enemy bullets can break terrain
some enemies can mine or interact with blocks
```

Important protected requirement:

```text
Do not rewrite enemy pathfinding casually. It has received multiple fixes for tunnels, corners, off-track minimisation, and stuck recovery.
```

---

## 15. Boss and extraction requirements

### 15.1 Boss gating

Boss should spawn only when all non-failed primary objectives are complete.

Secondary and pressure objectives must not block the boss.

### 15.2 Boss system

Current boss design includes:

```text
boss roster / boss type selection
Hollow Tyrant
Hex Shard Colossus
Molten Maw
phase transitions
weak points
stagger/damage windows
unique attacks
boss-specific drops
boss name overlay
terrain-aware spawn validation
clearance/reachability checks
```

### 15.3 Extraction

Extraction should begin after boss defeat and should remain a strong final phase.

Current extraction features:

```text
extraction craft
extraction timer
extraction path indicator
yellow dotted path from player to extraction
dynamic line-of-sight sampling
blocked path indicator
run completion after extraction
persistent reward banking
run summary screen
```

Requirement:

```text
No optional objective type may block extraction after boss defeat.
```

---

## 16. Progression and meta requirements

Long-term progression includes:

```text
XP and level-up choices
operator-specific XP
operator levels
permanent upgrades
prestige bonuses
milestones
achievements
resource banking
mission index and run index progression
5-run mission structure
run history and statistics
```

Run flow:

```text
Choose profile / load save.
Choose operator.
Start run.
Complete primary objectives.
Boss spawns.
Defeat boss.
Extraction begins.
Reach extraction and complete timer.
Bank resources and rewards.
Show run summary.
Advance run/mission progression.
Return to menu / continue.
```

---

## 17. UI and UX requirements

### 17.1 Objective HUD

Objective HUD must distinguish:

```text
PRIMARY = gold / yellow
BONUS   = cyan / blue
RISK    = purple / magenta
```

Completed objectives should show green completion state. Failed objectives should show muted red/grey state.

Secondary objectives with rewards should show a simple bonus indicator.

Pressure objectives should show remaining time where applicable.

### 17.2 Mission status panel auto-hide

The mission status/right HUD panel should fade or hide when the player is physically underneath it, then reappear when the player moves away.

Implementation warning:

```text
Compare player screen position to DOM panel rectangle only after converting logical coordinates using VIEW.left / VIEW.top / VIEW.scale.
```

### 17.3 Menu and overlay scrolling

Requirements:

```text
Mouse wheel scroll works in menus.
Left-stick / D-pad scrolling works in controller menus.
Main menu and upgrade menus do not bounce instead of scrolling.
Controller focus must not force unwanted scroll jumps.
Tall run-stat panels remain readable.
Overlay content should avoid fixed heights that break itch.io embedding.
```

### 17.4 Modal rules

Any modal popup must:

```text
have a reliable close path
support mouse/touch/controller/keyboard if gameplay can reach it
not trap focus permanently
not leave gameplay frozen after closing
consume relevant input while open
not allow gameplay clicks to leak through unless intentionally designed
```

Pressure Objective popup regressions showed why this is important.

---

## 18. Audio and visual feedback requirements

Current audio/visual goals:

```text
Web Audio generated sound effects, no mandatory external sound files
mining impact sounds
pickup sounds
weapon firing sounds
enemy hit/death sounds
boss/extraction cues
pressure/risk cue sounds where implemented
particles and VFX for impacts, explosions, arcs, flame, missiles, pickups
sprite fallback support when image assets are missing
```

Requirements:

- Effects should be lightweight and performant.
- Use existing VFX budget/performance controls.
- Do not add large required media dependencies unless the user asks.

---

## 19. Performance requirements

Performance management exists and should be preserved.

Expected behaviour:

```text
track FPS / frame time
reduce spawn pressure when FPS degrades
scale VFX budget when needed
limit enemy count through budget system
recover when performance returns to healthy state
debug tools for performance state and enemy budget
```

Do not add new systems that can spawn unlimited enemies, particles, or projectiles without using performance-aware caps.

---

## 20. Debug and balancing tool requirements

Debug mode should remain available for development and QA.

Known debug abilities include:

```text
apply upgrades
unlock weapons
spawn enemies
spawn resources
clear enemies/pickups/projectiles
heal player
force level-up
force objective progress/completion
spawn extraction craft
set Hollow Pressure
force elite/boss pressure patterns
toggle fog of war
toggle pathfinding overlays
toggle enemy bullet hitboxes
toggle mining arc / contact debug
toggle performance budget overlays
test VFX sprites
spawn random charging waves
open run stats screen
```

New systems should expose at least minimal debug hooks if they are hard to test naturally.

---

## 21. Documentation requirements

The project should maintain concise but complete Markdown handovers for major systems.

Recommended docs:

```text
PROJECT_CONTEXT.md
PROJECT_ROADMAP.md
README.md
README_WINDOWS_ELECTRON.md, if Electron files are included
ECHOVEIN_MASTER_REQUIREMENTS_AND_FEATURES.md
HOLLOW_PRESSURE_AND_PRESSURE_OBJECTIVES_DESIGN.md
STRONGER_MISSION_VARIETY.md, if present
```

When a system becomes complex enough to require multiple bug fixes, document the intended behaviour and the failure modes. The Pressure Objectives modal is the model example.

---

## 22. Known limitations and open issues

Current known limitations / future improvements:

```text
Hollow Pressure is still v1 and not yet a full systemic resonance meter.
Pressure objective popups are now stabilised, but any new modal must follow the same hard-close rules.
Resonance thresholds and cave-wide escalation are not fully implemented yet.
Mission mutators are not implemented yet.
Hunt targets have simple markers but no full off-screen compass arrow.
Survey relic placement is simple and not yet biome/room aware.
Harvest target veins are seeded pockets, not full geological simulation.
Holdout enemies damage the drill when near it, but do not yet use full dedicated drill-targeting AI.
Mobile hotfix should still be tested on real devices when possible.
Electron builds require local npm install/build validation when Electron files are present.
```

---

## 23. Recommended next roadmap order

After the Pressure Objectives QA/stabilisation pass, the recommended order is:

```text
1. Hollow Pressure System v1
2. Resonance System v1
3. Mission Mutators
4. Stronger extraction phase
5. Enemy nests and cave threats
6. Better POI/room placement
7. Biomes and cave identity
8. Dynamic lighting and atmosphere
9. Deeper upgrade-choice redesign
10. Balance/performance pass
```

### 23.1 Hollow Pressure System v1

Goal:

```text
Turn Hollow Pressure from a lightweight pressure objective value into a visible run-level danger meter.
```

Suggested first implementation:

```text
Add visible Hollow Pressure meter.
Increase pressure from mining, marked rare veins, accepted pressure objectives, and failed pressure objectives.
Add LOW / RISING / HIGH / CRITICAL bands.
Tie bands to modest spawn pressure changes.
Add warning feedback.
Do not block boss or extraction.
Do not punish Ignore Signal.
```

### 23.2 Resonance System v1

Goal:

```text
Mining different materials produces different cave resonance/noise.
```

Possible thresholds:

```text
25% resonance: investigation enemies
50% resonance: increased enemy pressure
75% resonance: elite/charging wave chance
100% resonance: rupture event, then partial reset
```

### 23.3 Mission Mutators

Goal:

```text
Add run-to-run variety without rewriting mission core logic.
```

Examples:

```text
Dense mineral pockets but higher pressure gain
Fewer enemies but stronger elites
Poor visibility but better survey rewards
Volatile veins produce extra reward but rupture faster
Extraction route more dangerous but bonus payout higher
```

---

## 24. Patch protocol for future LLMs

When implementing features for this project:

1. Work from the latest uploaded `echoVein.zip` baseline.
2. Do not assume older patch ZIPs are the current source of truth.
3. Make narrow changes only.
4. Generate a ZIP containing only updated files.
5. Do not include `node_modules`, `dist`, or large generated folders.
6. Do not restore intentionally omitted large files unless the user asks.
7. Run JavaScript syntax checks:

```bash
for f in js/*.js; do node --check "$f"; done
```

8. If Electron files are included and touched, also check:

```bash
node --check electron/main.cjs
node --check electron/preload.cjs
```

9. Report exactly what changed and what was not changed.
10. If a feature involves modal UI, include manual test steps for mouse, touch, keyboard, and controller.

---

## 25. Manual QA checklist

Use this before declaring a patch stable.

### Startup and menu

```text
Game launches from index.html.
Main menu opens.
Profile/save flow works.
Menus scroll with mouse wheel.
Menus scroll with controller left stick / D-pad.
No overlay bounce regression.
```

### Gameplay basics

```text
Player moves.
Camera follows.
Mining works.
Resources drop and collect.
Weapons fire.
Enemies spawn and move.
Enemies path through tunnels correctly.
Player can level up and choose upgrades.
```

### Mission flow

```text
Hunt marked targets visible and progress when killed.
Survey relics visible and scan when player stands nearby.
Harvest veins visible and progress when mined.
Holdout drill visible, timer progresses, HP changes under enemy pressure.
Primary objective complete spawns boss.
Secondary incomplete does not block boss.
Pressure incomplete does not block boss.
```

### Pressure popup

```text
Risk popup appears after expected time.
Accept button creates RISK objective and closes popup.
Ignore / Leave It Buried closes popup and resumes game.
Ignore does not add RISK objective.
Ignore does not increase Hollow Pressure.
Keyboard Escape / B / N decline works.
Keyboard Enter / Space / A / Y accept works.
Touch tap works on both buttons.
Controller confirm/cancel works.
Popup does not immediately re-open after ignore.
```

### Boss and extraction

```text
Boss spawns after primary objectives complete.
Boss can be defeated.
Extraction craft spawns.
Extraction path indicator appears.
Extraction completes run.
Resources bank correctly.
Secondary and completed pressure rewards pay out.
Failed/incomplete optional objectives do not pay out.
Run summary shows bonus/risk rewards.
```

### Mobile

```text
Mobile runtime shows virtual joystick.
Virtual joystick moves player.
Manual mouse targeting remains disabled on mobile.
Portrait hint appears when appropriate.
Menus remain scrollable on touch.
Pressure popup touch buttons work.
```

### Regression-sensitive UI

```text
Mission status panel hides/fades when player is under it.
Mission status panel reappears when player moves away.
Objective HUD remains readable at 1600×900 logical viewport.
Pressure overlay appears above HUD and hides completely after choice.
```

---

## 26. Final implementation guidance

EchoVein has reached a complexity level where each new feature should be treated as a small system, not a one-off code addition.

For future LLMs:

```text
Prefer data-driven templates.
Normalise old save data.
Keep objective types separate.
Never let optional objectives block progression.
Use hard-close logic for modals.
Respect viewport scaling.
Respect menu scrolling fixes.
Respect controller/mobile paths.
Use debug hooks for hard-to-test systems.
Package only changed files.
Validate syntax before delivery.
```

For design consistency:

```text
Every new mechanic should reinforce the core fantasy:
The cave rewards greed, but the cave also listens.
```
