import Phaser from "phaser";
import { SETTINGS } from "../config/settings.ts";
import { BossEnemy } from "../enemies/BossEnemy.ts";
import { Defender } from "../defenders/Defender.ts";
import { Grid } from "../grid/Grid.ts";
import { getRowCenterY } from "../grid/GridPosition.ts";
import {
    GRID_ROWS,
    GRID_COLS,
    GRID_X,
    CELL_WIDTH,
    CELL_HEIGHT
} from "../constants.ts";
import { SoundManager } from "../helpers/SoundManager.ts";

export class OverlordLaser {
    private cooldown = 0;
    private charging = false;
    private chargeTimer = 0;
    private targetRow = 0;
    private warning?: Phaser.GameObjects.Rectangle;

    constructor(
        private scene: Phaser.Scene,
        private boss: BossEnemy,
        private defenders: Defender[],
        private grid: Grid
    ) {}

    update(delta: number): void {
        if (!this.boss.active) {
            this.warning?.destroy();
            this.warning = undefined;
            return;
        }

        if (this.charging) {
            this.chargeTimer -= delta;

            if (this.chargeTimer <= 0) {
                this.fire();
            }

            return;
        }

        if (this.boss.phases.phase < 3) return;

        this.cooldown += delta;

        const interval = this.boss.phases.phase === 4 ? SETTINGS.enemies.boss.overdriveLaserIntervalMs : SETTINGS.enemies.boss.laserIntervalMs;

        if (this.cooldown >= interval) {
            this.cooldown = 0;
            this.startCharging();
        }
    }

    private startCharging(): void {
        this.charging = true;

        // Laser charging sound
        SoundManager.play(this.scene, "sfx_boss_laser_charge");

        this.targetRow = Phaser.Math.Between(0, GRID_ROWS - 1);
        this.chargeTimer = this.boss.phases.phase === 4 ? SETTINGS.enemies.boss.overdriveLaserChargeMs : SETTINGS.enemies.boss.laserChargeMs;

        const y = getRowCenterY(this.targetRow);

        this.warning = this.scene.add.rectangle(
            GRID_X + GRID_COLS * CELL_WIDTH / 2,
            y,
            GRID_COLS * CELL_WIDTH,
            CELL_HEIGHT,
            0xff0000,
            0.25
        );

        this.warning.setDepth(20);
    }

    private fire(): void {
        this.charging = false;
        
        // Laser firing sound
        SoundManager.play(this.scene, "sfx_boss_laser_fire");

        this.warning?.destroy();
        this.warning = undefined;

        const damage = this.boss.phases.phase === 4 ? SETTINGS.enemies.boss.overdriveLaserDamage : SETTINGS.enemies.boss.laserDamage;
        const y = getRowCenterY(this.targetRow);

        const laser = this.scene.add.rectangle(
            GRID_X + GRID_COLS * CELL_WIDTH / 2,
            y,
            GRID_COLS * CELL_WIDTH,
            12,
            0xff0000
        );

        laser.setDepth(21);

        for (const defender of [...this.defenders]) {
            if (!defender.active) continue;

            const row = defender.getData("gridRow");

            if (row !== this.targetRow) continue;

            defender.takeDamage(damage);

            if (!defender.active) {
                const col = defender.getData("gridCol");

                if (
                    typeof col === "number" &&
                    col >= 0 &&
                    col < this.grid.cols
                ) {
                    this.grid.removeOccupant(row, col);
                }

                const index = this.defenders.indexOf(defender);

                if (index !== -1) {
                    this.defenders.splice(index, 1);
                }
            }
        }

        this.scene.time.delayedCall(250, () => {
            laser.destroy();
        });
    }
}
