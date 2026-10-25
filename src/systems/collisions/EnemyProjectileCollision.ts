import Phaser from "phaser";
import { Grid } from "../../grid/Grid.ts";
import { Defender } from "../../defenders/Defender.ts";
import { EnemyProjectile } from "../../objects/EnemyProjectile.ts";
import { Stronghold } from "../../objects/Stronghold.ts";

export class EnemyProjectileCollision {
    constructor(
        private scene: Phaser.Scene,
        private grid: Grid,
        private defenders: Defender[],
        private stronghold: Stronghold,
        private enemyProjectiles: EnemyProjectile[]
    ) {}

    update(): void {
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
}
