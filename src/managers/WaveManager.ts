// Wave spawning and progressi

import { SETTINGS } from "../config/settings";

export class WaveManager{
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

}