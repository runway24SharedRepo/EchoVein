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

## ✅ Completed Phases

### Phase 2.1 — Upgrade Synergies ✅

**8 Synergies:**
1. **Drone Commander** — Drones fire 30% faster, 25% more damage
2. **Mining Magnate** — Mining speed +50%, heat -40%, pickup range +50%
3. **Arc Overload** — Chain lightning +2 targets, 35% more damage
4. **Bulwark Arsenal** — Missiles 30% faster, 40% travel speed, 20% more damage
5. **Borecaster Demolition** — Bombs 40% more damage, 50% larger radius, +2 bombs
6. **Pathfinder Tactics** — Traps 60% more damage, kills restore 15 HP, mouse targeting always
7. **Vector Specialist** — 10 directions, 50% more damage, 40% faster projectiles
8. **Sifter Master** — 100% faster collection, 50% larger search radius

**Implementation:**
- `SYNERGIES` array in progression.js with id, name, icon, description, bonus, requiredUpgrades, check(), apply()
- `checkSynergies(g)` — runs after each upgrade pick, checks requirements, unlocks, shows floating text
- `applySynergyRewards(g)` — re-applies persistent synergies at run start
- Hooked in `selectUpgradeByIndex()` in systems.js
- `showSynergiesMenu()` — responsive grid with locked/unlocked states, missing upgrades in red
- "Synergies" button in main menu
- `unlockedSynergies` array in profile for persistence

## 🎯 Next Tasks (Planned)
- ⏳ Phase 1.4 — Resource Economy Rebalance
- ⏳ Phase 1.5 — Operator XP & Prestige
- ⏳ Phase 1.6 — Run History / Hall of Records
- ⏳ Phase 2.2+ — TBD

## Code Patterns
- Use existing stat tracking in progression.js
- UI rendering uses render-ui.js
- Event system in systems.js
- Synergy state stored in `g.unlockedSynergies`

## File References
- Main entry: index.html
- Styles: css/style.css
- Assets: assets/sprites/