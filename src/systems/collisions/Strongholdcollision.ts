import Phaser from "phaser";
import { SETTINGS } from "../../config/settings";
import { Enemy } from "../../enemies/Enemy";
import { RangedEnemy } from "../../enemies/RangedEnemy";
import { CrusherEnemy } from "../../enemies/CrusherEnemy";
import { Stronghold } from "../../objects/Stronghold";

export class StrongholdCollision {
    constructor(
        private scene: Phaser.Scene,
        private enemies: Enemy[],
        private stronghold: Stronghold,
        private attackTimers: Map<Enemy, Phaser.Time.TimerEvent>,
        private stopAttack: (enemy: Enemy) => void
    ) {}

    update(): void {
        for (const enemy of this.enemies) {
            if (!enemy.active || enemy.isAttacking) continue;
            if (enemy instanceof RangedEnemy) continue;

            const hit = Phaser.Geom.Intersects.RectangleToRectangle(
                enemy.getBounds(),
                this.stronghold.getCollisionBounds()
            );

            if (!hit) continue;

            enemy.isAttacking = true;

            const interval = enemy instanceof CrusherEnemy
                ? Math.max(1, SETTINGS.enemies.crusher.attackIntervalMs)
                : Math.max(1, SETTINGS.stronghold.meleeAttackIntervalMs);

            const timer = this.scene.time.addEvent({
                delay: interval,
                callback: () => {
                    if (!enemy.active || this.stronghold.health <= 0) {
                        this.stopAttack(enemy);
                        return;
                    }

                    this.stronghold.takeDamage(enemy.damage);

                    // Stronghold retaliates if it survives.
                    if (this.stronghold.health > 0 && enemy.active) {
                        enemy.takeDamage(SETTINGS.stronghold.retaliationDamage);
                    }

                    // Stop attacking if either is destroyed.
                    if (!enemy.active || this.stronghold.health <= 0) {
                        this.stopAttack(enemy);
                    }
                },
                loop: true
            });

            this.attackTimers.set(enemy, timer);
        }
    }
}
