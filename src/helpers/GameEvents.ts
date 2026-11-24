import Phaser from "phaser";
import { EnergyDrops } from "./EnergyDrops.ts";
import { Projectile } from "../objects/projectile.ts";
import { EnemyProjectile } from "../objects/EnemyProjectile.ts";
import { SoundManager } from "./SoundManager.ts";

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

    // Energy collection
    scene.events.on(
    "energy-collected",
    (amount: number, x?: number, y?: number) => {

        // Play energy collection sound
        SoundManager.play(scene, "sfx_energy_collect");

        // Keep existing energy collection behaviour
        onEnergyCollected(amount, x, y);
    }
);

    new EnergyDrops(scene).setup();
}
