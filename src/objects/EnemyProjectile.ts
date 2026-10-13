import Phaser from "phaser";
import { SETTINGS } from "../config/settings";

export class EnemyProjectile extends Phaser.GameObjects.Rectangle {

    damage = SETTINGS.enemies.ranged.projectileDamage;
    speed = SETTINGS.enemies.ranged.projectileSpeed;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 16, 5, 0x00aaff);

        scene.add.existing(this);
        this.setDepth(10);

        scene.events.emit("enemy-projectile-created", this);
    }

    move(delta: number) {
        this.x -= this.speed * (delta / 1000);

        if (this.x < 0) {
            this.destroy();
        }
    }
}