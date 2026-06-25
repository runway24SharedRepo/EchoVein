repo: EchoVein

File Structure:
EchoVein/js/core.js
EchoVein/js/progression.js
EchoVein/js/render-ui.js
EchoVein/js/run-stats.js
EchoVein/PROJECT_CONTEXT.md
EchoVein/REPO_CONTEXT.md

EchoVein/js/core.js:
'use strict';

/* Core state, configuration, DOM references, data dictionaries, helpers, and canvas resize. */

const GAME_TITLE = 'Echo Vein';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

// Logical cave tile sizing.  This test build increases every block by 1.5x.
// Set TILE_SIZE_SCALE back to 1.0 for direct A/B comparison with the previous build.
const TILE_SIZE_BASE = 36;
const TILE_SIZE_SCALE = 1;
const TILE = Math.round(TILE_SIZE_BASE * TILE_SIZE_SCALE);
const MAP_W = 96;
const MAP_H = 96;
const WORLD_W = MAP_W * TILE;
const WORLD_H = MAP_H * TILE;

const TILE_EMPTY = 0;
const TILE_ROCK = 1;
const TILE_HARD = 2;
const TILE_GOLD = 3;
const TILE_NITRA = 4;
const TILE_CRYSTAL = 5;
const TILE_LAVA_ROCK = 6;
const TILE_FERRITE_BARK = 7;
const TILE_LUMINA_SPORES = 8;
const TILE_AETHER_QUARTZ = 9;
const TILE_CRYSALITH = 10;
const TILE_EMBERGLASS = 11;

const MINERALS = {
  gild: { id: 'gild', displayName: 'Gild Shards', shortName: 'Gild', color: '#ffcc4d', sprite: 'gildShard' },
  voltarite: { id: 'voltarite', displayName: 'Voltarite', shortName: 'Voltarite', color: '#ff5b5b', sprite: 'voltariteOre' },
  echo: { id: 'echo', displayName: 'Echo Shards', shortName: 'Echo', color: '#42d6ff', sprite: 'echoShard' },
  ferriteBark: { id: 'ferriteBark', displayName: 'Ferrite Bark', shortName: 'Ferrite', color: '#aab3bd', sprite: 'ferriteBark', missionEligible: true, rarity: 'common' },
  luminaSpores: { id: 'luminaSpores', displayName: 'Lumina Spores', shortName: 'Lumina', color: '#5dff9a', sprite: 'luminaSpores', missionEligible: true, rarity: 'uncommon' },
  aetherQuartz: { id: 'aetherQuartz', displayName: 'Aether Quartz', shortName: 'Aether', color: '#b46bff', sprite: 'aetherQuartz', missionEligible: true, rarity: 'rare' },
  crysalith: { id: 'crysalith', displayName: 'Crysalith', shortName: 'Crysalith', color: '#aeefff', sprite: 'crysalithCluster', missionEligible: true, rarity: 'uncommon' },
  emberglass: { id: 'emberglass', displayName: 'Emberglass', shortName: 'Emberglass', color: '#ff9f43', sprite: 'emberglassDeposit', missionEligible: true, rarity: 'uncommon' },
  crust: { id: 'crust', displayName: 'Crust Stone', shortName: 'Crust', color: '#3a342f' },
  ironbasalt: { id: 'ironbasalt', displayName: 'Ironbasalt', shortName: 'Ironbasalt', color: '#302b2a' },
  lavaRock: { id: 'lavaRock', displayName: 'Lava Rock', shortName: 'Lava Rock', color: '#7a2417', sprite: 'lavaRock' }
};

const TILE_DATA = {
  [TILE_ROCK]: MINERALS.crust,
  [TILE_HARD]: MINERALS.ironbasalt,
  [TILE_GOLD]: MINERALS.gild,
  [TILE_NITRA]: MINERALS.voltarite,
  [TILE_CRYSTAL]: MINERALS.echo,
  [TILE_FERRITE_BARK]: MINERALS.ferriteBark,
  [TILE_LUMINA_SPORES]: MINERALS.luminaSpores,
  [TILE_AETHER_QUARTZ]: MINERALS.aetherQuartz,
  [TILE_CRYSALITH]: MINERALS.crysalith,
  [TILE_EMBERGLASS]: MINERALS.emberglass,
  [TILE_LAVA_ROCK]: MINERALS.lavaRock
};

const OBSTACLE_TYPES = {
  lavaRock: {
    id: 'lavaRock',
    displayName: 'Lava Rock',
    tile: TILE_LAVA_ROCK,
    mineable: false,
    blocksMovement: true,
    blocksProjectiles: true,
    blocksPathfinding: true,
    sprite: 'lavaRock'
  }
};

const RUN_RESOURCE_IDS = ['gild','voltarite','echo','ferriteBark','luminaSpores','aetherQuartz','crysalith','emberglass'];
const MISSION_RESOURCE_IDS = ['gild','voltarite','ferriteBark','luminaSpores','aetherQuartz','crysalith','emberglass'];

const RESOURCE_TILE_TYPES = [
  { tile:TILE_GOLD, resourceId:'gild', weight:0.35, minCluster:3, maxCluster:9, hp:32 },
  { tile:TILE_NITRA, resourceId:'voltarite', weight:0.20, minCluster:2, maxCluster:6, hp:32 },
  { tile:TILE_CRYSTAL, resourceId:'echo', weight:0.14, minCluster:2, maxCluster:5, hp:45 },
  { tile:TILE_FERRITE_BARK, resourceId:'ferriteBark', weight:0.12, minCluster:3, maxCluster:7, hp:34 },
  { tile:TILE_LUMINA_SPORES, resourceId:'luminaSpores', weight:0.08, minCluster:2, maxCluster:5, hp:26 },
  { tile:TILE_AETHER_QUARTZ, resourceId:'aetherQuartz', weight:0.035, minCluster:1, maxCluster:3, hp:54 },
  { tile:TILE_CRYSALITH, resourceId:'crysalith', weight:0.055, minCluster:2, maxCluster:4, hp:42 },
  { tile:TILE_EMBERGLASS, resourceId:'emberglass', weight:0.07, minCluster:2, maxCluster:5, hp:38 }
];

const WEAPON_DATA = {
  vectorBurst: { name: 'Vector Burst', type:'multiDirectionCommon', spriteId:'vectorBurstIcon' },
  minigun: { name: 'Rotary Mauler' },
  carbine: { name: 'Vector Carbine' },
  flamer: { name: 'Thermal Lance' },
  borecasterBomb: { name: 'Seismic Charge', allowedClasses: ['borecaster'], type:'timedThrowableBomb', spriteId:'borecasterBombLit' },
  hammerfallSalvo: { name: 'Hammerfall Salvo', allowedClasses: ['bulwark'], type: 'guidedMissileSalvo', spriteId:'hammerfallMissile' },
  satchel: { name: 'Seismic Charge' },
  drones: { name: 'Warden Drones' },
  boomerang: { name: 'Return Disc' },
  arc: { name: 'Storm Lattice', spriteId:'arcConnectionIcon' },
  rail: { name: 'Bore Rail' },
  sweeper: { name: 'Sifter Drone' }
};


