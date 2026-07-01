# EchoVein – 1 Month Development Roadmap for LLM Handoff

## Purpose

This document is a self-contained Markdown roadmap for **EchoVein**, intended to be shared with any LLM, developer, or game designer.

It describes the planned improvements and new features for the next development cycle, with enough context for another LLM to help implement, refine, or split the work into coding tasks.

---

# 1. Project Context

**EchoVein** is a 2D top-down browser/desktop roguelike extraction-mining action game.

Current foundation:

- HTML5 Canvas rendering
- Browser build for itch.io
- Windows desktop build using Electron
- Destructible cave terrain
- Mining and resource collection
- Fog of war
- Multiple operators/player classes
- Permanent upgrades
- Run-based missions
- Boss encounters
- Extraction phase
- Enemy pathfinding and terrain interaction
- Projectiles, bombs, drones, traps, and special weapons
- Visual effects and sprite-based enemies
- Controller, mouse, and keyboard support
- Debug and balancing tools

Recently completed hotfixes:

- Large monitor support
- Browser scaling improvements
- Menu scrolling fixes
- Controller navigation improvements
- Windows desktop executable support

The next development phase should focus on deeper gameplay, stronger atmosphere, better readability, and replayability.

---

# 2. High-Level Goal

The next update should make EchoVein feel:

- More tactical
- More atmospheric
- More readable during combat
- More replayable
- More distinct as an extraction-mining roguelike

Long-term design loop:

```text
Explore the cave.
Mine valuable resources.
Mining creates noise and danger.
Use terrain, weapons, and upgrades to survive.
Complete mission objectives.
Defeat the boss.
Escape with as much cargo as possible.
```

Core identity:

> A tactical underground extraction roguelike where digging is both your economy and your biggest risk.

---

# 3. Roadmap Summary

The next major development cycle should focus on:

1. Stronger mission variety
2. Mining risk and resonance system
3. Improved enemy behaviour and readability
4. Enemy nests and cave threats
5. More interesting upgrade choices
6. Stronger extraction phase
7. Cave visual improvements
8. Dynamic lighting and atmosphere
9. Biomes and cave identity
10. UI and quality-of-life improvements
11. Performance and stability improvements

---

# 4. Stronger Mission Variety

## Goal

Mission types should feel mechanically different, not just be different counters.

## Planned Mission Types

### Hunt Missions

Focus on combat, elite enemy targets, enemy pressure, and tactical movement.

Possible objectives:

- Kill a specific elite enemy
- Eliminate dangerous enemies
- Destroy a boss-linked enemy pack
- Survive enemy ambushes

### Harvest Missions

Focus on mining, resource collection, and risk/reward decisions.

Possible objectives:

- Mine a specific amount of ore
- Collect rare resources
- Extract with minimum cargo value
- Mine unstable resources before danger rises too high

### Survey Missions

Focus on exploration, fog of war, and scanning.

Possible objectives:

- Reveal map sectors
- Scan relics
- Find hidden cave structures
- Reach unexplored zones

### Holdout Missions

Focus on defence, waves, area control, and terrain preparation.

Possible objectives:

- Defend a drill
- Defend an extraction beacon
- Hold an area for a timer
- Keep a structure above minimum health

## Objective System Recommendation

Refactor objectives into:

```js
primaryObjectives: required to spawn the boss
secondaryObjectives: optional bonus rewards
pressureObjectives: optional risk/reward objectives
```

Primary objectives progress the mission. Secondary objectives give rewards. Pressure objectives increase danger but can improve rewards.

---

# 5. Mining Risk and Resonance System

## Goal

Mining should become more important and more dangerous.

## Core Idea

Mining creates **resonance** or **noise**.

Different materials generate different danger:

```text
Normal rock: low resonance
Common ore: medium resonance
Rare ore: high resonance
Unstable ore: very high resonance
Explosive resource: danger spike
```

## Resonance Thresholds

```text
25% resonance: small enemies investigate
50% resonance: enemy pressure increases
75% resonance: elite or charging wave chance increases
100% resonance: trigger resonance rupture event
```

## Example Implementation Concept

