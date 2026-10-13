
import Phaser from "phaser";
import { SETTINGS } from "../config/settings";

export class DefenderToolbar {

    private scene: Phaser.Scene;
    private onSelect: (defender: string) => void;
    private buttons: Phaser.GameObjects.Rectangle[] = [];

    constructor(
        scene: Phaser.Scene,
        onSelect: (defender: string) => void
    ) {
        this.scene = scene;
        this.onSelect = onSelect;

        this.drawToolbar();
    }

    private drawToolbar() {

        const toolbarX = 65;

        // Toolbar background
        this.scene.add.rectangle(
            toolbarX,
            225,
            120,
            365,
            0x263447,
            0.95
        ).setDepth(10);

        this.scene.add.text(
            toolbarX,
            65,
            "DEFENDERS",
            {
                fontSize: "14px",
                color: "#ffffff"
            }
        ).setOrigin(0.5).setDepth(11);

        // Defender buttons
        this.addButton(toolbarX, 125, "Shooter", "shooter");
        this.addButton(toolbarX, 235, "Generator", "generator");
        this.addButton(toolbarX, 345, "Barricade", "barricade");
    }

    private addButton(
        x: number,
        y: number,
        name: string,
        type: "shooter" | "generator" | "barricade"
    ) {

        // Button background
        const button = this.scene.add.rectangle(
            x, y, 100, 100, 0x40536b
        );

        button.setDepth(11);
        button.setInteractive({ useHandCursor: true });

        this.buttons.push(button);

        // Defender image
        const icon = this.scene.add.image(x, y - 17, type);
        icon.setDisplaySize(55, 55);
        icon.setDepth(12);

        // Defender name
        this.scene.add.text(
            x,
            y + 22,
            name,
            {
                fontSize: "14px",
                color: "#ffffff"
            }
        ).setOrigin(0.5).setDepth(12);

        // Energy cost from CSV settings
        this.scene.add.text(
            x,
            y + 40,
            SETTINGS.defenders[type].cost + " Energy",
            {
                fontSize: "12px",
                color: "#00ccff"
            }
        ).setOrigin(0.5).setDepth(12);

        // Selection handling
        button.on("pointerdown", () => {

            this.onSelect(type);

            // Reset button colours
            for (const item of this.buttons) {
                item.setFillStyle(0x40536b);
                item.setStrokeStyle();
            }

            // Highlight selected defender
            button.setFillStyle(0x286b55);
            button.setStrokeStyle(2, 0x00ff99);
        });
    }
}