const PERF_STATES = {
  HEALTHY: 'PERF_HEALTHY',
  WARNING: 'PERF_WARNING',
  CRITICAL: 'PERF_CRITICAL',
  RECOVERING: 'PERF_RECOVERING'
};

const PERFORMANCE_CONFIG = {
  sampleWindowSeconds: 3.0,
  healthyFps: 55,
  warningFps: 42,
  criticalFps: 42,
  recoveryFps: 52,
  recoveryHoldSeconds: 3.0,
  healthyHoldSeconds: 5.0,
  baseMaxEnemies: 120,
  minMaxEnemies: 35,
  maxEnemyBulletsHealthy: 180,
  maxEnemyBulletsWarning: 120,
  maxEnemyBulletsCritical: 70,
  maxEnemyBulletsRecovering: 105,
  criticalDespawnPerSecond: 3,
  despawnDistance: 780,
  cameraMargin: 180
};

const SETTINGS_KEY = 'echoVeinSettings';
const DEFAULT_SETTINGS = {
  fogOfWarEnabled: true,
  fogOfWarRadius: 280,
  fogOfWarSoftEdge: 160,
  fogOfWarIntensity: 0.78,
  fogOfWarMemoryEnabled: false,
  manualMouseControlEnabled: true
};
let gameSettings = loadSettings();

function normalizeSettings(settings){
  return {...DEFAULT_SETTINGS, ...(settings || {})};
}

function loadSettings(){
  try{
    const raw = localStorage.getItem(SETTINGS_KEY);
    return normalizeSettings(raw ? JSON.parse(raw) : null);
  }catch(err){
    console.warn('Could not load Echo Vein settings.', err);
    return normalizeSettings(null);
  }
}

function saveSettings(){
  try{ localStorage.setItem(SETTINGS_KEY, JSON.stringify(gameSettings)); }
  catch(err){ console.warn('Could not save Echo Vein settings.', err); }
}

function getFogSettings(){
  return normalizeSettings(gameSettings);
}

function setFogOfWarEnabled(enabled){
  gameSettings.fogOfWarEnabled = !!enabled;
  saveSettings();
}

function setManualMouseControlEnabled(enabled){
  gameSettings.manualMouseControlEnabled = !!enabled;
  saveSettings();
}

function setFogIntensityPreset(preset){
  const presets = {
    low: { fogOfWarRadius: 340, fogOfWarSoftEdge: 190, fogOfWarIntensity: 0.58 },
    medium: { fogOfWarRadius: 280, fogOfWarSoftEdge: 160, fogOfWarIntensity: 0.78 },
    high: { fogOfWarRadius: 230, fogOfWarSoftEdge: 140, fogOfWarIntensity: 0.88 }
  };
  Object.assign(gameSettings, presets[preset] || presets.medium);
  saveSettings();
}


const keys = new Set();
let mouse = { x: 0, y: 0, down: false, lastMove: -999, used: false };
let gamepadButtonsPrev = [];
let lastTime = performance.now();
let game = null;
let paused = false;
let awaitingUpgrade = false;
let shake = 0;
let logTimeout = 0;

const ui = {
  timer: document.getElementById('timer'),
  hpFill: document.getElementById('hpFill'), hpLabel: document.getElementById('hpLabel'),
  xpFill: document.getElementById('xpFill'), xpLabel: document.getElementById('xpLabel'),
  heatFill: document.getElementById('heatFill'), heatLabel: document.getElementById('heatLabel'),
  level: document.getElementById('level'), depth: document.getElementById('depth'),
  gold: document.getElementById('gold'), nitra: document.getElementById('nitra'), kills: document.getElementById('kills'),
  weaponList: document.getElementById('weaponList'), logList: document.getElementById('logList'),
  rightbar: document.querySelector('.rightbar'),
  startOverlay: document.getElementById('startOverlay'), upgradeOverlay: document.getElementById('upgradeOverlay'),
  gameOverOverlay: document.getElementById('gameOverOverlay'),
  startTitle: document.getElementById('startTitle'), startText: document.getElementById('startText'),
  menuMeta: document.getElementById('menuMeta'), menuButtons: document.getElementById('menuButtons'), menuContent: document.getElementById('menuContent'),
  classCards: document.getElementById('classCards'), upgradeCards: document.getElementById('upgradeCards'),
  gameOverText: document.getElementById('gameOverText'), damageFlash: document.getElementById('damageFlash'),
  soundBtn: document.getElementById('soundBtn'), volumeSlider: document.getElementById('volumeSlider')
};

const CLASSES = [
  { id: 'bulwark', icon: 'B', spriteId: 'bulwarkOperator', name: 'Bulwark', desc: 'Heavy armour, high endurance, and a Rotary Mauler built for sustained pressure.', tag: 'Armoured DPS', hp: 140, speed: 185, weapon: 'minigun' },
  { id: 'pathfinder', icon: 'P', spriteId: 'pathfinderOperator', name: 'Pathfinder', desc: 'Fast utility operator with a Vector Carbine, stronger dash, and a deployable trap kit.', tag: 'Mobility', hp: 105, speed: 235, weapon: 'carbine' },
  { id: 'borecaster', icon: 'C', spriteId: 'borecasterOperator', name: 'Borecaster', desc: 'Mining and thermal-control specialist with better heat capacity and a Thermal Lance.', tag: 'Mining Control', hp: 125, speed: 195, weapon: 'flamer' }
];

