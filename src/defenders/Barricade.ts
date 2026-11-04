
import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { SETTINGS } from "../config/settings.ts";

export class Barricade extends Defender {

    private repairTimer: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        
        super(scene, x, y, "barricade");

        this.setDisplaySize(65, 75);

        this.setDefenderHealth(SETTINGS.defenders.barricade.health);
        this.damage = SETTINGS.defenders.barricade.damage;

        // Level 3 automatically repairs the Barricade
        this.repairTimer = scene.time.addEvent({
            delay: 3000,
            callback: () => {
                if (this.active && this.upgradeLevel === 3) {
                    this.heal(50);
                }
            },
            loop: true
        });
    }
    override upgrade(): boolean {
        if (!super.upgrade()) return false;

        if (this.upgradeLevel === 2) {
            this.increaseMaxhHealth(
                SETTINGS.defenders.barricade.upgradeHealthMultiplier

            );

            this.heal(50);
        }
        console.log("Barricade Level:", this.upgradeLevel, "Health:", this.health);
        return true;
    }

        override destroy(fromScene?: boolean): void {
        this.repairTimer?.remove(false);
        super.destroy(fromScene);
    }
}
