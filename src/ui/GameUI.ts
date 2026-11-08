
import Phaser from "phaser";
import { EnergyManager } from "../managers/EnergyManager.ts";
import { WaveManager } from "../managers/WaveManager.ts";
import { DefenderToolbar } from "./DefenderToolbar.ts";
import { EnergyHUD } from "./EnergyHUD.ts";

export class GameUI {
    private toolbar: DefenderToolbar;
    private energyHUD: EnergyHUD;
    public waveText: Phaser.GameObjects.Text;

    constructor(
        scene: Phaser.Scene,
        energyManager: EnergyManager,
        private waveManager: WaveManager,
        currentLevel: number,
        onSelect: (type: string) => void,
        onDrag: (type: string, pointer: Phaser.Input.Pointer) => void,
        getUnlockLevel: (type: string) => number
    ) {
        // Create the defender toolbar
        this.toolbar = new DefenderToolbar(
            scene,
            onSelect,
            onDrag,
            getUnlockLevel,
            () => energyManager.getEnergy()
        );

        this.toolbar.updateUnlocks(currentLevel);

        // Create the energy display
        this.energyHUD = new EnergyHUD(scene, energyManager);

        // Create the wave display
        this.waveText = scene.add.text(
            scene.scale.width - 25,
            scene.scale.height - 25,
            `Wave ${waveManager.getWave()}/${waveManager.getMaxWaves()}`,
            {
                fontSize: "22px",
                color: "#00ccff",
                backgroundColor: "#162536",
                padding: {
                    x: 12,
                    y: 8
                }
            }
        );

        this.waveText.setOrigin(1, 1);
        this.waveText.setDepth(20);
    }

    // Update the energy display
    public updateEnergy(): void {
        this.energyHUD.update();
    }

    // Update defender cooldowns and affordability
    public updateToolbar(
        currentTime: number,
        lastPlaced: Record<string, number>
    ): void {
        this.toolbar.updateCooldowns(currentTime, lastPlaced);
        this.toolbar.updateAffordability();
    }

    // Unlock defenders when the player reaches a new level
    public updateUnlocks(level: number): void {
        this.toolbar.updateUnlocks(level);
    }

    // Update the wave number shown on screen
    public updateWaveText(): void {
        this.waveText.setText(
            `Wave ${this.waveManager.getWave()}/${this.waveManager.getMaxWaves()}`
        );
    }
}
