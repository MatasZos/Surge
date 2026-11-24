import Phaser from "phaser";
import { Defender } from "../defenders/Defender.ts";
import { EnergyManager } from "../managers/EnergyManager.ts";
import { SETTINGS } from "../config/settings.ts";
import { SoundManager } from "../helpers/SoundManager.ts";

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

        const config = SETTINGS.defenders[type];

        const cost = defender.upgradeLevel === 1
            ? config?.upgradeCost
            : config?.upgradeLevel3Cost;

        //check if the defender can upgrade and if the player has enough energy
        const canUpgrade = defender.canUpgrade();
        const enoughEnergy = cost !== undefined && this.energyManager.canAfford(cost);

        //choose the message to display
        const upgradeMessage = !canUpgrade
            ? "MAX LEVEL REACHED"
            : !enoughEnergy
                ? "NEED " + cost + " ENERGY"
                : "UPGRADE - " + cost + " Energy";

        //choose a colour for the button
        const upgradeColor = !canUpgrade
            ? "#555555"
            : !enoughEnergy
                ? "#aa3333"
                : "#008855";

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


        //display upgrade status using different colours
        const upgradeButton = this.scene.add.text(
            0, 25, upgradeMessage,
            {
                fontSize: "14px",
                color: "#ffffff",
                backgroundColor: upgradeColor,
                padding: { x: 10, y: 6 }
            }
        ).setOrigin(0.5);

        //allow click if defender is not max lvl
        if (canUpgrade) {
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

                // Play error sound
                SoundManager.play(this.scene, "sfx_ui_error");

                 upgradeButton.setText("NEED " + cost + " ENERGY");
                     return;
            }

                // Upgrade the defender and deduct energy
                if (defender.upgrade()) {

                // Play upgrade sound
                SoundManager.play(this.scene, "sfx_ui_upgrade");

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
