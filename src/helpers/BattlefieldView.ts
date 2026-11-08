
import Phaser from "phaser";

import {
    GAME_WIDTH,
    GAME_HEIGHT,
    GRID_ROWS,
    GRID_COLS,
    GRID_X,
    GRID_Y,
    CELL_WIDTH,
    CELL_HEIGHT
} from "../constants.ts";


export class BattlefieldView {
    constructor(private scene: Phaser.Scene) {}

private levelText!: Phaser.GameObjects.Text;

createLevelIndicator(level: number): void {this.levelText = this.scene.add.text(this.scene.scale.width - 25,
        this.scene.scale.height - 75,
        "Level " + level,
        {
            fontSize: "22px",
            color: "#00ff99",
            backgroundColor: "#162536",
            padding: { x: 12, y: 8 }
        }
    );

    this.levelText.setOrigin(1, 1);
    this.levelText.setDepth(20);
}

updateLevelIndicator(level: number): void {
    this.levelText.setText("Level " + level);
}

    
createBackground(): void {
    const background = this.scene.add.image(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        "battlefield"
    );

    background.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    background.setDepth(-10);
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
