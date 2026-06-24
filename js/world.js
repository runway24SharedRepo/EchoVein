'use strict';

/* Cave generation, map/tile helpers, mining support, enemy spawning, and mission log. */

function tileIdx(tx,ty){ return ty*MAP_W+tx; }
function worldToTileX(x){ return Math.floor(x/TILE); }
function worldToTileY(y){ return Math.floor(y/TILE); }
function worldToTile(x,y){ return [worldToTileX(x), worldToTileY(y)]; }
function tileToWorldX(tx){ return tx*TILE; }
function tileToWorldY(ty){ return ty*TILE; }
function tileToWorldCenterX(tx){ return tx*TILE + TILE/2; }
function tileToWorldCenterY(ty){ return ty*TILE + TILE/2; }
function tileToWorldCenter(tx,ty){ return {x:tileToWorldCenterX(tx), y:tileToWorldCenterY(ty)}; }
function getTileScaleInfo(){ return {base:TILE_SIZE_BASE, scale:TILE_SIZE_SCALE, effective:TILE, mapPixelWidth:WORLD_W, mapPixelHeight:WORLD_H}; }
function inMap(tx,ty){ return tx>=0 && ty>=0 && tx<MAP_W && ty<MAP_H; }
function tileAt(g,tx,ty){ if(!inMap(tx,ty)) return TILE_HARD; return g.tiles[tileIdx(tx,ty)]; }
function isSolid(t){ return t===TILE_ROCK || t===TILE_HARD || t===TILE_GOLD || t===TILE_NITRA || t===TILE_CRYSTAL || t===TILE_FERRITE_BARK || t===TILE_LUMINA_SPORES || t===TILE_AETHER_QUARTZ || t===TILE_CRYSALITH || t===TILE_EMBERGLASS || t===TILE_LAVA_ROCK; }
function isMineableTile(t){ return t===TILE_ROCK || t===TILE_GOLD || t===TILE_NITRA || t===TILE_CRYSTAL || t===TILE_FERRITE_BARK || t===TILE_LUMINA_SPORES || t===TILE_AETHER_QUARTZ || t===TILE_CRYSALITH || t===TILE_EMBERGLASS; }
function isObstacleTile(t){ return t===TILE_LAVA_ROCK; }

function countMineableTiles(g){
  let total=0;
  for(let i=0;i<g.tiles.length;i++){
    if(isMineableForPlayer(g.tiles[i])) total++;
  }
  return total;
}

function addMineableBlockObjective(g){
  if(!g.objectives) g.objectives=[];
  const total=countMineableTiles(g);
  const target=Math.max(1, Math.ceil(total*0.05)); // 5% of mineable blocks
  g.objectives.push({
    id:'mine_blocks',
    type:'mineBlocks',
    displayName:`Mine ${target} mineable blocks`,
    targetAmount:target,
    currentAmount:0,
    completed:false
  });
  g.mineableBlocksTotal=total;
  g.mineableBlocksTarget=target;
}

function generateCave(g){
  for(let y=0;y<MAP_H;y++) for(let x=0;x<MAP_W;x++) {
    const i=tileIdx(x,y);
    const edge = x<2||y<2||x>MAP_W-3||y>MAP_H-3;
    g.tiles[i] = edge ? TILE_HARD : TILE_ROCK;
    g.tileHp[i] = edge ? 9999 : 24;
  }
  // Cellular-ish cave: carve overlapping blobs and tunnels.
  const cx = MAP_W/2, cy = MAP_H/2;
  carveCircle(g,cx,cy,9);
  let px=cx, py=cy;
  for(let c=0;c<36;c++){
    const angle = rand(0,Math.PI*2);
    const steps = randi(8,22);
    for(let s=0;s<steps;s++){
      px = clamp(px + Math.cos(angle+rand(-0.75,0.75))*1.6, 5, MAP_W-6);
      py = clamp(py + Math.sin(angle+rand(-0.75,0.75))*1.6, 5, MAP_H-6);
      carveCircle(g,px,py,rand(2.8,5.8));
    }
    if(Math.random()<0.45){ px=cx+rand(-20,20); py=cy+rand(-20,20); }
  }
  // Resource veins in rock near caves. The set is data-driven so mission
  // objectives can request more than only Gild/Echo resources.
  for(let n=0;n<175;n++) placeResourceVein(g);

  // A few exposed samples make cave chambers feel more useful before mining.
  placeLooseResourcePickups(g, 34);

  placeLavaRockObstacles(g);
}


