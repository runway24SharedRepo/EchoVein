'use strict';

/* Player/enemy classes and game-state factory. */

class Player {
  constructor(cls){
    this.x = WORLD_W/2; this.y = WORLD_H/2;
    this.r = 15;
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
    this.dashCd = 0;
    this.dashT = 0;
    this.lastDx = 1; this.lastDy = 0;
    this.miningProgress = 0;
    this.miningTile = -1;
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
  }
}

const ENEMY_TYPES = {
  grunt: { r: 13, hp: 24, speed: 92, damage: 13, xp: 4, color:'#8aff6c' },
  swarmer: { r: 8, hp: 10, speed: 145, damage: 6, xp: 2, color:'#c8ff5c' },
  guard: { r: 18, hp: 68, speed: 66, damage: 22, xp: 12, color:'#ffb84d' },
  exploder: { r: 15, hp: 34, speed: 115, damage: 30, xp: 8, color:'#ff5b5b' },
  elite: { r: 28, hp: 260, speed: 70, damage: 36, xp: 45, color:'#b46bff' }
};

function makeGame(cls){
  const g = {
    state:'playing',
    player:new Player(cls),
    tiles:new Uint8Array(MAP_W*MAP_H),
    tileHp:new Float32Array(MAP_W*MAP_H),
    enemies:[], bullets:[], boomerangs:[], wardenDrones:[], sifterDrones:[], traps:[], arcs:[], pickups:[], particles:[], texts:[], waves:[],
    weapons:[],
    arcConnection:{ unlocked:false, level:0, maxTargets:0, selectedEnemies:[], flash:0 },
    time:0, kills:0, level:1, xp:0, xpNeed:28, gold:0, nitra:0,
    spawnTimer:0, eliteTimer:75, nextWave:0,
    camera:{x:0,y:0},
    log:['Mission started. Descend, extract, survive.'],
    selectedClass:cls
  };
  generateCave(g);
  addOrLevelWeapon(g, cls.weapon);
  if(cls.id === 'pathfinder'){
    g.player.dashCd = -1;
    log(g, 'Pathfinder Trap Kit ready. Press E to place seismic traps.');
  }
  return g;
}
