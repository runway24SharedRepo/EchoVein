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
- ⏳ **1.5 Operator XP & Prestige** — Planned
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
- ⏳ Phase 1.5 — Operator XP & Prestige
- ⏳ Phase 1.6 — Run History / Hall of Records
- ⏳ Phase 2.7+ — TBD (Thermal Lance VFX, additional content)

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

### Key Files to Modify
| File | Changes |
|---|---|
| `entities.js` | BOSS_TYPES data, boss constructors, weak point logic |
| `systems.js` | updateBoss() function, phase transitions, attack timers, weak point tracking |
| `render-ui.js` | Boss health bar, name display, phase indicator, weak point highlight, extraction path |
| `core.js` | bossType, bossPhase, bossWeakPoint, upgrade pool |
| `world.js` | Boss selection logic |
| `audio.js` | Boss sounds (roar, phase change, defeat, weak point) |
| `assets.js` | Boss sprites and their attacks |
| `style.css` | Boss health bar styling, phase indicators |
| `progression.js` | Resource economy, bonus objectives, conversion system |

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