
import Phaser from "phaser";
import { SETTINGS } from "../config/settings.ts";

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

        // Play sound when energy appears
        if (this.scene.cache.audio.exists("sfx_energy_spawn")) {
         this.scene.sound.play("sfx_energy_spawn", {
                volume: 0.2
         });
        }

        energy.setDisplaySize(35, 35);
        energy.setDepth(15);
        energy.setInteractive({ useHandCursor: true });

        // Collect energy when clicked
        energy.on("pointerdown", () => {
            if (!energy.active) return;

            this.scene.events.emit( "energy-collected",SETTINGS.energy.enemyDropValue, energy.x, energy.y);
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
