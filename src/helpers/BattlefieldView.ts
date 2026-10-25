
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
} from "../constants.ts";

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

        // Decorative fortress extension fills the former left sidebar.
        // Keep it behind the stronghold and HUD; do not move the gameplay grid.
        const fortress = this.scene.add.image(
            SIDEBAR_WIDTH / 2,
            GAME_HEIGHT / 2,
            "fortressExtension"
        );
        fortress.setDisplaySize(SIDEBAR_WIDTH, GAME_HEIGHT);
        fortress.setDepth(-9);
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
