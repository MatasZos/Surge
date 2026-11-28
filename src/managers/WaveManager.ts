import { SETTINGS } from "../config/settings.ts";
import { findWavePlan, type WavePlan } from "../config/wavePlan.ts";

export type EnemyType = "melee" | "ranged" | "crusher" | "drone" | "hijacker";

export class WaveManager {
    private enemiesSpawned = 0;
    private currentWave = 1;
    private currentLevel = 1;
    private maxWaves = 1;

    private waveBudget = 0;
    private budgetSpent = 0;
    private defeatedBudget = 0;
    private wavePlan: WavePlan | undefined;

    //excel enemy point costs
    private getEnemyCost(type: EnemyType): number {
        switch (type) {
            case "melee":
                return SETTINGS.waves.meleeWaveCost;
            case "ranged":
                return SETTINGS.waves.rangedWaveCost;
            case "crusher":
                return SETTINGS.waves.crusherWaveCost;
            case "drone":
                return SETTINGS.waves.droneWaveCost;
            case "hijacker":
                return SETTINGS.waves.hijackerWaveCost;
        }
    }

    private getSpawnWeight(type: EnemyType): number {
        const plan = this.wavePlan;
        const defaults = SETTINGS.waves;
        let weight: number;

        switch (type) {
            case "melee":
                weight = plan?.meleeWeight ?? defaults.meleeSpawnProbability;
                break;
            case "ranged":
                weight = plan?.rangedWeight ?? defaults.rangedSpawnProbability;
                break;
            case "crusher":
                weight = plan?.crusherWeight ?? defaults.crusherSpawnProbability;
                break;
            case "drone":
                weight = plan?.droneWeight ?? defaults.droneSpawnProbability;
                break;
            case "hijacker":
                weight = plan?.hijackerWeight ?? defaults.hijackerSpawnProbability;
                break;
        }

        if (plan) return weight;
        return Number.isFinite(weight) ? Math.max(0, weight) : 0;
    }

    //only allow enemy types to spawn that are unlocked for the specific level
    private getUnlockedTypes(): EnemyType[] {
        if (this.currentLevel === 1) {
            return ["melee"];
        }
        if (this.currentLevel === 2) {
            return ["melee", "ranged"];
        }
        if (this.currentLevel === 3) {
            return ["melee", "ranged", "crusher"];
        }
        if (this.currentLevel === 4) {
            return ["melee", "ranged", "crusher", "drone"];
        }
        return ["melee", "ranged", "crusher", "drone", "hijacker"];
    }

    //check which enemies are still cheaper than the remaining budget
    private getAffordableTypes(): EnemyType[] {
        const remaining = this.getRemainingBudget();

        const affordable: EnemyType[] = [];
        for (const type of this.getUnlockedTypes()) {
            const cost = this.getEnemyCost(type);
            if (Number.isFinite(cost) && cost > 0 && cost <= remaining) {
                affordable.push(type);
            }
        }
        return affordable;
    }

    chooseEnemyType(): EnemyType | null {
        const affordable = this.getAffordableTypes();

        if (affordable.length === 0) return null;

        const firstEnemy = this.getFirstEnemy();
        if (firstEnemy !== null && affordable.includes(firstEnemy)) {
            return firstEnemy;
        }

        return this.chooseByWeight(affordable);
    }

    private getFirstEnemy(): EnemyType | null {
        if (this.currentWave !== 1 || this.enemiesSpawned !== 0) return null;

        switch (this.currentLevel) {
            case 2:
                return "ranged";
            case 3:
                return "crusher";
            case 4:
                return "drone";
            default:
                return null;
        }
    }

    private chooseByWeight(affordable: EnemyType[]): EnemyType {
        let totalWeight = 0;
        for (const type of affordable) {
            totalWeight += this.getSpawnWeight(type);
        }

        // Keep the wave moving when all eligible enemies have zero weight.
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

    //add the cost of each defeated enemy
    enemyDefeated(type: EnemyType): void {
        this.defeatedBudget += this.getEnemyCost(type);
    }

    //calculate wave progress from 0 to 1
    getWaveProgress(): number {
        if (this.waveBudget <= 0) return 0;

        return Math.min(1, this.defeatedBudget / this.waveBudget);
    }

    //when all affordable enemies have been spawned
    isWaveFinished(): boolean {
        return (this.waveBudget > 0 && this.enemiesSpawned > 0 && this.getAffordableTypes().length === 0);
    }

    // Check if all enemies have spawned
    isLevelComplete(): boolean {
        return this.currentWave >= this.maxWaves;
    }

    //read the csv config budget for each wave
    private getBudgetForWave(level: number, wave: number): number {
        const budgets: number[][] = [
            [],
            [
                SETTINGS.waves.level1Wave1Budget,
            ],
            [
                SETTINGS.waves.level2Wave1Budget,
                SETTINGS.waves.level2Wave2Budget,
            ],
            [
                SETTINGS.waves.level3Wave1Budget,
                SETTINGS.waves.level3Wave2Budget,
                SETTINGS.waves.level3Wave3Budget,
            ],
            [
                SETTINGS.waves.level4Wave1Budget,
                SETTINGS.waves.level4Wave2Budget,
                SETTINGS.waves.level4Wave3Budget,
            ],
            [
                SETTINGS.waves.level5Wave1Budget,
                SETTINGS.waves.level5Wave2Budget,
                SETTINGS.waves.level5Wave3Budget,
            ],
        ];
        return budgets[level]?.[wave - 1] ?? 0;
    }

    private loadWaveBudget(): void {
        this.budgetSpent = 0;
        this.enemiesSpawned = 0;
        //reset progress for the next wave
        this.defeatedBudget = 0;

        this.wavePlan = findWavePlan(this.currentLevel, this.currentWave);
        if (this.wavePlan) {
            this.waveBudget = this.wavePlan.budget;
            if (this.getAffordableTypes().length > 0) return;
            this.wavePlan = undefined;
        }
        this.waveBudget = this.getBudgetForWave(this.currentLevel, this.currentWave);
    }

    getSpawnIntervalMs(): number {
        if (this.wavePlan) return Math.max(100, this.wavePlan.spawnIntervalMs);
        return Math.max(1000, SETTINGS.waves.enemySpawnIntervalMs);
    }

    getEnemiesPerBatch(): number {
        if (this.wavePlan) return this.wavePlan.enemiesPerBatch;
        return 1;
    }

    nextWave() {
        this.currentWave++;
        this.loadWaveBudget();
    }

    getWave(): number {
        return this.currentWave;
    }

    getCurrentLevel(): number {
        return this.currentLevel;
    }

    getMaxWaves(): number {
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
                break;
        }

        this.loadWaveBudget();
    }

    reset(): void {
        this.startLevel(1);
    }
}