```js
function addMiningResonance(g, amount, x, y) {
  g.resonance = Math.min(100, g.resonance + amount);

  if (g.resonance >= 25 && !g.resonanceFlags.level1) {
    g.resonanceFlags.level1 = true;
    spawnInvestigationEnemies(g, x, y);
  }

  if (g.resonance >= 50 && !g.resonanceFlags.level2) {
    g.resonanceFlags.level2 = true;
    increaseEnemyPressure(g);
  }

  if (g.resonance >= 75 && !g.resonanceFlags.level3) {
    g.resonanceFlags.level3 = true;
    triggerElitePressure(g, x, y);
  }

  if (g.resonance >= 100) {
    triggerResonanceRupture(g, x, y);
    g.resonance = 60;
    resetResonanceFlags(g);
  }
}
```

## Player Decisions Created

The player must decide:

- Do I keep mining rare ore?
- Do I stop before attracting a swarm?
- Do I dig a shortcut even if it creates danger?
- Do I mine near extraction or stay quiet?
- Do I trigger resonance intentionally for more rewards?

## UI Requirements

The system should include:

- Resonance meter
- Warning colour changes
- Audio warning tones
- Cave pulse effect
- Screen shake at high resonance
- Enemy warning markers
- Message log entries

Example messages:

```text
The cave begins to hum.
Something heard the mining.
Resonance spike detected.
The cave ruptures.
```

---

# 6. Ore Chain Reactions

## Goal

Resources should be tactical objects, not only currency.

| Ore / Resource | Suggested Effect |
|---|---|
| Voltarite | Small red explosion; damages enemies and player |
| Echo Shard | XP burst and temporary light pulse |
| Emberglass | Leaves hot damaging ground |
| Aether Quartz | Freezes or slows enemies nearby |
| Crysalith | Fires crystal fragments outward |
| Gild | High value but creates loud resonance |
| Lumina Spores | Temporary vision radius |
| Machine Scrap | Can spawn mechanical hazards or rewards |

The player should be able to use ore effects tactically.

---

# 7. Improved Enemy Behaviour and Readability

## Goal

Enemies should be more readable and more distinct.

| Enemy Role | Visual Language | Gameplay Cue |
|---|---|---|
| Swarmer | Small, fast, thin outline, motion trail | Runs directly at player |
| Charger | Ground warning strip, body lean | Charges after wind-up |
| Exploder | Pulsing red ring | Must be killed before contact |
| Ranged | Aim line or charging glow | Fires projectile |
| Miner | Sparks at mouth/front | Digs through rock |
| Support | Cyan/green aura | Buffs nearby enemies |
| Tank | Large body, heavy shadow | Blocks path, high HP |
| Spawner | Pulsing core/sac | Creates smaller enemies |
| Blink Enemy | Flashing outline | Teleports or jumps |
| Flying Enemy | Shadow underneath | Ignores terrain |

## Telegraph Improvements

### Charger

```text
1. Enemy stops briefly.
2. Enemy faces the player.
3. Ground warning strip appears.
4. Audio cue plays.
5. Enemy charges.
```

### Exploder

```text
1. Red pulse begins.
2. Pulse speed increases.
3. Warning circle expands.
4. Explosion triggers.
```

### Ranged Enemy

```text
1. Aim laser appears.
2. Weapon/core glow increases.
3. Projectile fires.
```

The game can be difficult, but it should not feel unfair.

---

# 8. Enemy Nests and Cave Threats

## Goal

Enemies should also come from visible world sources.

Possible nest/threat types:

```text
Spore nest
Crystal rift
Lava vent
Tunnel breach
Resonance crack
Machine ruin portal
Bone hive
Burrow hole
```

## Example Data

```js
const NEST_TYPES = {
  sporeNest: {
    spawns: ['sporeMother', 'acidTick'],
    interval: 8,
    hp: 180,
    reward: 'luminaSpores'
  },

  crystalRift: {
    spawns: ['crystalLancer', 'hexShardThrower'],
    interval: 10,
    hp: 220,
    reward: 'crysalith'
  },

  lavaVent: {
    spawns: ['emberCrawler', 'moltenBurrower'],
    interval: 12,
    hp: 240,
    reward: 'emberglass'
  }
};
```

Player choices:

