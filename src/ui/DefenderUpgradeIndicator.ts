
import Phaser from "phaser";
import type { Defender } from "../defenders/Defender.ts";

export class DefenderUpgradeIndicator {
    private levelText: Phaser.GameObjects.Text;
    private outline: Phaser.GameObjects.Rectangle;

    constructor(
        private scene: Phaser.Scene,
        private defender: Defender
    ) {
        this.levelText = scene.add.text(
            0, 0, "LVL 2",
            {
                fontSize: "14px",
                color: "#00ff99",
                fontStyle: "bold",
                backgroundColor: "#162536",
                padding: { x: 4, y: 2 }
            }
        );

        this.levelText.setOrigin(0.5);
        this.levelText.setDepth(30);
        this.levelText.setVisible(false);

        this.outline = scene.add.rectangle(0, 0, 10, 10);
        this.outline.setStrokeStyle(3, 0x00ff99);
        this.outline.setDepth(15);
        this.outline.setVisible(false);

        defender.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.levelText.destroy();
            this.outline.destroy();
        });
    }

    show(): void {
        if (!this.defender.active) return;

        // Use the defender's final display size
        this.outline.setPosition(
            this.defender.x,
            this.defender.y
        );

        this.outline.setSize(
            this.defender.displayWidth + 8,
            this.defender.displayHeight + 8
        );

        this.levelText.setPosition(
            this.defender.x,
            this.defender.y - this.defender.displayHeight / 2 - 35
        );

        this.outline.setVisible(true);
        this.levelText.setVisible(true);
    }
}