const UPGRADE_POOL = [
  { icon:'💥', name:'Kinetic Rounds', desc:'+18% projectile damage.', apply:g=>g.player.damageMul*=1.18 },
  { icon:'⚡', name:'Trigger Discipline', desc:'+14% fire rate on all automatic weapons.', apply:g=>g.player.fireRateMul*=1.14 },
  { icon:'🎯', name:'Targeting Optics', desc:'+10% weapon accuracy. Projectile spread becomes tighter.', apply:g=>{ g.player.accuracy = clamp((g.player.accuracy || 0.35) + 0.10, 0, 1); g.player.accuracyBonus = (g.player.accuracyBonus || 0) + 0.10; log(g, `Weapon accuracy improved to ${Math.round(g.player.accuracy*100)}%.`); } },
  { icon:'🔫', name:'Extra Barrel', desc:'+1 projectile for bullet weapons.', apply:g=>g.player.extraProjectiles++ },
  { icon:'✳️', spriteId:'vectorBurstIcon', name:'Vector Burst', desc:'Unlocks a common multi-direction weapon that fires a symmetrical spread at targets.', available:g=>!g.weapons.find(w=>w.id==='vectorBurst'), apply:g=>addOrLevelWeapon(g,'vectorBurst') },
  { icon:'➕', spriteId:'vectorBurstIcon', name:'Splitfire Array', desc:'Vector Burst gains +1 firing direction. No maximum cap.', available:g=>!!g.weapons.find(w=>w.id==='vectorBurst'), apply:g=>upgradeVectorBurst(g,'count') },
  { icon:'💠', spriteId:'vectorBurstIcon', name:'Vector Focusing', desc:'+15% Vector Burst damage.', available:g=>!!g.weapons.find(w=>w.id==='vectorBurst'), apply:g=>upgradeVectorBurst(g,'damage') },
  { icon:'⚡', spriteId:'vectorBurstIcon', name:'Vector Accelerator', desc:'+12% Vector Burst projectile speed and range.', available:g=>!!g.weapons.find(w=>w.id==='vectorBurst'), apply:g=>upgradeVectorBurst(g,'speed') },
  { icon:'⏱️', spriteId:'vectorBurstIcon', name:'Vector Relay', desc:'+14% Vector Burst fire rate.', available:g=>!!g.weapons.find(w=>w.id==='vectorBurst'), apply:g=>upgradeVectorBurst(g,'rate') },
  { icon:'🛡️', name:'Armour Plates', desc:'+25 max HP and repair 20 HP.', apply:g=>{g.player.maxHp+=25; g.player.hp=Math.min(g.player.maxHp,g.player.hp+20);} },
  { icon:'👟', name:'Mag Boots', desc:'+10% movement speed.', apply:g=>g.player.speedMul*=1.10 },
  { icon:'🧲', name:'Resonance Magnet', desc:'+35% Echo Shard and mineral pickup range.', apply:g=>g.player.pickupMul*=1.35 },
  { icon:'🖱️', name:'Targeting Cursor', desc:'Unlock mouse-guided targeting. Move the cursor near a Hollowborn to bias player weapons toward it.', requiresMouseControl:true, available:g=>!g.player.mouseTargeting, apply:g=>{ g.player.mouseTargeting=true; log(g,'Targeting Cursor linked. Move the mouse to guide player weapons.'); } },
  { icon:'🔗', spriteId:'arcConnectionIcon', name:'Arc Connection', desc:'Right-click enemies to chain them with green links. Right-click empty space with 2+ selected to detonate.', apply:g=>{ g.arcConnection.unlocked=true; g.arcConnection.level++; g.arcConnection.maxTargets=1+g.arcConnection.level; log(g, `Arc Connection Mk ${g.arcConnection.level}: ${g.arcConnection.maxTargets} target chain ready.`); } },
  { icon:'🔷', name:'Sifter Drone', desc:'Adds a utility drone that roams out and collects Echo Shards for you.', apply:g=>addOrLevelWeapon(g,'sweeper') },
  { icon:'⛏️', name:'Tungsten Bore Bit', desc:'+35% mining speed and less heat per tile.', apply:g=>{g.player.mineMul*=1.35; g.player.heatEfficiency*=0.86;} },
  { icon:'❄️', name:'Cryo Coolant', desc:'Tool cools faster and overheats less often.', apply:g=>{g.player.coolMul*=1.35; g.player.maxHeat+=20;} },
  { icon:'🧨', name:'Seismic Charge', desc:'Adds a periodic explosion around the nearest swarm.', apply:g=>addOrLevelWeapon(g,'satchel') },
  { icon:'🚀', spriteId:'hammerfallMissile', name:'Hammerfall Salvo', desc:'Unlocks Bulwark guided missile salvo.', allowedClasses:['bulwark'], available:g=>g.player.classId==='bulwark' && !g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>unlockHammerfallSalvo(g) },
  { icon:'💥', name:'Warhead Yield', desc:'+15% Hammerfall missile damage.', allowedClasses:['bulwark'], available:g=>!!g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>upgradeHammerfall(g,'damage') },
  { icon:'🔥', name:'Hot-Burn Motors', desc:'+12% Hammerfall missile speed.', allowedClasses:['bulwark'], available:g=>!!g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>upgradeHammerfall(g,'speed') },
  { icon:'⛽', name:'Extended Fuel Cells', desc:'+15% Hammerfall missile flight time.', allowedClasses:['bulwark'], available:g=>!!g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>upgradeHammerfall(g,'fuel') },
  { icon:'➕', name:'Extra Launch Tubes', desc:'Hammerfall fires one additional missile per salvo.', allowedClasses:['bulwark'], available:g=>!!g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>upgradeHammerfall(g,'count') },
  { icon:'🎯', spriteId:'targetLockReticle', name:'Redlock Guidance', desc:'Hammerfall missiles track more accurately with less guidance noise.', allowedClasses:['bulwark'], available:g=>!!g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>upgradeHammerfall(g,'accuracy') },
  { icon:'💣', spriteId:'borecasterBombLit', name:'Seismic Charge', desc:'Unlocks a Borecaster-only throwable timed bomb with layered blast VFX.', allowedClasses:['borecaster'], available:g=>g.player.classId==='borecaster' && !g.weapons.find(w=>w.id==='borecasterBomb'), apply:g=>unlockBorecasterBomb(g) },
  { icon:'➕', spriteId:'borecasterBombCountIcon', name:'Extra Charges', desc:'+1 bomb thrown per Seismic Charge use.', allowedClasses:['borecaster'], available:g=>!!g.weapons.find(w=>w.id==='borecasterBomb'), apply:g=>upgradeBorecasterBomb(g,'count') },
  { icon:'⏱️', spriteId:'borecasterBombFuseIcon', name:'Short Fuse', desc:'Reduces Seismic Charge fuse time with a safe minimum clamp.', allowedClasses:['borecaster'], available:g=>!!g.weapons.find(w=>w.id==='borecasterBomb'), apply:g=>upgradeBorecasterBomb(g,'fuse') },
  { icon:'🟠', spriteId:'borecasterBombRadiusIcon', name:'Blast Radius', desc:'Increases Seismic Charge explosion radius and area control.', allowedClasses:['borecaster'], available:g=>!!g.weapons.find(w=>w.id==='borecasterBomb'), apply:g=>upgradeBorecasterBomb(g,'radius') },
  { icon:'🛸', name:'Warden Drone Bay', desc:'Adds autonomous Warden Drones that roam and fire micro-bullets.', apply:g=>addOrLevelWeapon(g,'drones') },
  { icon:'➕', name:'Drone Bay Expansion', desc:'Adds more Warden Drones and improves their bullet damage.', apply:g=>{ addOrLevelWeapon(g,'drones'); addOrLevelWeapon(g,'drones'); g.player.droneDamageMul*=1.12; } },
  { icon:'🤖', name:'Drone Targeting AI', desc:'Warden Drones roam faster and fire more aggressively.', apply:g=>{ if(!g.weapons.find(w=>w.id==='drones')) addOrLevelWeapon(g,'drones'); g.player.droneSpeedMul*=1.18; g.player.droneFireRateMul*=1.30; } },
  { icon:'📡', name:'Drone Patrol Radius', desc:'Warden Drones roam farther from the operator and hit harder.', apply:g=>{ if(!g.weapons.find(w=>w.id==='drones')) addOrLevelWeapon(g,'drones'); g.player.droneOrbitMul*=1.20; g.player.droneDamageMul*=1.18; } },
  { icon:'🔍', name:'Sifter Optics', desc:'Unlocks the Sifter Drone if needed and increases its Echo Shard search radius.', apply:g=>{ if(!g.weapons.find(w=>w.id==='sweeper')) addOrLevelWeapon(g,'sweeper'); g.player.sweeperRangeMul*=1.35; } },
  { icon:'💨', name:'Sifter Turbo', desc:'Sifter Drones move faster and collect Echo Shards more aggressively.', apply:g=>{ if(!g.weapons.find(w=>w.id==='sweeper')) addOrLevelWeapon(g,'sweeper'); g.player.sweeperSpeedMul*=1.30; g.player.sweeperCollectMul*=1.18; } },
  { icon:'🪃', name:'Return Disc', desc:'Adds a returning disc that slices through Hollowborn on the way out and back.', apply:g=>addOrLevelWeapon(g,'boomerang') },
  { icon:'🌩️', spriteId:'arcConnectionIcon', name:'Storm Lattice', desc:'Adds chain lightning between nearby enemies.', apply:g=>addOrLevelWeapon(g,'arc') },
  { icon:'☄️', name:'Bore Rail', desc:'Adds a heavy piercing rail shot.', apply:g=>addOrLevelWeapon(g,'rail') },
  { icon:'❤️', name:'Field Reclaimer', desc:'Every 18 kills restore 8 HP.', apply:g=>g.player.vampire+=8 },
  { icon:'📦', name:'Supply Cache', desc:'Spend 15 Voltarite to gain full repair now, otherwise +20 max HP.', apply:g=>{ if(g.nitra>=15){g.nitra-=15; g.player.hp=g.player.maxHp;} else {g.player.maxHp+=20; g.player.hp+=20;} } },
  { icon:'🪤', spriteId:'pathfinderTrap', name:'Trap Payload', desc:'Pathfinder traps gain larger blast radius and more damage. Other operators unlock emergency traps.', apply:g=>{ g.player.trapDamageMul*=1.30; g.player.trapRadiusMul*=1.15; g.player.canUseTraps=true; } },
  { icon:'💣', name:'Explosive Ammo', desc:'Bullets gain small area damage.', apply:g=>g.player.splash+=10 },
];

