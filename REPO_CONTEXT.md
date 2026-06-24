# Repository: EchoVein

## File Structure
- EchoVein/js/core.js
- EchoVein/js/progression.js
- EchoVein/js/render-ui.js
- EchoVein/PROJECT_CONTEXT.md

## Code

### EchoVein/js/core.js
```js
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
  startOverlay: document.getElementById('startOverlay'), upgradeOverlay: document.getElementById('upgradeOverlay'),
  gameOverOverlay: document.getElementById('gameOverOverlay'),
  startTitle: document.getElementById('startTitle'), startText: document.getElementById('startText'),
  menuMeta: document.getElementById('menuMeta'), menuButtons: document.getElementById('menuButtons'), menuContent: document.getElementById('menuContent'),
  classCards: document.getElementById('classCards'), upgradeCards: document.getElementById('upgradeCards'),
  gameOverText: document.getElementById('gameOverText'), damageFlash: document.getElementById('damageFlash'),
  soundBtn: document.getElementById('soundBtn'), volumeSlider: document.getElementById('volumeSlider')
};

const CLASSES = [
  { id: 'bulwark', icon: 'B', name: 'Bulwark', desc: 'Heavy armour, high endurance, and a Rotary Mauler built for sustained pressure.', tag: 'Armoured DPS', hp: 140, speed: 185, weapon: 'minigun' },
  { id: 'pathfinder', icon: 'P', name: 'Pathfinder', desc: 'Fast utility operator with a Vector Carbine, stronger dash, and a deployable trap kit.', tag: 'Mobility', hp: 105, speed: 235, weapon: 'carbine' },
  { id: 'borecaster', icon: 'C', name: 'Borecaster', desc: 'Mining and thermal-control specialist with better heat capacity and a Thermal Lance.', tag: 'Mining Control', hp: 125, speed: 195, weapon: 'flamer' }
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

```

### EchoVein/js/progression.js
```js
'use strict';

/* Persistent profile, menus, mission progression, and permanent upgrades. */

const SAVE_KEY = 'echoVeinSaveV1';
const RUNS_PER_MISSION = 5;
const EXTRACTION_SECONDS = 30;
const SPECIAL_ORES = ['voltarite','echoQuartz','ferronRoot','lumicite','pyroclastCore','umbralAlloy','ferriteBark','luminaSpores','aetherQuartz','crysalith','emberglass'];

let appState = 'STARTUP';
let saveProfile = null;

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
    statistics:{
      totalRunsStarted:0,
      totalRunsCompleted:0,
      totalMissionsCompleted:0,
      totalEnemiesKilled:0,
      totalBossesKilled:0,
      totalOreMined:0
    }
  };
}

function normalizeProfile(profile){
  const base=createDefaultProfile();
  return {
    ...base,
    ...profile,
    resources:{...base.resources,...(profile?.resources || {})},
    permanentUpgrades:{...base.permanentUpgrades,...(profile?.permanentUpgrades || {})},
    statistics:{...base.statistics,...(profile?.statistics || {})}
  };
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
  saveGame();
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
  addResourceObjective('gild',300,5);
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
  const resources=saveProfile.resources;
  const runRes=g.resources || {};
  resources.gildShards += Math.floor(((runRes.gild || g.gold || 0) + 35 + saveProfile.runIndex*10)*rewardMul);
  resources.voltarite += Math.floor(((runRes.voltarite || g.nitra || 0) + 4)*rewardMul);
  resources.echoQuartz += Math.max(1, Math.floor((runRes.echo || g.objectiveEchoCollected || 0)/35));
  for(const id of ['ferriteBark','luminaSpores','aetherQuartz','crysalith','emberglass']){
    resources[id]=(resources[id] || 0)+Math.floor((runRes[id] || 0)*rewardMul);
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
  saveProfile.statistics.totalEnemiesKilled += g.kills;
  saveProfile.runIndex++;
  let missionCompleted=false;
  if(saveProfile.runIndex>RUNS_PER_MISSION){
    saveProfile.runIndex=1;
    saveProfile.missionIndex++;
    saveProfile.completedMissions++;
    saveProfile.statistics.totalMissionsCompleted++;
    saveProfile.resources.gildShards += Math.floor(120*missionDifficulty(saveProfile.missionIndex).rewardMultiplier);
    missionCompleted=true;
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
  saveProfile.statistics.totalRunsStarted++;
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
  addMenuButton('Play',showClassSelect);
  addMenuButton('Upgrades',showUpgradesMenu);
  addMenuButton('Gears',()=>showPlaceholderMenu('Gears','Gears feature coming later.'));
  addMenuButton('Milestones',()=>showPlaceholderMenu('Milestones','Milestones feature coming later.'));
  addMenuButton('Settings',showSettingsMenu);
  addMenuButton('Credits',showCreditsMenu);
}

function showClassSelect(){
  appState='MISSION_SELECT';
  setMenu('Choose Operator', `Mission ${saveProfile.missionIndex}, Run ${saveProfile.runIndex} of ${RUNS_PER_MISSION}. Complete objectives, defeat the sector boss, then reach extraction.`);
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

```

### EchoVein/PROJECT_CONTEXT.md
```md
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
```

