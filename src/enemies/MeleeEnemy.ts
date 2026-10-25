
import Phaser from "phaser";
import { Enemy } from "./Enemy.ts";
import { SETTINGS } from "../config/settings.ts";

export class MeleeEnemy extends Enemy {

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number
    ) {
        super(
            scene,x,y,"meleeEnemy",SETTINGS.enemies.melee.health,SETTINGS.enemies.melee.speed,SETTINGS.enemies.melee.damage);
    }
}
