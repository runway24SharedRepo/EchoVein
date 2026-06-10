'use strict';

/* Gameplay update systems: movement, mining, weapons, enemies, drones, traps, pickups, XP, upgrades, and particles. */


function updatePerformanceMonitor(g,rawDt){
  if(!g || !g.performance) return;
  const perf=g.performance;
  const frameTimeMs=rawDt*1000;
  const fps=rawDt>0 ? 1/rawDt : 60;
  perf.currentFPS=fps;
  perf.frameTimeMs=frameTimeMs;
  perf.samples.push({dt:rawDt, ms:frameTimeMs});
  perf.sampleTotal+=rawDt;
  while(perf.samples.length && perf.sampleTotal>PERFORMANCE_CONFIG.sampleWindowSeconds){
    const old=perf.samples.shift();
    perf.sampleTotal-=old.dt;
  }
  if(perf.samples.length){
    const avgDt=perf.samples.reduce((a,b)=>a+b.dt,0)/perf.samples.length;
    perf.averageFrameTimeMs=avgDt*1000;
    perf.averageFPS=avgDt>0 ? 1/avgDt : 60;
  }
}

function updatePerformanceBudgets(g,dt){
  const perf=g.performance;
  if(!perf) return;
  const forced=g.debug?.forcePerformanceState;
  const avg=perf.averageFPS || 60;
  perf.previousState=perf.state;
  perf.forced=!!forced;
  if(forced){
    perf.state=forced;
  } else if(perf.state===PERF_STATES.CRITICAL){
    if(avg>=PERFORMANCE_CONFIG.recoveryFps){
      perf.recoveryTimer+=dt;
      if(perf.recoveryTimer>=PERFORMANCE_CONFIG.recoveryHoldSeconds){ perf.state=PERF_STATES.RECOVERING; perf.recoveryTimer=0; }
    } else perf.recoveryTimer=0;
  } else if(perf.state===PERF_STATES.RECOVERING){
    if(avg>=PERFORMANCE_CONFIG.healthyFps){
      perf.healthyTimer+=dt;
      if(perf.healthyTimer>=PERFORMANCE_CONFIG.healthyHoldSeconds){ perf.state=PERF_STATES.HEALTHY; perf.healthyTimer=0; }
    } else if(avg<PERFORMANCE_CONFIG.criticalFps){
      perf.state=PERF_STATES.CRITICAL; perf.healthyTimer=0;
    } else perf.healthyTimer=0;
  } else if(avg<PERFORMANCE_CONFIG.criticalFps){
    perf.state=PERF_STATES.CRITICAL;
  } else if(avg<PERFORMANCE_CONFIG.healthyFps){
    perf.state=PERF_STATES.WARNING;
  } else {
    perf.state=PERF_STATES.HEALTHY;
  }

  if(perf.state!==perf.previousState){
    if(perf.state===PERF_STATES.WARNING) log(g,'Swarm pressure stabilising...');
    else if(perf.state===PERF_STATES.CRITICAL) log(g,'Enemy pressure reduced for performance.');
    else if(perf.state===PERF_STATES.RECOVERING) log(g,'Performance recovering; spawning resumes gradually.');
    else if(perf.state===PERF_STATES.HEALTHY) log(g,'Performance recovered.');
  }

  if(perf.state===PERF_STATES.HEALTHY){
    perf.budgetFactor=1; perf.vfxFactor=1; perf.spawnRateMultiplier=1; perf.swarmSizeMultiplier=1;
  } else if(perf.state===PERF_STATES.WARNING){
    perf.budgetFactor=0.70; perf.vfxFactor=0.70; perf.spawnRateMultiplier=0.70; perf.swarmSizeMultiplier=0.75;
  } else if(perf.state===PERF_STATES.CRITICAL){
    perf.budgetFactor=0.40; perf.vfxFactor=0.40; perf.spawnRateMultiplier=0; perf.swarmSizeMultiplier=0;
  } else {
    const t=clamp(perf.healthyTimer/PERFORMANCE_CONFIG.healthyHoldSeconds,0,1);
    perf.budgetFactor=lerp(0.60,1.00,t); perf.vfxFactor=lerp(0.60,1.00,t); perf.spawnRateMultiplier=lerp(0.45,1.00,t); perf.swarmSizeMultiplier=lerp(0.55,1.00,t);
  }
  const pressure=g.hollowPressure || 0;
  const mission=g.missionIndex || 1;
  const timeScale=clamp(1+g.time/540,1,1.7);
  const difficultyCap=PERFORMANCE_CONFIG.baseMaxEnemies + pressure*10 + (mission-1)*6;
  const cap=Math.max(PERFORMANCE_CONFIG.minMaxEnemies, Math.floor(difficultyCap*timeScale*perf.budgetFactor));
  g.enemyBudget.currentMaxEnemies=cap;
  if(perf.state===PERF_STATES.CRITICAL) performanceDespawnLowPriorityEnemies(g,dt);
  updatePerformanceDebugPanel(g);
}

function performanceDespawnLowPriorityEnemies(g,dt){
  const perf=g.performance;
  const cap=g.enemyBudget?.currentMaxEnemies || PERFORMANCE_CONFIG.minMaxEnemies;
  if(g.enemies.length<=cap) return;
  perf.despawnAccumulator=(perf.despawnAccumulator||0)+dt*PERFORMANCE_CONFIG.criticalDespawnPerSecond;
  let quota=Math.floor(perf.despawnAccumulator);
  if(quota<=0) return;
  perf.despawnAccumulator-=quota;
  const p=g.player;
  const cam=g.camera || {x:0,y:0};
  const candidates=[];
  for(let i=0;i<g.enemies.length;i++){
    const e=g.enemies[i];
    if(!e || e.hp<=0 || e.type==='boss' || e.type==='elite') continue;
    const d2=dist2(p.x,p.y,e.x,e.y);
    if(d2<PERFORMANCE_CONFIG.despawnDistance*PERFORMANCE_CONFIG.despawnDistance) continue;
    const margin=PERFORMANCE_CONFIG.cameraMargin;
    const visible=e.x>cam.x-margin && e.x<cam.x+innerWidth+margin && e.y>cam.y-margin && e.y<cam.y+innerHeight+margin;
    if(visible) continue;
    candidates.push({i,d2,type:e.type});
  }
  candidates.sort((a,b)=>b.d2-a.d2);
  let removed=0;
  for(const c of candidates){
    if(removed>=quota || g.enemies.length<=cap) break;
    g.enemies.splice(c.i-removed,1);
    removed++;
  }
  if(removed){
    perf.enemiesDespawned+=removed;
    if(g.debug?.perfDespawnLog) log(g,`Performance despawned ${removed} distant enemies.`);
  }
}

function getEnemyBulletCap(g){
  const state=g.performance?.state || PERF_STATES.HEALTHY;
  if(state===PERF_STATES.CRITICAL) return PERFORMANCE_CONFIG.maxEnemyBulletsCritical;
  if(state===PERF_STATES.WARNING) return PERFORMANCE_CONFIG.maxEnemyBulletsWarning;
  if(state===PERF_STATES.RECOVERING) return PERFORMANCE_CONFIG.maxEnemyBulletsRecovering;
  return PERFORMANCE_CONFIG.maxEnemyBulletsHealthy;
}

function canSpawnNormalEnemy(g,type,count=1){
  const perf=g.performance;
  if(!perf) return true;
  const important=type==='boss';
  if(important) return true;
  if(perf.state===PERF_STATES.CRITICAL){ perf.skippedSpawns=(perf.skippedSpawns||0)+count; return false; }
  const cap=g.enemyBudget?.currentMaxEnemies || PERFORMANCE_CONFIG.baseMaxEnemies;
  if(g.enemies.length>=cap){ perf.skippedSpawns=(perf.skippedSpawns||0)+count; return false; }
  if(type==='elite' && perf.state===PERF_STATES.WARNING && g.enemies.length>cap*0.85){ perf.skippedSpawns=(perf.skippedSpawns||0)+count; return false; }
  return true;
}

function performanceAdjustedCount(g,count,swarm=false){
  const perf=g.performance;
  if(!perf) return Math.max(0,Math.floor(count));
  const mul=swarm ? perf.swarmSizeMultiplier : perf.spawnRateMultiplier;
  return Math.max(0,Math.floor(count*mul));
}

function shouldEmitVfx(g,important=false){
  if(g?.debug?.forceFullVfx) return true;
  if(important || !g?.performance) return true;
  const ok = Math.random() <= (g.performance.vfxFactor ?? 1);
  if(!ok && g.debug) g.debug.vfxSkipped=(g.debug.vfxSkipped||0)+1;
  return ok;
}

function updateVfxDebugMetrics(g){
  // Safe runtime/debug helper. It is intentionally defined in systems.js because
  // updatePerformanceDebugPanel() can run before the debug panel is opened.
  // If the VFX debug metrics DOM does not exist yet, this function must no-op.
  const box=document.getElementById('debugVfxMetrics');
  if(!box || !g) return;
  const perf=g.performance || {};
  const particles=g.particles || [];
  const spriteVfx=particles.filter(p=>p.shape==='sprite').length;
  const proceduralVfx=particles.length - spriteVfx;
  const skipped=g.debug?.vfxSkipped || 0;
  const last=g.debug?.lastVfxComposition || 'none';
  const budget=(perf.vfxFactor ?? 1);
  box.textContent = [
    `Active sprite VFX: ${spriteVfx}`,
    `Procedural particles: ${proceduralVfx}`,
    `Total particles: ${particles.length}`,
    `Performance state: ${perf.state || 'unknown'}`,
    `VFX budget factor: ${Number.isFinite(budget) ? budget.toFixed(2) : budget}`,
    `Skipped VFX layers: ${skipped}`,
    `Full VFX override: ${g.debug?.forceFullVfx ? 'ON' : 'OFF'}`,
    `Last composition: ${last}`
  ].join('\n');
}

function updatePathFollowingDebugMetrics(g){
  const box=document.getElementById('debugPathFollowMetrics');
  if(!box || !g) return;
  const m=typeof collectEnemyPathFollowingMetrics==='function'?collectEnemyPathFollowingMetrics(g):{count:0,avg:0,max:0,warning:0,critical:0,stalling:0};
  box.textContent = [
    `Path-tracked enemies: ${m.count||0}`,
    `Average off-track: ${(m.avg||0).toFixed(1)} px`,
    `Maximum off-track: ${(m.max||0).toFixed(1)} px`,
    `Warning count: ${m.warning||0}`,
    `Critical count: ${m.critical||0}`,
    `Stalling/correcting: ${m.stalling||0}`,
    `Path following: ${ENEMY_PATH_FOLLOWING.enabled?'ON':'OFF'}`,
    `Corner smoothing: ${ENEMY_CORNER_SMOOTHING.enabled?'ON':'OFF'}`,
    `Freeze enemies: ${g.debug?.freezeEnemies?'ON':'OFF'}`
  ].join('\n');
}

function updatePerformanceDebugPanel(g){
  const box=document.getElementById('debugPerfMetrics');
  if(g) { updateVfxDebugMetrics(g); updatePathFollowingDebugMetrics(g); if(typeof updateChargingWaveDebugPanel==='function') updateChargingWaveDebugPanel(g); }
  if(!box || !g?.performance) return;
  const p=g.performance;
  box.textContent = [
    `Current FPS: ${p.currentFPS.toFixed(1)}`,
    `Average FPS: ${p.averageFPS.toFixed(1)}`,
    `Frame time: ${p.frameTimeMs.toFixed(1)} ms`,
    `Avg frame: ${p.averageFrameTimeMs.toFixed(1)} ms`,
    `Performance: ${p.state}${p.forced?' (forced)':''}`,
    `Enemies: ${g.enemies.length}/${g.enemyBudget.currentMaxEnemies}`,
    `Enemy bullets: ${g.enemyBullets.length}/${getEnemyBulletCap(g)}`,
    `Spawn x: ${p.spawnRateMultiplier.toFixed(2)}`,
    `Swarm x: ${p.swarmSizeMultiplier.toFixed(2)}`,
    `Budget factor: ${p.budgetFactor.toFixed(2)}`,
    `VFX factor: ${p.vfxFactor.toFixed(2)}`,
    `Skipped spawns: ${p.skippedSpawns||0}`,
    `Skipped bullets: ${p.skippedBullets||0}`,
    `Perf despawned: ${p.enemiesDespawned||0}`
  ].join('\n');
}


function update(g,dt){
  if(g.state !== 'playing' || paused || awaitingUpgrade) return;
  g.time += dt;
  updatePerformanceBudgets(g,dt);
  updateHollowPressure(g,dt);
  updateChargingWaveScheduler(g,dt);
  shake = Math.max(0, shake - dt*18);
  logTimeout = Math.max(0, logTimeout-dt);
  updateGamepadActions(g);
  updatePlayer(g,dt);
  if(typeof updateRunStatsFrame==='function') updateRunStatsFrame(g,dt);
  updateLavaContactDamage(g,dt);
  updateWeapons(g,dt);
  updateWardenDrones(g,dt);
  updateSifterDrones(g,dt);
  updateEnemies(g,dt);
  updateEnemyBoomerangs(g,dt);
  updateEnemyBullets(g,dt);
  updateMissiles(g,dt);
  if(g.state !== 'playing') return;
  updateArcConnection(g,dt);
  updateBullets(g,dt);
  updateBoomerangs(g,dt);
  updateTraps(g,dt);
  updatePickups(g,dt);
  updateRunProgress(g,dt);
  if(g.state !== 'playing') return;
  updateParticles(g,dt);
  updateSpawning(g,dt);
  updateUI(g);
}

function updateHollowPressure(g,dt){
  const old=g.hollowPressure || 0;
  const newLevel=Math.floor(g.time/120);
  if(newLevel>old){
    g.hollowPressure=newLevel;
    g.pressureFlash=2.4;
    log(g, `Hollow Pressure Rising: ${newLevel}`);
    sfx('wave',0.95);
    const burst=performanceAdjustedCount(g,Math.min(4+newLevel*2,18),true);
    if(burst>0 && canSpawnNormalEnemy(g,newLevel>2?'grunt':'swarmer',burst)) spawnBurst(g,burst,newLevel>2?'grunt':'swarmer');
  }
  g.pressureFlash=Math.max(0,(g.pressureFlash || 0)-dt);
}

function updateGamepadActions(g){
  // Legacy per-frame action hook is kept for compatibility. Gamepad input is
  // now polled once per frame by updateGamepadInput() so button edges are not
  // consumed multiple times by different systems.
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
  const hasInput = !!(dx||dy);
  if(hasInput){ p.lastDx=dx; p.lastDy=dy; }

  p.iframes=Math.max(0,p.iframes-dt);
  p.dashCd=Math.max(0,p.dashCd-dt);
  p.dashT=Math.max(0,p.dashT-dt);
  p.trapCd=Math.max(0,p.trapCd-dt);
  p.heat=Math.max(0,p.heat - dt*22*p.coolMul);
  p.drillPressure = Math.max(0, (p.drillPressure || 0) - dt*2.4);
  if(p.miningLock) p.miningLock.timer = Math.max(0, p.miningLock.timer - dt);

  const dashBoost = p.dashT>0 ? 3.4 : 1;
  const overheatSlow = p.heat >= p.maxHeat ? 0.72 : 1;
  const lowSpeedDebug = g.debug?.lowSpeedMiningTest ? 0.42 : 1;
  const spd=p.baseSpeed*p.speedMul*dashBoost*overheatSlow*lowSpeedDebug;
  const intendedDx = dx*spd*dt;
  const intendedDy = dy*spd*dt;
  const intendedDisp = Math.hypot(intendedDx,intendedDy);
  const lowSpeedMining = hasInput && (intendedDisp < 4.0 || g.debug?.lowSpeedMiningTest);

  const oldX=p.x, oldY=p.y;

  // v2: evaluate mining intent before collision resolution. This is the
  // important part for low speed: even if collision later slides the player
  // along a wall, the rock the player was trying to push into is still known.
  const preMining = hasInput ? findMiningTarget(g,p,dx,dy,{x:oldX,y:oldY,lowSpeed:lowSpeedMining,phase:'pre'}) : null;

  moveCircle(g,p,intendedDx,intendedDy);

  // Evaluate again after movement because the collision solver may have placed
  // the player near a corner contact that was not quite reachable pre-solve.
  const postMining = hasInput ? findMiningTarget(g,p,dx,dy,{x:p.x,y:p.y,lowSpeed:lowSpeedMining,phase:'post',previous:preMining}) : null;
  const miningTarget = chooseMiningTarget(g,p,dx,dy,preMining,postMining,lowSpeedMining);

  if(g.debug){
    g.debug.currentMiningTarget = miningTarget ? {tx:miningTarget.tx, ty:miningTarget.ty, score:miningTarget.score||0} : null;
    g.debug.currentMiningLock = p.miningLock ? {tx:p.miningLock.tx, ty:p.miningLock.ty, timer:p.miningLock.timer} : null;
    g.debug.miningIntent = hasInput ? {x:oldX,y:oldY,dx,dy} : null;
    g.debug.actualMovement = hasInput ? {x:oldX,y:oldY,dx:p.x-oldX,dy:p.y-oldY} : null;
    g.debug.lowSpeedMiningActive = !!lowSpeedMining;
    g.debug.miningStickinessActive = !!(p.miningLock && p.miningLock.timer>0);
  }

  if(miningTarget){
    refreshMiningLock(p,miningTarget);
    p.drillPressure = Math.min(1.25, (p.drillPressure || 0) + dt*5.0);

    // v2: if we are drilling, do not let a tile-corner collision turn forward
    // intent into backward drift or excessive tangential skating. We preserve a
    // little slide so the operator still feels smooth, but strongly damp it at
    // low speed and while the drill has pressure on the rock.
    applyMiningContactDamping(g,p,oldX,oldY,dx,dy,lowSpeedMining);
    mineTile(g,p,miningTarget.tx,miningTarget.ty,dt);
  } else if(!hasInput || !isMiningLockStillUseful(g,p,dx,dy,p.miningLock,lowSpeedMining)){
    if(p.miningLock && p.miningLock.timer<=0) p.miningLock=null;
  }
}


