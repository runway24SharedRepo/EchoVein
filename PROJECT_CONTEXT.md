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

## Active Development Phase
**Currently implementing: Phase 1** (Progression & Meta Overhaul)

## Priority Items (from roadmap)
1. Milestones & Achievements
2. Mission Variety (Hunt, Survey, Harvest, Holdout)
3. Permanent Upgrade Expansion
4. Resource Economy Rebalance
5. Operator XP & Prestige

## Code Patterns
- Use existing stat tracking in progression.js
- UI rendering uses render-ui.js
- Event system in systems.js

## File References
- Main entry: index.html
- Styles: css/style.css
- Assets: assets/sprites/