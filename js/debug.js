'use strict';

const NEW_ENEMY_SPRITE_TYPES = [
  'clawlingRunner','needleWisp','shellbackGuard','blisterPod','hexShardThrower',
  'sporeMother','emberCrawler','crystalLancer','voidMite','acidTick',
  'ironMaw','stormOrb','riftStalker','boneSkitter','magmaBurrower',
  'echoSiren','fractureBeetle','gloomBat','obsidianTitan','hollowTyrantVariant'
];

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

function debugSpawnNewEnemy(type){
  if(!requireGame()) return;
  debugSpawnEnemies(type,1);
  debugLog(`Spawned ${ENEMY_TYPES[type]?.displayName || type}.`);
}

function debugSpawnRandomNewEnemies(count=10){
  if(!requireGame()) return;
  for(let i=0;i<count;i++){
    const type=NEW_ENEMY_SPRITE_TYPES[randi(0,NEW_ENEMY_SPRITE_TYPES.length-1)];
    const a=rand(0,Math.PI*2), d=rand(180,330);
    const x=clamp(game.player.x+Math.cos(a)*d,TILE*3,WORLD_W-TILE*3);
    const y=clamp(game.player.y+Math.sin(a)*d,TILE*3,WORLD_H-TILE*3);
    game.enemies.push(new Enemy(x,y,type));
  }
  debugLog(`Spawned ${count} random new enemy-pack enemies.`);
  updateGameAfterDebug();
}

function debugClearNewEnemies(){
  if(!requireGame()) return;
  const before=game.enemies.length;
  game.enemies=game.enemies.filter(e=>!NEW_ENEMY_SPRITE_TYPES.includes(e.type));
  debugLog(`Cleared ${before-game.enemies.length} new enemy-pack enemies.`);
  updateGameAfterDebug();
}

window.debugEnemySprites = {
  spawn: debugSpawnNewEnemy,
  random10: ()=>debugSpawnRandomNewEnemies(10),
  clear: debugClearNewEnemies,
  types: NEW_ENEMY_SPRITE_TYPES
};

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
function debugClearProjectiles(){ if(requireGame()){ game.bullets=[]; game.enemyBullets=[]; game.missiles=[]; game.targetLocks=[]; game.boomerangs=[]; game.enemyBoomerangs=[]; game.arcs=[]; game.particles=[]; debugLog('Cleared projectiles and transient VFX.'); } }
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

function debugAddAccuracy(){ if(requireGame()){ game.player.accuracy=clamp((game.player.accuracy||0.35)+0.10,0,1); debugLog(`Accuracy now ${Math.round(game.player.accuracy*100)}%.`); updateGameAfterDebug(); } }
function debugResetAccuracy(){ if(requireGame()){ game.player.accuracy=0.35; game.player.accuracyBonus=0; debugLog('Accuracy reset to 35%.'); updateGameAfterDebug(); } }
function debugToggleControllerInfo(){ if(requireGame()){ game.debug.showController=!game.debug.showController; debugLog(`Controller debug ${game.debug.showController?'enabled':'disabled'}.`); updateGameAfterDebug(); } }
function debugToggleAccuracyCone(){ if(requireGame()){ game.debug.showAccuracyCone=!game.debug.showAccuracyCone; debugLog(`Accuracy cone debug ${game.debug.showAccuracyCone?'enabled':'disabled'}.`); updateGameAfterDebug(); } }
window.debugController = {
  info: debugToggleControllerInfo,
  accuracyCone: debugToggleAccuracyCone,
  addAccuracy: debugAddAccuracy,
  resetAccuracy: debugResetAccuracy,
  state: ()=>gamepadState
};

function debugResetCooldowns(){ if(requireGame()){ game.player.dashCd=0; game.player.trapCd=0; for(const w of game.weapons) w.cd=0; debugLog('Reset cooldowns.'); updateGameAfterDebug(); } }

function debugToggleScaledTileGrid(){
  if(requireGame()){
    game.debug.showScaledTileGrid=!game.debug.showScaledTileGrid;
    debugLog(`Scaled tile grid ${game.debug.showScaledTileGrid?'enabled':'disabled'} (${TILE_SIZE_BASE}px x ${TILE_SIZE_SCALE} = ${TILE}px).`);
    updateGameAfterDebug();
  }
}
function debugToggleCollisionTiles(){
  if(requireGame()){
    game.debug.showCollisionTiles=!game.debug.showCollisionTiles;
    debugLog(`Collision tile overlay ${game.debug.showCollisionTiles?'enabled':'disabled'}.`);
    updateGameAfterDebug();
  }
}
function debugPrintTileScaleInfo(){
  const info=typeof getTileScaleInfo==='function'?getTileScaleInfo():{base:TILE_SIZE_BASE,scale:TILE_SIZE_SCALE,effective:TILE,mapPixelWidth:WORLD_W,mapPixelHeight:WORLD_H};
  console.log('Tile scale info', info);
  debugLog(`Tile scale: base ${info.base}px, scale ${info.scale}x, effective ${info.effective}px, map ${info.mapPixelWidth}x${info.mapPixelHeight}.`);
}

