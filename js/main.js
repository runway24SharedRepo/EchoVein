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
  keys.add(e.code);
  if(e.code==='Space' && game && game.state==='playing' && !awaitingUpgrade){
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
  mouse.x=e.clientX;
  mouse.y=e.clientY;
  mouse.used=true;
  mouse.lastMove=game ? game.time : 0;
  if(game?.controllerCursor) game.controllerCursor.active=false;
});
addEventListener('mousedown',e=>{
  mouse.x=e.clientX;
  mouse.y=e.clientY;
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
addEventListener('blur',()=>{ mouse.down=false; });

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
function createSplashScreen(){
  const existing = document.querySelector('.splashScreen');
  if(existing) return existing;

  const div = document.createElement('div');
  div.className = 'splashScreen';

  // Logo image — use the 512px sprite displayed at 256x256 for crisp HiDPI rendering
  const img = document.createElement('img');
  img.className = 'splashLogo';
  img.src = SPRITES.kingPengLogo512 || SPRITES.kingPengLogo256 || '';
  img.alt = 'King Peng Studio';
  // Fallback: if no sprite path is registered, show a text fallback
  img.onerror = function(){
    this.style.display = 'none';
    const fallback = document.createElement('div');
    fallback.style.cssText = 'font-size:48px;font-weight:900;color:#eef3ff;text-align:center;';
    fallback.textContent = 'King Peng Studio';
    this.parentNode.insertBefore(fallback, this);
  };
  div.appendChild(img);

  // "Loading..." text with animated dots via JS interval
  const loading = document.createElement('div');
  loading.className = 'splashLoading';
  loading.textContent = 'Loading';
  const spinInterval = setInterval(() => {
    const dots = loading.textContent.match(/\./g) || [];
    loading.textContent = 'Loading' + (dots.length >= 3 ? '' : '.'.repeat(dots.length + 1));
  }, 420);
  // Store the interval so it can be cleared on hide
  div._loadingInterval = spinInterval;
  div.appendChild(loading);

  // Studio credit
  const credit = document.createElement('div');
  credit.className = 'splashStudio';
  credit.textContent = 'King Peng Studio';
  div.appendChild(credit);

  document.body.appendChild(div);
  return div;
}

function hideSplashScreen(){
  const splash = document.querySelector('.splashScreen');
  if(!splash) return;
  // Clear the loading dots interval
  if(splash._loadingInterval) clearInterval(splash._loadingInterval);
  splash.classList.add('hidden');
  // Remove from DOM after the 0.8s fade-out transition completes
  setTimeout(() => {
    if(splash.parentNode) splash.parentNode.removeChild(splash);
  }, 900);
}

// ── Startup Sequence ────────────────────────────────────────────────────
// Show splash immediately, then wait for sprites + minimum time.
const splashScreen = createSplashScreen();
const SPLASH_MIN_MS = 3000;   // minimum splash display time
const SPLASH_MAX_MS = 5000;   // hard timeout

const readyPromise = typeof spritePreloadPromise !== 'undefined' && spritePreloadPromise
  ? spritePreloadPromise
  : Promise.resolve();

Promise.all([
  readyPromise,
  new Promise(resolve => setTimeout(resolve, SPLASH_MIN_MS))
]).then(() => {
  hideSplashScreen();
  // Give the fade transition time before showing the menu
  setTimeout(() => {
    if(typeof startupFlow === 'function') startupFlow();
  }, 200);
});

// Hard timeout — force-hide splash after 5 seconds even if sprites haven't loaded
setTimeout(() => {
  const splash = document.querySelector('.splashScreen');
  if(splash && !splash.classList.contains('hidden')){
    hideSplashScreen();
    setTimeout(() => {
      if(typeof startupFlow === 'function') startupFlow();
    }, 200);
  }
}, SPLASH_MAX_MS);

// Keep the existing input bindings
bindStartCardInput();
