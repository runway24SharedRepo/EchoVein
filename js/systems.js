'use strict';

/* Gameplay update systems: movement, mining, weapons, enemies, drones, traps, pickups, XP, upgrades, and particles. */

function update(g,dt){
  if(g.state !== 'playing' || paused || awaitingUpgrade) return;
  g.time += dt;
  shake = Math.max(0, shake - dt*18);
  logTimeout = Math.max(0, logTimeout-dt);
  updateGamepadActions(g);
  updatePlayer(g,dt);
  updateWeapons(g,dt);
  updateWardenDrones(g,dt);
  updateSifterDrones(g,dt);
  updateEnemies(g,dt);
  updateArcConnection(g,dt);
  updateBullets(g,dt);
  updateBoomerangs(g,dt);
  updateTraps(g,dt);
  updatePickups(g,dt);
  updateParticles(g,dt);
  updateSpawning(g,dt);
  updateUI(g);
}

function updateGamepadActions(g){
  if(gamepadButtonPressed(0)) placeTrap(g);
}

function updatePlayer(g,dt){
  const p=g.player;
  let dx=0,dy=0;
  if(keys.has('KeyW')||keys.has('ArrowUp')) dy--;
  if(keys.has('KeyS')||keys.has('ArrowDown')) dy++;
  if(keys.has('KeyA')||keys.has('ArrowLeft')) dx--;
  if(keys.has('KeyD')||keys.has('ArrowRight')) dx++;
  const pad = gamepadVector();
  if(pad.active){
    dx = pad.dx;
    dy = pad.dy;
  } else {
    const l=len(dx,dy); dx/=l; dy/=l;
  }
  if(dx||dy){ p.lastDx=dx; p.lastDy=dy; }

  p.iframes=Math.max(0,p.iframes-dt);
  p.dashCd=Math.max(0,p.dashCd-dt);
  p.dashT=Math.max(0,p.dashT-dt);
  p.trapCd=Math.max(0,p.trapCd-dt);
  p.heat=Math.max(0,p.heat - dt*22*p.coolMul);
  const dashBoost = p.dashT>0 ? 3.4 : 1;
  const overheatSlow = p.heat >= p.maxHeat ? 0.72 : 1;
  const spd=p.baseSpeed*p.speedMul*dashBoost*overheatSlow;
  moveCircle(g,p,dx*spd*dt,dy*spd*dt);
  if((dx||dy) && blockedAhead(g,p,dx,dy)) mineAhead(g,p,dx,dy,dt);
}

function blockedAhead(g,p,dx,dy){
  const tx=Math.floor((p.x+dx*(p.r+8))/TILE), ty=Math.floor((p.y+dy*(p.r+8))/TILE);
  return isSolid(tileAt(g,tx,ty));
}

function mineAhead(g,p,dx,dy,dt){
  if(p.heat >= p.maxHeat) return;
  const tx=Math.floor((p.x+dx*(p.r+10))/TILE), ty=Math.floor((p.y+dy*(p.r+10))/TILE);
  if(!inMap(tx,ty)) return;
  const i=tileIdx(tx,ty), t=g.tiles[i];
  if(!isSolid(t) || t===TILE_HARD) return;
  const miningPower = 55 * p.mineMul * dt;
  g.tileHp[i] -= miningPower;
  p.heat += dt * 32 * p.heatEfficiency;
  if(Math.random()<0.35) addParticle(g, tx*TILE+TILE/2, ty*TILE+TILE/2, rand(-30,30), rand(-30,30), t===TILE_GOLD?'#ffcc4d':t===TILE_NITRA?'#ff5b5b':t===TILE_CRYSTAL?'#42d6ff':'#7c6654', rand(0.18,0.36), rand(2,5));
  sfx('mine', 0.65);
  if(g.tileHp[i]<=0){
    g.tiles[i]=TILE_EMPTY;
    g.tileHp[i]=0;
    shake = Math.max(shake, 2.5);
    sfx('rockBreak', 0.85);
    for(let k=0;k<10;k++) addParticle(g, tx*TILE+TILE/2, ty*TILE+TILE/2, rand(-120,120), rand(-120,120), '#8b735e', rand(0.28,0.6), rand(2,6));
    if(t===TILE_GOLD){ g.gold += randi(2,5); floating(g,tx*TILE+18,ty*TILE+12,'+Gild Shards',MINERALS.gild.color); sfx('mineral'); }
    if(t===TILE_NITRA){ g.nitra += randi(1,3); floating(g,tx*TILE+18,ty*TILE+12,'+Voltarite',MINERALS.voltarite.color); sfx('mineral'); }
    if(t===TILE_CRYSTAL){ dropPickup(g,tx*TILE+18,ty*TILE+18,'xp',12); floating(g,tx*TILE+18,ty*TILE+12,'+Echo Shards',MINERALS.echo.color); sfx('mineral'); }
  }
}

