'use strict';

/* Persistent profile, menus, mission progression, and permanent upgrades. */

const SAVE_KEY = 'echoVeinSaveV1';
const RUNS_PER_MISSION = 5;
const EXTRACTION_SECONDS = 30;
const SPECIAL_ORES = ['voltarite','echoQuartz','ferronRoot','lumicite','pyroclastCore','umbralAlloy','ferriteBark','luminaSpores','aetherQuartz','crysalith','emberglass'];

let appState = 'STARTUP';
let saveProfile = null;


/*
 * Objective Foundation — Stronger Mission Variety Phase 1
 *
 * Objectives are intentionally normalised at creation and at important read
 * sites so older saved/run data remains valid. Any objective without an
 * objectiveType is treated as PRIMARY, matching the old behaviour where every
 * objective was required before the boss could spawn.
 */
let objectiveAutoId = 1;

function normaliseObjectiveType(objectiveType){
  return (objectiveType === 'secondary' || objectiveType === 'pressure' || objectiveType === 'primary')
    ? objectiveType
    : 'primary';
}

function numberOrDefault(value, fallback){
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function createObjective(data={}){
  const source = (data && typeof data === 'object') ? data : {};
  const objectiveType = normaliseObjectiveType(source.objectiveType || 'primary');
  const targetAmount = numberOrDefault(source.targetAmount ?? source.target, 1);
  const currentAmount = numberOrDefault(source.currentAmount ?? source.current, 0);
  const id = source.id || `objective_${objectiveAutoId++}`;
  const type = source.type || 'generic';
  const displayName = source.displayName || source.name || source.desc || source.description || id;

  return {
    ...source,
    id,
    type,
    objectiveType,
    optional: source.optional != null ? !!source.optional : objectiveType !== 'primary',
    displayName,
    description: source.description || source.desc || '',
    targetAmount,
    currentAmount,
    completed: source.completed != null ? !!source.completed : false,
    failed: source.failed != null ? !!source.failed : false,
    reward: source.reward || null,
    failConditionType: source.failConditionType || null,
    params: (source.params && typeof source.params === 'object') ? source.params : {},
    tags: Array.isArray(source.tags) ? source.tags : [],
    hiddenUntilStarted: source.hiddenUntilStarted != null ? !!source.hiddenUntilStarted : false,
    showProgress: source.showProgress != null ? !!source.showProgress : true
  };
}

function normaliseObjective(o){
  // Missing objectiveType means this is old objective data; old objectives were
  // all required, so they must stay primary for save/profile compatibility.
  return createObjective(o || {});
}

function normaliseObjectives(g){
  if(!g) return [];
  if(!Array.isArray(g.objectives)) g.objectives=[];
  g.objectives = g.objectives.map(normaliseObjective);
  return g.objectives;
}

function getObjectivesByType(g, objectiveType){
  const wanted = normaliseObjectiveType(objectiveType);
  return normaliseObjectives(g).filter(o=>normaliseObjectiveType(o.objectiveType)===wanted);
}

function getPrimaryObjectives(g){ return getObjectivesByType(g,'primary'); }
function getSecondaryObjectives(g){ return getObjectivesByType(g,'secondary'); }
function getPressureObjectives(g){ return getObjectivesByType(g,'pressure'); }

function allPrimaryObjectivesComplete(g){
  const primary = getPrimaryObjectives(g).filter(o=>!o.failed);
  // Safety guard: no primary objectives should never unlock the boss by accident.
  return primary.length>0 && primary.every(o=>o.completed);
}

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
    progress:p=>({current:(p.statistics.classRuns||{}).borecaster||0, target:10}) },

  // ── 🏆 OPERATOR XP & PRESTIGE ──────────────────────────────────────
  { id:'OpLevel10',        name:'Operator Novice',     desc:'Reach operator level 10 with any class.', reward:'+3% damage',           icon:'⭐',  group:'class',
    check:p=>{ const od=p.operatorData||{}; return Object.values(od).some(d=>d.level>=10); },
    apply:g=>{ g.player.damageMul*=1.03; },
    progress:p=>{ const od=p.operatorData||{}; const best=Math.max(...Object.values(od).map(d=>d.level),0); return {current:best, target:10}; } },
  { id:'OpLevel20',        name:'Operator Master',     desc:'Reach operator level 20 with any class.', reward:'+5% damage',            icon:'🌟',  group:'class',
    check:p=>{ const od=p.operatorData||{}; return Object.values(od).some(d=>d.level>=20); },
    apply:g=>{ g.player.damageMul*=1.05; },
    progress:p=>{ const od=p.operatorData||{}; const best=Math.max(...Object.values(od).map(d=>d.level),0); return {current:best, target:20}; } },
  { id:'FirstPrestige',    name:'First Prestige',      desc:'Prestige any operator once.',            reward:'+5 max HP',            icon:'🏅',  group:'class',
    check:p=>{ const od=p.operatorData||{}; return Object.values(od).some(d=>d.prestige>=1); },
    apply:g=>{ const b=Math.round(g.player.maxHp*0.05); g.player.maxHp+=b; g.player.hp+=b; },
    progress:p=>{ const od=p.operatorData||{}; const totalP=Object.values(od).reduce((s,d)=>s+d.prestige,0); return {current:totalP, target:1}; } },
  { id:'MaxPrestige',      name:'True Veteran',        desc:'Prestige an operator 5 times.',          reward:'+8% damage, +5% HP',   icon:'👑',  group:'class',
    check:p=>{ const od=p.operatorData||{}; return Object.values(od).some(d=>d.prestige>=5); },
    apply:g=>{ g.player.damageMul*=1.08; const b=Math.round(g.player.maxHp*0.05); g.player.maxHp+=b; g.player.hp+=b; },
    progress:p=>{ const od=p.operatorData||{}; const best=Math.max(...Object.values(od).map(d=>d.prestige),0); return {current:best, target:5}; } }
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
    description:'Track and eliminate elite Hollowborn targets. Combat priority mission — mining is optional.',
    rewardModifier:1.15,
    generateObjectives:(profile,g)=>{
      const diff=missionDifficulty(g.missionIndex||profile.missionIndex);
      const eliteTarget=Math.max(3, Math.floor(3*diff.objectiveMultiplier));
      const killTarget=Math.max(20, Math.floor((18+(g.missionIndex||1)*2)*diff.objectiveMultiplier));
      return [
        createObjective({
          id:'hunt_elites',
          type:'killEnemyTag',
          objectiveType:'primary',
          optional:false,
          displayName:`🗡️ Eliminate ${eliteTarget} marked elites`,
          description:'Primary Hunt objective. Marked elite targets are required before the sector boss can spawn.',
          targetAmount:eliteTarget,
          currentAmount:0,
          completed:false,
          params:{ tag:'missionTarget' },
          tags:['hunt','combat','elite','missionTarget']
        }),
        createObjective({
          id:'hunt_bonus_kills',
          type:'killEnemyType',
          objectiveType:'secondary',
          optional:true,
          displayName:`Cull ${killTarget} Hollowborn`,
          description:'Bonus Hunt objective. Kill additional enemies for an end-of-run bonus later.',
          targetAmount:killTarget,
          currentAmount:0,
          completed:false,
          reward:{ xp:25, resources:{ voltarite:2 } },
          params:{ enemyType:'any' },
          tags:['hunt','bonus','combat']
        })
      ];
    },
    track:(g,dt)=>{},
    isComplete:g=> typeof allPrimaryObjectivesComplete === 'function' ? allPrimaryObjectivesComplete(g) : !!normaliseObjectives(g).find(o=>o.id==='hunt_elites' && o.completed),
    bonusObjectives:[
      { id:'bonus_extra_ore', desc:'Mine 20 extra ore', reward:{ gild:5 }, check:g=>g.runStats.blocksMined > (g.objectives.find(o=>o.type==='mineBlocks')?.targetAmount || 0) + 20 },
      { id:'bonus_extra_kills', desc:'Kill 10 extra enemies', reward:{ voltarite:2 }, check:g=>g.kills > (g.objectives.find(o=>o.id==='hunt_elites' || o.id==='hunt_kills')?.targetAmount || 0) + 10 },
      { id:'bonus_speed_run', desc:'Complete in under 5 minutes', reward:{ aetherQuartz:1 }, check:g=>g.time < 300 },
      { id:'bonus_echo_collector', desc:'Collect 50 Echo Shards', reward:{ echo:50 }, check:g=>g.objectiveEchoCollected >= 50 }
    ]
  },
  {
    id:'survey',
    name:'Survey',
    icon:'🔍',
    description:'Reveal and map uncharted cave sectors. Exploration and fog-of-war management matter most.',
    rewardModifier:1.10,
    generateObjectives:(profile,g)=>{
      const missionIndex=g.missionIndex||profile.missionIndex||1;
      const primaryRelics=3;
      const secondaryPct=Math.min(50, 24 + missionIndex*2);
      return [
        createObjective({
          id:'survey_scan_relics',
          type:'scanMissionPoi',
          objectiveType:'primary',
          optional:false,
          displayName:`🔍 Scan ${primaryRelics} Echo Relics`,
          description:'Primary Survey objective. Stand near each Echo Relic until the scan completes before the boss can spawn.',
          targetAmount:primaryRelics,
          currentAmount:0,
          completed:false,
          params:{ poiType:'echoRelic', scanCount:primaryRelics },
          tags:['survey','exploration','scan','echoRelic']
        }),
        createObjective({
          id:'survey_bonus_reveal',
          type:'revealMapPercent',
          objectiveType:'secondary',
          optional:true,
          displayName:`Chart ${secondaryPct}% of the cave`,
          description:'Bonus Survey objective. Reveal a larger portion of the cave for a future bonus reward.',
          targetAmount:secondaryPct,
          currentAmount:0,
          completed:false,
          reward:{ xp:30, resources:{ echo:35 } },
          params:{ percent:secondaryPct },
          tags:['survey','bonus','exploration','fog']
        })
      ];
    },
    track:(g,dt)=>{
      if(typeof progressRevealMapPercentObjectives === 'function') progressRevealMapPercentObjectives(g,dt);
      else {
        // Safe legacy fallback: count the tile under the player if the richer
        // reveal helper is not available for any reason.
        if(!g._tilesRevealed) g._tilesRevealed=new Set();
        const [tx,ty]=worldToTile(g.player.x,g.player.y);
        const key=tx+','+ty;
        if(!g._tilesRevealed.has(key)){
          g._tilesRevealed.add(key);
          const percent=(g._tilesRevealed.size/(MAP_W*MAP_H))*100;
          for(const o of normaliseObjectives(g).filter(o=>o.type==='revealMapPercent' && !o.completed && !o.failed)){
            if(percent>o.currentAmount && typeof addObjectiveProgress === 'function') addObjectiveProgress(g,o.id,percent-o.currentAmount);
          }
        }
      }
    },
    isComplete:g=> typeof allPrimaryObjectivesComplete === 'function' ? allPrimaryObjectivesComplete(g) : !!normaliseObjectives(g).find(o=>(o.id==='survey_scan_relics' || o.id==='survey_reveal_primary') && o.completed),
    bonusObjectives:[
      { id:'bonus_extra_ore', desc:'Mine 20 extra ore', reward:{ gild:5 }, check:g=>g.runStats.blocksMined > (g.objectives.find(o=>o.type==='mineBlocks')?.targetAmount || 0) + 20 },
      { id:'bonus_extra_kills', desc:'Kill 10 extra enemies', reward:{ voltarite:2 }, check:g=>g.kills > 10 },
      { id:'bonus_speed_run', desc:'Complete in under 5 minutes', reward:{ aetherQuartz:1 }, check:g=>g.time < 300 },
      { id:'bonus_echo_collector', desc:'Collect 50 Echo Shards', reward:{ echo:50 }, check:g=>g.objectiveEchoCollected >= 50 }
    ]
  },
  {
    id:'harvest',
    name:'Harvest',
    icon:'⛏️',
    description:'Extract a focused rare-resource quota. Greed and mining route choices define the run.',
    rewardModifier:1.20,
    generateObjectives:(profile,g)=>{
      const diff=missionDifficulty(g.missionIndex||profile.missionIndex);
      const pool=['voltarite','ferriteBark','luminaSpores','aetherQuartz','crysalith','emberglass'];
      const rareRes=pool[((g.missionIndex||1)+(g.runIndex||1)-2) % pool.length];
      const mineral=MINERALS[rareRes];
      const rareBase=rareRes==='aetherQuartz' ? 5 : 12;
      const rareTarget=Math.max(1, Math.floor(rareBase*diff.objectiveMultiplier));
      const gildTarget=Math.max(45, Math.floor((45+(g.missionIndex||1)*5)*diff.objectiveMultiplier));
      return [
        createObjective({
          id:'harvest_rare_quota',
          type:'collectResourceTag',
          objectiveType:'primary',
          optional:false,
          resourceId:rareRes,
          displayName:`⛏️ Mine marked ${mineral.displayName} veins`,
          description:'Primary Harvest objective. Mine and collect from highlighted target veins before the boss can spawn.',
          targetAmount:rareTarget,
          currentAmount:0,
          completed:false,
          params:{ resourceId:rareRes, tag:'missionHarvestTarget' },
          tags:['harvest','rareOre',rareRes,'missionHarvestTarget']
        }),
        createObjective({
          id:'harvest_bonus_gild',
          type:'collectResource',
          objectiveType:'secondary',
          optional:true,
          resourceId:'gild',
          displayName:`Stockpile ${gildTarget} Gild Shards`,
          description:'Bonus Harvest objective. Gather extra Gild while chasing the rare-resource quota.',
          targetAmount:gildTarget,
          currentAmount:0,
          completed:false,
          reward:{ xp:20, resources:{ gild:25 } },
          params:{ resourceId:'gild' },
          tags:['harvest','bonus','commonOre','gild']
        })
      ];
    },
    track:(g,dt)=>{},
    isComplete:g=> typeof allPrimaryObjectivesComplete === 'function' ? allPrimaryObjectivesComplete(g) : !!normaliseObjectives(g).find(o=>o.id==='harvest_rare_quota' && o.completed),
    bonusObjectives:[
      { id:'bonus_extra_ore', desc:'Mine 20 extra ore', reward:{ gild:5 }, check:g=>g.runStats.blocksMined > (g.objectives.find(o=>o.type==='mineBlocks')?.targetAmount || 0) + 20 },
      { id:'bonus_extra_kills', desc:'Kill 10 extra enemies', reward:{ voltarite:2 }, check:g=>g.kills > 10 },
      { id:'bonus_speed_run', desc:'Complete in under 5 minutes', reward:{ aetherQuartz:1 }, check:g=>g.time < 300 },
      { id:'bonus_echo_collector', desc:'Collect 50 Echo Shards', reward:{ echo:50 }, check:g=>g.objectiveEchoCollected >= 50 }
    ]
  },
  {
    id:'holdout',
    name:'Holdout',
    icon:'🛡️',
    description:'Survive a timed pressure window. Area control and endurance define the run.',
    rewardModifier:1.25,
    generateObjectives:(profile,g)=>{
      const diff=missionDifficulty(g.missionIndex||profile.missionIndex);
      const baseTime=90 + (g.missionIndex||1)*10;
      const target=Math.floor(baseTime*diff.objectiveMultiplier);
      const killTarget=Math.max(24, Math.floor((22+(g.missionIndex||1)*3)*diff.objectiveMultiplier));
      return [
        createObjective({
          id:'holdout_timer',
          type:'defendTargetTimer',
          objectiveType:'primary',
          optional:false,
          displayName:`🛡️ Defend the drill for ${target}s`,
          description:'Primary Holdout objective. Keep the beacon drill alive until the timer completes before the boss can spawn.',
          targetAmount:target,
          currentAmount:0,
          completed:false,
          params:{ seconds:target, targetId:'holdout_drill' },
          tags:['holdout','defence','timer','drill']
        }),
        createObjective({
          id:'holdout_bonus_kills',
          type:'killEnemyType',
          objectiveType:'secondary',
          optional:true,
          displayName:`Repel ${killTarget} enemies during holdout`,
          description:'Bonus Holdout objective. Thin the attacking swarm while surviving the timer.',
          targetAmount:killTarget,
          currentAmount:0,
          completed:false,
          reward:{ xp:25, resources:{ aetherQuartz:1 } },
          params:{ enemyType:'any' },
          tags:['holdout','bonus','combat']
        })
      ];
    },
    track:(g,dt)=>{
      // Holdout timer progress is now owned by updateHoldoutDefenceTarget()
      // so it can depend on the drill/beacon being alive.
      if(!g.defenceTarget && typeof progressSurviveTimerObjectives === 'function') progressSurviveTimerObjectives(g,dt);
    },
    isComplete:g=> typeof allPrimaryObjectivesComplete === 'function' ? allPrimaryObjectivesComplete(g) : !!normaliseObjectives(g).find(o=>o.id==='holdout_timer' && o.completed),
    bonusObjectives:[
      { id:'bonus_extra_ore', desc:'Mine 20 extra ore', reward:{ gild:5 }, check:g=>g.runStats.blocksMined > (g.objectives.find(o=>o.type==='mineBlocks')?.targetAmount || 0) + 20 },
      { id:'bonus_extra_kills', desc:'Kill 10 extra enemies', reward:{ voltarite:2 }, check:g=>g.kills > 10 },
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

function createDefaultOperatorData(){
  return {
    bulwark:   { level: 1, xp: 0, xpToNext: 100, prestige: 0 },
    pathfinder: { level: 1, xp: 0, xpToNext: 100, prestige: 0 },
    borecaster: { level: 1, xp: 0, xpToNext: 100, prestige: 0 }
  };
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
    operatorData:createDefaultOperatorData(),
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
    },
    runHistory: [],
    bestRuns: {
      mostKills: null,
      fastestExtraction: null,
      mostResources: null,
      highestOperatorLevel: null,
      deepestDepth: null
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
    operatorData:{
      ...createDefaultOperatorData(),
      ...(profile?.operatorData || {}),
      bulwark:{...base.operatorData.bulwark, ...(profile?.operatorData?.bulwark || {})},
      pathfinder:{...base.operatorData.pathfinder, ...(profile?.operatorData?.pathfinder || {})},
      borecaster:{...base.operatorData.borecaster, ...(profile?.operatorData?.borecaster || {})}
    },
    milestones:{...base.milestones,...(profile?.milestones || {})},
    unlockedSynergies:profile?.unlockedSynergies || [],
    permanentBonuses:profile?.permanentBonuses || {},
    statistics:{...base.statistics,...(profile?.statistics || {})},
    runHistory:profile?.runHistory || [],
    bestRuns:{...base.bestRuns, ...(profile?.bestRuns || {})}
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
  // Phase 1.5: Apply prestige bonuses.
  const pb = saveProfile.permanentBonuses || {};
  if(pb.hpBonus > 0){
    p.maxHp = Math.round(p.maxHp + pb.hpBonus);
    p.hp = p.maxHp;
  }
  if(pb.bulwarkDamageBonus){
    p.damageMul *= (1 + pb.bulwarkDamageBonus);
  }
  if(pb.pathfinderSpeedBonus){
    p.speedMul *= (1 + pb.pathfinderSpeedBonus);
  }
  if(pb.borecasterMiningSpeedBonus){
    p.mineMul *= (1 + pb.borecasterMiningSpeedBonus);
  }
  if(pb.borecasterHeatCapacityBonus){
    p.maxHeat += pb.borecasterHeatCapacityBonus;
  }
  if(pb.pathfinderDashCooldown){
    p.dashCdReduction = (p.dashCdReduction || 0) + pb.pathfinderDashCooldown;
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
 * Phase 1.5 — Operator XP & Prestige
 *
 * gainOperatorXP — Accumulate operator XP and handle level-up.
 * Called from killEnemy(), mineTile(), and gainXp() hooks.
 */
function gainOperatorXP(g, amount){
  if(!saveProfile || !g || !g.player) return;
  const classId = g.player.classId;
  const data = saveProfile.operatorData?.[classId];
  if(!data) return;
  const multiplier = g.player.operatorXPMultiplier || 1;
  const adjusted = Math.round(amount * multiplier);
  if(adjusted <= 0) return;
  data.xp += adjusted;
  if(g.runStats) g.runStats.operatorXPGained = (g.runStats.operatorXPGained || 0) + adjusted;
  let leveledUp = false;
  while(data.xp >= data.xpToNext && data.level < OPERATOR_MAX_LEVEL){
    data.xp -= data.xpToNext;
    data.level++;
    data.xpToNext = Math.floor(data.xpToNext * 1.25 + 30);
    leveledUp = true;
    if(typeof log === 'function') log(g, `✦ ${g.selectedClass?.name || classId} reached operator level ${data.level}!`);
    if(typeof sfx === 'function') sfx('level');
    if(data.level % 5 === 0 && typeof log === 'function'){
      log(g, `★ Milestone: Operator ${classId} reached level ${data.level}!`);
    }
    if(typeof checkMilestoneOnOperatorLevelUp === 'function') checkMilestoneOnOperatorLevelUp(g);
  }
  saveGame();
  if(leveledUp) updateUI(g);
}

/*
 * prestigeOperator — Prestige the current run's operator class.
 * Called from the in-game menu or directly with a game context.
 * Returns true if prestige was successful.
 */
function prestigeOperator(g){
  if(!saveProfile || !g || !g.player) return false;
  const classId = g.player.classId;
  const data = saveProfile.operatorData?.[classId];
  if(!data) return false;
  if(data.level < OPERATOR_MAX_LEVEL) return false;
  if(data.prestige >= 10) return false; // Prestige cap
  data.prestige++;
  data.level = 1;
  data.xp = 0;
  data.xpToNext = 100;
  // Apply the corresponding prestige bonus
  const bonus = PRESTIGE_BONUSES[classId];
  if(bonus){
    saveProfile.permanentBonuses = saveProfile.permanentBonuses || {};
    if(bonus.hpBonus) saveProfile.permanentBonuses.hpBonus = (saveProfile.permanentBonuses.hpBonus || 0) + bonus.hpBonus;
    if(bonus.damageBonus) saveProfile.permanentBonuses.bulwarkDamageBonus = (saveProfile.permanentBonuses.bulwarkDamageBonus || 0) + bonus.damageBonus;
    if(bonus.speedBonus) saveProfile.permanentBonuses.pathfinderSpeedBonus = (saveProfile.permanentBonuses.pathfinderSpeedBonus || 0) + bonus.speedBonus;
    if(bonus.dashCooldown) saveProfile.permanentBonuses.pathfinderDashCooldown = (saveProfile.permanentBonuses.pathfinderDashCooldown || 0) + bonus.dashCooldown;
    if(bonus.miningSpeedBonus) saveProfile.permanentBonuses.borecasterMiningSpeedBonus = (saveProfile.permanentBonuses.borecasterMiningSpeedBonus || 0) + bonus.miningSpeedBonus;
    if(bonus.heatCapacityBonus) saveProfile.permanentBonuses.borecasterHeatCapacityBonus = (saveProfile.permanentBonuses.borecasterHeatCapacityBonus || 0) + bonus.heatCapacityBonus;
  }
  if(typeof log === 'function') log(g, `✦ PRESTIGE! ${g.selectedClass?.name || classId} is now Prestige ${data.prestige}.`);
  if(typeof sfx === 'function') sfx('level');
  // Re-apply permanent upgrades so prestige bonuses take effect immediately
  if(typeof applyPermanentUpgrades === 'function') applyPermanentUpgrades(g);
  if(typeof checkMilestoneOnPrestige === 'function') checkMilestoneOnPrestige(g);
  saveGame();
  updateUI(g);
  return true;
}

/*
 * prestigeOperatorFromMenu — Prestige an operator from the main menu.
 * No game context needed. After prestige, refreshes the main menu.
 */
function prestigeOperatorFromMenu(classId){
  if(!saveProfile) return false;
  const data = saveProfile.operatorData?.[classId];
  if(!data) return false;
  if(data.level < OPERATOR_MAX_LEVEL) return false;
  if(data.prestige >= 10) return false;
  data.prestige++;
  data.level = 1;
  data.xp = 0;
  data.xpToNext = 100;
  const bonus = PRESTIGE_BONUSES[classId];
  if(bonus){
    saveProfile.permanentBonuses = saveProfile.permanentBonuses || {};
    if(bonus.hpBonus) saveProfile.permanentBonuses.hpBonus = (saveProfile.permanentBonuses.hpBonus || 0) + bonus.hpBonus;
    if(bonus.damageBonus) saveProfile.permanentBonuses.bulwarkDamageBonus = (saveProfile.permanentBonuses.bulwarkDamageBonus || 0) + bonus.damageBonus;
    if(bonus.speedBonus) saveProfile.permanentBonuses.pathfinderSpeedBonus = (saveProfile.permanentBonuses.pathfinderSpeedBonus || 0) + bonus.speedBonus;
    if(bonus.dashCooldown) saveProfile.permanentBonuses.pathfinderDashCooldown = (saveProfile.permanentBonuses.pathfinderDashCooldown || 0) + bonus.dashCooldown;
    if(bonus.miningSpeedBonus) saveProfile.permanentBonuses.borecasterMiningSpeedBonus = (saveProfile.permanentBonuses.borecasterMiningSpeedBonus || 0) + bonus.miningSpeedBonus;
    if(bonus.heatCapacityBonus) saveProfile.permanentBonuses.borecasterHeatCapacityBonus = (saveProfile.permanentBonuses.borecasterHeatCapacityBonus || 0) + bonus.heatCapacityBonus;
  }
  if(typeof checkMilestoneOnPrestige === 'function') checkMilestoneOnPrestige(null);
  saveGame();
  showMainMenu();
  return true;
}

/*
 * renderOperatorProgression — Generates HTML for the operator stats panel
 * in the main menu. Shows level, prestige, XP progress bar, and prestige button.
 */
function renderOperatorProgression(){
  if(!saveProfile) return '';
  const html = Object.entries(saveProfile.operatorData || {}).map(([classId, data]) => {
    const cls = CLASSES.find(c => c.id === classId);
    const clsName = cls?.name || classId;
    const clsIcon = cls?.icon || classId.charAt(0).toUpperCase();
    const xpPct = data.level >= OPERATOR_MAX_LEVEL ? 100 : Math.min(100, Math.floor((data.xp / data.xpToNext) * 100));
    const canPrestige = data.level >= OPERATOR_MAX_LEVEL && data.prestige < 10;
    const prestigeBtn = canPrestige
      ? `<button class="prestigeBtn" onclick="prestigeOperatorFromMenu('${classId}')">PRESTIGE</button>`
      : (data.prestige >= 10 ? '<span class="prestigeMaxed">MAX</span>' : '');
    const iconHtml = cls?.spriteId ? spriteIconHtml(cls.spriteId, clsIcon) : clsIcon;
    return `<div class="operatorProgCard">
      <div class="operatorProgHeader">
        <span class="operatorProgIcon">${iconHtml}</span>
        <span class="operatorProgName">${clsName}</span>
        <span class="operatorProgLevel">Lv.${data.level}/${OPERATOR_MAX_LEVEL}</span>
        <span class="operatorProgPrestige">Prestige: ${data.prestige}</span>
        ${prestigeBtn}
      </div>
      <div class="operatorProgBarWrap"><div class="operatorProgBar" style="width:${xpPct}%"></div></div>
      <div class="operatorProgXP">${Math.floor(data.xp)} / ${data.xpToNext} XP</div>
    </div>`;
  }).join('');
  return `<div class="operatorProgression"><h3>Operator Progression</h3>${html}</div>`;
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

/* Called from gainOperatorXP() after level-up — checks operator level milestones. */
function checkMilestoneOnOperatorLevelUp(g){
  if(!saveProfile) return;
  const opIds=['OpLevel10','OpLevel20'];
  for(const id of opIds){
    const m=MILESTONES.find(x=>x.id===id);
    if(!m) continue;
    const entry=saveProfile.milestones[id];
    if(entry && !entry.unlocked && m.check(saveProfile)) awardMilestone(g,id);
  }
}

/* Called from prestigeOperatorFromMenu() or prestigeOperator() — checks prestige milestones. */
function checkMilestoneOnPrestige(g){
  if(!saveProfile) return;
  const prestigeIds=['FirstPrestige','MaxPrestige'];
  for(const id of prestigeIds){
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
    result.push(createObjective({ id:`collect_${resourceId}`, type:'collectResource', resourceId, displayName:`Collect ${target} ${mineral.displayName}`, targetAmount:target, currentAmount:0, completed:false }));
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

/*
 * Phase 1.6 — Run History / Hall of Records
 *
 * saveRunRecord — Persist a completed/failed run to the profile's runHistory.
 * Called from completeRun() and failRun() after run resolution.
 */
function saveRunRecord(g, success){
  if(!saveProfile || !g) return;
  const stats = g.runStats || {};
  const resources = {};
  // Collate resources from g.resources into a flat record
  const resMap = g.resources || {};
  for(const [id, val] of Object.entries(resMap)){
    if(val > 0) resources[id] = Math.floor(val);
  }
  // Also capture collectible resources from runStats if available
  if(stats.resourcesCollected){
    for(const [id, val] of Object.entries(stats.resourcesCollected)){
      resources[id] = (resources[id] || 0) + Math.floor(val);
    }
  }
  const record = {
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    classId: g.player?.classId || g.selectedClass?.id || 'unknown',
    missionType: g.missionType || null,
    missionIndex: saveProfile.missionIndex || 1,
    runIndex: saveProfile.runIndex || 1,
    success: !!success,
    duration: g.time || stats.durationSec || 0,
    kills: g.kills || stats.enemiesKilled || 0,
    elitesKilled: stats.elitesKilled || 0,
    bossesKilled: stats.bossesKilled || 0,
    resources: resources,
    operatorXP: stats.operatorXPGained || 0,
    operatorLevel: saveProfile.operatorData?.[g.player?.classId]?.level || 1,
    playerLevel: g.level || stats.playerLevelMax || 1,
    depth: Math.floor((g.time || 0) * 1.6),
    damageDealt: Math.round(stats.damageDealt || 0),
    damageTaken: Math.round(stats.damageTaken || 0),
    blocksMined: stats.blocksMined || 0
  };
  saveProfile.runHistory.push(record);
  // Keep max 20 entries, remove oldest
  if(saveProfile.runHistory.length > 20){
    saveProfile.runHistory = saveProfile.runHistory.slice(-20);
  }
  updateBestRuns(record);
  saveGame();
}

/*
 * updateBestRuns — Compare a new run record against current bests and update.
 */
function updateBestRuns(record){
  if(!saveProfile || !record) return;
  const br = saveProfile.bestRuns;

  // mostKills
  if(!br.mostKills || record.kills > br.mostKills.kills){
    br.mostKills = record;
  }

  // fastestExtraction (successful runs only, shortest duration)
  if(record.success && (!br.fastestExtraction || record.duration < br.fastestExtraction.duration)){
    br.fastestExtraction = record;
  }

  // mostResources
  const totalRes = Object.values(record.resources || {}).reduce((a, b) => a + b, 0);
  const prevTotal = br.mostResources ? Object.values(br.mostResources.resources || {}).reduce((a, b) => a + b, 0) : 0;
  if(!br.mostResources || totalRes > prevTotal){
    br.mostResources = record;
  }

  // highestOperatorLevel
  if(!br.highestOperatorLevel || record.operatorLevel > br.highestOperatorLevel.operatorLevel){
    br.highestOperatorLevel = record;
  }

  // deepestDepth
  if(!br.deepestDepth || record.depth > br.deepestDepth.depth){
    br.deepestDepth = record;
  }
}

/*
 * renderHallOfRecords — Generates HTML for the Hall of Records menu content.
 */
function renderHallOfRecords(){
  if(!saveProfile) return '<p>No profile data available.</p>';
  const history = saveProfile.runHistory || [];
  const best = saveProfile.bestRuns || {};

  // ── Best Runs Section ──
  const bestCategories = [
    { key:'mostKills',         label:'Most Kills',         icon:'⚔️',  value:r=>`${r.kills} kills`,                   classId:r=>r.classId },
    { key:'fastestExtraction', label:'Fastest Extraction', icon:'⏱️',  value:r=>formatDuration(r.duration),           classId:r=>r.classId, filter:r=>r.success },
    { key:'mostResources',     label:'Most Resources',     icon:'💎',  value:r=>{const t=Object.values(r.resources||{}).reduce((a,b)=>a+b,0); return `${t} total`;}, classId:r=>r.classId },
    { key:'highestOperatorLevel', label:'Best Operator',   icon:'⭐',  value:r=>`Lv.${r.operatorLevel}`,              classId:r=>r.classId },
    { key:'deepestDepth',      label:'Deepest Descent',    icon:'🕳️', value:r=>`${r.depth}m`,                         classId:r=>r.classId }
  ];

  let bestHtml = '<div class="bestRunsGrid">';
  for(const cat of bestCategories){
    const record = best[cat.key];
    const cls = record ? CLASSES.find(c => c.id === record.classId) : null;
    const iconHtml = cls?.spriteId ? spriteIconHtml(cls.spriteId, cls.icon) : (cls?.icon || '❓');
    if(record && (!cat.filter || cat.filter(record))){
      const dateStr = record.timestamp ? new Date(record.timestamp).toLocaleDateString() : '';
      bestHtml += `<div class="bestRunCard">
        <div class="bestRunIcon">${cat.icon}</div>
        <div class="bestRunInfo">
          <div class="bestRunLabel">${cat.label}</div>
          <div class="bestRunValue">${cat.value(record)}</div>
          <div class="bestRunMeta">${iconHtml} ${cls?.name || record.classId} &middot; ${dateStr}</div>
        </div>
      </div>`;
    } else {
      bestHtml += `<div class="bestRunCard bestRunEmpty">
        <div class="bestRunIcon">${cat.icon}</div>
        <div class="bestRunInfo">
          <div class="bestRunLabel">${cat.label}</div>
          <div class="bestRunValue">—</div>
          <div class="bestRunMeta">No record yet</div>
        </div>
      </div>`;
    }
  }
  bestHtml += '</div>';

  // ── Recent Runs Section ──
  let recentHtml = '<h3>Recent Runs</h3>';
  if(!history.length){
    recentHtml += '<p class="emptyState">No runs completed yet. Descend into the Echo Vein to start building your record.</p>';
  } else {
    const reversed = [...history].reverse();
    recentHtml += '<div class="recentRunsTableWrap"><table class="recentRunsTable">';
    recentHtml += '<thead><tr><th>#</th><th>Class</th><th>Mission</th><th>Result</th><th>Duration</th><th>Kills</th><th>Resources</th><th>Op Lv</th><th>Depth</th><th>Date</th></tr></thead><tbody>';
    for(let i = 0; i < reversed.length; i++){
      const r = reversed[i];
      const cls = CLASSES.find(c => c.id === r.classId);
      const clsIcon = cls?.icon || '?';
      const totalRes = Object.values(r.resources || {}).reduce((a, b) => a + b, 0);
      const dateStr = r.timestamp ? new Date(r.timestamp).toLocaleDateString() : '—';
      const resultClass = r.success ? 'resultSuccess' : 'resultFail';
      const resultText = r.success ? '✓ Extract' : '✗ Failed';
      const missionName = r.missionType || '—';
      recentHtml += `<tr class="${r.success ? 'rowSuccess' : 'rowFail'}">
        <td>${history.length - i}</td>
        <td>${clsIcon} ${cls?.name || r.classId}</td>
        <td>${missionName}</td>
        <td class="${resultClass}">${resultText}</td>
        <td>${formatDuration(r.duration)}</td>
        <td>${r.kills}</td>
        <td>${totalRes}</td>
        <td>${r.operatorLevel}</td>
        <td>${r.depth}m</td>
        <td>${dateStr}</td>
      </tr>`;
    }
    recentHtml += '</tbody></table></div>';
  }

  return `<div class="hallOfRecords">${bestHtml}${recentHtml}</div>`;
}

/*
 * showHallOfRecords — Renders the Hall of Records menu.
 */
function showHallOfRecords(){
  appState = 'HALL_OF_RECORDS';
  setMenu('Hall of Records', 'Review your past descents and best achievements.');
  ui.menuMeta.innerHTML = `<div class="menuStats"><span>Total Runs <b>${saveProfile?.runHistory?.length || 0}</b></span><span>Successful <b>${(saveProfile?.runHistory || []).filter(r=>r.success).length}</b></span><span>Failed <b>${(saveProfile?.runHistory || []).filter(r=>!r.success).length}</b></span></div>`;
  ui.menuContent.innerHTML = renderHallOfRecords();
  // Clear history button
  const clearBtn = document.createElement('button');
  clearBtn.className = 'clearHistoryBtn';
  clearBtn.textContent = '🗑️ Clear History';
  clearBtn.title = 'Remove all run records and best run data. This cannot be undone.';
  clearBtn.onclick = () => {
    if(confirm('Clear all run history and best records? This cannot be undone.')){
      saveProfile.runHistory = [];
      saveProfile.bestRuns = {
        mostKills: null,
        fastestExtraction: null,
        mostResources: null,
        highestOperatorLevel: null,
        deepestDepth: null
      };
      saveGame();
      showHallOfRecords();
    }
  };
  ui.menuContent.appendChild(clearBtn);
  addMenuButton('Back', showMainMenu);
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
  // Phase 1.6: Save run record for successful extraction.
  if(typeof saveRunRecord === 'function') saveRunRecord(g, true);
  saveGame();
  if(typeof showRunStatsScreen==='function') showRunStatsScreen(g,{title:missionCompleted ? 'Mission Complete' : 'Run Extracted', cause:missionCompleted ? 'Mission completed' : 'Extracted'});
  else showRunComplete(g, missionCompleted);
}

function failRun(g,reason){
  if(g.runResolved) return;
  g.runResolved=true;
  g.state='failed';
  // Phase 1.6: Save run record for failure.
  if(typeof saveRunRecord === 'function') saveRunRecord(g, false);
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
    game.objectives = (selectedMissionType.generateObjectives(saveProfile, game) || []).map(normaliseObjective);
    // World hook setup is optional and load-order safe. It gives each mission
    // a physical anchor without touching viewport/input/menu systems.
    if(typeof initialiseMissionWorldHooks === 'function') initialiseMissionWorldHooks(game);
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
  // Phase 1.5: Operator Progression section
  ui.menuContent.innerHTML = renderOperatorProgression();
  addMenuButton('Play',showMissionSelect);
  addMenuButton('Upgrades',showUpgradesMenu);
  addMenuButton('Synergies',showSynergiesMenu);
  //addMenuButton('Gears',()=>showPlaceholderMenu('Gears','Gears feature coming later.'));
  addMenuButton('Milestones',showMilestonesMenu);
  addMenuButton('Hall of Records',showHallOfRecords);
  addMenuButton('Settings',showSettingsMenu);
  addMenuButton('How to Play', showHelpMenu);
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
  ui.menuContent.innerHTML='<p>Game Design: Alessandro and Dylan<br>Studio: King Peng Studio<br>Prototype Development:HTML/JavaScript prototype - June 2026</p>';
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

/*
 * How to Play / Help Menu
 */
function showHelpMenu() {
  appState = 'HELP_MENU';
  setMenu('How to Play', 'Everything you need to know to survive the Echo Vein.');

  const container = document.createElement('div');
  container.className = 'helpContent';

  // Goal
  const goal = document.createElement('section');
  goal.className = 'helpSection';
  goal.innerHTML = `
    <h3>🎯 Your Goal</h3>
    <p>Descend into the procedurally generated caves of the Echo Vein. Mine valuable resources (<strong>Gild Shards</strong>, <strong>Voltarite</strong>, <strong>Echo Shards</strong>, and rare ores), fight off the Hollowborn, complete your mission objectives, defeat the Sector Boss, and <strong>reach the extraction craft</strong> to bank your haul.</p>
    <p>Every run makes you stronger through permanent upgrades, operator prestige, and milestone rewards.</p>
  `;
  container.appendChild(goal);

  // Operators
  const ops = document.createElement('section');
  ops.className = 'helpSection';
  ops.innerHTML = `<h3>🛡️ Operators</h3><div class="helpGrid">`;
  for (const cls of CLASSES) {
    const iconHtml = cls.spriteId ? spriteIconHtml(cls.spriteId, cls.icon) : cls.icon;
    ops.innerHTML += `
      <div class="helpOperatorCard">
        <div class="helpOpIcon">${iconHtml}</div>
        <div class="helpOpInfo">
          <h4>${cls.name}</h4>
          <p>${cls.desc}</p>
          <span class="tag">${cls.tag}</span>
        </div>
      </div>
    `;
  }
  ops.innerHTML += `</div>`;
  container.appendChild(ops);

  // Controls
  const controls = document.createElement('section');
  controls.className = 'helpSection';
  controls.innerHTML = `
    <h3>🎮 Controls</h3>
    <div class="controlGrid">
      <div class="controlGroup">
        <h4>Keyboard & Mouse</h4>
        <div class="controlItem"><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> / <kbd>Arrows</kbd> — Move</div>
        <div class="controlItem"><kbd>Space</kbd> / <kbd>Y</kbd> — Dash</div>
        <div class="controlItem"><kbd>E</kbd> — Place Trap (Pathfinder)</div>
        <div class="controlItem"><kbd>LMB</kbd> / <kbd>X</kbd> — Primary Fire</div>
        <div class="controlItem"><kbd>RMB</kbd> / <kbd>B</kbd> — Arc Connection / Secondary</div>
        <div class="controlItem"><kbd>P</kbd> — Pause</div>
        <div class="controlItem"><kbd>R</kbd> — Restart Run</div>
        <div class="controlItem"><kbd>M</kbd> — Mute Sound</div>
      </div>
      <div class="controlGroup">
        <h4>🎮 Gamepad</h4>
        <div class="controlItem"><strong>Left Stick</strong> — Move</div>
        <div class="controlItem"><strong>Right Stick</strong> — Aim Cursor</div>
        <div class="controlItem"><strong>A</strong> — Trap (Pathfinder)</div>
        <div class="controlItem"><strong>X</strong> — Primary Fire</div>
        <div class="controlItem"><strong>B</strong> — Arc / Secondary</div>
        <div class="controlItem"><strong>Y</strong> — Dash</div>
        <div class="controlItem"><strong>D-Pad / Left Stick</strong> — Menu Navigation</div>
      </div>
    </div>
  `;
  container.appendChild(controls);

  // Mechanics
  const mechanics = document.createElement('section');
  mechanics.className = 'helpSection';
  mechanics.innerHTML = `
    <h3>⚙️ Core Mechanics</h3>
    <div class="mechanicsGrid">
      <div class="mechCard">
        <span class="mechIcon">⛏️</span>
        <h4>Mining & Heat</h4>
        <p>Mine tiles by walking into them. Your tool generates <strong>Heat</strong> – let it cool or overheat and lose efficiency. Upgrade your tool to mine faster.</p>
      </div>
      <div class="mechCard">
        <span class="mechIcon">💎</span>
        <h4>Resources</h4>
        <p>Collect <strong>Gild</strong>, <strong>Voltarite</strong>, <strong>Echo</strong>, and rare ores. Spend them on permanent upgrades or convert them in the main menu.</p>
      </div>
      <div class="mechCard">
        <span class="mechIcon">⭐</span>
        <h4>Operator Prestige</h4>
        <p>Reach <strong>Level 20</strong> with an operator to Prestige. Reset to Level 1 and earn <strong>permanent stacking bonuses</strong> (HP, damage, speed, mining, heat capacity).</p>
      </div>
      <div class="mechCard">
        <span class="mechIcon">🚀</span>
        <h4>Extraction</h4>
        <p>Complete your mission objectives, defeat the boss, then reach the extraction craft before the timer runs out. <strong>Success = banked resources</strong>.</p>
      </div>
    </div>
  `;
  container.appendChild(mechanics);

  ui.menuContent.appendChild(container);
  addMenuButton('Back', showMainMenu);
}

window.showMainMenu=showMainMenu;
window.MISSION_TYPES=MISSION_TYPES;
window.selectedMissionType=selectedMissionType;
window.SYNERGIES=SYNERGIES;
window.checkSynergies=checkSynergies;
window.applySynergyRewards=applySynergyRewards;
window.showSynergiesMenu=showSynergiesMenu;
window.convertResources=convertResources;
window.gainOperatorXP=gainOperatorXP;
window.prestigeOperator=prestigeOperator;
window.prestigeOperatorFromMenu=prestigeOperatorFromMenu;
window.checkMilestoneOnOperatorLevelUp=checkMilestoneOnOperatorLevelUp;
window.checkMilestoneOnPrestige=checkMilestoneOnPrestige;
window.showHallOfRecords=showHallOfRecords;
window.saveRunRecord=saveRunRecord;
window.renderHallOfRecords=renderHallOfRecords;
