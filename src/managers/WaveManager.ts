// Wave spawning and progressi

import { SETTINGS } from "../config/settings";

export class WaveManager{

    private enemiesSpawned = 0;
    private maxEnemies = 3;

    chooseEnemyType(): "melee" | "ranged" | "crusher" {
        
        const roll = Math.random();

        const meleeChance = SETTINGS.waves.meleeSpawnProbability;
        const rangedChance = SETTINGS.waves.rangedSpawnProbability;

        if(roll < meleeChance){
            return("melee")
        }

        if(roll< meleeChance +rangedChance){
            return "ranged";
        }
        return "crusher";
    }
    
    // Count spawned enemies
    enemySpawned() {
        this.enemiesSpawned++;
    }

    // Check if all enemies have spawned
    isLevelComplete(): boolean {
        return this.enemiesSpawned >= this.maxEnemies;
    }

    // Reset when restarting the game
    reset() {
        this.enemiesSpawned = 0;
    }

}