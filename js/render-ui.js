'use strict';

/* HUD updates, menus, rendering, drawing helpers, and game-over/start flows. */

function updateUI(g){
  const p=g.player;
  const mm=Math.floor(g.time/60), ss=Math.floor(g.time%60);
  ui.timer.textContent=`${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  ui.hpFill.style.width=`${clamp(p.hp/p.maxHp*100,0,100)}%`;
  ui.hpLabel.textContent=`HP ${Math.ceil(Math.max(0,p.hp))}/${p.maxHp}`;
  ui.xpFill.style.width=`${clamp(g.xp/g.xpNeed*100,0,100)}%`;
  ui.xpLabel.textContent=`Echo ${Math.floor(g.xp)}/${g.xpNeed}`;
  ui.heatFill.style.width=`${clamp(p.heat/p.maxHeat*100,0,100)}%`;
  ui.heatLabel.textContent=p.heat>=p.maxHeat?'TOOL OVERHEATED':'TOOL HEAT';
  ui.level.textContent=g.level;
  ui.depth.textContent=Math.floor(g.time*1.6)+' m';
  ui.gold.textContent=g.gold; ui.nitra.textContent=g.nitra; ui.kills.textContent=g.kills;
  const trapChip = g.player.canUseTraps ? `<div class="chip"><span>Pathfinder Trap Kit</span><b>${g.player.trapCd<=0?'READY':'CD '+g.player.trapCd.toFixed(1)+'s'}</b></div>` : '';
  const accChip = `<div class="chip"><span>Weapon Accuracy</span><b>${Math.round((g.player.accuracy ?? 0.35)*100)}%</b></div>`;
  const cursorChip = (g.player.mouseTargeting || g.controllerCursor?.active) ? `<div class="chip"><span>Targeting Cursor</span><b>${manualAimActive(g)?'MANUAL':'AUTO'}</b></div>` : '';
  const arc = g.arcConnection;
  const arcChip = arc?.unlocked ? `<div class="chip"><span>Arc Connection</span><b>${arc.selectedEnemies.length}/${arcConnectionMaxTargets(g)}</b></div>` : '';
  ui.weaponList.innerHTML=g.weapons.map(w=>{
    const spriteId=WEAPON_DATA[w.id]?.spriteId;
    const icon=spriteId ? `<img class="weaponIcon" src="${SPRITES[spriteId]}" alt="">` : '';
    return `<div class="chip"><span>${icon}${weaponName(w.id)}</span><b>Mk ${w.level}</b></div>`;
  }).join('') + trapChip + accChip + cursorChip + arcChip;
  const resourceChips = RUN_RESOURCE_IDS.filter(id=>id!=='gild' && id!=='voltarite' && id!=='echo' && (g.resources?.[id] || 0)>0)
    .map(id=>`<div class="chip"><span>${MINERALS[id].displayName}</span><b>${g.resources[id]}</b></div>`).join('');
  const pressureChip=`<div class="chip ${g.pressureFlash>0?'danger':''}"><span>Hollow Pressure</span><b>${g.hollowPressure || 0}</b></div>`;
  const perfState=g.performance?.state || '';
  const perfChip=(perfState && perfState!==PERF_STATES.HEALTHY)
    ? `<div class="chip ${perfState===PERF_STATES.CRITICAL?'danger':''}"><span>Swarm Stabiliser</span><b>${perfState.replace('PERF_','')}</b></div>`
    : '';
  const objectiveChips=g.objectives.map(o=>`<div class="chip objective ${o.completed?'done':''}"><span>${o.displayName}</span><b>${Math.floor(o.currentAmount)}/${o.targetAmount}</b></div>`).join('');
  const bossChip=g.bossDefeated ? '<div class="chip done"><span>Sector Boss</span><b>DEFEATED</b></div>' : (g.bossSpawned ? '<div class="chip danger"><span>Sector Boss</span><b>ACTIVE</b></div>' : '<div class="chip"><span>Sector Boss</span><b>LOCKED</b></div>');
  const extractionChip=g.extraction ? `<div class="chip danger"><span>Extraction</span><b>${Math.max(0,g.extractionTimer).toFixed(1)}s</b></div>` : '';
  const missionChip=`<div class="chip"><span>Mission ${g.missionIndex}</span><b>Run ${g.runIndex}/${RUNS_PER_MISSION}</b></div>`;
  ui.logList.innerHTML=missionChip + pressureChip + perfChip + resourceChips + objectiveChips + bossChip + extractionChip + g.log.slice(0,3).map((m,i)=>`<div class="chip"><span>${m}</span><b>${i===0?'NEW':''}</b></div>`).join('');
}

function render(g){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  if(!g){ drawBackdrop(); return; }
  const p=g.player;
  const cam=g.camera;
  cam.x=lerp(cam.x,p.x-innerWidth/2,0.10);
  cam.y=lerp(cam.y,p.y-innerHeight/2,0.10);
  cam.x=clamp(cam.x,0,WORLD_W-innerWidth); cam.y=clamp(cam.y,0,WORLD_H-innerHeight);
  const sx=(shake>0?rand(-shake,shake):0), sy=(shake>0?rand(-shake,shake):0);
  ctx.save(); ctx.translate(-cam.x+sx,-cam.y+sy);
  drawTiles(g,cam);
  drawLavaDebugZones(g,cam);
  drawTraps(g);
  drawExtractionCraft(g);
  drawPickups(g);
  drawTargetLocks(g);
  drawMissiles(g);
  drawEnemyBoomerangs(g);
  drawEnemyBullets(g);
  drawBullets(g);
  drawBoomerangs(g);
  drawArcConnection(g);
  drawEnemies(g);
  drawEnemyPaths(g);
  drawWardenDrones(g);
  drawSifterDrones(g);
  drawPlayer(g);
  drawMiningDebug(g);
  drawParticles(g);
  drawArcs(g);
  drawTargetingCursor(g);
  drawTexts(g);
  ctx.restore();
  drawFogOfWar(g,cam,sx,sy);
  drawVignette();
  drawFogDebugOverlay(g,cam,sx,sy);
  drawEnemyBudgetOverlay(g);
  drawControllerDebugOverlay(g);
  drawAccuracyCone(g);
  if(paused) drawPause();
}

function drawTargetingCursor(g){
  if(!manualAimActive(g)) return;
  const m = mouseWorld(g);
  ctx.save();
  ctx.translate(m.x,m.y);
  const pulse = 0.5 + 0.5*Math.sin(g.time*10);
  ctx.strokeStyle=`rgba(66,214,255,${0.45+0.35*pulse})`;
  ctx.shadowColor='#42d6ff';
  ctx.shadowBlur=10;
  ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(0,0,20+3*pulse,0,Math.PI*2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-28,0); ctx.lineTo(-12,0);
  ctx.moveTo(12,0); ctx.lineTo(28,0);
  ctx.moveTo(0,-28); ctx.lineTo(0,-12);
  ctx.moveTo(0,12); ctx.lineTo(0,28);
  ctx.stroke();
  ctx.restore();
}

function drawArcConnection(g){
  const arc = g.arcConnection;
  if(!arc?.unlocked) return;
  const selected = arc.selectedEnemies.filter(e=>e && e.hp>0);
  if(!selected.length) return;
  ctx.save();
  ctx.lineCap='round';
  ctx.lineJoin='round';
  for(let i=1;i<selected.length;i++){
    const a=selected[i-1], b=selected[i];
    const pulse = 0.55 + 0.45*Math.sin(g.time*12+i);
    ctx.strokeStyle=`rgba(93,255,154,${0.48+0.35*pulse})`;
    ctx.shadowColor='#5dff9a';
    ctx.shadowBlur=10;
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(a.x,a.y);
    const segments=5;
    for(let s=1;s<=segments;s++){
      const t=s/segments;
      const jitter=(1-Math.abs(0.5-t)*1.7);
      ctx.lineTo(lerp(a.x,b.x,t)+rand(-3,3)*jitter, lerp(a.y,b.y,t)+rand(-3,3)*jitter);
    }
    ctx.stroke();
  }
  for(let i=0;i<selected.length;i++){
    const e=selected[i];
    const pulse = 0.5 + 0.5*Math.sin(g.time*9+i);
    ctx.strokeStyle=`rgba(93,255,154,${0.65+0.30*pulse})`;
    ctx.shadowColor='#5dff9a';
    ctx.shadowBlur=12;
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.arc(e.x,e.y,e.r+8+3*pulse,0,Math.PI*2);
    ctx.stroke();
    ctx.fillStyle='rgba(93,255,154,0.22)';
    ctx.beginPath();
    ctx.arc(e.x,e.y,e.r+3,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle='#d9ffe7';
    ctx.font='bold 12px Segoe UI, Arial';
    ctx.textAlign='center';
    ctx.fillText(String(i+1),e.x,e.y-e.r-13);
  }
  ctx.restore();
}

function drawBackdrop(){
  ctx.fillStyle='#07090d'; ctx.fillRect(0,0,innerWidth,innerHeight);
}

function drawTiles(g,cam){
  const minx=clamp(Math.floor(cam.x/TILE)-1,0,MAP_W-1), maxx=clamp(Math.ceil((cam.x+innerWidth)/TILE)+1,0,MAP_W-1);
  const miny=clamp(Math.floor(cam.y/TILE)-1,0,MAP_H-1), maxy=clamp(Math.ceil((cam.y+innerHeight)/TILE)+1,0,MAP_H-1);
  ctx.fillStyle='#131722'; ctx.fillRect(cam.x-30,cam.y-30,innerWidth+60,innerHeight+60);
  for(let y=miny;y<=maxy;y++) for(let x=minx;x<=maxx;x++){
    const t=g.tiles[tileIdx(x,y)];
    const px=x*TILE, py=y*TILE;
    if(t===TILE_EMPTY){
      ctx.fillStyle=((x+y)&1)?'#171b27':'#151925';
      ctx.fillRect(px,py,TILE,TILE);
      if(Math.random()<0.0002){} // keeps cave still; no-op.
    } else {
      const data=TILE_DATA[t];
      const color = t===TILE_EMPTY?'#151925':(data?.color || '#3a342f');
      ctx.fillStyle=color; ctx.fillRect(px,py,TILE,TILE);
      const tileInfo = TILE_DATA[t];
      if(tileInfo?.sprite){
        drawSpriteCentered(ctx, tileInfo.sprite, px+TILE/2, py+TILE/2, TILE-6, TILE-6, {
          glowColor: (t===TILE_LUMINA_SPORES || t===TILE_AETHER_QUARTZ || t===TILE_CRYSALITH || t===TILE_EMBERGLASS) ? tileInfo.color : null,
          glowBlur: (t===TILE_LUMINA_SPORES || t===TILE_AETHER_QUARTZ || t===TILE_CRYSALITH || t===TILE_EMBERGLASS) ? 8 : 0
        });
      }
      if(t===TILE_LAVA_ROCK){
        ctx.fillStyle='rgba(255,96,24,0.18)';
        ctx.beginPath(); ctx.arc(px+TILE/2,py+TILE/2,TILE*0.42,0,Math.PI*2); ctx.fill();
      }
      ctx.fillStyle='rgba(255,255,255,0.04)'; ctx.fillRect(px+2,py+2,TILE-4,3);
      ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fillRect(px,py+TILE-4,TILE,4);
      const seed=(x*73856093 ^ y*19349663)>>>0;
      ctx.fillStyle='rgba(255,255,255,0.06)';
      for(let k=0;k<2;k++){
        const ox=(seed>>(k*5))%TILE, oy=(seed>>(k*7+3))%TILE;
        ctx.fillRect(px+ox,py+oy,2,2);
      }
    }
  }
}


function drawLavaDebugZones(g,cam){
  if(!g.debug?.showLavaZones) return;
  const minx=clamp(Math.floor(cam.x/TILE)-1,0,MAP_W-1), maxx=clamp(Math.ceil((cam.x+innerWidth)/TILE)+1,0,MAP_W-1);
  const miny=clamp(Math.floor(cam.y/TILE)-1,0,MAP_H-1), maxy=clamp(Math.ceil((cam.y+innerHeight)/TILE)+1,0,MAP_H-1);
  ctx.save();
  ctx.strokeStyle='rgba(255,112,56,0.82)';
  ctx.lineWidth=2;
  for(let y=miny;y<=maxy;y++) for(let x=minx;x<=maxx;x++) if(g.tiles[tileIdx(x,y)]===TILE_LAVA_ROCK){
    ctx.strokeRect(x*TILE+2,y*TILE+2,TILE-4,TILE-4);
  }
  ctx.restore();
}

function drawPlayer(g){
  const p=g.player;
  ctx.save(); ctx.translate(p.x,p.y);
  const a=Math.atan2(p.lastDy,p.lastDx);
  ctx.rotate(a);
  ctx.shadowColor='#42d6ff'; ctx.shadowBlur=8;
  ctx.fillStyle=p.iframes>0?'rgba(255,255,255,0.85)':'#4fa3ff';
  ctx.beginPath(); ctx.roundRect(-15,-12,30,24,7); ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='#f5c16c'; ctx.fillRect(-4,-18,10,10);
  ctx.fillStyle='#222'; ctx.fillRect(2,-8,20,5);
  ctx.fillStyle='#ffcc4d'; ctx.fillRect(-12,11,8,6);
  ctx.restore();
}

function drawEnemies(g){
  for(const e of g.enemies){
    ctx.save();
    let shakeX=0, shakeY=0;
    if(e.type==='hexShard' && e.detonationStarted){
      const amp=e.shakeAmount || 4;
      shakeX=rand(-amp,amp); shakeY=rand(-amp,amp);
    }
    ctx.translate(e.x+shakeX,e.y+shakeY);

    const warning = e.type==='hexShard' && e.detonationStarted;
    const pulse = 0.5 + 0.5*Math.sin(g.time*(warning?18:6)+e.phase);
    let spriteDrawn=false;

    // Enemy sprites are purely visual. If any sprite is missing, the existing
    // procedural fallback below still renders the enemy safely.
    if(e.type==='hexShard'){
      const size = e.r*2.45*(warning ? 1+0.08*pulse : 1);
      spriteDrawn = drawSpriteCentered(ctx,'hexShardEnemy',0,0,size,size,{
        rotation: g.time*0.8 + Math.sin(g.time*4+e.phase)*0.10,
        alpha: e.hitFlash>0 ? 0.65 : 1,
        glowColor: warning ? '#ff3d22' : e.color,
        glowBlur: warning ? 24 : 10
      });
      if(spriteDrawn && warning){
        drawSpriteCentered(ctx,'hexShardWarningGlow',0,0,size*1.35,size*1.35,{
          rotation: -g.time*1.6,
          alpha: 0.38+0.50*pulse,
          glowColor:'#ff7038',
          glowBlur:28
        });
        ctx.strokeStyle=`rgba(255,72,40,${0.42+0.42*pulse})`;
        ctx.lineWidth=3;
        ctx.beginPath(); ctx.arc(0,0,70+8*pulse,0,Math.PI*2); ctx.stroke();
      }
    } else if(e.type==='boss'){
      const size = Math.max(96,e.r*2.55);
      spriteDrawn = drawSpriteCentered(ctx,'hollowTyrantBoss',0,0,size,size,{
        rotation: Math.sin(g.time*1.4+e.phase)*0.04,
        alpha: e.hitFlash>0 ? 0.72 : 1,
        glowColor:e.color,
        glowBlur:26
      });
    } else if(e.type==='elite' || e.type==='guard'){
      const size = Math.max(58,e.r*2.65);
      spriteDrawn = drawSpriteCentered(ctx,'eliteShellbackEnemy',0,0,size,size,{
        rotation: Math.sin(g.time*2+e.phase)*0.08,
        alpha: e.hitFlash>0 ? 0.72 : 1,
        glowColor:e.color,
        glowBlur:e.type==='elite'?18:10
      });
    }

    if(!spriteDrawn){
      if(e.type==='hexShard'){
        ctx.fillStyle=e.hitFlash>0?'#fff':(warning?`rgba(255,112,56,${0.78+0.22*pulse})`:e.color);
        ctx.strokeStyle=warning?'#ffe0a8':'rgba(255,220,170,0.82)';
        ctx.lineWidth=warning?3:2;
        ctx.shadowColor=warning?'#ff3d22':e.color;
        ctx.shadowBlur=warning?26:10;
        ctx.beginPath();
        for(let i=0;i<6;i++){
          const a=-Math.PI/6+i*Math.PI*2/6;
          const rr=e.r*(warning?1+0.10*pulse:1);
          const x=Math.cos(a)*rr, y=Math.sin(a)*rr;
          if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
        ctx.fillStyle='rgba(0,0,0,0.38)';
        ctx.beginPath(); ctx.arc(0,0,e.r*0.42,0,Math.PI*2); ctx.fill();
        if(warning){
          ctx.strokeStyle=`rgba(255,72,40,${0.42+0.42*pulse})`;
          ctx.lineWidth=3;
          ctx.beginPath(); ctx.arc(0,0,70+8*pulse,0,Math.PI*2); ctx.stroke();
        }
      } else {
        ctx.fillStyle=e.hitFlash>0?'#fff':e.color;
        ctx.shadowColor=e.color; ctx.shadowBlur=e.type==='boss'?28:(e.type==='elite'?18:6);
        ctx.beginPath();
        for(let i=0;i<8;i++){
          const a=i*Math.PI*2/8;
          const rr=e.r*(i%2?0.82:1.08);
          ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);
        }
        ctx.closePath(); ctx.fill(); ctx.shadowBlur=0;
      }
    }

    ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(-e.r,-e.r-10,e.r*2,4);
    ctx.fillStyle='#ff5b5b'; ctx.fillRect(-e.r,-e.r-10,e.r*2*clamp(e.hp/e.maxHp,0,1),4);
    if(e.type==='boss'){
      ctx.strokeStyle='rgba(255,255,255,0.75)';
      ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(0,0,e.r+8+Math.sin(g.time*5)*3,0,Math.PI*2); ctx.stroke();
    }
    if(g.debug?.showHexRanges && e.type==='hexShard'){
      ctx.shadowBlur=0;
      ctx.strokeStyle='rgba(255,112,56,0.32)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(0,0,70,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle='rgba(255,200,80,0.18)';
      ctx.beginPath(); ctx.arc(0,0,420,0,Math.PI*2); ctx.stroke();
    }
    ctx.restore();
  }
}

function drawExtractionCraft(g){
  if(!g.extraction) return;
  const ex=g.extraction;
  const pulse=0.5+0.5*Math.sin(g.time*8);
  ctx.save();
  ctx.translate(ex.x,ex.y);
  ctx.shadowColor='#5dff9a';
  ctx.shadowBlur=22;
  ctx.strokeStyle=`rgba(93,255,154,${0.45+0.35*pulse})`;
  ctx.fillStyle='rgba(93,255,154,0.16)';
  ctx.lineWidth=4;
  ctx.beginPath(); ctx.arc(0,0,ex.r+14+8*pulse,0,Math.PI*2); ctx.fill(); ctx.stroke();
  const drawn=drawSpriteCentered(ctx,'extractionCraft',0,0,110,110,{
    rotation: Math.sin(g.time*1.2)*0.025,
    glowColor:'#5dff9a',
    glowBlur:18
  });
  if(!drawn){
    ctx.fillStyle='#d9ffe7';
    ctx.beginPath();
    ctx.moveTo(0,-30); ctx.lineTo(28,14); ctx.lineTo(10,26); ctx.lineTo(-10,26); ctx.lineTo(-28,14);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle='#15251f';
    ctx.fillRect(-11,3,22,12);
  }
  ctx.shadowBlur=0;
  ctx.fillStyle='#fff';
  ctx.font='900 13px Segoe UI, Arial';
  ctx.textAlign='center';
  ctx.fillText('EXTRACTION',0,-60);
  ctx.restore();
}

function drawEnemyPaths(g){
  if(!g.debug?.showEnemyPaths) return;
  ctx.save();
  for(const e of g.enemies){
    if(e.stuckTimer>0.75){
      ctx.strokeStyle='rgba(255,91,91,0.95)';
      ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(e.x,e.y,e.r+14,0,Math.PI*2); ctx.stroke();
    }
    if(!e.path || e.pathIndex>=e.path.length) continue;
    ctx.strokeStyle='rgba(93,255,154,0.48)';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(e.x,e.y);
    for(let i=e.pathIndex;i<e.path.length;i++) ctx.lineTo(e.path[i].x,e.path[i].y);
    ctx.stroke();
    const wp=e.path[e.pathIndex];
    ctx.fillStyle='rgba(66,214,255,0.85)';
    ctx.beginPath(); ctx.arc(wp.x,wp.y,4,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

function drawBullets(g){
  for(const b of g.bullets){
    ctx.strokeStyle=b.color; ctx.fillStyle=b.color;
    ctx.lineWidth=b.rail?4:2;
    ctx.beginPath(); ctx.moveTo(b.x-b.vx*0.025,b.y-b.vy*0.025); ctx.lineTo(b.x,b.y); ctx.stroke();
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
  }
}


function drawEnemyBoomerangs(g){
  for(const b of g.enemyBoomerangs || []){
    ctx.save();
    ctx.strokeStyle='rgba(255,112,56,0.40)';
    ctx.lineWidth=2;
    ctx.beginPath();
    for(let i=0;i<b.trail.length;i++){
      const t=b.trail[i];
      if(i===0) ctx.moveTo(t.x,t.y); else ctx.lineTo(t.x,t.y);
    }
    ctx.stroke();
    const a=Math.atan2(b.vy,b.vx)+Math.PI/2+(b.spin||0);
    const drawn=drawSpriteCentered(ctx,'hexBoomerangProjectile',b.x,b.y,30,30,{
      rotation:a,
      glowColor:b.color || '#ff7038',
      glowBlur:14
    });
    if(!drawn){
      ctx.translate(b.x,b.y);
      ctx.rotate(a);
      ctx.fillStyle=b.color || '#ff7038';
      ctx.strokeStyle='rgba(255,235,185,0.85)';
      ctx.shadowColor=b.color || '#ff7038';
      ctx.shadowBlur=14;
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(0,-10); ctx.lineTo(8,2); ctx.lineTo(0,8); ctx.lineTo(-8,2); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }
}

function drawEnemyBullets(g){
  for(const b of g.enemyBullets){
    ctx.save();
    const angle=Math.atan2(b.vy,b.vx);
    const spriteId=b.destructive?'destructiveEnemyBullet':'enemyRedBullet';
    const size=b.destructive?24:(b.small?15:19);
    const drawn=drawSpriteCentered(ctx,spriteId,b.x,b.y,size,size,{
      rotation:angle,
      glowColor:b.color || '#ff3030',
      glowBlur:b.destructive?18:(b.small?8:12)
    });
    if(!drawn){
      ctx.fillStyle=b.color || '#ff3030';
      ctx.strokeStyle=b.destructive?'rgba(255,220,180,0.92)':'rgba(255,210,210,0.72)';
      ctx.shadowColor=b.color || '#ff3030';
      ctx.shadowBlur=b.destructive?18:(b.small?8:12);
      ctx.lineWidth=b.destructive?3:(b.small?1.5:2);
      ctx.beginPath();
      ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();
    }
    // All hostile bullets get a red trail for readability. Elite/boss shots are
    // larger and brighter; small-enemy shots stay small but still readable.
    ctx.strokeStyle=b.destructive?'rgba(255,220,180,0.92)':'rgba(255,80,80,0.72)';
    ctx.shadowColor=b.color || '#ff3030';
    ctx.shadowBlur=b.destructive?12:7;
    ctx.lineWidth=b.destructive?3:(b.small?1.5:2);
    ctx.beginPath();
    ctx.moveTo(b.x-b.vx*(b.destructive?0.040:0.030),b.y-b.vy*(b.destructive?0.040:0.030));
    ctx.lineTo(b.x+b.vx*0.008,b.y+b.vy*0.008);
    ctx.stroke();
    if(g.debug?.showEnemyBulletHitboxes){
      ctx.shadowBlur=0;
      ctx.strokeStyle='rgba(255,255,255,0.85)';
      ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.stroke();
    }
    ctx.restore();
  }
}

function drawMiningDebug(g){
  if(!g.debug?.showMiningArc || !g.debug.miningIntent) return;
  const d=g.debug.miningIntent;
  const p=g.player;
  ctx.save();

  // Intended movement vector: what the player asked for before collision.
  ctx.strokeStyle='rgba(66,214,255,0.85)';
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(d.x,d.y);
  ctx.lineTo(d.x+d.dx*58,d.y+d.dy*58);
  ctx.stroke();

  // Actual resolved movement vector: what collision permitted this frame.
  if(g.debug.actualMovement){
    const m=g.debug.actualMovement;
    ctx.strokeStyle='rgba(255,255,255,0.72)';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(m.x,m.y);
    ctx.lineTo(m.x+m.dx*14,m.y+m.dy*14);
    ctx.stroke();
  }

  // Mining fan/contact area.
  ctx.strokeStyle=g.debug.lowSpeedMiningActive?'rgba(255,204,77,0.72)':'rgba(66,214,255,0.45)';
  ctx.fillStyle=g.debug.lowSpeedMiningActive?'rgba(255,204,77,0.13)':'rgba(66,214,255,0.12)';
  ctx.lineWidth=2;
  const half=Math.PI*0.50;
  const base=Math.atan2(d.dy,d.dx);
  const r=(p.collisionR||p.r)+(g.debug.lowSpeedMiningActive?34:28);
  ctx.beginPath();
  ctx.moveTo(d.x,d.y);
  ctx.arc(d.x,d.y,r,base-half,base+half);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  if(g.debug.miningSamples){
    ctx.fillStyle='rgba(255,255,255,0.85)';
    for(const smp of g.debug.miningSamples){ ctx.beginPath(); ctx.arc(smp.x,smp.y,2.2,0,Math.PI*2); ctx.fill(); }
  }
  if(g.debug.miningSamplesPost){
    ctx.fillStyle='rgba(125,249,255,0.65)';
    for(const smp of g.debug.miningSamplesPost){ ctx.beginPath(); ctx.arc(smp.x,smp.y,1.7,0,Math.PI*2); ctx.fill(); }
  }

  // Candidate mineable tiles: cyan before collision, blue after collision.
  if(g.debug.showMiningCandidates!==false){
    if(g.debug.miningCandidates){
      ctx.lineWidth=1.5;
      for(const c of g.debug.miningCandidates){
        ctx.strokeStyle=c.touching?'rgba(255,204,77,0.65)':'rgba(66,214,255,0.45)';
        ctx.strokeRect(c.tx*TILE+5,c.ty*TILE+5,TILE-10,TILE-10);
      }
    }
    if(g.debug.miningCandidatesPost){
      ctx.lineWidth=1.25;
      for(const c of g.debug.miningCandidatesPost){
        ctx.strokeStyle='rgba(125,249,255,0.38)';
        ctx.strokeRect(c.tx*TILE+8,c.ty*TILE+8,TILE-16,TILE-16);
      }
    }
  }

  if(g.debug.currentMiningLock){
    const t=g.debug.currentMiningLock;
    ctx.strokeStyle='rgba(255,112,67,0.95)';
    ctx.lineWidth=4;
    ctx.setLineDash([6,4]);
    ctx.strokeRect(t.tx*TILE+2,t.ty*TILE+2,TILE-4,TILE-4);
    ctx.setLineDash([]);
  }
  if(g.debug.currentMiningTarget){
    const t=g.debug.currentMiningTarget;
    ctx.strokeStyle='rgba(255,255,255,0.95)';
    ctx.lineWidth=3;
    ctx.strokeRect(t.tx*TILE+3,t.ty*TILE+3,TILE-6,TILE-6);
  }

  ctx.fillStyle='rgba(255,255,255,0.88)';
  ctx.font='bold 12px Segoe UI, Arial';
  ctx.textAlign='left';
  const status=[];
  if(g.debug.lowSpeedMiningActive) status.push('LOW SPEED');
  if(g.debug.miningStickinessActive) status.push('STICKY LOCK');
  if(status.length) ctx.fillText(status.join(' · '), d.x+14, d.y-18);
  ctx.restore();
}

function drawTargetLocks(g){
  for(const l of g.targetLocks){
    const e=l.enemy;
    if(!e) continue;
    const alpha=clamp(l.life/l.maxLife,0,1);
    const pulse=0.5+0.5*Math.sin(g.time*16);
    ctx.save();
    ctx.translate(e.x,e.y-e.r-18);
    ctx.globalAlpha=alpha;
    const drawn=drawSpriteCentered(ctx,'targetLockReticle',0,0,34+5*pulse,34+5*pulse,{
      rotation:(l.spin||0)+g.time*1.8,
      alpha:0.82+0.18*pulse,
      glowColor:'#ff4949',
      glowBlur:12
    });
    if(!drawn){
      ctx.strokeStyle=`rgba(255,73,73,${0.55+0.35*pulse})`;
      ctx.fillStyle='rgba(255,73,73,0.10)';
      ctx.shadowColor='#ff4949';
      ctx.shadowBlur=12;
      ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(0,0,14+2*pulse,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-20,-4); ctx.lineTo(-12,-4); ctx.lineTo(-12,4); ctx.lineTo(-20,4);
      ctx.moveTo(20,-4); ctx.lineTo(12,-4); ctx.lineTo(12,4); ctx.lineTo(20,4);
      ctx.moveTo(-4,-20); ctx.lineTo(-4,-12); ctx.lineTo(4,-12); ctx.lineTo(4,-20);
      ctx.moveTo(-4,20); ctx.lineTo(-4,12); ctx.lineTo(4,12); ctx.lineTo(4,20);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawMissiles(g){
  for(const m of g.missiles){
    if(m.trail && m.trail.length>1){
      ctx.save();
      ctx.lineCap='round';
      for(let i=1;i<m.trail.length;i++){
        const a=i/m.trail.length;
        ctx.globalAlpha=a*0.45;
        ctx.strokeStyle='rgba(255,159,67,0.75)';
        ctx.lineWidth=1+a*3;
        ctx.beginPath();
        ctx.moveTo(m.trail[i-1].x,m.trail[i-1].y);
        ctx.lineTo(m.trail[i].x,m.trail[i].y);
        ctx.stroke();
      }
      ctx.restore();
    }
    const a=Math.atan2(m.vy,m.vx);
    ctx.save();
    ctx.strokeStyle=`rgba(255,159,67,${m.phase==='launch'?0.85:0.55})`;
    ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(m.x-Math.cos(a)*18,m.y-Math.sin(a)*18); ctx.lineTo(m.x-Math.cos(a)*5,m.y-Math.sin(a)*5); ctx.stroke();
    const drawn=drawSpriteCentered(ctx,'hammerfallMissile',m.x,m.y,28,14,{
      rotation:a,
      glowColor:m.phase==='launch'?'#ffcc4d':'#ff9f43',
      glowBlur:14
    });
    if(!drawn){
      ctx.translate(m.x,m.y);
      ctx.rotate(a);
      ctx.shadowColor=m.phase==='launch'?'#ffcc4d':'#ff9f43';
      ctx.shadowBlur=14;
      ctx.fillStyle='#ffdd80';
      ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(-8,-4.5); ctx.lineTo(-4,0); ctx.lineTo(-8,4.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(255,110,60,0.95)';
      ctx.beginPath(); ctx.arc(-11,0,3.8,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
}

function drawWardenDrones(g){
  for(const d of g.wardenDrones){
    ctx.save();
    ctx.translate(d.x,d.y);
    const a=Math.atan2(d.vy,d.vx || 1);
    ctx.rotate(a);
    const sprite = getSprite('wardenDrone');
    if(sprite){
      ctx.shadowColor='#d6a2ff'; ctx.shadowBlur=15;
      ctx.drawImage(sprite,-14,-14,28,28);
      ctx.shadowBlur=0;
      ctx.restore();
      continue;
    }
    ctx.shadowColor='#d6a2ff'; ctx.shadowBlur=15;
    ctx.fillStyle='#b46bff';
    ctx.beginPath();
    ctx.roundRect(-10,-7,20,14,5);
    ctx.fill();
    ctx.fillStyle='#f6e8ff';
    ctx.beginPath(); ctx.arc(3,-2,2.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.65)';
    ctx.fillRect(8,-2,9,4);
    ctx.shadowBlur=0;
    ctx.restore();
  }
}

function drawSifterDrones(g){
  for(const sw of g.sifterDrones){
    ctx.save();
    ctx.translate(sw.x,sw.y);
    const a=Math.atan2(sw.vy,sw.vx || 1);
    ctx.rotate(a);
    const sprite = getSprite('sifterDrone');
    if(sprite){
      ctx.shadowColor='#7df9ff'; ctx.shadowBlur=14;
      ctx.drawImage(sprite,-15,-15,30,30);
      ctx.shadowBlur=0;
      ctx.restore();
      continue;
    }
    ctx.shadowColor='#7df9ff'; ctx.shadowBlur=14;
    ctx.fillStyle='#30d7ff';
    ctx.beginPath();
    ctx.roundRect(-11,-6,22,12,6);
    ctx.fill();
    ctx.strokeStyle='rgba(220,255,255,0.9)';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.arc(-2,0,9,Math.PI*0.25,Math.PI*1.75);
    ctx.stroke();
    ctx.fillStyle='#eaffff';
    ctx.beginPath(); ctx.arc(5,-1,2.4,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(125,249,255,0.30)';
    ctx.beginPath(); ctx.arc(0,0,18+Math.sin(g.time*8+sw.phase)*2,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur=0;
    ctx.restore();
  }
}
function drawTraps(g){
  for(const tr of g.traps){
    const pulse = 0.5 + 0.5*Math.sin(g.time*7 + tr.age*3);
    ctx.save();
    ctx.translate(tr.x,tr.y);
    ctx.strokeStyle=tr.armed ? `rgba(255,204,77,${0.35+0.35*pulse})` : 'rgba(160,160,160,0.45)';
    ctx.fillStyle=tr.armed ? 'rgba(255,204,77,0.16)' : 'rgba(120,120,120,0.13)';
    ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(0,0,tr.triggerR,0,Math.PI*2); ctx.stroke();
    const drawn=drawSpriteCentered(ctx,'pathfinderTrap',0,0,34,34,{
      rotation:tr.age*0.35,
      alpha:tr.armed ? 1 : 0.62,
      glowColor:tr.armed ? '#ffcc4d' : null,
      glowBlur:tr.armed ? 10 : 0
    });
    if(!drawn){
      ctx.beginPath(); ctx.arc(0,0,11+2*pulse,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#ffcc4d';
      ctx.fillRect(-6,-2,12,4);
      ctx.fillRect(-2,-6,4,12);
    }
    ctx.restore();
  }
}

function drawBoomerangs(g){
  for(const b of g.boomerangs){
    ctx.save();
    ctx.translate(b.x,b.y);
    ctx.rotate(b.spin);
    ctx.strokeStyle=b.color;
    ctx.fillStyle='rgba(255,211,107,0.18)';
    ctx.shadowColor=b.color; ctx.shadowBlur=14;
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(-10,-6);
    ctx.quadraticCurveTo(0,-16,10,-6);
    ctx.quadraticCurveTo(0,-2,-10,-6);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10,6);
    ctx.quadraticCurveTo(0,16,-10,6);
    ctx.quadraticCurveTo(0,2,10,6);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur=0;
    ctx.restore();
  }
}
function drawPickups(g){
  for(const it of g.pickups){
    const res = it.type==='xp' ? MINERALS.echo : MINERALS[it.type];
    const spriteId = res?.sprite;
    const color = res?.color || (it.type==='xp'?'#42d6ff':'#ff5b5b');
    const bob = Math.sin((game?.time||0)*6 + it.x*0.01)*1.5;
    if(spriteId && drawSpriteCentered(ctx,spriteId,it.x,it.y+bob,it.r*3.0,it.r*3.0,{
      glowColor:color,
      glowBlur:8
    })){
      continue;
    }
    ctx.fillStyle=color;
    ctx.shadowColor=ctx.fillStyle; ctx.shadowBlur=10;
    ctx.beginPath(); ctx.moveTo(it.x,it.y-it.r); ctx.lineTo(it.x+it.r,it.y); ctx.lineTo(it.x,it.y+it.r); ctx.lineTo(it.x-it.r,it.y); ctx.closePath(); ctx.fill(); ctx.shadowBlur=0;
  }
}

function drawParticles(g){
  for(const p of g.particles){
    const alpha=clamp(p.life/p.maxLife,0,1);
    ctx.globalAlpha=alpha;
    if(p.shape==='ring'){
      ctx.strokeStyle=p.color;
      ctx.lineWidth=(p.lineWidth || 4) * Math.max(0.25, alpha);
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.stroke();
      continue;
    }
    if(p.shape==='fragment'){
      const angle=Math.atan2(p.vy,p.vx)+p.life*6;
      if(drawSpriteCentered(ctx,'lavaFragmentDebris',p.x,p.y,p.size*2.4,p.size*2.4,{rotation:angle,alpha,glowColor:p.color,glowBlur:4})) continue;
    }
    if(p.shape==='spark'){
      ctx.strokeStyle=p.color;
      ctx.lineWidth=Math.max(1, p.size*0.45);
      ctx.beginPath();
      ctx.moveTo(p.x-p.vx*0.010, p.y-p.vy*0.010);
      ctx.lineTo(p.x+p.vx*0.016, p.y+p.vy*0.016);
      ctx.stroke();
      continue;
    }
    ctx.fillStyle=p.color;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha=1;
}
function drawArcs(g){
  for(const a of g.arcs){
    const alpha=clamp(a.life/a.maxLife,0,1);
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.strokeStyle=a.color;
    ctx.shadowColor=a.color;
    ctx.shadowBlur=14;
    ctx.lineWidth=(a.width || 3) * Math.max(0.35, alpha);
    ctx.beginPath();
    const segments=7;
    for(let i=0;i<=segments;i++){
      const t=i/segments;
      const x=lerp(a.x1,a.x2,t)+rand(-7,7)*(1-Math.abs(0.5-t)*1.6);
      const y=lerp(a.y1,a.y2,t)+rand(-7,7)*(1-Math.abs(0.5-t)*1.6);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.lineWidth=1;
    ctx.strokeStyle='rgba(235,255,255,0.95)';
    ctx.stroke();
    ctx.restore();
  }
}
function drawTexts(g){
  ctx.font='bold 14px Segoe UI, Arial'; ctx.textAlign='center';
  for(const t of g.texts){
    ctx.globalAlpha=clamp(t.life/t.maxLife,0,1); ctx.fillStyle=t.color; ctx.fillText(t.text,t.x,t.y);
  }
  ctx.globalAlpha=1;
}

function drawFogOfWar(g,cam,sx=0,sy=0){
  const settings=getFogSettings();
  if(!settings.fogOfWarEnabled || !g?.player) return;

  // Keep the first implementation cheap: one full-screen radial gradient. If
  // adaptive performance is under pressure, avoid extra texture/noise work and
  // simply draw the soft radial overlay.
  const p=g.player;
  const cx=p.x-cam.x+sx;
  const cy=p.y-cam.y+sy;
  const radius=settings.fogOfWarRadius;
  const soft=settings.fogOfWarSoftEdge;
  const outer=radius+soft;
  const intensity=clamp(settings.fogOfWarIntensity,0,0.95);
  const perf=g.performance?.state;
  const perfTrim=perf===PERF_STATES.CRITICAL ? 0.92 : perf===PERF_STATES.WARNING ? 0.97 : 1;
  const outerAlpha=intensity*perfTrim;

  const gradient=ctx.createRadialGradient(cx,cy,Math.max(1,radius*0.35),cx,cy,outer);
  gradient.addColorStop(0,'rgba(0,0,0,0)');
  gradient.addColorStop(Math.max(0.05, radius/outer),'rgba(3,8,16,0.02)');
  gradient.addColorStop(Math.min(0.98,(radius+soft*0.55)/outer),`rgba(3,8,16,${outerAlpha*0.50})`);
  gradient.addColorStop(1,`rgba(0,0,0,${outerAlpha})`);

  ctx.save();
  ctx.fillStyle=gradient;
  ctx.fillRect(0,0,innerWidth,innerHeight);

  // Atmospheric soft blue rim around the visibility boundary. This is a single
  // stroke and remains performance-safe.
  ctx.globalAlpha=0.16;
  ctx.strokeStyle='rgba(66,214,255,0.42)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.arc(cx,cy,radius+soft*0.24,0,Math.PI*2);
  ctx.stroke();
  ctx.restore();
}

function drawFogDebugOverlay(g,cam,sx=0,sy=0){
  if(!g.debug?.showFogRadius || !g?.player) return;
  const settings=getFogSettings();
  const cx=g.player.x-cam.x+sx;
  const cy=g.player.y-cam.y+sy;
  ctx.save();
  ctx.strokeStyle='rgba(93,255,154,0.85)';
  ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(cx,cy,settings.fogOfWarRadius,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle='rgba(66,214,255,0.55)';
  ctx.setLineDash([8,6]);
  ctx.beginPath(); ctx.arc(cx,cy,settings.fogOfWarRadius+settings.fogOfWarSoftEdge,0,Math.PI*2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,255,255,0.86)';
  ctx.font='bold 12px Segoe UI, Arial';
  ctx.textAlign='left';
  ctx.fillText(`Fog ${settings.fogOfWarEnabled?'ON':'OFF'} · R ${settings.fogOfWarRadius} · Soft ${settings.fogOfWarSoftEdge}`,cx+18,cy-settings.fogOfWarRadius-12);
  ctx.restore();
}

function drawVignette(){
  const grd=ctx.createRadialGradient(innerWidth/2,innerHeight/2,innerHeight*0.15,innerWidth/2,innerHeight/2,innerWidth*0.72);
  grd.addColorStop(0,'rgba(0,0,0,0)'); grd.addColorStop(1,'rgba(0,0,0,0.58)');
  ctx.fillStyle=grd; ctx.fillRect(0,0,innerWidth,innerHeight);
}

function drawEnemyBudgetOverlay(g){
  if(!g.debug?.showEnemyBudget || !g.performance) return;
  const p=g.performance;
  ctx.save();
  ctx.font='12px Consolas, monospace';
  ctx.textAlign='left';
  ctx.fillStyle='rgba(0,0,0,0.68)';
  ctx.fillRect(14, innerHeight-170, 310, 144);
  ctx.fillStyle='#d7ecff';
  const lines=[
    `FPS ${p.currentFPS.toFixed(1)}  AVG ${p.averageFPS.toFixed(1)}  ${p.state.replace('PERF_','')}`,
    `Enemies ${g.enemies.length}/${g.enemyBudget.currentMaxEnemies}  Bullets ${g.enemyBullets.length}/${getEnemyBulletCap(g)}`,
    `Spawn x${p.spawnRateMultiplier.toFixed(2)}  Swarm x${p.swarmSizeMultiplier.toFixed(2)}`,
    `Budget ${p.budgetFactor.toFixed(2)}  VFX ${p.vfxFactor.toFixed(2)}`,
    `Skipped spawns ${p.skippedSpawns||0} bullets ${p.skippedBullets||0}`,
    `Perf despawned ${p.enemiesDespawned||0}`
  ];
  for(let i=0;i<lines.length;i++) ctx.fillText(lines[i],24,innerHeight-144+i*20);
  ctx.restore();
}

function drawPause(){
  ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,0,innerWidth,innerHeight);
  ctx.fillStyle='#fff'; ctx.font='900 42px Segoe UI'; ctx.textAlign='center'; ctx.fillText('PAUSED',innerWidth/2,innerHeight/2);
}

function gameOver(g){
  if(g.state==='dead') return;
  if(typeof failRun === 'function'){
    failRun(g,'Operator vitals collapsed before extraction.');
    return;
  }
  g.state='dead';
  sfx('gameover');
  ui.gameOverText.innerHTML=`You survived <b>${ui.timer.textContent}</b>, reached <b>Level ${g.level}</b>, mined <b>${g.gold} Gild Shards</b> and <b>${g.nitra} Voltarite</b>, and killed <b>${g.kills}</b> Hollowborn.`;
  ui.gameOverOverlay.classList.add('show');
}

function setupClassCards(){
  ui.classCards.innerHTML='';
  for(const cls of CLASSES){
    const div=document.createElement('div');
    div.className='card';
    div.dataset.classId=cls.id;
    div.setAttribute('role','button');
    div.setAttribute('tabindex','0');
    div.innerHTML=`<div class="icon">${cls.icon}</div><h3>${cls.name}</h3><p>${cls.desc}</p><span class="tag">${cls.tag}</span>`;
    ui.classCards.appendChild(div);
  }
}

function getClassById(id){
  return CLASSES.find(c=>c.id===id) || CLASSES[0];
}

function showDebugError(title, err){
  console.error(title, err);
  let box=document.getElementById('debugBox');
  if(!box){
    box=document.createElement('pre');
    box.id='debugBox';
    box.className='debugBox';
    document.body.appendChild(box);
  }
  const message = err && (err.stack || err.message) ? (err.stack || err.message) : String(err);
  box.textContent = `${title}\n\n${message}\n\nOpen the browser console with F12 for full details.`;
}

function startGame(clsOrId){
  try{
    startRunWithClass(clsOrId);
    const box=document.getElementById('debugBox');
    if(box) box.remove();
  }catch(err){
    showDebugError('Failed to start mission after class selection.', err);
  }
}

function bindStartCardInput(){
  ui.classCards.addEventListener('click', ev=>{
    const card=ev.target.closest('.card[data-class-id]');
    if(card) startGame(card.dataset.classId);
  });
  ui.classCards.addEventListener('keydown', ev=>{
    if(ev.code==='Enter' || ev.code==='Space'){
      const card=ev.target.closest('.card[data-class-id]');
      if(card){ ev.preventDefault(); startGame(card.dataset.classId); }
    }
  });
}

window.startGame=startGame;
window.restartGame=function(){ startGame(game?.selectedClass || CLASSES[0]); };
window.showStart=function(){ showClassSelect(); };


function drawControllerDebugOverlay(g){
  if(!g?.debug?.showController) return;
  const lines=[
    `Gamepad: ${gamepadState.connected ? gamepadState.id : 'not connected'}`,
    `Left: ${Number(gamepadState.leftX||0).toFixed(2)}, ${Number(gamepadState.leftY||0).toFixed(2)}`,
    `Right raw 2/3: ${Number(gamepadState.rightX||0).toFixed(2)}, ${Number(gamepadState.rightY||0).toFixed(2)}`,
    `Cursor axis pair: ${game?.controllerCursor?.axisPair ? game.controllerCursor.axisPair.join('/') : 'none'}`,
    `Cursor: ${Math.round(mouse.x)}, ${Math.round(mouse.y)}`,
    `World: ${Math.round(mouseWorld(g).x)}, ${Math.round(mouseWorld(g).y)}`,
    `Manual aim: ${manualAimActive(g) ? 'ON' : 'AUTO'}`,
    `Upgrade index: ${g.upgradeMenuState?.selectedIndex ?? '-'}`,
    `Accuracy: ${Math.round((g.player.accuracy ?? 0.35)*100)}%`
  ];
  ctx.save();
  ctx.font='12px Consolas, Monaco, monospace';
  ctx.textAlign='left';
  const x=14, y=innerHeight-150;
  ctx.fillStyle='rgba(0,0,0,0.64)';
  ctx.fillRect(x-8,y-16,360,lines.length*16+18);
  ctx.fillStyle='#b7f7ff';
  for(let i=0;i<lines.length;i++) ctx.fillText(lines[i],x,y+i*16);
  ctx.restore();
}

function drawAccuracyCone(g){
  if(!g?.debug?.showAccuracyCone || !g.player) return;
  const p=g.player;
  const target=nearestEnemy(g,p.x,p.y,720);
  if(!target) return;
  const spread=weaponSpreadRadians(p.accuracy ?? 0.35);
  const base=Math.atan2(target.y-p.y,target.x-p.x);
  const length=360;
  ctx.save();
  ctx.translate(-g.camera.x,-g.camera.y);
  ctx.strokeStyle='rgba(255,220,128,0.55)';
  ctx.fillStyle='rgba(255,220,128,0.08)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(p.x,p.y);
  ctx.lineTo(p.x+Math.cos(base-spread)*length,p.y+Math.sin(base-spread)*length);
  ctx.arc(p.x,p.y,length,base-spread,base+spread);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
