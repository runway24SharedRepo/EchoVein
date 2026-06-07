'use strict';

const DEBUG_MODE = true;
const debugState = { panelOpen:false, log:[] };

function debugLog(message){
  const line = `[DEBUG] ${message}`;
  debugState.log.unshift(line);
  debugState.log = debugState.log.slice(0, 80);
  if(game) log(game, line);
  renderDebugLog();
}

function renderDebugLog(){
  const box = document.getElementById('debugActionLog');
  if(box) box.textContent = debugState.log.slice(0, 18).join('\n');
}

function requireGame(){
  if(game && game.state === 'playing') return true;
  debugLog('Start a run before using this control.');
  return false;
}

function updateGameAfterDebug(){
  if(game) updateUI(game);
  renderDebugLog();
}

function debugApplyUpgrade(index){
  if(!requireGame()) return;
  const up = UPGRADE_POOL[index];
  if(!up) return;
  up.apply(game);
  debugLog(`Applied upgrade: ${up.name}`);
  updateGameAfterDebug();
}

function debugUnlockWeapon(id){
  if(!requireGame()) return;
  addOrLevelWeapon(game,id);
  const allowed=WEAPON_DATA[id]?.allowedClasses;
  const override=allowed && !allowed.includes(game.player.classId) ? ' (debug override)' : '';
  debugLog(`Unlocked/levelled weapon${override}: ${weaponName(id)}`);
  updateGameAfterDebug();
}

function debugSpawnEnemies(type,count){
  if(!requireGame()) return;
  for(let i=0;i<count;i++){
    const a = rand(0,Math.PI*2);
    const d = rand(160,260);
    const x = clamp(game.player.x + Math.cos(a)*d, TILE*3, WORLD_W-TILE*3);
    const y = clamp(game.player.y + Math.sin(a)*d, TILE*3, WORLD_H-TILE*3);
    game.enemies.push(new Enemy(x,y,type));
  }
  debugLog(`Spawned ${count} ${type} test enemies.`);
  updateGameAfterDebug();
}

function debugSpawnXpCluster(){
  if(!requireGame()) return;
  for(let i=0;i<12;i++){
    const a = rand(0,Math.PI*2);
    const d = rand(30,135);
    dropPickup(game, game.player.x+Math.cos(a)*d, game.player.y+Math.sin(a)*d, 'xp', randi(3,9));
  }
  debugLog('Spawned XP cluster.');
}

function debugSpawnVoltariteNode(){
  if(!requireGame()) return;
  const [px,py] = worldToTile(game.player.x, game.player.y);
  for(let r=2;r<10;r++){
    for(let y=py-r;y<=py+r;y++) for(let x=px-r;x<=px+r;x++){
      if(!inMap(x,y)) continue;
      const i = tileIdx(x,y);
      if(game.tiles[i] === TILE_ROCK || game.tiles[i] === TILE_EMPTY){
        game.tiles[i] = TILE_NITRA;
        game.tileHp[i] = 32;
        debugLog('Spawned Voltarite node near player.');
        return;
      }
    }
  }
  debugLog('Could not place Voltarite node.');
}

