import type Phaser from "phaser";
import { SETTINGS } from "../../config/settings.ts";
import type { Grid } from "../../grid/Grid.ts";
import type { Defender } from "../../defenders/Defender.ts";
import type { Enemy } from "../../enemies/Enemy.ts";
import { RangedEnemy } from "../../enemies/RangedEnemy.ts";
import { CrusherEnemy } from "../../enemies/CrusherEnemy.ts";
import { DroneEnemy } from "../../enemies/DroneEnemy.ts";
import { Landmine } from "../../defenders/Landmine.ts";
import { Scrapper } from "../../defenders/Scrapper.ts";
import { playMeleeAttack } from "./PlayMeleeAttack.ts";
import { removeDefenderFromBoard } from "./RemoveDefenderFromBoard.ts";

export class DefenderCollision {
    constructor(
        private scene: Phaser.Scene,
        private grid: Grid,
        private enemies: Enemy[],
        private defenders: Defender[],
        private attackTimers: Map<Enemy, Phaser.Time.TimerEvent>,
        private stopAttack: (enemy: Enemy) => void,
    ) {}

    update(): void {
        this.checkLandmines();
        this.checkScrappers();
        this.checkMeleeAttacks();
    }

    private checkLandmines(): void {
        for (const defender of [...this.defenders]) {
            if (!(defender instanceof Landmine) || !defender.active) continue;
            const row = defender.getData("gridRow") as number;
            const col = defender.getData("gridCol") as number;

            // Flying drones pass over mines and are immune to their explosions.
            const groundEnemies = this.enemies.filter((enemy) => !(enemy instanceof DroneEnemy));
            if (!defender.tryDetonate(groundEnemies)) continue;

            removeDefenderFromBoard(this.grid, this.defenders, defender, row, col);
            this.stopDefeatedEnemies();
        }
    }

    private checkScrappers(): void {
        for (const defender of this.defenders) {
            if (!(defender instanceof Scrapper) || !defender.active) continue;
            if (defender.tryBite(this.enemies)) {
                this.stopDefeatedEnemies();
            }
        }
    }

    private checkMeleeAttacks(): void {
        for (const enemy of this.enemies) {
            if (!enemy.active || enemy.isAttacking) continue;
            if (enemy instanceof RangedEnemy || enemy instanceof DroneEnemy) continue;

            for (const defender of this.defenders) {
                if (!defender.active || defender instanceof Landmine) continue;

                // Use grid positions so transparent sprite padding does not change attack range.
                const sameLane = Math.abs(enemy.y - defender.y) < SETTINGS.combat.meleeLaneTolerance;
                const distanceAhead = enemy.x - defender.x;
                const inAttackRange = distanceAhead >= -SETTINGS.combat.meleeBehindTolerance &&
                    distanceAhead <= SETTINGS.combat.meleeRange;
                if (!sameLane || !inAttackRange) continue;

                this.startAttack(enemy, defender);
                break;
            }
        }
    }

    private startAttack(enemy: Enemy, defender: Defender): void {
        enemy.isAttacking = true;
        const frontEdge = defender.x + SETTINGS.combat.meleeStandOffDistance;
        if (enemy.x < frontEdge) enemy.x = frontEdge;

        const row = defender.getData("gridRow");
        const col = defender.getData("gridCol");
        const delay = this.getAttackInterval(enemy);
        const timer = this.scene.time.addEvent({
            delay,
            callback: () => {
                if (!enemy.active || !defender.active) {
                    this.stopAttack(enemy);
                    return;
                }

                playMeleeAttack(this.scene, enemy);
                defender.takeDamage(enemy.damage);
                if (!defender.active) {
                    removeDefenderFromBoard(this.grid, this.defenders, defender, row, col);
                    this.stopAttack(enemy);
                }
            },
            loop: true,
        });

        this.attackTimers.set(enemy, timer);
    }

    private getAttackInterval(enemy: Enemy): number {
        if (enemy instanceof CrusherEnemy) {
            return Math.max(1, SETTINGS.enemies.crusher.attackIntervalMs);
        }
        return Math.max(1, SETTINGS.enemies.melee.attackIntervalMs);
    }

    private stopDefeatedEnemies(): void {
        for (const enemy of this.enemies) {
            if (!enemy.active) this.stopAttack(enemy);
        }
    }
}
