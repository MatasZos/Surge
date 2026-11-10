
import Phaser from "phaser";

export function loadGameAssets(scene: Phaser.Scene): void {

    // Defenders
    scene.load.image("shooter", "assets/defenders/shooterdefender.png");
    scene.load.image("generator", "assets/defenders/generator.png");
    scene.load.image("barricade", "assets/defenders/barricade.png");
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

    scene.load.spritesheet("surge_shooter", "assets/animations/shooter.png", { frameWidth: 192, frameHeight: 192 });
    scene.load.spritesheet("surge_dualbarrel", "assets/animations/dualbarrel.png", { frameWidth: 192, frameHeight: 192 });
    scene.load.spritesheet("surge_cryogunner", "assets/animations/cryogunner.png", { frameWidth: 192, frameHeight: 192 });
    scene.load.spritesheet("surge_generator", "assets/animations/generator.png", { frameWidth: 192, frameHeight: 192 });
    scene.load.spritesheet("surge_landmine", "assets/animations/landmine.png", { frameWidth: 192, frameHeight: 192 });
    scene.load.spritesheet("surge_scrapper", "assets/animations/scrapper.png", { frameWidth: 192, frameHeight: 192 });
    scene.load.spritesheet("surge_meleeEnemy", "assets/animations/meleeEnemy.png", { frameWidth: 192, frameHeight: 192 });
    scene.load.spritesheet("surge_rangedEnemy", "assets/animations/rangedEnemy.png", { frameWidth: 192, frameHeight: 192 });
    scene.load.spritesheet("surge_crusherEnemy", "assets/animations/crusherEnemy.png", { frameWidth: 192, frameHeight: 192 });
    scene.load.spritesheet("surge_drone", "assets/animations/drone.png", { frameWidth: 192, frameHeight: 192 });
    scene.load.spritesheet("surge_hijacker", "assets/animations/hijacker.png", { frameWidth: 192, frameHeight: 192 });
    scene.load.spritesheet("surge_overlord", "assets/animations/overlord.png", { frameWidth: 192, frameHeight: 192 });
    scene.load.spritesheet("surge_overlord_v4", "assets/animations/overlord_v4.png", { frameWidth: 212, frameHeight: 212 });
    scene.load.spritesheet("surge_energy", "assets/animations/energy.png", { frameWidth: 192, frameHeight: 192 });
    scene.load.spritesheet("surge_fx", "assets/animations/fx.png", { frameWidth: 192, frameHeight: 192 });

    // Effects
    scene.load.image("laser", "assets/effects/projectile.png");
    scene.load.image("energy", "assets/effects/energy.png");

    // UI
    scene.load.image("recall", "assets/ui/recall button.png");
    scene.load.image("move", "assets/ui/move.png");

    // Stronghold and battlefield
    scene.load.image("stronghold", "assets/stronghold/stronghold_wall.png");
    scene.load.image("battlefield", "assets/backgrounds/battlefield.png");

    // Audio
    scene.load.audio("backgroundMusic", "assets/sounds/backgroundMusic.m4a");
    scene.load.audio("bossMusic", "assets/sounds/bossMusic.mp3");
    scene.load.audio("laserSound", "assets/sounds/laser.m4a");
    scene.load.audio("enemyHitSound", "assets/sounds/enemyhit.m4a");
    scene.load.audio("explosionSound", "assets/sounds/explosion.m4a");
}
