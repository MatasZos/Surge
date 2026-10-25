import Phaser from "phaser";
import { SETTINGS } from "../../config/settings.ts";
import { Grid } from "../../grid/Grid.ts";
import { Defender } from "../../defenders/Defender.ts";
import { Enemy } from "../../enemies/Enemy.ts";
import { RangedEnemy } from "../../enemies/RangedEnemy.ts";
import { CrusherEnemy } from "../../enemies/CrusherEnemy.ts";
import { Landmine } from "../../defenders/Landmine.ts";
import { Scrapper } from "../../defenders/Scrapper.ts";

export class DefenderCollision {
    constructor(
        private scene: Phaser.Scene,
        private grid: Grid,
        private enemies: Enemy[],
        private defenders: Defender[],
        private attackTimers: Map<Enemy, Phaser.Time.TimerEvent>,
        private stopAttack: (enemy: Enemy) => void
    ) {}

    private getAttackInterval(enemy: Enemy): number {
        if (enemy instanceof CrusherEnemy) {
            return Math.max(1, SETTINGS.enemies.crusher.attackIntervalMs);
        }

        //melee enemy csv attack interval  value
        return Math.max(1, SETTINGS.enemies.melee.attackIntervalMs);
    }

    update(): void {
        // Landmines detonate before regular melee attack handling.
        // This also handles ranged enemies that step onto an armed mine.
        for (const defender of [...this.defenders]) {
            if (!(defender instanceof Landmine) || !defender.active) continue;
            const row = defender.getData("gridRow") as number;
            const col = defender.getData("gridCol") as number;
            if (!defender.tryDetonate(this.enemies)) continue;
            this.grid.removeOccupant(row, col);
            const index = this.defenders.indexOf(defender);
            if (index !== -1) this.defenders.splice(index, 1);
            for (const enemy of this.enemies) {
                if (!enemy.active) this.stopAttack(enemy);
            }
        }

        // Scrapper's short-range bite is checked every frame, independently
        // of enemy melee attacks. Its own class handles the recovery timer.
        for (const defender of this.defenders) {
            if (!(defender instanceof Scrapper) || !defender.active) continue;
            if (defender.tryBite(this.enemies)) {
                // If Scrapper killed an enemy currently attacking, clear its timer.
                for (const enemy of this.enemies) {
                    if (!enemy.active) this.stopAttack(enemy);
                }
            }
        }

        for (const enemy of this.enemies) {
            if (!enemy.active || enemy.isAttacking) continue;
            if (enemy instanceof RangedEnemy) continue;

            for (const defender of this.defenders) {
                if (!defender.active || defender instanceof Landmine) continue;

                // Detect a defender immediately ahead in the same lane.
                // Using sprite overlap alone can miss collisions because
                // defender artwork has varying transparent margins/sizes.
                // Grid-centre positions are authoritative, not sprite image bounds.
                // Enemies travel right-to-left and must stop before crossing the tile.
                const sameLane = Math.abs(enemy.y - defender.y) < 45;
                const distanceAhead = enemy.x - defender.x;
                const inAttackRange = distanceAhead >= -12 && distanceAhead <= 75;

                if (!sameLane || !inAttackRange) continue;

                enemy.isAttacking = true;
                // Hold the enemy at the defender's front edge.
                // Prevents fast enemies from stepping through while attacking.
                if (enemy.x < defender.x + 34) enemy.x = defender.x + 34;

                const row = defender.getData("gridRow");
                const col = defender.getData("gridCol");

                const timer = this.scene.time.addEvent({
                    delay: this.getAttackInterval(enemy),
                    callback: () => {
                        if (!enemy.active || !defender.active) {
                            this.stopAttack(enemy);
                            return;
                        }

                        defender.takeDamage(enemy.damage);

                        if (!defender.active) {
                            this.grid.removeOccupant(row, col);

                            const index = this.defenders.indexOf(defender);
                            if (index !== -1) {
                                this.defenders.splice(index, 1);
                            }

                            this.stopAttack(enemy);
                        }
                    },
                    loop: true
                });

                this.attackTimers.set(enemy, timer);
                break;
            }
        }
    }
}