function debugClearEnemies(){ if(requireGame()){ game.enemies=[]; game.arcConnection.selectedEnemies=[]; debugLog('Cleared enemies.'); updateGameAfterDebug(); } }
function debugClearPickups(){ if(requireGame()){ game.pickups=[]; debugLog('Cleared pickups.'); updateGameAfterDebug(); } }
function debugClearProjectiles(){ if(requireGame()){ game.bullets=[]; game.enemyBullets=[]; game.missiles=[]; game.targetLocks=[]; game.boomerangs=[]; game.arcs=[]; game.particles=[]; debugLog('Cleared projectiles and transient VFX.'); } }
function debugHealPlayer(){ if(requireGame()){ game.player.hp=game.player.maxHp; debugLog('Healed player to full HP.'); updateGameAfterDebug(); } }
function debugAddXp(){ if(requireGame()){ gainXp(game, Math.max(10, Math.floor(game.xpNeed*0.55))); debugLog('Added XP.'); updateGameAfterDebug(); } }
function debugForceLevelUp(){ if(requireGame()){ gainXp(game, game.xpNeed - game.xp + 1); debugLog('Forced level-up.'); updateGameAfterDebug(); } }
function debugAddResource(resourceId, amount){
  if(!requireGame()) return;
  collectRunResource(game, resourceId, amount, {asXp: resourceId==='echo'});
  debugLog(`Added ${amount} ${MINERALS[resourceId]?.displayName || resourceId}.`);
  updateGameAfterDebug();
}
function debugAddGild(){ debugAddResource('gild',100); }
function debugAddVoltarite(){ debugAddResource('voltarite',50); }
function debugSpawnResource(resourceId, amount=8){
  if(!requireGame()) return;
  for(let i=0;i<amount;i++){
    const a=rand(0,Math.PI*2), d=rand(40,170);
    dropPickup(game, game.player.x+Math.cos(a)*d, game.player.y+Math.sin(a)*d, resourceId==='echo'?'xp':resourceId, resourceId==='echo'?randi(3,8):randi(1,4));
  }
  debugLog(`Spawned resource pickups: ${MINERALS[resourceId]?.displayName || resourceId}.`);
}
function debugUnlockVectorBurst(){ if(requireGame()){ addOrLevelWeapon(game,'vectorBurst'); debugLog('Vector Burst unlocked.'); updateGameAfterDebug(); } }
function debugVectorBurstCount(){ if(requireGame()){ upgradeVectorBurst(game,'count'); updateGameAfterDebug(); } }
function debugSetPressure(level){ if(requireGame()){ game.hollowPressure=Math.max(0,Math.floor(level)); game.nextPressureTime=(game.hollowPressure+1)*120; game.pressureFlash=2; debugLog(`Set Hollow Pressure to ${game.hollowPressure}.`); updateGameAfterDebug(); } }
function debugForceElitePattern(){ if(requireGame()){ game.hollowPressure=Math.max(game.hollowPressure||0,4); debugSpawnEnemies('elite',1); debugLog('Spawned high-pressure multi-shot elite.'); updateGameAfterDebug(); } }
function debugSpawnEscalatedBoss(){ if(requireGame()){ game.hollowPressure=Math.max(game.hollowPressure||0,5); debugSpawnEnemies('boss',1); debugLog('Spawned escalated boss profile.'); updateGameAfterDebug(); } }
function debugResetCooldowns(){ if(requireGame()){ game.player.dashCd=0; game.player.trapCd=0; for(const w of game.weapons) w.cd=0; debugLog('Reset cooldowns.'); updateGameAfterDebug(); } }
function debugToggleEnemyPaths(){ if(requireGame()){ game.debug.showEnemyPaths=!game.debug.showEnemyPaths; debugLog(`Enemy path debug ${game.debug.showEnemyPaths ? 'enabled' : 'disabled'}.`); updateGameAfterDebug(); } }

function debugToggleEnemyBullets(){ if(requireGame()){ game.debug.enemyBulletsEnabled = game.debug.enemyBulletsEnabled===false ? true : false; debugLog(`Enemy bullets ${game.debug.enemyBulletsEnabled ? 'enabled' : 'disabled'}.`); updateGameAfterDebug(); } }
function debugToggleEnemyBulletHitboxes(){ if(requireGame()){ game.debug.showEnemyBulletHitboxes=!game.debug.showEnemyBulletHitboxes; debugLog(`Enemy bullet hitboxes ${game.debug.showEnemyBulletHitboxes ? 'enabled' : 'disabled'}.`); updateGameAfterDebug(); } }
function debugToggleMiningArc(){ if(requireGame()){ game.debug.showMiningArc=!game.debug.showMiningArc; debugLog(`Mining contact arc debug ${game.debug.showMiningArc ? 'enabled' : 'disabled'}.`); updateGameAfterDebug(); } }
function debugToggleLowSpeedMining(){ if(requireGame()){ game.debug.lowSpeedMiningTest=!game.debug.lowSpeedMiningTest; debugLog(`Low-speed mining test ${game.debug.lowSpeedMiningTest ? 'enabled' : 'disabled'}.`); updateGameAfterDebug(); } }
function debugSpawnSmallRanged(){ debugSpawnEnemies('grunt',8); debugLog('Spawned small ranged test enemies.'); }
function debugSpawnManySmall(){ debugSpawnEnemies('swarmer',24); debugLog('Spawned many small enemies.'); }


