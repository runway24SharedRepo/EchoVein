'use strict';

/* Mission objective HUD helpers, run statistics, end-of-run summary, and trend charts. */

const RUN_STAT_SAMPLE_INTERVAL = 5;
const RUN_STAT_MAX_SAMPLES = 720;
let runStatsLastChartKey = 'enemiesKilled';

function createRunStats(){
  return {
    startTime: performance.now(), endTime:null, durationSec:0, lastSampleTime:0,
    tileSizeBase:typeof TILE_SIZE_BASE!=='undefined'?TILE_SIZE_BASE:0, tileSizeScale:typeof TILE_SIZE_SCALE!=='undefined'?TILE_SIZE_SCALE:1, effectiveTileSize:typeof TILE!=='undefined'?TILE:0,
    enemiesKilled:0, elitesKilled:0, bossesKilled:0, playerLevelMax:1, xpCollected:0,
    resourcesCollected:{}, blocksMined:0, distanceTravelled:0, damageDealt:0, damageTaken:0,
    shotsFired:0, shotsHit:0, dashesUsed:0, trapsPlaced:0, dronesDeployed:0, dronesPeak:0,
    missilesFired:0, boomerangsFired:0, arcDetonations:0, lavaDamageTaken:0, borecasterBombsThrown:0, borecasterBombsExploded:0,
    objectivesCompleted:0, causeOfEnd:null, endTitle:null, samples:[], lastX:null, lastY:null,
    maxEnemiesAlive:0, criticalHealthTime:0, miningTime:0,
    chargingWavesSpawned:0, chargingWaveEnemiesSpawned:0, chargingWaveEnemiesKilled:0, chargingWaveEnemiesExploded:0,
    damageTakenFromChargingWaves:0, blocksBrokenByChargingWaves:0, oresDestroyedByChargingWaves:0
  };
}

