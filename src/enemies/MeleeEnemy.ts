import Phaser from "phaser";
import { Enemy } from "./Enemy";

export class MeleeEnemy extends Enemy {

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number
    ) {
        super(scene, x, y, "meleeEnemy", 200, 18, 25);
    }
}