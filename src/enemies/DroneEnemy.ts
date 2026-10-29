import Phaser from "phaser";
import { Enemy } from "./Enemy.ts";
import { SETTINGS} from "../config/settings.ts"


export class DroneEnemy extends Enemy {
    readonly isFlying = true;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "drone", SETTINGS.enemies.drone.health, SETTINGS.enemies.drone.speed, SETTINGS.enemies.drone.damage);
        this.setDisplaySize(60, 60);
    }
}
