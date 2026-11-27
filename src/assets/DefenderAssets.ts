import type Phaser from "phaser";

export function loadDefenderAssets(scene: Phaser.Scene): void {
    // Shooter
    const shooterFrames = { frameWidth: 68, frameHeight: 72 };
    scene.load.spritesheet("shooter", "assets/defenders/shooter/Idle.png", shooterFrames);
    scene.load.spritesheet("shooter-shot", "assets/defenders/shooter/Shot_1.png", shooterFrames);
    scene.load.spritesheet("shooter-hurt", "assets/defenders/shooter/Hurt.png", shooterFrames);
    scene.load.spritesheet("shooter-dead", "assets/defenders/shooter/Dead.png", shooterFrames);

    // Generator
    const generatorFrames = { frameWidth: 568, frameHeight: 648 };
    scene.load.spritesheet("generator-idle-sheet", "assets/defenders/generator/Idle.png", generatorFrames);
    scene.load.spritesheet("generator-dead-sheet", "assets/defenders/generator/Dead.png", generatorFrames);
    scene.load.spritesheet("generator-hurt-sheet", "assets/defenders/generator/Hurt.png", generatorFrames);
    scene.load.image("generator", "assets/defenders/generator.png");
    // Defender effects
    scene.load.spritesheet("defenderAura", "assets/effects/aura.png", { frameWidth: 64, frameHeight: 64 });
    scene.load.spritesheet("upgradeEffect", "assets/effects/upgradeD.png", { frameWidth: 64, frameHeight: 64 });

    scene.load.spritesheet("hitEffect", "assets/effects/hit.png", { frameWidth: 64, frameHeight: 64 });

    // Barricade
    const barricadeFrames = { frameWidth: 40, frameHeight: 40 };
    scene.load.spritesheet("barricade", "assets/defenders/barricade/Idle.png", barricadeFrames);
    scene.load.spritesheet("barricade-hurt-sheet", "assets/defenders/barricade/Hurt.png", barricadeFrames);
    scene.load.spritesheet("barricade-dead-sheet", "assets/defenders/barricade/Dead.png", barricadeFrames);

    // Dual Barrel
    const dualbarrelFrames = { frameWidth: 96, frameHeight: 96 };
    scene.load.spritesheet("dualbarrel-idle-sheet", "assets/defenders/dualbarrel/Idle.png", dualbarrelFrames);
    scene.load.spritesheet("dualbarrel-attack-sheet", "assets/defenders/dualbarrel/Attack.png", dualbarrelFrames);
    scene.load.spritesheet("dualbarrel-hurt-sheet", "assets/defenders/dualbarrel/Hurt.png", dualbarrelFrames);
    scene.load.spritesheet("dualbarrel-dead-sheet", "assets/defenders/dualbarrel/Dead.png", dualbarrelFrames);
    scene.load.image("dualbarrel", "assets/defenders/dualbarrel.png");

    // Cryo Gunner
    const cryogunnerFrames = { frameWidth: 128, frameHeight: 128 };
    scene.load.spritesheet("cryogunner", "assets/defenders/cryogunner/Idle.png", cryogunnerFrames);
    scene.load.spritesheet("cryogunner-shoot-sheet", "assets/defenders/cryogunner/Shoot.png", cryogunnerFrames);
    scene.load.spritesheet("cryogunner-hurt-sheet", "assets/defenders/cryogunner/Hurt.png", cryogunnerFrames);

    scene.load.image("landmine", "assets/defenders/landmine.png");
    scene.load.image("scrapper", "assets/defenders/scrapper.png");
}