function moveCircle(g,obj,dx,dy){
  obj.x = tryMoveAxis(g,obj,dx,0).x;
  obj.y = tryMoveAxis(g,obj,0,dy).y;
  obj.x=clamp(obj.x,obj.r+TILE,WORLD_W-obj.r-TILE);
  obj.y=clamp(obj.y,obj.r+TILE,WORLD_H-obj.r-TILE);
}
function tryMoveAxis(g,obj,dx,dy){
  let nx=obj.x+dx, ny=obj.y+dy;
  const minx=Math.floor((nx-obj.r)/TILE), maxx=Math.floor((nx+obj.r)/TILE);
  const miny=Math.floor((ny-obj.r)/TILE), maxy=Math.floor((ny+obj.r)/TILE);
  for(let ty=miny;ty<=maxy;ty++) for(let tx=minx;tx<=maxx;tx++){
    if(isSolid(tileAt(g,tx,ty))){
      const rx=tx*TILE, ry=ty*TILE;
      const cx=clamp(nx,rx,rx+TILE), cy=clamp(ny,ry,ry+TILE);
      if(dist2(nx,ny,cx,cy)<obj.r*obj.r){
        if(dx>0) nx=rx-obj.r-0.1;
        if(dx<0) nx=rx+TILE+obj.r+0.1;
        if(dy>0) ny=ry-obj.r-0.1;
        if(dy<0) ny=ry+TILE+obj.r+0.1;
      }
    }
  }
  return {x:nx,y:ny};
}

function updateSpawning(g,dt){
  const minute = Math.floor(g.time/60);
  g.spawnTimer -= dt;
  const rate = Math.max(0.16, 1.15 - minute*0.11);
  if(g.spawnTimer<=0){
    g.spawnTimer=rate;
    const roll=Math.random();
    const amount = 1 + Math.floor(minute*0.7);
    if(roll<0.45) spawnBurst(g,amount,'grunt');
    else if(roll<0.70) spawnBurst(g,amount+2,'swarmer');
    else if(roll<0.88) spawnBurst(g,Math.max(1,Math.floor(amount/2)),'guard');
    else spawnBurst(g,Math.max(1,Math.floor(amount/2)),'exploder');
  }
  if(g.time > g.eliteTimer){
    g.eliteTimer += 75;
    spawnBurst(g,1,'elite');
    log(g,'Hollow Tyrant detected!');
    sfx('elite');
  }
  if(g.time > g.nextWave){
    g.nextWave += 45;
    spawnBurst(g,8+minute*3,'swarmer');
    log(g,'Swarm wave incoming!');
    sfx('wave');
  }
}

function nearestEnemy(g,x,y,maxD=999999){
  let best=null, bd=maxD*maxD;
  for(const e of g.enemies){
    const d=dist2(x,y,e.x,e.y);
    if(d<bd){bd=d; best=e;}
  }
  return best;
}

function mouseWorld(g){
  return { x:g.camera.x + mouse.x, y:g.camera.y + mouse.y };
}

function mouseTargetActive(g){
  return g.player.mouseTargeting && mouse.used && g.time - mouse.lastMove < 2;
}

function mouseManualFireActive(g){
  return mouseTargetActive(g);
}

function arcMouseAutoDisabled(g){
  return g.arcConnection?.unlocked && mouse.used && g.time - mouse.lastMove < 2;
}

function targetEnemy(g,range,mouseBiasRadius=180){
  const p=g.player;
  if(mouseTargetActive(g)){
    const m = mouseWorld(g);
    let best=null, bd=mouseBiasRadius*mouseBiasRadius;
    for(const e of g.enemies){
      if(dist2(p.x,p.y,e.x,e.y) > range*range) continue;
      const d=dist2(m.x,m.y,e.x,e.y);
      if(d<bd){ bd=d; best=e; }
    }
    if(best) return best;
  }
  return nearestEnemy(g,p.x,p.y,range);
}

function arcConnectionMaxTargets(g){
  const arc = g.arcConnection;
  return arc?.unlocked ? 1 + arc.level : 0;
}

function liveArcSelections(g){
  const arc = g.arcConnection;
  if(!arc?.unlocked) return [];
  arc.selectedEnemies = arc.selectedEnemies.filter(e=>e && e.hp>0 && g.enemies.includes(e));
  arc.maxTargets = arcConnectionMaxTargets(g);
  return arc.selectedEnemies;
}

function enemyAtWorldPoint(g,x,y){
  let best=null, bd=Infinity;
  for(const e of g.enemies){
    const r=e.r+16;
    const d=dist2(x,y,e.x,e.y);
    if(d<r*r && d<bd){ best=e; bd=d; }
  }
  return best;
}

function handleArcConnectionRightClick(g){
  const arc = g.arcConnection;
  if(!arc?.unlocked || g.state!=='playing' || awaitingUpgrade) return false;
  const selections = liveArcSelections(g);
  const m = mouseWorld(g);
  const target = enemyAtWorldPoint(g,m.x,m.y);
  if(target){
    if(selections.includes(target)){
      floating(g,target.x,target.y-24,'Linked','#5dff9a');
      addRing(g,target.x,target.y,'rgba(93,255,154,0.65)',0.18,target.r,target.r+14,3);
      return true;
    }
    if(selections.length >= arcConnectionMaxTargets(g)){
      floating(g,m.x,m.y-18,'Chain full','#5dff9a');
      addRing(g,m.x,m.y,'rgba(93,255,154,0.45)',0.20,8,30,3);
      return true;
    }
    selections.push(target);
    arc.flash = 0.22;
    floating(g,target.x,target.y-24,`Linked ${selections.length}/${arcConnectionMaxTargets(g)}`,'#5dff9a');
    addRing(g,target.x,target.y,'rgba(93,255,154,0.85)',0.25,target.r+4,target.r+20,4);
    sfx('arc',0.45);
    return true;
  }
  if(selections.length >= 2){
    detonateArcConnection(g);
  } else if(selections.length === 1){
    floating(g,selections[0].x,selections[0].y-28,'Need 2 links','#5dff9a');
  }
  return true;
}

