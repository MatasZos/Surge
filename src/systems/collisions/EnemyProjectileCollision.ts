import Phaser from "phaser";
import type { Grid } from "../../grid/Grid.ts";
import type { Defender } from "../../defenders/Defender.ts";
import { Landmine } from "../../defenders/Landmine.ts";
import type { EnemyProjectile } from "../../objects/EnemyProjectile.ts";
import type { Stronghold } from "../../objects/Stronghold.ts";
import { removeDefenderFromBoard } from "./RemoveDefenderFromBoard.ts";

export class EnemyProjectileCollision {
    constructor(
        private scene: Phaser.Scene,
        private grid: Grid,
        private defenders: Defender[],
        private stronghold: Stronghold,
        private enemyProjectiles: EnemyProjectile[],
    ) {}

    update(): void {
        for (const projectile of this.enemyProjectiles) {
            if (!projectile.active) continue;

            this.checkDefenderHit(projectile);
            if (projectile.active) {
                this.checkStrongholdHit(projectile);
            }
        }
    }

    private checkDefenderHit(projectile: EnemyProjectile): void {
        for (const defender of this.defenders) {
            if (!defender.active || defender instanceof Landmine) continue;

            const hit = Phaser.Geom.Intersects.RectangleToRectangle(
                projectile.getBounds(),
                defender.getBounds(),
            );
            if (!hit) continue;

            defender.takeDamage(projectile.damage);
            if (defender.active) {
                this.flashDefender(defender);
            } else {
                const row = defender.getData("gridRow");
                const col = defender.getData("gridCol");
                removeDefenderFromBoard(this.grid, this.defenders, defender, row, col);
            }

            projectile.destroy();
            return;
        }
    }

    private flashDefender(defender: Defender): void {
        defender.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => {
            if (defender.active) defender.clearTint();
        });
    }

    private checkStrongholdHit(projectile: EnemyProjectile): void {
        const hit = Phaser.Geom.Intersects.RectangleToRectangle(
            projectile.getBounds(),
            this.stronghold.getCollisionBounds(),
        );
        if (!hit) return;

        this.stronghold.takeDamage(projectile.damage);
        projectile.destroy();
    }
}
