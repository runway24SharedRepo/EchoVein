'use strict';

/* Main loop, browser input, buttons, polyfills, and startup. */

function loop(t){
  const rawDt=Math.max(0.001,(t-lastTime)/1000);
  const dt=Math.min(0.033,rawDt);
  lastTime=t;
  if(typeof updateGamepadInput === 'function') updateGamepadInput(dt);
  if(game && typeof updatePerformanceMonitor === 'function') updatePerformanceMonitor(game,rawDt);
  if(game) update(game,dt);
  render(game);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

addEventListener('keydown',e=>{
  resumeAudio();
  const pressureOpen = awaitingPressureChoice || document.getElementById('pressureObjectiveOverlay')?.classList?.contains('show');
  if(pressureOpen){
    if(['Enter','Space','KeyA','KeyY'].includes(e.code)){
      e.preventDefault();
      e.stopPropagation();
      if(typeof choosePressureObjectiveOffer === 'function') choosePressureObjectiveOffer(true,e);
      return;
    }
    if(['Escape','Backspace','KeyB','KeyN'].includes(e.code)){
      e.preventDefault();
      e.stopPropagation();
      if(typeof choosePressureObjectiveOffer === 'function') choosePressureObjectiveOffer(false,e);
      return;
    }
  }
  keys.add(e.code);
  if(e.code==='Space' && game && game.state==='playing' && !awaitingUpgrade && !awaitingPressureChoice){
    triggerDash(game,'keyboard');
    e.preventDefault();
  }
  if(e.code==='KeyP'){ paused=!paused; }
  if(e.code==='KeyM'){ toggleMute(); }
  if(e.code==='KeyR' && game){ restartGame(); }
  if(e.code==='KeyE' && game && typeof placeTrap === 'function'){
    if(placeTrap(game)) e.preventDefault();
  }
});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('mousemove',e=>{
  setMouseFromClientPoint(e.clientX, e.clientY);
  mouse.used=true;
  mouse.lastMove=game ? game.time : 0;
  if(game?.controllerCursor) game.controllerCursor.active=false;
});
addEventListener('mousedown',e=>{
  setMouseFromClientPoint(e.clientX, e.clientY);
  mouse.used=true;
  mouse.lastMove=game ? game.time : 0;
  if(e.button===0){
    mouse.down=true;
    mouse._physicalDown=true;
    if(game?.player?.mouseTargeting) e.preventDefault();
  } else if(e.button===2 && game && typeof handleArcConnectionRightClick === 'function'){
    if(handleArcConnectionRightClick(game)) e.preventDefault();
  }
});
addEventListener('mouseup',e=>{
  if(e.button===0){ mouse.down=false; mouse._physicalDown=false; }
});
addEventListener('contextmenu',e=>{
  if(game?.arcConnection?.unlocked) e.preventDefault();
});

function isOverlayOpenForScrollLock(){
  const startOpen = ui.startOverlay?.classList?.contains('show');
  const upgradeOpen = ui.upgradeOverlay?.classList?.contains('show');
  const gameOverOpen = ui.gameOverOverlay?.classList?.contains('show');
  const statsOpen = document.getElementById('runStatsOverlay')?.classList?.contains('show');
  const pressureOpen = document.getElementById('pressureObjectiveOverlay')?.classList?.contains('show');

  return !!(startOpen || upgradeOpen || gameOverOpen || statsOpen || pressureOpen);
}

function isInsideAllowedScrollArea(target){
  if(!(target instanceof Element)) return false;

  return !!target.closest(
    '#menuContent, #classCards, #upgradeCards, #runStatsBody, #pressureObjectiveChoices, ' +
    '.debugPanel, .spriteTestPanel, .runStatsModal, .upgradeCategorySection, .pressureObjectiveModal'
  );
}

function wheelPixels(e, panel){
  let dx = e.deltaX || 0;
  let dy = e.deltaY || 0;

  // deltaMode: 0=pixels, 1=lines, 2=pages
  if(e.deltaMode === 1){ dx *= 16; dy *= 16; }
  else if(e.deltaMode === 2){
    const page = panel?.clientHeight || 600;
    dx *= page;
    dy *= page;
  }

  return {dx,dy};
}

function routeOverlayWheel(e){
  const panel = typeof activeOverlayScrollPanel === 'function'
    ? activeOverlayScrollPanel(e.target)
    : null;

  if(!panel) return false;

  const {dx,dy} = wheelPixels(e,panel);

  // If the target is a horizontally scrollable upgrade table and the wheel is
  // mostly vertical, use Shift+wheel or natural horizontal trackpad movement for
  // horizontal scroll; otherwise vertical wheel scrolls the active panel.
  const horizontalTarget = e.target instanceof Element
    ? e.target.closest('.upgradeCategorySection')
    : null;

  if(horizontalTarget && (e.shiftKey || Math.abs(dx)>Math.abs(dy))){
    scrollOverlayPanelBy(horizontalTarget, dx || dy, 0);
  } else {
    scrollOverlayPanelBy(panel, dx, dy);
  }

  return true;
}

window.addEventListener('wheel', e => {
  /*
    During menus, always route the mouse wheel to the active internal scroll
    panel. Do not require the pointer to be exactly over the scroll panel;
    otherwise wheeling over the title/padding/buttons feels like the menu is
    broken. We still prevent the outer itch iframe/browser page from bouncing.
  */
  if(isOverlayOpenForScrollLock()){
    routeOverlayWheel(e);
    e.preventDefault();
    return;
  }

  /* During gameplay, prevent the browser/itch page from scrolling. */
  if(game?.state === 'playing'){
    e.preventDefault();
  }
}, { passive:false });

window.addEventListener('touchmove', e => {
  if(isOverlayOpenForScrollLock()){
    // CSS touch-action: pan-y allows native touch scroll inside panels; this is
    // only a safety net for touches outside those panels.
    if(isInsideAllowedScrollArea(e.target)) return;
    e.preventDefault();
    return;
  }

  if(game?.state === 'playing'){
    e.preventDefault();
  }
}, { passive:false });

function eachChangedTouch(e, fn){
  const touches = e.changedTouches || [];
  for(let i=0;i<touches.length;i++){
    if(fn(touches[i])) return true;
  }
  return false;
}

function handleVirtualJoystickTouchStart(e){
  if(isOverlayOpenForScrollLock()) return;
  if(typeof startVirtualJoystickTouch !== 'function') return;
  if(eachChangedTouch(e, touch => startVirtualJoystickTouch(touch))){
    resumeAudio();
    e.preventDefault();
  }
}

function handleVirtualJoystickTouchMove(e){
  if(typeof moveVirtualJoystickTouch !== 'function') return;
  if(eachChangedTouch(e, touch => moveVirtualJoystickTouch(touch))){
    e.preventDefault();
  }
}

function handleVirtualJoystickTouchEnd(e){
  if(typeof endVirtualJoystickTouch !== 'function') return;
  if(eachChangedTouch(e, touch => endVirtualJoystickTouch(touch))){
    e.preventDefault();
  }
}

window.addEventListener('touchstart', handleVirtualJoystickTouchStart, { passive:false });
window.addEventListener('touchmove', handleVirtualJoystickTouchMove, { passive:false });
window.addEventListener('touchend', handleVirtualJoystickTouchEnd, { passive:false });
window.addEventListener('touchcancel', handleVirtualJoystickTouchEnd, { passive:false });

addEventListener('blur',()=>{
  mouse.down=false;
  if(typeof resetVirtualJoystick === 'function') resetVirtualJoystick();
});

addEventListener('gamepadconnected',e=>{
  gamepadState.padIndex=e.gamepad.index;
  gamepadState.connected=true;
  gamepadState.id=e.gamepad.id || 'Gamepad';
  if(game) log(game, `${gamepadState.id} connected.`);
});
addEventListener('gamepaddisconnected',e=>{
  if(gamepadState.padIndex===e.gamepad.index){
    gamepadState.padIndex=null;
    gamepadState.connected=false;
  }
});
ui.soundBtn.addEventListener('click',()=>{ resumeAudio(); toggleMute(); });
ui.volumeSlider.addEventListener('input',e=>{ resumeAudio(); setAudioVolume(Number(e.target.value)/100); });

window.addEventListener('error', ev=>{
  if(typeof showDebugError === 'function') showDebugError('Runtime error in game loop or input handler.', ev.error || ev.message);
});

// Polyfill for older canvas implementations that lack roundRect.
if(!CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
    r=Math.min(r,w/2,h/2); this.beginPath(); this.moveTo(x+r,y); this.arcTo(x+w,y,x+w,y+h,r); this.arcTo(x+w,y+h,x,y+h,r); this.arcTo(x,y+h,x,y,r); this.arcTo(x,y,x+w,y,r); this.closePath(); return this;
  };
}