function debugMiningTestArea(kind='corner'){
  if(!requireGame()) return;
  const p=game.player;
  const cx=Math.floor(p.x/TILE), cy=Math.floor(p.y/TILE);
  // Clear a small lab pocket around the player first.
  for(let y=cy-5;y<=cy+5;y++) for(let x=cx-5;x<=cx+7;x++){
    if(!inMap(x,y)) continue;
    const i=tileIdx(x,y);
    if(game.tiles[i]!==TILE_HARD){ game.tiles[i]=TILE_EMPTY; game.tileHp[i]=0; }
  }
  const putRock=(x,y,type=TILE_ROCK,hp=24)=>{ if(inMap(x,y)){ const i=tileIdx(x,y); game.tiles[i]=type; game.tileHp[i]=hp; } };

  if(kind==='corner'){
    putRock(cx+3,cy-1); putRock(cx+3,cy); putRock(cx+4,cy); putRock(cx+4,cy+1);
    p.x=(cx+0.5)*TILE; p.y=(cy+0.5)*TILE;
    debugLog('Mining test: low-speed block corner. Move diagonally/right into the corner.');
  } else if(kind==='wall'){
    for(let y=cy-3;y<=cy+3;y++) putRock(cx+3,y);
    p.x=(cx+0.5)*TILE; p.y=(cy+0.5)*TILE;
    debugLog('Mining test: scrape along mineable wall while holding input toward it.');
  } else if(kind==='tunnel'){
    for(let x=cx+2;x<=cx+8;x++) for(let y=cy-1;y<=cy+1;y++) putRock(x,y);
    p.x=(cx+0.5)*TILE; p.y=(cy+0.5)*TILE;
    debugLog('Mining test: one-tile tunnel start. Push right and observe sticky mining.');
  } else if(kind==='lava'){
    for(let y=cy-2;y<=cy+2;y++) putRock(cx+3,y,TILE_LAVA_ROCK,9999);
    p.x=(cx+0.5)*TILE; p.y=(cy+0.5)*TILE;
    debugLog('Mining test: non-mineable Lava Rock. It should slide, not mine.');
  }
  game.navigationVersion++;
  game.debug.showMiningArc=true;
  game.debug.lowSpeedMiningTest=true;
  p.miningLock=null;
  p.drillPressure=0;
  updateGameAfterDebug();
}
function debugMiningCornerTest(){ debugMiningTestArea('corner'); }
function debugMiningWallTest(){ debugMiningTestArea('wall'); }
function debugMiningTunnelTest(){ debugMiningTestArea('tunnel'); }
function debugMiningLavaTest(){ debugMiningTestArea('lava'); }

function debugHammerfallWeapon(create=false){
  if(!requireGame()) return null;
  let w=game.weapons.find(w=>w.id==='hammerfallSalvo');
  if(!w && create){
    addOrLevelWeapon(game,'hammerfallSalvo');
    w=game.weapons.find(w=>w.id==='hammerfallSalvo');
    const override=game.player.classId!=='bulwark' ? ' (debug override: non-Bulwark)' : '';
    debugLog(`Hammerfall Salvo unlocked${override}.`);
  }
  if(w) ensureHammerfallDefaults(w);
  return w;
}
function debugHammerfallUnlock(){ debugHammerfallWeapon(true); updateGameAfterDebug(); }
function debugHammerfallUpgrade(kind){ const w=debugHammerfallWeapon(true); if(!w) return; upgradeHammerfall(game,kind); debugLog(`Hammerfall ${kind} test upgrade applied.`); updateGameAfterDebug(); }
function debugHammerfallCount(){ debugHammerfallUpgrade('count'); }
function debugHammerfallDamage(){ debugHammerfallUpgrade('damage'); }
function debugHammerfallSpeed(){ debugHammerfallUpgrade('speed'); }
function debugHammerfallFuel(){ debugHammerfallUpgrade('fuel'); }
function debugHammerfallAccuracy(){ debugHammerfallUpgrade('accuracy'); }
function debugHammerfallSpawnTargets(count=16){ debugSpawnEnemies('grunt',count); debugLog(`Hammerfall target pack spawned: ${count}.`); }
function debugHammerfallSpawnElite(){ debugSpawnEnemies('elite',1); debugLog('Hammerfall elite priority target spawned.'); }
function debugHammerfallFireNow(){ const w=debugHammerfallWeapon(true); if(!w) return; w.cd=0; updateHammerfallSalvo(game,w,0); debugLog('Forced one Hammerfall salvo attempt.'); updateGameAfterDebug(); }

