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

            enemy.takeDamage(projectile.damage);

    if (
        projectile instanceof CryoProjectile && 
        enemy.active && 
        !(enemy instanceof BossEnemy)
    ) {
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