/*
 * Splash Screen — King Peng Studio logo
 *
 * createSplashScreen() builds the full-screen overlay and appends it to body.
 * hideSplashScreen() adds the 'hidden' class for a 0.8s fade-out, then removes
 * the element from the DOM after the transition completes.
 *
 * The startup sequence waits for both:
 *   1. The sprite preload promise to resolve
 *   2. At least 3 real seconds to elapse (minimum splash display time)
 * Whichever comes last triggers the fade-out. A 5-second hard timeout prevents
 * the splash from hanging indefinitely if sprite loading stalls.
 */
// main.js

let gameSplashElement = null;
let studioSplashElement = null;

/* ── Game Splash ──────────────────────────────────────────────────── */
function createGameSplash() {
  const existing = document.querySelector('.gameSplash');
  if (existing) return existing;

  const div = document.createElement('div');
  div.className = 'gameSplash';

  const img = document.createElement('img');
  img.src = SPRITES.gameSplash;
  img.alt = 'Echo Vein';
  // Make the image fill the container while preserving aspect ratio
  img.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  `;

  // Fallback if image fails to load
  img.onerror = function() {
    this.style.display = 'none';
    const fallback = document.createElement('div');
    fallback.textContent = 'Echo Vein';
    fallback.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      font-weight: 900;
      color: #fff;
      width: 100%;
      height: 100%;
      background: #07090d;
    `;
    div.appendChild(fallback);
  };

  div.appendChild(img);
  document.body.appendChild(div);
  gameSplashElement = div;
  return div;
}