function debugToggleEnemyPaths(){ if(requireGame()){ game.debug.showEnemyPaths=!game.debug.showEnemyPaths; debugLog(`Enemy path debug ${game.debug.showEnemyPaths ? 'enabled' : 'disabled'}.`); updateGameAfterDebug(); } }
function debugToggleRawEnemyPaths(){ if(requireGame()){ game.debug.showRawEnemyPaths=!game.debug.showRawEnemyPaths; debugLog(`Raw enemy path overlay ${game.debug.showRawEnemyPaths ? 'enabled' : 'disabled'}.`); game.debug.showEnemyPaths=true; updateGameAfterDebug(); } }
function debugToggleSmoothedEnemyPaths(){ if(requireGame()){ game.debug.showSmoothedEnemyPaths=game.debug.showSmoothedEnemyPaths===false; debugLog(`Smoothed enemy path overlay ${game.debug.showSmoothedEnemyPaths!==false ? 'enabled' : 'disabled'}.`); game.debug.showEnemyPaths=true; updateGameAfterDebug(); } }
function debugToggleCornerCurvePoints(){ if(requireGame()){ game.debug.showCornerCurvePoints=game.debug.showCornerCurvePoints===false; debugLog(`Corner curve points ${game.debug.showCornerCurvePoints!==false ? 'enabled' : 'disabled'}.`); game.debug.showEnemyPaths=true; updateGameAfterDebug(); } }
function debugToggleEnemyLookaheadTargets(){ if(requireGame()){ game.debug.showEnemyLookaheadTargets=game.debug.showEnemyLookaheadTargets===false; debugLog(`Enemy lookahead targets ${game.debug.showEnemyLookaheadTargets!==false ? 'enabled' : 'disabled'}.`); game.debug.showEnemyPaths=true; updateGameAfterDebug(); } }
function debugToggleEnemyPathingRadius(){ if(requireGame()){ game.debug.showEnemyPathingRadius=!game.debug.showEnemyPathingRadius; debugLog(`Enemy pathing radius overlay ${game.debug.showEnemyPathingRadius ? 'enabled' : 'disabled'}.`); game.debug.showEnemyPaths=true; updateGameAfterDebug(); } }

function debugTogglePathFollowingOverlay(){ if(requireGame()){ game.debug.showPathFollowingOverlay=!game.debug.showPathFollowingOverlay; game.debug.showEnemyPaths=true; debugLog(`Path-following overlay ${game.debug.showPathFollowingOverlay?'enabled':'disabled'}.`); updateGameAfterDebug(); } }
function debugToggleOfftrackOverlay(){ if(requireGame()){ game.debug.showOfftrackDistanceOverlay=!game.debug.showOfftrackDistanceOverlay; game.debug.showPathFollowingOverlay=true; game.debug.showEnemyPaths=true; debugLog(`Off-track distance overlay ${game.debug.showOfftrackDistanceOverlay?'enabled':'disabled'}.`); updateGameAfterDebug(); } }
function debugTogglePathClearanceOverlay(){ if(requireGame()){ game.debug.showPathClearanceOverlay=!game.debug.showPathClearanceOverlay; game.debug.showEnemyPaths=true; debugLog(`Path clearance overlay ${game.debug.showPathClearanceOverlay?'enabled':'disabled'}.`); updateGameAfterDebug(); } }
function debugRecalculateEnemyPaths(){ if(requireGame()){ for(const e of game.enemies){ e.pathTimer=0; e.pathVersion=-1; e.pathProgressDistance=0; e.pathProgressStallTimer=0; } debugLog('Forced enemy path recalculation.'); updateGameAfterDebug(); } }
function debugToggleFreezeEnemies(){ if(requireGame()){ game.debug.freezeEnemies=!game.debug.freezeEnemies; debugLog(`Enemy movement freeze ${game.debug.freezeEnemies?'enabled':'disabled'}.`); updateGameAfterDebug(); } }
function debugPrintPathFollowingStats(){ if(!requireGame()) return; const m=typeof collectEnemyPathFollowingMetrics==='function'?collectEnemyPathFollowingMetrics(game):{}; console.log('Path-following metrics',m); debugLog(`Path following: avg offtrack ${(m.avg||0).toFixed(1)}px, max ${(m.max||0).toFixed(1)}px, warning ${m.warning||0}, critical ${m.critical||0}, stalling ${m.stalling||0}.`); }
function debugPathFollowingStressTest(){ if(!requireGame()) return; debugSmoothCornerTestMap(); game.debug.showPathFollowingOverlay=true; game.debug.showOfftrackDistanceOverlay=true; game.debug.showPathClearanceOverlay=true; for(let i=0;i<18;i++){ const p=game.player; game.enemies.push(new Enemy(p.x-rand(360,520),p.y-rand(200,420), i%4===0?'guard':i%3===0?'swarmer':'grunt')); } debugLog('Path-following stress test spawned extra enemies and enabled overlays.'); updateGameAfterDebug(); }
function debugToggleCornerSmoothing(){ if(typeof ENEMY_CORNER_SMOOTHING!=='undefined'){ ENEMY_CORNER_SMOOTHING.enabled=!ENEMY_CORNER_SMOOTHING.enabled; if(game){ for(const e of game.enemies){ e.pathTimer=0; e.pathVersion=-1; } } debugLog(`Enemy corner smoothing ${ENEMY_CORNER_SMOOTHING.enabled ? 'enabled' : 'disabled'}.`); updateGameAfterDebug(); } }
function debugSmoothCornerTestMap(){
  if(!requireGame()) return;
  const p=game.player;
  const cx=Math.floor(p.x/TILE), cy=Math.floor(p.y/TILE);
  for(let y=cy-5;y<=cy+5;y++) for(let x=cx-5;x<=cx+7;x++){
    if(!inMap(x,y)) continue;
    game.tiles[tileIdx(x,y)]=TILE_ROCK;
    game.tileHp[tileIdx(x,y)]=28;
  }
  for(let x=cx-4;x<=cx+2;x++){ game.tiles[tileIdx(x,cy)]=TILE_EMPTY; game.tileHp[tileIdx(x,cy)]=0; }
  for(let y=cy;y<=cy+5;y++){ game.tiles[tileIdx(cx+2,y)]=TILE_EMPTY; game.tileHp[tileIdx(cx+2,y)]=0; }
  p.x=tileToWorldCenterX(cx+2); p.y=tileToWorldCenterY(cy+5);
  game.enemies=[];
  for(let i=0;i<10;i++) game.enemies.push(new Enemy(tileToWorldCenterX(cx-4-i%3),tileToWorldCenterY(cy-1+Math.floor(i/3)),'grunt'));
  game.navigationVersion++;
  game.debug.showEnemyPaths=true; game.debug.showRawEnemyPaths=true; game.debug.showCornerCurvePoints=true; game.debug.showEnemyLookaheadTargets=true;
  debugLog('Created smooth-corner L-tunnel test map. Enemies should curve through the 90-degree turn.');
  updateGameAfterDebug();
}

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


