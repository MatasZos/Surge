
import Phaser from "phaser";
import { SETTINGS } from "../config/settings";

export class EnergyDrops {

    constructor(private scene: Phaser.Scene) {}

    setup(): void {
        this.scene.events.on("enemy-killed", this.dropEnergy, this);

        this.scene.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            () => {
                this.scene.events.off("enemy-killed", this.dropEnergy, this);
            }
        );
    }

    private dropEnergy(x: number, y: number): void {

        // Chance to drop energy from CSV
        if (Math.random() >= SETTINGS.energy.enemyDropChance) {
            return;
        }

        const energy = this.scene.add.image(x, y, "energy");

        energy.setDisplaySize(35, 35);
        energy.setDepth(15);
        energy.setInteractive({ useHandCursor: true });

        // Collect energy when clicked
        energy.on("pointerdown", () => {
            if (!energy.active) return;

            this.scene.events.emit(
                "energy-collected",
                SETTINGS.energy.enemyDropValue
            );

            energy.destroy();
        });

        // Remove uncollected energy
        this.scene.time.delayedCall(
            SETTINGS.energy.pickupLifetimeMs,
            () => {
                if (energy.active) {
                    energy.destroy();
                }
            }
        );
    }
}
