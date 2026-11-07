import Phaser from "phaser";
import { Enemy } from "../../enemies/Enemy.ts";
import { Projectile } from "../../objects/projectile.ts";
import { BossEnemy } from "../../enemies/BossEnemy.ts";
import { CryoProjectile } from "../../objects/CryoProjectile.ts";

export class ProjectileCollision {

    constructor(
        private projectiles: Projectile[],
        private enemies: Enemy[]
    ) {}

    update(): void {
        for (const projectile of this.projectiles) {
            if (!projectile.active) continue;

            for (const enemy of this.enemies) {
                if (!enemy.active) continue;

                const hit = Phaser.Geom.Intersects.RectangleToRectangle(
                    projectile.getBounds(),
                    enemy.getBounds()
                );

            if (!hit) continue;

            // Level 3 electric chain
            if (projectile.chainShot) {
                const nearbyEnemy = this.enemies.find(other =>
                    other.active &&
                    other !== enemy &&
                    Phaser.Math.Distance.Between(
                        enemy.x, enemy.y,
                        other.x, other.y
                    ) < 120
                    
                );

                if (nearbyEnemy) {
                    nearbyEnemy.takeDamage(projectile.damage * 0.5);

                    // Simple electric line effect
                    const lightning = enemy.scene.add.graphics();

                    // Display lightning in front of enemies
                    lightning.setDepth(100);

                    lightning.lineStyle(8, 0x00ffff);
                    lightning.lineBetween(
                        enemy.x, enemy.y,
                        nearbyEnemy.x, nearbyEnemy.y
                    );

                    // White line in the middle
                    lightning.lineStyle(3, 0xffffff);
                    lightning.lineBetween(
                        enemy.x, enemy.y,
                        nearbyEnemy.x, nearbyEnemy.y
                    );

                    enemy.scene.time.delayedCall(500, () => {
                        lightning.destroy();
                    });
                }
            }

            // Level 3 explosive rounds
            if (projectile.explosiveShot) {
                for (const other of this.enemies) {
                    if (
                        other.active &&
                        other !== enemy &&
                        Phaser.Math.Distance.Between(
                            enemy.x, enemy.y,
                            other.x, other.y
                        ) < 80
                    ) {
                        other.takeDamage(projectile.damage * 0.5);
                    }
                }

                const explosion = projectile.scene.add.circle(
                    enemy.x,
                    enemy.y,
                    80,
                    0xff9900,
                    0.4
                );

                explosion.setDepth(100);

                projectile.scene.time.delayedCall(200, () => {
                    explosion.destroy();
                });
            }
            
            enemy.takeDamage(projectile.damage);

    if (
        projectile instanceof CryoProjectile && 
        enemy.active && 
        !(enemy instanceof BossEnemy)
    ) {

    if (projectile.frozenShock) {
        // Freeze enemy for 2 second 
        enemy.applySlow(0, 2000);
    } else {

        enemy.applySlow(
            projectile.slowMultiplier,
            projectile.slowDurationMs
        );
    }

    projectile.destroy();
    break;
                }
            }
        }
    }
}
