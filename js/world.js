'use strict';

/* Cave generation, map/tile helpers, mining support, enemy spawning, and mission log. */

function tileIdx(tx,ty){ return ty*MAP_W+tx; }
function worldToTile(x,y){ return [Math.floor(x/TILE), Math.floor(y/TILE)]; }
function inMap(tx,ty){ return tx>=0 && ty>=0 && tx<MAP_W && ty<MAP_H; }
function tileAt(g,tx,ty){ if(!inMap(tx,ty)) return TILE_HARD; return g.tiles[tileIdx(tx,ty)]; }
function isSolid(t){ return t===TILE_ROCK || t===TILE_HARD || t===TILE_GOLD || t===TILE_NITRA || t===TILE_CRYSTAL; }

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
  // Mineral veins in rock near caves.
  for(let n=0;n<135;n++){
    const type = Math.random()<0.55 ? TILE_GOLD : (Math.random()<0.78 ? TILE_NITRA : TILE_CRYSTAL);
    const tx=randi(4,MAP_W-5), ty=randi(4,MAP_H-5);
    const vein=randi(3,9);
    for(let k=0;k<vein;k++){
      const vx=clamp(tx+randi(-2,2),2,MAP_W-3), vy=clamp(ty+randi(-2,2),2,MAP_H-3);
      const i=tileIdx(vx,vy);
      if(g.tiles[i]===TILE_ROCK){ g.tiles[i]=type; g.tileHp[i]= type===TILE_CRYSTAL ? 45 : 32; }
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

function addOrLevelWeapon(g,id){
  let w = g.weapons.find(w=>w.id===id);
  if(w){
    if(id==='hammerfallSalvo') ensureHammerfallDefaults(w);
    w.level++;
    log(g, `${weaponName(id)} upgraded to Mk ${w.level}`);
    return w;
  }
  w = { id, level:1, cd:0, angle:0 };
  if(id==='hammerfallSalvo'){
    Object.assign(w, hammerfallBaseState());
    // Short arming delay prevents immediate frame-0 salvo spam after unlock/debug unlock.
    w.cd = 0.85;
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

function spawnEnemy(g,type){
  const p=g.player;
  let x,y;
  for(let tries=0;tries<50;tries++){
    const ang=rand(0,Math.PI*2), d=rand(650,920);
    x=clamp(p.x+Math.cos(ang)*d,60,WORLD_W-60);
    y=clamp(p.y+Math.sin(ang)*d,60,WORLD_H-60);
    const [tx,ty]=worldToTile(x,y);
    if(!isSolid(tileAt(g,tx,ty))) break;
  }
  const e=new Enemy(x,y,type);
  const diff=g.missionDifficulty || missionDifficulty(1);
  if(type==='boss'){
    e.hp*=diff.bossHealthMultiplier;
    e.maxHp=e.hp;
    e.damage=Math.round(e.damage*diff.bossDamageMultiplier);
  } else {
    e.hp*=diff.enemyHealthMultiplier;
    e.maxHp=e.hp;
    e.damage=Math.round(e.damage*diff.enemyDamageMultiplier);
  }
  g.enemies.push(e);
}

function spawnBurst(g,count,type){ for(let i=0;i<count;i++) spawnEnemy(g,type); }
