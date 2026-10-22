import Phaser from "phaser";
import { Enemy } from "../../enemies/Enemy";
import { Projectile } from "../../objects/projectile";
import { CryoProjectile } from "../../objects/CryoProjectile";

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

               enemy.takeDamage(projectile.damage);

    if (projectile instanceof CryoProjectile && enemy.active) {
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
