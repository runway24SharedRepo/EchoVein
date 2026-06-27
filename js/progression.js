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