window.debugHammerfall = {
  unlock: debugHammerfallUnlock,
  spawnTargets: debugHammerfallSpawnTargets,
  spawnElite: debugHammerfallSpawnElite,
  count: debugHammerfallCount,
  damage: debugHammerfallDamage,
  speed: debugHammerfallSpeed,
  fuel: debugHammerfallFuel,
  accuracy: debugHammerfallAccuracy,
  fire: debugHammerfallFireNow
};


function debugForcePerformanceState(state){
  if(!requireGame()) return;
  game.debug.forcePerformanceState = state;
  if(game.performance) game.performance.state = state || PERF_STATES.HEALTHY;
  debugLog(`Performance state ${state ? 'forced to '+state : 'force cleared'}.`);
  updateGameAfterDebug();
}
function debugForcePerfHealthy(){ debugForcePerformanceState(PERF_STATES.HEALTHY); }
function debugForcePerfWarning(){ debugForcePerformanceState(PERF_STATES.WARNING); }
function debugForcePerfCritical(){ debugForcePerformanceState(PERF_STATES.CRITICAL); }
function debugClearPerfForce(){ debugForcePerformanceState(null); }
function debugStressSwarm(){
  if(!requireGame()) return;
  const p=game.player;
  for(let i=0;i<150;i++){
    const a=rand(0,Math.PI*2), d=rand(420,1050);
    const e=new Enemy(clamp(p.x+Math.cos(a)*d,80,WORLD_W-80),clamp(p.y+Math.sin(a)*d,80,WORLD_H-80), i%4===0?'grunt':'swarmer');
    game.enemies.push(e);
  }
  debugLog('Spawned performance stress swarm.');
  updateGameAfterDebug();
}
function debugToggleEnemyBudgetOverlay(){
  if(!requireGame()) return;
  game.debug.showEnemyBudget=!game.debug.showEnemyBudget;
  debugLog(`Enemy budget overlay ${game.debug.showEnemyBudget?'enabled':'disabled'}.`);
  updateGameAfterDebug();
}
function debugTogglePerfDespawnLog(){
  if(!requireGame()) return;
  game.debug.perfDespawnLog=!game.debug.perfDespawnLog;
  debugLog(`Performance despawn log ${game.debug.perfDespawnLog?'enabled':'disabled'}.`);
  updateGameAfterDebug();
}

window.debugPerformance = {
  healthy: debugForcePerfHealthy,
  warning: debugForcePerfWarning,
  critical: debugForcePerfCritical,
  clear: debugClearPerfForce,
  stress: debugStressSwarm,
  overlay: debugToggleEnemyBudgetOverlay,
  despawnLog: debugTogglePerfDespawnLog
};

window.debugCollectibles = {
  spawn: debugSpawnResource,
  vector: debugUnlockVectorBurst,
  vectorCount: debugVectorBurstCount,
  pressure: debugSetPressure,
  elite: debugForceElitePattern,
  boss: debugSpawnEscalatedBoss
};

window.debugMovement = {
  miningArc: debugToggleMiningArc,
  lowSpeed: debugToggleLowSpeedMining,
  bullets: debugToggleEnemyBullets,
  bulletHitboxes: debugToggleEnemyBulletHitboxes,
  spawnSmallRanged: debugSpawnSmallRanged,
  spawnManySmall: debugSpawnManySmall,
  testCorner: debugMiningCornerTest,
  testWall: debugMiningWallTest,
  testTunnel: debugMiningTunnelTest,
  testLava: debugMiningLavaTest
};

