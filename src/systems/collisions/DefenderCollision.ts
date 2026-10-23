import Phaser from "phaser";
import { SETTINGS } from "../../config/settings";
import { Grid } from "../../grid/Grid";
import { Defender } from "../../defenders/Defender";
import { Enemy } from "../../enemies/Enemy";
import { RangedEnemy } from "../../enemies/RangedEnemy";
import { CrusherEnemy } from "../../enemies/CrusherEnemy";
import { Landmine } from "../../defenders/Landmine";

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
        return 1000;
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

        for (const enemy of this.enemies) {
            if (!enemy.active || enemy.isAttacking) continue;
            if (enemy instanceof RangedEnemy) continue;

            for (const defender of this.defenders) {
                if (!defender.active || defender instanceof Landmine) continue;

                const hit = Phaser.Geom.Intersects.RectangleToRectangle(
                    enemy.getBounds(),
                    defender.getBounds()
                );

                if (!hit) continue;

                enemy.isAttacking = true;

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
