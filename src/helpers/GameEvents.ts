import Phaser from "phaser";
import { EnergyDrops } from "./EnergyDrops.ts";
import { Projectile } from "../objects/projectile.ts";
import { EnemyProjectile } from "../objects/EnemyProjectile.ts";

export function setupGameEvents(
    scene: Phaser.Scene,
    onNextLevel: (level: number) => void,
    projectiles: Projectile[],
    enemyProjectiles: EnemyProjectile[],
    onEnergyCollected: (amount: number, x?:number, y?:number) => void

): void {
    
    //level changes
    scene.events.on("next-level", onNextLevel);

    //friendly projectiles
    scene.events.on("projectile-created", (projectile: Projectile) => {
        projectiles.push(projectile);
    });

    //enemy projectiles
    scene.events.on("enemy-projectile-created", (projectile: EnemyProjectile) => {
        enemyProjectiles.push(projectile);
    });

    //energy collection
    scene.events.on("energy-collected", onEnergyCollected);

    new EnergyDrops(scene).setup();
}
