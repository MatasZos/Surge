import Phaser from "phaser";
import { SETTINGS } from "../config/settings.ts";
import { Grid } from "../grid/Grid.ts";
import { Defender } from "../defenders/Defender.ts";
import { Shooter } from "../defenders/Shooter.ts";
import { Generator } from "../defenders/Generator.ts";
import { Barricade } from "../defenders/Barricade.ts";
import { DualBarrel } from "../defenders/DualBarrel.ts";
import { CryoGunner } from "../defenders/CryoGunner.ts";
import { Landmine } from "../defenders/Landmine.ts";
import { Scrapper } from "../defenders/Scrapper.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { EnergyManager } from "../managers/EnergyManager.ts";

import {
    GRID_ROWS,
    GRID_COLS,
    GRID_X,
    GRID_Y,
    CELL_WIDTH,
    CELL_HEIGHT
} from "../constants.ts";

type DefenderType = "shooter" | "generator" | "barricade" | "dualbarrel" | "cryogunner" | "landmine" | "scrapper";

export class DefenderPlacement {

    //check if a generator has been placed for tutorieal
    private generatorPlaced = false;    

    constructor(
        private scene: Phaser.Scene,
        private grid: Grid,
        private defenders: Defender[],
        private enemies: Enemy[],
        private energyManager: EnergyManager,
        private lastPlaced: Record<string, number>,
        private updateEnergyText: () => void,
        private openUpgradeMenu: (defender: Defender) => void,
        private isUnlocked: (type:string) => boolean
    ) {}

        private getGridPosition(pointer: Phaser.Input.Pointer) {
        return {
            col: Math.floor((pointer.x - GRID_X) / CELL_WIDTH),
            row: Math.floor((pointer.y - GRID_Y) / CELL_HEIGHT)
        };
    }

private createDefender(type: DefenderType, x: number, y: number): Defender {
    switch (type) {
        case "scrapper":
            return new Scrapper(this.scene, x, y);
        case "landmine":
            return new Landmine(this.scene, x, y);
        case "generator":
            return new Generator(this.scene, x, y);
        case "barricade":
            return new Barricade(this.scene, x, y);
        case "dualbarrel":
            return new DualBarrel(this.scene, x, y, this.enemies);
        case "cryogunner":
            return new CryoGunner(this.scene, x, y, this.enemies);
        case "shooter":
            return new Shooter(this.scene, x, y, this.enemies);
    }
}

        private showWarning(message: string): void {
        const warning = this.scene.add.text(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            message,
            {
                fontSize: "20px",
                color: "#ff6666",
                fontStyle: "bold",
                stroke: "#101b2b",
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(200);

        this.scene.tweens.add({
            targets: warning,
            y: warning.y - 30,
            alpha: 0,
            duration: 1000,
            ease: "Sine.easeOut",
            onComplete: () => {
                warning.destroy();
            }
        });
    }

    place(pointer: Phaser.Input.Pointer, selectedDefender: string | null): void {
         const { row, col } = this.getGridPosition(pointer);

        if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return;
        if (!this.grid.getCell(row, col).isEmpty()) {
            if (selectedDefender && selectedDefender !== "recall" && selectedDefender !== "move") {
                this.flashGridCell(row, col, 0xff4444);
            }
            return;
        }


        const validTypes = ["shooter", "generator", "barricade",
        "dualbarrel", "cryogunner", "landmine", "scrapper"];

        if (!selectedDefender || !validTypes.includes(selectedDefender)) return;

        const type = selectedDefender as DefenderType;

        //make the player place a generator first in Level 1
        if (type === "shooter" && !this.generatorPlaced) {
            this.flashGridCell(row, col, 0xff4444);
            this.showWarning("PLACE A GENERATOR FIRST!");
            return;
        }

        if (!this.isUnlocked(type)){
            this.flashGridCell(row, col, 0xff4444);
            this.showWarning("Defender Locked");
            return;
        }
        const cost = SETTINGS.defenders[type].cost;
        const cooldown = SETTINGS.defenders[type].cooldownMs;

        if (!this.energyManager.canAfford(cost)) {
            this.flashGridCell(row, col, 0xff4444);
            this.showWarning("Not Enough Energy");
            return;
        }

        const now = this.scene.time.now;
        const last = this.lastPlaced[type];

        if (last !== undefined && now - last < cooldown) {
            this.flashGridCell(row, col, 0xff4444);
            this.showWarning("Not Ready Yet");
            return;
        }

        const x = GRID_X + col * CELL_WIDTH + CELL_WIDTH / 2;
        const y = GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

       const defender = this.createDefender(type, x, y);

        this.grid.placeHuman(row, col, defender);

        defender.setData("gridRow", row);
        defender.setData("gridCol", col);
        defender.setData("defenderType", type);

        this.defenders.push(defender);

        defender.setInteractive({ useHandCursor: true });

        defender.on("pointerdown", () => {
            if (defender.active) {
                this.openUpgradeMenu(defender);
            }
        });

        this.energyManager.spendEnergy(cost);
        this.flashGridCell(row, col, 0x00ff99);

        //purchase confirmation
        const purchaseText = this.scene.add.text(
            pointer.worldX,
            pointer.worldY - 35,
            "DEPLOYED",
            {
                fontSize: "15px",
                color: "#00ff99",
                fontStyle: "bold",
                stroke: "#101b2b",
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(30);

        this.scene.tweens.add({
            targets: purchaseText,
            y: purchaseText.y - 25,
            alpha: 0,
            duration: 650,
            ease: "Sine.easeOut",
            onComplete: () => {
                purchaseText.destroy();
            }
        });

        this.updateEnergyText();

        this.lastPlaced[type] = now;

        //emember when the first generator is placed
        if (type === "generator") {
            this.generatorPlaced = true;
        }


        //update tutorial after a successful placement
        this.scene.events.emit("defender-placed", type);
    }

    private flashGridCell(row: number, col: number, color: number): void {
        const x = GRID_X + col * CELL_WIDTH + CELL_WIDTH / 2;
        const y = GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

        const flash = this.scene.add.rectangle(
            x,
            y,
            CELL_WIDTH - 4,
            CELL_HEIGHT - 4,
            color,
            0.35
        ).setDepth(20);

        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 350,
            ease: "Sine.easeOut",
            onComplete: () => {
                flash.destroy();
            }
        });
    }

    recall(pointer: Phaser.Input.Pointer): void {

        const { row, col } = this.getGridPosition(pointer);

        if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return;

        const defender = this.defenders.find(d =>
            d.active &&
            d.getData("gridRow") === row &&
            d.getData("gridCol") === col
        );

        if (!defender) return;

        // Calculate refund from original defender cost
        const type = defender.getData("defenderType") as DefenderType;
        const cost = SETTINGS.defenders[type].cost;
        const refund = Math.floor(cost * SETTINGS.energy.sellRefundMultiplier);

        // Return energy and update HUD
        this.energyManager.addEnergy(refund);
        this.updateEnergyText();

        // Remove defender and free grid cell
        defender.destroy();
        this.grid.removeOccupant(row, col);

        const index = this.defenders.indexOf(defender);
        if (index !== -1) {
            this.defenders.splice(index, 1);
        }
        
        console.log("Sold:", type, "Energy refunded:", refund);
    }
}