- Avoid nests
- Destroy nests for rewards
- Farm nests for XP/resources
- Use nests tactically
- Clear nests before extraction

---

# 9. More Interesting Upgrade Choices

## Goal

Upgrade choices should change gameplay behaviour, not only increase numbers.

Keep numeric upgrades such as:

- Damage
- Fire rate
- Accuracy
- Mining speed
- Movement speed
- Cooldown reduction
- Health/shield increase

Add mutation upgrades.

## Rotary Mauler Ideas

```text
Ricochet Rounds: bullets bounce once from cave walls.
Suppressive Cone: sustained fire slows enemies.
Bore Ripper: bullets chip weak rock.
Shredder Spin: higher fire rate, lower accuracy.
Heavy Slugs: lower fire rate, higher knockback.
```

## Thermal Lance Ideas

```text
Glass Trail: flame leaves burning ground.
Pressure Lance: narrower flame, longer range, higher damage.
Fan Lance: wider flame, lower damage, better swarm control.
Thermal Bloom: enemies killed by fire burst into flame particles.
Molten Drill: flame can melt weak terrain.
```

## Vector Burst Ideas

```text
Orbit Pattern: projectiles orbit the player before firing outward.
Spiral Pattern: shots curve outward in a spiral.
Mirror Burst: every burst also fires backward.
Phase Split: projectiles split after travelling.
Return Vector: missed projectiles curve back slightly.
```

## Borecaster Bomb Ideas

```text
Sticky Charge: bomb attaches to enemies or walls.
Mining Charge: bomb clears terrain better but gives fewer resources.
Vacuum Charge: bomb pulls enemies inward before exploding.
Cluster Charge: bomb splits into smaller charges.
Seismic Echo: explosion creates a second delayed shockwave.
```

---

# 10. Extraction Phase Improvements

## Goal

Extraction should feel like a dramatic final escape.

## Planned Improvements

- Stronger extraction beacon visibility
- Clearer direction indicators
- Off-screen extraction arrow
- Enemy pressure during escape
- Possible extraction holdout timer
- Cargo risk/reward decisions

## Extraction Flow Concept

```text
1. Complete mission objectives.
2. Boss appears.
3. Defeat boss.
4. Extraction craft arrives.
5. Player carries collected resources or chooses cargo load.
6. Enemies become more aggressive.
7. Player reaches extraction zone.
8. Optional holdout timer begins.
9. Extraction completes.
```

## Cargo Load Concept

```text
Light Cargo: low bonus, normal movement.
Medium Cargo: medium bonus, slight speed penalty.
Heavy Cargo: high bonus, strong speed penalty, more enemy attraction.
```

---

# 11. Cave Visual Improvements

## Goal

The cave should look more organic, atmospheric, and dangerous.

Planned improvements:

- Better cave edge rendering
- More organic-looking terrain
- Improved rock variation
- More visible ore glow
- Better mining sparks
- Block damage cracks
- Improved lava/crystal/resource effects
- More dust and debris

## Cave Edge Rendering Concept

Improve tiles by inspecting neighbouring cells:

```text
Solid tile next to empty tile: draw exposed edge.
Exposed corner: draw rounded/cracked corner.
Isolated solid tile: draw pillar/chunk.
Damaged tile: draw cracks.
```

Example:

```js
function drawCaveTile(ctx, tile, x, y, neighbours) {
  drawBaseRock(ctx, x, y);

  if (!neighbours.top) drawTopEdge(ctx, x, y);
  if (!neighbours.bottom) drawBottomEdge(ctx, x, y);
  if (!neighbours.left) drawLeftEdge(ctx, x, y);
  if (!neighbours.right) drawRightEdge(ctx, x, y);

  drawRandomCracks(ctx, x, y, tile.seed);
}
```

---

# 12. Dynamic Lighting and Atmosphere

## Goal

Use darkness, glow, and light sources more strongly.

Planned light sources:

| Source | Light Style |
|---|---|
| Player equipment | Cyan radius or cone |
| Rare ores | Coloured glow |
| Lava rocks | Orange flicker |
| Enemy cores | Hostile glow |
| Boss weak points | Strong warning light |
| Explosions | Brief bright flash |
| Projectiles | Small moving light |
| Extraction craft | Yellow beacon |
| Drones | Small cyan light |
| Resonance rupture | Cave-wide pulse |

