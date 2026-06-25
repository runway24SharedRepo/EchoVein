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

## ✅ Completed Phases

### Phase 1: Progression & Meta Overhaul
- ✅ **1.1 Milestones & Achievements** — 30 milestones, locked/unlocked, progress tracking, persistence
- ✅ **1.2 Mission Variety** — Hunt, Survey, Harvest, Holdout with selection UI and tracking
- ✅ **1.3 Permanent Upgrade Expansion** — 10 upgrade categories with tiered costs
- ⏳ **1.4 Resource Economy Rebalance** — Planned
- ⏳ **1.5 Operator XP & Prestige** — Planned
- ⏳ **1.6 Run History / Hall of Records** — Planned

## 🎯 Current Task: Phase 2.1 — Upgrade Synergies

**Goal:** Combo bonuses when certain upgrades are acquired together.

**8 Synergies:**
1. Drone Commander — Warden Drone Bay + Drone Bay Expansion + Drone Targeting AI
2. Mining Magnate — Tungsten Bore Bit + Cryo Coolant + Resonance Magnet
3. Arc Overload — Arc Connection + Storm Lattice + Arc Capacitors
4. Bulwark Arsenal — Hammerfall Salvo + Warhead Yield + Hot-Burn Motors
5. Borecaster Demolition — Seismic Charge + Extra Charges + Blast Radius
6. Pathfinder Tactics — Trap Payload + Field Reclaimer + Targeting Cursor
7. Vector Specialist — Vector Burst + Splitfire Array + Vector Focusing + Vector Accelerator + Vector Relay
8. Sifter Master — Sifter Drone + Sifter Optics + Sifter Turbo

**Key Files:**
- progression.js → SYNERGIES array, checkSynergies()
- systems.js → Hook after upgrade application
- render-ui.js → Synergies menu UI
- core.js → Synergy state in game object
- style.css → Synergy card styles

## Code Patterns
- Use existing stat tracking in progression.js
- UI rendering uses render-ui.js
- Event system in systems.js
- Synergy state stored in `g.unlockedSynergies`

## File References
- Main entry: index.html
- Styles: css/style.css
- Assets: assets/sprites/