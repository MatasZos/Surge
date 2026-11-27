import type Phaser from "phaser";
import { loadDefenderAssets } from "../assets/DefenderAssets.ts";
import { loadEnemyAssets } from "../assets/EnemyAssets.ts";
import { loadAudioAssets } from "../assets/AudioAssets.ts";

export function loadGameAssets(scene: Phaser.Scene): void {
    loadDefenderAssets(scene);
    loadEnemyAssets(scene);

    // Effects
    scene.load.image("laser", "assets/effects/projectile.png");
    scene.load.image("energy", "assets/effects/energy.png");

    // UI
    scene.load.image("recall", "assets/ui/recall button.png");
    scene.load.image("move", "assets/ui/move.png");
    scene.load.image("stronghold-hp-frame", "assets/ui/stronghold-hp-frame.png");
    scene.load.image("stronghold-hp-fill", "assets/ui/stronghold-hp-fill.png");

    // Stronghold and battlefield
    scene.load.image("stronghold", "assets/stronghold/stronghold_wall.png");
    scene.load.image("battlefield", "assets/backgrounds/battlefield.png");

    loadAudioAssets(scene);
}