function rand(a,b){ return a + Math.random()*(b-a); }
function randi(a,b){ return Math.floor(rand(a,b+1)); }
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function dist2(ax,ay,bx,by){ const dx=ax-bx, dy=ay-by; return dx*dx+dy*dy; }
function len(x,y){ return Math.hypot(x,y) || 1; }
function lerp(a,b,t){ return a+(b-a)*t; }
function nowSec(){ return game ? game.time : 0; }
function weaponName(id){ return WEAPON_DATA[id]?.name || id; }

function gamepadVector(){
  if(!navigator.getGamepads) return { dx:0, dy:0, active:false };
  const pads = navigator.getGamepads();
  for(const pad of pads){
    if(!pad) continue;
    const ax = pad.axes?.[0] || 0;
    const ay = pad.axes?.[1] || 0;
    const mag = Math.hypot(ax, ay);
    if(mag > 0.18){
      const scaled = clamp((mag - 0.18) / 0.82, 0, 1);
      return { dx: ax / mag * scaled, dy: ay / mag * scaled, active:true };
    }
  }
  return { dx:0, dy:0, active:false };
}

function gamepadButtonPressed(index){
  if(!navigator.getGamepads) return false;
  let isDown = false;
  const pads = navigator.getGamepads();
  for(const pad of pads){
    if(pad?.buttons?.[index]?.pressed){
      isDown = true;
      break;
    }
  }
  const wasDown = !!gamepadButtonsPrev[index];
  gamepadButtonsPrev[index] = isDown;
  return isDown && !wasDown;
}


const GAMEPAD = {
  // Standard Gamepad API button mapping:
  // A=0, B=1, X=2, Y=3.
  // User control rule: X is the left-mouse/primary-action equivalent.
  A:0, B:1, X:2, Y:3,
  DPAD_UP:12, DPAD_DOWN:13, DPAD_LEFT:14, DPAD_RIGHT:15,
  LEFT_DEADZONE:0.35,
  RIGHT_DEADZONE:0.22,
  CURSOR_SPEED:860
};

let gamepadState = {
  connected:false,
  id:'',
  padIndex:null,
  prevButtons:[],
  buttons:[],
  axes:[0,0,0,0],
  leftX:0,
  leftY:0,
  rightX:0,
  rightY:0
};


// Real-time manual aim clock.  Game time can pause/freeze during menus or
// transitions, so controller cursor/manual aim state also uses browser time.
let manualAimLastMoveRealTime = -999;

let menuGamepadState = {
  selectedIndex:0,
  lastMoveTime:-999,
  moveRepeatDelay:0.20,
  lastSignature:''
};

function getPrimaryGamepad(){
  if(!navigator.getGamepads) return null;
  const pads=navigator.getGamepads();
  if(gamepadState.padIndex!=null){
    const known=pads[gamepadState.padIndex];
    if(known && known.connected !== false) return known;
    gamepadState.padIndex=null;
  }
  for(const pad of pads){
    if(pad && pad.connected !== false){ gamepadState.padIndex=pad.index; return pad; }
  }
  return null;
}

function pollGamepadState(){
  const pad=getPrimaryGamepad();
  gamepadState.prevButtons=gamepadState.buttons || [];
  if(!pad){
    gamepadState.connected=false;
    gamepadState.buttons=[];
    gamepadState.axes=[0,0,0,0];
    gamepadState.leftX=gamepadState.leftY=gamepadState.rightX=gamepadState.rightY=0;
    return gamepadState;
  }
  gamepadState.connected=true;
  gamepadState.id=pad.id || 'Gamepad';
  gamepadState.buttons=Array.from(pad.buttons || [], b=>!!b.pressed);
  gamepadState.axes=Array.from(pad.axes || []);
  gamepadState.leftX=gamepadState.axes[0] || 0;
  gamepadState.leftY=gamepadState.axes[1] || 0;
  gamepadState.rightX=gamepadState.axes[2] || 0;
  gamepadState.rightY=gamepadState.axes[3] || 0;
  return gamepadState;
}

