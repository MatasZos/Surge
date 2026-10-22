import Phaser from "phaser";
import { SETTINGS } from "../config/settings";

type DefenderType = "shooter" | "generator" | "barricade" | "dualbarrel" | "cryogunner";

const TYPES: DefenderType[] = [
    "shooter", "generator", "barricade", "dualbarrel", "cryogunner"
];

export class DefenderToolbar {
    private buttons: Phaser.GameObjects.Rectangle[] = [];
    private cooldownTexts: Partial<Record<DefenderType, Phaser.GameObjects.Text>> = {};
    private defenderButtons: Partial<Record<DefenderType, Phaser.GameObjects.Rectangle>> = {};
    private selectedType: string | null = null;

    constructor(
        private scene: Phaser.Scene,
        private onSelect: (defender: string) => void
    ) {
        this.drawToolbar();
    }

    private resetButtons(): void {
        for (const button of this.buttons) {
            button.setFillStyle(0x40536b);
            button.setStrokeStyle();
        }
    }

    private drawToolbar(): void {
        // Horizontal toolbar above the battlefield; existing sprite cards are unchanged.
        const startX = 380;
        const spacing = 112;
        const cardCount = TYPES.length + 1; // Includes Recall
        const panelLeft = startX - 60;
        const panelWidth = (cardCount - 1) * spacing + 120;
        this.scene.add.rectangle(
            panelLeft + panelWidth / 2, 62, panelWidth, 112, 0x263447, 0.95
        ).setDepth(10);
        this.scene.add.text(panelLeft + 12, 12, "DEFENDERS", {
            fontSize: "12px", color: "#ffffff"
        }).setDepth(11);


        const cardY = 62;
        const names = ["Shooter", "Generator", "Barricade", "Dual Barrel", "Cryo Gunner"];
        TYPES.forEach((type, i) => this.addButton(startX + i * spacing, cardY, names[i], type));

        const recallX = startX + TYPES.length * spacing;
        const recallBackground = this.scene.add.rectangle(
            recallX, cardY, 100, 88, 0x40536b
        ).setDepth(11).setInteractive({ useHandCursor: true });
        this.buttons.push(recallBackground);

        const recallIcon = this.scene.add.image(recallX, cardY - 13, "recall")
            .setDisplaySize(42, 42).setDepth(12)
            .setInteractive({ useHandCursor: true });
        this.scene.add.text(recallX, cardY + 28, "Recall", {
            fontSize: "12px", color: "#ffffff"
        }).setOrigin(0.5).setDepth(12);

        const selectRecall = () => {
            this.selectedType = "recall";
            this.onSelect("recall");
            this.resetButtons();
            recallBackground.setFillStyle(0x286b55);
            recallBackground.setStrokeStyle(2, 0x00ff99);
        };
        recallBackground.on("pointerdown", selectRecall);
        recallIcon.on("pointerdown", selectRecall);
    }

    private addButton(x: number, y: number, name: string, type: DefenderType): void {
        const button = this.scene.add.rectangle(x, y, 100, 88, 0x40536b)
            .setDepth(11).setInteractive({ useHandCursor: true });
        this.buttons.push(button);
        this.defenderButtons[type] = button;

        const icon = this.scene.add.image(x, y - 21, type)
            .setDisplaySize(43, 43).setDepth(12);
        this.scene.add.text(x, y + 12, name, {
            fontSize: "12px", color: "#ffffff"
        }).setOrigin(0.5).setDepth(12);
        this.scene.add.text(x, y + 31, SETTINGS.defenders[type].cost + " Energy", {
            fontSize: "11px", color: "#00ccff"
        }).setOrigin(0.5).setDepth(12);

        const cooldownText = this.scene.add.text(x, y - 21, "", {
            fontSize: "22px", color: "#ffffff", fontStyle: "bold",
            stroke: "#000000", strokeThickness: 4
        }).setOrigin(0.5).setDepth(13).setVisible(false);
        this.cooldownTexts[type] = cooldownText;

        button.on("pointerdown", () => {
            this.selectedType = type;
            this.onSelect(type);
            this.resetButtons();
            button.setFillStyle(0x286b55);
            button.setStrokeStyle(2, 0x00ff99);
        });
    }

    updateCooldowns(now: number, lastPlaced: Record<string, number>): void {
        for (const type of TYPES) {
            const last = lastPlaced[type];
            const cooldown = SETTINGS.defenders[type].cooldownMs;
            const remaining = last === undefined ? 0 : Math.max(0, cooldown - (now - last));
            const button = this.defenderButtons[type]!;
            const text = this.cooldownTexts[type]!;

            if (remaining > 0) {
                button.setFillStyle(0x303846);
                button.setStrokeStyle();
                text.setText((remaining / 1000).toFixed(1) + "s");
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