function detonateArcConnection(g){
  const arc = g.arcConnection;
  const chain = liveArcSelections(g).slice();
  if(chain.length < 2) return;
  const dmg = 42 + arc.level * 16;
  shake = Math.max(shake, 8);
  for(let i=0;i<chain.length;i++){
    const e = chain[i];
    damageEnemy(g,e,dmg,'#7df9ff');
    explode(g,e.x,e.y,42+arc.level*5,18+arc.level*5,'#5dff9a',true);
    addRing(g,e.x,e.y,'rgba(125,249,255,0.95)',0.24,e.r+8,e.r+42,4);
    if(i>0){
      const prev=chain[i-1];
      g.arcs.push({x1:prev.x,y1:prev.y,x2:e.x,y2:e.y,life:0.24,maxLife:0.24,color:'#5dff9a',width:5});
      g.arcs.push({x1:prev.x,y1:prev.y,x2:e.x,y2:e.y,life:0.16,maxLife:0.16,color:'#7df9ff',width:2});
    }
  }
  arc.selectedEnemies = [];
  arc.flash = 0;
  log(g, `Arc Connection detonated through ${chain.length} targets.`);
  sfx('arc',1.2);
}

function updateArcConnection(g,dt){
  if(!g.arcConnection?.unlocked) return;
  g.arcConnection.flash=Math.max(0,g.arcConnection.flash-dt);
  liveArcSelections(g);
}

function updateWeapons(g,dt){
  const p=g.player;
  const manualMode = mouseManualFireActive(g);
  const pauseAutoTargeting = !manualMode && arcMouseAutoDisabled(g);
  for(const w of g.weapons){
    w.cd -= dt * p.fireRateMul;
    if(w.id==='drones'){
      ensureDroneFleet(g,w);
      continue;
    }
    if(w.id==='sweeper'){
      ensureSifterFleet(g,w);
      continue;
    }
    if(w.cd>0) continue;
    if(manualMode){
      if(mouse.down) fireManualWeapon(g,w);
      continue;
    }
    if(pauseAutoTargeting) continue;
    if(w.id==='minigun'){
      const e=targetEnemy(g,620); if(!e) continue;
      w.cd=0.20/(1+w.level*0.07);
      fireSpread(g,p,e,1+p.extraProjectiles,9+w.level*3,520,0.18,'#ffdd80');
      sfx('shoot', 0.8);
    } else if(w.id==='carbine'){
      const e=targetEnemy(g,700); if(!e) continue;
      w.cd=0.34/(1+w.level*0.08);
      fireSpread(g,p,e,1+p.extraProjectiles,17+w.level*4,640,0.08,'#42d6ff',1+w.level);
      sfx('shoot', 0.65);
    } else if(w.id==='flamer'){
      w.cd=0.08;
      const e=targetEnemy(g,250,130); if(!e) continue;
      const a=Math.atan2(e.y-p.y,e.x-p.x);
      for(const enemy of g.enemies){
        const d=Math.hypot(enemy.x-p.x,enemy.y-p.y);
        if(d<210+w.level*18){
          const aa=Math.atan2(enemy.y-p.y,enemy.x-p.x);
          let da=Math.atan2(Math.sin(aa-a),Math.cos(aa-a));
          if(Math.abs(da)<0.45+w.level*0.04) damageEnemy(g,enemy,(5+w.level*1.6),'#ff7b2f');
        }
      }
      for(let k=0;k<3;k++) addParticle(g,p.x,p.y,Math.cos(a+rand(-0.45,0.45))*rand(160,260),Math.sin(a+rand(-0.45,0.45))*rand(160,260),'#ff9f43',rand(0.18,0.32),rand(5,12));
      sfx('flamer', 0.75);
    } else if(w.id==='satchel'){
      const e=targetEnemy(g,650); if(!e) continue;
      w.cd=Math.max(2.0,5.2-w.level*0.35);
      explode(g,e.x,e.y,90+w.level*8,75+w.level*26,'#ff9f43');
      sfx('explosion', 1.15);
    } else if(w.id==='boomerang'){
      const e=targetEnemy(g,700); if(!e) continue;
      const active = g.boomerangs.filter(b=>b.weaponId==='boomerang').length;
      const maxActive = 1 + Math.floor(w.level/3);
      if(active>=maxActive) continue;
      w.cd=Math.max(0.55,1.9-w.level*0.12);
      launchBoomerang(g,p,e,w.level);
      sfx('shoot', 0.7);
    } else if(w.id==='arc'){
      const e=targetEnemy(g,560); if(!e) continue;
      w.cd=Math.max(0.58,1.75-w.level*0.12);
      fireArcChain(g,e,w.level);
      sfx('arc', 0.9);
    } else if(w.id==='rail'){
      const e=targetEnemy(g,850,210); if(!e) continue;
      w.cd=Math.max(1.1,3.0-w.level*0.18);
      const a=Math.atan2(e.y-p.y,e.x-p.x);
      g.bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*920,vy:Math.sin(a)*920,r:5,life:0.85,damage:85+w.level*30,pierce:99,color:'#ffffff',rail:true});
      shake=Math.max(shake,5);
      sfx('rail', 1.0);
    }
  }
}