function chooseResourceTileType(){
  const total=RESOURCE_TILE_TYPES.reduce((a,r)=>a+r.weight,0);
  let roll=Math.random()*total;
  for(const r of RESOURCE_TILE_TYPES){
    roll-=r.weight;
    if(roll<=0) return r;
  }
  return RESOURCE_TILE_TYPES[0];
}

function placeResourceVein(g){
  const def=chooseResourceTileType();
  const tx=randi(4,MAP_W-5), ty=randi(4,MAP_H-5);
  const vein=randi(def.minCluster,def.maxCluster);
  for(let k=0;k<vein;k++){
    const vx=clamp(tx+randi(-2,2),2,MAP_W-3), vy=clamp(ty+randi(-2,2),2,MAP_H-3);
    const i=tileIdx(vx,vy);
    if(g.tiles[i]===TILE_ROCK){ g.tiles[i]=def.tile; g.tileHp[i]=def.hp; }
  }
}

function placeLooseResourcePickups(g,count){
  const eligible=RESOURCE_TILE_TYPES.filter(r=>r.resourceId!=='echo');
  for(let n=0;n<count;n++){
    let x=0,y=0,ok=false;
    for(let tries=0;tries<80;tries++){
      const tx=randi(5,MAP_W-6), ty=randi(5,MAP_H-6);
      if(g.tiles[tileIdx(tx,ty)]!==TILE_EMPTY) continue;
      const sx=Math.floor(MAP_W/2), sy=Math.floor(MAP_H/2);
      if(Math.hypot(tx-sx,ty-sy)<8) continue;
      x=tileToWorldCenterX(tx); y=tileToWorldCenterY(ty); ok=true; break;
    }
    if(!ok) continue;
    const def=eligible[randi(0,eligible.length-1)];
    dropPickup(g,x,y,def.resourceId, randi(1, def.resourceId==='aetherQuartz'?2:4));
  }
  placeHealthPickups(g, Math.max(2, Math.floor(count*0.15)));
}

function placeHealthPickups(g, count){
  for(let n=0; n<count; n++){
    let x=0, y=0, ok=false;
    for(let tries=0; tries<60; tries++){
      const tx=randi(8, MAP_W-9), ty=randi(8, MAP_H-9);
      if(g.tiles[tileIdx(tx,ty)]!==TILE_EMPTY) continue;
      const sx=Math.floor(MAP_W/2), sy=Math.floor(MAP_H/2);
      if(Math.hypot(tx-sx, ty-sy)<12) continue;
      x=tileToWorldCenterX(tx); y=tileToWorldCenterY(ty); ok=true; break;
    }
    if(!ok) continue;
    dropPickup(g, x, y, 'health', 15);
  }
}

function openNeighborCount(g,tx,ty,r=2){
  let count=0;
  for(let y=ty-r;y<=ty+r;y++) for(let x=tx-r;x<=tx+r;x++){
    if(inMap(x,y) && g.tiles[tileIdx(x,y)]===TILE_EMPTY) count++;
  }
  return count;
}

function canPlaceLavaRock(g,tx,ty){
  if(!inMap(tx,ty) || g.tiles[tileIdx(tx,ty)]!==TILE_EMPTY) return false;
  const sx=Math.floor(MAP_W/2), sy=Math.floor(MAP_H/2);
  if(Math.hypot(tx-sx,ty-sy)<9) return false;
  // Avoid sealing narrow routes: lava is only placed in already-open pockets.
  return openNeighborCount(g,tx,ty,2)>=14;
}

