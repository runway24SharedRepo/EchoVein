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
  echoShard: "assets/sprites/echo_shard_cluster.png",
  voltariteOre: "assets/sprites/voltarite_ore.png",
  gildShard: "assets/sprites/gild_shard_deposit.png",
  glowFungus: "assets/sprites/glow_fungus.png",
  steamVent: "assets/sprites/steam_vent.png",
  machineRuin: "assets/sprites/broken_machine_ruin.png",
  sifterDrone: "assets/sprites/sifter_drone.png",
  wardenDrone: "assets/sprites/warden_drone.png",
  lavaRock: "assets/sprites/lava_rock.png",
  // Thermal Lance flame particles
  flameParticle01: "assets/sprites/vfx/flame_particle_01.png",
  flameParticle02: "assets/sprites/vfx/flame_particle_02.png",
  flameParticle03: "assets/sprites/vfx/flame_particle_03.png",
  flameParticle04: "assets/sprites/vfx/flame_particle_04.png",
  flameParticle05: "assets/sprites/vfx/flame_particle_05.png",
  flameParticle06: "assets/sprites/vfx/flame_particle_06.png",
  flameParticle07: "assets/sprites/vfx/flame_particle_07.png",
  flameParticle08: "assets/sprites/vfx/flame_particle_08.png",
  flameParticle09: "assets/sprites/vfx/flame_particle_09.png",
  flameParticle10: "assets/sprites/vfx/flame_particle_10.png",
  flameParticle11: "assets/sprites/vfx/flame_particle_11.png",
  flameParticle12: "assets/sprites/vfx/flame_particle_12.png",

  // New sprite pack resources.
  ferriteBark: "assets/sprites/ferrite_bark.png",
  luminaSpores: "assets/sprites/lumina_spores.png",
  aetherQuartz: "assets/sprites/aether_quartz.png",
  crysalithCluster: "assets/sprites/crysalith_cluster.png",
  emberglassDeposit: "assets/sprites/emberglass_deposit.png",

  // Enemies and enemy projectiles.
  hexShardEnemy: "assets/sprites/hex_shard_enemy.png",
  hexShardWarningGlow: "assets/sprites/hex_shard_warning_glow.png",
  hexBoomerangProjectile: "assets/sprites/hex_boomerang_projectile.png",
  hollowTyrantBoss: "assets/sprites/hollow_tyrant_boss.png",
  eliteShellbackEnemy: "assets/sprites/elite_shellback_enemy.png",
  enemyRedBullet: "assets/sprites/enemy_red_bullet.png",
  destructiveEnemyBullet: "assets/sprites/destructive_enemy_bullet.png",

  // Player weapons, abilities, overlays, and VFX.
  lavaFragmentDebris: "assets/sprites/lava_fragment_debris.png",
  hammerfallMissile: "assets/sprites/hammerfall_missile.png",
  targetLockReticle: "assets/sprites/target_lock_reticle.png",
  pathfinderTrap: "assets/sprites/pathfinder_trap.png",
  arcConnectionIcon: "assets/sprites/arc_connection_icon.png",
  vectorBurstIcon: "assets/sprites/vector_burst_icon.png",
  extractionCraft: "assets/sprites/extraction_craft.png",

  // Borecaster Seismic Charge throwable bomb sprites and VFX.
  borecasterBombIdle: "assets/sprites/borecaster_bomb_idle.png",
  borecasterBombLit: "assets/sprites/borecaster_bomb_lit.png",
  borecasterBombDouble: "assets/sprites/borecaster_bomb_double.png",
  borecasterBombTriple: "assets/sprites/borecaster_bomb_triple.png",
  borecasterBombCountIcon:
    "assets/sprites/borecaster_bomb_count_upgrade_icon.png",
  borecasterBombFuseIcon:
    "assets/sprites/borecaster_bomb_fuse_upgrade_icon.png",
  borecasterBombRadiusIcon:
    "assets/sprites/borecaster_bomb_radius_upgrade_icon.png",
  borecasterBombExplosionCore:
    "assets/sprites/borecaster_bomb_explosion_core.png",
  borecasterBombExplosionFragments:
    "assets/sprites/borecaster_bomb_explosion_fragments.png",
  borecasterBombExplosionShockwave:
    "assets/sprites/borecaster_bomb_explosion_shockwave.png",
  borecasterBombExplosionSmoke:
    "assets/sprites/borecaster_bomb_explosion_smoke.png",
  borecasterBombThrowTrail: "assets/sprites/borecaster_bomb_throw_trail.png",
  borecasterBombFuseSpark: "assets/sprites/borecaster_bomb_fuse_spark.png",
  borecasterBombLandingMarker:
    "assets/sprites/borecaster_bomb_landing_marker.png",

  // Explosion VFX pack.
  explosionCoreFlash01: "assets/sprites/vfx/explosion_core_flash_01.png",
  explosionCoreFlash02: "assets/sprites/vfx/explosion_core_flash_02.png",
  explosionFireball01: "assets/sprites/vfx/explosion_fireball_01.png",
  explosionFireball02: "assets/sprites/vfx/explosion_fireball_02.png",
  explosionRingBlast01: "assets/sprites/vfx/explosion_ring_blast_01.png",
  explosionRingBlast02: "assets/sprites/vfx/explosion_ring_blast_02.png",
  explosionFragmentBurst01:
    "assets/sprites/vfx/explosion_fragment_burst_01.png",
  explosionFragmentBurst02:
    "assets/sprites/vfx/explosion_fragment_burst_02.png",
  explosionSmokeBloom01: "assets/sprites/vfx/explosion_smoke_bloom_01.png",
  explosionSmokeBloom02: "assets/sprites/vfx/explosion_smoke_bloom_02.png",
  explosionShockwave01: "assets/sprites/vfx/explosion_shockwave_01.png",
  explosionShockwave02: "assets/sprites/vfx/explosion_shockwave_02.png",
  explosionSparkBurst01: "assets/sprites/vfx/explosion_spark_burst_01.png",
  explosionSparkBurst02: "assets/sprites/vfx/explosion_spark_burst_02.png",
  explosionLavaBurst01: "assets/sprites/vfx/explosion_lava_burst_01.png",
  explosionLavaBurst02: "assets/sprites/vfx/explosion_lava_burst_02.png",
  explosionHexShardBurst01:
    "assets/sprites/vfx/explosion_hex_shard_burst_01.png",
  explosionHexShardBurst02:
    "assets/sprites/vfx/explosion_hex_shard_burst_02.png",
  explosionArcOverload01: "assets/sprites/vfx/explosion_arc_overload_01.png",
  explosionArcOverload02: "assets/sprites/vfx/explosion_arc_overload_02.png",
  explosionVfxPreviewSheet:
    "assets/sprites/vfx/explosion_vfx_preview_sheet.png",

  // New enemy roster sprites. These live in assets/sprites/enemies/ so the
  // gameplay code can swap sprites through IDs instead of hardcoded paths.
  clawlingRunner: "assets/sprites/enemies/clawling_runner.png",
  needleWisp: "assets/sprites/enemies/needle_wisp.png",
  shellbackGuard: "assets/sprites/enemies/shellback_guard.png",
  blisterPod: "assets/sprites/enemies/blister_pod.png",
  hexShardThrower: "assets/sprites/enemies/hex_shard_thrower.png",
  sporeMother: "assets/sprites/enemies/spore_mother.png",
  emberCrawler: "assets/sprites/enemies/ember_crawler.png",
  crystalLancer: "assets/sprites/enemies/crystal_lancer.png",
  voidMite: "assets/sprites/enemies/void_mite.png",
  acidTick: "assets/sprites/enemies/acid_tick.png",
  ironMaw: "assets/sprites/enemies/iron_maw.png",
  stormOrb: "assets/sprites/enemies/storm_orb.png",
  riftStalker: "assets/sprites/enemies/rift_stalker.png",
  boneSkitter: "assets/sprites/enemies/bone_skitter.png",
  magmaBurrower: "assets/sprites/enemies/magma_burrower.png",
  echoSiren: "assets/sprites/enemies/echo_siren.png",
  fractureBeetle: "assets/sprites/enemies/fracture_beetle.png",
  gloomBat: "assets/sprites/enemies/gloom_bat.png",
  obsidianTitan: "assets/sprites/enemies/obsidian_titan.png",
  hollowTyrantVariant: "assets/sprites/enemies/hollow_tyrant_variant.png",

  // Operator class sprites
  bulwarkOperator: "assets/sprites/MainCharacters/bulwark_operator.png",
  pathfinderOperator: "assets/sprites/MainCharacters/pathfinder_operator.png",
  borecasterOperator: "assets/sprites/MainCharacters/borecaster_operator.png",

  // King Peng Studio logo sprites (splash screen)
  kingPengLogo512: "assets/sprites/KPSadmin/king_peng_logo_sprite_512.png",
  kingPengLogo256: "assets/sprites/KPSadmin/king_peng_logo_sprite_256.png",
  kingPengLogo128: "assets/sprites/KPSadmin/king_peng_logo_sprite_128.png",
  kingPengLogoTransparent:
    "assets/sprites/KPSadmin/king_peng_logo_transparent.png",
  kingPengLogoCropped:
    "assets/sprites/KPSadmin/king_peng_logo_sprite_cropped.png",

  // Phase 2.2: Boss sprites
  hexShardColossus: "assets/sprites/hex_shard_colossus.png",
  moltenMaw: "assets/sprites/molten_maw.png",
  bossCrystalShard: "assets/sprites/crystal_shard_projectile.png",
  bossFireball: "assets/sprites/fireball_projectile.png",
  bossShockwave: "assets/sprites/shockwave_ring.png",
  crystalRainIndicator: "assets/sprites/crystal_rain_indicator.png",
  fireTrail: "assets/sprites/fire_trail.png",
  bossWeakPoint: "assets/sprites/boss_weak_point.png",
  bossHealthBarFrame: "assets/sprites/boss_health_bar_frame.png",
  bossNamePlate: "assets/sprites/boss_name_plate.png",

  // assets.js – add this line inside SPRITES
  gameSplash: "assets/sprites/KPSadmin/echo_vein_splash_1280x720.png",
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