function manualAimPoint(g){
  const m = mouseWorld(g);
  const dx = m.x - g.player.x;
  const dy = m.y - g.player.y;
  const d = len(dx,dy);
  return { x:g.player.x + dx / d * 1000, y:g.player.y + dy / d * 1000 };
}

function fireManualWeapon(g,w){
  const p=g.player;
  const target = manualAimPoint(g);
  const manualColor = '#b46bff';
  if(w.id==='minigun'){
    w.cd=0.18/(1+w.level*0.07);
    fireSpread(g,p,target,1+p.extraProjectiles,10+w.level*3,560,0.12,manualColor);
    sfx('shoot', 0.75);
  } else if(w.id==='carbine'){
    w.cd=0.28/(1+w.level*0.08);
    fireSpread(g,p,target,1+p.extraProjectiles,18+w.level*4,700,0.05,manualColor,1+w.level);
    sfx('shoot', 0.65);
  } else if(w.id==='flamer'){
    w.cd=0.07;
    const a=Math.atan2(target.y-p.y,target.x-p.x);
    for(const enemy of g.enemies){
      const d=Math.hypot(enemy.x-p.x,enemy.y-p.y);
      if(d<210+w.level*18){
        const aa=Math.atan2(enemy.y-p.y,enemy.x-p.x);
        let da=Math.atan2(Math.sin(aa-a),Math.cos(aa-a));
        if(Math.abs(da)<0.45+w.level*0.04) damageEnemy(g,enemy,(5+w.level*1.6),manualColor);
      }
    }
    for(let k=0;k<3;k++) addParticle(g,p.x,p.y,Math.cos(a+rand(-0.35,0.35))*rand(170,270),Math.sin(a+rand(-0.35,0.35))*rand(170,270),manualColor,rand(0.16,0.28),rand(5,12));
    sfx('flamer', 0.65);
  } else if(w.id==='rail'){
    w.cd=Math.max(1.0,2.6-w.level*0.18);
    const a=Math.atan2(target.y-p.y,target.x-p.x);
    g.bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*960,vy:Math.sin(a)*960,r:5,life:0.85,damage:90+w.level*30,pierce:99,color:manualColor,rail:true,manual:true});
    shake=Math.max(shake,5);
    sfx('rail', 0.95);
  } else if(w.id==='boomerang'){
    const active = g.boomerangs.filter(b=>b.weaponId==='boomerang').length;
    const maxActive = 1 + Math.floor(w.level/3);
    if(active>=maxActive) return;
    w.cd=Math.max(0.55,1.6-w.level*0.12);
    launchBoomerang(g,p,target,w.level,manualColor);
    sfx('shoot', 0.7);
  } else if(w.id==='arc'){
    const e=targetEnemy(g,560);
    if(!e) return;
    w.cd=Math.max(0.58,1.45-w.level*0.12);
    fireArcChain(g,e,w.level);
    sfx('arc', 0.9);
  } else if(w.id==='satchel'){
    const m = mouseWorld(g);
    w.cd=Math.max(1.6,4.4-w.level*0.35);
    explode(g,m.x,m.y,90+w.level*8,75+w.level*26,manualColor);
    sfx('explosion', 1.05);
  }
}

function ensureDroneFleet(g,w){
  const p=g.player;
  const desired = Math.min(10, 1 + w.level);
  while(g.wardenDrones.length < desired){
    const a=rand(0,Math.PI*2);
    g.wardenDrones.push({
      x:p.x+Math.cos(a)*rand(35,90),
      y:p.y+Math.sin(a)*rand(35,90),
      r:9,
      vx:0, vy:0,
      targetX:p.x+Math.cos(a)*120,
      targetY:p.y+Math.sin(a)*120,
      retarget:0,
      cd:rand(0.1,0.6),
      phase:rand(0,Math.PI*2),
      level:w.level,
    });
  }
  for(const d of g.wardenDrones) d.level=w.level;
}