function placeLavaRockObstacles(g){
  const clusters=20;
  for(let c=0;c<clusters;c++){
    let cx=0, cy=0, ok=false;
    for(let tries=0;tries<80;tries++){
      cx=randi(6,MAP_W-7); cy=randi(6,MAP_H-7);
      if(canPlaceLavaRock(g,cx,cy)){ ok=true; break; }
    }
    if(!ok) continue;
    const radius=rand(1.2,2.5);
    for(let y=Math.floor(cy-radius-1);y<=Math.ceil(cy+radius+1);y++) for(let x=Math.floor(cx-radius-1);x<=Math.ceil(cx+radius+1);x++){
      if(!canPlaceLavaRock(g,x,y)) continue;
      const d=Math.hypot(x-cx,y-cy);
      if(d<radius+rand(-0.35,0.25)){
        const i=tileIdx(x,y);
        g.tiles[i]=TILE_LAVA_ROCK;
        g.tileHp[i]=9999;
      }
    }
  }
}


function carveCircle(g,cx,cy,r){
  const minx=Math.floor(cx-r-1), maxx=Math.ceil(cx+r+1);
  const miny=Math.floor(cy-r-1), maxy=Math.ceil(cy+r+1);
  for(let y=miny;y<=maxy;y++) for(let x=minx;x<=maxx;x++) if(inMap(x,y)){
    const d=Math.hypot(x-cx,y-cy);
    if(d<r+rand(-0.45,0.25)){
      const i=tileIdx(x,y);
      if(g.tiles[i]!==TILE_HARD){ g.tiles[i]=TILE_EMPTY; g.tileHp[i]=0; }
    }
  }
}

function hammerfallBaseState(){
  return {
    missilesPerSalvo: 2,
    missileDamage: 34,
    missileSpeed: 320,
    missileLifetime: 2.4,
    missileAccuracy: 0.82,
    missileTurnRate: 4.5,
    explosionRadius: 38,
    lockRange: 650,
    baseCooldown: 3.8
  };
}

function ensureHammerfallDefaults(w){
  if(!w || w.id !== 'hammerfallSalvo') return w;
  const base = hammerfallBaseState();
  for(const [key,value] of Object.entries(base)){
    if(w[key] == null) w[key] = value;
  }
  w.missilesPerSalvo = Math.max(2, Math.floor(w.missilesPerSalvo));
  w.missileAccuracy = clamp(w.missileAccuracy, 0.25, 0.98);
  return w;
}

function borecasterBombBaseState(){
  return {
    bombCount: 1,
    fuseTime: 2.4,
    minFuseTime: 0.75,
    blastRadius: 90,
    damage: 115,
    throwSpeed: 520,
    baseCooldown: 3.6,
    landingDistance: 460
  };
}

function ensureBorecasterBombDefaults(w){
  if(!w || w.id !== 'borecasterBomb') return w;
  const base = borecasterBombBaseState();
  for(const [key,value] of Object.entries(base)){
    if(w[key] == null) w[key] = value;
  }
  w.bombCount = Math.max(1, Math.floor(w.bombCount));
  w.fuseTime = clamp(w.fuseTime, w.minFuseTime || 0.75, 3.5);
  w.blastRadius = Math.max(55, w.blastRadius);
  return w;
}

function unlockBorecasterBomb(g){
  if(g.player.classId !== 'borecaster'){
    log(g, 'Seismic Charge is Borecaster-only.');
    return null;
  }
  const existing = g.weapons.find(w=>w.id==='borecasterBomb');
  if(existing){
    ensureBorecasterBombDefaults(existing);
    log(g, 'Seismic Charge already rigged.');
    return existing;
  }
  return addOrLevelWeapon(g,'borecasterBomb');
}

function upgradeBorecasterBomb(g,kind){
  const w = ensureBorecasterBombDefaults(g.weapons.find(w=>w.id==='borecasterBomb'));
  if(!w){ log(g, 'Seismic Charge must be unlocked first.'); return; }
  if(kind === 'count') w.bombCount += 1;
  else if(kind === 'fuse') w.fuseTime = Math.max(w.minFuseTime || 0.75, w.fuseTime - 0.25);
  else if(kind === 'radius') w.blastRadius += 18;
  else if(kind === 'damage') w.damage *= 1.12;
  w.level++;
  log(g, `Seismic Charge ${kind} upgrade applied. ${w.bombCount} bomb(s), ${w.fuseTime.toFixed(2)} s fuse, ${Math.round(w.blastRadius)} px radius.`);
}

