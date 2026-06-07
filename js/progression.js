'use strict';

/* Persistent profile, menus, mission progression, and permanent upgrades. */

const SAVE_KEY = 'echoVeinSaveV1';
const RUNS_PER_MISSION = 5;
const EXTRACTION_SECONDS = 30;
const SPECIAL_ORES = ['voltarite','echoQuartz','ferronRoot','lumicite','pyroclastCore','umbralAlloy'];

let appState = 'STARTUP';
let saveProfile = null;

const PERMANENT_UPGRADES = [
  { id:'maxHealth', name:'Reinforced Suit', desc:'+5% max HP per level.', ore:'ferronRoot', max:20 },
  { id:'armour', name:'Impact Weave', desc:'Reduces contact damage by 2% per level.', ore:'ferronRoot', max:15 },
  { id:'moveSpeed', name:'Vector Servos', desc:'+2.5% movement speed per level.', ore:'lumicite', max:15 },
  { id:'miningSpeed', name:'Bore Calibration', desc:'+4% mining speed per level.', ore:'echoQuartz', max:15 },
  { id:'weaponDamage', name:'Weapon Harmonics', desc:'+3% weapon damage per level.', ore:'umbralAlloy', max:20 },
  { id:'fireRate', name:'Trigger Relays', desc:'+2% fire rate per level.', ore:'voltarite', max:15 },
  { id:'pickupRadius', name:'Resonance Net', desc:'+5% pickup radius per level.', ore:'echoQuartz', max:12 },
  { id:'droneEfficiency', name:'Drone Uplinks', desc:'+4% drone damage and speed per level.', ore:'umbralAlloy', max:12 },
  { id:'trapEffectiveness', name:'Trap Matrices', desc:'+5% trap damage and radius per level.', ore:'pyroclastCore', max:12 },
  { id:'arcDamage', name:'Arc Capacitors', desc:'+5% electric/arc damage per level.', ore:'voltarite', max:12 },
];

function defaultResources(){
  return { gildShards:0, voltarite:0, echoQuartz:0, ferronRoot:0, lumicite:0, pyroclastCore:0, umbralAlloy:0 };
}

function defaultPermanentUpgrades(){
  const result={};
  for(const up of PERMANENT_UPGRADES) result[up.id]=0;
  return result;
}

function createDefaultProfile(){
  const stamp=new Date().toISOString();
  return {
    version:1,
    profileName:'Default Profile',
    createdAt:stamp,
    lastPlayedAt:stamp,
    missionIndex:1,
    runIndex:1,
    completedMissions:0,
    resources:defaultResources(),
    permanentUpgrades:defaultPermanentUpgrades(),
    statistics:{
      totalRunsStarted:0,
      totalRunsCompleted:0,
      totalMissionsCompleted:0,
      totalEnemiesKilled:0,
      totalBossesKilled:0,
      totalOreMined:0
    }
  };
}

function normalizeProfile(profile){
  const base=createDefaultProfile();
  return {
    ...base,
    ...profile,
    resources:{...base.resources,...(profile?.resources || {})},
    permanentUpgrades:{...base.permanentUpgrades,...(profile?.permanentUpgrades || {})},
    statistics:{...base.statistics,...(profile?.statistics || {})}
  };
}

function hasSaveData(){
  return !!localStorage.getItem(SAVE_KEY);
}

function loadSave(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return null;
    return normalizeProfile(JSON.parse(raw));
  }catch(err){
    console.warn('Could not load Echo Vein save.', err);
    return null;
  }
}

function saveGame(){
  if(!saveProfile) return;
  saveProfile.lastPlayedAt=new Date().toISOString();
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveProfile));
}

function newGame(){
  saveProfile=createDefaultProfile();
  saveGame();
  showMainMenu();
}

function deleteSave(){
  localStorage.removeItem(SAVE_KEY);
  saveProfile=createDefaultProfile();
  showMainMenu();
}

