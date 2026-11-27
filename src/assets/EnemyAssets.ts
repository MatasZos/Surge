import type Phaser from "phaser";

export function loadEnemyAssets(scene: Phaser.Scene): void {
    // Melee enemy
    const executionerFrames = { frameWidth: 100, frameHeight: 100 };
    scene.load.spritesheet("meleeEnemy", "assets/enemies/executioner/Idle.png", executionerFrames);
    scene.load.spritesheet("executioner-attack-sheet", "assets/enemies/executioner/Attack.png", executionerFrames);
    scene.load.spritesheet("executioner-dead-sheet", "assets/enemies/executioner/Dead.png", executionerFrames);

    // Ranged enemy
    const wizardFrames = { frameWidth: 80, frameHeight: 80 };
    scene.load.spritesheet("rangedEnemy", "assets/enemies/wizard/Idle.png", wizardFrames);
    scene.load.spritesheet("wizard-fly-sheet", "assets/enemies/wizard/Fly.png", wizardFrames);
    scene.load.spritesheet("wizard-attack-sheet", "assets/enemies/wizard/Attack.png", wizardFrames);
    scene.load.spritesheet("wizard-dead-sheet", "assets/enemies/wizard/Dead.png", wizardFrames);

    // Crusher
    const crusherFrames = { frameWidth: 80, frameHeight: 64 };
    scene.load.spritesheet("crusherEnemy", "assets/enemies/crusher/Idle.png", crusherFrames);
    scene.load.spritesheet("crusher-walk-sheet", "assets/enemies/crusher/Walk.png", crusherFrames);
    scene.load.spritesheet("crusher-attack-sheet", "assets/enemies/crusher/Attack.png", crusherFrames);
    scene.load.spritesheet("crusher-hurt-sheet", "assets/enemies/crusher/Hurt.png", crusherFrames);
    scene.load.spritesheet("crusher-dead-sheet", "assets/enemies/crusher/Dead.png", crusherFrames);

    scene.load.image("overlord", "assets/enemies/overlord.png");
    scene.load.image("drone", "assets/enemies/drone.png");
    scene.load.image("hijacker", "assets/enemies/hijacker.png");
}
