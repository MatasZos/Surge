// Wave spawning and progressi

import { SETTINGS } from "../config/settings.ts";

type EnemyType = "melee" | "ranged" | "crusher";

export class WaveManager{

    private enemiesSpawned = 0;
    private currentWave = 1;
    private currentLevel = 1;
    private maxWaves = 1;

    private waveBudget = 0;
    private budgetSpent = 0;

    //excel enemy point costs
    private getEnemyCost(type: EnemyType): number {
        switch (type) {
            case "melee":
                return SETTINGS.waves.meleeWaveCost;
            case "ranged":
                return SETTINGS.waves.rangedWaveCost;
            case "crusher":
                return SETTINGS.waves.crusherWaveCost;
        }
    }

    //excel spawn probabilities

    private getSpawnWeight(type: EnemyType): number{
        let weight = 0;

        switch (type) {
            case "melee":
                weight = SETTINGS.waves.meleeSpawnProbability;
                break;
            case "ranged":
                weight = SETTINGS.waves.rangedSpawnProbability;
                break;
            case "crusher":
                weight = SETTINGS.waves.crusherSpawnProbability;
                break;
        }
        return Number.isFinite(weight) ? Math.max(0, weight):0;
    }

    //only allow enemy types to spawn that are unlocked for the specific level
    private getUnlockedTypes(): EnemyType[] {
        if (this.currentLevel === 1) {
            return ["melee"];
        }
        if (this.currentLevel === 2) {
            return ["melee", "ranged"];
        }
        return ["melee", "ranged", "crusher"];
    }

    //check which enemies are still cheaper than the remaining budget
    private getAffordableTypes():EnemyType[] {
        const remaining = this.getRemainingBudget();

        return this.getUnlockedTypes().filter(type => {
            const cost = this.getEnemyCost(type);

            return (
                Number.isFinite(cost) &&
                cost > 0 &&
                cost <= remaining
            );
        });
    }


    chooseEnemyType(): EnemyType | null {

        const affordable = this.getAffordableTypes();

        //no enemy fits in the remaining budget
        if(affordable.length === 0 ){
            return null;

        }

        //guarantee ranged enemy in level 2
        if(this.currentLevel === 2 && this.currentWave === 1 && this.enemiesSpawned === 0 && affordable.includes("ranged")){
            return "ranged";
        }

        //guarantee crusher in level 3
        if(this.currentLevel === 3 && this.currentWave === 1 && this.enemiesSpawned === 0 && affordable.includes("crusher")){
            return "crusher"
        }

        const totalWeight = affordable.reduce((sum, type) => sum+ this.getSpawnWeight(type),0);

        // if probabilities are 0
        if (totalWeight <= 0) {
            return affordable[0];
        }

        let roll = Math.random() * totalWeight;

        for (const type of affordable) {
            roll -= this.getSpawnWeight(type);

            if (roll < 0) {
                return type;
            }
        }

        return affordable[affordable.length - 1];
    }

    //record the enemy only after it spawned
     enemySpawned(type: EnemyType): void {
        this.enemiesSpawned++;
        this.budgetSpent += this.getEnemyCost(type);
    }

    getRemainingBudget(): number {
        return Math.max(0, this.waveBudget - this.budgetSpent);
    }

    //when all affordable enemies have been spawned
    isWaveFinished(): boolean {
        return(this.waveBudget > 0 && this.enemiesSpawned > 0 && this.getAffordableTypes().length === 0);
    }

    // Check if all enemies have spawned
    isLevelComplete(): boolean {
        return this.currentWave >= this.maxWaves;
    }


    //read the csv config budget for each wave
    private getBudgetForWave(level: number, wave:number): number{
        const budgets: number[][] = [
            [],
            [
                SETTINGS.waves.level1Wave1Budget
            ],
            [
                SETTINGS.waves.level2Wave1Budget,
                SETTINGS.waves.level2Wave2Budget
            ],
            [
                SETTINGS.waves.level3Wave1Budget,
                SETTINGS.waves.level3Wave2Budget,
                SETTINGS.waves.level3Wave3Budget
            ],
            [
                SETTINGS.waves.level4Wave1Budget,
                SETTINGS.waves.level4Wave2Budget,
                SETTINGS.waves.level4Wave3Budget
            ],
            [
                SETTINGS.waves.level5Wave1Budget,
                SETTINGS.waves.level5Wave2Budget,
                SETTINGS.waves.level5Wave3Budget
            ]
        ];
        return budgets[level]?.[wave - 1] ?? 0;
    }

    private loadWaveBudget(): void{
        this.waveBudget = this.getBudgetForWave(this.currentLevel, this.currentWave);

        this.budgetSpent = 0;
        this.enemiesSpawned = 0;
    }

    nextWave() {
        this.currentWave++;
        this.loadWaveBudget();
    }

    getWave(): number {
        return this.currentWave;
    }

    getMaxWaves(): number{
        return this.maxWaves;
    }

    startLevel(level: number): void {
        this.currentLevel = level;
        this.currentWave = 1;

        switch (level) {
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
                this.maxWaves = 0;
                console.warn("Unknown level:", level);
                break;
        }

        this.loadWaveBudget();
    }

    reset(): void {
        this.startLevel(1);
    }
}