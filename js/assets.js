'use strict';

/* Optional sprite loader. Rendering code keeps procedural fallbacks if images are missing. */

const SPRITE_PATHS = {
  echoShard: 'assets/sprites/echo_shard_cluster.png',
  voltariteOre: 'assets/sprites/voltarite_ore.png',
  gildShard: 'assets/sprites/gild_shard_deposit.png',
  glowFungus: 'assets/sprites/glow_fungus.png',
  steamVent: 'assets/sprites/steam_vent.png',
  machineRuin: 'assets/sprites/broken_machine_ruin.png',
  sifterDrone: 'assets/sprites/sifter_drone.png',
  wardenDrone: 'assets/sprites/warden_drone.png',
  lavaRock: 'assets/sprites/lava_rock.png'
};

const sprites = Object.create(null);

function loadSprites(){
  for(const [id, src] of Object.entries(SPRITE_PATHS)){
    const img = new Image();
    img.onload = () => { sprites[id] = img; };
    img.onerror = () => { sprites[id] = null; };
    img.src = src;
  }
}

function getSprite(id){
  return sprites[id] || null;
}

loadSprites();
