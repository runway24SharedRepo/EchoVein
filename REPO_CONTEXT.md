repo: EchoVein

File Structure:
EchoVein/css/style.css
EchoVein/js/assets.js
EchoVein/js/core.js
EchoVein/js/render-ui.js
EchoVein/PROJECT_CONTEXT.md
EchoVein/REPO_CONTEXT.md

EchoVein/css/style.css:
:root {
    --bg: #07090d;
    --panel: rgba(14, 18, 28, 0.88);
    --panel2: rgba(30, 35, 48, 0.94);
    --gold: #ffcc4d;
    --cyan: #42d6ff;
    --green: #5dff9a;
    --red: #ff5b5b;
    --orange: #ff9f43;
    --purple: #b46bff;
    --text: #eef3ff;
    --muted: #95a2ba;
  }

  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    height: 100%;
    overflow: hidden;
    background: radial-gradient(circle at 50% 45%, #182033 0%, #07090d 68%);
    color: var(--text);
    font-family: Inter, Segoe UI, Roboto, Arial, sans-serif;
    user-select: none;
  }

  #game {
    display: block;
    width: 100vw;
    height: 100vh;
    cursor: crosshair;
  }

  .hud {
    position: fixed;
    inset: 0;
    pointer-events: none;
  }

  .topbar {
    position: absolute;
    left: 14px;
    top: 14px;
    display: grid;
    gap: 8px;
    min-width: 390px;
  }

  .panel {
    background: var(--panel);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 14px;
    box-shadow: 0 10px 35px rgba(0,0,0,0.35);
    backdrop-filter: blur(8px);
  }

  .stats {
    padding: 10px 12px;
    display: grid;
    gap: 8px;
  }

  .line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: var(--muted);
  }

  .line strong { color: var(--text); font-weight: 800; }

  .bars { display: grid; gap: 6px; }
  .bar {
    height: 15px;
    background: rgba(255,255,255,0.08);
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.10);
    position: relative;
  }
  .bar > div {
    height: 100%;
    width: 50%;
    border-radius: 999px;
    transition: width 0.12s linear;
  }
  .bar.health > div { background: linear-gradient(90deg, #ff3f5f, #ff8a5b); }
  .bar.xp > div { background: linear-gradient(90deg, #3c80ff, #42d6ff); }
  .bar.overheat > div { background: linear-gradient(90deg, #ffd15c, #ff5b5b); }
  .bar .label {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 10px;
    font-weight: 900;
    color: rgba(255,255,255,0.92);
    text-shadow: 0 1px 2px #000;
  }

  .rightbar {
    position: absolute;
    right: 14px;
    top: 14px;
    width: 330px;
    padding: 12px;
    display: grid;
    gap: 10px;
  }

  .title {
    font-size: 18px;
    font-weight: 950;
    letter-spacing: 0.3px;
    color: #fff;
  }
  .subtitle {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.35;
  }

  .weaponList, .logList { display: grid; gap: 6px; }
  .chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 7px 9px;
    border-radius: 10px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    font-size: 12px;
    color: var(--muted);
  }
  .chip b { color: #fff; }
  .chip.locked { border-color: rgba(255,75,75,0.8); background: rgba(255,75,75,0.12); color: #ff9999; }
  .chip.unlocked { border-color: rgba(114,255,118,0.8); background: rgba(89,255,105,0.14); color: #d4ffd4; }

  .bottomHelp {
    position: absolute;
    left: 50%;
    bottom: 16px;
    transform: translateX(-50%);
    padding: 10px 14px;
    font-size: 13px;
    color: var(--muted);
    white-space: nowrap;
  }
  .bottomHelp kbd {
    color: #fff;
    background: rgba(255,255,255,0.10);
    border: 1px solid rgba(255,255,255,0.20);
    border-bottom-color: rgba(0,0,0,0.55);
    border-radius: 5px;
    padding: 2px 5px;
    font-size: 11px;
    font-weight: 900;
  }

  .overlay {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: none;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    background: radial-gradient(circle at 50% 50%, rgba(15,22,36,0.44), rgba(0,0,0,0.72));
  }
  .overlay.show { display: flex; }
  .modal {
    width: min(960px, calc(100vw - 32px));
    max-height: calc(100vh - 42px);
    overflow: auto;
    padding: 18px;
    background: var(--panel2);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 20px;
    box-shadow: 0 18px 80px rgba(0,0,0,0.65);
  }
  .modal h1, .modal h2 { margin: 0 0 8px; }
  .modal h1 { font-size: 30px; }
  .modal p { color: var(--muted); line-height: 1.45; margin: 8px 0; }

  .cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }
  .card {
    border: 1px solid rgba(255,255,255,0.13);
    border-radius: 16px;
    background: rgba(255,255,255,0.06);
    padding: 14px;
    cursor: pointer;
    transition: transform 0.1s ease, background 0.1s ease, border-color 0.1s ease;
  }
  .card:hover {
    transform: translateY(-2px);
    background: rgba(255,255,255,0.10);
    border-color: rgba(66,214,255,0.65);
  }
  .card .icon { font-size: 32px; margin-bottom: 10px; }
  .card h3 { margin: 0 0 7px; font-size: 17px; }
  .card p { margin: 0; font-size: 13px; }
  .card .tag {
    display: inline-block;
    margin-top: 10px;
    font-size: 11px;
    color: #08111a;
    background: var(--cyan);
    padding: 3px 7px;
    border-radius: 999px;
    font-weight: 900;
  }

  .buttonRow { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
  button {
    pointer-events: auto;
    border: 1px solid rgba(255,255,255,0.18);
    background: linear-gradient(180deg, rgba(66,214,255,0.18), rgba(66,214,255,0.08));
    color: #fff;
    border-radius: 12px;
    padding: 10px 14px;
    font-weight: 900;
    cursor: pointer;
  }
  button:hover { border-color: rgba(66,214,255,0.75); }

  .damageFlash {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background: rgba(255,30,55,0.0);
    transition: background 0.12s linear;
  }
  .damageFlash.on { background: rgba(255,30,55,0.22); }


  .soundControls {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-right: 14px;
    padding-right: 12px;
    border-right: 1px solid rgba(255,255,255,0.12);
  }
  .soundControls button {
    border: 1px solid rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.08);
    color: var(--text);
    border-radius: 10px;
    padding: 5px 9px;
    font-weight: 800;
    cursor: pointer;
  }
  .soundControls button:hover { background: rgba(255,255,255,0.16); }
  .soundControls input { width: 90px; accent-color: var(--cyan); }

  @media (max-width: 850px) {
    .rightbar { display: none; }
    .topbar { min-width: 310px; max-width: calc(100vw - 28px); }
    .cards { grid-template-columns: 1fr; }
    .bottomHelp { display: none; }
  }


  .debugBox {
    position: fixed;
    left: 12px;
    bottom: 12px;
    z-index: 50;
    max-width: min(760px, calc(100vw - 24px));
    max-height: 40vh;
    overflow: auto;
    white-space: pre-wrap;
    user-select: text;
    pointer-events: auto;
    background: rgba(80, 0, 0, 0.94);
    color: #fff;
    border: 1px solid rgba(255, 120, 120, 0.9);
    border-radius: 12px;
    padding: 10px 12px;
    font: 12px/1.35 Consolas, Monaco, monospace;
    box-shadow: 0 12px 35px rgba(0,0,0,0.55);
  }

  .card:focus-visible {
    outline: 3px solid var(--cyan);
    outline-offset: 3px;
  }


  /* Permanent upgrade table / affordability states */
  .upgradeTableWrap {
    display: grid;
    gap: 18px;
    margin-top: 16px;
  }
  .upgradeCategorySection {
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 16px;
    background: rgba(255,255,255,0.035);
    overflow: hidden;
  }
  .upgradeCategorySection > h3 {
    margin: 0;
    padding: 11px 13px;
    background: rgba(66,214,255,0.08);
    border-bottom: 1px solid rgba(255,255,255,0.10);
    color: #fff;
  }
  .upgradeTable {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  .upgradeTable th,
  .upgradeTable td {
    padding: 9px 10px;
    vertical-align: top;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .upgradeTable th {
    text-align: left;
    color: var(--cyan);
    background: rgba(0,0,0,0.16);
    font-size: 11px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .upgradeTable tr.affordable { background: rgba(93,255,154,0.025); }
  .upgradeTable tr.locked { background: rgba(255,255,255,0.018); }
  .upgradeTable tr.maxed { opacity: 0.72; }
  .upgradeTable td b { color: #fff; }
  .upgradeTable td small {
    display: block;
    margin-top: 3px;
    color: var(--muted);
  }
  .costLine {
    display: block;
    white-space: nowrap;
  }
  .costLine.ok { color: #a7f7c6; }
  .costLine.missing { color: #ff8f8f; font-weight: 900; }
  button:disabled,
  button.disabled,
  .buyBtn:disabled {
    background: rgba(120,128,145,0.22) !important;
    border-color: rgba(255,255,255,0.08) !important;
    color: rgba(238,243,255,0.52) !important;
    cursor: not-allowed !important;
    transform: none !important;
  }
  .buyBtn {
    min-width: 122px;
    padding: 8px 10px;
  }


  .settingsPanel {
    display: grid;
    gap: 12px;
    margin-top: 16px;
  }
  .settingsRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 13px 14px;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 14px;
    background: rgba(255,255,255,0.055);
  }
  .settingsRow span {
    display: grid;
    gap: 4px;
  }
  .settingsRow small,
  .settingsValues {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.35;
  }
  .settingsRow input[type="checkbox"] {
    width: 22px;
    height: 22px;
    accent-color: var(--cyan);
    cursor: pointer;
  }
  .settingsPresetRow {
    align-items: flex-start;
  }
  .settingsPresetButtons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .settingsPresetButtons button {
    padding: 7px 10px;
    border-radius: 10px;
  }
  .settingsValues {
    padding: 0 4px;
  }

.icon .spriteIcon {
  width: 38px;
  height: 38px;
  object-fit: contain;
  vertical-align: middle;
  filter: drop-shadow(0 0 8px rgba(255,255,255,0.18));
}
.weaponIcon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  vertical-align: middle;
  margin-right: 6px;
}

  .card.selected,
  .card[aria-selected="true"] {
    transform: translateY(-3px) scale(1.015);
    background: rgba(66,214,255,0.16);
    border-color: rgba(66,214,255,0.95);
    box-shadow: 0 0 0 2px rgba(66,214,255,0.30), 0 18px 45px rgba(66,214,255,0.12);
  }


/* Controller focus/selection highlight used by main menu, class select, settings, and level-up cards. */
.controllerSelected,
button.controllerSelected,
input.controllerSelected,
.card.controllerSelected {
  outline: 3px solid #64e8ff !important;
  box-shadow: 0 0 0 2px rgba(100,232,255,0.24), 0 0 22px rgba(100,232,255,0.45) !important;
  transform: translateY(-1px) scale(1.015);
}
input.controllerSelected {
  transform: scale(1.18);
}


.objectiveRow { margin: 6px 0; padding: 7px 8px; border-radius: 10px; background: rgba(255,255,255,0.055); border: 1px solid rgba(255,255,255,0.08); }
.objectiveRow.active { opacity: var(--pulse, 1); box-shadow: 0 0 calc(12px * var(--pulse, 1)) rgba(66,214,255,0.18); }
.objectiveRow.priority { border-color: rgba(66,214,255,0.35); }
.objectiveRow.done { background: rgba(93,255,154,0.10); border-color: rgba(93,255,154,0.28); }
.objectiveTop { display:flex; justify-content:space-between; gap:10px; font-size:12px; color: var(--text); }
.objectiveTop b { color: var(--cyan); }
.objectiveRow.done .objectiveTop b { color: var(--green); }
.objectiveBar { height: 7px; margin-top: 5px; border-radius:999px; background:rgba(255,255,255,0.08); overflow:hidden; border:1px solid rgba(255,255,255,0.08); }
.objectiveBar i { display:block; height:100%; background:linear-gradient(90deg,var(--cyan),var(--green)); border-radius:999px; transition:width .18s linear; }
.runStatsModal { width:min(980px, 94vw); max-height:92vh; overflow:auto; }
.statCards { display:grid; grid-template-columns: repeat(auto-fit,minmax(120px,1fr)); gap:10px; margin:12px 0; }
.statCard { padding:10px; border-radius:12px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.10); }
.statCard span { display:block; color:var(--muted); font-size:12px; }
.statCard b { display:block; font-size:20px; color:var(--text); margin-top:4px; }
.resourceBreakdown { display:grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap:6px; }
.resourceBreakdown div { display:flex; justify-content:space-between; padding:6px 8px; border-radius:8px; background:rgba(255,255,255,0.045); }
.chartTabs { display:flex; gap:8px; flex-wrap:wrap; margin:8px 0; }
.runStatsChart { width:100%; height:240px; border-radius:12px; border:1px solid rgba(255,255,255,0.12); background:rgba(0,0,0,0.28); }

/* ==============================
   Milestones Menu (Phase 1.1)
   ============================== */
.milestoneSection {
  margin-top: 16px;
}

.milestoneSectionHeader {
  font-size: 18px;
  font-weight: 900;
  color: var(--text);
  padding: 8px 4px 6px;
  border-bottom: 1px solid rgba(255,255,255,0.10);
  margin-bottom: 10px;
}

.milestonesGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.milestoneCard {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.04);
  transition: transform 0.12s ease, border-color 0.12s ease;
}

.milestoneCard.unlocked {
  border-color: rgba(93,255,154,0.45);
  background: rgba(93,255,154,0.07);
  box-shadow: 0 0 16px rgba(93,255,154,0.08);
}

.milestoneCard.locked {
  border-color: rgba(255,255,255,0.08);
  opacity: 0.82;
}

.milestoneIcon {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(255,255,255,0.06);
}

.milestoneCard.unlocked .milestoneIcon {
  background: rgba(93,255,154,0.14);
  box-shadow: 0 0 14px rgba(93,255,154,0.18);
}

.milestoneCard.locked .milestoneIcon {
  background: rgba(255,255,255,0.04);
}

.milestoneInfo {
  display: grid;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.milestoneName {
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
}

.milestoneCard.locked .milestoneName {
  color: var(--muted);
}

.milestoneDesc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.35;
}

.milestoneReward {
  font-size: 13px;
  color: var(--gold);
  font-weight: 700;
  margin-top: 4px;
}

.milestoneDate {
  font-size: 11px;
  color: var(--cyan);
  margin-top: 2px;
}

.milestoneLockedLabel {
  font-size: 12px;
  color: #ff9999;
  margin-top: 2px;
}

/* Progress bar for tracked milestones */
.milestoneProgressWrap {
  height: 8px;
  margin-top: 6px;
  background: rgba(255,255,255,0.08);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
}

.milestoneProgressBar {
  height: 100%;
  background: linear-gradient(90deg, var(--cyan), var(--green));
  border-radius: 999px;
  transition: width 0.2s ease;
  min-width: 2px;
}

.milestoneProgressBar.complete {
  background: linear-gradient(90deg, var(--green), #a7f7c6);
}

.milestoneProgressLabel {
  font-size: 11px;
  color: var(--muted);
  margin-top: 2px;
  text-align: right;
}

.milestoneCard.unlocked .milestoneProgressLabel {
  color: var(--green);
}

@media (max-width: 700px) {
  .milestonesGrid {
    grid-template-columns: 1fr;
  }
}

/* ==============================
   Mission Select (Phase 1.2)
   ============================== */
.missionSelectGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.missionSelectCard {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05);
  cursor: pointer;
  transition: transform 0.12s ease, border-color 0.15s ease, background 0.15s ease;
}

.missionSelectCard:hover,
.missionSelectCard:focus-visible {
  transform: translateY(-3px);
  border-color: var(--cyan);
  background: rgba(66,214,255,0.10);
  box-shadow: 0 8px 30px rgba(66,214,255,0.10);
}

.missionSelectIcon {
  font-size: 36px;
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(255,255,255,0.06);
}

.missionSelectInfo {
  display: grid;
  gap: 5px;
  flex: 1;
  min-width: 0;
}

.missionSelectName {
  font-size: 18px;
  font-weight: 900;
  color: var(--text);
}

.missionSelectDesc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
}

.missionSelectReward {
  font-size: 13px;
  color: var(--gold);
  font-weight: 700;
  margin-top: 3px;
}

@media (max-width: 700px) {
  .missionSelectGrid {
    grid-template-columns: 1fr;
  }
}

/* ==============================
   Upgrade Synergies Menu (Phase 2.1)
   ============================== */
.synergyGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.synergyCard {
  display: grid;
  gap: 8px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  transition: transform 0.12s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.synergyCard:hover {
  transform: translateY(-2px);
}

.synergyUnlocked {
  border-color: rgba(93,255,154,0.50);
  background: rgba(93,255,154,0.07);
  box-shadow: 0 0 20px rgba(93,255,154,0.10);
}

.synergyLocked {
  border-color: rgba(255,255,255,0.07);
  opacity: 0.78;
}

.synergyHeader {
  display: flex;
  align-items: center;
  gap: 10px;
}

.synergyIcon {
  font-size: 28px;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.synergyUnlocked .synergyIcon {
  background: rgba(93,255,154,0.14);
  box-shadow: 0 0 14px rgba(93,255,154,0.18);
}

.synergyName {
  font-size: 17px;
  font-weight: 800;
  color: var(--text);
  flex: 1;
}

.synergyLocked .synergyName {
  color: var(--muted);
}

.synergyBadge {
  font-size: 11px;
  font-weight: 900;
  color: #0a1a0a;
  background: var(--green);
  padding: 3px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.synergyDesc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
}

.synergyBonus {
  font-size: 13px;
  color: var(--purple);
  font-weight: 700;
  line-height: 1.35;
}

.synergyReqLabel {
  font-size: 11px;
  color: var(--muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 4px;
}

.synergyReqList {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.synergyReqItem {
  font-size: 11px;
  padding: 3px 7px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.05);
  color: var(--muted);
}

.synergyReqOwned {
  border-color: rgba(93,255,154,0.35);
  color: var(--green);
  background: rgba(93,255,154,0.08);
}

.synergyReqMissing {
  border-color: rgba(255,75,75,0.40);
  color: #ff8f8f;
  background: rgba(255,75,75,0.08);
}

.synergyUnlocked .synergyReqItem {
  border-color: rgba(93,255,154,0.25);
  color: var(--green);
  background: rgba(93,255,154,0.06);
}

@media (max-width: 700px) {
  .synergyGrid {
    grid-template-columns: 1fr;
  }
}

/* ==============================
   Boss UI (Phase 2.2)
   ============================== */
.bossHealthBar {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 380px;
  z-index: 15;
  pointer-events: none;
}

.bossHealthBarBg {
  background: rgba(0,0,0,0.72);
  border-radius: 12px;
  padding: 4px;
  border: 2px solid rgba(255,255,255,0.25);
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}

.bossHealthBarFill {
  height: 22px;
  border-radius: 8px;
  transition: width 0.15s linear;
}

.bossHealthBarText {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 13px;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
}

.bossNameDisplay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 25;
  pointer-events: none;
  text-align: center;
  animation: bossNameFadeIn 0.5s ease-out;
}

.bossNameText {
  font-size: 42px;
  font-weight: 900;
  text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
  letter-spacing: 0.02em;
}

.bossNameSubtitle {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 10px rgba(0,0,0,0.8);
  margin-top: 8px;
}

@keyframes bossNameFadeIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.bossNameFadeOut {
  animation: bossNameFadeOut 1s ease-in forwards;
}

@keyframes bossNameFadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.phaseIndicator {
  position: absolute;
  top: -2px;
  width: 3px;
  height: calc(100% + 4px);
  background: rgba(255,255,255,0.85);
  border-radius: 2px;
}

.phaseLabel {
  position: absolute;
  top: calc(100% + 4px);
  font-size: 10px;
  font-weight: 900;
  color: rgba(255,255,255,0.8);
  transform: translateX(-50%);
}

.weakPointHighlight {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  border: 3px solid rgba(66,214,255,0.7);
  box-shadow: 0 0 20px rgba(66,214,255,0.5), inset 0 0 20px rgba(66,214,255,0.2);
  animation: weakPointPulse 0.6s ease-in-out infinite alternate;
}

@keyframes weakPointPulse {
  from { transform: scale(1); opacity: 0.8; }
  to { transform: scale(1.15); opacity: 1; }
}

.weakPointLabel {
  position: absolute;
  font-weight: 900;
  font-size: 14px;
  color: #42d6ff;
  text-shadow: 0 0 14px #42d6ff;
  white-space: nowrap;
  pointer-events: none;
  animation: weakPointLabelPulse 0.6s ease-in-out infinite alternate;
}

@keyframes weakPointLabelPulse {
  from { opacity: 0.7; }
  to { opacity: 1; }
}

.crystalRainIndicator {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  border: 2px solid rgba(180,107,255,0.5);
  background: rgba(180,107,255,0.06);
  animation: crystalRainPulse 0.4s ease-in-out infinite alternate;
}

@keyframes crystalRainPulse {
  from { transform: scale(1); opacity: 0.6; }
  to { transform: scale(1.1); opacity: 1; }
}

@media (max-width: 700px) {
  .bossHealthBar {
    width: min(340px, calc(100vw - 40px));
  }
}


EchoVein/js/assets.js:
'use strict';

/*
 * Central sprite manifest and image loader.
 *
 * Rendering code must treat sprites as optional: drawSpriteCentered() returns
 * false if an image is missing or still loading, allowing the existing
 * procedural/vector fallback to run without crashing the game.
 */

const SPRITES = {
  // Existing/base resources and props.
  echoShard: 'assets/sprites/echo_shard_cluster.png',
  voltariteOre: 'assets/sprites/voltarite_ore.png',
  gildShard: 'assets/sprites/gild_shard_deposit.png',
  glowFungus: 'assets/sprites/glow_fungus.png',
  steamVent: 'assets/sprites/steam_vent.png',
  machineRuin: 'assets/sprites/broken_machine_ruin.png',
  sifterDrone: 'assets/sprites/sifter_drone.png',
  wardenDrone: 'assets/sprites/warden_drone.png',
  lavaRock: 'assets/sprites/lava_rock.png',

  // New sprite pack resources.
  ferriteBark: 'assets/sprites/ferrite_bark.png',
  luminaSpores: 'assets/sprites/lumina_spores.png',
  aetherQuartz: 'assets/sprites/aether_quartz.png',
  crysalithCluster: 'assets/sprites/crysalith_cluster.png',
  emberglassDeposit: 'assets/sprites/emberglass_deposit.png',

  // Enemies and enemy projectiles.
  hexShardEnemy: 'assets/sprites/hex_shard_enemy.png',
  hexShardWarningGlow: 'assets/sprites/hex_shard_warning_glow.png',
  hexBoomerangProjectile: 'assets/sprites/hex_boomerang_projectile.png',
  hollowTyrantBoss: 'assets/sprites/hollow_tyrant_boss.png',
  eliteShellbackEnemy: 'assets/sprites/elite_shellback_enemy.png',
  enemyRedBullet: 'assets/sprites/enemy_red_bullet.png',
  destructiveEnemyBullet: 'assets/sprites/destructive_enemy_bullet.png',

  // Player weapons, abilities, overlays, and VFX.
  lavaFragmentDebris: 'assets/sprites/lava_fragment_debris.png',
  hammerfallMissile: 'assets/sprites/hammerfall_missile.png',
  targetLockReticle: 'assets/sprites/target_lock_reticle.png',
  pathfinderTrap: 'assets/sprites/pathfinder_trap.png',
  arcConnectionIcon: 'assets/sprites/arc_connection_icon.png',
  vectorBurstIcon: 'assets/sprites/vector_burst_icon.png',
  extractionCraft: 'assets/sprites/extraction_craft.png',

  // Borecaster Seismic Charge throwable bomb sprites and VFX.
  borecasterBombIdle: 'assets/sprites/borecaster_bomb_idle.png',
  borecasterBombLit: 'assets/sprites/borecaster_bomb_lit.png',
  borecasterBombDouble: 'assets/sprites/borecaster_bomb_double.png',
  borecasterBombTriple: 'assets/sprites/borecaster_bomb_triple.png',
  borecasterBombCountIcon: 'assets/sprites/borecaster_bomb_count_upgrade_icon.png',
  borecasterBombFuseIcon: 'assets/sprites/borecaster_bomb_fuse_upgrade_icon.png',
  borecasterBombRadiusIcon: 'assets/sprites/borecaster_bomb_radius_upgrade_icon.png',
  borecasterBombExplosionCore: 'assets/sprites/borecaster_bomb_explosion_core.png',
  borecasterBombExplosionFragments: 'assets/sprites/borecaster_bomb_explosion_fragments.png',
  borecasterBombExplosionShockwave: 'assets/sprites/borecaster_bomb_explosion_shockwave.png',
  borecasterBombExplosionSmoke: 'assets/sprites/borecaster_bomb_explosion_smoke.png',
  borecasterBombThrowTrail: 'assets/sprites/borecaster_bomb_throw_trail.png',
  borecasterBombFuseSpark: 'assets/sprites/borecaster_bomb_fuse_spark.png',
  borecasterBombLandingMarker: 'assets/sprites/borecaster_bomb_landing_marker.png',


  // Explosion VFX pack.
  explosionCoreFlash01: 'assets/sprites/vfx/explosion_core_flash_01.png',
  explosionCoreFlash02: 'assets/sprites/vfx/explosion_core_flash_02.png',
  explosionFireball01: 'assets/sprites/vfx/explosion_fireball_01.png',
  explosionFireball02: 'assets/sprites/vfx/explosion_fireball_02.png',
  explosionRingBlast01: 'assets/sprites/vfx/explosion_ring_blast_01.png',
  explosionRingBlast02: 'assets/sprites/vfx/explosion_ring_blast_02.png',
  explosionFragmentBurst01: 'assets/sprites/vfx/explosion_fragment_burst_01.png',
  explosionFragmentBurst02: 'assets/sprites/vfx/explosion_fragment_burst_02.png',
  explosionSmokeBloom01: 'assets/sprites/vfx/explosion_smoke_bloom_01.png',
  explosionSmokeBloom02: 'assets/sprites/vfx/explosion_smoke_bloom_02.png',
  explosionShockwave01: 'assets/sprites/vfx/explosion_shockwave_01.png',
  explosionShockwave02: 'assets/sprites/vfx/explosion_shockwave_02.png',
  explosionSparkBurst01: 'assets/sprites/vfx/explosion_spark_burst_01.png',
  explosionSparkBurst02: 'assets/sprites/vfx/explosion_spark_burst_02.png',
  explosionLavaBurst01: 'assets/sprites/vfx/explosion_lava_burst_01.png',
  explosionLavaBurst02: 'assets/sprites/vfx/explosion_lava_burst_02.png',
  explosionHexShardBurst01: 'assets/sprites/vfx/explosion_hex_shard_burst_01.png',
  explosionHexShardBurst02: 'assets/sprites/vfx/explosion_hex_shard_burst_02.png',
  explosionArcOverload01: 'assets/sprites/vfx/explosion_arc_overload_01.png',
  explosionArcOverload02: 'assets/sprites/vfx/explosion_arc_overload_02.png',
  explosionVfxPreviewSheet: 'assets/sprites/vfx/explosion_vfx_preview_sheet.png',

  // New enemy roster sprites. These live in assets/sprites/enemies/ so the
  // gameplay code can swap sprites through IDs instead of hardcoded paths.
  clawlingRunner: 'assets/sprites/enemies/clawling_runner.png',
  needleWisp: 'assets/sprites/enemies/needle_wisp.png',
  shellbackGuard: 'assets/sprites/enemies/shellback_guard.png',
  blisterPod: 'assets/sprites/enemies/blister_pod.png',
  hexShardThrower: 'assets/sprites/enemies/hex_shard_thrower.png',
  sporeMother: 'assets/sprites/enemies/spore_mother.png',
  emberCrawler: 'assets/sprites/enemies/ember_crawler.png',
  crystalLancer: 'assets/sprites/enemies/crystal_lancer.png',
  voidMite: 'assets/sprites/enemies/void_mite.png',
  acidTick: 'assets/sprites/enemies/acid_tick.png',
  ironMaw: 'assets/sprites/enemies/iron_maw.png',
  stormOrb: 'assets/sprites/enemies/storm_orb.png',
  riftStalker: 'assets/sprites/enemies/rift_stalker.png',
  boneSkitter: 'assets/sprites/enemies/bone_skitter.png',
  magmaBurrower: 'assets/sprites/enemies/magma_burrower.png',
  echoSiren: 'assets/sprites/enemies/echo_siren.png',
  fractureBeetle: 'assets/sprites/enemies/fracture_beetle.png',
  gloomBat: 'assets/sprites/enemies/gloom_bat.png',
  obsidianTitan: 'assets/sprites/enemies/obsidian_titan.png',
  hollowTyrantVariant: 'assets/sprites/enemies/hollow_tyrant_variant.png',

  // Phase 2.2: Boss sprites
  hexShardColossus: 'assets/sprites/hex_shard_colossus.png',
  moltenMaw: 'assets/sprites/molten_maw.png',
  bossCrystalShard: 'assets/sprites/crystal_shard_projectile.png',
  bossFireball: 'assets/sprites/fireball_projectile.png',
  bossShockwave: 'assets/sprites/shockwave_ring.png',
  crystalRainIndicator: 'assets/sprites/crystal_rain_indicator.png',
  fireTrail: 'assets/sprites/fire_trail.png',
  bossWeakPoint: 'assets/sprites/boss_weak_point.png',
  bossHealthBarFrame: 'assets/sprites/boss_health_bar_frame.png',
  bossNamePlate: 'assets/sprites/boss_name_plate.png'
};

// Compatibility alias used by older rendering code.
const SPRITE_PATHS = SPRITES;

// Separate enemy-sprite view requested by the new sprite-pack instructions.
const ENEMY_SPRITES = {
  clawlingRunner: SPRITES.clawlingRunner,
  needleWisp: SPRITES.needleWisp,
  shellbackGuard: SPRITES.shellbackGuard,
  blisterPod: SPRITES.blisterPod,
  hexShardThrower: SPRITES.hexShardThrower,
  sporeMother: SPRITES.sporeMother,
  emberCrawler: SPRITES.emberCrawler,
  crystalLancer: SPRITES.crystalLancer,
  voidMite: SPRITES.voidMite,
  acidTick: SPRITES.acidTick,
  ironMaw: SPRITES.ironMaw,
  stormOrb: SPRITES.stormOrb,
  riftStalker: SPRITES.riftStalker,
  boneSkitter: SPRITES.boneSkitter,
  magmaBurrower: SPRITES.magmaBurrower,
  echoSiren: SPRITES.echoSiren,
  fractureBeetle: SPRITES.fractureBeetle,
  gloomBat: SPRITES.gloomBat,
  obsidianTitan: SPRITES.obsidianTitan,
  hollowTyrantVariant: SPRITES.hollowTyrantVariant,
};


const EXPLOSION_VFX_SPRITES = {
  coreFlash: ['explosionCoreFlash01','explosionCoreFlash02'],
  fireball: ['explosionFireball01','explosionFireball02'],
  ringBlast: ['explosionRingBlast01','explosionRingBlast02'],
  fragmentBurst: ['explosionFragmentBurst01','explosionFragmentBurst02'],
  smokeBloom: ['explosionSmokeBloom01','explosionSmokeBloom02'],
  shockwave: ['explosionShockwave01','explosionShockwave02'],
  sparkBurst: ['explosionSparkBurst01','explosionSparkBurst02'],
  lavaBurst: ['explosionLavaBurst01','explosionLavaBurst02'],
  hexShardBurst: ['explosionHexShardBurst01','explosionHexShardBurst02'],
  arcOverload: ['explosionArcOverload01','explosionArcOverload02'],
};

const BORECASTER_BOMB_VFX_SPRITES = {
  core: 'borecasterBombExplosionCore',
  fragments: 'borecasterBombExplosionFragments',
  shockwave: 'borecasterBombExplosionShockwave',
  smoke: 'borecasterBombExplosionSmoke',
  trail: 'borecasterBombThrowTrail',
  spark: 'borecasterBombFuseSpark',
  marker: 'borecasterBombLandingMarker'
};

const spriteImages = Object.create(null);
const spriteLoadState = Object.create(null);
let spritePreloadPromise = null;

function loadSprites(spriteMap = SPRITES){
  const entries = Object.entries(spriteMap);
  spritePreloadPromise = Promise.all(entries.map(([id, url]) => new Promise(resolve => {
    const img = new Image();
    spriteLoadState[id] = { id, url, ok:false, loaded:false, width:0, height:0 };
    img.onload = () => {
      spriteImages[id] = img;
      spriteLoadState[id] = { id, url, ok:true, loaded:true, width:img.naturalWidth, height:img.naturalHeight };
      resolve(spriteLoadState[id]);
    };
    img.onerror = () => {
      console.warn('Failed to load sprite', id, url);
      spriteImages[id] = null;
      spriteLoadState[id] = { id, url, ok:false, loaded:true, width:0, height:0 };
      resolve(spriteLoadState[id]);
    };
    img.src = url;
  })));
  return spritePreloadPromise;
}

function getSprite(id){
  return spriteImages[id] || null;
}

function isSpriteReady(id){
  return !!spriteImages[id];
}

function getSpriteLoadReport(){
  return Object.keys(SPRITES).map(id => spriteLoadState[id] || { id, url:SPRITES[id], ok:false, loaded:false, width:0, height:0 });
}

function drawSpriteCentered(ctx, spriteId, x, y, w, h, options = {}){
  const img = getSprite(spriteId);
  if(!img) return false;
  const rotation = options.rotation || 0;
  const alpha = options.alpha ?? 1;
  const glowColor = options.glowColor || null;
  const glowBlur = options.glowBlur || 0;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(options.flipX ? -1 : 1, options.flipY ? -1 : 1);
  if(glowColor && glowBlur){
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowBlur;
  }
  ctx.drawImage(img, -w/2, -h/2, w, h);
  ctx.restore();
  return true;
}

function spriteIconHtml(spriteId, fallbackText=''){
  const src = SPRITES[spriteId];
  if(!src) return fallbackText;
  return `<img class="spriteIcon" src="${src}" alt="" draggable="false">`;
}

loadSprites();


EchoVein/js/core.js:
'use strict';

/* Core state, configuration, DOM references, data dictionaries, helpers, and canvas resize. */

const GAME_TITLE = 'Echo Vein';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

// Logical cave tile sizing.  This test build increases every block by 1.5x.
// Set TILE_SIZE_SCALE back to 1.0 for direct A/B comparison with the previous build.
const TILE_SIZE_BASE = 36;
const TILE_SIZE_SCALE = 1;
const TILE = Math.round(TILE_SIZE_BASE * TILE_SIZE_SCALE);
const MAP_W = 96;
const MAP_H = 96;
const WORLD_W = MAP_W * TILE;
const WORLD_H = MAP_H * TILE;

const TILE_EMPTY = 0;
const TILE_ROCK = 1;
const TILE_HARD = 2;
const TILE_GOLD = 3;
const TILE_NITRA = 4;
const TILE_CRYSTAL = 5;
const TILE_LAVA_ROCK = 6;
const TILE_FERRITE_BARK = 7;
const TILE_LUMINA_SPORES = 8;
const TILE_AETHER_QUARTZ = 9;
const TILE_CRYSALITH = 10;
const TILE_EMBERGLASS = 11;

const MINERALS = {
  gild: { id: 'gild', displayName: 'Gild Shards', shortName: 'Gild', color: '#ffcc4d', sprite: 'gildShard' },
  voltarite: { id: 'voltarite', displayName: 'Voltarite', shortName: 'Voltarite', color: '#ff5b5b', sprite: 'voltariteOre' },
  echo: { id: 'echo', displayName: 'Echo Shards', shortName: 'Echo', color: '#42d6ff', sprite: 'echoShard' },
  ferriteBark: { id: 'ferriteBark', displayName: 'Ferrite Bark', shortName: 'Ferrite', color: '#aab3bd', sprite: 'ferriteBark', missionEligible: true, rarity: 'common' },
  luminaSpores: { id: 'luminaSpores', displayName: 'Lumina Spores', shortName: 'Lumina', color: '#5dff9a', sprite: 'luminaSpores', missionEligible: true, rarity: 'uncommon' },
  aetherQuartz: { id: 'aetherQuartz', displayName: 'Aether Quartz', shortName: 'Aether', color: '#b46bff', sprite: 'aetherQuartz', missionEligible: true, rarity: 'rare' },
  crysalith: { id: 'crysalith', displayName: 'Crysalith', shortName: 'Crysalith', color: '#aeefff', sprite: 'crysalithCluster', missionEligible: true, rarity: 'uncommon' },
  emberglass: { id: 'emberglass', displayName: 'Emberglass', shortName: 'Emberglass', color: '#ff9f43', sprite: 'emberglassDeposit', missionEligible: true, rarity: 'uncommon' },
  crust: { id: 'crust', displayName: 'Crust Stone', shortName: 'Crust', color: '#3a342f' },
  ironbasalt: { id: 'ironbasalt', displayName: 'Ironbasalt', shortName: 'Ironbasalt', color: '#302b2a' },
  lavaRock: { id: 'lavaRock', displayName: 'Lava Rock', shortName: 'Lava Rock', color: '#7a2417', sprite: 'lavaRock' }
};

const TILE_DATA = {
  [TILE_ROCK]: MINERALS.crust,
  [TILE_HARD]: MINERALS.ironbasalt,
  [TILE_GOLD]: MINERALS.gild,
  [TILE_NITRA]: MINERALS.voltarite,
  [TILE_CRYSTAL]: MINERALS.echo,
  [TILE_FERRITE_BARK]: MINERALS.ferriteBark,
  [TILE_LUMINA_SPORES]: MINERALS.luminaSpores,
  [TILE_AETHER_QUARTZ]: MINERALS.aetherQuartz,
  [TILE_CRYSALITH]: MINERALS.crysalith,
  [TILE_EMBERGLASS]: MINERALS.emberglass,
  [TILE_LAVA_ROCK]: MINERALS.lavaRock
};

const OBSTACLE_TYPES = {
  lavaRock: {
    id: 'lavaRock',
    displayName: 'Lava Rock',
    tile: TILE_LAVA_ROCK,
    mineable: false,
    blocksMovement: true,
    blocksProjectiles: true,
    blocksPathfinding: true,
    sprite: 'lavaRock'
  }
};

const RUN_RESOURCE_IDS = ['gild','voltarite','echo','ferriteBark','luminaSpores','aetherQuartz','crysalith','emberglass'];
const MISSION_RESOURCE_IDS = ['gild','voltarite','ferriteBark','luminaSpores','aetherQuartz','crysalith','emberglass'];

const RESOURCE_TILE_TYPES = [
  { tile:TILE_GOLD, resourceId:'gild', weight:0.35, minCluster:3, maxCluster:9, hp:32 },
  { tile:TILE_NITRA, resourceId:'voltarite', weight:0.20, minCluster:2, maxCluster:6, hp:32 },
  { tile:TILE_CRYSTAL, resourceId:'echo', weight:0.14, minCluster:2, maxCluster:5, hp:45 },
  { tile:TILE_FERRITE_BARK, resourceId:'ferriteBark', weight:0.12, minCluster:3, maxCluster:7, hp:34 },
  { tile:TILE_LUMINA_SPORES, resourceId:'luminaSpores', weight:0.08, minCluster:2, maxCluster:5, hp:26 },
  { tile:TILE_AETHER_QUARTZ, resourceId:'aetherQuartz', weight:0.035, minCluster:1, maxCluster:3, hp:54 },
  { tile:TILE_CRYSALITH, resourceId:'crysalith', weight:0.055, minCluster:2, maxCluster:4, hp:42 },
  { tile:TILE_EMBERGLASS, resourceId:'emberglass', weight:0.07, minCluster:2, maxCluster:5, hp:38 }
];

const WEAPON_DATA = {
  vectorBurst: { name: 'Vector Burst', type:'multiDirectionCommon', spriteId:'vectorBurstIcon' },
  minigun: { name: 'Rotary Mauler' },
  carbine: { name: 'Vector Carbine' },
  flamer: { name: 'Thermal Lance' },
  borecasterBomb: { name: 'Seismic Charge', allowedClasses: ['borecaster'], type:'timedThrowableBomb', spriteId:'borecasterBombLit' },
  hammerfallSalvo: { name: 'Hammerfall Salvo', allowedClasses: ['bulwark'], type: 'guidedMissileSalvo', spriteId:'hammerfallMissile' },
  satchel: { name: 'Seismic Charge' },
  drones: { name: 'Warden Drones' },
  boomerang: { name: 'Return Disc' },
  arc: { name: 'Storm Lattice', spriteId:'arcConnectionIcon' },
  rail: { name: 'Bore Rail' },
  sweeper: { name: 'Sifter Drone' }
};


const PERF_STATES = {
  HEALTHY: 'PERF_HEALTHY',
  WARNING: 'PERF_WARNING',
  CRITICAL: 'PERF_CRITICAL',
  RECOVERING: 'PERF_RECOVERING'
};

const PERFORMANCE_CONFIG = {
  sampleWindowSeconds: 3.0,
  healthyFps: 55,
  warningFps: 42,
  criticalFps: 42,
  recoveryFps: 52,
  recoveryHoldSeconds: 3.0,
  healthyHoldSeconds: 5.0,
  baseMaxEnemies: 120,
  minMaxEnemies: 35,
  maxEnemyBulletsHealthy: 180,
  maxEnemyBulletsWarning: 120,
  maxEnemyBulletsCritical: 70,
  maxEnemyBulletsRecovering: 105,
  criticalDespawnPerSecond: 3,
  despawnDistance: 780,
  cameraMargin: 180
};

const SETTINGS_KEY = 'echoVeinSettings';
const DEFAULT_SETTINGS = {
  fogOfWarEnabled: true,
  fogOfWarRadius: 280,
  fogOfWarSoftEdge: 160,
  fogOfWarIntensity: 0.78,
  fogOfWarMemoryEnabled: false,
  manualMouseControlEnabled: true
};
let gameSettings = loadSettings();

function normalizeSettings(settings){
  return {...DEFAULT_SETTINGS, ...(settings || {})};
}

function loadSettings(){
  try{
    const raw = localStorage.getItem(SETTINGS_KEY);
    return normalizeSettings(raw ? JSON.parse(raw) : null);
  }catch(err){
    console.warn('Could not load Echo Vein settings.', err);
    return normalizeSettings(null);
  }
}

function saveSettings(){
  try{ localStorage.setItem(SETTINGS_KEY, JSON.stringify(gameSettings)); }
  catch(err){ console.warn('Could not save Echo Vein settings.', err); }
}

function getFogSettings(){
  return normalizeSettings(gameSettings);
}

function setFogOfWarEnabled(enabled){
  gameSettings.fogOfWarEnabled = !!enabled;
  saveSettings();
}

function setManualMouseControlEnabled(enabled){
  gameSettings.manualMouseControlEnabled = !!enabled;
  saveSettings();
}

function setFogIntensityPreset(preset){
  const presets = {
    low: { fogOfWarRadius: 340, fogOfWarSoftEdge: 190, fogOfWarIntensity: 0.58 },
    medium: { fogOfWarRadius: 280, fogOfWarSoftEdge: 160, fogOfWarIntensity: 0.78 },
    high: { fogOfWarRadius: 230, fogOfWarSoftEdge: 140, fogOfWarIntensity: 0.88 }
  };
  Object.assign(gameSettings, presets[preset] || presets.medium);
  saveSettings();
}


const keys = new Set();
let mouse = { x: 0, y: 0, down: false, lastMove: -999, used: false };
let gamepadButtonsPrev = [];
let lastTime = performance.now();
let game = null;
let paused = false;
let awaitingUpgrade = false;
let shake = 0;
let logTimeout = 0;

const ui = {
  timer: document.getElementById('timer'),
  hpFill: document.getElementById('hpFill'), hpLabel: document.getElementById('hpLabel'),
  xpFill: document.getElementById('xpFill'), xpLabel: document.getElementById('xpLabel'),
  heatFill: document.getElementById('heatFill'), heatLabel: document.getElementById('heatLabel'),
  level: document.getElementById('level'), depth: document.getElementById('depth'),
  gold: document.getElementById('gold'), nitra: document.getElementById('nitra'), kills: document.getElementById('kills'),
  weaponList: document.getElementById('weaponList'), logList: document.getElementById('logList'),
  startOverlay: document.getElementById('startOverlay'), upgradeOverlay: document.getElementById('upgradeOverlay'),
  gameOverOverlay: document.getElementById('gameOverOverlay'),
  startTitle: document.getElementById('startTitle'), startText: document.getElementById('startText'),
  menuMeta: document.getElementById('menuMeta'), menuButtons: document.getElementById('menuButtons'), menuContent: document.getElementById('menuContent'),
  classCards: document.getElementById('classCards'), upgradeCards: document.getElementById('upgradeCards'),
  gameOverText: document.getElementById('gameOverText'), damageFlash: document.getElementById('damageFlash'),
  soundBtn: document.getElementById('soundBtn'), volumeSlider: document.getElementById('volumeSlider')
};

const CLASSES = [
  { id: 'bulwark', icon: 'B', name: 'Bulwark', desc: 'Heavy armour, high endurance, and a Rotary Mauler built for sustained pressure.', tag: 'Armoured DPS', hp: 140, speed: 185, weapon: 'minigun' },
  { id: 'pathfinder', icon: 'P', name: 'Pathfinder', desc: 'Fast utility operator with a Vector Carbine, stronger dash, and a deployable trap kit.', tag: 'Mobility', hp: 105, speed: 235, weapon: 'carbine' },
  { id: 'borecaster', icon: 'C', name: 'Borecaster', desc: 'Mining and thermal-control specialist with better heat capacity and a Thermal Lance.', tag: 'Mining Control', hp: 125, speed: 195, weapon: 'flamer' }
];

const UPGRADE_POOL = [
  { icon:'💥', name:'Kinetic Rounds', desc:'+18% projectile damage.', apply:g=>g.player.damageMul*=1.18 },
  { icon:'⚡', name:'Trigger Discipline', desc:'+14% fire rate on all automatic weapons.', apply:g=>g.player.fireRateMul*=1.14 },
  { icon:'🎯', name:'Targeting Optics', desc:'+10% weapon accuracy. Projectile spread becomes tighter.', apply:g=>{ g.player.accuracy = clamp((g.player.accuracy || 0.35) + 0.10, 0, 1); g.player.accuracyBonus = (g.player.accuracyBonus || 0) + 0.10; log(g, `Weapon accuracy improved to ${Math.round(g.player.accuracy*100)}%.`); } },
  { icon:'🔫', name:'Extra Barrel', desc:'+1 projectile for bullet weapons.', apply:g=>g.player.extraProjectiles++ },
  { icon:'✳️', spriteId:'vectorBurstIcon', name:'Vector Burst', desc:'Unlocks a common multi-direction weapon that fires a symmetrical spread at targets.', available:g=>!g.weapons.find(w=>w.id==='vectorBurst'), apply:g=>addOrLevelWeapon(g,'vectorBurst') },
  { icon:'➕', spriteId:'vectorBurstIcon', name:'Splitfire Array', desc:'Vector Burst gains +1 firing direction. No maximum cap.', available:g=>!!g.weapons.find(w=>w.id==='vectorBurst'), apply:g=>upgradeVectorBurst(g,'count') },
  { icon:'💠', spriteId:'vectorBurstIcon', name:'Vector Focusing', desc:'+15% Vector Burst damage.', available:g=>!!g.weapons.find(w=>w.id==='vectorBurst'), apply:g=>upgradeVectorBurst(g,'damage') },
  { icon:'⚡', spriteId:'vectorBurstIcon', name:'Vector Accelerator', desc:'+12% Vector Burst projectile speed and range.', available:g=>!!g.weapons.find(w=>w.id==='vectorBurst'), apply:g=>upgradeVectorBurst(g,'speed') },
  { icon:'⏱️', spriteId:'vectorBurstIcon', name:'Vector Relay', desc:'+14% Vector Burst fire rate.', available:g=>!!g.weapons.find(w=>w.id==='vectorBurst'), apply:g=>upgradeVectorBurst(g,'rate') },
  { icon:'🛡️', name:'Armour Plates', desc:'+25 max HP and repair 20 HP.', apply:g=>{g.player.maxHp+=25; g.player.hp=Math.min(g.player.maxHp,g.player.hp+20);} },
  { icon:'👟', name:'Mag Boots', desc:'+10% movement speed.', apply:g=>g.player.speedMul*=1.10 },
  { icon:'🧲', name:'Resonance Magnet', desc:'+35% Echo Shard and mineral pickup range.', apply:g=>g.player.pickupMul*=1.35 },
  { icon:'🖱️', name:'Targeting Cursor', desc:'Unlock mouse-guided targeting. Move the cursor near a Hollowborn to bias player weapons toward it.', requiresMouseControl:true, available:g=>!g.player.mouseTargeting, apply:g=>{ g.player.mouseTargeting=true; log(g,'Targeting Cursor linked. Move the mouse to guide player weapons.'); } },
  { icon:'🔗', spriteId:'arcConnectionIcon', name:'Arc Connection', desc:'Right-click enemies to chain them with green links. Right-click empty space with 2+ selected to detonate.', apply:g=>{ g.arcConnection.unlocked=true; g.arcConnection.level++; g.arcConnection.maxTargets=1+g.arcConnection.level; log(g, `Arc Connection Mk ${g.arcConnection.level}: ${g.arcConnection.maxTargets} target chain ready.`); } },
  { icon:'🔷', name:'Sifter Drone', desc:'Adds a utility drone that roams out and collects Echo Shards for you.', apply:g=>addOrLevelWeapon(g,'sweeper') },
  { icon:'⛏️', name:'Tungsten Bore Bit', desc:'+35% mining speed and less heat per tile.', apply:g=>{g.player.mineMul*=1.35; g.player.heatEfficiency*=0.86;} },
  { icon:'❄️', name:'Cryo Coolant', desc:'Tool cools faster and overheats less often.', apply:g=>{g.player.coolMul*=1.35; g.player.maxHeat+=20;} },
  { icon:'🧨', name:'Seismic Charge', desc:'Adds a periodic explosion around the nearest swarm.', apply:g=>addOrLevelWeapon(g,'satchel') },
  { icon:'🚀', spriteId:'hammerfallMissile', name:'Hammerfall Salvo', desc:'Unlocks Bulwark guided missile salvo.', allowedClasses:['bulwark'], available:g=>g.player.classId==='bulwark' && !g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>unlockHammerfallSalvo(g) },
  { icon:'💥', name:'Warhead Yield', desc:'+15% Hammerfall missile damage.', allowedClasses:['bulwark'], available:g=>!!g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>upgradeHammerfall(g,'damage') },
  { icon:'🔥', name:'Hot-Burn Motors', desc:'+12% Hammerfall missile speed.', allowedClasses:['bulwark'], available:g=>!!g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>upgradeHammerfall(g,'speed') },
  { icon:'⛽', name:'Extended Fuel Cells', desc:'+15% Hammerfall missile flight time.', allowedClasses:['bulwark'], available:g=>!!g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>upgradeHammerfall(g,'fuel') },
  { icon:'➕', name:'Extra Launch Tubes', desc:'Hammerfall fires one additional missile per salvo.', allowedClasses:['bulwark'], available:g=>!!g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>upgradeHammerfall(g,'count') },
  { icon:'🎯', spriteId:'targetLockReticle', name:'Redlock Guidance', desc:'Hammerfall missiles track more accurately with less guidance noise.', allowedClasses:['bulwark'], available:g=>!!g.weapons.find(w=>w.id==='hammerfallSalvo'), apply:g=>upgradeHammerfall(g,'accuracy') },
  { icon:'💣', spriteId:'borecasterBombLit', name:'Seismic Charge', desc:'Unlocks a Borecaster-only throwable timed bomb with layered blast VFX.', allowedClasses:['borecaster'], available:g=>g.player.classId==='borecaster' && !g.weapons.find(w=>w.id==='borecasterBomb'), apply:g=>unlockBorecasterBomb(g) },
  { icon:'➕', spriteId:'borecasterBombCountIcon', name:'Extra Charges', desc:'+1 bomb thrown per Seismic Charge use.', allowedClasses:['borecaster'], available:g=>!!g.weapons.find(w=>w.id==='borecasterBomb'), apply:g=>upgradeBorecasterBomb(g,'count') },
  { icon:'⏱️', spriteId:'borecasterBombFuseIcon', name:'Short Fuse', desc:'Reduces Seismic Charge fuse time with a safe minimum clamp.', allowedClasses:['borecaster'], available:g=>!!g.weapons.find(w=>w.id==='borecasterBomb'), apply:g=>upgradeBorecasterBomb(g,'fuse') },
  { icon:'🟠', spriteId:'borecasterBombRadiusIcon', name:'Blast Radius', desc:'Increases Seismic Charge explosion radius and area control.', allowedClasses:['borecaster'], available:g=>!!g.weapons.find(w=>w.id==='borecasterBomb'), apply:g=>upgradeBorecasterBomb(g,'radius') },
  { icon:'🛸', name:'Warden Drone Bay', desc:'Adds autonomous Warden Drones that roam and fire micro-bullets.', apply:g=>addOrLevelWeapon(g,'drones') },
  { icon:'➕', name:'Drone Bay Expansion', desc:'Adds more Warden Drones and improves their bullet damage.', apply:g=>{ addOrLevelWeapon(g,'drones'); addOrLevelWeapon(g,'drones'); g.player.droneDamageMul*=1.12; } },
  { icon:'🤖', name:'Drone Targeting AI', desc:'Warden Drones roam faster and fire more aggressively.', apply:g=>{ if(!g.weapons.find(w=>w.id==='drones')) addOrLevelWeapon(g,'drones'); g.player.droneSpeedMul*=1.18; g.player.droneFireRateMul*=1.30; } },
  { icon:'📡', name:'Drone Patrol Radius', desc:'Warden Drones roam farther from the operator and hit harder.', apply:g=>{ if(!g.weapons.find(w=>w.id==='drones')) addOrLevelWeapon(g,'drones'); g.player.droneOrbitMul*=1.20; g.player.droneDamageMul*=1.18; } },
  { icon:'🔍', name:'Sifter Optics', desc:'Unlocks the Sifter Drone if needed and increases its Echo Shard search radius.', apply:g=>{ if(!g.weapons.find(w=>w.id==='sweeper')) addOrLevelWeapon(g,'sweeper'); g.player.sweeperRangeMul*=1.35; } },
  { icon:'💨', name:'Sifter Turbo', desc:'Sifter Drones move faster and collect Echo Shards more aggressively.', apply:g=>{ if(!g.weapons.find(w=>w.id==='sweeper')) addOrLevelWeapon(g,'sweeper'); g.player.sweeperSpeedMul*=1.30; g.player.sweeperCollectMul*=1.18; } },
  { icon:'🪃', name:'Return Disc', desc:'Adds a returning disc that slices through Hollowborn on the way out and back.', apply:g=>addOrLevelWeapon(g,'boomerang') },
  { icon:'🌩️', spriteId:'arcConnectionIcon', name:'Storm Lattice', desc:'Adds chain lightning between nearby enemies.', apply:g=>addOrLevelWeapon(g,'arc') },
  { icon:'☄️', name:'Bore Rail', desc:'Adds a heavy piercing rail shot.', apply:g=>addOrLevelWeapon(g,'rail') },
  { icon:'❤️', name:'Field Reclaimer', desc:'Every 18 kills restore 8 HP.', apply:g=>g.player.vampire+=8 },
  { icon:'📦', name:'Supply Cache', desc:'Spend 15 Voltarite to gain full repair now, otherwise +20 max HP.', apply:g=>{ if(g.nitra>=15){g.nitra-=15; g.player.hp=g.player.maxHp;} else {g.player.maxHp+=20; g.player.hp+=20;} } },
  { icon:'🪤', spriteId:'pathfinderTrap', name:'Trap Payload', desc:'Pathfinder traps gain larger blast radius and more damage. Other operators unlock emergency traps.', apply:g=>{ g.player.trapDamageMul*=1.30; g.player.trapRadiusMul*=1.15; g.player.canUseTraps=true; } },
  { icon:'💣', name:'Explosive Ammo', desc:'Bullets gain small area damage.', apply:g=>g.player.splash+=10 },
];

function rand(a,b){ return a + Math.random()*(b-a); }
function randi(a,b){ return Math.floor(rand(a,b+1)); }
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function dist2(ax,ay,bx,by){ const dx=ax-bx, dy=ay-by; return dx*dx+dy*dy; }
function len(x,y){ return Math.hypot(x,y) || 1; }
function lerp(a,b,t){ return a+(b-a)*t; }
function nowSec(){ return game ? game.time : 0; }
function weaponName(id){ return WEAPON_DATA[id]?.name || id; }

function gamepadVector(){
  if(!navigator.getGamepads) return { dx:0, dy:0, active:false };
  const pads = navigator.getGamepads();
  for(const pad of pads){
    if(!pad) continue;
    const ax = pad.axes?.[0] || 0;
    const ay = pad.axes?.[1] || 0;
    const mag = Math.hypot(ax, ay);
    if(mag > 0.18){
      const scaled = clamp((mag - 0.18) / 0.82, 0, 1);
      return { dx: ax / mag * scaled, dy: ay / mag * scaled, active:true };
    }
  }
  return { dx:0, dy:0, active:false };
}

function gamepadButtonPressed(index){
  if(!navigator.getGamepads) return false;
  let isDown = false;
  const pads = navigator.getGamepads();
  for(const pad of pads){
    if(pad?.buttons?.[index]?.pressed){
      isDown = true;
      break;
    }
  }
  const wasDown = !!gamepadButtonsPrev[index];
  gamepadButtonsPrev[index] = isDown;
  return isDown && !wasDown;
}


const GAMEPAD = {
  // Standard Gamepad API button mapping:
  // A=0, B=1, X=2, Y=3.
  // User control rule: X is the left-mouse/primary-action equivalent.
  A:0, B:1, X:2, Y:3,
  DPAD_UP:12, DPAD_DOWN:13, DPAD_LEFT:14, DPAD_RIGHT:15,
  LEFT_DEADZONE:0.35,
  RIGHT_DEADZONE:0.22,
  CURSOR_SPEED:860
};

let gamepadState = {
  connected:false,
  id:'',
  padIndex:null,
  prevButtons:[],
  buttons:[],
  axes:[0,0,0,0],
  leftX:0,
  leftY:0,
  rightX:0,
  rightY:0
};


// Real-time manual aim clock.  Game time can pause/freeze during menus or
// transitions, so controller cursor/manual aim state also uses browser time.
let manualAimLastMoveRealTime = -999;

let menuGamepadState = {
  selectedIndex:0,
  lastMoveTime:-999,
  moveRepeatDelay:0.20,
  lastSignature:''
};

function getPrimaryGamepad(){
  if(!navigator.getGamepads) return null;
  const pads=navigator.getGamepads();
  if(gamepadState.padIndex!=null){
    const known=pads[gamepadState.padIndex];
    if(known && known.connected !== false) return known;
    gamepadState.padIndex=null;
  }
  for(const pad of pads){
    if(pad && pad.connected !== false){ gamepadState.padIndex=pad.index; return pad; }
  }
  return null;
}

function pollGamepadState(){
  const pad=getPrimaryGamepad();
  gamepadState.prevButtons=gamepadState.buttons || [];
  if(!pad){
    gamepadState.connected=false;
    gamepadState.buttons=[];
    gamepadState.axes=[0,0,0,0];
    gamepadState.leftX=gamepadState.leftY=gamepadState.rightX=gamepadState.rightY=0;
    return gamepadState;
  }
  gamepadState.connected=true;
  gamepadState.id=pad.id || 'Gamepad';
  gamepadState.buttons=Array.from(pad.buttons || [], b=>!!b.pressed);
  gamepadState.axes=Array.from(pad.axes || []);
  gamepadState.leftX=gamepadState.axes[0] || 0;
  gamepadState.leftY=gamepadState.axes[1] || 0;
  gamepadState.rightX=gamepadState.axes[2] || 0;
  gamepadState.rightY=gamepadState.axes[3] || 0;
  return gamepadState;
}

function gamepadPressed(index){
  return !!gamepadState.buttons[index] && !gamepadState.prevButtons[index];
}

function gamepadHeld(index){
  return !!gamepadState.buttons[index];
}

function gamepadPressedAny(indices){
  return indices.some(index=>gamepadPressed(index));
}

function gamepadHeldAny(indices){
  return indices.some(index=>gamepadHeld(index));
}

function getGamepadLeftNav(){
  /*
   * Navigation source used by menus and upgrade cards.
   *
   * Some pads expose D-pad as buttons 12-15, some as axes 6/7, while the
   * standard left stick uses axes 0/1.  Read all of these so the power-up menu
   * is not silently locked to one controller mapping.
   */
  const x=gamepadState.leftX || 0, y=gamepadState.leftY || 0;
  const axes=gamepadState.axes || [];
  const dpadButtonX=(gamepadHeld(GAMEPAD.DPAD_RIGHT)?1:0) - (gamepadHeld(GAMEPAD.DPAD_LEFT)?1:0);
  const dpadButtonY=(gamepadHeld(GAMEPAD.DPAD_DOWN)?1:0) - (gamepadHeld(GAMEPAD.DPAD_UP)?1:0);
  const dpadAxisX=Math.abs(axes[6] || 0)>GAMEPAD.LEFT_DEADZONE ? Math.sign(axes[6]) : 0;
  const dpadAxisY=Math.abs(axes[7] || 0)>GAMEPAD.LEFT_DEADZONE ? Math.sign(axes[7]) : 0;
  const stickX=Math.abs(x)>GAMEPAD.LEFT_DEADZONE ? Math.sign(x) : 0;
  const stickY=Math.abs(y)>GAMEPAD.LEFT_DEADZONE ? Math.sign(y) : 0;
  const nx = dpadButtonX || dpadAxisX || stickX;
  const ny = dpadButtonY || dpadAxisY || stickY;
  return {x:nx,y:ny,active:!!(nx||ny)};
}

function currentManualAimActive(g){
  if(!g || !mouse.used) return false;
  if(!getFogSettings().manualMouseControlEnabled) return false;
  const realNow = performance.now()/1000;
  const gameRecent = g.time - mouse.lastMove < 2;
  const realRecent = realNow - manualAimLastMoveRealTime < 2;
  return !!(gameRecent || realRecent);
}

function activeAimWorld(g){
  const realNow = performance.now()/1000;
  const c = g?.controllerCursor;
  if(c?.active && ((g.time - c.lastMoveTime < 2) || (realNow - (c.lastMoveRealTime ?? -999) < 2))){
    return {x:c.worldX, y:c.worldY};
  }
  return { x:g.camera.x + mouse.x, y:g.camera.y + mouse.y };
}

function triggerDash(g, source='input'){
  if(!g || g.state!=='playing' || awaitingUpgrade) return false;
  const p=g.player;
  const cd = p.classId==='pathfinder'?1.4:2.4;
  if(p.dashCd>0) return false;
  p.dashCd=cd;
  p.dashT=0.15;
  if(g.runStats) g.runStats.dashesUsed=(g.runStats.dashesUsed||0)+1;
  sfx('dash');
  return true;
}

function getGamepadRightVector(){
  /*
   * Right-stick axes are usually 2/3 on standard Xbox-style pads, but some
   * browser/driver combinations expose them as 3/4, 2/5, or 4/5.  The previous
   * implementation read only axes 2/3, so on some pads the cursor could appear
   * to move once and then stop.  Pick the strongest plausible right-stick pair
   * each frame and treat it as continuous analogue input, not as an edge event.
   */
  const axes = gamepadState.axes || [];
  const pairs = [[2,3],[3,4],[2,5],[4,5]];
  let best = {x:0,y:0,mag:0,pair:null};
  for(const [ix,iy] of pairs){
    if(ix>=axes.length || iy>=axes.length) continue;
    const x = axes[ix] || 0;
    const y = axes[iy] || 0;
    const mag = Math.hypot(x,y);
    if(mag > best.mag) best = {x,y,mag,pair:[ix,iy]};
  }
  if(best.mag <= GAMEPAD.RIGHT_DEADZONE) return {x:0,y:0,active:false,mag:0,pair:best.pair};
  const scaled = clamp((best.mag-GAMEPAD.RIGHT_DEADZONE)/(1-GAMEPAD.RIGHT_DEADZONE),0,1);
  return {x:best.x/best.mag*scaled, y:best.y/best.mag*scaled, active:true, mag:best.mag, pair:best.pair};
}

function syncControllerCursorWorld(g){
  if(!g?.controllerCursor) return;
  g.controllerCursor.worldX = g.camera.x + g.controllerCursor.screenX;
  g.controllerCursor.worldY = g.camera.y + g.controllerCursor.screenY;
}

function moveControllerCursor(g,dt){
  if(!g) return;
  const c=g.controllerCursor;
  if(!c) return;
  const rv=getGamepadRightVector();
  const realNow = performance.now()/1000;
  if(rv.active){
    c.active=true;
    c.screenX=clamp((c.screenX ?? innerWidth/2) + rv.x*GAMEPAD.CURSOR_SPEED*dt, 0, innerWidth);
    c.screenY=clamp((c.screenY ?? innerHeight/2) + rv.y*GAMEPAD.CURSOR_SPEED*dt, 0, innerHeight);
    c.lastMoveTime=g.time;
    c.lastMoveRealTime=realNow;
    c.axisPair=rv.pair;
    syncControllerCursorWorld(g);
    mouse.x=c.screenX;
    mouse.y=c.screenY;
    mouse.used=true;
    mouse.lastMove=g.time;
    manualAimLastMoveRealTime=realNow;
  } else if(c.active){
    syncControllerCursorWorld(g);
    if((g.time - c.lastMoveTime > 2) && (realNow - (c.lastMoveRealTime ?? -999) > 2)) c.active=false;
  }
}


function menuInputClock(){
  // Menus pause/freeze game.time, so controller repeat timing must use
  // the browser's real clock. This fixes stick/D-pad navigation only moving
  // once in the level-up/power-up menu.
  return performance.now()/1000;
}

function visibleMenuGamepadElements(){
  if(!ui.startOverlay?.classList?.contains('show')) return [];
  const selectors = [
    '#menuButtons button',
    '#classCards .card[data-class-id]',
    '#menuContent button',
    '#menuContent input[type="checkbox"]'
  ];
  return selectors
    .flatMap(sel=>Array.from(ui.startOverlay.querySelectorAll(sel)))
    .filter(el=>{
      if(el.disabled) return false;
      const style=getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
    });
}

function refreshMenuGamepadSelection(elements=visibleMenuGamepadElements()){
  elements.forEach((el,i)=>{
    const selected=i===menuGamepadState.selectedIndex;
    el.classList.toggle('controllerSelected', selected);
    el.setAttribute('aria-selected', selected ? 'true' : 'false');
    if(selected && document.activeElement!==el){
      try{ el.focus({preventScroll:true}); }catch(_){ el.focus(); }
    }
  });
}

function updateMenuGamepadInput(dt){
  if(!ui.startOverlay?.classList?.contains('show')) return false;
  const elements=visibleMenuGamepadElements();
  if(!elements.length) return false;
  const signature=elements.map(el=>el.textContent || el.dataset.classId || el.id || el.tagName).join('|');
  if(signature!==menuGamepadState.lastSignature){
    menuGamepadState.lastSignature=signature;
    menuGamepadState.selectedIndex=0;
    menuGamepadState.lastMoveTime=-999;
  }
  menuGamepadState.selectedIndex=clamp(menuGamepadState.selectedIndex,0,elements.length-1);
  const nav=getGamepadLeftNav();
  const t=menuInputClock();
  if(nav.active && t-menuGamepadState.lastMoveTime>=menuGamepadState.moveRepeatDelay){
    const step=(nav.x>0 || nav.y>0) ? 1 : -1;
    menuGamepadState.selectedIndex=(menuGamepadState.selectedIndex+step+elements.length)%elements.length;
    menuGamepadState.lastMoveTime=t;
  }
  refreshMenuGamepadSelection(elements);
  if(gamepadPressedAny([GAMEPAD.A, GAMEPAD.X])){
    const el=elements[menuGamepadState.selectedIndex];
    if(el){
      if(el.type==='checkbox') el.checked=!el.checked;
      el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
      return true;
    }
  }
  if(gamepadPressed(GAMEPAD.B)){
    const back=elements.find(el=>/back|main menu|cancel|close/i.test(el.textContent || ''));
    if(back){ back.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window})); return true; }
  }
  return true;
}

function resizeCanvas(){
  canvas.width = Math.floor(window.innerWidth * DPR);
  canvas.height = Math.floor(window.innerHeight * DPR);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();


EchoVein/js/render-ui.js:
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
    const spriteId = cfg.spriteId || e.spriteId;
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
  const y = 12;

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