function updateLavaContactDamage(g,dt){
  const p=g.player;
  p.lavaDamageCd=Math.max(0,(p.lavaDamageCd || 0)-dt);
  p.chargingWaveExplosionDamageCd=Math.max(0,(p.chargingWaveExplosionDamageCd || 0)-dt);
  if(g.debug && g.debug.lavaDamageEnabled===false) return;
  const r=p.collisionR || p.r;
  const minx=Math.floor((p.x-r-2)/TILE), maxx=Math.floor((p.x+r+2)/TILE);
  const miny=Math.floor((p.y-r-2)/TILE), maxy=Math.floor((p.y+r+2)/TILE);
  let hit=null;
  for(let ty=miny;ty<=maxy && !hit;ty++) for(let tx=minx;tx<=maxx;tx++){
    if(tileAt(g,tx,ty)!==TILE_LAVA_ROCK) continue;
    const rx=tx*TILE, ry=ty*TILE;
    const cx=clamp(p.x,rx,rx+TILE), cy=clamp(p.y,ry,ry+TILE);
    if(dist2(p.x,p.y,cx,cy)<(r+1)*(r+1)){ hit={tx,ty,cx,cy}; break; }
  }
  if(!hit) return;
  if(p.lavaDamageCd<=0){
    const damage=Math.max(1,Math.round(10*(p.armourMul || 1)));
    p.hp-=damage;
    if(typeof recordRunDamageTaken==='function') recordRunDamageTaken(g,damage,'lava');
    p.lavaDamageCd=0.72;
    p.iframes=Math.max(p.iframes,0.22);
    flashDamage();
    floating(g,p.x,p.y-24,`-${damage} heat`,'#ff7a38');
    sfx('lavaBurn',0.9);
    const cx=hit.tx*TILE+TILE/2, cy=hit.ty*TILE+TILE/2;
    const dx=p.x-cx, dy=p.y-cy, l=len(dx,dy);
    p.x+=dx/l*9;
    p.y+=dy/l*9;
    shake=Math.max(shake,4);
    for(let k=0;k<12;k++) addParticle(g,hit.cx,hit.cy,rand(-80,80),rand(-80,80),'#ff7038',rand(0.15,0.38),rand(2,6), k%3===0?'fragment':'spark');
    addRing(g,hit.cx,hit.cy,'rgba(255,112,56,0.72)',0.18,5,28,3);
    spawnVfxComposition(g,'lavaBurst',hit.cx,hit.cy,{radius:24,color:'#ff7038'});
    if(p.hp<=0) gameOver(g);
  }
}

function isMineableForPlayer(t){
  return typeof isMineableTile === 'function' ? isMineableTile(t) : (t===TILE_ROCK || t===TILE_GOLD || t===TILE_NITRA || t===TILE_CRYSTAL || t===TILE_FERRITE_BARK || t===TILE_LUMINA_SPORES || t===TILE_AETHER_QUARTZ || t===TILE_CRYSALITH || t===TILE_EMBERGLASS);
}

function findMiningTarget(g,p,dx,dy,options={}){
  const l=len(dx,dy); dx/=l; dy/=l;
  const originX = options.x ?? p.x;
  const originY = options.y ?? p.y;
  const lowSpeed = !!options.lowSpeed;
  const r=p.collisionR || p.r;

  // v2 tuning: this is still short-range contact mining, not global long-range
  // mining. Low-speed mode adds a little tolerance because per-frame movement
  // can be too small to create a strong collision signal.
  const reach = r + (lowSpeed ? 32 : 26);
  const contactMargin = lowSpeed ? 16 : 10;
  const halfAngle=Math.PI*0.50; // 100 degree total fan.
  const sampleAngles=[0, -Math.PI/9, Math.PI/9, -Math.PI/4.5, Math.PI/4.5, -Math.PI/3.9, Math.PI/3.9];
  const sampleRanges=[r+3, r+10, r+18, reach];
  const samples=[];

  for(const range of sampleRanges){
    for(const off of sampleAngles){
      const ca=Math.cos(off), sa=Math.sin(off);
      const sx=dx*ca - dy*sa;
      const sy=dy*ca + dx*sa;
      samples.push({x:originX+sx*range,y:originY+sy*range,dx:sx,dy:sy,range,off});
    }
  }

  const candidates=new Map();
  const addCandidate=(tx,ty,sourceBonus=0,sample=null)=>{
    if(!inMap(tx,ty)) return;
    const t=tileAt(g,tx,ty);
    if(!isMineableForPlayer(t)) return;

    const left=tx*TILE, top=ty*TILE, right=left+TILE, bottom=top+TILE;
    const center=tileCenter(tx,ty);
    const vx=center.x-originX, vy=center.y-originY;
    const dist=Math.hypot(vx,vy) || 1;
    const align=(vx/dist)*dx+(vy/dist)*dy;

    // Circle-to-rect distance gives true corner contact behaviour. This catches
    // the case where the player circle touches a tile corner even though the
    // tile centre is not well aligned.
    const nearestX=clamp(originX,left,right), nearestY=clamp(originY,top,bottom);
    const edgeDistance=Math.max(0, Math.hypot(originX-nearestX, originY-nearestY) - r);
    const touching = edgeDistance <= contactMargin;

    // Direction gate: strict for centre/ray candidates, forgiving for physical
    // corner contact. This prevents mining behind the player while allowing the
    // intended corner-mining behaviour.
    const minAlign = touching ? (lowSpeed ? 0.18 : 0.24) : 0.42;
    if(align < minAlign) return;

    const along = vx*dx + vy*dy;
    const perpendicular = Math.abs(vx*dy - vy*dx);
    const rayReachOk = along > -r*0.25 && along < reach + TILE*0.95 && perpendicular < TILE*1.18;
    if(!touching && !rayReachOk) return;

    let sampleHit=false;
    if(sample){
      const sx=clamp(sample.x,left,right), sy=clamp(sample.y,top,bottom);
      sampleHit = Math.hypot(sample.x-sx,sample.y-sy) <= (lowSpeed ? 15 : 10);
    }

    const forwardPointX=originX+dx*reach, forwardPointY=originY+dy*reach;
    const forwardDistance=Math.hypot(center.x-forwardPointX,center.y-forwardPointY)/TILE;
    const rayDistance=perpendicular/TILE;
    const edgeScore=1-clamp(edgeDistance/(contactMargin+12),0,1);
    const locked = p.miningLock && p.miningLock.tx===tx && p.miningLock.ty===ty && p.miningLock.timer>0;
    const score =
      align*4.4 +
      edgeScore*2.6 +
      (touching?1.45:0) +
      (sampleHit?0.95:0) +
      sourceBonus +
      (locked?5.0:0) -
      rayDistance*1.55 -
      forwardDistance*0.45 -
      dist/(TILE*5);

    const key=tileIdx(tx,ty);
    const candidate={tx,ty,score,dist,align,edgeDistance,touching,rayDistance,source:sample?'fan':'scan'};
    const old=candidates.get(key);
    if(!old || candidate.score>old.score) candidates.set(key,candidate);
  };

  // Fan samples catch intended direction and wider side/corner contacts.
  for(const smp of samples){
    const tx=Math.floor(smp.x/TILE), ty=Math.floor(smp.y/TILE);
    for(let oy=-1;oy<=1;oy++) for(let ox=-1;ox<=1;ox++) addCandidate(tx+ox,ty+oy,0.5-Math.abs(smp.off)*0.35,smp);
  }

  // Nearby circle scan catches true tile-corner overlap where no sample lands
  // cleanly inside the tile. This is essential for low-speed corner mining.
  const scanReach=reach+TILE*0.75;
  const minx=Math.floor((originX-r-scanReach)/TILE), maxx=Math.floor((originX+r+scanReach)/TILE);
  const miny=Math.floor((originY-r-scanReach)/TILE), maxy=Math.floor((originY+r+scanReach)/TILE);
  for(let ty=miny;ty<=maxy;ty++) for(let tx=minx;tx<=maxx;tx++) addCandidate(tx,ty,0,null);

  let best=null;
  for(const c of candidates.values()){
    if(!best || c.score>best.score || (Math.abs(c.score-best.score)<0.001 && c.edgeDistance<best.edgeDistance)) best=c;
  }

  if(g.debug){
    // Merge rather than overwrite so the post-pass can display all candidates.
    const list=[...candidates.values()].map(c=>({tx:c.tx,ty:c.ty,score:c.score,touching:c.touching,source:c.source}));
    if(options.phase==='pre'){
      g.debug.miningSamples=samples;
      g.debug.miningCandidates=list;
    } else {
      g.debug.miningSamplesPost=samples;
      g.debug.miningCandidatesPost=list;
    }
  }
  return best;
}

function chooseMiningTarget(g,p,dx,dy,preTarget,postTarget,lowSpeed){
  // First priority: locked target if still valid. This prevents flicker between
  // adjacent corner tiles while the player holds the same mining direction.
  if(isMiningLockStillUseful(g,p,dx,dy,p.miningLock,lowSpeed)){
    const locked={tx:p.miningLock.tx,ty:p.miningLock.ty,score:999,locked:true};
    return locked;
  }
  if(preTarget && postTarget){
    // If both exist, choose by score but give pre-collision intent a small bias:
    // it is what the player tried to drill before collision altered the motion.
    const preScore=preTarget.score+0.7;
    const postScore=postTarget.score;
    return preScore>=postScore ? preTarget : postTarget;
  }
  return preTarget || postTarget || null;
}

function refreshMiningLock(p,target){
  if(!target) return;
  p.miningLock = { tx:target.tx, ty:target.ty, timer:0.28 };
  p.miningTile = tileIdx(target.tx,target.ty);
}

function isMiningLockStillUseful(g,p,dx,dy,lock,lowSpeed=false){
  if(!lock || lock.timer<=0 || !(dx||dy)) return false;
  if(!inMap(lock.tx,lock.ty) || !isMineableForPlayer(tileAt(g,lock.tx,lock.ty))) return false;
  const r=p.collisionR || p.r;
  const reach=r+(lowSpeed?34:28);
  const c=tileCenter(lock.tx,lock.ty);
  const vx=c.x-p.x, vy=c.y-p.y;
  const d=Math.hypot(vx,vy) || 1;
  const align=(vx/d)*dx+(vy/d)*dy;
  const left=lock.tx*TILE, top=lock.ty*TILE;
  const nx=clamp(p.x,left,left+TILE), ny=clamp(p.y,top,top+TILE);
  const edgeDistance=Math.max(0,Math.hypot(p.x-nx,p.y-ny)-r);
  const touching=edgeDistance <= (lowSpeed?18:12);
  return (touching && align>0.10) || (d<reach+TILE*0.85 && align>0.28);
}

function applyMiningContactDamping(g,p,oldX,oldY,dx,dy,lowSpeed){
  const movedX=p.x-oldX, movedY=p.y-oldY;
  const forward=movedX*dx + movedY*dy;
  const lateralX=movedX - dx*forward;
  const lateralY=movedY - dy*forward;

  // Drill pressure makes sustained contact more sticky. At very low speed we
  // strongly reduce tangential motion, which stops the character from skating
  // across several blocks without mining.
  const pressure=clamp(p.drillPressure || 0,0,1.25);
  const slideDamp = lowSpeed ? 0.18 : clamp(0.58 - pressure*0.18, 0.28, 0.58);
  const forwardKeep = Math.max(0, forward); // never preserve backward drift while drilling.
  const candidateX=oldX + dx*forwardKeep + lateralX*slideDamp;
  const candidateY=oldY + dy*forwardKeep + lateralY*slideDamp;
  const r=p.collisionR || p.r;
  if(circleClearOfSolids(g,candidateX,candidateY,r)){
    p.x=candidateX; p.y=candidateY;
  } else if(lowSpeed && circleClearOfSolids(g,oldX,oldY,r)){
    // If the damped slide would still collide, stay braced at the previous
    // valid position instead of being pushed sideways/backwards by the corner.
    p.x=oldX; p.y=oldY;
  }
}

function mineTile(g,p,tx,ty,dt){
  if(p.heat >= p.maxHeat || !inMap(tx,ty)) return;
  const i=tileIdx(tx,ty), t=g.tiles[i];
  if(!isMineableForPlayer(t)) return;
  const pressureBonus = 1 + Math.min(0.35, (p.drillPressure || 0) * 0.25);
  const miningPower = 55 * p.mineMul * pressureBonus * dt;
  g.tileHp[i] -= miningPower;
  p.heat += dt * 32 * p.heatEfficiency;
  const cx=tx*TILE+TILE/2, cy=ty*TILE+TILE/2;
  const minedData=TILE_DATA[t] || MINERALS.crust;
  if(Math.random()<0.55) addParticle(g, cx, cy, rand(-55,55), rand(-55,55), minedData.color || '#b48a61', rand(0.12,0.30), rand(2,5),'spark');
  sfx('mine', 0.65);
  if(g.tileHp[i]<=0){
    g.tiles[i]=TILE_EMPTY;
    if(g.runStats) g.runStats.blocksMined=(g.runStats.blocksMined||0)+1;
    g.tileHp[i]=0;
    g.navigationVersion++;
    for(const e of g.enemies){
      if(dist2(e.x,e.y,cx,cy)<520*520) e.pathTimer=0;
    }
    shake = Math.max(shake, 2.5);
    sfx('rockBreak', 0.85);
    for(let k=0;k<10;k++) addParticle(g, cx, cy, rand(-120,120), rand(-120,120), '#8b735e', rand(0.28,0.6), rand(2,6));
    const resourceId=resourceIdForTile(t);
    if(resourceId){
      const amount=resourceAmountForTile(t);
      if(resourceId==='echo'){
        dropPickup(g,tx*TILE+18,ty*TILE+18,'xp',12);
        floating(g,tileToWorldCenterX(tx),tileToWorldCenterY(ty)-TILE*0.18,'+Echo Shards',MINERALS.echo.color);
      } else {
        collectRunResource(g,resourceId,amount);
        floating(g,tileToWorldCenterX(tx),tileToWorldCenterY(ty)-TILE*0.18,`+${MINERALS[resourceId].displayName}`,MINERALS[resourceId].color);
      }
      if(saveProfile?.statistics) saveProfile.statistics.totalOreMined+=amount;
      sfx('mineral');
    }
  }
}

function resourceIdForTile(t){
  if(t===TILE_GOLD) return 'gild';
  if(t===TILE_NITRA) return 'voltarite';
  if(t===TILE_CRYSTAL) return 'echo';
  if(t===TILE_FERRITE_BARK) return 'ferriteBark';
  if(t===TILE_LUMINA_SPORES) return 'luminaSpores';
  if(t===TILE_AETHER_QUARTZ) return 'aetherQuartz';
  if(t===TILE_CRYSALITH) return 'crysalith';
  if(t===TILE_EMBERGLASS) return 'emberglass';
  return null;
}

function resourceAmountForTile(t){
  if(t===TILE_GOLD) return randi(2,5);
  if(t===TILE_NITRA) return randi(1,3);
  if(t===TILE_AETHER_QUARTZ) return randi(1,2);
  if(t===TILE_LUMINA_SPORES) return randi(2,4);
  if(t===TILE_FERRITE_BARK) return randi(3,6);
  if(t===TILE_CRYSALITH) return randi(2,4);
  if(t===TILE_EMBERGLASS) return randi(2,4);
  return 1;
}

function moveCircle(g,obj,dx,dy){
  const oldX=obj.x, oldY=obj.y;
  const movedX = tryMoveAxis(g,obj,dx,0);
  obj.x = movedX.x;
  const movedY = tryMoveAxis(g,obj,0,dy);
  obj.y = movedY.y;

  // Subtle corner push assist: if diagonal motion was blocked by a tile corner,
  // nudge toward nearby open clearance without allowing wall penetration.
  if(obj===g.player && dx && dy && (Math.abs(obj.x-(oldX+dx))>0.5 || Math.abs(obj.y-(oldY+dy))>0.5)){
    applyCornerPushAssist(g,obj,dx,dy);
  }
  const r=obj.collisionR || obj.r;
  obj.x=clamp(obj.x,r+TILE,WORLD_W-r-TILE);
  obj.y=clamp(obj.y,r+TILE,WORLD_H-r-TILE);
}

function applyCornerPushAssist(g,obj,dx,dy){
  const r=obj.collisionR || obj.r;
  const tries=[
    {x:0,y:Math.sign(dy)*5},{x:Math.sign(dx)*5,y:0},
    {x:0,y:-Math.sign(dy)*5},{x:-Math.sign(dx)*5,y:0}
  ];
  for(const n of tries){
    const nx=obj.x+n.x, ny=obj.y+n.y;
    if(circleClearOfSolids(g,nx,ny,r)){ obj.x=nx; obj.y=ny; return; }
  }
}

function tryMoveAxis(g,obj,dx,dy){
  let nx=obj.x+dx, ny=obj.y+dy;
  const r=obj.collisionR || obj.r;
  const minx=Math.floor((nx-r)/TILE), maxx=Math.floor((nx+r)/TILE);
  const miny=Math.floor((ny-r)/TILE), maxy=Math.floor((ny+r)/TILE);
  for(let ty=miny;ty<=maxy;ty++) for(let tx=minx;tx<=maxx;tx++){
    if(isSolid(tileAt(g,tx,ty))){
      const rx=tx*TILE, ry=ty*TILE;
      const cx=clamp(nx,rx,rx+TILE), cy=clamp(ny,ry,ry+TILE);
      if(dist2(nx,ny,cx,cy)<r*r){
        if(dx>0) nx=rx-r-0.1;
        if(dx<0) nx=rx+TILE+r+0.1;
        if(dy>0) ny=ry-r-0.1;
        if(dy<0) ny=ry+TILE+r+0.1;
      }
    }
  }
  return {x:nx,y:ny};
}

function tileWalkable(g,tx,ty){
  return inMap(tx,ty) && !isSolid(tileAt(g,tx,ty));
}

function tileCenter(tx,ty){
  return tileToWorldCenter(tx,ty);
}

function lineOfSightClear(g,x1,y1,x2,y2){
  const dist=Math.hypot(x2-x1,y2-y1);
  const steps=Math.max(1,Math.ceil(dist/(TILE*0.45)));
  for(let i=1;i<steps;i++){
    const t=i/steps;
    const tx=Math.floor(lerp(x1,x2,t)/TILE), ty=Math.floor(lerp(y1,y2,t)/TILE);
    if(isSolid(tileAt(g,tx,ty))) return false;
  }
  return true;
}

function findClosestWalkableTile(g,tx,ty,maxR=8){
  if(tileWalkable(g,tx,ty)) return {tx,ty};
  let best=null, bd=Infinity;
  for(let r=1;r<=maxR;r++){
    for(let y=ty-r;y<=ty+r;y++) for(let x=tx-r;x<=tx+r;x++){
      if(Math.abs(x-tx)!==r && Math.abs(y-ty)!==r) continue;
      if(!tileWalkable(g,x,y)) continue;
      const d=(x-tx)*(x-tx)+(y-ty)*(y-ty);
      if(d<bd){ bd=d; best={tx:x,ty:y}; }
    }
    if(best) return best;
  }
  return null;
}

function reconstructPath(cameFrom,current){
  const path=[];
  while(current!==-1){
    const tx=current%MAP_W, ty=Math.floor(current/MAP_W);
    path.push(tileCenter(tx,ty));
    current=cameFrom[current] ?? -1;
  }
  path.reverse();
  return path;
}

