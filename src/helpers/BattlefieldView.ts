
import Phaser from "phaser";

import {
    GAME_HEIGHT,
    SIDEBAR_WIDTH,
    BATTLEFIELD_WIDTH,
    GRID_ROWS,
    GRID_COLS,
    GRID_X,
    GRID_Y,
    CELL_WIDTH,
    CELL_HEIGHT
} from "../constants";

export class BattlefieldView {
    constructor(private scene: Phaser.Scene) {}

    createBackground(): void {
        const background = this.scene.add.image(
            SIDEBAR_WIDTH + BATTLEFIELD_WIDTH / 2,
            GAME_HEIGHT / 2,
            "battlefield"
        );

        background.setDisplaySize(BATTLEFIELD_WIDTH, GAME_HEIGHT);
        background.setDepth(-10);

        this.scene.add.rectangle(
            SIDEBAR_WIDTH / 2,
            GAME_HEIGHT / 2,
            SIDEBAR_WIDTH,
            GAME_HEIGHT,
            0x1b2838
        ).setDepth(-9);
    }

    drawGrid(): void {
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(2, 0xffffff, 0.5);

        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                graphics.strokeRect(
                    GRID_X + col * CELL_WIDTH,
                    GRID_Y + row * CELL_HEIGHT,
                    CELL_WIDTH,
                    CELL_HEIGHT
                );
            }
        }
    }

    setupGridHighlight(): void {
        const highlight = this.scene.add.rectangle(
            0, 0,
            CELL_WIDTH,
            CELL_HEIGHT,
            0x00ccff,
            0.2
        );

        highlight.setVisible(false);

        this.scene.input.on(
            "pointermove",
            (pointer: Phaser.Input.Pointer) => {
                const col = Math.floor(
                    (pointer.x - GRID_X) / CELL_WIDTH
                );

                const row = Math.floor(
                    (pointer.y - GRID_Y) / CELL_HEIGHT
                );

                if (
                    row >= 0 && row < GRID_ROWS &&
                    col >= 0 && col < GRID_COLS
                ) {
                    highlight.setPosition(
                        GRID_X + col * CELL_WIDTH + CELL_WIDTH / 2,
                        GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2
                    );

                    highlight.setVisible(true);
                } else {
                    highlight.setVisible(false);
                }
            }
        );
    }
}