function resourceLabel(id){
  return ({
    gildShards:'Gild Shards',
    voltarite:'Voltarite',
    echoQuartz:'Echo Quartz',
    ferronRoot:'Ferron Root',
    lumicite:'Lumicite',
    pyroclastCore:'Pyroclast Core',
    umbralAlloy:'Umbral Alloy'
  })[id] || id;
}

function missionDifficulty(missionIndex){
  const m=Math.max(1,missionIndex)-1;
  return {
    enemyHealthMultiplier:1+m*0.12,
    enemyDamageMultiplier:1+m*0.08,
    enemySpawnRateMultiplier:1+m*0.10,
    bossHealthMultiplier:1+m*0.18,
    bossDamageMultiplier:1+m*0.12,
    objectiveMultiplier:1+m*0.16,
    rewardMultiplier:1+m*0.15,
  };
}

function permanentUpgradeCost(up){
  const level=saveProfile.permanentUpgrades[up.id] || 0;
  return {
    gildShards:Math.floor(45 + level*28 + level*level*6),
    [up.ore]:Math.floor(2 + level*1.35)
  };
}

function canAfford(cost){
  return Object.entries(cost).every(([id,amount])=>(saveProfile.resources[id] || 0)>=amount);
}

function spend(cost){
  for(const [id,amount] of Object.entries(cost)) saveProfile.resources[id]-=amount;
}

function buyPermanentUpgrade(id){
  const up=PERMANENT_UPGRADES.find(item=>item.id===id);
  if(!up) return;
  const level=saveProfile.permanentUpgrades[id] || 0;
  if(level>=up.max) return;
  const cost=permanentUpgradeCost(up);
  if(!canAfford(cost)) return;
  spend(cost);
  saveProfile.permanentUpgrades[id]=level+1;
  saveGame();
  showUpgradesMenu();
}

function applyPermanentUpgrades(g){
  if(!saveProfile) return;
  const up=saveProfile.permanentUpgrades;
  const p=g.player;
  p.maxHp=Math.round(p.maxHp*(1+(up.maxHealth || 0)*0.05));
  p.hp=p.maxHp;
  p.armourMul=Math.max(0.55,1-(up.armour || 0)*0.02);
  p.speedMul*=1+(up.moveSpeed || 0)*0.025;
  p.mineMul*=1+(up.miningSpeed || 0)*0.04;
  p.damageMul*=1+(up.weaponDamage || 0)*0.03;
  p.fireRateMul*=1+(up.fireRate || 0)*0.02;
  p.pickupMul*=1+(up.pickupRadius || 0)*0.05;
  const drone=1+(up.droneEfficiency || 0)*0.04;
  p.droneDamageMul*=drone; p.droneSpeedMul*=drone;
  const traps=1+(up.trapEffectiveness || 0)*0.05;
  p.trapDamageMul*=traps; p.trapRadiusMul*=traps;
  p.arcDamageMul=1+(up.arcDamage || 0)*0.05;
}

function currentRunObjectives(){
  const diff=missionDifficulty(saveProfile.missionIndex);
  const run=saveProfile.runIndex;
  return [
    { id:'collect_echo_shards', displayName:'Collect Echo Shards', targetAmount:Math.floor((35+run*10)*diff.objectiveMultiplier), currentAmount:0, completed:false },
    { id:'mine_gild_shards', displayName:'Mine Gild Shards', targetAmount:Math.floor((18+run*5)*diff.objectiveMultiplier), currentAmount:0, completed:false }
  ];
}

function bankRunRewards(g){
  const diff=missionDifficulty(saveProfile.missionIndex);
  const rewardMul=diff.rewardMultiplier;
  const resources=saveProfile.resources;
  resources.gildShards += Math.floor((g.gold + 35 + saveProfile.runIndex*10)*rewardMul);
  resources.voltarite += Math.floor((g.nitra + 4)*rewardMul);
  resources.echoQuartz += Math.max(1, Math.floor((g.objectiveEchoCollected || 0)/35));
  const bonusOre=SPECIAL_ORES[(saveProfile.missionIndex + saveProfile.runIndex - 2) % SPECIAL_ORES.length];
  resources[bonusOre] += 1 + Math.floor(saveProfile.missionIndex/3);
  if(Math.random()<0.35) resources[SPECIAL_ORES[randi(0,SPECIAL_ORES.length-1)]] += 1;
}