function findPathAStar(g,startTx,startTy,goalTx,goalTy,maxNodes=900){
  const start=findClosestWalkableTile(g,startTx,startTy,5);
  const goal=findClosestWalkableTile(g,goalTx,goalTy,10);
  if(!start || !goal) return [];
  const startId=tileIdx(start.tx,start.ty), goalId=tileIdx(goal.tx,goal.ty);
  if(startId===goalId) return [tileCenter(goal.tx,goal.ty)];

  const open=[startId];
  const cameFrom=new Int32Array(MAP_W*MAP_H); cameFrom.fill(-1);
  const gScore=new Float32Array(MAP_W*MAP_H); gScore.fill(Infinity);
  const fScore=new Float32Array(MAP_W*MAP_H); fScore.fill(Infinity);
  const inOpen=new Uint8Array(MAP_W*MAP_H);
  gScore[startId]=0;
  fScore[startId]=Math.abs(start.tx-goal.tx)+Math.abs(start.ty-goal.ty);
  inOpen[startId]=1;
  const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  let processed=0, bestId=startId, bestH=fScore[startId];

  while(open.length && processed<maxNodes){
    let bestIndex=0, bestF=fScore[open[0]];
    for(let i=1;i<open.length;i++){
      const id=open[i];
      if(fScore[id]<bestF){ bestF=fScore[id]; bestIndex=i; }
    }
    const current=open.splice(bestIndex,1)[0];
    inOpen[current]=0;
    processed++;
    if(current===goalId) return reconstructPath(cameFrom,current).slice(1);
    const cx=current%MAP_W, cy=Math.floor(current/MAP_W);
    const h=Math.abs(cx-goal.tx)+Math.abs(cy-goal.ty);
    if(h<bestH){ bestH=h; bestId=current; }
    for(const [dx,dy] of dirs){
      const nx=cx+dx, ny=cy+dy;
      if(!tileWalkable(g,nx,ny)) continue;
      if(dx&&dy && (!tileWalkable(g,cx+dx,cy) || !tileWalkable(g,cx,cy+dy))) continue;
      const nid=tileIdx(nx,ny);
      const step=(dx&&dy)?1.4:1;
      const tentative=gScore[current]+step;
      if(tentative<gScore[nid]){
        cameFrom[nid]=current;
        gScore[nid]=tentative;
        fScore[nid]=tentative+Math.abs(nx-goal.tx)+Math.abs(ny-goal.ty);
        if(!inOpen[nid]){ open.push(nid); inOpen[nid]=1; }
      }
    }
  }
  return bestId!==startId ? reconstructPath(cameFrom,bestId).slice(1) : [];
}

function circleClearOfSolids(g,x,y,r){
  const minx=Math.floor((x-r)/TILE), maxx=Math.floor((x+r)/TILE);
  const miny=Math.floor((y-r)/TILE), maxy=Math.floor((y+r)/TILE);
  for(let ty=miny;ty<=maxy;ty++) for(let tx=minx;tx<=maxx;tx++){
    if(isSolid(tileAt(g,tx,ty))){
      const rx=tx*TILE, ry=ty*TILE;
      const cx=clamp(x,rx,rx+TILE), cy=clamp(y,ry,ry+TILE);
      if(dist2(x,y,cx,cy)<r*r) return false;
    }
  }
  return true;
}


const ENEMY_CORNER_SMOOTHING = {
  enabled: true,
  maxSamplesPerCorner: 6,
  maxSmoothedPoints: 80,
  safetyMargin: 4,
  lookaheadBase: 18,
};

function clonePathPoint(p){ return {x:p.x,y:p.y,curve:!!p.curve,corner:!!p.corner,raw:!!p.raw}; }
function pointSub(a,b){ return {x:a.x-b.x,y:a.y-b.y}; }
function pointLen(v){ return Math.hypot(v.x,v.y) || 1; }
function pointNorm(v){ const l=pointLen(v); return {x:v.x/l,y:v.y/l}; }
function pointDot(a,b){ return a.x*b.x+a.y*b.y; }
function quadraticBezierPoint(a,b,c,t){
  const u=1-t;
  return {x:u*u*a.x+2*u*t*b.x+t*t*c.x, y:u*u*a.y+2*u*t*b.y+t*t*c.y, curve:true};
}

function lineSegmentHasClearance(g,x1,y1,x2,y2,r){
  const dist=Math.hypot(x2-x1,y2-y1);
  const steps=Math.max(2,Math.ceil(dist/Math.max(5,r*0.55)));
  for(let i=1;i<=steps;i++){
    const t=i/steps;
    const x=lerp(x1,x2,t), y=lerp(y1,y2,t);
    if(!circleClearOfSolids(g,x,y,r)) return false;
  }
  return true;
}

function validateCurvePoints(g,points,r){
  for(const p of points){
    if(!circleClearOfSolids(g,p.x,p.y,r)) return false;
  }
  for(let i=1;i<points.length;i++){
    if(!lineSegmentHasClearance(g,points[i-1].x,points[i-1].y,points[i].x,points[i].y,r)) return false;
  }
  return true;
}

function simplifyEnemyPath(raw){
  if(!raw || raw.length<3) return (raw||[]).map(clonePathPoint);
  const out=[clonePathPoint(raw[0])];
  for(let i=1;i<raw.length-1;i++){
    const a=out[out.length-1], b=raw[i], c=raw[i+1];
    const ab=pointNorm(pointSub(b,a));
    const bc=pointNorm(pointSub(c,b));
    if(Math.abs(ab.x-bc.x)<0.04 && Math.abs(ab.y-bc.y)<0.04) continue;
    out.push(clonePathPoint(b));
  }
  out.push(clonePathPoint(raw[raw.length-1]));
  return out;
}

function buildCornerCurve(g,enemy,p0,p1,p2,curveDistance){
  const r=(enemy.pathingRadius || enemy.collisionR || enemy.r || 12) + ENEMY_CORNER_SMOOTHING.safetyMargin;
  const vIn=pointNorm(pointSub(p1,p0));
  const vOut=pointNorm(pointSub(p2,p1));
  const entry={x:p1.x-vIn.x*curveDistance,y:p1.y-vIn.y*curveDistance,corner:true};
  const exit={x:p1.x+vOut.x*curveDistance,y:p1.y+vOut.y*curveDistance,corner:true};
  const samples=clamp(Math.round(curveDistance/(TILE*0.08)),4,ENEMY_CORNER_SMOOTHING.maxSamplesPerCorner);
  const curve=[entry];
  for(let i=1;i<=samples;i++){
    const t=i/samples;
    curve.push(quadraticBezierPoint(entry,p1,exit,t));
  }
  curve[curve.length-1].corner=true;
  if(validateCurvePoints(g,curve,r)) return curve;

  // Retry with a smaller curve before giving up. This is safer in one-tile tunnels.
  const small=Math.max(enemy.r+2,curveDistance*0.55);
  const entry2={x:p1.x-vIn.x*small,y:p1.y-vIn.y*small,corner:true};
  const exit2={x:p1.x+vOut.x*small,y:p1.y+vOut.y*small,corner:true};
  const curve2=[entry2];
  for(let i=1;i<=Math.max(3,samples-2);i++) curve2.push(quadraticBezierPoint(entry2,p1,exit2,i/Math.max(3,samples-2)));
  curve2[curve2.length-1].corner=true;
  if(validateCurvePoints(g,curve2,r)) return curve2;
  return null;
}

function smoothPathCorners(g,enemy,rawPath){
  if(!ENEMY_CORNER_SMOOTHING.enabled || !rawPath || rawPath.length<3) return (rawPath||[]).map(clonePathPoint);
  const path=simplifyEnemyPath(rawPath);
  if(path.length<3) return path;
  const smooth=[clonePathPoint(path[0])];
  const clearanceFailures=[];
  for(let i=1;i<path.length-1;i++){
    const p0=path[i-1], p1=path[i], p2=path[i+1];
    const vIn=pointNorm(pointSub(p1,p0));
    const vOut=pointNorm(pointSub(p2,p1));
    const dot=pointDot(vIn,vOut);
    if(dot<0.85){
      const legIn=Math.hypot(p1.x-p0.x,p1.y-p0.y);
      const legOut=Math.hypot(p2.x-p1.x,p2.y-p1.y);
      const desired=clamp((enemy.pathingRadius||enemy.r||12)+6,TILE*0.22,TILE*0.45);
      const curveDistance=Math.max(8,Math.min(desired,legIn*0.48,legOut*0.48));
      const curve=buildCornerCurve(g,enemy,p0,p1,p2,curveDistance);
      if(curve){
        // Avoid duplicate entry point if it is almost the same as the previous point.
        for(const cp of curve){
          const last=smooth[smooth.length-1];
          if(!last || Math.hypot(cp.x-last.x,cp.y-last.y)>4) smooth.push(cp);
          if(smooth.length>=ENEMY_CORNER_SMOOTHING.maxSmoothedPoints) break;
        }
      } else {
        clearanceFailures.push({x:p1.x,y:p1.y});
        smooth.push({...clonePathPoint(p1), raw:true});
      }
    } else {
      smooth.push(clonePathPoint(p1));
    }
    if(smooth.length>=ENEMY_CORNER_SMOOTHING.maxSmoothedPoints) break;
  }
  if(smooth.length<ENEMY_CORNER_SMOOTHING.maxSmoothedPoints) smooth.push(clonePathPoint(path[path.length-1]));
  enemy.smoothPath=smooth;
  enemy.rawPath=rawPath.map(clonePathPoint);
  enemy.pathClearanceFailures=clearanceFailures;
  return smooth;
}

function findPointAlongPathFrom(enemy,startIndex,lookaheadDistance){
  const path=enemy.path || [];
  if(!path.length || startIndex>=path.length) return null;
  let x=enemy.x, y=enemy.y;
  let remaining=lookaheadDistance;
  for(let i=startIndex;i<path.length;i++){
    const p=path[i];
    const d=Math.hypot(p.x-x,p.y-y);
    if(d>=remaining){
      const t=remaining/Math.max(1,d);
      return {x:lerp(x,p.x,t),y:lerp(y,p.y,t),index:i};
    }
    remaining-=d; x=p.x; y=p.y;
  }
  const last=path[path.length-1];
  return {x:last.x,y:last.y,index:path.length-1};
}

function getEnemyLookaheadTarget(enemy){
  const dist=(enemy.pathingRadius || enemy.r || 12)*2 + ENEMY_CORNER_SMOOTHING.lookaheadBase;
  return findPointAlongPathFrom(enemy,enemy.pathIndex||0,dist);
}

const ENEMY_PATH_FOLLOWING = {
  enabled: true,
  correctionGain: 4.0,
  maxCorrectionSpeedMul: 0.95,
  warningRadiusMul: 0.75,
  criticalRadiusMul: 1.5,
  maxBacktrack: 18,
  minProgressBeforeRepath: 5,
  stallTriggerTime: 0.55,
};

function buildPathPolylineSamples(path){
  const samples=[];
  if(!path || !path.length) return samples;
  let arc=0;
  samples.push({x:path[0].x,y:path[0].y,arc:0,source:path[0]});
  for(let i=1;i<path.length;i++){
    const a=samples[samples.length-1], b=path[i];
    const d=Math.hypot(b.x-a.x,b.y-a.y);
    if(d<0.5) continue;
    arc+=d;
    samples.push({x:b.x,y:b.y,arc,source:b});
  }
  return samples;
}

function prepareEnemyPathFollower(g,enemy){
  enemy.pathSamples=buildPathPolylineSamples(enemy.path || []);
  enemy.pathProgressDistance=0;
  enemy.lastPathProgressDistance=0;
  enemy.closestSegmentIndex=0;
  enemy.offtrackDistance=0;
  enemy.maxOfftrackDistanceSeen=0;
  enemy.pathFollowMode='normal';
  enemy.pathProgressStallTimer=0;
  enemy.pathUnsafeSections=[];
  const r=(enemy.pathingRadius || enemy.r || 12)*0.92;
  const samples=enemy.pathSamples || [];
  for(let i=0;i<samples.length;i+=Math.max(1,Math.floor(samples.length/40))){
    const sm=samples[i];
    if(!circleClearOfSolids(g,sm.x,sm.y,r)) enemy.pathUnsafeSections.push({x:sm.x,y:sm.y,index:i});
  }
}

function closestPointOnSegment(px,py,ax,ay,bx,by){
  const vx=bx-ax, vy=by-ay;
  const lenSq=vx*vx+vy*vy || 1;
  const t=clamp(((px-ax)*vx+(py-ay)*vy)/lenSq,0,1);
  return {x:ax+vx*t,y:ay+vy*t,t,distSq:(px-(ax+vx*t))**2+(py-(ay+vy*t))**2};
}

function getClosestPathInfo(enemy){
  const samples=enemy.pathSamples || [];
  if(samples.length<2) return null;
  let best=null;
  const prev=enemy.closestSegmentIndex || 0;
  const start=Math.max(0,prev-8), end=Math.min(samples.length-2,prev+12);
  const scan=(i)=>{
    const a=samples[i], b=samples[i+1];
    const cp=closestPointOnSegment(enemy.x,enemy.y,a.x,a.y,b.x,b.y);
    if(!best || cp.distSq<best.distSq){
      const segLen=Math.hypot(b.x-a.x,b.y-a.y) || 1;
      best={...cp, segmentIndex:i, arcLength:a.arc+segLen*cp.t, tangent:{x:(b.x-a.x)/segLen,y:(b.y-a.y)/segLen}, distSq:cp.distSq};
    }
  };
  for(let i=start;i<=end;i++) scan(i);
  // If the local window is poor, fall back to full scan. This happens after collisions or teleports.
  if(!best || best.distSq>(enemy.r*enemy.r*9)){
    best=null;
    for(let i=0;i<samples.length-1;i++) scan(i);
  }
  return best;
}

function getPathPointAtArc(samples,arc){
  if(!samples || !samples.length) return null;
  if(arc<=0) return {x:samples[0].x,y:samples[0].y,index:0,arc:0};
  const last=samples[samples.length-1];
  if(arc>=last.arc) return {x:last.x,y:last.y,index:samples.length-1,arc:last.arc};
  let lo=0, hi=samples.length-1;
  while(lo<hi){
    const mid=(lo+hi)>>1;
    if(samples[mid].arc<arc) lo=mid+1; else hi=mid;
  }
  const i=Math.max(1,lo);
  const a=samples[i-1], b=samples[i];
  const span=Math.max(1,b.arc-a.arc);
  const t=clamp((arc-a.arc)/span,0,1);
  return {x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),index:i-1,arc};
}

function getLocalPathCurvature(samples,segmentIndex){
  if(!samples || samples.length<3) return 0;
  const i=clamp(segmentIndex,1,samples.length-2);
  const a=samples[i-1], b=samples[i], c=samples[i+1];
  const v1=pointNorm({x:b.x-a.x,y:b.y-a.y});
  const v2=pointNorm({x:c.x-b.x,y:c.y-b.y});
  return Math.acos(clamp(pointDot(v1,v2),-1,1));
}

function getEnemyPathFollowingSteering(g,enemy,dt){
  if(!ENEMY_PATH_FOLLOWING.enabled || !enemy.path || !enemy.path.length) return null;
  if(!enemy.pathSamples || enemy.pathSamples.length<2) prepareEnemyPathFollower(g,enemy);
  const samples=enemy.pathSamples || [];
  if(samples.length<2) return null;
  const info=getClosestPathInfo(enemy);
  if(!info) return null;
  enemy.closestSegmentIndex=info.segmentIndex;
  const radius=enemy.pathingRadius || enemy.r || 12;
  const offX=info.x-enemy.x, offY=info.y-enemy.y;
  const offDist=Math.hypot(offX,offY);
  enemy.offtrackDistance=offDist;
  enemy.maxOfftrackDistanceSeen=Math.max(enemy.maxOfftrackDistanceSeen||0,offDist);
  enemy.closestPathPoint={x:info.x,y:info.y,segmentIndex:info.segmentIndex,arc:info.arcLength};
  enemy.pathTangent={x:info.tangent.x,y:info.tangent.y};
  enemy.offtrackVector={x:offX,y:offY};

  const allowedBacktrack=ENEMY_PATH_FOLLOWING.maxBacktrack;
  const rawProgress=info.arcLength;
  const prevProgress=enemy.pathProgressDistance || 0;
  const progress = rawProgress < prevProgress-allowedBacktrack ? Math.max(0,prevProgress-allowedBacktrack) : Math.max(prevProgress,rawProgress);
  enemy.lastPathProgressDistance=prevProgress;
  enemy.pathProgressDistance=progress;
  const progressDelta=progress-prevProgress;
  if(progressDelta<ENEMY_PATH_FOLLOWING.minProgressBeforeRepath*dt && offDist>radius*0.65) enemy.pathProgressStallTimer=(enemy.pathProgressStallTimer||0)+dt;
  else enemy.pathProgressStallTimer=Math.max(0,(enemy.pathProgressStallTimer||0)-dt*2);

  const curvature=getLocalPathCurvature(samples,info.segmentIndex);
  const highCurvature=curvature>0.45 || samples[Math.min(samples.length-1,info.segmentIndex+1)]?.source?.curve;
  const warning=offDist>radius*ENEMY_PATH_FOLLOWING.warningRadiusMul;
  const critical=offDist>radius*ENEMY_PATH_FOLLOWING.criticalRadiusMul;
  let lookahead=enemy.pathLookaheadDistance || Math.max(28,radius*2+18);
  if(highCurvature) lookahead*=0.55;
  if(warning) lookahead*=0.75;
  if(critical) lookahead*=0.45;
  lookahead=clamp(lookahead,Math.max(10,radius*0.85),Math.max(34,radius*4.6));
  const look=getPathPointAtArc(samples,progress+lookahead) || samples[samples.length-1];
  enemy.currentLookaheadTarget={x:look.x,y:look.y,index:look.index,arc:look.arc,curvature,offtrack:offDist};

  let fx=look.x-enemy.x, fy=look.y-enemy.y;
  let fl=Math.hypot(fx,fy);
  if(fl<0.001){ fx=info.tangent.x; fy=info.tangent.y; fl=1; }
  fx/=fl; fy/=fl;
  const correctionGain=(enemy.pathCorrectionGain || ENEMY_PATH_FOLLOWING.correctionGain) * (highCurvature?1.45:1) * (warning?1.35:1) * (critical?1.65:1);
  const corrMax=enemy.speed*ENEMY_PATH_FOLLOWING.maxCorrectionSpeedMul;
  const corrSpeed=Math.min(corrMax,offDist*correctionGain);
  const cx=offDist>0.001 ? offX/offDist*corrSpeed : 0;
  const cy=offDist>0.001 ? offY/offDist*corrSpeed : 0;
  let speedMul=critical?0.62:(warning?0.82:1.0);
  if(highCurvature) speedMul*=0.88;
  let vx=fx*enemy.speed*speedMul + cx;
  let vy=fy*enemy.speed*speedMul + cy;
  const vl=Math.hypot(vx,vy) || 1;
  const maxSpeed=enemy.speed*Math.max(0.55,speedMul);
  if(vl>maxSpeed){ vx=vx/vl*maxSpeed; vy=vy/vl*maxSpeed; }
  const ul=Math.hypot(vx,vy) || 1;
  enemy.desiredVelocity={x:vx,y:vy};
  enemy.pathFollowMode=critical?'critical-correcting':warning?'correcting':highCurvature?'corner-tracking':'normal';
  if((critical && enemy.pathProgressStallTimer>ENEMY_PATH_FOLLOWING.stallTriggerTime) || (enemy.pathUnsafeSections && enemy.pathUnsafeSections.length && enemy.stuckTimer>0.5)){
    enemy.pathFollowMode='mining-fallback';
    enemy.pathTimer=0;
    enemy.cornerFallbackTarget=findNearbyCornerMiningFallback(g,enemy,look.x,look.y);
    if(g.tunnelAiMetrics) g.tunnelAiMetrics.enemyMiningTriggeredByPathFailure=(g.tunnelAiMetrics.enemyMiningTriggeredByPathFailure||0)+1;
  }
  return {x:vx/ul,y:vy/ul,speedMul:Math.min(1,Math.max(0.45,Math.hypot(vx,vy)/Math.max(1,enemy.speed))), vx, vy, info, lookahead:look};
}

