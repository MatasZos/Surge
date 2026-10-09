
import Phaser from "phaser";
import { Grid } from "../grid/Grid";
import { Defender } from "../defenders/Defender";
import { Enemy } from "../enemies/Enemy";
import { Projectile } from "../objects/projectile";
import { Stronghold } from "../objects/Stronghold";

export class CollisionSystem {
  private scene: Phaser.Scene;
  private grid: Grid;
  private enemies: Enemy[];
  private projectiles: Projectile[];
  private defenders: Defender[];
  private stronghold: Stronghold;

  private attackTimers = new Map<Enemy, Phaser.Time.TimerEvent>();

  constructor(
    scene: Phaser.Scene,
    grid: Grid,
    enemies: Enemy[],
    projectiles: Projectile[],
    defenders: Defender[],
    stronghold: Stronghold
  ) {
    this.scene = scene;
    this.grid = grid;
    this.enemies = enemies;
    this.projectiles = projectiles;
    this.defenders = defenders;
    this.stronghold = stronghold;
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
      if (!enemy.active) continue;
      if (enemy.isAttacking) continue;

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
          delay: 1000,
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

      const hit = Phaser.Geom.Intersects.RectangleToRectangle(
        enemy.getBounds(),
        this.stronghold.getCollisionBounds()
      );

      if (hit) {
        enemy.isAttacking = true;
        console.log("Enemy reached Stronghold");
      }
    }
  }

  update() {
    this.handleProjectileEnemyCollision();

    // Remove timers belonging to dead enemies
    for (const enemy of this.attackTimers.keys()) {
      if (!enemy.active) {
        this.stopAttack(enemy);
      }
    }

    this.handleEnemyDefenderCollision();
    this.handleEnemyStrongholdCollision();
  }
}