function updateWardenDrones(g,dt){
  const p=g.player;
  const w=g.weapons.find(w=>w.id==='drones');
  if(!w || !g.wardenDrones.length) return;
  const roamRadius = 150 * p.droneOrbitMul + w.level*18;
  for(let i=0;i<g.wardenDrones.length;i++){
    const d=g.wardenDrones[i];
    d.retarget -= dt;
    const threat=nearestEnemy(g,d.x,d.y,460 + w.level*20);
    if(d.retarget<=0 || dist2(d.x,d.y,d.targetX,d.targetY)<28*28){
      d.retarget=rand(0.7,1.5);
      const centerThreat=nearestEnemy(g,p.x,p.y,620);
      if(centerThreat && Math.random()<0.72){
        d.targetX=centerThreat.x+rand(-70,70);
        d.targetY=centerThreat.y+rand(-70,70);
      } else {
        const a=rand(0,Math.PI*2);
        d.targetX=p.x+Math.cos(a)*rand(55,roamRadius);
        d.targetY=p.y+Math.sin(a)*rand(55,roamRadius);
      }
    }
    const homeD=Math.hypot(d.x-p.x,d.y-p.y);
    if(homeD>roamRadius*1.55){
      const a=Math.atan2(p.y-d.y,p.x-d.x);
      d.targetX=p.x+Math.cos(a)*roamRadius*0.65;
      d.targetY=p.y+Math.sin(a)*roamRadius*0.65;
      d.retarget=0.35;
    }
    const tx=clamp(d.targetX,TILE*2,WORLD_W-TILE*2), ty=clamp(d.targetY,TILE*2,WORLD_H-TILE*2);
    const dx=tx-d.x, dy=ty-d.y, l=len(dx,dy);
    const speed=(165+w.level*9)*p.droneSpeedMul;
    d.vx=lerp(d.vx, dx/l*speed, dt*4.6);
    d.vy=lerp(d.vy, dy/l*speed, dt*4.6);
    d.x+=d.vx*dt;
    d.y+=d.vy*dt;
    d.x=clamp(d.x,TILE*2,WORLD_W-TILE*2);
    d.y=clamp(d.y,TILE*2,WORLD_H-TILE*2);

    d.cd -= dt * p.droneFireRateMul;
    if(threat && d.cd<=0){
      d.cd=Math.max(0.16, 0.56 - w.level*0.035);
      const a=Math.atan2(threat.y-d.y,threat.x-d.x)+rand(-0.06,0.06);
      g.bullets.push({x:d.x,y:d.y,vx:Math.cos(a)*650,vy:Math.sin(a)*650,r:3,life:1.05,damage:(9+w.level*3)*p.droneDamageMul,pierce:0,color:'#d6a2ff',drone:true});
      if(Math.random()<0.55) sfx('shoot',0.25);
      addParticle(g,d.x,d.y,-Math.cos(a)*55,-Math.sin(a)*55,'#d6a2ff',0.12,4,'spark');
    }
    if(Math.random()<0.15) addParticle(g,d.x,d.y,-d.vx*0.04+rand(-8,8),-d.vy*0.04+rand(-8,8),'rgba(214,162,255,0.7)',0.18,2);
  }
}

function ensureSifterFleet(g,w){
  const p=g.player;
  const desired = Math.min(6, 1 + Math.floor((w.level+1)/2));
  while(g.sifterDrones.length < desired){
    const a=rand(0,Math.PI*2);
    g.sifterDrones.push({
      x:p.x+Math.cos(a)*rand(45,95),
      y:p.y+Math.sin(a)*rand(45,95),
      r:10,
      vx:0, vy:0,
      target:null,
      targetX:p.x,
      targetY:p.y,
      retarget:0,
      level:w.level,
      phase:rand(0,Math.PI*2),
    });
  }
  for(const sw of g.sifterDrones) sw.level=w.level;
}

function nearestXpPickup(g,x,y,maxD){
  let best=null, bd=maxD*maxD;
  for(const it of g.pickups){
    if(it.type!=='xp' || it.life<=0) continue;
    const d=dist2(x,y,it.x,it.y);
    if(d<bd){ bd=d; best=it; }
  }
  return best;
}

function collectPickupBySifter(g,it,sw){
  if(!it || it.life<=0) return;
  if(it.type==='xp') gainXp(g,it.value);
  it.life=0;
  floating(g,sw.x,sw.y-18,'Echo sifted','#7df9ff');
  sfx('pickup',0.45);
  addRing(g,sw.x,sw.y,'rgba(125,249,255,0.75)',0.18,5,24,3);
}

function updateSifterDrones(g,dt){
  const p=g.player;
  const w=g.weapons.find(w=>w.id==='sweeper');
  if(!w || !g.sifterDrones.length) return;
  const searchRange=(360+w.level*70)*p.sweeperRangeMul;
  const homeRadius=230+w.level*30;
  for(let i=0;i<g.sifterDrones.length;i++){
    const sw=g.sifterDrones[i];
    sw.retarget -= dt;
    if(!sw.target || sw.target.life<=0 || sw.target.type!=='xp' || sw.retarget<=0){
      sw.target=nearestXpPickup(g,sw.x,sw.y,searchRange);
      sw.retarget=0.22;
    }

    if(sw.target){
      sw.targetX=sw.target.x;
      sw.targetY=sw.target.y;
    } else {
      const a=g.time*0.9 + sw.phase + i*1.7;
      sw.targetX=p.x+Math.cos(a)*homeRadius*0.55;
      sw.targetY=p.y+Math.sin(a)*homeRadius*0.55;
    }

    const homeD=Math.hypot(sw.x-p.x, sw.y-p.y);
    if(homeD>homeRadius*2.2 && !sw.target){
      sw.targetX=p.x;
      sw.targetY=p.y;
    }

    const tx=clamp(sw.targetX,TILE*2,WORLD_W-TILE*2), ty=clamp(sw.targetY,TILE*2,WORLD_H-TILE*2);
    const dx=tx-sw.x, dy=ty-sw.y, l=len(dx,dy);
    const speed=(230+w.level*22)*p.sweeperSpeedMul;
    sw.vx=lerp(sw.vx, dx/l*speed, dt*6.2);
    sw.vy=lerp(sw.vy, dy/l*speed, dt*6.2);
    sw.x+=sw.vx*dt;
    sw.y+=sw.vy*dt;
    sw.x=clamp(sw.x,TILE*2,WORLD_W-TILE*2);
    sw.y=clamp(sw.y,TILE*2,WORLD_H-TILE*2);

    const collectR=(22+w.level*3)*p.sweeperCollectMul;
    for(const it of g.pickups){
      if(it.type==='xp' && it.life>0 && dist2(sw.x,sw.y,it.x,it.y)<collectR*collectR){
        collectPickupBySifter(g,it,sw);
      }
    }
    if(Math.random()<0.28) addParticle(g,sw.x,sw.y,-sw.vx*0.04+rand(-10,10),-sw.vy*0.04+rand(-10,10),'rgba(125,249,255,0.72)',0.18,2,'spark');
  }
}

