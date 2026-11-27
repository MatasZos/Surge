import type Phaser from "phaser";

export function loadAudioAssets(scene: Phaser.Scene): void {
    // Music
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