function debugResetAbilities(){
  if(!requireGame()) return;
  game.weapons = [];
  game.bullets = [];
  game.boomerangs = [];
  game.wardenDrones = [];
  game.sifterDrones = [];
  game.arcConnection = { unlocked:false, level:0, maxTargets:0, selectedEnemies:[], flash:0 };
  game.player.mouseTargeting = false;
  game.player.canUseTraps = game.player.classId === 'pathfinder';
  addOrLevelWeapon(game, game.selectedClass.weapon);
  debugLog('Reset weapons and special abilities to class start.');
  updateGameAfterDebug();
}

function toggleDebugPanel(){
  if(!DEBUG_MODE) return;
  debugState.panelOpen = !debugState.panelOpen;
  const panel = document.getElementById('debugPanel');
  if(panel) panel.classList.toggle('hidden', !debugState.panelOpen);
  renderDebugLog();
}

function makeDebugButton(label,onClick){
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}

function addDebugSection(panel,title,children){
  const section = document.createElement('section');
  section.className = 'debugSection';
  const h = document.createElement('h3');
  h.textContent = title;
  const grid = document.createElement('div');
  grid.className = 'debugGrid';
  for(const child of children) grid.appendChild(child);
  section.append(h,grid);
  panel.appendChild(section);
}

