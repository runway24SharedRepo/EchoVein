# Echo Vein - Project Context

## Core Architecture
- Engine: Canvas 2D with Web Audio
- Structure: main.js, core.js, entities.js, systems.js, render-ui.js, progression.js
- State: Central game state object in core.js

## Key Systems
- Combat: Heat-based weapon system with overheat mechanics
- Progression: XP/level system with operator classes
- Resources: Ore mining with tiered economy (Common/Uncommon/Rare)
- Enemies: BossShooter (placeholder), with other behaviors planned

## ✅ Completed Phases

### Phase 1: Progression & Meta Overhaul
- ✅ **1.1 Milestones & Achievements** — 30 milestones across combat, mining, runs, resources, and classes. Locked/unlocked states with progress tracking. Hooked into killEnemy, mineTile, gainXp.
- ⏳ **1.2 Mission Variety** — CURRENT TASK (Hunt, Survey, Harvest, Holdout)
- ⏳ **1.3 Permanent Upgrade Expansion** — Next after 1.2
- ⏳ **1.4 Resource Economy Rebalance** — Planned
- ⏳ **1.5 Operator XP & Prestige** — Planned
- ⏳ **1.6 Run History / Hall of Records** — Planned

## 🎯 Current Task: Phase 1.2 — Mission Variety

**Goal:** Replace the current "mine everything" mission with 4 distinct mission types:

| Mission Type | Description | Key Mechanic |
|---|---|---|
| **Hunt** | Eliminate a target number of enemies | Track enemy kills, spawn waves |
| **Survey** | Explore and reveal X% of the map | Track tile visibility/reveal |
| **Harvest** | Collect specific resources | Track resource collection |
| **Holdout** | Survive for X seconds | Timer-based, enemy waves |

**Mission Flow:**
1. Player selects mission type at start
2. Mission objectives are generated
3. In-run tracking (HUD shows progress)
4. Mission completion triggers rewards

**Key Files to Modify:**
- `progression.js` → Mission generation, tracking, rewards
- `systems.js` → Hooks for kill tracking, resource tracking, map reveal
- `render-ui.js` → Mission HUD display
- `core.js` → Mission state in game object

## Code Patterns
- Use existing stat tracking in progression.js
- UI rendering uses render-ui.js
- Event system in systems.js
- Mission state stored in `g.mission` object

## File References
- Main entry: index.html
- Styles: css/style.css
- Assets: assets/sprites/