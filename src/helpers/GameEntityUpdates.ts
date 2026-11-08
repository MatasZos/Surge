import { Enemy } from "../enemies/Enemy.ts";
import { HijackerEnemy } from "../enemies/HijackerEnemy.ts";
import { Projectile } from "../objects/projectile.ts";
import { EnemyProjectile } from "../objects/EnemyProjectile.ts";

export function updateEnemies(
    enemies: Enemy[],
    delta: number
): void {
    for (const enemy of enemies) {
        if (!enemy.active) continue;

        if (enemy instanceof HijackerEnemy) {
            enemy.updateHijacker(delta);
        } else {
            enemy.move(delta);
        }
    }
}

export function updateProjectiles(
    projectiles: Projectile[],
    enemyProjectiles: EnemyProjectile[],
    delta: number
): void {
    for (const projectile of projectiles) {
        if (projectile.active) {
            projectile.move(delta);
        }
    }

    for (const projectile of enemyProjectiles) {
        if (projectile.active) {
            projectile.move(delta);
        }
    }
}