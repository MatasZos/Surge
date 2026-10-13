
import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { SETTINGS } from "../config/settings";

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
