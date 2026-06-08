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
    this.displayName = cfg.displayName || this.type;
    this.behavior = cfg.behavior || 'meleeChase';
    this.spriteId = cfg.spriteId || cfg.spriteKey || null;
    this.role = cfg.role || 'normal';
    this.r=cfg.r; this.hp=cfg.hp; this.maxHp=cfg.hp; this.speed=cfg.speed; this.damage=cfg.damage; this.xp=cfg.xp;
    this.color=cfg.color;
    this.hitFlash=0;
    this.slow=0;
    this.phase=Math.random()*Math.PI*2;
    this.path=[];
    this.pathIndex=0;
    this.pathTimer=0;
    this.pathVersion=-1;
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
  elite: { displayName:'Elite Shellback', r: 28, hp: 260, speed: 70, damage: 36, xp: 45, color:'#b46bff', spriteId:'eliteShellbackEnemy', behavior:'eliteShooter', role:'elite' },
  boss: { displayName:'Hollow Tyrant', r: 42, hp: 980, speed: 58, damage: 48, xp: 120, color:'#ff4fd8', spriteId:'hollowTyrantBoss', behavior:'bossShooter', role:'boss' },

  // New sprite-pack enemy roster.
  clawlingRunner: { displayName:'Clawling Runner', spriteId:'clawlingRunner', r:12, hp:18, speed:152, damage:6, xp:2, color:'#8aff6c', behavior:'meleeChase' },
  needleWisp: { displayName:'Needle Wisp', spriteId:'needleWisp', r:10, hp:14, speed:95, damage:4, xp:3, color:'#ff6b6b', behavior:'rangedShooter' },
  shellbackGuard: { displayName:'Shellback Guard', spriteId:'shellbackGuard', r:20, hp:92, speed:58, damage:18, xp:14, color:'#ffb84d', behavior:'meleeChase', role:'elite' },
  blisterPod: { displayName:'Blister Pod', spriteId:'blisterPod', r:16, hp:36, speed:108, damage:28, xp:8, color:'#ff5b5b', behavior:'proximityExploder' },
  hexShardThrower: { displayName:'Hex Shard Thrower', spriteId:'hexShardThrower', warningSpriteId:'hexShardWarningGlow', projectileSpriteId:'hexBoomerangProjectile', r:17, hp:62, speed:102, damage:15, xp:16, color:'#ff7a38', behavior:'hexBoomerangDetonator' },
  sporeMother: { displayName:'Spore Mother', spriteId:'sporeMother', r:23, hp:130, speed:50, damage:10, xp:28, color:'#73ff8a', behavior:'spawner', role:'elite' },
  emberCrawler: { displayName:'Ember Crawler', spriteId:'emberCrawler', r:13, hp:28, speed:138, damage:9, xp:5, color:'#ff7a38', behavior:'meleeChase' },
  crystalLancer: { displayName:'Crystal Lancer', spriteId:'crystalLancer', r:15, hp:52, speed:72, damage:11, xp:12, color:'#73d8ff', behavior:'rangedShooter' },
  voidMite: { displayName:'Void Mite', spriteId:'voidMite', r:9, hp:16, speed:132, damage:8, xp:4, color:'#b46bff', behavior:'blinkChase' },
  acidTick: { displayName:'Acid Tick', spriteId:'acidTick', r:10, hp:18, speed:124, damage:7, xp:4, color:'#98ff55', behavior:'meleeChase' },
  ironMaw: { displayName:'Iron Maw', spriteId:'ironMaw', r:24, hp:170, speed:62, damage:28, xp:26, color:'#b9c2c9', behavior:'charger', role:'elite' },
  stormOrb: { displayName:'Storm Orb', spriteId:'stormOrb', r:15, hp:48, speed:82, damage:9, xp:13, color:'#7df9ff', behavior:'rangedShooter' },
  riftStalker: { displayName:'Rift Stalker', spriteId:'riftStalker', r:14, hp:44, speed:122, damage:16, xp:15, color:'#bd7cff', behavior:'meleeChase' },
  boneSkitter: { displayName:'Bone Skitter', spriteId:'boneSkitter', r:11, hp:20, speed:168, damage:7, xp:5, color:'#e8e0c8', behavior:'zigzagChase' },
  magmaBurrower: { displayName:'Magma Burrower', spriteId:'magmaBurrower', r:18, hp:70, speed:92, damage:18, xp:18, color:'#ff7038', behavior:'meleeChase', role:'elite' },
  echoSiren: { displayName:'Echo Siren', spriteId:'echoSiren', r:18, hp:74, speed:68, damage:8, xp:20, color:'#42d6ff', behavior:'supportBuffer', role:'elite' },
  fractureBeetle: { displayName:'Fracture Beetle', spriteId:'fractureBeetle', r:20, hp:96, speed:92, damage:20, xp:22, color:'#ffcc4d', behavior:'terrainCharger', role:'elite' },
  gloomBat: { displayName:'Gloom Bat', spriteId:'gloomBat', r:11, hp:17, speed:172, damage:7, xp:5, color:'#7980ff', behavior:'flyingChase' },
  obsidianTitan: { displayName:'Obsidian Titan', spriteId:'obsidianTitan', r:34, hp:520, speed:48, damage:42, xp:80, color:'#ff7a38', behavior:'miniBoss', role:'boss' },
  hollowTyrantVariant: { displayName:'Hollow Tyrant Variant', spriteId:'hollowTyrantVariant', r:44, hp:1100, speed:54, damage:52, xp:130, color:'#ff4fd8', behavior:'bossShooter', role:'boss' }
};