function gamepadPressed(index){
  return !!gamepadState.buttons[index] && !gamepadState.prevButtons[index];
}

function gamepadHeld(index){
  return !!gamepadState.buttons[index];
}

function gamepadPressedAny(indices){
  return indices.some(index=>gamepadPressed(index));
}

function gamepadHeldAny(indices){
  return indices.some(index=>gamepadHeld(index));
}

function getGamepadLeftNav(){
  /*
   * Navigation source used by menus and upgrade cards.
   *
   * Some pads expose D-pad as buttons 12-15, some as axes 6/7, while the
   * standard left stick uses axes 0/1.  Read all of these so the power-up menu
   * is not silently locked to one controller mapping.
   */
  const x=gamepadState.leftX || 0, y=gamepadState.leftY || 0;
  const axes=gamepadState.axes || [];
  const dpadButtonX=(gamepadHeld(GAMEPAD.DPAD_RIGHT)?1:0) - (gamepadHeld(GAMEPAD.DPAD_LEFT)?1:0);
  const dpadButtonY=(gamepadHeld(GAMEPAD.DPAD_DOWN)?1:0) - (gamepadHeld(GAMEPAD.DPAD_UP)?1:0);
  const dpadAxisX=Math.abs(axes[6] || 0)>GAMEPAD.LEFT_DEADZONE ? Math.sign(axes[6]) : 0;
  const dpadAxisY=Math.abs(axes[7] || 0)>GAMEPAD.LEFT_DEADZONE ? Math.sign(axes[7]) : 0;
  const stickX=Math.abs(x)>GAMEPAD.LEFT_DEADZONE ? Math.sign(x) : 0;
  const stickY=Math.abs(y)>GAMEPAD.LEFT_DEADZONE ? Math.sign(y) : 0;
  const nx = dpadButtonX || dpadAxisX || stickX;
  const ny = dpadButtonY || dpadAxisY || stickY;
  return {x:nx,y:ny,active:!!(nx||ny)};
}

function currentManualAimActive(g){
  if(!g || !mouse.used) return false;
  if(!getFogSettings().manualMouseControlEnabled) return false;
  const realNow = performance.now()/1000;
  const gameRecent = g.time - mouse.lastMove < 2;
  const realRecent = realNow - manualAimLastMoveRealTime < 2;
  return !!(gameRecent || realRecent);
}

function activeAimWorld(g){
  const realNow = performance.now()/1000;
  const c = g?.controllerCursor;
  if(c?.active && ((g.time - c.lastMoveTime < 2) || (realNow - (c.lastMoveRealTime ?? -999) < 2))){
    return {x:c.worldX, y:c.worldY};
  }
  return { x:g.camera.x + mouse.x, y:g.camera.y + mouse.y };
}

function triggerDash(g, source='input'){
  if(!g || g.state!=='playing' || awaitingUpgrade) return false;
  const p=g.player;
  const cd = p.classId==='pathfinder'?1.4:2.4;
  if(p.dashCd>0) return false;
  p.dashCd=cd;
  p.dashT=0.15;
  if(g.runStats) g.runStats.dashesUsed=(g.runStats.dashesUsed||0)+1;
  sfx('dash');
  return true;
}

function getGamepadRightVector(){
  /*
   * Right-stick axes are usually 2/3 on standard Xbox-style pads, but some
   * browser/driver combinations expose them as 3/4, 2/5, or 4/5.  The previous
   * implementation read only axes 2/3, so on some pads the cursor could appear
   * to move once and then stop.  Pick the strongest plausible right-stick pair
   * each frame and treat it as continuous analogue input, not as an edge event.
   */
  const axes = gamepadState.axes || [];
  const pairs = [[2,3],[3,4],[2,5],[4,5]];
  let best = {x:0,y:0,mag:0,pair:null};
  for(const [ix,iy] of pairs){
    if(ix>=axes.length || iy>=axes.length) continue;
    const x = axes[ix] || 0;
    const y = axes[iy] || 0;
    const mag = Math.hypot(x,y);
    if(mag > best.mag) best = {x,y,mag,pair:[ix,iy]};
  }
  if(best.mag <= GAMEPAD.RIGHT_DEADZONE) return {x:0,y:0,active:false,mag:0,pair:best.pair};
  const scaled = clamp((best.mag-GAMEPAD.RIGHT_DEADZONE)/(1-GAMEPAD.RIGHT_DEADZONE),0,1);
  return {x:best.x/best.mag*scaled, y:best.y/best.mag*scaled, active:true, mag:best.mag, pair:best.pair};
}

function syncControllerCursorWorld(g){
  if(!g?.controllerCursor) return;
  g.controllerCursor.worldX = g.camera.x + g.controllerCursor.screenX;
  g.controllerCursor.worldY = g.camera.y + g.controllerCursor.screenY;
}

function moveControllerCursor(g,dt){
  if(!g) return;
  const c=g.controllerCursor;
  if(!c) return;
  const rv=getGamepadRightVector();
  const realNow = performance.now()/1000;
  if(rv.active){
    c.active=true;
    c.screenX=clamp((c.screenX ?? innerWidth/2) + rv.x*GAMEPAD.CURSOR_SPEED*dt, 0, innerWidth);
    c.screenY=clamp((c.screenY ?? innerHeight/2) + rv.y*GAMEPAD.CURSOR_SPEED*dt, 0, innerHeight);
    c.lastMoveTime=g.time;
    c.lastMoveRealTime=realNow;
    c.axisPair=rv.pair;
    syncControllerCursorWorld(g);
    mouse.x=c.screenX;
    mouse.y=c.screenY;
    mouse.used=true;
    mouse.lastMove=g.time;
    manualAimLastMoveRealTime=realNow;
  } else if(c.active){
    syncControllerCursorWorld(g);
    if((g.time - c.lastMoveTime > 2) && (realNow - (c.lastMoveRealTime ?? -999) > 2)) c.active=false;
  }
}


function menuInputClock(){
  // Menus pause/freeze game.time, so controller repeat timing must use
  // the browser's real clock. This fixes stick/D-pad navigation only moving
  // once in the level-up/power-up menu.
  return performance.now()/1000;
}

function visibleMenuGamepadElements(){
  if(!ui.startOverlay?.classList?.contains('show')) return [];
  const selectors = [
    '#menuButtons button',
    '#classCards .card[data-class-id]',
    '#menuContent button',
    '#menuContent input[type="checkbox"]'
  ];
  return selectors
    .flatMap(sel=>Array.from(ui.startOverlay.querySelectorAll(sel)))
    .filter(el=>{
      if(el.disabled) return false;
      const style=getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
    });
}