function collectEnemyPathFollowingMetrics(g){
  const metrics={count:0,total:0,max:0,warning:0,critical:0,avg:0,stalling:0};
  if(!g?.enemies) return metrics;
  for(const e of g.enemies){
    if(!e.path || !e.path.length) continue;
    const d=e.offtrackDistance || 0;
    const r=e.pathingRadius || e.r || 12;
    metrics.count++;
    metrics.total+=d;
    metrics.max=Math.max(metrics.max,d);
    if(d>r*ENEMY_PATH_FOLLOWING.warningRadiusMul) metrics.warning++;
    if(d>r*ENEMY_PATH_FOLLOWING.criticalRadiusMul) metrics.critical++;
    if((e.pathProgressStallTimer||0)>0.35) metrics.stalling++;
  }
  metrics.avg=metrics.count?metrics.total/metrics.count:0;
  return metrics;
}

function getTunnelCentrelineBias(g,enemy,dirX,dirY){
  const [tx,ty]=worldToTile(enemy.x,enemy.y);
  if(!inMap(tx,ty)) return {x:0,y:0,strength:0};
  const centre=tileCenter(tx,ty);
  const left=tileWalkable(g,tx-1,ty), right=tileWalkable(g,tx+1,ty);
  const up=tileWalkable(g,tx,ty-1), down=tileWalkable(g,tx,ty+1);
  let bx=0, by=0, strength=0;
  if(Math.abs(dirX)>Math.abs(dirY)){
    // Horizontal corridor: keep to row centre when vertical walls form a tunnel.
    if(!up || !down){ by=(centre.y-enemy.y)/Math.max(1,TILE*0.5); strength=0.34; }
  } else {
    // Vertical corridor: keep to column centre when horizontal walls form a tunnel.
    if(!left || !right){ bx=(centre.x-enemy.x)/Math.max(1,TILE*0.5); strength=0.34; }
  }
  // Extra nudge away from close solid side walls.
  const margin=(enemy.pathingRadius||enemy.r||12)+5;
  const localX=enemy.x-tx*TILE, localY=enemy.y-ty*TILE;
  if(!left && localX<margin){ bx+=0.45; strength=Math.max(strength,0.28); }
  if(!right && TILE-localX<margin){ bx-=0.45; strength=Math.max(strength,0.28); }
  if(!up && localY<margin){ by+=0.45; strength=Math.max(strength,0.28); }
  if(!down && TILE-localY<margin){ by-=0.45; strength=Math.max(strength,0.28); }
  return {x:bx,y:by,strength};
}

function findNearbyCornerMiningFallback(g,enemy,targetX,targetY){
  const [etx,ety]=worldToTile(enemy.x,enemy.y);
  const dx=Math.sign(targetX-enemy.x), dy=Math.sign(targetY-enemy.y);
  const candidates=[];
  if(dx||dy) candidates.push([etx+dx,ety+dy]);
  if(dx) candidates.push([etx+dx,ety]);
  if(dy) candidates.push([etx,ety+dy]);
  if(dx&&dy){ candidates.push([etx+dx,ety-dy],[etx-dx,ety+dy]); }
  for(const [tx,ty] of candidates){
    if(inMap(tx,ty) && typeof isEnemyMineableTile==='function' && isEnemyMineableTile(g,tx,ty)) return {tx,ty,reason:'smoothCornerFallback'};
  }
  return null;
}

function openTileScore(g,tx,ty,radiusTiles=2){
  let open=0;
  for(let y=ty-radiusTiles;y<=ty+radiusTiles;y++) for(let x=tx-radiusTiles;x<=tx+radiusTiles;x++){
    if(tileWalkable(g,x,y)) open++;
  }
  return open;
}

function bossSpawnCandidateValid(g,x,y){
  const [tx,ty]=worldToTile(x,y);
  if(!tileWalkable(g,tx,ty)) return false;
  if(!circleClearOfSolids(g,x,y,ENEMY_TYPES.boss.r+8)) return false;
  if(openTileScore(g,tx,ty,2)<16) return false;
  const [ptx,pty]=worldToTile(g.player.x,g.player.y);
  return findPathAStar(g,tx,ty,ptx,pty,1400).length>0;
}

function findSafeBossSpawn(g){
  const p=g.player;
  let fallback=null, fallbackScore=-Infinity;
  for(let tries=0;tries<120;tries++){
    const a=rand(0,Math.PI*2), d=rand(560,1350);
    const x=clamp(p.x+Math.cos(a)*d,TILE*4,WORLD_W-TILE*4);
    const y=clamp(p.y+Math.sin(a)*d,TILE*4,WORLD_H-TILE*4);
    const [tx,ty]=worldToTile(x,y);
    if(!tileWalkable(g,tx,ty) || !circleClearOfSolids(g,x,y,ENEMY_TYPES.boss.r+8)) continue;
    const score=openTileScore(g,tx,ty,3)-Math.abs(880-d)*0.004;
    if(score>fallbackScore){ fallbackScore=score; fallback={x,y}; }
    if(bossSpawnCandidateValid(g,x,y)) return {x,y};
  }
  if(fallback) return fallback;
  const [ptx,pty]=worldToTile(p.x,p.y);
  for(let r=14;r<40;r++){
    for(let ty=pty-r;ty<=pty+r;ty++) for(let tx=ptx-r;tx<=ptx+r;tx++){
      if(Math.abs(tx-ptx)!==r && Math.abs(ty-pty)!==r) continue;
      const c=tileCenter(tx,ty);
      if(dist2(c.x,c.y,p.x,p.y)<520*520) continue;
      if(bossSpawnCandidateValid(g,c.x,c.y)) return c;
    }
  }
  return {x:clamp(p.x+620,TILE*4,WORLD_W-TILE*4), y:p.y};
}

function ensureBossSpawnPocket(g,x,y){
  const [cx,cy]=worldToTile(x,y);
  let changed=false;
  for(let ty=cy-2;ty<=cy+2;ty++) for(let tx=cx-2;tx<=cx+2;tx++){
    if(!inMap(tx,ty)) continue;
    const i=tileIdx(tx,ty);
    if(g.tiles[i]!==TILE_HARD && g.tiles[i]!==TILE_EMPTY){
      g.tiles[i]=TILE_EMPTY;
      g.tileHp[i]=0;
      changed=true;
    }
  }
  if(changed) g.navigationVersion++;
}

function updateSpawning(g,dt){
  const minute = Math.floor(g.time/60);
  const stage = Math.max(0, g.time/60);
  g.spawnTimer -= dt;
  const spawnMul=(g.missionDifficulty?.enemySpawnRateMultiplier || 1) * (g.performance?.spawnRateMultiplier ?? 1);
  if(spawnMul<=0){ g.spawnTimer=Math.max(g.spawnTimer,0.35); return; }
  const enemyCap=g.enemyBudget?.currentMaxEnemies || PERFORMANCE_CONFIG.baseMaxEnemies;
  if(g.enemies.length>=enemyCap){ g.spawnTimer=Math.max(g.spawnTimer,0.45); return; }

  // Gentler early-game ramp: first minute is sparse, then the cadence and
  // group size increase smoothly. Later stages still become intense.
  const baseRate = g.time<30 ? 2.45 : g.time<60 ? 1.85 : g.time<150 ? 1.28 : 0.92;
  const pressure=g.hollowPressure || 0;
  const rate = Math.max(0.16, (baseRate - minute*0.075)/(spawnMul*(1+pressure*0.08)));
  if(g.spawnTimer<=0){
    g.spawnTimer=rate*rand(0.82,1.22);
    const roll=Math.random();
    const rawAmount = Math.max(1, Math.floor(1 + stage*0.55 + g.level*0.10 + (g.hollowPressure||0)*0.65));
    const amount = Math.max(1, performanceAdjustedCount(g, rawAmount, false));
    if(g.time<35){
      if(roll<0.75) spawnBurst(g,1,'grunt');
      else spawnBurst(g,2,'swarmer');
    } else if(g.time<90){
      if(roll<0.52) spawnBurst(g,amount,'grunt');
      else if(roll<0.82) spawnBurst(g,amount+1,'swarmer');
      else spawnBurst(g,1,'guard');
    } else {
      const hexChance = clamp(0.04 + (g.hollowPressure||0)*0.025 + Math.max(0,minute-2)*0.01, 0.04, 0.18);
      if(roll<hexChance && g.time>120) spawnBurst(g,1,'hexShard');
      else if(roll<0.42) spawnBurst(g,amount,'grunt');
      else if(roll<0.68) spawnBurst(g,amount+2,'swarmer');
      else if(roll<0.88) spawnBurst(g,Math.max(1,Math.floor(amount/2)),'guard');
      else spawnBurst(g,Math.max(1,Math.floor(amount/2)),'exploder');
    }
  }
  if(g.time > g.eliteTimer){
    g.eliteTimer += Math.max(38, 82 - minute*3 - (g.hollowPressure||0)*4);
    if(canSpawnNormalEnemy(g,'elite',1)){
      spawnBurst(g,1,'elite');
      log(g,'Hollow Tyrant detected!');
      sfx('elite');
    }
  }
  if(g.time > g.nextWave){
    g.nextWave += Math.max(34, 52 - minute*2);
    const rawWaveCount = (g.time<70 ? 4+minute*2 : 8+minute*3) + (g.hollowPressure||0)*3;
    const waveCount = performanceAdjustedCount(g, rawWaveCount, true);
    if(waveCount>0 && canSpawnNormalEnemy(g,'swarmer',waveCount)){
      spawnBurst(g,waveCount,'swarmer');
      log(g,'Swarm wave incoming!');
      sfx('wave');
    }
  }
}


const CHARGING_WAVE_CONFIG = {
  firstPossibleTime: 90,
  checkIntervalMin: 5,
  checkIntervalMax: 10,
  baseChancePerCheck: 0.07,
  minCooldown: 150,
  maxCooldown: 180,
  healthyMin: 40,
  healthyMax: 60,
  warningMin: 20,
  warningMax: 35,
  minBudget: 20,
  warningDuration: 2.0,
  spawnDistanceMin: 700,
  spawnDistanceMax: 1100,
  formationSpacing: 27,
  speedMultiplier: 1.8,
  steeringRate: 5.2,
  explosionTriggerRadius: 55,
  explosionRadius: 95,
  explosionDamage: 10,
  damageCooldown: 0.12,
  stuckBreakDelay: 0.18
};

function ensureChargingWaveState(g){
  if(!g.chargingWave){
    g.chargingWave={enabled:true,active:false,warningActive:false,warningTimer:0,warningDuration:CHARGING_WAVE_CONFIG.warningDuration,pendingOptions:null,incomingDirection:0,lastSpawnTime:-9999,nextAllowedTime:CHARGING_WAVE_CONFIG.firstPossibleTime,checkTimer:rand(CHARGING_WAVE_CONFIG.checkIntervalMin,CHARGING_WAVE_CONFIG.checkIntervalMax),cooldown:CHARGING_WAVE_CONFIG.minCooldown,activeEnemyIds:[],lastSpawnCenter:null,lastFormationTargets:[],lastSkipReason:'Initialised',forceNextCheck:false,nextWaveId:1};
  }
  return g.chargingWave;
}

function updateChargingWaveScheduler(g,dt){
  const cw=ensureChargingWaveState(g);
  if(!cw.enabled) { cw.lastSkipReason='Disabled'; updateChargingWaveActiveState(g); return; }
  updateChargingWaveActiveState(g);
  if(cw.warningActive){
    cw.warningTimer=Math.max(0,(cw.warningTimer||0)-dt);
    cw.warningPulseTimer=(cw.warningPulseTimer||0)-dt;
    if(cw.warningPulseTimer<=0){ cw.warningPulseTimer=0.35; sfx('wave',0.55); }
    if(cw.warningTimer<=0){
      const opts=cw.pendingOptions || {};
      cw.warningActive=false;
      cw.pendingOptions=null;
      spawnChargingWave(g,opts);
    }
    return;
  }
  cw.checkTimer=(cw.checkTimer||0)-dt;
  if(!cw.forceNextCheck && cw.checkTimer>0) return;
  cw.checkTimer=rand(CHARGING_WAVE_CONFIG.checkIntervalMin,CHARGING_WAVE_CONFIG.checkIntervalMax);
  cw.forceNextCheck=false;
  const can=canSpawnChargingWave(g);
  if(!can.ok){ cw.lastSkipReason=can.reason; return; }
  const pressure=g.hollowPressure || 0;
  const mission=g.missionIndex || 1;
  const chance=clamp(CHARGING_WAVE_CONFIG.baseChancePerCheck + pressure*0.012 + (mission-1)*0.006, 0.05, 0.12);
  if(Math.random()<chance) startChargingWaveWarning(g,{count:can.count,budget:can.budget});
  else cw.lastSkipReason=`Random roll missed (${Math.round(chance*100)}% check chance)`;
}

function updateChargingWaveActiveState(g){
  const cw=ensureChargingWaveState(g);
  const before=cw.activeEnemyIds?.length || 0;
  cw.activeEnemyIds=(cw.activeEnemyIds||[]).filter(id=>g.enemies.some(e=>e.chargingWaveId===id && e.hp>0));
  cw.active=cw.warningActive || cw.activeEnemyIds.length>0;
  if(before && !cw.activeEnemyIds.length && !cw.warningActive) cw.lastSkipReason='Previous charging wave cleared';
}

function canSpawnChargingWave(g){
  const cw=ensureChargingWaveState(g);
  if(g.state!=='playing') return {ok:false,reason:'Game is not in active gameplay'};
  if(!g.player || g.player.hp<=0) return {ok:false,reason:'Player is not alive'};
  if(g.extraction && g.extractionTimer>0) return {ok:false,reason:'Extraction sequence active'};
  if(cw.warningActive || cw.active) return {ok:false,reason:'A charging wave is already active'};
  if((g.time||0)<CHARGING_WAVE_CONFIG.firstPossibleTime) return {ok:false,reason:`Waiting for first possible time (${CHARGING_WAVE_CONFIG.firstPossibleTime}s)`};
  if((g.time||0)<(cw.nextAllowedTime||0)) return {ok:false,reason:`Cooldown active (${Math.max(0,cw.nextAllowedTime-g.time).toFixed(1)}s)`};
  const perf=g.performance?.state || PERF_STATES.HEALTHY;
  if(perf===PERF_STATES.CRITICAL) return {ok:false,reason:'Performance state is critical'};
  const cap=g.enemyBudget?.currentMaxEnemies || PERFORMANCE_CONFIG.baseMaxEnemies;
  const budget=Math.max(0,cap-(g.enemies?.length||0));
  if(budget<CHARGING_WAVE_CONFIG.minBudget) return {ok:false,reason:`Insufficient enemy budget (${budget}/${CHARGING_WAVE_CONFIG.minBudget})`,budget};
  const min=perf===PERF_STATES.WARNING ? CHARGING_WAVE_CONFIG.warningMin : CHARGING_WAVE_CONFIG.healthyMin;
  const max=perf===PERF_STATES.WARNING ? CHARGING_WAVE_CONFIG.warningMax : CHARGING_WAVE_CONFIG.healthyMax;
  const count=Math.min(budget,randi(min,max));
  if(count<CHARGING_WAVE_CONFIG.minBudget) return {ok:false,reason:`Wave count below minimum after budget (${count})`,budget};
  return {ok:true,reason:'OK',count,budget,perf};
}

function startChargingWaveWarning(g,options={}){
  const cw=ensureChargingWaveState(g);
  const angle=rand(0,Math.PI*2);
  cw.warningActive=true;
  cw.active=true;
  cw.warningTimer=CHARGING_WAVE_CONFIG.warningDuration;
  cw.warningDuration=CHARGING_WAVE_CONFIG.warningDuration;
  cw.incomingDirection=angle;
  cw.pendingOptions={...options,angle};
  cw.lastSkipReason='Warning active';
  log(g,'CHARGING WAVE INCOMING!');
  sfx('wave',1.15);
  shake=Math.max(shake,5);
}

function findChargingWaveSpawnCenter(g,angle){
  const p=g.player;
  const preferred=rand(CHARGING_WAVE_CONFIG.spawnDistanceMin,CHARGING_WAVE_CONFIG.spawnDistanceMax);
  const candidateAngles=[angle, angle+0.28, angle-0.28, angle+0.65, angle-0.65, angle+Math.PI*0.5, angle-Math.PI*0.5];
  for(const a of candidateAngles){
    for(let d=preferred; d>=520; d-=70){
      const x=clamp(p.x+Math.cos(a)*d,TILE*2,WORLD_W-TILE*2);
      const y=clamp(p.y+Math.sin(a)*d,TILE*2,WORLD_H-TILE*2);
      const [tx,ty]=worldToTile(x,y);
      if(!inMap(tx,ty)) continue;
      if(isSolid(tileAt(g,tx,ty))) continue;
      if(dist2(x,y,p.x,p.y)<500*500) continue;
      return {x,y,angle:a,distance:d};
    }
  }
  const x=clamp(p.x+Math.cos(angle)*700,TILE*2,WORLD_W-TILE*2);
  const y=clamp(p.y+Math.sin(angle)*700,TILE*2,WORLD_H-TILE*2);
  return {x,y,angle,distance:700};
}

function spawnChargingWave(g,options={}){
  const cw=ensureChargingWaveState(g);
  const can=canSpawnChargingWave(g);
  const count=options.count || (can.ok ? can.count : CHARGING_WAVE_CONFIG.minBudget);
  const spawnInfo=findChargingWaveSpawnCenter(g,options.angle ?? rand(0,Math.PI*2));
  const center={x:spawnInfo.x,y:spawnInfo.y};
  const dirToPlayer=normalizeVec(g.player.x-center.x,g.player.y-center.y);
  const waveId=(cw.nextWaveId||1);
  cw.nextWaveId=waveId+1;
  cw.lastSpawnCenter=center;
  cw.lastFormationTargets=[];
  cw.activeEnemyIds=[];
  const spawned=spawnChargingWaveFormation(g,center,dirToPlayer,count,waveId);
  cw.lastSpawnTime=g.time||0;
  cw.cooldown=rand(CHARGING_WAVE_CONFIG.minCooldown,CHARGING_WAVE_CONFIG.maxCooldown);
  cw.nextAllowedTime=(g.time||0)+cw.cooldown;
  cw.active=spawned>0;
  cw.warningActive=false;
  cw.lastSkipReason=spawned>0 ? `Spawned ${spawned} Rift Chargers` : 'No valid formation slots';
  if(g.runStats){ g.runStats.chargingWavesSpawned=(g.runStats.chargingWavesSpawned||0)+1; g.runStats.chargingWaveEnemiesSpawned=(g.runStats.chargingWaveEnemiesSpawned||0)+spawned; }
  log(g,`Rift Charger wave: ${spawned} enemies!`);
  sfx('elite',0.75);
  return spawned;
}

function normalizeVec(x,y){ const l=Math.max(0.001,Math.hypot(x,y)); return {x:x/l,y:y/l}; }

function formationOffsetForIndex(i,count,spacing){
  const cols=Math.ceil(Math.sqrt(count*1.35));
  const row=Math.floor(i/cols);
  const col=i%cols;
  const rows=Math.ceil(count/cols);
  const wedge=Math.abs(col-(cols-1)/2)*0.38;
  return {x:(col-(cols-1)/2)*spacing + rand(-4,4), y:(row-(rows-1)/2)*spacing + wedge*spacing + rand(-4,4)};
}

