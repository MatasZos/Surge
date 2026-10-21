// Wave spawning and progressi

import { SETTINGS } from "../config/settings";

export class WaveManager{

    private enemiesSpawned = 0;
    private maxEnemies = SETTINGS.waves.startingEnemiesPerWave;
    private currentWave = 1;
    private currentLevel = 1;
    private maxWaves = SETTINGS.waves.level1WaveCount;

    chooseEnemyType(): "melee" | "ranged" | "crusher" {

        //level 1: melee enemies only
        if(this.currentLevel === 1){
            return "melee"
        }

        //guarantee ranged enemy in level 2
        if(this.currentLevel === 2 && this.currentWave === 1 && this.enemiesSpawned === 0){
            return "ranged";
        }

        //guarantee crusher in level 3
        if(this.currentLevel === 3 && this.currentWave === 1 && this.enemiesSpawned === 0){
            return "crusher"
        }

        const meleeChance = Math.max(0, SETTINGS.waves.meleeSpawnProbability);
        const rangedChance = Math.max(0,SETTINGS.waves.rangedSpawnProbability);
         const crusherChance = Math.max(0, SETTINGS.waves.crusherSpawnProbability);

        //level 2: only melee and ranged enemy allowed
        if(this.currentLevel === 2){
            const total = meleeChance + rangedChance;

            if (total<=0){
                return "melee"
            }

            const roll = Math.random() * total;

            return roll < meleeChance ? "melee" : "ranged";
        }

        //level 3 onwards: all 3 enemy types allowed
        const total = meleeChance + rangedChance + crusherChance;

        if(total<=0){
            return "melee"
        }

        const roll = Math.random() * total;


        if(roll < meleeChance){
            return("melee")
        }

        if(roll< meleeChance + rangedChance){
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

    startLevel(level: number): void{
        this.currentLevel = level

        this.currentWave = 1;
        this.enemiesSpawned = 0;
        this.maxEnemies = SETTINGS.waves.startingEnemiesPerWave;

       switch(level){
        case 1:
            this.maxWaves = SETTINGS.waves.level1WaveCount;
            break;

        case 2:
            this.maxWaves = SETTINGS.waves.level2WaveCount;
            break;

        case 3:
            this.maxWaves = SETTINGS.waves.level3WaveCount;
            break;

        case 4:
            this.maxWaves = SETTINGS.waves.level4WaveCount;
            break;

        case 5:
            this.maxWaves = SETTINGS.waves.level5WaveCount;
            break;

        default:
            this.maxWaves = SETTINGS.waves.level1WaveCount;
            break;
       }
    }
    
    reset(): void {
        this.startLevel(1);
    }
}