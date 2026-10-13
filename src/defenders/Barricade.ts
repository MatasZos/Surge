
import Phaser from "phaser";
import { Defender } from "./Defender";
import { SETTINGS } from "../config/settings";

export class Barricade extends Defender {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "barricade");

        this.setDisplaySize(65, 75);

        this.setDefenderHealth(SETTINGS.defenders.barricade.health);
        this.damage = SETTINGS.defenders.barricade.damage;
    }
}
