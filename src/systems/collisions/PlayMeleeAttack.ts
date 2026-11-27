import type Phaser from "phaser";
import { CrusherEnemy } from "../../enemies/CrusherEnemy.ts";
import type { Enemy } from "../../enemies/Enemy.ts";
import { MeleeEnemy } from "../../enemies/MeleeEnemy.ts";
import { SoundManager } from "../../helpers/SoundManager.ts";

export function playMeleeAttack(scene: Phaser.Scene, enemy: Enemy): void {
    if (enemy instanceof CrusherEnemy) {
        SoundManager.play(scene, "sfx_crusher_smash");
        enemy.play("crusher-attack", true);
        return;
    }

    SoundManager.play(scene, "sfx_melee_attack");
    if (enemy instanceof MeleeEnemy) {
        enemy.play("executioner-attack", true);
    }
}
