'use strict';

/* Procedural Web Audio sound effects and ambience. */

const audio = {
  ctx: null,
  master: null,
  ambience: null,
  unlocked: false,
  muted: false,
  volume: 0.42,
  last: Object.create(null)
};

function ensureAudio(){
  if(audio.ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return false;
  audio.ctx = new AC();
  audio.master = audio.ctx.createGain();
  audio.master.gain.value = audio.muted ? 0 : audio.volume;
  audio.master.connect(audio.ctx.destination);
  audio.unlocked = true;
  startAmbience();
  return true;
}

function resumeAudio(){
  if(!ensureAudio()) return;
  if(audio.ctx.state === 'suspended') audio.ctx.resume();
}

function setAudioVolume(v){
  audio.volume = clamp(v,0,1);
  if(audio.master) audio.master.gain.setTargetAtTime(audio.muted ? 0 : audio.volume, audio.ctx.currentTime, 0.02);
}

function toggleMute(){
  audio.muted = !audio.muted;
  if(audio.master) audio.master.gain.setTargetAtTime(audio.muted ? 0 : audio.volume, audio.ctx.currentTime, 0.02);
  ui.soundBtn.textContent = audio.muted ? 'Muted' : 'Sound';
}

function tone(freq, dur=0.08, type='sine', gain=0.08, slideTo=null){
  if(audio.muted || !ensureAudio()) return;
  const t = audio.ctx.currentTime;
  const osc = audio.ctx.createOscillator();
  const g = audio.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if(slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t+dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t+0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
  osc.connect(g); g.connect(audio.master);
  osc.start(t); osc.stop(t+dur+0.03);
}

function noise(dur=0.08, gain=0.08, lowpass=1800){
  if(audio.muted || !ensureAudio()) return;
  const sr = audio.ctx.sampleRate;
  const buffer = audio.ctx.createBuffer(1, Math.max(1, Math.floor(sr*dur)), sr);
  const data = buffer.getChannelData(0);
  for(let i=0;i<data.length;i++) data[i] = Math.random()*2-1;
  const src = audio.ctx.createBufferSource();
  const filter = audio.ctx.createBiquadFilter();
  const g = audio.ctx.createGain();
  filter.type='lowpass'; filter.frequency.value=lowpass;
  const t=audio.ctx.currentTime;
  g.gain.setValueAtTime(gain,t);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  src.buffer=buffer; src.connect(filter); filter.connect(g); g.connect(audio.master);
  src.start(t); src.stop(t+dur+0.03);
}

function sfx(name, strength=1){
  if(!ensureAudio()) return;
  const t = audio.ctx.currentTime;
  const minGap = { shoot:0.055, flamer:0.09, mine:0.075, hit:0.04, pickup:0.035, kill:0.05, missileWhoosh:0.18, missileLock:0.10, missileLaunch:0.18, missileImpact:0.05 }[name] ?? 0;
  if(audio.last[name] && t-audio.last[name] < minGap) return;
  audio.last[name] = t;
  const k = Math.max(0.35, Math.min(1.6, strength));
  switch(name){
    case 'start': tone(164,0.08,'triangle',0.06); setTimeout(()=>tone(246,0.10,'triangle',0.06),70); break;
    case 'shoot': tone(190+Math.random()*70,0.045,'square',0.025*k,90); noise(0.035,0.018*k,1200); break;
    case 'missileLock': tone(980,0.035,'sine',0.025*k,1220); setTimeout(()=>tone(1220,0.035,'sine',0.02*k,980),42); break;
    case 'missileLaunch': tone(165,0.13,'sawtooth',0.045*k,95); noise(0.10,0.052*k,1300); break;
    case 'missileWhoosh': noise(0.10,0.018*k,1800); break;
    case 'missileImpact': tone(125,0.15,'sawtooth',0.065*k,45); tone(860,0.035,'triangle',0.03*k,360); noise(0.13,0.065*k,900); break;
    case 'flamer': noise(0.13,0.035*k,900); tone(70,0.06,'sawtooth',0.012*k,55); break;
    case 'rail': tone(90,0.16,'sawtooth',0.075*k,42); tone(880,0.05,'triangle',0.04*k,320); noise(0.13,0.055*k,2400); break;
    case 'explosion': tone(92,0.24,'sawtooth',0.08*k,32); noise(0.22,0.09*k,650); break;
    case 'arc': tone(760+Math.random()*180,0.09,'sawtooth',0.04*k,220); break;
    case 'mine': tone(120+Math.random()*60,0.045,'square',0.018*k,80); noise(0.035,0.025*k,900); break;
    case 'rockBreak': tone(95,0.09,'triangle',0.06*k,55); noise(0.12,0.055*k,1000); break;
    case 'mineral': tone(620,0.045,'sine',0.04*k); setTimeout(()=>tone(930,0.06,'sine',0.035*k),35); break;
    case 'pickup': tone(520+Math.random()*120,0.045,'sine',0.025*k,780); break;
    case 'level': tone(330,0.08,'triangle',0.055); setTimeout(()=>tone(494,0.08,'triangle',0.055),80); setTimeout(()=>tone(740,0.13,'triangle',0.06),160); break;
    case 'hit': tone(75,0.11,'sawtooth',0.08*k,45); noise(0.08,0.055*k,700); break;
    case 'kill': tone(230,0.05,'triangle',0.025*k,150); break;
    case 'wave': tone(196,0.18,'sawtooth',0.055,130); setTimeout(()=>tone(196,0.18,'sawtooth',0.055,130),230); break;
    case 'elite': tone(110,0.35,'sawtooth',0.07,55); setTimeout(()=>tone(82,0.35,'sawtooth',0.07,41),180); break;
    case 'dash': tone(310,0.06,'triangle',0.045,620); noise(0.05,0.03,2200); break;
    case 'gameover': tone(185,0.24,'triangle',0.06,130); setTimeout(()=>tone(123,0.35,'triangle',0.06,80),240); break;
  }
}

function startAmbience(){
  if(audio.ambience || !audio.ctx || !audio.master) return;
  const t = audio.ctx.currentTime;
  const osc = audio.ctx.createOscillator();
  const lfo = audio.ctx.createOscillator();
  const lfoGain = audio.ctx.createGain();
  const g = audio.ctx.createGain();
  osc.type='sine'; osc.frequency.value=46;
  lfo.type='sine'; lfo.frequency.value=0.09; lfoGain.gain.value=0.018;
  g.gain.value=0.018;
  lfo.connect(lfoGain); lfoGain.connect(g.gain); osc.connect(g); g.connect(audio.master);
  osc.start(t); lfo.start(t);
  audio.ambience = {osc,lfo,g};

}
