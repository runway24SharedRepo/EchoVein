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
    const cfg = ENEMY_TYPES[type];
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
  grunt: { r: 13, hp: 24, speed: 92, damage: 13, xp: 4, color:'#8aff6c' },
  swarmer: { r: 8, hp: 10, speed: 145, damage: 6, xp: 2, color:'#c8ff5c' },
  guard: { r: 18, hp: 68, speed: 66, damage: 22, xp: 12, color:'#ffb84d' },
  exploder: { r: 15, hp: 34, speed: 115, damage: 30, xp: 8, color:'#ff5b5b' },
  hexShard: { r: 16, hp: 54, speed: 98, damage: 14, xp: 14, color:'#ff7a38', spriteId:'hexShardEnemy', warningSpriteId:'hexShardWarningGlow', projectileSpriteId:'hexBoomerangProjectile' },
  elite: { r: 28, hp: 260, speed: 70, damage: 36, xp: 45, color:'#b46bff', spriteId:'eliteShellbackEnemy' },
  boss: { r: 42, hp: 980, speed: 58, damage: 48, xp: 120, color:'#ff4fd8', spriteId:'hollowTyrantBoss' }
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
    navigationVersion:0,
    debug:{ showEnemyPaths:false, enemyBulletsEnabled:true, showEnemyBulletHitboxes:false, showMiningArc:false, lowSpeedMiningTest:false, showMiningCandidates:true, showEnemyBudget:false, showFogRadius:false, forcePerformanceState:null, perfDespawnLog:false, lavaDamageEnabled:true, showLavaZones:false, showHexRanges:false },
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