function fireArcChain(g,start,level){
  let current=start;
  const hit=new Set();
  const maxChains=3+level;
  const jumpRange=160+level*10;
  const splashRadius=44+level*5;
  for(let chain=0; chain<maxChains; chain++){
    if(!current) break;
    hit.add(current);
    const dmg=30+level*9;
    damageEnemy(g,current,dmg,'#7df9ff');
    addRing(g,current.x,current.y,'rgba(125,249,255,0.85)',0.18,8,38+level*3,3);
    addParticle(g,current.x,current.y,0,0,'rgba(190,255,255,0.75)',0.10,14);
    for(const other of g.enemies){
      if(other!==current && !hit.has(other) && other.hp>0 && dist2(current.x,current.y,other.x,other.y)<splashRadius*splashRadius){
        damageEnemy(g,other,(12+level*4),'#7df9ff');
        g.arcs.push({x1:current.x,y1:current.y,x2:other.x,y2:other.y,life:0.10,maxLife:0.10,color:'#9dffff',width:2});
      }
    }
    let next=null, bd=jumpRange*jumpRange;
    for(const other of g.enemies){
      if(!hit.has(other) && other.hp>0){
        const d=dist2(current.x,current.y,other.x,other.y);
        if(d<bd){bd=d; next=other;}
      }
    }
    if(next){
      g.arcs.push({x1:current.x,y1:current.y,x2:next.x,y2:next.y,life:0.16,maxLife:0.16,color:'#7df9ff',width:4});
    }
    current=next;
  }
}

function fireSpread(g,p,target,count,damage,speed,spread,color,pierce=0){
  const base=Math.atan2(target.y-p.y,target.x-p.x);
  for(let i=0;i<count;i++){
    const offset = count===1 ? 0 : (i-(count-1)/2)*spread;
    const a=base+offset+rand(-0.035,0.035);
    g.bullets.push({x:p.x+Math.cos(a)*p.r,y:p.y+Math.sin(a)*p.r,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:4,life:1.4,damage:damage*p.damageMul,pierce,color});
  }
}

function launchBoomerang(g,p,target,level,color='#ffd36b'){
  const a=Math.atan2(target.y-p.y,target.x-p.x);
  const speed = 420 + level*22;
  const outTime = 0.34 + level*0.03;
  g.boomerangs.push({
    weaponId:'boomerang', x:p.x+Math.cos(a)*p.r, y:p.y+Math.sin(a)*p.r,
    vx:Math.cos(a)*speed, vy:Math.sin(a)*speed, r:13, age:0, life:1.65, outTime,
    damage:(26+level*10)*p.damageMul, color, spin:0, hitSet:new WeakSet(), returning:false,
  });
}

function updateBoomerangs(g,dt){
  const p=g.player;
  for(const b of g.boomerangs){
    b.age += dt; b.life -= dt; b.spin += dt*11;
    if(b.age >= b.outTime) b.returning = true;
    if(b.returning){
      const dx=p.x-b.x, dy=p.y-b.y; const d=len(dx,dy); const speed=480;
      b.vx = lerp(b.vx, dx/d*speed, dt*8.5);
      b.vy = lerp(b.vy, dy/d*speed, dt*8.5);
      if(d < p.r + b.r + 6) b.life = 0;
    }
    b.x += b.vx*dt; b.y += b.vy*dt;
    if(Math.random()<0.45) addParticle(g,b.x,b.y,-b.vx*0.04+rand(-18,18),-b.vy*0.04+rand(-18,18),b.color,rand(0.12,0.22),rand(2,4));
    for(const e of g.enemies){
      if(e.hp>0 && !b.hitSet.has(e) && dist2(b.x,b.y,e.x,e.y)<(b.r+e.r)*(b.r+e.r)){
        b.hitSet.add(e); damageEnemy(g,e,b.damage,b.color);
        addRing(g,b.x,b.y,'rgba(255,211,107,0.9)',rand(0.08,0.14), 5, 18, 4);
        for(let k=0;k<4;k++) addParticle(g,b.x,b.y,rand(-120,120),rand(-120,120),b.color,rand(0.10,0.18),rand(2,4), 'spark');
      }
    }
  }
  g.boomerangs = g.boomerangs.filter(b=>b.life>0 && b.x>-120 && b.y>-120 && b.x<WORLD_W+120 && b.y<WORLD_H+120);
}