function makeGame(cls){
  const g = {
    state:'playing',
    player:new Player(cls),
    tiles:new Uint8Array(MAP_W*MAP_H),
    tileHp:new Float32Array(MAP_W*MAP_H),
    enemies:[], bullets:[], enemyBullets:[], enemyBoomerangs:[], missiles:[], targetLocks:[], boomerangs:[], wardenDrones:[], sifterDrones:[], traps:[], arcs:[], pickups:[], particles:[], texts:[], waves:[],
    weapons:[],
    arcConnection:{ unlocked:false, level:0, maxTargets:0, selectedEnemies:[], flash:0 },
    upgradeMenuState:{ open:false, selectedIndex:0, lastMoveTime:-999, moveRepeatDelay:0.20 },
    controllerCursor:{ active:false, screenX:innerWidth/2, screenY:innerHeight/2, worldX:WORLD_W/2, worldY:WORLD_H/2, lastMoveTime:-999, lastMoveRealTime:-999, primaryHoldTimer:0, axisPair:null },
    navigationVersion:0,
    debug:{ showEnemyPaths:false, enemyBulletsEnabled:true, showEnemyBulletHitboxes:false, showMiningArc:false, lowSpeedMiningTest:false, showMiningCandidates:true, showEnemyBudget:false, showFogRadius:false, forcePerformanceState:null, perfDespawnLog:false, lavaDamageEnabled:true, showLavaZones:false, showHexRanges:false, showController:false, showAccuracyCone:false },
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
    missionDifficulty:saveProfile ? missionDifficulty(saveProfile.missionIndex) : missionDifficulty(1),
    objectives:saveProfile ? currentRunObjectives() : [],
    bossSpawned:false,
    bossDefeated:false,
    extraction:null,
    extractionTimer:0,
    runResolved:false,
    objectiveEchoCollected:0,
    resources:{ gild:0, voltarite:0, echo:0, ferriteBark:0, luminaSpores:0, aetherQuartz:0, crysalith:0, emberglass:0 },
    time:0, kills:0, level:1, xp:0, xpNeed:28, gold:0, nitra:0,
    hollowPressure:0, nextPressureTime:120, pressureFlash:0,
    spawnTimer:2.2, eliteTimer:90, nextWave:55,
    camera:{x:0,y:0},
    log:['Mission started. Descend, extract, survive.'],
    selectedClass:cls
  };
  generateCave(g);
  applyPermanentUpgrades(g);
  addOrLevelWeapon(g, cls.weapon);
  addOrLevelWeapon(g, 'vectorBurst');
  if(cls.id === 'pathfinder'){
    g.player.dashCd = -1;
    log(g, 'Pathfinder Trap Kit ready. Press E to place seismic traps.');
  }
  return g;
}
