
import Phaser from "phaser";
import { Grid } from "../grid/Grid";
import { Shooter } from "../defenders/Shooter";
import { Enemy } from "../enemies/Enemy";
import { Projectile } from "../objects/projectile";
import { Stronghold } from "../objects/Stronghold";

export class CollisionSystem {
  private scene: Phaser.Scene;
  private grid: Grid;
  private enemies: Enemy[];
  private projectiles: Projectile[];
  private defenders: Shooter[];
  private stronghold: Stronghold;

  constructor(
    scene: Phaser.Scene,
    grid: Grid,
    enemies: Enemy[],
    projectiles: Projectile[],
    defenders: Shooter[],
    stronghold: Stronghold
  ) {
    this.scene = scene;
    this.grid = grid;
    this.enemies = enemies;
    this.projectiles = projectiles;
    this.defenders = defenders;
    this.stronghold = stronghold;
  }

  // Check projectile and enemy collisions
  private handleProjectileEnemyCollision() {
    for (const projectile of this.projectiles) {
      if (!projectile.active) {
        continue;
      }

      for (const enemy of this.enemies) {
        if (!enemy.active) {
          continue;
        }

        const hit =
          Phaser.Geom.Intersects.RectangleToRectangle(
            projectile.getBounds(),
            enemy.getBounds()
          );

        if (hit) {
          // Damage enemy
          enemy.takeDamage(projectile.damage);

          // Remove projectile
          projectile.destroy();

          break;
        }
      }
    }
  }

  // Check enemy and defender collisions
  private handleEnemyDefenderCollision() {
    for (const enemy of this.enemies) {
      if (!enemy.active) {
        continue;
      }

      for (const defender of this.defenders) {
        if (!defender.active) {
          continue;
        }

        const hit =
          Phaser.Geom.Intersects.RectangleToRectangle(
            enemy.getBounds(),
            defender.getBounds()
          );

        if (hit && !enemy.isAttacking) {
          // Stop enemy
          enemy.isAttacking = true;

          const row = defender.getData("gridRow");
          const col = defender.getData("gridCol");

          // Attack every second
          this.scene.time.addEvent({
            delay: 1000,

            callback: () => {
              // Defender already dead
              if (!defender.active) {
                enemy.isAttacking = false;
                return;
              }

              // Enemy already dead
              if (!enemy.active) {
                return;
              }

              // Damage defender
              defender.takeDamage(enemy.damage);

              // Defender has died
              if (!defender.active) {
                // Clear grid cell
                this.grid.removeOccupant(row, col);

                // Remove defender from shared list
                const index = this.defenders.indexOf(defender);

                if (index !== -1) {
                  this.defenders.splice(index, 1);
                }

                // Enemy moves again
                enemy.isAttacking = false;
              }
            },

            loop: true
          });

          break;
        }
      }
    }
  }

  // Check enemy and Stronghold collisions
  private handleEnemyStrongholdCollision() {
    for (const enemy of this.enemies) {
      if (!enemy.active) {
        continue;
      }

      if (enemy.isAttacking) {
        continue;
      }

      const hit =
        Phaser.Geom.Intersects.RectangleToRectangle(
          enemy.getBounds(),
          this.stronghold.getCollisionBounds()
        );

      if (hit) {
        enemy.isAttacking = true;
        console.log("Enemy reached Stronghold");
      }
    }
  }

  // Run all collision checks each frame
  update() {
    this.handleProjectileEnemyCollision();
    this.handleEnemyDefenderCollision();
    this.handleEnemyStrongholdCollision();
  }
}
