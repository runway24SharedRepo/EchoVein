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
  extractionCraft: 'assets/sprites/extraction_craft.png'
};

// Compatibility alias used by older rendering code.
const SPRITE_PATHS = SPRITES;

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
