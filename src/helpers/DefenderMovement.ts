
import Phaser from "phaser";

import { Defender } from "../defenders/Defender.ts";
import { Grid } from "../grid/Grid.ts";
import { EnergyManager } from "../managers/EnergyManager.ts";

import {
    GRID_ROWS,
    GRID_COLS,
    GRID_X,
    GRID_Y,
    CELL_WIDTH,
    CELL_HEIGHT
} from "../constants.ts";

export class DefenderMovement {
    private selectedDefender: Defender | null = null;
    private readonly moveCost = 50;

    constructor(
        private grid: Grid,
        private defenders: Defender[],
        private energyManager: EnergyManager,
        private updateEnergyText: () => void,
        private showNotification: (message: string) => void
    ) {}

    // Select a defender to reposition
    public select(defender: Defender): void {
        if (defender.getData("hasMoved") === true) {
            this.showNotification("DEFENDER ALREADY MOVED");
            return;
        }

        this.selectedDefender = defender;
        this.showNotification("SELECT AN EMPTY CELL TO MOVE");
    }

    // Cancel the current movement selection
    public cancel(): void {
        this.selectedDefender = null;
    }

    // Move the selected defender to a new cell
    public move(pointer: Phaser.Input.Pointer): void {
        // Ignore clicks on existing defenders
        for (const defender of this.defenders) {
            if (!defender.active) {
                continue;
            }

            if (defender.getBounds().contains(
                pointer.worldX,
                pointer.worldY
            )) {
                return;
            }
        }

        if (!this.selectedDefender?.active) {
            this.showNotification("SELECT A DEFENDER FIRST");
            return;
        }

        // Find the clicked grid cell
        const col = Math.floor(
            (pointer.worldX - GRID_X) / CELL_WIDTH
        );

        const row = Math.floor(
            (pointer.worldY - GRID_Y) / CELL_HEIGHT
        );

        // Check that the cell is inside the battlefield
        if (row < 0 || row >= GRID_ROWS ||
            col < 0 || col >= GRID_COLS) {
            this.showNotification("INVALID CELL");
            return;
        }

        const cell = this.grid.getCell(row, col);

        // The destination must be empty
        if (!cell.isEmpty()) {
            this.showNotification("CELL OCCUPIED");
            return;
        }

        const defender = this.selectedDefender;

        const oldRow = defender.getData("gridRow") as number;
        const oldCol = defender.getData("gridCol") as number;

        // Check the defender's original cell
        if (
            !Number.isInteger(oldRow) ||
            !Number.isInteger(oldCol) ||
            oldRow < 0 ||
            oldRow >= GRID_ROWS ||
            oldCol < 0 ||
            oldCol >= GRID_COLS
        ) {
            this.showNotification("DEFENDER POSITION INVALID");
            return;
        }

        if (this.grid.getCell(oldRow, oldCol).occupant !== defender) {
            this.showNotification("DEFENDER POSITION INVALID");
            return;
        }

        // Pay the movement cost
        if (!this.energyManager.spendEnergy(this.moveCost)) {
            this.showNotification("NOT ENOUGH ENERGY");
            return;
        }

        this.updateEnergyText();

        // Free the old cell and occupy the new one
        this.grid.removeOccupant(oldRow, oldCol);
        this.grid.placeHuman(row, col, defender);

        // Work out the centre of the new cell
        const x = GRID_X + col * CELL_WIDTH + CELL_WIDTH / 2;
        const y = GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

        // Move the defender and its indicators
        defender.repositionTo(x, y);

        // Save the new grid position
        defender.setData("gridRow", row);
        defender.setData("gridCol", col);
        defender.setData("hasMoved", true);

        this.selectedDefender = null;

        this.showNotification("DEFENDER MOVED");
    }
}
