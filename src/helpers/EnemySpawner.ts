
import Phaser from "phaser";

import { Enemy } from "../enemies/Enemy.ts";
import { MeleeEnemy } from "../enemies/MeleeEnemy.ts";
import { RangedEnemy } from "../enemies/RangedEnemy.ts";
import { CrusherEnemy } from "../enemies/CrusherEnemy.ts";
import { DroneEnemy } from "../enemies/DroneEnemy.ts";
import { HijackerEnemy } from "../enemies/HijackerEnemy.ts";
import { SETTINGS } from "../config/settings.ts";

import { Defender } from "../defenders/Defender.ts";
import { Stronghold } from "../objects/Stronghold.ts";
import { WaveManager } from "../managers/WaveManager.ts";

import {
    GRID_ROWS,
    GRID_COLS,
    CELL_WIDTH,
    CELL_HEIGHT,
    GRID_X,
    GRID_Y
} from "../constants.ts";

export class EnemySpawner {

    constructor(
        private scene: Phaser.Scene,
        private enemies: Enemy[],
        private defenders: Defender[],
        private stronghold: Stronghold,
        private waveManager: WaveManager,
        private onHijackerTarget: (hijacker: HijackerEnemy, target: Defender) => void
    ) {}

    spawnEnemy(): void {

        if (this.waveManager.isWaveFinished()) {
            return;
        }

        const enemyType = this.waveManager.chooseEnemyType();

        //no affordable enemy remains
        if(enemyType === null){
            return;
        }

        const row = Phaser.Math.Between(0, GRID_ROWS - 1);

        const x = GRID_X + GRID_COLS * CELL_WIDTH + 50;
        const y = GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

     

        let enemy: Enemy;

        if (enemyType === "crusher") {
            enemy = new CrusherEnemy(this.scene, x, y);

        } else if (enemyType === "melee") {
            enemy = new MeleeEnemy(this.scene, x, y);

        }else if( enemyType === "drone"){
            enemy = new DroneEnemy(this.scene,x,y);
        }else if (enemyType === "hijacker"){
            const availableTargets = this.defenders.filter(defender => defender.active);
            const target = availableTargets.length > 0 ? availableTargets[Phaser.Math.Between(0,availableTargets.length - 1)]: undefined;

            const hijacker = new HijackerEnemy(this.scene, target?.x ?? x, -60, SETTINGS.enemies.hijacker.health);

            if(target){
                this.onHijackerTarget(hijacker,target)
    
            } else {
                hijacker.cancelGrab();
            }

            enemy =  hijacker;

        }
        
         else {
            enemy = new RangedEnemy(this.scene,x, y,this.defenders,this.stronghold);
        }
        const level = this.waveManager.getCurrentLevel();

        const healthMultiplier = 1 + (level -1) * SETTINGS.waves.enemyHealthIncreasePerLevel;
        const damageMultiplier = 1 + (level -1) * SETTINGS.waves.enemyDamageIncreasePerLevel;

        enemy.applyLevelDifficulty(healthMultiplier, damageMultiplier);
        this.enemies.push(enemy);
        this.waveManager.enemySpawned(enemyType);
    }
}
