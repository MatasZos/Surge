
import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { SETTINGS } from "../config/settings.ts";

export class Barricade extends Defender {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "barricade");

        this.setDisplaySize(65, 75);

        this.setDefenderHealth(SETTINGS.defenders.barricade.health);
        this.damage = SETTINGS.defenders.barricade.damage;
    }
    override upgrade(): boolean {
        if (!super.upgrade()) return false;

        this.setDefenderHealth(
            SETTINGS.defenders.barricade.health *
            SETTINGS.defenders.barricade.upgradeHealthMultiplier
        );
        console.log("Barricade Level:", this.upgradeLevel, "Health:", this.health);

        return true;
    }
}