function debugToggleFogOfWar(){
  setFogOfWarEnabled(!getFogSettings().fogOfWarEnabled);
  debugLog(`Fog of War ${getFogSettings().fogOfWarEnabled ? 'enabled' : 'disabled'}.`);
  updateGameAfterDebug();
}
function debugToggleFogRadius(){
  if(!requireGame()) return;
  game.debug.showFogRadius=!game.debug.showFogRadius;
  debugLog(`Fog radius debug ${game.debug.showFogRadius ? 'enabled' : 'disabled'}.`);
  updateGameAfterDebug();
}
function debugFogLow(){ setFogIntensityPreset('low'); debugLog('Fog preset: low.'); updateGameAfterDebug(); }
function debugFogMedium(){ setFogIntensityPreset('medium'); debugLog('Fog preset: medium.'); updateGameAfterDebug(); }
function debugFogHigh(){ setFogIntensityPreset('high'); debugLog('Fog preset: high.'); updateGameAfterDebug(); }


function debugSpawnHexShard(count=1){
  if(!requireGame()) return;
  for(let i=0;i<count;i++){
    const a=rand(0,Math.PI*2), d=rand(160,240);
    const x=clamp(game.player.x+Math.cos(a)*d,TILE*3,WORLD_W-TILE*3);
    const y=clamp(game.player.y+Math.sin(a)*d,TILE*3,WORLD_H-TILE*3);
    game.enemies.push(new Enemy(x,y,'hexShard'));
  }
  debugLog(`Spawned ${count} Hex Shard enemy/enemies.`);
  updateGameAfterDebug();
}
function debugSpawnFiveHexShards(){ debugSpawnHexShard(5); }
function debugForceHexWarning(){
  if(!requireGame()) return;
  let e=game.enemies.find(e=>e.type==='hexShard');
  if(!e){ debugSpawnHexShard(1); e=game.enemies.find(e=>e.type==='hexShard'); }
  if(e){ e.detonationStarted=true; e.state='detonationWarning'; e.detonationTimer=1.0; e.warningSoundTimer=0; debugLog('Forced Hex Shard detonation warning.'); }
}
function debugSpawnEnemyBoomerang(){
  if(!requireGame()) return;
  let e=game.enemies.find(e=>e.type==='hexShard');
  if(!e){ debugSpawnHexShard(1); e=game.enemies.find(e=>e.type==='hexShard'); }
  if(e){ throwEnemyBoomerang(game,e); debugLog('Spawned Hex Shard boomerang projectile.'); }
}
function debugToggleLavaDamage(){
  if(!requireGame()) return;
  game.debug.lavaDamageEnabled = game.debug.lavaDamageEnabled===false ? true : false;
  debugLog(`Lava contact damage ${game.debug.lavaDamageEnabled ? 'enabled' : 'disabled'}.`);
  updateGameAfterDebug();
}
function debugToggleLavaZones(){
  if(!requireGame()) return;
  game.debug.showLavaZones=!game.debug.showLavaZones;
  debugLog(`Lava collision zones ${game.debug.showLavaZones ? 'enabled' : 'disabled'}.`);
  updateGameAfterDebug();
}
function debugToggleHexRanges(){
  if(!requireGame()) return;
  game.debug.showHexRanges=!game.debug.showHexRanges;
  debugLog(`Hex Shard ranges ${game.debug.showHexRanges ? 'enabled' : 'disabled'}.`);
  updateGameAfterDebug();
}

window.debugHex = {
  spawn: ()=>debugSpawnHexShard(1),
  spawn5: debugSpawnFiveHexShards,
  warning: debugForceHexWarning,
  boomerang: debugSpawnEnemyBoomerang,
  lavaDamage: debugToggleLavaDamage,
  lavaZones: debugToggleLavaZones,
  ranges: debugToggleHexRanges
};



function showSpriteTestPanel(){
  let panel=document.getElementById('spriteTestPanel');
  if(panel){ panel.remove(); return; }
  panel=document.createElement('div');
  panel.id='spriteTestPanel';
  panel.className='spriteTestPanel';
  const rows=(typeof getSpriteLoadReport==='function' ? getSpriteLoadReport() : []).map(r=>{
    const status=r.ok?'loaded':'missing';
    const wh=r.ok?`${r.width}×${r.height}`:'fallback active';
    const img=r.ok?`<img src="${r.url}" alt="${r.id}">`:'<div class="spriteMissing">?</div>';
    return `<div class="spriteTestRow ${r.ok?'ok':'missing'}">${img}<div><b>${r.id}</b><span>${r.url}</span><small>${status} · ${wh}</small></div></div>`;
  }).join('');
  panel.innerHTML=`<div class="spriteTestHead"><h2>Sprite Test Panel</h2><button id="spriteTestClose">Close</button></div><div class="spriteTestGrid">${rows}</div>`;
  document.body.appendChild(panel);
  document.getElementById('spriteTestClose')?.addEventListener('click',()=>panel.remove());
  debugLog('Sprite Test Panel opened. Missing sprites use procedural fallbacks.');
}

