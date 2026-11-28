import Phaser from "phaser";
import { Defender } from "../defenders/Defender.ts";
import { EnergyManager } from "../managers/EnergyManager.ts";
import { SoundManager } from "../helpers/SoundManager.ts";

export class DefenderUpgradeMenu {
    private menu: Phaser.GameObjects.Container | null = null;

    constructor(
        private scene: Phaser.Scene,
        private energyManager: EnergyManager,
        private updateEnergyText: () => void,
    ) {}

    show(defender: Defender): void {
        this.close();

        if (!defender.active) return;

        const cost = defender.getUpgradeCost();
        const canUpgrade = defender.canUpgrade();
        const enoughEnergy = cost !== undefined && this.energyManager.canAfford(cost);

        let upgradeMessage = "UPGRADE - " + cost + " Energy";
        let upgradeColor = "#008855";
        if (!canUpgrade) {
            upgradeMessage = "MAX LEVEL REACHED";
            upgradeColor = "#555555";
        } else if (!enoughEnergy) {
            upgradeMessage = "NEED " + cost + " ENERGY";
            upgradeColor = "#aa3333";
        }

        const menuWidth = 200;
        const menuHeight = 100;

        const x = Phaser.Math.Clamp(
            defender.x,
            menuWidth / 2 + 5,
            this.scene.scale.width - menuWidth / 2 - 5,
        );

        const aboveY = defender.y - 105;

        const y = aboveY - menuHeight / 2 < 5 ? defender.y + 105 : aboveY;

        const background = this.scene.add.rectangle(
            0,
            0,
            180,
            105,
            0x162536,
        ).setStrokeStyle(2, 0x00ccff);

        const name = this.scene.add.text(
            0,
            -35,
            defender.texture.key.toUpperCase(),
            { fontSize: "16px", color: "#ffffff" },
        ).setOrigin(0.5);

        const levelText = this.scene.add.text(
            0,
            -10,
            "Level " + defender.upgradeLevel,
            { fontSize: "15px", color: "#00ccff" },
        ).setOrigin(0.5);

        //display upgrade status using different colours
        const upgradeButton = this.scene.add.text(
            0,
            25,
            upgradeMessage,
            {
                fontSize: "14px",
                color: "#ffffff",
                backgroundColor: upgradeColor,
                padding: { x: 10, y: 6 },
            },
        ).setOrigin(0.5);

        if (canUpgrade) {
            upgradeButton.setInteractive({ useHandCursor: true });
            upgradeButton.on("pointerdown", () => {
                this.buyUpgrade(defender, cost, upgradeButton);
            });
        }

        this.menu = this.scene.add.container(x, y, [
            background,
            name,
            levelText,
            upgradeButton,
        ]);

        this.menu.setDepth(200);
    }

    private buyUpgrade(
        defender: Defender,
        cost: number | undefined,
        button: Phaser.GameObjects.Text,
    ): void {
        if (!defender.active) {
            this.close();
            return;
        }

        if (cost === undefined || !Number.isFinite(cost) || cost <= 0) {
            return;
        }

        if (!this.energyManager.canAfford(cost)) {
            SoundManager.play(this.scene, "sfx_ui_error");
            button.setText("NEED " + cost + " ENERGY");
            return;
        }

        if (!defender.upgrade()) return;

        SoundManager.play(this.scene, "sfx_ui_upgrade");
        this.energyManager.spendEnergy(cost);
        this.updateEnergyText();
        this.show(defender);
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