## Implementation Direction

Use a low-resolution offscreen lighting canvas:

```text
1. Clear lighting canvas to black.
2. Draw radial gradients for light sources.
3. Blur if performance allows.
4. Composite over the main scene.
5. Reduce quality if FPS drops.
```

Lighting quality levels:

```text
High: all lights, blur enabled.
Medium: fewer lights, smaller blur.
Low: only major lights.
Off: no dynamic lighting.
```

---

# 13. Biomes and Cave Identity

## Goal

Different cave zones should feel unique.

| Biome | Palette | Gameplay Identity |
|---|---|---|
| Echo Cavern | Blue/cyan | More fog, energy resources |
| Voltarite Rift | Red/orange | Explosive ores, chargers |
| Fungal Hollow | Green/purple | Spore enemies, poison hazards |
| Machine Grave | Grey/yellow | Drones, turrets, ruins |
| Lava Maw | Orange/black | Heat hazards, burrowers |
| Crystal Depths | Purple/white | Shard enemies, reflective projectiles |

## Example Config

```js
const BIOME_CONFIG = {
  echoCavern: {
    name: 'Echo Cavern',
    background: '#07131a',
    fogTint: '#0b2633',
    oreWeights: {
      echoShard: 4,
      gild: 1,
      voltarite: 1
    },
    enemyFamilies: ['swarmer', 'miner', 'blink'],
    ambientParticles: 'cyanDust'
  },

  voltariteRift: {
    name: 'Voltarite Rift',
    background: '#180807',
    fogTint: '#301010',
    oreWeights: {
      voltarite: 5,
      emberglass: 2,
      gild: 1
    },
    enemyFamilies: ['charger', 'exploder', 'lavaBurrower'],
    ambientParticles: 'emberAsh'
  }
};
```

---

# 14. UI and Quality-of-Life Improvements

## Goal

Reduce friction and make the game easier to understand.

Planned improvements:

- Better objective display
- Clearer upgrade descriptions
- Better menu scrolling
- Better controller navigation
- More readable warnings
- Improved off-screen markers
- Better extraction direction arrow
- More consistent gamepad support
- Continued browser and Windows build improvements

Important warnings should appear near the player or in the world.

| Condition | Suggested Visual |
|---|---|
| Drill overheating | Red/orange ring around player |
| High resonance | Pulsing cave wave |
| Boss attack incoming | Ground danger marker |
| Enemy charge incoming | Directional warning |
| Extraction available | Off-screen arrow |
| Low health | Screen edge pulse |
| Heavy cargo | Weight icon near player |

---

# 15. Performance and Stability

## Goal

Maintain performance as new enemies, VFX, and lighting are added.

Planned improvements:

- More configurable performance settings
- Better VFX throttling during heavy combat
- Improved particle management
- Better enemy spawn pressure control
- Continued browser and Windows testing
- Better support for large monitors and fullscreen play

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

Suggested FPS thresholds:

```js
performanceConfig: {
  healthyFps: 55,
  warningFps: 48,
  criticalFps: 36,
  recoveryFps: 50
}
```

---

# 16. Current Priority for the Next Release

1. Mission objective improvements
2. Mining resonance / danger system
3. Better enemy telegraphs
4. Improved cave visuals
5. Stronger extraction phase
6. More interesting upgrade choices
7. Continued browser and Windows quality-of-life fixes

---

# 17. Suggested LLM Implementation Prompts

## Prompt A: Refactor Mission Objectives

```text
You are a front-end JavaScript game developer working on EchoVein, a 2D top-down HTML5 canvas roguelike extraction-mining game.

Refactor the mission objective system so objectives are separated into primaryObjectives, secondaryObjectives, and pressureObjectives.

Primary objectives are required to spawn the boss.
Secondary objectives are optional and grant bonus rewards.
Pressure objectives are optional risk/reward objectives that can increase danger.

Update mission generation, objective completion checks, HUD rendering, reward calculation, and boss spawn logic.

Keep backward compatibility with existing objective objects where possible.
```

## Prompt B: Add Mining Resonance System