function hideGameSplash() {
  if (!gameSplashElement) return;
  gameSplashElement.classList.add('hidden');
  // remove after transition
  setTimeout(() => {
    if (gameSplashElement && gameSplashElement.parentNode) {
      gameSplashElement.parentNode.removeChild(gameSplashElement);
    }
  }, 900);
}

/* ── Studio Splash ────────────────────────────────────────────────── */
function createStudioSplash() {
  const existing = document.querySelector('.splashScreen');
  if (existing) return existing;

  const div = document.createElement('div');
  div.className = 'splashScreen';

  const img = document.createElement('img');
  img.className = 'splashLogo';
  img.src = SPRITES.kingPengLogo512 || SPRITES.kingPengLogo256 || '';
  img.alt = 'King Peng Studio';
  img.onerror = function(){
    this.style.display = 'none';
    const fallback = document.createElement('div');
    fallback.style.cssText = 'font-size:48px;font-weight:900;color:#eef3ff;text-align:center;';
    fallback.textContent = 'King Peng Studio';
    this.parentNode.insertBefore(fallback, this);
  };
  div.appendChild(img);

  const loading = document.createElement('div');
  loading.className = 'splashLoading';
  loading.textContent = 'Loading';
  const spinInterval = setInterval(() => {
    const dots = loading.textContent.match(/\./g) || [];
    loading.textContent = 'Loading' + (dots.length >= 3 ? '' : '.'.repeat(dots.length + 1));
  }, 420);
  div._loadingInterval = spinInterval;
  div.appendChild(loading);

  const credit = document.createElement('div');
  credit.className = 'splashStudio';
  credit.textContent = 'King Peng Studio';
  div.appendChild(credit);

  document.body.appendChild(div);
  studioSplashElement = div;
  return div;
}

function hideStudioSplash() {
  const splash = studioSplashElement || document.querySelector('.splashScreen');
  if (!splash) return;
  if (splash._loadingInterval) clearInterval(splash._loadingInterval);
  splash.classList.add('hidden');
  setTimeout(() => {
    if (splash.parentNode) splash.parentNode.removeChild(splash);
  }, 900);
}

/* ── Startup Sequence ────────────────────────────────────────────── */

// Show game splash immediately
createGameSplash();

// After 3 seconds, switch to studio splash
setTimeout(() => {
  hideGameSplash();
  createStudioSplash();
}, 3000);

// Wait for sprites + minimum studio display time (2s)
const SPLASH_STUDIO_MIN_MS = 2000;   // studio splash visible at least 2s
const SPLASH_STUDIO_MAX_MS = 5000;   // hard timeout

const readyPromise = typeof spritePreloadPromise !== 'undefined' && spritePreloadPromise
  ? spritePreloadPromise
  : Promise.resolve();

Promise.all([
  readyPromise,
  new Promise(resolve => setTimeout(resolve, SPLASH_STUDIO_MIN_MS))
]).then(() => {
  hideStudioSplash();
  // Give the fade transition time before showing the menu
  setTimeout(() => {
    if (typeof startupFlow === 'function') startupFlow();
  }, 200);
});

// Hard timeout – force-hide studio splash after 5s if stuck
setTimeout(() => {
  const splash = document.querySelector('.splashScreen');
  if (splash && !splash.classList.contains('hidden')) {
    hideStudioSplash();
    setTimeout(() => {
      if (typeof startupFlow === 'function') startupFlow();
    }, 200);
  }
}, SPLASH_STUDIO_MAX_MS);

// Keep the existing input bindings
bindStartCardInput();


