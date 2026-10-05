import Phaser from "phaser";
import { Enemy } from "./Enemy";

export class MeleeEnemy extends Enemy {

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number
    ) {
        super(scene, x, y, "enemy");

        this.health = 100;
        this.speed = 50;
        this.damage = 100;
    }
}