function debugPlaceResourceNode(resourceId){
  if(!requireGame()) return;
  const def=(RESOURCE_TILE_TYPES || []).find(r=>r.resourceId===resourceId);
  if(!def){ debugLog(`No resource tile definition for ${resourceId}.`); return; }
  const p=game.player;
  const baseTx=Math.floor(p.x/TILE)+2;
  const baseTy=Math.floor(p.y/TILE);
  for(let y=baseTy-1;y<=baseTy+1;y++) for(let x=baseTx-1;x<=baseTx+1;x++){
    if(!inMap(x,y)) continue;
    const i=tileIdx(x,y);
    if(game.tiles[i]!==TILE_HARD && game.tiles[i]!==TILE_LAVA_ROCK){ game.tiles[i]=TILE_EMPTY; game.tileHp[i]=0; }
  }
  const i=tileIdx(baseTx,baseTy);
  game.tiles[i]=def.tile;
  game.tileHp[i]=def.hp || 34;
  game.navigationVersion++;
  debugLog(`Placed resource node: ${MINERALS[resourceId]?.displayName || resourceId}.`);
  updateGameAfterDebug();
}

function debugSpawnExtractionCraft(){
  if(!requireGame()) return;
  if(typeof spawnExtractionCraft === 'function'){
    game.bossDefeated=true;
    spawnExtractionCraft(game);
    debugLog('Spawned extraction craft for sprite test.');
    updateGameAfterDebug();
  }
}
function debugSpawnTrapSprite(){ if(requireGame()){ game.player.canUseTraps=true; placeTrap(game); debugLog('Placed Pathfinder trap sprite test.'); updateGameAfterDebug(); } }
function debugSpawnHammerfallMissileSprite(){
  if(!requireGame()) return;
  const p=game.player;
  game.missiles.push({x:p.x,y:p.y,vx:360,vy:0,r:5,age:0,life:1.8,damage:1,speed:360,accuracy:1,turnRate:3,phase:'launch',trail:[]});
  debugLog('Spawned Hammerfall missile sprite test.');
}
function debugSpawnEnemyRedBulletSprite(){
  if(!requireGame()) return;
  const p=game.player;
  game.enemyBullets.push({x:p.x+120,y:p.y,vx:-160,vy:0,r:5,life:2.2,damage:1,destructive:false,color:'#ff3636',small:true});
  debugLog('Spawned enemy red bullet sprite test.');
}
function debugSpawnDestructiveBulletSprite(){
  if(!requireGame()) return;
  const p=game.player;
  game.enemyBullets.push({x:p.x+140,y:p.y+28,vx:-140,vy:0,r:7,life:2.4,damage:1,destructive:true,color:'#ff7038',small:false});
  debugLog('Spawned destructive enemy bullet sprite test.');
}

function debugVfxPoint(useCursor=false){
  if(!requireGame()) return null;
  if(useCursor && typeof mouseWorld==='function') return mouseWorld(game);
  return {x:game.player.x,y:game.player.y};
}
function debugPlayVfx(name,useCursor=false){
  const pt=debugVfxPoint(useCursor); if(!pt) return;
  const comp=(typeof VFX_COMPOSITIONS!=='undefined' && VFX_COMPOSITIONS[name]) ? VFX_COMPOSITIONS[name] : null;
  const radius=comp?.radius || 64;
  const color=comp?.color || '#ff9f43';
  if(typeof spawnVfxComposition==='function') spawnVfxComposition(game,name,pt.x,pt.y,{radius,color});
  debugLog(`Played VFX composition: ${name}${useCursor?' at cursor':' at player'}.`);
  updateGameAfterDebug();
}
function debugPlayRandomVfx(){
  const names=Object.keys(VFX_COMPOSITIONS || {genericExplosion:{}});
  debugPlayVfx(names[randi(0,names.length-1)] || 'genericExplosion');
}
function debugClearVfx(){
  if(!requireGame()) return;
  const before=game.particles.length;
  game.particles=[];
  game.arcs=[];
  debugLog(`Cleared ${before} active VFX/particles.`);
  updateGameAfterDebug();
}
function debugSpawnRandomVfx(count=10){
  if(!requireGame()) return;
  const names=Object.keys(VFX_COMPOSITIONS || {genericExplosion:{}});
  for(let i=0;i<count;i++){
    const a=rand(0,Math.PI*2), d=rand(20,260);
    const name=names[randi(0,names.length-1)] || 'genericExplosion';
    spawnVfxComposition(game,name,game.player.x+Math.cos(a)*d,game.player.y+Math.sin(a)*d);
  }
  debugLog(`Spawned ${count} random VFX bursts.`);
  updateGameAfterDebug();
}
let debugVfxStressTimer=null;
function debugVfxStress5s(){
  if(!requireGame()) return;
  if(debugVfxStressTimer){ clearInterval(debugVfxStressTimer); debugVfxStressTimer=null; debugLog('Stopped VFX stress test.'); return; }
  const end=performance.now()+5000;
  debugVfxStressTimer=setInterval(()=>{
    if(!game || performance.now()>end){ clearInterval(debugVfxStressTimer); debugVfxStressTimer=null; debugLog('VFX stress test complete.'); return; }
    debugSpawnRandomVfx(5);
  },240);
  debugLog('Started VFX stress test for 5 seconds.');
}
function debugToggleFullVfxBudget(){
  if(!requireGame()) return;
  game.debug.forceFullVfx=!game.debug.forceFullVfx;
  debugLog(`Full VFX regardless of performance budget ${game.debug.forceFullVfx?'enabled':'disabled'}.`);
  updateGameAfterDebug();
}
function debugPlaySelectedVfxSprite(useCursor=false){
  const pt=debugVfxPoint(useCursor); if(!pt) return;
  const select=document.getElementById('debugVfxSpriteSelect');
  const scale=parseFloat(document.getElementById('debugVfxScale')?.value || '1');
  const lifetime=parseFloat(document.getElementById('debugVfxLifetime')?.value || '0.35');
  const alpha=parseFloat(document.getElementById('debugVfxAlpha')?.value || '0.9');
  const spriteId=select?.value || 'explosionCoreFlash01';
  const size=96*clamp(scale,0.1,5);
  if(typeof addSpriteParticle==='function') addSpriteParticle(game,spriteId,pt.x,pt.y,clamp(lifetime,0.05,3),size,{
    targetSize:size*1.18,
    rotation:rand(0,Math.PI*2),
    spin:rand(-2,2),
    alphaMul:clamp(alpha,0.05,1),
    glowColor:'#ffcc4d',
    glowBlur:10,
    additive:true,
    important:true
  });
  if(game.debug) game.debug.lastVfxComposition=`sprite:${spriteId}`;
  debugLog(`Played VFX sprite: ${spriteId}${useCursor?' at cursor':' at player'}.`);
  updateGameAfterDebug();
}
function makeVfxSpritePreviewControls(){
  const wrap=document.createElement('div');
  wrap.className='debugVfxControls';
  const ids=Object.values(EXPLOSION_VFX_SPRITES || {}).flat();
  wrap.innerHTML=`
    <label>Sprite <select id="debugVfxSpriteSelect">${ids.map(id=>`<option value="${id}">${id}</option>`).join('')}</select></label>
    <label>Scale <input id="debugVfxScale" type="number" value="1.2" min="0.2" max="5" step="0.1"></label>
    <label>Lifetime <input id="debugVfxLifetime" type="number" value="0.35" min="0.05" max="3" step="0.05"></label>
    <label>Alpha <input id="debugVfxAlpha" type="number" value="0.9" min="0.05" max="1" step="0.05"></label>
  `;
  wrap.appendChild(makeDebugButton('Play Selected Sprite at Player',()=>debugPlaySelectedVfxSprite(false)));
  wrap.appendChild(makeDebugButton('Play Selected Sprite at Cursor',()=>debugPlaySelectedVfxSprite(true)));
  return wrap;
}