function completeRun(g){
  if(!saveProfile || g.runResolved) return;
  g.runResolved=true;
  bankRunRewards(g);
  saveProfile.statistics.totalRunsCompleted++;
  saveProfile.statistics.totalEnemiesKilled += g.kills;
  saveProfile.runIndex++;
  let missionCompleted=false;
  if(saveProfile.runIndex>RUNS_PER_MISSION){
    saveProfile.runIndex=1;
    saveProfile.missionIndex++;
    saveProfile.completedMissions++;
    saveProfile.statistics.totalMissionsCompleted++;
    saveProfile.resources.gildShards += Math.floor(120*missionDifficulty(saveProfile.missionIndex).rewardMultiplier);
    missionCompleted=true;
  }
  saveGame();
  showRunComplete(g, missionCompleted);
}

function failRun(g,reason){
  if(g.runResolved) return;
  g.runResolved=true;
  g.state='failed';
  sfx('gameover');
  ui.gameOverText.innerHTML=`${reason}<br><br>Unbanked run resources were lost. Your saved mission remains at Mission <b>${saveProfile.missionIndex}</b>, Run <b>${saveProfile.runIndex}</b>.`;
  ui.gameOverOverlay.classList.add('show');
  saveGame();
}

function startRunWithClass(clsOrId){
  const cls=typeof clsOrId==='string' ? getClassById(clsOrId) : clsOrId;
  resumeAudio();
  game=makeGame(cls);
  saveProfile.statistics.totalRunsStarted++;
  saveGame();
  appState='RUN_ACTIVE';
  sfx('start');
  paused=false; awaitingUpgrade=false;
  hideAllOverlays();
  updateUI(game);
}

function hideAllOverlays(){
  ui.startOverlay.classList.remove('show');
  ui.gameOverOverlay.classList.remove('show');
  ui.upgradeOverlay.classList.remove('show');
}

function clearMenu(){
  ui.startOverlay.classList.add('show');
  ui.gameOverOverlay.classList.remove('show');
  ui.upgradeOverlay.classList.remove('show');
  ui.classCards.innerHTML='';
  ui.menuButtons.innerHTML='';
  ui.menuContent.innerHTML='';
  ui.menuMeta.innerHTML='';
}

function setMenu(title,text){
  clearMenu();
  ui.startTitle.textContent=title;
  ui.startText.textContent=text;
}

function addMenuButton(label,handler){
  const btn=document.createElement('button');
  btn.textContent=label;
  btn.onclick=handler;
  ui.menuButtons.appendChild(btn);
  return btn;
}

function renderResourceLine(){
  return Object.entries(saveProfile.resources)
    .map(([id,value])=>`<span><b>${resourceLabel(id)}</b> ${value}</span>`)
    .join('');
}

function showSaveSelect(){
  appState='SAVE_SELECT';
  const profile=loadSave();
  setMenu('Saved Games', 'Continue a saved Hollowshift profile or start clean.');
  if(profile){
    ui.menuMeta.innerHTML=`<div class="saveCard"><b>${profile.profileName}</b><span>Last played ${new Date(profile.lastPlayedAt).toLocaleString()}</span><span>Mission ${profile.missionIndex}, Run ${profile.runIndex} of ${RUNS_PER_MISSION}</span><span>Total resources ${Object.values(profile.resources).reduce((a,b)=>a+b,0)}</span></div>`;
  }
  addMenuButton('Continue Latest Save',()=>{ saveProfile=profile || createDefaultProfile(); showMainMenu(); });
  addMenuButton('New Game',newGame);
  addMenuButton('Delete Save / Reset Progress',deleteSave);
}

