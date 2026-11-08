import Phaser from "phaser";
import { Grid } from "../grid/Grid.ts";
import { Defender } from "../defenders/Defender.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { EnergyManager } from "../managers/EnergyManager.ts";
import { DefenderMovement } from "./DefenderMovement.ts";
import { DefenderPlacement } from "./DefenderPlacement.ts";
import { DefenderDrag } from "./DefenderDrag.ts";
import { DefenderUpgradeMenu } from "../ui/DefenderUpgradeMenu.ts";

export function setupGameDefenders(
    scene: Phaser.Scene,
    grid: Grid,
    defenders: Defender[],
    enemies: Enemy[],
    energyManager: EnergyManager,
    lastPlaced: Record<string, number>,
    getSelectedDefender: () => string | null,
    setSelectedDefender: (value: string | null) => void,
    updateEnergyText: () => void,
    showNotification: (message: string) => void,
    isDefenderUnlocked: (type: string) => boolean
) {
    const defenderMovement = new DefenderMovement(
        grid,
        defenders,
        energyManager,
        updateEnergyText,
        showNotification
    );

    const upgradeMenu = new DefenderUpgradeMenu(
        scene,
        energyManager,
        updateEnergyText
    );

    const defenderPlacement = new DefenderPlacement(
        scene,
        grid,
        defenders,
        enemies,
        energyManager,
        lastPlaced,
        updateEnergyText,
        (defender: Defender) => {
            if (getSelectedDefender() === "move") {
                defenderMovement.select(defender);
                upgradeMenu.close();
                return;
            }

            if (
                getSelectedDefender() !== "recall" &&
                getSelectedDefender() !== "move" &&
                !defenderDrag?.isDragging()
            ) {
                upgradeMenu.show(defender);
            }
        },
        isDefenderUnlocked
    );

    const defenderDrag = new DefenderDrag(
        scene,
        grid,
        defenderPlacement,
        () => setSelectedDefender(null)
    );

    return {
        defenderMovement,
        upgradeMenu,
        defenderPlacement,
        defenderDrag
    };
}