window.debugVfx = {
  play: debugPlayVfx,
  random: debugPlayRandomVfx,
  random10: ()=>debugSpawnRandomVfx(10),
  random50: ()=>debugSpawnRandomVfx(50),
  stress: debugVfxStress5s,
  clear: debugClearVfx,
  fullBudget: debugToggleFullVfxBudget,
  sprite: debugPlaySelectedVfxSprite,
};



function debugSpawnChargingWaveNow(count=null){
  if(!requireGame()) return;
  const cw=ensureChargingWaveState(game);
  cw.warningActive=false;
  cw.active=false;
  cw.activeEnemyIds=[];
  cw.nextAllowedTime=0;
  const spawned=spawnChargingWave(game,{count:count || undefined, angle:rand(0,Math.PI*2)});
  debugLog(`Spawned charging wave now: ${spawned} Rift Chargers.`);
  updateGameAfterDebug();
}
function debugSpawnSmallChargingWave(){ debugSpawnChargingWaveNow(10); }
function debugSpawnFullChargingWave(){ debugSpawnChargingWaveNow(60); }
function debugForceNextChargingWaveCheck(){
  if(!requireGame()) return;
  const cw=ensureChargingWaveState(game);
  cw.forceNextCheck=true;
  cw.checkTimer=0;
  cw.nextAllowedTime=Math.min(cw.nextAllowedTime||0,game.time||0);
  debugLog('Forced next charging-wave scheduler check.');
}
function debugToggleRandomChargingWaves(){
  if(!requireGame()) return;
  const cw=ensureChargingWaveState(game);
  cw.enabled=!cw.enabled;
  debugLog(`Random charging waves ${cw.enabled?'enabled':'disabled'}.`);
  updateGameAfterDebug();
}
function debugToggleChargingWaveSpawnDirection(){ if(requireGame()){ game.debug.showChargingWaveSpawnDirection=!game.debug.showChargingWaveSpawnDirection; debugLog(`Charging wave spawn direction ${game.debug.showChargingWaveSpawnDirection?'shown':'hidden'}.`); updateGameAfterDebug(); } }
function debugToggleChargingWaveFormationTargets(){ if(requireGame()){ game.debug.showChargingWaveFormationTargets=!game.debug.showChargingWaveFormationTargets; debugLog(`Charging wave formation targets ${game.debug.showChargingWaveFormationTargets?'shown':'hidden'}.`); updateGameAfterDebug(); } }
function debugToggleChargingWaveTriggerRadius(){ if(requireGame()){ game.debug.showChargingWaveTriggerRadius=!game.debug.showChargingWaveTriggerRadius; debugLog(`Charging wave trigger radius ${game.debug.showChargingWaveTriggerRadius?'shown':'hidden'}.`); updateGameAfterDebug(); } }
function debugToggleChargingWaveDamageRadius(){ if(requireGame()){ game.debug.showChargingWaveDamageRadius=!game.debug.showChargingWaveDamageRadius; debugLog(`Charging wave damage radius ${game.debug.showChargingWaveDamageRadius?'shown':'hidden'}.`); updateGameAfterDebug(); } }
function debugPrintChargingWaveMetrics(){
  if(!requireGame()) return;
  const m=debugChargingWaveMetrics(game);
  console.log('Charging wave metrics',m,game.chargingWave);
  debugLog(`Charging wave metrics printed. Alive ${m.alive}, budget ${m.budget}, skip: ${m.skip}`);
}
function updateChargingWaveDebugPanel(g){
  const box=document.getElementById('debugChargingWaveMetrics');
  if(!box || !g) return;
  const cw=ensureChargingWaveState(g);
  const m=typeof debugChargingWaveMetrics==='function' ? debugChargingWaveMetrics(g) : {};
  box.textContent=[
    `Charging waves enabled: ${m.enabled?'yes':'no'}`,
    `Time since last charging wave: ${(m.timeSinceLast||0).toFixed(1)}s`,
    `Next allowed charging wave time: ${(m.nextAllowed||0).toFixed(1)}s`,
    `Current charging wave active: ${m.active?'yes':'no'}`,
    `Warning active: ${m.warning?'yes':'no'} (${(cw.warningTimer||0).toFixed(1)}s)`,
    `Charging wave enemies alive: ${m.alive||0}`,
    `Charging wave spawn budget: ${m.budget||0}`,
    `Last charging wave skip reason: ${m.skip || cw.lastSkipReason || '-'}`
  ].join('\n');
}

