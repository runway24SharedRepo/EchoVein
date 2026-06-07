'use strict';

/* Core state, configuration, DOM references, data dictionaries, helpers, and canvas resize. */

const GAME_TITLE = 'Echo Vein';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

const TILE = 36;
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

const MINERALS = {
  gild: { id: 'gild', displayName: 'Gild Shards', shortName: 'Gild', color: '#ffcc4d', sprite: 'gildShard' },
  voltarite: { id: 'voltarite', displayName: 'Voltarite', shortName: 'Voltarite', color: '#ff5b5b', sprite: 'voltariteOre' },
  echo: { id: 'echo', displayName: 'Echo Shards', shortName: 'Echo', color: '#42d6ff', sprite: 'echoShard' },
  crust: { id: 'crust', displayName: 'Crust Stone', shortName: 'Crust', color: '#3a342f' },
  ironbasalt: { id: 'ironbasalt', displayName: 'Ironbasalt', shortName: 'Ironbasalt', color: '#302b2a' }
};

const TILE_DATA = {
  [TILE_ROCK]: MINERALS.crust,
  [TILE_HARD]: MINERALS.ironbasalt,
  [TILE_GOLD]: MINERALS.gild,
  [TILE_NITRA]: MINERALS.voltarite,
  [TILE_CRYSTAL]: MINERALS.echo
};

const WEAPON_DATA = {
  minigun: { name: 'Rotary Mauler' },
  carbine: { name: 'Vector Carbine' },
  flamer: { name: 'Thermal Lance' },
  satchel: { name: 'Seismic Charge' },
  drones: { name: 'Warden Drones' },
  boomerang: { name: 'Return Disc' },
  arc: { name: 'Storm Lattice' },
  rail: { name: 'Bore Rail' },
  sweeper: { name: 'Sifter Drone' }
};

const keys = new Set();
let mouse = { x: 0, y: 0, lastMove: -999, used: false };
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
  { icon:'🎯', name:'Targeting Optics', desc:'+1 projectile for bullet weapons.', apply:g=>g.player.extraProjectiles++ },
  { icon:'🛡️', name:'Armour Plates', desc:'+25 max HP and repair 20 HP.', apply:g=>{g.player.maxHp+=25; g.player.hp=Math.min(g.player.maxHp,g.player.hp+20);} },
  { icon:'👟', name:'Mag Boots', desc:'+10% movement speed.', apply:g=>g.player.speedMul*=1.10 },
  { icon:'🧲', name:'Resonance Magnet', desc:'+35% Echo Shard and mineral pickup range.', apply:g=>g.player.pickupMul*=1.35 },
  { icon:'🖱️', name:'Targeting Cursor', desc:'Unlock mouse-guided targeting. Move the cursor near a Hollowborn to bias player weapons toward it.', available:g=>!g.player.mouseTargeting, apply:g=>{ g.player.mouseTargeting=true; log(g,'Targeting Cursor linked. Move the mouse to guide player weapons.'); } },
  { icon:'🔷', name:'Sifter Drone', desc:'Adds a utility drone that roams out and collects Echo Shards for you.', apply:g=>addOrLevelWeapon(g,'sweeper') },
  { icon:'⛏️', name:'Tungsten Bore Bit', desc:'+35% mining speed and less heat per tile.', apply:g=>{g.player.mineMul*=1.35; g.player.heatEfficiency*=0.86;} },
  { icon:'❄️', name:'Cryo Coolant', desc:'Tool cools faster and overheats less often.', apply:g=>{g.player.coolMul*=1.35; g.player.maxHeat+=20;} },
  { icon:'🧨', name:'Seismic Charge', desc:'Adds a periodic explosion around the nearest swarm.', apply:g=>addOrLevelWeapon(g,'satchel') },
  { icon:'🛸', name:'Warden Drone Bay', desc:'Adds autonomous Warden Drones that roam and fire micro-bullets.', apply:g=>addOrLevelWeapon(g,'drones') },
  { icon:'➕', name:'Drone Bay Expansion', desc:'Adds more Warden Drones and improves their bullet damage.', apply:g=>{ addOrLevelWeapon(g,'drones'); addOrLevelWeapon(g,'drones'); g.player.droneDamageMul*=1.12; } },
  { icon:'🤖', name:'Drone Targeting AI', desc:'Warden Drones roam faster and fire more aggressively.', apply:g=>{ if(!g.weapons.find(w=>w.id==='drones')) addOrLevelWeapon(g,'drones'); g.player.droneSpeedMul*=1.18; g.player.droneFireRateMul*=1.30; } },
  { icon:'📡', name:'Drone Patrol Radius', desc:'Warden Drones roam farther from the operator and hit harder.', apply:g=>{ if(!g.weapons.find(w=>w.id==='drones')) addOrLevelWeapon(g,'drones'); g.player.droneOrbitMul*=1.20; g.player.droneDamageMul*=1.18; } },
  { icon:'🔍', name:'Sifter Optics', desc:'Unlocks the Sifter Drone if needed and increases its Echo Shard search radius.', apply:g=>{ if(!g.weapons.find(w=>w.id==='sweeper')) addOrLevelWeapon(g,'sweeper'); g.player.sweeperRangeMul*=1.35; } },
  { icon:'💨', name:'Sifter Turbo', desc:'Sifter Drones move faster and collect Echo Shards more aggressively.', apply:g=>{ if(!g.weapons.find(w=>w.id==='sweeper')) addOrLevelWeapon(g,'sweeper'); g.player.sweeperSpeedMul*=1.30; g.player.sweeperCollectMul*=1.18; } },
  { icon:'🪃', name:'Return Disc', desc:'Adds a returning disc that slices through Hollowborn on the way out and back.', apply:g=>addOrLevelWeapon(g,'boomerang') },
  { icon:'🌩️', name:'Storm Lattice', desc:'Adds chain lightning between nearby enemies.', apply:g=>addOrLevelWeapon(g,'arc') },
  { icon:'☄️', name:'Bore Rail', desc:'Adds a heavy piercing rail shot.', apply:g=>addOrLevelWeapon(g,'rail') },
  { icon:'❤️', name:'Field Reclaimer', desc:'Every 18 kills restore 8 HP.', apply:g=>g.player.vampire+=8 },
  { icon:'📦', name:'Supply Cache', desc:'Spend 15 Voltarite to gain full repair now, otherwise +20 max HP.', apply:g=>{ if(g.nitra>=15){g.nitra-=15; g.player.hp=g.player.maxHp;} else {g.player.maxHp+=20; g.player.hp+=20;} } },
  { icon:'🪤', name:'Trap Payload', desc:'Pathfinder traps gain larger blast radius and more damage. Other operators unlock emergency traps.', apply:g=>{ g.player.trapDamageMul*=1.30; g.player.trapRadiusMul*=1.15; g.player.canUseTraps=true; } },
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

function resizeCanvas(){
  canvas.width = Math.floor(window.innerWidth * DPR);
  canvas.height = Math.floor(window.innerHeight * DPR);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