```text
You are a gameplay systems developer working on EchoVein.

Add a mining resonance/noise system.

Every mined block should increase a resonance meter. Normal rock adds low resonance, common ore adds medium resonance, rare ore adds high resonance, and unstable ore adds very high resonance.

At configurable thresholds:
25%: investigation enemies
50%: increased enemy pressure
75%: elite or charging wave chance
100%: resonance rupture event

Add HUD display, warning VFX, audio cues, and configuration values.

The system should make mining a risk/reward decision.
```

## Prompt C: Add Enemy Telegraphs

```text
You are a gameplay readability specialist working on EchoVein.

Improve enemy telegraphs and enemy role readability.

Add clear warning indicators for chargers, exploders, ranged enemies, support enemies, miners, spawners, blink enemies, and bosses.

Use pulsing rings, aim lines, ground warning strips, glow buildup, squash/stretch, anticipation pauses, and lightweight audio cues.

The player should understand what is about to happen before taking damage.
```

## Prompt D: Add Enemy Nests

```text
You are a gameplay systems developer working on EchoVein.

Add visible enemy nest/world-threat objects to the cave.

Nest examples:
- Spore nest
- Crystal rift
- Lava vent
- Tunnel breach
- Resonance crack
- Machine ruin portal

Each nest should have HP, spawn table, spawn interval, visual effects, reward on destruction, and optional map/minimap marker.

The player should be able to avoid, destroy, or farm nests.
```

## Prompt E: Add Dynamic Lighting

```text
You are a Canvas rendering expert working on EchoVein.

Add a performant dynamic lighting layer.

Use a low-resolution offscreen canvas for lighting. Draw radial gradients for player equipment, ores, lava, enemy cores, projectiles, explosions, boss weak points, and extraction craft.

Composite the lighting over the main scene to create a darker underground atmosphere.

Add quality settings so lighting can be reduced or disabled if FPS drops. Do not break fog of war.
```

## Prompt F: Improve Cave Edge Rendering

```text
You are a 2D Canvas graphics programmer working on EchoVein.

Improve cave rendering by adding procedural cave edge/autotiling effects.

For each solid cave tile, inspect neighbouring empty tiles and draw exposed edges, cracked borders, rounded corners, inner shadows, small rock chips, and damaged block cracks.

The goal is to make the cave look more organic and less square-grid based.

The solution should work without requiring new art assets, but should be structured so sprite edge overlays can be added later.
```

## Prompt G: Improve Extraction Finale

```text
You are a roguelike gameplay designer and JavaScript developer working on EchoVein.

Improve EchoVein's extraction phase.

After the boss is defeated:
- spawn the extraction craft
- show a strong extraction beacon
- show off-screen extraction arrow
- increase enemy pressure
- optionally allow cargo load risk/reward
- add a short extraction-zone hold timer

The extraction phase should feel like a dramatic final escape.
```

## Prompt H: Add Behaviour-Changing Upgrades

```text
You are a roguelike upgrade designer working on EchoVein.

Expand the upgrade system with behaviour-changing mutation upgrades.

Examples:
- Ricochet bullets
- Burning ground from flame weapons
- Sticky bombs
- Vacuum explosions
- Spiral shots
- Orbiting projectiles
- Mining-focused weapon modifiers
- Cargo/extraction upgrades

Update upgrade descriptions so the player clearly understands what changes.

Keep numeric upgrades, but add more upgrades that change playstyle.
```

---

# 18. Acceptance Criteria for Next Release

The next release should be considered successful if:

```text
Mission types feel more distinct.
Mining creates meaningful danger.
Players can understand enemy attacks before being hit.
The cave looks more organic and atmospheric.
Extraction feels more exciting.
Upgrade choices create different playstyles.
Browser and Windows builds remain stable.
Controller and mouse input remain reliable.
Performance remains acceptable during heavy combat.
```

---

# 19. Final Design Direction

EchoVein should not become only a generic top-down shooter with mining.

The strongest direction is:

> A dangerous underground extraction roguelike where every block you mine can make you richer, louder, and closer to death.

All future systems should reinforce this loop:

```text
Explore.
Mine.
Make noise.
Attract danger.
Fight.
Upgrade.
Defeat the boss.
Escape.
Repeat.
```