function unlockHammerfallSalvo(g){
  if(g.player.classId !== 'bulwark'){
    log(g, 'Hammerfall Salvo is Bulwark-only.');
    return null;
  }
  const existing = g.weapons.find(w=>w.id==='hammerfallSalvo');
  if(existing){
    ensureHammerfallDefaults(existing);
    log(g, 'Hammerfall Salvo already online.');
    return existing;
  }
  return addOrLevelWeapon(g,'hammerfallSalvo');
}

function upgradeHammerfall(g,kind){
  const w = ensureHammerfallDefaults(g.weapons.find(w=>w.id==='hammerfallSalvo'));
  if(!w){ log(g, 'Hammerfall Salvo must be unlocked first.'); return; }
  if(kind === 'damage') w.missileDamage *= 1.15;
  else if(kind === 'speed') w.missileSpeed *= 1.12;
  else if(kind === 'fuel') w.missileLifetime *= 1.15;
  else if(kind === 'count') w.missilesPerSalvo += 1;
  else if(kind === 'accuracy') w.missileAccuracy = Math.min(0.98, w.missileAccuracy + 0.06);
  w.level++;
  log(g, `${weaponName('hammerfallSalvo')} ${kind} upgrade applied. Mk ${w.level}`);
}

function upgradeVectorBurst(g,kind){
  const w=g.weapons.find(w=>w.id==='vectorBurst') || addOrLevelWeapon(g,'vectorBurst');
  if(kind==='count') w.projectiles=(w.projectiles || 1)+1;
  else if(kind==='damage') w.damage=(w.damage || 12)*1.15;
  else if(kind==='speed'){ w.speed=(w.speed || 560)*1.12; w.lifetime=(w.lifetime || 1.25)*1.08; }
  else if(kind==='rate') w.baseCooldown=Math.max(0.18,(w.baseCooldown || 0.92)/1.14);
  w.level++;
  log(g, `${weaponName('vectorBurst')} ${kind} upgrade applied. ${w.projectiles || 1} directions.`);
}

function addOrLevelWeapon(g,id){
  let w = g.weapons.find(w=>w.id===id);
  if(w){
    if(id==='hammerfallSalvo') ensureHammerfallDefaults(w);
    if(id==='borecasterBomb') ensureBorecasterBombDefaults(w);
    w.level++;
    log(g, `${weaponName(id)} upgraded to Mk ${w.level}`);
    return w;
  }
  w = { id, level:1, cd:0, angle:0 };
  if(id==='vectorBurst'){
    Object.assign(w,{projectiles:1, damage:12, speed:560, lifetime:1.25, spreadDeg:18, pierce:0, baseCooldown:0.92});
  }
  if(id==='hammerfallSalvo'){
    Object.assign(w, hammerfallBaseState());
    // Short arming delay prevents immediate frame-0 salvo spam after unlock/debug unlock.
    w.cd = 0.85;
  }
  if(id==='borecasterBomb'){
    Object.assign(w, borecasterBombBaseState());
    w.cd = 0.65;
  }
  g.weapons.push(w);
  log(g, `${weaponName(id)} online`);
  return w;
}

function log(g,msg){
  g.log.unshift(msg);
  g.log = g.log.slice(0,5);
  logTimeout = 3;
}


function weightedSpawnPick(options){
  const available=options.filter(o=>!o.when || o.when());
  if(!available.length) return options[0]?.type || 'grunt';
  const total=available.reduce((s,o)=>s+(o.weight ?? 1),0);
  let roll=Math.random()*total;
  for(const o of available){ roll-=(o.weight ?? 1); if(roll<=0) return o.type; }
  return available[available.length-1].type;
}

