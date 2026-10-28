import Phaser from "phaser";
import { Grid } from "../grid/Grid.ts";
import { DefenderPlacement } from "./DefenderPlacement.ts";
import {
    GRID_ROWS, GRID_X, GRID_Y,
    CELL_WIDTH, CELL_HEIGHT
} from "../constants.ts";

export class DefenderDrag {

    private draggedDefender: string | null = null;
    private dragImage: Phaser.GameObjects.Image | null = null;
    private dragHighlight: Phaser.GameObjects.Rectangle | null = null;

    constructor(
        private scene: Phaser.Scene,
        private grid: Grid,
        private defenderPlacement: DefenderPlacement,
        private clearSelection: () => void
    ) {}

    start(type: string, pointer: Phaser.Input.Pointer): void {
        this.draggedDefender = type;

        this.dragImage = this.scene.add.image(pointer.x, pointer.y, type)
            .setDisplaySize(65, 65)
            .setDepth(100);

        this.dragHighlight = this.scene.add.rectangle(
            0, 0, CELL_WIDTH, CELL_HEIGHT, 0x00ff99, 0.25
        ).setDepth(3).setVisible(false);
    }

    move(pointer: Phaser.Input.Pointer): void {
        if (!this.dragImage || !this.dragHighlight) return;

        this.dragImage.setPosition(pointer.x, pointer.y);

        const col = Math.floor((pointer.x - GRID_X) / CELL_WIDTH);
        const row = Math.floor((pointer.y - GRID_Y) / CELL_HEIGHT);

        if (
            row < 0 || row >= GRID_ROWS ||
            col < 0 || col >= this.grid.cols ||
            !this.grid.getCell(row, col).isEmpty()
        ) {
            this.dragHighlight.setVisible(false);
            return;
        }

        this.dragHighlight.setPosition(
            GRID_X + col * CELL_WIDTH + CELL_WIDTH / 2,
            GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2
        );

        this.dragHighlight.setVisible(true);
    }

    finish(pointer: Phaser.Input.Pointer): void {
        if (!this.draggedDefender) return;

        this.clearSelection();
        this.defenderPlacement.place(pointer, this.draggedDefender);

        this.dragImage?.destroy();
        this.dragHighlight?.destroy();

        this.dragImage = null;
        this.dragHighlight = null;
        this.draggedDefender = null;
    }

    isDragging(): boolean {
        return this.draggedDefender !== null;
    }
}