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
    this.operatorLevel = 1;  // overwritten from profile at run start
    this.operatorXPMultiplier = 1;
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
    controllerCursor:{ active:false, screenX:viewW()/2, screenY:viewH()/2, worldX:WORLD_W/2, worldY:WORLD_H/2, lastMoveTime:-999, lastMoveRealTime:-999, primaryHoldTimer:0, axisPair:null },
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
  // Phase 1.5: set operator level from profile.
  if(saveProfile?.operatorData?.[cls.id]){
    g.player.operatorLevel = saveProfile.operatorData[cls.id].level || 1;
  }
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