function placeTrap(g){
  const p=g.player;
  if(!p.canUseTraps || p.trapCd>0 || g.state!=='playing' || awaitingUpgrade) return false;
  const [tx,ty]=worldToTile(p.x,p.y);
  if(isSolid(tileAt(g,tx,ty))) return false;
  const maxTraps = p.classId==='pathfinder' ? 8 : 4;
  if(g.traps.length>=maxTraps) g.traps.shift();
  g.traps.push({x:p.x,y:p.y,r:16,triggerR:28,age:0,armed:false,life:32,pulse:0,damage:90*p.trapDamageMul,radius:88*p.trapRadiusMul});
  p.trapCd=p.trapMaxCd;
  floating(g,p.x,p.y-25,'Seismic trap armed','#ffcc4d');
  addRing(g,p.x,p.y,'rgba(255,204,77,0.75)',0.22,5,24,3);
  sfx('pickup',0.35);
  return true;
}

function updateTraps(g,dt){
  for(const tr of g.traps){
    tr.age+=dt; tr.life-=dt; tr.pulse+=dt;
    if(tr.age>0.35) tr.armed=true;
    if(!tr.armed) continue;
    for(const e of g.enemies){
      if(e.hp>0 && dist2(tr.x,tr.y,e.x,e.y)<(tr.triggerR+e.r)*(tr.triggerR+e.r)){
        tr.life=0;
        explode(g,tr.x,tr.y,tr.radius,tr.damage,'#ffcc4d');
        sfx('explosion',1.05);
        break;
      }
    }
  }
  g.traps=g.traps.filter(t=>t.life>0);
}

function updateEnemies(g,dt){
  const p=g.player;
  for(const e of g.enemies){
    e.hitFlash=Math.max(0,e.hitFlash-dt);
    e.slow=Math.max(0,e.slow-dt);
    const dx=p.x-e.x, dy=p.y-e.y, l=len(dx,dy);
    const wobble=Math.sin(g.time*4+e.phase)*0.25;
    const ux=dx/l*Math.cos(wobble)-dy/l*Math.sin(wobble)*0.18;
    const uy=dy/l*Math.cos(wobble)+dx/l*Math.sin(wobble)*0.18;
    const slow=e.slow>0?0.55:1;
    moveCircle(g,e,ux*e.speed*slow*dt,uy*e.speed*slow*dt);
    const touch = p.r+e.r;
    if(dist2(p.x,p.y,e.x,e.y)<touch*touch){
      if(p.iframes<=0){
        p.hp-=e.damage; p.iframes=0.65; flashDamage(); shake=Math.max(shake,8);
        floating(g,p.x,p.y-25,`-${e.damage}`,'#ff5b5b'); sfx('hit', 1.0);
        if(p.hp<=0) gameOver(g);
      }
      if(e.type==='exploder'){
        e.hp=0; explode(g,e.x,e.y,88,52,'#ff5b5b');
      }
    }
  }
  for(let i=g.enemies.length-1;i>=0;i--){
    const e=g.enemies[i];
    if(e.hp<=0){ killEnemy(g,e); g.enemies.splice(i,1); }
  }
}

function killEnemy(g,e){
  g.kills++; sfx('kill', 0.55); dropPickup(g,e.x,e.y,'xp',e.xp);
  if(Math.random()<0.06) dropPickup(g,e.x+rand(-8,8),e.y+rand(-8,8),'nitra',1);
  for(let k=0;k<10;k++) addParticle(g,e.x,e.y,rand(-100,100),rand(-100,100),e.color,rand(0.22,0.55),rand(2,6));
  if(g.player.vampire>0){
    g.player.vampCounter++;
    if(g.player.vampCounter>=18){ g.player.vampCounter=0; g.player.hp=Math.min(g.player.maxHp,g.player.hp+g.player.vampire); floating(g,g.player.x,g.player.y-32,'Vampire repair','#5dff9a'); }
  }
}

function updateBullets(g,dt){
  for(const b of g.bullets){
    b.x+=b.vx*dt; b.y+=b.vy*dt; b.life-=dt;
    if(Math.random()<0.2) addParticle(g,b.x,b.y,-b.vx*0.06+rand(-10,10),-b.vy*0.06+rand(-10,10),b.color,0.18,b.rail?5:3, b.drone?'spark':'circle');
    const [tx,ty]=worldToTile(b.x,b.y);
    if(isSolid(tileAt(g,tx,ty)) && !b.rail){ b.life=0; continue; }
    for(const e of g.enemies){
      if(e.hp>0 && dist2(b.x,b.y,e.x,e.y)<(b.r+e.r)*(b.r+e.r)){
        damageEnemy(g,e,b.damage,b.color);
        if(g.player.splash>0 && !b.drone) explode(g,b.x,b.y,42,g.player.splash,'#ffcc4d',true);
        b.pierce--;
        if(b.pierce<0){ b.life=0; break; }
      }
    }
  }
  g.bullets=g.bullets.filter(b=>b.life>0 && b.x>-100 && b.y>-100 && b.x<WORLD_W+100 && b.y<WORLD_H+100);
}

