
import Phaser from "phaser";
import { Defender } from "../defenders/Defender.ts";
import { EnergyManager } from "../managers/EnergyManager.ts";
import { SETTINGS } from "../config/settings.ts";

export class DefenderUpgradeMenu {
    private menu: Phaser.GameObjects.Container | null = null;

    constructor(
        private scene: Phaser.Scene,
        private energyManager: EnergyManager,
        private updateEnergyText: () => void
    ) {}

    show(defender: Defender): void {
        this.close();

        if (!defender.active) return;

        // Get the defender's upgrade cost from the spreadsheet settings
        const type = defender.getData("defenderType") as keyof typeof SETTINGS.defenders;

        const cost = SETTINGS.defenders[type]?.upgradeCost;

        const menuWidth = 200;
        const menuHeight = 100;

        const x = Phaser.Math.Clamp(
            defender.x,
            menuWidth / 2 + 5,
            this.scene.scale.width - menuWidth / 2 - 5
        );

        const aboveY = defender.y - 105;

        const y = aboveY - menuHeight / 2 < 5
            ? defender.y + 105
            : aboveY;

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
            defender.canUpgrade() ? "UPGRADE - " + cost + " Energy" : "MAX LEVEL",
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

            // Check the defender is still alive
                if (!defender.active) {
                    this.close();
                    return;
                }

                // Check the spreadsheet cost is valid
                if (cost === undefined || !Number.isFinite(cost) || cost <= 0) {
                    console.warn("Invalid upgrade cost for:", type);
                    return;
                }

                // Check if player has enough energy
                if (!this.energyManager.canAfford(cost)) {
                    upgradeButton.setText("NOT ENOUGH ENERGY");
                    return;
                }

                // Upgrade the defender and deduct energy
                if (defender.upgrade()) {
                    this.energyManager.spendEnergy(cost);
                    this.updateEnergyText();
                    this.show(defender);
                }
            });
        }

        this.menu = this.scene.add.container(x, y, [
            background, name, levelText, upgradeButton
        ]);

        this.menu.setDepth(200);
    }

    isPointerInside(pointer: Phaser.Input.Pointer): boolean {
        if (!this.menu) return false;

        const x = this.menu.x;
        const y = this.menu.y;

        return (
            pointer.x >= x - 100 &&
            pointer.x <= x + 100 &&
            pointer.y >= y - 50 &&
            pointer.y <= y + 50
        );
    }

    close(): void {
        this.menu?.destroy();
        this.menu = null;
    }
}
