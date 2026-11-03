
import Phaser from "phaser";
import { BossEnemy } from "./BossEnemy.ts";
import { EnemyProjectile } from "../objects/EnemyProjectile.ts";
import { GRID_ROWS, GRID_Y, CELL_HEIGHT } from "../constants.ts"
import { Defender } from "../defenders/Defender.ts";
import { Grid } from "../grid/Grid.ts";
import { OverlordLaser } from "../boss/OverlordLaser.ts";;

export class BossAbilities {
    private attackTimer = 0;
    private attackLane = 0;
    private empTimer = 0;
    private laser: OverlordLaser;

   constructor(
        private scene: Phaser.Scene,
        private boss: BossEnemy,
        private onEMP: (duration: number) => void,
        defenders: Defender[],
        grid: Grid
    ) {
        this.laser = new OverlordLaser(scene, boss, defenders, grid);
    }

    update(delta: number): void {
        if (!this.boss.active || this.boss.health <= 0) return;

        this.attackTimer += delta;
        this.empTimer += delta;

        if (this.attackTimer >= this.getAttackInterval()) {
            this.attackTimer = 0;
            this.shoot();
        }

        if (this.empTimer >= BossEnemy.EMP_COOLDOWN_MS) {
            this.empTimer = 0;
            this.onEMP(BossEnemy.EMP_DURATION_MS);
        }
    }

    private shoot(): void {
        const row = this.attackLane % GRID_ROWS;
        this.attackLane++;

        const y = GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

        const projectile = new EnemyProjectile(
            this.scene,
            this.boss.x - this.boss.displayWidth / 2,
            y
        );

        projectile.damage = this.getAttackDamage();
    }

    private getAttackInterval(): number {
        switch (this.boss.phases.phase) {
            case 2: return 1700;
            case 3: return 1400;
            case 4: return 1000;
            default: return 2000;
        }
    }

    private getAttackDamage(): number {
        switch (this.boss.phases.phase) {
            case 2: return 250;
            case 3: return 300;
            case 4: return 400;
            default: return 200;
        }
    }
}
