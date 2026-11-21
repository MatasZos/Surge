
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

import type {Grid} from "../grid/Grid.ts";


export class BattlefieldView {
    constructor(private scene: Phaser.Scene) {}

private levelText!: Phaser.GameObjects.Text;
private progressBar!: Phaser.GameObjects.Rectangle;

//position the wave progress bar under the wave text
createWaveProgressBar(): void {
    const x = this.scene.scale.width - 125;
    const y = this.scene.scale.height - 35;

    //shadow behind the wave container
    const shadow = this.scene.add.rectangle(x + 4, y - 24, 230, 85, 0x000000, 0.4);
    shadow.setDepth(18);

    //dark container for wave text and progress bar
    const panel = this.scene.add.rectangle(x, y - 28, 230, 85, 0x101e30, 0.96);
    panel.setStrokeStyle(2, 0x00ccff, 0.65);
    panel.setDepth(19);

    //progress bar background
    const background = this.scene.add.rectangle(x, y, 200, 18, 0x263d50);
    background.setStrokeStyle(1, 0x4a7085); 
    background.setDepth(20);

    //progress bar fill
    this.progressBar = this.scene.add.rectangle(x - 100, y, 200, 18, 0x00ccff);

    this.progressBar.setOrigin(0, 0.5);
    this.progressBar.setScale(0, 1);
    this.progressBar.setDepth(21);
}

//update the bar as enemies are defeated
updateWaveProgressBar(progress: number): void {
    this.progressBar.setScale(progress, 1);
}

createLevelIndicator(level: number): void {this.levelText = this.scene.add.text(this.scene.scale.width - 25,
        this.scene.scale.height - 125,
        "LEVEL " + level,
        {
            fontSize: "22px",
            fontStyle: "bold",
            color: "#00ff99",
            backgroundColor: "#101e30",
            padding: { x: 12, y: 8 },
            stroke: "#000000",
            strokeThickness: 1
        }
    );

    this.levelText.setOrigin(1, 1);
    this.levelText.setDepth(20);
}

updateLevelIndicator(level: number): void {
    this.levelText.setText("LEVEL " + level);
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

    private moveHighlight?: Phaser.GameObjects.Graphics;

    updateMoveHighlight(grid:Grid, moveActive: boolean): void{
        if(!moveActive){
            this.moveHighlight?.setVisible(false);
            return;
        }

        this.moveHighlight ??= this.scene.add.graphics().setDepth(-1);
        const highlight = this.moveHighlight;
        highlight.setVisible(true)
        highlight.clear();

        for(let row=0; row<GRID_ROWS;row++){
            for(let col=0;col<GRID_COLS;col++){
                const x=GRID_X+col*CELL_WIDTH+2;
                const y=GRID_Y+row*CELL_HEIGHT+2;
                const color = grid.getCell(row,col).isEmpty()?0x32e678:0xf25460;

                highlight.fillStyle(color,0.28);
                highlight.fillRect(x,y,CELL_WIDTH-4,CELL_HEIGHT-4);
                highlight.lineStyle(2,color,0.8);
                highlight.strokeRect(x,y,CELL_WIDTH-4,CELL_HEIGHT-4);
            }
        }
    }
}
