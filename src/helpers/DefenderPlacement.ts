
import Phaser from "phaser";
import { SETTINGS } from "../config/settings";
import { Grid } from "../grid/Grid";
import { Defender } from "../defenders/Defender";
import { Shooter } from "../defenders/Shooter";
import { Generator } from "../defenders/Generator";
import { Barricade } from "../defenders/Barricade";
import { DualBarrel } from "../defenders/DualBarrel";
import { Enemy } from "../enemies/Enemy";
import { EnergyManager } from "../managers/EnergyManager";

import {
    GRID_ROWS,
    GRID_COLS,
    GRID_X,
    GRID_Y,
    CELL_WIDTH,
    CELL_HEIGHT
} from "../constants";

type DefenderType = "shooter" | "generator" | "barricade" | "dualbarrel";

export class DefenderPlacement {
    constructor(
        private scene: Phaser.Scene,
        private grid: Grid,
        private defenders: Defender[],
        private enemies: Enemy[],
        private energyManager: EnergyManager,
        private lastPlaced: Record<string, number>,
        private updateEnergyText: () => void
    ) {}

    place(pointer: Phaser.Input.Pointer, selectedDefender: string | null): void {
        const col = Math.floor((pointer.x - GRID_X) / CELL_WIDTH);
        const row = Math.floor((pointer.y - GRID_Y) / CELL_HEIGHT);

        if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return;
        if (!this.grid.getCell(row, col).isEmpty()) return;
        if (!selectedDefender) return;

        if (
            selectedDefender !== "shooter" &&
            selectedDefender !== "generator" &&
            selectedDefender !== "barricade" &&
            selectedDefender !== "dualbarrel"
        ) return;

        const type = selectedDefender as DefenderType;
        const cost = SETTINGS.defenders[type].cost;
        const cooldown = SETTINGS.defenders[type].cooldownMs;

        if (!this.energyManager.canAfford(cost)) {
            console.log("Not enough energy");
            return;
        }

        const now = this.scene.time.now;
        const last = this.lastPlaced[type];

        if (last !== undefined && now - last < cooldown) {
            console.log("Defender on cooldown");
            return;
        }

        const x = GRID_X + col * CELL_WIDTH + CELL_WIDTH / 2;
        const y = GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

        let defender: Defender;

        if (type === "generator") {
            defender = new Generator(this.scene, x, y);
        } else if (type === "barricade") {
            defender = new Barricade(this.scene, x, y);
        } else if (type === "dualbarrel") {
            defender = new DualBarrel(this.scene, x, y, this.enemies);
        } else {
            defender = new Shooter(this.scene, x, y, this.enemies);
        }

        this.grid.placeHuman(row, col, defender);

        defender.setData("gridRow", row);
        defender.setData("gridCol", col);

        this.defenders.push(defender);

        this.energyManager.spendEnergy(cost);
        this.updateEnergyText();

        this.lastPlaced[type] = now;
    }
}