function spawnChargingWaveFormation(g,center,dir,count,waveId){
  const cw=ensureChargingWaveState(g);
  const right={x:-dir.y,y:dir.x};
  const back={x:-dir.x,y:-dir.y};
  const spacing=CHARGING_WAVE_CONFIG.formationSpacing;
  let spawned=0;
  for(let i=0;i<count;i++){
    const off=formationOffsetForIndex(i,count,spacing);
    let x=center.x + right.x*off.x + back.x*off.y;
    let y=center.y + right.y*off.x + back.y*off.y;
    x=clamp(x,TILE*2,WORLD_W-TILE*2); y=clamp(y,TILE*2,WORLD_H-TILE*2);
    const [tx,ty]=worldToTile(x,y);
    if(isSolid(tileAt(g,tx,ty))){
      const open=findClosestWalkableTile(g,tx,ty,5);
      if(open){ const c=tileCenter(open.tx,open.ty); x=c.x; y=c.y; }
      else continue;
    }
    const e=new Enemy(x,y,'charging_exploder');
    e.isChargingWaveEnemy=true;
    e.chargingWaveId=waveId;
    e.displayName='Rift Charger';
    e.visualDisplayName='Rift Charger';
    e.spawnArchetype='charging_exploder';
    e.noPathTimer=999;
    e.path=[]; e.rawPath=[]; e.smoothPath=[];
    e.chargeSpeedMultiplier=CHARGING_WAVE_CONFIG.speedMultiplier*rand(0.92,1.08);
    e.speed=(ENEMY_TYPES.charging_exploder.speed || 250)*e.chargeSpeedMultiplier;
    e.explosionTriggerRadius=CHARGING_WAVE_CONFIG.explosionTriggerRadius;
    e.explosionRadius=CHARGING_WAVE_CONFIG.explosionRadius;
    e.explosionDamage=CHARGING_WAVE_CONFIG.explosionDamage;
    e.canMineBlocks=true;
    e.countsForKillObjective=true;
    e.formationOffset=off;
    e.formationTarget={x,y};
    e.chargeDir={x:dir.x,y:dir.y};
    e.stuckBreakTimer=0;
    e.rangedCd=9999;
    e.xp=Math.max(1,e.xp||2);
    cw.activeEnemyIds.push(waveId);
    cw.lastFormationTargets.push({x,y});
    g.enemies.push(e);
    spawned++;
  }
  return spawned;
}

function updateChargingWaveEnemy(g,e,dt){
  const p=g.player;
  const dx=p.x-e.x, dy=p.y-e.y;
  const d=Math.hypot(dx,dy);
  if(d <= (e.explosionTriggerRadius || CHARGING_WAVE_CONFIG.explosionTriggerRadius)){
    explodeChargingWaveEnemy(g,e);
    return;
  }
  const target=normalizeVec(dx + (p.lastDx||0)*36, dy + (p.lastDy||0)*36);
  const steer=clamp((e.steeringRate || CHARGING_WAVE_CONFIG.steeringRate)*dt,0,1);
  e.chargeDir=e.chargeDir || {x:target.x,y:target.y};
  e.chargeDir.x=lerp(e.chargeDir.x,target.x,steer);
  e.chargeDir.y=lerp(e.chargeDir.y,target.y,steer);
  const l=Math.max(0.001,Math.hypot(e.chargeDir.x,e.chargeDir.y)); e.chargeDir.x/=l; e.chargeDir.y/=l;

  // Slight, deterministic-looking rank cohesion: each charger is pulled toward
  // a translated formation point, but the whole pack still steers at the player.
  const cw=ensureChargingWaveState(g);
  const center=cw.lastSpawnCenter || {x:e.x,y:e.y};
  const travel=Math.max(0,(g.time||0)-(cw.lastSpawnTime||g.time||0))*e.speed*0.72;
  const right={x:-e.chargeDir.y,y:e.chargeDir.x};
  const back={x:-e.chargeDir.x,y:-e.chargeDir.y};
  const off=e.formationOffset || {x:0,y:0};
  e.formationTarget={x:center.x+e.chargeDir.x*travel+right.x*off.x+back.x*off.y, y:center.y+e.chargeDir.y*travel+right.y*off.x+back.y*off.y};
  let ux=e.chargeDir.x, uy=e.chargeDir.y;
  const cd=dist2(e.x,e.y,e.formationTarget.x,e.formationTarget.y);
  if(cd>45*45){
    const cdir=normalizeVec(e.formationTarget.x-e.x,e.formationTarget.y-e.y);
    ux=lerp(ux,cdir.x,0.22); uy=lerp(uy,cdir.y,0.22);
    const nl=Math.max(0.001,Math.hypot(ux,uy)); ux/=nl; uy/=nl;
  }
  ux+=Math.sin((g.time||0)*8+e.phase)*0.045; uy+=Math.cos((g.time||0)*7+e.phase)*0.045;
  const nl=Math.max(0.001,Math.hypot(ux,uy)); ux/=nl; uy/=nl;

  if(e.canMineBlocks) tryChargingWaveBreakAhead(g,e,ux,uy,dt);
  const oldX=e.x, oldY=e.y;
  if(!g.debug?.freezeEnemies) moveCircle(g,e,ux*e.speed*dt,uy*e.speed*dt);
  const moved=Math.hypot(e.x-oldX,e.y-oldY);
  if(moved<2.0) e.stuckBreakTimer=(e.stuckBreakTimer||0)+dt; else e.stuckBreakTimer=0;
  if(e.stuckBreakTimer>CHARGING_WAVE_CONFIG.stuckBreakDelay){
    breakNearbyChargingWaveBlocks(g,e,ux,uy);
    e.stuckBreakTimer=0;
  }
  if(shouldEmitVfx(g,false) && Math.random()<0.55){
    addParticle(g,e.x-ux*e.r,e.y-uy*e.r,-ux*rand(60,160)+rand(-20,20),-uy*rand(60,160)+rand(-20,20),'#ff7038',rand(0.12,0.24),rand(2,4),'spark');
  }
}

function tryChargingWaveBreakAhead(g,e,ux,uy,dt){
  const look=Math.max(TILE*0.45,e.r+e.speed*dt*0.8);
  const pts=[0, -e.r*0.65, e.r*0.65];
  const right={x:-uy,y:ux};
  for(const side of pts){
    const x=e.x+ux*look+right.x*side;
    const y=e.y+uy*look+right.y*side;
    const [tx,ty]=worldToTile(x,y);
    if(destroyTileByChargingWave(g,tx,ty,e)) return true;
  }
  return false;
}

function breakNearbyChargingWaveBlocks(g,e,ux,uy){
  const [cx,cy]=worldToTile(e.x+ux*(e.r+8),e.y+uy*(e.r+8));
  let broke=false;
  for(let r=0;r<=1 && !broke;r++){
    for(let ty=cy-r;ty<=cy+r && !broke;ty++) for(let tx=cx-r;tx<=cx+r;tx++){
      if(destroyTileByChargingWave(g,tx,ty,e)){ broke=true; break; }
    }
  }
  return broke;
}

function destroyTileByChargingWave(g,tx,ty,e){
  if(!inMap(tx,ty)) return false;
  const i=tileIdx(tx,ty);
  const t=g.tiles[i];
  if(t===TILE_EMPTY || t===TILE_HARD || t===TILE_LAVA_ROCK) return false;
  if(!isMineableForPlayer(t)) return false;
  const wasOre=t===TILE_GOLD || t===TILE_NITRA || t===TILE_CRYSTAL || t===TILE_FERRITE_BARK || t===TILE_LUMINA_SPORES || t===TILE_AETHER_QUARTZ || t===TILE_CRYSALITH || t===TILE_EMBERGLASS;
  g.tiles[i]=TILE_EMPTY; g.tileHp[i]=0; g.navigationVersion++;
  if(g.runStats){
    g.runStats.blocksBrokenByChargingWaves=(g.runStats.blocksBrokenByChargingWaves||0)+1;
    if(wasOre) g.runStats.oresDestroyedByChargingWaves=(g.runStats.oresDestroyedByChargingWaves||0)+1;
  }
  const x=tileToWorldCenterX(tx), y=tileToWorldCenterY(ty);
  for(let k=0;k<8;k++) addParticle(g,x,y,rand(-120,120),rand(-120,120),wasOre?'#ff9f43':'#8f6a4a',rand(0.18,0.42),rand(2,5),'spark');
  if(wasOre) floating(g,x,y-TILE*0.18,'Ore destroyed','#ff7038');
  return true;
}

function explodeChargingWaveEnemy(g,e){
  if(e.hp<=0 || e.exploded) return;
  e.exploded=true;
  e.noDrop=true;
  e.hp=0;
  if(g.runStats) g.runStats.chargingWaveEnemiesExploded=(g.runStats.chargingWaveEnemiesExploded||0)+1;
  applyChargingWaveExplosionDamage(g,e);
  const r=e.explosionRadius || CHARGING_WAVE_CONFIG.explosionRadius;
  shake=Math.max(shake,9);
  addRing(g,e.x,e.y,'rgba(255,112,56,0.92)',0.28,6,r,6);
  addRing(g,e.x,e.y,'rgba(255,228,150,0.75)',0.16,3,r*0.55,4);
  addParticle(g,e.x,e.y,0,0,'rgba(255,245,220,0.96)',0.10,22);
  for(let k=0;k<28;k++){
    const a=rand(0,Math.PI*2), sp=rand(100,360);
    addParticle(g,e.x,e.y,Math.cos(a)*sp,Math.sin(a)*sp,k%3===0?'#ffd36b':'#ff7038',rand(0.16,0.48),rand(1.8,4.6),k%4===0?'fragment':'spark');
  }
  spawnVfxComposition(g,'chargingWaveExplosion',e.x,e.y,{radius:r,color:'#ff7038'});
  sfx('explosion',0.72);
}

function applyChargingWaveExplosionDamage(g,e){
  const p=g.player;
  const r=(e.explosionRadius || CHARGING_WAVE_CONFIG.explosionRadius)+(p.collisionR||p.r);
  const d=Math.hypot(p.x-e.x,p.y-e.y);
  if(d>r) return;
  if((p.chargingWaveExplosionDamageCd||0)>0) return;
  const falloff=1-clamp(d/r,0,1)*0.35;
  const damage=Math.max(1,Math.round((e.explosionDamage || CHARGING_WAVE_CONFIG.explosionDamage)*falloff*(p.armourMul || 1)));
  p.hp-=damage;
  p.chargingWaveExplosionDamageCd=CHARGING_WAVE_CONFIG.damageCooldown;
  p.iframes=Math.max(p.iframes,0.18);
  if(typeof recordRunDamageTaken==='function') recordRunDamageTaken(g,damage,'chargingWaveExplosion');
  if(g.runStats) g.runStats.damageTakenFromChargingWaves=(g.runStats.damageTakenFromChargingWaves||0)+damage;
  floating(g,p.x,p.y-25,`-${damage}`,'#ff7038');
  flashDamage();
  if(p.hp<=0) gameOver(g);
}

function debugChargingWaveMetrics(g){
  const cw=ensureChargingWaveState(g);
  const can=canSpawnChargingWave(g);
  return {
    enabled:!!cw.enabled,
    active:!!cw.active,
    warning:!!cw.warningActive,
    timeSinceLast:(g.time||0)-(cw.lastSpawnTime||0),
    nextAllowed:Math.max(0,(cw.nextAllowedTime||0)-(g.time||0)),
    alive:(g.enemies||[]).filter(e=>e.isChargingWaveEnemy && e.hp>0).length,
    budget:Math.max(0,(g.enemyBudget?.currentMaxEnemies||0)-(g.enemies?.length||0)),
    skip: can.ok ? cw.lastSkipReason || 'Ready' : can.reason
  };
}

function addObjectiveProgress(g,id,amount){
  const obj=g.objectives.find(o=>o.id===id);
  if(!obj || obj.completed) return;
  obj.currentAmount=clamp(obj.currentAmount+amount,0,obj.targetAmount);
  if(obj.currentAmount>=obj.targetAmount){
    obj.completed=true;
    log(g, `${obj.displayName} complete.`);
    sfx('level',0.75);
    if(g.runStats) g.runStats.objectivesCompleted=(g.runStats.objectivesCompleted||0)+1;
  }
}

function allObjectivesComplete(g){
  return g.objectives.length>0 && g.objectives.every(o=>o.completed);
}

function spawnRunBoss(g){
  if(g.bossSpawned) return;
  g.bossSpawned=true;
  const spot=findSafeBossSpawn(g);
  ensureBossSpawnPocket(g,spot.x,spot.y);
  const boss=new Enemy(spot.x,spot.y,'boss');
  const diff=g.missionDifficulty || missionDifficulty(1);
  boss.hp*=diff.bossHealthMultiplier;
  boss.maxHp=boss.hp;
  boss.damage=Math.round(boss.damage*diff.bossDamageMultiplier);
  boss.rangedCd=1.8;
  g.enemies.push(boss);
  log(g,'Sector boss incoming. Clear it to call extraction.');
  sfx('elite',1.2);
  shake=Math.max(shake,9);
}

function spawnExtractionCraft(g){
  if(g.extraction) return;
  const p=g.player;
  let x=p.x+520, y=p.y;
  for(let tries=0;tries<80;tries++){
    const a=rand(0,Math.PI*2), d=rand(360,720);
    const cx=clamp(p.x+Math.cos(a)*d,TILE*3,WORLD_W-TILE*3);
    const cy=clamp(p.y+Math.sin(a)*d,TILE*3,WORLD_H-TILE*3);
    const [tx,ty]=worldToTile(cx,cy);
    if(!isSolid(tileAt(g,tx,ty))){ x=cx; y=cy; break; }
  }
  g.extraction={x,y,r:34,pulse:0};
  g.extractionTimer=EXTRACTION_SECONDS;
  log(g,'Extraction craft inbound. Reach it before the timer expires.');
  sfx('wave',1.1);
}

