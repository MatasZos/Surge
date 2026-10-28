import Phaser from "phaser";
import { EnergyManager } from "../managers/EnergyManager.ts";

export class EnergyHUD {

    private energyText: Phaser.GameObjects.Text;

    constructor(
        private scene: Phaser.Scene,
        private energyManager: EnergyManager
    ) {
        this.scene.add.rectangle(161, 61, 290, 75, 0x101b2a)
            .setStrokeStyle(3, 0x647589).setDepth(10);

        this.scene.add.rectangle(161, 61, 280, 65, 0x243348)
            .setStrokeStyle(1, 0x0c131e).setDepth(11);

        this.scene.add.text(41, 61, "⚡", {
            fontSize: "27px",
            color: "#38cfff"
        }).setOrigin(0.5).setDepth(20);

        this.energyText = this.scene.add.text(
            179, 61,
            "Energy: " + this.energyManager.getEnergy(),
            { fontSize: "22px", color: "#00ccff" }
        ).setOrigin(0.5).setDepth(20);
    }

    update(): void {
        this.energyText.setText(
            "Energy: " + this.energyManager.getEnergy()
        );
    }
}