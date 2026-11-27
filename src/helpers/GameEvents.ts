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
    onEnergyCollected: (amount: number, x?: number, y?: number) => void
): void {
    function addProjectile(projectile: Projectile): void {
        projectiles.push(projectile);
    }

    function addEnemyProjectile(projectile: EnemyProjectile): void {
        enemyProjectiles.push(projectile);
    }

    function collectEnergy(amount: number, x?: number, y?: number): void {
        SoundManager.play(scene, "sfx_energy_collect");
        onEnergyCollected(amount, x, y);
    }

    scene.events.on("next-level", onNextLevel);
    scene.events.on("projectile-created", addProjectile);
    scene.events.on("enemy-projectile-created", addEnemyProjectile);
    scene.events.on("energy-collected", collectEnergy);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        scene.events.off("next-level", onNextLevel);
        scene.events.off("projectile-created", addProjectile);
        scene.events.off("enemy-projectile-created", addEnemyProjectile);
        scene.events.off("energy-collected", collectEnergy);
    });

    new EnergyDrops(scene).setup();
}
