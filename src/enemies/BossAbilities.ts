import Phaser from "phaser";
import { SETTINGS } from "../config/settings.ts";
import type { BossEnemy } from "./BossEnemy.ts";
import { EnemyProjectile } from "../objects/EnemyProjectile.ts";
import { GRID_ROWS } from "../constants.ts";
import { Defender } from "../defenders/Defender.ts";
import { Grid } from "../grid/Grid.ts";
import { getRowCenterY } from "../grid/GridPosition.ts";
import { OverlordLaser } from "../boss/OverlordLaser.ts";;
import { SoundManager } from "../helpers/SoundManager.ts";

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

        this.laser.update(delta);

        this.attackTimer += delta;
        this.empTimer += delta;

        if (this.attackTimer >= this.getAttackInterval()) {
            this.attackTimer = 0;
            this.shoot();
        }

        if (this.empTimer >= SETTINGS.enemies.boss.empCooldownMs) {
            this.empTimer = 0;
            this.onEMP(SETTINGS.enemies.boss.empDurationMs);
        }
    }

    private shoot(): void {
        
        // Play Overlord cannon sound
        SoundManager.play(this.scene, "sfx_boss_cannon");

        const row = this.attackLane % GRID_ROWS;
        this.attackLane++;

        const y = getRowCenterY(row);

        const projectile = new EnemyProjectile(
            this.scene,
            this.boss.x - this.boss.displayWidth / 2,
            y
        );

        projectile.damage = this.getAttackDamage();
    }

    private getAttackInterval(): number {
        switch (this.boss.phases.phase) {
            case 2: return SETTINGS.enemies.boss.phase2AttackIntervalMs;
            case 3: return SETTINGS.enemies.boss.phase3AttackIntervalMs;
            case 4: return SETTINGS.enemies.boss.phase4AttackIntervalMs;
            default: return SETTINGS.enemies.boss.attackIntervalMs;
        }
    }

    private getAttackDamage(): number {
        switch (this.boss.phases.phase) {
            case 2: return SETTINGS.enemies.boss.phase2AttackDamage;
            case 3: return SETTINGS.enemies.boss.phase3AttackDamage;
            case 4: return SETTINGS.enemies.boss.phase4AttackDamage;
            default: return SETTINGS.enemies.boss.damage;
        }
    }
}