function updateRunProgress(g,dt){
  if(allObjectivesComplete(g) && !g.bossSpawned) spawnRunBoss(g);
  if(g.bossDefeated && !g.extraction) spawnExtractionCraft(g);
  if(!g.extraction) return;
  g.extraction.pulse+=dt;
  g.extractionTimer-=dt;
  const p=g.player;
  if(dist2(p.x,p.y,g.extraction.x,g.extraction.y)<(p.r+g.extraction.r)*(p.r+g.extraction.r)){
    g.state='extracted';
    completeRun(g);
    return;
  }
  if(g.extractionTimer<=0){
    failRun(g,'Extraction timer expired.');
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
  return activeAimWorld(g);
}

function manualAimActive(g){
  return currentManualAimActive(g);
}

function mouseTargetActive(g){
  return manualAimActive(g);
}

function mouseManualFireActive(g){
  return mouseTargetActive(g) && (mouse.down || (g.controllerCursor?.primaryHoldTimer || 0)>0);
}

function arcMouseAutoDisabled(g){
  return manualAimActive(g);
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

function handleArcConnectionRightClick(g, worldX=null, worldY=null){
  const arc = g.arcConnection;
  if(!arc?.unlocked || g.state!=='playing' || awaitingUpgrade) return false;
  const selections = liveArcSelections(g);
  const m = worldX == null || worldY == null ? mouseWorld(g) : {x:worldX,y:worldY};
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
  if(g.runStats) g.runStats.arcDetonations=(g.runStats.arcDetonations||0)+1;
  shake = Math.max(shake, 8);
  for(let i=0;i<chain.length;i++){
    const e = chain[i];
    damageEnemy(g,e,dmg,'#7df9ff');
    explode(g,e.x,e.y,42+arc.level*5,18+arc.level*5,'#5dff9a',true,'arc');
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


function handlePrimaryActionAt(g,worldX,worldY,source='input'){
  if(!g || g.state!=='playing' || awaitingUpgrade) return false;
  mouse.x=clamp(worldX-g.camera.x,0,innerWidth);
  mouse.y=clamp(worldY-g.camera.y,0,innerHeight);
  mouse.used=true;
  mouse.lastMove=g.time;
  if(g.controllerCursor){
    g.controllerCursor.screenX=mouse.x;
    g.controllerCursor.screenY=mouse.y;
    g.controllerCursor.worldX=worldX;
    g.controllerCursor.worldY=worldY;
    g.controllerCursor.active=true;
    g.controllerCursor.lastMoveTime=g.time;
    g.controllerCursor.primaryHoldTimer=0.18;
  }
  // Give click-driven/manual fire systems a short primary-action pulse.
  // This must not depend on the optional Targeting Cursor upgrade; it should
  // behave like a real left mouse click, because physical mouse down also sets
  // mouse.down unconditionally.
  mouse.down=true;
  return true;
}

function handleSecondaryActionAt(g,worldX,worldY,source='input'){
  if(!g || g.state!=='playing' || awaitingUpgrade) return false;
  mouse.x=clamp(worldX-g.camera.x,0,innerWidth);
  mouse.y=clamp(worldY-g.camera.y,0,innerHeight);
  mouse.used=true;
  mouse.lastMove=g.time;
  return handleArcConnectionRightClick(g,worldX,worldY);
}

function updateGamepadInput(dt){
  pollGamepadState();

  // The game can be fully controlled from a pad before a run exists.  Earlier
  // builds returned here when game === null, so class/menu selection never saw
  // controller input.
  if(ui.startOverlay?.classList?.contains('show') && !awaitingUpgrade){
    updateMenuGamepadInput(dt);
    return;
  }

  if(!game) return;
  moveControllerCursor(game,dt);
  if(game.controllerCursor) game.controllerCursor.primaryHoldTimer=Math.max(0,(game.controllerCursor.primaryHoldTimer||0)-dt);
  if(!game.controllerCursor?.primaryHoldTimer && !mouse._physicalDown) mouse.down=false;

  if(awaitingUpgrade && game.upgradeMenuState?.open){
    updateUpgradeMenuGamepad(game,dt);
    return;
  }
  if(game.state!=='playing') return;
  if(gamepadPressed(GAMEPAD.Y)) triggerDash(game,'gamepad');

  // A was already used by the player as the trap button. Keep A mapped to the
  // same gameplay action as keyboard E while no menu is open.
  if(gamepadPressed(GAMEPAD.A)){
    if(typeof placeTrap === 'function') placeTrap(game);
  }

  if(gamepadPressed(GAMEPAD.X)){
    // X is the controller equivalent of the left mouse button / primary fire.
    const aim=activeAimWorld(game);
    handlePrimaryActionAt(game,aim.x,aim.y,'gamepad-x');
  }
  if(gamepadPressed(GAMEPAD.B)){
    const aim=activeAimWorld(game);
    handleSecondaryActionAt(game,aim.x,aim.y,'gamepad-b');
  }
}

function updateUpgradeMenuGamepad(g,dt){
  const state=g.upgradeMenuState;
  const cards=[...ui.upgradeCards.querySelectorAll('.card[data-upgrade-index]')];
  if(!state || !cards.length) return;

  // IMPORTANT: game time is frozen while the upgrade menu is open.  Use a real
  // clock for repeat timing, otherwise stick/D-pad navigation works at most
  // once and then appears broken.
  const t=menuInputClock();
  state.selectedIndex=clamp(state.selectedIndex ?? 0,0,cards.length-1);

  const nav=getGamepadLeftNav();
  if(!state.navWasActive && !nav.active){
    state.lastMoveTime=-999;
  }
  if(nav.active && (!state.navWasActive || t - (state.lastMoveTime ?? -999) >= (state.moveRepeatDelay ?? 0.20))){
    const step=(nav.x>0 || nav.y>0) ? 1 : -1;
    state.selectedIndex=(state.selectedIndex + step + cards.length) % cards.length;
    state.lastMoveTime=t;
  }
  state.navWasActive=nav.active;

  refreshUpgradeSelection(g);

  // A confirms menu choices. X also confirms because X is the requested
  // left-click equivalent, but in gameplay A remains the trap button.
  if(gamepadPressedAny([GAMEPAD.A, GAMEPAD.X])){
    selectUpgradeByIndex(g,state.selectedIndex,'gamepad');
  }
}

function refreshUpgradeSelection(g){
  const state=g.upgradeMenuState;
  const cards=[...ui.upgradeCards.querySelectorAll('.card[data-upgrade-index]')];
  for(const card of cards){
    const idx=Number(card.dataset.upgradeIndex);
    card.classList.toggle('selected', idx===state.selectedIndex);
    card.setAttribute('aria-selected', idx===state.selectedIndex ? 'true' : 'false');
  }
  const card=cards.find(c=>Number(c.dataset.upgradeIndex)===state.selectedIndex) || cards[state.selectedIndex];
  if(card && document.activeElement!==card){
    try{ card.focus({preventScroll:true}); }catch(_){ card.focus(); }
  }
}

function selectUpgradeByIndex(g,index,source='input'){
  const choices=g.upgradeMenuState?.choices || [];
  const up=choices[index];
  if(!up) return false;
  up.apply(g);
  awaitingUpgrade=false;
  g.upgradeMenuState.open=false;
  ui.upgradeOverlay.classList.remove('show');
  updateUI(g);
  return true;
}

function selectMissileTargets(g,count,range){
  const p=g.player;
  const candidates=g.enemies
    .filter(e=>e.hp>0 && dist2(p.x,p.y,e.x,e.y)<=range*range)
    .sort((a,b)=>{
      const pa=(a.type==='elite'||a.type==='boss') ? 0 : (a.hp>50 ? 1 : 2);
      const pb=(b.type==='elite'||b.type==='boss') ? 0 : (b.hp>50 ? 1 : 2);
      if(pa!==pb) return pa-pb;
      const hpDiff = b.hp - a.hp;
      if(pa === 1 && Math.abs(hpDiff) > 12) return hpDiff;
      return dist2(p.x,p.y,a.x,a.y)-dist2(p.x,p.y,b.x,b.y);
    });
  const targets=[];
  for(let i=0;i<count;i++){
    targets.push(candidates[i % Math.max(1,candidates.length)] || null);
  }
  return targets;
}

function addTargetLock(g,e,life=0.62){
  if(!e) return;
  const existing=g.targetLocks.find(l=>l.enemy===e);
  if(existing){ existing.life=Math.max(existing.life,life); existing.maxLife=Math.max(existing.maxLife,life); return; }
  g.targetLocks.push({enemy:e,life,maxLife:life,spin:rand(0,Math.PI*2)});
}

function updateHammerfallSalvo(g,weapon,dt){
  ensureHammerfallDefaults(weapon);
  if(weapon.cd > 0) return;
  const targets = selectMissileTargets(g, weapon.missilesPerSalvo, weapon.lockRange);
  if(!targets.some(Boolean)) return;
  if(launchMissileSalvo(g, targets, weapon)){
    // Cooldown is decremented globally with fire-rate scaling, so keep the weapon's
    // own base cooldown stable and let fire-rate upgrades affect the timer drain.
    weapon.cd = weapon.baseCooldown;
  }
}

function launchMissileSalvo(g,targets,weapon){
  const p=g.player;
  ensureHammerfallDefaults(weapon);
  let launched=0;
  const count=Math.max(2, Math.floor(weapon.missilesPerSalvo));
  for(let i=0;i<count;i++){
    const target=targets[i % Math.max(1,targets.length)];
    if(!target) continue;
    addTargetLock(g,target,0.72);
    const targetAngle=Math.atan2(target.y-p.y,target.x-p.x);
    const side = (i % 2 === 0 ? 1 : -1);
    const pairIndex = Math.floor(i/2);
    const spread = side*(0.30 + pairIndex*0.055) + rand(-0.05,0.05)*(1-weapon.missileAccuracy);
    const launchAngle=targetAngle + spread;
    const mountSide = side * 9;
    const mountX = p.x + Math.cos(targetAngle+Math.PI/2)*mountSide + Math.cos(targetAngle)*p.r;
    const mountY = p.y + Math.sin(targetAngle+Math.PI/2)*mountSide + Math.sin(targetAngle)*p.r;
    const speed = weapon.missileSpeed * rand(0.86, 0.98);
    const vx=Math.cos(launchAngle)*speed*0.74;
    const vy=Math.sin(launchAngle)*speed*0.74;
    g.missiles.push({
      x:mountX,
      y:mountY,
      vx, vy,
      radius:5,
      target,
      age:0,
      life:weapon.missileLifetime,
      maxLife:weapon.missileLifetime,
      damage:weapon.missileDamage,
      speed:weapon.missileSpeed,
      accuracy:weapon.missileAccuracy,
      turnRate:weapon.missileTurnRate,
      explosionRadius:weapon.explosionRadius,
      phase:'launch',
      launchDir:launchAngle,
      trail:[],
      retargetCd:0,
      owner:'hammerfallSalvo'
    });
    addRing(g,mountX,mountY,'rgba(255,220,120,0.95)',0.11,3,18,3);
    for(let k=0;k<5;k++){
      addParticle(g,mountX,mountY,
        Math.cos(launchAngle+Math.PI+rand(-0.25,0.25))*rand(80,210),
        Math.sin(launchAngle+Math.PI+rand(-0.25,0.25))*rand(80,210),
        k%2?'rgba(120,120,120,0.58)':'#ff9f43',rand(0.16,0.34),rand(2,6),k%2?'circle':'spark');
    }
    launched++;
  }
  if(launched){
    if(g.runStats) g.runStats.missilesFired=(g.runStats.missilesFired||0)+launched;
    shake=Math.max(shake,3.0 + Math.min(4, launched*0.25));
    sfx('missileLock',0.75);
    sfx('missileLaunch',Math.min(1.4,0.65+launched*0.08));
    addRing(g,p.x,p.y,'rgba(255,159,67,0.55)',0.18,8,28+launched*1.5,3);
  }
  return launched>0;
}

function retargetMissile(g,m){
  const alt=nearestEnemy(g,m.x,m.y,280);
  if(alt){
    m.target=alt;
    addTargetLock(g,alt,0.42);
    m.retargetCd=0.28;
    return true;
  }
  m.target=null;
  return false;
}

function updateMissiles(g,dt){
  for(const m of g.missiles){
    m.age+=dt;
    m.life-=dt;

    if(m.target && m.target.hp<=0){
      m.retargetCd-=dt;
      if(m.retargetCd<=0) retargetMissile(g,m);
    }

    if(m.phase==='launch' && m.age>0.24) m.phase='homing';
    if(m.target && dist2(m.x,m.y,m.target.x,m.target.y)<(m.target.r+m.radius+36)*(m.target.r+m.radius+36)) m.phase='terminal';

    const targetAngle = m.target ? Math.atan2(m.target.y-m.y,m.target.x-m.x) : m.launchDir;
    const maxGuidanceNoise=(1-m.accuracy)*0.45;
    const launchCurve = m.phase==='launch' ? Math.sin(m.age*14 + m.launchDir)*0.22 : 0;
    const guidanceNoise = m.phase==='launch' ? 0 : rand(-maxGuidanceNoise,maxGuidanceNoise)*0.35;
    const desiredAngle=targetAngle + launchCurve + guidanceNoise;
    const terminalBoost = m.phase==='terminal' ? 1.18 : 1.0;
    const desiredVx=Math.cos(desiredAngle)*m.speed*terminalBoost;
    const desiredVy=Math.sin(desiredAngle)*m.speed*terminalBoost;
    const steer=m.phase==='terminal' ? m.turnRate*2.1 : (m.phase==='launch' ? m.turnRate*0.45 : m.turnRate);
    m.vx=lerp(m.vx, desiredVx, clamp(dt*steer,0,1));
    m.vy=lerp(m.vy, desiredVy, clamp(dt*steer,0,1));
    if(!m.target){ m.vx*=1.01; m.vy*=1.01; }

    m.x+=m.vx*dt;
    m.y+=m.vy*dt;
    m.trail.push({x:m.x,y:m.y});
    if(m.trail.length>10) m.trail.shift();

    if(Math.random()<0.85){
      addParticle(g,m.x-m.vx*0.012,m.y-m.vy*0.012,-m.vx*0.020+rand(-16,16),-m.vy*0.020+rand(-16,16),'rgba(150,150,150,0.45)',0.22,rand(2,5));
      addParticle(g,m.x-m.vx*0.010,m.y-m.vy*0.010,-m.vx*0.012+rand(-12,12),-m.vy*0.012+rand(-12,12),m.phase==='launch'?'#ffdd80':'#ff9f43',0.12,rand(2,4),'spark');
    }
    if(m.age>0.08 && Math.random()<0.015) sfx('missileWhoosh',0.35);

    if(m.target && m.target.hp>0 && dist2(m.x,m.y,m.target.x,m.target.y)<(m.target.r+m.radius+4)*(m.target.r+m.radius+4)){
      missileImpact(g,m,m.target);
      m.life=0;
      continue;
    }
    if(m.life<=0){
      if(m.age>0.18) missileImpact(g,m,null);
      else addRing(g,m.x,m.y,'rgba(255,159,67,0.30)',0.10,5,16,2);
    }
  }
  g.missiles=g.missiles.filter(m=>m.life>0 && m.x>-160 && m.y>-160 && m.x<WORLD_W+160 && m.y<WORLD_H+160);
  for(const l of g.targetLocks) l.life-=dt;
  g.targetLocks=g.targetLocks.filter(l=>l.life>0 && l.enemy && l.enemy.hp>0);
}

function missileImpact(g,m,target){
  const splash=m.explosionRadius;
  if(target && target.hp>0) damageEnemy(g,target,m.damage,'#ffcc4d');
  spawnVfxComposition(g,'missileImpact',m.x,m.y,{radius:splash,color:'#ffcc4d'});
  addRing(g,m.x,m.y,'rgba(255,255,255,0.98)',0.09,4,splash*0.62,3);
  addRing(g,m.x,m.y,'rgba(255,159,67,0.88)',0.20,6,splash,4);
  addParticle(g,m.x,m.y,0,0,'rgba(255,230,165,0.95)',0.08,Math.max(9,splash*0.28));
  shake=Math.max(shake,3.5);
  sfx('missileImpact',0.82);
  for(let k=0;k<18;k++){
    const a=rand(0,Math.PI*2), sp=rand(120,330);
    addParticle(g,m.x,m.y,Math.cos(a)*sp,Math.sin(a)*sp,k%3?'rgba(255,159,67,0.9)':'rgba(255,238,180,0.95)',rand(0.12,0.32),rand(2,7),'spark');
  }
  for(let k=0;k<6;k++){
    const a=rand(0,Math.PI*2), sp=rand(35,110);
    addParticle(g,m.x,m.y,Math.cos(a)*sp,Math.sin(a)*sp,'rgba(90,90,90,0.42)',rand(0.32,0.58),rand(5,12));
  }
  for(const e of g.enemies){
    if(e.hp<=0 || e===target) continue;
    const d=Math.hypot(e.x-m.x,e.y-m.y);
    if(d<splash+e.r){
      const falloff=0.35 + 0.65*clamp(1-d/(splash+e.r),0,1);
      damageEnemy(g,e,m.damage*falloff*0.55,'#ff9f43');
    }
  }
}

function updateWeapons(g,dt){
  const p=g.player;
  const manualMode = mouseManualFireActive(g);
  const pauseAutoTargeting = !manualMode && arcMouseAutoDisabled(g);
  for(const w of g.weapons){
    w.cd -= dt * p.fireRateMul;
    if(w.id==='hammerfallSalvo'){
      updateHammerfallSalvo(g,w,dt);
      continue;
    }
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
    if(w.id==='vectorBurst'){
      const e=targetEnemy(g,760); if(!e) continue;
      fireVectorBurst(g,w,e);
      continue;
    }
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
  } else if(w.id==='hammerfallSalvo'){
    ensureHammerfallDefaults(w);
    const targets = selectMissileTargets(g, w.missilesPerSalvo, w.lockRange);
    if(!targets.some(Boolean)) return;
    if(launchMissileSalvo(g, targets, w)) w.cd = Math.max(0.35, w.baseCooldown*0.85);
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
  if(it.type==='xp'){ collectRunResource(g,'echo',it.value); }
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

function fireVectorBurst(g,w,target){
  const p=g.player;
  const count=Math.max(1,Math.floor(w.projectiles || 1));
  const base=Math.atan2(target.y-p.y,target.x-p.x);
  const spread=(w.spreadDeg || 18)*Math.PI/180;
  const center=(count-1)/2;
  w.cd=(w.baseCooldown || 0.92)/(p.fireRateMul || 1);
  const accuracy = clamp((p.accuracy ?? 0.35) + (w.accuracyBonus || 0), 0, 1);
  const inaccuracy = weaponSpreadRadians(accuracy);
  for(let i=0;i<count;i++){
    const a=base+(i-center)*spread+rand(-inaccuracy,inaccuracy);
    const speed=w.speed || 560;
    g.bullets.push({
      x:p.x+Math.cos(a)*p.r,y:p.y+Math.sin(a)*p.r,
      vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,
      r:4.3,life:w.lifetime || 1.25,damage:(w.damage || 12)*p.damageMul,pierce:w.pierce || 0,color:'#9dfcff',vector:true
    });
  }
  sfx('shoot',0.72);
}

function weaponSpreadRadians(accuracy){
  const acc=clamp(accuracy ?? 0.35,0,1);
  return lerp(0.45,0.03,acc);
}

function fireSpread(g,p,target,count,damage,speed,spread,color,pierce=0){
  if(typeof recordShotFired==='function') recordShotFired(g,count);
  const base=Math.atan2(target.y-p.y,target.x-p.x);
  const accuracySpread=weaponSpreadRadians(p.accuracy ?? 0.35);
  for(let i=0;i<count;i++){
    const offset = count===1 ? 0 : (i-(count-1)/2)*spread;
    const a=base+offset+rand(-accuracySpread,accuracySpread);
    g.bullets.push({x:p.x+Math.cos(a)*p.r,y:p.y+Math.sin(a)*p.r,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:4,life:1.4,damage:damage*p.damageMul,pierce,color});
  }
}

function launchBoomerang(g,p,target,level,color='#ffd36b'){
  const a=Math.atan2(target.y-p.y,target.x-p.x);
  const speed = 420 + level*22;
  const outTime = 0.34 + level*0.03;
  if(g.runStats) g.runStats.boomerangsFired=(g.runStats.boomerangsFired||0)+1;
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
        if(typeof recordShotHit==='function') recordShotHit(g,1);
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
  if(g.runStats) g.runStats.trapsPlaced=(g.runStats.trapsPlaced||0)+1;
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
    if(e.isChargingWaveEnemy || (ENEMY_TYPES[e.type]?.behavior || e.behavior) === 'chargingExploder') {
      updateChargingWaveEnemy(g,e,dt);
      continue;
    }
    if((ENEMY_TYPES[e.type]?.behavior || e.behavior) === 'hexBoomerangDetonator') {
      updateHexShardEnemy(g,e,dt);
      continue;
    }
    updateSpecialEnemyBehaviour(g,e,dt);
    updateEnemyRangedAttack(g,e,dt);
    const moved=Math.hypot(e.x-e.lastX,e.y-e.lastY);
    if(moved<4) e.stuckTimer+=dt; else { e.stuckTimer=0; e.lastX=e.x; e.lastY=e.y; }
    e.pathTimer-=dt;
    const [ptx,pty]=worldToTile(p.x,p.y);
    const [etx,ety]=worldToTile(e.x,e.y);
    const closeToPlayer=dist2(e.x,e.y,p.x,p.y)<420*420;
    const perfState=g.performance?.state || PERF_STATES.HEALTHY;
    const farPathSlow=(perfState===PERF_STATES.WARNING && !closeToPlayer && e.type!=='elite' && e.type!=='boss') ? 1.8 :
      (perfState===PERF_STATES.CRITICAL && !closeToPlayer && e.type!=='elite' && e.type!=='boss') ? 3.2 : 1.0;
    const hasLos=lineOfSightClear(g,e.x,e.y,p.x,p.y);
    const needsPath=!hasLos && (
      !e.path.length ||
      e.pathIndex>=e.path.length ||
      e.pathTimer<=0 ||
      e.pathVersion!==g.navigationVersion ||
      e.lastPlayerTileX===null ||
      Math.abs(ptx-e.lastPlayerTileX)+Math.abs(pty-e.lastPlayerTileY)>2 ||
      e.stuckTimer>0.75
    );
    if(needsPath){
      const maxNodes=closeToPlayer?1200:650;
      const rawPath=findPathAStar(g,etx,ety,ptx,pty,maxNodes);
      e.rawPath=rawPath;
      e.path=smoothPathCorners(g,e,rawPath);
      e.smoothPath=e.path;
      e.pathIndex=0;
      e.pathVersion=g.navigationVersion;
      prepareEnemyPathFollower(g,e);
      e.lastPlayerTileX=ptx; e.lastPlayerTileY=pty;
      e.pathTimer=rand(closeToPlayer?0.25:0.55*farPathSlow, closeToPlayer?0.55:1.05*farPathSlow);
      if(!e.path.length) e.noPathTimer=0.55;
    }
    let ux=0, uy=0, pathSpeedMul=1;
    let baseUx=0, baseUy=0;
    if(!hasLos && e.path.length){
      const steer=getEnemyPathFollowingSteering(g,e,dt);
      if(steer){
        ux=steer.x; uy=steer.y; pathSpeedMul=steer.speedMul || 1;
        baseUx=ux; baseUy=uy;
        e.pathIndex=Math.min(e.path.length-1,Math.max(0,(steer.info?.segmentIndex || 0)));
      } else {
        const acceptRadius=Math.max(8, Math.min(18, (e.pathingRadius || e.r || 12)*0.85));
        while(e.pathIndex<e.path.length && Math.hypot(e.path[e.pathIndex].x-e.x,e.path[e.pathIndex].y-e.y)<acceptRadius) e.pathIndex++;
        const fallbackPoint=e.path[Math.min(e.pathIndex,e.path.length-1)] || {x:p.x,y:p.y};
        const dx=fallbackPoint.x-e.x, dy=fallbackPoint.y-e.y, l=Math.max(0.001,len(dx,dy));
        baseUx=dx/l; baseUy=dy/l; ux=baseUx; uy=baseUy;
      }
    } else {
      let targetX=p.x, targetY=p.y;
      if(!hasLos && e.noPathTimer>0){
        const fallback=findClosestWalkableTile(g,ptx,pty,14);
        if(fallback){
          const c=tileCenter(fallback.tx,fallback.ty);
          targetX=c.x; targetY=c.y;
        }
        e.noPathTimer-=dt;
      }
      const dx=targetX-e.x, dy=targetY-e.y, l=Math.max(0.001,len(dx,dy));
      baseUx=dx/l; baseUy=dy/l;
      const wobble=Math.sin(g.time*4+e.phase)*0.18;
      ux=baseUx*Math.cos(wobble)-baseUy*Math.sin(wobble)*0.12;
      uy=baseUy*Math.cos(wobble)+baseUx*Math.sin(wobble)*0.12;
      e.closestPathPoint=null;
      e.offtrackVector=null;
      e.desiredVelocity=null;
      e.offtrackDistance=0;
      e.pathFollowMode=hasLos?'direct-los':'fallback';
    }
    const centreBias=getTunnelCentrelineBias(g,e,baseUx,baseUy);
    if(centreBias.strength>0){
      const biasStrength=(!hasLos && e.path.length) ? centreBias.strength*0.55 : centreBias.strength;
      ux += centreBias.x*biasStrength;
      uy += centreBias.y*biasStrength;
      const bl=Math.max(0.001,len(ux,uy)); ux/=bl; uy/=bl;
      e.tunnelCentreBias={x:centreBias.x,y:centreBias.y,strength:biasStrength};
    } else {
      e.tunnelCentreBias=null;
    }
    if(e.stuckTimer>0.75){
      e.unstickAngle += dt*5.5;
      ux += Math.cos(e.unstickAngle)*0.45;
      uy += Math.sin(e.unstickAngle)*0.45;
      const ul=len(ux,uy); ux/=ul; uy/=ul;
      e.pathTimer=0;
    }
    const slow=(e.slow>0?0.55:1)*pathSpeedMul;
    if(!g.debug?.freezeEnemies) moveCircle(g,e,ux*e.speed*slow*dt,uy*e.speed*slow*dt);
    const touch = p.r+e.r;
    if(dist2(p.x,p.y,e.x,e.y)<touch*touch){
      if(p.iframes<=0){
        const damage=Math.max(1,Math.round(e.damage*(p.armourMul || 1)));
        p.hp-=damage; if(typeof recordRunDamageTaken==='function') recordRunDamageTaken(g,damage,'enemyContact'); p.iframes=0.65; flashDamage(); shake=Math.max(shake,8);
        floating(g,p.x,p.y-25,`-${damage}`,'#ff5b5b'); sfx('hit', 1.0);
        if(p.hp<=0) gameOver(g);
      }
      if(e.type==='exploder'){
        e.hp=0; explode(g,e.x,e.y,88,52,'#ff5b5b');
      }
    }
  }
  for(let i=g.enemies.length-1;i>=0;i--){
    const e=g.enemies[i];
    if(e.hp<=0){ if(!e.noDrop) killEnemy(g,e); g.enemies.splice(i,1); }
  }
}


function updateSpecialEnemyBehaviour(g,e,dt){
  const cfg=ENEMY_TYPES[e.type] || {};
  const behavior=cfg.behavior || e.behavior || 'meleeChase';
  const p=g.player;

  // Lightweight behaviours for the new sprite roster. They deliberately reuse
  // the existing movement/collision/ranged systems so sprite integration does
  // not replace or destabilise core gameplay logic.
  if(behavior==='spawner'){
    e.spawnCd = (e.spawnCd ?? rand(3.0,5.5)) - dt;
    if(e.spawnCd<=0 && g.enemies.length < (g.enemyBudget?.currentMaxEnemies || 120)){
      e.spawnCd=rand(5.0,8.0);
      const spawnType=Math.random()<0.55?'needleWisp':'clawlingRunner';
      for(let i=0;i<2;i++){
        const a=rand(0,Math.PI*2), d=rand(e.r+18,e.r+42);
        g.enemies.push(new Enemy(clamp(e.x+Math.cos(a)*d,TILE*2,WORLD_W-TILE*2), clamp(e.y+Math.sin(a)*d,TILE*2,WORLD_H-TILE*2), spawnType));
      }
      addRing(g,e.x,e.y,'rgba(115,255,138,0.45)',0.28,e.r,e.r+34,3);
    }
  } else if(behavior==='blinkChase'){
    e.blinkCd = (e.blinkCd ?? rand(4,7)) - dt;
    if(e.blinkCd<=0 && dist2(e.x,e.y,p.x,p.y)>180*180){
      e.blinkCd=rand(4.5,7.5);
      const a=Math.atan2(p.y-e.y,p.x-e.x)+rand(-0.75,0.75);
      const d=rand(90,145);
      const nx=clamp(e.x+Math.cos(a)*d,TILE*2,WORLD_W-TILE*2);
      const ny=clamp(e.y+Math.sin(a)*d,TILE*2,WORLD_H-TILE*2);
      const [tx,ty]=worldToTile(nx,ny);
      if(!isSolid(tileAt(g,tx,ty))){ addRing(g,e.x,e.y,'rgba(180,107,255,0.32)',0.22,4,28,2); e.x=nx; e.y=ny; addRing(g,e.x,e.y,'rgba(180,107,255,0.50)',0.22,4,32,2); }
    }
  } else if(behavior==='supportBuffer'){
    e.buffPulse=(e.buffPulse||0)+dt;
    if(e.buffPulse>0.65){
      e.buffPulse=0;
      for(const other of g.enemies){
        if(other!==e && other.role!=='boss' && dist2(e.x,e.y,other.x,other.y)<210*210){
          other.sirenBoost=0.8;
          other.speed=Math.min((ENEMY_TYPES[other.type]?.speed || other.speed)*1.18, other.speed*1.04+12);
        }
      }
      if(shouldEmitVfx(g,false)) addRing(g,e.x,e.y,'rgba(66,214,255,0.28)',0.30,e.r,e.r+46,2);
    }
  } else if(behavior==='zigzagChase'){
    e.phase += dt*7;
  }
}


function updateHexShardEnemy(g,e,dt){
  const p=g.player;
  const pressure=g.hollowPressure || 0;
  const triggerR=70 + Math.min(18,pressure*3);
  const explosionR=95 + Math.min(28,pressure*5);
  const d=Math.hypot(p.x-e.x,p.y-e.y);

  if(!e.detonationStarted && d<=triggerR){
    e.detonationStarted=true;
    e.state='detonationWarning';
    e.detonationTimer=1.05;
    e.warningSoundTimer=0;
    e.boomerangCd=999;
    sfx('hexBlip',1.0);
    log(g,'Hex Shard destabilising!');
  }

  if(e.detonationStarted){
    e.detonationTimer-=dt;
    e.warningSoundTimer-=dt;
    e.shakeAmount=5+Math.max(0,1-e.detonationTimer/1.05)*8;
    if(e.warningSoundTimer<=0){
      e.warningSoundTimer=Math.max(0.14,0.34*clamp(e.detonationTimer/1.05,0.35,1));
      sfx('hexBlip',0.75+0.4*(1-e.detonationTimer/1.05));
    }
    const dx=p.x-e.x, dy=p.y-e.y, l=len(dx,dy);
    // Once primed, it braces and creeps toward the player instead of ranged attacks.
    moveCircle(g,e,dx/l*e.speed*0.42*dt,dy/l*e.speed*0.42*dt);
    if(e.detonationTimer<=0) hexShardExplode(g,e,explosionR);
    return;
  }

  // Medium range skirmisher: approaches if far, backs off if too close, and strafes.
  const preferredMin=180, preferredMax=420;
  const dx=p.x-e.x, dy=p.y-e.y, l=len(dx,dy);
  let ux=dx/l, uy=dy/l;
  if(d<preferredMin){ ux=-ux; uy=-uy; }
  else if(d<=preferredMax){
    const side=Math.sin(g.time*2.2+e.phase)>0?1:-1;
    ux=-dy/l*side; uy=dx/l*side;
  }
  const slow=e.slow>0?0.55:1;
  moveCircle(g,e,ux*e.speed*slow*dt,uy*e.speed*slow*dt);

  e.boomerangCd-=dt*(1+pressure*0.08);
  if(d<520 && e.boomerangCd<=0 && lineOfSightClear(g,e.x,e.y,p.x,p.y)){
    const count=(pressure>=3 && Math.random()<0.35) ? 2 : 1;
    for(let i=0;i<count;i++) throwEnemyBoomerang(g,e,i,count);
    e.boomerangCd=clamp(2.8-pressure*0.18,1.25,2.8)*rand(0.82,1.18);
    e.state='attack';
  }

  const touch = (p.collisionR||p.r)+e.r;
  if(d<touch && p.iframes<=0){
    const damage=Math.max(1,Math.round(e.damage*(p.armourMul || 1)));
    p.hp-=damage; if(typeof recordRunDamageTaken==='function') recordRunDamageTaken(g,damage,'enemyContact'); p.iframes=0.45; flashDamage(); shake=Math.max(shake,5);
    floating(g,p.x,p.y-25,`-${damage}`,'#ff7a38'); sfx('hit',0.75);
    if(p.hp<=0) gameOver(g);
  }
}

function throwEnemyBoomerang(g,e,index=0,count=1){
  const p=g.player;
  const pressure=g.hollowPressure || 0;
  const baseA=Math.atan2(p.y-e.y,p.x-e.x);
  const spread=(index-(count-1)/2)*0.28;
  const a=baseA+spread+rand(-0.08,0.08);
  const speed=245+pressure*18;
  const predictedX=p.x+p.lastDx*42;
  const predictedY=p.y+p.lastDy*42;
  g.enemyBoomerangs.push({
    x:e.x,y:e.y,originX:e.x,originY:e.y,owner:e,age:0,life:2.45+pressure*0.08,
    phase:'outbound',targetX:predictedX,targetY:predictedY,
    vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,speed,
    r:7,damage:clamp(9+pressure*1.2,9,18),turnRate:3.2+pressure*0.25,
    color:'#ff7038',curve:rand(-1,1)>=0?1:-1,trail:[],hitPlayer:false
  });
  addRing(g,e.x,e.y,'rgba(255,112,56,0.62)',0.16,e.r,e.r+20,3);
  sfx('hexBoomerang',0.85);
}

function updateEnemyBoomerangs(g,dt){
  const p=g.player;
  for(const b of g.enemyBoomerangs){
    b.age+=dt; b.life-=dt;
    if(b.age>0.58) b.phase='return';
    let tx=b.targetX, ty=b.targetY;
    if(b.phase==='return'){
      if(b.owner && b.owner.hp>0){ tx=b.owner.x; ty=b.owner.y; }
      else { tx=b.originX; ty=b.originY; }
    }
    const dx=tx-b.x, dy=ty-b.y, l=len(dx,dy);
    const perpX=-dy/l*b.curve, perpY=dx/l*b.curve;
    const wobble=Math.sin(b.age*9)*0.34;
    const desiredA=Math.atan2(dy/l+perpY*wobble, dx/l+perpX*wobble);
    const desiredVx=Math.cos(desiredA)*b.speed;
    const desiredVy=Math.sin(desiredA)*b.speed;
    b.vx=lerp(b.vx,desiredVx,clamp(b.turnRate*dt,0,1));
    b.vy=lerp(b.vy,desiredVy,clamp(b.turnRate*dt,0,1));
    b.x+=b.vx*dt; b.y+=b.vy*dt;
    b.trail.push({x:b.x,y:b.y});
    if(b.trail.length>12) b.trail.shift();
    if(shouldEmitVfx(g,false)) addParticle(g,b.x,b.y,-b.vx*0.035+rand(-12,12),-b.vy*0.035+rand(-12,12),b.color,0.13,2.5,'spark');
    const [txi,tyi]=worldToTile(b.x,b.y);
    if(isSolid(tileAt(g,txi,tyi))){ b.life=0; continue; }
    if(!b.hitPlayer && dist2(p.x,p.y,b.x,b.y)<((p.collisionR||p.r)+b.r)*((p.collisionR||p.r)+b.r)){
      const damage=Math.max(1,Math.round(b.damage*(p.armourMul || 1)));
      p.hp-=damage; if(typeof recordRunDamageTaken==='function') recordRunDamageTaken(g,damage,'enemyProjectile'); p.iframes=Math.max(p.iframes,0.28); b.hitPlayer=true; b.life=0;
      floating(g,p.x,p.y-24,`-${damage}`,'#ff7038'); flashDamage(); sfx('hit',0.8);
      if(p.hp<=0) gameOver(g);
    }
    if(b.phase==='return' && Math.hypot(b.x-b.originX,b.y-b.originY)<18) b.life=0;
  }
  g.enemyBoomerangs=g.enemyBoomerangs.filter(b=>b.life>0 && b.x>-160 && b.y>-160 && b.x<WORLD_W+160 && b.y<WORLD_H+160);
}

function hexShardExplode(g,e,r){
  e.noDrop=true;
  e.hp=0;
  const p=g.player;
  const d=Math.hypot(p.x-e.x,p.y-e.y);
  if(d<r+(p.collisionR||p.r)){
    const falloff=1-clamp(d/(r+(p.collisionR||p.r)),0,1)*0.45;
    const damage=Math.max(1,Math.round((34+(g.hollowPressure||0)*3)*falloff*(p.armourMul || 1)));
    p.hp-=damage;
    if(typeof recordRunDamageTaken==='function') recordRunDamageTaken(g,damage,'hexExplosion');
    p.iframes=Math.max(p.iframes,0.55);
    floating(g,p.x,p.y-26,`-${damage}`,'#ff7038');
    flashDamage();
    if(p.hp<=0) gameOver(g);
  }
  shake=Math.max(shake,10);
  addRing(g,e.x,e.y,'rgba(255,112,56,0.92)',0.34,8,r,7);
  addRing(g,e.x,e.y,'rgba(255,235,160,0.92)',0.18,5,r*0.55,5);
  addParticle(g,e.x,e.y,0,0,'rgba(255,245,220,0.96)',0.10,26);
  for(let k=0;k<44;k++){
    const a=rand(0,Math.PI*2), sp=rand(120,420);
    addParticle(g,e.x,e.y,Math.cos(a)*sp,Math.sin(a)*sp,k%3===0?'#ffd36b':'#ff7038',rand(0.18,0.55),rand(1.6,4.2), k%4===0?'fragment':'spark');
  }
  for(let k=0;k<18;k++){
    const a=rand(0,Math.PI*2), sp=rand(45,150);
    addParticle(g,e.x,e.y,Math.cos(a)*sp,Math.sin(a)*sp,'rgba(70,55,48,0.65)',rand(0.38,0.85),rand(5,12));
  }
  spawnVfxComposition(g,'hexShardExplosion',e.x,e.y,{radius:r,color:'#ff7038'});
  sfx('explosion',0.95);
}

function smallEnemyProjectileConfig(g,e){
  const cfgType=ENEMY_TYPES[e.type] || {};
  if((cfgType.role || e.role)==='elite' || (cfgType.role || e.role)==='boss') return null;
  if(e.type==='exploder' || cfgType.behavior==='proximityExploder') return null;
  if(g.debug && g.debug.enemyBulletsEnabled===false) return null;
  const stage=Math.max(0,g.time/60);
  const runLevel=g.runIndex || 1;
  const mission=g.missionIndex || 1;
  const earlyFactor = g.time<60 ? 0.55 : g.time<150 ? 0.82 : 1.0;
  const typeMul = e.type==='swarmer' ? 0.78 : e.type==='guard' ? 1.15 : 1.0;
  return {
    cooldown:(7.2/(typeMul*earlyFactor))/(1+stage*0.13+runLevel*0.05+(mission-1)*0.025+(g.hollowPressure||0)*0.10),
    speed:(205 + stage*9 + runLevel*6) * (e.type==='swarmer'?0.92:1) * (1+(g.hollowPressure||0)*0.04),
    damage:Math.round(clamp(3 + stage*0.75 + (mission-1)*0.45 + (e.type==='guard'?2:0) + (g.hollowPressure||0)*0.6,3,11)),
    fireChance:clamp(0.18 + stage*0.045 + g.level*0.012 + (g.hollowPressure||0)*0.035,0.18,0.72),
    color:'#ff2f2f',
    radius:e.type==='guard'?4.5:3.5
  };
}

function eliteProjectileConfig(g,e){
  const role=(ENEMY_TYPES[e.type]?.role || e.role || 'normal');
  if(role!=='elite' && role!=='boss') return null;
  if(g.debug && g.debug.enemyBulletsEnabled===false) return null;
  const runLevel=g.runIndex || 1;
  const mission=g.missionIndex || 1;
  const destructive=role==='boss' || runLevel>=3;
  const pressure=g.hollowPressure || 0;
  return {
    cooldown:(role==='boss'?1.75:3.8)/(1+runLevel*0.12+(mission-1)*0.05+pressure*0.12),
    speed:(role==='boss'?360:300)*(1+runLevel*0.05+pressure*0.045),
    damage:Math.round((role==='boss'?18:12)*(1+(mission-1)*0.08+pressure*0.06)),
    projectileCount:role==='boss' ? Math.max(3,5+pressure) : Math.max(1,1+pressure),
    destructive,
    color:destructive?'#ff7038':'#ff3636',
    radius:destructive?7:5
  };
}

function updateEnemyRangedAttack(g,e,dt){
  const cfg = eliteProjectileConfig(g,e) || smallEnemyProjectileConfig(g,e);
  if(!cfg || e.hp<=0) return;
  e.rangedCd-=dt;
  const p=g.player;
  const d=Math.hypot(p.x-e.x,p.y-e.y);
  const role=(ENEMY_TYPES[e.type]?.role || e.role || 'normal');
  const minRange=(role==='elite'||role==='boss')?190:150;
  const maxRange=(role==='elite'||role==='boss')?850:620;
  if(d<minRange || d>maxRange || e.rangedCd>0) return;
  const bulletCap=getEnemyBulletCap(g);
  if(g.enemyBullets.length>=bulletCap){
    if(g.performance) g.performance.skippedBullets=(g.performance.skippedBullets||0)+1;
    e.rangedCd=rand(cfg.cooldown*0.85,cfg.cooldown*1.35);
    return;
  }
  const perfState=g.performance?.state || PERF_STATES.HEALTHY;
  if(perfState===PERF_STATES.CRITICAL && role!=='boss' && !(role==='elite' && d<460)){
    if(g.performance) g.performance.skippedBullets=(g.performance.skippedBullets||0)+1;
    e.rangedCd=rand(cfg.cooldown*1.2,cfg.cooldown*1.8);
    return;
  }
  if(perfState===PERF_STATES.WARNING && role!=='elite' && role!=='boss' && Math.random()<0.45){
    if(g.performance) g.performance.skippedBullets=(g.performance.skippedBullets||0)+1;
    e.rangedCd=rand(cfg.cooldown*0.9,cfg.cooldown*1.45);
    return;
  }
  if(role!=='elite' && role!=='boss' && Math.random()>cfg.fireChance){
    e.rangedCd=rand(cfg.cooldown*0.65,cfg.cooldown*1.15);
    return;
  }
  e.rangedCd=rand(cfg.cooldown*0.82,cfg.cooldown*1.28);
  const spread=(role==='elite'||role==='boss')?0.16:0.18;
  const baseA=Math.atan2(p.y-e.y,p.x-e.x)+rand(-spread*0.35,spread*0.35);
  const count=cfg.projectileCount || 1;
  const center=(count-1)/2;
  for(let i=0;i<count;i++){
    let a=baseA+(i-center)*spread;
    if(role==='boss' && (g.hollowPressure||0)>=3 && i>0) a=baseA+(i-center)*(Math.PI*2/count); // escalated radial boss pressure
    g.enemyBullets.push({
      x:e.x+Math.cos(a)*(e.r+8), y:e.y+Math.sin(a)*(e.r+8),
      vx:Math.cos(a)*cfg.speed, vy:Math.sin(a)*cfg.speed,
      r:cfg.radius, life:role==='boss'?3.4:(role==='elite'?2.8:2.4), damage:cfg.damage,
      destructive:!!cfg.destructive, color:cfg.color,
      small:role!=='elite' && role!=='boss'
    });
  }
  addRing(g,e.x,e.y,cfg.destructive?'rgba(255,112,56,0.72)':'rgba(255,54,54,0.52)',0.14,e.r,e.r+(cfg.small?13:22),cfg.small?2:3);
  sfx('shoot',cfg.small?0.28:0.45);
}

function destroyTileByEnemyProjectile(g,tx,ty){
  if(!inMap(tx,ty)) return false;
  const i=tileIdx(tx,ty);
  const t=g.tiles[i];
  if(t===TILE_HARD || t===TILE_EMPTY || t===TILE_LAVA_ROCK) return false;
  if(!isMineableForPlayer(t)) return false;
  const wasOre=t===TILE_GOLD || t===TILE_NITRA || t===TILE_CRYSTAL;
  g.tiles[i]=TILE_EMPTY;
  g.tileHp[i]=0;
  g.navigationVersion++;
  for(const e of g.enemies){
    if(dist2(e.x,e.y,tileToWorldCenterX(tx),tileToWorldCenterY(ty))<520*520) e.pathTimer=0;
  }
  const color=wasOre?'#ff6b35':'#9a6a45';
  for(let k=0;k<12;k++) addParticle(g,tileToWorldCenterX(tx),tileToWorldCenterY(ty),rand(-150,150),rand(-150,150),color,rand(0.22,0.52),rand(2,6),'spark');
  if(wasOre) floating(g,tileToWorldCenterX(tx),tileToWorldCenterY(ty)-TILE*0.18,'Ore lost','#ff9f43');
  return true;
}

function updateEnemyBullets(g,dt){
  const p=g.player;
  for(const b of g.enemyBullets){
    b.x+=b.vx*dt; b.y+=b.vy*dt; b.life-=dt;
    if(shouldEmitVfx(g,b.destructive)) addParticle(g,b.x,b.y,-b.vx*0.02+rand(-10,10),-b.vy*0.02+rand(-10,10),b.color,b.destructive?0.16:0.11,b.destructive?4:2,'spark');
    const [tx,ty]=worldToTile(b.x,b.y);
    const t=tileAt(g,tx,ty);
    if(isSolid(t)){
      if(b.destructive && destroyTileByEnemyProjectile(g,tx,ty)){
        shake=Math.max(shake,4);
        spawnVfxComposition(g,'destructiveImpact',b.x,b.y,{radius:38,color:'#ff7038'});
      }
      b.life=0;
      continue;
    }
    if(dist2(p.x,p.y,b.x,b.y)<(p.r+b.r)*(p.r+b.r)){
      const damage=Math.max(1,Math.round(b.damage*(p.armourMul || 1)));
      p.hp-=damage;
      p.iframes=Math.max(p.iframes,0.28);
      floating(g,p.x,p.y-25,`-${damage}`,'#ff9f43');
      flashDamage();
      sfx('hit',0.8);
      b.life=0;
      if(p.hp<=0) gameOver(g);
    }
  }
  g.enemyBullets=g.enemyBullets.filter(b=>b.life>0 && b.x>-120 && b.y>-120 && b.x<WORLD_W+120 && b.y<WORLD_H+120);
}

function killEnemy(g,e){
  if(g.runStats){
    g.runStats.enemiesKilled=(g.runStats.enemiesKilled||0)+1;
    if(e.isChargingWaveEnemy) g.runStats.chargingWaveEnemiesKilled=(g.runStats.chargingWaveEnemiesKilled||0)+1;
    const roleStat=ENEMY_TYPES[e.type]?.role || e.role || 'normal';
    if(roleStat==='elite') g.runStats.elitesKilled=(g.runStats.elitesKilled||0)+1;
    if(roleStat==='boss' || e.type==='boss' || e.type==='hollowTyrantVariant') g.runStats.bossesKilled=(g.runStats.bossesKilled||0)+1;
  }
  g.kills++; sfx('kill', 0.55); dropPickup(g,e.x,e.y,'xp',e.xp);
  const role=ENEMY_TYPES[e.type]?.role || e.role || 'normal';
  if(role==='boss') spawnVfxComposition(g,'bossShockwave',e.x,e.y,{radius:Math.max(120,e.r*3.2),color:e.color});
  else if(role==='elite') spawnVfxComposition(g,'eliteDeathBurst',e.x,e.y,{radius:Math.max(56,e.r*2.1),color:e.color});
  else if(Math.random()<0.70) spawnVfxComposition(g,'enemyDeathBurst',e.x,e.y,{radius:Math.max(24,e.r*1.8),color:e.color});
  if(e.type==='boss' || e.type==='hollowTyrantVariant'){
    g.bossDefeated=true;
    saveProfile.statistics.totalBossesKilled++;
    log(g,'Sector boss defeated. Extraction signal locked.');
    sfx('explosion',1.2);
    addRing(g,e.x,e.y,'rgba(255,79,216,0.9)',0.42,e.r,e.r+95,8);
  }
  if(Math.random()<0.06) dropPickup(g,e.x+rand(-8,8),e.y+rand(-8,8),'voltarite',1);
  if(Math.random()<0.025) dropPickup(g,e.x+rand(-12,12),e.y+rand(-12,12),MISSION_RESOURCE_IDS[randi(2,MISSION_RESOURCE_IDS.length-1)],1);
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
  if(typeof recordRunDamageDealt==='function') recordRunDamageDealt(g,amount);
  if((color==='#7df9ff' || color==='#5dff9a') && g.player.arcDamageMul) amount*=g.player.arcDamageMul;
  e.hp-=amount; e.hitFlash=0.08; e.slow=Math.max(e.slow,0.05);
  if(Math.random()<0.25) addParticle(g,e.x,e.y,rand(-70,70),rand(-70,70),color,rand(0.18,0.35),rand(2,5));
}


const VFX_COMPOSITIONS = {
  genericExplosion: { theme:'default', radius:64, color:'#ff9f43' },
  largeExplosion: { theme:'default', radius:118, color:'#ff9f43', large:true },
  seismicCharge: { theme:'default', radius:112, color:'#ffcc4d', large:true },
  hexShardExplosion: { theme:'hex', radius:95, color:'#ff7038' },
  lavaBurst: { theme:'lava', radius:42, color:'#ff7038' },
  missileImpact: { theme:'missile', radius:44, color:'#ffcc4d' },
  enemyDeathBurst: { theme:'death', radius:28, color:'#ff5b5b' },
  eliteDeathBurst: { theme:'deathElite', radius:64, color:'#b46bff' },
  bossShockwave: { theme:'boss', radius:140, color:'#ff4fd8', large:true },
  arcOverload: { theme:'arc', radius:52, color:'#5dff9a' },
  stormLatticeHit: { theme:'arc', radius:30, color:'#7df9ff' },
  destructiveImpact: { theme:'destructive', radius:46, color:'#ff7038' },
  chargingWaveExplosion: { theme:'lava', radius:95, color:'#ff7038', large:true },
};

function spawnVfxComposition(g,name,x,y,options={}){
  const comp=VFX_COMPOSITIONS[name] || VFX_COMPOSITIONS.genericExplosion;
  const radius=options.radius || comp.radius || 56;
  const color=options.color || comp.color || '#ff9f43';
  const oldLast=g.debug ? g.debug.lastVfxComposition : null;
  if(g.debug) g.debug.lastVfxComposition=name;
  spawnExplosionVfx(g,x,y,radius,color,options.theme || comp.theme || 'default', { composition:name, large:!!comp.large, noDebugName:true });
  return oldLast;
}

function pickSpriteVariant(list){
  return list && list.length ? list[randi(0,list.length-1)] : null;
}

function addSpriteParticle(g,spriteId,x,y,life,size,options={}){
  const important = options.important ?? false;
  if(!shouldEmitVfx(g,important)) return;
  g.particles.push({
    x,y,vx:options.vx||0,vy:options.vy||0,
    color:options.color || '#ffffff',
    life,maxLife:life,size,
    targetSize:options.targetSize,
    shape:'sprite',spriteId,
    rotation:options.rotation || 0,
    spin:options.spin || 0,
    alphaMul:options.alphaMul ?? 1,
    glowColor:options.glowColor || null,
    glowBlur:options.glowBlur || 0,
    additive:options.additive ?? false,
  });
}

function resolveExplosionTheme(theme,color){
  if(theme && theme!=='auto') return theme;
  if(color==='#5dff9a' || color==='#7df9ff') return 'arc';
  if(color==='#ff7038') return Math.random()<0.55 ? 'hex' : 'lava';
  if(color==='#ff9f43' || color==='#ffcc4d') return Math.random()<0.4 ? 'lava' : 'default';
  return 'default';
}

function spawnExplosionVfx(g,x,y,r,color,theme='auto',options={}){
  if(typeof EXPLOSION_VFX_SPRITES==='undefined') return;
  const resolved = resolveExplosionTheme(theme,color);
  if(g.debug && !options.noDebugName) g.debug.lastVfxComposition = resolved;
  const perfMul = g.debug?.forceFullVfx ? 1 : clamp(g.performance?.vfxFactor ?? 1, 0.4, 1);
  const sizeMul = lerp(0.85,1.0,perfMul);
  const coreId = pickSpriteVariant(EXPLOSION_VFX_SPRITES.coreFlash);
  const fireballPool = resolved==='lava' ? EXPLOSION_VFX_SPRITES.lavaBurst
    : resolved==='hex' ? EXPLOSION_VFX_SPRITES.hexShardBurst
    : resolved==='arc' ? EXPLOSION_VFX_SPRITES.arcOverload
    : resolved==='missile' ? EXPLOSION_VFX_SPRITES.sparkBurst
    : resolved==='death' ? EXPLOSION_VFX_SPRITES.fragmentBurst
    : resolved==='deathElite' ? EXPLOSION_VFX_SPRITES.fragmentBurst
    : resolved==='boss' ? EXPLOSION_VFX_SPRITES.shockwave
    : resolved==='destructive' ? EXPLOSION_VFX_SPRITES.fragmentBurst
    : EXPLOSION_VFX_SPRITES.fireball;
  const ringPool = Math.random()<0.5 ? EXPLOSION_VFX_SPRITES.ringBlast : EXPLOSION_VFX_SPRITES.shockwave;
  const accentPool = resolved==='arc' ? EXPLOSION_VFX_SPRITES.arcOverload
    : resolved==='hex' ? EXPLOSION_VFX_SPRITES.fragmentBurst
    : resolved==='lava' ? EXPLOSION_VFX_SPRITES.sparkBurst
    : resolved==='missile' ? EXPLOSION_VFX_SPRITES.sparkBurst
    : resolved==='boss' ? EXPLOSION_VFX_SPRITES.ringBlast
    : (Math.random()<0.5 ? EXPLOSION_VFX_SPRITES.fragmentBurst : EXPLOSION_VFX_SPRITES.sparkBurst);

  const largeMul = options.large ? 1.28 : 1;
  const coreSize = Math.max(26, r*rand(0.85,1.18))*sizeMul*largeMul;
  addSpriteParticle(g, coreId, x, y, rand(0.08,0.14), coreSize, {
    targetSize: coreSize*rand(1.20,1.45),
    rotation: rand(0,Math.PI*2),
    spin: rand(-2.8,2.8),
    alphaMul: rand(0.88,1),
    glowColor: color,
    glowBlur: 18,
    additive: true,
    important: true,
  });

  const fireballCount = perfMul < 0.6 ? 1 : (Math.random()<0.65 ? 2 : 1);
  for(let i=0;i<fireballCount;i++){
    const id = pickSpriteVariant(fireballPool);
    const angle = rand(0,Math.PI*2), drift = rand(0,r*0.10);
    const size = Math.max(34, r*rand(1.10,1.70))*sizeMul;
    addSpriteParticle(g, id, x+Math.cos(angle)*drift, y+Math.sin(angle)*drift, rand(0.16,0.30), size, {
      targetSize: size*rand(1.08,1.28),
      rotation: rand(0,Math.PI*2),
      spin: rand(-1.8,1.8),
      alphaMul: rand(0.65,0.92),
      glowColor: color,
      glowBlur: resolved==='arc' ? 22 : 14,
      additive: resolved!=='hex',
    });
  }

  const ringId = pickSpriteVariant(ringPool);
  const ringSize = Math.max(44, r*rand(1.65,2.05))*sizeMul;
  addSpriteParticle(g, ringId, x, y, rand(0.20,0.34), ringSize*0.75, {
    targetSize: ringSize,
    rotation: rand(0,Math.PI*2),
    spin: rand(-0.8,0.8),
    alphaMul: rand(0.55,0.85),
    glowColor: resolved==='arc' ? '#7df9ff' : color,
    glowBlur: resolved==='arc' ? 18 : 8,
    additive: true,
    important: true,
  });

  if(perfMul > 0.45 || Math.random()<0.8){
    const smokeId = pickSpriteVariant(EXPLOSION_VFX_SPRITES.smokeBloom);
    const smokeSize = Math.max(54, r*rand(1.55,2.20))*sizeMul;
    addSpriteParticle(g, smokeId, x+rand(-r*0.08,r*0.08), y+rand(-r*0.08,r*0.08), rand(0.36,0.62), smokeSize, {
      targetSize: smokeSize*rand(1.10,1.32),
      rotation: rand(0,Math.PI*2),
      spin: rand(-0.7,0.7),
      alphaMul: rand(0.35,0.58),
      glowBlur: 0,
      additive: false,
    });
  }

  if(Math.random()<0.82){
    const accentId = pickSpriteVariant(accentPool);
    const accentSize = Math.max(30, r*rand(0.92,1.42))*sizeMul;
    addSpriteParticle(g, accentId, x+rand(-r*0.05,r*0.05), y+rand(-r*0.05,r*0.05), rand(0.14,0.24), accentSize, {
      targetSize: accentSize*rand(1.05,1.22),
      rotation: rand(0,Math.PI*2),
      spin: rand(-2.4,2.4),
      alphaMul: rand(0.52,0.86),
      glowColor: color,
      glowBlur: resolved==='arc' ? 18 : 10,
      additive: true,
    });
  }
}

function explode(g,x,y,r,damage,color,noShake=false,theme='auto'){
  if(!noShake) shake=Math.max(shake,9);
  for(const e of g.enemies){
    const d=Math.hypot(e.x-x,e.y-y);
    if(d<r+e.r) damageEnemy(g,e,damage*(1-d/(r+e.r)*0.45),color);
  }
  spawnExplosionVfx(g,x,y,r,color,theme);
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

function collectRunResource(g,resourceId,amount,options={}){
  if(!g.resources) g.resources={};
  g.resources[resourceId]=(g.resources[resourceId] || 0)+amount;
  if(typeof recordRunResource==='function') recordRunResource(g,resourceId,amount);
  if(resourceId==='gild') g.gold=(g.resources.gild || 0);
  if(resourceId==='voltarite') g.nitra=(g.resources.voltarite || 0);
  if(resourceId==='echo' && options.asXp!==false){
    gainXp(g,amount);
    if(g.runStats) g.runStats.xpCollected=(g.runStats.xpCollected||0)+amount;
    g.objectiveEchoCollected=(g.objectiveEchoCollected || 0)+amount;
  }
  addObjectiveProgress(g,`collect_${resourceId}`,amount);
  // compatibility with older objective IDs
  if(resourceId==='gild') addObjectiveProgress(g,'mine_gild_shards',amount);
  if(resourceId==='echo') addObjectiveProgress(g,'collect_echo_shards',amount);
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
      if(it.type==='xp'){ collectRunResource(g,'echo',it.value); }
      else if(MINERALS[it.type]){ collectRunResource(g,it.type,it.value); }
      else if(it.type==='nitra') collectRunResource(g,'voltarite',it.value);
      sfx('pickup', it.type==='nitra' || it.type==='voltarite' ? 1.0 : 0.6);
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
  const pool=UPGRADE_POOL.filter(up=>(!up.allowedClasses || up.allowedClasses.includes(g.player.classId)) && (!up.available || up.available(g)));
  while(choices.length<3 && pool.length){
    const idx=randi(0,pool.length-1);
    choices.push(pool.splice(idx,1)[0]);
  }
  g.upgradeMenuState = g.upgradeMenuState || {open:false,selectedIndex:0,lastMoveTime:-999,moveRepeatDelay:0.20};
  g.upgradeMenuState.open=true;
  g.upgradeMenuState.selectedIndex=0;
  g.upgradeMenuState.lastMoveTime=-999;
  g.upgradeMenuState.choices=choices;
  for(let i=0;i<choices.length;i++){
    const up=choices[i];
    const div=document.createElement('div');
    div.className='card';
    div.dataset.upgradeIndex=String(i);
    div.setAttribute('role','option');
    div.setAttribute('tabindex','0');
    const iconHtml = up.spriteId ? spriteIconHtml(up.spriteId, up.icon) : up.icon;
    div.innerHTML=`<div class="icon">${iconHtml}</div><h3>${up.name}</h3><p>${up.desc}</p><span class="tag">Select</span>`;
    div.onclick=()=>selectUpgradeByIndex(g,i,'mouse');
    div.onmouseenter=()=>{ g.upgradeMenuState.selectedIndex=i; refreshUpgradeSelection(g); };
    div.onkeydown=(ev)=>{ if(ev.code==='Enter' || ev.code==='Space'){ ev.preventDefault(); selectUpgradeByIndex(g,i,'keyboard'); } };
    ui.upgradeCards.appendChild(div);
  }
  ui.upgradeOverlay.classList.add('show');
  refreshUpgradeSelection(g);
}

function updateParticles(g,dt){
  const particleCap = g.performance?.state===PERF_STATES.CRITICAL ? 260 : g.performance?.state===PERF_STATES.WARNING ? 420 : 720;
  if(g.particles.length>particleCap) g.particles.splice(0,g.particles.length-particleCap);
  for(const p of g.particles){
    p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=Math.pow(0.02,dt); p.vy*=Math.pow(0.02,dt); p.life-=dt;
    if(p.shape==='ring' || p.shape==='sprite') p.size = lerp(p.size, p.targetSize || p.size, dt*10);
    if(p.shape==='sprite') p.rotation = (p.rotation || 0) + (p.spin || 0)*dt;
  }
  g.particles=g.particles.filter(p=>p.life>0);
  for(const a of g.arcs){ a.life-=dt; }
  g.arcs=g.arcs.filter(a=>a.life>0);
  for(const t of g.texts){ t.y-=34*dt; t.life-=dt; }
  g.texts=g.texts.filter(t=>t.life>0);
}
function addParticle(g,x,y,vx,vy,color,life,size,shape='circle'){
  const important = shape==='ring' || life<=0.12;
  if(!shouldEmitVfx(g,important)) return;
  g.particles.push({x,y,vx,vy,color,life,maxLife:life,size,shape});
}
function addRing(g,x,y,color,life,size,targetSize,lineWidth=4){ g.particles.push({x,y,vx:0,vy:0,color,life,maxLife:life,size,targetSize,shape:'ring',lineWidth}); }
function floating(g,x,y,text,color){ g.texts.push({x,y,text,color,life:0.9,maxLife:0.9}); }
function flashDamage(){ ui.damageFlash.classList.add('on'); setTimeout(()=>ui.damageFlash.classList.remove('on'),90); }
