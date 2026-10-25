
import Phaser from "phaser";
import { Grid } from "../grid/Grid.ts";
import { Defender } from "../defenders/Defender.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { Projectile } from "../objects/projectile.ts";
import { Stronghold } from "../objects/Stronghold.ts";
import { EnemyProjectile } from "../objects/EnemyProjectile.ts";

import { ProjectileCollision } from "./collisions/ProjectileCollision.ts";
import { DefenderCollision } from "./collisions/DefenderCollision.ts";
import { StrongholdCollision } from "./collisions/Strongholdcollision.ts";
import { EnemyProjectileCollision } from "./collisions/EnemyProjectileCollision.ts";

export class CollisionSystem {
    private attackTimers = new Map<Enemy, Phaser.Time.TimerEvent>();

    private projectileCollision: ProjectileCollision;
    private defenderCollision: DefenderCollision;
    private strongholdCollision: StrongholdCollision;
    private enemyProjectileCollision: EnemyProjectileCollision;

    constructor(
        scene: Phaser.Scene,
        grid: Grid,
        enemies: Enemy[],
        projectiles: Projectile[],
        defenders: Defender[],
        stronghold: Stronghold,
        enemyProjectiles: EnemyProjectile[]
    ) {
        const stopAttack = (enemy: Enemy) => this.stopAttack(enemy);

        this.projectileCollision = new ProjectileCollision(projectiles, enemies);

        this.defenderCollision = new DefenderCollision(
            scene, grid, enemies, defenders, this.attackTimers, stopAttack
        );

        this.strongholdCollision = new StrongholdCollision(
            scene, enemies, stronghold, this.attackTimers, stopAttack
        );

        this.enemyProjectileCollision = new EnemyProjectileCollision(
            scene, grid, defenders, stronghold, enemyProjectiles
        );

        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            for (const enemy of Array.from(this.attackTimers.keys())) {
                this.stopAttack(enemy);
            }
        });
    }

    private stopAttack(enemy: Enemy): void {
        const timer = this.attackTimers.get(enemy);

        if (timer) {
            timer.remove();
            this.attackTimers.delete(enemy);
        }

        if (enemy.active) {
            enemy.isAttacking = false;
        }
    }

    update(): void {
        this.projectileCollision.update();
        this.enemyProjectileCollision.update();

        for (const enemy of Array.from(this.attackTimers.keys())) {
            if (!enemy.active) {
                this.stopAttack(enemy);
            }
        }

        this.defenderCollision.update();
        this.strongholdCollision.update();
    }
}