function resolveEnemyTypeForSpawn(g,type){
  const pressure=g?.hollowPressure || 0;
  const mission=g?.missionIndex || 1;
  const run=g?.runIndex || 1;
  const time=g?.time || 0;
  if(typeof NEW_ENEMY_SPRITE_TYPES !== 'undefined' && NEW_ENEMY_SPRITE_TYPES.includes(type)) return type;
  if(type==='grunt') return weightedSpawnPick([
    {type:'clawlingRunner',weight:1.20},
    {type:'boneSkitter',weight:0.85},
    {type:'acidTick',weight:0.65},
    {type:'gloomBat',weight:0.48},
    {type:'emberCrawler',weight:0.34,when:()=>time>55 || pressure>=1},
    {type:'riftStalker',weight:0.20,when:()=>mission>=2 || pressure>=2},
    {type:'grunt',weight:0.25},
  ]);
  if(type==='swarmer') return weightedSpawnPick([
    {type:'needleWisp',weight:1.05},
    {type:'voidMite',weight:0.85},
    {type:'boneSkitter',weight:0.58},
    {type:'gloomBat',weight:0.52},
    {type:'stormOrb',weight:0.24,when:()=>time>75 || pressure>=1},
    {type:'swarmer',weight:0.22},
  ]);
  if(type==='guard') return weightedSpawnPick([
    {type:'shellbackGuard',weight:1.0},
    {type:'ironMaw',weight:0.30,when:()=>time>90 || pressure>=2},
    {type:'fractureBeetle',weight:0.22,when:()=>mission>=2 || pressure>=2},
    {type:'guard',weight:0.25},
  ]);
  if(type==='exploder') return weightedSpawnPick([
    {type:'blisterPod',weight:1.0},
    {type:'hexShardThrower',weight:0.18,when:()=>time>120 || pressure>=2},
    {type:'exploder',weight:0.20},
  ]);
  if(type==='hexShard') return Math.random()<0.65 ? 'hexShardThrower' : 'hexShard';
  if(type==='elite') return weightedSpawnPick([
    {type:'elite',weight:0.50},
    {type:'sporeMother',weight:0.28,when:()=>time>110 || pressure>=2},
    {type:'crystalLancer',weight:0.35,when:()=>time>85 || pressure>=1},
    {type:'echoSiren',weight:0.18,when:()=>mission>=2 || pressure>=2},
    {type:'obsidianTitan',weight:0.08,when:()=>mission>=2 && pressure>=3},
  ]);
  if(type==='boss') return (mission>=2 || pressure>=4 || run>=3) && Math.random()<0.35 ? 'hollowTyrantVariant' : 'boss';
  return type;
}

function spawnEnemy(g,type){
  const p=g.player;
  const requestedType=type;
  type=resolveEnemyTypeForSpawn(g,type);
  let x,y;
  for(let tries=0;tries<50;tries++){
    const ang=rand(0,Math.PI*2), d=rand(650,920);
    x=clamp(p.x+Math.cos(ang)*d,60,WORLD_W-60);
    y=clamp(p.y+Math.sin(ang)*d,60,WORLD_H-60);
    const [tx,ty]=worldToTile(x,y);
    if(!isSolid(tileAt(g,tx,ty))) break;
  }
  const e=new Enemy(x,y,type);
  e.spawnArchetype=requestedType;
  const diff=g.missionDifficulty || missionDifficulty(1);
  const pressure=g.hollowPressure || 0;
  const threatScale=1+pressure*0.08;
  if(type==='boss'){
    e.hp*=diff.bossHealthMultiplier*(1+pressure*0.12);
    e.maxHp=e.hp;
    e.damage=Math.round(e.damage*diff.bossDamageMultiplier*(1+pressure*0.06));
    e.speed*=1+pressure*0.035;
  } else {
    e.hp*=diff.enemyHealthMultiplier*threatScale;
    e.maxHp=e.hp;
    e.damage=Math.round(e.damage*diff.enemyDamageMultiplier*(1+pressure*0.045));
    e.speed*=1+pressure*0.035;
  }
  g.enemies.push(e);
}

function spawnBurst(g,count,type){
  let spawned=0;
  for(let i=0;i<count;i++){
    if(typeof canSpawnNormalEnemy === 'function' && !canSpawnNormalEnemy(g,type,1)) break;
    spawnEnemy(g,type);
    spawned++;
  }
  return spawned;
}
