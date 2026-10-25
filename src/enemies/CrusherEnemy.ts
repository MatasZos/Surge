
import Phaser from "phaser";
import { Enemy } from "./Enemy.ts";
import { SETTINGS } from "../config/settings.ts";

// Heavy, slow melee robot. CollisionSystem handles its mace attacks.
export class CrusherEnemy extends Enemy {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(
            scene, x, y, "crusherEnemy",
            SETTINGS.enemies.crusher.health,
            SETTINGS.enemies.crusher.speed,
            SETTINGS.enemies.crusher.damage
        );

        this.setDisplaySize(90, 90);
    }
}
