import Phaser from "phaser";
import { SETTINGS } from "../../config/settings.ts";
import type { Enemy } from "../../enemies/Enemy.ts";
import type { Projectile } from "../../objects/projectile.ts";
import { BossEnemy } from "../../enemies/BossEnemy.ts";
import { CryoProjectile } from "../../objects/CryoProjectile.ts";

export class ProjectileCollision {
    constructor(private projectiles: Projectile[], private enemies: Enemy[]) {}

    update(): void {
        const targets = this.enemies
            .filter((enemy) => enemy.active)
            .sort((left, right) => left.x - right.x);

        for (const projectile of this.projectiles) {
            if (!projectile.active) continue;

            for (const enemy of targets) {
                if (!enemy.active || !this.hitsEnemy(projectile, enemy)) continue;

                if (projectile.chainShot) {
                    this.hitChainTarget(projectile, enemy);
                }
                if (projectile.explosiveShot) {
                    this.explodeAt(projectile, enemy);
                }

                enemy.takeDamage(projectile.damage);
                this.applyCryoEffect(projectile, enemy);

                projectile.destroy();
                break;
            }
        }
    }

    private hitsEnemy(projectile: Projectile, enemy: Enemy): boolean {
        if (enemy instanceof BossEnemy) {
            if (enemy.phases.shieldActive) return false;

            // Every lane can hit the boss.
            const bounds = projectile.getBounds();
            return bounds.right >= enemy.x - SETTINGS.combat.bossProjectileHitLeft &&
                bounds.left <= enemy.x + SETTINGS.combat.bossProjectileHitRight;
        }

        return Phaser.Geom.Intersects.RectangleToRectangle(projectile.getBounds(), enemy.getBounds());
    }

    private hitChainTarget(projectile: Projectile, enemy: Enemy): void {
        for (const other of this.enemies) {
            if (!this.isNearbyEnemy(enemy, other, SETTINGS.defenders.shooter.chainRange)) continue;

            other.takeDamage(projectile.damage * SETTINGS.defenders.shooter.chainDamageMultiplier);
            const lightning = enemy.scene.add.graphics();
            lightning.setDepth(100);
            lightning.lineStyle(8, 0x00ffff);
            lightning.lineBetween(enemy.x, enemy.y, other.x, other.y);
            lightning.lineStyle(3, 0xffffff);
            lightning.lineBetween(enemy.x, enemy.y, other.x, other.y);

            enemy.scene.time.delayedCall(500, () => lightning.destroy());
            return;
        }
    }

    private explodeAt(projectile: Projectile, enemy: Enemy): void {
        for (const other of this.enemies) {
            if (this.isNearbyEnemy(enemy, other, SETTINGS.defenders.dualbarrel.explosionRadius)) {
                other.takeDamage(projectile.damage * SETTINGS.defenders.dualbarrel.explosionDamageMultiplier);
            }
        }

        const explosion = projectile.scene.add.circle(enemy.x, enemy.y, SETTINGS.defenders.dualbarrel.explosionRadius, 0xff9900, 0.4);
        explosion.setDepth(100);
        projectile.scene.time.delayedCall(200, () => explosion.destroy());
    }

    private isNearbyEnemy(enemy: Enemy, other: Enemy, range: number): boolean {
        if (!other.active || other === enemy) return false;
        return Phaser.Math.Distance.Between(enemy.x, enemy.y, other.x, other.y) < range;
    }

    private applyCryoEffect(projectile: Projectile, enemy: Enemy): void {
        if (!(projectile instanceof CryoProjectile) || !enemy.active || enemy instanceof BossEnemy) {
            return;
        }

        if (projectile.frozenShock) {
            enemy.applySlow(0, SETTINGS.defenders.cryogunner.freezeDurationMs);
        } else {
            enemy.applySlow(projectile.slowMultiplier, projectile.slowDurationMs);
        }
    }
}
