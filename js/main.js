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

bindStartCardInput();
if(typeof spritePreloadPromise !== 'undefined' && spritePreloadPromise){
  spritePreloadPromise.finally(()=>startupFlow());
} else {
  startupFlow();
}