function buildDebugPanel(){
  if(!DEBUG_MODE) return;
  const toggle = document.createElement('button');
  toggle.id = 'debugToggle';
  toggle.className = 'debugToggle';
  toggle.textContent = 'Debug';
  toggle.addEventListener('click', toggleDebugPanel);
  document.body.appendChild(toggle);

  const panel = document.createElement('div');
  panel.id = 'debugPanel';
  panel.className = 'debugPanel hidden';
  const head = document.createElement('div');
  head.className = 'debugHead';
  head.innerHTML = '<h2>Debug Tools</h2>';
  head.appendChild(makeDebugButton('Close', toggleDebugPanel));
  panel.appendChild(head);

  addDebugSection(panel,'Power-Ups', UPGRADE_POOL.map((up,i)=>makeDebugButton(`Apply ${up.icon} ${up.name}`,()=>debugApplyUpgrade(i))));
  addDebugSection(panel,'Weapons & Abilities', Object.keys(WEAPON_DATA).map(id=>makeDebugButton(`Unlock ${weaponName(id)}`,()=>debugUnlockWeapon(id))).concat([
    makeDebugButton('Enable Pathfinder Trap Kit',()=>{ if(requireGame()){ game.player.canUseTraps=true; debugLog('Enabled Pathfinder Trap Kit.'); updateGameAfterDebug(); } }),
    makeDebugButton('Reset Weapons/Abilities',debugResetAbilities)
  ]));
  addDebugSection(panel,'Hammerfall Salvo Tests',[
    makeDebugButton('Unlock Hammerfall',debugHammerfallUnlock),
    makeDebugButton('Force Salvo Now',debugHammerfallFireNow),
    makeDebugButton('+ Missile Count',debugHammerfallCount),
    makeDebugButton('+ Missile Damage',debugHammerfallDamage),
    makeDebugButton('+ Missile Speed',debugHammerfallSpeed),
    makeDebugButton('+ Flight Time',debugHammerfallFuel),
    makeDebugButton('+ Accuracy',debugHammerfallAccuracy),
    makeDebugButton('Spawn 16 Targets',()=>debugHammerfallSpawnTargets(16)),
    makeDebugButton('Spawn Elite Target',debugHammerfallSpawnElite)
  ]);
  addDebugSection(panel,'Resources, Vector Burst & Pressure',[
    makeDebugButton('Spawn Ferrite Bark',()=>debugSpawnResource('ferriteBark')),
    makeDebugButton('Spawn Lumina Spores',()=>debugSpawnResource('luminaSpores')),
    makeDebugButton('Spawn Aether Quartz',()=>debugSpawnResource('aetherQuartz',4)),
    makeDebugButton('Spawn Crysalith',()=>debugSpawnResource('crysalith')),
    makeDebugButton('Spawn Emberglass',()=>debugSpawnResource('emberglass')),
    makeDebugButton('Unlock Vector Burst',debugUnlockVectorBurst),
    makeDebugButton('+ Vector Directions',debugVectorBurstCount),
    makeDebugButton('Pressure 0',()=>debugSetPressure(0)),
    makeDebugButton('Pressure 3',()=>debugSetPressure(3)),
    makeDebugButton('Pressure 6',()=>debugSetPressure(6)),
    makeDebugButton('Spawn Multi-Shot Elite',debugForceElitePattern),
    makeDebugButton('Spawn Escalated Boss',debugSpawnEscalatedBoss)
  ]);
  addDebugSection(panel,'Spawns & Clears',[
    makeDebugButton('Spawn 5 weak enemies',()=>debugSpawnEnemies('grunt',5)),
    makeDebugButton('Spawn small ranged pack',debugSpawnSmallRanged),
    makeDebugButton('Spawn many small enemies',debugSpawnManySmall),
    makeDebugButton('Spawn 1 elite enemy',()=>debugSpawnEnemies('elite',1)),
    makeDebugButton('Spawn XP cluster',debugSpawnXpCluster),
    makeDebugButton('Spawn Voltarite node',debugSpawnVoltariteNode),
    makeDebugButton('Clear enemies',debugClearEnemies),
    makeDebugButton('Clear pickups',debugClearPickups),
    makeDebugButton('Clear projectiles',debugClearProjectiles)
  ]);
  addDebugSection(panel,'Movement, Mining & Enemy Bullets',[
    makeDebugButton('Toggle Mining Contact Arc',debugToggleMiningArc),
    makeDebugButton('Toggle Low-Speed Mining Test',debugToggleLowSpeedMining),
    makeDebugButton('Mining Test: Corner',debugMiningCornerTest),
    makeDebugButton('Mining Test: Wall Scrape',debugMiningWallTest),
    makeDebugButton('Mining Test: One-Tile Tunnel',debugMiningTunnelTest),
    makeDebugButton('Mining Test: Lava Rock Slide',debugMiningLavaTest),
    makeDebugButton('Toggle Enemy Bullets',debugToggleEnemyBullets),
    makeDebugButton('Toggle Enemy Bullet Hitboxes',debugToggleEnemyBulletHitboxes)
  ]);
  addDebugSection(panel,'Pathfinding',[
    makeDebugButton('Toggle Show Enemy Paths',debugToggleEnemyPaths)
  ]);
  const perfSection = document.createElement('section');
  perfSection.className = 'debugSection';
  perfSection.innerHTML = '<h3>Adaptive Performance Metrics</h3><pre class="debugLog" id="debugPerfMetrics">Start a run to view metrics.</pre>';
  panel.appendChild(perfSection);
  addDebugSection(panel,'Adaptive Performance Tests',[
    makeDebugButton('Force PERF_HEALTHY',debugForcePerfHealthy),
    makeDebugButton('Force PERF_WARNING',debugForcePerfWarning),
    makeDebugButton('Force PERF_CRITICAL',debugForcePerfCritical),
    makeDebugButton('Clear Performance Force',debugClearPerfForce),
    makeDebugButton('Spawn Stress Test Swarm',debugStressSwarm),
    makeDebugButton('Toggle Enemy Budget Overlay',debugToggleEnemyBudgetOverlay),
    makeDebugButton('Toggle Perf Despawn Log',debugTogglePerfDespawnLog)
  ]);

  addDebugSection(panel,'Player State',[
    makeDebugButton('Heal player to full HP',debugHealPlayer),
    makeDebugButton('Add XP',debugAddXp),
    makeDebugButton('Force level-up',debugForceLevelUp),
    makeDebugButton('Add Gild Shards',debugAddGild),
    makeDebugButton('Add Voltarite',debugAddVoltarite),
    makeDebugButton('Reset cooldowns',debugResetCooldowns)
  ]);
  const logTitle = document.createElement('section');
  logTitle.className = 'debugSection';
  logTitle.innerHTML = '<h3>Debug Log</h3><pre class="debugLog" id="debugActionLog"></pre>';
  panel.appendChild(logTitle);
  document.body.appendChild(panel);
  debugLog('Debug system ready.');
}

window.addEventListener('DOMContentLoaded', buildDebugPanel);