function refreshMenuGamepadSelection(elements=visibleMenuGamepadElements()){
  elements.forEach((el,i)=>{
    const selected=i===menuGamepadState.selectedIndex;
    el.classList.toggle('controllerSelected', selected);
    el.setAttribute('aria-selected', selected ? 'true' : 'false');
    if(selected && document.activeElement!==el){
      try{ el.focus({preventScroll:true}); }catch(_){ el.focus(); }
    }
  });
}

function updateMenuGamepadInput(dt){
  if(!ui.startOverlay?.classList?.contains('show')) return false;
  const elements=visibleMenuGamepadElements();
  if(!elements.length) return false;
  const signature=elements.map(el=>el.textContent || el.dataset.classId || el.id || el.tagName).join('|');
  if(signature!==menuGamepadState.lastSignature){
    menuGamepadState.lastSignature=signature;
    menuGamepadState.selectedIndex=0;
    menuGamepadState.lastMoveTime=-999;
  }
  menuGamepadState.selectedIndex=clamp(menuGamepadState.selectedIndex,0,elements.length-1);
  const nav=getGamepadLeftNav();
  const t=menuInputClock();
  if(nav.active && t-menuGamepadState.lastMoveTime>=menuGamepadState.moveRepeatDelay){
    const step=(nav.x>0 || nav.y>0) ? 1 : -1;
    menuGamepadState.selectedIndex=(menuGamepadState.selectedIndex+step+elements.length)%elements.length;
    menuGamepadState.lastMoveTime=t;
  }
  refreshMenuGamepadSelection(elements);
  if(gamepadPressedAny([GAMEPAD.A, GAMEPAD.X])){
    const el=elements[menuGamepadState.selectedIndex];
    if(el){
      if(el.type==='checkbox') el.checked=!el.checked;
      el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
      return true;
    }
  }
  if(gamepadPressed(GAMEPAD.B)){
    const back=elements.find(el=>/back|main menu|cancel|close/i.test(el.textContent || ''));
    if(back){ back.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window})); return true; }
  }
  return true;
}

function resizeCanvas(){
  canvas.width = Math.floor(window.innerWidth * DPR);
  canvas.height = Math.floor(window.innerHeight * DPR);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();


EchoVein/js/progression.js:
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
    isComplete:g=>{ const o=g.objectives.find(o=>o.id==='hunt_kills'); return o ? o.completed : false; }
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
    isComplete:g=>{ const o=g.objectives.find(o=>o.id==='survey_tiles'); return o ? o.completed : false; }
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
    isComplete:g=>g.objectives.filter(o=>o.type==='harvest').every(o=>o.completed)
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
    isComplete:g=>{ const o=g.objectives.find(o=>o.id==='holdout_timer'); return o ? o.completed : false; }
  }
];

// Track the mission type selected by the player for the next run.
let selectedMissionType = MISSION_TYPES[0];

