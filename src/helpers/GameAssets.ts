
import Phaser from "phaser";

export function loadGameAssets(scene: Phaser.Scene): void {

    // Defenders
    //SHOOTER SPRITE AND ANIMATIONS
    //idle
    scene.load.spritesheet("shooter", "assets/defenders/shooter/Idle.png", {frameWidth:68, frameHeight: 72});
    //shoot 
    scene.load.spritesheet("shooter-shot", "assets/defenders/shooter/Shot_1.png",{frameWidth:68,frameHeight:72});
    //hurt
    scene.load.spritesheet("shooter-hurt","assets/defenders/shooter/Hurt.png",{frameWidth:68,frameHeight:72});
    //dead
    scene.load.spritesheet("shooter-dead","assets/defenders/shooter/Dead.png",{frameWidth:68, frameHeight:72});


    //GENERATOR SPRITE AND ANIMATIONS
    //idle
    scene.load.spritesheet("generator-idle-sheet","assets/defenders/generator/Idle.png",{frameWidth: 568, frameHeight: 648})
    //dead
    scene.load.spritesheet("generator-dead-sheet","assets/defenders/generator/Dead.png",{ frameWidth: 568, frameHeight: 648 });
    //hurt
    scene.load.spritesheet("generator-hurt-sheet","assets/defenders/generator/Hurt.png",{ frameWidth: 568, frameHeight: 648 });
    //icon
    scene.load.image("generator", "assets/defenders/generator.png");
    //defender upgrade effects
    scene.load.spritesheet("defenderAura", "assets/effects/aura.png", {frameWidth: 64, frameHeight: 64});

    scene.load.spritesheet("upgradeEffect", "assets/effects/upgradeD.png", {frameWidth: 64, frameHeight: 64});


    //BARRICADE SPRITE AND ANIMATIONS
    //icon
    scene.load.image("barricade", "assets/defenders/barricade.png");


    //DUALBARREL SPRITE AND ANIMATION
    //idle
    scene.load.spritesheet("dualbarrel-idle-sheet","assets/defenders/dualbarrel/Idle.png",{ frameWidth:96,frameHeight:96});
    //attack
    scene.load.spritesheet("dualbarrel-attack-sheet","assets/defenders/dualbarrel/Attack.png",{frameWidth:96,frameHeight:96});
    //hurt
    scene.load.spritesheet("dualbarrel-hurt-sheet","assets/defenders/dualbarrel/Hurt.png",{frameWidth:96,frameHeight:96});
    //dead
    scene.load.spritesheet("dualbarrel-dead-sheet","assets/defenders/dualbarrel/Dead.png",{frameWidth:96,frameHeight:96});



    scene.load.image("dualbarrel", "assets/defenders/dualbarrel.png");
    scene.load.image("cryogunner", "assets/defenders/cryogunner.png");
    scene.load.image("landmine", "assets/defenders/landmine.png");
    scene.load.image("scrapper", "assets/defenders/scrapper.png");

    // Enemies
    scene.load.image("meleeEnemy", "assets/enemies/meleerobot.png");
    scene.load.image("rangedEnemy", "assets/enemies/rangedEnemy.png");
    scene.load.image("crusherEnemy", "assets/enemies/crusherrobot.png");
    scene.load.image("overlord", "assets/enemies/overlord.png");
    scene.load.image("drone", "assets/enemies/drone.png");
    scene.load.image("hijacker", "assets/enemies/hijacker.png");

    // Effects
    scene.load.image("laser", "assets/effects/projectile.png");
    scene.load.image("energy", "assets/effects/energy.png");

    // UI
    scene.load.image("recall", "assets/ui/recall button.png");
    scene.load.image("move", "assets/ui/move.png");
    //stronghold healthbar
    scene.load.image("stronghold-hp-frame","assets/ui/stronghold-hp-frame.png")
    scene.load.image("stronghold-hp-fill","assets/ui/stronghold-hp-fill.png")

    // Stronghold and battlefield
    scene.load.image("stronghold", "assets/stronghold/stronghold_wall.png");
    scene.load.image("battlefield", "assets/backgrounds/battlefield.png");

    // AUDIO
    //Music
    scene.load.audio("backgroundMusic", "assets/sounds/backgroundMusic.m4a");
    scene.load.audio("bossMusic", "assets/sounds/bossMusic.mp3");
   
    // Defender sounds
    scene.load.audio("sfx_shooter_fire", "assets/sounds/sfx/defenders/shooter_fire.mp3");
    scene.load.audio("sfx_shooter_fire_alt", "assets/sounds/sfx/defenders/shooter_fire_alt.mp3");
    scene.load.audio("sfx_dualbarrel_fire_1", "assets/sounds/sfx/defenders/dualbarrel_fire_1.mp3");
    scene.load.audio("sfx_dualbarrel_fire_2", "assets/sounds/sfx/defenders/dualbarrel_fire_2.mp3");
    scene.load.audio("sfx_cryogunner_fire", "assets/sounds/sfx/defenders/cryogunner_fire.mp3");
    scene.load.audio("sfx_generator_charge", "assets/sounds/sfx/defenders/generator_charge.mp3");
    scene.load.audio("sfx_generator_produce", "assets/sounds/sfx/defenders/generator_produce.mp3");
    scene.load.audio("sfx_barricade_hit", "assets/sounds/sfx/defenders/barricade_hit.mp3");
    scene.load.audio("sfx_landmine_arm", "assets/sounds/sfx/defenders/landmine_arm.mp3");
    scene.load.audio("sfx_landmine_explosion", "assets/sounds/sfx/defenders/landmine_explosion.mp3");
    scene.load.audio("sfx_scrapper_attack", "assets/sounds/sfx/defenders/scrapper_attack.mp3");
    scene.load.audio("sfx_defender_place", "assets/sounds/sfx/defenders/defender_place_custom.mp3");
    scene.load.audio("sfx_defender_pickup", "assets/sounds/sfx/defenders/defender_pickup.mp3");
    scene.load.audio("sfx_defender_recall", "assets/sounds/sfx/defenders/defender_recall.mp3");
    scene.load.audio("sfx_defender_hit", "assets/sounds/sfx/defenders/defender_hit.mp3");
    scene.load.audio("sfx_defender_destroy", "assets/sounds/sfx/defenders/defender_destroy.mp3");
    scene.load.audio("laserSound", "assets/sounds/laser.m4a");

    // Enemy sounds
    scene.load.audio("sfx_ranged_fire", "assets/sounds/sfx/enemies/ranged_fire.mp3");
    scene.load.audio("sfx_ranged_fire_alt", "assets/sounds/sfx/enemies/ranged_fire_alt.mp3");
    scene.load.audio("sfx_robot_hit", "assets/sounds/sfx/enemies/robot_hit.mp3");
    scene.load.audio("sfx_robot_destroy", "assets/sounds/sfx/enemies/robot_destroy.mp3");
    scene.load.audio("sfx_melee_attack", "assets/sounds/sfx/enemies/melee_attack.mp3");
    scene.load.audio("sfx_crusher_smash", "assets/sounds/sfx/enemies/crusher_smash.mp3");
    scene.load.audio("sfx_drone_engine", "assets/sounds/sfx/enemies/drone_engine.mp3");
    scene.load.audio("sfx_hijacker_grab", "assets/sounds/sfx/enemies/hijacker_grab.mp3");
    scene.load.audio("explosionSound", "assets/sounds/explosion.m4a");
    scene.load.audio("enemyHitSound", "assets/sounds/enemyhit.m4a");

    // Overlord boss sounds
    scene.load.audio("sfx_boss_entrance", "assets/sounds/sfx/boss/boss_entrance.mp3");
    scene.load.audio("sfx_boss_cannon", "assets/sounds/sfx/boss/boss_cannon.mp3");
    scene.load.audio("sfx_boss_shield_activate", "assets/sounds/sfx/boss/boss_shield_activate.mp3");
    scene.load.audio("sfx_boss_shield_hit", "assets/sounds/sfx/boss/boss_shield_hit.mp3");
    scene.load.audio("sfx_boss_shield_break", "assets/sounds/sfx/boss/boss_shield_break.mp3");
    scene.load.audio("sfx_boss_laser_charge", "assets/sounds/sfx/boss/boss_laser_charge.mp3");
    scene.load.audio("sfx_boss_laser_fire", "assets/sounds/sfx/boss/boss_laser_fire.mp3");
    scene.load.audio("sfx_boss_reinforcements", "assets/sounds/sfx/boss/boss_reinforcements.mp3");
    scene.load.audio("sfx_boss_phase_change", "assets/sounds/sfx/boss/boss_phase_change.mp3");
    scene.load.audio("sfx_boss_death", "assets/sounds/sfx/boss/boss_death.mp3");

    // UI sounds
    scene.load.audio("sfx_ui_hover", "assets/sounds/sfx/ui/ui_hover.mp3");
    scene.load.audio("sfx_ui_click", "assets/sounds/sfx/ui/ui_click.mp3");
    scene.load.audio("sfx_ui_error", "assets/sounds/sfx/ui/ui_error.mp3");
    scene.load.audio("sfx_ui_confirm", "assets/sounds/sfx/ui/ui_confirm.mp3");
    scene.load.audio("sfx_ui_pause", "assets/sounds/sfx/ui/ui_pause.mp3");
    scene.load.audio("sfx_ui_resume", "assets/sounds/sfx/ui/ui_resume.mp3");
    scene.load.audio("sfx_ui_back", "assets/sounds/sfx/ui/ui_back.mp3");
    scene.load.audio("sfx_ui_upgrade", "assets/sounds/sfx/ui/ui_upgrade.mp3");

    // Gameplay event sounds
    scene.load.audio("sfx_energy_spawn", "assets/sounds/sfx/events/energy_spawn.mp3");
    scene.load.audio("sfx_energy_collect", "assets/sounds/sfx/events/energy_collect.mp3");
    scene.load.audio("sfx_wave_start", "assets/sounds/sfx/events/wave_start.mp3");
    scene.load.audio("sfx_wave_complete", "assets/sounds/sfx/events/wave_complete.mp3");
    scene.load.audio("sfx_stronghold_hit", "assets/sounds/sfx/events/stronghold_hit.mp3");
    scene.load.audio("sfx_level_complete", "assets/sounds/sfx/events/level_complete.mp3");
    scene.load.audio("sfx_game_over", "assets/sounds/sfx/events/game_over.mp3");

}