function ensureRunStats(g){ if(g && !g.runStats) g.runStats=createRunStats(); return g?.runStats; }
function totalRunResources(stats){ return Object.values(stats?.resourcesCollected || {}).reduce((a,b)=>a+(+b||0),0); }
function runAccuracy(stats){ return stats?.shotsFired>0 ? (stats.shotsHit/stats.shotsFired)*100 : 0; }
function formatDuration(sec){ sec=Math.max(0,Math.floor(sec||0)); return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`; }
function recordRunResource(g,id,amount){ const s=ensureRunStats(g); if(!s||!id) return; s.resourcesCollected[id]=(s.resourcesCollected[id]||0)+(amount||0); }
function recordRunDamageTaken(g,amount,cause='damage'){ const s=ensureRunStats(g); if(!s) return; s.damageTaken+=(amount||0); if(cause==='lava') s.lavaDamageTaken+=(amount||0); if(amount>0 && !s.causeOfEnd) s.lastDamageCause=cause; }
function recordRunDamageDealt(g,amount){ const s=ensureRunStats(g); if(!s) return; s.damageDealt+=(amount||0); }
function recordShotFired(g,count=1){ const s=ensureRunStats(g); if(s) s.shotsFired+=count; }
function recordShotHit(g,count=1){ const s=ensureRunStats(g); if(s) s.shotsHit+=count; }

function updateRunStatsFrame(g,dt){
  const s=ensureRunStats(g); if(!s || g.state!=='playing') return;
  s.durationSec=g.time || 0;
  s.playerLevelMax=Math.max(s.playerLevelMax||1,g.level||1);
  s.maxEnemiesAlive=Math.max(s.maxEnemiesAlive||0,g.enemies?.length||0);
  s.dronesPeak=Math.max(s.dronesPeak||0,(g.wardenDrones?.length||0)+(g.sifterDrones?.length||0));
  if(s.lastX==null){ s.lastX=g.player.x; s.lastY=g.player.y; }
  else { const d=Math.hypot(g.player.x-s.lastX,g.player.y-s.lastY); if(Number.isFinite(d)&&d<160) s.distanceTravelled+=d; s.lastX=g.player.x; s.lastY=g.player.y; }
  if((g.player.hp/(g.player.maxHp||1))<0.25) s.criticalHealthTime+=dt;
  updateRunStatSampling(g);
}

function createRunStatSample(g){
  const s=ensureRunStats(g);
  return {
    t:g.time||0, enemiesKilled:s.enemiesKilled||0, elitesKilled:s.elitesKilled||0,
    playerLevel:g.level||1, xpCollected:s.xpCollected||0, totalOreCollected:totalRunResources(s),
    damageTaken:s.damageTaken||0, damageDealt:s.damageDealt||0, enemiesAlive:g.enemies?.length||0,
    enemyBulletsAlive:g.enemyBullets?.length||0, fpsAverage:g.performance?.averageFPS||60, blocksMined:s.blocksMined||0, tileSize:typeof TILE!=='undefined'?TILE:0
  };
}
function updateRunStatSampling(g){
  const s=ensureRunStats(g); if(!s) return;
  if((g.time||0)-s.lastSampleTime < RUN_STAT_SAMPLE_INTERVAL && s.samples.length) return;
  s.lastSampleTime=g.time||0;
  s.samples.push(createRunStatSample(g));
  if(s.samples.length>RUN_STAT_MAX_SAMPLES) s.samples.splice(0,s.samples.length-RUN_STAT_MAX_SAMPLES);
}

function finalizeRunStats(g,cause,title){
  const s=ensureRunStats(g); if(!s) return null;
  s.endTime=performance.now(); s.durationSec=g.time||s.durationSec||0; s.causeOfEnd=cause||s.causeOfEnd||'Ended'; s.endTitle=title||s.endTitle||'Run Ended';
  s.playerLevelMax=Math.max(s.playerLevelMax||1,g.level||1);
  if(!s.samples.length || (s.samples.at(-1).t||0)!==(g.time||0)) s.samples.push(createRunStatSample(g));
  return s;
}

function getObjectiveProgress(o){ const target=o?.targetAmount ?? o?.target ?? 0; const cur=o?.currentAmount ?? o?.current ?? 0; return target>0 ? clamp(cur/target,0,1) : 0; }
function objectiveProgressText(o){
  const target=o?.targetAmount ?? o?.target ?? 0; const cur=o?.currentAmount ?? o?.current ?? 0;
  if(!target) return o?.completed ? 'Complete' : 'Active';
  if((o.id||'').includes('level')) return `Level ${Math.floor(cur)} / ${target}`;
  return `${Math.floor(cur)} / ${target}`;
}

function renderObjectiveChips(g){
  const pulse=0.65+0.35*(0.5+0.5*Math.sin((g.time||0)*4));
  return (g.objectives||[]).map((o,i)=>{
    const pct=getObjectiveProgress(o)*100;
    const done=!!o.completed;
    const priority=!done && i===0;
    const style=done?'':`style="--pulse:${pulse.toFixed(3)}"`;
    return `<div class="objectiveRow ${done?'done':'active'} ${priority?'priority':''}" ${style}>
      <div class="objectiveTop"><span>${done?'✓':'◆'} ${o.displayName}</span><b>${objectiveProgressText(o)}</b></div>
      <div class="objectiveBar"><i style="width:${pct.toFixed(1)}%"></i></div>
    </div>`;
  }).join('');
}

function runStatsSummaryHtml(g){
  const s=ensureRunStats(g); const res=s.resourcesCollected||{};
  const resRows=Object.keys(res).sort().map(id=>`<div><span>${MINERALS[id]?.displayName||id}</span><b>${Math.floor(res[id]||0)}</b></div>`).join('') || '<div><span>No resources collected</span><b>0</b></div>';
  const cards=[
    ['Duration',formatDuration(s.durationSec)], ['Kills',s.enemiesKilled||0], ['Elites',s.elitesKilled||0], ['Bosses',s.bossesKilled||0],
    ['Level',s.playerLevelMax||g.level||1], ['Resources',totalRunResources(s)], ['Damage dealt',Math.round(s.damageDealt||0)], ['Damage taken',Math.round(s.damageTaken||0)],
    ['Accuracy',`${runAccuracy(s).toFixed(1)}%`], ['Blocks mined',s.blocksMined||0], ['Dashes',s.dashesUsed||0], ['Traps',s.trapsPlaced||0],
    ...((s.borecasterBombsThrown||0)>0 ? [
      ['Seismic bombs thrown',s.borecasterBombsThrown||0], ['Seismic bombs exploded',s.borecasterBombsExploded||0]
    ] : []),
    ...((s.chargingWavesSpawned||0)>0 ? [
      ['Charging waves',s.chargingWavesSpawned||0], ['Rift Chargers',s.chargingWaveEnemiesSpawned||0],
      ['Chargers exploded',s.chargingWaveEnemiesExploded||0], ['Wave damage',Math.round(s.damageTakenFromChargingWaves||0)],
      ['Wave blocks broken',s.chargingWaveBlocksBroken||s.blocksBrokenByChargingWaves||0]
    ] : [])
  ].map(([k,v])=>`<div class="statCard"><span>${k}</span><b>${v}</b></div>`).join('');
  return `<div class="runStatsSummary"><div class="statCards">${cards}</div><h3>Resource Breakdown</h3><div class="resourceBreakdown">${resRows}</div></div>`;
}

function drawRunStatsChart(canvas,g,key='enemiesKilled'){
  if(!canvas||!g?.runStats) return;
  const ctx2=canvas.getContext('2d'); const dpr=window.devicePixelRatio||1; const w=canvas.clientWidth||680,h=canvas.clientHeight||230;
  canvas.width=Math.floor(w*dpr); canvas.height=Math.floor(h*dpr); ctx2.setTransform(dpr,0,0,dpr,0,0);
  ctx2.clearRect(0,0,w,h); ctx2.fillStyle='rgba(7,9,13,0.72)'; ctx2.fillRect(0,0,w,h);
  const samples=g.runStats.samples||[]; ctx2.font='12px Segoe UI, Arial'; ctx2.fillStyle='#d7ecff';
  const titles={enemiesKilled:'Enemies killed over time',totalOreCollected:'Resources collected over time',damageTaken:'Damage taken over time',playerLevel:'Player level over time',fpsAverage:'Average FPS over time'};
  ctx2.fillText(titles[key]||key,16,22);
  if(samples.length<2){ ctx2.fillStyle='#95a2ba'; ctx2.fillText('Not enough data for trend graph.',16,64); return; }
  const pad={l:48,r:20,t:38,b:30}; const xs=samples.map(s=>s.t||0); const ys=samples.map(s=>+s[key]||0);
  const minX=Math.min(...xs), maxX=Math.max(...xs)||1; const minY=0, maxY=Math.max(1,...ys);
  ctx2.strokeStyle='rgba(255,255,255,0.10)'; ctx2.lineWidth=1;
  for(let i=0;i<4;i++){ const y=pad.t+(h-pad.t-pad.b)*i/3; ctx2.beginPath(); ctx2.moveTo(pad.l,y); ctx2.lineTo(w-pad.r,y); ctx2.stroke(); }
  ctx2.strokeStyle='#42d6ff'; ctx2.lineWidth=3; ctx2.beginPath();
  samples.forEach((s,i)=>{ const x=pad.l+((s.t-minX)/(maxX-minX||1))*(w-pad.l-pad.r); const y=h-pad.b-(((+s[key]||0)-minY)/(maxY-minY||1))*(h-pad.t-pad.b); if(i===0)ctx2.moveTo(x,y); else ctx2.lineTo(x,y); }); ctx2.stroke();
  ctx2.fillStyle='#95a2ba'; ctx2.fillText(`0s`,pad.l,h-10); ctx2.fillText(`${Math.floor(maxX)}s`,w-pad.r-44,h-10); ctx2.fillText(`End: ${ys.at(-1)??0}`,w-110,22);
}

function showRunStatsScreen(g,opts={}){
  const s=finalizeRunStats(g,opts.cause,opts.title); if(!s) return;
  const overlay=document.getElementById('runStatsOverlay'); const title=document.getElementById('runStatsTitle'); const reason=document.getElementById('runStatsReason'); const body=document.getElementById('runStatsBody');
  if(!overlay||!body) return;
  title.textContent=s.endTitle||'Run Complete'; reason.textContent=`Reason: ${s.causeOfEnd||'Ended'}`; body.innerHTML=runStatsSummaryHtml(g);
  overlay.classList.add('show');
  const tabs=document.querySelectorAll('[data-run-chart]'); tabs.forEach(btn=>{btn.onclick=()=>{runStatsLastChartKey=btn.dataset.runChart; drawRunStatsChart(document.getElementById('runStatsChart'),g,runStatsLastChartKey);};});
  setTimeout(()=>drawRunStatsChart(document.getElementById('runStatsChart'),g,runStatsLastChartKey),30);
}
function hideRunStatsScreen(){ document.getElementById('runStatsOverlay')?.classList.remove('show'); }
function runStatsContinue(){ hideRunStatsScreen(); showMainMenu(); }
function runStatsRetry(){ const cls=game?.selectedClass || CLASSES[0]; hideRunStatsScreen(); startRunWithClass(cls); }
function runStatsMainMenu(){ hideRunStatsScreen(); showMainMenu(); }

function debugGenerateFakeRunStats(){
  if(!game) game=makeGame(CLASSES[0]);
  game.runStats=createRunStats(); const s=game.runStats; game.time=180; s.enemiesKilled=120; s.elitesKilled=4; s.bossesKilled=1; s.playerLevelMax=7; s.damageDealt=4200; s.damageTaken=84; s.shotsFired=350; s.shotsHit=220; s.blocksMined=165; s.resourcesCollected={gild:70,voltarite:34,echo:180,emberglass:7};
  s.samples=[]; for(let t=0;t<=180;t+=5){ s.samples.push({t,enemiesKilled:Math.floor(t*0.65),totalOreCollected:Math.floor(t*0.55),damageTaken:Math.floor(t*0.45),playerLevel:1+Math.floor(t/30),fpsAverage:58+Math.sin(t/18)*5,blocksMined:Math.floor(t*0.9)}); }
  showRunStatsScreen(game,{title:'Debug Run Statistics',cause:'Generated fake test data'});
}
function debugPrintRunStats(){ console.log(game?.runStats || null); }

window.getObjectiveProgress=getObjectiveProgress;
window.renderObjectiveChips=renderObjectiveChips;
window.createRunStats=createRunStats;
window.ensureRunStats=ensureRunStats;
window.updateRunStatsFrame=updateRunStatsFrame;
window.finalizeRunStats=finalizeRunStats;
window.showRunStatsScreen=showRunStatsScreen;
window.recordRunResource=recordRunResource;
window.recordRunDamageTaken=recordRunDamageTaken;
window.recordRunDamageDealt=recordRunDamageDealt;
window.recordShotFired=recordShotFired;
window.recordShotHit=recordShotHit;
window.debugGenerateFakeRunStats=debugGenerateFakeRunStats;
window.debugPrintRunStats=debugPrintRunStats;
window.runStatsContinue=runStatsContinue;
window.runStatsRetry=runStatsRetry;
window.runStatsMainMenu=runStatsMainMenu;