const PERMANENT_UPGRADES = [
  { id:'maxHealth', category:'Player Core', name:'Reinforced Suit', desc:'+5% max HP per level.', next:'Another +5% max HP.', ore:'ferronRoot', max:20 },
  { id:'armour', category:'Player Core', name:'Impact Weave', desc:'Reduces contact damage by 2% per level.', next:'Another -2% contact damage.', ore:'ferronRoot', max:15 },
  { id:'moveSpeed', category:'Player Core', name:'Vector Servos', desc:'+2.5% movement speed per level.', next:'Another +2.5% movement speed.', ore:'lumicite', max:15 },
  { id:'miningSpeed', category:'Mining', name:'Bore Calibration', desc:'+4% mining speed per level.', next:'Another +4% mining speed.', ore:'echoQuartz', max:15 },
  { id:'weaponDamage', category:'Weapons', name:'Weapon Harmonics', desc:'+3% weapon damage per level.', next:'Another +3% weapon damage.', ore:'umbralAlloy', max:20 },
  { id:'fireRate', category:'Weapons', name:'Trigger Relays', desc:'+2% fire rate per level.', next:'Another +2% fire rate.', ore:'voltarite', max:15 },
  { id:'pickupRadius', category:'Utility', name:'Resonance Net', desc:'+5% pickup radius per level.', next:'Another +5% pickup range.', ore:'echoQuartz', max:12 },
  { id:'droneEfficiency', category:'Drones', name:'Drone Uplinks', desc:'+4% drone damage and speed per level.', next:'Another +4% drone efficiency.', ore:'umbralAlloy', max:12 },
  { id:'trapEffectiveness', category:'Character-Specific', name:'Trap Matrices', desc:'+5% trap damage and radius per level.', next:'Another +5% trap output.', ore:'pyroclastCore', max:12 },
  { id:'arcDamage', category:'Weapons', name:'Arc Capacitors', desc:'+5% electric/arc damage per level.', next:'Another +5% arc damage.', ore:'voltarite', max:12 },
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

function permanentUpgradeCost(up){
  const level=saveProfile.permanentUpgrades[up.id] || 0;
  return {
    gildShards:Math.floor(45 + level*28 + level*level*6),
    [up.ore]:Math.floor(2 + level*1.35)
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
  resources.gildShards += Math.floor(((runRes.gild || g.gold || 0) + 35 + saveProfile.runIndex*10)*rewardMul*missionMul);
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


EchoVein/js/run-stats.js:
'use strict';

/* Mission objective HUD helpers, run statistics, end-of-run summary, and trend charts. */

const RUN_STAT_SAMPLE_INTERVAL = 5;
const RUN_STAT_MAX_SAMPLES = 720;
let runStatsLastChartKey = 'enemiesKilled';

function createRunStats(){
  return {
    startTime: performance.now(), endTime:null, durationSec:0, lastSampleTime:0,
    tileSizeBase:typeof TILE_SIZE_BASE!=='undefined'?TILE_SIZE_BASE:0, tileSizeScale:typeof TILE_SIZE_SCALE!=='undefined'?TILE_SIZE_SCALE:1, effectiveTileSize:typeof TILE!=='undefined'?TILE:0,
    enemiesKilled:0, elitesKilled:0, bossesKilled:0, playerLevelMax:1, xpCollected:0,
    resourcesCollected:{}, blocksMined:0, distanceTravelled:0, damageDealt:0, damageTaken:0,
    shotsFired:0, shotsHit:0, dashesUsed:0, trapsPlaced:0, dronesDeployed:0, dronesPeak:0,
    missilesFired:0, boomerangsFired:0, arcDetonations:0, lavaDamageTaken:0, borecasterBombsThrown:0, borecasterBombsExploded:0,
    objectivesCompleted:0, causeOfEnd:null, endTitle:null, samples:[], lastX:null, lastY:null,
    maxEnemiesAlive:0, criticalHealthTime:0, miningTime:0,
    chargingWavesSpawned:0, chargingWaveEnemiesSpawned:0, chargingWaveEnemiesKilled:0, chargingWaveEnemiesExploded:0,
    damageTakenFromChargingWaves:0, blocksBrokenByChargingWaves:0, oresDestroyedByChargingWaves:0
  };
}

function ensureRunStats(g){ if(g && !g.runStats) g.runStats=createRunStats(); return g?.runStats; }
function totalRunResources(stats){ return Object.values(stats?.resourcesCollected || {}).reduce((a,b)=>a+(+b||0),0); }
function runAccuracy(stats){ return stats?.shotsFired>0 ? (stats.shotsHit/stats.shotsFired)*100 : 0; }
function formatDuration(sec){ sec=Math.max(0,Math.floor(sec||0)); return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`; }
function recordRunResource(g,id,amount){ const s=ensureRunStats(g); if(!s||!id) return; s.resourcesCollected[id]=(s.resourcesCollected[id]||0)+(amount||0); }
function recordRunDamageTaken(g,amount,cause='damage'){ const s=ensureRunStats(g); if(!s) return; s.damageTaken+=(amount||0); if(cause==='lava') s.lavaDamageTaken+=(amount||0); if(amount>0 && !s.causeOfEnd) s.lastDamageCause=cause; }
function recordRunDamageDealt(g,amount){ const s=ensureRunStats(g); if(!s) return; s.damageDealt+=(amount||0); }
function recordShotFired(g,count=1){ const s=ensureRunStats(g); if(s) s.shotsFired+=count; }
function recordShotHit(g,count=1){ const s=ensureRunStats(g); if(s) s.shotsHit+=count; }

function updateRunStatsFrame(g,dt){
  const s=ensureRunStats(g); if(!s || g.state!=='playing') return;
  s.durationSec=g.time || 0;
  s.playerLevelMax=Math.max(s.playerLevelMax||1,g.level||1);
  s.maxEnemiesAlive=Math.max(s.maxEnemiesAlive||0,g.enemies?.length||0);
  s.dronesPeak=Math.max(s.dronesPeak||0,(g.wardenDrones?.length||0)+(g.sifterDrones?.length||0));
  if(s.lastX==null){ s.lastX=g.player.x; s.lastY=g.player.y; }
  else { const d=Math.hypot(g.player.x-s.lastX,g.player.y-s.lastY); if(Number.isFinite(d)&&d<160) s.distanceTravelled+=d; s.lastX=g.player.x; s.lastY=g.player.y; }
  if((g.player.hp/(g.player.maxHp||1))<0.25) s.criticalHealthTime+=dt;
  updateRunStatSampling(g);
}

function createRunStatSample(g){
  const s=ensureRunStats(g);
  return {
    t:g.time||0, enemiesKilled:s.enemiesKilled||0, elitesKilled:s.elitesKilled||0,
    playerLevel:g.level||1, xpCollected:s.xpCollected||0, totalOreCollected:totalRunResources(s),
    damageTaken:s.damageTaken||0, damageDealt:s.damageDealt||0, enemiesAlive:g.enemies?.length||0,
    enemyBulletsAlive:g.enemyBullets?.length||0, fpsAverage:g.performance?.averageFPS||60, blocksMined:s.blocksMined||0, tileSize:typeof TILE!=='undefined'?TILE:0
  };
}
function updateRunStatSampling(g){
  const s=ensureRunStats(g); if(!s) return;
  if((g.time||0)-s.lastSampleTime < RUN_STAT_SAMPLE_INTERVAL && s.samples.length) return;
  s.lastSampleTime=g.time||0;
  s.samples.push(createRunStatSample(g));
  if(s.samples.length>RUN_STAT_MAX_SAMPLES) s.samples.splice(0,s.samples.length-RUN_STAT_MAX_SAMPLES);
}

function finalizeRunStats(g,cause,title){
  const s=ensureRunStats(g); if(!s) return null;
  s.endTime=performance.now(); s.durationSec=g.time||s.durationSec||0; s.causeOfEnd=cause||s.causeOfEnd||'Ended'; s.endTitle=title||s.endTitle||'Run Ended';
  s.playerLevelMax=Math.max(s.playerLevelMax||1,g.level||1);
  if(!s.samples.length || (s.samples.at(-1).t||0)!==(g.time||0)) s.samples.push(createRunStatSample(g));
  return s;
}

function getObjectiveProgress(o){ const target=o?.targetAmount ?? o?.target ?? 0; const cur=o?.currentAmount ?? o?.current ?? 0; return target>0 ? clamp(cur/target,0,1) : 0; }
function objectiveProgressText(o){
  const target=o?.targetAmount ?? o?.target ?? 0; const cur=o?.currentAmount ?? o?.current ?? 0;
  if(!target) return o?.completed ? 'Complete' : 'Active';
  if((o.id||'').includes('level')) return `Level ${Math.floor(cur)} / ${target}`;
  return `${Math.floor(cur)} / ${target}`;
}

function renderObjectiveChips(g){
  const pulse=0.65+0.35*(0.5+0.5*Math.sin((g.time||0)*4));
  return (g.objectives||[]).map((o,i)=>{
    const pct=getObjectiveProgress(o)*100;
    const done=!!o.completed;
    const priority=!done && i===0;
    const style=done?'':`style="--pulse:${pulse.toFixed(3)}"`;
    return `<div class="objectiveRow ${done?'done':'active'} ${priority?'priority':''}" ${style}>
      <div class="objectiveTop"><span>${done?'✓':'◆'} ${o.displayName}</span><b>${objectiveProgressText(o)}</b></div>
      <div class="objectiveBar"><i style="width:${pct.toFixed(1)}%"></i></div>
    </div>`;
  }).join('');
}

function runStatsSummaryHtml(g){
  const s=ensureRunStats(g); const res=s.resourcesCollected||{};
  const resRows=Object.keys(res).sort().map(id=>`<div><span>${MINERALS[id]?.displayName||id}</span><b>${Math.floor(res[id]||0)}</b></div>`).join('') || '<div><span>No resources collected</span><b>0</b></div>';
  const cards=[
    ['Duration',formatDuration(s.durationSec)], ['Kills',s.enemiesKilled||0], ['Elites',s.elitesKilled||0], ['Bosses',s.bossesKilled||0],
    ['Level',s.playerLevelMax||g.level||1], ['Resources',totalRunResources(s)], ['Damage dealt',Math.round(s.damageDealt||0)], ['Damage taken',Math.round(s.damageTaken||0)],
    ['Accuracy',`${runAccuracy(s).toFixed(1)}%`], ['Blocks mined',s.blocksMined||0], ['Dashes',s.dashesUsed||0], ['Traps',s.trapsPlaced||0],
    ...((s.borecasterBombsThrown||0)>0 ? [
      ['Seismic bombs thrown',s.borecasterBombsThrown||0], ['Seismic bombs exploded',s.borecasterBombsExploded||0]
    ] : []),
    ...((s.chargingWavesSpawned||0)>0 ? [
      ['Charging waves',s.chargingWavesSpawned||0], ['Rift Chargers',s.chargingWaveEnemiesSpawned||0],
      ['Chargers exploded',s.chargingWaveEnemiesExploded||0], ['Wave damage',Math.round(s.damageTakenFromChargingWaves||0)],
      ['Wave blocks broken',s.chargingWaveBlocksBroken||s.blocksBrokenByChargingWaves||0]
    ] : [])
  ].map(([k,v])=>`<div class="statCard"><span>${k}</span><b>${v}</b></div>`).join('');
  return `<div class="runStatsSummary"><div class="statCards">${cards}</div><h3>Resource Breakdown</h3><div class="resourceBreakdown">${resRows}</div></div>`;
}

function drawRunStatsChart(canvas,g,key='enemiesKilled'){
  if(!canvas||!g?.runStats) return;
  const ctx2=canvas.getContext('2d'); const dpr=window.devicePixelRatio||1; const w=canvas.clientWidth||680,h=canvas.clientHeight||230;
  canvas.width=Math.floor(w*dpr); canvas.height=Math.floor(h*dpr); ctx2.setTransform(dpr,0,0,dpr,0,0);
  ctx2.clearRect(0,0,w,h); ctx2.fillStyle='rgba(7,9,13,0.72)'; ctx2.fillRect(0,0,w,h);
  const samples=g.runStats.samples||[]; ctx2.font='12px Segoe UI, Arial'; ctx2.fillStyle='#d7ecff';
  const titles={enemiesKilled:'Enemies killed over time',totalOreCollected:'Resources collected over time',damageTaken:'Damage taken over time',playerLevel:'Player level over time',fpsAverage:'Average FPS over time'};
  ctx2.fillText(titles[key]||key,16,22);
  if(samples.length<2){ ctx2.fillStyle='#95a2ba'; ctx2.fillText('Not enough data for trend graph.',16,64); return; }
  const pad={l:48,r:20,t:38,b:30}; const xs=samples.map(s=>s.t||0); const ys=samples.map(s=>+s[key]||0);
  const minX=Math.min(...xs), maxX=Math.max(...xs)||1; const minY=0, maxY=Math.max(1,...ys);
  ctx2.strokeStyle='rgba(255,255,255,0.10)'; ctx2.lineWidth=1;
  for(let i=0;i<4;i++){ const y=pad.t+(h-pad.t-pad.b)*i/3; ctx2.beginPath(); ctx2.moveTo(pad.l,y); ctx2.lineTo(w-pad.r,y); ctx2.stroke(); }
  ctx2.strokeStyle='#42d6ff'; ctx2.lineWidth=3; ctx2.beginPath();
  samples.forEach((s,i)=>{ const x=pad.l+((s.t-minX)/(maxX-minX||1))*(w-pad.l-pad.r); const y=h-pad.b-(((+s[key]||0)-minY)/(maxY-minY||1))*(h-pad.t-pad.b); if(i===0)ctx2.moveTo(x,y); else ctx2.lineTo(x,y); }); ctx2.stroke();
  ctx2.fillStyle='#95a2ba'; ctx2.fillText(`0s`,pad.l,h-10); ctx2.fillText(`${Math.floor(maxX)}s`,w-pad.r-44,h-10); ctx2.fillText(`End: ${ys.at(-1)??0}`,w-110,22);
}

function showRunStatsScreen(g,opts={}){
  const s=finalizeRunStats(g,opts.cause,opts.title); if(!s) return;
  const overlay=document.getElementById('runStatsOverlay'); const title=document.getElementById('runStatsTitle'); const reason=document.getElementById('runStatsReason'); const body=document.getElementById('runStatsBody');
  if(!overlay||!body) return;
  title.textContent=s.endTitle||'Run Complete'; reason.textContent=`Reason: ${s.causeOfEnd||'Ended'}`; body.innerHTML=runStatsSummaryHtml(g);
  overlay.classList.add('show');
  const tabs=document.querySelectorAll('[data-run-chart]'); tabs.forEach(btn=>{btn.onclick=()=>{runStatsLastChartKey=btn.dataset.runChart; drawRunStatsChart(document.getElementById('runStatsChart'),g,runStatsLastChartKey);};});
  setTimeout(()=>drawRunStatsChart(document.getElementById('runStatsChart'),g,runStatsLastChartKey),30);
}
function hideRunStatsScreen(){ document.getElementById('runStatsOverlay')?.classList.remove('show'); }
function runStatsContinue(){ hideRunStatsScreen(); showMainMenu(); }
function runStatsRetry(){ const cls=game?.selectedClass || CLASSES[0]; hideRunStatsScreen(); startRunWithClass(cls); }
function runStatsMainMenu(){ hideRunStatsScreen(); showMainMenu(); }

function debugGenerateFakeRunStats(){
  if(!game) game=makeGame(CLASSES[0]);
  game.runStats=createRunStats(); const s=game.runStats; game.time=180; s.enemiesKilled=120; s.elitesKilled=4; s.bossesKilled=1; s.playerLevelMax=7; s.damageDealt=4200; s.damageTaken=84; s.shotsFired=350; s.shotsHit=220; s.blocksMined=165; s.resourcesCollected={gild:70,voltarite:34,echo:180,emberglass:7};
  s.samples=[]; for(let t=0;t<=180;t+=5){ s.samples.push({t,enemiesKilled:Math.floor(t*0.65),totalOreCollected:Math.floor(t*0.55),damageTaken:Math.floor(t*0.45),playerLevel:1+Math.floor(t/30),fpsAverage:58+Math.sin(t/18)*5,blocksMined:Math.floor(t*0.9)}); }
  showRunStatsScreen(game,{title:'Debug Run Statistics',cause:'Generated fake test data'});
}
function debugPrintRunStats(){ console.log(game?.runStats || null); }

window.getObjectiveProgress=getObjectiveProgress;
window.renderObjectiveChips=renderObjectiveChips;
window.createRunStats=createRunStats;
window.ensureRunStats=ensureRunStats;
window.updateRunStatsFrame=updateRunStatsFrame;
window.finalizeRunStats=finalizeRunStats;
window.showRunStatsScreen=showRunStatsScreen;
window.recordRunResource=recordRunResource;
window.recordRunDamageTaken=recordRunDamageTaken;
window.recordRunDamageDealt=recordRunDamageDealt;
window.recordShotFired=recordShotFired;
window.recordShotHit=recordShotHit;
window.debugGenerateFakeRunStats=debugGenerateFakeRunStats;
window.debugPrintRunStats=debugPrintRunStats;
window.runStatsContinue=runStatsContinue;
window.runStatsRetry=runStatsRetry;
window.runStatsMainMenu=runStatsMainMenu;


