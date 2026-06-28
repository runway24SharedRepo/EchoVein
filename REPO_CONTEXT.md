repo: EchoVein

File Structure:
EchoVein/css/style.css
EchoVein/js/progression.js
EchoVein/index.html
EchoVein/PROJECT_CONTEXT.md
EchoVein/REPO_CONTEXT.md

EchoVein/index.html:
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Echo Vein</title>
  <link rel="icon" href="data:," />
  <link rel="stylesheet" href="css/style.css" />
  <link rel="stylesheet" href="css/debug.css" />
  <script defer src="js/core.js"></script>
  <script defer src="js/progression.js"></script>
  <script defer src="js/assets.js"></script>
  <script defer src="js/audio.js"></script>
  <script defer src="js/entities.js"></script>
  <script defer src="js/world.js"></script>
  <script defer src="js/systems.js"></script>
  <script defer src="js/render-ui.js"></script>
  <script defer src="js/run-stats.js"></script>
  <script defer src="js/main.js"></script>
  <script defer src="js/debug.js"></script>
</head>
<body>
<canvas id="game"></canvas>

<div class="hud">
  <div class="topbar">
    <div class="panel stats">
      <div class="line"><span><strong>Echo Vein</strong></span><span id="timer">00:00</span></div>
      <div class="bars">
        <div class="bar health"><div id="hpFill"></div><span class="label" id="hpLabel">HP</span></div>
        <div class="bar xp"><div id="xpFill"></div><span class="label" id="xpLabel">ECHO</span></div>
        <div class="bar overheat"><div id="heatFill"></div><span class="label" id="heatLabel">TOOL HEAT</span></div>
      </div>
      <div class="line">
        <span>Level <strong id="level">1</strong> &middot; Depth <strong id="depth">0 m</strong></span>
        <span>Gild Shards <strong id="gold">0</strong> &middot; Voltarite <strong id="nitra">0</strong> &middot; Kills <strong id="kills">0</strong></span>
      </div>
    </div>
  </div>

  <div class="rightbar panel">
    <div>
      <div class="title">Mission Status</div>
      <div class="subtitle">Descend, extract, survive. Mine resonance minerals, outlast the Hollowborn, and build an overloaded operator kit.</div>
    </div>
    <div class="weaponList" id="weaponList"></div>
    <div class="logList" id="logList"></div>
  </div>

  <div class="bottomHelp panel">
    <span class="soundControls">
      <button id="soundBtn" title="Toggle sound. Shortcut: M">Sound</button>
      <label>Vol <input id="volumeSlider" type="range" min="0" max="100" value="42"></label>
    </span>
    Move <kbd>WASD</kbd>/<kbd>Arrows</kbd>/<kbd>Left Stick</kbd> &middot; Dash <kbd>Space</kbd>/<kbd>Y</kbd> &middot; Trap <kbd>E</kbd> &middot; Right Stick Cursor &middot; Primary <kbd>LMB</kbd>/<kbd>A</kbd> &middot; Arc/Secondary <kbd>RMB</kbd>/<kbd>B</kbd> &middot; Pause <kbd>P</kbd> &middot; Restart <kbd>R</kbd> &middot; Mute <kbd>M</kbd>
  </div>
</div>

<div class="damageFlash" id="damageFlash"></div>

<div class="overlay show" id="startOverlay">
  <div class="modal">
    <h1 id="startTitle">Echo Vein</h1>
    <p id="startText">Initializing Hollowshift profile...</p>
    <div id="menuMeta" class="menuMeta"></div>
    <div class="buttonColumn" id="menuButtons"></div>
    <div class="cards" id="classCards"></div>
    <div id="menuContent" class="menuContent"></div>
  </div>
</div>

<div class="overlay" id="upgradeOverlay">
  <div class="modal">
    <h2>Level Up - Choose an Upgrade</h2>
    <p>Pick one upgrade. Weapon stacks are intentionally strong because survivor runs should spiral into controlled chaos.</p>
    <div class="cards" id="upgradeCards"></div>
  </div>
</div>

<div class="overlay" id="gameOverOverlay">
  <div class="modal">
    <h1 id="gameOverTitle">Mission Failed</h1>
    <p id="gameOverText"></p>
    <div class="buttonRow">
      <button onclick="restartGame()">Retry Run</button>
      <button onclick="showMainMenu()">Main Menu</button>
    </div>
  </div>
</div>

<div class="overlay" id="runStatsOverlay">
  <div class="modal runStatsModal">
    <h1 id="runStatsTitle">Run Statistics</h1>
    <p id="runStatsReason" class="subtitle"></p>
    <div id="runStatsBody"></div>
    <h3>Trend Graph</h3>
    <div class="chartTabs">
      <button data-run-chart="enemiesKilled">Kills</button>
      <button data-run-chart="totalOreCollected">Ore</button>
      <button data-run-chart="damageTaken">Damage</button>
      <button data-run-chart="playerLevel">Level</button>
      <button data-run-chart="fpsAverage">FPS</button>
    </div>
    <canvas id="runStatsChart" class="runStatsChart"></canvas>
    <div class="buttonRow">
      <button onclick="runStatsContinue()">Continue</button>
      <button onclick="runStatsRetry()">Retry Run</button>
      <button onclick="runStatsMainMenu()">Main Menu</button>
    </div>
  </div>
</div>
</body>
</html>


EchoVein/PROJECT_CONTEXT.md:
# Echo Vein - Project Context

## Core Architecture
- Engine: Canvas 2D with Web Audio
- Structure: main.js, core.js, entities.js, systems.js, render-ui.js, progression.js
- State: Central game state object in core.js

## Key Systems
- Combat: Heat-based weapon system with overheat mechanics
- Progression: XP/level system with operator classes
- Resources: Ore mining with tiered economy (Common/Uncommon/Rare)
- Enemies: 20+ enemy types with visual variants, A* pathfinding
- Missions: 4 types (Hunt, Survey, Harvest, Holdout)
- Milestones: 30 achievements across 5 categories
- Synergies: 8 upgrade combos with permanent unlocks
- Bosses: 3 unique bosses with phase transitions and weak points

## ✅ Completed Phases

### Phase 1: Progression & Meta Overhaul
- ✅ **1.1 Milestones & Achievements** — 30 milestones, locked/unlocked, progress tracking, persistence
- ✅ **1.2 Mission Variety** — Hunt, Survey, Harvest, Holdout with selection UI and tracking
- ✅ **1.3 Permanent Upgrade Expansion** — 10 upgrade categories with tiered costs
- ✅ **1.4 Resource Economy Rebalance** — Gild income reduced, Voltarite availability increased, upgrade costs reworked, resource conversion system added, bonus objectives implemented
- ✅ **1.5 Operator XP & Prestige** — Persistent class‑specific XP, level cap (20), stacking prestige bonuses (HP/damage/speed/mining/heat) per class, UI in main menu and in‑game HUD, milestones for operator levels and prestige, debug tools for rapid testing
- ⏳ **1.6 Run History / Hall of Records** — Planned

### Phase 2.1 — Upgrade Synergies ✅
- 8 synergies with check/apply logic, UI menu, profile persistence, and in-run hooks

### Phase 2.2 — Boss Rework ✅
- 3 unique bosses (Hollow Tyrant, Hex Shard Colossus, Molten Maw)
- Phase system with 3 transitions per boss (P1/P2/Enrage)
- Weak point mechanic with stagger (2x damage on hit)
- 9 boss-specific attack patterns across 3 bosses
- Boss health bar UI with phase markers
- Boss name display on spawn with dramatic animation
- Unique boss drops per boss type
- Boss selection logic (Mission 1 = Tyrant, Mission 2+ = random)
- Audio: bossRoar, bossPhase, bossDefeat, weakPointAppear, weakPointHit

### Phase 2.3 — Enemy Behaviours ✅
- 7 new enemy behaviours implemented:
  - **flyingChase** (gloomBat) — Ignores terrain collision, moves directly toward player
  - **zigzagChase** (boneSkitter) — Sinusoidal lateral oscillation, phase resets periodically
  - **blinkChase** (voidMite) — Teleports closer when far away, brief invulnerability
  - **terrainCharger** (fractureBeetle) — Charges through mineable terrain, breaks tiles
  - **supportBuffer** (echoSiren) — Buffs nearby allies (+18% speed, +10% damage)
  - **charger** (ironMaw) — Wind-up charge attack with cooldown, red glow telegraph
  - **spawner** (sporeMother) — Spawns minions periodically, max active limit

### Phase 2.4 — Boss Fight Improvements ✅
- Reduced attack cooldowns (30–40% faster)
- Attack telegraphs (swipe, slam, charge visual warnings)
- New attacks added:
  - **multiRush** (Hollow Tyrant P2+) — 3 rapid charges
  - **crystalWall** (Hex Shard Colossus P2+) — Creates damaging crystal pillars
  - **lavaPoolBurst** (Molten Maw P2+) — Creates damaging lava pools in a ring
- Dramatic phase transitions (knockback, stun, particle burst, double shockwave)
- Universal telegraph pulse (red glow when attack is imminent)

### Phase 2.5 — Extraction Path ✅
- Glowing yellow dotted line from player to extraction craft
- Dynamic line-of-sight sampling with pulsing animation
- "Blocked" indicator when path is obstructed

### Phase 2.6 — Upgrade Pool Guards ✅
- Upgrades now only appear if the prerequisite skill is owned:
  - Drone upgrades require `Warden Drone Bay`
  - Sifter upgrades require `Sifter Drone`
  - Trap upgrades require `Trap Kit`
  - `Supply Cache` only appears with 15+ Voltarite
- Visual feedback for stackable upgrades (e.g., Field Reclaimer shows current HP value)

## 🎯 Next Tasks (Planned)
- ⏳ Phase 1.6 — Run History / Hall of Records
- ⏳ Phase 2.7 — Thermal Lance VFX polish (sprite integration), additional content (new enemies/weapons) as desired

## Boss Details

**Hollow Tyrant (Melee/Tank):**
- Phase 1: Slow melee swipe, charge attack
- Phase 2: Faster swipe, ground slam (shockwave)
- Phase 3 (Enrage): All attacks 30% faster, rage roar (multiple shockwaves), multiRush

**Hex Shard Colossus (Ranged/Artillery):**
- Phase 1: 3-crystal spread, spawns 1 Hex Shard
- Phase 2: 5-crystal spread, spawns 2 Hex Shards, Crystal Rain, Crystal Wall
- Phase 3 (Enrage): 7-crystal spread, spawns 3 Hex Shards, faster Crystal Rain

**Molten Maw (Burrower/Fire):**
- Phase 1: Burrow → erupt, leaves lava pool
- Phase 2: Faster burrow, fire trail, 3 fireballs, Lava Pool Burst
- Phase 3 (Enrage): Even faster, longer fire trail, tracking fireballs

### Boss Rewards
- **XP:** 120 XP (scaled with mission difficulty)
- **Resources:** Bonus Gild Shards + rare ore drop on defeat
- **Unique Drop:** Each boss drops a unique boss-specific resource:
  - Hollow Tyrant → **Tyrant Core** (used for future crafting/synergies)
  - Hex Shard Colossus → **Hex Crystal Fragment**
  - Molten Maw → **Molten Ember**
- **Milestone:** Counts toward BossKill1 milestone
- **Run Progress:** Triggers extraction sequence

### Key Files to Modify (Phase 1.6)
| File | Changes |
|---|---|
| `progression.js` | Add `runHistory` to profile, functions to store and retrieve run records, UI rendering for Hall of Records |
| `render-ui.js` | (optional) small stats display on HUD |
| `core.js` | (optional) expose best‑run stats |
| `style.css` | Styling for the Hall of Records UI |

## Code Patterns
- Use existing enemy system in entities.js
- UI rendering uses render-ui.js
- Event system in systems.js
- Boss state stored in `g.bossType`, `g.bossPhase`, `g.bossWeakPoint`
- Synergy checks in `checkSynergies(g)` after each upgrade pickup

## File References
- Main entry: index.html
- Styles: css/style.css
- Assets: assets/sprites/

EchoVein/REPO_CONTEXT.md:
repo: EchoVein

File Structure:
EchoVein/css/style.css
EchoVein/js/core.js
EchoVein/js/entities.js
EchoVein/js/progression.js
EchoVein/js/render-ui.js
EchoVein/js/systems.js

EchoVein/css/style.css:
:root {
    --bg: #07090d;
    --panel: rgba(14, 18, 28, 0.88);
    --panel2: rgba(30, 35, 48, 0.94);
    --gold: #ffcc4d;
    --cyan: #42d6ff;
    --green: #5dff9a;
    --red: #ff5b5b;
    --orange: #ff9f43;
    --purple: #b46bff;
    --text: #eef3ff;
    --muted: #95a2ba;
  }

  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    height: 100%;
    overflow: hidden;
    background: radial-gradient(circle at 50% 45%, #182033 0%, #07090d 68%);
    color: var(--text);
    font-family: Inter, Segoe UI, Roboto, Arial, sans-serif;
    user-select: none;
  }

  /* ── Splash Screen ──────────────────────────────────────────────── */
  .splashScreen {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 28px;
    background: #07090d;
    opacity: 1;
    transition: opacity 0.8s ease-out;
    pointer-events: auto;
  }
  .splashScreen.hidden {
    opacity: 0;
    pointer-events: none;
  }

  .splashLogo {
    width: 256px;
    height: 256px;
    image-rendering: auto;
    animation: splashPulse 2.4s ease-in-out infinite;
  }

  .splashLoading {
    color: var(--muted);
    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.28em;
  }

  .splashStudio {
    color: rgba(255,255,255,0.18);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin-top: -12px;
  }

  @keyframes splashPulse {
    0%, 100% { opacity: 0.88; transform: scale(1); }
    50%      { opacity: 1;    transform: scale(1.03); }
  }

  #game {
    display: block;
    width: 100vw;
    height: 100vh;
    cursor: crosshair;
  }

  .hud {
    position: fixed;
    inset: 0;
    pointer-events: none;
  }

  .topbar {
    position: absolute;
    left: 14px;
    top: 14px;
    display: grid;
    gap: 8px;
    min-width: 390px;
  }

  .panel {
    background: var(--panel);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 14px;
    box-shadow: 0 10px 35px rgba(0,0,0,0.35);
    backdrop-filter: blur(8px);
  }

  .stats {
    padding: 10px 12px;
    display: grid;
    gap: 8px;
  }

  .line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: var(--muted);
  }

  .line strong { color: var(--text); font-weight: 800; }

  .bars { display: grid; gap: 6px; }
  .bar {
    height: 15px;
    background: rgba(255,255,255,0.08);
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.10);
    position: relative;
  }
  .bar > div {
    height: 100%;
    width: 50%;
    border-radius: 999px;
    transition: width 0.12s linear;
  }
  .bar.health > div { background: linear-gradient(90deg, #ff3f5f, #ff8a5b); }
  .bar.xp > div { background: linear-gradient(90deg, #3c80ff, #42d6ff); }
  .bar.overheat > div { background: linear-gradient(90deg, #ffd15c, #ff5b5b); }
  .bar .label {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 10px;
    font-weight: 900;
    color: rgba(255,255,255,0.92);
    text-shadow: 0 1px 2px #000;
  }

  .rightbar {
    position: absolute;
    right: 14px;
    top: 14px;
    width: 330px;
    padding: 12px;
    display: grid;
    gap: 10px;
    transition: opacity 0.25s ease;
  }
  .rightbar.faded {
    opacity: 0.12;
    pointer-events: none;
  }

  .title {
    font-size: 18px;
    font-weight: 950;
    letter-spacing: 0.3px;
    color: #fff;
  }
  .subtitle {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.35;
  }

  .weaponList, .logList { display: grid; gap: 6px; }
  .chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 7px 9px;
    border-radius: 10px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    font-size: 12px;
    color: var(--muted);
  }
  .chip b { color: #fff; }
  .chip.locked { border-color: rgba(255,75,75,0.8); background: rgba(255,75,75,0.12); color: #ff9999; }
  .chip.unlocked { border-color: rgba(114,255,118,0.8); background: rgba(89,255,105,0.14); color: #d4ffd4; }

  .bottomHelp {
    position: absolute;
    left: 50%;
    bottom: 16px;
    transform: translateX(-50%);
    padding: 10px 14px;
    font-size: 13px;
    color: var(--muted);
    white-space: nowrap;
  }
  .bottomHelp kbd {
    color: #fff;
    background: rgba(255,255,255,0.10);
    border: 1px solid rgba(255,255,255,0.20);
    border-bottom-color: rgba(0,0,0,0.55);
    border-radius: 5px;
    padding: 2px 5px;
    font-size: 11px;
    font-weight: 900;
  }

  .overlay {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: none;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    background: radial-gradient(circle at 50% 50%, rgba(15,22,36,0.44), rgba(0,0,0,0.72));
  }
  .overlay.show { display: flex; }
  .modal {
    width: min(960px, calc(100vw - 32px));
    max-height: calc(100vh - 42px);
    overflow: auto;
    padding: 18px;
    background: var(--panel2);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 20px;
    box-shadow: 0 18px 80px rgba(0,0,0,0.65);
  }
  .modal h1, .modal h2 { margin: 0 0 8px; }
  .modal h1 { font-size: 30px; }
  .modal p { color: var(--muted); line-height: 1.45; margin: 8px 0; }

  .cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }
  .card {
    border: 1px solid rgba(255,255,255,0.13);
    border-radius: 16px;
    background: rgba(255,255,255,0.06);
    padding: 14px;
    cursor: pointer;
    transition: transform 0.1s ease, background 0.1s ease, border-color 0.1s ease;
  }
  .card:hover {
    transform: translateY(-2px);
    background: rgba(255,255,255,0.10);
    border-color: rgba(66,214,255,0.65);
  }
  .card .icon { font-size: 32px; margin-bottom: 10px; }
  .card h3 { margin: 0 0 7px; font-size: 17px; }
  .card p { margin: 0; font-size: 13px; }
  .card .tag {
    display: inline-block;
    margin-top: 10px;
    font-size: 11px;
    color: #08111a;
    background: var(--cyan);
    padding: 3px 7px;
    border-radius: 999px;
    font-weight: 900;
  }

  .buttonRow { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
  button {
    pointer-events: auto;
    border: 1px solid rgba(255,255,255,0.18);
    background: linear-gradient(180deg, rgba(66,214,255,0.18), rgba(66,214,255,0.08));
    color: #fff;
    border-radius: 12px;
    padding: 10px 14px;
    font-weight: 900;
    cursor: pointer;
  }
  button:hover { border-color: rgba(66,214,255,0.75); }

  .damageFlash {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background: rgba(255,30,55,0.0);
    transition: background 0.12s linear;
  }
  .damageFlash.on { background: rgba(255,30,55,0.22); }


  .soundControls {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-right: 14px;
    padding-right: 12px;
    border-right: 1px solid rgba(255,255,255,0.12);
  }
  .soundControls button {
    border: 1px solid rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.08);
    color: var(--text);
    border-radius: 10px;
    padding: 5px 9px;
    font-weight: 800;
    cursor: pointer;
  }
  .soundControls button:hover { background: rgba(255,255,255,0.16); }
  .soundControls input { width: 90px; accent-color: var(--cyan); }

  @media (max-width: 850px) {
    .rightbar { display: none; }
    .topbar { min-width: 310px; max-width: calc(100vw - 28px); }
    .cards { grid-template-columns: 1fr; }
    .bottomHelp { display: none; }
  }


  .debugBox {
    position: fixed;
    left: 12px;
    bottom: 12px;
    z-index: 50;
    max-width: min(760px, calc(100vw - 24px));
    max-height: 40vh;
    overflow: auto;
    white-space: pre-wrap;
    user-select: text;
    pointer-events: auto;
    background: rgba(80, 0, 0, 0.94);
    color: #fff;
    border: 1px solid rgba(255, 120, 120, 0.9);
    border-radius: 12px;
    padding: 10px 12px;
    font: 12px/1.35 Consolas, Monaco, monospace;
    box-shadow: 0 12px 35px rgba(0,0,0,0.55);
  }

  .card:focus-visible {
    outline: 3px solid var(--cyan);
    outline-offset: 3px;
  }


  /* Permanent upgrade table / affordability states */
  .upgradeTableWrap {
    display: grid;
    gap: 18px;
    margin-top: 16px;
  }
  .upgradeCategorySection {
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 16px;
    background: rgba(255,255,255,0.035);
    overflow: hidden;
  }
  .upgradeCategorySection > h3 {
    margin: 0;
    padding: 11px 13px;
    background: rgba(66,214,255,0.08);
    border-bottom: 1px solid rgba(255,255,255,0.10);
    color: #fff;
  }
  .upgradeTable {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  .upgradeTable th,
  .upgradeTable td {
    padding: 9px 10px;
    vertical-align: top;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .upgradeTable th {
    text-align: left;
    color: var(--cyan);
    background: rgba(0,0,0,0.16);
    font-size: 11px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .upgradeTable tr.affordable { background: rgba(93,255,154,0.025); }
  .upgradeTable tr.locked { background: rgba(255,255,255,0.018); }
  .upgradeTable tr.maxed { opacity: 0.72; }
  .upgradeTable td b { color: #fff; }
  .upgradeTable td small {
    display: block;
    margin-top: 3px;
    color: var(--muted);
  }
  .costLine {
    display: block;
    white-space: nowrap;
  }
  .costLine.ok { color: #a7f7c6; }
  .costLine.missing { color: #ff8f8f; font-weight: 900; }
  button:disabled,
  button.disabled,
  .buyBtn:disabled {
    background: rgba(120,128,145,0.22) !important;
    border-color: rgba(255,255,255,0.08) !important;
    color: rgba(238,243,255,0.52) !important;
    cursor: not-allowed !important;
    transform: none !important;
  }
  .buyBtn {
    min-width: 122px;
    padding: 8px 10px;
  }


  .settingsPanel {
    display: grid;
    gap: 12px;
    margin-top: 16px;
  }
  .settingsRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 13px 14px;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 14px;
    background: rgba(255,255,255,0.055);
  }
  .settingsRow span {
    display: grid;
    gap: 4px;
  }
  .settingsRow small,
  .settingsValues {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.35;
  }
  .settingsRow input[type="checkbox"] {
    width: 22px;
    height: 22px;
    accent-color: var(--cyan);
    cursor: pointer;
  }
  .settingsPresetRow {
    align-items: flex-start;
  }
  .settingsPresetButtons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .settingsPresetButtons button {
    padding: 7px 10px;
    border-radius: 10px;
  }
  .settingsValues {
    padding: 0 4px;
  }

.icon .spriteIcon {
  width: 38px;
  height: 38px;
  object-fit: contain;
  vertical-align: middle;
  filter: drop-shadow(0 0 8px rgba(255,255,255,0.18));
}
.weaponIcon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  vertical-align: middle;
  margin-right: 6px;
}

  .card.selected,
  .card[aria-selected="true"] {
    transform: translateY(-3px) scale(1.015);
    background: rgba(66,214,255,0.16);
    border-color: rgba(66,214,255,0.95);
    box-shadow: 0 0 0 2px rgba(66,214,255,0.30), 0 18px 45px rgba(66,214,255,0.12);
  }


/* Controller focus/selection highlight used by main menu, class select, settings, and level-up cards. */
.controllerSelected,
button.controllerSelected,
input.controllerSelected,
.card.controllerSelected {
  outline: 3px solid #64e8ff !important;
  box-shadow: 0 0 0 2px rgba(100,232,255,0.24), 0 0 22px rgba(100,232,255,0.45) !important;
  transform: translateY(-1px) scale(1.015);
}
input.controllerSelected {
  transform: scale(1.18);
}


.objectiveRow { margin: 6px 0; padding: 7px 8px; border-radius: 10px; background: rgba(255,255,255,0.055); border: 1px solid rgba(255,255,255,0.08); }
.objectiveRow.active { opacity: var(--pulse, 1); box-shadow: 0 0 calc(12px * var(--pulse, 1)) rgba(66,214,255,0.18); }
.objectiveRow.priority { border-color: rgba(66,214,255,0.35); }
.objectiveRow.done { background: rgba(93,255,154,0.10); border-color: rgba(93,255,154,0.28); }
.objectiveTop { display:flex; justify-content:space-between; gap:10px; font-size:12px; color: var(--text); }
.objectiveTop b { color: var(--cyan); }
.objectiveRow.done .objectiveTop b { color: var(--green); }
.objectiveBar { height: 7px; margin-top: 5px; border-radius:999px; background:rgba(255,255,255,0.08); overflow:hidden; border:1px solid rgba(255,255,255,0.08); }
.objectiveBar i { display:block; height:100%; background:linear-gradient(90deg,var(--cyan),var(--green)); border-radius:999px; transition:width .18s linear; }
.runStatsModal { width:min(980px, 94vw); max-height:92vh; overflow:auto; }
.statCards { display:grid; grid-template-columns: repeat(auto-fit,minmax(120px,1fr)); gap:10px; margin:12px 0; }
.statCard { padding:10px; border-radius:12px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.10); }
.statCard span { display:block; color:var(--muted); font-size:12px; }
.statCard b { display:block; font-size:20px; color:var(--text); margin-top:4px; }
.resourceBreakdown { display:grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap:6px; }
.resourceBreakdown div { display:flex; justify-content:space-between; padding:6px 8px; border-radius:8px; background:rgba(255,255,255,0.045); }
.chartTabs { display:flex; gap:8px; flex-wrap:wrap; margin:8px 0; }
.runStatsChart { width:100%; height:240px; border-radius:12px; border:1px solid rgba(255,255,255,0.12); background:rgba(0,0,0,0.28); }

/* ==============================
   Milestones Menu (Phase 1.1)
   ============================== */
.milestoneSection {
  margin-top: 16px;
}

.milestoneSectionHeader {
  font-size: 18px;
  font-weight: 900;
  color: var(--text);
  padding: 8px 4px 6px;
  border-bottom: 1px solid rgba(255,255,255,0.10);
  margin-bottom: 10px;
}

.milestonesGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.milestoneCard {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.04);
  transition: transform 0.12s ease, border-color 0.12s ease;
}

.milestoneCard.unlocked {
  border-color: rgba(93,255,154,0.45);
  background: rgba(93,255,154,0.07);
  box-shadow: 0 0 16px rgba(93,255,154,0.08);
}

.milestoneCard.locked {
  border-color: rgba(255,255,255,0.08);
  opacity: 0.82;
}

.milestoneIcon {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(255,255,255,0.06);
}

.milestoneCard.unlocked .milestoneIcon {
  background: rgba(93,255,154,0.14);
  box-shadow: 0 0 14px rgba(93,255,154,0.18);
}

.milestoneCard.locked .milestoneIcon {
  background: rgba(255,255,255,0.04);
}

.milestoneInfo {
  display: grid;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.milestoneName {
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
}

.milestoneCard.locked .milestoneName {
  color: var(--muted);
}

.milestoneDesc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.35;
}

.milestoneReward {
  font-size: 13px;
  color: var(--gold);
  font-weight: 700;
  margin-top: 4px;
}

.milestoneDate {
  font-size: 11px;
  color: var(--cyan);
  margin-top: 2px;
}

.milestoneLockedLabel {
  font-size: 12px;
  color: #ff9999;
  margin-top: 2px;
}

/* Progress bar for tracked milestones */
.milestoneProgressWrap {
  height: 8px;
  margin-top: 6px;
  background: rgba(255,255,255,0.08);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
}

.milestoneProgressBar {
  height: 100%;
  background: linear-gradient(90deg, var(--cyan), var(--green));
  border-radius: 999px;
  transition: width 0.2s ease;
  min-width: 2px;
}

.milestoneProgressBar.complete {
  background: linear-gradient(90deg, var(--green), #a7f7c6);
}

.milestoneProgressLabel {
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
  text-align: right;
}

.milestoneCard.unlocked .milestoneProgressLabel {
  color: var(--green);
}

@media (max-width: 700px) {
  .milestonesGrid {
    grid-template-columns: 1fr;
  }
}

/* ==============================
   Mission Select (Phase 1.2)
   ============================== */
.missionSelectGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.missionSelectCard {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05);
  cursor: pointer;
  transition: transform 0.12s ease, border-color 0.15s ease, background 0.15s ease;
}

.missionSelectCard:hover,
.missionSelectCard:focus-visible {
  transform: translateY(-3px);
  border-color: var(--cyan);
  background: rgba(66,214,255,0.10);
  box-shadow: 0 8px 30px rgba(66,214,255,0.10);
}

.missionSelectIcon {
  font-size: 36px;
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(255,255,255,0.06);
}

.missionSelectInfo {
  display: grid;
  gap: 5px;
  flex: 1;
  min-width: 0;
}

.missionSelectName {
  font-size: 18px;
  font-weight: 900;
  color: var(--text);
}

.missionSelectDesc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
}

.missionSelectReward {
  font-size: 13px;
  color: var(--gold);
  font-weight: 700;
  margin-top: 3px;
}

@media (max-width: 700px) {
  .missionSelectGrid {
    grid-template-columns: 1fr;
  }
}

/* ==============================
   Upgrade Synergies Menu (Phase 2.1)
   ============================== */
.synergyGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.synergyCard {
  display: grid;
  gap: 8px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  transition: transform 0.12s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.synergyCard:hover {
  transform: translateY(-2px);
}

.synergyUnlocked {
  border-color: rgba(93,255,154,0.50);
  background: rgba(93,255,154,0.07);
  box-shadow: 0 0 20px rgba(93,255,154,0.10);
}

.synergyLocked {
  border-color: rgba(255,255,255,0.07);
  opacity: 0.78;
}

.synergyHeader {
  display: flex;
  align-items: center;
  gap: 10px;
}

.synergyIcon {
  font-size: 28px;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.synergyUnlocked .synergyIcon {
  background: rgba(93,255,154,0.14);
  box-shadow: 0 0 14px rgba(93,255,154,0.18);
}

.synergyName {
  font-size: 17px;
  font-weight: 800;
  color: var(--text);
  flex: 1;
}

.synergyLocked .synergyName {
  color: var(--muted);
}

.synergyBadge {
  font-size: 11px;
  font-weight: 900;
  color: #0a1a0a;
  background: var(--green);
  padding: 3px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.synergyDesc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
}

.synergyBonus {
  font-size: 13px;
  color: var(--purple);
  font-weight: 700;
  line-height: 1.35;
}

.synergyReqLabel {
  font-size: 11px;
  color: var(--muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 4px;
}

.synergyReqList {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.synergyReqItem {
  font-size: 11px;
  padding: 3px 7px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.05);
  color: var(--muted);
}

.synergyReqOwned {
  border-color: rgba(93,255,154,0.35);
  color: var(--green);
  background: rgba(93,255,154,0.08);
}

.synergyReqMissing {
  border-color: rgba(255,75,75,0.40);
  color: #ff8f8f;
  background: rgba(255,75,75,0.08);
}

.synergyUnlocked .synergyReqItem {
  border-color: rgba(93,255,154,0.25);
  color: var(--green);
  background: rgba(93,255,154,0.06);
}

@media (max-width: 700px) {
  .synergyGrid {
    grid-template-columns: 1fr;
  }
}

/* ==============================
   Boss UI (Phase 2.2)
   ============================== */
.bossHealthBar {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 380px;
  z-index: 15;
  pointer-events: none;
}

.bossHealthBarBg {
  background: rgba(0,0,0,0.72);
  border-radius: 12px;
  padding: 4px;
  border: 2px solid rgba(255,255,255,0.25);
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}

.bossHealthBarFill {
  height: 22px;
  border-radius: 8px;
  transition: width 0.15s linear;
}

.bossHealthBarText {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 13px;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
}

.bossNameDisplay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 25;
  pointer-events: none;
  text-align: center;
  animation: bossNameFadeIn 0.5s ease-out;
}

.bossNameText {
  font-size: 42px;
  font-weight: 900;
  text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
  letter-spacing: 0.02em;
}

.bossNameSubtitle {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 10px rgba(0,0,0,0.8);
  margin-top: 8px;
}

@keyframes bossNameFadeIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.bossNameFadeOut {
  animation: bossNameFadeOut 1s ease-in forwards;
}

@keyframes bossNameFadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.phaseIndicator {
  position: absolute;
  top: -2px;
  width: 3px;
  height: calc(100% + 4px);
  background: rgba(255,255,255,0.85);
  border-radius: 2px;
}

.phaseLabel {
  position: absolute;
  top: calc(100% + 4px);
  font-size: 10px;
  font-weight: 900;
  color: rgba(255,255,255,0.8);
  transform: translateX(-50%);
}

.weakPointHighlight {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  border: 3px solid rgba(66,214,255,0.7);
  box-shadow: 0 0 20px rgba(66,214,255,0.5), inset 0 0 20px rgba(66,214,255,0.2);
  animation: weakPointPulse 0.6s ease-in-out infinite alternate;
}

@keyframes weakPointPulse {
  from { transform: scale(1); opacity: 0.8; }
  to { transform: scale(1.15); opacity: 1; }
}

.weakPointLabel {
  position: absolute;
  font-weight: 900;
  font-size: 14px;
  color: #42d6ff;
  text-shadow: 0 0 14px #42d6ff;
  white-space: nowrap;
  pointer-events: none;
  animation: weakPointLabelPulse 0.6s ease-in-out infinite alternate;
}

@keyframes weakPointLabelPulse {
  from { opacity: 0.7; }
  to { opacity: 1; }
}

.crystalRainIndicator {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  border: 2px solid rgba(180,107,255,0.5);
  background: rgba(180,107,255,0.06);
  animation: crystalRainPulse 0.4s ease-in-out infinite alternate;
}

@keyframes crystalRainPulse {
  from { transform: scale(1); opacity: 0.6; }
  to { transform: scale(1.1); opacity: 1; }
}

@media (max-width: 700px) {
  .bossHealthBar {
    width: min(340px, calc(100vw - 40px));
  }
}


EchoVein/js/core.js:
'use strict';

/* Core state, configuration, DOM references, data dictionaries, helpers, and canvas resize. */

const GAME_TITLE = 'Echo Vein';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

// Logical cave tile sizing.  This test build increases every block by 1.5x.
// Set TILE_SIZE_SCALE back to 1.0 for direct A/B comparison with the previous build.
const TILE_SIZE_BASE = 36;
const TILE_SIZE_SCALE = 1;
const TILE = Math.round(TILE_SIZE_BASE * TILE_SIZE_SCALE);
const MAP_W = 96;
const MAP_H = 96;
const WORLD_W = MAP_W * TILE;
const WORLD_H = MAP_H * TILE;

const TILE_EMPTY = 0;
const TILE_ROCK = 1;
const TILE_HARD = 2;
const TILE_GOLD = 3;
const TILE_NITRA = 4;
const TILE_CRYSTAL = 5;
const TILE_LAVA_ROCK = 6;
const TILE_FERRITE_BARK = 7;
const TILE_LUMINA_SPORES = 8;
const TILE_AETHER_QUARTZ = 9;
const TILE_CRYSALITH = 10;
const TILE_EMBERGLASS = 11;

const MINERALS = {
  gild: { id: 'gild', displayName: 'Gild Shards', shortName: 'Gild', color: '#ffcc4d', sprite: 'gildShard' },
  voltarite: { id: 'voltarite', displayName: 'Voltarite', shortName: 'Voltarite', color: '#ff5b5b', sprite: 'voltariteOre' },
  echo: { id: 'echo', displayName: 'Echo Shards', shortName: 'Echo', color: '#42d6ff', sprite: 'echoShard' },
  ferriteBark: { id: 'ferriteBark', displayName: 'Ferrite Bark', shortName: 'Ferrite', color: '#aab3bd', sprite: 'ferriteBark', missionEligible: true, rarity: 'common' },
  luminaSpores: { id: 'luminaSpores', displayName: 'Lumina Spores', shortName: 'Lumina', color: '#5dff9a', sprite: 'luminaSpores', missionEligible: true, rarity: 'uncommon' },
  aetherQuartz: { id: 'aetherQuartz', displayName: 'Aether Quartz', shortName: 'Aether', color: '#b46bff', sprite: 'aetherQuartz', missionEligible: true, rarity: 'rare' },
  crysalith: { id: 'crysalith', displayName: 'Crysalith', shortName: 'Crysalith', color: '#aeefff', sprite: 'crysalithCluster', missionEligible: true, rarity: 'uncommon' },
  emberglass: { id: 'emberglass', displayName: 'Emberglass', shortName: 'Emberglass', color: '#ff9f43', sprite: 'emberglassDeposit', missionEligible: true, rarity: 'uncommon' },
  crust: { id: 'crust', displayName: 'Crust Stone', shortName: 'Crust', color: '#3a342f' },
  ironbasalt: { id: 'ironbasalt', displayName: 'Ironbasalt', shortName: 'Ironbasalt', color: '#302b2a' },
  lavaRock: { id: 'lavaRock', displayName: 'Lava Rock', shortName: 'Lava Rock', color: '#7a2417', sprite: 'lavaRock' }
};

const TILE_DATA = {
  [TILE_ROCK]: MINERALS.crust,
  [TILE_HARD]: MINERALS.ironbasalt,
  [TILE_GOLD]: MINERALS.gild,
  [TILE_NITRA]: MINERALS.voltarite,
  [TILE_CRYSTAL]: MINERALS.echo,
  [TILE_FERRITE_BARK]: MINERALS.ferriteBark,
  [TILE_LUMINA_SPORES]: MINERALS.luminaSpores,
  [TILE_AETHER_QUARTZ]: MINERALS.aetherQuartz,
  [TILE_CRYSALITH]: MINERALS.crysalith,
  [TILE_EMBERGLASS]: MINERALS.emberglass,
  [TILE_LAVA_ROCK]: MINERALS.lavaRock
};

const OBSTACLE_TYPES = {
  lavaRock: {
    id: 'lavaRock',
    displayName: 'Lava Rock',
    tile: TILE_LAVA_ROCK,
    mineable: false,
    blocksMovement: true,
    blocksProjectiles: true,
    blocksPathfinding: true,
    sprite: 'lavaRock'
  }
};

const RUN_RESOURCE_IDS = ['gild','voltarite','echo','ferriteBark','luminaSpores','aetherQuartz','crysalith','emberglass'];
const MISSION_RESOURCE_IDS = ['gild','voltarite','ferriteBark','luminaSpores','aetherQuartz','crysalith','emberglass'];

const RESOURCE_TILE_TYPES = [
  { tile:TILE_GOLD, resourceId:'gild', weight:0.35, minCluster:3, maxCluster:9, hp:32 },
  { tile:TILE_NITRA, resourceId:'voltarite', weight:0.28, minCluster:2, maxCluster:6, hp:32 },
  { tile:TILE_CRYSTAL, resourceId:'echo', weight:0.14, minCluster:2, maxCluster:5, hp:45 },
  { tile:TILE_FERRITE_BARK, resourceId:'ferriteBark', weight:0.12, minCluster:3, maxCluster:7, hp:34 },
  { tile:TILE_LUMINA_SPORES, resourceId:'luminaSpores', weight:0.08, minCluster:2, maxCluster:5, hp:26 },
  { tile:TILE_AETHER_QUARTZ, resourceId:'aetherQuartz', weight:0.035, minCluster:1, maxCluster:3, hp:54 },
  { tile:TILE_CRYSALITH, resourceId:'crysalith', weight:0.055, minCluster:2, maxCluster:4, hp:42 },
  { tile:TILE_EMBERGLASS, resourceId:'emberglass', weight:0.07, minCluster:2, maxCluster:5, hp:38 }
];

const WEAPON_DATA = {
  vectorBurst: { name: 'Vector Burst', type:'multiDirectionCommon', spriteId:'vectorBurstIcon' },
  minigun: { name: 'Rotary Mauler' },
  carbine: { name: 'Vector Carbine' },
  flamer: { name: 'Thermal Lance' },
  borecasterBomb: { name: 'Seismic Charge', allowedClasses: ['borecaster'], type:'timedThrowableBomb', spriteId:'borecasterBombLit' },
  hammerfallSalvo: { name: 'Hammerfall Salvo', allowedClasses: ['bulwark'], type: 'guidedMissileSalvo', spriteId:'hammerfallMissile' },
  satchel: { name: 'Seismic Charge' },
  drones: { name: 'Warden Drones' },
  boomerang: { name: 'Return Disc' },
  arc: { name: 'Storm Lattice', spriteId:'arcConnectionIcon' },
  rail: { name: 'Bore Rail' },
  sweeper: { name: 'Sifter Drone' }
};


const PERF_STATES = {
  HEALTHY: 'PERF_HEALTHY',
  WARNING: 'PERF_WARNING',
  CRITICAL: 'PERF_CRITICAL',
  RECOVERING: 'PERF_RECOVERING'
};

const PERFORMANCE_CONFIG = {
  sampleWindowSeconds: 3.0,
  healthyFps: 55,
  warningFps: 42,
  criticalFps: 42,
  recoveryFps: 52,
  recoveryHoldSeconds: 3.0,
  healthyHoldSeconds: 5.0,
  baseMaxEnemies: 120,
  minMaxEnemies: 35,
  maxEnemyBulletsHealthy: 180,
  maxEnemyBulletsWarning: 120,
  maxEnemyBulletsCritical: 70,
  maxEnemyBulletsRecovering: 105,
  criticalDespawnPerSecond: 3,
  despawnDistance: 780,
  cameraMargin: 180
};

const SETTINGS_KEY = 'echoVeinSettings';
const DEFAULT_SETTINGS = {
  fogOfWarEnabled: true,
  fogOfWarRadius: 280,
  fogOfWarSoftEdge: 160,
  fogOfWarIntensity: 0.78,
  fogOfWarMemoryEnabled: false,
  manualMouseControlEnabled: true
};
let gameSettings = loadSettings();

function normalizeSettings(settings){
  return {...DEFAULT_SETTINGS, ...(settings || {})};
}

function loadSettings(){
  try{
    const raw = localStorage.getItem(SETTINGS_KEY);
    return normalizeSettings(raw ? JSON.parse(raw) : null);
  }catch(err){
    console.warn('Could not load Echo Vein settings.', err);
    return normalizeSettings(null);
  }
}

function saveSettings(){
  try{ localStorage.setItem(SETTINGS_KEY, JSON.stringify(gameSettings)); }
  catch(err){ console.warn('Could not save Echo Vein settings.', err); }
}

function getFogSettings(){
  return normalizeSettings(gameSettings);
}

function setFogOfWarEnabled(enabled){
  gameSettings.fogOfWarEnabled = !!enabled;
  saveSettings();
}

function setManualMouseControlEnabled(enabled){
  gameSettings.manualMouseControlEnabled = !!enabled;
  saveSettings();
}

function setFogIntensityPreset(preset){
  const presets = {
    low: { fogOfWarRadius: 340, fogOfWarSoftEdge: 190, fogOfWarIntensity: 0.58 },
    medium: { fogOfWarRadius: 280, fogOfWarSoftEdge: 160, fogOfWarIntensity: 0.78 },
    high: { fogOfWarRadius: 230, fogOfWarSoftEdge: 140, fogOfWarIntensity: 0.88 }
  };
  Object.assign(gameSettings, presets[preset] || presets.medium);
  saveSettings();
}


const keys = new Set();
let mouse = { x: 0, y: 0, down: false, lastMove: -999, used: false };
let gamepadButtonsPrev = [];
let lastTime = performance.now();
let game = null;
let paused = false;
let awaitingUpgrade = false;
let shake = 0;
let logTimeout = 0;

const ui = {
  timer: document.getElementById('timer'),
  hpFill: document.getElementById('hpFill'), hpLabel: document.getElementById('hpLabel'),
  xpFill: document.getElementById('xpFill'), xpLabel: document.getElementById('xpLabel'),
  heatFill: document.getElementById('heatFill'), heatLabel: document.getElementById('heatLabel'),
  level: document.getElementById('level'), depth: document.getElementById('depth'),
  gold: document.getElementById('gold'), nitra: document.getElementById('nitra'), kills: document.getElementById('kills'),
  weaponList: document.getElementById('weaponList'), logList: document.getElementById('logList'),
  rightbar: document.querySelector('.rightbar'),
  startOverlay: document.getElementById('startOverlay'), upgradeOverlay: document.getElementById('upgradeOverlay'),
  gameOverOverlay: document.getElementById('gameOverOverlay'),
  startTitle: document.getElementById('startTitle'), startText: document.getElementById('startText'),
  menuMeta: document.getElementById('menuMeta'), menuButtons: document.getElementById('menuButtons'), menuContent: document.getElementById('menuContent'),
  classCards: document.getElementById('classCards'), upgradeCards: document.getElementById('upgradeCards'),
  gameOverText: document.getElementById('gameOverText'), damageFlash: document.getElementById('damageFlash'),
  soundBtn: document.getElementById('soundBtn'), volumeSlider: document.getElementById('volumeSlider')
};

const CLASSES = [
  { id: 'bulwark', icon: 'B', spriteId: 'bulwarkOperator', name: 'Bulwark', desc: 'Heavy armour, high endurance, and a Rotary Mauler built for sustained pressure.', tag: 'Armoured DPS', hp: 140, speed: 185, weapon: 'minigun' },
  { id: 'pathfinder', icon: 'P', spriteId: 'pathfinderOperator', name: 'Pathfinder', desc: 'Fast utility operator with a Vector Carbine, stronger dash, and a deployable trap kit.', tag: 'Mobility', hp: 105, speed: 235, weapon: 'carbine' },
  { id: 'borecaster', icon: 'C', spriteId: 'borecasterOperator', name: 'Borecaster', desc: 'Mining and thermal-control specialist with better heat capacity and a Thermal Lance.', tag: 'Mining Control', hp: 125, speed: 195, weapon: 'flamer' }
];

const UPGRADE_POOL = [
  { icon:'💥', name:'Kinetic Rounds', desc:'+18% projectile damage.', apply:g=>g.player.damageMul*=1.18 },
  { icon:'⚡', name:'Trigger Discipline', desc:'+14% fire rate on all automatic weapons.', apply:g=>g.player.fireRateMul*=1.14 },
  { icon:'🎯', name:'Targeting Optics', desc:'+10% weapon accuracy. Projectile spread becomes tighter.', apply:g=>{ g.player.accuracy = clamp((g.player.accuracy || 0.35) + 0.10, 0, 1); g.player.accuracyBonus = (g.player.accuracyBonus || 0) + 0.10; log(g, `Weapon accuracy improved to ${Math.round(g.player.accuracy*100)}%.`); } },
  { icon:'🔫', name:'Extra Barrel', desc:'+1 projectile for bullet weapons.', apply:g=>g.player.extraProjectiles++ },
  { icon:'✳️', spriteId:'vectorBurstIcon', name:'Vector Burst', desc:'Unlocks a common multi-direction weapon that fires a symmetrical spread at targets.', available:g=>!g.weapons.find(w=>w.id==='vectorBurst'), apply:g=>addOrLevelWeapon(g,'vectorBurst') },
  { icon:'➕', spriteId:'vectorBurstIcon', name:'Splitfire Array', desc:'Vector Burst gains +1 firing direction. No maximum cap.', available:g=>!!g.weapons.find(w=>w.id==='vectorBurst'), apply:g=>upgradeVectorBurst(g,'count') },
  { icon:'💠', spriteId:'vectorBurstIcon', name:'Vector Focusing', desc:'+15% Vector Burst damage.', available:g=>!!g.weapons.find(w=>w.id==='vectorBurst'), apply:g=>upgradeVectorBurst(g,'damage') },
  { icon:'⚡', spriteId:'vectorBurstIcon', name:'Vector Accelerator', desc:'+12% Vector Burst projectile speed and range.', available:g=>!!g.weapons.find(w=>w.id==='vectorBurst'), apply:g=>upgradeVectorBurst(g,'speed') },
  { icon:'⏱️', spriteId:'vectorBurstIcon', name:'Vector Relay', desc:'+14% Vector Burst fire rate.', available:g=>!!g.weapons.find(w=>w.id==='vectorBurst'), apply:g=>upgradeVectorBurst(g,'rate') },
  { icon:'🛡️', name:'Armour Plates', desc:'+25 max HP and repair 20 HP.', apply:g=>{g.player.maxHp+=25; g.player.hp=Math.min(g.player.maxHp,g.player.hp+20);} },
  { icon:'👟', name:'Mag Boots', desc:'+10% movement speed.', apply:g=>g.player.speedMul*=1.10 },
  { icon:'🧲', name:'Resonance Magnet', desc:'+35% Echo Shard and mineral pickup range.', apply:g=>g.player.pickupMul*=1.35 },
  { icon:'🖱️', name:'Targeting Cursor', desc:'Unlock mouse-guided targeting. Move the cursor near a Hollowborn to bias player weapons toward it.', requiresMouseControl:true, available:g=>!g.player.mouseTargeting, apply:g=>{ g.player.mouseTargeting=true; log(g,'Targeting Cursor linked. Move the mouse to guide player weapons.'); } },
  { icon:'🔗', spriteId:'arcConnectionIcon', name:'Arc Connection', desc:'Right-click enemies to chain them with green links. Right-click empty space with 2+ selected to detonate.', apply:g=>{ g.arcConnection.unlocked=true; g.arcConnection.level++; g.arcConnection.maxTargets=1+g.arcConnection.level; log(g, `Arc Connection Mk ${g.arcConnection.level}: ${g.arcConnection.maxTargets} target chain ready.`); } },
  { icon:'🔷', name:'Sifter Drone', desc:'Adds a utility drone that roams out and collects Echo Shards for you.', apply:g=>addOrLevelWeapon(g,'sweeper') },
  { icon:'⛏️', name:'Tungsten Bore Bit', desc:'+35% mining speed and less heat per tile.', apply:g=>{g.player.mineMul*=1.35; g.player.heatEfficiency*=0.86;} },
  { icon:'❄️', name:'Cryo Coolant', desc:'Tool cools faster and overheats less often.', apply:g=>{g.player.coolMul*=1.35; g.player.maxHeat+=20;} },
  { icon:'🧨', name:'Seismic Charge', desc:'Adds a periodic explosion around the nearest swarm.', apply:g=>addOrLevelWeapon(g,'satchel') },
  { icon:'🚀', spriteId:'hammerfallMissile', name:'Hammerfall Salvo', desc:'Unlocks Bulwark guided missile salvo.', allowedClasses:['bulwark'], available:g=>g.player.classId==='bulwark' && !g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>unlockHammerfallSalvo(g) },
  { icon:'💥', name:'Warhead Yield', desc:'+15% Hammerfall missile damage.', allowedClasses:['bulwark'], available:g=>!!g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>upgradeHammerfall(g,'damage') },
  { icon:'🔥', name:'Hot-Burn Motors', desc:'+12% Hammerfall missile speed.', allowedClasses:['bulwark'], available:g=>!!g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>upgradeHammerfall(g,'speed') },
  { icon:'⛽', name:'Extended Fuel Cells', desc:'+15% Hammerfall missile flight time.', allowedClasses:['bulwark'], available:g=>!!g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>upgradeHammerfall(g,'fuel') },
  { icon:'➕', name:'Extra Launch Tubes', desc:'Hammerfall fires one additional missile per salvo.', allowedClasses:['bulwark'], available:g=>!!g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>upgradeHammerfall(g,'count') },
  { icon:'🎯', spriteId:'targetLockReticle', name:'Redlock Guidance', desc:'Hammerfall missiles track more accurately with less guidance noise.', allowedClasses:['bulwark'], available:g=>!!g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>upgradeHammerfall(g,'accuracy') },
  { icon:'💣', spriteId:'borecasterBombLit', name:'Seismic Charge', desc:'Unlocks a Borecaster-only throwable timed bomb with layered blast VFX.', allowedClasses:['borecaster'], available:g=>g.player.classId==='borecaster' && !g.weapons.find(w=>w.id==='borecasterBomb'), apply:g=>unlockBorecasterBomb(g) },
  { icon:'➕', spriteId:'borecasterBombCountIcon', name:'Extra Charges', desc:'+1 bomb thrown per Seismic Charge use.', allowedClasses:['borecaster'], available:g=>!!g.weapons.find(w=>w.id==='borecasterBomb'), apply:g=>upgradeBorecasterBomb(g,'count') },
  { icon:'⏱️', spriteId:'borecasterBombFuseIcon', name:'Short Fuse', desc:'Reduces Seismic Charge fuse time with a safe minimum clamp.', allowedClasses:['borecaster'], available:g=>!!g.weapons.find(w=>w.id==='borecasterBomb'), apply:g=>upgradeBorecasterBomb(g,'fuse') },
  { icon:'🟠', spriteId:'borecasterBombRadiusIcon', name:'Blast Radius', desc:'Increases Seismic Charge explosion radius and area control.', allowedClasses:['borecaster'], available:g=>!!g.weapons.find(w=>w.id==='borecasterBomb'), apply:g=>upgradeBorecasterBomb(g,'radius') },
  { icon:'🛸', name:'Warden Drone Bay', desc:'Adds autonomous Warden Drones that roam and fire micro-bullets.', apply:g=>addOrLevelWeapon(g,'drones') },
  { icon:'➕', name:'Drone Bay Expansion', desc:'Adds more Warden Drones and improves their bullet damage.',  available: g => !!g.weapons.find(w => w.id === 'drones'), apply: g => { addOrLevelWeapon(g,'drones'); addOrLevelWeapon(g,'drones'); g.player.droneDamageMul*=1.12; } },
  { icon:'🤖', name:'Drone Targeting AI', desc:'Warden Drones roam faster and fire more aggressively.',  available: g => !!g.weapons.find(w => w.id === 'drones'), apply: g => { if(!g.weapons.find(w=>w.id==='drones')) addOrLevelWeapon(g,'drones'); g.player.droneSpeedMul*=1.18; g.player.droneFireRateMul*=1.30; } },
  { icon:'📡', name:'Drone Patrol Radius', desc:'Warden Drones roam farther from the operator and hit harder.', available: g => !!g.weapons.find(w => w.id === 'drones'), apply: g => { if(!g.weapons.find(w=>w.id==='drones')) addOrLevelWeapon(g,'drones'); g.player.droneOrbitMul*=1.20; g.player.droneDamageMul*=1.18; } },
  { icon:'🔍', name:'Sifter Optics', desc:'Increases Echo Shard search radius.', available: g => !!g.weapons.find(w => w.id === 'sweeper'), apply: g => { if(!g.weapons.find(w=>w.id==='sweeper')) addOrLevelWeapon(g,'sweeper'); g.player.sweeperRangeMul*=1.35; } },
  { icon:'💨', name:'Sifter Turbo', desc:'Sifter Drones move faster and collect Echo Shards more aggressively.', available: g => !!g.weapons.find(w => w.id === 'sweeper'), apply: g => { if(!g.weapons.find(w=>w.id==='sweeper')) addOrLevelWeapon(g,'sweeper'); g.player.sweeperSpeedMul*=1.30; g.player.sweeperCollectMul*=1.18; } },
  { icon:'🪃', name:'Return Disc', desc:'Adds a returning disc that slices through Hollowborn on the way out and back.', apply:g=>addOrLevelWeapon(g,'boomerang') },
  { icon:'🌩️', spriteId:'arcConnectionIcon', name:'Storm Lattice', desc:'Adds chain lightning between nearby enemies.', apply:g=>addOrLevelWeapon(g,'arc') },
  { icon:'☄️', name:'Bore Rail', desc:'Adds a heavy piercing rail shot.', apply:g=>addOrLevelWeapon(g,'rail') },
  { icon:'❤️', name:'Field Reclaimer', desc:'Every 18 kills restore 8 HP.', apply:g=>g.player.vampire+=8 },
  { icon:'📦', name:'Supply Cache', desc:'Spend 15 Voltarite to repair to full HP.', available: g => g.nitra >= 15, apply: g => { g.nitra -= 15; g.player.hp = g.player.maxHp; } },
  { icon:'🪤', spriteId:'pathfinderTrap', name:'Trap Payload', desc:'+30% trap damage and radius.', available: g => g.player.canUseTraps, apply: g => { g.player.trapDamageMul*=1.30; g.player.trapRadiusMul*=1.15; g.player.canUseTraps=true; } },
  { icon:'💣', name:'Explosive Ammo', desc:'Bullets gain small area damage.', apply:g=>g.player.splash+=10 },
];

function rand(a,b){ return a + Math.random()*(b-a); }
function randi(a,b){ return Math.floor(rand(a,b+1)); }
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function dist2(ax,ay,bx,by){ const dx=ax-bx, dy=ay-by; return dx*dx+dy*dy; }
function len(x,y){ return Math.hypot(x,y) || 1; }
function lerp(a,b,t){ return a+(b-a)*t; }
function nowSec(){ return game ? game.time : 0; }
function weaponName(id){ return WEAPON_DATA[id]?.name || id; }

function gamepadVector(){
  if(!navigator.getGamepads) return { dx:0, dy:0, active:false };
  const pads = navigator.getGamepads();
  for(const pad of pads){
    if(!pad) continue;
    const ax = pad.axes?.[0] || 0;
    const ay = pad.axes?.[1] || 0;
    const mag = Math.hypot(ax, ay);
    if(mag > 0.18){
      const scaled = clamp((mag - 0.18) / 0.82, 0, 1);
      return { dx: ax / mag * scaled, dy: ay / mag * scaled, active:true };
    }
  }
  return { dx:0, dy:0, active:false };
}

function gamepadButtonPressed(index){
  if(!navigator.getGamepads) return false;
  let isDown = false;
  const pads = navigator.getGamepads();
  for(const pad of pads){
    if(pad?.buttons?.[index]?.pressed){
      isDown = true;
      break;
    }
  }
  const wasDown = !!gamepadButtonsPrev[index];
  gamepadButtonsPrev[index] = isDown;
  return isDown && !wasDown;
}


const GAMEPAD = {
  // Standard Gamepad API button mapping:
  // A=0, B=1, X=2, Y=3.
  // User control rule: X is the left-mouse/primary-action equivalent.
  A:0, B:1, X:2, Y:3,
  DPAD_UP:12, DPAD_DOWN:13, DPAD_LEFT:14, DPAD_RIGHT:15,
  LEFT_DEADZONE:0.35,
  RIGHT_DEADZONE:0.22,
  CURSOR_SPEED:860
};

let gamepadState = {
  connected:false,
  id:'',
  padIndex:null,
  prevButtons:[],
  buttons:[],
  axes:[0,0,0,0],
  leftX:0,
  leftY:0,
  rightX:0,
  rightY:0
};


// Real-time manual aim clock.  Game time can pause/freeze during menus or
// transitions, so controller cursor/manual aim state also uses browser time.
let manualAimLastMoveRealTime = -999;

let menuGamepadState = {
  selectedIndex:0,
  lastMoveTime:-999,
  moveRepeatDelay:0.20,
  lastSignature:''
};

function getPrimaryGamepad(){
  if(!navigator.getGamepads) return null;
  const pads=navigator.getGamepads();
  if(gamepadState.padIndex!=null){
    const known=pads[gamepadState.padIndex];
    if(known && known.connected !== false) return known;
    gamepadState.padIndex=null;
  }
  for(const pad of pads){
    if(pad && pad.connected !== false){ gamepadState.padIndex=pad.index; return pad; }
  }
  return null;
}

function pollGamepadState(){
  const pad=getPrimaryGamepad();
  gamepadState.prevButtons=gamepadState.buttons || [];
  if(!pad){
    gamepadState.connected=false;
    gamepadState.buttons=[];
    gamepadState.axes=[0,0,0,0];
    gamepadState.leftX=gamepadState.leftY=gamepadState.rightX=gamepadState.rightY=0;
    return gamepadState;
  }
  gamepadState.connected=true;
  gamepadState.id=pad.id || 'Gamepad';
  gamepadState.buttons=Array.from(pad.buttons || [], b=>!!b.pressed);
  gamepadState.axes=Array.from(pad.axes || []);
  gamepadState.leftX=gamepadState.axes[0] || 0;
  gamepadState.leftY=gamepadState.axes[1] || 0;
  gamepadState.rightX=gamepadState.axes[2] || 0;
  gamepadState.rightY=gamepadState.axes[3] || 0;
  return gamepadState;
}

function gamepadPressed(index){
  return !!gamepadState.buttons[index] && !gamepadState.prevButtons[index];
}

function gamepadHeld(index){
  return !!gamepadState.buttons[index];
}

function gamepadPressedAny(indices){
  return indices.some(index=>gamepadPressed(index));
}

function gamepadHeldAny(indices){
  return indices.some(index=>gamepadHeld(index));
}

function getGamepadLeftNav(){
  /*
   * Navigation source used by menus and upgrade cards.
   *
   * Some pads expose D-pad as buttons 12-15, some as axes 6/7, while the
   * standard left stick uses axes 0/1.  Read all of these so the power-up menu
   * is not silently locked to one controller mapping.
   */
  const x=gamepadState.leftX || 0, y=gamepadState.leftY || 0;
  const axes=gamepadState.axes || [];
  const dpadButtonX=(gamepadHeld(GAMEPAD.DPAD_RIGHT)?1:0) - (gamepadHeld(GAMEPAD.DPAD_LEFT)?1:0);
  const dpadButtonY=(gamepadHeld(GAMEPAD.DPAD_DOWN)?1:0) - (gamepadHeld(GAMEPAD.DPAD_UP)?1:0);
  const dpadAxisX=Math.abs(axes[6] || 0)>GAMEPAD.LEFT_DEADZONE ? Math.sign(axes[6]) : 0;
  const dpadAxisY=Math.abs(axes[7] || 0)>GAMEPAD.LEFT_DEADZONE ? Math.sign(axes[7]) : 0;
  const stickX=Math.abs(x)>GAMEPAD.LEFT_DEADZONE ? Math.sign(x) : 0;
  const stickY=Math.abs(y)>GAMEPAD.LEFT_DEADZONE ? Math.sign(y) : 0;
  const nx = dpadButtonX || dpadAxisX || stickX;
  const ny = dpadButtonY || dpadAxisY || stickY;
  return {x:nx,y:ny,active:!!(nx||ny)};
}

function currentManualAimActive(g){
  if(!g || !mouse.used) return false;
  if(!getFogSettings().manualMouseControlEnabled) return false;
  const realNow = performance.now()/1000;
  const gameRecent = g.time - mouse.lastMove < 2;
  const realRecent = realNow - manualAimLastMoveRealTime < 2;
  return !!(gameRecent || realRecent);
}

function activeAimWorld(g){
  const realNow = performance.now()/1000;
  const c = g?.controllerCursor;
  if(c?.active && ((g.time - c.lastMoveTime < 2) || (realNow - (c.lastMoveRealTime ?? -999) < 2))){
    return {x:c.worldX, y:c.worldY};
  }
  return { x:g.camera.x + mouse.x, y:g.camera.y + mouse.y };
}

function triggerDash(g, source='input'){
  if(!g || g.state!=='playing' || awaitingUpgrade) return false;
  const p=g.player;
  const cd = p.classId==='pathfinder'?1.4:2.4;
  if(p.dashCd>0) return false;
  p.dashCd=cd;
  p.dashT=0.15;
  if(g.runStats) g.runStats.dashesUsed=(g.runStats.dashesUsed||0)+1;
  sfx('dash');
  return true;
}

function getGamepadRightVector(){
  /*
   * Right-stick axes are usually 2/3 on standard Xbox-style pads, but some
   * browser/driver combinations expose them as 3/4, 2/5, or 4/5.  The previous
   * implementation read only axes 2/3, so on some pads the cursor could appear
   * to move once and then stop.  Pick the strongest plausible right-stick pair
   * each frame and treat it as continuous analogue input, not as an edge event.
   */
  const axes = gamepadState.axes || [];
  const pairs = [[2,3],[3,4],[2,5],[4,5]];
  let best = {x:0,y:0,mag:0,pair:null};
  for(const [ix,iy] of pairs){
    if(ix>=axes.length || iy>=axes.length) continue;
    const x = axes[ix] || 0;
    const y = axes[iy] || 0;
    const mag = Math.hypot(x,y);
    if(mag > best.mag) best = {x,y,mag,pair:[ix,iy]};
  }
  if(best.mag <= GAMEPAD.RIGHT_DEADZONE) return {x:0,y:0,active:false,mag:0,pair:best.pair};
  const scaled = clamp((best.mag-GAMEPAD.RIGHT_DEADZONE)/(1-GAMEPAD.RIGHT_DEADZONE),0,1);
  return {x:best.x/best.mag*scaled, y:best.y/best.mag*scaled, active:true, mag:best.mag, pair:best.pair};
}

function syncControllerCursorWorld(g){
  if(!g?.controllerCursor) return;
  g.controllerCursor.worldX = g.camera.x + g.controllerCursor.screenX;
  g.controllerCursor.worldY = g.camera.y + g.controllerCursor.screenY;
}

function moveControllerCursor(g,dt){
  if(!g) return;
  const c=g.controllerCursor;
  if(!c) return;
  const rv=getGamepadRightVector();
  const realNow = performance.now()/1000;
  if(rv.active){
    c.active=true;
    c.screenX=clamp((c.screenX ?? innerWidth/2) + rv.x*GAMEPAD.CURSOR_SPEED*dt, 0, innerWidth);
    c.screenY=clamp((c.screenY ?? innerHeight/2) + rv.y*GAMEPAD.CURSOR_SPEED*dt, 0, innerHeight);
    c.lastMoveTime=g.time;
    c.lastMoveRealTime=realNow;
    c.axisPair=rv.pair;
    syncControllerCursorWorld(g);
    mouse.x=c.screenX;
    mouse.y=c.screenY;
    mouse.used=true;
    mouse.lastMove=g.time;
    manualAimLastMoveRealTime=realNow;
  } else if(c.active){
    syncControllerCursorWorld(g);
    if((g.time - c.lastMoveTime > 2) && (realNow - (c.lastMoveRealTime ?? -999) > 2)) c.active=false;
  }
}


function menuInputClock(){
  // Menus pause/freeze game.time, so controller repeat timing must use
  // the browser's real clock. This fixes stick/D-pad navigation only moving
  // once in the level-up/power-up menu.
  return performance.now()/1000;
}

function visibleMenuGamepadElements(){
  // Determine which overlay is active: startOverlay (main menus), gameOverOverlay (run failed), or runStatsOverlay (mission summary)
  const startActive = ui.startOverlay?.classList?.contains('show');
  const gameOverActive = document.getElementById('gameOverOverlay')?.classList?.contains('show');
  const statsActive = document.getElementById('runStatsOverlay')?.classList?.contains('show');
  if(!startActive && !gameOverActive && !statsActive) return [];

  let container = null;
  if(startActive) container = ui.startOverlay;
  else if(gameOverActive) container = document.getElementById('gameOverOverlay');
  else if(statsActive) container = document.getElementById('runStatsOverlay');
  const selectors = [
    '#menuButtons button',
    '#classCards .card[data-class-id]',
    '#menuContent button',
    '#menuContent input[type="checkbox"]',
    '#menuContent .missionSelectCard[tabindex]',
    '#menuContent .milestoneCard[tabindex]',
    '#menuContent .synergyCard',
    '.buttonRow button',
    '[data-run-chart]'
  ];
  return selectors
    .flatMap(sel=>Array.from(container.querySelectorAll(sel)))
    .filter(el=>{
      if(el.disabled) return false;
      const style=getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
    });
}

function refreshMenuGamepadSelection(elements=visibleMenuGamepadElements()){
  elements.forEach((el,i)=>{
    const selected=i===menuGamepadState.selectedIndex;
    el.classList.toggle('controllerSelected', selected);
    el.setAttribute('aria-selected', selected ? 'true' : 'false');
    if(selected){
      // Scroll the container to keep the selected element visible
      try{ el.scrollIntoView({block:'nearest', behavior:'smooth'}); }catch(_){}
      if(document.activeElement!==el){
        try{ el.focus({preventScroll:true}); }catch(_){ el.focus(); }
      }
    }
  });
}

function updateMenuGamepadInput(dt){
  const startActive = ui.startOverlay?.classList?.contains('show');
  const gameOverActive = document.getElementById('gameOverOverlay')?.classList?.contains('show');
  const statsActive = document.getElementById('runStatsOverlay')?.classList?.contains('show');
  if(!startActive && !gameOverActive && !statsActive) return false;
  const elements=visibleMenuGamepadElements();
  if(!elements.length) return false;
  const signature=elements.map(el=>el.textContent || el.dataset.classId || el.id || el.tagName).join('|');
  if(signature!==menuGamepadState.lastSignature){
    menuGamepadState.lastSignature=signature;
    menuGamepadState.selectedIndex=0;
    menuGamepadState.lastMoveTime=-999;
  }
  menuGamepadState.selectedIndex=clamp(menuGamepadState.selectedIndex,0,elements.length-1);
  const nav=getGamepadLeftNav();
  const t=menuInputClock();
  if(nav.active && t-menuGamepadState.lastMoveTime>=menuGamepadState.moveRepeatDelay){
    const step=(nav.x>0 || nav.y>0) ? 1 : -1;
    menuGamepadState.selectedIndex=(menuGamepadState.selectedIndex+step+elements.length)%elements.length;
    menuGamepadState.lastMoveTime=t;
  }
  refreshMenuGamepadSelection(elements);
  if(gamepadPressedAny([GAMEPAD.A, GAMEPAD.X])){
    const el=elements[menuGamepadState.selectedIndex];
    if(el){
      if(el.type==='checkbox') el.checked=!el.checked;
      el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
      return true;
    }
  }
  if(gamepadPressed(GAMEPAD.B)){
    const back=elements.find(el=>/back|main menu|cancel|close/i.test(el.textContent || ''));
    if(back){ back.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window})); return true; }
  }
  return true;
}

function resizeCanvas(){
  canvas.width = Math.floor(window.innerWidth * DPR);
  canvas.height = Math.floor(window.innerHeight * DPR);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();


EchoVein/js/entities.js:
'use strict';

/* Player/enemy classes and game-state factory. */

class Player {
  constructor(cls){
    this.x = WORLD_W/2; this.y = WORLD_H/2;
    this.r = 15;
    // Smaller collision radius than visual body makes mined tunnels and block corners feel less sticky.
    this.collisionR = 12;
    this.classId = cls.id;
    this.hp = cls.hp; this.maxHp = cls.hp;
    this.baseSpeed = cls.speed;
    this.speedMul = 1;
    this.damageMul = 1;
    this.fireRateMul = 1;
    // Weapon accuracy starts intentionally low so early bullets can miss.
    // Accuracy upgrades improve this toward reliable fire without forcing hits.
    this.accuracy = 0.35;
    this.accuracyBonus = 0;
    this.pickupMul = 1;
    this.mineMul = cls.id === 'borecaster' ? 1.45 : 1;
    this.coolMul = cls.id === 'borecaster' ? 1.2 : 1;
    this.heatEfficiency = cls.id === 'borecaster' ? 0.75 : 1;
    this.maxHeat = cls.id === 'borecaster' ? 130 : 100;
    this.heat = 0;
    this.extraProjectiles = 0;
    this.splash = 0;
    this.vampire = 0;
    this.vampCounter = 0;
    this.droneDamageMul = 1;
    this.droneSpeedMul = 1;
    this.droneOrbitMul = 1;
    this.droneFireRateMul = 1;
    this.sweeperRangeMul = 1;
    this.sweeperSpeedMul = 1;
    this.sweeperCollectMul = 1;
    this.mouseTargeting = false;
    this.canUseTraps = cls.id === 'pathfinder';
    this.trapCd = 0;
    this.trapMaxCd = cls.id === 'pathfinder' ? 2.6 : 4.5;
    this.trapDamageMul = 1;
    this.trapRadiusMul = 1;
    this.iframes = 0;
    this.lavaDamageCd = 0;
    this.chargingWaveExplosionDamageCd = 0;
    this.dashCd = 0;
    this.dashT = 0;
    this.lastDx = 1; this.lastDy = 0;
    this.miningProgress = 0;
    this.miningTile = -1;
    // v2 mining contact model: short lock/stickiness keeps drilling stable
    // when the collision solver slides around tile corners at low speed.
    this.miningLock = null;       // { tx, ty, timer }
    this.drillPressure = 0;       // rises while pressing into mineable terrain
  }
}

class Enemy {
  constructor(x,y,type='grunt'){
    this.x=x; this.y=y;
    this.type=type;
    const cfg = ENEMY_TYPES[type] || ENEMY_TYPES.grunt;
    this.type = ENEMY_TYPES[type] ? type : 'grunt';
    const visualVariant = chooseEnemyVisualVariant(this.type, cfg);
    this.displayName = cfg.displayName || this.type;
    this.visualVariantId = visualVariant?.id || this.type;
    this.visualDisplayName = visualVariant?.displayName || this.displayName;
    this.behavior = cfg.behavior || 'meleeChase';
    this.spriteId = visualVariant?.spriteId || cfg.spriteId || cfg.spriteKey || null;
    this.rotationStyle = visualVariant?.rotationStyle || cfg.rotationStyle || enemyRotationStyleFor(cfg, this.type);
    this.visualScaleMul = visualVariant?.scale || cfg.visualScale || 1;
    this.role = cfg.role || 'normal';
    this.r=cfg.r; this.hp=cfg.hp; this.maxHp=cfg.hp; this.speed=cfg.speed; this.damage=cfg.damage; this.xp=cfg.xp;
    this.color=cfg.color;
    this.hitFlash=0;
    this.slow=0;
    this.phase=Math.random()*Math.PI*2;
    initialiseEnemyVisualMotion(this,cfg);
    this.path=[];
    this.rawPath=[];
    this.smoothPath=[];
    this.pathSamples=[];
    this.pathIndex=0;
    this.pathTimer=0;
    this.pathVersion=-1;
    this.pathingRadius=this.collisionR || Math.max(6,this.r*0.88);
    this.cornerState=null;
    this.currentLookaheadTarget=null;
    this.closestPathPoint=null;
    this.pathTangent=null;
    this.offtrackVector=null;
    this.desiredVelocity=null;
    this.pathProgressDistance=0;
    this.lastPathProgressDistance=0;
    this.closestSegmentIndex=0;
    this.offtrackDistance=0;
    this.maxOfftrackDistanceSeen=0;
    this.pathCorrectionGain=4.0;
    this.pathLookaheadDistance=Math.max(28,(this.pathingRadius||this.r||12)*2+18);
    this.pathFollowMode='normal';
    this.pathProgressStallTimer=0;
    this.pathUnsafeSections=[];
    this.pathClearanceFailures=[];
    this.cornerFallbackTarget=null;
    this.lastPlayerTileX=null;
    this.lastPlayerTileY=null;
    this.stuckTimer=0;
    this.lastX=x;
    this.lastY=y;
    this.unstickAngle=Math.random()*Math.PI*2;
    this.noPathTimer=0;
    this.rangedCd=rand(1.2,3.0);
    this.smallShotCd=rand(2.8,6.0);
    this.burstShots=0;
    // Phase 2.3 — Behaviour-specific state fields. Harmless for enemies that do not use them.
    this.blinkCd = rand(4,7);              // blinkChase cooldown
    this.blinkInvuln = 0;                  // brief invulnerability after blink
    this.chargeTimer = 0;                  // charger/terrainCharger state timer
    this.chargeState = 'cooldown';         // 'cooldown' | 'windup' | 'charging' | 'stunned'
    this.chargeWindupTime = 0;             // accumulated wind-up duration
    this.spawnCd = rand(5,8);              // spawner interval
    this.buffPulse = 0;                    // supportBuffer pulse accumulator
    this.sirenBoost = 0;                   // speed/damage buff from echoSiren (duration remaining)
    this.zigzagPhase = Math.random() * Math.PI * 2;  // zigzagChase oscillation phase
    this.flyingOscillation = 0;            // flyingChase vertical bob offset
    this._customMoveHandled = false;       // internal flag: set true when behaviour handles its own movement
    // Hex Shard state machine fields. They are harmless for other enemies.
    this.state = type==='hexShard' ? 'chase' : 'chase';
    this.boomerangCd = type==='hexShard' ? rand(1.3,2.5) : 0;
    this.detonationTimer = 0;
    this.detonationStarted = false;
    this.warningSoundTimer = 0;
    this.shakeAmount = 0;
  }
}

const ENEMY_TYPES = {
  // Existing legacy IDs retained for save/debug compatibility.
  grunt: { displayName:'Clawling', r: 13, hp: 24, speed: 92, damage: 13, xp: 4, color:'#8aff6c', behavior:'meleeChase' },
  swarmer: { displayName:'Needleling', r: 8, hp: 10, speed: 145, damage: 6, xp: 2, color:'#c8ff5c', behavior:'meleeChase' },
  guard: { displayName:'Shellback', r: 18, hp: 68, speed: 66, damage: 22, xp: 12, color:'#ffb84d', spriteId:'eliteShellbackEnemy', behavior:'meleeChase', role:'elite' },
  exploder: { displayName:'Blisterpod', r: 15, hp: 34, speed: 115, damage: 30, xp: 8, color:'#ff5b5b', behavior:'proximityExploder' },
  hexShard: { displayName:'Hex Shard', r: 16, hp: 54, speed: 98, damage: 14, xp: 14, color:'#ff7a38', spriteId:'hexShardEnemy', warningSpriteId:'hexShardWarningGlow', projectileSpriteId:'hexBoomerangProjectile', behavior:'hexBoomerangDetonator' },
  elite: { displayName:'Hollowborn Elite', r: 28, hp: 260, speed: 70, damage: 36, xp: 45, color:'#b46bff', spriteId:'obsidianTitan', behavior:'eliteShooter', role:'elite' },
  boss: { displayName:'Hollow Tyrant', r: 42, hp: 980, speed: 58, damage: 48, xp: 120, color:'#ff4fd8', spriteId:'hollowTyrantBoss', behavior:'bossShooter', role:'boss' },

  // New sprite-pack enemy roster.
  clawlingRunner: { displayName:'Clawling Runner', spriteId:'clawlingRunner', r:12, hp:18, speed:152, damage:6, xp:2, color:'#8aff6c', behavior:'meleeChase' },
  needleWisp: { displayName:'Needle Wisp', spriteId:'needleWisp', r:10, hp:14, speed:95, damage:4, xp:3, color:'#ff6b6b', behavior:'rangedShooter' },
  shellbackGuard: { displayName:'Shellback Guard', spriteId:'shellbackGuard', r:20, hp:92, speed:58, damage:18, xp:14, color:'#ffb84d', behavior:'meleeChase', role:'elite' },
  blisterPod: { displayName:'Blister Pod', spriteId:'blisterPod', r:16, hp:36, speed:108, damage:28, xp:8, color:'#ff5b5b', behavior:'proximityExploder' },
  hexShardThrower: { displayName:'Hex Shard Thrower', spriteId:'hexShardThrower', warningSpriteId:'hexShardWarningGlow', projectileSpriteId:'hexBoomerangProjectile', r:17, hp:62, speed:102, damage:15, xp:16, color:'#ff7a38', behavior:'hexBoomerangDetonator' },
  sporeMother: { displayName:'Spore Mother', spriteId:'sporeMother', r:23, hp:130, speed:60, damage:10, xp:28, color:'#73ff8a', behavior:'spawner', role:'elite' },
  emberCrawler: { displayName:'Ember Crawler', spriteId:'emberCrawler', r:13, hp:28, speed:138, damage:9, xp:5, color:'#ff7a38', behavior:'meleeChase' },
  crystalLancer: { displayName:'Crystal Lancer', spriteId:'crystalLancer', r:15, hp:52, speed:72, damage:11, xp:12, color:'#73d8ff', behavior:'rangedShooter' },
  voidMite: { displayName:'Void Mite', spriteId:'voidMite', r:9, hp:16, speed:132, damage:8, xp:4, color:'#b46bff', behavior:'blinkChase' },
  acidTick: { displayName:'Acid Tick', spriteId:'acidTick', r:10, hp:18, speed:124, damage:7, xp:4, color:'#98ff55', behavior:'meleeChase' },
  ironMaw: { displayName:'Iron Maw', spriteId:'ironMaw', r:24, hp:170, speed:80, damage:28, xp:26, color:'#b9c2c9', behavior:'charger', role:'elite' },
  stormOrb: { displayName:'Storm Orb', spriteId:'stormOrb', r:15, hp:48, speed:82, damage:9, xp:13, color:'#7df9ff', behavior:'rangedShooter' },
  riftStalker: { displayName:'Rift Stalker', spriteId:'riftStalker', r:14, hp:44, speed:122, damage:16, xp:15, color:'#bd7cff', behavior:'meleeChase' },
  boneSkitter: { displayName:'Bone Skitter', spriteId:'boneSkitter', r:11, hp:20, speed:193, damage:7, xp:5, color:'#e8e0c8', behavior:'zigzagChase' },
  magmaBurrower: { displayName:'Magma Burrower', spriteId:'magmaBurrower', r:18, hp:70, speed:92, damage:18, xp:18, color:'#ff7038', behavior:'meleeChase', role:'elite' },
  echoSiren: { displayName:'Echo Siren', spriteId:'echoSiren', r:18, hp:74, speed:78, damage:8, xp:20, color:'#42d6ff', behavior:'supportBuffer', role:'elite' },
  fractureBeetle: { displayName:'Fracture Beetle', spriteId:'fractureBeetle', r:20, hp:96, speed:110, damage:20, xp:22, color:'#ffcc4d', behavior:'terrainCharger', role:'elite' },
  gloomBat: { displayName:'Gloom Bat', spriteId:'gloomBat', r:11, hp:17, speed:215, damage:7, xp:5, color:'#7980ff', behavior:'flyingChase' },
  obsidianTitan: { displayName:'Obsidian Titan', spriteId:'obsidianTitan', r:34, hp:520, speed:48, damage:42, xp:80, color:'#ff7a38', behavior:'miniBoss', role:'boss' },
  hollowTyrantVariant: { displayName:'Hollow Tyrant Variant', spriteId:'hollowTyrantVariant', r:44, hp:1100, speed:54, damage:52, xp:130, color:'#ff4fd8', behavior:'bossShooter', role:'boss' },
  charging_exploder: { displayName:'Rift Charger', spriteId:'emberCrawler', r:12, hp:26, speed:250, damage:0, xp:2, color:'#ff7038', behavior:'chargingExploder', rotationStyle:'fastSpin' }
};

/*
 * Visual variants deliberately separate gameplay archetype from sprite choice.
 * Legacy spawn archetypes such as 'grunt' and 'swarmer' can now produce many
 * different looks from run 1 while keeping their gameplay balance readable.
 */
const ENEMY_VISUAL_VARIANTS = {
  grunt: [
    { id:'clawlingRunner', displayName:'Clawling Runner', spriteId:'clawlingRunner', weight:1.0, rotationStyle:'wobble', scale:1.00 },
    { id:'boneSkitter', displayName:'Bone Skitter', spriteId:'boneSkitter', weight:0.80, rotationStyle:'fastSpin', scale:0.94 },
    { id:'acidTick', displayName:'Acid Tick', spriteId:'acidTick', weight:0.62, rotationStyle:'pulse', scale:0.90 },
    { id:'gloomBat', displayName:'Gloom Bat', spriteId:'gloomBat', weight:0.45, rotationStyle:'flyingDrift', scale:0.92 },
  ],
  swarmer: [
    { id:'needleWisp', displayName:'Needle Wisp', spriteId:'needleWisp', weight:1.0, rotationStyle:'flyingDrift', scale:0.92 },
    { id:'voidMite', displayName:'Void Mite', spriteId:'voidMite', weight:0.80, rotationStyle:'fastSpin', scale:0.88 },
    { id:'boneSkitter', displayName:'Bone Skitter', spriteId:'boneSkitter', weight:0.55, rotationStyle:'fastSpin', scale:0.86 },
  ],
  guard: [
    { id:'shellbackGuard', displayName:'Shellback Guard', spriteId:'shellbackGuard', weight:1.0, rotationStyle:'heavyTurn', scale:1.02 },
    { id:'ironMaw', displayName:'Iron Maw', spriteId:'ironMaw', weight:0.30, rotationStyle:'heavyTurn', scale:1.08 },
  ],
  exploder: [
    { id:'blisterPod', displayName:'Blister Pod', spriteId:'blisterPod', weight:1.0, rotationStyle:'pulse', scale:1.0 },
  ],
};

/*
 * Boss Roster — Phase 2.2
 *
 * Three unique bosses with phase transitions, weak points, and specific attacks.
 * BOSS_TYPES keys are used as the bossType property on the boss enemy entity.
 * Each boss has:
 *   - phases: array of { hpThreshold, attacks[], speedMul, damageMul, enrage? }
 *   - weakPointCooldown: seconds between weak point appearances
 *   - weakPointDuration: seconds the weak point stays active
 *   - staggerDuration: seconds the boss is stunned when weak point is hit
 *   - uniqueDrop: resource id dropped on defeat
 */
const BOSS_TYPES = {
  hollowTyrant: {
    id: 'hollowTyrant',
    name: 'Hollow Tyrant',
    icon: '🏛️',
    description: 'Massive armored behemoth. Slow but devastating.',
    spriteId: 'hollowTyrantBoss',
    color: '#ff4fd8',
    baseHp: 980,
    speed: 58,
    damage: 48,
    xp: 120,
    weakPointCooldown: 10,
    weakPointDuration: 4,
    staggerDuration: 0.5,
    uniqueDrop: 'tyrantCore',
    phases: [
      { hpThreshold: 1.0, attacks: ['swipe', 'charge', 'electricArc'], speedMul: 1.0, damageMul: 1.0 },
      { hpThreshold: 0.66, attacks: ['swipe', 'charge', 'slam', 'multiRush', 'electricArc', 'spreadShot'], speedMul: 1.2, damageMul: 1.15 },
      { hpThreshold: 0.33, attacks: ['swipe', 'charge', 'slam', 'multiRush', 'rageRoar', 'electricArc', 'spreadShot'], speedMul: 1.5, damageMul: 1.3, enrage: true }
    ]
  },
  hexShardColossus: {
    id: 'hexShardColossus',
    name: 'Hex Shard Colossus',
    icon: '🔷',
    description: 'Ranged artillery boss that spawns hex shard enemies.',
    spriteId: 'hexShardColossus',
    color: '#b46bff',
    baseHp: 840,
    speed: 48,
    damage: 32,
    xp: 130,
    weakPointCooldown: 11,
    weakPointDuration: 4,
    staggerDuration: 0.5,
    uniqueDrop: 'hexCrystalFragment',
    phases: [
      { hpThreshold: 1.0, attacks: ['crystalSpread', 'spawnHexShard', 'spreadShot'], speedMul: 1.0, damageMul: 1.0 },
      { hpThreshold: 0.66, attacks: ['crystalSpread', 'spawnHexShard', 'crystalRain', 'crystalWall', 'spreadShot'], speedMul: 1.15, damageMul: 1.15 },
      { hpThreshold: 0.33, attacks: ['crystalSpread', 'spawnHexShard', 'crystalRain', 'crystalWall', 'spreadShot'], speedMul: 1.3, damageMul: 1.3, enrage: true }
    ]
  },
  moltenMaw: {
    id: 'moltenMaw',
    name: 'Molten Maw',
    icon: '🌋',
    description: 'Burrowing beast that erupts from the ground.',
    spriteId: 'moltenMaw',
    color: '#ff7a38',
    baseHp: 920,
    speed: 72,
    damage: 38,
    xp: 140,
    weakPointCooldown: 9,
    weakPointDuration: 4,
    staggerDuration: 0.5,
    uniqueDrop: 'moltenEmber',
    phases: [
      { hpThreshold: 1.0, attacks: ['burrowErupt', 'spreadShot'], speedMul: 1.0, damageMul: 1.0 },
      { hpThreshold: 0.66, attacks: ['burrowErupt', 'fireTrail', 'fireballSpew', 'lavaPoolBurst', 'spreadShot'], speedMul: 1.2, damageMul: 1.15 },
      { hpThreshold: 0.33, attacks: ['burrowErupt', 'fireTrail', 'fireballSpew', 'lavaPoolBurst', 'spreadShot'], speedMul: 1.4, damageMul: 1.3, enrage: true }
    ]
  }
};

const ENEMY_ROTATION_STYLE_PRESETS = {
  fastSpin:      { speed:[-2.6, 2.6], wobble:[0.04,0.16], wobbleSpeed:[3.0,6.2], scalePulse:[0.00,0.035], scaleSpeed:[2.0,4.5] },
  slowSpin:      { speed:[-0.75,0.75], wobble:[0.02,0.10], wobbleSpeed:[1.2,3.0], scalePulse:[0.00,0.045], scaleSpeed:[1.0,2.8] },
  wobble:        { speed:[-0.38,0.38], wobble:[0.07,0.25], wobbleSpeed:[2.2,5.2], scalePulse:[0.00,0.035], scaleSpeed:[1.5,3.0] },
  pulse:         { speed:[-0.28,0.28], wobble:[0.00,0.08], wobbleSpeed:[1.5,3.2], scalePulse:[0.035,0.085], scaleSpeed:[1.8,4.0] },
  heavyTurn:     { speed:[-0.22,0.22], wobble:[0.00,0.045], wobbleSpeed:[0.8,1.9], scalePulse:[0.00,0.022], scaleSpeed:[0.8,1.6] },
  bossPresence:  { speed:[-0.11,0.11], wobble:[0.00,0.035], wobbleSpeed:[0.6,1.4], scalePulse:[0.025,0.055], scaleSpeed:[0.7,1.4] },
  flyingDrift:   { speed:[-1.10,1.10], wobble:[0.10,0.28], wobbleSpeed:[2.0,4.8], scalePulse:[0.015,0.065], scaleSpeed:[1.5,3.7] },
};

function weightedPick(list){
  if(!list || !list.length) return null;
  const total=list.reduce((s,v)=>s+(v.weight ?? 1),0);
  let roll=Math.random()*total;
  for(const item of list){ roll-=(item.weight ?? 1); if(roll<=0) return item; }
  return list[list.length-1];
}

function chooseEnemyVisualVariant(type,cfg){
  if(ENEMY_VISUAL_VARIANTS[type]) return weightedPick(ENEMY_VISUAL_VARIANTS[type]);
  return null;
}

function enemyRotationStyleFor(cfg,type){
  if(cfg.role==='boss') return 'bossPresence';
  if(cfg.role==='elite') return 'heavyTurn';
  if(type==='hexShard' || type==='hexShardThrower') return 'slowSpin';
  if(type==='stormOrb') return 'slowSpin';
  if(type==='gloomBat') return 'flyingDrift';
  if(cfg.behavior==='proximityExploder') return 'pulse';
  if(cfg.behavior==='zigzagChase' || cfg.behavior==='blinkChase') return 'fastSpin';
  if(cfg.behavior==='flyingChase') return 'flyingDrift';
  return 'wobble';
}

function initEnemyVisualRange(range){ return rand(range[0], range[1]); }
function initialiseEnemyVisualMotion(e,cfg){
  const style=e.rotationStyle || enemyRotationStyleFor(cfg,e.type);
  const preset=ENEMY_ROTATION_STYLE_PRESETS[style] || ENEMY_ROTATION_STYLE_PRESETS.wobble;
  e.visualRotation = rand(0,Math.PI*2);
  e.visualRotationSpeed = initEnemyVisualRange(preset.speed);
  if(Math.abs(e.visualRotationSpeed)<0.035) e.visualRotationSpeed += (Math.random()<0.5?-1:1)*0.06;
  e.visualWobbleAmount = initEnemyVisualRange(preset.wobble);
  e.visualWobbleSpeed = initEnemyVisualRange(preset.wobbleSpeed);
  e.visualPhase = rand(0,Math.PI*2);
  e.visualScalePulse = initEnemyVisualRange(preset.scalePulse);
  e.visualScaleSpeed = initEnemyVisualRange(preset.scaleSpeed);
  if(e.role==='boss'){ e.visualRotationSpeed*=0.45; e.visualWobbleAmount*=0.65; }
  if(e.role==='elite'){ e.visualRotationSpeed*=0.70; }
}

function makeGame(cls){
  const g = {
    state:'playing',
    player:new Player(cls),
    tiles:new Uint8Array(MAP_W*MAP_H),
    tileHp:new Float32Array(MAP_W*MAP_H),
    enemies:[], bullets:[], enemyBullets:[], enemyBoomerangs:[], missiles:[], targetLocks:[], boomerangs:[], borecasterBombs:[], wardenDrones:[], sifterDrones:[], traps:[], arcs:[], pickups:[], particles:[], texts:[], waves:[],
    weapons:[],
    arcConnection:{ unlocked:false, level:0, maxTargets:0, selectedEnemies:[], flash:0 },
    upgradeMenuState:{ open:false, selectedIndex:0, lastMoveTime:-999, moveRepeatDelay:0.20 },
    controllerCursor:{ active:false, screenX:innerWidth/2, screenY:innerHeight/2, worldX:WORLD_W/2, worldY:WORLD_H/2, lastMoveTime:-999, lastMoveRealTime:-999, primaryHoldTimer:0, axisPair:null },
    navigationVersion:0,
    debug:{ showEnemyPaths:false, enemyBulletsEnabled:true, showEnemyBulletHitboxes:false, showMiningArc:false, lowSpeedMiningTest:false, showMiningCandidates:true, showEnemyBudget:false, showFogRadius:false, forcePerformanceState:null, perfDespawnLog:false, lavaDamageEnabled:true, showLavaZones:false, showHexRanges:false, showController:false, showAccuracyCone:false, showScaledTileGrid:false, showCollisionTiles:false, showRawEnemyPaths:false, showSmoothedEnemyPaths:true, showCornerCurvePoints:true, showEnemyLookaheadTargets:true, showEnemyPathingRadius:false, showChargingWaveSpawnDirection:false, showChargingWaveFormationTargets:false, showChargingWaveTriggerRadius:false, showChargingWaveDamageRadius:false },
    performance:{
      currentFPS:60,
      averageFPS:60,
      frameTimeMs:16.7,
      averageFrameTimeMs:16.7,
      samples:[],
      sampleTotal:0,
      state:PERF_STATES.HEALTHY,
      previousState:PERF_STATES.HEALTHY,
      budgetFactor:1,
      vfxFactor:1,
      spawnRateMultiplier:1,
      swarmSizeMultiplier:1,
      recoveryTimer:0,
      healthyTimer:0,
      despawnAccumulator:0,
      enemiesDespawned:0,
      skippedSpawns:0,
      skippedBullets:0,
      forced:false
    },
    enemyBudget:{ baseMaxEnemies:PERFORMANCE_CONFIG.baseMaxEnemies, currentMaxEnemies:PERFORMANCE_CONFIG.baseMaxEnemies, minMaxEnemies:PERFORMANCE_CONFIG.minMaxEnemies },
    missionIndex:saveProfile?.missionIndex || 1,
    runIndex:saveProfile?.runIndex || 1,
    missionType:null,
    missionDifficulty:saveProfile ? missionDifficulty(saveProfile.missionIndex) : missionDifficulty(1),
    objectives:[],
    bossSpawned:false,
    bossDefeated:false,
    bossType:null,          // string key into BOSS_TYPES, set at run start
    bossPhase:0,            // current phase index (0, 1, 2)
    bossPhaseTimer:0,       // visual timer for phase transition effects
    bossWeakPoint:{         // Phase 2.2 weak point mechanic
      active:false,
      timer:0,              // countdown until next weak point appearance
      duration:0,           // how long current weak point stays active
      cooldown:0,           // cooldown after stagger
      x:0, y:0,             // position on boss (world coords)
      radius:24             // hit radius
    },
    bossNameDisplay:{        // Phase 2.2 boss name overlay on spawn
      text:'',
      timer:0,
      fadeOut:false
    },
    extraction:null,
    extractionTimer:0,
    runResolved:false,
    objectiveEchoCollected:0,
    resources:{ gild:0, voltarite:0, echo:0, ferriteBark:0, luminaSpores:0, aetherQuartz:0, crysalith:0, emberglass:0 },
    time:0, kills:0, level:1, xp:0, xpNeed:28, gold:0, nitra:0,
    hollowPressure:0, nextPressureTime:120, pressureFlash:0,
    chargingWave:{ enabled:true, active:false, warningActive:false, warningTimer:0, warningDuration:2.0, pendingOptions:null, incomingDirection:0, lastSpawnTime:-9999, nextAllowedTime:90, checkTimer:rand(5,10), cooldown:150, activeEnemyIds:[], lastSpawnCenter:null, lastFormationTargets:[], lastSkipReason:'Not checked yet', forceNextCheck:false, nextWaveId:1 },
    spawnTimer:2.2, eliteTimer:90, nextWave:55,
    camera:{x:0,y:0},
    log:['Mission started. Descend, extract, survive.'],
    selectedClass:cls,
    runStats:(typeof createRunStats==='function' ? createRunStats() : null)
  };
  generateCave(g);
  g.objectives = saveProfile ? currentRunObjectives() : [];
  addMineableBlockObjective(g);
  applyPermanentUpgrades(g);
  addOrLevelWeapon(g, cls.weapon);
  if(cls.id === 'borecaster'){
    addOrLevelWeapon(g, 'borecasterBomb');
    log(g, 'Borecaster Seismic Charge armed. Timed throwable bombs are online.');
  }
  addOrLevelWeapon(g, 'vectorBurst');
  if(cls.id === 'pathfinder'){
    g.player.dashCd = -1;
    log(g, 'Pathfinder Trap Kit ready. Press E to place seismic traps.');
  }
  return g;
}


EchoVein/js/progression.js:
'use strict';

/* Persistent profile, menus, mission progression, and permanent upgrades. */

const SAVE_KEY = 'echoVeinSaveV1';
const RUNS_PER_MISSION = 5;
const EXTRACTION_SECONDS = 30;
const SPECIAL_ORES = ['voltarite','echoQuartz','ferronRoot','lumicite','pyroclastCore','umbralAlloy','ferriteBark','luminaSpores','aetherQuartz','crysalith','emberglass'];

let appState = 'STARTUP';
let saveProfile = null;

/*
 * Milestones & Achievements — Phase 1.1
 *
 * Milestones are persistent, one-time achievements awarded across all runs.
 * Each milestone is checked at specific event hooks and awarded permanently
 * to the player's profile. The reward bonus applies to ALL future runs via
 * applyMilestoneRewards().
 *
 * Structure:
 *   id          — unique string key used in saveProfile.milestones[id]
 *   name        — display name shown in the milestones menu
 *   desc        — unlock condition description
 *   reward      — what the player gets (display text)
 *   icon        — emoji for the milestone card
 *   group       — UI grouping category ('combat','mining','run','resource','class')
 *   check       — function(profile) => boolean; condition to unlock
 *   apply       — function(g) => void; reward applied at run start
 *   progress    — optional function(profile) => {current, target} for progress display
 */
const MILESTONES = [
  // ── 🔥 COMBAT ──────────────────────────────────────────────────────────
  { id:'FirstKill',    name:'First Blood',        desc:'Kill your first enemy.',              reward:'+2% mining speed',    icon:'⚔️',  group:'combat',
    check:p=>(p.statistics.totalEnemiesKilled||0)>=1,
    apply:g=>{ g.player.mineMul*=1.02; },
    progress:p=>({current:p.statistics.totalEnemiesKilled||0, target:1}) },
  { id:'Kill10',       name:'Slayer Initiate',     desc:'Kill 10 enemies.',                   reward:'+2% damage',          icon:'🗡️',  group:'combat',
    check:p=>(p.statistics.totalEnemiesKilled||0)>=10,
    apply:g=>{ g.player.damageMul*=1.02; },
    progress:p=>({current:p.statistics.totalEnemiesKilled||0, target:10}) },
  { id:'Kill50',       name:'Hollowborn Hunter',   desc:'Kill 50 enemies.',                   reward:'+4% damage',          icon:'⚔️',  group:'combat',
    check:p=>(p.statistics.totalEnemiesKilled||0)>=50,
    apply:g=>{ g.player.damageMul*=1.04; },
    progress:p=>({current:p.statistics.totalEnemiesKilled||0, target:50}) },
  { id:'Kill100',      name:'Veteran Slayer',      desc:'Kill 100 enemies.',                  reward:'+6% damage',          icon:'🩸',  group:'combat',
    check:p=>(p.statistics.totalEnemiesKilled||0)>=100,
    apply:g=>{ g.player.damageMul*=1.06; },
    progress:p=>({current:p.statistics.totalEnemiesKilled||0, target:100}) },
  { id:'Kill250',      name:'Elite Exterminator',  desc:'Kill 250 enemies.',                  reward:'+8% damage, +2% speed', icon:'💀', group:'combat',
    check:p=>(p.statistics.totalEnemiesKilled||0)>=250,
    apply:g=>{ g.player.damageMul*=1.08; g.player.speedMul*=1.02; },
    progress:p=>({current:p.statistics.totalEnemiesKilled||0, target:250}) },
  { id:'Kill500',      name:'Legendary Reaper',    desc:'Kill 500 enemies.',                  reward:'+10% damage, +3% speed', icon:'🔥',group:'combat',
    check:p=>(p.statistics.totalEnemiesKilled||0)>=500,
    apply:g=>{ g.player.damageMul*=1.10; g.player.speedMul*=1.03; },
    progress:p=>({current:p.statistics.totalEnemiesKilled||0, target:500}) },
  { id:'EliteKill1',   name:'Elite Bane',          desc:'Kill 1 elite enemy.',                reward:'+3% crit chance',     icon:'🛡️',  group:'combat',
    check:p=>(p.statistics.totalElitesKilled||0)>=1,
    apply:g=>{ g.player.accuracy=Math.min(1, (g.player.accuracy||0.35)+0.03); },
    progress:p=>({current:p.statistics.totalElitesKilled||0, target:1}) },
  { id:'EliteKill10',  name:'Elite Exorcist',      desc:'Kill 10 elite enemies.',             reward:'+5% crit chance',     icon:'⚜️',  group:'combat',
    check:p=>(p.statistics.totalElitesKilled||0)>=10,
    apply:g=>{ g.player.accuracy=Math.min(1, (g.player.accuracy||0.35)+0.05); },
    progress:p=>({current:p.statistics.totalElitesKilled||0, target:10}) },
  { id:'BossKill1',    name:'Boss Breaker',        desc:'Kill 1 boss enemy.',                 reward:'+8% max HP',          icon:'🐉',  group:'combat',
    check:p=>(p.statistics.totalBossesKilled||0)>=1,
    apply:g=>{ const b=Math.round(g.player.maxHp*0.08); g.player.maxHp+=b; g.player.hp+=b; },
    progress:p=>({current:p.statistics.totalBossesKilled||0, target:1}) },

  // ── ⛏️ MINING ──────────────────────────────────────────────────────────
  { id:'FirstOre',     name:'First Strike',        desc:'Mine your first ore.',               reward:'+5% max HP',          icon:'⛏️',  group:'mining',
    check:p=>(p.statistics.totalOreMined||0)>=1,
    apply:g=>{ const b=Math.round(g.player.maxHp*0.05); g.player.maxHp+=b; g.player.hp+=b; },
    progress:p=>({current:p.statistics.totalOreMined||0, target:1}) },
  { id:'Mine50',       name:'Prospector',          desc:'Mine 50 ore.',                       reward:'+3% mining speed',    icon:'⛏️',  group:'mining',
    check:p=>(p.statistics.totalOreMined||0)>=50,
    apply:g=>{ g.player.mineMul*=1.03; },
    progress:p=>({current:p.statistics.totalOreMined||0, target:50}) },
  { id:'Mine200',      name:'Deep Miner',          desc:'Mine 200 ore.',                      reward:'+5% mining speed',    icon:'🪨',  group:'mining',
    check:p=>(p.statistics.totalOreMined||0)>=200,
    apply:g=>{ g.player.mineMul*=1.05; },
    progress:p=>({current:p.statistics.totalOreMined||0, target:200}) },
  { id:'Mine500',      name:'Master Excavator',    desc:'Mine 500 ore.',                      reward:'+7% mining speed',    icon:'💎',  group:'mining',
    check:p=>(p.statistics.totalOreMined||0)>=500,
    apply:g=>{ g.player.mineMul*=1.07; },
    progress:p=>({current:p.statistics.totalOreMined||0, target:500}) },
  { id:'Mine1000',     name:'Legendary Digger',    desc:'Mine 1000 ore.',                     reward:'+10% mining speed',   icon:'🌟',  group:'mining',
    check:p=>(p.statistics.totalOreMined||0)>=1000,
    apply:g=>{ g.player.mineMul*=1.10; },
    progress:p=>({current:p.statistics.totalOreMined||0, target:1000}) },
  { id:'Gild100',      name:'Gild Collector',      desc:'Mine 100 Gild Shards.',              reward:'+5% gold find',       icon:'💰',  group:'mining',
    check:p=>(p.statistics.totalGildMined||0)>=100,
    apply:g=>{ /* gold-find bonus — handled by collectRunResource */ },
    progress:p=>({current:p.statistics.totalGildMined||0, target:100}) },
  { id:'Echo100',      name:'Echo Seeker',         desc:'Mine 100 Echo Shards.',              reward:'+5% pickup radius',   icon:'🔮',  group:'mining',
    check:p=>(p.statistics.totalEchoMined||0)>=100,
    apply:g=>{ g.player.pickupMul*=1.05; },
    progress:p=>({current:p.statistics.totalEchoMined||0, target:100}) },
  { id:'Voltarite50',  name:'Voltarite Harvester', desc:'Mine 50 Voltarite.',                 reward:'+3% fire rate',       icon:'⚡',   group:'mining',
    check:p=>(p.statistics.totalVoltariteMined||0)>=50,
    apply:g=>{ g.player.fireRateMul*=1.03; },
    progress:p=>({current:p.statistics.totalVoltariteMined||0, target:50}) },

  // ── 🏃 RUN & MISSION ────────────────────────────────────────────────────
  { id:'Run1',         name:'First Descent',       desc:'Complete 1 run (extract or die).',   reward:'+5% HP',              icon:'🚀',  group:'run',
    check:p=>(p.statistics.totalRunsCompleted||0)>=1,
    apply:g=>{ const b=Math.round(g.player.maxHp*0.05); g.player.maxHp+=b; g.player.hp+=b; },
    progress:p=>({current:p.statistics.totalRunsCompleted||0, target:1}) },
  { id:'Run5',         name:'Seasoned Explorer',   desc:'Complete 5 runs.',                   reward:'+5% damage',          icon:'🏃',  group:'run',
    check:p=>(p.statistics.totalRunsCompleted||0)>=5,
    apply:g=>{ g.player.damageMul*=1.05; },
    progress:p=>({current:p.statistics.totalRunsCompleted||0, target:5}) },
  { id:'Run15',        name:'Veteran Descent',     desc:'Complete 15 runs.',                  reward:'+8% HP, +3% speed',   icon:'🏅',  group:'run',
    check:p=>(p.statistics.totalRunsCompleted||0)>=15,
    apply:g=>{ const b=Math.round(g.player.maxHp*0.08); g.player.maxHp+=b; g.player.hp+=b; g.player.speedMul*=1.03; },
    progress:p=>({current:p.statistics.totalRunsCompleted||0, target:15}) },
  { id:'Run30',        name:'Deep Diver',          desc:'Complete 30 runs.',                  reward:'+10% damage, +5% HP', icon:'🥇',  group:'run',
    check:p=>(p.statistics.totalRunsCompleted||0)>=30,
    apply:g=>{ g.player.damageMul*=1.10; const b=Math.round(g.player.maxHp*0.05); g.player.maxHp+=b; g.player.hp+=b; },
    progress:p=>({current:p.statistics.totalRunsCompleted||0, target:30}) },
  { id:'Mission1',     name:'First Mission',       desc:'Complete 1 full mission (5 runs).',  reward:'+5% all resources',   icon:'📜',  group:'run',
    check:p=>(p.completedMissions||0)>=1,
    apply:g=>{ /* all-resources bonus — passive income multiplier */ },
    progress:p=>({current:p.completedMissions||0, target:1}) },
  { id:'Mission3',     name:'Sector Breaker',      desc:'Complete 3 full missions.',          reward:'+10% mission rewards',icon:'📯',  group:'run',
    check:p=>(p.completedMissions||0)>=3,
    apply:g=>{ /* mission-reward bonus */ },
    progress:p=>({current:p.completedMissions||0, target:3}) },
  { id:'Mission5',     name:'Legendary Operator',  desc:'Complete 5 full missions.',          reward:'+15% all bonuses',    icon:'👑',  group:'run',
    check:p=>(p.completedMissions||0)>=5,
    apply:g=>{ /* all-bonuses multiplier */ },
    progress:p=>({current:p.completedMissions||0, target:5}) },

  // ── 💎 RESOURCE ─────────────────────────────────────────────────────────
  { id:'Resources1000',   name:'Resource Hoarder',   desc:'Collect 1000 total resources.',      reward:'+5% pickup radius',   icon:'📦', group:'resource',
    check:p=>(p.statistics.totalResourcesCollected||0)>=1000,
    apply:g=>{ g.player.pickupMul*=1.05; },
    progress:p=>({current:p.statistics.totalResourcesCollected||0, target:1000}) },
  { id:'Resources5000',   name:'Supply Lord',        desc:'Collect 5000 total resources.',      reward:'+8% mining speed',    icon:'🏗️', group:'resource',
    check:p=>(p.statistics.totalResourcesCollected||0)>=5000,
    apply:g=>{ g.player.mineMul*=1.08; },
    progress:p=>({current:p.statistics.totalResourcesCollected||0, target:5000}) },
  { id:'Resources10000',  name:'Resource Tycoon',    desc:'Collect 10000 total resources.',     reward:'+12% all resource gain',icon:'💼',group:'resource',
    check:p=>(p.statistics.totalResourcesCollected||0)>=10000,
    apply:g=>{ /* all-resource gain multiplier */ },
    progress:p=>({current:p.statistics.totalResourcesCollected||0, target:10000}) },
  { id:'Upgrades5',       name:'Upgrade Collector',  desc:'Buy 5 permanent upgrade levels.',    reward:'+5% HP',              icon:'🔧', group:'resource',
    check:p=>(p.statistics.totalUpgradesBought||0)>=5,
    apply:g=>{ const b=Math.round(g.player.maxHp*0.05); g.player.maxHp+=b; g.player.hp+=b; },
    progress:p=>({current:p.statistics.totalUpgradesBought||0, target:5}) },
  { id:'Upgrades15',      name:'Upgrade Master',     desc:'Buy 15 permanent upgrade levels.',   reward:'+10% damage',         icon:'⚙️', group:'resource',
    check:p=>(p.statistics.totalUpgradesBought||0)>=15,
    apply:g=>{ g.player.damageMul*=1.10; },
    progress:p=>({current:p.statistics.totalUpgradesBought||0, target:15}) },

  // ── 🎯 CLASS-SPECIFIC ───────────────────────────────────────────────────
  { id:'ClassBulwark',      name:'Bulwark Veteran',      desc:'Complete 10 runs as Bulwark.',     reward:'+5% max HP',          icon:'🛡️', group:'class',
    check:p=>((p.statistics.classRuns||{}).bulwark||0)>=10,
    apply:g=>{ const b=Math.round(g.player.maxHp*0.05); g.player.maxHp+=b; g.player.hp+=b; },
    progress:p=>({current:(p.statistics.classRuns||{}).bulwark||0, target:10}) },
  { id:'ClassPathfinder',   name:'Pathfinder Veteran',   desc:'Complete 10 runs as Pathfinder.',  reward:'+5% movement speed',  icon:'💨', group:'class',
    check:p=>((p.statistics.classRuns||{}).pathfinder||0)>=10,
    apply:g=>{ g.player.speedMul*=1.05; },
    progress:p=>({current:(p.statistics.classRuns||{}).pathfinder||0, target:10}) },
  { id:'ClassBorecaster',   name:'Borecaster Veteran',   desc:'Complete 10 runs as Borecaster.',  reward:'+5% mining speed',    icon:'⛏️', group:'class',
    check:p=>((p.statistics.classRuns||{}).borecaster||0)>=10,
    apply:g=>{ g.player.mineMul*=1.05; },
    progress:p=>({current:(p.statistics.classRuns||{}).borecaster||0, target:10}) }
];

function defaultMilestones(){
  const result = {};
  for(const m of MILESTONES){
    result[m.id] = { unlocked: false, unlockedAt: null };
  }
  return result;
}

/*
 * Mission Types — Phase 1.2
 *
 * Each mission type defines a primary objective, a reward modifier, and
 * hooks for tracking progress.  The player picks one mission type before
 * selecting their operator class at run start.
 *
 * Structure:
 *   id              — unique key (stored in g.missionType)
 *   name            — display name
 *   icon            — emoji for UI
 *   description     — short flavour text for the selection card
 *   rewardModifier  — reward multiplier applied at bankRunRewards()
 *   generateObjectives — function(profile, g) => array of objective objects
 *   track           — function(g, dt) => void; called each update frame
 *   isComplete      — function(g) => boolean
 */
const MISSION_TYPES = [
  {
    id:'hunt',
    name:'Hunt',
    icon:'🗡️',
    description:'Eliminate a set number of Hollowborn. Combat-focused — mining is optional.',
    rewardModifier:1.15,
    generateObjectives:(profile,g)=>{
      const diff=missionDifficulty(g.missionIndex||profile.missionIndex);
      const baseTarget=30 + (g.missionIndex||1)*5;
      const target=Math.floor(baseTarget*diff.objectiveMultiplier);
      const rewardLabel=`+${Math.round((1.15-1)*100)}% reward`;
      return [{ id:'hunt_kills', type:'hunt',
        displayName:`🗡️ Eliminate ${target} enemies [${rewardLabel}]`,
        targetAmount:target, currentAmount:0, completed:false }];
    },
    track:(g,dt)=>{},
    isComplete:g=>{ const o=g.objectives.find(o=>o.id==='hunt_kills'); return o ? o.completed : false; },
    bonusObjectives:[
      { id:'bonus_extra_ore', desc:'Mine 20 extra ore', reward:{ gild:5 }, check:g=>g.runStats.blocksMined > (g.objectives.find(o=>o.type==='mineBlocks')?.targetAmount || 0) + 20 },
      { id:'bonus_extra_kills', desc:'Kill 10 extra enemies', reward:{ voltarite:2 }, check:g=>g.kills > (g.objectives.find(o=>o.id==='hunt_kills')?.targetAmount || 0) + 10 },
      { id:'bonus_speed_run', desc:'Complete in under 5 minutes', reward:{ aetherQuartz:1 }, check:g=>g.time < 300 },
      { id:'bonus_echo_collector', desc:'Collect 50 Echo Shards', reward:{ echo:50 }, check:g=>g.objectiveEchoCollected >= 50 }
    ]
  },
  {
    id:'survey',
    name:'Survey',
    icon:'🔍',
    description:'Explore and reveal cave tiles. Move through uncharted tunnels to complete the survey.',
    rewardModifier:1.10,
    generateObjectives:(profile,g)=>{
      const diff=missionDifficulty(g.missionIndex||profile.missionIndex);
      const totalTiles=MAP_W*MAP_H;
      const pctTarget=Math.min(0.25 + (g.missionIndex||1)*0.03, 0.50);
      const target=Math.floor(totalTiles*pctTarget*diff.objectiveMultiplier);
      const rewardLabel=`+${Math.round((1.10-1)*100)}% reward`;
      return [{ id:'survey_tiles', type:'survey',
        displayName:`🔍 Explore ${target} tiles [${rewardLabel}]`,
        targetAmount:target, currentAmount:0, completed:false }];
    },
    track:(g,dt)=>{
      if(!g._tilesRevealed) g._tilesRevealed=new Set();
      if(!g._tilesRevealedCount) g._tilesRevealedCount=0;
      const [tx,ty]=worldToTile(g.player.x,g.player.y);
      const key=tx+','+ty;
      if(!g._tilesRevealed.has(key)){
        g._tilesRevealed.add(key);
        g._tilesRevealedCount++;
        const o=g.objectives.find(o=>o.id==='survey_tiles');
        if(o && !o.completed){
          o.currentAmount=Math.min(o.currentAmount+1,o.targetAmount);
          if(o.currentAmount>=o.targetAmount){
            o.completed=true;
            if(typeof log==='function') log(g,`${o.displayName} complete.`);
            if(typeof sfx==='function') sfx('level',0.75);
            if(g.runStats) g.runStats.objectivesCompleted=(g.runStats.objectivesCompleted||0)+1;
          }
        }
      }
    },
    isComplete:g=>{ const o=g.objectives.find(o=>o.id==='survey_tiles'); return o ? o.completed : false; },
    bonusObjectives:[
      { id:'bonus_extra_ore', desc:'Mine 20 extra ore', reward:{ gild:5 }, check:g=>g.runStats.blocksMined > (g.objectives.find(o=>o.type==='mineBlocks')?.targetAmount || 0) + 20 },
      { id:'bonus_extra_kills', desc:'Kill 10 extra enemies', reward:{ voltarite:2 }, check:g=>g.kills > (g.objectives.find(o=>o.id==='hunt_kills')?.targetAmount || 0) + 10 },
      { id:'bonus_speed_run', desc:'Complete in under 5 minutes', reward:{ aetherQuartz:1 }, check:g=>g.time < 300 },
      { id:'bonus_echo_collector', desc:'Collect 50 Echo Shards', reward:{ echo:50 }, check:g=>g.objectiveEchoCollected >= 50 }
    ]
  },
  {
    id:'harvest',
    name:'Harvest',
    icon:'⛏️',
    description:'Extract a quota of specific minerals. Enemies escalate faster — prioritise mining.',
    rewardModifier:1.20,
    generateObjectives:(profile,g)=>{
      const diff=missionDifficulty(g.missionIndex||profile.missionIndex);
      const rewardLabel=`+${Math.round((1.20-1)*100)}% reward`;
      const pool=['voltarite','echo','ferriteBark','luminaSpores','crysalith','emberglass'];
      const secondRes=pool[(g.missionIndex||1 + g.runIndex||1) % pool.length];
      const mineral2=MINERALS[secondRes];
      const target1=Math.floor(40*diff.objectiveMultiplier);
      const target2=Math.floor((secondRes==='aetherQuartz'?4:12)*diff.objectiveMultiplier);
      return [
        { id:'harvest_gild', type:'harvest', resourceId:'gild',
          displayName:`⛏️ Collect ${target1} Gild Shards [${rewardLabel}]`,
          targetAmount:target1, currentAmount:0, completed:false },
        { id:'harvest_'+secondRes, type:'harvest', resourceId:secondRes,
          displayName:`⛏️ Collect ${target2} ${mineral2.displayName} [${rewardLabel}]`,
          targetAmount:target2, currentAmount:0, completed:false }
      ];
    },
    track:(g,dt)=>{},
    isComplete:g=>g.objectives.filter(o=>o.type==='harvest').every(o=>o.completed),
    bonusObjectives:[
      { id:'bonus_extra_ore', desc:'Mine 20 extra ore', reward:{ gild:5 }, check:g=>g.runStats.blocksMined > (g.objectives.find(o=>o.type==='mineBlocks')?.targetAmount || 0) + 20 },
      { id:'bonus_extra_kills', desc:'Kill 10 extra enemies', reward:{ voltarite:2 }, check:g=>g.kills > (g.objectives.find(o=>o.id==='hunt_kills')?.targetAmount || 0) + 10 },
      { id:'bonus_speed_run', desc:'Complete in under 5 minutes', reward:{ aetherQuartz:1 }, check:g=>g.time < 300 },
      { id:'bonus_echo_collector', desc:'Collect 50 Echo Shards', reward:{ echo:50 }, check:g=>g.objectiveEchoCollected >= 50 }
    ]
  },
  {
    id:'holdout',
    name:'Holdout',
    icon:'🛡️',
    description:'Survive a set duration. Endless waves of enemies pressure your position.',
    rewardModifier:1.25,
    generateObjectives:(profile,g)=>{
      const diff=missionDifficulty(g.missionIndex||profile.missionIndex);
      const baseTime=120 + (g.missionIndex||1)*15;
      const target=Math.floor(baseTime*diff.objectiveMultiplier);
      const rewardLabel=`+${Math.round((1.25-1)*100)}% reward`;
      return [{ id:'holdout_timer', type:'holdout',
        displayName:`🛡️ Survive ${target}s [${rewardLabel}]`,
        targetAmount:target, currentAmount:0, completed:false }];
    },
    track:(g,dt)=>{
      const o=g.objectives.find(o=>o.id==='holdout_timer');
      if(!o || o.completed) return;
      o.currentAmount=Math.min(o.currentAmount+dt,o.targetAmount);
      if(o.currentAmount>=o.targetAmount && !o.completed){
        o.completed=true;
        if(typeof log==='function') log(g,`${o.displayName} complete.`);
        if(typeof sfx==='function') sfx('level',0.75);
        if(g.runStats) g.runStats.objectivesCompleted=(g.runStats.objectivesCompleted||0)+1;
      }
    },
    isComplete:g=>{ const o=g.objectives.find(o=>o.id==='holdout_timer'); return o ? o.completed : false; },
    bonusObjectives:[
      { id:'bonus_extra_ore', desc:'Mine 20 extra ore', reward:{ gild:5 }, check:g=>g.runStats.blocksMined > (g.objectives.find(o=>o.type==='mineBlocks')?.targetAmount || 0) + 20 },
      { id:'bonus_extra_kills', desc:'Kill 10 extra enemies', reward:{ voltarite:2 }, check:g=>g.kills > (g.objectives.find(o=>o.id==='hunt_kills')?.targetAmount || 0) + 10 },
      { id:'bonus_speed_run', desc:'Complete in under 5 minutes', reward:{ aetherQuartz:1 }, check:g=>g.time < 300 },
      { id:'bonus_echo_collector', desc:'Collect 50 Echo Shards', reward:{ echo:50 }, check:g=>g.objectiveEchoCollected >= 50 }
    ]
  }
];

// Track the mission type selected by the player for the next run.
let selectedMissionType = MISSION_TYPES[0];

const PERMANENT_UPGRADES = [
  { id:'maxHealth', category:'Player Core', name:'Reinforced Suit', desc:'+5% max HP per level.', next:'Another +5% max HP.', ore:'ferronRoot', max:25 },
  { id:'armour', category:'Player Core', name:'Impact Weave', desc:'Reduces contact damage by 2% per level.', next:'Another -2% contact damage.', ore:'ferronRoot', max:20 },
  { id:'moveSpeed', category:'Player Core', name:'Vector Servos', desc:'+2.5% movement speed per level.', next:'Another +2.5% movement speed.', ore:'lumicite', max:20 },
  { id:'miningSpeed', category:'Mining', name:'Bore Calibration', desc:'+4% mining speed per level.', next:'Another +4% mining speed.', ore:'echoQuartz', max:20 },
  { id:'weaponDamage', category:'Weapons', name:'Weapon Harmonics', desc:'+3% weapon damage per level.', next:'Another +3% weapon damage.', ore:'umbralAlloy', max:25 },
  { id:'fireRate', category:'Weapons', name:'Trigger Relays', desc:'+2% fire rate per level.', next:'Another +2% fire rate.', ore:'voltarite', max:20 },
  { id:'pickupRadius', category:'Utility', name:'Resonance Net', desc:'+5% pickup radius per level.', next:'Another +5% pickup range.', ore:'echoQuartz', max:15 },
  { id:'droneEfficiency', category:'Drones', name:'Drone Uplinks', desc:'+4% drone damage and speed per level.', next:'Another +4% drone efficiency.', ore:'umbralAlloy', max:15 },
  { id:'trapEffectiveness', category:'Character-Specific', name:'Trap Matrices', desc:'+5% trap damage and radius per level.', next:'Another +5% trap output.', ore:'pyroclastCore', max:15 },
  { id:'arcDamage', category:'Weapons', name:'Arc Capacitors', desc:'+5% electric/arc damage per level.', next:'Another +5% arc damage.', ore:'voltarite', max:15 },
];

/*
 * Upgrade Synergies — Phase 2.1
 *
 * Synergies grant combo bonuses when a player acquires all required upgrades
 * from UPGRADE_POOL during a single run. Once unlocked, they persist via the
 * profile's unlockedSynergies array and are re-applied at run start.
 *
 * Each entry:
 *   id              — unique string key
 *   name            — display name
 *   icon            — emoji/icon for the card
 *   description     — flavour text
 *   bonus           — short bonus description shown on the card
 *   requiredUpgrades — array of UPGRADE_POOL entry names that must be owned
 *   check           — function(g) => boolean; returns true if all requirements met
 *   apply           — function(g) => void; applies the synergy bonus to game state
 */
const SYNERGIES = [
  {
    id:'droneCommander',
    name:'Drone Commander',
    icon:'🛸',
    description:'Warden Drone swarm coordination protocol.',
    bonus:'Drones fire 30% faster and deal 25% more damage.',
    requiredUpgrades:['Warden Drone Bay','Drone Bay Expansion','Drone Targeting AI'],
    check:g=>g.collectedUpgrades && ['Warden Drone Bay','Drone Bay Expansion','Drone Targeting AI'].every(n=>g.collectedUpgrades.includes(n)),
    apply:g=>{
      g.player.droneFireRateMul*=1.30;
      g.player.droneDamageMul*=1.25;
    }
  },
  {
    id:'miningMagnate',
    name:'Mining Magnate',
    icon:'⛏️',
    description:'Industrial-grade mining optimisation.',
    bonus:'Mining speed +50%, heat generation -40%, pickup range +50%.',
    requiredUpgrades:['Tungsten Bore Bit','Cryo Coolant','Resonance Magnet'],
    check:g=>g.collectedUpgrades && ['Tungsten Bore Bit','Cryo Coolant','Resonance Magnet'].every(n=>g.collectedUpgrades.includes(n)),
    apply:g=>{
      g.player.mineMul*=1.50;
      g.player.heatEfficiency*=0.60;
      g.player.pickupMul*=1.50;
    }
  },
  {
    id:'arcOverload',
    name:'Arc Overload',
    icon:'🌩️',
    description:'Arc energy channelled to devastating effect.',
    bonus:'Chain lightning jumps to 2 extra targets and deals 35% more damage.',
    requiredUpgrades:['Arc Connection','Storm Lattice','Arc Capacitors'],
    check:g=>{
      const hasArcConn=g.collectedUpgrades && g.collectedUpgrades.includes('Arc Connection');
      const hasStorm=g.collectedUpgrades && g.collectedUpgrades.includes('Storm Lattice');
      // Arc Capacitors is a permanent upgrade — check profile level
      const hasCaps=saveProfile && (saveProfile.permanentUpgrades.arcDamage||0)>0;
      return hasArcConn && hasStorm && hasCaps;
    },
    apply:g=>{
      g.arcConnection.maxTargets=(g.arcConnection.maxTargets||1)+2;
      g.player.arcDamageMul=(g.player.arcDamageMul||1)*1.35;
    }
  },
  {
    id:'bulwarkArsenal',
    name:'Bulwark Arsenal',
    icon:'🚀',
    description:'Full Hammerfall missile suite optimised for destruction.',
    bonus:'Missiles fire 30% faster, travel 40% faster, deal 20% more damage.',
    requiredUpgrades:['Hammerfall Salvo','Warhead Yield','Hot-Burn Motors'],
    check:g=>g.collectedUpgrades && ['Hammerfall Salvo','Warhead Yield','Hot-Burn Motors'].every(n=>g.collectedUpgrades.includes(n)),
    apply:g=>{
      g.player.fireRateMul*=1.30;
      // Missile speed handled via upgradeHammerfall(g,'speed') equivalent
      // We apply a multiplicative bonus here that systems check
      g.player.missileSpeedMul=(g.player.missileSpeedMul||1)*1.40;
      g.player.damageMul*=1.20;
    }
  },
  {
    id:'borecasterDemolition',
    name:'Borecaster Demolition',
    icon:'💣',
    description:'Advanced Borecaster explosive payload engineering.',
    bonus:'Bombs deal 40% more damage, have 50% larger radius, throw 2 extra bombs.',
    requiredUpgrades:['Seismic Charge','Extra Charges','Blast Radius'],
    check:g=>{
      // The Borecaster-specific Seismic Charge (borecasterBomb) is the required one
      const hasBomb=g.weapons && g.weapons.some(w=>w.id==='borecasterBomb');
      const hasExtra=g.collectedUpgrades && g.collectedUpgrades.includes('Extra Charges');
      const hasRadius=g.collectedUpgrades && g.collectedUpgrades.includes('Blast Radius');
      return hasBomb && hasExtra && hasRadius;
    },
    apply:g=>{
      g.player.trapDamageMul=(g.player.trapDamageMul||1)*1.40;
      g.player.trapRadiusMul=(g.player.trapRadiusMul||1)*1.50;
      g.player.extraBombs=(g.player.extraBombs||0)+2;
    }
  },
  {
    id:'pathfinderTactics',
    name:'Pathfinder Tactics',
    icon:'🪤',
    description:'Advanced reconnaissance and trap warfare integration.',
    bonus:'Traps deal 60% more damage, kills restore 15 HP, mouse targeting always active.',
    requiredUpgrades:['Trap Payload','Field Reclaimer','Targeting Cursor'],
    check:g=>g.collectedUpgrades && ['Trap Payload','Field Reclaimer','Targeting Cursor'].every(n=>g.collectedUpgrades.includes(n)),
    apply:g=>{
      g.player.trapDamageMul*=1.60;
      g.player.vampire=(g.player.vampire||0)+15;
      g.player.mouseTargeting=true;
    }
  },
  {
    id:'vectorSpecialist',
    name:'Vector Specialist',
    icon:'✳️',
    description:'Mastery of Vector Burst directional weapon technology.',
    bonus:'Vector Burst fires 10 directions, deals 50% more damage, 40% faster projectiles.',
    requiredUpgrades:['Vector Burst','Splitfire Array','Vector Focusing','Vector Accelerator','Vector Relay'],
    check:g=>g.collectedUpgrades && ['Vector Burst','Splitfire Array','Vector Focusing','Vector Accelerator','Vector Relay'].every(n=>g.collectedUpgrades.includes(n)),
    apply:g=>{
      // Boost directions (base 5 + splitfire adds, we set to 10)
      g.player.vectorBurstCount=(g.player.vectorBurstCount||5)+5;
      g.player.damageMul*=1.50;
      g.player.projectileSpeedMul=(g.player.projectileSpeedMul||1)*1.40;
    }
  },
  {
    id:'sifterMaster',
    name:'Sifter Master',
    icon:'🔍',
    description:'Peak Sifter Drone automation and efficiency.',
    bonus:'Sifter drones collect Echo Shards 100% faster and have 50% larger search radius.',
    requiredUpgrades:['Sifter Drone','Sifter Optics','Sifter Turbo'],
    check:g=>g.collectedUpgrades && ['Sifter Drone','Sifter Optics','Sifter Turbo'].every(n=>g.collectedUpgrades.includes(n)),
    apply:g=>{
      g.player.sweeperCollectMul=(g.player.sweeperCollectMul||1)*2.0;
      g.player.sweeperRangeMul=(g.player.sweeperRangeMul||1)*1.50;
    }
  }
];

function defaultResources(){
  return { gildShards:0, voltarite:0, echoQuartz:0, ferronRoot:0, lumicite:0, pyroclastCore:0, umbralAlloy:0, ferriteBark:0, luminaSpores:0, aetherQuartz:0, crysalith:0, emberglass:0 };
}

function defaultPermanentUpgrades(){
  const result={};
  for(const up of PERMANENT_UPGRADES) result[up.id]=0;
  return result;
}

function createDefaultProfile(){
  const stamp=new Date().toISOString();
  return {
    version:1,
    profileName:'Default Profile',
    createdAt:stamp,
    lastPlayedAt:stamp,
    missionIndex:1,
    runIndex:1,
    completedMissions:0,
    resources:defaultResources(),
    permanentUpgrades:defaultPermanentUpgrades(),
    milestones:defaultMilestones(),
    unlockedSynergies:[],
    statistics:{
      totalRunsStarted:0,
      totalRunsCompleted:0,
      totalMissionsCompleted:0,
      totalEnemiesKilled:0,
      totalElitesKilled:0,
      totalBossesKilled:0,
      totalOreMined:0,
      totalGildMined:0,
      totalEchoMined:0,
      totalVoltariteMined:0,
      totalResourcesCollected:0,
      totalUpgradesBought:0,
      maxLevelReached:0,
      classRuns:{ bulwark:0, pathfinder:0, borecaster:0 }
    }
  };
}

function normalizeProfile(profile){
  const base=createDefaultProfile();
  const merged = {
    ...base,
    ...profile,
    resources:{...base.resources,...(profile?.resources || {})},
    permanentUpgrades:{...base.permanentUpgrades,...(profile?.permanentUpgrades || {})},
    milestones:{...base.milestones,...(profile?.milestones || {})},
    unlockedSynergies:profile?.unlockedSynergies || [],
    permanentBonuses:profile?.permanentBonuses || {},
    statistics:{...base.statistics,...(profile?.statistics || {})}
  };
  // Merge classRuns sub-object safely.
  if(profile?.statistics?.classRuns){
    merged.statistics.classRuns = {
      ...base.statistics.classRuns,
      ...profile.statistics.classRuns
    };
  }
  return merged;
}

function hasSaveData(){
  return !!localStorage.getItem(SAVE_KEY);
}

function loadSave(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return null;
    return normalizeProfile(JSON.parse(raw));
  }catch(err){
    console.warn('Could not load Echo Vein save.', err);
    return null;
  }
}

function saveGame(){
  if(!saveProfile) return;
  saveProfile.lastPlayedAt=new Date().toISOString();
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveProfile));
}

function newGame(){
  saveProfile=createDefaultProfile();
  saveGame();
  showMainMenu();
}

function deleteSave(){
  localStorage.removeItem(SAVE_KEY);
  saveProfile=createDefaultProfile();
  showMainMenu();
}

function resourceLabel(id){
  return ({
    gildShards:'Gild Shards',
    voltarite:'Voltarite',
    echoQuartz:'Echo Quartz',
    ferronRoot:'Ferron Root',
    lumicite:'Lumicite',
    pyroclastCore:'Pyroclast Core',
    umbralAlloy:'Umbral Alloy',
    ferriteBark:'Ferrite Bark',
    luminaSpores:'Lumina Spores',
    aetherQuartz:'Aether Quartz',
    crysalith:'Crysalith',
    emberglass:'Emberglass',
    gild:'Gild Shards',
    echo:'Echo Shards'
  })[id] || MINERALS[id]?.displayName || id;
}

function missionDifficulty(missionIndex){
  const m=Math.max(1,missionIndex)-1;
  return {
    enemyHealthMultiplier:1+m*0.12,
    enemyDamageMultiplier:1+m*0.08,
    enemySpawnRateMultiplier:1+m*0.10,
    bossHealthMultiplier:1+m*0.18,
    bossDamageMultiplier:1+m*0.12,
    objectiveMultiplier:1+m*0.16,
    rewardMultiplier:1+m*0.15,
  };
}

/*
 * Resource Conversion — Phase 1.4
 *
 * Allows players to convert abundant resources into scarce ones, providing
 * a resource sink for excess materials. Conversion rates are defined in the
 * rates lookup table. Supports Gild → Voltarite, Voltarite → Aether Quartz,
 * Ferrite Bark → Aether Quartz, and Gild → permanent HP bonus.
 */
function convertResources(fromType, toType, amount){
  if(!saveProfile) return false;
  const rates = {
    gild_to_voltarite: { from:'gildShards', to:'voltarite', rate:50 },
    voltarite_to_rare: { from:'voltarite', to:'aetherQuartz', rate:5 },
    ferrite_to_aether: { from:'ferriteBark', to:'aetherQuartz', rate:10 },
    gild_to_hp: { from:'gildShards', to:'maxHp', rate:100 }
  };
  const key = `${fromType}_to_${toType}`;
  const rule = rates[key];
  if(!rule) return false;
  const cost = rule.rate * amount;
  if((saveProfile.resources[rule.from] || 0) < cost) return false;
  saveProfile.resources[rule.from] -= cost;
  if(rule.to === 'maxHp'){
    // Apply permanent HP bonus (once per mission)
    saveProfile.permanentBonuses = saveProfile.permanentBonuses || {};
    saveProfile.permanentBonuses.maxHpBonus = (saveProfile.permanentBonuses.maxHpBonus || 0) + amount;
  } else {
    saveProfile.resources[rule.to] = (saveProfile.resources[rule.to] || 0) + amount;
  }
  saveGame();
  return true;
}

function permanentUpgradeCost(up){
  const level=saveProfile.permanentUpgrades[up.id] || 0;
  return {
    gildShards:Math.floor(50 + level*28 + level*level*4),
    [up.ore]:Math.floor(2 + level*0.85)
  };
}

function canAfford(cost){
  return Object.entries(cost).every(([id,amount])=>(saveProfile.resources[id] || 0)>=amount);
}

function spend(cost){
  for(const [id,amount] of Object.entries(cost)) saveProfile.resources[id]-=amount;
}

function buyPermanentUpgrade(id){
  const up=PERMANENT_UPGRADES.find(item=>item.id===id);
  if(!up) return;
  const level=saveProfile.permanentUpgrades[id] || 0;
  if(level>=up.max) return;
  const cost=permanentUpgradeCost(up);
  if(!canAfford(cost)) return;
  spend(cost);
  saveProfile.permanentUpgrades[id]=level+1;
  saveProfile.statistics.totalUpgradesBought = (saveProfile.statistics.totalUpgradesBought||0) + 1;
  saveGame();
  // Phase 1.1: check upgrade-count milestones.
  if(typeof checkMilestoneOnUpgradeBought === 'function') checkMilestoneOnUpgradeBought(null);
  showUpgradesMenu();
}

function applyPermanentUpgrades(g){
  if(!saveProfile) return;
  const up=saveProfile.permanentUpgrades;
  const p=g.player;
  p.maxHp=Math.round(p.maxHp*(1+(up.maxHealth || 0)*0.05));
  p.hp=p.maxHp;
  p.armourMul=Math.max(0.55,1-(up.armour || 0)*0.02);
  p.speedMul*=1+(up.moveSpeed || 0)*0.025;
  p.mineMul*=1+(up.miningSpeed || 0)*0.04;
  p.damageMul*=1+(up.weaponDamage || 0)*0.03;
  p.fireRateMul*=1+(up.fireRate || 0)*0.02;
  p.pickupMul*=1+(up.pickupRadius || 0)*0.05;
  const drone=1+(up.droneEfficiency || 0)*0.04;
  p.droneDamageMul*=drone; p.droneSpeedMul*=drone;
  const traps=1+(up.trapEffectiveness || 0)*0.05;
  p.trapDamageMul*=traps; p.trapRadiusMul*=traps;
  p.arcDamageMul=1+(up.arcDamage || 0)*0.05;
  // Phase 1.4: Apply permanent HP bonus from resource conversion.
  const hpBonus = (saveProfile.permanentBonuses?.maxHpBonus || 0);
  if(hpBonus > 0){
    p.maxHp = Math.round(p.maxHp + hpBonus);
    p.hp = p.maxHp;
  }
}

/*
 * Apply milestone rewards to the current run's game state.
 * Called once at run start after permanent upgrades are applied.
 * Only applies rewards for unlocked milestones.
 */
function applyMilestoneRewards(g){
  if(!saveProfile || !g) return;
  for(const m of MILESTONES){
    const entry = saveProfile.milestones[m.id];
    if(entry && entry.unlocked && typeof m.apply === 'function'){
      m.apply(g);
    }
  }
}

/*
 * Apply synergy rewards to the current run's game state.
 * Called once at run start after permanent upgrades and milestone rewards.
 * Re-applies the apply() function for every unlocked synergy in the profile.
 */
function applySynergyRewards(g){
  if(!saveProfile || !g || !saveProfile.unlockedSynergies) return;
  for(const synergyId of saveProfile.unlockedSynergies){
    const s = SYNERGIES.find(syn => syn.id === synergyId);
    if(s && typeof s.apply === 'function'){
      s.apply(g);
    }
  }
}

/*
 * Check and unlock synergies — Phase 2.1
 *
 * Called after each upgrade is applied during a run. Checks every synergy
 * whose check(g) now returns true, awards it, logs the unlock, and shows
 * floating text. Prevents duplicate unlocks by checking g.unlockedSynergies.
 */
function checkSynergies(g){
  if(!g || !saveProfile) return;
  if(!g.unlockedSynergies) g.unlockedSynergies = [];
  if(!g.collectedUpgrades) g.collectedUpgrades = [];

  for(const syn of SYNERGIES){
    // Skip if already unlocked this run
    if(g.unlockedSynergies.includes(syn.id)) continue;
    // Skip if already unlocked in profile (persistent)
    if(saveProfile.unlockedSynergies && saveProfile.unlockedSynergies.includes(syn.id)) continue;
    // Check if all requirements are met
    if(syn.check(g)){
      // Unlock it — apply the bonus immediately and mark it
      syn.apply(g);
      g.unlockedSynergies.push(syn.id);
      // Persist to profile so it applies to future runs too
      saveProfile.unlockedSynergies = saveProfile.unlockedSynergies || [];
      if(!saveProfile.unlockedSynergies.includes(syn.id)){
        saveProfile.unlockedSynergies.push(syn.id);
        saveGame();
      }
      // Show floating unlock text
      const msg = `⚡ SYNERGY UNLOCKED: ${syn.name}`;
      if(typeof log === 'function') log(g, msg);
      if(typeof floating === 'function' && g){
        floating(g, g.player.x, g.player.y - 60, msg, '#b46bff');
      }
      // Flash shake for emphasis
      if(typeof shake !== 'undefined') shake = Math.max(shake, 6);
    }
  }
}

/*
 * Award a milestone: mark it as unlocked, save the timestamp, persist to
 * localStorage, and log the event to the in-game log.
 * Returns true if the milestone was newly unlocked, false if already awarded.
 */
function awardMilestone(g, milestoneId){
  if(!saveProfile) return false;
  const m = MILESTONES.find(m => m.id === milestoneId);
  if(!m) return false;
  const entry = saveProfile.milestones[milestoneId];
  if(!entry || entry.unlocked) return false;
  entry.unlocked = true;
  entry.unlockedAt = new Date().toISOString();
  saveGame();
  const msg = `Milestone unlocked: ${m.name} — ${m.reward}`;
  if(g && typeof log === 'function') log(g, msg);
  if(typeof floating === 'function' && g){
    floating(g, g.player.x, g.player.y - 40, `🏆 ${m.name}`, '#ffcc4d');
  }
  return true;
}

/*
 * Check-and-award wrappers for event hook points.
 *
 * Each function checks all milestones whose condition may have been met by
 * the triggering event.  Safe to call every frame — the internal unlocked
 * check on each milestone is a fast boolean lookup.
 *
 * When a milestone check matches, awardMilestone() persists the unlock,
 * saves the profile, logs to the in-game log, and shows a floating trophy
 * text above the player.
 */

/* Called from killEnemy() — checks kill-count and elite-kill milestones. */
function checkMilestoneOnKill(g){
  if(!saveProfile) return;
  const s=saveProfile.statistics;
  // Kill-count milestones (FirstKill, Kill10, Kill50, Kill100, Kill250, Kill500)
  const killIds=['FirstKill','Kill10','Kill50','Kill100','Kill250','Kill500'];
  for(const id of killIds){
    const m=MILESTONES.find(x=>x.id===id);
    if(!m) continue;
    const entry=saveProfile.milestones[id];
    if(entry && !entry.unlocked && m.check(saveProfile)) awardMilestone(g,id);
  }
  // Elite-kill milestones (EliteKill1, EliteKill10)
  if((s.totalElitesKilled||0)>0){
    const eliteIds=['EliteKill1','EliteKill10'];
    for(const id of eliteIds){
      const m=MILESTONES.find(x=>x.id===id);
      if(!m) continue;
      const entry=saveProfile.milestones[id];
      if(entry && !entry.unlocked && m.check(saveProfile)) awardMilestone(g,id);
    }
  }
  // Boss-kill milestone (BossKill1)
  if((s.totalBossesKilled||0)>0){
    const m=MILESTONES.find(x=>x.id==='BossKill1');
    const entry=saveProfile.milestones.BossKill1;
    if(entry && !entry.unlocked && m && m.check(saveProfile)) awardMilestone(g,'BossKill1');
  }
}

/* Called from mineTile() — checks ore-count and per-resource milestones. */
function checkMilestoneOnMine(g){
  if(!saveProfile) return;
  const s=saveProfile.statistics;
  // Generic ore-count milestones (FirstOre, Mine50, Mine200, Mine500, Mine1000)
  const mineIds=['FirstOre','Mine50','Mine200','Mine500','Mine1000'];
  for(const id of mineIds){
    const m=MILESTONES.find(x=>x.id===id);
    if(!m) continue;
    const entry=saveProfile.milestones[id];
    if(entry && !entry.unlocked && m.check(saveProfile)) awardMilestone(g,id);
  }
  // Per-resource milestones
  const resChecks=[{id:'Gild100',stat:s.totalGildMined},
                   {id:'Echo100',stat:s.totalEchoMined},
                   {id:'Voltarite50',stat:s.totalVoltariteMined}];
  for(const rc of resChecks){
    if(!(rc.stat||0)>0) continue;
    const m=MILESTONES.find(x=>x.id===rc.id);
    if(!m) continue;
    const entry=saveProfile.milestones[rc.id];
    if(entry && !entry.unlocked && m.check(saveProfile)) awardMilestone(g,rc.id);
  }
  // Resource-collection milestones (Resources1000/5000/10000)
  if((s.totalResourcesCollected||0)>0){
    const resIds=['Resources1000','Resources5000','Resources10000'];
    for(const id of resIds){
      const m=MILESTONES.find(x=>x.id===id);
      if(!m) continue;
      const entry=saveProfile.milestones[id];
      if(entry && !entry.unlocked && m.check(saveProfile)) awardMilestone(g,id);
    }
  }
}

/* Called from gainXp() — checks level-based milestones. */
function checkMilestoneOnLevelUp(g, newLevel){
  if(!saveProfile) return;
  // Keep track of the highest level reached across all runs.
  if(newLevel > (saveProfile.statistics.maxLevelReached || 0)){
    saveProfile.statistics.maxLevelReached = newLevel;
  }
  // Check ReachLevel5 / ReachLevel10
  const levelIds=['ReachLevel5','ReachLevel10'];
  for(const id of levelIds){
    const m=MILESTONES.find(x=>x.id===id);
    if(!m) continue;
    const entry=saveProfile.milestones[id];
    if(entry && !entry.unlocked && m.check(saveProfile)) awardMilestone(g,id);
  }
}

/* Called from completeRun() — checks run-count and class milestones. */
function checkMilestoneOnRunComplete(g, classId){
  if(!saveProfile) return;
  // Increment class run counter.
  if(classId && saveProfile.statistics.classRuns){
    saveProfile.statistics.classRuns[classId] = (saveProfile.statistics.classRuns[classId] || 0) + 1;
  }
  // Run-count milestones (Run1, Run5, Run15, Run30)
  const runIds=['Run1','Run5','Run15','Run30'];
  for(const id of runIds){
    const m=MILESTONES.find(x=>x.id===id);
    if(!m) continue;
    const entry=saveProfile.milestones[id];
    if(entry && !entry.unlocked && m.check(saveProfile)) awardMilestone(g,id);
  }
  // Class-specific milestones
  const classIds=['ClassBulwark','ClassPathfinder','ClassBorecaster'];
  for(const id of classIds){
    const m=MILESTONES.find(x=>x.id===id);
    if(!m) continue;
    const entry=saveProfile.milestones[id];
    if(entry && !entry.unlocked && m.check(saveProfile)) awardMilestone(g,id);
  }
}

/* Called from completeRun() after mission promotion. */
function checkMilestoneOnMissionComplete(g){
  if(!saveProfile) return;
  const missionIds=['Mission1','Mission3','Mission5'];
  for(const id of missionIds){
    const m=MILESTONES.find(x=>x.id===id);
    if(!m) continue;
    const entry=saveProfile.milestones[id];
    if(entry && !entry.unlocked && m.check(saveProfile)) awardMilestone(g,id);
  }
}

/* Called from buyPermanentUpgrade() after each purchase. */
function checkMilestoneOnUpgradeBought(g){
  if(!saveProfile) return;
  const upgradeIds=['Upgrades5','Upgrades15'];
  for(const id of upgradeIds){
    const m=MILESTONES.find(x=>x.id===id);
    if(!m) continue;
    const entry=saveProfile.milestones[id];
    if(entry && !entry.unlocked && m.check(saveProfile)) awardMilestone(g,id);
  }
}

function currentRunObjectives(){
  const diff=missionDifficulty(saveProfile.missionIndex);
  const run=saveProfile.runIndex;
  const mission=saveProfile.missionIndex;
  const choices=[...MISSION_RESOURCE_IDS];
  const result=[];
  const addResourceObjective=(resourceId,base,perRun)=>{
    const mineral=MINERALS[resourceId];
    const target=Math.floor((base+run*perRun+mission*1.5)*diff.objectiveMultiplier);
    result.push({ id:`collect_${resourceId}`, type:'collectResource', resourceId, displayName:`Collect ${target} ${mineral.displayName}`, targetAmount:target, currentAmount:0, completed:false });
  };
  addResourceObjective('gild',200,5);
  addResourceObjective('echo',100,10);
  // Add one or two rotating ore objectives so the mission is not always Gild/Echo.
  const pool=choices.filter(id=>id!=='gild');
  const first=pool[(mission+run-2)%pool.length];
  addResourceObjective(first, first==='aetherQuartz'?3:8, first==='aetherQuartz'?1:3);
  if(run>=3){
    const second=pool[(mission*2+run)%pool.length];
    if(second!==first) addResourceObjective(second, second==='aetherQuartz'?2:6, second==='aetherQuartz'?1:2);
  }
  return result;
}

function bankRunRewards(g){
  const diff=missionDifficulty(saveProfile.missionIndex);
  const rewardMul=diff.rewardMultiplier;
  // Phase 1.2: apply mission-type reward modifier.
  let missionMul=1;
  if(g && g.missionType){
    const mt=MISSION_TYPES.find(m=>m.id===g.missionType);
    if(mt) missionMul=mt.rewardModifier;
  }
  const resources=saveProfile.resources;
  const runRes=g.resources || {};
  resources.gildShards += Math.floor(((runRes.gild || g.gold || 0) + 20 + saveProfile.runIndex*8)*rewardMul*missionMul);
  resources.voltarite += Math.floor(((runRes.voltarite || g.nitra || 0) + 4)*rewardMul*missionMul);
  resources.echoQuartz += Math.max(1, Math.floor((runRes.echo || g.objectiveEchoCollected || 0)/35*missionMul));
  for(const id of ['ferriteBark','luminaSpores','aetherQuartz','crysalith','emberglass']){
    resources[id]=(resources[id] || 0)+Math.floor((runRes[id] || 0)*rewardMul*missionMul);
  }
  const bonusOre=SPECIAL_ORES[(saveProfile.missionIndex + saveProfile.runIndex - 2) % SPECIAL_ORES.length];
  resources[bonusOre] = (resources[bonusOre] || 0) + 1 + Math.floor(saveProfile.missionIndex/3);
  if(Math.random()<0.35){ const ore=SPECIAL_ORES[randi(0,SPECIAL_ORES.length-1)]; resources[ore]=(resources[ore] || 0)+1; }
}

function completeRun(g){
  if(!saveProfile || g.runResolved) return;
  g.runResolved=true;
  bankRunRewards(g);
  // Phase 1.4: Check bonus objectives after banking rewards.
  const missionTypeObj = g.missionType ? MISSION_TYPES.find(m => m.id === g.missionType) : null;
  if(missionTypeObj && missionTypeObj.bonusObjectives){
    for(const bonus of missionTypeObj.bonusObjectives){
      if(bonus.check(g)){
        for(const [resId, amt] of Object.entries(bonus.reward)){
          // Map resource shorthand IDs to saveProfile resource keys
          const resMap = { gild:'gildShards', voltarite:'voltarite', echo:'echoQuartz', aetherQuartz:'aetherQuartz' };
          const key = resMap[resId] || resId;
          saveProfile.resources[key] = (saveProfile.resources[key] || 0) + amt;
        }
        // Log bonus completion
        if(g.log && Array.isArray(g.log)) g.log.unshift(`✅ Bonus: ${bonus.desc} – rewarded!`);
      }
    }
  }
  saveProfile.statistics.totalRunsCompleted++;
  // totalEnemiesKilled is already tracked in real-time by killEnemy(), so we
  // do not re-add g.kills here to avoid double-counting.
  saveProfile.runIndex++;
  // Phase 1.1: check run-complete milestones (includes class-specific).
  if(typeof checkMilestoneOnRunComplete === 'function') checkMilestoneOnRunComplete(g, g.player?.classId || (g.selectedClass?.id));
  let missionCompleted=false;
  if(saveProfile.runIndex>RUNS_PER_MISSION){
    saveProfile.runIndex=1;
    saveProfile.missionIndex++;
    saveProfile.completedMissions++;
    saveProfile.statistics.totalMissionsCompleted++;
    saveProfile.resources.gildShards += Math.floor(120*missionDifficulty(saveProfile.missionIndex).rewardMultiplier);
    missionCompleted=true;
    // Phase 1.1: check mission-complete milestones.
    if(typeof checkMilestoneOnMissionComplete === 'function') checkMilestoneOnMissionComplete(g);
  }
  saveGame();
  if(typeof showRunStatsScreen==='function') showRunStatsScreen(g,{title:missionCompleted ? 'Mission Complete' : 'Run Extracted', cause:missionCompleted ? 'Mission completed' : 'Extracted'});
  else showRunComplete(g, missionCompleted);
}

function failRun(g,reason){
  if(g.runResolved) return;
  g.runResolved=true;
  g.state='failed';
  sfx('gameover');
  saveGame();
  if(typeof showRunStatsScreen==='function') showRunStatsScreen(g,{title:'Run Failed', cause:reason || 'Failed'});
  else {
    ui.gameOverText.innerHTML=`${reason}<br><br>Unbanked run resources were lost. Your saved mission remains at Mission <b>${saveProfile.missionIndex}</b>, Run <b>${saveProfile.runIndex}</b>.`;
    ui.gameOverOverlay.classList.add('show');
  }
}

function startRunWithClass(clsOrId){
  const cls=typeof clsOrId==='string' ? getClassById(clsOrId) : clsOrId;
  resumeAudio();
  game=makeGame(cls);
  // Phase 1.2: Apply selected mission type.
  if(selectedMissionType){
    game.missionType = selectedMissionType.id;
    // Replace default objectives with mission-specific ones.
    game.objectives = selectedMissionType.generateObjectives(saveProfile, game);
  }
  saveProfile.statistics.totalRunsStarted++;
  // Phase 2.1: initialise synergy tracking arrays
  game.collectedUpgrades = [];
  game.unlockedSynergies = [];
  // Apply milestone rewards first, then synergy rewards
  applyMilestoneRewards(game);
  applySynergyRewards(game);
  saveGame();
  appState='RUN_ACTIVE';
  sfx('start');
  paused=false; awaitingUpgrade=false;
  hideAllOverlays();
  updateUI(game);
}

function hideAllOverlays(){
  ui.startOverlay.classList.remove('show');
  ui.gameOverOverlay.classList.remove('show');
  ui.upgradeOverlay.classList.remove('show');
  document.getElementById('runStatsOverlay')?.classList.remove('show');
}

function clearMenu(){
  ui.startOverlay.classList.add('show');
  ui.gameOverOverlay.classList.remove('show');
  ui.upgradeOverlay.classList.remove('show');
  document.getElementById('runStatsOverlay')?.classList.remove('show');
  ui.classCards.innerHTML='';
  ui.menuButtons.innerHTML='';
  ui.menuContent.innerHTML='';
  ui.menuMeta.innerHTML='';
}

function setMenu(title,text){
  clearMenu();
  ui.startTitle.textContent=title;
  ui.startText.textContent=text;
}

function addMenuButton(label,handler){
  const btn=document.createElement('button');
  btn.textContent=label;
  btn.onclick=handler;
  ui.menuButtons.appendChild(btn);
  return btn;
}

function renderResourceLine(){
  return Object.entries(saveProfile.resources)
    .map(([id,value])=>`<span><b>${resourceLabel(id)}</b> ${value}</span>`)
    .join('');
}

function showSaveSelect(){
  appState='SAVE_SELECT';
  const profile=loadSave();
  setMenu('Saved Games', 'Continue a saved Hollowshift profile or start clean.');
  if(profile){
    ui.menuMeta.innerHTML=`<div class="saveCard"><b>${profile.profileName}</b><span>Last played ${new Date(profile.lastPlayedAt).toLocaleString()}</span><span>Mission ${profile.missionIndex}, Run ${profile.runIndex} of ${RUNS_PER_MISSION}</span><span>Total resources ${Object.values(profile.resources).reduce((a,b)=>a+b,0)}</span></div>`;
  }
  addMenuButton('Continue Latest Save',()=>{ saveProfile=profile || createDefaultProfile(); showMainMenu(); });
  addMenuButton('New Game',newGame);
  addMenuButton('Delete Save / Reset Progress',deleteSave);
}

function showMainMenu(){
  appState='MAIN_MENU';
  if(!saveProfile) saveProfile=createDefaultProfile();
  saveGame();
  game=null;
  setMenu('Echo Vein', 'Prepare the next descent, spend permanent resources, or review your Hollowshift profile.');
  ui.menuMeta.innerHTML=`<div class="menuStats"><span>Mission <b>${saveProfile.missionIndex}</b></span><span>Run <b>${saveProfile.runIndex}/${RUNS_PER_MISSION}</b></span><span>Completed Missions <b>${saveProfile.completedMissions}</b></span></div><div class="resourceStrip">${renderResourceLine()}</div>`;
  addMenuButton('Play',showMissionSelect);
  addMenuButton('Upgrades',showUpgradesMenu);
  addMenuButton('Synergies',showSynergiesMenu);
  addMenuButton('Gears',()=>showPlaceholderMenu('Gears','Gears feature coming later.'));
  addMenuButton('Milestones',showMilestonesMenu);
  addMenuButton('Settings',showSettingsMenu);
  addMenuButton('Credits',showCreditsMenu);
}

/*
 * Mission Select — Phase 1.2
 * Shows available mission types. Player picks one, then proceeds to class select.
 */
function showMissionSelect(){
  appState='MISSION_SELECT';
  setMenu('Choose Mission Type', `Mission ${saveProfile.missionIndex}, Run ${saveProfile.runIndex} of ${RUNS_PER_MISSION}. Each mission type changes the primary objective and reward.`);
  if(!saveProfile) saveProfile=createDefaultProfile();

  const grid=document.createElement('div');
  grid.className='missionSelectGrid';

  for(const mt of MISSION_TYPES){
    const card=document.createElement('div');
    card.className='missionSelectCard';
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');

    const iconEl=document.createElement('div');
    iconEl.className='missionSelectIcon';
    iconEl.textContent=mt.icon;
    card.appendChild(iconEl);

    const info=document.createElement('div');
    info.className='missionSelectInfo';

    const nameEl=document.createElement('div');
    nameEl.className='missionSelectName';
    nameEl.textContent=mt.name;
    info.appendChild(nameEl);

    const descEl=document.createElement('div');
    descEl.className='missionSelectDesc';
    descEl.textContent=mt.description;
    info.appendChild(descEl);

    const rewardEl=document.createElement('div');
    rewardEl.className='missionSelectReward';
    rewardEl.textContent=`Reward modifier: +${Math.round((mt.rewardModifier-1)*100)}%`;
    info.appendChild(rewardEl);

    card.appendChild(info);
    card.onclick=()=>{
      selectedMissionType=mt;
      showClassSelect();
    };
    card.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); card.onclick(); }};
    grid.appendChild(card);
  }

  ui.menuContent.appendChild(grid);
  addMenuButton('Back',showMainMenu);
}

function showClassSelect(){
  appState='MISSION_SELECT';
  const mtLabel = selectedMissionType ? `${selectedMissionType.icon} ${selectedMissionType.name} mission` : 'Standard operation';
  setMenu('Choose Operator', `${mtLabel} — Mission ${saveProfile.missionIndex}, Run ${saveProfile.runIndex} of ${RUNS_PER_MISSION}. Complete objectives, defeat the sector boss, then reach extraction.`);
  setupClassCards();
}


function showSettingsMenu(){
  appState='SETTINGS_MENU';
  setMenu('Settings','Tune visibility and accessibility options. Changes apply immediately and are saved locally.');

  const settings=getFogSettings();
  const panel=document.createElement('div');
  panel.className='settingsPanel';

  const fogRow=document.createElement('label');
  fogRow.className='settingsRow';
  fogRow.innerHTML=`
    <span><b>Fog of War</b><small>Limits cave visibility around the operator. Disable this for full-map visibility.</small></span>
    <input id="fogToggle" type="checkbox" ${settings.fogOfWarEnabled?'checked':''}>
  `;
  panel.appendChild(fogRow);

  const mouseRow=document.createElement('label');
  mouseRow.className='settingsRow';
  mouseRow.innerHTML=`
    <span><b>Enable manual mouse control</b><small>Allow mouse-guided targeting and related upgrades.</small></span>
    <input id="manualMouseToggle" type="checkbox" ${settings.manualMouseControlEnabled?'checked':''}>
  `;
  panel.appendChild(mouseRow);

  const presetRow=document.createElement('div');
  presetRow.className='settingsRow settingsPresetRow';
  presetRow.innerHTML=`<span><b>Fog Intensity</b><small>Optional accessibility preset for visibility radius and darkness.</small></span>`;
  const presetButtons=document.createElement('div');
  presetButtons.className='settingsPresetButtons';
  for(const [id,label] of [['low','Low'],['medium','Medium'],['high','High']]){
    const btn=document.createElement('button');
    btn.textContent=label;
    btn.onclick=()=>{ setFogIntensityPreset(id); showSettingsMenu(); };
    presetButtons.appendChild(btn);
  }
  presetRow.appendChild(presetButtons);
  panel.appendChild(presetRow);

  const values=document.createElement('div');
  values.className='settingsValues';
  values.innerHTML=`Visibility radius: <b>${settings.fogOfWarRadius}px</b> &middot; Soft edge: <b>${settings.fogOfWarSoftEdge}px</b> &middot; Outer intensity: <b>${Math.round(settings.fogOfWarIntensity*100)}%</b>`;
  panel.appendChild(values);

  ui.menuContent.appendChild(panel);
  document.getElementById('fogToggle').addEventListener('change',ev=>{
    setFogOfWarEnabled(ev.target.checked);
  });
  document.getElementById('manualMouseToggle').addEventListener('change',ev=>{
    setManualMouseControlEnabled(ev.target.checked);
    showSettingsMenu();
  });
  addMenuButton('Back',showMainMenu);
}

function showPlaceholderMenu(title,text){
  appState=`${title.toUpperCase()}_MENU`;
  setMenu(title,text);
  addMenuButton('Back',showMainMenu);
}

/*
 * Milestones Menu — displays all defined milestones with progress bars,
 * grouped by category, showing unlock status and reward text.
 * Locked milestones show a progress bar toward the unlock target.
 */
function showMilestonesMenu(){
  appState='MILESTONES_MENU';
  setMenu('Milestones','Permanent achievements earned through Hollowshift operations. Each milestone reward applies to all future runs.');
  if(!saveProfile) saveProfile=createDefaultProfile();

  // Group milestones by their 'group' field in display order.
  const groupOrder=['combat','mining','run','resource','class'];
  const groupLabels={ combat:'🔥 Combat', mining:'⛏️ Mining', run:'🏃 Runs & Missions', resource:'💎 Resources', class:'🎯 Class-Specific' };
  const groups = new Map();
  for(const m of MILESTONES){
    const g = m.group || 'other';
    if(!groups.has(g)) groups.set(g, []);
    groups.get(g).push(m);
  }

  for(const g of groupOrder){
    const items = groups.get(g);
    if(!items || !items.length) continue;
    const label = groupLabels[g] || g;

    const section = document.createElement('div');
    section.className = 'milestoneSection';

    const header = document.createElement('div');
    header.className = 'milestoneSectionHeader';
    header.textContent = label;
    section.appendChild(header);

    for(const m of items){
      const entry = saveProfile.milestones[m.id];
      const unlocked = entry && entry.unlocked;
      const card = document.createElement('div');
      card.className = `milestoneCard ${unlocked ? 'unlocked' : 'locked'}`;
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');

      // Icon column
      const iconEl = document.createElement('div');
      iconEl.className = 'milestoneIcon';
      iconEl.textContent = unlocked ? '✅' : (m.icon || '🔒');
      card.appendChild(iconEl);

      // Info column
      const info = document.createElement('div');
      info.className = 'milestoneInfo';

      const nameLine = document.createElement('div');
      nameLine.className = 'milestoneName';
      nameLine.textContent = m.name;
      info.appendChild(nameLine);

      const descLine = document.createElement('div');
      descLine.className = 'milestoneDesc';
      descLine.textContent = m.desc;
      info.appendChild(descLine);

      const rewardLine = document.createElement('div');
      rewardLine.className = 'milestoneReward';
      rewardLine.textContent = `Reward: ${m.reward}`;
      info.appendChild(rewardLine);

      // Progress bar for milestones with a progress function
      if(typeof m.progress === 'function'){
        const prog = m.progress(saveProfile);
        if(prog && prog.target > 0){
          const pct = unlocked ? 100 : Math.min(100, Math.round((prog.current / prog.target) * 100));
          const barWrap = document.createElement('div');
          barWrap.className = 'milestoneProgressWrap';
          const bar = document.createElement('div');
          bar.className = `milestoneProgressBar ${unlocked ? 'complete' : ''}`;
          bar.style.width = `${pct}%`;
          barWrap.appendChild(bar);
          info.appendChild(barWrap);

          const labelEl = document.createElement('div');
          labelEl.className = 'milestoneProgressLabel';
          if(unlocked){
            labelEl.textContent = `✓ ${prog.current} / ${prog.target}`;
          } else {
            labelEl.textContent = `${prog.current} / ${prog.target}`;
          }
          info.appendChild(labelEl);
        }
      }

      // Date unlocked or lock indicator
      if(unlocked && entry.unlockedAt){
        const dateLine = document.createElement('div');
        dateLine.className = 'milestoneDate';
        dateLine.textContent = `Unlocked: ${new Date(entry.unlockedAt).toLocaleDateString()}`;
        info.appendChild(dateLine);
      } else if(!unlocked) {
        const lockLine = document.createElement('div');
        lockLine.className = 'milestoneLockedLabel';
        lockLine.textContent = '🔒 Not yet unlocked';
        info.appendChild(lockLine);
      }

      card.appendChild(info);
      section.appendChild(card);
    }

    ui.menuContent.appendChild(section);
  }

  addMenuButton('Back', showMainMenu);
}

/*
 * Synergies Menu — Phase 2.1
 * Displays all 8 synergies in a responsive grid.
 * Unlocked synergies show a green glow, bonus text, and "UNLOCKED" badge.
 * Locked synergies are dimmed and show missing upgrades in red.
 */
function showSynergiesMenu(){
  appState='SYNERGIES_MENU';
  setMenu('Upgrade Synergies','Collect specific upgrade combinations during a run to unlock permanent combo bonuses. Synergies are persistent once unlocked.');
  if(!saveProfile) saveProfile=createDefaultProfile();

  const grid = document.createElement('div');
  grid.className = 'synergyGrid';

  for(const syn of SYNERGIES){
    const isUnlocked = saveProfile.unlockedSynergies && saveProfile.unlockedSynergies.includes(syn.id);
    const card = document.createElement('div');
    card.className = `synergyCard ${isUnlocked ? 'synergyUnlocked' : 'synergyLocked'}`;
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');

    // Header row: icon + name + badge
    const header = document.createElement('div');
    header.className = 'synergyHeader';

    const iconEl = document.createElement('span');
    iconEl.className = 'synergyIcon';
    iconEl.textContent = syn.icon;
    header.appendChild(iconEl);

    const nameEl = document.createElement('span');
    nameEl.className = 'synergyName';
    nameEl.textContent = syn.name;
    header.appendChild(nameEl);

    if(isUnlocked){
      const badge = document.createElement('span');
      badge.className = 'synergyBadge';
      badge.textContent = '✅ UNLOCKED';
      header.appendChild(badge);
    }

    card.appendChild(header);

    // Description
    const desc = document.createElement('div');
    desc.className = 'synergyDesc';
    desc.textContent = syn.description;
    card.appendChild(desc);

    // Bonus text
    const bonus = document.createElement('div');
    bonus.className = 'synergyBonus';
    bonus.textContent = `✨ ${syn.bonus}`;
    card.appendChild(bonus);

    // Required upgrades list
    const reqLabel = document.createElement('div');
    reqLabel.className = 'synergyReqLabel';
    reqLabel.textContent = 'Required Upgrades:';
    card.appendChild(reqLabel);

    const reqList = document.createElement('div');
    reqList.className = 'synergyReqList';

    // We need to know what upgrades the player has in their profile
    // For UPGRADE_POOL items, we check collectedUpgrades (run-specific)
    // For permanent upgrades (Arc Capacitors), we check the profile
    for(const reqName of syn.requiredUpgrades){
      const reqItem = document.createElement('span');
      let owned = false;
      // Check if it's a permanent upgrade (Arc Capacitors)
      if(reqName === 'Arc Capacitors'){
        owned = (saveProfile.permanentUpgrades.arcDamage || 0) > 0;
      } else {
        // For UPGRADE_POOL items, we check if the player has ever collected them
        // Since synergies are persistent, we check the profile's upgrade history
        // (in-run tracking is done via checkSynergies at runtime)
        owned = false;
      }
      reqItem.className = `synergyReqItem ${isUnlocked ? '' : (owned ? 'synergyReqOwned' : 'synergyReqMissing')}`;
      reqItem.textContent = isUnlocked ? `✅ ${reqName}` : (owned ? `✅ ${reqName}` : `🔒 ${reqName}`);
      reqList.appendChild(reqItem);
    }

    card.appendChild(reqList);

    grid.appendChild(card);
  }

  ui.menuContent.appendChild(grid);
  addMenuButton('Back', showMainMenu);
}

function showCreditsMenu(){
  appState='CREDITS_MENU';
  setMenu('Credits','Designed by Alessandro and Dylan from King Peng Studio');
  ui.menuContent.innerHTML='<p>Game Design: Alessandro and Dylan<br>Studio: King Peng Studio<br>Prototype Development: AI-assisted HTML/JavaScript prototype</p>';
  addMenuButton('Back',showMainMenu);
}


function renderUpgradeCost(cost){
  return Object.entries(cost).map(([id,amount])=>{
    const have=saveProfile.resources[id] || 0;
    const ok=have>=amount;
    return `<span class="costLine ${ok?'ok':'missing'}">${resourceLabel(id)}: ${have} / ${amount}</span>`;
  }).join('');
}

function groupedPermanentUpgrades(){
  const order=['Player Core','Mining','Weapons','Drones','Utility','Character-Specific'];
  const groups=new Map(order.map(name=>[name,[]]));
  for(const up of PERMANENT_UPGRADES){
    const key=up.category || 'Utility';
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(up);
  }
  return [...groups.entries()].filter(([,items])=>items.length);
}

function showUpgradesMenu(){
  appState='UPGRADES_MENU';
  setMenu('Permanent Upgrades','Spend banked resources on account-wide upgrades. Upgrades are grouped by type; unavailable purchases are disabled until you have enough resources.');
  ui.menuMeta.innerHTML=`<div class="resourceStrip">${renderResourceLine()}</div>`;

  const wrapper=document.createElement('div');
  wrapper.className='upgradeTableWrap';

  for(const [category,items] of groupedPermanentUpgrades()){
    const section=document.createElement('section');
    section.className='upgradeCategorySection';
    section.innerHTML=`<h3>${category}</h3>`;

    const table=document.createElement('table');
    table.className='upgradeTable';
    table.innerHTML='<thead><tr><th>Upgrade</th><th>Level</th><th>Current Effect</th><th>Next Effect</th><th>Cost</th><th>Action</th></tr></thead>';
    const tbody=document.createElement('tbody');

    const sorted=[...items].sort((a,b)=>{
      const la=saveProfile.permanentUpgrades[a.id] || 0;
      const lb=saveProfile.permanentUpgrades[b.id] || 0;
      const sa=la>=a.max ? 2 : (canAfford(permanentUpgradeCost(a)) ? 0 : 1);
      const sb=lb>=b.max ? 2 : (canAfford(permanentUpgradeCost(b)) ? 0 : 1);
      return sa-sb;
    });

    for(const up of sorted){
      const level=saveProfile.permanentUpgrades[up.id] || 0;
      const cost=permanentUpgradeCost(up);
      const affordable=canAfford(cost);
      const maxed=level>=up.max;
      const tr=document.createElement('tr');
      tr.className=maxed?'maxed':(affordable?'affordable':'locked');
      tr.innerHTML=`
        <td><b>${up.name}</b><small>${up.category || category}</small></td>
        <td>${level}/${up.max}</td>
        <td>${up.desc}</td>
        <td>${maxed?'Complete':(up.next || up.desc)}</td>
        <td class="cost">${maxed?'—':renderUpgradeCost(cost)}</td>
        <td></td>`;
      const btn=document.createElement('button');
      btn.className='buyBtn';
      btn.textContent=maxed?'Maxed':(affordable?'Buy':'Not enough resources');
      btn.disabled=maxed || !affordable;
      btn.title=maxed?'Upgrade complete':(affordable?'Purchase upgrade':'Collect more resources to buy this upgrade');
      btn.onclick=()=>{ if(!btn.disabled) buyPermanentUpgrade(up.id); };
      tr.lastElementChild.appendChild(btn);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    section.appendChild(table);
    wrapper.appendChild(section);
  }
  ui.menuContent.appendChild(wrapper);

  // ── Resource Conversion Section (Phase 1.4) ──
  const conversionSection = document.createElement('section');
  conversionSection.className = 'upgradeCategorySection';
  conversionSection.innerHTML = '<h3>💱 Resource Conversion</h3><p style="color:#aaa;margin:0 0 8px 0;font-size:13px;">Convert abundant resources into rarer ones or permanent bonuses.</p>';

  const conversionRules = [
    { from:'gildShards', to:'voltarite', fromLabel:'Gild Shards', toLabel:'Voltarite', key:'gild_to_voltarite', rate:50, hpBonus:false },
    { from:'voltarite', to:'aetherQuartz', fromLabel:'Voltarite', toLabel:'Aether Quartz', key:'voltarite_to_rare', rate:5, hpBonus:false },
    { from:'ferriteBark', to:'aetherQuartz', fromLabel:'Ferrite Bark', toLabel:'Aether Quartz', key:'ferrite_to_aether', rate:10, hpBonus:false },
    { from:'gildShards', to:'maxHp', fromLabel:'Gild Shards', toLabel:'+1 Max HP (permanent)', key:'gild_to_hp', rate:100, hpBonus:true }
  ];

  for(const rule of conversionRules){
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #333;';

    const label = document.createElement('span');
    label.style.cssText = 'flex:1;color:#ccc;font-size:13px;';
    label.textContent = `${rule.rate} ${rule.fromLabel} → 1 ${rule.toLabel}`;

    const haveAmt = saveProfile.resources[rule.from] || 0;
    const info = document.createElement('span');
    info.style.cssText = 'color:#888;font-size:12px;';
    info.textContent = `Own: ${haveAmt}`;

    const btn = document.createElement('button');
    btn.className = 'buyBtn';
    const canConvert = haveAmt >= rule.rate;
    btn.textContent = canConvert ? 'Convert' : 'Need more';
    btn.disabled = !canConvert;
    btn.title = canConvert ? `Convert ${rule.rate} ${rule.fromLabel} to 1 ${rule.toLabel}` : `You need ${rule.rate} ${rule.fromLabel} to convert.`;
    btn.onclick = () => {
      if(!canConvert) return;
      if(convertResources(rule.key.split('_to_')[0], rule.key.split('_to_')[1], 1)){
        showUpgradesMenu();
      }
    };

    row.appendChild(label);
    row.appendChild(info);
    row.appendChild(btn);
    conversionSection.appendChild(row);
  }

  ui.menuContent.appendChild(conversionSection);
  addMenuButton('Back',showMainMenu);
}

function showRunComplete(g,missionCompleted){
  appState='RUN_COMPLETE';
  setMenu(missionCompleted ? 'Mission Complete' : 'Run Extracted', missionCompleted ? 'The sector chain is cleared. A harder mission is now available.' : 'Resources were banked to your Hollowshift profile.');
  ui.menuMeta.innerHTML=`<div class="menuStats"><span>Current Mission <b>${saveProfile.missionIndex}</b></span><span>Current Run <b>${saveProfile.runIndex}/${RUNS_PER_MISSION}</b></span><span>Kills <b>${g.kills}</b></span></div><div class="resourceStrip">${renderResourceLine()}</div>`;
  addMenuButton('Continue',showMainMenu);
  addMenuButton('Upgrades',showUpgradesMenu);
}

function startupFlow(){
  if(hasSaveData()) showSaveSelect();
  else {
    saveProfile=createDefaultProfile();
    saveGame();
    showMainMenu();
  }
}

window.showMainMenu=showMainMenu;
window.MISSION_TYPES=MISSION_TYPES;
window.selectedMissionType=selectedMissionType;
window.SYNERGIES=SYNERGIES;
window.checkSynergies=checkSynergies;
window.applySynergyRewards=applySynergyRewards;
window.showSynergiesMenu=showSynergiesMenu;
window.convertResources=convertResources;


EchoVein/js/render-ui.js:
'use strict';

/* HUD updates, menus, rendering, drawing helpers, and game-over/start flows. */

function updateUI(g){
  const p=g.player;
  const mm=Math.floor(g.time/60), ss=Math.floor(g.time%60);
  ui.timer.textContent=`${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  ui.hpFill.style.width=`${clamp(p.hp/p.maxHp*100,0,100)}%`;
  ui.hpLabel.textContent=`HP ${Math.ceil(Math.max(0,p.hp))}/${p.maxHp}`;
  ui.xpFill.style.width=`${clamp(g.xp/g.xpNeed*100,0,100)}%`;
  ui.xpLabel.textContent=`Echo ${Math.floor(g.xp)}/${g.xpNeed}`;
  ui.heatFill.style.width=`${clamp(p.heat/p.maxHeat*100,0,100)}%`;
  ui.heatLabel.textContent=p.heat>=p.maxHeat?'TOOL OVERHEATED':'TOOL HEAT';
  ui.level.textContent=g.level;
  ui.depth.textContent=Math.floor(g.time*1.6)+' m';
  ui.gold.textContent=g.gold; ui.nitra.textContent=g.nitra; ui.kills.textContent=g.kills;
  const trapChip = g.player.canUseTraps ? `<div class="chip"><span>Pathfinder Trap Kit</span><b>${g.player.trapCd<=0?'READY':'CD '+g.player.trapCd.toFixed(1)+'s'}</b></div>` : '';
  const accChip = `<div class="chip"><span>Weapon Accuracy</span><b>${Math.round((g.player.accuracy ?? 0.35)*100)}%</b></div>`;
  const cursorChip = (g.player.mouseTargeting || g.controllerCursor?.active) ? `<div class="chip"><span>Targeting Cursor</span><b>${manualAimActive(g)?'MANUAL':'AUTO'}</b></div>` : '';
  const arc = g.arcConnection;
  const arcChip = arc?.unlocked
    ? `<div class="chip"><span>Arc Connection</span><b>${arc.selectedEnemies.length}/${arcConnectionMaxTargets(g)}</b></div>`
    : "";
  // ── NEW ── Vampire stack value chip
  const vampireChip = (g.player.vampire > 0)
  ? `<div class="chip"><span>❤️ Field Reclaimer</span><b>${g.player.vampire} HP (${g.player.vampCounter}/18 kills)</b></div>`
  : '';
  ui.weaponList.innerHTML=g.weapons.map(w=>{
    const spriteId=WEAPON_DATA[w.id]?.spriteId;
    const icon=spriteId ? `<img class="weaponIcon" src="${SPRITES[spriteId]}" alt="">` : '';
    return `<div class="chip"><span>${icon}${weaponName(w.id)}</span><b>Mk ${w.level}</b></div>`;
  }).join('') + trapChip + accChip + cursorChip + arcChip;
  const resourceChips = RUN_RESOURCE_IDS.filter(id=>id!=='gild' && id!=='voltarite' && id!=='echo' && (g.resources?.[id] || 0)>0)
    .map(id=>`<div class="chip"><span>${MINERALS[id].displayName}</span><b>${g.resources[id]}</b></div>`).join('');
  const pressureChip=`<div class="chip ${g.pressureFlash>0?'danger':''}"><span>Hollow Pressure</span><b>${g.hollowPressure || 0}</b></div>`;
  const perfState=g.performance?.state || '';
  const perfChip=(perfState && perfState!==PERF_STATES.HEALTHY)
    ? `<div class="chip ${perfState===PERF_STATES.CRITICAL?'danger':''}"><span>Swarm Stabiliser</span><b>${perfState.replace('PERF_','')}</b></div>`
    : '';
  const objectiveChips=(typeof renderObjectiveChips==='function') ? renderObjectiveChips(g) : g.objectives.map(o=>`<div class="chip objective ${o.completed?'done':''}"><span>${o.displayName}</span><b>${Math.floor(o.currentAmount)}/${o.targetAmount}</b></div>`).join('');
  const bossChip=g.bossDefeated ? '<div class="chip unlocked"><span>Sector Boss</span><b>DEFEATED</b></div>' : (g.bossSpawned ? '<div class="chip unlocked"><span>Sector Boss</span><b>ACTIVE</b></div>' : '<div class="chip locked"><span>Sector Boss</span><b>LOCKED</b></div>');
  const extractionChip=g.extraction ? `<div class="chip danger"><span>Extraction</span><b>${Math.max(0,g.extractionTimer).toFixed(1)}s</b></div>` : '';
  const missionChip=`<div class="chip"><span>Mission ${g.missionIndex}</span><b>Run ${g.runIndex}/${RUNS_PER_MISSION}</b></div>`;
  // Phase 1.2: mission-type chip.
  let missionTypeChip='';
  if(g.missionType && typeof MISSION_TYPES !== 'undefined'){
    const mt=MISSION_TYPES.find(m=>m.id===g.missionType);
    if(mt){
      const colors={hunt:'#ff5b5b',survey:'#42d6ff',harvest:'#ffcc4d',holdout:'#b46bff'};
      const c=colors[mt.id]||'#95a2ba';
      missionTypeChip=`<div class="chip" style="border-color:${c};color:${c}"><span>${mt.icon} ${mt.name}</span><b>+${Math.round((mt.rewardModifier-1)*100)}%</b></div>`;
    }
  }
  ui.logList.innerHTML=missionTypeChip + missionChip + pressureChip + perfChip + resourceChips + objectiveChips + bossChip + extractionChip + g.log.slice(0,3).map((m,i)=>`<div class="chip"><span>${m}</span><b>${i===0?'NEW':''}</b></div>`).join('');
}

function render(g){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  if(!g){ drawBackdrop(); return; }
  const p=g.player;
  const cam=g.camera;
  cam.x=lerp(cam.x,p.x-innerWidth/2,0.10);
  cam.y=lerp(cam.y,p.y-innerHeight/2,0.10);
  cam.x=clamp(cam.x,0,WORLD_W-innerWidth); cam.y=clamp(cam.y,0,WORLD_H-innerHeight);
  const sx=(shake>0?rand(-shake,shake):0), sy=(shake>0?rand(-shake,shake):0);
  ctx.save(); ctx.translate(-cam.x+sx,-cam.y+sy);
  drawTiles(g,cam);
  drawLavaDebugZones(g,cam);
  drawTraps(g);
  drawExtractionCraft(g);
  drawExtractionPath(g);
  drawPickups(g);
  drawTargetLocks(g);
  drawMissiles(g);
  drawBorecasterBombs(g);
  drawEnemyBoomerangs(g);
  drawEnemyBullets(g);
  drawBullets(g);
  drawBoomerangs(g);
  drawArcConnection(g);
  drawEnemies(g);
  drawEnemyPaths(g);
  drawChargingWaveWorldDebug(g);
  drawWardenDrones(g);
  drawSifterDrones(g);
  drawPlayer(g);
  drawThermalLanceCone(g);
  drawMiningDebug(g);
  drawScaledTileDebug(g,cam);
  drawParticles(g);
  drawArcs(g);
  drawTargetingCursor(g);
  drawTexts(g);
  // Phase 2.2: boss weak point overlay and crystal rain indicators (world-space)
  drawWeakPointHighlight(g);
  drawBossCrystalRainIndicators(g);
  ctx.restore();
  // Phase 2.2: boss health bar and name display (screen-space)
  drawBossHealthBar(g);
  drawBossName(g);
  // Auto-hide right panel if the player is underneath it
  updateRightPanelVisibility(g);
  drawFogOfWar(g,cam,sx,sy);
  drawVignette();
  drawChargingWaveScreenOverlay(g);
  drawFogDebugOverlay(g,cam,sx,sy);
  drawEnemyBudgetOverlay(g);
  drawControllerDebugOverlay(g);
  drawTileScaleInfoOverlay(g);
  drawAccuracyCone(g);
  if(paused) drawPause();
}

/*
 * Auto-hide the right panel when the player character moves underneath it.
 *
 * Converts the player's world position to screen coordinates, then checks
 * whether that point overlaps the right panel's bounding box (with a 25px
 * buffer so the fade starts before the player reaches the edge).
 * If overlapping, adds the 'faded' class (opacity ~0.12); otherwise removes it.
 *
 * Called every frame from render().
 */
function updateRightPanelVisibility(g){
  if(!g || !g.player || !ui.rightbar) return;
  const p = g.player;
  const cam = g.camera;

  // Project player world position to screen coordinates
  const screenX = p.x - cam.x;
  const screenY = p.y - cam.y;

  // Get right panel bounding box with 25px buffer
  const rect = ui.rightbar.getBoundingClientRect();
  const buffer = 25;
  const panelLeft = rect.left - buffer;
  const panelRight = rect.right + buffer;
  const panelTop = rect.top - buffer;
  const panelBottom = rect.bottom + buffer;

  // Check overlap
  const overlaps = screenX >= panelLeft && screenX <= panelRight &&
                   screenY >= panelTop && screenY <= panelBottom;

  ui.rightbar.classList.toggle('faded', overlaps);
}

function drawTargetingCursor(g){
  if(!manualAimActive(g)) return;
  const m = mouseWorld(g);
  ctx.save();
  ctx.translate(m.x,m.y);
  const pulse = 0.5 + 0.5*Math.sin(g.time*10);
  ctx.strokeStyle=`rgba(66,214,255,${0.45+0.35*pulse})`;
  ctx.shadowColor='#42d6ff';
  ctx.shadowBlur=10;
  ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(0,0,20+3*pulse,0,Math.PI*2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-28,0); ctx.lineTo(-12,0);
  ctx.moveTo(12,0); ctx.lineTo(28,0);
  ctx.moveTo(0,-28); ctx.lineTo(0,-12);
  ctx.moveTo(0,12); ctx.lineTo(0,28);
  ctx.stroke();
  ctx.restore();
}

function drawArcConnection(g){
  const arc = g.arcConnection;
  if(!arc?.unlocked) return;
  const selected = arc.selectedEnemies.filter(e=>e && e.hp>0);
  if(!selected.length) return;
  ctx.save();
  ctx.lineCap='round';
  ctx.lineJoin='round';
  for(let i=1;i<selected.length;i++){
    const a=selected[i-1], b=selected[i];
    const pulse = 0.55 + 0.45*Math.sin(g.time*12+i);
    ctx.strokeStyle=`rgba(93,255,154,${0.48+0.35*pulse})`;
    ctx.shadowColor='#5dff9a';
    ctx.shadowBlur=10;
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(a.x,a.y);
    const segments=5;
    for(let s=1;s<=segments;s++){
      const t=s/segments;
      const jitter=(1-Math.abs(0.5-t)*1.7);
      ctx.lineTo(lerp(a.x,b.x,t)+rand(-3,3)*jitter, lerp(a.y,b.y,t)+rand(-3,3)*jitter);
    }
    ctx.stroke();
  }
  for(let i=0;i<selected.length;i++){
    const e=selected[i];
    const pulse = 0.5 + 0.5*Math.sin(g.time*9+i);
    ctx.strokeStyle=`rgba(93,255,154,${0.65+0.30*pulse})`;
    ctx.shadowColor='#5dff9a';
    ctx.shadowBlur=12;
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.arc(e.x,e.y,e.r+8+3*pulse,0,Math.PI*2);
    ctx.stroke();
    ctx.fillStyle='rgba(93,255,154,0.22)';
    ctx.beginPath();
    ctx.arc(e.x,e.y,e.r+3,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle='#d9ffe7';
    ctx.font='bold 12px Segoe UI, Arial';
    ctx.textAlign='center';
    ctx.fillText(String(i+1),e.x,e.y-e.r-13);
  }
  ctx.restore();
}

function drawBackdrop(){
  ctx.fillStyle='#07090d'; ctx.fillRect(0,0,innerWidth,innerHeight);
}

function drawTiles(g,cam){
  const minx=clamp(Math.floor(cam.x/TILE)-1,0,MAP_W-1), maxx=clamp(Math.ceil((cam.x+innerWidth)/TILE)+1,0,MAP_W-1);
  const miny=clamp(Math.floor(cam.y/TILE)-1,0,MAP_H-1), maxy=clamp(Math.ceil((cam.y+innerHeight)/TILE)+1,0,MAP_H-1);
  ctx.fillStyle='#131722'; ctx.fillRect(cam.x-30,cam.y-30,innerWidth+60,innerHeight+60);
  for(let y=miny;y<=maxy;y++) for(let x=minx;x<=maxx;x++){
    const t=g.tiles[tileIdx(x,y)];
    const px=x*TILE, py=y*TILE;
    if(t===TILE_EMPTY){
      ctx.fillStyle=((x+y)&1)?'#171b27':'#151925';
      ctx.fillRect(px,py,TILE,TILE);
      if(Math.random()<0.0002){} // keeps cave still; no-op.
    } else {
      const data=TILE_DATA[t];
      const color = t===TILE_EMPTY?'#151925':(data?.color || '#3a342f');
      ctx.fillStyle=color; ctx.fillRect(px,py,TILE,TILE);
      const tileInfo = TILE_DATA[t];
      if(tileInfo?.sprite){
        drawSpriteCentered(ctx, tileInfo.sprite, px+TILE/2, py+TILE/2, TILE-6, TILE-6, {
          glowColor: (t===TILE_LUMINA_SPORES || t===TILE_AETHER_QUARTZ || t===TILE_CRYSALITH || t===TILE_EMBERGLASS) ? tileInfo.color : null,
          glowBlur: (t===TILE_LUMINA_SPORES || t===TILE_AETHER_QUARTZ || t===TILE_CRYSALITH || t===TILE_EMBERGLASS) ? 8 : 0
        });
      }
      if(t===TILE_LAVA_ROCK){
        ctx.fillStyle='rgba(255,96,24,0.18)';
        ctx.beginPath(); ctx.arc(px+TILE/2,py+TILE/2,TILE*0.42,0,Math.PI*2); ctx.fill();
      }
      ctx.fillStyle='rgba(255,255,255,0.04)'; ctx.fillRect(px+2,py+2,TILE-4,3);
      ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fillRect(px,py+TILE-4,TILE,4);
      const seed=(x*73856093 ^ y*19349663)>>>0;
      ctx.fillStyle='rgba(255,255,255,0.06)';
      for(let k=0;k<2;k++){
        const ox=(seed>>(k*5))%TILE, oy=(seed>>(k*7+3))%TILE;
        ctx.fillRect(px+ox,py+oy,2,2);
      }
    }
  }
}


function drawLavaDebugZones(g,cam){
  if(!g.debug?.showLavaZones) return;
  const minx=clamp(Math.floor(cam.x/TILE)-1,0,MAP_W-1), maxx=clamp(Math.ceil((cam.x+innerWidth)/TILE)+1,0,MAP_W-1);
  const miny=clamp(Math.floor(cam.y/TILE)-1,0,MAP_H-1), maxy=clamp(Math.ceil((cam.y+innerHeight)/TILE)+1,0,MAP_H-1);
  ctx.save();
  ctx.strokeStyle='rgba(255,112,56,0.82)';
  ctx.lineWidth=2;
  for(let y=miny;y<=maxy;y++) for(let x=minx;x<=maxx;x++) if(g.tiles[tileIdx(x,y)]===TILE_LAVA_ROCK){
    ctx.strokeRect(x*TILE+2,y*TILE+2,TILE-4,TILE-4);
  }
  ctx.restore();
}

function drawPlayer(g){
  const p=g.player;
  ctx.save(); ctx.translate(p.x,p.y);
  const a=Math.atan2(p.lastDy,p.lastDx);
  ctx.rotate(a);

  // Determine which operator sprite to use based on classId
  const cls = CLASSES.find(c => c.id === p.classId);
  const spriteId = cls?.spriteId || null;
  const size = 60;

  if(spriteId){
    const drawn = drawSpriteCentered(ctx, spriteId, 0, 0, size, size, {
      rotation: 0,
      alpha: p.iframes > 0 ? 0.65 : 1,
      glowColor: '#42d6ff',
      glowBlur: 10
    });
    if(drawn){
      ctx.restore();
      return;
    }
  }

  // Procedural fallback (identical to original)
  ctx.shadowColor='#42d6ff'; ctx.shadowBlur=8;
  ctx.fillStyle=p.iframes>0?'rgba(255,255,255,0.85)':'#4fa3ff';
  ctx.beginPath(); ctx.roundRect(-15,-12,30,24,7); ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='#f5c16c'; ctx.fillRect(-4,-18,10,10);
  ctx.fillStyle='#222'; ctx.fillRect(2,-8,20,5);
  ctx.fillStyle='#ffcc4d'; ctx.fillRect(-12,11,8,6);
  ctx.restore();
}

function drawThermalLanceCone(g){
  const p = g.player;
  const w = g.weapons.find(w => w.id === 'flamer');
  if(!w || w.cd > 0.05) return;

  // Check if we have a target OR active fire input
  const e = targetEnemy(g, 250, 130);
  const isFiring = mouse.down || (g.controllerCursor?.primaryHoldTimer || 0) > 0;
  if(!e && !isFiring) return;

  // ── Angle calculation ──
  let angle;
  if(e){
    angle = Math.atan2(e.y - p.y, e.x - p.x);
  } else {
    const aim = manualAimPoint(g);
    angle = Math.atan2(aim.y - p.y, aim.x - p.x);
  }

  const range = 210 + w.level * 18;
  const coneHalf = 0.45 + w.level * 0.04;

  ctx.save();
  ctx.translate(p.x, p.y);

  // ── Cone Fill ──
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, range);
  gradient.addColorStop(0, 'rgba(255, 180, 50, 0.25)');
  gradient.addColorStop(0.4, 'rgba(255, 120, 30, 0.20)');
  gradient.addColorStop(0.8, 'rgba(255, 80, 20, 0.12)');
  gradient.addColorStop(1, 'rgba(255, 40, 10, 0.0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, range, angle - coneHalf, angle + coneHalf);
  ctx.closePath();
  ctx.fill();

  // ── Flame Sprites (use actual sprite IDs) ──
  const flameSprites = [
    'flameParticle01', 'flameParticle02', 'flameParticle03',
    'flameParticle04', 'flameParticle05', 'flameParticle06',
    'flameParticle07', 'flameParticle08', 'flameParticle09',
    'flameParticle10', 'flameParticle11', 'flameParticle12'
  ];

  for(let i = 0; i < 4; i++){
    const dist = rand(20, range * 0.75);
    const offA = angle + rand(-coneHalf, coneHalf);
    const spriteId = flameSprites[randi(0, flameSprites.length - 1)];
    const size = rand(16, 32);
    drawSpriteCentered(ctx, spriteId,
      Math.cos(offA) * dist,
      Math.sin(offA) * dist,
      size, size, {
        rotation: rand(0, Math.PI * 2),
        alpha: rand(0.15, 0.45),
        glowColor: '#ff8844',
        glowBlur: 6
      }
    );
  }

  // ── Cone Outline ──
  const pulse = 0.6 + 0.4 * Math.sin(g.time * 12);
  ctx.strokeStyle = `rgba(255, 160, 60, ${0.15 + 0.1 * pulse})`;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, range, angle - coneHalf, angle + coneHalf);
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Heat Ripple ──
  for(let i = 1; i <= 3; i++){
    const r = (range / 3) * i;
    const alpha = 0.06 + 0.04 * Math.sin(g.time * 8 + i * 1.5);
    ctx.strokeStyle = `rgba(255, 200, 100, ${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, angle - coneHalf * 0.8, angle + coneHalf * 0.8);
    ctx.stroke();
  }

  // ── Sparks ──
  if(Math.random() < 0.6){
    const dist = rand(10, range);
    const offAngle = angle + rand(-coneHalf, coneHalf);
    addParticle(g,
      Math.cos(offAngle) * dist,
      Math.sin(offAngle) * dist,
      Math.cos(offAngle + rand(-0.2, 0.2)) * rand(20, 80),
      Math.sin(offAngle + rand(-0.2, 0.2)) * rand(20, 80),
      rand(0,1) > 0.5 ? '#ff8844' : '#ffcc66',
      rand(0.06, 0.15),
      rand(1.5, 3.5),
      'spark'
    );
  }

  ctx.restore();
}


function enemyRenderTransform(g,e,cfg,warning=false){
  const style=e.rotationStyle || cfg.rotationStyle || 'wobble';
  const base=(e.visualRotation || 0) + (e.visualRotationSpeed || 0)*g.time;
  const wobble=Math.sin(g.time*(e.visualWobbleSpeed || 2.5) + (e.visualPhase || e.phase || 0)) * (e.visualWobbleAmount || 0);
  const warningTwist=warning ? Math.sin(g.time*24 + e.phase)*0.18 : 0;
  const scale=1 + Math.sin(g.time*(e.visualScaleSpeed || 1.5) + (e.visualPhase || 0))*(e.visualScalePulse || 0);
  return { rotation:base+wobble+warningTwist, scale:scale*(e.visualScaleMul || 1) };
}

function drawEnemies(g){
  for(const e of g.enemies){
    ctx.save();
    let shakeX=0, shakeY=0;
    if((ENEMY_TYPES[e.type]?.behavior || e.behavior) === 'hexBoomerangDetonator' && e.detonationStarted){
      const amp=e.shakeAmount || 4;
      shakeX=rand(-amp,amp); shakeY=rand(-amp,amp);
    }
    ctx.translate(e.x+shakeX,e.y+shakeY);

    const cfg = ENEMY_TYPES[e.type] || {};
    const isHexLike = (cfg.behavior || e.behavior) === 'hexBoomerangDetonator';
    const warning = isHexLike && e.detonationStarted;
    const pulse = 0.5 + 0.5*Math.sin(g.time*(warning?18:6)+e.phase);
    let spriteDrawn=false;

    // Enemy sprites are purely visual. If any sprite is missing, the existing
    // procedural fallback below still renders the enemy safely. New enemy-pack
    // enemies all flow through cfg.spriteId so future sprite swaps are data-only.
    const spriteId = e.spriteId || cfg.spriteId;
    if(spriteId){
      const role = cfg.role || e.role || 'normal';
      const baseScale = role==='boss' ? 3.25 : role==='elite' ? 3.15 : 3.05;
      const minSize = role==='boss' ? 110 : role==='elite' ? 64 : 44;
      const tr=enemyRenderTransform(g,e,cfg,warning);
      const size = Math.max(minSize, e.r*baseScale) * (warning ? 1+0.08*pulse : 1) * tr.scale;
      spriteDrawn = drawSpriteCentered(ctx,spriteId,0,0,size,size,{
        rotation:tr.rotation,
        alpha: e.hitFlash>0 ? 0.72 : (cfg.behavior==='riftStalker'?0.82:1),
        glowColor: warning ? '#ff3d22' : e.color,
        glowBlur: warning ? 24 : (role==='boss'?26:(role==='elite'?16:8))
      });
      if(spriteDrawn && warning){
        drawSpriteCentered(ctx,cfg.warningSpriteId || 'hexShardWarningGlow',0,0,size*1.35,size*1.35,{
          rotation: -g.time*1.6,
          alpha: 0.38+0.50*pulse,
          glowColor:'#ff7038',
          glowBlur:28
        });
        ctx.strokeStyle=`rgba(255,72,40,${0.42+0.42*pulse})`;
        ctx.lineWidth=3;
        ctx.beginPath(); ctx.arc(0,0,70+8*pulse,0,Math.PI*2); ctx.stroke();
      }
    }

    if(!spriteDrawn){
      const tr=enemyRenderTransform(g,e,cfg,warning);
      ctx.save();
      ctx.rotate(tr.rotation);
      ctx.scale(tr.scale,tr.scale);
      if((ENEMY_TYPES[e.type]?.behavior || e.behavior) === 'hexBoomerangDetonator'){
        ctx.fillStyle=e.hitFlash>0?'#fff':(warning?`rgba(255,112,56,${0.78+0.22*pulse})`:e.color);
        ctx.strokeStyle=warning?'#ffe0a8':'rgba(255,220,170,0.82)';
        ctx.lineWidth=warning?3:2;
        ctx.shadowColor=warning?'#ff3d22':e.color;
        ctx.shadowBlur=warning?26:10;
        ctx.beginPath();
        for(let i=0;i<6;i++){
          const a=-Math.PI/6+i*Math.PI*2/6;
          const rr=e.r*(warning?1+0.10*pulse:1);
          const x=Math.cos(a)*rr, y=Math.sin(a)*rr;
          if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
        ctx.fillStyle='rgba(0,0,0,0.38)';
        ctx.beginPath(); ctx.arc(0,0,e.r*0.42,0,Math.PI*2); ctx.fill();
        if(warning){
          ctx.strokeStyle=`rgba(255,72,40,${0.42+0.42*pulse})`;
          ctx.lineWidth=3;
          ctx.beginPath(); ctx.arc(0,0,70+8*pulse,0,Math.PI*2); ctx.stroke();
        }
      } else {
        ctx.fillStyle=e.hitFlash>0?'#fff':e.color;
        const fallbackRole=ENEMY_TYPES[e.type]?.role || e.role || 'normal';
        ctx.shadowColor=e.color; ctx.shadowBlur=fallbackRole==='boss'?28:(fallbackRole==='elite'?18:6);
        ctx.beginPath();
        for(let i=0;i<8;i++){
          const a=i*Math.PI*2/8;
          const rr=e.r*(i%2?0.82:1.08);
          ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);
        }
        ctx.closePath(); ctx.fill(); ctx.shadowBlur=0;
      }
      ctx.restore();
    }

    ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(-e.r,-e.r-10,e.r*2,4);
    ctx.fillStyle='#ff5b5b'; ctx.fillRect(-e.r,-e.r-10,e.r*2*clamp(e.hp/e.maxHp,0,1),4);
    if((ENEMY_TYPES[e.type]?.role || e.role)==='boss'){
      ctx.strokeStyle='rgba(255,255,255,0.75)';
      ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(0,0,e.r+8+Math.sin(g.time*5)*3,0,Math.PI*2); ctx.stroke();
    }
    if(e.isChargingWaveEnemy && (g.debug?.showChargingWaveTriggerRadius || g.debug?.showChargingWaveDamageRadius)){
      ctx.shadowBlur=0;
      if(g.debug.showChargingWaveTriggerRadius){
        ctx.strokeStyle='rgba(255,228,90,0.55)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.arc(0,0,e.explosionTriggerRadius || 55,0,Math.PI*2); ctx.stroke();
      }
      if(g.debug.showChargingWaveDamageRadius){
        ctx.strokeStyle='rgba(255,112,56,0.36)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.arc(0,0,e.explosionRadius || 95,0,Math.PI*2); ctx.stroke();
      }
    }
    if(g.debug?.showHexRanges && (ENEMY_TYPES[e.type]?.behavior || e.behavior)==='hexBoomerangDetonator'){
      ctx.shadowBlur=0;
      ctx.strokeStyle='rgba(255,112,56,0.32)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(0,0,70,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle='rgba(255,200,80,0.18)';
      ctx.beginPath(); ctx.arc(0,0,420,0,Math.PI*2); ctx.stroke();
    }
    ctx.restore();
  }
}


function drawChargingWaveWorldDebug(g){
  if(!g?.chargingWave) return;
  const cw=g.chargingWave;
  ctx.save();
  if(g.debug?.showChargingWaveSpawnDirection && cw.lastSpawnCenter){
    ctx.strokeStyle='rgba(255,112,56,0.72)';
    ctx.lineWidth=3;
    ctx.setLineDash([10,7]);
    ctx.beginPath(); ctx.moveTo(cw.lastSpawnCenter.x,cw.lastSpawnCenter.y); ctx.lineTo(g.player.x,g.player.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,112,56,0.95)';
    ctx.beginPath(); ctx.arc(cw.lastSpawnCenter.x,cw.lastSpawnCenter.y,8,0,Math.PI*2); ctx.fill();
  }
  if(g.debug?.showChargingWaveFormationTargets){
    const targets=[];
    for(const e of g.enemies||[]) if(e.isChargingWaveEnemy && e.formationTarget) targets.push(e.formationTarget);
    if(!targets.length && cw.lastFormationTargets) targets.push(...cw.lastFormationTargets);
    ctx.fillStyle='rgba(255,228,90,0.82)';
    ctx.strokeStyle='rgba(255,112,56,0.38)';
    for(const t of targets){ ctx.beginPath(); ctx.arc(t.x,t.y,3.4,0,Math.PI*2); ctx.fill(); }
  }
  ctx.restore();
}

function drawChargingWaveScreenOverlay(g){
  const cw=g?.chargingWave;
  if(!cw) return;
  const warning=cw.warningActive && cw.warningTimer>0;
  const alive=(g.enemies||[]).filter(e=>e.isChargingWaveEnemy && e.hp>0).length;
  if(!warning && alive<=0) return;
  ctx.save();
  const pulse=0.5+0.5*Math.sin((g.time||0)*14);
  if(warning){
    const alpha=0.16+0.13*pulse;
    ctx.fillStyle=`rgba(255,72,32,${alpha})`;
    ctx.fillRect(0,0,innerWidth,innerHeight);
    ctx.font='900 34px Segoe UI, Arial';
    ctx.textAlign='center';
    ctx.fillStyle=`rgba(255,240,210,${0.80+0.20*pulse})`;
    ctx.shadowColor='#ff3d22'; ctx.shadowBlur=18;
    ctx.fillText('CHARGING WAVE INCOMING!',innerWidth/2,112);
    ctx.font='700 15px Segoe UI, Arial';
    ctx.fillText(`${Math.max(0,cw.warningTimer).toFixed(1)}s · Dodge the Rift Chargers`,innerWidth/2,140);
  }
  // Directional incoming arrow is visible even when fog hides the enemies.
  const a=cw.incomingDirection || 0;
  const cx=innerWidth/2 + Math.cos(a)*Math.min(innerWidth,innerHeight)*0.34;
  const cy=innerHeight/2 + Math.sin(a)*Math.min(innerWidth,innerHeight)*0.34;
  ctx.translate(cx,cy);
  ctx.rotate(a+Math.PI);
  ctx.fillStyle=`rgba(255,112,56,${0.55+0.35*pulse})`;
  ctx.strokeStyle='rgba(255,245,210,0.88)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(0,-24); ctx.lineTo(38,0); ctx.lineTo(0,24); ctx.lineTo(10,7); ctx.lineTo(-36,7); ctx.lineTo(-36,-7); ctx.lineTo(10,-7);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawExtractionCraft(g){
  if(!g.extraction) return;
  const ex=g.extraction;
  const pulse=0.5+0.5*Math.sin(g.time*8);
  ctx.save();
  ctx.translate(ex.x,ex.y);
  ctx.shadowColor='#5dff9a';
  ctx.shadowBlur=22;
  ctx.strokeStyle=`rgba(93,255,154,${0.45+0.35*pulse})`;
  ctx.fillStyle='rgba(93,255,154,0.16)';
  ctx.lineWidth=4;
  ctx.beginPath(); ctx.arc(0,0,ex.r+14+8*pulse,0,Math.PI*2); ctx.fill(); ctx.stroke();
  const drawn=drawSpriteCentered(ctx,'extractionCraft',0,0,110,110,{
    rotation: Math.sin(g.time*1.2)*0.025,
    glowColor:'#5dff9a',
    glowBlur:18
  });
  if(!drawn){
    ctx.fillStyle='#d9ffe7';
    ctx.beginPath();
    ctx.moveTo(0,-30); ctx.lineTo(28,14); ctx.lineTo(10,26); ctx.lineTo(-10,26); ctx.lineTo(-28,14);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle='#15251f';
    ctx.fillRect(-11,3,22,12);
  }
  ctx.shadowBlur=0;
  ctx.fillStyle='#fff';
  ctx.font='900 13px Segoe UI, Arial';
  ctx.textAlign='center';
  ctx.fillText('EXTRACTION',0,-60);
  ctx.restore();
}

/*
 * drawExtractionPath — glowing dashed path from player to extraction craft.
 * Checks line-of-sight per segment; falls back to a "go around" indicator
 * when terrain blocks the direct line.
 */
function drawExtractionPath(g){
  if(!g.extraction || !g.player) return;
  const p = g.player;
  const ex = g.extraction;
  const pulse = 0.6 + 0.4 * Math.sin(g.time * 6);
  const color = `rgba(255,204,77,${0.55 * pulse})`;
  const glowColor = `rgba(255,204,77,${0.25 * pulse})`;

  // Step along the line from player to extraction in ~TILE-sized steps
  const dx = ex.x - p.x;
  const dy = ex.y - p.y;
  const dist = Math.hypot(dx, dy);
  if(dist < 20) return;

  const steps = Math.max(2, Math.ceil(dist / (TILE * 0.7)));
  let blocked = false;
  let lastClearX = p.x, lastClearY = p.y;

  // Sample points along the line to check for solid tiles
  for(let i = 1; i <= steps; i++){
    const t = i / steps;
    const sx = p.x + dx * t;
    const sy = p.y + dy * t;
    const [tx, ty] = worldToTile(sx, sy);
    if(isSolid(tileAt(g, tx, ty))){
      blocked = true;
      break;
    }
    lastClearX = sx;
    lastClearY = sy;
  }

  ctx.save();

  if(!blocked){
    // ── Direct clear path — draw pulsing dotted line ──────────────
    ctx.shadowColor = '#ffcc4d';
    ctx.shadowBlur = 14 * pulse;
    ctx.setLineDash([6, 10]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(ex.x, ex.y);
    ctx.stroke();

    // Second pass: wider fainter glow line
    ctx.shadowBlur = 28;
    ctx.lineWidth = 7;
    ctx.strokeStyle = glowColor;
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(ex.x, ex.y);
    ctx.stroke();

  } else {
    // ── Blocked path — draw to last clear point, then "go around" ─
    ctx.shadowColor = '#ff8844';
    ctx.shadowBlur = 8;
    ctx.setLineDash([4, 10]);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = `rgba(255,136,68,${0.6 * pulse})`;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(lastClearX, lastClearY);
    ctx.stroke();

    // Dashed continuation hint
    ctx.setLineDash([2, 14]);
    ctx.strokeStyle = `rgba(255,136,68,${0.3 * pulse})`;
    ctx.beginPath();
    ctx.moveTo(lastClearX, lastClearY);
    ctx.lineTo(lastClearX + (ex.x - lastClearX) * 0.3, lastClearY + (ex.y - lastClearY) * 0.3);
    ctx.stroke();

    // "Go around" indicator at the blocked point
    ctx.shadowBlur = 12;
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(255,200,100,${0.5 + 0.5 * pulse})`;
    ctx.font = 'bold 18px Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚠', lastClearX, lastClearY - 12);
  }

  ctx.restore();
}

function drawEnemyPaths(g){
  if(!g.debug?.showEnemyPaths) return;
  ctx.save();
  for(const e of g.enemies){
    if(e.stuckTimer>0.75){
      ctx.strokeStyle='rgba(255,91,91,0.95)';
      ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(e.x,e.y,e.r+14,0,Math.PI*2); ctx.stroke();
    }
    if(g.debug.showEnemyPathingRadius){
      ctx.strokeStyle='rgba(255,255,255,0.24)';
      ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(e.x,e.y,e.pathingRadius || e.r,0,Math.PI*2); ctx.stroke();
    }
    if(g.debug.showRawEnemyPaths && e.rawPath && e.rawPath.length){
      ctx.strokeStyle='rgba(255,112,56,0.50)';
      ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(e.x,e.y);
      for(const p of e.rawPath) ctx.lineTo(p.x,p.y);
      ctx.stroke();
    }
    if(!e.path || e.pathIndex>=e.path.length) continue;
    ctx.strokeStyle=g.debug.showSmoothedEnemyPaths!==false ? 'rgba(93,255,154,0.58)' : 'rgba(93,255,154,0.32)';
    ctx.lineWidth=2.25;
    ctx.beginPath();
    ctx.moveTo(e.x,e.y);
    for(let i=e.pathIndex;i<e.path.length;i++) ctx.lineTo(e.path[i].x,e.path[i].y);
    ctx.stroke();
    if(g.debug.showCornerCurvePoints!==false){
      for(const p of e.path){
        if(!p.curve && !p.corner) continue;
        ctx.fillStyle=p.corner?'rgba(255,228,90,0.95)':'rgba(255,228,90,0.65)';
        ctx.beginPath(); ctx.arc(p.x,p.y,p.corner?4:2.6,0,Math.PI*2); ctx.fill();
      }
      if(e.pathClearanceFailures){
        ctx.strokeStyle='rgba(255,60,80,0.92)'; ctx.lineWidth=2;
        for(const f of e.pathClearanceFailures){
          ctx.beginPath(); ctx.moveTo(f.x-6,f.y-6); ctx.lineTo(f.x+6,f.y+6); ctx.moveTo(f.x+6,f.y-6); ctx.lineTo(f.x-6,f.y+6); ctx.stroke();
        }
      }
    }
    const wp=e.path[e.pathIndex];
    ctx.fillStyle='rgba(66,214,255,0.85)';
    ctx.beginPath(); ctx.arc(wp.x,wp.y,4,0,Math.PI*2); ctx.fill();
    if(g.debug.showEnemyLookaheadTargets!==false && e.currentLookaheadTarget){
      ctx.fillStyle=e.currentLookaheadTarget.clearanceAdjusted?'rgba(255,120,255,0.95)':'rgba(90,170,255,0.95)';
      ctx.beginPath(); ctx.arc(e.currentLookaheadTarget.x,e.currentLookaheadTarget.y,5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(90,170,255,0.42)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(e.x,e.y); ctx.lineTo(e.currentLookaheadTarget.x,e.currentLookaheadTarget.y); ctx.stroke();
    }
    if(g.debug.showPathFollowingOverlay && e.closestPathPoint){
      ctx.fillStyle='rgba(255,228,90,0.96)';
      ctx.beginPath(); ctx.arc(e.closestPathPoint.x,e.closestPathPoint.y,4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,140,60,0.78)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(e.x,e.y); ctx.lineTo(e.closestPathPoint.x,e.closestPathPoint.y); ctx.stroke();
      if(e.pathTangent){
        ctx.strokeStyle='rgba(120,255,220,0.78)'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(e.closestPathPoint.x,e.closestPathPoint.y); ctx.lineTo(e.closestPathPoint.x+e.pathTangent.x*26,e.closestPathPoint.y+e.pathTangent.y*26); ctx.stroke();
      }
      if(e.desiredVelocity){
        ctx.strokeStyle='rgba(93,255,154,0.82)'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(e.x,e.y); ctx.lineTo(e.x+e.desiredVelocity.x*0.16,e.y+e.desiredVelocity.y*0.16); ctx.stroke();
      }
      if(g.debug.showOfftrackDistanceOverlay){
        ctx.fillStyle='rgba(255,255,255,0.92)';
        ctx.font='700 11px Segoe UI, Arial';
        ctx.textAlign='center';
        ctx.fillText(`${(e.offtrackDistance||0).toFixed(1)}px`, e.x, e.y-(e.r||12)-20);
        ctx.fillText(e.pathFollowMode||'path', e.x, e.y-(e.r||12)-8);
      }
    }
    if(g.debug.showPathClearanceOverlay && e.pathUnsafeSections){
      ctx.strokeStyle='rgba(255,55,75,0.92)'; ctx.lineWidth=2;
      for(const u of e.pathUnsafeSections){
        ctx.beginPath(); ctx.moveTo(u.x-7,u.y-7); ctx.lineTo(u.x+7,u.y+7); ctx.moveTo(u.x+7,u.y-7); ctx.lineTo(u.x-7,u.y+7); ctx.stroke();
      }
    }
    if(e.cornerFallbackTarget){
      ctx.strokeStyle='rgba(220,70,255,0.92)'; ctx.lineWidth=2;
      ctx.strokeRect(e.cornerFallbackTarget.tx*TILE+4,e.cornerFallbackTarget.ty*TILE+4,TILE-8,TILE-8);
    }
    if(e.tunnelCentreBias){
      ctx.strokeStyle='rgba(126,249,255,0.45)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(e.x,e.y); ctx.lineTo(e.x+e.tunnelCentreBias.x*22,e.y+e.tunnelCentreBias.y*22); ctx.stroke();
    }
  }
  ctx.restore();
}

function drawBullets(g){
  for(const b of g.bullets){
    ctx.strokeStyle=b.color; ctx.fillStyle=b.color;
    ctx.lineWidth=b.rail?4:2;
    ctx.beginPath(); ctx.moveTo(b.x-b.vx*0.025,b.y-b.vy*0.025); ctx.lineTo(b.x,b.y); ctx.stroke();
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
  }
}



function drawBorecasterBombs(g){
  for(const b of g.borecasterBombs || []){
    const fuseRatio=clamp((b.fuseTime || 0)/(b.maxFuseTime || 1),0,1);
    if(!b.grounded){
      const markerSize=(b.blastRadius || 90)*2;
      drawSpriteCentered(ctx,'borecasterBombLandingMarker',b.landingX,b.landingY,markerSize,markerSize,{alpha:0.16+0.10*Math.sin(g.time*8),rotation:g.time*0.5,glowColor:'#ffcc4d',glowBlur:8});
    }
    ctx.save();
    ctx.strokeStyle='rgba(255,204,77,0.30)';
    ctx.lineWidth=2;
    ctx.beginPath();
    for(let i=0;i<b.trail.length;i++){
      const t=b.trail[i];
      if(i===0) ctx.moveTo(t.x,t.y); else ctx.lineTo(t.x,t.y);
    }
    ctx.stroke();
    for(const t of b.trail){
      drawSpriteCentered(ctx,'borecasterBombThrowTrail',t.x,t.y,24,24,{alpha:clamp(t.life/0.18,0,1)*0.28,rotation:b.rotation,additive:true});
    }
    ctx.translate(b.x,b.y);
    const pulse=0.5+0.5*Math.sin(g.time*18 + b.age*4);
    const size=b.grounded ? 28+2*pulse : 25;
    const drawn=drawSpriteCentered(ctx,'borecasterBombLit',0,0,size,size,{rotation:b.rotation,glowColor:fuseRatio<0.35?'#ff3d22':'#ffcc4d',glowBlur:fuseRatio<0.35?22:12});
    if(!drawn){
      ctx.fillStyle=fuseRatio<0.35?'#ff7038':'#ffcc4d';
      ctx.strokeStyle='#2b1a10';
      ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.fill(); ctx.stroke();
    }
    drawSpriteCentered(ctx,'borecasterBombFuseSpark',5,-11,14+5*pulse,14+5*pulse,{alpha:0.72+0.28*pulse,rotation:g.time*8,glowColor:'#ffecb3',glowBlur:14,additive:true});
    ctx.strokeStyle=`rgba(255,204,77,${0.25+0.35*(1-fuseRatio)})`;
    ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(0,0,18, -Math.PI/2, -Math.PI/2 + Math.PI*2*(1-fuseRatio)); ctx.stroke();
    ctx.restore();
  }
}

function drawEnemyBoomerangs(g){
  for(const b of g.enemyBoomerangs || []){
    ctx.save();
    ctx.strokeStyle='rgba(255,112,56,0.40)';
    ctx.lineWidth=2;
    ctx.beginPath();
    for(let i=0;i<b.trail.length;i++){
      const t=b.trail[i];
      if(i===0) ctx.moveTo(t.x,t.y); else ctx.lineTo(t.x,t.y);
    }
    ctx.stroke();
    const a=Math.atan2(b.vy,b.vx)+Math.PI/2+(b.spin||0);
    const drawn=drawSpriteCentered(ctx,'hexBoomerangProjectile',b.x,b.y,30,30,{
      rotation:a,
      glowColor:b.color || '#ff7038',
      glowBlur:14
    });
    if(!drawn){
      ctx.translate(b.x,b.y);
      ctx.rotate(a);
      ctx.fillStyle=b.color || '#ff7038';
      ctx.strokeStyle='rgba(255,235,185,0.85)';
      ctx.shadowColor=b.color || '#ff7038';
      ctx.shadowBlur=14;
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(0,-10); ctx.lineTo(8,2); ctx.lineTo(0,8); ctx.lineTo(-8,2); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }
}

function drawEnemyBullets(g){
  for(const b of g.enemyBullets){
    ctx.save();
    const angle=Math.atan2(b.vy,b.vx);
    // Phase 2.2: support custom boss projectile sprites
    let spriteId=b.spriteId || (b.destructive?'destructiveEnemyBullet':'enemyRedBullet');
    let size=b.spriteId ? b.r*2.2 : (b.destructive?24:(b.small?15:19));
    const drawn=drawSpriteCentered(ctx,spriteId,b.x,b.y,size,size,{
      rotation:angle,
      glowColor:b.color || '#ff3030',
      glowBlur:b.spriteId?14:(b.destructive?18:(b.small?8:12))
    });
    if(!drawn){
      ctx.fillStyle=b.color || '#ff3030';
      ctx.strokeStyle=b.destructive?'rgba(255,220,180,0.92)':'rgba(255,210,210,0.72)';
      ctx.shadowColor=b.color || '#ff3030';
      ctx.shadowBlur=b.destructive?18:(b.small?8:12);
      ctx.lineWidth=b.destructive?3:(b.small?1.5:2);
      ctx.beginPath();
      ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();
    }
    // All hostile bullets get a red trail for readability. Elite/boss shots are
    // larger and brighter; small-enemy shots stay small but still readable.
    ctx.strokeStyle=b.destructive?'rgba(255,220,180,0.92)':'rgba(255,80,80,0.72)';
    ctx.shadowColor=b.color || '#ff3030';
    ctx.shadowBlur=b.destructive?12:7;
    ctx.lineWidth=b.destructive?3:(b.small?1.5:2);
    ctx.beginPath();
    ctx.moveTo(b.x-b.vx*(b.destructive?0.040:0.030),b.y-b.vy*(b.destructive?0.040:0.030));
    ctx.lineTo(b.x+b.vx*0.008,b.y+b.vy*0.008);
    ctx.stroke();
    if(g.debug?.showEnemyBulletHitboxes){
      ctx.shadowBlur=0;
      ctx.strokeStyle='rgba(255,255,255,0.85)';
      ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.stroke();
    }
    ctx.restore();
  }
}

function drawMiningDebug(g){
  if(!g.debug?.showMiningArc || !g.debug.miningIntent) return;
  const d=g.debug.miningIntent;
  const p=g.player;
  ctx.save();

  // Intended movement vector: what the player asked for before collision.
  ctx.strokeStyle='rgba(66,214,255,0.85)';
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(d.x,d.y);
  ctx.lineTo(d.x+d.dx*58,d.y+d.dy*58);
  ctx.stroke();

  // Actual resolved movement vector: what collision permitted this frame.
  if(g.debug.actualMovement){
    const m=g.debug.actualMovement;
    ctx.strokeStyle='rgba(255,255,255,0.72)';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(m.x,m.y);
    ctx.lineTo(m.x+m.dx*14,m.y+m.dy*14);
    ctx.stroke();
  }

  // Mining fan/contact area.
  ctx.strokeStyle=g.debug.lowSpeedMiningActive?'rgba(255,204,77,0.72)':'rgba(66,214,255,0.45)';
  ctx.fillStyle=g.debug.lowSpeedMiningActive?'rgba(255,204,77,0.13)':'rgba(66,214,255,0.12)';
  ctx.lineWidth=2;
  const half=Math.PI*0.50;
  const base=Math.atan2(d.dy,d.dx);
  const r=(p.collisionR||p.r)+(g.debug.lowSpeedMiningActive?34:28);
  ctx.beginPath();
  ctx.moveTo(d.x,d.y);
  ctx.arc(d.x,d.y,r,base-half,base+half);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  if(g.debug.miningSamples){
    ctx.fillStyle='rgba(255,255,255,0.85)';
    for(const smp of g.debug.miningSamples){ ctx.beginPath(); ctx.arc(smp.x,smp.y,2.2,0,Math.PI*2); ctx.fill(); }
  }
  if(g.debug.miningSamplesPost){
    ctx.fillStyle='rgba(125,249,255,0.65)';
    for(const smp of g.debug.miningSamplesPost){ ctx.beginPath(); ctx.arc(smp.x,smp.y,1.7,0,Math.PI*2); ctx.fill(); }
  }

  // Candidate mineable tiles: cyan before collision, blue after collision.
  if(g.debug.showMiningCandidates!==false){
    if(g.debug.miningCandidates){
      ctx.lineWidth=1.5;
      for(const c of g.debug.miningCandidates){
        ctx.strokeStyle=c.touching?'rgba(255,204,77,0.65)':'rgba(66,214,255,0.45)';
        ctx.strokeRect(c.tx*TILE+5,c.ty*TILE+5,TILE-10,TILE-10);
      }
    }
    if(g.debug.miningCandidatesPost){
      ctx.lineWidth=1.25;
      for(const c of g.debug.miningCandidatesPost){
        ctx.strokeStyle='rgba(125,249,255,0.38)';
        ctx.strokeRect(c.tx*TILE+8,c.ty*TILE+8,TILE-16,TILE-16);
      }
    }
  }

  if(g.debug.currentMiningLock){
    const t=g.debug.currentMiningLock;
    ctx.strokeStyle='rgba(255,112,67,0.95)';
    ctx.lineWidth=4;
    ctx.setLineDash([6,4]);
    ctx.strokeRect(t.tx*TILE+2,t.ty*TILE+2,TILE-4,TILE-4);
    ctx.setLineDash([]);
  }
  if(g.debug.currentMiningTarget){
    const t=g.debug.currentMiningTarget;
    ctx.strokeStyle='rgba(255,255,255,0.95)';
    ctx.lineWidth=3;
    ctx.strokeRect(t.tx*TILE+3,t.ty*TILE+3,TILE-6,TILE-6);
  }

  ctx.fillStyle='rgba(255,255,255,0.88)';
  ctx.font='bold 12px Segoe UI, Arial';
  ctx.textAlign='left';
  const status=[];
  if(g.debug.lowSpeedMiningActive) status.push('LOW SPEED');
  if(g.debug.miningStickinessActive) status.push('STICKY LOCK');
  if(status.length) ctx.fillText(status.join(' · '), d.x+14, d.y-18);
  ctx.restore();
}

function drawTargetLocks(g){
  for(const l of g.targetLocks){
    const e=l.enemy;
    if(!e) continue;
    const alpha=clamp(l.life/l.maxLife,0,1);
    const pulse=0.5+0.5*Math.sin(g.time*16);
    ctx.save();
    ctx.translate(e.x,e.y-e.r-18);
    ctx.globalAlpha=alpha;
    const drawn=drawSpriteCentered(ctx,'targetLockReticle',0,0,34+5*pulse,34+5*pulse,{
      rotation:(l.spin||0)+g.time*1.8,
      alpha:0.82+0.18*pulse,
      glowColor:'#ff4949',
      glowBlur:12
    });
    if(!drawn){
      ctx.strokeStyle=`rgba(255,73,73,${0.55+0.35*pulse})`;
      ctx.fillStyle='rgba(255,73,73,0.10)';
      ctx.shadowColor='#ff4949';
      ctx.shadowBlur=12;
      ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(0,0,14+2*pulse,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-20,-4); ctx.lineTo(-12,-4); ctx.lineTo(-12,4); ctx.lineTo(-20,4);
      ctx.moveTo(20,-4); ctx.lineTo(12,-4); ctx.lineTo(12,4); ctx.lineTo(20,4);
      ctx.moveTo(-4,-20); ctx.lineTo(-4,-12); ctx.lineTo(4,-12); ctx.lineTo(4,-20);
      ctx.moveTo(-4,20); ctx.lineTo(-4,12); ctx.lineTo(4,12); ctx.lineTo(4,20);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawMissiles(g){
  for(const m of g.missiles){
    if(m.trail && m.trail.length>1){
      ctx.save();
      ctx.lineCap='round';
      for(let i=1;i<m.trail.length;i++){
        const a=i/m.trail.length;
        ctx.globalAlpha=a*0.45;
        ctx.strokeStyle='rgba(255,159,67,0.75)';
        ctx.lineWidth=1+a*3;
        ctx.beginPath();
        ctx.moveTo(m.trail[i-1].x,m.trail[i-1].y);
        ctx.lineTo(m.trail[i].x,m.trail[i].y);
        ctx.stroke();
      }
      ctx.restore();
    }
    const a=Math.atan2(m.vy,m.vx);
    ctx.save();
    ctx.strokeStyle=`rgba(255,159,67,${m.phase==='launch'?0.85:0.55})`;
    ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(m.x-Math.cos(a)*18,m.y-Math.sin(a)*18); ctx.lineTo(m.x-Math.cos(a)*5,m.y-Math.sin(a)*5); ctx.stroke();
    const drawn=drawSpriteCentered(ctx,'hammerfallMissile',m.x,m.y,28,14,{
      rotation:a,
      glowColor:m.phase==='launch'?'#ffcc4d':'#ff9f43',
      glowBlur:14
    });
    if(!drawn){
      ctx.translate(m.x,m.y);
      ctx.rotate(a);
      ctx.shadowColor=m.phase==='launch'?'#ffcc4d':'#ff9f43';
      ctx.shadowBlur=14;
      ctx.fillStyle='#ffdd80';
      ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(-8,-4.5); ctx.lineTo(-4,0); ctx.lineTo(-8,4.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(255,110,60,0.95)';
      ctx.beginPath(); ctx.arc(-11,0,3.8,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
}

function drawWardenDrones(g){
  for(const d of g.wardenDrones){
    ctx.save();
    ctx.translate(d.x,d.y);
    const a=Math.atan2(d.vy,d.vx || 1);
    ctx.rotate(a);
    const sprite = getSprite('wardenDrone');
    if(sprite){
      ctx.shadowColor='#d6a2ff'; ctx.shadowBlur=15;
      ctx.drawImage(sprite,-14,-14,28,28);
      ctx.shadowBlur=0;
      ctx.restore();
      continue;
    }
    ctx.shadowColor='#d6a2ff'; ctx.shadowBlur=15;
    ctx.fillStyle='#b46bff';
    ctx.beginPath();
    ctx.roundRect(-10,-7,20,14,5);
    ctx.fill();
    ctx.fillStyle='#f6e8ff';
    ctx.beginPath(); ctx.arc(3,-2,2.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.65)';
    ctx.fillRect(8,-2,9,4);
    ctx.shadowBlur=0;
    ctx.restore();
  }
}

function drawSifterDrones(g){
  for(const sw of g.sifterDrones){
    ctx.save();
    ctx.translate(sw.x,sw.y);
    const a=Math.atan2(sw.vy,sw.vx || 1);
    ctx.rotate(a);
    const sprite = getSprite('sifterDrone');
    if(sprite){
      ctx.shadowColor='#7df9ff'; ctx.shadowBlur=14;
      ctx.drawImage(sprite,-15,-15,30,30);
      ctx.shadowBlur=0;
      ctx.restore();
      continue;
    }
    ctx.shadowColor='#7df9ff'; ctx.shadowBlur=14;
    ctx.fillStyle='#30d7ff';
    ctx.beginPath();
    ctx.roundRect(-11,-6,22,12,6);
    ctx.fill();
    ctx.strokeStyle='rgba(220,255,255,0.9)';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.arc(-2,0,9,Math.PI*0.25,Math.PI*1.75);
    ctx.stroke();
    ctx.fillStyle='#eaffff';
    ctx.beginPath(); ctx.arc(5,-1,2.4,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(125,249,255,0.30)';
    ctx.beginPath(); ctx.arc(0,0,18+Math.sin(g.time*8+sw.phase)*2,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur=0;
    ctx.restore();
  }
}
function drawTraps(g){
  for(const tr of g.traps){
    const pulse = 0.5 + 0.5*Math.sin(g.time*7 + tr.age*3);
    ctx.save();
    ctx.translate(tr.x,tr.y);
    ctx.strokeStyle=tr.armed ? `rgba(255,204,77,${0.35+0.35*pulse})` : 'rgba(160,160,160,0.45)';
    ctx.fillStyle=tr.armed ? 'rgba(255,204,77,0.16)' : 'rgba(120,120,120,0.13)';
    ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(0,0,tr.triggerR,0,Math.PI*2); ctx.stroke();
    const drawn=drawSpriteCentered(ctx,'pathfinderTrap',0,0,34,34,{
      rotation:tr.age*0.35,
      alpha:tr.armed ? 1 : 0.62,
      glowColor:tr.armed ? '#ffcc4d' : null,
      glowBlur:tr.armed ? 10 : 0
    });
    if(!drawn){
      ctx.beginPath(); ctx.arc(0,0,11+2*pulse,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#ffcc4d';
      ctx.fillRect(-6,-2,12,4);
      ctx.fillRect(-2,-6,4,12);
    }
    ctx.restore();
  }
}

function drawBoomerangs(g){
  for(const b of g.boomerangs){
    ctx.save();
    ctx.translate(b.x,b.y);
    ctx.rotate(b.spin);
    ctx.strokeStyle=b.color;
    ctx.fillStyle='rgba(255,211,107,0.18)';
    ctx.shadowColor=b.color; ctx.shadowBlur=14;
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(-10,-6);
    ctx.quadraticCurveTo(0,-16,10,-6);
    ctx.quadraticCurveTo(0,-2,-10,-6);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10,6);
    ctx.quadraticCurveTo(0,16,-10,6);
    ctx.quadraticCurveTo(0,2,10,6);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur=0;
    ctx.restore();
  }
}
function drawPickups(g){
  for(const it of g.pickups){
    if(it.type==='health'){
      const bob = Math.sin((game?.time||0)*6 + it.x*0.01)*1.5;
      const scale = 1 + Math.sin((game?.time||0)*5)*0.1;
      drawHeartShape(it.x, it.y+bob, it.r*2.5*scale, '#ff6b8f', '#ff3d5f');
      continue;
    }
    const res = it.type==='xp' ? MINERALS.echo : MINERALS[it.type];
    const spriteId = res?.sprite;
    const color = res?.color || (it.type==='xp'?'#42d6ff':'#ff5b5b');
    const bob = Math.sin((game?.time||0)*6 + it.x*0.01)*1.5;
    if(spriteId && drawSpriteCentered(ctx,spriteId,it.x,it.y+bob,it.r*3.0,it.r*3.0,{
      glowColor:color,
      glowBlur:8
    })){
      continue;
    }
    ctx.fillStyle=color;
    ctx.shadowColor=ctx.fillStyle; ctx.shadowBlur=10;
    ctx.beginPath(); ctx.moveTo(it.x,it.y-it.r); ctx.lineTo(it.x+it.r,it.y); ctx.lineTo(it.x,it.y+it.r); ctx.lineTo(it.x-it.r,it.y); ctx.closePath(); ctx.fill(); ctx.shadowBlur=0;
  }
}

function drawHeartShape(x, y, size, fillColor, outlineColor){
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 2;
  ctx.shadowColor = fillColor;
  ctx.shadowBlur = 12;
  const s = size;
  ctx.beginPath();
  ctx.moveTo(x, y + s*0.3);
  ctx.bezierCurveTo(x-s*0.5, y-s*0.3, x-s*0.8, y-s*0.1, x-s*0.5, y+s*0.4);
  ctx.bezierCurveTo(x, y+s*0.7, x+s*0.5, y+s*0.4, x+s*0.8, y-s*0.1);
  ctx.bezierCurveTo(x+s*0.5, y-s*0.3, x, y+s*0.3, x, y+s*0.3);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawParticles(g){
  for(const p of g.particles){
    const alpha=clamp(p.life/p.maxLife,0,1);
    ctx.globalAlpha=alpha;
    if(p.shape==='ring'){
      ctx.strokeStyle=p.color;
      ctx.lineWidth=(p.lineWidth || 4) * Math.max(0.25, alpha);
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.stroke();
      continue;
    }
    if(p.shape==='sprite' && p.spriteId){
      const prevComp = ctx.globalCompositeOperation;
      if(p.additive) ctx.globalCompositeOperation='lighter';
      const ok = drawSpriteCentered(ctx,p.spriteId,p.x,p.y,p.size,p.size,{
        rotation:p.rotation || 0,
        alpha:alpha * (p.alphaMul ?? 1),
        glowColor:p.glowColor || null,
        glowBlur:p.glowBlur || 0
      });
      ctx.globalCompositeOperation = prevComp;
      if(ok) continue;
    }
    if(p.shape==='fragment'){
      const angle=Math.atan2(p.vy,p.vx)+p.life*6;
      if(drawSpriteCentered(ctx,'lavaFragmentDebris',p.x,p.y,p.size*2.4,p.size*2.4,{rotation:angle,alpha,glowColor:p.color,glowBlur:4})) continue;
    }
    if(p.shape==='spark'){
      ctx.strokeStyle=p.color;
      ctx.lineWidth=Math.max(1, p.size*0.45);
      ctx.beginPath();
      ctx.moveTo(p.x-p.vx*0.010, p.y-p.vy*0.010);
      ctx.lineTo(p.x+p.vx*0.016, p.y+p.vy*0.016);
      ctx.stroke();
      continue;
    }
    ctx.fillStyle=p.color;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha=1;
}
function drawArcs(g){
  for(const a of g.arcs){
    const alpha=clamp(a.life/a.maxLife,0,1);
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.strokeStyle=a.color;
    ctx.shadowColor=a.color;
    ctx.shadowBlur=14;
    ctx.lineWidth=(a.width || 3) * Math.max(0.35, alpha);
    ctx.beginPath();
    const segments=7;
    for(let i=0;i<=segments;i++){
      const t=i/segments;
      const x=lerp(a.x1,a.x2,t)+rand(-7,7)*(1-Math.abs(0.5-t)*1.6);
      const y=lerp(a.y1,a.y2,t)+rand(-7,7)*(1-Math.abs(0.5-t)*1.6);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.lineWidth=1;
    ctx.strokeStyle='rgba(235,255,255,0.95)';
    ctx.stroke();
    ctx.restore();
  }
}
function drawTexts(g){
  ctx.font='bold 14px Segoe UI, Arial'; ctx.textAlign='center';
  for(const t of g.texts){
    ctx.globalAlpha=clamp(t.life/t.maxLife,0,1); ctx.fillStyle=t.color; ctx.fillText(t.text,t.x,t.y);
  }
  ctx.globalAlpha=1;
}

function drawFogOfWar(g,cam,sx=0,sy=0){
  const settings=getFogSettings();
  if(!settings.fogOfWarEnabled || !g?.player) return;

  // Keep the first implementation cheap: one full-screen radial gradient. If
  // adaptive performance is under pressure, avoid extra texture/noise work and
  // simply draw the soft radial overlay.
  const p=g.player;
  const cx=p.x-cam.x+sx;
  const cy=p.y-cam.y+sy;
  const radius=settings.fogOfWarRadius;
  const soft=settings.fogOfWarSoftEdge;
  const outer=radius+soft;
  const intensity=clamp(settings.fogOfWarIntensity,0,0.95);
  const perf=g.performance?.state;
  const perfTrim=perf===PERF_STATES.CRITICAL ? 0.92 : perf===PERF_STATES.WARNING ? 0.97 : 1;
  const outerAlpha=intensity*perfTrim;

  const gradient=ctx.createRadialGradient(cx,cy,Math.max(1,radius*0.35),cx,cy,outer);
  gradient.addColorStop(0,'rgba(0,0,0,0)');
  gradient.addColorStop(Math.max(0.05, radius/outer),'rgba(3,8,16,0.02)');
  gradient.addColorStop(Math.min(0.98,(radius+soft*0.55)/outer),`rgba(3,8,16,${outerAlpha*0.50})`);
  gradient.addColorStop(1,`rgba(0,0,0,${outerAlpha})`);

  ctx.save();
  ctx.fillStyle=gradient;
  ctx.fillRect(0,0,innerWidth,innerHeight);

  // Atmospheric soft blue rim around the visibility boundary. This is a single
  // stroke and remains performance-safe.
  ctx.globalAlpha=0.16;
  ctx.strokeStyle='rgba(66,214,255,0.42)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(cx,cy,radius+soft*0.24,0,Math.PI*2);
  ctx.stroke();
  ctx.restore();
}

function drawFogDebugOverlay(g,cam,sx=0,sy=0){
  if(!g.debug?.showFogRadius || !g?.player) return;
  const settings=getFogSettings();
  const cx=g.player.x-cam.x+sx;
  const cy=g.player.y-cam.y+sy;
  ctx.save();
  ctx.strokeStyle='rgba(93,255,154,0.85)';
  ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(cx,cy,settings.fogOfWarRadius,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle='rgba(66,214,255,0.55)';
  ctx.setLineDash([8,6]);
  ctx.beginPath(); ctx.arc(cx,cy,settings.fogOfWarRadius+settings.fogOfWarSoftEdge,0,Math.PI*2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,255,255,0.86)';
  ctx.font='bold 12px Segoe UI, Arial';
  ctx.textAlign='left';
  ctx.fillText(`Fog ${settings.fogOfWarEnabled?'ON':'OFF'} · R ${settings.fogOfWarRadius} · Soft ${settings.fogOfWarSoftEdge}`,cx+18,cy-settings.fogOfWarRadius-12);
  ctx.restore();
}

function drawVignette(){
  const grd=ctx.createRadialGradient(innerWidth/2,innerHeight/2,innerHeight*0.15,innerWidth/2,innerHeight/2,innerWidth*0.72);
  grd.addColorStop(0,'rgba(0,0,0,0)'); grd.addColorStop(1,'rgba(0,0,0,0.58)');
  ctx.fillStyle=grd; ctx.fillRect(0,0,innerWidth,innerHeight);
}

function drawEnemyBudgetOverlay(g){
  if(!g.debug?.showEnemyBudget || !g.performance) return;
  const p=g.performance;
  ctx.save();
  ctx.font='12px Consolas, monospace';
  ctx.textAlign='left';
  ctx.fillStyle='rgba(0,0,0,0.68)';
  ctx.fillRect(14, innerHeight-170, 310, 144);
  ctx.fillStyle='#d7ecff';
  const lines=[
    `FPS ${p.currentFPS.toFixed(1)}  AVG ${p.averageFPS.toFixed(1)}  ${p.state.replace('PERF_','')}`,
    `Enemies ${g.enemies.length}/${g.enemyBudget.currentMaxEnemies}  Bullets ${g.enemyBullets.length}/${getEnemyBulletCap(g)}`,
    `Spawn x${p.spawnRateMultiplier.toFixed(2)}  Swarm x${p.swarmSizeMultiplier.toFixed(2)}`,
    `Budget ${p.budgetFactor.toFixed(2)}  VFX ${p.vfxFactor.toFixed(2)}`,
    `Skipped spawns ${p.skippedSpawns||0} bullets ${p.skippedBullets||0}`,
    `Perf despawned ${p.enemiesDespawned||0}`
  ];
  for(let i=0;i<lines.length;i++) ctx.fillText(lines[i],24,innerHeight-144+i*20);
  ctx.restore();
}

function drawPause(){
  ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,0,innerWidth,innerHeight);
  ctx.fillStyle='#fff'; ctx.font='900 42px Segoe UI'; ctx.textAlign='center'; ctx.fillText('PAUSED',innerWidth/2,innerHeight/2);
}

function gameOver(g){
  if(g.state==='dead') return;
  if(typeof failRun === 'function'){
    failRun(g,'Operator vitals collapsed before extraction.');
    return;
  }
  g.state='dead';
  sfx('gameover');
  ui.gameOverText.innerHTML=`You survived <b>${ui.timer.textContent}</b>, reached <b>Level ${g.level}</b>, mined <b>${g.gold} Gild Shards</b> and <b>${g.nitra} Voltarite</b>, and killed <b>${g.kills}</b> Hollowborn.`;
  ui.gameOverOverlay.classList.add('show');
}

function setupClassCards(){
  ui.classCards.innerHTML='';
  for(const cls of CLASSES){
    const div=document.createElement('div');
    div.className='card';
    div.dataset.classId=cls.id;
    div.setAttribute('role','button');
    div.setAttribute('tabindex','0');
    const iconHtml = cls.spriteId ? spriteIconHtml(cls.spriteId, cls.icon) : cls.icon;
    div.innerHTML=`<div class="icon">${iconHtml}</div><h3>${cls.name}</h3><p>${cls.desc}</p><span class="tag">${cls.tag}</span>`;
    ui.classCards.appendChild(div);
  }
}

function getClassById(id){
  return CLASSES.find(c=>c.id===id) || CLASSES[0];
}

function showDebugError(title, err){
  console.error(title, err);
  let box=document.getElementById('debugBox');
  if(!box){
    box=document.createElement('pre');
    box.id='debugBox';
    box.className='debugBox';
    document.body.appendChild(box);
  }
  const message = err && (err.stack || err.message) ? (err.stack || err.message) : String(err);
  box.textContent = `${title}\n\n${message}\n\nOpen the browser console with F12 for full details.`;
}

function startGame(clsOrId){
  try{
    startRunWithClass(clsOrId);
    const box=document.getElementById('debugBox');
    if(box) box.remove();
  }catch(err){
    showDebugError('Failed to start mission after class selection.', err);
  }
}

function bindStartCardInput(){
  ui.classCards.addEventListener('click', ev=>{
    const card=ev.target.closest('.card[data-class-id]');
    if(card) startGame(card.dataset.classId);
  });
  ui.classCards.addEventListener('keydown', ev=>{
    if(ev.code==='Enter' || ev.code==='Space'){
      const card=ev.target.closest('.card[data-class-id]');
      if(card){ ev.preventDefault(); startGame(card.dataset.classId); }
    }
  });
}

window.startGame=startGame;
window.restartGame=function(){ startGame(game?.selectedClass || CLASSES[0]); };
window.showStart=function(){ showClassSelect(); };



function drawScaledTileDebug(g,cam){
  if(!g?.debug?.showScaledTileGrid && !g?.debug?.showCollisionTiles) return;
  const minx=clamp(Math.floor(cam.x/TILE)-1,0,MAP_W-1), maxx=clamp(Math.ceil((cam.x+innerWidth)/TILE)+1,0,MAP_W-1);
  const miny=clamp(Math.floor(cam.y/TILE)-1,0,MAP_H-1), maxy=clamp(Math.ceil((cam.y+innerHeight)/TILE)+1,0,MAP_H-1);
  ctx.save();
  if(g.debug.showScaledTileGrid){
    ctx.strokeStyle='rgba(100,232,255,0.20)';
    ctx.lineWidth=1;
    for(let x=minx;x<=maxx+1;x++){
      ctx.beginPath(); ctx.moveTo(x*TILE,miny*TILE); ctx.lineTo(x*TILE,(maxy+1)*TILE); ctx.stroke();
    }
    for(let y=miny;y<=maxy+1;y++){
      ctx.beginPath(); ctx.moveTo(minx*TILE,y*TILE); ctx.lineTo((maxx+1)*TILE,y*TILE); ctx.stroke();
    }
  }
  if(g.debug.showCollisionTiles){
    for(let y=miny;y<=maxy;y++) for(let x=minx;x<=maxx;x++){
      const t=g.tiles[tileIdx(x,y)];
      if(!isSolid(t)) continue;
      ctx.strokeStyle=t===TILE_HARD?'rgba(255,255,255,0.35)':(t===TILE_LAVA_ROCK?'rgba(255,112,56,0.50)':'rgba(255,204,77,0.30)');
      ctx.lineWidth=2;
      ctx.strokeRect(x*TILE+2,y*TILE+2,TILE-4,TILE-4);
    }
  }
  ctx.restore();
}

function drawTileScaleInfoOverlay(g){
  if(!g?.debug?.showScaledTileGrid && !g?.debug?.showCollisionTiles) return;
  const [ptx,pty]=worldToTile(g.player.x,g.player.y);
  const nearest=g.enemies?.[0];
  const enemyTile=nearest ? worldToTile(nearest.x,nearest.y).join(',') : '-';
  const lines=[
    `Tile base: ${TILE_SIZE_BASE}px`,
    `Tile scale: ${TILE_SIZE_SCALE}x`,
    `Effective tile: ${TILE}px`,
    `Map pixels: ${WORLD_W} x ${WORLD_H}`,
    `Player tile: ${ptx},${pty}`,
    `First enemy tile: ${enemyTile}`
  ];
  ctx.save();
  ctx.font='12px Consolas, Monaco, monospace';
  ctx.textAlign='left';
  const x=14, y=innerHeight-258;
  ctx.fillStyle='rgba(0,0,0,0.66)';
  ctx.fillRect(x-8,y-16,260,lines.length*16+18);
  ctx.fillStyle='#b7f7ff';
  for(let i=0;i<lines.length;i++) ctx.fillText(lines[i],x,y+i*16);
  ctx.restore();
}

function drawControllerDebugOverlay(g){
  if(!g?.debug?.showController) return;
  const lines=[
    `Gamepad: ${gamepadState.connected ? gamepadState.id : 'not connected'}`,
    `Left: ${Number(gamepadState.leftX||0).toFixed(2)}, ${Number(gamepadState.leftY||0).toFixed(2)}`,
    `Right raw 2/3: ${Number(gamepadState.rightX||0).toFixed(2)}, ${Number(gamepadState.rightY||0).toFixed(2)}`,
    `Cursor axis pair: ${game?.controllerCursor?.axisPair ? game.controllerCursor.axisPair.join('/') : 'none'}`,
    `Cursor: ${Math.round(mouse.x)}, ${Math.round(mouse.y)}`,
    `World: ${Math.round(mouseWorld(g).x)}, ${Math.round(mouseWorld(g).y)}`,
    `Manual aim: ${manualAimActive(g) ? 'ON' : 'AUTO'}`,
    `Upgrade index: ${g.upgradeMenuState?.selectedIndex ?? '-'}`,
    `Accuracy: ${Math.round((g.player.accuracy ?? 0.35)*100)}%`
  ];
  ctx.save();
  ctx.font='12px Consolas, Monaco, monospace';
  ctx.textAlign='left';
  const x=14, y=innerHeight-150;
  ctx.fillStyle='rgba(0,0,0,0.64)';
  ctx.fillRect(x-8,y-16,360,lines.length*16+18);
  ctx.fillStyle='#b7f7ff';
  for(let i=0;i<lines.length;i++) ctx.fillText(lines[i],x,y+i*16);
  ctx.restore();
}

function drawAccuracyCone(g){
  if(!g?.debug?.showAccuracyCone || !g.player) return;
  const p=g.player;
  const target=nearestEnemy(g,p.x,p.y,720);
  if(!target) return;
  const spread=weaponSpreadRadians(p.accuracy ?? 0.35);
  const base=Math.atan2(target.y-p.y,target.x-p.x);
  const length=360;
  ctx.save();
  ctx.translate(-g.camera.x,-g.camera.y);
  ctx.strokeStyle='rgba(255,220,128,0.55)';
  ctx.fillStyle='rgba(255,220,128,0.08)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(p.x,p.y);
  ctx.lineTo(p.x+Math.cos(base-spread)*length,p.y+Math.sin(base-spread)*length);
  ctx.arc(p.x,p.y,length,base-spread,base+spread);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/*
 * Phase 2.2: Boss UI Rendering
 *
 * Four drawing functions called from render():
 *   drawBossHealthBar(g)     — Top-center bar with phase markers
 *   drawBossName(g)          — Dramatic name display on spawn
 *   drawWeakPointHighlight(g) — Glowing weak point circle on boss
 *   drawBossCrystalRainIndicators(g) — Floor markers for crystal rain
 */

function drawBossHealthBar(g){
  if(!g || !g.bossSpawned || g.bossDefeated) return;
  // Find the boss enemy
  const boss = g.enemies.find(e => e.role === 'boss' && e.hp > 0);
  if(!boss) return;
  const bossDef = BOSS_TYPES[g.bossType];
  if(!bossDef) return;

  const hpPct = clamp(boss.hp / boss.maxHp, 0, 1);
  const barW = 380;
  const barH = 28;
  const x = (innerWidth - barW) / 2;
  const y = 12;

  ctx.save();

  // Background frame sprite (fallback to procedural if sprite missing)
  const frameDrawn = drawSpriteCentered(ctx, 'bossHealthBarFrame', x + barW/2, y + barH/2, barW + 12, barH + 16, {
    alpha: 0.85,
    glowColor: bossDef.color,
    glowBlur: 6
  });
  if(!frameDrawn){
    // Procedural fallback background
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(x - 4, y - 4, barW + 8, barH + 8, 12);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = bossDef.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = bossDef.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(x - 2, y - 2, barW + 4, barH + 4, 10);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // HP fill (always procedural — the bar itself fills over the frame)
  const gradient = ctx.createLinearGradient(x, y, x + barW, y);
  if(boss.bossPhase >= 2){
    gradient.addColorStop(0, '#ff3030');
    gradient.addColorStop(0.5, '#ff6060');
    gradient.addColorStop(1, '#ff3030');
  } else if(boss.bossPhase >= 1){
    gradient.addColorStop(0, '#ff8a5b');
    gradient.addColorStop(0.5, '#ffb84d');
    gradient.addColorStop(1, '#ff8a5b');
  } else {
    gradient.addColorStop(0, '#ff5b5b');
    gradient.addColorStop(0.5, '#ff8a5b');
    gradient.addColorStop(1, '#ff5b5b');
  }
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(x, y, barW * hpPct, barH, 8);
  ctx.fill();

  // Phase markers on bar (at 66% and 33%)
  const markers = [0.66, 0.33];
  for(const m of markers){
    const mx = x + barW * (1 - m);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(mx, y - 4);
    ctx.lineTo(mx, y + barH + 4);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Inter, Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(m === 0.66 ? 'P2' : 'P3', mx, y + barH + 18);
  }

  // Boss name above bar
  ctx.fillStyle = bossDef.color;
  ctx.shadowColor = bossDef.color;
  ctx.shadowBlur = 8;
  ctx.font = 'bold 15px Inter, Segoe UI, Arial';
  ctx.textAlign = 'center';
  const phaseText = boss.bossPhase >= 2 ? ' ⚡ENRAGE' : (boss.bossPhase >= 1 ? ` • Phase ${boss.bossPhase + 1}` : '');
  ctx.fillText(`${bossDef.icon} ${bossDef.name}${phaseText}`, innerWidth / 2, y - 8);
  ctx.shadowBlur = 0;

  // HP percentage text
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px Inter, Segoe UI, Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(hpPct * 100)}%`, x + barW / 2, y + barH / 2 + 5);

  ctx.restore();
}

/*
 * Boss name display — appears dramatically when boss spawns.
 * Fades out after 3 seconds.
 */
function drawBossName(g){
  if(!g || !g.bossNameDisplay) return;
  const bnd = g.bossNameDisplay;
  // Skip rendering if completely faded out (timer <= 0)
  if(bnd.timer <= 0) return;
  // Alpha: full opacity for first half of timer, then fade out over last 1.5 seconds
  const alpha = bnd.fadeOut ? clamp(bnd.timer / 1.5, 0, 1) : 1;
  // Also hide if the boss is already dead
  const bossAlive = g.enemies && g.enemies.some(e => e.role === 'boss' && e.hp > 0);
  if(!bossAlive && !bnd.fadeOut){
    // Boss died before name faded — force immediate fade
    bnd.fadeOut = true;
  }
  if(alpha <= 0) return;
  const bossDef = BOSS_TYPES[Object.keys(BOSS_TYPES).find(k => BOSS_TYPES[k].name === bnd.text)];
  const color = bossDef?.color || '#ff4fd8';

  ctx.save();
  ctx.globalAlpha = alpha;

  // Background banner
  const text = `🔥 BOSS: ${bnd.text}`;
  ctx.font = 'bold 42px Inter, Segoe UI, Arial';
  ctx.textAlign = 'center';
  const metrics = ctx.measureText(text);
  const bw = metrics.width + 80;
  const bx = (innerWidth - bw) / 2;
  const by = innerHeight / 2 - 80;

  // Sprite-based name plate background (fallback to procedural)
  const plateDrawn = drawSpriteCentered(ctx, 'bossNamePlate', innerWidth / 2, by + 16, bw + 32, 80, {
    alpha: 0.92,
    glowColor: color,
    glowBlur: 14
  });
  if(!plateDrawn){
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(bx - 8, by - 16, bw + 16, 72, 16);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.roundRect(bx - 8, by - 16, bw + 16, 72, 16);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.fillText(text, innerWidth / 2, by + 38);

  // Subtitle
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Inter, Segoe UI, Arial';
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#000';
  ctx.fillText('Prepare for combat.', innerWidth / 2, by + 72);

  ctx.restore();
}

/*
 * Weak Point Highlight — glowing circle on the boss when weak point is active.
 */
function drawWeakPointHighlight(g){
  if(!g || !g.bossWeakPoint?.active) return;
  const wp = g.bossWeakPoint;
  const bossDef = BOSS_TYPES[g.bossType];

  ctx.save();

  const pulse = 0.6 + 0.4 * Math.sin(g.time * 10);
  const glowRadius = wp.radius * (1 + 0.3 * pulse);

  // Sprite-based weak point indicator (fallback to procedural glow)
  const wpDrawn = drawSpriteCentered(ctx, 'bossWeakPoint', wp.x, wp.y, glowRadius * 2.4, glowRadius * 2.4, {
    rotation: g.time * 1.5,
    alpha: 0.7 + 0.3 * pulse,
    glowColor: '#42d6ff',
    glowBlur: 24
  });

  if(!wpDrawn){
    // Multiple layered circles for glow effect
    ctx.shadowColor = '#42d6ff';
    ctx.shadowBlur = 30;
    ctx.strokeStyle = `rgba(66,214,255,${0.5 + 0.4 * pulse})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(wp.x, wp.y, glowRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 18;
    ctx.strokeStyle = `rgba(66,214,255,${0.7 + 0.3 * pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(wp.x, wp.y, glowRadius * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    // Inner fill
    ctx.shadowBlur = 12;
    ctx.fillStyle = `rgba(66,214,255,${0.15 + 0.12 * pulse})`;
    ctx.beginPath();
    ctx.arc(wp.x, wp.y, wp.radius, 0, Math.PI * 2);
    ctx.fill();

    // Crosshair marks
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(66,214,255,${0.6 + 0.3 * pulse})`;
    ctx.lineWidth = 2;
    const ch = wp.radius * 0.6;
    for(const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      ctx.beginPath();
      ctx.moveTo(wp.x + dx * ch * 0.4, wp.y + dy * ch * 0.4);
      ctx.lineTo(wp.x + dx * ch, wp.y + dy * ch);
      ctx.stroke();
    }
  }

  // "⚡ WEAK POINT" floating text
  const textAlpha = 0.7 + 0.3 * pulse;
  ctx.fillStyle = `rgba(66,214,255,${textAlpha})`;
  ctx.shadowColor = '#42d6ff';
  ctx.shadowBlur = 14;
  ctx.font = 'bold 14px Inter, Segoe UI, Arial';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ WEAK POINT', wp.x, wp.y - wp.radius - 14);

  ctx.restore();
}

/*
 * Crystal Rain Indicators — floor markers showing where crystals will fall.
 */
function drawBossCrystalRainIndicators(g){
  if(!g || !g.bossCrystalRainIndicators || !g.bossCrystalRainIndicators.length) return;
  ctx.save();
  for(const ind of g.bossCrystalRainIndicators){
    const pulse = 0.5 + 0.5 * Math.sin(g.time * 12 + ind.x + ind.y);
    const alpha = clamp(ind.timer / ind.maxTimer, 0, 1);
    const radius = 18 + 6 * pulse;

    // Sprite-based indicator (fallback to procedural)
    const indDrawn = drawSpriteCentered(ctx, 'crystalRainIndicator', ind.x, ind.y, radius * 2, radius * 2, {
      rotation: -g.time * 0.8,
      alpha: 0.5 + 0.3 * alpha * pulse,
      glowColor: '#b46bff',
      glowBlur: 14
    });

    if(!indDrawn){
      ctx.shadowColor = '#b46bff';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = `rgba(180,107,255,${0.5 + 0.3 * pulse * alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ind.x, ind.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(180,107,255,${0.08 * alpha})`;
      ctx.beginPath();
      ctx.arc(ind.x, ind.y, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Diagonal cross
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(180,107,255,${0.4 * alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ind.x - radius * 0.4, ind.y - radius * 0.4);
      ctx.lineTo(ind.x + radius * 0.4, ind.y + radius * 0.4);
      ctx.moveTo(ind.x + radius * 0.4, ind.y - radius * 0.4);
      ctx.lineTo(ind.x - radius * 0.4, ind.y + radius * 0.4);
      ctx.stroke();
    }
  }
  ctx.restore();
}


EchoVein/js/systems.js:
'use strict';

/* Gameplay update systems: movement, mining, weapons, enemies, drones, traps, pickups, XP, upgrades, and particles. */


function updatePerformanceMonitor(g,rawDt){
  if(!g || !g.performance) return;
  const perf=g.performance;
  const frameTimeMs=rawDt*1000;
  const fps=rawDt>0 ? 1/rawDt : 60;
  perf.currentFPS=fps;
  perf.frameTimeMs=frameTimeMs;
  perf.samples.push({dt:rawDt, ms:frameTimeMs});
  perf.sampleTotal+=rawDt;
  while(perf.samples.length && perf.sampleTotal>PERFORMANCE_CONFIG.sampleWindowSeconds){
    const old=perf.samples.shift();
    perf.sampleTotal-=old.dt;
  }
  if(perf.samples.length){
    const avgDt=perf.samples.reduce((a,b)=>a+b.dt,0)/perf.samples.length;
    perf.averageFrameTimeMs=avgDt*1000;
    perf.averageFPS=avgDt>0 ? 1/avgDt : 60;
  }
}

function updatePerformanceBudgets(g,dt){
  const perf=g.performance;
  if(!perf) return;
  const forced=g.debug?.forcePerformanceState;
  const avg=perf.averageFPS || 60;
  perf.previousState=perf.state;
  perf.forced=!!forced;
  if(forced){
    perf.state=forced;
  } else if(perf.state===PERF_STATES.CRITICAL){
    if(avg>=PERFORMANCE_CONFIG.recoveryFps){
      perf.recoveryTimer+=dt;
      if(perf.recoveryTimer>=PERFORMANCE_CONFIG.recoveryHoldSeconds){ perf.state=PERF_STATES.RECOVERING; perf.recoveryTimer=0; }
    } else perf.recoveryTimer=0;
  } else if(perf.state===PERF_STATES.RECOVERING){
    if(avg>=PERFORMANCE_CONFIG.healthyFps){
      perf.healthyTimer+=dt;
      if(perf.healthyTimer>=PERFORMANCE_CONFIG.healthyHoldSeconds){ perf.state=PERF_STATES.HEALTHY; perf.healthyTimer=0; }
    } else if(avg<PERFORMANCE_CONFIG.criticalFps){
      perf.state=PERF_STATES.CRITICAL; perf.healthyTimer=0;
    } else perf.healthyTimer=0;
  } else if(avg<PERFORMANCE_CONFIG.criticalFps){
    perf.state=PERF_STATES.CRITICAL;
  } else if(avg<PERFORMANCE_CONFIG.healthyFps){
    perf.state=PERF_STATES.WARNING;
  } else {
    perf.state=PERF_STATES.HEALTHY;
  }

  if(perf.state!==perf.previousState){
    if(perf.state===PERF_STATES.WARNING) log(g,'Swarm pressure stabilising...');
    else if(perf.state===PERF_STATES.CRITICAL) log(g,'Enemy pressure reduced for performance.');
    else if(perf.state===PERF_STATES.RECOVERING) log(g,'Performance recovering; spawning resumes gradually.');
    else if(perf.state===PERF_STATES.HEALTHY) log(g,'Performance recovered.');
  }

  if(perf.state===PERF_STATES.HEALTHY){
    perf.budgetFactor=1; perf.vfxFactor=1; perf.spawnRateMultiplier=1; perf.swarmSizeMultiplier=1;
  } else if(perf.state===PERF_STATES.WARNING){
    perf.budgetFactor=0.70; perf.vfxFactor=0.70; perf.spawnRateMultiplier=0.70; perf.swarmSizeMultiplier=0.75;
  } else if(perf.state===PERF_STATES.CRITICAL){
    perf.budgetFactor=0.40; perf.vfxFactor=0.40; perf.spawnRateMultiplier=0; perf.swarmSizeMultiplier=0;
  } else {
    const t=clamp(perf.healthyTimer/PERFORMANCE_CONFIG.healthyHoldSeconds,0,1);
    perf.budgetFactor=lerp(0.60,1.00,t); perf.vfxFactor=lerp(0.60,1.00,t); perf.spawnRateMultiplier=lerp(0.45,1.00,t); perf.swarmSizeMultiplier=lerp(0.55,1.00,t);
  }
  const pressure=g.hollowPressure || 0;
  const mission=g.missionIndex || 1;
  const timeScale=clamp(1+g.time/540,1,1.7);
  const difficultyCap=PERFORMANCE_CONFIG.baseMaxEnemies + pressure*10 + (mission-1)*6;
  const cap=Math.max(PERFORMANCE_CONFIG.minMaxEnemies, Math.floor(difficultyCap*timeScale*perf.budgetFactor));
  g.enemyBudget.currentMaxEnemies=cap;
  if(perf.state===PERF_STATES.CRITICAL) performanceDespawnLowPriorityEnemies(g,dt);
  updatePerformanceDebugPanel(g);
}

function performanceDespawnLowPriorityEnemies(g,dt){
  const perf=g.performance;
  const cap=g.enemyBudget?.currentMaxEnemies || PERFORMANCE_CONFIG.minMaxEnemies;
  if(g.enemies.length<=cap) return;
  perf.despawnAccumulator=(perf.despawnAccumulator||0)+dt*PERFORMANCE_CONFIG.criticalDespawnPerSecond;
  let quota=Math.floor(perf.despawnAccumulator);
  if(quota<=0) return;
  perf.despawnAccumulator-=quota;
  const p=g.player;
  const cam=g.camera || {x:0,y:0};
  const candidates=[];
  for(let i=0;i<g.enemies.length;i++){
    const e=g.enemies[i];
    if(!e || e.hp<=0 || e.type==='boss' || e.type==='elite') continue;
    const d2=dist2(p.x,p.y,e.x,e.y);
    if(d2<PERFORMANCE_CONFIG.despawnDistance*PERFORMANCE_CONFIG.despawnDistance) continue;
    const margin=PERFORMANCE_CONFIG.cameraMargin;
    const visible=e.x>cam.x-margin && e.x<cam.x+innerWidth+margin && e.y>cam.y-margin && e.y<cam.y+innerHeight+margin;
    if(visible) continue;
    candidates.push({i,d2,type:e.type});
  }
  candidates.sort((a,b)=>b.d2-a.d2);
  let removed=0;
  for(const c of candidates){
    if(removed>=quota || g.enemies.length<=cap) break;
    g.enemies.splice(c.i-removed,1);
    removed++;
  }
  if(removed){
    perf.enemiesDespawned+=removed;
    if(g.debug?.perfDespawnLog) log(g,`Performance despawned ${removed} distant enemies.`);
  }
}

function getEnemyBulletCap(g){
  const state=g.performance?.state || PERF_STATES.HEALTHY;
  if(state===PERF_STATES.CRITICAL) return PERFORMANCE_CONFIG.maxEnemyBulletsCritical;
  if(state===PERF_STATES.WARNING) return PERFORMANCE_CONFIG.maxEnemyBulletsWarning;
  if(state===PERF_STATES.RECOVERING) return PERFORMANCE_CONFIG.maxEnemyBulletsRecovering;
  return PERFORMANCE_CONFIG.maxEnemyBulletsHealthy;
}

function canSpawnNormalEnemy(g,type,count=1){
  const perf=g.performance;
  if(!perf) return true;
  const important=type==='boss';
  if(important) return true;
  if(perf.state===PERF_STATES.CRITICAL){ perf.skippedSpawns=(perf.skippedSpawns||0)+count; return false; }
  const cap=g.enemyBudget?.currentMaxEnemies || PERFORMANCE_CONFIG.baseMaxEnemies;
  if(g.enemies.length>=cap){ perf.skippedSpawns=(perf.skippedSpawns||0)+count; return false; }
  if(type==='elite' && perf.state===PERF_STATES.WARNING && g.enemies.length>cap*0.85){ perf.skippedSpawns=(perf.skippedSpawns||0)+count; return false; }
  return true;
}

function performanceAdjustedCount(g,count,swarm=false){
  const perf=g.performance;
  if(!perf) return Math.max(0,Math.floor(count));
  const mul=swarm ? perf.swarmSizeMultiplier : perf.spawnRateMultiplier;
  return Math.max(0,Math.floor(count*mul));
}

function shouldEmitVfx(g,important=false){
  if(g?.debug?.forceFullVfx) return true;
  if(important || !g?.performance) return true;
  const ok = Math.random() <= (g.performance.vfxFactor ?? 1);
  if(!ok && g.debug) g.debug.vfxSkipped=(g.debug.vfxSkipped||0)+1;
  return ok;
}

function updateVfxDebugMetrics(g){
  // Safe runtime/debug helper. It is intentionally defined in systems.js because
  // updatePerformanceDebugPanel() can run before the debug panel is opened.
  // If the VFX debug metrics DOM does not exist yet, this function must no-op.
  const box=document.getElementById('debugVfxMetrics');
  if(!box || !g) return;
  const perf=g.performance || {};
  const particles=g.particles || [];
  const spriteVfx=particles.filter(p=>p.shape==='sprite').length;
  const proceduralVfx=particles.length - spriteVfx;
  const skipped=g.debug?.vfxSkipped || 0;
  const last=g.debug?.lastVfxComposition || 'none';
  const budget=(perf.vfxFactor ?? 1);
  box.textContent = [
    `Active sprite VFX: ${spriteVfx}`,
    `Procedural particles: ${proceduralVfx}`,
    `Total particles: ${particles.length}`,
    `Performance state: ${perf.state || 'unknown'}`,
    `VFX budget factor: ${Number.isFinite(budget) ? budget.toFixed(2) : budget}`,
    `Skipped VFX layers: ${skipped}`,
    `Full VFX override: ${g.debug?.forceFullVfx ? 'ON' : 'OFF'}`,
    `Last composition: ${last}`
  ].join('\n');
}

function updatePathFollowingDebugMetrics(g){
  const box=document.getElementById('debugPathFollowMetrics');
  if(!box || !g) return;
  const m=typeof collectEnemyPathFollowingMetrics==='function'?collectEnemyPathFollowingMetrics(g):{count:0,avg:0,max:0,warning:0,critical:0,stalling:0};
  box.textContent = [
    `Path-tracked enemies: ${m.count||0}`,
    `Average off-track: ${(m.avg||0).toFixed(1)} px`,
    `Maximum off-track: ${(m.max||0).toFixed(1)} px`,
    `Warning count: ${m.warning||0}`,
    `Critical count: ${m.critical||0}`,
    `Stalling/correcting: ${m.stalling||0}`,
    `Path following: ${ENEMY_PATH_FOLLOWING.enabled?'ON':'OFF'}`,
    `Corner smoothing: ${ENEMY_CORNER_SMOOTHING.enabled?'ON':'OFF'}`,
    `Freeze enemies: ${g.debug?.freezeEnemies?'ON':'OFF'}`
  ].join('\n');
}

function updatePerformanceDebugPanel(g){
  const box=document.getElementById('debugPerfMetrics');
  if(g) { updateVfxDebugMetrics(g); updatePathFollowingDebugMetrics(g); if(typeof updateChargingWaveDebugPanel==='function') updateChargingWaveDebugPanel(g); }
  if(!box || !g?.performance) return;
  const p=g.performance;
  box.textContent = [
    `Current FPS: ${p.currentFPS.toFixed(1)}`,
    `Average FPS: ${p.averageFPS.toFixed(1)}`,
    `Frame time: ${p.frameTimeMs.toFixed(1)} ms`,
    `Avg frame: ${p.averageFrameTimeMs.toFixed(1)} ms`,
    `Performance: ${p.state}${p.forced?' (forced)':''}`,
    `Enemies: ${g.enemies.length}/${g.enemyBudget.currentMaxEnemies}`,
    `Enemy bullets: ${g.enemyBullets.length}/${getEnemyBulletCap(g)}`,
    `Spawn x: ${p.spawnRateMultiplier.toFixed(2)}`,
    `Swarm x: ${p.swarmSizeMultiplier.toFixed(2)}`,
    `Budget factor: ${p.budgetFactor.toFixed(2)}`,
    `VFX factor: ${p.vfxFactor.toFixed(2)}`,
    `Skipped spawns: ${p.skippedSpawns||0}`,
    `Skipped bullets: ${p.skippedBullets||0}`,
    `Perf despawned: ${p.enemiesDespawned||0}`
  ].join('\n');
}


function update(g,dt){
  if(g.state !== 'playing' || paused || awaitingUpgrade) return;
  g.time += dt;
    // ── Boss Name Display Timer (runs independently of boss life) ──
  if(g.bossNameDisplay && g.bossNameDisplay.timer > 0){
    g.bossNameDisplay.timer -= dt;
    if(g.bossNameDisplay.timer <= 1.5 && !g.bossNameDisplay.fadeOut){
      g.bossNameDisplay.fadeOut = true;
    }
  }
  updatePerformanceBudgets(g,dt);
  updateHollowPressure(g,dt);
  updateChargingWaveScheduler(g,dt);
  shake = Math.max(0, shake - dt*18);
  logTimeout = Math.max(0, logTimeout-dt);
  updateGamepadActions(g);
  updatePlayer(g,dt);
  if(typeof updateRunStatsFrame==='function') updateRunStatsFrame(g,dt);
  updateLavaContactDamage(g,dt);
  updateWeapons(g,dt);
  updateWardenDrones(g,dt);
  updateSifterDrones(g,dt);
  updateEnemies(g,dt);
  updateEnemyBoomerangs(g,dt);
  updateEnemyBullets(g,dt);
  updateMissiles(g,dt);
  updateBorecasterBombs(g,dt);
  if(g.state !== 'playing') return;
  updateArcConnection(g,dt);
  updateBullets(g,dt);
  updateBoomerangs(g,dt);
  updateTraps(g,dt);
  updatePickups(g,dt);
  updateRunProgress(g,dt);
  if(g.state !== 'playing') return;
  // Phase 1.2: track mission-specific progress each frame.
  if(g.missionType && typeof MISSION_TYPES !== 'undefined'){
    const mt = MISSION_TYPES.find(m => m.id === g.missionType);
    if(mt && typeof mt.track === 'function') mt.track(g, dt);
  }
  updateParticles(g,dt);
  updateSpawning(g,dt);
  updateUI(g);
}

function updateHollowPressure(g,dt){
  const old=g.hollowPressure || 0;
  const newLevel=Math.floor(g.time/120);
  if(newLevel>old){
    g.hollowPressure=newLevel;
    g.pressureFlash=2.4;
    log(g, `Hollow Pressure Rising: ${newLevel}`);
    sfx('wave',0.95);
    const burst=performanceAdjustedCount(g,Math.min(4+newLevel*2,18),true);
    if(burst>0 && canSpawnNormalEnemy(g,newLevel>2?'grunt':'swarmer',burst)) spawnBurst(g,burst,newLevel>2?'grunt':'swarmer');
  }
  g.pressureFlash=Math.max(0,(g.pressureFlash || 0)-dt);
}

function updateGamepadActions(g){
  // Legacy per-frame action hook is kept for compatibility. Gamepad input is
  // now polled once per frame by updateGamepadInput() so button edges are not
  // consumed multiple times by different systems.
}

function updatePlayer(g,dt){
  const p=g.player;
  let dx=0,dy=0;
  if(keys.has('KeyW')||keys.has('ArrowUp')) dy--;
  if(keys.has('KeyS')||keys.has('ArrowDown')) dy++;
  if(keys.has('KeyA')||keys.has('ArrowLeft')) dx--;
  if(keys.has('KeyD')||keys.has('ArrowRight')) dx++;
  const pad = gamepadVector();
  if(pad.active){
    dx = pad.dx;
    dy = pad.dy;
  } else {
    const l=len(dx,dy); dx/=l; dy/=l;
  }
  const hasInput = !!(dx||dy);
  if(hasInput){ p.lastDx=dx; p.lastDy=dy; }

  p.iframes=Math.max(0,p.iframes-dt);
  p.dashCd=Math.max(0,p.dashCd-dt);
  p.dashT=Math.max(0,p.dashT-dt);
  p.trapCd=Math.max(0,p.trapCd-dt);
  p.heat=Math.max(0,p.heat - dt*22*p.coolMul);
  p.drillPressure = Math.max(0, (p.drillPressure || 0) - dt*2.4);
  if(p.miningLock) p.miningLock.timer = Math.max(0, p.miningLock.timer - dt);

  const dashBoost = p.dashT>0 ? 3.4 : 1;
  const overheatSlow = p.heat >= p.maxHeat ? 0.72 : 1;
  const lowSpeedDebug = g.debug?.lowSpeedMiningTest ? 0.42 : 1;
  const spd=p.baseSpeed*p.speedMul*dashBoost*overheatSlow*lowSpeedDebug;
  const intendedDx = dx*spd*dt;
  const intendedDy = dy*spd*dt;
  const intendedDisp = Math.hypot(intendedDx,intendedDy);
  const lowSpeedMining = hasInput && (intendedDisp < 4.0 || g.debug?.lowSpeedMiningTest);

  const oldX=p.x, oldY=p.y;

  // v2: evaluate mining intent before collision resolution. This is the
  // important part for low speed: even if collision later slides the player
  // along a wall, the rock the player was trying to push into is still known.
  const preMining = hasInput ? findMiningTarget(g,p,dx,dy,{x:oldX,y:oldY,lowSpeed:lowSpeedMining,phase:'pre'}) : null;

  moveCircle(g,p,intendedDx,intendedDy);

  // Evaluate again after movement because the collision solver may have placed
  // the player near a corner contact that was not quite reachable pre-solve.
  const postMining = hasInput ? findMiningTarget(g,p,dx,dy,{x:p.x,y:p.y,lowSpeed:lowSpeedMining,phase:'post',previous:preMining}) : null;
  const miningTarget = chooseMiningTarget(g,p,dx,dy,preMining,postMining,lowSpeedMining);

  if(g.debug){
    g.debug.currentMiningTarget = miningTarget ? {tx:miningTarget.tx, ty:miningTarget.ty, score:miningTarget.score||0} : null;
    g.debug.currentMiningLock = p.miningLock ? {tx:p.miningLock.tx, ty:p.miningLock.ty, timer:p.miningLock.timer} : null;
    g.debug.miningIntent = hasInput ? {x:oldX,y:oldY,dx,dy} : null;
    g.debug.actualMovement = hasInput ? {x:oldX,y:oldY,dx:p.x-oldX,dy:p.y-oldY} : null;
    g.debug.lowSpeedMiningActive = !!lowSpeedMining;
    g.debug.miningStickinessActive = !!(p.miningLock && p.miningLock.timer>0);
  }

  if(miningTarget){
    refreshMiningLock(p,miningTarget);
    p.drillPressure = Math.min(1.25, (p.drillPressure || 0) + dt*5.0);

    // v2: if we are drilling, do not let a tile-corner collision turn forward
    // intent into backward drift or excessive tangential skating. We preserve a
    // little slide so the operator still feels smooth, but strongly damp it at
    // low speed and while the drill has pressure on the rock.
    applyMiningContactDamping(g,p,oldX,oldY,dx,dy,lowSpeedMining);
    mineTile(g,p,miningTarget.tx,miningTarget.ty,dt);
  } else if(!hasInput || !isMiningLockStillUseful(g,p,dx,dy,p.miningLock,lowSpeedMining)){
    if(p.miningLock && p.miningLock.timer<=0) p.miningLock=null;
  }
}


function updateLavaContactDamage(g,dt){
  const p=g.player;
  p.lavaDamageCd=Math.max(0,(p.lavaDamageCd || 0)-dt);
  p.chargingWaveExplosionDamageCd=Math.max(0,(p.chargingWaveExplosionDamageCd || 0)-dt);
  if(g.debug && g.debug.lavaDamageEnabled===false) return;
  const r=p.collisionR || p.r;
  const minx=Math.floor((p.x-r-2)/TILE), maxx=Math.floor((p.x+r+2)/TILE);
  const miny=Math.floor((p.y-r-2)/TILE), maxy=Math.floor((p.y+r+2)/TILE);
  let hit=null;
  for(let ty=miny;ty<=maxy && !hit;ty++) for(let tx=minx;tx<=maxx;tx++){
    if(tileAt(g,tx,ty)!==TILE_LAVA_ROCK) continue;
    const rx=tx*TILE, ry=ty*TILE;
    const cx=clamp(p.x,rx,rx+TILE), cy=clamp(p.y,ry,ry+TILE);
    if(dist2(p.x,p.y,cx,cy)<(r+1)*(r+1)){ hit={tx,ty,cx,cy}; break; }
  }
  if(!hit) return;
  if(p.lavaDamageCd<=0){
    const damage=Math.max(1,Math.round(10*(p.armourMul || 1)));
    p.hp-=damage;
    if(typeof recordRunDamageTaken==='function') recordRunDamageTaken(g,damage,'lava');
    p.lavaDamageCd=0.72;
    p.iframes=Math.max(p.iframes,0.22);
    flashDamage();
    floating(g,p.x,p.y-24,`-${damage} heat`,'#ff7a38');
    sfx('lavaBurn',0.9);
    const cx=hit.tx*TILE+TILE/2, cy=hit.ty*TILE+TILE/2;
    const dx=p.x-cx, dy=p.y-cy, l=len(dx,dy);
    p.x+=dx/l*9;
    p.y+=dy/l*9;
    shake=Math.max(shake,4);
    for(let k=0;k<12;k++) addParticle(g,hit.cx,hit.cy,rand(-80,80),rand(-80,80),'#ff7038',rand(0.15,0.38),rand(2,6), k%3===0?'fragment':'spark');
    addRing(g,hit.cx,hit.cy,'rgba(255,112,56,0.72)',0.18,5,28,3);
    spawnVfxComposition(g,'lavaBurst',hit.cx,hit.cy,{radius:24,color:'#ff7038'});
    if(p.hp<=0) gameOver(g);
  }
}

function isMineableForPlayer(t){
  return typeof isMineableTile === 'function' ? isMineableTile(t) : (t===TILE_ROCK || t===TILE_GOLD || t===TILE_NITRA || t===TILE_CRYSTAL || t===TILE_FERRITE_BARK || t===TILE_LUMINA_SPORES || t===TILE_AETHER_QUARTZ || t===TILE_CRYSALITH || t===TILE_EMBERGLASS);
}

function findMiningTarget(g,p,dx,dy,options={}){
  const l=len(dx,dy); dx/=l; dy/=l;
  const originX = options.x ?? p.x;
  const originY = options.y ?? p.y;
  const lowSpeed = !!options.lowSpeed;
  const r=p.collisionR || p.r;

  // v2 tuning: this is still short-range contact mining, not global long-range
  // mining. Low-speed mode adds a little tolerance because per-frame movement
  // can be too small to create a strong collision signal.
  const reach = r + (lowSpeed ? 32 : 26);
  const contactMargin = lowSpeed ? 16 : 10;
  const halfAngle=Math.PI*0.50; // 100 degree total fan.
  const sampleAngles=[0, -Math.PI/9, Math.PI/9, -Math.PI/4.5, Math.PI/4.5, -Math.PI/3.9, Math.PI/3.9];
  const sampleRanges=[r+3, r+10, r+18, reach];
  const samples=[];

  for(const range of sampleRanges){
    for(const off of sampleAngles){
      const ca=Math.cos(off), sa=Math.sin(off);
      const sx=dx*ca - dy*sa;
      const sy=dy*ca + dx*sa;
      samples.push({x:originX+sx*range,y:originY+sy*range,dx:sx,dy:sy,range,off});
    }
  }

  const candidates=new Map();
  const addCandidate=(tx,ty,sourceBonus=0,sample=null)=>{
    if(!inMap(tx,ty)) return;
    const t=tileAt(g,tx,ty);
    if(!isMineableForPlayer(t)) return;

    const left=tx*TILE, top=ty*TILE, right=left+TILE, bottom=top+TILE;
    const center=tileCenter(tx,ty);
    const vx=center.x-originX, vy=center.y-originY;
    const dist=Math.hypot(vx,vy) || 1;
    const align=(vx/dist)*dx+(vy/dist)*dy;

    // Circle-to-rect distance gives true corner contact behaviour. This catches
    // the case where the player circle touches a tile corner even though the
    // tile centre is not well aligned.
    const nearestX=clamp(originX,left,right), nearestY=clamp(originY,top,bottom);
    const edgeDistance=Math.max(0, Math.hypot(originX-nearestX, originY-nearestY) - r);
    const touching = edgeDistance <= contactMargin;

    // Direction gate: strict for centre/ray candidates, forgiving for physical
    // corner contact. This prevents mining behind the player while allowing the
    // intended corner-mining behaviour.
    const minAlign = touching ? (lowSpeed ? 0.18 : 0.24) : 0.42;
    if(align < minAlign) return;

    const along = vx*dx + vy*dy;
    const perpendicular = Math.abs(vx*dy - vy*dx);
    const rayReachOk = along > -r*0.25 && along < reach + TILE*0.95 && perpendicular < TILE*1.18;
    if(!touching && !rayReachOk) return;

    let sampleHit=false;
    if(sample){
      const sx=clamp(sample.x,left,right), sy=clamp(sample.y,top,bottom);
      sampleHit = Math.hypot(sample.x-sx,sample.y-sy) <= (lowSpeed ? 15 : 10);
    }

    const forwardPointX=originX+dx*reach, forwardPointY=originY+dy*reach;
    const forwardDistance=Math.hypot(center.x-forwardPointX,center.y-forwardPointY)/TILE;
    const rayDistance=perpendicular/TILE;
    const edgeScore=1-clamp(edgeDistance/(contactMargin+12),0,1);
    const locked = p.miningLock && p.miningLock.tx===tx && p.miningLock.ty===ty && p.miningLock.timer>0;
    const score =
      align*4.4 +
      edgeScore*2.6 +
      (touching?1.45:0) +
      (sampleHit?0.95:0) +
      sourceBonus +
      (locked?5.0:0) -
      rayDistance*1.55 -
      forwardDistance*0.45 -
      dist/(TILE*5);

    const key=tileIdx(tx,ty);
    const candidate={tx,ty,score,dist,align,edgeDistance,touching,rayDistance,source:sample?'fan':'scan'};
    const old=candidates.get(key);
    if(!old || candidate.score>old.score) candidates.set(key,candidate);
  };

  // Fan samples catch intended direction and wider side/corner contacts.
  for(const smp of samples){
    const tx=Math.floor(smp.x/TILE), ty=Math.floor(smp.y/TILE);
    for(let oy=-1;oy<=1;oy++) for(let ox=-1;ox<=1;ox++) addCandidate(tx+ox,ty+oy,0.5-Math.abs(smp.off)*0.35,smp);
  }

  // Nearby circle scan catches true tile-corner overlap where no sample lands
  // cleanly inside the tile. This is essential for low-speed corner mining.
  const scanReach=reach+TILE*0.75;
  const minx=Math.floor((originX-r-scanReach)/TILE), maxx=Math.floor((originX+r+scanReach)/TILE);
  const miny=Math.floor((originY-r-scanReach)/TILE), maxy=Math.floor((originY+r+scanReach)/TILE);
  for(let ty=miny;ty<=maxy;ty++) for(let tx=minx;tx<=maxx;tx++) addCandidate(tx,ty,0,null);

  let best=null;
  for(const c of candidates.values()){
    if(!best || c.score>best.score || (Math.abs(c.score-best.score)<0.001 && c.edgeDistance<best.edgeDistance)) best=c;
  }

  if(g.debug){
    // Merge rather than overwrite so the post-pass can display all candidates.
    const list=[...candidates.values()].map(c=>({tx:c.tx,ty:c.ty,score:c.score,touching:c.touching,source:c.source}));
    if(options.phase==='pre'){
      g.debug.miningSamples=samples;
      g.debug.miningCandidates=list;
    } else {
      g.debug.miningSamplesPost=samples;
      g.debug.miningCandidatesPost=list;
    }
  }
  return best;
}

function chooseMiningTarget(g,p,dx,dy,preTarget,postTarget,lowSpeed){
  // First priority: locked target if still valid. This prevents flicker between
  // adjacent corner tiles while the player holds the same mining direction.
  if(isMiningLockStillUseful(g,p,dx,dy,p.miningLock,lowSpeed)){
    const locked={tx:p.miningLock.tx,ty:p.miningLock.ty,score:999,locked:true};
    return locked;
  }
  if(preTarget && postTarget){
    // If both exist, choose by score but give pre-collision intent a small bias:
    // it is what the player tried to drill before collision altered the motion.
    const preScore=preTarget.score+0.7;
    const postScore=postTarget.score;
    return preScore>=postScore ? preTarget : postTarget;
  }
  return preTarget || postTarget || null;
}

function refreshMiningLock(p,target){
  if(!target) return;
  p.miningLock = { tx:target.tx, ty:target.ty, timer:0.28 };
  p.miningTile = tileIdx(target.tx,target.ty);
}

function isMiningLockStillUseful(g,p,dx,dy,lock,lowSpeed=false){
  if(!lock || lock.timer<=0 || !(dx||dy)) return false;
  if(!inMap(lock.tx,lock.ty) || !isMineableForPlayer(tileAt(g,lock.tx,lock.ty))) return false;
  const r=p.collisionR || p.r;
  const reach=r+(lowSpeed?34:28);
  const c=tileCenter(lock.tx,lock.ty);
  const vx=c.x-p.x, vy=c.y-p.y;
  const d=Math.hypot(vx,vy) || 1;
  const align=(vx/d)*dx+(vy/d)*dy;
  const left=lock.tx*TILE, top=lock.ty*TILE;
  const nx=clamp(p.x,left,left+TILE), ny=clamp(p.y,top,top+TILE);
  const edgeDistance=Math.max(0,Math.hypot(p.x-nx,p.y-ny)-r);
  const touching=edgeDistance <= (lowSpeed?18:12);
  return (touching && align>0.10) || (d<reach+TILE*0.85 && align>0.28);
}

function applyMiningContactDamping(g,p,oldX,oldY,dx,dy,lowSpeed){
  const movedX=p.x-oldX, movedY=p.y-oldY;
  const forward=movedX*dx + movedY*dy;
  const lateralX=movedX - dx*forward;
  const lateralY=movedY - dy*forward;

  // Drill pressure makes sustained contact more sticky. At very low speed we
  // strongly reduce tangential motion, which stops the character from skating
  // across several blocks without mining.
  const pressure=clamp(p.drillPressure || 0,0,1.25);
  const slideDamp = lowSpeed ? 0.18 : clamp(0.58 - pressure*0.18, 0.28, 0.58);
  const forwardKeep = Math.max(0, forward); // never preserve backward drift while drilling.
  const candidateX=oldX + dx*forwardKeep + lateralX*slideDamp;
  const candidateY=oldY + dy*forwardKeep + lateralY*slideDamp;
  const r=p.collisionR || p.r;
  if(circleClearOfSolids(g,candidateX,candidateY,r)){
    p.x=candidateX; p.y=candidateY;
  } else if(lowSpeed && circleClearOfSolids(g,oldX,oldY,r)){
    // If the damped slide would still collide, stay braced at the previous
    // valid position instead of being pushed sideways/backwards by the corner.
    p.x=oldX; p.y=oldY;
  }
}

function mineTile(g,p,tx,ty,dt){
  if(p.heat >= p.maxHeat || !inMap(tx,ty)) return;
  const i=tileIdx(tx,ty), t=g.tiles[i];
  if(!isMineableForPlayer(t)) return;
  const pressureBonus = 1 + Math.min(0.35, (p.drillPressure || 0) * 0.25);
  const miningPower = 55 * p.mineMul * pressureBonus * dt;
  g.tileHp[i] -= miningPower;
  p.heat += dt * 32 * p.heatEfficiency;
  const cx=tx*TILE+TILE/2, cy=ty*TILE+TILE/2;
  const minedData=TILE_DATA[t] || MINERALS.crust;
  if(Math.random()<0.55) addParticle(g, cx, cy, rand(-55,55), rand(-55,55), minedData.color || '#b48a61', rand(0.12,0.30), rand(2,5),'spark');
  sfx('mine', 0.65);
  if(g.tileHp[i]<=0){
    g.tiles[i]=TILE_EMPTY;
    if(g.runStats) g.runStats.blocksMined=(g.runStats.blocksMined||0)+1;
    addObjectiveProgress(g,'mine_blocks',1);
    g.tileHp[i]=0;
    g.navigationVersion++;
    for(const e of g.enemies){
      if(dist2(e.x,e.y,cx,cy)<520*520) e.pathTimer=0;
    }
    shake = Math.max(shake, 2.5);
    sfx('rockBreak', 0.85);
    for(let k=0;k<10;k++) addParticle(g, cx, cy, rand(-120,120), rand(-120,120), '#8b735e', rand(0.28,0.6), rand(2,6));
    if(Math.random()<0.04) dropPickup(g, cx, cy, 'health', 15);
    const resourceId=resourceIdForTile(t);
    if(resourceId){
      const amount=resourceAmountForTile(t);
      if(resourceId==='echo'){
        dropPickup(g,tx*TILE+18,ty*TILE+18,'xp',12);
        floating(g,tileToWorldCenterX(tx),tileToWorldCenterY(ty)-TILE*0.18,'+Echo Shards',MINERALS.echo.color);
      } else {
        collectRunResource(g,resourceId,amount);
        floating(g,tileToWorldCenterX(tx),tileToWorldCenterY(ty)-TILE*0.18,`+${MINERALS[resourceId].displayName}`,MINERALS[resourceId].color);
      }
      if(saveProfile?.statistics) saveProfile.statistics.totalOreMined+=amount;
      // Track per-resource mining for milestones.
      if(saveProfile?.statistics && resourceId){
        if(resourceId==='gild') saveProfile.statistics.totalGildMined = (saveProfile.statistics.totalGildMined||0) + amount;
        if(resourceId==='voltarite') saveProfile.statistics.totalVoltariteMined = (saveProfile.statistics.totalVoltariteMined||0) + amount;
        if(resourceId==='echo') saveProfile.statistics.totalEchoMined = (saveProfile.statistics.totalEchoMined||0) + amount;
        saveProfile.statistics.totalResourcesCollected = (saveProfile.statistics.totalResourcesCollected||0) + amount;
      }
      // Phase 1.1: check mining-based milestones.
      if(typeof checkMilestoneOnMine === 'function') checkMilestoneOnMine(g);
      // Phase 1.2: update Harvest mission objectives.
      if(g.missionType === 'harvest' && resourceId){
        for(const o of g.objectives){
          if(o.type==='harvest' && o.resourceId===resourceId && !o.completed){
            o.currentAmount=Math.min(o.currentAmount+amount,o.targetAmount);
            if(o.currentAmount>=o.targetAmount){
              o.completed=true;
              log(g, `${o.displayName} complete.`);
              sfx('level',0.75);
              if(g.runStats) g.runStats.objectivesCompleted=(g.runStats.objectivesCompleted||0)+1;
            }
          }
        }
      }
      sfx('mineral');
    }
  }
}

function resourceIdForTile(t){
  if(t===TILE_GOLD) return 'gild';
  if(t===TILE_NITRA) return 'voltarite';
  if(t===TILE_CRYSTAL) return 'echo';
  if(t===TILE_FERRITE_BARK) return 'ferriteBark';
  if(t===TILE_LUMINA_SPORES) return 'luminaSpores';
  if(t===TILE_AETHER_QUARTZ) return 'aetherQuartz';
  if(t===TILE_CRYSALITH) return 'crysalith';
  if(t===TILE_EMBERGLASS) return 'emberglass';
  return null;
}

function resourceAmountForTile(t){
  if(t===TILE_GOLD) return randi(2,5);
  if(t===TILE_NITRA) return randi(2,4);
  if(t===TILE_AETHER_QUARTZ) return randi(1,2);
  if(t===TILE_LUMINA_SPORES) return randi(2,4);
  if(t===TILE_FERRITE_BARK) return randi(3,6);
  if(t===TILE_CRYSALITH) return randi(2,4);
  if(t===TILE_EMBERGLASS) return randi(2,4);
  return 1;
}

function moveCircle(g,obj,dx,dy){
  const oldX=obj.x, oldY=obj.y;
  const movedX = tryMoveAxis(g,obj,dx,0);
  obj.x = movedX.x;
  const movedY = tryMoveAxis(g,obj,0,dy);
  obj.y = movedY.y;

  // Subtle corner push assist: if diagonal motion was blocked by a tile corner,
  // nudge toward nearby open clearance without allowing wall penetration.
  if(obj===g.player && dx && dy && (Math.abs(obj.x-(oldX+dx))>0.5 || Math.abs(obj.y-(oldY+dy))>0.5)){
    applyCornerPushAssist(g,obj,dx,dy);
  }
  const r=obj.collisionR || obj.r;
  obj.x=clamp(obj.x,r+TILE,WORLD_W-r-TILE);
  obj.y=clamp(obj.y,r+TILE,WORLD_H-r-TILE);
}

function applyCornerPushAssist(g,obj,dx,dy){
  const r=obj.collisionR || obj.r;
  const tries=[
    {x:0,y:Math.sign(dy)*5},{x:Math.sign(dx)*5,y:0},
    {x:0,y:-Math.sign(dy)*5},{x:-Math.sign(dx)*5,y:0}
  ];
  for(const n of tries){
    const nx=obj.x+n.x, ny=obj.y+n.y;
    if(circleClearOfSolids(g,nx,ny,r)){ obj.x=nx; obj.y=ny; return; }
  }
}

function tryMoveAxis(g,obj,dx,dy){
  let nx=obj.x+dx, ny=obj.y+dy;
  const r=obj.collisionR || obj.r;
  const minx=Math.floor((nx-r)/TILE), maxx=Math.floor((nx+r)/TILE);
  const miny=Math.floor((ny-r)/TILE), maxy=Math.floor((ny+r)/TILE);
  for(let ty=miny;ty<=maxy;ty++) for(let tx=minx;tx<=maxx;tx++){
    if(isSolid(tileAt(g,tx,ty))){
      const rx=tx*TILE, ry=ty*TILE;
      const cx=clamp(nx,rx,rx+TILE), cy=clamp(ny,ry,ry+TILE);
      if(dist2(nx,ny,cx,cy)<r*r){
        if(dx>0) nx=rx-r-0.1;
        if(dx<0) nx=rx+TILE+r+0.1;
        if(dy>0) ny=ry-r-0.1;
        if(dy<0) ny=ry+TILE+r+0.1;
      }
    }
  }
  return {x:nx,y:ny};
}

function tileWalkable(g,tx,ty){
  return inMap(tx,ty) && !isSolid(tileAt(g,tx,ty));
}

function tileCenter(tx,ty){
  return tileToWorldCenter(tx,ty);
}

function lineOfSightClear(g,x1,y1,x2,y2){
  const dist=Math.hypot(x2-x1,y2-y1);
  const steps=Math.max(1,Math.ceil(dist/(TILE*0.45)));
  for(let i=1;i<steps;i++){
    const t=i/steps;
    const tx=Math.floor(lerp(x1,x2,t)/TILE), ty=Math.floor(lerp(y1,y2,t)/TILE);
    if(isSolid(tileAt(g,tx,ty))) return false;
  }
  return true;
}

function findClosestWalkableTile(g,tx,ty,maxR=8){
  if(tileWalkable(g,tx,ty)) return {tx,ty};
  let best=null, bd=Infinity;
  for(let r=1;r<=maxR;r++){
    for(let y=ty-r;y<=ty+r;y++) for(let x=tx-r;x<=tx+r;x++){
      if(Math.abs(x-tx)!==r && Math.abs(y-ty)!==r) continue;
      if(!tileWalkable(g,x,y)) continue;
      const d=(x-tx)*(x-tx)+(y-ty)*(y-ty);
      if(d<bd){ bd=d; best={tx:x,ty:y}; }
    }
    if(best) return best;
  }
  return null;
}

function reconstructPath(cameFrom,current){
  const path=[];
  while(current!==-1){
    const tx=current%MAP_W, ty=Math.floor(current/MAP_W);
    path.push(tileCenter(tx,ty));
    current=cameFrom[current] ?? -1;
  }
  path.reverse();
  return path;
}

function findPathAStar(g,startTx,startTy,goalTx,goalTy,maxNodes=900){
  const start=findClosestWalkableTile(g,startTx,startTy,5);
  const goal=findClosestWalkableTile(g,goalTx,goalTy,10);
  if(!start || !goal) return [];
  const startId=tileIdx(start.tx,start.ty), goalId=tileIdx(goal.tx,goal.ty);
  if(startId===goalId) return [tileCenter(goal.tx,goal.ty)];

  const open=[startId];
  const cameFrom=new Int32Array(MAP_W*MAP_H); cameFrom.fill(-1);
  const gScore=new Float32Array(MAP_W*MAP_H); gScore.fill(Infinity);
  const fScore=new Float32Array(MAP_W*MAP_H); fScore.fill(Infinity);
  const inOpen=new Uint8Array(MAP_W*MAP_H);
  gScore[startId]=0;
  fScore[startId]=Math.abs(start.tx-goal.tx)+Math.abs(start.ty-goal.ty);
  inOpen[startId]=1;
  const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  let processed=0, bestId=startId, bestH=fScore[startId];

  while(open.length && processed<maxNodes){
    let bestIndex=0, bestF=fScore[open[0]];
    for(let i=1;i<open.length;i++){
      const id=open[i];
      if(fScore[id]<bestF){ bestF=fScore[id]; bestIndex=i; }
    }
    const current=open.splice(bestIndex,1)[0];
    inOpen[current]=0;
    processed++;
    if(current===goalId) return reconstructPath(cameFrom,current).slice(1);
    const cx=current%MAP_W, cy=Math.floor(current/MAP_W);
    const h=Math.abs(cx-goal.tx)+Math.abs(cy-goal.ty);
    if(h<bestH){ bestH=h; bestId=current; }
    for(const [dx,dy] of dirs){
      const nx=cx+dx, ny=cy+dy;
      if(!tileWalkable(g,nx,ny)) continue;
      if(dx&&dy && (!tileWalkable(g,cx+dx,cy) || !tileWalkable(g,cx,cy+dy))) continue;
      const nid=tileIdx(nx,ny);
      const step=(dx&&dy)?1.4:1;
      const tentative=gScore[current]+step;
      if(tentative<gScore[nid]){
        cameFrom[nid]=current;
        gScore[nid]=tentative;
        fScore[nid]=tentative+Math.abs(nx-goal.tx)+Math.abs(ny-goal.ty);
        if(!inOpen[nid]){ open.push(nid); inOpen[nid]=1; }
      }
    }
  }
  return bestId!==startId ? reconstructPath(cameFrom,bestId).slice(1) : [];
}

function circleClearOfSolids(g,x,y,r){
  const minx=Math.floor((x-r)/TILE), maxx=Math.floor((x+r)/TILE);
  const miny=Math.floor((y-r)/TILE), maxy=Math.floor((y+r)/TILE);
  for(let ty=miny;ty<=maxy;ty++) for(let tx=minx;tx<=maxx;tx++){
    if(isSolid(tileAt(g,tx,ty))){
      const rx=tx*TILE, ry=ty*TILE;
      const cx=clamp(x,rx,rx+TILE), cy=clamp(y,ry,ry+TILE);
      if(dist2(x,y,cx,cy)<r*r) return false;
    }
  }
  return true;
}


const ENEMY_CORNER_SMOOTHING = {
  enabled: true,
  maxSamplesPerCorner: 6,
  maxSmoothedPoints: 80,
  safetyMargin: 4,
  lookaheadBase: 18,
};

function clonePathPoint(p){ return {x:p.x,y:p.y,curve:!!p.curve,corner:!!p.corner,raw:!!p.raw}; }
function pointSub(a,b){ return {x:a.x-b.x,y:a.y-b.y}; }
function pointLen(v){ return Math.hypot(v.x,v.y) || 1; }
function pointNorm(v){ const l=pointLen(v); return {x:v.x/l,y:v.y/l}; }
function pointDot(a,b){ return a.x*b.x+a.y*b.y; }
function quadraticBezierPoint(a,b,c,t){
  const u=1-t;
  return {x:u*u*a.x+2*u*t*b.x+t*t*c.x, y:u*u*a.y+2*u*t*b.y+t*t*c.y, curve:true};
}

function lineSegmentHasClearance(g,x1,y1,x2,y2,r){
  const dist=Math.hypot(x2-x1,y2-y1);
  const steps=Math.max(2,Math.ceil(dist/Math.max(5,r*0.55)));
  for(let i=1;i<=steps;i++){
    const t=i/steps;
    const x=lerp(x1,x2,t), y=lerp(y1,y2,t);
    if(!circleClearOfSolids(g,x,y,r)) return false;
  }
  return true;
}

function validateCurvePoints(g,points,r){
  for(const p of points){
    if(!circleClearOfSolids(g,p.x,p.y,r)) return false;
  }
  for(let i=1;i<points.length;i++){
    if(!lineSegmentHasClearance(g,points[i-1].x,points[i-1].y,points[i].x,points[i].y,r)) return false;
  }
  return true;
}

function simplifyEnemyPath(raw){
  if(!raw || raw.length<3) return (raw||[]).map(clonePathPoint);
  const out=[clonePathPoint(raw[0])];
  for(let i=1;i<raw.length-1;i++){
    const a=out[out.length-1], b=raw[i], c=raw[i+1];
    const ab=pointNorm(pointSub(b,a));
    const bc=pointNorm(pointSub(c,b));
    if(Math.abs(ab.x-bc.x)<0.04 && Math.abs(ab.y-bc.y)<0.04) continue;
    out.push(clonePathPoint(b));
  }
  out.push(clonePathPoint(raw[raw.length-1]));
  return out;
}

function buildCornerCurve(g,enemy,p0,p1,p2,curveDistance){
  const r=(enemy.pathingRadius || enemy.collisionR || enemy.r || 12) + ENEMY_CORNER_SMOOTHING.safetyMargin;
  const vIn=pointNorm(pointSub(p1,p0));
  const vOut=pointNorm(pointSub(p2,p1));
  const entry={x:p1.x-vIn.x*curveDistance,y:p1.y-vIn.y*curveDistance,corner:true};
  const exit={x:p1.x+vOut.x*curveDistance,y:p1.y+vOut.y*curveDistance,corner:true};
  const samples=clamp(Math.round(curveDistance/(TILE*0.08)),4,ENEMY_CORNER_SMOOTHING.maxSamplesPerCorner);
  const curve=[entry];
  for(let i=1;i<=samples;i++){
    const t=i/samples;
    curve.push(quadraticBezierPoint(entry,p1,exit,t));
  }
  curve[curve.length-1].corner=true;
  if(validateCurvePoints(g,curve,r)) return curve;

  // Retry with a smaller curve before giving up. This is safer in one-tile tunnels.
  const small=Math.max(enemy.r+2,curveDistance*0.55);
  const entry2={x:p1.x-vIn.x*small,y:p1.y-vIn.y*small,corner:true};
  const exit2={x:p1.x+vOut.x*small,y:p1.y+vOut.y*small,corner:true};
  const curve2=[entry2];
  for(let i=1;i<=Math.max(3,samples-2);i++) curve2.push(quadraticBezierPoint(entry2,p1,exit2,i/Math.max(3,samples-2)));
  curve2[curve2.length-1].corner=true;
  if(validateCurvePoints(g,curve2,r)) return curve2;
  return null;
}

function smoothPathCorners(g,enemy,rawPath){
  if(!ENEMY_CORNER_SMOOTHING.enabled || !rawPath || rawPath.length<3) return (rawPath||[]).map(clonePathPoint);
  const path=simplifyEnemyPath(rawPath);
  if(path.length<3) return path;
  const smooth=[clonePathPoint(path[0])];
  const clearanceFailures=[];
  for(let i=1;i<path.length-1;i++){
    const p0=path[i-1], p1=path[i], p2=path[i+1];
    const vIn=pointNorm(pointSub(p1,p0));
    const vOut=pointNorm(pointSub(p2,p1));
    const dot=pointDot(vIn,vOut);
    if(dot<0.85){
      const legIn=Math.hypot(p1.x-p0.x,p1.y-p0.y);
      const legOut=Math.hypot(p2.x-p1.x,p2.y-p1.y);
      const desired=clamp((enemy.pathingRadius||enemy.r||12)+6,TILE*0.22,TILE*0.45);
      const curveDistance=Math.max(8,Math.min(desired,legIn*0.48,legOut*0.48));
      const curve=buildCornerCurve(g,enemy,p0,p1,p2,curveDistance);
      if(curve){
        // Avoid duplicate entry point if it is almost the same as the previous point.
        for(const cp of curve){
          const last=smooth[smooth.length-1];
          if(!last || Math.hypot(cp.x-last.x,cp.y-last.y)>4) smooth.push(cp);
          if(smooth.length>=ENEMY_CORNER_SMOOTHING.maxSmoothedPoints) break;
        }
      } else {
        clearanceFailures.push({x:p1.x,y:p1.y});
        smooth.push({...clonePathPoint(p1), raw:true});
      }
    } else {
      smooth.push(clonePathPoint(p1));
    }
    if(smooth.length>=ENEMY_CORNER_SMOOTHING.maxSmoothedPoints) break;
  }
  if(smooth.length<ENEMY_CORNER_SMOOTHING.maxSmoothedPoints) smooth.push(clonePathPoint(path[path.length-1]));
  enemy.smoothPath=smooth;
  enemy.rawPath=rawPath.map(clonePathPoint);
  enemy.pathClearanceFailures=clearanceFailures;
  return smooth;
}

function findPointAlongPathFrom(enemy,startIndex,lookaheadDistance){
  const path=enemy.path || [];
  if(!path.length || startIndex>=path.length) return null;
  let x=enemy.x, y=enemy.y;
  let remaining=lookaheadDistance;
  for(let i=startIndex;i<path.length;i++){
    const p=path[i];
    const d=Math.hypot(p.x-x,p.y-y);
    if(d>=remaining){
      const t=remaining/Math.max(1,d);
      return {x:lerp(x,p.x,t),y:lerp(y,p.y,t),index:i};
    }
    remaining-=d; x=p.x; y=p.y;
  }
  const last=path[path.length-1];
  return {x:last.x,y:last.y,index:path.length-1};
}

function getEnemyLookaheadTarget(enemy){
  const dist=(enemy.pathingRadius || enemy.r || 12)*2 + ENEMY_CORNER_SMOOTHING.lookaheadBase;
  return findPointAlongPathFrom(enemy,enemy.pathIndex||0,dist);
}

const ENEMY_PATH_FOLLOWING = {
  enabled: true,
  correctionGain: 4.0,
  maxCorrectionSpeedMul: 0.95,
  warningRadiusMul: 0.75,
  criticalRadiusMul: 1.5,
  maxBacktrack: 18,
  minProgressBeforeRepath: 5,
  stallTriggerTime: 0.55,
};

function buildPathPolylineSamples(path){
  const samples=[];
  if(!path || !path.length) return samples;
  let arc=0;
  samples.push({x:path[0].x,y:path[0].y,arc:0,source:path[0]});
  for(let i=1;i<path.length;i++){
    const a=samples[samples.length-1], b=path[i];
    const d=Math.hypot(b.x-a.x,b.y-a.y);
    if(d<0.5) continue;
    arc+=d;
    samples.push({x:b.x,y:b.y,arc,source:b});
  }
  return samples;
}

function prepareEnemyPathFollower(g,enemy){
  enemy.pathSamples=buildPathPolylineSamples(enemy.path || []);
  enemy.pathProgressDistance=0;
  enemy.lastPathProgressDistance=0;
  enemy.closestSegmentIndex=0;
  enemy.offtrackDistance=0;
  enemy.maxOfftrackDistanceSeen=0;
  enemy.pathFollowMode='normal';
  enemy.pathProgressStallTimer=0;
  enemy.pathUnsafeSections=[];
  const r=(enemy.pathingRadius || enemy.r || 12)*0.92;
  const samples=enemy.pathSamples || [];
  for(let i=0;i<samples.length;i+=Math.max(1,Math.floor(samples.length/40))){
    const sm=samples[i];
    if(!circleClearOfSolids(g,sm.x,sm.y,r)) enemy.pathUnsafeSections.push({x:sm.x,y:sm.y,index:i});
  }
}

function closestPointOnSegment(px,py,ax,ay,bx,by){
  const vx=bx-ax, vy=by-ay;
  const lenSq=vx*vx+vy*vy || 1;
  const t=clamp(((px-ax)*vx+(py-ay)*vy)/lenSq,0,1);
  return {x:ax+vx*t,y:ay+vy*t,t,distSq:(px-(ax+vx*t))**2+(py-(ay+vy*t))**2};
}

function getClosestPathInfo(enemy){
  const samples=enemy.pathSamples || [];
  if(samples.length<2) return null;
  let best=null;
  const prev=enemy.closestSegmentIndex || 0;
  const start=Math.max(0,prev-8), end=Math.min(samples.length-2,prev+12);
  const scan=(i)=>{
    const a=samples[i], b=samples[i+1];
    const cp=closestPointOnSegment(enemy.x,enemy.y,a.x,a.y,b.x,b.y);
    if(!best || cp.distSq<best.distSq){
      const segLen=Math.hypot(b.x-a.x,b.y-a.y) || 1;
      best={...cp, segmentIndex:i, arcLength:a.arc+segLen*cp.t, tangent:{x:(b.x-a.x)/segLen,y:(b.y-a.y)/segLen}, distSq:cp.distSq};
    }
  };
  for(let i=start;i<=end;i++) scan(i);
  // If the local window is poor, fall back to full scan. This happens after collisions or teleports.
  if(!best || best.distSq>(enemy.r*enemy.r*9)){
    best=null;
    for(let i=0;i<samples.length-1;i++) scan(i);
  }
  return best;
}

function getPathPointAtArc(samples,arc){
  if(!samples || !samples.length) return null;
  if(arc<=0) return {x:samples[0].x,y:samples[0].y,index:0,arc:0};
  const last=samples[samples.length-1];
  if(arc>=last.arc) return {x:last.x,y:last.y,index:samples.length-1,arc:last.arc};
  let lo=0, hi=samples.length-1;
  while(lo<hi){
    const mid=(lo+hi)>>1;
    if(samples[mid].arc<arc) lo=mid+1; else hi=mid;
  }
  const i=Math.max(1,lo);
  const a=samples[i-1], b=samples[i];
  const span=Math.max(1,b.arc-a.arc);
  const t=clamp((arc-a.arc)/span,0,1);
  return {x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),index:i-1,arc};
}

function getLocalPathCurvature(samples,segmentIndex){
  if(!samples || samples.length<3) return 0;
  const i=clamp(segmentIndex,1,samples.length-2);
  const a=samples[i-1], b=samples[i], c=samples[i+1];
  const v1=pointNorm({x:b.x-a.x,y:b.y-a.y});
  const v2=pointNorm({x:c.x-b.x,y:c.y-b.y});
  return Math.acos(clamp(pointDot(v1,v2),-1,1));
}

function getEnemyPathFollowingSteering(g,enemy,dt){
  if(!ENEMY_PATH_FOLLOWING.enabled || !enemy.path || !enemy.path.length) return null;
  if(!enemy.pathSamples || enemy.pathSamples.length<2) prepareEnemyPathFollower(g,enemy);
  const samples=enemy.pathSamples || [];
  if(samples.length<2) return null;
  const info=getClosestPathInfo(enemy);
  if(!info) return null;
  enemy.closestSegmentIndex=info.segmentIndex;
  const radius=enemy.pathingRadius || enemy.r || 12;
  const offX=info.x-enemy.x, offY=info.y-enemy.y;
  const offDist=Math.hypot(offX,offY);
  enemy.offtrackDistance=offDist;
  enemy.maxOfftrackDistanceSeen=Math.max(enemy.maxOfftrackDistanceSeen||0,offDist);
  enemy.closestPathPoint={x:info.x,y:info.y,segmentIndex:info.segmentIndex,arc:info.arcLength};
  enemy.pathTangent={x:info.tangent.x,y:info.tangent.y};
  enemy.offtrackVector={x:offX,y:offY};

  const allowedBacktrack=ENEMY_PATH_FOLLOWING.maxBacktrack;
  const rawProgress=info.arcLength;
  const prevProgress=enemy.pathProgressDistance || 0;
  const progress = rawProgress < prevProgress-allowedBacktrack ? Math.max(0,prevProgress-allowedBacktrack) : Math.max(prevProgress,rawProgress);
  enemy.lastPathProgressDistance=prevProgress;
  enemy.pathProgressDistance=progress;
  const progressDelta=progress-prevProgress;
  if(progressDelta<ENEMY_PATH_FOLLOWING.minProgressBeforeRepath*dt && offDist>radius*0.65) enemy.pathProgressStallTimer=(enemy.pathProgressStallTimer||0)+dt;
  else enemy.pathProgressStallTimer=Math.max(0,(enemy.pathProgressStallTimer||0)-dt*2);

  const curvature=getLocalPathCurvature(samples,info.segmentIndex);
  const highCurvature=curvature>0.45 || samples[Math.min(samples.length-1,info.segmentIndex+1)]?.source?.curve;
  const warning=offDist>radius*ENEMY_PATH_FOLLOWING.warningRadiusMul;
  const critical=offDist>radius*ENEMY_PATH_FOLLOWING.criticalRadiusMul;
  let lookahead=enemy.pathLookaheadDistance || Math.max(28,radius*2+18);
  if(highCurvature) lookahead*=0.55;
  if(warning) lookahead*=0.75;
  if(critical) lookahead*=0.45;
  lookahead=clamp(lookahead,Math.max(10,radius*0.85),Math.max(34,radius*4.6));
  const look=getPathPointAtArc(samples,progress+lookahead) || samples[samples.length-1];
  enemy.currentLookaheadTarget={x:look.x,y:look.y,index:look.index,arc:look.arc,curvature,offtrack:offDist};

  let fx=look.x-enemy.x, fy=look.y-enemy.y;
  let fl=Math.hypot(fx,fy);
  if(fl<0.001){ fx=info.tangent.x; fy=info.tangent.y; fl=1; }
  fx/=fl; fy/=fl;
  const correctionGain=(enemy.pathCorrectionGain || ENEMY_PATH_FOLLOWING.correctionGain) * (highCurvature?1.45:1) * (warning?1.35:1) * (critical?1.65:1);
  const corrMax=enemy.speed*ENEMY_PATH_FOLLOWING.maxCorrectionSpeedMul;
  const corrSpeed=Math.min(corrMax,offDist*correctionGain);
  const cx=offDist>0.001 ? offX/offDist*corrSpeed : 0;
  const cy=offDist>0.001 ? offY/offDist*corrSpeed : 0;
  let speedMul=critical?0.62:(warning?0.82:1.0);
  if(highCurvature) speedMul*=0.88;
  let vx=fx*enemy.speed*speedMul + cx;
  let vy=fy*enemy.speed*speedMul + cy;
  const vl=Math.hypot(vx,vy) || 1;
  const maxSpeed=enemy.speed*Math.max(0.55,speedMul);
  if(vl>maxSpeed){ vx=vx/vl*maxSpeed; vy=vy/vl*maxSpeed; }
  const ul=Math.hypot(vx,vy) || 1;
  enemy.desiredVelocity={x:vx,y:vy};
  enemy.pathFollowMode=critical?'critical-correcting':warning?'correcting':highCurvature?'corner-tracking':'normal';
  if((critical && enemy.pathProgressStallTimer>ENEMY_PATH_FOLLOWING.stallTriggerTime) || (enemy.pathUnsafeSections && enemy.pathUnsafeSections.length && enemy.stuckTimer>0.5)){
    enemy.pathFollowMode='mining-fallback';
    enemy.pathTimer=0;
    enemy.cornerFallbackTarget=findNearbyCornerMiningFallback(g,enemy,look.x,look.y);
    if(g.tunnelAiMetrics) g.tunnelAiMetrics.enemyMiningTriggeredByPathFailure=(g.tunnelAiMetrics.enemyMiningTriggeredByPathFailure||0)+1;
  }
  return {x:vx/ul,y:vy/ul,speedMul:Math.min(1,Math.max(0.45,Math.hypot(vx,vy)/Math.max(1,enemy.speed))), vx, vy, info, lookahead:look};
}

function collectEnemyPathFollowingMetrics(g){
  const metrics={count:0,total:0,max:0,warning:0,critical:0,avg:0,stalling:0};
  if(!g?.enemies) return metrics;
  for(const e of g.enemies){
    if(!e.path || !e.path.length) continue;
    const d=e.offtrackDistance || 0;
    const r=e.pathingRadius || e.r || 12;
    metrics.count++;
    metrics.total+=d;
    metrics.max=Math.max(metrics.max,d);
    if(d>r*ENEMY_PATH_FOLLOWING.warningRadiusMul) metrics.warning++;
    if(d>r*ENEMY_PATH_FOLLOWING.criticalRadiusMul) metrics.critical++;
    if((e.pathProgressStallTimer||0)>0.35) metrics.stalling++;
  }
  metrics.avg=metrics.count?metrics.total/metrics.count:0;
  return metrics;
}

function getTunnelCentrelineBias(g,enemy,dirX,dirY){
  const [tx,ty]=worldToTile(enemy.x,enemy.y);
  if(!inMap(tx,ty)) return {x:0,y:0,strength:0};
  const centre=tileCenter(tx,ty);
  const left=tileWalkable(g,tx-1,ty), right=tileWalkable(g,tx+1,ty);
  const up=tileWalkable(g,tx,ty-1), down=tileWalkable(g,tx,ty+1);
  let bx=0, by=0, strength=0;
  if(Math.abs(dirX)>Math.abs(dirY)){
    // Horizontal corridor: keep to row centre when vertical walls form a tunnel.
    if(!up || !down){ by=(centre.y-enemy.y)/Math.max(1,TILE*0.5); strength=0.34; }
  } else {
    // Vertical corridor: keep to column centre when horizontal walls form a tunnel.
    if(!left || !right){ bx=(centre.x-enemy.x)/Math.max(1,TILE*0.5); strength=0.34; }
  }
  // Extra nudge away from close solid side walls.
  const margin=(enemy.pathingRadius||enemy.r||12)+5;
  const localX=enemy.x-tx*TILE, localY=enemy.y-ty*TILE;
  if(!left && localX<margin){ bx+=0.45; strength=Math.max(strength,0.28); }
  if(!right && TILE-localX<margin){ bx-=0.45; strength=Math.max(strength,0.28); }
  if(!up && localY<margin){ by+=0.45; strength=Math.max(strength,0.28); }
  if(!down && TILE-localY<margin){ by-=0.45; strength=Math.max(strength,0.28); }
  return {x:bx,y:by,strength};
}

function findNearbyCornerMiningFallback(g,enemy,targetX,targetY){
  const [etx,ety]=worldToTile(enemy.x,enemy.y);
  const dx=Math.sign(targetX-enemy.x), dy=Math.sign(targetY-enemy.y);
  const candidates=[];
  if(dx||dy) candidates.push([etx+dx,ety+dy]);
  if(dx) candidates.push([etx+dx,ety]);
  if(dy) candidates.push([etx,ety+dy]);
  if(dx&&dy){ candidates.push([etx+dx,ety-dy],[etx-dx,ety+dy]); }
  for(const [tx,ty] of candidates){
    if(inMap(tx,ty) && typeof isEnemyMineableTile==='function' && isEnemyMineableTile(g,tx,ty)) return {tx,ty,reason:'smoothCornerFallback'};
  }
  return null;
}

function openTileScore(g,tx,ty,radiusTiles=2){
  let open=0;
  for(let y=ty-radiusTiles;y<=ty+radiusTiles;y++) for(let x=tx-radiusTiles;x<=tx+radiusTiles;x++){
    if(tileWalkable(g,x,y)) open++;
  }
  return open;
}

function bossSpawnCandidateValid(g,x,y){
  const [tx,ty]=worldToTile(x,y);
  if(!tileWalkable(g,tx,ty)) return false;
  if(!circleClearOfSolids(g,x,y,ENEMY_TYPES.boss.r+8)) return false;
  if(openTileScore(g,tx,ty,2)<16) return false;
  const [ptx,pty]=worldToTile(g.player.x,g.player.y);
  return findPathAStar(g,tx,ty,ptx,pty,1400).length>0;
}

function findSafeBossSpawn(g){
  const p=g.player;
  let fallback=null, fallbackScore=-Infinity;
  for(let tries=0;tries<120;tries++){
    const a=rand(0,Math.PI*2), d=rand(560,1350);
    const x=clamp(p.x+Math.cos(a)*d,TILE*4,WORLD_W-TILE*4);
    const y=clamp(p.y+Math.sin(a)*d,TILE*4,WORLD_H-TILE*4);
    const [tx,ty]=worldToTile(x,y);
    if(!tileWalkable(g,tx,ty) || !circleClearOfSolids(g,x,y,ENEMY_TYPES.boss.r+8)) continue;
    const score=openTileScore(g,tx,ty,3)-Math.abs(880-d)*0.004;
    if(score>fallbackScore){ fallbackScore=score; fallback={x,y}; }
    if(bossSpawnCandidateValid(g,x,y)) return {x,y};
  }
  if(fallback) return fallback;
  const [ptx,pty]=worldToTile(p.x,p.y);
  for(let r=14;r<40;r++){
    for(let ty=pty-r;ty<=pty+r;ty++) for(let tx=ptx-r;tx<=ptx+r;tx++){
      if(Math.abs(tx-ptx)!==r && Math.abs(ty-pty)!==r) continue;
      const c=tileCenter(tx,ty);
      if(dist2(c.x,c.y,p.x,p.y)<520*520) continue;
      if(bossSpawnCandidateValid(g,c.x,c.y)) return c;
    }
  }
  return {x:clamp(p.x+620,TILE*4,WORLD_W-TILE*4), y:p.y};
}

function ensureBossSpawnPocket(g,x,y){
  const [cx,cy]=worldToTile(x,y);
  let changed=false;
  for(let ty=cy-2;ty<=cy+2;ty++) for(let tx=cx-2;tx<=cx+2;tx++){
    if(!inMap(tx,ty)) continue;
    const i=tileIdx(tx,ty);
    if(g.tiles[i]!==TILE_HARD && g.tiles[i]!==TILE_EMPTY){
      g.tiles[i]=TILE_EMPTY;
      g.tileHp[i]=0;
      changed=true;
    }
  }
  if(changed) g.navigationVersion++;
}

function updateSpawning(g,dt){
  const minute = Math.floor(g.time/60);
  const stage = Math.max(0, g.time/60);
  g.spawnTimer -= dt;
  const spawnMul=(g.missionDifficulty?.enemySpawnRateMultiplier || 1) * (g.performance?.spawnRateMultiplier ?? 1);
  if(spawnMul<=0){ g.spawnTimer=Math.max(g.spawnTimer,0.35); return; }
  const enemyCap=g.enemyBudget?.currentMaxEnemies || PERFORMANCE_CONFIG.baseMaxEnemies;
  if(g.enemies.length>=enemyCap){ g.spawnTimer=Math.max(g.spawnTimer,0.45); return; }

  // Gentler early-game ramp: first minute is sparse, then the cadence and
  // group size increase smoothly. Later stages still become intense.
  const baseRate = g.time<30 ? 2.45 : g.time<60 ? 1.85 : g.time<150 ? 1.28 : 0.92;
  const pressure=g.hollowPressure || 0;
  const rate = Math.max(0.16, (baseRate - minute*0.075)/(spawnMul*(1+pressure*0.08)));
  if(g.spawnTimer<=0){
    g.spawnTimer=rate*rand(0.82,1.22);
    const roll=Math.random();
    const rawAmount = Math.max(1, Math.floor(1 + stage*0.55 + g.level*0.10 + (g.hollowPressure||0)*0.65));
    const amount = Math.max(1, performanceAdjustedCount(g, rawAmount, false));
    if(g.time<35){
      if(roll<0.75) spawnBurst(g,1,'grunt');
      else spawnBurst(g,2,'swarmer');
    } else if(g.time<90){
      if(roll<0.52) spawnBurst(g,amount,'grunt');
      else if(roll<0.82) spawnBurst(g,amount+1,'swarmer');
      else spawnBurst(g,1,'guard');
    } else {
      const hexChance = clamp(0.04 + (g.hollowPressure||0)*0.025 + Math.max(0,minute-2)*0.01, 0.04, 0.18);
      if(roll<hexChance && g.time>120) spawnBurst(g,1,'hexShard');
      else if(roll<0.42) spawnBurst(g,amount,'grunt');
      else if(roll<0.68) spawnBurst(g,amount+2,'swarmer');
      else if(roll<0.88) spawnBurst(g,Math.max(1,Math.floor(amount/2)),'guard');
      else spawnBurst(g,Math.max(1,Math.floor(amount/2)),'exploder');
    }
  }
  if(g.time > g.eliteTimer){
    g.eliteTimer += Math.max(38, 82 - minute*3 - (g.hollowPressure||0)*4);
    if(canSpawnNormalEnemy(g,'elite',1)){
      spawnBurst(g,1,'elite');
      log(g,'Hollow Tyrant detected!');
      sfx('elite');
    }
  }
  if(g.time > g.nextWave){
    g.nextWave += Math.max(34, 52 - minute*2);
    const rawWaveCount = (g.time<70 ? 4+minute*2 : 8+minute*3) + (g.hollowPressure||0)*3;
    const waveCount = performanceAdjustedCount(g, rawWaveCount, true);
    if(waveCount>0 && canSpawnNormalEnemy(g,'swarmer',waveCount)){
      spawnBurst(g,waveCount,'swarmer');
      log(g,'Swarm wave incoming!');
      sfx('wave');
    }
  }
}


const CHARGING_WAVE_CONFIG = {
  firstPossibleTime: 90,
  checkIntervalMin: 5,
  checkIntervalMax: 10,
  baseChancePerCheck: 0.07,
  minCooldown: 150,
  maxCooldown: 180,
  healthyMin: 40,
  healthyMax: 60,
  warningMin: 20,
  warningMax: 35,
  minBudget: 20,
  warningDuration: 2.0,
  spawnDistanceMin: 700,
  spawnDistanceMax: 1100,
  formationSpacing: 27,
  speedMultiplier: 1.8,
  steeringRate: 5.2,
  explosionTriggerRadius: 55,
  explosionRadius: 95,
  explosionDamage: 10,
  damageCooldown: 0.12,
  stuckBreakDelay: 0.18
};

function ensureChargingWaveState(g){
  if(!g.chargingWave){
    g.chargingWave={enabled:true,active:false,warningActive:false,warningTimer:0,warningDuration:CHARGING_WAVE_CONFIG.warningDuration,pendingOptions:null,incomingDirection:0,lastSpawnTime:-9999,nextAllowedTime:CHARGING_WAVE_CONFIG.firstPossibleTime,checkTimer:rand(CHARGING_WAVE_CONFIG.checkIntervalMin,CHARGING_WAVE_CONFIG.checkIntervalMax),cooldown:CHARGING_WAVE_CONFIG.minCooldown,activeEnemyIds:[],lastSpawnCenter:null,lastFormationTargets:[],lastSkipReason:'Initialised',forceNextCheck:false,nextWaveId:1};
  }
  return g.chargingWave;
}

function updateChargingWaveScheduler(g,dt){
  const cw=ensureChargingWaveState(g);
  if(!cw.enabled) { cw.lastSkipReason='Disabled'; updateChargingWaveActiveState(g); return; }
  updateChargingWaveActiveState(g);
  if(cw.warningActive){
    cw.warningTimer=Math.max(0,(cw.warningTimer||0)-dt);
    cw.warningPulseTimer=(cw.warningPulseTimer||0)-dt;
    if(cw.warningPulseTimer<=0){ cw.warningPulseTimer=0.35; sfx('wave',0.55); }
    if(cw.warningTimer<=0){
      const opts=cw.pendingOptions || {};
      cw.warningActive=false;
      cw.pendingOptions=null;
      spawnChargingWave(g,opts);
    }
    return;
  }
  cw.checkTimer=(cw.checkTimer||0)-dt;
  if(!cw.forceNextCheck && cw.checkTimer>0) return;
  cw.checkTimer=rand(CHARGING_WAVE_CONFIG.checkIntervalMin,CHARGING_WAVE_CONFIG.checkIntervalMax);
  cw.forceNextCheck=false;
  const can=canSpawnChargingWave(g);
  if(!can.ok){ cw.lastSkipReason=can.reason; return; }
  const pressure=g.hollowPressure || 0;
  const mission=g.missionIndex || 1;
  const chance=clamp(CHARGING_WAVE_CONFIG.baseChancePerCheck + pressure*0.012 + (mission-1)*0.006, 0.05, 0.12);
  if(Math.random()<chance) startChargingWaveWarning(g,{count:can.count,budget:can.budget});
  else cw.lastSkipReason=`Random roll missed (${Math.round(chance*100)}% check chance)`;
}

function updateChargingWaveActiveState(g){
  const cw=ensureChargingWaveState(g);
  const before=cw.activeEnemyIds?.length || 0;
  cw.activeEnemyIds=(cw.activeEnemyIds||[]).filter(id=>g.enemies.some(e=>e.chargingWaveId===id && e.hp>0));
  cw.active=cw.warningActive || cw.activeEnemyIds.length>0;
  if(before && !cw.activeEnemyIds.length && !cw.warningActive) cw.lastSkipReason='Previous charging wave cleared';
}

function canSpawnChargingWave(g){
  const cw=ensureChargingWaveState(g);
  if(g.state!=='playing') return {ok:false,reason:'Game is not in active gameplay'};
  if(!g.player || g.player.hp<=0) return {ok:false,reason:'Player is not alive'};
  if(g.extraction && g.extractionTimer>0) return {ok:false,reason:'Extraction sequence active'};
  if(cw.warningActive || cw.active) return {ok:false,reason:'A charging wave is already active'};
  if((g.time||0)<CHARGING_WAVE_CONFIG.firstPossibleTime) return {ok:false,reason:`Waiting for first possible time (${CHARGING_WAVE_CONFIG.firstPossibleTime}s)`};
  if((g.time||0)<(cw.nextAllowedTime||0)) return {ok:false,reason:`Cooldown active (${Math.max(0,cw.nextAllowedTime-g.time).toFixed(1)}s)`};
  const perf=g.performance?.state || PERF_STATES.HEALTHY;
  if(perf===PERF_STATES.CRITICAL) return {ok:false,reason:'Performance state is critical'};
  const cap=g.enemyBudget?.currentMaxEnemies || PERFORMANCE_CONFIG.baseMaxEnemies;
  const budget=Math.max(0,cap-(g.enemies?.length||0));
  if(budget<CHARGING_WAVE_CONFIG.minBudget) return {ok:false,reason:`Insufficient enemy budget (${budget}/${CHARGING_WAVE_CONFIG.minBudget})`,budget};
  const min=perf===PERF_STATES.WARNING ? CHARGING_WAVE_CONFIG.warningMin : CHARGING_WAVE_CONFIG.healthyMin;
  const max=perf===PERF_STATES.WARNING ? CHARGING_WAVE_CONFIG.warningMax : CHARGING_WAVE_CONFIG.healthyMax;
  const count=Math.min(budget,randi(min,max));
  if(count<CHARGING_WAVE_CONFIG.minBudget) return {ok:false,reason:`Wave count below minimum after budget (${count})`,budget};
  return {ok:true,reason:'OK',count,budget,perf};
}

function startChargingWaveWarning(g,options={}){
  const cw=ensureChargingWaveState(g);
  const angle=rand(0,Math.PI*2);
  cw.warningActive=true;
  cw.active=true;
  cw.warningTimer=CHARGING_WAVE_CONFIG.warningDuration;
  cw.warningDuration=CHARGING_WAVE_CONFIG.warningDuration;
  cw.incomingDirection=angle;
  cw.pendingOptions={...options,angle};
  cw.lastSkipReason='Warning active';
  log(g,'CHARGING WAVE INCOMING!');
  sfx('wave',1.15);
  shake=Math.max(shake,5);
}

function findChargingWaveSpawnCenter(g,angle){
  const p=g.player;
  const preferred=rand(CHARGING_WAVE_CONFIG.spawnDistanceMin,CHARGING_WAVE_CONFIG.spawnDistanceMax);
  const candidateAngles=[angle, angle+0.28, angle-0.28, angle+0.65, angle-0.65, angle+Math.PI*0.5, angle-Math.PI*0.5];
  for(const a of candidateAngles){
    for(let d=preferred; d>=520; d-=70){
      const x=clamp(p.x+Math.cos(a)*d,TILE*2,WORLD_W-TILE*2);
      const y=clamp(p.y+Math.sin(a)*d,TILE*2,WORLD_H-TILE*2);
      const [tx,ty]=worldToTile(x,y);
      if(!inMap(tx,ty)) continue;
      if(isSolid(tileAt(g,tx,ty))) continue;
      if(dist2(x,y,p.x,p.y)<500*500) continue;
      return {x,y,angle:a,distance:d};
    }
  }
  const x=clamp(p.x+Math.cos(angle)*700,TILE*2,WORLD_W-TILE*2);
  const y=clamp(p.y+Math.sin(angle)*700,TILE*2,WORLD_H-TILE*2);
  return {x,y,angle,distance:700};
}

function spawnChargingWave(g,options={}){
  const cw=ensureChargingWaveState(g);
  const can=canSpawnChargingWave(g);
  const count=options.count || (can.ok ? can.count : CHARGING_WAVE_CONFIG.minBudget);
  const spawnInfo=findChargingWaveSpawnCenter(g,options.angle ?? rand(0,Math.PI*2));
  const center={x:spawnInfo.x,y:spawnInfo.y};
  const dirToPlayer=normalizeVec(g.player.x-center.x,g.player.y-center.y);
  const waveId=(cw.nextWaveId||1);
  cw.nextWaveId=waveId+1;
  cw.lastSpawnCenter=center;
  cw.lastFormationTargets=[];
  cw.activeEnemyIds=[];
  const spawned=spawnChargingWaveFormation(g,center,dirToPlayer,count,waveId);
  cw.lastSpawnTime=g.time||0;
  cw.cooldown=rand(CHARGING_WAVE_CONFIG.minCooldown,CHARGING_WAVE_CONFIG.maxCooldown);
  cw.nextAllowedTime=(g.time||0)+cw.cooldown;
  cw.active=spawned>0;
  cw.warningActive=false;
  cw.lastSkipReason=spawned>0 ? `Spawned ${spawned} Rift Chargers` : 'No valid formation slots';
  if(g.runStats){ g.runStats.chargingWavesSpawned=(g.runStats.chargingWavesSpawned||0)+1; g.runStats.chargingWaveEnemiesSpawned=(g.runStats.chargingWaveEnemiesSpawned||0)+spawned; }
  log(g,`Rift Charger wave: ${spawned} enemies!`);
  sfx('elite',0.75);
  return spawned;
}

function normalizeVec(x,y){ const l=Math.max(0.001,Math.hypot(x,y)); return {x:x/l,y:y/l}; }

function formationOffsetForIndex(i,count,spacing){
  const cols=Math.ceil(Math.sqrt(count*1.35));
  const row=Math.floor(i/cols);
  const col=i%cols;
  const rows=Math.ceil(count/cols);
  const wedge=Math.abs(col-(cols-1)/2)*0.38;
  return {x:(col-(cols-1)/2)*spacing + rand(-4,4), y:(row-(rows-1)/2)*spacing + wedge*spacing + rand(-4,4)};
}

function spawnChargingWaveFormation(g,center,dir,count,waveId){
  const cw=ensureChargingWaveState(g);
  const right={x:-dir.y,y:dir.x};
  const back={x:-dir.x,y:-dir.y};
  const spacing=CHARGING_WAVE_CONFIG.formationSpacing;
  let spawned=0;
  for(let i=0;i<count;i++){
    const off=formationOffsetForIndex(i,count,spacing);
    let x=center.x + right.x*off.x + back.x*off.y;
    let y=center.y + right.y*off.x + back.y*off.y;
    x=clamp(x,TILE*2,WORLD_W-TILE*2); y=clamp(y,TILE*2,WORLD_H-TILE*2);
    const [tx,ty]=worldToTile(x,y);
    if(isSolid(tileAt(g,tx,ty))){
      const open=findClosestWalkableTile(g,tx,ty,5);
      if(open){ const c=tileCenter(open.tx,open.ty); x=c.x; y=c.y; }
      else continue;
    }
    const e=new Enemy(x,y,'charging_exploder');
    e.isChargingWaveEnemy=true;
    e.chargingWaveId=waveId;
    e.displayName='Rift Charger';
    e.visualDisplayName='Rift Charger';
    e.spawnArchetype='charging_exploder';
    e.noPathTimer=999;
    e.path=[]; e.rawPath=[]; e.smoothPath=[];
    e.chargeSpeedMultiplier=CHARGING_WAVE_CONFIG.speedMultiplier*rand(0.92,1.08);
    e.speed=(ENEMY_TYPES.charging_exploder.speed || 250)*e.chargeSpeedMultiplier;
    e.explosionTriggerRadius=CHARGING_WAVE_CONFIG.explosionTriggerRadius;
    e.explosionRadius=CHARGING_WAVE_CONFIG.explosionRadius;
    e.explosionDamage=CHARGING_WAVE_CONFIG.explosionDamage;
    e.canMineBlocks=true;
    e.countsForKillObjective=true;
    e.formationOffset=off;
    e.formationTarget={x,y};
    e.chargeDir={x:dir.x,y:dir.y};
    e.stuckBreakTimer=0;
    e.rangedCd=9999;
    e.xp=Math.max(1,e.xp||2);
    cw.activeEnemyIds.push(waveId);
    cw.lastFormationTargets.push({x,y});
    g.enemies.push(e);
    spawned++;
  }
  return spawned;
}

function updateChargingWaveEnemy(g,e,dt){
  const p=g.player;
  const dx=p.x-e.x, dy=p.y-e.y;
  const d=Math.hypot(dx,dy);
  if(d <= (e.explosionTriggerRadius || CHARGING_WAVE_CONFIG.explosionTriggerRadius)){
    explodeChargingWaveEnemy(g,e);
    return;
  }
  const target=normalizeVec(dx + (p.lastDx||0)*36, dy + (p.lastDy||0)*36);
  const steer=clamp((e.steeringRate || CHARGING_WAVE_CONFIG.steeringRate)*dt,0,1);
  e.chargeDir=e.chargeDir || {x:target.x,y:target.y};
  e.chargeDir.x=lerp(e.chargeDir.x,target.x,steer);
  e.chargeDir.y=lerp(e.chargeDir.y,target.y,steer);
  const l=Math.max(0.001,Math.hypot(e.chargeDir.x,e.chargeDir.y)); e.chargeDir.x/=l; e.chargeDir.y/=l;

  // Slight, deterministic-looking rank cohesion: each charger is pulled toward
  // a translated formation point, but the whole pack still steers at the player.
  const cw=ensureChargingWaveState(g);
  const center=cw.lastSpawnCenter || {x:e.x,y:e.y};
  const travel=Math.max(0,(g.time||0)-(cw.lastSpawnTime||g.time||0))*e.speed*0.72;
  const right={x:-e.chargeDir.y,y:e.chargeDir.x};
  const back={x:-e.chargeDir.x,y:-e.chargeDir.y};
  const off=e.formationOffset || {x:0,y:0};
  e.formationTarget={x:center.x+e.chargeDir.x*travel+right.x*off.x+back.x*off.y, y:center.y+e.chargeDir.y*travel+right.y*off.x+back.y*off.y};
  let ux=e.chargeDir.x, uy=e.chargeDir.y;
  const cd=dist2(e.x,e.y,e.formationTarget.x,e.formationTarget.y);
  if(cd>45*45){
    const cdir=normalizeVec(e.formationTarget.x-e.x,e.formationTarget.y-e.y);
    ux=lerp(ux,cdir.x,0.22); uy=lerp(uy,cdir.y,0.22);
    const nl=Math.max(0.001,Math.hypot(ux,uy)); ux/=nl; uy/=nl;
  }
  ux+=Math.sin((g.time||0)*8+e.phase)*0.045; uy+=Math.cos((g.time||0)*7+e.phase)*0.045;
  const nl=Math.max(0.001,Math.hypot(ux,uy)); ux/=nl; uy/=nl;

  if(e.canMineBlocks) tryChargingWaveBreakAhead(g,e,ux,uy,dt);
  const oldX=e.x, oldY=e.y;
  if(!g.debug?.freezeEnemies) moveCircle(g,e,ux*e.speed*dt,uy*e.speed*dt);
  const moved=Math.hypot(e.x-oldX,e.y-oldY);
  if(moved<2.0) e.stuckBreakTimer=(e.stuckBreakTimer||0)+dt; else e.stuckBreakTimer=0;
  if(e.stuckBreakTimer>CHARGING_WAVE_CONFIG.stuckBreakDelay){
    breakNearbyChargingWaveBlocks(g,e,ux,uy);
    e.stuckBreakTimer=0;
  }
  if(shouldEmitVfx(g,false) && Math.random()<0.55){
    addParticle(g,e.x-ux*e.r,e.y-uy*e.r,-ux*rand(60,160)+rand(-20,20),-uy*rand(60,160)+rand(-20,20),'#ff7038',rand(0.12,0.24),rand(2,4),'spark');
  }
}

function tryChargingWaveBreakAhead(g,e,ux,uy,dt){
  const look=Math.max(TILE*0.45,e.r+e.speed*dt*0.8);
  const pts=[0, -e.r*0.65, e.r*0.65];
  const right={x:-uy,y:ux};
  for(const side of pts){
    const x=e.x+ux*look+right.x*side;
    const y=e.y+uy*look+right.y*side;
    const [tx,ty]=worldToTile(x,y);
    if(destroyTileByChargingWave(g,tx,ty,e)) return true;
  }
  return false;
}

function breakNearbyChargingWaveBlocks(g,e,ux,uy){
  const [cx,cy]=worldToTile(e.x+ux*(e.r+8),e.y+uy*(e.r+8));
  let broke=false;
  for(let r=0;r<=1 && !broke;r++){
    for(let ty=cy-r;ty<=cy+r && !broke;ty++) for(let tx=cx-r;tx<=cx+r;tx++){
      if(destroyTileByChargingWave(g,tx,ty,e)){ broke=true; break; }
    }
  }
  return broke;
}

function destroyTileByChargingWave(g,tx,ty,e){
  if(!inMap(tx,ty)) return false;
  const i=tileIdx(tx,ty);
  const t=g.tiles[i];
  if(t===TILE_EMPTY || t===TILE_HARD || t===TILE_LAVA_ROCK) return false;
  if(!isMineableForPlayer(t)) return false;
  const wasOre=t===TILE_GOLD || t===TILE_NITRA || t===TILE_CRYSTAL || t===TILE_FERRITE_BARK || t===TILE_LUMINA_SPORES || t===TILE_AETHER_QUARTZ || t===TILE_CRYSALITH || t===TILE_EMBERGLASS;
  g.tiles[i]=TILE_EMPTY; g.tileHp[i]=0; g.navigationVersion++;
  if(g.runStats){
    g.runStats.blocksBrokenByChargingWaves=(g.runStats.blocksBrokenByChargingWaves||0)+1;
    if(wasOre) g.runStats.oresDestroyedByChargingWaves=(g.runStats.oresDestroyedByChargingWaves||0)+1;
  }
  const x=tileToWorldCenterX(tx), y=tileToWorldCenterY(ty);
  for(let k=0;k<8;k++) addParticle(g,x,y,rand(-120,120),rand(-120,120),wasOre?'#ff9f43':'#8f6a4a',rand(0.18,0.42),rand(2,5),'spark');
  if(wasOre) floating(g,x,y-TILE*0.18,'Ore destroyed','#ff7038');
  return true;
}

function explodeChargingWaveEnemy(g,e){
  if(e.hp<=0 || e.exploded) return;
  e.exploded=true;
  e.noDrop=true;
  e.hp=0;
  if(g.runStats) g.runStats.chargingWaveEnemiesExploded=(g.runStats.chargingWaveEnemiesExploded||0)+1;
  applyChargingWaveExplosionDamage(g,e);
  const r=e.explosionRadius || CHARGING_WAVE_CONFIG.explosionRadius;
  shake=Math.max(shake,9);
  addRing(g,e.x,e.y,'rgba(255,112,56,0.92)',0.28,6,r,6);
  addRing(g,e.x,e.y,'rgba(255,228,150,0.75)',0.16,3,r*0.55,4);
  addParticle(g,e.x,e.y,0,0,'rgba(255,245,220,0.96)',0.10,22);
  for(let k=0;k<28;k++){
    const a=rand(0,Math.PI*2), sp=rand(100,360);
    addParticle(g,e.x,e.y,Math.cos(a)*sp,Math.sin(a)*sp,k%3===0?'#ffd36b':'#ff7038',rand(0.16,0.48),rand(1.8,4.6),k%4===0?'fragment':'spark');
  }
  spawnVfxComposition(g,'chargingWaveExplosion',e.x,e.y,{radius:r,color:'#ff7038'});
  sfx('explosion',0.72);
}

function applyChargingWaveExplosionDamage(g,e){
  const p=g.player;
  const r=(e.explosionRadius || CHARGING_WAVE_CONFIG.explosionRadius)+(p.collisionR||p.r);
  const d=Math.hypot(p.x-e.x,p.y-e.y);
  if(d>r) return;
  if((p.chargingWaveExplosionDamageCd||0)>0) return;
  const falloff=1-clamp(d/r,0,1)*0.35;
  const damage=Math.max(1,Math.round((e.explosionDamage || CHARGING_WAVE_CONFIG.explosionDamage)*falloff*(p.armourMul || 1)));
  p.hp-=damage;
  p.chargingWaveExplosionDamageCd=CHARGING_WAVE_CONFIG.damageCooldown;
  p.iframes=Math.max(p.iframes,0.18);
  if(typeof recordRunDamageTaken==='function') recordRunDamageTaken(g,damage,'chargingWaveExplosion');
  if(g.runStats) g.runStats.damageTakenFromChargingWaves=(g.runStats.damageTakenFromChargingWaves||0)+damage;
  floating(g,p.x,p.y-25,`-${damage}`,'#ff7038');
  flashDamage();
  if(p.hp<=0) gameOver(g);
}

function debugChargingWaveMetrics(g){
  const cw=ensureChargingWaveState(g);
  const can=canSpawnChargingWave(g);
  return {
    enabled:!!cw.enabled,
    active:!!cw.active,
    warning:!!cw.warningActive,
    timeSinceLast:(g.time||0)-(cw.lastSpawnTime||0),
    nextAllowed:Math.max(0,(cw.nextAllowedTime||0)-(g.time||0)),
    alive:(g.enemies||[]).filter(e=>e.isChargingWaveEnemy && e.hp>0).length,
    budget:Math.max(0,(g.enemyBudget?.currentMaxEnemies||0)-(g.enemies?.length||0)),
    skip: can.ok ? cw.lastSkipReason || 'Ready' : can.reason
  };
}

function addObjectiveProgress(g,id,amount){
  const obj=g.objectives.find(o=>o.id===id);
  if(!obj || obj.completed) return;
  obj.currentAmount=clamp(obj.currentAmount+amount,0,obj.targetAmount);
  if(obj.currentAmount>=obj.targetAmount){
    obj.completed=true;
    log(g, `${obj.displayName} complete.`);
    sfx('level',0.75);
    if(g.runStats) g.runStats.objectivesCompleted=(g.runStats.objectivesCompleted||0)+1;
  }
}

function allObjectivesComplete(g){
  return g.objectives.length>0 && g.objectives.every(o=>o.completed);
}

function spawnRunBoss(g){
  if(g.bossSpawned) return;
  g.bossSpawned=true;
  const spot=findSafeBossSpawn(g);
  ensureBossSpawnPocket(g,spot.x,spot.y);

  // Phase 2.2: determine which boss type to spawn
  const bossId = selectBossForMission(g);
  const bossDef = BOSS_TYPES[bossId];
  if(!bossDef) return;

  g.bossType = bossId;
  g.bossPhase = 0;
  g.bossPhaseTimer = 0;
  g.bossWeakPoint = {
    active:false,
    timer:bossDef.weakPointCooldown,
    duration:0,
    cooldown:0,
    x:spot.x, y:spot.y,
    radius:24
  };
  g.bossNameDisplay = {
    text:bossDef.name,
    timer:3.5,
    fadeOut:false
  };

  const boss=new Enemy(spot.x,spot.y,'boss');
  const diff=g.missionDifficulty || missionDifficulty(1);
  // Override base stats with boss-type-specific values
  boss.bossType = bossId;
  boss.bossPhase = 0;
  boss.hp = Math.round(bossDef.baseHp * diff.bossHealthMultiplier);
  boss.maxHp = boss.hp;
  boss.speed = bossDef.speed;
  boss.damage = Math.round(bossDef.damage * diff.bossDamageMultiplier);
  boss.xp = bossDef.xp;
  boss.color = bossDef.color;
  boss.spriteId = bossDef.spriteId;
  boss.rangedCd = 1.8;
  boss.attackCd = 0;           // general attack cooldown
  boss.attackIndex = 0;        // used for multi-part attack sequences
  boss.lastAttack = '';        // name of last attack (prevent repeats)
  boss.isBurrowed = false;     // Molten Maw state
  boss.burrowTarget = null;    // Molten Maw burrow destination
  boss.fireTrailTimer = 0;     // Molten Maw fire trail timer
  boss.chargeCount = 0;        // remaining multiRush charges
  boss.chargeDelay = 0;        // delay between multiRush charges
  boss.telegraphTimer = 0;     // pre-attack telegraph countdown
  g.enemies.push(boss);
  log(g,`${bossDef.icon} Boss: ${bossDef.name} incoming. Clear it to call extraction.`);
  sfx('bossRoar',1.0);
  shake=Math.max(shake,12);
}

/*
 * Phase 2.2: Boss Update System
 *
 * Called each frame from updateEnemies() for the active boss enemy.
 * Handles:
 *   - Phase transitions with visual/audio feedback
 *   - Attack cooldown management with phase-scaled timing
 *   - Weak point countdown, appearance, and stagger
 *   - Boss-specific attack execution (all 9 patterns across 3 bosses)
 */

function executeBossAttack(g, boss, attackName, dt){
  const p = g.player;
  if(!p) return;
  const bossDef = BOSS_TYPES[boss.bossType] || BOSS_TYPES.hollowTyrant;
  const diff = g.missionDifficulty || missionDifficulty(1);

  // ── HOLLOW TYRANT ATTACKS ─────────────────────────────────────────
  if(attackName === 'swipe'){
    // Slow melee arc in front of boss. Telegraphed with red zone.
    const angle = Math.atan2(p.y - boss.y, p.x - boss.x);
    const arcHalf = 0.6; // ~70 degree arc
    const range = boss.r + 80;
    // Telegraph: red expanding arc indicator (0.2s before hit)
    const telegraphAngle = angle + boss.bossPhase * 0.15; // wider telegraph in later phases
    const flashPulse = Math.sin(g.time * 30) * 0.3 + 0.7;
    addRing(g, boss.x + Math.cos(telegraphAngle) * 30, boss.y + Math.sin(telegraphAngle) * 30,
      `rgba(255,0,0,${0.4 * flashPulse})`, 0.15, 20, 55, 5);
    // Check enemies hit in arc
    if(dist2(boss.x,boss.y,p.x,p.y) < range*range){
      const aToP = Math.atan2(p.y - boss.y, p.x - boss.x);
      const diffA = Math.abs(normalizeAngle(aToP - angle));
      if(diffA < arcHalf){
        const dmg = Math.round(boss.damage * 1.0);
        damagePlayer(g, dmg, 'bossSwipe');
        shake = Math.max(shake, 6);
      }
    }
    // Visual: red arc indicator
    spawnVfxComposition(g, 'bossShockwave', boss.x + Math.cos(angle)*40, boss.y + Math.sin(angle)*40, {radius:50, color:'#ff3030'});
    boss.lastAttack = 'swipe';
  }

  if(attackName === 'charge'){
    // Boss charges toward player. Dodgeable sideways.
    const angle = Math.atan2(p.y - boss.y, p.x - boss.x);
    const chargeSpeed = boss.speed * 3.5 * (boss.bossPhase > 0 ? 1.2 : 1.0);
    boss.vx = Math.cos(angle) * chargeSpeed;
    boss.vy = Math.sin(angle) * chargeSpeed;
    boss.chargeTimer = 0.5;
    boss.lastAttack = 'charge';
    sfx('missileWhoosh', 0.8);
  }

  if(attackName === 'slam'){
    // Slams ground, creates expanding shockwave ring
    // Telegraph: ground rumble indicator
    const telegraphPulse = Math.sin(g.time * 24) * 0.3 + 0.7;
    addRing(g, boss.x, boss.y, `rgba(255,50,50,${0.3 * telegraphPulse})`, 0.2, boss.r, boss.r + 60 + 20 * telegraphPulse, 5);
    shake = Math.max(shake, 10);
    addRing(g, boss.x, boss.y, 'rgba(255,80,80,0.6)', 0.6, 20, boss.r + 120, 6);
    // Damage in expanding ring
    const dmg = Math.round(boss.damage * 1.2);
    if(dist2(boss.x,boss.y,p.x,p.y) < (boss.r + 130)*(boss.r + 130)){
      damagePlayer(g, dmg, 'bossSlam');
    }
    sfx('explosion', 0.9);
    spawnVfxComposition(g, 'bossShockwave', boss.x, boss.y, {radius:boss.r+40, color:'#ff4f4f'});
    boss.lastAttack = 'slam';
  }

  if(attackName === 'rageRoar'){
    // Sends out 3-4 shockwaves in all directions (Phase 3 only)
    const numWaves = 3 + (Math.random() < 0.5 ? 1 : 0);
    for(let i = 0; i < numWaves; i++){
      const a = (Math.PI * 2 / numWaves) * i + Math.random() * 0.3;
      const waveSpeed = 160;
      // Fire a damaging projectile ring
      g.enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * waveSpeed,
        vy: Math.sin(a) * waveSpeed,
        r: 22, damage: Math.round(boss.damage * 0.8),
        color: '#ff4fd8', life: 1.2,
        destructive: false, small: false,
        bossAttack: true,
        spriteId: 'bossShockwave'
      });
    }
    shake = Math.max(shake, 14);
    sfx('bossRoar', 1.2);
    spawnVfxComposition(g, 'bossShockwave', boss.x, boss.y, {radius:80, color:'#ff4fd8'});
    boss.lastAttack = 'rageRoar';
  }

  // ── HEX SHARD COLOSSUS ATTACKS ─────────────────────────────────────
  if(attackName === 'crystalSpread'){
    // Fires 3/5/7 crystal shards in a spread depending on phase
    const numShards = boss.bossPhase === 0 ? 3 : boss.bossPhase === 1 ? 5 : 7;
    const angle = Math.atan2(p.y - boss.y, p.x - boss.x);
    const spread = 0.3 + boss.bossPhase * 0.05;
    for(let i = 0; i < numShards; i++){
      const a = angle - spread + (spread * 2 / Math.max(1, numShards - 1)) * i;
      const speed = 140 + Math.random() * 40;
      g.enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        r: 10, damage: Math.round(boss.damage * 0.7),
        color: '#b46bff', life: 2.0,
        destructive: false, small: true,
        bossAttack: true,
        spriteId: 'bossCrystalShard'
      });
    }
    sfx('shoot', 0.6);
    boss.lastAttack = 'crystalSpread';
  }

  if(attackName === 'spawnHexShard'){
    // Spawns 1/2/3 Hex Shard enemies
    const numSpawns = boss.bossPhase === 0 ? 1 : boss.bossPhase === 1 ? 2 : 3;
    for(let i = 0; i < numSpawns; i++){
      const a = Math.random() * Math.PI * 2;
      const d = 120 + Math.random() * 60;
      const sx = clamp(boss.x + Math.cos(a) * d, TILE*3, WORLD_W - TILE*3);
      const sy = clamp(boss.y + Math.sin(a) * d, TILE*3, WORLD_H - TILE*3);
      const [tx, ty] = worldToTile(sx, sy);
      if(tileWalkable(g, tx, ty)){
        const spawned = new Enemy(sx, sy, 'hexShardThrower');
        spawned.hp = Math.round(spawned.hp * 1.2);
        spawned.maxHp = spawned.hp;
        g.enemies.push(spawned);
      }
    }
    sfx('hexBlip', 0.8);
    boss.lastAttack = 'spawnHexShard';
  }

  if(attackName === 'crystalRain'){
    // Shards fall from ceiling with floor indicators
    const numRain = 5 + boss.bossPhase * 2;
    for(let i = 0; i < numRain; i++){
      const rx = p.x + rand(-200, 200);
      const ry = p.y + rand(-200, 200);
      // Add warning indicator (rendered as a floor marker)
      addBossCrystalRainIndicator(g, rx, ry, 0.7);
      // Schedule the actual crystal shard to fall after warning
      g.bossCrystalRain = g.bossCrystalRain || [];
      g.bossCrystalRain.push({x: rx, y: ry - 60, targetY: ry, timer: 0.7, speed: 180, damage: Math.round(boss.damage * 0.6)});
    }
    boss.lastAttack = 'crystalRain';
  }

  // ── MOLTEN MAW ATTACKS ────────────────────────────────────────────
  if(attackName === 'burrowErupt'){
    if(!boss.isBurrowed){
      // Burrow into the ground — become invulnerable, move toward player
      boss.isBurrowed = true;
      boss.burrowTarget = {x: p.x + rand(-60, 60), y: p.y + rand(-60, 60)};
      boss.attackCd = 0.8; // Brief delay before eruption
      boss.color = 'rgba(255,120,56,0.4)';
      spawnVfxComposition(g, 'enemyDeathBurst', boss.x, boss.y, {radius:30, color:'#ff7038'});
    } else {
      // Erupt from the ground
      boss.isBurrowed = false;
      boss.x = clamp(boss.burrowTarget?.x || boss.x, TILE*3, WORLD_W - TILE*3);
      boss.y = clamp(boss.burrowTarget?.y || boss.y, TILE*3, WORLD_H - TILE*3);
      boss.color = bossDef.color || '#ff7a38';
      shake = Math.max(shake, 10);
      // Damage in eruption radius
      if(dist2(boss.x,boss.y,p.x,p.y) < (boss.r + 80)*(boss.r + 80)){
        damagePlayer(g, Math.round(boss.damage * 1.1), 'bossErupt');
      }
      spawnVfxComposition(g, 'lavaBurst', boss.x, boss.y, {radius:boss.r+30, color:'#ff7038'});
      sfx('explosion', 1.0);
      // Leave lava pool
      for(let i = 0; i < 8; i++){
        const a = Math.random() * Math.PI * 2;
        const d = rand(20, 60);
        addParticle(g, boss.x + Math.cos(a)*d, boss.y + Math.sin(a)*d,
          0, 0, '#ff7038', 3.0, rand(14, 22), 'sprite');
        const lastP = g.particles[g.particles.length - 1];
        if(lastP) lastP.spriteId = 'fireTrail';
      }
      boss.lastAttack = 'burrowErupt';
    }
  }

  if(attackName === 'fireTrail'){
    // Leave a damaging fire trail while burrowed (Phase 2+)
    if(boss.isBurrowed){
      for(let i = 0; i < 3; i++){
        const tx = boss.x + rand(-30, 30);
        const ty = boss.y + rand(-30, 30);
        // Sprite-based fire trail ground decal
        addParticle(g, tx, ty, rand(-10, 10), rand(-20, -5), '#ff5b00', 1.5, rand(18, 28), 'sprite');
        // Attach spriteId to the last particle via a reference
        const lastP = g.particles[g.particles.length - 1];
        if(lastP) lastP.spriteId = 'fireTrail';
      }
      // Damage player if standing on trail
      if(dist2(boss.x,boss.y,p.x,p.y) < (boss.r + 50)*(boss.r + 50)){
        damagePlayer(g, Math.round(boss.damage * 0.3), 'bossFireTrail');
      }
      boss.lastAttack = 'fireTrail';
    }
  }

  if(attackName === 'fireballSpew'){
    // Spews 3 fireballs in a spread. Phase 3: tracking fireballs
    const numBalls = 3;
    const baseAngle = Math.atan2(p.y - boss.y, p.x - boss.x);
    const spread = 0.4;
    for(let i = 0; i < numBalls; i++){
      const a = boss.bossPhase >= 2 ? baseAngle - spread + (spread * 2 / (numBalls - 1)) * i : baseAngle - spread + (spread * 2 / (numBalls - 1)) * i;
      // Phase 3: tracking — fireballs curve toward player
      const speed = 130 + Math.random() * 30;
      g.enemyBullets.push({
        x: boss.x, y: boss.y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        r: 14, damage: Math.round(boss.damage * 0.9),
        color: '#ff7a38', life: 2.5,
        destructive: false, small: false,
        bossAttack: true,
        tracking: boss.bossPhase >= 2,   // Phase 3: tracking
        trackTurnRate: 2.5,
        spriteId: 'bossFireball'
      });
    }
    sfx('shoot', 0.7);
    boss.lastAttack = 'fireballSpew';
  }

  // ── NEW: SPREAD SHOT (universal) ──────────────────────────────────────
if(attackName === 'spreadShot'){
  const numShots = 5 + boss.bossPhase * 2;
  const angle = Math.atan2(p.y - boss.y, p.x - boss.x);
  const spread = 0.4;
  const speed = 120 + boss.bossPhase * 20;
  for(let i = 0; i < numShots; i++){
    const a = angle - spread/2 + (i/(numShots-1)) * spread;
    g.enemyBullets.push({
      x: boss.x + Math.cos(a)*(boss.r+10),
      y: boss.y + Math.sin(a)*(boss.r+10),
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      r: 8,
      damage: Math.round(boss.damage * 0.6),
      color: '#ffaa44',
      life: 2.0,
      destructive: false,
      small: false,
      bossAttack: true,
      spriteId: 'bossFireball'  // uses existing fireball sprite if available
    });
  }
  sfx('shoot', 0.7);
  boss.lastAttack = 'spreadShot';
}

// ── NEW: ELECTRIC ARC (Hollow Tyrant only) ───────────────────────────
if(attackName === 'electricArc'){
  const numBolts = 3 + boss.bossPhase;
  const angle = Math.atan2(p.y - boss.y, p.x - boss.x);
  const spread = 0.5;
  for(let i = 0; i < numBolts; i++){
    const a = angle - spread/2 + (i/(numBolts-1)) * spread;
    const speed = 180 + boss.bossPhase * 30;
    g.enemyBullets.push({
      x: boss.x + Math.cos(a)*(boss.r+10),
      y: boss.y + Math.sin(a)*(boss.r+10),
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      r: 6,
      damage: Math.round(boss.damage * 0.7),
      color: '#7df9ff',
      life: 1.8,
      destructive: false,
      small: false,
      bossAttack: true,
      spriteId: 'bossShockwave'  // existing sprite
    });
  }
  sfx('arc', 0.9);
  boss.lastAttack = 'electricArc';
}
}

/*
 * damagePlayer — centralised player damage helper.
 * Applies damage respecting armour, iframes, and triggers VFX/audio.
 * Designed to replace inline damage patterns throughout boss attacks.
 */
function damagePlayer(g, amount, source='enemyContact'){
  const p = g.player;
  if(!p) return;
  // Respect iframes
  if(p.iframes > 0) return;
  // Apply armour multiplier and round
  const damage = Math.max(1, Math.round(amount * (p.armourMul || 1)));
  p.hp -= damage;
  // Set iframes
  p.iframes = 0.65;
  // Track damage taken
  if(typeof recordRunDamageTaken === 'function') recordRunDamageTaken(g, damage, source);
  // Visual feedback
  flashDamage();
  shake = Math.max(shake, 8);
  floating(g, p.x, p.y - 25, `-${damage}`, '#ff5b5b');
  sfx('hit', 1.0);
  // Check death
  if(p.hp <= 0) gameOver(g);
}

function addBossCrystalRainIndicator(g, x, y, duration){
  g.bossCrystalRainIndicators = g.bossCrystalRainIndicators || [];
  g.bossCrystalRainIndicators.push({x, y, timer: duration, maxTimer: duration});
}

/*
 * Update boss-specific logic each frame.
 * Called from updateEnemies() for the active boss.
 */
function updateBoss(g, boss, dt){
  if (!boss || boss.hp <= 0) return;

  const bossDef = BOSS_TYPES[boss.bossType];

  if (!bossDef) return;
  const diff = g.missionDifficulty || missionDifficulty(1);
  const p = g.player;
  // ── Boss Name Display Timer ────────────────────────────────────────
  // Decrement each frame; fade begins in the last 1.5 seconds.

  // ── Phase Transition Check ────────────────────────────────────────
  const hpPct = boss.hp / boss.maxHp;
  let targetPhase = 0;
  if (hpPct <= 0.33) targetPhase = 2;
  else if (hpPct <= 0.66) targetPhase = 1;

  if (targetPhase !== boss.bossPhase) {
    // Phase transition! — dramatic effect with knockback, reposition, and particles
    boss.bossPhase = targetPhase;
    g.bossPhase = targetPhase;
    g.bossPhaseTimer = 2.0;
    shake = Math.max(shake, 18);
    const phaseText =
      targetPhase === 2 ? "⚠ ENRAGE!" : `⚡ PHASE ${targetPhase + 1}`;
    if (typeof floating === "function")
      floating(
        g,
        boss.x,
        boss.y - 60,
        `${bossDef.icon} ${phaseText}`,
        "#ff4444",
      );
    if (typeof log === "function") log(g, `${bossDef.name} ${phaseText}`);
    sfx("bossPhase", 1.0);
    // Large particle burst for phase transition
    spawnVfxComposition(g, "bossShockwave", boss.x, boss.y, {
      radius: 100,
      color: bossDef.color,
    });
    addRing(g, boss.x, boss.y, `rgba(255,60,60,0.5)`, 0.8, 10, 300, 8);
    // Knockback player if close to boss
    const p = g.player;
    if (p) {
      const dx = p.x - boss.x,
        dy = p.y - boss.y,
        d = Math.hypot(dx, dy) || 1;
      if (d < 200) {
        p.x += (dx / d) * 80;
        p.y += (dy / d) * 80;
        p.x = clamp(p.x, TILE, WORLD_W - TILE);
        p.y = clamp(p.y, TILE, WORLD_H - TILE);
      }
    }
    // Brief stun / reset for boss
    boss.attackCd = 1.0;
    boss.chargeTimer = 0;
    boss.lastAttack = "";
    // Re-apply phase stat multipliers
    const newPhaseCfg = bossDef.phases[targetPhase] || bossDef.phases[0];
    boss.speed = bossDef.speed * newPhaseCfg.speedMul;
    boss.damage = Math.round(
      bossDef.damage * diff.bossDamageMultiplier * newPhaseCfg.damageMul,
    );
    // Spawn ambient particles around the boss
    for (let k = 0; k < 30; k++) {
      const a = Math.random() * Math.PI * 2;
      const sp = rand(30, 150);
      addParticle(
        g,
        boss.x,
        boss.y,
        Math.cos(a) * sp,
        Math.sin(a) * sp,
        bossDef.color,
        rand(0.3, 0.8),
        rand(2, 6),
        k % 3 === 0 ? "ring" : "spark",
      );
    }
  }

  // ── Weak Point Timer ──────────────────────────────────────────────
  const wp = g.bossWeakPoint;
  if (!wp) return;

  // Cooldown after stagger
  if (wp.cooldown > 0) {
    wp.cooldown -= dt;
    if (wp.cooldown <= 0) {
      wp.timer = bossDef.weakPointCooldown;
    }
    return; // Don't update weak point during cooldown
  }

  // Weak point active countdown
  if (wp.active) {
    wp.duration -= dt;
    // Update weak point position to follow boss
    wp.x = boss.x;
    wp.y = boss.y - boss.r * 0.3;
    if (wp.duration <= 0) {
      wp.active = false;
      wp.timer = bossDef.weakPointCooldown;
    }
  } else {
    wp.timer -= dt;
    if (wp.timer <= 0) {
      // Weak point appears!
      wp.active = true;
      wp.duration = bossDef.weakPointDuration;
      wp.x = boss.x;
      wp.y = boss.y - boss.r * 0.3;
      if (typeof floating === "function")
        floating(g, boss.x, boss.y - boss.r - 20, "⚡ WEAK POINT", "#42d6ff");
      sfx("weakPointAppear", 1.0);
    }
  }

  // ── Telegraph Timer ───────────────────────────────────────────────
  // Show a warning effect before the next attack fires.
  // Only when attackCd is in the last 0.35s before firing.
  if (boss.attackCd > 0 && boss.attackCd <= 0.4 && !boss.telegraphTimer) {
    // Flash a warning glow
    const pulse = 0.3 + 0.7 * Math.sin(g.time * 28);
    addRing(
      g,
      boss.x,
      boss.y,
      `rgba(255,50,50,${0.2 * pulse})`,
      0.15,
      boss.r + 5,
      boss.r + 25 + 10 * pulse,
      3,
    );
  }

  // ── Attack Execution ──────────────────────────────────────────────
  // Phase-scaled cooldowns
  // If no transition occurred, use the current phase; otherwise we already have a phaseCfg from the transition.
  const phaseCfg = bossDef.phases[boss.bossPhase] || bossDef.phases[0];
  boss.attackCd = boss.attackCd || 0;
  boss.attackCd -= dt * phaseCfg.speedMul;

  if (boss.attackCd <= 0 && !boss.isCharging) {
    // Pick a random attack from this phase that isn't the last attack
    // Pick a random attack from this phase that isn't the last attack
    let available = phaseCfg.attacks.filter((a) => a !== boss.lastAttack);

    // If player is far, prefer ranged attacks
    const distToPlayer = Math.hypot(p.x - boss.x, p.y - boss.y);
    if (distToPlayer > 300) {
      const ranged = [
        "electricArc",
        "spreadShot",
        "crystalSpread",
        "fireballSpew",
        "crystalRain",
        "crystalWall",
      ];
      const rangedAvailable = available.filter((a) => ranged.includes(a));
      if (rangedAvailable.length) available = rangedAvailable;
    }

    const pool = available.length ? available : phaseCfg.attacks;
    const attack = pool[randi(0, pool.length - 1)];

    // Set cooldown based on attack type (more frequent — 1.5-3s baseline)
    let cdBase = 1.8;
    if (attack === "charge") cdBase = 2.8;
    else if (attack === "slam") cdBase = 3.5;
    else if (attack === "rageRoar") cdBase = 4.5;
    else if (attack === "multiRush") cdBase = 5.0;
    else if (attack === "spawnHexShard") cdBase = 3.5;
    else if (attack === "crystalRain") cdBase = 4.0;
    else if (attack === "crystalWall") cdBase = 4.0;
    else if (attack === "burrowErupt") cdBase = 3.0;
    else if (attack === "fireballSpew") cdBase = 2.2;
    // New attacks
    else if (attack === "spreadShot") cdBase = 2.0;
    else if (attack === "electricArc") cdBase = 2.5;

    boss.attackCd = cdBase + Math.random() * 0.8;
    executeBossAttack(g, boss, attack, dt);
  }

  // ── General Boss Movement ─────────────────────────────────────────
  // Bosses need continuous chase/positioning movement toward the player.
  // This runs every frame (except during charge or burrow).

  if (p && !boss.isBurrowed && (!boss.chargeTimer || boss.chargeTimer <= 0)) {
    const dx = p.x - boss.x;
    const dy = p.y - boss.y;
    const dist = Math.hypot(dx, dy) || 1;

    if (boss.bossType === "hollowTyrant") {
      // Melee boss — charge toward player
      const chaseSpeed = boss.speed * (phaseCfg.speedMul || 1);
      const dirX = dx / dist;
      const dirY = dy / dist;
      moveCircle(
        g,
        boss,
        dirX * chaseSpeed * dt * 0.6,
        dirY * chaseSpeed * dt * 0.6,
      );
    } else if (boss.bossType === "hexShardColossus") {
      // Ranged boss — maintain preferred distance (~350px)
      const preferredRange = 350;
      let moveDirX = 0,
        moveDirY = 0;
      const chaseSpeed = boss.speed * 0.8;
      if (dist < preferredRange - 60) {
        // Too close — back away
        moveDirX = -dx / dist;
        moveDirY = -dy / dist;
      } else if (dist > preferredRange + 80) {
        // Too far — move closer
        moveDirX = dx / dist;
        moveDirY = dy / dist;
      } else {
        // In preferred range — strafe slightly
        moveDirX = -dy / dist;
        moveDirY = dx / dist;
      }
      moveCircle(
        g,
        boss,
        moveDirX * chaseSpeed * dt * 0.6,
        moveDirY * chaseSpeed * dt * 0.6,
      );
    } else if (boss.bossType === "moltenMaw") {
      // Melee burrower — move toward player (when not burrowed)
      const chaseSpeed = boss.speed * 0.6;
      const dirX = dx / dist;
      const dirY = dy / dist;
      moveCircle(
        g,
        boss,
        dirX * chaseSpeed * dt * 0.6,
        dirY * chaseSpeed * dt * 0.6,
      );
    }
  }

  // ── Boss-specific continuous updates ──────────────────────────────
  // Molten Maw: burrow movement
  if (boss.bossType === "moltenMaw" && boss.isBurrowed && boss.burrowTarget) {
    const dx = boss.burrowTarget.x - boss.x;
    const dy = boss.burrowTarget.y - boss.y;
    const d = Math.hypot(dx, dy);
    if (d > 20) {
      const speed = boss.speed * 1.5;
      boss.x += (dx / d) * speed * dt;
      boss.y += (dy / d) * speed * dt;
    } else {
      // Reached target — erupt
      boss.isBurrowed = false;
      boss.attackCd = Math.min(boss.attackCd || 0, 0.3);
    }
  }

  // Molten Maw: fire trail while burrowed
  if (boss.bossType === "moltenMaw" && boss.isBurrowed && boss.bossPhase >= 1) {
    boss.fireTrailTimer = (boss.fireTrailTimer || 0) - dt;
    if (boss.fireTrailTimer <= 0) {
      executeBossAttack(g, boss, "fireTrail", dt);
      boss.fireTrailTimer = 0.3;
    }
  }

  // Charge movement for Hollow Tyrant (overrides general movement)
  if (
    boss.bossType === "hollowTyrant" &&
    boss.chargeTimer !== undefined &&
    boss.chargeTimer > 0
  ) {
    boss.chargeTimer -= dt;
    boss.x += (boss.vx || 0) * dt;
    boss.y += (boss.vy || 0) * dt;
    // Damage check while charging
    if (
      p &&
      dist2(boss.x, boss.y, p.x, p.y) < (boss.r + p.r + 8) * (boss.r + p.r + 8)
    ) {
      damagePlayer(g, Math.round(boss.damage * 0.8), "bossCharge");
      boss.chargeTimer = 0; // End charge on hit
    }
    // Slow down
    if (boss.vx) boss.vx *= 0.95;
    if (boss.vy) boss.vy *= 0.95;
  }

  // Phase 3 visual glow for enrage
  if (boss.bossPhase >= 2 && phaseCfg.enrage) {
    const pulse = 0.5 + 0.5 * Math.sin(g.time * 8);
    boss.enrageGlow = pulse;
  } else {
    boss.enrageGlow = 0;
  }

  // ── Update crystal rain indicators ────────────────────────────────
  g.bossCrystalRain = g.bossCrystalRain || [];
  for (let i = g.bossCrystalRain.length - 1; i >= 0; i--) {
    const rain = g.bossCrystalRain[i];
    rain.timer -= dt;
    if (rain.timer <= 0) {
      // Fire the crystal shard
      g.enemyBullets.push({
        x: rain.x,
        y: rain.y - 60,
        vx: 0,
        vy: rain.speed,
        r: 10,
        damage: rain.damage,
        color: "#b46bff",
        life: 1.5,
        destructive: false,
        small: true,
        bossAttack: true,
        spriteId: "bossCrystalShard",
      });
      g.bossCrystalRain.splice(i, 1);
    }
  }

  // Clean up indicators
  g.bossCrystalRainIndicators = g.bossCrystalRainIndicators || [];
  for (let i = g.bossCrystalRainIndicators.length - 1; i >= 0; i--) {
    g.bossCrystalRainIndicators[i].timer -= dt;
    if (g.bossCrystalRainIndicators[i].timer <= 0) {
      g.bossCrystalRainIndicators.splice(i, 1);
    }
  }
}

/*
 * Check if a player bullet hits the boss's active weak point.
 * Called from bullet collision code.
 * Returns true if the weak point was hit (2x damage, stagger).
 */
function checkBossWeakPointHit(g, boss, bullet){
  if(!boss || !g.bossWeakPoint?.active) return false;
  const wp = g.bossWeakPoint;
  if(dist2(wp.x, wp.y, bullet.x || 0, bullet.y || 0) < wp.radius * wp.radius){
    // Weak point hit! Apply stagger.
    staggerBoss(g, boss);
    // The bullet caller should multiply damage by 2x
    sfx('weakPointHit', 1.0);
    spawnVfxComposition(g, 'genericExplosion', wp.x, wp.y, {radius:20, color:'#42d6ff'});
    return true;
  }
  return false;
}

/*
 * Stagger the boss — brief stun, reset weak point, apply cooldown.
 */
function staggerBoss(g, boss){
  if(!boss || !g.bossWeakPoint) return;
  const bossDef = BOSS_TYPES[boss.bossType];
  if(!bossDef) return;

  // Stagger: brief stun
  boss.slow = bossDef.staggerDuration || 0.5;
  boss.hitFlash = 0.3;

  // Reset weak point
  g.bossWeakPoint.active = false;
  g.bossWeakPoint.cooldown = (bossDef.weakPointCooldown || 10) * 0.6; // 60% of normal cooldown after stagger
  g.bossWeakPoint.duration = 0;
  g.bossWeakPoint.timer = 0;

  shake = Math.max(shake, 6);
  if(typeof floating === 'function') floating(g, boss.x, boss.y - boss.r - 30, '💥 STAGGERED!', '#ffcc4d');
  if(typeof log === 'function') log(g, `${bossDef.name} staggered!`);
}

/*
 * Normalise an angle to [-PI, PI].
 */
function normalizeAngle(a){
  while(a > Math.PI) a -= Math.PI * 2;
  while(a < -Math.PI) a += Math.PI * 2;
  return a;
}

/*
 * Check if a specific enemy is the active boss.
 */
function isActiveBoss(g, e){
  return e && e.role === 'boss' && e.hp > 0 && g.bossType && BOSS_TYPES[g.bossType];
}

/*
 * Apply boss-specific rewards on defeat.
 */
function rewardBossDefeat(g, boss){
  if(!boss || !g.bossType) return;
  const bossDef = BOSS_TYPES[g.bossType];
  if(!bossDef) return;

  const diff = g.missionDifficulty || missionDifficulty(1);
  // Bonus XP
  const bonusXp = Math.round(bossDef.xp * diff.rewardMultiplier);
  g.xp = (g.xp || 0) + bonusXp;

  // Gild Shards
  const gildReward = Math.round((50 + Math.random() * 50) * diff.rewardMultiplier);
  g.resources.gild = (g.resources.gild || 0) + gildReward;

  // Unique boss drop
  const dropAmount = bossDef.uniqueDrop ? 1 : 0;
  if(dropAmount > 0 && bossDef.uniqueDrop === 'tyrantCore'){
    g.resources.ferriteBark = (g.resources.ferriteBark || 0) + Math.round(3 * diff.rewardMultiplier);
  } else if(dropAmount > 0 && bossDef.uniqueDrop === 'hexCrystalFragment'){
    g.resources.crysalith = (g.resources.crysalith || 0) + Math.round(3 * diff.rewardMultiplier);
  } else if(dropAmount > 0 && bossDef.uniqueDrop === 'moltenEmber'){
    g.resources.emberglass = (g.resources.emberglass || 0) + Math.round(3 * diff.rewardMultiplier);
  }

  log(g, `${bossDef.icon} ${bossDef.name} defeated! Gained ${bonusXp} XP and ${gildReward} Gild Shards.`);
}

function spawnExtractionCraft(g){
  if(g.extraction) return;
  const p=g.player;
  let x=p.x+520, y=p.y;
  for(let tries=0;tries<80;tries++){
    const a=rand(0,Math.PI*2), d=rand(360,720);
    const cx=clamp(p.x+Math.cos(a)*d,TILE*3,WORLD_W-TILE*3);
    const cy=clamp(p.y+Math.sin(a)*d,TILE*3,WORLD_H-TILE*3);
    const [tx,ty]=worldToTile(cx,cy);
    if(!isSolid(tileAt(g,tx,ty))){ x=cx; y=cy; break; }
  }
  g.extraction={x,y,r:34,pulse:0};
  g.extractionTimer=EXTRACTION_SECONDS;
  log(g,'Extraction craft inbound. Reach it before the timer expires.');
  sfx('wave',1.1);
}

function updateRunProgress(g,dt){
  if(allObjectivesComplete(g) && !g.bossSpawned) spawnRunBoss(g);
  if(g.bossDefeated && !g.extraction) spawnExtractionCraft(g);
  if(!g.extraction) return;
  g.extraction.pulse+=dt;
  g.extractionTimer-=dt;
  const p=g.player;
  if(dist2(p.x,p.y,g.extraction.x,g.extraction.y)<(p.r+g.extraction.r)*(p.r+g.extraction.r)){
    g.state='extracted';
    completeRun(g);
    return;
  }
  if(g.extractionTimer<=0){
    failRun(g,'Extraction timer expired.');
  }
}

function nearestEnemy(g,x,y,maxD=999999){
  let best=null, bd=maxD*maxD;
  for(const e of g.enemies){
    const d=dist2(x,y,e.x,e.y);
    if(d<bd){bd=d; best=e;}
  }
  return best;
}

function mouseWorld(g){
  return activeAimWorld(g);
}

function manualAimActive(g){
  return currentManualAimActive(g);
}

function mouseTargetActive(g){
  return getFogSettings().manualMouseControlEnabled && manualAimActive(g);
}

function mouseManualFireActive(g){
  return mouseTargetActive(g) && (mouse.down || (g.controllerCursor?.primaryHoldTimer || 0)>0);
}

function arcMouseAutoDisabled(g){
  return manualAimActive(g);
}

function targetEnemy(g,range,mouseBiasRadius=180){
  const p=g.player;
  if(mouseTargetActive(g)){
    const m = mouseWorld(g);
    let best=null, bd=mouseBiasRadius*mouseBiasRadius;
    for(const e of g.enemies){
      if(dist2(p.x,p.y,e.x,e.y) > range*range) continue;
      const d=dist2(m.x,m.y,e.x,e.y);
      if(d<bd){ bd=d; best=e; }
    }
    if(best) return best;
  }
  return nearestEnemy(g,p.x,p.y,range);
}

function arcConnectionMaxTargets(g){
  const arc = g.arcConnection;
  return arc?.unlocked ? 1 + arc.level : 0;
}

function liveArcSelections(g){
  const arc = g.arcConnection;
  if(!arc?.unlocked) return [];
  arc.selectedEnemies = arc.selectedEnemies.filter(e=>e && e.hp>0 && g.enemies.includes(e));
  arc.maxTargets = arcConnectionMaxTargets(g);
  return arc.selectedEnemies;
}

function enemyAtWorldPoint(g,x,y){
  let best=null, bd=Infinity;
  for(const e of g.enemies){
    const r=e.r+16;
    const d=dist2(x,y,e.x,e.y);
    if(d<r*r && d<bd){ best=e; bd=d; }
  }
  return best;
}

function handleArcConnectionRightClick(g, worldX=null, worldY=null){
  const arc = g.arcConnection;
  if(!arc?.unlocked || g.state!=='playing' || awaitingUpgrade) return false;
  const selections = liveArcSelections(g);
  const m = worldX == null || worldY == null ? mouseWorld(g) : {x:worldX,y:worldY};
  const target = enemyAtWorldPoint(g,m.x,m.y);
  if(target){
    if(selections.includes(target)){
      floating(g,target.x,target.y-24,'Linked','#5dff9a');
      addRing(g,target.x,target.y,'rgba(93,255,154,0.65)',0.18,target.r,target.r+14,3);
      return true;
    }
    if(selections.length >= arcConnectionMaxTargets(g)){
      floating(g,m.x,m.y-18,'Chain full','#5dff9a');
      addRing(g,m.x,m.y,'rgba(93,255,154,0.45)',0.20,8,30,3);
      return true;
    }
    selections.push(target);
    arc.flash = 0.22;
    floating(g,target.x,target.y-24,`Linked ${selections.length}/${arcConnectionMaxTargets(g)}`,'#5dff9a');
    addRing(g,target.x,target.y,'rgba(93,255,154,0.85)',0.25,target.r+4,target.r+20,4);
    sfx('arc',0.45);
    return true;
  }
  if(selections.length >= 2){
    detonateArcConnection(g);
  } else if(selections.length === 1){
    floating(g,selections[0].x,selections[0].y-28,'Need 2 links','#5dff9a');
  }
  return true;
}

function detonateArcConnection(g){
  const arc = g.arcConnection;
  const chain = liveArcSelections(g).slice();
  if(chain.length < 2) return;
  const dmg = 42 + arc.level * 16;
  if(g.runStats) g.runStats.arcDetonations=(g.runStats.arcDetonations||0)+1;
  shake = Math.max(shake, 8);
  for(let i=0;i<chain.length;i++){
    const e = chain[i];
    damageEnemy(g,e,dmg,'#7df9ff');
    explode(g,e.x,e.y,42+arc.level*5,18+arc.level*5,'#5dff9a',true,'arc');
    addRing(g,e.x,e.y,'rgba(125,249,255,0.95)',0.24,e.r+8,e.r+42,4);
    if(i>0){
      const prev=chain[i-1];
      g.arcs.push({x1:prev.x,y1:prev.y,x2:e.x,y2:e.y,life:0.24,maxLife:0.24,color:'#5dff9a',width:5});
      g.arcs.push({x1:prev.x,y1:prev.y,x2:e.x,y2:e.y,life:0.16,maxLife:0.16,color:'#7df9ff',width:2});
    }
  }
  arc.selectedEnemies = [];
  arc.flash = 0;
  log(g, `Arc Connection detonated through ${chain.length} targets.`);
  sfx('arc',1.2);
}

function updateArcConnection(g,dt){
  if(!g.arcConnection?.unlocked) return;
  g.arcConnection.flash=Math.max(0,g.arcConnection.flash-dt);
  liveArcSelections(g);
}


function handlePrimaryActionAt(g,worldX,worldY,source='input'){
  if(!g || g.state!=='playing' || awaitingUpgrade) return false;
  mouse.x=clamp(worldX-g.camera.x,0,innerWidth);
  mouse.y=clamp(worldY-g.camera.y,0,innerHeight);
  mouse.used=true;
  mouse.lastMove=g.time;
  if(g.controllerCursor){
    g.controllerCursor.screenX=mouse.x;
    g.controllerCursor.screenY=mouse.y;
    g.controllerCursor.worldX=worldX;
    g.controllerCursor.worldY=worldY;
    g.controllerCursor.active=true;
    g.controllerCursor.lastMoveTime=g.time;
    g.controllerCursor.primaryHoldTimer=0.18;
  }
  // Give click-driven/manual fire systems a short primary-action pulse.
  // This must not depend on the optional Targeting Cursor upgrade; it should
  // behave like a real left mouse click, because physical mouse down also sets
  // mouse.down unconditionally.
  mouse.down=true;
  return true;
}

function handleSecondaryActionAt(g,worldX,worldY,source='input'){
  if(!g || g.state!=='playing' || awaitingUpgrade) return false;
  mouse.x=clamp(worldX-g.camera.x,0,innerWidth);
  mouse.y=clamp(worldY-g.camera.y,0,innerHeight);
  mouse.used=true;
  mouse.lastMove=g.time;
  return handleArcConnectionRightClick(g,worldX,worldY);
}

function updateGamepadInput(dt){
  pollGamepadState();

  // Check all three overlays for controller navigation:
  // startOverlay (main menus), gameOverOverlay (run failed), runStatsOverlay (mission summary)
  const gameOverActive = document.getElementById('gameOverOverlay')?.classList?.contains('show');
  const statsActive = document.getElementById('runStatsOverlay')?.classList?.contains('show');
  if((ui.startOverlay?.classList?.contains('show') || gameOverActive || statsActive) && !awaitingUpgrade){
    updateMenuGamepadInput(dt);
    return;
  }

  if(!game) return;
  moveControllerCursor(game,dt);
  if(game.controllerCursor) game.controllerCursor.primaryHoldTimer=Math.max(0,(game.controllerCursor.primaryHoldTimer||0)-dt);
  if(!game.controllerCursor?.primaryHoldTimer && !mouse._physicalDown) mouse.down=false;

  if(awaitingUpgrade && game.upgradeMenuState?.open){
    updateUpgradeMenuGamepad(game,dt);
    return;
  }
  if(game.state!=='playing') return;
  if(gamepadPressed(GAMEPAD.Y)) triggerDash(game,'gamepad');

  // A was already used by the player as the trap button. Keep A mapped to the
  // same gameplay action as keyboard E while no menu is open.
  if(gamepadPressed(GAMEPAD.A)){
    if(typeof placeTrap === 'function') placeTrap(game);
  }

  if(gamepadPressed(GAMEPAD.X)){
    // X is the controller equivalent of the left mouse button / primary fire.
    const aim=activeAimWorld(game);
    handlePrimaryActionAt(game,aim.x,aim.y,'gamepad-x');
  }
  if(gamepadPressed(GAMEPAD.B)){
    const aim=activeAimWorld(game);
    handleSecondaryActionAt(game,aim.x,aim.y,'gamepad-b');
  }
}

function updateUpgradeMenuGamepad(g,dt){
  const state=g.upgradeMenuState;
  const cards=[...ui.upgradeCards.querySelectorAll('.card[data-upgrade-index]')];
  if(!state || !cards.length) return;

  // IMPORTANT: game time is frozen while the upgrade menu is open.  Use a real
  // clock for repeat timing, otherwise stick/D-pad navigation works at most
  // once and then appears broken.
  const t=menuInputClock();
  state.selectedIndex=clamp(state.selectedIndex ?? 0,0,cards.length-1);

  const nav=getGamepadLeftNav();
  if(!state.navWasActive && !nav.active){
    state.lastMoveTime=-999;
  }
  if(nav.active && (!state.navWasActive || t - (state.lastMoveTime ?? -999) >= (state.moveRepeatDelay ?? 0.20))){
    const step=(nav.x>0 || nav.y>0) ? 1 : -1;
    state.selectedIndex=(state.selectedIndex + step + cards.length) % cards.length;
    state.lastMoveTime=t;
  }
  state.navWasActive=nav.active;

  refreshUpgradeSelection(g);

  // A confirms menu choices. X also confirms because X is the requested
  // left-click equivalent, but in gameplay A remains the trap button.
  if(gamepadPressedAny([GAMEPAD.A, GAMEPAD.X])){
    selectUpgradeByIndex(g,state.selectedIndex,'gamepad');
  }
}

function refreshUpgradeSelection(g){
  const state=g.upgradeMenuState;
  const cards=[...ui.upgradeCards.querySelectorAll('.card[data-upgrade-index]')];
  for(const card of cards){
    const idx=Number(card.dataset.upgradeIndex);
    card.classList.toggle('selected', idx===state.selectedIndex);
    card.setAttribute('aria-selected', idx===state.selectedIndex ? 'true' : 'false');
  }
  const card=cards.find(c=>Number(c.dataset.upgradeIndex)===state.selectedIndex) || cards[state.selectedIndex];
  if(card && document.activeElement!==card){
    try{ card.focus({preventScroll:true}); }catch(_){ card.focus(); }
  }
}

function selectUpgradeByIndex(g,index,source='input'){
  const choices=g.upgradeMenuState?.choices || [];
  const up=choices[index];
  if(!up) return false;
  // Record the upgrade name for synergy tracking
  if(!g.collectedUpgrades) g.collectedUpgrades = [];
  g.collectedUpgrades.push(up.name);
  up.apply(g);
  awaitingUpgrade=false;
  g.upgradeMenuState.open=false;
  ui.upgradeOverlay.classList.remove('show');
  updateUI(g);
  // Phase 2.1: check if this upgrade completes any synergy
  if(typeof checkSynergies === 'function') checkSynergies(g);
  return true;
}

function selectMissileTargets(g,count,range){
  const p=g.player;
  const candidates=g.enemies
    .filter(e=>e.hp>0 && dist2(p.x,p.y,e.x,e.y)<=range*range)
    .sort((a,b)=>{
      const pa=(a.type==='elite'||a.type==='boss') ? 0 : (a.hp>50 ? 1 : 2);
      const pb=(b.type==='elite'||b.type==='boss') ? 0 : (b.hp>50 ? 1 : 2);
      if(pa!==pb) return pa-pb;
      const hpDiff = b.hp - a.hp;
      if(pa === 1 && Math.abs(hpDiff) > 12) return hpDiff;
      return dist2(p.x,p.y,a.x,a.y)-dist2(p.x,p.y,b.x,b.y);
    });
  const targets=[];
  for(let i=0;i<count;i++){
    targets.push(candidates[i % Math.max(1,candidates.length)] || null);
  }
  return targets;
}

function addTargetLock(g,e,life=0.62){
  if(!e) return;
  const existing=g.targetLocks.find(l=>l.enemy===e);
  if(existing){ existing.life=Math.max(existing.life,life); existing.maxLife=Math.max(existing.maxLife,life); return; }
  g.targetLocks.push({enemy:e,life,maxLife:life,spin:rand(0,Math.PI*2)});
}

function updateHammerfallSalvo(g,weapon,dt){
  ensureHammerfallDefaults(weapon);
  if(weapon.cd > 0) return;
  const targets = selectMissileTargets(g, weapon.missilesPerSalvo, weapon.lockRange);
  if(!targets.some(Boolean)) return;
  if(launchMissileSalvo(g, targets, weapon)){
    // Cooldown is decremented globally with fire-rate scaling, so keep the weapon's
    // own base cooldown stable and let fire-rate upgrades affect the timer drain.
    weapon.cd = weapon.baseCooldown;
  }
}

function launchMissileSalvo(g,targets,weapon){
  const p=g.player;
  ensureHammerfallDefaults(weapon);
  let launched=0;
  const count=Math.max(2, Math.floor(weapon.missilesPerSalvo));
  for(let i=0;i<count;i++){
    const target=targets[i % Math.max(1,targets.length)];
    if(!target) continue;
    addTargetLock(g,target,0.72);
    const targetAngle=Math.atan2(target.y-p.y,target.x-p.x);
    const side = (i % 2 === 0 ? 1 : -1);
    const pairIndex = Math.floor(i/2);
    const spread = side*(0.30 + pairIndex*0.055) + rand(-0.05,0.05)*(1-weapon.missileAccuracy);
    const launchAngle=targetAngle + spread;
    const mountSide = side * 9;
    const mountX = p.x + Math.cos(targetAngle+Math.PI/2)*mountSide + Math.cos(targetAngle)*p.r;
    const mountY = p.y + Math.sin(targetAngle+Math.PI/2)*mountSide + Math.sin(targetAngle)*p.r;
    const speed = weapon.missileSpeed * rand(0.86, 0.98);
    const vx=Math.cos(launchAngle)*speed*0.74;
    const vy=Math.sin(launchAngle)*speed*0.74;
    g.missiles.push({
      x:mountX,
      y:mountY,
      vx, vy,
      radius:5,
      target,
      age:0,
      life:weapon.missileLifetime,
      maxLife:weapon.missileLifetime,
      damage:weapon.missileDamage,
      speed:weapon.missileSpeed,
      accuracy:weapon.missileAccuracy,
      turnRate:weapon.missileTurnRate,
      explosionRadius:weapon.explosionRadius,
      phase:'launch',
      launchDir:launchAngle,
      trail:[],
      retargetCd:0,
      owner:'hammerfallSalvo'
    });
    addRing(g,mountX,mountY,'rgba(255,220,120,0.95)',0.11,3,18,3);
    for(let k=0;k<5;k++){
      addParticle(g,mountX,mountY,
        Math.cos(launchAngle+Math.PI+rand(-0.25,0.25))*rand(80,210),
        Math.sin(launchAngle+Math.PI+rand(-0.25,0.25))*rand(80,210),
        k%2?'rgba(120,120,120,0.58)':'#ff9f43',rand(0.16,0.34),rand(2,6),k%2?'circle':'spark');
    }
    launched++;
  }
  if(launched){
    if(g.runStats) g.runStats.missilesFired=(g.runStats.missilesFired||0)+launched;
    shake=Math.max(shake,3.0 + Math.min(4, launched*0.25));
    sfx('missileLock',0.75);
    sfx('missileLaunch',Math.min(1.4,0.65+launched*0.08));
    addRing(g,p.x,p.y,'rgba(255,159,67,0.55)',0.18,8,28+launched*1.5,3);
  }
  return launched>0;
}

function retargetMissile(g,m){
  const alt=nearestEnemy(g,m.x,m.y,280);
  if(alt){
    m.target=alt;
    addTargetLock(g,alt,0.42);
    m.retargetCd=0.28;
    return true;
  }
  m.target=null;
  return false;
}

function updateMissiles(g,dt){
  for(const m of g.missiles){
    m.age+=dt;
    m.life-=dt;

    if(m.target && m.target.hp<=0){
      m.retargetCd-=dt;
      if(m.retargetCd<=0) retargetMissile(g,m);
    }

    if(m.phase==='launch' && m.age>0.24) m.phase='homing';
    if(m.target && dist2(m.x,m.y,m.target.x,m.target.y)<(m.target.r+m.radius+36)*(m.target.r+m.radius+36)) m.phase='terminal';

    const targetAngle = m.target ? Math.atan2(m.target.y-m.y,m.target.x-m.x) : m.launchDir;
    const maxGuidanceNoise=(1-m.accuracy)*0.45;
    const launchCurve = m.phase==='launch' ? Math.sin(m.age*14 + m.launchDir)*0.22 : 0;
    const guidanceNoise = m.phase==='launch' ? 0 : rand(-maxGuidanceNoise,maxGuidanceNoise)*0.35;
    const desiredAngle=targetAngle + launchCurve + guidanceNoise;
    const terminalBoost = m.phase==='terminal' ? 1.18 : 1.0;
    const desiredVx=Math.cos(desiredAngle)*m.speed*terminalBoost;
    const desiredVy=Math.sin(desiredAngle)*m.speed*terminalBoost;
    const steer=m.phase==='terminal' ? m.turnRate*2.1 : (m.phase==='launch' ? m.turnRate*0.45 : m.turnRate);
    m.vx=lerp(m.vx, desiredVx, clamp(dt*steer,0,1));
    m.vy=lerp(m.vy, desiredVy, clamp(dt*steer,0,1));
    if(!m.target){ m.vx*=1.01; m.vy*=1.01; }

    m.x+=m.vx*dt;
    m.y+=m.vy*dt;
    m.trail.push({x:m.x,y:m.y});
    if(m.trail.length>10) m.trail.shift();

    if(Math.random()<0.85){
      addParticle(g,m.x-m.vx*0.012,m.y-m.vy*0.012,-m.vx*0.020+rand(-16,16),-m.vy*0.020+rand(-16,16),'rgba(150,150,150,0.45)',0.22,rand(2,5));
      addParticle(g,m.x-m.vx*0.010,m.y-m.vy*0.010,-m.vx*0.012+rand(-12,12),-m.vy*0.012+rand(-12,12),m.phase==='launch'?'#ffdd80':'#ff9f43',0.12,rand(2,4),'spark');
    }
    if(m.age>0.08 && Math.random()<0.015) sfx('missileWhoosh',0.35);

    if(m.target && m.target.hp>0 && dist2(m.x,m.y,m.target.x,m.target.y)<(m.target.r+m.radius+4)*(m.target.r+m.radius+4)){
      missileImpact(g,m,m.target);
      m.life=0;
      continue;
    }
    if(m.life<=0){
      if(m.age>0.18) missileImpact(g,m,null);
      else addRing(g,m.x,m.y,'rgba(255,159,67,0.30)',0.10,5,16,2);
    }
  }
  g.missiles=g.missiles.filter(m=>m.life>0 && m.x>-160 && m.y>-160 && m.x<WORLD_W+160 && m.y<WORLD_H+160);
  for(const l of g.targetLocks) l.life-=dt;
  g.targetLocks=g.targetLocks.filter(l=>l.life>0 && l.enemy && l.enemy.hp>0);
}

function missileImpact(g,m,target){
  const splash=m.explosionRadius;
  if(target && target.hp>0) damageEnemy(g,target,m.damage,'#ffcc4d');
  spawnVfxComposition(g,'missileImpact',m.x,m.y,{radius:splash,color:'#ffcc4d'});
  addRing(g,m.x,m.y,'rgba(255,255,255,0.98)',0.09,4,splash*0.62,3);
  addRing(g,m.x,m.y,'rgba(255,159,67,0.88)',0.20,6,splash,4);
  addParticle(g,m.x,m.y,0,0,'rgba(255,230,165,0.95)',0.08,Math.max(9,splash*0.28));
  shake=Math.max(shake,3.5);
  sfx('missileImpact',0.82);
  for(let k=0;k<18;k++){
    const a=rand(0,Math.PI*2), sp=rand(120,330);
    addParticle(g,m.x,m.y,Math.cos(a)*sp,Math.sin(a)*sp,k%3?'rgba(255,159,67,0.9)':'rgba(255,238,180,0.95)',rand(0.18,0.32),rand(3,8),'spark');
  }
  for(let k=0;k<6;k++){
    const a=rand(0,Math.PI*2), sp=rand(35,110);
    addParticle(g,m.x,m.y,Math.cos(a)*sp,Math.sin(a)*sp,'rgba(90,90,90,0.42)',rand(0.32,0.58),rand(5,12));
  }
  for(const e of g.enemies){
    if(e.hp<=0 || e===target) continue;
    const d=Math.hypot(e.x-m.x,e.y-m.y);
    if(d<splash+e.r){
      const falloff=0.35 + 0.65*clamp(1-d/(splash+e.r),0,1);
      damageEnemy(g,e,m.damage*falloff*0.55,'#ff9f43');
    }
  }
}


function throwBorecasterBomb(g,w,target){
  ensureBorecasterBombDefaults(w);
  if(!g.borecasterBombs) g.borecasterBombs=[];
  const p=g.player;
  const count=Math.max(1,Math.floor(w.bombCount || 1));
  const baseAngle=Math.atan2(target.y-p.y,target.x-p.x);
  const spread=count===1 ? 0 : Math.min(0.62,0.13*(count-1));
  const maxActive=Math.max(8,count*3+3);
  if(g.borecasterBombs.length>=maxActive) return false;
  for(let i=0;i<count;i++){
    const t=count===1 ? 0 : (i/(count-1)-0.5);
    const a=baseAngle + t*spread + rand(-0.035,0.035);
    const throwSpeed=(w.throwSpeed || 520)*rand(0.92,1.05);
    const landingDistance=(w.landingDistance || 460)*rand(0.72,1.04);
    g.borecasterBombs.push({
      x:p.x+Math.cos(a)*(p.r+8), y:p.y+Math.sin(a)*(p.r+8),
      vx:Math.cos(a)*throwSpeed, vy:Math.sin(a)*throwSpeed,
      rotation:rand(0,Math.PI*2), spin:rand(-8,8),
      age:0, travelTime:clamp(landingDistance/Math.max(1,throwSpeed),0.32,0.86),
      fuseTime:w.fuseTime, maxFuseTime:w.fuseTime,
      blastRadius:w.blastRadius, damage:w.damage*p.damageMul,
      r:10, grounded:false, owner:'player', trail:[],
      landingX:clamp(p.x+Math.cos(a)*landingDistance,TILE*2,WORLD_W-TILE*2),
      landingY:clamp(p.y+Math.sin(a)*landingDistance,TILE*2,WORLD_H-TILE*2)
    });
  }
  if(g.runStats) g.runStats.borecasterBombsThrown=(g.runStats.borecasterBombsThrown||0)+count;
  w.cd=Math.max(0.85,(w.baseCooldown || 3.6) - (w.level-1)*0.06);
  sfx('shoot',0.55);
  return true;
}

function updateBorecasterBombs(g,dt){
  if(!g.borecasterBombs) return;
  for(const b of g.borecasterBombs){
    b.age+=dt;
    b.fuseTime-=dt;
    b.rotation=(b.rotation || 0)+(b.spin || 0)*dt;
    b.trail.push({x:b.x,y:b.y,life:0.18});
    if(b.trail.length>14) b.trail.shift();
    for(const t of b.trail) t.life-=dt;
    b.trail=b.trail.filter(t=>t.life>0);
    if(!b.grounded){
      b.x+=b.vx*dt; b.y+=b.vy*dt;
      const [tx,ty]=worldToTile(b.x,b.y);
      if(isSolid(tileAt(g,tx,ty)) || b.age>=b.travelTime){
        b.grounded=true;
        b.x=clamp(b.x,TILE*2,WORLD_W-TILE*2);
        b.y=clamp(b.y,TILE*2,WORLD_H-TILE*2);
        b.vx*=0.12; b.vy*=0.12;
        addRing(g,b.x,b.y,'rgba(255,204,77,0.45)',0.22,6,24,2);
      }else{
        b.vx*=Math.pow(0.52,dt);
        b.vy*=Math.pow(0.52,dt);
      }
    }else{
      b.x+=b.vx*dt; b.y+=b.vy*dt;
      b.vx*=Math.pow(0.06,dt); b.vy*=Math.pow(0.06,dt);
      if(Math.random()<0.35){
        addParticle(g,b.x+rand(-4,4),b.y-8+rand(-2,2),rand(-25,25),rand(-65,-20),'#ffcc4d',rand(0.08,0.16),rand(2,4),'spark');
      }
    }
    if(b.fuseTime<=0){
      explodeBorecasterBomb(g,b);
      b.dead=true;
    }
  }
  g.borecasterBombs=g.borecasterBombs.filter(b=>!b.dead && b.x>-160 && b.y>-160 && b.x<WORLD_W+160 && b.y<WORLD_H+160);
}

function explodeBorecasterBomb(g,b){
  const r=b.blastRadius || 90;
  const damage=b.damage || 110;
  if(g.runStats) g.runStats.borecasterBombsExploded=(g.runStats.borecasterBombsExploded||0)+1;
  shake=Math.max(shake,10);
  for(const e of g.enemies){
    if(e.hp<=0) continue;
    const d=Math.hypot(e.x-b.x,e.y-b.y);
    if(d<r+e.r){
      const falloff=0.42+0.58*clamp(1-d/(r+e.r),0,1);
      damageEnemy(g,e,damage*falloff,'#ffcc4d');
    }
  }
  damageMineableTilesInRadius(g,b.x,b.y,r,damage*0.42);
  spawnBorecasterBombExplosionVfx(g,b.x,b.y,r);
  addRing(g,b.x,b.y,'rgba(255,244,214,0.98)',0.16,4,r*0.82,6);
  addRing(g,b.x,b.y,'rgba(255,159,67,0.88)',0.28,8,r*1.12,7);
  for(let k=0;k<22;k++){
    const a=rand(0,Math.PI*2), sp=rand(120,360);
    addParticle(g,b.x,b.y,Math.cos(a)*sp,Math.sin(a)*sp,k%3?'#ff9f43':'#ffecb3',rand(0.18,0.46),rand(3,8),'spark');
  }
  sfx('explosion',1.15);
}

function damageMineableTilesInRadius(g,x,y,r,damage){
  const minx=worldToTileX(x-r), maxx=worldToTileX(x+r);
  const miny=worldToTileY(y-r), maxy=worldToTileY(y+r);
  for(let ty=miny;ty<=maxy;ty++) for(let tx=minx;tx<=maxx;tx++){
    if(!inMap(tx,ty)) continue;
    const i=tileIdx(tx,ty);
    const t=g.tiles[i];
    if(!isMineableTile(t)) continue;
    const cx=tileToWorldCenterX(tx), cy=tileToWorldCenterY(ty);
    const d=Math.hypot(cx-x,cy-y);
    if(d>r+TILE*0.45) continue;
    g.tileHp[i]-=damage*(0.35+0.65*clamp(1-d/(r+TILE*0.45),0,1));
    if(g.tileHp[i]<=0){
      g.tiles[i]=TILE_EMPTY;
      g.tileHp[i]=0;
      g.navigationVersion=(g.navigationVersion||0)+1;
      if(g.runStats) g.runStats.blocksMined=(g.runStats.blocksMined||0)+1;
    }
  }
}

function spawnBorecasterBombExplosionVfx(g,x,y,r){
  if(typeof BORECASTER_BOMB_VFX_SPRITES==='undefined'){
    spawnVfxComposition(g,'seismicCharge',x,y,{radius:r,color:'#ffcc4d'});
    return;
  }
  const perfMul = g.debug?.forceFullVfx ? 1 : clamp(g.performance?.vfxFactor ?? 1, 0.45, 1);
  const core=Math.max(42,r*1.08), shock=Math.max(70,r*2.05), frag=Math.max(54,r*1.55), smoke=Math.max(76,r*2.10);
  addSpriteParticle(g,BORECASTER_BOMB_VFX_SPRITES.core,x,y,0.14,core,{targetSize:core*1.28,rotation:rand(0,Math.PI*2),spin:rand(-2,2),glowColor:'#ffcc4d',glowBlur:22,additive:true,important:true});
  addSpriteParticle(g,BORECASTER_BOMB_VFX_SPRITES.fragments,x,y,0.28,frag,{targetSize:frag*1.18,rotation:rand(0,Math.PI*2),spin:rand(-3.2,3.2),glowColor:'#ff9f43',glowBlur:14,additive:true,important:true});
  addSpriteParticle(g,BORECASTER_BOMB_VFX_SPRITES.shockwave,x,y,0.32,shock*0.70,{targetSize:shock,rotation:rand(0,Math.PI*2),alphaMul:0.80,glowColor:'#ffcc4d',glowBlur:12,additive:true,important:true});
  if(perfMul>0.55){
    addSpriteParticle(g,BORECASTER_BOMB_VFX_SPRITES.smoke,x,y,0.62,smoke*0.82,{targetSize:smoke*1.12,rotation:rand(0,Math.PI*2),spin:rand(-0.6,0.6),alphaMul:0.55,important:true});
  }
}

function updateWeapons(g,dt){
  const p=g.player;
  const manualMode = mouseManualFireActive(g);
  const pauseAutoTargeting = !manualMode && arcMouseAutoDisabled(g);
  for(const w of g.weapons){
    w.cd -= dt * p.fireRateMul;
    if(w.id==='hammerfallSalvo'){
      updateHammerfallSalvo(g,w,dt);
      continue;
    }
    if(w.id==='borecasterBomb'){
      ensureBorecasterBombDefaults(w);
      if(w.cd<=0 && !manualMode){
        const e=targetEnemy(g,700);
        if(e) throwBorecasterBomb(g,w,e);
      }
      continue;
    }
    if(w.id==='drones'){
      ensureDroneFleet(g,w);
      continue;
    }
    if(w.id==='sweeper'){
      ensureSifterFleet(g,w);
      continue;
    }
    if(w.cd>0) continue;
    if(manualMode){
      if(mouse.down) fireManualWeapon(g,w);
      continue;
    }
    if(pauseAutoTargeting) continue;
    if(w.id==='vectorBurst'){
      const e=targetEnemy(g,760); if(!e) continue;
      fireVectorBurst(g,w,e);
      continue;
    }
    if(w.id==='minigun'){
      const e=targetEnemy(g,620); if(!e) continue;
      w.cd=0.20/(1+w.level*0.07);
      fireSpread(g,p,e,1+p.extraProjectiles,9+w.level*3,520,0.18,'#ffdd80');
      sfx('shoot', 0.8);
    } else if(w.id==='carbine'){
      const e=targetEnemy(g,700); if(!e) continue;
      w.cd=0.34/(1+w.level*0.08);
      fireSpread(g,p,e,1+p.extraProjectiles,17+w.level*4,640,0.08,'#42d6ff',1+w.level);
      sfx('shoot', 0.65);
    } else if(w.id==='flamer'){
      w.cd=0.08;
      const e=targetEnemy(g,250,130); if(!e) continue;
      const a=Math.atan2(e.y-p.y,e.x-p.x);
      for(const enemy of g.enemies){
        const d=Math.hypot(enemy.x-p.x,enemy.y-p.y);
        if(d<210+w.level*18){
          const aa=Math.atan2(enemy.y-p.y,enemy.x-p.x);
          let da=Math.atan2(Math.sin(aa-a),Math.cos(aa-a));
          if(Math.abs(da)<0.45+w.level*0.04) damageEnemy(g,enemy,(0+w.level*0.1),'#ff7b2f');
        }
      }
      for(let k=0;k<3;k++) addParticle(g,p.x,p.y,Math.cos(a+rand(-0.45,0.45))*rand(160,260),Math.sin(a+rand(-0.45,0.45))*rand(160,260),'#ff9f43',rand(0.18,0.32),rand(5,12));
      sfx('flamer', 0.75);
    } else if(w.id==='satchel'){
      const e=targetEnemy(g,650); if(!e) continue;
      w.cd=Math.max(2.0,5.2-w.level*0.35);
      explode(g,e.x,e.y,90+w.level*8,75+w.level*26,'#ff9f43');
      sfx('explosion', 1.15);
    } else if(w.id==='boomerang'){
      const e=targetEnemy(g,700); if(!e) continue;
      const active = g.boomerangs.filter(b=>b.weaponId==='boomerang').length;
      const maxActive = 1 + Math.floor(w.level/3);
      if(active>=maxActive) continue;
      w.cd=Math.max(0.55,1.9-w.level*0.12);
      launchBoomerang(g,p,e,w.level);
      sfx('shoot', 0.7);
    } else if(w.id==='arc'){
      const e=targetEnemy(g,560); if(!e) continue;
      w.cd=Math.max(0.58,1.75-w.level*0.12);
      fireArcChain(g,e,w.level);
      sfx('arc', 0.9);
    } else if(w.id==='rail'){
      const e=targetEnemy(g,850,210); if(!e) continue;
      w.cd=Math.max(1.1,3.0-w.level*0.18);
      const a=Math.atan2(e.y-p.y,e.x-p.x);
      g.bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*920,vy:Math.sin(a)*920,r:5,life:0.85,damage:85+w.level*30,pierce:99,color:'#ffffff',rail:true});
      shake=Math.max(shake,5);
      sfx('rail', 1.0);
    }
  }
}

function manualAimPoint(g){
  const m = mouseWorld(g);
  const dx = m.x - g.player.x;
  const dy = m.y - g.player.y;
  const d = len(dx,dy);
  return { x:g.player.x + dx / d * 1000, y:g.player.y + dy / d * 1000 };
}

function fireManualWeapon(g,w){
  const p=g.player;
  const target = manualAimPoint(g);
  const manualColor = '#b46bff';
  if(w.id==='minigun'){
    w.cd=0.18/(1+w.level*0.07);
    fireSpread(g,p,target,1+p.extraProjectiles,10+w.level*3,560,0.12,manualColor);
    sfx('shoot', 0.75);
  } else if(w.id==='carbine'){
    w.cd=0.28/(1+w.level*0.08);
    fireSpread(g,p,target,1+p.extraProjectiles,18+w.level*4,700,0.05,manualColor,1+w.level);
    sfx('shoot', 0.65);
  } else if(w.id==='flamer'){
    w.cd=0.07;
    const a=Math.atan2(target.y-p.y,target.x-p.x);
    for(const enemy of g.enemies){
      const d=Math.hypot(enemy.x-p.x,enemy.y-p.y);
      if(d<210+w.level*18){
        const aa=Math.atan2(enemy.y-p.y,enemy.x-p.x);
        let da=Math.atan2(Math.sin(aa-a),Math.cos(aa-a));
        if(Math.abs(da)<0.45+w.level*0.04) damageEnemy(g,enemy,(0+w.level*0.1),manualColor);
      }
    }
    for(let k=0;k<3;k++) addParticle(g,p.x,p.y,Math.cos(a+rand(-0.35,0.35))*rand(170,270),Math.sin(a+rand(-0.35,0.35))*rand(170,270),manualColor,rand(0.16,0.28),rand(5,12));
    sfx('flamer', 0.65);
  } else if(w.id==='rail'){
    w.cd=Math.max(1.0,2.6-w.level*0.18);
    const a=Math.atan2(target.y-p.y,target.x-p.x);
    g.bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*960,vy:Math.sin(a)*960,r:5,life:0.85,damage:90+w.level*30,pierce:99,color:manualColor,rail:true,manual:true});
    shake=Math.max(shake,5);
    sfx('rail', 0.95);
  } else if(w.id==='boomerang'){
    const active = g.boomerangs.filter(b=>b.weaponId==='boomerang').length;
    const maxActive = 1 + Math.floor(w.level/3);
    if(active>=maxActive) return;
    w.cd=Math.max(0.55,1.6-w.level*0.12);
    launchBoomerang(g,p,target,w.level,manualColor);
    sfx('shoot', 0.7);
  } else if(w.id==='arc'){
    const e=targetEnemy(g,560);
    if(!e) return;
    w.cd=Math.max(0.58,1.45-w.level*0.12);
    fireArcChain(g,e,w.level);
    sfx('arc', 0.9);
  } else if(w.id==='borecasterBomb'){
    const m = mouseWorld(g);
    if(throwBorecasterBomb(g,w,m)) sfx('shoot',0.55);
  } else if(w.id==='satchel'){
    const m = mouseWorld(g);
    w.cd=Math.max(1.6,4.4-w.level*0.35);
    explode(g,m.x,m.y,90+w.level*8,75+w.level*26,manualColor);
    sfx('explosion', 1.05);
  } else if(w.id==='hammerfallSalvo'){
    ensureHammerfallDefaults(w);
    const targets = selectMissileTargets(g, w.missilesPerSalvo, w.lockRange);
    if(!targets.some(Boolean)) return;
    if(launchMissileSalvo(g, targets, w)) w.cd = Math.max(0.35, w.baseCooldown*0.85);
  }
}

function ensureDroneFleet(g,w){
  const p=g.player;
  const desired = Math.min(10, 1 + w.level);
  while(g.wardenDrones.length < desired){
    const a=rand(0,Math.PI*2);
    g.wardenDrones.push({
      x:p.x+Math.cos(a)*rand(35,90),
      y:p.y+Math.sin(a)*rand(35,90),
      r:9,
      vx:0, vy:0,
      targetX:p.x+Math.cos(a)*120,
      targetY:p.y+Math.sin(a)*120,
      retarget:0,
      cd:rand(0.1,0.6),
      phase:rand(0,Math.PI*2),
      level:w.level,
    });
  }
  for(const d of g.wardenDrones) d.level=w.level;
}

function updateWardenDrones(g,dt){
  const p=g.player;
  const w=g.weapons.find(w=>w.id==='drones');
  if(!w || !g.wardenDrones.length) return;
  const roamRadius = 150 * p.droneOrbitMul + w.level*18;
  for(let i=0;i<g.wardenDrones.length;i++){
    const d=g.wardenDrones[i];
    d.retarget -= dt;
    const threat=nearestEnemy(g,d.x,d.y,460 + w.level*20);
    if(d.retarget<=0 || dist2(d.x,d.y,d.targetX,d.targetY)<28*28){
      d.retarget=rand(0.7,1.5);
      const centerThreat=nearestEnemy(g,p.x,p.y,620);
      if(centerThreat && Math.random()<0.72){
        d.targetX=centerThreat.x+rand(-70,70);
        d.targetY=centerThreat.y+rand(-70,70);
      } else {
        const a=rand(0,Math.PI*2);
        d.targetX=p.x+Math.cos(a)*rand(55,roamRadius);
        d.targetY=p.y+Math.sin(a)*rand(55,roamRadius);
      }
    }
    const homeD=Math.hypot(d.x-p.x,d.y-p.y);
    if(homeD>roamRadius*1.55){
      const a=Math.atan2(p.y-d.y,p.x-d.x);
      d.targetX=p.x+Math.cos(a)*roamRadius*0.65;
      d.targetY=p.y+Math.sin(a)*roamRadius*0.65;
      d.retarget=0.35;
    }
    const tx=clamp(d.targetX,TILE*2,WORLD_W-TILE*2), ty=clamp(d.targetY,TILE*2,WORLD_H-TILE*2);
    const dx=tx-d.x, dy=ty-d.y, l=len(dx,dy);
    const speed=(165+w.level*9)*p.droneSpeedMul;
    d.vx=lerp(d.vx, dx/l*speed, dt*4.6);
    d.vy=lerp(d.vy, dy/l*speed, dt*4.6);
    d.x+=d.vx*dt;
    d.y+=d.vy*dt;
    d.x=clamp(d.x,TILE*2,WORLD_W-TILE*2);
    d.y=clamp(d.y,TILE*2,WORLD_H-TILE*2);

    d.cd -= dt * p.droneFireRateMul;
    if(threat && d.cd<=0){
      d.cd=Math.max(0.16, 0.56 - w.level*0.035);
      const a=Math.atan2(threat.y-d.y,threat.x-d.x)+rand(-0.06,0.06);
      g.bullets.push({x:d.x,y:d.y,vx:Math.cos(a)*650,vy:Math.sin(a)*650,r:3,life:1.05,damage:(9+w.level*3)*p.droneDamageMul,pierce:0,color:'#d6a2ff',drone:true});
      if(Math.random()<0.55) sfx('shoot',0.25);
      addParticle(g,d.x,d.y,-d.vx*0.04+rand(-8,8),-d.vy*0.04+rand(-8,8),'rgba(214,162,255,0.7)',0.18,2);
    }
    if(Math.random()<0.15) addParticle(g,d.x,d.y,-d.vx*0.04+rand(-10,10),-d.vy*0.04+rand(-10,10),'rgba(214,162,255,0.72)',0.18,2,'spark');
  }
}

function ensureSifterFleet(g,w){
  const p=g.player;
  const desired = Math.min(6, 1 + Math.floor((w.level+1)/2));
  while(g.sifterDrones.length < desired){
    const a=rand(0,Math.PI*2);
    g.sifterDrones.push({
      x:p.x+Math.cos(a)*rand(45,95),
      y:p.y+Math.sin(a)*rand(45,95),
      r:10,
      vx:0, vy:0,
      target:null,
      targetX:p.x,
      targetY:p.y,
      retarget:0,
      level:w.level,
      phase:rand(0,Math.PI*2),
    });
  }
  for(const sw of g.sifterDrones) sw.level=w.level;
}

function nearestXpPickup(g,x,y,maxD){
  let best=null, bd=maxD*maxD;
  for(const it of g.pickups){
    if(it.type!=='xp' || it.life<=0) continue;
    const d=dist2(x,y,it.x,it.y);
    if(d<bd){ bd=d; best=it; }
  }
  return best;
}

function collectPickupBySifter(g,it,sw){
  if(!it || it.life<=0) return;
  if(it.type==='xp'){ collectRunResource(g,'echo',it.value); }
  it.life=0;
  floating(g,sw.x,sw.y-18,'Echo sifted','#7df9ff');
  sfx('pickup',0.45);
  addRing(g,sw.x,sw.y,'rgba(125,249,255,0.75)',0.18,5,24,3);
}

function updateSifterDrones(g,dt){
  const p=g.player;
  const w=g.weapons.find(w=>w.id==='sweeper');
  if(!w || !g.sifterDrones.length) return;
  const searchRange=(360+w.level*70)*p.sweeperRangeMul;
  const homeRadius=230+w.level*30;
  for(let i=0;i<g.sifterDrones.length;i++){
    const sw=g.sifterDrones[i];
    sw.retarget -= dt;
    if(!sw.target || sw.target.life<=0 || sw.retarget<=0){
      sw.target=nearestXpPickup(g,sw.x,sw.y,searchRange);
      sw.retarget=0.22;
    }

    if(sw.target){
      sw.targetX=sw.target.x;
      sw.targetY=sw.target.y;
    } else {
      const a=g.time*0.9 + sw.phase + i*1.7;
      sw.targetX=p.x+Math.cos(a)*homeRadius*0.55;
      sw.targetY=p.y+Math.sin(a)*homeRadius*0.55;
    }

    const homeD=Math.hypot(sw.x-p.x, sw.y-p.y);
    if(homeD>homeRadius*2.2 && !sw.target){
      sw.targetX=p.x;
      sw.targetY=p.y;
    }

    const tx=clamp(sw.targetX,TILE*2,WORLD_W-TILE*2), ty=clamp(sw.targetY,TILE*2,WORLD_H-TILE*2);
    const dx=tx-sw.x, dy=ty-sw.y, l=len(dx,dy);
    const speed=(230+w.level*22)*p.sweeperSpeedMul;
    sw.vx=lerp(sw.vx, dx/l*speed, dt*6.2);
    sw.vy=lerp(sw.vy, dy/l*speed, dt*6.2);
    sw.x+=sw.vx*dt;
    sw.y+=sw.vy*dt;
    sw.x=clamp(sw.x,TILE*2,WORLD_W-TILE*2);
    sw.y=clamp(sw.y,TILE*2,WORLD_H-TILE*2);

    const collectR=(22+w.level*3)*p.sweeperCollectMul;
    for(const it of g.pickups){
      if(it.type==='xp' && it.life>0 && dist2(sw.x,sw.y,it.x,it.y)<collectR*collectR){
        collectPickupBySifter(g,it,sw);
      }
    }
    if(Math.random()<0.28) addParticle(g,sw.x,sw.y,-sw.vx*0.04+rand(-10,10),-sw.vy*0.04+rand(-10,10),'rgba(125,249,255,0.72)',0.18,2,'spark');
  }
}

function fireArcChain(g,start,level){
  let current=start;
  const hit=new Set();
  const maxChains=3+level;
  const jumpRange=160+level*10;
  const splashRadius=44+level*5;
  for(let chain=0; chain<maxChains; chain++){
    if(!current) break;
    hit.add(current);
    const dmg=30+level*9;
    damageEnemy(g,current,dmg,'#7df9ff');
    addRing(g,current.x,current.y,'rgba(125,249,255,0.85)',0.18,8,38+level*3,3);
    addParticle(g,current.x,current.y,0,0,'rgba(190,255,255,0.75)',0.10,14);
    for(const other of g.enemies){
      if(other!==current && !hit.has(other) && other.hp>0 && dist2(current.x,current.y,other.x,other.y)<splashRadius*splashRadius){
        damageEnemy(g,other,(12+level*4),'#7df9ff');
        g.arcs.push({x1:current.x,y1:current.y,x2:other.x,y2:other.y,life:0.10,maxLife:0.10,color:'#9dffff',width:2});
      }
    }
    let next=null, bd=jumpRange*jumpRange;
    for(const other of g.enemies){
      if(!hit.has(other) && other.hp>0){
        const d=dist2(current.x,current.y,other.x,other.y);
        if(d<bd){bd=d; next=other;}
      }
    }
    if(next){
      g.arcs.push({x1:current.x,y1:current.y,x2:next.x,y2:next.y,life:0.16,maxLife:0.16,color:'#7df9ff',width:4});
    }
    current=next;
  }
}

function fireVectorBurst(g,w,target){
  const p=g.player;
  const count=Math.max(1,Math.floor(w.projectiles || 1));
  const base=Math.atan2(target.y-p.y,target.x-p.x);
  const spread=(w.spreadDeg || 18)*Math.PI/180;
  const center=(count-1)/2;
  w.cd=(w.baseCooldown || 0.92)/(p.fireRateMul || 1);
  const accuracy = clamp((p.accuracy ?? 0.35) + (w.accuracyBonus || 0), 0, 1);
  const inaccuracy = weaponSpreadRadians(accuracy);
  for(let i=0;i<count;i++){
    const offset = count===1 ? 0 : (i-(count-1)/2)*spread;
    const a=base+offset+rand(-inaccuracy,inaccuracy);
    const speed=w.speed || 560;
    g.bullets.push({
      x:p.x+Math.cos(a)*p.r,y:p.y+Math.sin(a)*p.r,
      vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,
      r:4.3,life:w.lifetime || 1.25,damage:(w.damage || 12)*p.damageMul,pierce:w.pierce || 0,color:'#9dfcff',vector:true
    });
  }
  sfx('shoot',0.72);
}

function weaponSpreadRadians(accuracy){
  const acc=clamp(accuracy ?? 0.35,0,1);
  return lerp(0.45,0.03,acc);
}

function fireSpread(g,p,target,count,damage,speed,spread,color,pierce=0){
  if(typeof recordShotFired==='function') recordShotFired(g,count);
  const base=Math.atan2(target.y-p.y,target.x-p.x);
  const accuracySpread=weaponSpreadRadians(p.accuracy ?? 0.35);
  for(let i=0;i<count;i++){
    const offset = count===1 ? 0 : (i-(count-1)/2)*spread;
    const a=base+offset+rand(-accuracySpread,accuracySpread);
    g.bullets.push({x:p.x+Math.cos(a)*p.r,y:p.y+Math.sin(a)*p.r,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:4,life:1.4,damage:damage*p.damageMul,pierce,color});
  }
}

function launchBoomerang(g,p,target,level,color='#ffd36b'){
  const a=Math.atan2(target.y-p.y,target.x-p.x);
  const speed = 420 + level*22;
  const outTime = 0.34 + level*0.03;
  if(g.runStats) g.runStats.boomerangsFired=(g.runStats.boomerangsFired||0)+1;
  g.boomerangs.push({
    weaponId:'boomerang', x:p.x+Math.cos(a)*p.r, y:p.y+Math.sin(a)*p.r,
    vx:Math.cos(a)*speed, vy:Math.sin(a)*speed, r:13, age:0, life:1.65, outTime,
    damage:(26+level*10)*p.damageMul, color, spin:0, hitSet:new WeakSet(), returning:false,
  });
}

function updateBoomerangs(g,dt){
  const p=g.player;
  for(const b of g.boomerangs){
    b.age += dt; b.life -= dt; b.spin += dt*11;
    if(b.age >= b.outTime) b.returning = true;
    if(b.returning){
      const dx=p.x-b.x, dy=p.y-b.y; const d=len(dx,dy); const speed=480;
      b.vx = lerp(b.vx, dx/d*speed, dt*8.5);
      b.vy = lerp(b.vy, dy/d*speed, dt*8.5);
      if(d < p.r + b.r + 6) b.life = 0;
    }
    b.x += b.vx*dt; b.y += b.vy*dt;
    if(Math.random()<0.45) addParticle(g,b.x,b.y,-b.vx*0.04+rand(-18,18),-b.vy*0.04+rand(-18,18),b.color,rand(0.12,0.22),rand(2,4));
    for(const e of g.enemies){
      if(e.hp>0 && !b.hitSet.has(e) && dist2(b.x,b.y,e.x,e.y)<(b.r+e.r)*(b.r+e.r)){
        b.hitSet.add(e); damageEnemy(g,e,b.damage,b.color);
        if(typeof recordShotHit==='function') recordShotHit(g,1);
        addRing(g,b.x,b.y,'rgba(255,211,107,0.9)',rand(0.08,0.14), 5, 18, 4);
        for(let k=0;k<4;k++) addParticle(g,b.x,b.y,rand(-120,120),rand(-120,120),b.color,rand(0.10,0.18),rand(2,4), 'spark');
      }
    }
  }
  g.boomerangs = g.boomerangs.filter(b=>b.life>0 && b.x>-120 && b.y>-120 && b.x<WORLD_W+120 && b.y<WORLD_H+120);
}

function placeTrap(g){
  const p=g.player;
  if(!p.canUseTraps || p.trapCd>0 || g.state!=='playing' || awaitingUpgrade) return false;
  const [tx,ty]=worldToTile(p.x,p.y);
  if(isSolid(tileAt(g,tx,ty))) return false;
  const maxTraps = p.classId==='pathfinder' ? 8 : 4;
  if(g.traps.length>=maxTraps) g.traps.shift();
  if(g.runStats) g.runStats.trapsPlaced=(g.runStats.trapsPlaced||0)+1;
  g.traps.push({x:p.x,y:p.y,r:16,triggerR:28,age:0,armed:false,life:32,pulse:0,damage:90*p.trapDamageMul,radius:88*p.trapRadiusMul});
  p.trapCd=p.trapMaxCd;
  floating(g,p.x,p.y-25,'Seismic trap armed','#ffcc4d');
  addRing(g,p.x,p.y,'rgba(255,204,77,0.75)',0.22,5,24,3);
  sfx('pickup',0.35);
  return true;
}

function updateTraps(g,dt){
  for(const tr of g.traps){
    tr.age+=dt; tr.life-=dt; tr.pulse+=dt;
    if(tr.age>0.35) tr.armed=true;
    if(!tr.armed) continue;
    for(const e of g.enemies){
      if(e.hp>0 && dist2(tr.x,tr.y,e.x,e.y)<(tr.triggerR+e.r)*(tr.triggerR+e.r)){
        tr.life=0;
        explode(g,tr.x,tr.y,tr.radius,tr.damage,'#ffcc4d');
        sfx('explosion',1.05);
        break;
      }
    }
  }
  g.traps=g.traps.filter(t=>t.life>0);
}

function updateEnemies(g,dt){
  const p=g.player;
  for(const e of g.enemies){
    e.hitFlash=Math.max(0,e.hitFlash-dt);
    e.slow=Math.max(0,e.slow-dt);
    // Phase 2.3 — degrade sirenBoost (supportBuffer buff) on all enemies
    if(e.sirenBoost>0){
      e.sirenBoost=Math.max(0,e.sirenBoost-dt);
      if(e.sirenBoost<=0){ e.sirenSpeedMul=1; e.sirenDamageMul=1; }
    }
    // Phase 2.3 — blink invulnerability timer
    if(e.blinkInvuln>0) e.blinkInvuln=Math.max(0,e.blinkInvuln-dt);
    // Phase 2.2: boss-specific update
    if(e.role === 'boss' && e.hp > 0 && g.bossType){
      updateBoss(g, e, dt);
      // Skip standard enemy AI — bosses have custom movement, attacks, and contact logic
      continue;
    }
    if(e.isChargingWaveEnemy || (ENEMY_TYPES[e.type]?.behavior || e.behavior) === 'chargingExploder') {
      updateChargingWaveEnemy(g,e,dt);
      continue;
    }
    if((ENEMY_TYPES[e.type]?.behavior || e.behavior) === 'hexBoomerangDetonator') {
      updateHexShardEnemy(g,e,dt);
      continue;
    }
    updateSpecialEnemyBehaviour(g,e,dt);
    updateEnemyRangedAttack(g,e,dt);
    const moved=Math.hypot(e.x-e.lastX,e.y-e.lastY);
    if(moved<4) e.stuckTimer+=dt; else { e.stuckTimer=0; e.lastX=e.x; e.lastY=e.y; }
    e.pathTimer-=dt;
    const [ptx,pty]=worldToTile(p.x,p.y);
    const [etx,ety]=worldToTile(e.x,e.y);
    const closeToPlayer=dist2(e.x,e.y,p.x,p.y)<420*420;
    const perfState=g.performance?.state || PERF_STATES.HEALTHY;
    const farPathSlow=(perfState===PERF_STATES.WARNING && !closeToPlayer && e.type!=='elite' && e.type!=='boss') ? 1.8 :
      (perfState===PERF_STATES.CRITICAL && !closeToPlayer && e.type!=='elite' && e.type!=='boss') ? 3.2 : 1.0;
    const hasLos=e.behavior==='flyingChase' ? true : lineOfSightClear(g,e.x,e.y,p.x,p.y);
    const needsPath=!hasLos && (
      !e.path.length ||
      e.pathIndex>=e.path.length ||
      e.pathTimer<=0 ||
      e.pathVersion!==g.navigationVersion ||
      e.lastPlayerTileX===null ||
      Math.abs(ptx-e.lastPlayerTileX)+Math.abs(pty-e.lastPlayerTileY)>2 ||
      e.stuckTimer>0.75
    );
    if(needsPath){
      const maxNodes=closeToPlayer?1200:650;
      const rawPath=findPathAStar(g,etx,ety,ptx,pty,maxNodes);
      e.rawPath=rawPath;
      e.path=smoothPathCorners(g,e,rawPath);
      e.smoothPath=e.path;
      e.pathIndex=0;
      e.pathVersion=g.navigationVersion;
      prepareEnemyPathFollower(g,e);
      e.lastPlayerTileX=ptx; e.lastPlayerTileY=pty;
      e.pathTimer=rand(closeToPlayer?0.25:0.55*farPathSlow, closeToPlayer?0.55:1.05*farPathSlow);
      if(!e.path.length) e.noPathTimer=0.55;
    }
    let ux=0, uy=0, pathSpeedMul=1;
    let baseUx=0, baseUy=0;
    if(!hasLos && e.path.length){
      const steer=getEnemyPathFollowingSteering(g,e,dt);
      if(steer){
        ux=steer.x; uy=steer.y; pathSpeedMul=steer.speedMul || 1;
        baseUx=ux; baseUy=uy;
        e.pathIndex=Math.min(e.path.length-1,Math.max(0,(steer.info?.segmentIndex || 0)));
      } else {
        const acceptRadius=Math.max(8, Math.min(18, (e.pathingRadius || e.r || 12)*0.85));
        while(e.pathIndex<e.path.length && Math.hypot(e.path[e.pathIndex].x-e.x,e.path[e.pathIndex].y-e.y)<acceptRadius) e.pathIndex++;
        const fallbackPoint=e.path[Math.min(e.pathIndex,e.path.length-1)] || {x:p.x,y:p.y};
        const dx=fallbackPoint.x-e.x, dy=fallbackPoint.y-e.y, l=Math.max(0.001,len(dx,dy));
        baseUx=dx/l; baseUy=dy/l; ux=baseUx; uy=baseUy;
      }
    } else {
      let targetX=p.x, targetY=p.y;
      if(!hasLos && e.noPathTimer>0){
        const fallback=findClosestWalkableTile(g,ptx,pty,14);
        if(fallback){
          const c=tileCenter(fallback.tx,fallback.ty);
          targetX=c.x; targetY=c.y;
        }
        e.noPathTimer-=dt;
      }
      const dx=targetX-e.x, dy=targetY-e.y, l=Math.max(0.001,len(dx,dy));
      baseUx=dx/l; baseUy=dy/l;
      const wobble=Math.sin(g.time*4+e.phase)*0.18;
      ux=baseUx*Math.cos(wobble)-baseUy*Math.sin(wobble)*0.12;
      uy=baseUy*Math.cos(wobble)+baseUx*Math.sin(wobble)*0.12;
      e.closestPathPoint=null;
      e.offtrackVector=null;
      e.desiredVelocity=null;
      e.offtrackDistance=0;
      e.pathFollowMode=hasLos?'direct-los':'fallback';
    }
    // Phase 2.3 — zigzagChase: apply sinusoidal lateral offset to movement
    if(e._zigzagOffset !== undefined){
      const perpX=-baseUy, perpY=baseUx;
      ux += perpX * e._zigzagOffset;
      uy += perpY * e._zigzagOffset;
      const zl=Math.max(0.001,len(ux,uy)); ux/=zl; uy/=zl;
    }
    const centreBias=getTunnelCentrelineBias(g,e,baseUx,baseUy);
    if(centreBias.strength>0){
      const biasStrength=(!hasLos && e.path.length) ? centreBias.strength*0.55 : centreBias.strength;
      ux += centreBias.x*biasStrength;
      uy += centreBias.y*biasStrength;
      const bl=Math.max(0.001,len(ux,uy)); ux/=bl; uy/=bl;
      e.tunnelCentreBias={x:centreBias.x,y:centreBias.y,strength:biasStrength};
    } else {
      e.tunnelCentreBias=null;
    }
    if(e.stuckTimer>0.75){
      e.unstickAngle += dt*5.5;
      ux += Math.cos(e.unstickAngle)*0.45;
      uy += Math.sin(e.unstickAngle)*0.45;
      const ul=len(ux,uy); ux/=ul; uy/=ul;
      e.pathTimer=0;
    }
    const slow=(e.slow>0?0.55:1)*pathSpeedMul;
    // Phase 2.3 — skip moveCircle for behaviours that handle their own movement (flyingChase, terrainCharger, charger)
    if(!e._customMoveHandled && !g.debug?.freezeEnemies) moveCircle(g,e,ux*e.speed*slow*dt,uy*e.speed*slow*dt);

    // Phase 2.3 — apply sirenBoost damage buff to enemy contact damage
    const contactDamageMul = (e.sirenBoost>0 && e.sirenDamageMul) ? e.sirenDamageMul : 1;
    const touch = p.r+e.r;
    if(dist2(p.x,p.y,e.x,e.y)<touch*touch){
      if(p.iframes<=0 && e.blinkInvuln<=0){
        const damage=Math.max(1,Math.round(e.damage*contactDamageMul*(p.armourMul || 1)));
        p.hp-=damage; if(typeof recordRunDamageTaken==='function') recordRunDamageTaken(g,damage,'enemyContact'); p.iframes=0.65; flashDamage(); shake=Math.max(shake,8);
        floating(g,p.x,p.y-25,`-${damage}`,'#ff5b5b'); sfx('hit', 1.0);
        if(p.hp<=0) gameOver(g);
      }
      if(e.type==='exploder'){
        e.hp=0; explode(g,e.x,e.y,88,52,'#ff5b5b');
      }
    }
  }
  for(let i=g.enemies.length-1;i>=0;i--){
    const e=g.enemies[i];
    if(e.hp<=0){
      // Phase 2.2: boss defeat rewards
      if(e.role === 'boss' && e.bossType){
        g.bossDefeated = true;
        rewardBossDefeat(g, e);
        sfx('bossDefeat', 1.0);
        shake = Math.max(shake, 12);
        // Particle celebration
        for(let k = 0; k < 20; k++){
          const a = Math.random() * Math.PI * 2;
          const speed = rand(40, 120);
          const colors = ['#ffcc4d', '#42d6ff', '#ff5b5b', '#b46bff', '#5dff9a'];
          addParticle(g, e.x, e.y, Math.cos(a)*speed, Math.sin(a)*speed, colors[randi(0,colors.length-1)], rand(0.5, 1.5), rand(4, 10), 'spark');
        }
      }
      if(!e.noDrop) killEnemy(g,e);
      g.enemies.splice(i,1);
    }
  }
}


function updateSpecialEnemyBehaviour(g,e,dt){
  const cfg=ENEMY_TYPES[e.type] || {};
  const behavior=cfg.behavior || e.behavior || 'meleeChase';
  const p=g.player;
  e._customMoveHandled = false;

  /* ── 1. flyingChase ───────────────────────────────────────────────────────
   * Fly over obstacles with smooth arc movement and vertical oscillation.
   * Ignores terrain collision — moves directly toward player.
   * Clears path so the main loop uses direct LOS movement, then overrides
   * the moveCircle call by handling movement here with no collision check.
   */
  if(behavior==='flyingChase'){
    // Clear path data so main loop skips A* and uses direct LOS branch
    e.path=[]; e.rawPath=[]; e.smoothPath=[]; e.noPathTimer=0;
    const dx=p.x-e.x, dy=p.y-e.y, d=Math.hypot(dx,dy);
    if(d>1){
      const slowMul=e.slow>0?0.55:1;
      // Flying enemies are slightly slower than ground counterparts
      const flyingSpeedMul=0.78;
      const sirenMul=(e.sirenBoost>0 && e.sirenSpeedMul) ? e.sirenSpeedMul : 1;
      const speed=e.speed*flyingSpeedMul*sirenMul*slowMul*dt;
      const nx=e.x+(dx/d)*speed;
      const ny=e.y+(dy/d)*speed;
      // Clamp to world bounds but skip tile collision entirely
      const r=e.collisionR || e.r || 12;
      e.x=clamp(nx,r+TILE,WORLD_W-r-TILE);
      e.y=clamp(ny,r+TILE,WORLD_H-r-TILE);
    }
    // Vertical oscillation for visual floating
    e.flyingOscillation = (e.flyingOscillation||0) + dt*4.2;
    // Shadow / glow indicator: small ring pulse beneath
    if(shouldEmitVfx(g,false) && Math.random()<0.12){
      addRing(g,e.x,e.y+6,'rgba(121,128,255,0.12)',0.18,e.r*0.35,e.r*0.55,1);
    }
    e._customMoveHandled = true;
    return;
  }

  /* ── 2. zigzagChase ───────────────────────────────────────────────────────
   * Erratic sinusoidal lateral oscillation toward the player.
   * Amplitude increases with distance; phase resets periodically.
   * Collides with walls normally — only the direction is modulated.
   */
  if(behavior==='zigzagChase'){
    e.zigzagPhase = (e.zigzagPhase||0) + dt * (6.5 + Math.random()*0.8);
    // Amplitude scales with distance to player (more erratic when far)
    const dist=Math.hypot(p.x-e.x,p.y-e.y);
    const amplitude=clamp(dist*0.008,0.15,0.55);
    // Store offset on enemy so the main loop can apply it to movement direction
    e._zigzagOffset = Math.sin(e.zigzagPhase) * amplitude;
    e._zigzagPhaseReset = (e._zigzagPhaseReset||0)+dt;
    // Reset phase periodically for unpredictable movement (~every 2-3 seconds)
    if(e._zigzagPhaseReset>rand(2.0,3.5)){
      e.zigzagPhase = Math.random()*Math.PI*2;
      e._zigzagPhaseReset=0;
    }
    // Sinusoidal trail particles
    if(shouldEmitVfx(g,false) && Math.random()<0.18){
      addParticle(g,e.x+rand(-4,4),e.y+rand(-4,4),rand(-8,8),rand(-20,-5),'#e8e0c8',rand(0.12,0.20),rand(1,3),'spark');
    }
    return;
  }

  /* ── 3. blinkChase ────────────────────────────────────────────────────────
   * Teleport toward player when far away with cooldown and visual VFX.
   * Brief invulnerability during the teleport.
   */
  if(behavior==='blinkChase'){
    e.blinkInvuln = Math.max(0,(e.blinkInvuln||0)-dt);
    e.blinkCd = Math.max(0,(e.blinkCd||0)-dt);
    const dist=Math.hypot(p.x-e.x,p.y-e.y);
    if(e.blinkCd<=0 && dist>180){
      // Trigger blink — teleport 100-150px closer
      e.blinkCd=rand(4.5,7.5);
      const angle=Math.atan2(p.y-e.y,p.x-e.x)+rand(-0.55,0.55);
      const teleportDist=rand(100,150);
      const nx=clamp(e.x+Math.cos(angle)*teleportDist,TILE*2,WORLD_W-TILE*2);
      const ny=clamp(e.y+Math.sin(angle)*teleportDist,TILE*2,WORLD_H-TILE*2);
      const [tx,ty]=worldToTile(nx,ny);
      if(!isSolid(tileAt(g,tx,ty))){
        // VFX: flash/particle burst at start position
        addRing(g,e.x,e.y,'rgba(180,107,255,0.50)',0.25,4,34,3);
        for(let k=0;k<12;k++){
          const a=rand(0,Math.PI*2), sp=rand(60,180);
          addParticle(g,e.x,e.y,Math.cos(a)*sp,Math.sin(a)*sp,'#b46bff',rand(0.15,0.35),rand(2,5),k%3===0?'ring':'spark');
        }
        // Teleport
        e.x=nx; e.y=ny;
        e.blinkInvuln=0.15;
        // VFX: flash/particle burst at destination
        addRing(g,e.x,e.y,'rgba(180,107,255,0.60)',0.30,4,38,4);
        for(let k=0;k<8;k++){
          addParticle(g,e.x,e.y,rand(-80,80),rand(-80,80),'#b46bff',rand(0.18,0.40),rand(2,4),'spark');
        }
        // Clear path so enemy gets new A* route after teleport
        e.path=[]; e.pathTimer=0;
        sfx('shoot',0.35);
      }
    }
    return;
  }

  /* ── 4. terrainCharger ────────────────────────────────────────────────────
   * Charge in straight line toward player, breaking mineable tiles in path.
   * Stuns briefly after hitting a wall or reaching the player.
   * Has three states: cooldown → charging → stunned.
   */
  if(behavior==='terrainCharger'){
    const dist=Math.hypot(p.x-e.x,p.y-e.y);
    if(e.chargeState==='cooldown'){
      e.chargeTimer = (e.chargeTimer||0)+dt;
      // Wait 2-3 seconds then charge
      if(e.chargeTimer>=rand(2.0,3.0) && dist<650){
        e.chargeState='charging';
        e.chargeTimer=0;
        // Store charge direction at release
        e.chargeDir = {x:(p.x-e.x)/Math.max(1,dist), y:(p.y-e.y)/Math.max(1,dist)};
        // Visual: brief wind-up glow
        addRing(g,e.x,e.y,'rgba(255,204,77,0.45)',0.25,e.r,e.r+16,3);
        // Clear path so charge isn't interrupted by pathfollowing
        e.path=[]; e.pathTimer=999;
      }
    } else if(e.chargeState==='charging'){
      // Move in stored direction at boosted speed
      const sirenMul=(e.sirenBoost>0 && e.sirenSpeedMul) ? e.sirenSpeedMul : 1;
      const chargeSpeed = e.speed * 2.4 * sirenMul;
      const nx = e.x + e.chargeDir.x * chargeSpeed * dt;
      const ny = e.y + e.chargeDir.y * chargeSpeed * dt;
      const r=e.collisionR || e.r || 12;
      // Break mineable tiles in path
      destroyTileByEnemyCharge(g,e,e.chargeDir.x,e.chargeDir.y,dt);
      // Check wall collision: test if new position is inside solid
      const [tx,ty]=worldToTile(nx,ny);
      if(isSolid(tileAt(g,tx,ty)) || !inMap(tx,ty) || nx<r+TILE || nx>WORLD_W-r-TILE || ny<r+TILE || ny>WORLD_H-r-TILE){
        // Hit a wall — stun
        e.chargeState='stunned';
        e.chargeTimer=0;
        shake=Math.max(shake,6);
        addRing(g,e.x,e.y,'rgba(255,204,77,0.60)',0.28,e.r*0.8,e.r+22,4);
        for(let k=0;k<8;k++) addParticle(g,e.x,e.y,rand(-100,100),rand(-100,100),'#ffcc4d',rand(0.15,0.30),rand(2,5),'spark');
        sfx('explosion',0.65);
        e.pathTimer=0;
      } else {
        e.x=nx; e.y=ny;
      }
      // Charge particles
      if(shouldEmitVfx(g,false) && Math.random()<0.55){
        addParticle(g,e.x-e.chargeDir.x*e.r+rand(-4,4),e.y-e.chargeDir.y*e.r+rand(-4,4),
          -e.chargeDir.x*rand(100,240)+rand(-30,30),-e.chargeDir.y*rand(100,240)+rand(-30,30),
          '#ffcc4d',rand(0.12,0.25),rand(2,4),'spark');
      }
    } else if(e.chargeState==='stunned'){
      e.chargeTimer = (e.chargeTimer||0)+dt;
      if(e.chargeTimer>=0.8){
        e.chargeState='cooldown';
        e.chargeTimer=0;
      }
    }
    e._customMoveHandled = true;
    return;
  }

  /* ── 5. supportBuffer ─────────────────────────────────────────────────────
   * Emit a buff pulse every 0.65s that boosts ally speed (+18%) and damage
   * (+10%) in a 210px radius for 1.5 seconds. Does not buff bosses or other
   * supportBuffer enemies.
   */
  if(behavior==='supportBuffer'){
    e.buffPulse = (e.buffPulse||0) + dt;
    if(e.buffPulse>=0.65){
      e.buffPulse=0;
      for(const other of g.enemies){
        if(other===e) continue;
        if(other.role==='boss') continue;
        if((ENEMY_TYPES[other.type]?.behavior || other.behavior)==='supportBuffer') continue;
        if(dist2(e.x,e.y,other.x,other.y)>210*210) continue;
        // Apply buff: +18% speed, +10% damage for 1.5 seconds
        other.sirenBoost = 1.5;
        // Store buffed stats on the enemy for the main loop to use
        other.sirenSpeedMul = 1.18;
        other.sirenDamageMul = 1.10;
      }
      // Visual: ring/particle burst on pulse
      if(shouldEmitVfx(g,false)){
        addRing(g,e.x,e.y,'rgba(66,214,255,0.35)',0.32,e.r,e.r+50,4);
        for(let k=0;k<6;k++){
          const a=rand(0,Math.PI*2);
          addParticle(g,e.x+Math.cos(a)*e.r,e.y+Math.sin(a)*e.r,
            Math.cos(a)*rand(40,100),Math.sin(a)*rand(40,100),
            '#42d6ff',rand(0.18,0.35),rand(2,4),'ring');
        }
      }
    }
    return;
  }

  /* ── 6. charger (ironMaw) ─────────────────────────────────────────────────
   * Build up speed over 1-2s (visual charge-up), then release in a straight
   * line toward player's position at time of release.
   * Stun briefly after collision. Red glow during wind-up.
   * States: cooldown → windup → charging → stunned.
   */
  if(behavior==='charger'){
    if(e.chargeState==='cooldown'){
      e.chargeTimer = (e.chargeTimer||0)+dt;
      const cooldownPeriod=rand(2.5,4.0);
      if(e.chargeTimer>=cooldownPeriod){
        e.chargeState='windup';
        e.chargeTimer=0;
        e.chargeWindupTime=rand(1.0,2.0);
      }
    } else if(e.chargeState==='windup'){
      e.chargeTimer = (e.chargeTimer||0)+dt;
      // Visual: red glow / particles during charge-up, intensifying
      if(shouldEmitVfx(g,false) && Math.random()<0.5){
        addParticle(g,e.x+rand(-e.r,e.r),e.y+rand(-e.r,e.r),rand(-20,20),rand(-30,-10),
          e.chargeTimer/e.chargeWindupTime>0.5?'#ff4444':'#ff8844',rand(0.12,0.22),rand(2,4),'spark');
      }
      if(e.chargeTimer>=e.chargeWindupTime){
        // Release the charge!
        e.chargeState='charging';
        e.chargeTimer=0;
        const dist=Math.hypot(p.x-e.x,p.y-e.y)||1;
        e.chargeDir = {x:(p.x-e.x)/dist, y:(p.y-e.y)/dist};
        // Clear path so charge isn't interrupted
        e.path=[]; e.pathTimer=999;
        // Charge burst VFX
        addRing(g,e.x,e.y,'rgba(255,68,68,0.55)',0.20,e.r,e.r+20,5);
        sfx('explosion',0.50);
        shake=Math.max(shake,3);
      }
    } else if(e.chargeState==='charging'){
      // Move in stored direction at high speed
      const sirenMul=(e.sirenBoost>0 && e.sirenSpeedMul) ? e.sirenSpeedMul : 1;
      const chargeSpeed = e.speed * 3.8 * sirenMul;
      const nx = e.x + e.chargeDir.x * chargeSpeed * dt;
      const ny = e.y + e.chargeDir.y * chargeSpeed * dt;
      const r=e.collisionR || e.r || 12;
      // Check for wall collision
      const [tx,ty]=worldToTile(nx,ny);
      if(isSolid(tileAt(g,tx,ty)) || !inMap(tx,ty) || nx<r+TILE || nx>WORLD_W-r-TILE || ny<r+TILE || ny>WORLD_H-r-TILE){
        // Stun on collision
        e.chargeState='stunned';
        e.chargeTimer=0;
        shake=Math.max(shake,8);
        addRing(g,e.x,e.y,'rgba(255,68,68,0.65)',0.30,e.r*0.9,e.r+28,4);
        for(let k=0;k<10;k++){
          const a=rand(0,Math.PI*2), sp=rand(80,200);
          addParticle(g,e.x,e.y,Math.cos(a)*sp,Math.sin(a)*sp,'#ff4444',rand(0.15,0.35),rand(2,5),'spark');
        }
        sfx('explosion',0.70);
        e.pathTimer=0;
      } else {
        e.x=nx; e.y=ny;
      }
      // Red trail particles during charge
      if(shouldEmitVfx(g,false) && Math.random()<0.45){
        addParticle(g,e.x-e.chargeDir.x*e.r*0.6+rand(-3,3),e.y-e.chargeDir.y*e.r*0.6+rand(-3,3),
          -e.chargeDir.x*rand(80,200)+rand(-20,20),-e.chargeDir.y*rand(80,200)+rand(-20,20),
          '#ff4444',rand(0.12,0.22),rand(2,4),'spark');
      }
    } else if(e.chargeState==='stunned'){
      e.chargeTimer = (e.chargeTimer||0)+dt;
      if(e.chargeTimer>=1.0){
        e.chargeState='cooldown';
        e.chargeTimer=0;
      }
    }
    e._customMoveHandled = true;
    return;
  }

  /* ── 7. spawner (sporeMother) ─────────────────────────────────────────────
   * Periodically spawn 1-2 minion enemies (needleWisp or clawlingRunner).
   * Max active minions: 6. Visual ring burst on spawn.
   */
  if(behavior==='spawner'){
    e.spawnCd = Math.max(0,(e.spawnCd||0)-dt);
    // Count active minions near the spawner
    let minionCount=0;
    for(const other of g.enemies){
      if(other!==e && (other.type==='needleWisp' || other.type==='clawlingRunner') && other.hp>0
         && dist2(e.x,e.y,other.x,other.y)<340*340){
        minionCount++;
      }
    }
    if(e.spawnCd<=0 && minionCount<6 && g.enemies.length < (g.enemyBudget?.currentMaxEnemies || 120)){
      e.spawnCd=rand(5.0,8.0);
      const count=randi(1,2);
      for(let i=0;i<count;i++){
        const spawnType=Math.random()<0.5?'needleWisp':'clawlingRunner';
        const a=rand(0,Math.PI*2);
        const d=rand(e.r+18,e.r+42);
        const sx=clamp(e.x+Math.cos(a)*d,TILE*2,WORLD_W-TILE*2);
        const sy=clamp(e.y+Math.sin(a)*d,TILE*2,WORLD_H-TILE*2);
        const [stx,sty]=worldToTile(sx,sy);
        if(!isSolid(tileAt(g,stx,sty))){
          g.enemies.push(new Enemy(sx,sy,spawnType));
        }
      }
      // Visual: ring burst on spawn
      addRing(g,e.x,e.y,'rgba(115,255,138,0.50)',0.30,e.r,e.r+38,4);
      for(let k=0;k<6;k++){
        const a=rand(0,Math.PI*2);
        addParticle(g,e.x+Math.cos(a)*e.r,e.y+Math.sin(a)*e.r,
          Math.cos(a)*rand(30,80),Math.sin(a)*rand(30,80),
          '#73ff8a',rand(0.15,0.30),rand(2,4),'ring');
      }
    }
    return;
  }
}


/* ── TerrainCharger helper ──────────────────────────────────────────────────
 * Break mineable tiles in the charge path. Scans ahead of the enemy and
 * destroys rock/resource tiles during the charge. Mirrors the charging wave
 * breaker pattern but specifically for the fractureBeetle terrainCharger.
 */
function destroyTileByEnemyCharge(g,e,dirX,dirY,dt){
  const lookAhead=Math.max(TILE*0.5,e.r+e.speed*dt*1.4);
  // Sample three points across the enemy's width so wide chargers clear a path
  const offsets=[0, -e.r*0.55, e.r*0.55];
  const right={x:-dirY,y:dirX};
  for(const side of offsets){
    const sx=e.x+dirX*lookAhead+right.x*side;
    const sy=e.y+dirY*lookAhead+right.y*side;
    const [tx,ty]=worldToTile(sx,sy);
    if(destroySingleTileByEnemyCharge(g,tx,ty,e)) continue;
  }
}

function destroySingleTileByEnemyCharge(g,tx,ty,e){
  if(!inMap(tx,ty)) return false;
  const i=tileIdx(tx,ty);
  const t=g.tiles[i];
  if(t===TILE_EMPTY || t===TILE_HARD || t===TILE_LAVA_ROCK) return false;
  if(!isMineableForPlayer(t)) return false;
  const wasOre=t===TILE_GOLD || t===TILE_NITRA || t===TILE_CRYSTAL || t===TILE_FERRITE_BARK || t===TILE_LUMINA_SPORES || t===TILE_AETHER_QUARTZ || t===TILE_CRYSALITH || t===TILE_EMBERGLASS;
  g.tiles[i]=TILE_EMPTY; g.tileHp[i]=0; g.navigationVersion++;
  // Notify nearby enemies that paths may have changed
  for(const enemy of g.enemies){
    if(dist2(enemy.x,enemy.y,tileToWorldCenterX(tx),tileToWorldCenterY(ty))<520*520) enemy.pathTimer=0;
  }
  if(g.runStats){
    g.runStats.blocksBrokenByEnemies=(g.runStats.blocksBrokenByEnemies||0)+1;
    if(wasOre) g.runStats.oresDestroyedByEnemies=(g.runStats.oresDestroyedByEnemies||0)+1;
  }
  const x=tileToWorldCenterX(tx), y=tileToWorldCenterY(ty);
  for(let k=0;k<8;k++) addParticle(g,x,y,rand(-120,120),rand(-120,120),wasOre?'#ff9f43':'#8f6a4a',rand(0.18,0.42),rand(2,5),'spark');
  if(wasOre) floating(g,x,y-TILE*0.18,'Ore destroyed','#ffcc4d');
  shake=Math.max(shake,2);
  return true;
}


function updateHexShardEnemy(g,e,dt){
  const p=g.player;
  const pressure=g.hollowPressure || 0;
  const triggerR=70 + Math.min(18,pressure*3);
  const explosionR=95 + Math.min(28,pressure*5);
  const d=Math.hypot(p.x-e.x,p.y-e.y);


  if(!e.detonationStarted && d<=triggerR){
    e.detonationStarted=true;
    e.state='detonationWarning';
    e.detonationTimer=1.05;
    e.warningSoundTimer=0;
    e.boomerangCd=999;
    sfx('hexBlip',1.0);
    log(g,'Hex Shard destabilising!');
  }

  if(e.detonationStarted){
    e.detonationTimer-=dt;
    e.warningSoundTimer-=dt;
    e.shakeAmount=5+Math.max(0,1-e.detonationTimer/1.05)*8;
    if(e.warningSoundTimer<=0){
      e.warningSoundTimer=Math.max(0.14,0.34*clamp(e.detonationTimer/1.05,0.35,1));
      sfx('hexBlip',0.75+0.4*(1-e.detonationTimer/1.05));
    }
    const dx=p.x-e.x, dy=p.y-e.y, l=len(dx,dy);
    // Once primed, it braces and creeps toward the player instead of ranged attacks.
    moveCircle(g,e,dx/l*e.speed*0.42*dt,dy/l*e.speed*0.42*dt);
    if(e.detonationTimer<=0) hexShardExplode(g,e,explosionR);
    return;
  }

  // Medium range skirmisher: approaches if far, backs off if too close, and strafes.
  const preferredMin=180, preferredMax=420;
  const dx=p.x-e.x, dy=p.y-e.y, l=len(dx,dy);
  let ux=dx/l, uy=dy/l;
  if(d<preferredMin){ ux=-ux; uy=-uy; }
  else if(d<=preferredMax){
    const side=Math.sin(g.time*2.2+e.phase)>0?1:-1;
    ux=-dy/l*side; uy=dx/l*side;
  }
  const slow=e.slow>0?0.55:1;
  moveCircle(g,e,ux*e.speed*slow*dt,uy*e.speed*slow*dt);

  e.boomerangCd-=dt*(1+pressure*0.08);
  if(d<520 && e.boomerangCd<=0 && lineOfSightClear(g,e.x,e.y,p.x,p.y)){
    const count=(pressure>=3 && Math.random()<0.35) ? 2 : 1;
    for(let i=0;i<count;i++) throwEnemyBoomerang(g,e,i,count);
    e.boomerangCd=clamp(2.8-pressure*0.18,1.25,2.8)*rand(0.82,1.18);
    e.state='attack';
  }

  const touch = (p.collisionR||p.r)+e.r;
  if(d<touch && p.iframes<=0){
    const damage=Math.max(1,Math.round(e.damage*(p.armourMul || 1)));
    p.hp-=damage; if(typeof recordRunDamageTaken==='function') recordRunDamageTaken(g,damage,'enemyContact'); p.iframes=0.45; flashDamage(); shake=Math.max(shake,5);
    floating(g,p.x,p.y-25,`-${damage}`,'#ff7a38'); sfx('hit',0.75);
    if(p.hp<=0) gameOver(g);
  }
}

function throwEnemyBoomerang(g,e,index=0,count=1){
  const p=g.player;
  const pressure=g.hollowPressure || 0;
  const baseA=Math.atan2(p.y-e.y,p.x-e.x);
  const spread=(index-(count-1)/2)*0.28;
  const a=baseA+spread+rand(-0.08,0.08);
  const speed=245+pressure*18;
  const predictedX=p.x+p.lastDx*42;
  const predictedY=p.y+p.lastDy*42;
  g.enemyBoomerangs.push({
    x:e.x,y:e.y,originX:e.x,originY:e.y,owner:e,age:0,life:2.45+pressure*0.08,
    phase:'outbound',targetX:predictedX,targetY:predictedY,
    vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,speed,
    r:7,damage:clamp(9+pressure*1.2,9,18),turnRate:3.2+pressure*0.25,
    color:'#ff7038',curve:rand(-1,1)>=0?1:-1,trail:[],hitPlayer:false
  });
  addRing(g,e.x,e.y,'rgba(255,112,56,0.62)',0.16,e.r,e.r+20,3);
  sfx('hexBoomerang',0.85);
}

function updateEnemyBoomerangs(g,dt){
  const p=g.player;
  for(const b of g.enemyBoomerangs){
    b.age+=dt; b.life-=dt;
    if(b.age>0.58) b.phase='return';
    let tx=b.targetX, ty=b.targetY;
    if(b.phase==='return'){
      if(b.owner && b.owner.hp>0){ tx=b.owner.x; ty=b.owner.y; }
      else { tx=b.originX; ty=b.originY; }
    }
    const dx=tx-b.x, dy=ty-b.y, l=len(dx,dy);
    const perpX=-dy/l*b.curve, perpY=dx/l*b.curve;
    const wobble=Math.sin(b.age*9)*0.34;
    const desiredA=Math.atan2(dy/l+perpY*wobble, dx/l+perpX*wobble);
    const desiredVx=Math.cos(desiredA)*b.speed;
    const desiredVy=Math.sin(desiredA)*b.speed;
    b.vx=lerp(b.vx,desiredVx,clamp(b.turnRate*dt,0,1));
    b.vy=lerp(b.vy,desiredVy,clamp(b.turnRate*dt,0,1));
    b.x+=b.vx*dt; b.y+=b.vy*dt;
    b.trail.push({x:b.x,y:b.y});
    if(b.trail.length>12) b.trail.shift();
    if(shouldEmitVfx(g,false)) addParticle(g,b.x,b.y,-b.vx*0.035+rand(-12,12),-b.vy*0.035+rand(-12,12),b.color,0.13,2.5,'spark');
    const [txi,tyi]=worldToTile(b.x,b.y);
    if(isSolid(tileAt(g,txi,tyi))){ b.life=0; continue; }
    if(!b.hitPlayer && dist2(p.x,p.y,b.x,b.y)<((p.collisionR||p.r)+b.r)*((p.collisionR||p.r)+b.r)){
      const damage=Math.max(1,Math.round(b.damage*(p.armourMul || 1)));
      p.hp-=damage; if(typeof recordRunDamageTaken==='function') recordRunDamageTaken(g,damage,'enemyProjectile'); p.iframes=Math.max(p.iframes,0.28); b.hitPlayer=true; b.life=0;
      floating(g,p.x,p.y-24,`-${damage}`,'#ff7038'); flashDamage(); sfx('hit',0.8);
      if(p.hp<=0) gameOver(g);
    }
    if(b.phase==='return' && Math.hypot(b.x-b.originX,b.y-b.originY)<18) b.life=0;
  }
  g.enemyBoomerangs=g.enemyBoomerangs.filter(b=>b.life>0 && b.x>-160 && b.y>-160 && b.x<WORLD_W+160 && b.y<WORLD_H+160);
}

function hexShardExplode(g,e,r){
  e.noDrop=true;
  e.hp=0;
  const p=g.player;
  const d=Math.hypot(p.x-e.x,p.y-e.y);
  if(d<r+(p.collisionR||p.r)){
    const falloff=1-clamp(d/(r+(p.collisionR||p.r)),0,1)*0.45;
    const damage=Math.max(1,Math.round((34+(g.hollowPressure||0)*3)*falloff*(p.armourMul || 1)));
    p.hp-=damage;
    if(typeof recordRunDamageTaken==='function') recordRunDamageTaken(g,damage,'hexExplosion');
    p.iframes=Math.max(p.iframes,0.55);
    floating(g,p.x,p.y-26,`-${damage}`,'#ff7038');
    flashDamage();
    if(p.hp<=0) gameOver(g);
  }
  shake=Math.max(shake,10);
  addRing(g,e.x,e.y,'rgba(255,112,56,0.92)',0.34,8,r,7);
  addRing(g,e.x,e.y,'rgba(255,235,160,0.92)',0.18,5,r*0.55,5);
  addParticle(g,e.x,e.y,0,0,'rgba(255,245,220,0.96)',0.10,26);
  for(let k=0;k<44;k++){
    const a=rand(0,Math.PI*2), sp=rand(120,420);
    addParticle(g,e.x,e.y,Math.cos(a)*sp,Math.sin(a)*sp,k%3===0?'#ffd36b':'#ff7038',rand(0.18,0.55),rand(1.6,4.2), k%4===0?'fragment':'spark');
  }
  for(let k=0;k<18;k++){
    const a=rand(0,Math.PI*2), sp=rand(45,150);
    addParticle(g,e.x,e.y,Math.cos(a)*sp,Math.sin(a)*sp,'rgba(70,55,48,0.65)',rand(0.38,0.85),rand(5,12));
  }
  spawnVfxComposition(g,'hexShardExplosion',e.x,e.y,{radius:r,color:'#ff7038'});
  sfx('explosion',0.95);
}

function smallEnemyProjectileConfig(g,e){
  const cfgType = ENEMY_TYPES[e.type] || {};
  if((cfgType.role || e.role)==='elite' || (cfgType.role || e.role)==='boss') return null;
  if(e.type==='exploder' || cfgType.behavior==='proximityExploder') return null;
  if(g.debug && g.debug.enemyBulletsEnabled===false) return null;
  const stage=Math.max(0,g.time/60);
  const runLevel=g.runIndex || 1;
  const mission=g.missionIndex || 1;
  const earlyFactor = g.time<60 ? 0.55 : g.time<150 ? 0.82 : 1.0;
  const typeMul = e.type==='swarmer' ? 0.78 : e.type==='guard' ? 1.15 : 1.0;
  // Per-enemy cooldown multiplier for individual tuning
  const cdMul = cfgType.cooldownMul || 1;  // ← fixed here
  return {
    cooldown:(4.0/(typeMul*earlyFactor*cdMul))/(1+stage*0.10+runLevel*0.1+(mission-1)*0.02+(g.hollowPressure||0)*0.08),
    speed:(220 + stage*10 + runLevel*7) * (e.type==='swarmer' ? 0.92 : 1) * (1+(g.hollowPressure||0)*0.04),
    damage:Math.round(clamp(5 + stage*0.85 + (mission-1)*0.50 + (e.type==='guard'?3:0) + (g.hollowPressure||0)*0.7,5,14)),
    fireChance:clamp(0.35 + stage*0.050 + g.level*0.015 + (g.hollowPressure||0)*0.040,0.35,0.88),
    color:'#ff2f2f',
    radius:e.type==='guard'?4.5:3.5
  };
}

function eliteProjectileConfig(g,e){
  const role=(ENEMY_TYPES[e.type]?.role || e.role || 'normal');
  if(role!=='elite' && role!=='boss') return null;
  if(g.debug && g.debug.enemyBulletsEnabled===false) return null;
  const runLevel=g.runIndex || 1;
  const mission=g.missionIndex || 1;
  const destructive=role==='boss' || runLevel>=3;
  const pressure=g.hollowPressure || 0;
  return {
    cooldown:(role==='boss'?1.75:3.8)/(1+runLevel*0.12+(mission-1)*0.05+pressure*0.12),
    speed:(role==='boss'?360:300)*(1+runLevel*0.05+pressure*0.045),
    damage:Math.round((role==='boss'?18:12)*(1+(mission-1)*0.08+pressure*0.06)),
    projectileCount:role==='boss' ? Math.max(3,5+pressure) : Math.max(1,1+pressure),
    destructive,
    color:destructive?'#ff7038':'#ff3636',
    radius:destructive?7:5
  };
}

function updateEnemyRangedAttack(g,e,dt){
  const cfg = eliteProjectileConfig(g,e) || smallEnemyProjectileConfig(g,e);
  if(!cfg || e.hp<=0) return;
  e.rangedCd-=dt;
  const p=g.player;
  const d=Math.hypot(p.x-e.x,p.y-e.y);
  const role=(ENEMY_TYPES[e.type]?.role || e.role || 'normal');
  const minRange=(role==='elite'||role==='boss')?190:150;
  const maxRange=(role==='elite'||role==='boss')?850:620;
  if(d<minRange || d>maxRange || e.rangedCd>0) return;
  const bulletCap=getEnemyBulletCap(g);
  if(g.enemyBullets.length>=bulletCap){
    if(g.performance) g.performance.skippedBullets=(g.performance.skippedBullets||0)+1;
    e.rangedCd=rand(cfg.cooldown*0.85,cfg.cooldown*1.35);
    return;
  }
  const perfState=g.performance?.state || PERF_STATES.HEALTHY;
  if(perfState===PERF_STATES.CRITICAL && role!=='boss' && !(role==='elite' && d<460)){
    if(g.performance) g.performance.skippedBullets=(g.performance.skippedBullets||0)+1;
    e.rangedCd=rand(cfg.cooldown*1.2,cfg.cooldown*1.8);
    return;
  }
  if(perfState===PERF_STATES.WARNING && role!=='elite' && role!=='boss' && Math.random()<0.45){
    if(g.performance) g.performance.skippedBullets=(g.performance.skippedBullets||0)+1;
    e.rangedCd=rand(cfg.cooldown*0.9,cfg.cooldown*1.45);
    return;
  }
  if(role!=='elite' && role!=='boss' && Math.random()>cfg.fireChance){
    e.rangedCd=rand(cfg.cooldown*0.65,cfg.cooldown*1.15);
    return;
  }
  e.rangedCd=rand(cfg.cooldown*0.82,cfg.cooldown*1.28);
  const spread=(role==='elite'||role==='boss')?0.16:0.18;
  const baseA=Math.atan2(p.y-e.y,p.x-e.x)+rand(-spread*0.35,spread*0.35);
  const count=cfg.projectileCount || 1;
  const center=(count-1)/2;
  for(let i=0;i<count;i++){
    let a=baseA+(i-center)*spread;
    if(role==='boss' && (g.hollowPressure||0)>=3 && i>0) a=baseA+(i-center)*(Math.PI*2/count); // escalated radial boss pressure
    g.enemyBullets.push({
      x:e.x+Math.cos(a)*(e.r+8), y:e.y+Math.sin(a)*(e.r+8),
      vx:Math.cos(a)*cfg.speed, vy:Math.sin(a)*cfg.speed,
      r:cfg.radius, life:role==='boss'?3.4:(role==='elite'?2.8:2.4), damage:cfg.damage,
      destructive:!!cfg.destructive, color:cfg.color,
      small:role!=='elite' && role!=='boss'
    });
  }
  addRing(g,e.x,e.y,cfg.destructive?'rgba(255,112,56,0.72)':'rgba(255,54,54,0.52)',0.14,e.r,e.r+(cfg.small?13:22),cfg.small?2:3);
  sfx('shoot',cfg.small?0.28:0.45);
}

function destroyTileByEnemyProjectile(g,tx,ty){
  if(!inMap(tx,ty)) return false;
  const i=tileIdx(tx,ty);
  const t=g.tiles[i];
  if(t===TILE_HARD || t===TILE_EMPTY || t===TILE_LAVA_ROCK) return false;
  if(!isMineableForPlayer(t)) return false;
  const wasOre=t===TILE_GOLD || t===TILE_NITRA || t===TILE_CRYSTAL;
  g.tiles[i]=TILE_EMPTY;
  g.tileHp[i]=0;
  g.navigationVersion++;
  for(const e of g.enemies){
    if(dist2(e.x,e.y,tileToWorldCenterX(tx),tileToWorldCenterY(ty))<520*520) e.pathTimer=0;
  }
  const color=wasOre?'#ff6b35':'#9a6a45';
  for(let k=0;k<12;k++) addParticle(g,tileToWorldCenterX(tx),tileToWorldCenterY(ty),rand(-150,150),rand(-150,150),color,rand(0.22,0.52),rand(2,6),'spark');
  if(wasOre) floating(g,tileToWorldCenterX(tx),tileToWorldCenterY(ty)-TILE*0.18,'Ore lost','#ff9f43');
  return true;
}

function updateEnemyBullets(g,dt){
  const p=g.player;
  for(const b of g.enemyBullets){
    b.x+=b.vx*dt; b.y+=b.vy*dt; b.life-=dt;
    if(shouldEmitVfx(g,b.destructive)) addParticle(g,b.x,b.y,-b.vx*0.02+rand(-10,10),-b.vy*0.02+rand(-10,10),b.color,b.destructive?0.16:0.11,b.destructive?4:2,'spark');
    const [tx,ty]=worldToTile(b.x,b.y);
    const t=tileAt(g,tx,ty);
    if(isSolid(t)){
      if(b.destructive && destroyTileByEnemyProjectile(g,tx,ty)){
        shake=Math.max(shake,4);
        spawnVfxComposition(g,'destructiveImpact',b.x,b.y,{radius:38,color:'#ff7038'});
      }
      b.life=0;
      continue;
    }
    if(dist2(p.x,p.y,b.x,b.y)<(p.r+b.r)*(p.r+b.r)){
      const damage=Math.max(1,Math.round(b.damage*(p.armourMul || 1)));
      p.hp-=damage;
      p.iframes=Math.max(p.iframes,0.28);
      floating(g,p.x,p.y-25,`-${damage}`,'#ff9f43');
      flashDamage();
      sfx('hit',0.8);
      b.life=0;
      if(p.hp<=0) gameOver(g);
    }
  }
  g.enemyBullets=g.enemyBullets.filter(b=>b.life>0 && b.x>-120 && b.y>-120 && b.x<WORLD_W+120 && b.y<WORLD_H+120);
}

function killEnemy(g,e){
  if(g.runStats){
    g.runStats.enemiesKilled=(g.runStats.enemiesKilled||0)+1;
    if(e.isChargingWaveEnemy) g.runStats.chargingWaveEnemiesKilled=(g.runStats.chargingWaveEnemiesKilled||0)+1;
    const roleStat=ENEMY_TYPES[e.type]?.role || e.role || 'normal';
    if(roleStat==='elite') g.runStats.elitesKilled=(g.runStats.elitesKilled||0)+1;
    if(roleStat==='boss' || e.type==='boss' || e.type==='hollowTyrantVariant') g.runStats.bossesKilled=(g.runStats.bossesKilled||0)+1;
  }
  g.kills++; sfx('kill', 0.55); dropPickup(g,e.x,e.y,'xp',e.xp);
  // Track kills persistently so kill-count milestones can fire mid-run.
  saveProfile.statistics.totalEnemiesKilled = (saveProfile.statistics.totalEnemiesKilled||0) + 1;
  // Phase 1.2: update Hunt mission objective.
  if(g.missionType === 'hunt'){
    const o=g.objectives.find(o=>o.id==='hunt_kills');
    if(o && !o.completed){
      o.currentAmount=Math.min(o.currentAmount+1,o.targetAmount);
      if(o.currentAmount>=o.targetAmount){
        o.completed=true;
        log(g, `${o.displayName} complete.`);
        sfx('level',0.75);
        if(g.runStats) g.runStats.objectivesCompleted=(g.runStats.objectivesCompleted||0)+1;
      }
    }
  }
  // Phase 1.1: check kill-based milestones.
  if(typeof checkMilestoneOnKill === 'function') checkMilestoneOnKill(g);
  const role=ENEMY_TYPES[e.type]?.role || e.role || 'normal';
  if(role==='boss') spawnVfxComposition(g,'bossShockwave',e.x,e.y,{radius:Math.max(120,e.r*3.2),color:e.color});
  else if(role==='elite') spawnVfxComposition(g,'eliteDeathBurst',e.x,e.y,{radius:Math.max(56,e.r*2.1),color:e.color});
  else if(Math.random()<0.70) spawnVfxComposition(g,'enemyDeathBurst',e.x,e.y,{radius:Math.max(24,e.r*1.8),color:e.color});
  // Track elite and boss kills in persistent profile for milestone checks.
  if(role==='elite') saveProfile.statistics.totalElitesKilled = (saveProfile.statistics.totalElitesKilled||0) + 1;
  if(e.type==='boss' || e.type==='hollowTyrantVariant'){
    g.bossDefeated=true;
    saveProfile.statistics.totalBossesKilled++;
    log(g,'Sector boss defeated. Extraction signal locked.');
    sfx('explosion',1.2);
    addRing(g,e.x,e.y,'rgba(255,79,216,0.9)',0.42,e.r,e.r+95,8);
  }
  if(Math.random()<0.12) dropPickup(g,e.x+rand(-8,8),e.y+rand(-8,8),'voltarite', randi(1,2));
  if(Math.random()<0.025) dropPickup(g,e.x+rand(-12,12),e.y+rand(-12,12),MISSION_RESOURCE_IDS[randi(2,MISSION_RESOURCE_IDS.length-1)],1);
  for(let k=0;k<10;k++) addParticle(g,e.x,e.y,rand(-100,100),rand(-100,100),e.color,rand(0.22,0.55),rand(2,6));
  if(g.player.vampire>0){
    g.player.vampCounter++;
    if(g.player.vampCounter>=18){ g.player.vampCounter=0; g.player.hp=Math.min(g.player.maxHp,g.player.hp+g.player.vampire); floating(g,g.player.x,g.player.y-32,'Vampire repair','#5dff9a'); }
  }
}

function updateBullets(g,dt){
  for(const b of g.bullets){
    b.x+=b.vx*dt; b.y+=b.vy*dt; b.life-=dt;
    if(Math.random()<0.2) addParticle(g,b.x,b.y,-b.vx*0.06+rand(-10,10),-b.vy*0.06+rand(-10,10),b.color,0.18,b.rail?5:3, b.drone?'spark':'circle');
    const [tx,ty]=worldToTile(b.x,b.y);
    if(isSolid(tileAt(g,tx,ty)) && !b.rail){ b.life=0; continue; }
    for(const e of g.enemies){
      if(e.hp>0 && dist2(b.x,b.y,e.x,e.y)<(b.r+e.r)*(b.r+e.r)){
        // Phase 2.2: check boss weak point hit (2x damage + stagger)
        let dmgMul = 1;
        if(e.role === 'boss' && g.bossWeakPoint?.active && checkBossWeakPointHit(g, e, b)){
          dmgMul = 2;
        }
        damageEnemy(g,e,Math.round(b.damage * dmgMul),b.color);
        if(g.player.splash>0 && !b.drone) explode(g,b.x,b.y,42,g.player.splash,'#ffcc4d',true);
        b.pierce--;
        if(b.pierce<0){ b.life=0; break; }
      }
    }
  }
  g.bullets=g.bullets.filter(b=>b.life>0 && b.x>-100 && b.y>-100 && b.x<WORLD_W+100 && b.y<WORLD_H+100);
}

function damageEnemy(g,e,amount,color){
  if(typeof recordRunDamageDealt==='function') recordRunDamageDealt(g,amount);
  if((color==='#7df9ff' || color==='#5dff9a') && g.player.arcDamageMul) amount*=g.player.arcDamageMul;
  const damage = Math.max(1, Math.round(amount));
  e.hp-=damage; e.hitFlash=0.08; e.slow=Math.max(e.slow,0.05);
  floating(g,e.x,e.y - e.r - 10, `-${damage}`, color || '#ffffff');
  if(Math.random()<0.25) addParticle(g,e.x,e.y,rand(-70,70),rand(-70,70),color,rand(0.18,0.35),rand(2,5));
}


const VFX_COMPOSITIONS = {
  genericExplosion: { theme:'default', radius:64, color:'#ff9f43' },
  largeExplosion: { theme:'default', radius:118, color:'#ff9f43', large:true },
  seismicCharge: { theme:'default', radius:112, color:'#ffcc4d', large:true },
  hexShardExplosion: { theme:'hex', radius:95, color:'#ff7038' },
  lavaBurst: { theme:'lava', radius:42, color:'#ff7038' },
  missileImpact: { theme:'missile', radius:44, color:'#ffcc4d' },
  enemyDeathBurst: { theme:'death', radius:28, color:'#ff5b5b' },
  eliteDeathBurst: { theme:'deathElite', radius:64, color:'#b46bff' },
  bossShockwave: { theme:'boss', radius:140, color:'#ff4fd8', large:true },
  arcOverload: { theme:'arc', radius:52, color:'#5dff9a' },
  stormLatticeHit: { theme:'arc', radius:30, color:'#7df9ff' },
  destructiveImpact: { theme:'destructive', radius:46, color:'#ff7038' },
  chargingWaveExplosion: { theme:'lava', radius:95, color:'#ff7038', large:true },
};

function spawnVfxComposition(g,name,x,y,options={}){
  const comp=VFX_COMPOSITIONS[name] || VFX_COMPOSITIONS.genericExplosion;
  const radius=options.radius || comp.radius || 56;
  const color=options.color || comp.color || '#ff9f43';
  const oldLast=g.debug ? g.debug.lastVfxComposition : null;
  if(g.debug) g.debug.lastVfxComposition=name;
  spawnExplosionVfx(g,x,y,radius,color,options.theme || comp.theme || 'default', { composition:name, large:!!comp.large, noDebugName:true });
  return oldLast;
}

function pickSpriteVariant(list){
  return list && list.length ? list[randi(0,list.length-1)] : null;
}

function addSpriteParticle(g,spriteId,x,y,life,size,options={}){
  const important = options.important ?? false;
  if(!shouldEmitVfx(g,important)) return;
  g.particles.push({
    x,y,vx:options.vx||0,vy:options.vy||0,
    color:options.color || '#ffffff',
    life,maxLife:life,size,
    targetSize:options.targetSize,
    shape:'sprite',spriteId,
    rotation:options.rotation || 0,
    spin:options.spin || 0,
    alphaMul:options.alphaMul ?? 1,
    glowColor:options.glowColor || null,
    glowBlur:options.glowBlur || 0,
    additive:options.additive ?? false,
  });
}

function resolveExplosionTheme(theme,color){
  if(theme && theme!=='auto') return theme;
  if(color==='#5dff9a' || color==='#7df9ff') return 'arc';
  if(color==='#ff7038') return Math.random()<0.55 ? 'hex' : 'lava';
  if(color==='#ff9f43' || color==='#ffcc4d') return Math.random()<0.4 ? 'lava' : 'default';
  return 'default';
}

function spawnExplosionVfx(g,x,y,r,color,theme='auto',options={}){
  if(typeof EXPLOSION_VFX_SPRITES==='undefined') return;
  const resolved = resolveExplosionTheme(theme,color);
  if(g.debug && !options.noDebugName) g.debug.lastVfxComposition = resolved;
  const perfMul = g.debug?.forceFullVfx ? 1 : clamp(g.performance?.vfxFactor ?? 1, 0.4, 1);
  const sizeMul = lerp(0.85,1.0,perfMul);
  const coreId = pickSpriteVariant(EXPLOSION_VFX_SPRITES.coreFlash);
  const fireballPool = resolved==='lava' ? EXPLOSION_VFX_SPRITES.lavaBurst
    : resolved==='hex' ? EXPLOSION_VFX_SPRITES.hexShardBurst
    : resolved==='arc' ? EXPLOSION_VFX_SPRITES.arcOverload
    : resolved==='missile' ? EXPLOSION_VFX_SPRITES.sparkBurst
    : resolved==='death' ? EXPLOSION_VFX_SPRITES.fragmentBurst
    : resolved==='deathElite' ? EXPLOSION_VFX_SPRITES.fragmentBurst
    : resolved==='boss' ? EXPLOSION_VFX_SPRITES.shockwave
    : resolved==='destructive' ? EXPLOSION_VFX_SPRITES.fragmentBurst
    : EXPLOSION_VFX_SPRITES.fireball;
  const ringPool = Math.random()<0.5 ? EXPLOSION_VFX_SPRITES.ringBlast : EXPLOSION_VFX_SPRITES.shockwave;
  const accentPool = resolved==='arc' ? EXPLOSION_VFX_SPRITES.arcOverload
    : resolved==='hex' ? EXPLOSION_VFX_SPRITES.fragmentBurst
    : resolved==='lava' ? EXPLOSION_VFX_SPRITES.sparkBurst
    : resolved==='missile' ? EXPLOSION_VFX_SPRITES.sparkBurst
    : resolved==='boss' ? EXPLOSION_VFX_SPRITES.ringBlast
    : (Math.random()<0.5 ? EXPLOSION_VFX_SPRITES.fragmentBurst : EXPLOSION_VFX_SPRITES.sparkBurst);

  const largeMul = options.large ? 1.28 : 1;
  const coreSize = Math.max(26, r*rand(0.85,1.18))*sizeMul*largeMul;
  addSpriteParticle(g, coreId, x, y, rand(0.08,0.14), coreSize, {
    targetSize: coreSize*rand(1.20,1.45),
    rotation: rand(0,Math.PI*2),
    spin: rand(-2.8,2.8),
    alphaMul: rand(0.88,1),
    glowColor: color,
    glowBlur: 18,
    additive: true,
    important: true,
  });

  const fireballCount = perfMul < 0.6 ? 1 : (Math.random()<0.65 ? 2 : 1);
  for(let i=0;i<fireballCount;i++){
    const id = pickSpriteVariant(fireballPool);
    const angle = rand(0,Math.PI*2), drift = rand(0,r*0.10);
    const size = Math.max(34, r*rand(1.10,1.70))*sizeMul;
    addSpriteParticle(g, id, x+Math.cos(angle)*drift, y+Math.sin(angle)*drift, rand(0.16,0.30), size, {
      targetSize: size*rand(1.08,1.28),
      rotation: rand(0,Math.PI*2),
      spin: rand(-1.8,1.8),
      alphaMul: rand(0.65,0.92),
      glowColor: color,
      glowBlur: resolved==='arc' ? 22 : 14,
      additive: resolved!=='hex',
    });
  }

  const ringId = pickSpriteVariant(ringPool);
  const ringSize = Math.max(44, r*rand(1.65,2.05))*sizeMul;
  addSpriteParticle(g, ringId, x, y, rand(0.20,0.34), ringSize*0.75, {
    targetSize: ringSize,
    rotation: rand(0,Math.PI*2),
    spin: rand(-0.8,0.8),
    alphaMul: rand(0.55,0.85),
    glowColor: resolved==='arc' ? '#7df9ff' : color,
    glowBlur: resolved==='arc' ? 18 : 8,
    additive: true,
    important: true,
  });

  if(perfMul > 0.45 || Math.random()<0.8){
    const smokeId = pickSpriteVariant(EXPLOSION_VFX_SPRITES.smokeBloom);
    const smokeSize = Math.max(54, r*rand(1.55,2.20))*sizeMul;
    addSpriteParticle(g, smokeId, x+rand(-r*0.08,r*0.08), y+rand(-r*0.08,r*0.08), rand(0.36,0.62), smokeSize, {
      targetSize: smokeSize*rand(1.10,1.32),
      rotation: rand(0,Math.PI*2),
      spin: rand(-0.7,0.7),
      alphaMul: rand(0.35,0.58),
      glowBlur: 0,
      additive: false,
    });
  }

  if(Math.random()<0.82){
    const accentId = pickSpriteVariant(accentPool);
    const accentSize = Math.max(30, r*rand(0.92,1.42))*sizeMul;
    addSpriteParticle(g, accentId, x+rand(-r*0.05,r*0.05), y+rand(-r*0.05,r*0.05), rand(0.14,0.24), accentSize, {
      targetSize: accentSize*rand(1.05,1.22),
      rotation: rand(0,Math.PI*2),
      spin: rand(-2.4,2.4),
      alphaMul: rand(0.52,0.86),
      glowColor: color,
      glowBlur: resolved==='arc' ? 18 : 10,
      additive: true,
    });
  }
}

function explode(g,x,y,r,damage,color,noShake=false,theme='auto'){
  if(!noShake) shake=Math.max(shake,9);
  for(const e of g.enemies){
    const d=Math.hypot(e.x-x,e.y-y);
    if(d<r+e.r) damageEnemy(g,e,damage*(1-d/(r+e.r)*0.45),color);
  }
  spawnExplosionVfx(g,x,y,r,color,theme);
  addRing(g,x,y,color,0.34,Math.max(6,r*0.10),r*1.10,8);
  addRing(g,x,y,'rgba(255,244,214,0.95)',0.18,Math.max(4,r*0.06),r*0.78,6);
  addParticle(g,x,y,0,0,'rgba(255,240,220,0.95)',0.10,Math.max(10,r*0.26));
  for(let k=0;k<28;k++){
    const a=rand(0,Math.PI*2), s=rand(110,330);
    addParticle(g,x,y,Math.cos(a)*s,Math.sin(a)*s,color,rand(0.20,0.55),rand(3,9),'spark');
  }
  for(let k=0;k<16;k++){
    const a=rand(0,Math.PI*2), s=rand(35,125);
    addParticle(g,x,y,Math.cos(a)*s,Math.sin(a)*s,'rgba(80,80,88,0.55)',rand(0.45,0.95),rand(8,18));
  }
  for(let k=0;k<14;k++){
    const a=rand(0,Math.PI*2), s=rand(80,280);
    addParticle(g,x,y,Math.cos(a)*s,Math.sin(a)*s,color,rand(0.28,0.70),rand(4,12));
  }
}

function collectRunResource(g,resourceId,amount,options={}){
  if(!g.resources) g.resources={};
  g.resources[resourceId]=(g.resources[resourceId] || 0) + amount;
  if(typeof recordRunResource==='function') recordRunResource(g,resourceId,amount);
  if(resourceId==='gild') g.gold=(g.resources.gild || 0);
  if(resourceId==='voltarite') g.nitra=(g.resources.voltarite || 0);
  if(resourceId==='echo' && options.asXp!==false){
    gainXp(g,amount);
    if(g.runStats) g.runStats.xpCollected=(g.runStats.xpCollected||0)+amount;
    g.objectiveEchoCollected=(g.objectiveEchoCollected || 0)+amount;
  }
  addObjectiveProgress(g,`collect_${resourceId}`,amount);
  // compatibility with older objective IDs
  if(resourceId==='gild') addObjectiveProgress(g,'mine_gild_shards',amount);
  if(resourceId==='echo') addObjectiveProgress(g,'collect_echo_shards',amount);
}

function addHeartVfx(g, x, y){
  for(let k=0; k<8; k++){
    const angle = Math.random()*Math.PI*2;
    const dist = rand(30, 80);
    addParticle(g, x+Math.cos(angle)*dist*0.2, y+Math.sin(angle)*dist*0.2, Math.cos(angle)*dist, Math.sin(angle)*dist, '#ff6b8f', rand(0.35, 0.55), rand(4, 8), 'spark');
  }
  addRing(g, x, y, '#ff6b8f', 0.25, 4, 32, 2);
}

function dropPickup(g,x,y,type,value){
  g.pickups.push({x:x+rand(-10,10),y:y+rand(-10,10),type,value,r:type==='xp'||type==='health'?7:8,life:999});
}
function updatePickups(g,dt){
  const p=g.player;
  const range=72*p.pickupMul;
  for(const it of g.pickups){
    const d=Math.hypot(p.x-it.x,p.y-it.y);
    if(d<range){
      const pull=clamp(1-d/range,0,1);
      it.x=lerp(it.x,p.x,dt*(2+pull*8));
      it.y=lerp(it.y,p.y,dt*(2+pull*8));
    }
    if(d<p.r+it.r+4){
      if(it.type==='xp'){ collectRunResource(g,'echo',it.value); }
      else if(it.type==='health'){
        const healAmount = it.value || 15;
        const actualHeal = Math.min(healAmount, p.maxHp - p.hp);
        p.hp += actualHeal;
        floating(g, p.x, p.y - 24, `+${actualHeal} HP`, '#ff6b8f');
        sfx('health', 0.65);
        addHeartVfx(g, it.x, it.y);
      }
      else if(MINERALS[it.type]){ collectRunResource(g,it.type,it.value); }
      else if(it.type==='nitra') collectRunResource(g,'voltarite',it.value);
      sfx('pickup', it.type==='nitra' || it.type==='voltarite' ? 1.0 : 0.6);
      it.life=0;
    }
  }
  g.pickups=g.pickups.filter(i=>i.life>0);
}

function gainXp(g,v){
  g.xp+=v;
  while(g.xp>=g.xpNeed){
    g.xp-=g.xpNeed; g.level++; g.xpNeed=Math.floor(g.xpNeed*1.22+12);
    // Phase 1.1: check level-based milestones.
    if(typeof checkMilestoneOnLevelUp === 'function') checkMilestoneOnLevelUp(g, g.level);
    sfx('level'); openUpgrade(g); break;
  }
}

function openUpgrade(g){
  awaitingUpgrade=true;
  ui.upgradeCards.innerHTML='';
  const choices=[];
  const settings = getFogSettings();
  const pool=UPGRADE_POOL.filter(up=>(!up.allowedClasses || up.allowedClasses.includes(g.player.classId)) && (!up.available || up.available(g)) && (settings.manualMouseControlEnabled || !up.requiresMouseControl));
  while(choices.length<3 && pool.length){
    const idx=randi(0,pool.length-1);
    choices.push(pool.splice(idx,1)[0]);
  }
  g.upgradeMenuState = g.upgradeMenuState || {open:false,selectedIndex:0,lastMoveTime:-999,moveRepeatDelay:0.20};
  g.upgradeMenuState.open=true;
  g.upgradeMenuState.selectedIndex=0;
  g.upgradeMenuState.lastMoveTime=-999;
  g.upgradeMenuState.choices=choices;
  for(let i=0;i<choices.length;i++){
    const up=choices[i];
    const div=document.createElement('div');
    div.className='card';
    div.dataset.upgradeIndex=String(i);
    div.setAttribute('role','option');
    div.setAttribute('tabindex','0');
    const iconHtml = up.spriteId ? spriteIconHtml(up.spriteId, up.icon) : up.icon;
    div.innerHTML=`<div class="icon">${iconHtml}</div><h3>${up.name}</h3><p>${up.desc}</p><span class="tag">Select</span>`;
    div.onclick=()=>selectUpgradeByIndex(g,i,'mouse');
    div.onmouseenter=()=>{ g.upgradeMenuState.selectedIndex=i; refreshUpgradeSelection(g); };
    div.onkeydown=(ev)=>{ if(ev.code==='Enter' || ev.code==='Space'){ ev.preventDefault(); selectUpgradeByIndex(g,i,'keyboard'); } };
    ui.upgradeCards.appendChild(div);
  }
  ui.upgradeOverlay.classList.add('show');
  refreshUpgradeSelection(g);
}

function updateParticles(g,dt){
  const particleCap = g.performance?.state===PERF_STATES.CRITICAL ? 260 : g.performance?.state===PERF_STATES.WARNING ? 420 : 720;
  if(g.particles.length>particleCap) g.particles.splice(0,g.particles.length-particleCap);
  for(const p of g.particles){
    p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=Math.pow(0.02,dt); p.vy*=Math.pow(0.02,dt); p.life-=dt;
    if(p.shape==='ring' || p.shape==='sprite') p.size = lerp(p.size, p.targetSize || p.size, dt*10);
    if(p.shape==='sprite') p.rotation = (p.rotation || 0) + (p.spin || 0)*dt;
  }
  g.particles=g.particles.filter(p=>p.life>0);
  for(const a of g.arcs){ a.life-=dt; }
  g.arcs=g.arcs.filter(a=>a.life>0);
  for(const t of g.texts){ t.y-=34*dt; t.life-=dt; }
  g.texts=g.texts.filter(t=>t.life>0);
}
function addParticle(g,x,y,vx,vy,color,life,size,shape='circle'){
  const important = shape==='ring' || life<=0.12;
  if(!shouldEmitVfx(g,important)) return;
  g.particles.push({x,y,vx,vy,color,life,maxLife:life,size,shape});
}
function addRing(g,x,y,color,life,size,targetSize,lineWidth=4){ g.particles.push({x,y,vx:0,vy:0,color,life,maxLife:life,size,targetSize,shape:'ring',lineWidth}); }
function floating(g,x,y,text,color){ g.texts.push({x,y,text,color,life:0.9,maxLife:0.9}); }
function flashDamage(){ ui.damageFlash.classList.add('on'); setTimeout(()=>ui.damageFlash.classList.remove('on'),90); }




