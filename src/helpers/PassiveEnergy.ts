import Phaser from "phaser";
import { SETTINGS } from "../config/settings.ts";
import { EnergyManager } from "../managers/EnergyManager.ts";

export class PassiveEnergy {

    constructor(
        private scene: Phaser.Scene,
        private energyManager: EnergyManager,
        private updateEnergyText: () => void
    ) {}

    start(): void {
        this.scene.time.addEvent({
            delay: SETTINGS.energy.passiveEnergyIntervalMs,
            callback: () => {
                const amount = SETTINGS.energy.passiveEnergyValue;

                this.energyManager.addEnergy(amount);
                this.updateEnergyText();

                const bonus = this.scene.add.text(
                    179, 25,
                    "+" + amount + " ⚡",
                    {
                        fontSize: "18px",
                        color: "#00ff99",
                        fontStyle: "bold"
                    }
                ).setOrigin(0.5).setDepth(30);

                this.scene.time.delayedCall(1200, () => {
                    bonus.destroy();
                });
            },
            loop: true
        });
    }
}