function showMainMenu(){
  appState='MAIN_MENU';
  if(!saveProfile) saveProfile=createDefaultProfile();
  saveGame();
  game=null;
  setMenu('Echo Vein', 'Prepare the next descent, spend permanent resources, or review your Hollowshift profile.');
  ui.menuMeta.innerHTML=`<div class="menuStats"><span>Mission <b>${saveProfile.missionIndex}</b></span><span>Run <b>${saveProfile.runIndex}/${RUNS_PER_MISSION}</b></span><span>Completed Missions <b>${saveProfile.completedMissions}</b></span></div><div class="resourceStrip">${renderResourceLine()}</div>`;
  addMenuButton('Play',showClassSelect);
  addMenuButton('Upgrades',showUpgradesMenu);
  addMenuButton('Gears',()=>showPlaceholderMenu('Gears','Gears feature coming later.'));
  addMenuButton('Milestones',()=>showPlaceholderMenu('Milestones','Milestones feature coming later.'));
  addMenuButton('Settings',()=>showPlaceholderMenu('Settings','Settings feature coming later.'));
  addMenuButton('Credits',showCreditsMenu);
}

function showClassSelect(){
  appState='MISSION_SELECT';
  setMenu('Choose Operator', `Mission ${saveProfile.missionIndex}, Run ${saveProfile.runIndex} of ${RUNS_PER_MISSION}. Complete objectives, defeat the sector boss, then reach extraction.`);
  setupClassCards();
}

function showPlaceholderMenu(title,text){
  appState=`${title.toUpperCase()}_MENU`;
  setMenu(title,text);
  addMenuButton('Back',showMainMenu);
}

function showCreditsMenu(){
  appState='CREDITS_MENU';
  setMenu('Credits','Designed by Alessandro and Dylan from King Peng Studio');
  ui.menuContent.innerHTML='<p>Game Design: Alessandro and Dylan<br>Studio: King Peng Studio<br>Prototype Development: AI-assisted HTML/JavaScript prototype</p>';
  addMenuButton('Back',showMainMenu);
}

function showUpgradesMenu(){
  appState='UPGRADES_MENU';
  setMenu('Permanent Upgrades','Spend banked resources on account-wide upgrades. These bonuses are smaller than in-run upgrades and apply before each run starts.');
  ui.menuMeta.innerHTML=`<div class="resourceStrip">${renderResourceLine()}</div>`;
  const grid=document.createElement('div');
  grid.className='upgradeGrid';
  for(const up of PERMANENT_UPGRADES){
    const level=saveProfile.permanentUpgrades[up.id] || 0;
    const cost=permanentUpgradeCost(up);
    const affordable=canAfford(cost);
    const card=document.createElement('div');
    card.className='upgradeRow';
    card.innerHTML=`<div><h3>${up.name}</h3><p>${up.desc}</p><span>Level ${level}/${up.max}</span></div><div class="cost">${Object.entries(cost).map(([id,amount])=>`${resourceLabel(id)} ${amount}`).join('<br>')}</div>`;
    const btn=document.createElement('button');
    btn.textContent=level>=up.max?'Maxed':'Buy';
    btn.disabled=level>=up.max || !affordable;
    btn.onclick=()=>buyPermanentUpgrade(up.id);
    card.appendChild(btn);
    grid.appendChild(card);
  }
  ui.menuContent.appendChild(grid);
  addMenuButton('Back',showMainMenu);
}

function showRunComplete(g,missionCompleted){
  appState='RUN_COMPLETE';
  setMenu(missionCompleted ? 'Mission Complete' : 'Run Extracted', missionCompleted ? 'The sector chain is cleared. A harder mission is now available.' : 'Resources were banked to your Hollowshift profile.');
  ui.menuMeta.innerHTML=`<div class="menuStats"><span>Current Mission <b>${saveProfile.missionIndex}</b></span><span>Current Run <b>${saveProfile.runIndex}/${RUNS_PER_MISSION}</b></span><span>Kills <b>${g.kills}</b></span></div><div class="resourceStrip">${renderResourceLine()}</div>`;
  addMenuButton('Continue',showMainMenu);
  addMenuButton('Upgrades',showUpgradesMenu);
}

function startupFlow(){
  if(hasSaveData()) showSaveSelect();
  else {
    saveProfile=createDefaultProfile();
    saveGame();
    showMainMenu();
  }
}

window.showMainMenu=showMainMenu;
