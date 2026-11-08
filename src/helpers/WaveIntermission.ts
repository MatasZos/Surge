
import Phaser from "phaser";

import { SETTINGS } from "../config/settings.ts";
import { WaveManager } from "../managers/WaveManager.ts";
import { EnergyManager } from "../managers/EnergyManager.ts";

export class WaveIntermission {
    private active = false;
    private bossNext = false;

    private countdown?: Phaser.Time.TimerEvent;
    private endTimer?: Phaser.Time.TimerEvent;

    private earlyWaveButton: Phaser.GameObjects.Text;

    constructor(
        private scene: Phaser.Scene,
        private waveText: Phaser.GameObjects.Text,
        private waveManager: WaveManager,
        private energyManager: EnergyManager,
        private updateEnergyText: () => void,
        private showNotification: (message: string) => void,
        private startBossWave: () => void,
        private resetWaveProgress: () => void
    ) {
        // Create the early-start button
        this.earlyWaveButton = scene.add.text(
            scene.scale.width / 2,
            scene.scale.height - 65,
            `START NEXT WAVE (+${SETTINGS.waves.earlyWaveBonusEnergy} ENERGY)`,
            {
                fontSize: "20px",
                color: "#ffffff",
                backgroundColor: "#244b73",
                fontStyle: "bold",
                padding: { x: 18, y: 10 }
            }
        );

        this.earlyWaveButton.setOrigin(0.5);
        this.earlyWaveButton.setDepth(60);
        this.earlyWaveButton.setScrollFactor(0);
        this.earlyWaveButton.setInteractive({
            useHandCursor: true
        });
        this.earlyWaveButton.setVisible(false);

        // Start early when the button is clicked
        this.earlyWaveButton.on("pointerdown", (
            _pointer: Phaser.Input.Pointer,
            _localX: number,
            _localY: number,
            event: Phaser.Types.Input.EventData
        ) => {
            event.stopPropagation();
            this.finish(true);
        });

        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.stop();
            });
    }

    // Check whether an intermission is running
    public isActive(): boolean {
        return this.active;
    }

    // Begin the countdown between waves
    public start(bossNext = false): void {
        if (this.active) {
            return;
        }

        // Duration comes from Excel/CSV only
        const durationMs = SETTINGS.waves.waveIntermissionMs;

        if (!Number.isFinite(durationMs) || durationMs <= 0) {
            throw new Error("Invalid waves.wave_intermission_ms configuration");
        }

        this.active = true;
        this.bossNext = bossNext;

        // Don't allow skipping the boss intermission
        this.earlyWaveButton.setVisible(!bossNext);

        this.showNotification(
            `WAVE ${this.waveManager.getWave()} CLEARED!`
        );

        let secondsRemaining = Math.ceil(durationMs / 1000);
        const completedWave = this.waveManager.getWave();

        // Display the countdown in the wave HUD
        const updateCountdown = () => {
            if (bossNext) {
                this.waveText.setText(
                    `BOSS IN ${secondsRemaining}s`
                );
            } else {
                this.waveText.setText(
                    `Wave ${completedWave}/${this.waveManager.getMaxWaves()} - Next in ${secondsRemaining}s`
                );
            }
        };

        updateCountdown();

        // Update the countdown every second
        this.countdown = this.scene.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (!this.active) {
                    return;
                }

                secondsRemaining = secondsRemaining - 1;

                if (secondsRemaining > 0) {
                    updateCountdown();
                }
            }
        });

        // Automatically begin the next wave
        this.endTimer = this.scene.time.delayedCall(
            durationMs,
            () => {
                this.finish();
            }
        );
    }

    // Finish the countdown or start early
    private finish(startedEarly = false): void {
        if (!this.active) {
            return;
        }

        // The boss countdown cannot be skipped
        if (startedEarly && this.bossNext) {
            return;
        }

        const startBoss = this.bossNext;

        // Stop timers and hide the button
        this.stop();

        // Award bonus energy for starting early
        if (startedEarly) {
            const bonus = SETTINGS.waves.earlyWaveBonusEnergy;

            this.energyManager.addEnergy(bonus);
            this.updateEnergyText();

            this.showNotification(
                `EARLY WAVE BONUS: +${bonus} ENERGY`
            );
        }

        // Start the boss or the next normal wave
        if (startBoss) {
            this.startBossWave();
        } else {
            this.waveManager.nextWave();

            this.resetWaveProgress();

            this.waveText.setText(
                `Wave ${this.waveManager.getWave()}/${this.waveManager.getMaxWaves()}`
            );

            this.showNotification(
                `WAVE ${this.waveManager.getWave()} INCOMING!`
            );
        }
    }

    // Stop an intermission and cancel its timers
    public stop(): void {
        this.active = false;
        this.bossNext = false;

        this.countdown?.remove();
        this.endTimer?.remove();

        this.countdown = undefined;
        this.endTimer = undefined;

        this.earlyWaveButton.setVisible(false);
    }
}