window.debugChargingWave={
  spawn:()=>debugSpawnChargingWaveNow(),
  small:debugSpawnSmallChargingWave,
  full:debugSpawnFullChargingWave,
  forceCheck:debugForceNextChargingWaveCheck,
  toggle:debugToggleRandomChargingWaves,
  metrics:debugPrintChargingWaveMetrics,
};
window.updateChargingWaveDebugPanel=updateChargingWaveDebugPanel;

function debugOpenRunStatsScreen(){ if(requireGame()){ if(typeof showRunStatsScreen==='function') showRunStatsScreen(game,{title:'Debug Run Statistics',cause:'Manual debug open'}); debugLog('Opened run statistics screen.'); } }
function debugAddObjectiveProgress(){ if(requireGame()){ for(const o of game.objectives||[]){ if(!o.completed){ addObjectiveProgress(game,o.id,10); break; } } updateGameAfterDebug(); debugLog('Added +10 objective progress.'); } }
function debugForceCompleteObjective(){ if(requireGame()){ const o=(game.objectives||[]).find(x=>!x.completed); if(o){ addObjectiveProgress(game,o.id,(o.targetAmount||0)-(o.currentAmount||0)); updateGameAfterDebug(); debugLog('Forced objective complete.'); } } }
function debugClearRunStats(){ if(requireGame()){ game.runStats=typeof createRunStats==='function'?createRunStats():null; updateGameAfterDebug(); debugLog('Cleared run stats.'); } }

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
  addDebugSection(panel,'Charging Waves',[
    makeDebugButton('Spawn charging wave now',()=>debugSpawnChargingWaveNow()),
    makeDebugButton('Spawn small charging wave (10)',debugSpawnSmallChargingWave),
    makeDebugButton('Spawn full charging wave (60)',debugSpawnFullChargingWave),
    makeDebugButton('Force next random wave check',debugForceNextChargingWaveCheck),
    makeDebugButton('Toggle random charging waves',debugToggleRandomChargingWaves),
    makeDebugButton('Show charging wave spawn direction',debugToggleChargingWaveSpawnDirection),
    makeDebugButton('Show formation target points',debugToggleChargingWaveFormationTargets),
    makeDebugButton('Show explosion trigger radius',debugToggleChargingWaveTriggerRadius),
    makeDebugButton('Show explosion damage radius',debugToggleChargingWaveDamageRadius),
    makeDebugButton('Print budget/skip reason',debugPrintChargingWaveMetrics)
  ]);
  const chargingWaveMetrics = document.createElement('section');
  chargingWaveMetrics.className = 'debugSection';
  chargingWaveMetrics.innerHTML = '<h3>Charging Wave Metrics</h3><pre class="debugLog" id="debugChargingWaveMetrics">Start a run to view charging wave metrics.</pre>';
  panel.appendChild(chargingWaveMetrics);
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
  addDebugSection(panel,'Hex Shard & Lava Hazard Tests',[
    makeDebugButton('Spawn Hex Shard',()=>debugSpawnHexShard(1)),
    makeDebugButton('Spawn 5 Hex Shards',debugSpawnFiveHexShards),
    makeDebugButton('Force Hex Detonation Warning',debugForceHexWarning),
    makeDebugButton('Spawn Hex Boomerang',debugSpawnEnemyBoomerang),
    makeDebugButton('Toggle Lava Contact Damage',debugToggleLavaDamage),
    makeDebugButton('Toggle Lava Collision Zones',debugToggleLavaZones),
    makeDebugButton('Toggle Hex Ranges',debugToggleHexRanges)
  ]);
  addDebugSection(panel,'New Enemy Sprite Pack',[
    makeDebugButton('Spawn Clawling Runner',()=>debugSpawnNewEnemy('clawlingRunner')),
    makeDebugButton('Spawn Needle Wisp',()=>debugSpawnNewEnemy('needleWisp')),
    makeDebugButton('Spawn Shellback Guard',()=>debugSpawnNewEnemy('shellbackGuard')),
    makeDebugButton('Spawn Blister Pod',()=>debugSpawnNewEnemy('blisterPod')),
    makeDebugButton('Spawn Hex Shard Thrower',()=>debugSpawnNewEnemy('hexShardThrower')),
    makeDebugButton('Spawn Spore Mother',()=>debugSpawnNewEnemy('sporeMother')),
    makeDebugButton('Spawn Ember Crawler',()=>debugSpawnNewEnemy('emberCrawler')),
    makeDebugButton('Spawn Crystal Lancer',()=>debugSpawnNewEnemy('crystalLancer')),
    makeDebugButton('Spawn Void Mite',()=>debugSpawnNewEnemy('voidMite')),
    makeDebugButton('Spawn Acid Tick',()=>debugSpawnNewEnemy('acidTick')),
    makeDebugButton('Spawn Iron Maw',()=>debugSpawnNewEnemy('ironMaw')),
    makeDebugButton('Spawn Storm Orb',()=>debugSpawnNewEnemy('stormOrb')),
    makeDebugButton('Spawn Rift Stalker',()=>debugSpawnNewEnemy('riftStalker')),
    makeDebugButton('Spawn Bone Skitter',()=>debugSpawnNewEnemy('boneSkitter')),
    makeDebugButton('Spawn Magma Burrower',()=>debugSpawnNewEnemy('magmaBurrower')),
    makeDebugButton('Spawn Echo Siren',()=>debugSpawnNewEnemy('echoSiren')),
    makeDebugButton('Spawn Fracture Beetle',()=>debugSpawnNewEnemy('fractureBeetle')),
    makeDebugButton('Spawn Gloom Bat',()=>debugSpawnNewEnemy('gloomBat')),
    makeDebugButton('Spawn Obsidian Titan',()=>debugSpawnNewEnemy('obsidianTitan')),
    makeDebugButton('Spawn Hollow Tyrant Variant',()=>debugSpawnNewEnemy('hollowTyrantVariant')),
    makeDebugButton('Spawn 10 random new enemies',()=>debugSpawnRandomNewEnemies(10)),
    makeDebugButton('Clear new enemies',debugClearNewEnemies)
  ]);
  addDebugSection(panel,'Sprite Integration Tests',[
    makeDebugButton('Show Sprite Test Panel',showSpriteTestPanel),
    makeDebugButton('Spawn Hex Shard Sprite',()=>debugSpawnHexShard(1)),
    makeDebugButton('Spawn Elite Shellback Sprite',()=>debugSpawnEnemies('elite',1)),
    makeDebugButton('Spawn Hollow Tyrant Sprite',()=>debugSpawnEnemies('boss',1)),
    makeDebugButton('Spawn Extraction Craft Sprite',debugSpawnExtractionCraft),
    makeDebugButton('Place Ferrite Node',()=>debugPlaceResourceNode('ferriteBark')),
    makeDebugButton('Place Lumina Node',()=>debugPlaceResourceNode('luminaSpores')),
    makeDebugButton('Place Aether Node',()=>debugPlaceResourceNode('aetherQuartz')),
    makeDebugButton('Place Crysalith Node',()=>debugPlaceResourceNode('crysalith')),
    makeDebugButton('Place Emberglass Node',()=>debugPlaceResourceNode('emberglass')),
    makeDebugButton('Place Pathfinder Trap',debugSpawnTrapSprite),
    makeDebugButton('Hammerfall Missile Sprite',debugSpawnHammerfallMissileSprite),
    makeDebugButton('Enemy Red Bullet Sprite',debugSpawnEnemyRedBulletSprite),
    makeDebugButton('Destructive Bullet Sprite',debugSpawnDestructiveBulletSprite)
  ]);
  addDebugSection(panel,'VFX Debug / Test',[
    makeDebugButton('Play Generic Explosion',()=>debugPlayVfx('genericExplosion')),
    makeDebugButton('Play Large Explosion',()=>debugPlayVfx('largeExplosion')),
    makeDebugButton('Play Hex Shard Explosion',()=>debugPlayVfx('hexShardExplosion')),
    makeDebugButton('Play Lava Burst',()=>debugPlayVfx('lavaBurst')),
    makeDebugButton('Play Arc Overload',()=>debugPlayVfx('arcOverload')),
    makeDebugButton('Play Missile Impact',()=>debugPlayVfx('missileImpact')),
    makeDebugButton('Play Enemy Death Burst',()=>debugPlayVfx('enemyDeathBurst')),
    makeDebugButton('Play Elite Death Burst',()=>debugPlayVfx('eliteDeathBurst')),
    makeDebugButton('Play Boss Shockwave',()=>debugPlayVfx('bossShockwave')),
    makeDebugButton('Play Random VFX Burst',debugPlayRandomVfx),
    makeDebugButton('Clear Active VFX',debugClearVfx),
    makeDebugButton('Spawn 10 Random VFX',()=>debugSpawnRandomVfx(10)),
    makeDebugButton('Spawn 50 Random VFX',()=>debugSpawnRandomVfx(50)),
    makeDebugButton('VFX Stress Test 5 Seconds',debugVfxStress5s),
    makeDebugButton('Toggle Full VFX Budget',debugToggleFullVfxBudget),
    makeVfxSpritePreviewControls()
  ]);
  const vfxMetrics = document.createElement('section');
  vfxMetrics.className = 'debugSection';
  vfxMetrics.innerHTML = '<h3>VFX Debug Metrics</h3><pre class="debugLog" id="debugVfxMetrics">Start a run to view VFX metrics.</pre>';
  panel.appendChild(vfxMetrics);

  addDebugSection(panel,'Pathfinding / Smooth Corners',[
    makeDebugButton('Toggle Show Enemy Paths',debugToggleEnemyPaths),
    makeDebugButton('Toggle Raw Paths',debugToggleRawEnemyPaths),
    makeDebugButton('Toggle Smoothed Paths',debugToggleSmoothedEnemyPaths),
    makeDebugButton('Toggle Corner Curve Points',debugToggleCornerCurvePoints),
    makeDebugButton('Toggle Lookahead Targets',debugToggleEnemyLookaheadTargets),
    makeDebugButton('Toggle Pathing Radius',debugToggleEnemyPathingRadius),
    makeDebugButton('Toggle Path-Follow Overlay',debugTogglePathFollowingOverlay),
    makeDebugButton('Toggle Off-Track Distance',debugToggleOfftrackOverlay),
    makeDebugButton('Toggle Path Clearance',debugTogglePathClearanceOverlay),
    makeDebugButton('Force Recalculate Paths',debugRecalculateEnemyPaths),
    makeDebugButton('Freeze Enemies',debugToggleFreezeEnemies),
    makeDebugButton('Print Path-Follow Stats',debugPrintPathFollowingStats),
    makeDebugButton('Path-Follow Stress Test',debugPathFollowingStressTest),
    makeDebugButton('Toggle Corner Smoothing',debugToggleCornerSmoothing),
    makeDebugButton('Smooth Corner L-Test Map',debugSmoothCornerTestMap)
  ]);
  const pathFollowMetrics = document.createElement('section');
  pathFollowMetrics.className = 'debugSection';
  pathFollowMetrics.innerHTML = '<h3>Path-Following Metrics</h3><pre class="debugLog" id="debugPathFollowMetrics">Start a run to view path-following metrics.</pre>';
  panel.appendChild(pathFollowMetrics);

  addDebugSection(panel,'Block Size Scale Test',[
    makeDebugButton('Toggle Scaled Tile Grid',debugToggleScaledTileGrid),
    makeDebugButton('Toggle Collision Tiles',debugToggleCollisionTiles),
    makeDebugButton('Print Tile Scale Info',debugPrintTileScaleInfo)
  ]);
  const perfSection = document.createElement('section');
  perfSection.className = 'debugSection';
  perfSection.innerHTML = '<h3>Adaptive Performance Metrics</h3><pre class="debugLog" id="debugPerfMetrics">Start a run to view metrics.</pre>';
  panel.appendChild(perfSection);
  addDebugSection(panel,'Fog of War',[
    makeDebugButton('Toggle Fog of War',debugToggleFogOfWar),
    makeDebugButton('Toggle Fog Radius Debug',debugToggleFogRadius),
    makeDebugButton('Fog Low',debugFogLow),
    makeDebugButton('Fog Medium',debugFogMedium),
    makeDebugButton('Fog High',debugFogHigh)
  ]);

  addDebugSection(panel,'Adaptive Performance Tests',[
    makeDebugButton('Force PERF_HEALTHY',debugForcePerfHealthy),
    makeDebugButton('Force PERF_WARNING',debugForcePerfWarning),
    makeDebugButton('Force PERF_CRITICAL',debugForcePerfCritical),
    makeDebugButton('Clear Performance Force',debugClearPerfForce),
    makeDebugButton('Spawn Stress Test Swarm',debugStressSwarm),
    makeDebugButton('Toggle Enemy Budget Overlay',debugToggleEnemyBudgetOverlay),
    makeDebugButton('Toggle Perf Despawn Log',debugTogglePerfDespawnLog)
  ]);

  addDebugSection(panel,'Accuracy and Controller',[
    makeDebugButton('Add +10% Accuracy',debugAddAccuracy),
    makeDebugButton('Reset Accuracy 35%',debugResetAccuracy),
    makeDebugButton('Toggle Controller Info',debugToggleControllerInfo),
    makeDebugButton('Toggle Accuracy Cone',debugToggleAccuracyCone)
  ]);


  addDebugSection(panel,'Run Stats and Mission Goals',[
    makeDebugButton('Force complete objective',debugForceCompleteObjective),
    makeDebugButton('Add +10 objective progress',debugAddObjectiveProgress),
    makeDebugButton('Generate fake run stats',debugGenerateFakeRunStats),
    makeDebugButton('Open run statistics screen',debugOpenRunStatsScreen),
    makeDebugButton('Clear run stats',debugClearRunStats),
    makeDebugButton('Print current runStats object',debugPrintRunStats)
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


window.debugSprites = {
  panel: showSpriteTestPanel,
  report: ()=>typeof getSpriteLoadReport==='function' ? getSpriteLoadReport() : [],
  placeResource: debugPlaceResourceNode,
  missile: debugSpawnHammerfallMissileSprite,
  redBullet: debugSpawnEnemyRedBulletSprite,
  destructiveBullet: debugSpawnDestructiveBulletSprite
};

window.debugFog = {
  toggle: debugToggleFogOfWar,
  radius: debugToggleFogRadius,
  low: debugFogLow,
  medium: debugFogMedium,
  high: debugFogHigh
};

window.addEventListener('DOMContentLoaded', buildDebugPanel);




window.debugPathFollowing = {
  overlay: debugTogglePathFollowingOverlay,
  offtrack: debugToggleOfftrackOverlay,
  clearance: debugTogglePathClearanceOverlay,
  recalc: debugRecalculateEnemyPaths,
  freeze: debugToggleFreezeEnemies,
  stats: debugPrintPathFollowingStats,
  stress: debugPathFollowingStressTest,
};

window.debugTileScale = {
  grid: debugToggleScaledTileGrid,
  collision: debugToggleCollisionTiles,
  info: debugPrintTileScaleInfo,
  scale: ()=>({base:TILE_SIZE_BASE, scale:TILE_SIZE_SCALE, effective:TILE, world:{w:WORLD_W,h:WORLD_H}})
};

window.debugRunStats = {
  fake: debugGenerateFakeRunStats,
  open: debugOpenRunStatsScreen,
  clear: debugClearRunStats,
  print: debugPrintRunStats,
  objective: debugForceCompleteObjective,
  progress: debugAddObjectiveProgress
};
