// Wave spawning and progressi

import { SETTINGS } from "../config/settings";

export class WaveManager{

    private enemiesSpawned = 0;
    private maxEnemies = SETTINGS.waves.startingEnemiesPerWave;
    private currentWave = 1;
    private maxWaves = SETTINGS.waves.level1WaveCount;

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

    isWaveFinished(): boolean {
    return this.maxEnemies > 0 && this.enemiesSpawned > 0 && this.enemiesSpawned >= this.maxEnemies;
}

    // Check if all enemies have spawned
    isLevelComplete(): boolean {
        return this.currentWave >= this.maxWaves;
    }

    nextWave() {
        this.currentWave++;
        this.enemiesSpawned = 0;
        this.maxEnemies += 2;
    }

    getWave(): number {
        return this.currentWave;
    }

    getMaxWaves(): number{
        return this.maxWaves;
    }

    startLevel(level: number){
        this.currentWave = 1;
        this.enemiesSpawned = 0;
        this.maxEnemies = SETTINGS.waves.startingEnemiesPerWave;

        if(level === 2){
            this.maxWaves = SETTINGS.waves.level2WaveCount;
        } else{
            this.maxWaves = SETTINGS.waves.level1WaveCount
        }
    }
    
    reset() {
        this.startLevel(1);
    }
}