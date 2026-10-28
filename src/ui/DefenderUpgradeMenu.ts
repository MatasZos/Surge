
import Phaser from "phaser";
import { Defender } from "../defenders/Defender";

export class DefenderUpgradeMenu {
    private menu: Phaser.GameObjects.Container | null = null;

    constructor(private scene: Phaser.Scene) {}

    show(defender: Defender): void {
        this.close();

        if (!defender.active) return;

        const x = defender.x;
        const y = defender.y - 105;

        const background = this.scene.add.rectangle(
            0, 0, 180, 105, 0x162536
        ).setStrokeStyle(2, 0x00ccff);

        const name = this.scene.add.text(
            0, -35, defender.texture.key.toUpperCase(),
            { fontSize: "16px", color: "#ffffff" }
        ).setOrigin(0.5);

        const levelText = this.scene.add.text(
            0, -10, "Level " + defender.upgradeLevel,
            { fontSize: "15px", color: "#00ccff" }
        ).setOrigin(0.5);

        const upgradeButton = this.scene.add.text(
            0, 25,
            defender.canUpgrade() ? "UPGRADE" : "MAX LEVEL",
            {
                fontSize: "16px",
                color: "#ffffff",
                backgroundColor: defender.canUpgrade() ? "#008855" : "#555555",
                padding: { x: 12, y: 6 }
            }
        ).setOrigin(0.5);

        if (defender.canUpgrade()) {
            upgradeButton.setInteractive({ useHandCursor: true });

            upgradeButton.on("pointerdown", () => {
                if (defender.upgrade()) {
                    this.show(defender);
                }
            });
        }

        this.menu = this.scene.add.container(x, y, [
            background, name, levelText, upgradeButton
        ]);

        this.menu.setDepth(200);
    }

    close(): void {
        this.menu?.destroy();
        this.menu = null;
    }
}
