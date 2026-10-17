
import Phaser from "phaser";
import { SETTINGS } from "../config/settings";

type DefenderType = "shooter" | "generator" | "barricade" | "dualbarrel";

export class DefenderToolbar {

    private scene: Phaser.Scene;
    private onSelect: (defender: string) => void;
    private buttons: Phaser.GameObjects.Rectangle[] = [];

    private cooldownTexts: Record<string, Phaser.GameObjects.Text> = {};
    private defenderButtons: Record<string, Phaser.GameObjects.Rectangle> = {};
    private selectedType: string | null = null;

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
            toolbarX, 280, 120, 475, 0x263447, 0.95
        ).setDepth(10);

        this.scene.add.text(
            toolbarX, 65, "DEFENDERS",
            { fontSize: "14px", color: "#ffffff" }
        ).setOrigin(0.5).setDepth(11);

        // Defender buttons
        this.addButton(toolbarX, 125, "Shooter", "shooter");
        this.addButton(toolbarX, 235, "Generator", "generator");
        this.addButton(toolbarX, 345, "Barricade", "barricade");
        this.addButton(toolbarX, 455, "Dual Barrel", "dualbarrel");
    }

    private addButton(
        x: number,
        y: number,
        name: string,
        type: DefenderType
    ) {

        // Button background
        const button = this.scene.add.rectangle(
            x, y, 100, 100, 0x40536b
        );

        button.setDepth(11);
        button.setInteractive({ useHandCursor: true });

        this.buttons.push(button);
        this.defenderButtons[type] = button;

        // Defender image
        const icon = this.scene.add.image(x, y - 17, type);
        icon.setDisplaySize(55, 55);
        icon.setDepth(12);

        // Defender name
        this.scene.add.text(
            x, y + 22, name,
            { fontSize: "14px", color: "#ffffff" }
        ).setOrigin(0.5).setDepth(12);

        // Energy cost from CSV settings
        this.scene.add.text(
            x,
            y + 40,
            SETTINGS.defenders[type].cost + " Energy",
            { fontSize: "12px", color: "#00ccff" }
        ).setOrigin(0.5).setDepth(12);

        // Cooldown countdown displayed over the icon
        const cooldownText = this.scene.add.text(
            x, y - 17, "",
            {
                fontSize: "22px",
                color: "#ffffff",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 4
            }
        );

        cooldownText.setOrigin(0.5);
        cooldownText.setDepth(13);
        cooldownText.setVisible(false);

        this.cooldownTexts[type] = cooldownText;

        // Selection handling
        button.on("pointerdown", () => {

            this.selectedType = type;
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

    updateCooldowns(
        now: number,
        lastPlaced: Record<string, number>
    ) {
        const types: DefenderType[] = [
            "shooter",
            "generator",
            "barricade",
            "dualbarrel"
        ];

        for (const type of types) {

            const last = lastPlaced[type];
            const cooldown = SETTINGS.defenders[type].cooldownMs;

            const remaining = last === undefined
                ? 0
                : Math.max(0, cooldown - (now - last));

            const button = this.defenderButtons[type];
            const text = this.cooldownTexts[type];

            if (remaining > 0) {

                // Darken buttons during cooldown
                button.setFillStyle(0x303846);
                button.setStrokeStyle();

                text.setText(
                    (remaining / 1000).toFixed(1) + "s"
                );
                text.setVisible(true);

            } else {

                text.setVisible(false);

                if (this.selectedType === type) {
                    button.setFillStyle(0x286b55);
                    button.setStrokeStyle(2, 0x00ff99);
                } else {
                    button.setFillStyle(0x40536b);
                    button.setStrokeStyle();
                }
            }
        }
    }
}