function damageEnemy(g,e,amount,color){
  e.hp-=amount; e.hitFlash=0.08; e.slow=Math.max(e.slow,0.05);
  if(Math.random()<0.25) addParticle(g,e.x,e.y,rand(-70,70),rand(-70,70),color,rand(0.18,0.35),rand(2,5));
}

function explode(g,x,y,r,damage,color,noShake=false){
  if(!noShake) shake=Math.max(shake,9);
  for(const e of g.enemies){
    const d=Math.hypot(e.x-x,e.y-y);
    if(d<r+e.r) damageEnemy(g,e,damage*(1-d/(r+e.r)*0.45),color);
  }
  addRing(g,x,y,color,0.34,Math.max(6,r*0.10),r*1.10,8);
  addRing(g,x,y,'rgba(255,244,214,0.95)',0.18,Math.max(4,r*0.06),r*0.78,6);
  addParticle(g,x,y,0,0,'rgba(255,240,220,0.95)',0.10,Math.max(10,r*0.26));
  for(let k=0;k<28;k++){
    const a=rand(0,Math.PI*2), s=rand(110,330);
    addParticle(g,x,y,Math.cos(a)*s,Math.sin(a)*s,color,rand(0.20,0.55),rand(3,9),'spark');
  }
  for(let k=0;k<16;k++){
    const a=rand(0,Math.PI*2), s=rand(35,125);
    addParticle(g,x,y,Math.cos(a)*s,Math.sin(a)*s,'rgba(80,80,88,0.55)',rand(0.45,0.95),rand(8,18));
  }
  for(let k=0;k<14;k++){
    const a=rand(0,Math.PI*2), s=rand(80,280);
    addParticle(g,x,y,Math.cos(a)*s,Math.sin(a)*s,color,rand(0.28,0.70),rand(4,12));
  }
}

function dropPickup(g,x,y,type,value){
  g.pickups.push({x:x+rand(-10,10),y:y+rand(-10,10),type,value,r:type==='xp'?7:8,life:999});
}
function updatePickups(g,dt){
  const p=g.player;
  const range=72*p.pickupMul;
  for(const it of g.pickups){
    const d=Math.hypot(p.x-it.x,p.y-it.y);
    if(d<range){
      const pull=clamp(1-d/range,0,1);
      it.x=lerp(it.x,p.x,dt*(2+pull*8));
      it.y=lerp(it.y,p.y,dt*(2+pull*8));
    }
    if(d<p.r+it.r+4){
      if(it.type==='xp') gainXp(g,it.value);
      if(it.type==='nitra') g.nitra+=it.value;
      sfx('pickup', it.type==='nitra' ? 1.0 : 0.6);
      it.life=0;
    }
  }
  g.pickups=g.pickups.filter(i=>i.life>0);
}

function gainXp(g,v){
  g.xp+=v;
  while(g.xp>=g.xpNeed){
    g.xp-=g.xpNeed; g.level++; g.xpNeed=Math.floor(g.xpNeed*1.22+12);
    sfx('level'); openUpgrade(g); break;
  }
}

function openUpgrade(g){
  awaitingUpgrade=true;
  ui.upgradeCards.innerHTML='';
  const choices=[];
  const pool=UPGRADE_POOL.filter(up=>!up.available || up.available(g));
  while(choices.length<3 && pool.length){
    const idx=randi(0,pool.length-1);
    choices.push(pool.splice(idx,1)[0]);
  }
  for(const up of choices){
    const div=document.createElement('div');
    div.className='card';
    div.innerHTML=`<div class="icon">${up.icon}</div><h3>${up.name}</h3><p>${up.desc}</p><span class="tag">Select</span>`;
    div.onclick=()=>{
      up.apply(g); awaitingUpgrade=false; ui.upgradeOverlay.classList.remove('show'); updateUI(g);
    };
    ui.upgradeCards.appendChild(div);
  }
  ui.upgradeOverlay.classList.add('show');
}

function updateParticles(g,dt){
  for(const p of g.particles){
    p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=Math.pow(0.02,dt); p.vy*=Math.pow(0.02,dt); p.life-=dt;
    if(p.shape==='ring') p.size = lerp(p.size, p.targetSize || p.size, dt*10);
  }
  g.particles=g.particles.filter(p=>p.life>0);
  for(const a of g.arcs){ a.life-=dt; }
  g.arcs=g.arcs.filter(a=>a.life>0);
  for(const t of g.texts){ t.y-=34*dt; t.life-=dt; }
  g.texts=g.texts.filter(t=>t.life>0);
}
function addParticle(g,x,y,vx,vy,color,life,size,shape='circle'){ g.particles.push({x,y,vx,vy,color,life,maxLife:life,size,shape}); }
function addRing(g,x,y,color,life,size,targetSize,lineWidth=4){ g.particles.push({x,y,vx:0,vy:0,color,life,maxLife:life,size,targetSize,shape:'ring',lineWidth}); }
function floating(g,x,y,text,color){ g.texts.push({x,y,text,color,life:0.9,maxLife:0.9}); }
function flashDamage(){ ui.damageFlash.classList.add('on'); setTimeout(()=>ui.damageFlash.classList.remove('on'),90); }
