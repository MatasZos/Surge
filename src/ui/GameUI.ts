
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
            scene.scale.width - 235,
            scene.scale.height - 65,
            `WAVE ${waveManager.getWave()}/${waveManager.getMaxWaves()}`,
            {
                fontSize: "21px",
                color: "#00ccff",
                fontStyle: "bold",
                padding: {x: 12, y: 8},
                stroke: "#000000",
                strokeThickness: 1
            }
        );

        this.waveText.setOrigin(0, 1);
        this.waveText.setDepth(22);
    }

    // Update the energy display
    public updateEnergy(): void {
        this.energyHUD.update();
    }

    //Animate the energy pickup
    public animateEnergyPickup(amount:number,x:number,y:number): void{
        this.energyHUD.animatePickup(amount,x,y)
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
            `WAVE ${this.waveManager.getWave()}/${this.waveManager.getMaxWaves()}`
        );
    }
}
