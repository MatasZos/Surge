
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

    // Effects
    scene.load.image("laser", "assets/effects/projectile.png");
    scene.load.image("energy", "assets/effects/energy.png");

    // UI
    scene.load.image("recall", "assets/ui/recall button.png");

    // Stronghold and battlefield
    scene.load.image("stronghold", "assets/stronghold/stronghold_wall.png");
    scene.load.image("battlefield", "assets/backgrounds/battlefield.png");
    scene.load.image("fortressExtension", "assets/backgrounds/fortress_extension.png");

    // Audio
    scene.load.audio("backgroundMusic", "assets/sounds/backgroundMusic.m4a");
    scene.load.audio("laserSound", "assets/sounds/laser.m4a");
    scene.load.audio("enemyHitSound", "assets/sounds/enemyhit.m4a");
    scene.load.audio("explosionSound", "assets/sounds/explosion.m4a");
}
