
import Phaser from "phaser";
import { SETTINGS } from "../config/settings";

export class Projectile extends Phaser.GameObjects.Sprite {

    damage: number = SETTINGS.defenders.shooter.projectileDamage;
    speed: number = SETTINGS.defenders.shooter.projectileSpeed;


    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number
    ) {
        super(scene, x, y, "laser");

        scene.add.existing(this);

        this.setDisplaySize(60, 16);

        this.setDepth(10);

        scene.events.emit("projectile-created",this);
    }

    move(delta: number) {

        // Move from left to right
        this.x += this.speed * (delta / 1000);

        if (this.x > this.scene.scale.width + this.displayWidth / 2) {
            this.destroy();
        }
    }
}
