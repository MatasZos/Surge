
import Phaser from "phaser";
import { SETTINGS } from "../config/settings";
import { Grid } from "../grid/Grid";
import { Defender } from "../defenders/Defender";
import { Enemy } from "../enemies/Enemy";
import { Projectile } from "../objects/projectile";
import { Stronghold } from "../objects/Stronghold";
import { RangedEnemy } from "../enemies/RangedEnemy";
import { CrusherEnemy } from "../enemies/CrusherEnemy";
import { EnemyProjectile } from "../objects/EnemyProjectile";

export class CollisionSystem {
    private scene: Phaser.Scene;
    private grid: Grid;
    private enemies: Enemy[];
    private projectiles: Projectile[];
    private defenders: Defender[];
    private stronghold: Stronghold;
    private enemyProjectiles: EnemyProjectile[];

    private attackTimers = new Map<Enemy, Phaser.Time.TimerEvent>();

    constructor(
        scene: Phaser.Scene,
        grid: Grid,
        enemies: Enemy[],
        projectiles: Projectile[],
        defenders: Defender[],
        stronghold: Stronghold,
        enemyProjectiles: EnemyProjectile[]
    ) {
        this.scene = scene;
        this.grid = grid;
        this.enemies = enemies;
        this.projectiles = projectiles;
        this.defenders = defenders;
        this.stronghold = stronghold;
        this.enemyProjectiles = enemyProjectiles;
    }

    private getAttackInterval(enemy: Enemy): number {
        if (enemy instanceof CrusherEnemy) {
            return Math.max(1, SETTINGS.enemies.crusher.attackIntervalMs);
        }
        return 1000;
    }

    private handleProjectileEnemyCollision() {
        for (const projectile of this.projectiles) {
            if (!projectile.active) continue;

            for (const enemy of this.enemies) {
                if (!enemy.active) continue;

                const hit = Phaser.Geom.Intersects.RectangleToRectangle(
                    projectile.getBounds(),
                    enemy.getBounds()
                );

                if (hit) {
                    enemy.takeDamage(projectile.damage);
                    projectile.destroy();
                    break;
                }
            }
        }
    }

    private handleEnemyDefenderCollision() {
        for (const enemy of this.enemies) {
            if (!enemy.active || enemy.isAttacking) continue;
            if (enemy instanceof RangedEnemy) continue;

            for (const defender of this.defenders) {
                if (!defender.active) continue;

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

    private stopAttack(enemy: Enemy) {
        const timer = this.attackTimers.get(enemy);

        if (timer) {
            timer.remove();
            this.attackTimers.delete(enemy);
        }

        if (enemy.active) {
            enemy.isAttacking = false;
        }
    }

    private handleEnemyStrongholdCollision() {
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
                ? this.getAttackInterval(enemy)
                : Math.max(1, SETTINGS.stronghold.meleeAttackIntervalMs);

            const timer = this.scene.time.addEvent({
                delay: interval,
                callback: () => {
                    if (!enemy.active || this.stronghold.health <= 0) {
                        this.stopAttack(enemy);
                        return;
                    }

                    this.stronghold.takeDamage(enemy.damage);

                    //stronghold will retaliate if it survives
                    if (this.stronghold.health > 0 && enemy.active) {
                        enemy.takeDamage(SETTINGS.stronghold.retaliationDamage)
                    }

                    //stop attack if either is destroyed
                    if (!enemy.active || this.stronghold.health<=0){
                        this.stopAttack(enemy)
                    }
                },
                loop: true
            });

            this.attackTimers.set(enemy, timer);
        }
    }

    private handleEnemyProjectileCollision() {
        for (const projectile of this.enemyProjectiles) {
            if (!projectile.active) continue;

            for (const defender of this.defenders) {
                if (!defender.active) continue;

                const hit = Phaser.Geom.Intersects.RectangleToRectangle(
                    projectile.getBounds(),
                    defender.getBounds()
                );

                if (!hit) continue;

                defender.takeDamage(projectile.damage);

                if (defender.active) {
                    defender.setTint(0xff0000);

                    this.scene.time.delayedCall(150, () => {
                        if (defender.active) {
                            defender.clearTint();
                        }
                    });
                }

                if (!defender.active) {
                    const row = defender.getData("gridRow");
                    const col = defender.getData("gridCol");

                    this.grid.removeOccupant(row, col);

                    const index = this.defenders.indexOf(defender);
                    if (index !== -1) {
                        this.defenders.splice(index, 1);
                    }
                }

                projectile.destroy();
                break;
            }

            if (!projectile.active) continue;

            const hitStronghold = Phaser.Geom.Intersects.RectangleToRectangle(
                projectile.getBounds(),
                this.stronghold.getCollisionBounds()
            );

            if (hitStronghold) {
                this.stronghold.takeDamage(projectile.damage);
                projectile.destroy();
            }
        }
    }

    update() {
        this.handleProjectileEnemyCollision();
        this.handleEnemyProjectileCollision();

        for (const enemy of this.attackTimers.keys()) {
            if (!enemy.active) {
                this.stopAttack(enemy);
            }
        }

        this.handleEnemyDefenderCollision();
        this.handleEnemyStrongholdCollision();
    }
}
