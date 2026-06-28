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
  // Phase 1.5: Operator level chip
  const cls = CLASSES.find(c => c.id === g.player.classId);
  const opData = saveProfile?.operatorData?.[g.player.classId];
  const operatorChip = opData ? `<div class="chip"><span>✦ ${cls?.name || g.player.classId} Lv.${opData.level}</span><b>${Math.floor(opData.xp)}/${opData.xpToNext}</b></div>` : '';
  const trapChip = g.player.canUseTraps ? `<div class="chip"><span>Pathfinder Trap Kit</span><b>${g.player.trapCd<=0?'READY':'CD '+g.player.trapCd.toFixed(1)+'s'}</b></div>` : '';
  const accChip = `<div class="chip"><span>Weapon Accuracy</span><b>${Math.round((g.player.accuracy ?? 0.35)*100)}%</b></div>`;
  const cursorChip = (g.player.mouseTargeting || g.controllerCursor?.active) ? `<div class="chip"><span>Targeting Cursor</span><b>${manualAimActive(g)?'MANUAL':'AUTO'}</b></div>` : '';
  const arc = g.arcConnection;
  const arcChip = arc?.unlocked
    ? `<div class="chip"><span>Arc Connection</span><b>${arc.selectedEnemies.length}/${arcConnectionMaxTargets(g)}</b></div>`
    : "";
  // ── NEW ── Vampire stack value chip
  const vampireChip = (g.player.vampire > 0)
  ? `<div class="chip"><span>❤️ Field Reclaimer</span><b>${g.player.vampire} HP (${g.player.vampCounter}/18 kills)</b></div>`
  : '';
  // Prepend operator chip to weapon list
  ui.weaponList.innerHTML=operatorChip + g.weapons.map(w=>{
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
  const objectiveChips=(typeof renderObjectiveChips==='function') ? renderObjectiveChips(g) : g.objectives.map(o=>`<div class="chip objective ${o.completed?'done':''}"><span>${o.displayName}</span><b>${Math.floor(o.currentAmount)}/${o.targetAmount}</b></div>`).join('');
  const bossChip=g.bossDefeated ? '<div class="chip unlocked"><span>Sector Boss</span><b>DEFEATED</b></div>' : (g.bossSpawned ? '<div class="chip unlocked"><span>Sector Boss</span><b>ACTIVE</b></div>' : '<div class="chip locked"><span>Sector Boss</span><b>LOCKED</b></div>');
  const extractionChip=g.extraction ? `<div class="chip danger"><span>Extraction</span><b>${Math.max(0,g.extractionTimer).toFixed(1)}s</b></div>` : '';
  const missionChip=`<div class="chip"><span>Mission ${g.missionIndex}</span><b>Run ${g.runIndex}/${RUNS_PER_MISSION}</b></div>`;
  // Phase 1.2: mission-type chip.
  let missionTypeChip='';
  if(g.missionType && typeof MISSION_TYPES !== 'undefined'){
    const mt=MISSION_TYPES.find(m=>m.id===g.missionType);
    if(mt){
      const colors={hunt:'#ff5b5b',survey:'#42d6ff',harvest:'#ffcc4d',holdout:'#b46bff'};
      const c=colors[mt.id]||'#95a2ba';
      missionTypeChip=`<div class="chip" style="border-color:${c};color:${c}"><span>${mt.icon} ${mt.name}</span><b>+${Math.round((mt.rewardModifier-1)*100)}%</b></div>`;
    }
  }
  ui.logList.innerHTML=missionTypeChip + missionChip + pressureChip + perfChip + resourceChips + objectiveChips + bossChip + extractionChip + g.log.slice(0,3).map((m,i)=>`<div class="chip"><span>${m}</span><b>${i===0?'NEW':''}</b></div>`).join('');
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
  drawExtractionPath(g);
  drawPickups(g);
  drawTargetLocks(g);
  drawMissiles(g);
  drawBorecasterBombs(g);
  drawEnemyBoomerangs(g);
  drawEnemyBullets(g);
  drawBullets(g);
  drawBoomerangs(g);
  drawArcConnection(g);
  drawEnemies(g);
  drawEnemyPaths(g);
  drawChargingWaveWorldDebug(g);
  drawWardenDrones(g);
  drawSifterDrones(g);
  drawPlayer(g);
  drawThermalLanceCone(g);
  drawMiningDebug(g);
  drawScaledTileDebug(g,cam);
  drawParticles(g);
  drawArcs(g);
  drawTargetingCursor(g);
  drawTexts(g);
  // Phase 2.2: boss weak point overlay and crystal rain indicators (world-space)
  drawWeakPointHighlight(g);
  drawBossCrystalRainIndicators(g);
  ctx.restore();
  // Phase 2.2: boss health bar and name display (screen-space)
  drawBossHealthBar(g);
  drawBossName(g);
  // Auto-hide right panel if the player is underneath it
  updateRightPanelVisibility(g);
  drawFogOfWar(g,cam,sx,sy);
  drawVignette();
  drawChargingWaveScreenOverlay(g);
  drawFogDebugOverlay(g,cam,sx,sy);
  drawEnemyBudgetOverlay(g);
  drawControllerDebugOverlay(g);
  drawTileScaleInfoOverlay(g);
  drawAccuracyCone(g);
  if(paused) drawPause();
}

/*
 * Auto-hide the right panel when the player character moves underneath it.
 *
 * Converts the player's world position to screen coordinates, then checks
 * whether that point overlaps the right panel's bounding box (with a 25px
 * buffer so the fade starts before the player reaches the edge).
 * If overlapping, adds the 'faded' class (opacity ~0.12); otherwise removes it.
 *
 * Called every frame from render().
 */
function updateRightPanelVisibility(g){
  if(!g || !g.player || !ui.rightbar) return;
  const p = g.player;
  const cam = g.camera;

  // Project player world position to screen coordinates
  const screenX = p.x - cam.x;
  const screenY = p.y - cam.y;

  // Get right panel bounding box with 25px buffer
  const rect = ui.rightbar.getBoundingClientRect();
  const buffer = 25;
  const panelLeft = rect.left - buffer;
  const panelRight = rect.right + buffer;
  const panelTop = rect.top - buffer;
  const panelBottom = rect.bottom + buffer;

  // Check overlap
  const overlaps = screenX >= panelLeft && screenX <= panelRight &&
                   screenY >= panelTop && screenY <= panelBottom;

  ui.rightbar.classList.toggle('faded', overlaps);
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

  // Determine which operator sprite to use based on classId
  const cls = CLASSES.find(c => c.id === p.classId);
  const spriteId = cls?.spriteId || null;
  const size = 60;

  if(spriteId){
    const drawn = drawSpriteCentered(ctx, spriteId, 0, 0, size, size, {
      rotation: 0,
      alpha: p.iframes > 0 ? 0.65 : 1,
      glowColor: '#42d6ff',
      glowBlur: 10
    });
    if(drawn){
      ctx.restore();
      return;
    }
  }

  // Procedural fallback (identical to original)
  ctx.shadowColor='#42d6ff'; ctx.shadowBlur=8;
  ctx.fillStyle=p.iframes>0?'rgba(255,255,255,0.85)':'#4fa3ff';
  ctx.beginPath(); ctx.roundRect(-15,-12,30,24,7); ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='#f5c16c'; ctx.fillRect(-4,-18,10,10);
  ctx.fillStyle='#222'; ctx.fillRect(2,-8,20,5);
  ctx.fillStyle='#ffcc4d'; ctx.fillRect(-12,11,8,6);
  ctx.restore();
}

function drawThermalLanceCone(g){
  const p = g.player;
  const w = g.weapons.find(w => w.id === 'flamer');
  if(!w || w.cd > 0.05) return;

  // Check if we have a target OR active fire input
  const e = targetEnemy(g, 250, 130);
  const isFiring = mouse.down || (g.controllerCursor?.primaryHoldTimer || 0) > 0;
  if(!e && !isFiring) return;

  // ── Angle calculation ──
  let angle;
  if(e){
    angle = Math.atan2(e.y - p.y, e.x - p.x);
  } else {
    const aim = manualAimPoint(g);
    angle = Math.atan2(aim.y - p.y, aim.x - p.x);
  }

  const range = 210 + w.level * 18;
  const coneHalf = 0.45 + w.level * 0.04;

  ctx.save();
  ctx.translate(p.x, p.y);

  // ── Cone Fill ──
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, range);
  gradient.addColorStop(0, 'rgba(255, 180, 50, 0.25)');
  gradient.addColorStop(0.4, 'rgba(255, 120, 30, 0.20)');
  gradient.addColorStop(0.8, 'rgba(255, 80, 20, 0.12)');
  gradient.addColorStop(1, 'rgba(255, 40, 10, 0.0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, range, angle - coneHalf, angle + coneHalf);
  ctx.closePath();
  ctx.fill();

  // ── Flame Sprites (use actual sprite IDs) ──
  const flameSprites = [
    'flameParticle01', 'flameParticle02', 'flameParticle03',
    'flameParticle04', 'flameParticle05', 'flameParticle06',
    'flameParticle07', 'flameParticle08', 'flameParticle09',
    'flameParticle10', 'flameParticle11', 'flameParticle12'
  ];

  for(let i = 0; i < 4; i++){
    const dist = rand(20, range * 0.75);
    const offA = angle + rand(-coneHalf, coneHalf);
    const spriteId = flameSprites[randi(0, flameSprites.length - 1)];
    const size = rand(16, 32);
    drawSpriteCentered(ctx, spriteId,
      Math.cos(offA) * dist,
      Math.sin(offA) * dist,
      size, size, {
        rotation: rand(0, Math.PI * 2),
        alpha: rand(0.15, 0.45),
        glowColor: '#ff8844',
        glowBlur: 6
      }
    );
  }

  // ── Cone Outline ──
  const pulse = 0.6 + 0.4 * Math.sin(g.time * 12);
  ctx.strokeStyle = `rgba(255, 160, 60, ${0.15 + 0.1 * pulse})`;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, range, angle - coneHalf, angle + coneHalf);
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Heat Ripple ──
  for(let i = 1; i <= 3; i++){
    const r = (range / 3) * i;
    const alpha = 0.06 + 0.04 * Math.sin(g.time * 8 + i * 1.5);
    ctx.strokeStyle = `rgba(255, 200, 100, ${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, angle - coneHalf * 0.8, angle + coneHalf * 0.8);
    ctx.stroke();
  }

  // ── Sparks ──
  if(Math.random() < 0.6){
    const dist = rand(10, range);
    const offAngle = angle + rand(-coneHalf, coneHalf);
    addParticle(g,
      Math.cos(offAngle) * dist,
      Math.sin(offAngle) * dist,
      Math.cos(offAngle + rand(-0.2, 0.2)) * rand(20, 80),
      Math.sin(offAngle + rand(-0.2, 0.2)) * rand(20, 80),
      rand(0,1) > 0.5 ? '#ff8844' : '#ffcc66',
      rand(0.06, 0.15),
      rand(1.5, 3.5),
      'spark'
    );
  }

  ctx.restore();
}


function enemyRenderTransform(g,e,cfg,warning=false){
  const style=e.rotationStyle || cfg.rotationStyle || 'wobble';
  const base=(e.visualRotation || 0) + (e.visualRotationSpeed || 0)*g.time;
  const wobble=Math.sin(g.time*(e.visualWobbleSpeed || 2.5) + (e.visualPhase || e.phase || 0)) * (e.visualWobbleAmount || 0);
  const warningTwist=warning ? Math.sin(g.time*24 + e.phase)*0.18 : 0;
  const scale=1 + Math.sin(g.time*(e.visualScaleSpeed || 1.5) + (e.visualPhase || 0))*(e.visualScalePulse || 0);
  return { rotation:base+wobble+warningTwist, scale:scale*(e.visualScaleMul || 1) };
}

function drawEnemies(g){
  for(const e of g.enemies){
    ctx.save();
    let shakeX=0, shakeY=0;
    if((ENEMY_TYPES[e.type]?.behavior || e.behavior) === 'hexBoomerangDetonator' && e.detonationStarted){
      const amp=e.shakeAmount || 4;
      shakeX=rand(-amp,amp); shakeY=rand(-amp,amp);
    }
    ctx.translate(e.x+shakeX,e.y+shakeY);

    const cfg = ENEMY_TYPES[e.type] || {};
    const isHexLike = (cfg.behavior || e.behavior) === 'hexBoomerangDetonator';
    const warning = isHexLike && e.detonationStarted;
    const pulse = 0.5 + 0.5*Math.sin(g.time*(warning?18:6)+e.phase);
    let spriteDrawn=false;

    // Enemy sprites are purely visual. If any sprite is missing, the existing
    // procedural fallback below still renders the enemy safely. New enemy-pack
    // enemies all flow through cfg.spriteId so future sprite swaps are data-only.
    const spriteId = e.spriteId || cfg.spriteId;
    if(spriteId){
      const role = cfg.role || e.role || 'normal';
      const baseScale = role==='boss' ? 3.25 : role==='elite' ? 3.15 : 3.05;
      const minSize = role==='boss' ? 110 : role==='elite' ? 64 : 44;
      const tr=enemyRenderTransform(g,e,cfg,warning);
      const size = Math.max(minSize, e.r*baseScale) * (warning ? 1+0.08*pulse : 1) * tr.scale;
      spriteDrawn = drawSpriteCentered(ctx,spriteId,0,0,size,size,{
        rotation:tr.rotation,
        alpha: e.hitFlash>0 ? 0.72 : (cfg.behavior==='riftStalker'?0.82:1),
        glowColor: warning ? '#ff3d22' : e.color,
        glowBlur: warning ? 24 : (role==='boss'?26:(role==='elite'?16:8))
      });
      if(spriteDrawn && warning){
        drawSpriteCentered(ctx,cfg.warningSpriteId || 'hexShardWarningGlow',0,0,size*1.35,size*1.35,{
          rotation: -g.time*1.6,
          alpha: 0.38+0.50*pulse,
          glowColor:'#ff7038',
          glowBlur:28
        });
        ctx.strokeStyle=`rgba(255,72,40,${0.42+0.42*pulse})`;
        ctx.lineWidth=3;
        ctx.beginPath(); ctx.arc(0,0,70+8*pulse,0,Math.PI*2); ctx.stroke();
      }
    }

    if(!spriteDrawn){
      const tr=enemyRenderTransform(g,e,cfg,warning);
      ctx.save();
      ctx.rotate(tr.rotation);
      ctx.scale(tr.scale,tr.scale);
      if((ENEMY_TYPES[e.type]?.behavior || e.behavior) === 'hexBoomerangDetonator'){
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
        const fallbackRole=ENEMY_TYPES[e.type]?.role || e.role || 'normal';
        ctx.shadowColor=e.color; ctx.shadowBlur=fallbackRole==='boss'?28:(fallbackRole==='elite'?18:6);
        ctx.beginPath();
        for(let i=0;i<8;i++){
          const a=i*Math.PI*2/8;
          const rr=e.r*(i%2?0.82:1.08);
          ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);
        }
        ctx.closePath(); ctx.fill(); ctx.shadowBlur=0;
      }
      ctx.restore();
    }

    ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(-e.r,-e.r-10,e.r*2,4);
    ctx.fillStyle='#ff5b5b'; ctx.fillRect(-e.r,-e.r-10,e.r*2*clamp(e.hp/e.maxHp,0,1),4);
    if((ENEMY_TYPES[e.type]?.role || e.role)==='boss'){
      ctx.strokeStyle='rgba(255,255,255,0.75)';
      ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(0,0,e.r+8+Math.sin(g.time*5)*3,0,Math.PI*2); ctx.stroke();
    }
    if(e.isChargingWaveEnemy && (g.debug?.showChargingWaveTriggerRadius || g.debug?.showChargingWaveDamageRadius)){
      ctx.shadowBlur=0;
      if(g.debug.showChargingWaveTriggerRadius){
        ctx.strokeStyle='rgba(255,228,90,0.55)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.arc(0,0,e.explosionTriggerRadius || 55,0,Math.PI*2); ctx.stroke();
      }
      if(g.debug.showChargingWaveDamageRadius){
        ctx.strokeStyle='rgba(255,112,56,0.36)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.arc(0,0,e.explosionRadius || 95,0,Math.PI*2); ctx.stroke();
      }
    }
    if(g.debug?.showHexRanges && (ENEMY_TYPES[e.type]?.behavior || e.behavior)==='hexBoomerangDetonator'){
      ctx.shadowBlur=0;
      ctx.strokeStyle='rgba(255,112,56,0.32)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(0,0,70,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle='rgba(255,200,80,0.18)';
      ctx.beginPath(); ctx.arc(0,0,420,0,Math.PI*2); ctx.stroke();
    }
    ctx.restore();
  }
}


function drawChargingWaveWorldDebug(g){
  if(!g?.chargingWave) return;
  const cw=g.chargingWave;
  ctx.save();
  if(g.debug?.showChargingWaveSpawnDirection && cw.lastSpawnCenter){
    ctx.strokeStyle='rgba(255,112,56,0.72)';
    ctx.lineWidth=3;
    ctx.setLineDash([10,7]);
    ctx.beginPath(); ctx.moveTo(cw.lastSpawnCenter.x,cw.lastSpawnCenter.y); ctx.lineTo(g.player.x,g.player.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,112,56,0.95)';
    ctx.beginPath(); ctx.arc(cw.lastSpawnCenter.x,cw.lastSpawnCenter.y,8,0,Math.PI*2); ctx.fill();
  }
  if(g.debug?.showChargingWaveFormationTargets){
    const targets=[];
    for(const e of g.enemies||[]) if(e.isChargingWaveEnemy && e.formationTarget) targets.push(e.formationTarget);
    if(!targets.length && cw.lastFormationTargets) targets.push(...cw.lastFormationTargets);
    ctx.fillStyle='rgba(255,228,90,0.82)';
    ctx.strokeStyle='rgba(255,112,56,0.38)';
    for(const t of targets){ ctx.beginPath(); ctx.arc(t.x,t.y,3.4,0,Math.PI*2); ctx.fill(); }
  }
  ctx.restore();
}

function drawChargingWaveScreenOverlay(g){
  const cw=g?.chargingWave;
  if(!cw) return;
  const warning=cw.warningActive && cw.warningTimer>0;
  const alive=(g.enemies||[]).filter(e=>e.isChargingWaveEnemy && e.hp>0).length;
  if(!warning && alive<=0) return;
  ctx.save();
  const pulse=0.5+0.5*Math.sin((g.time||0)*14);
  if(warning){
    const alpha=0.16+0.13*pulse;
    ctx.fillStyle=`rgba(255,72,32,${alpha})`;
    ctx.fillRect(0,0,innerWidth,innerHeight);
    ctx.font='900 34px Segoe UI, Arial';
    ctx.textAlign='center';
    ctx.fillStyle=`rgba(255,240,210,${0.80+0.20*pulse})`;
    ctx.shadowColor='#ff3d22'; ctx.shadowBlur=18;
    ctx.fillText('CHARGING WAVE INCOMING!',innerWidth/2,112);
    ctx.font='700 15px Segoe UI, Arial';
    ctx.fillText(`${Math.max(0,cw.warningTimer).toFixed(1)}s · Dodge the Rift Chargers`,innerWidth/2,140);
  }
  // Directional incoming arrow is visible even when fog hides the enemies.
  const a=cw.incomingDirection || 0;
  const cx=innerWidth/2 + Math.cos(a)*Math.min(innerWidth,innerHeight)*0.34;
  const cy=innerHeight/2 + Math.sin(a)*Math.min(innerWidth,innerHeight)*0.34;
  ctx.translate(cx,cy);
  ctx.rotate(a+Math.PI);
  ctx.fillStyle=`rgba(255,112,56,${0.55+0.35*pulse})`;
  ctx.strokeStyle='rgba(255,245,210,0.88)';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(0,-24); ctx.lineTo(38,0); ctx.lineTo(0,24); ctx.lineTo(10,7); ctx.lineTo(-36,7); ctx.lineTo(-36,-7); ctx.lineTo(10,-7);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
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

/*
 * drawExtractionPath — glowing dashed path from player to extraction craft.
 * Checks line-of-sight per segment; falls back to a "go around" indicator
 * when terrain blocks the direct line.
 */
function drawExtractionPath(g){
  if(!g.extraction || !g.player) return;
  const p = g.player;
  const ex = g.extraction;
  const pulse = 0.6 + 0.4 * Math.sin(g.time * 6);
  const color = `rgba(255,204,77,${0.55 * pulse})`;
  const glowColor = `rgba(255,204,77,${0.25 * pulse})`;

  // Step along the line from player to extraction in ~TILE-sized steps
  const dx = ex.x - p.x;
  const dy = ex.y - p.y;
  const dist = Math.hypot(dx, dy);
  if(dist < 20) return;

  const steps = Math.max(2, Math.ceil(dist / (TILE * 0.7)));
  let blocked = false;
  let lastClearX = p.x, lastClearY = p.y;

  // Sample points along the line to check for solid tiles
  for(let i = 1; i <= steps; i++){
    const t = i / steps;
    const sx = p.x + dx * t;
    const sy = p.y + dy * t;
    const [tx, ty] = worldToTile(sx, sy);
    if(isSolid(tileAt(g, tx, ty))){
      blocked = true;
      break;
    }
    lastClearX = sx;
    lastClearY = sy;
  }

  ctx.save();

  if(!blocked){
    // ── Direct clear path — draw pulsing dotted line ──────────────
    ctx.shadowColor = '#ffcc4d';
    ctx.shadowBlur = 14 * pulse;
    ctx.setLineDash([6, 10]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(ex.x, ex.y);
    ctx.stroke();

    // Second pass: wider fainter glow line
    ctx.shadowBlur = 28;
    ctx.lineWidth = 7;
    ctx.strokeStyle = glowColor;
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(ex.x, ex.y);
    ctx.stroke();

  } else {
    // ── Blocked path — draw to last clear point, then "go around" ─
    ctx.shadowColor = '#ff8844';
    ctx.shadowBlur = 8;
    ctx.setLineDash([4, 10]);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = `rgba(255,136,68,${0.6 * pulse})`;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(lastClearX, lastClearY);
    ctx.stroke();

    // Dashed continuation hint
    ctx.setLineDash([2, 14]);
    ctx.strokeStyle = `rgba(255,136,68,${0.3 * pulse})`;
    ctx.beginPath();
    ctx.moveTo(lastClearX, lastClearY);
    ctx.lineTo(lastClearX + (ex.x - lastClearX) * 0.3, lastClearY + (ex.y - lastClearY) * 0.3);
    ctx.stroke();

    // "Go around" indicator at the blocked point
    ctx.shadowBlur = 12;
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(255,200,100,${0.5 + 0.5 * pulse})`;
    ctx.font = 'bold 18px Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚠', lastClearX, lastClearY - 12);
  }

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
    if(g.debug.showEnemyPathingRadius){
      ctx.strokeStyle='rgba(255,255,255,0.24)';
      ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(e.x,e.y,e.pathingRadius || e.r,0,Math.PI*2); ctx.stroke();
    }
    if(g.debug.showRawEnemyPaths && e.rawPath && e.rawPath.length){
      ctx.strokeStyle='rgba(255,112,56,0.50)';
      ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(e.x,e.y);
      for(const p of e.rawPath) ctx.lineTo(p.x,p.y);
      ctx.stroke();
    }
    if(!e.path || e.pathIndex>=e.path.length) continue;
    ctx.strokeStyle=g.debug.showSmoothedEnemyPaths!==false ? 'rgba(93,255,154,0.58)' : 'rgba(93,255,154,0.32)';
    ctx.lineWidth=2.25;
    ctx.beginPath();
    ctx.moveTo(e.x,e.y);
    for(let i=e.pathIndex;i<e.path.length;i++) ctx.lineTo(e.path[i].x,e.path[i].y);
    ctx.stroke();
    if(g.debug.showCornerCurvePoints!==false){
      for(const p of e.path){
        if(!p.curve && !p.corner) continue;
        ctx.fillStyle=p.corner?'rgba(255,228,90,0.95)':'rgba(255,228,90,0.65)';
        ctx.beginPath(); ctx.arc(p.x,p.y,p.corner?4:2.6,0,Math.PI*2); ctx.fill();
      }
      if(e.pathClearanceFailures){
        ctx.strokeStyle='rgba(255,60,80,0.92)'; ctx.lineWidth=2;
        for(const f of e.pathClearanceFailures){
          ctx.beginPath(); ctx.moveTo(f.x-6,f.y-6); ctx.lineTo(f.x+6,f.y+6); ctx.moveTo(f.x+6,f.y-6); ctx.lineTo(f.x-6,f.y+6); ctx.stroke();
        }
      }
    }
    const wp=e.path[e.pathIndex];
    ctx.fillStyle='rgba(66,214,255,0.85)';
    ctx.beginPath(); ctx.arc(wp.x,wp.y,4,0,Math.PI*2); ctx.fill();
    if(g.debug.showEnemyLookaheadTargets!==false && e.currentLookaheadTarget){
      ctx.fillStyle=e.currentLookaheadTarget.clearanceAdjusted?'rgba(255,120,255,0.95)':'rgba(90,170,255,0.95)';
      ctx.beginPath(); ctx.arc(e.currentLookaheadTarget.x,e.currentLookaheadTarget.y,5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(90,170,255,0.42)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(e.x,e.y); ctx.lineTo(e.currentLookaheadTarget.x,e.currentLookaheadTarget.y); ctx.stroke();
    }
    if(g.debug.showPathFollowingOverlay && e.closestPathPoint){
      ctx.fillStyle='rgba(255,228,90,0.96)';
      ctx.beginPath(); ctx.arc(e.closestPathPoint.x,e.closestPathPoint.y,4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,140,60,0.78)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(e.x,e.y); ctx.lineTo(e.closestPathPoint.x,e.closestPathPoint.y); ctx.stroke();
      if(e.pathTangent){
        ctx.strokeStyle='rgba(120,255,220,0.78)'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(e.closestPathPoint.x,e.closestPathPoint.y); ctx.lineTo(e.closestPathPoint.x+e.pathTangent.x*26,e.closestPathPoint.y+e.pathTangent.y*26); ctx.stroke();
      }
      if(e.desiredVelocity){
        ctx.strokeStyle='rgba(93,255,154,0.82)'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(e.x,e.y); ctx.lineTo(e.x+e.desiredVelocity.x*0.16,e.y+e.desiredVelocity.y*0.16); ctx.stroke();
      }
      if(g.debug.showOfftrackDistanceOverlay){
        ctx.fillStyle='rgba(255,255,255,0.92)';
        ctx.font='700 11px Segoe UI, Arial';
        ctx.textAlign='center';
        ctx.fillText(`${(e.offtrackDistance||0).toFixed(1)}px`, e.x, e.y-(e.r||12)-20);
        ctx.fillText(e.pathFollowMode||'path', e.x, e.y-(e.r||12)-8);
      }
    }
    if(g.debug.showPathClearanceOverlay && e.pathUnsafeSections){
      ctx.strokeStyle='rgba(255,55,75,0.92)'; ctx.lineWidth=2;
      for(const u of e.pathUnsafeSections){
        ctx.beginPath(); ctx.moveTo(u.x-7,u.y-7); ctx.lineTo(u.x+7,u.y+7); ctx.moveTo(u.x+7,u.y-7); ctx.lineTo(u.x-7,u.y+7); ctx.stroke();
      }
    }
    if(e.cornerFallbackTarget){
      ctx.strokeStyle='rgba(220,70,255,0.92)'; ctx.lineWidth=2;
      ctx.strokeRect(e.cornerFallbackTarget.tx*TILE+4,e.cornerFallbackTarget.ty*TILE+4,TILE-8,TILE-8);
    }
    if(e.tunnelCentreBias){
      ctx.strokeStyle='rgba(126,249,255,0.45)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(e.x,e.y); ctx.lineTo(e.x+e.tunnelCentreBias.x*22,e.y+e.tunnelCentreBias.y*22); ctx.stroke();
    }
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



function drawBorecasterBombs(g){
  for(const b of g.borecasterBombs || []){
    const fuseRatio=clamp((b.fuseTime || 0)/(b.maxFuseTime || 1),0,1);
    if(!b.grounded){
      const markerSize=(b.blastRadius || 90)*2;
      drawSpriteCentered(ctx,'borecasterBombLandingMarker',b.landingX,b.landingY,markerSize,markerSize,{alpha:0.16+0.10*Math.sin(g.time*8),rotation:g.time*0.5,glowColor:'#ffcc4d',glowBlur:8});
    }
    ctx.save();
    ctx.strokeStyle='rgba(255,204,77,0.30)';
    ctx.lineWidth=2;
    ctx.beginPath();
    for(let i=0;i<b.trail.length;i++){
      const t=b.trail[i];
      if(i===0) ctx.moveTo(t.x,t.y); else ctx.lineTo(t.x,t.y);
    }
    ctx.stroke();
    for(const t of b.trail){
      drawSpriteCentered(ctx,'borecasterBombThrowTrail',t.x,t.y,24,24,{alpha:clamp(t.life/0.18,0,1)*0.28,rotation:b.rotation,additive:true});
    }
    ctx.translate(b.x,b.y);
    const pulse=0.5+0.5*Math.sin(g.time*18 + b.age*4);
    const size=b.grounded ? 28+2*pulse : 25;
    const drawn=drawSpriteCentered(ctx,'borecasterBombLit',0,0,size,size,{rotation:b.rotation,glowColor:fuseRatio<0.35?'#ff3d22':'#ffcc4d',glowBlur:fuseRatio<0.35?22:12});
    if(!drawn){
      ctx.fillStyle=fuseRatio<0.35?'#ff7038':'#ffcc4d';
      ctx.strokeStyle='#2b1a10';
      ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.fill(); ctx.stroke();
    }
    drawSpriteCentered(ctx,'borecasterBombFuseSpark',5,-11,14+5*pulse,14+5*pulse,{alpha:0.72+0.28*pulse,rotation:g.time*8,glowColor:'#ffecb3',glowBlur:14,additive:true});
    ctx.strokeStyle=`rgba(255,204,77,${0.25+0.35*(1-fuseRatio)})`;
    ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(0,0,18, -Math.PI/2, -Math.PI/2 + Math.PI*2*(1-fuseRatio)); ctx.stroke();
    ctx.restore();
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
    // Phase 2.2: support custom boss projectile sprites
    let spriteId=b.spriteId || (b.destructive?'destructiveEnemyBullet':'enemyRedBullet');
    let size=b.spriteId ? b.r*2.2 : (b.destructive?24:(b.small?15:19));
    const drawn=drawSpriteCentered(ctx,spriteId,b.x,b.y,size,size,{
      rotation:angle,
      glowColor:b.color || '#ff3030',
      glowBlur:b.spriteId?14:(b.destructive?18:(b.small?8:12))
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
    if(it.type==='health'){
      const bob = Math.sin((game?.time||0)*6 + it.x*0.01)*1.5;
      const scale = 1 + Math.sin((game?.time||0)*5)*0.1;
      drawHeartShape(it.x, it.y+bob, it.r*2.5*scale, '#ff6b8f', '#ff3d5f');
      continue;
    }
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

function drawHeartShape(x, y, size, fillColor, outlineColor){
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 2;
  ctx.shadowColor = fillColor;
  ctx.shadowBlur = 12;
  const s = size;
  ctx.beginPath();
  ctx.moveTo(x, y + s*0.3);
  ctx.bezierCurveTo(x-s*0.5, y-s*0.3, x-s*0.8, y-s*0.1, x-s*0.5, y+s*0.4);
  ctx.bezierCurveTo(x, y+s*0.7, x+s*0.5, y+s*0.4, x+s*0.8, y-s*0.1);
  ctx.bezierCurveTo(x+s*0.5, y-s*0.3, x, y+s*0.3, x, y+s*0.3);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
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
    if(p.shape==='sprite' && p.spriteId){
      const prevComp = ctx.globalCompositeOperation;
      if(p.additive) ctx.globalCompositeOperation='lighter';
      const ok = drawSpriteCentered(ctx,p.spriteId,p.x,p.y,p.size,p.size,{
        rotation:p.rotation || 0,
        alpha:alpha * (p.alphaMul ?? 1),
        glowColor:p.glowColor || null,
        glowBlur:p.glowBlur || 0
      });
      ctx.globalCompositeOperation = prevComp;
      if(ok) continue;
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
    const iconHtml = cls.spriteId ? spriteIconHtml(cls.spriteId, cls.icon) : cls.icon;
    div.innerHTML=`<div class="icon">${iconHtml}</div><h3>${cls.name}</h3><p>${cls.desc}</p><span class="tag">${cls.tag}</span>`;
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



function drawScaledTileDebug(g,cam){
  if(!g?.debug?.showScaledTileGrid && !g?.debug?.showCollisionTiles) return;
  const minx=clamp(Math.floor(cam.x/TILE)-1,0,MAP_W-1), maxx=clamp(Math.ceil((cam.x+innerWidth)/TILE)+1,0,MAP_W-1);
  const miny=clamp(Math.floor(cam.y/TILE)-1,0,MAP_H-1), maxy=clamp(Math.ceil((cam.y+innerHeight)/TILE)+1,0,MAP_H-1);
  ctx.save();
  if(g.debug.showScaledTileGrid){
    ctx.strokeStyle='rgba(100,232,255,0.20)';
    ctx.lineWidth=1;
    for(let x=minx;x<=maxx+1;x++){
      ctx.beginPath(); ctx.moveTo(x*TILE,miny*TILE); ctx.lineTo(x*TILE,(maxy+1)*TILE); ctx.stroke();
    }
    for(let y=miny;y<=maxy+1;y++){
      ctx.beginPath(); ctx.moveTo(minx*TILE,y*TILE); ctx.lineTo((maxx+1)*TILE,y*TILE); ctx.stroke();
    }
  }
  if(g.debug.showCollisionTiles){
    for(let y=miny;y<=maxy;y++) for(let x=minx;x<=maxx;x++){
      const t=g.tiles[tileIdx(x,y)];
      if(!isSolid(t)) continue;
      ctx.strokeStyle=t===TILE_HARD?'rgba(255,255,255,0.35)':(t===TILE_LAVA_ROCK?'rgba(255,112,56,0.50)':'rgba(255,204,77,0.30)');
      ctx.lineWidth=2;
      ctx.strokeRect(x*TILE+2,y*TILE+2,TILE-4,TILE-4);
    }
  }
  ctx.restore();
}

function drawTileScaleInfoOverlay(g){
  if(!g?.debug?.showScaledTileGrid && !g?.debug?.showCollisionTiles) return;
  const [ptx,pty]=worldToTile(g.player.x,g.player.y);
  const nearest=g.enemies?.[0];
  const enemyTile=nearest ? worldToTile(nearest.x,nearest.y).join(',') : '-';
  const lines=[
    `Tile base: ${TILE_SIZE_BASE}px`,
    `Tile scale: ${TILE_SIZE_SCALE}x`,
    `Effective tile: ${TILE}px`,
    `Map pixels: ${WORLD_W} x ${WORLD_H}`,
    `Player tile: ${ptx},${pty}`,
    `First enemy tile: ${enemyTile}`
  ];
  ctx.save();
  ctx.font='12px Consolas, Monaco, monospace';
  ctx.textAlign='left';
  const x=14, y=innerHeight-258;
  ctx.fillStyle='rgba(0,0,0,0.66)';
  ctx.fillRect(x-8,y-16,260,lines.length*16+18);
  ctx.fillStyle='#b7f7ff';
  for(let i=0;i<lines.length;i++) ctx.fillText(lines[i],x,y+i*16);
  ctx.restore();
}

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

/*
 * Phase 2.2: Boss UI Rendering
 *
 * Four drawing functions called from render():
 *   drawBossHealthBar(g)     — Top-center bar with phase markers
 *   drawBossName(g)          — Dramatic name display on spawn
 *   drawWeakPointHighlight(g) — Glowing weak point circle on boss
 *   drawBossCrystalRainIndicators(g) — Floor markers for crystal rain
 */

function drawBossHealthBar(g){
  if(!g || !g.bossSpawned || g.bossDefeated) return;
  // Find the boss enemy
  const boss = g.enemies.find(e => e.role === 'boss' && e.hp > 0);
  if(!boss) return;
  const bossDef = BOSS_TYPES[g.bossType];
  if(!bossDef) return;

  const hpPct = clamp(boss.hp / boss.maxHp, 0, 1);
  const barW = 380;
  const barH = 28;
  const x = (innerWidth - barW) / 2;
  const y = 56;

  ctx.save();

  // Background frame sprite (fallback to procedural if sprite missing)
  const frameDrawn = drawSpriteCentered(ctx, 'bossHealthBarFrame', x + barW/2, y + barH/2, barW + 12, barH + 16, {
    alpha: 0.85,
    glowColor: bossDef.color,
    glowBlur: 6
  });
  if(!frameDrawn){
    // Procedural fallback background
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(x - 4, y - 4, barW + 8, barH + 8, 12);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = bossDef.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = bossDef.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(x - 2, y - 2, barW + 4, barH + 4, 10);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // HP fill (always procedural — the bar itself fills over the frame)
  const gradient = ctx.createLinearGradient(x, y, x + barW, y);
  if(boss.bossPhase >= 2){
    gradient.addColorStop(0, '#ff3030');
    gradient.addColorStop(0.5, '#ff6060');
    gradient.addColorStop(1, '#ff3030');
  } else if(boss.bossPhase >= 1){
    gradient.addColorStop(0, '#ff8a5b');
    gradient.addColorStop(0.5, '#ffb84d');
    gradient.addColorStop(1, '#ff8a5b');
  } else {
    gradient.addColorStop(0, '#ff5b5b');
    gradient.addColorStop(0.5, '#ff8a5b');
    gradient.addColorStop(1, '#ff5b5b');
  }
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(x, y, barW * hpPct, barH, 8);
  ctx.fill();

  // Phase markers on bar (at 66% and 33%)
  const markers = [0.66, 0.33];
  for(const m of markers){
    const mx = x + barW * (1 - m);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(mx, y - 4);
    ctx.lineTo(mx, y + barH + 4);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Inter, Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(m === 0.66 ? 'P2' : 'P3', mx, y + barH + 18);
  }

  // Boss name above bar
  ctx.fillStyle = bossDef.color;
  ctx.shadowColor = bossDef.color;
  ctx.shadowBlur = 8;
  ctx.font = 'bold 15px Inter, Segoe UI, Arial';
  ctx.textAlign = 'center';
  const phaseText = boss.bossPhase >= 2 ? ' ⚡ENRAGE' : (boss.bossPhase >= 1 ? ` • Phase ${boss.bossPhase + 1}` : '');
  ctx.fillText(`${bossDef.icon} ${bossDef.name}${phaseText}`, innerWidth / 2, y - 8);
  ctx.shadowBlur = 0;

  // HP percentage text
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px Inter, Segoe UI, Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(hpPct * 100)}%`, x + barW / 2, y + barH / 2 + 5);

  ctx.restore();
}

/*
 * Boss name display — appears dramatically when boss spawns.
 * Fades out after 3 seconds.
 */
function drawBossName(g){
  if(!g || !g.bossNameDisplay) return;
  const bnd = g.bossNameDisplay;
  // Skip rendering if completely faded out (timer <= 0)
  if(bnd.timer <= 0) return;
  // Alpha: full opacity for first half of timer, then fade out over last 1.5 seconds
  const alpha = bnd.fadeOut ? clamp(bnd.timer / 1.5, 0, 1) : 1;
  // Also hide if the boss is already dead
  const bossAlive = g.enemies && g.enemies.some(e => e.role === 'boss' && e.hp > 0);
  if(!bossAlive && !bnd.fadeOut){
    // Boss died before name faded — force immediate fade
    bnd.fadeOut = true;
  }
  if(alpha <= 0) return;
  const bossDef = BOSS_TYPES[Object.keys(BOSS_TYPES).find(k => BOSS_TYPES[k].name === bnd.text)];
  const color = bossDef?.color || '#ff4fd8';

  ctx.save();
  ctx.globalAlpha = alpha;

  // Background banner
  const text = `🔥 BOSS: ${bnd.text}`;
  ctx.font = 'bold 42px Inter, Segoe UI, Arial';
  ctx.textAlign = 'center';
  const metrics = ctx.measureText(text);
  const bw = metrics.width + 80;
  const bx = (innerWidth - bw) / 2;
  const by = innerHeight / 2 - 80;

  // Sprite-based name plate background (fallback to procedural)
  const plateDrawn = drawSpriteCentered(ctx, 'bossNamePlate', innerWidth / 2, by + 16, bw + 32, 80, {
    alpha: 0.92,
    glowColor: color,
    glowBlur: 14
  });
  if(!plateDrawn){
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(bx - 8, by - 16, bw + 16, 72, 16);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.roundRect(bx - 8, by - 16, bw + 16, 72, 16);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.fillText(text, innerWidth / 2, by + 38);

  // Subtitle
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Inter, Segoe UI, Arial';
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#000';
  ctx.fillText('Prepare for combat.', innerWidth / 2, by + 72);

  ctx.restore();
}

/*
 * Weak Point Highlight — glowing circle on the boss when weak point is active.
 */
function drawWeakPointHighlight(g){
  if(!g || !g.bossWeakPoint?.active) return;
  const wp = g.bossWeakPoint;
  const bossDef = BOSS_TYPES[g.bossType];

  ctx.save();

  const pulse = 0.6 + 0.4 * Math.sin(g.time * 10);
  const glowRadius = wp.radius * (1 + 0.3 * pulse);

  // Sprite-based weak point indicator (fallback to procedural glow)
  const wpDrawn = drawSpriteCentered(ctx, 'bossWeakPoint', wp.x, wp.y, glowRadius * 2.4, glowRadius * 2.4, {
    rotation: g.time * 1.5,
    alpha: 0.7 + 0.3 * pulse,
    glowColor: '#42d6ff',
    glowBlur: 24
  });

  if(!wpDrawn){
    // Multiple layered circles for glow effect
    ctx.shadowColor = '#42d6ff';
    ctx.shadowBlur = 30;
    ctx.strokeStyle = `rgba(66,214,255,${0.5 + 0.4 * pulse})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(wp.x, wp.y, glowRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 18;
    ctx.strokeStyle = `rgba(66,214,255,${0.7 + 0.3 * pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(wp.x, wp.y, glowRadius * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    // Inner fill
    ctx.shadowBlur = 12;
    ctx.fillStyle = `rgba(66,214,255,${0.15 + 0.12 * pulse})`;
    ctx.beginPath();
    ctx.arc(wp.x, wp.y, wp.radius, 0, Math.PI * 2);
    ctx.fill();

    // Crosshair marks
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(66,214,255,${0.6 + 0.3 * pulse})`;
    ctx.lineWidth = 2;
    const ch = wp.radius * 0.6;
    for(const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      ctx.beginPath();
      ctx.moveTo(wp.x + dx * ch * 0.4, wp.y + dy * ch * 0.4);
      ctx.lineTo(wp.x + dx * ch, wp.y + dy * ch);
      ctx.stroke();
    }
  }

  // "⚡ WEAK POINT" floating text
  const textAlpha = 0.7 + 0.3 * pulse;
  ctx.fillStyle = `rgba(66,214,255,${textAlpha})`;
  ctx.shadowColor = '#42d6ff';
  ctx.shadowBlur = 14;
  ctx.font = 'bold 14px Inter, Segoe UI, Arial';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ WEAK POINT', wp.x, wp.y - wp.radius - 14);

  ctx.restore();
}

/*
 * Crystal Rain Indicators — floor markers showing where crystals will fall.
 */
function drawBossCrystalRainIndicators(g){
  if(!g || !g.bossCrystalRainIndicators || !g.bossCrystalRainIndicators.length) return;
  ctx.save();
  for(const ind of g.bossCrystalRainIndicators){
    const pulse = 0.5 + 0.5 * Math.sin(g.time * 12 + ind.x + ind.y);
    const alpha = clamp(ind.timer / ind.maxTimer, 0, 1);
    const radius = 18 + 6 * pulse;

    // Sprite-based indicator (fallback to procedural)
    const indDrawn = drawSpriteCentered(ctx, 'crystalRainIndicator', ind.x, ind.y, radius * 2, radius * 2, {
      rotation: -g.time * 0.8,
      alpha: 0.5 + 0.3 * alpha * pulse,
      glowColor: '#b46bff',
      glowBlur: 14
    });

    if(!indDrawn){
      ctx.shadowColor = '#b46bff';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = `rgba(180,107,255,${0.5 + 0.3 * pulse * alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ind.x, ind.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(180,107,255,${0.08 * alpha})`;
      ctx.beginPath();
      ctx.arc(ind.x, ind.y, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Diagonal cross
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(180,107,255,${0.4 * alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ind.x - radius * 0.4, ind.y - radius * 0.4);
      ctx.lineTo(ind.x + radius * 0.4, ind.y + radius * 0.4);
      ctx.moveTo(ind.x + radius * 0.4, ind.y - radius * 0.4);
      ctx.lineTo(ind.x - radius * 0.4, ind.y + radius * 0.4);
      ctx.stroke();
    }
  }
  ctx.restore();
}
