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
  debugLog(`Unlocked/levelled weapon: ${weaponName(id)}`);
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
function debugClearProjectiles(){ if(requireGame()){ game.bullets=[]; game.boomerangs=[]; game.arcs=[]; game.particles=[]; debugLog('Cleared projectiles and transient VFX.'); } }
function debugHealPlayer(){ if(requireGame()){ game.player.hp=game.player.maxHp; debugLog('Healed player to full HP.'); updateGameAfterDebug(); } }
function debugAddXp(){ if(requireGame()){ gainXp(game, Math.max(10, Math.floor(game.xpNeed*0.55))); debugLog('Added XP.'); updateGameAfterDebug(); } }
function debugForceLevelUp(){ if(requireGame()){ gainXp(game, game.xpNeed - game.xp + 1); debugLog('Forced level-up.'); updateGameAfterDebug(); } }
function debugAddResource(resourceId, amount){
  if(!requireGame()) return;
  if(resourceId === 'gild'){
    game.gold += amount;
    debugLog(`Added ${amount} Gild Shards.`);
  } else if(resourceId === 'voltarite'){
    game.nitra += amount;
    debugLog(`Added ${amount} Voltarite.`);
  }
  updateGameAfterDebug();
}
function debugAddGild(){ debugAddResource('gild',100); }
function debugAddVoltarite(){ debugAddResource('voltarite',50); }
function debugResetCooldowns(){ if(requireGame()){ game.player.dashCd=0; game.player.trapCd=0; for(const w of game.weapons) w.cd=0; debugLog('Reset cooldowns.'); updateGameAfterDebug(); } }
function debugToggleEnemyPaths(){ if(requireGame()){ game.debug.showEnemyPaths=!game.debug.showEnemyPaths; debugLog(`Enemy path debug ${game.debug.showEnemyPaths ? 'enabled' : 'disabled'}.`); updateGameAfterDebug(); } }

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
  addDebugSection(panel,'Spawns & Clears',[
    makeDebugButton('Spawn 5 weak enemies',()=>debugSpawnEnemies('grunt',5)),
    makeDebugButton('Spawn 1 elite enemy',()=>debugSpawnEnemies('elite',1)),
    makeDebugButton('Spawn XP cluster',debugSpawnXpCluster),
    makeDebugButton('Spawn Voltarite node',debugSpawnVoltariteNode),
    makeDebugButton('Clear enemies',debugClearEnemies),
    makeDebugButton('Clear pickups',debugClearPickups),
    makeDebugButton('Clear projectiles',debugClearProjectiles)
  ]);
  addDebugSection(panel,'Pathfinding',[
    makeDebugButton('Toggle Show Enemy Paths',debugToggleEnemyPaths)
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
