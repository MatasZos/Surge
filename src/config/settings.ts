
export const SETTINGS = {
    enemies: {
        melee: {
            health: 0,
            speed: 0,
            damage: 0,
            attackIntervalMs: 0,
            attackRange: 0,
            projectileSpeed: 0,
            projectileDamage: 0
        },

        ranged: {
            health: 0,
            speed: 0,
            damage: 0,
            attackIntervalMs: 0,
            attackRange: 0,
            projectileSpeed: 0,
            projectileDamage: 0
        },

        crusher: {
            health: 3000,
            speed: 8,
            damage: 150,
            attackIntervalMs: 2500,
            attackRange: 0,
            projectileSpeed: 0,
            projectileDamage: 0
        },

        drone: {
            health: 300,
            speed: 18,
            damage: 25,
            attackIntervalMs: 0,
            attackRange: 0,
            projectileSpeed: 0,
            projectileDamage: 0
        },

        hijacker: {
            health: 450,
            speed: 40,
            damage: 0,
            attackIntervalMs: 0,
            attackRange: 0,
            projectileSpeed: 0,
            projectileDamage: 0
        },
    

     overlord: {
            health: 15000,
            shield: 4000,
            speed: 0,
            damage: 200,
            attackIntervalMs: 2000,
            empCooldownMs: 20000,
            empDurationMs: 4000,
            reinforcementCooldownMs: 25000,
            shieldRechargeDelayMs: 15000,
            overdriveThreshold: 0.5
        }
    },

    defenders: {
        shooter: {
            health: 0,
            damage: 0,
            cost: 0,
            cooldownMs: 0,
            fireIntervalMs: 0,
            projectileSpeed: 0,
            projectileDamage: 0,
            upgradeCost: 0,
            upgradeDamageMultiplier: 0
        },

        generator: {
            health: 0,
            damage: 0,
            cost: 0,
            cooldownMs: 0,
            fireIntervalMs: 0,
            projectileSpeed: 0,
            projectileDamage: 0,
            upgradeCost: 0,
            upgradeDamageMultiplier: 0,
            upgradeEnergyMultiplier: 0
        },

        barricade: {
            health: 0,
            damage: 0,
            cost: 0,
            cooldownMs: 0,
            fireIntervalMs: 0,
            projectileSpeed: 0,
            projectileDamage: 0,
            upgradeCost: 0,
            upgradeDamageMultiplier: 0,
            upgradeHealthMultiplier: 0
        },

        cryogunner: {
            health: 0,
            damage: 0,
            cost: 0,
            cooldownMs: 0,
            fireIntervalMs: 0,
            projectileSpeed: 0,
            projectileDamage: 0,
            slowMultiplier: 0,
            slowDurationMs: 0,
            upgradeCost: 0,
            upgradeDamageMultiplier: 0
        },

        landmine: {
            health: 0,
            damage: 0,
            cost: 0,
            cooldownMs: 0,
            armingMs: 0,
            blastRadius: 0,
            upgradeCost: 0,
            upgradeDamageMultiplier: 0
        },

        scrapper: {
            health: 300,
            damage: 500,
            cost: 150,
            cooldownMs: 7500,
            recoveryMs: 42000,
            upgradeCost: 0,
            upgradeDamageMultiplier: 0
        },

        dualbarrel: {
            health: 0,
            damage: 0,
            cost: 0,
            cooldownMs: 0,
            fireIntervalMs: 0,
            projectileSpeed: 0,
            projectileDamage: 0,
            upgradeCost: 0,
            upgradeDamageMultiplier: 0
        }

    },

    energy: {
        startingEnergy: 0,
        generatorPickupValue: 0,
        generatorFirstProductionMs: 0,
        generatorProductionIntervalMs: 0,
        pickupLifetimeMs: 0,
        enemyDropChance: 0,
        enemyDropValue: 0,
        passiveEnergyValue: 0,
        passiveEnergyIntervalMs: 0
    },

    stronghold: {
        startingHealth: 0,
        meleeAttackIntervalMs: 0,
        retaliationDamage:0
    },

    waves: {
        firstEnemyDelayMs: 0,
        enemySpawnIntervalMs: 0,
        waveIntermissionMs: 0,
        meleeSpawnProbability: 0.0,
        rangedSpawnProbability: 0.0,
        crusherSpawnProbability: 0.0,
        droneSpawnProbability:0.0,
        hijackerSpawnProbability:0.0,
        startingEnemiesPerWave:0,
        level1WaveCount: 0,
        level2WaveCount:0,
        level3WaveCount:0,
        level4WaveCount:0,
        level5WaveCount:0,
        level1Wave1Budget: 0,
        level2Wave1Budget: 0,
        level2Wave2Budget: 0,
        level3Wave1Budget: 0,
        level3Wave2Budget: 0,
        level3Wave3Budget: 0,
        level4Wave1Budget: 0,
        level4Wave2Budget: 0,
        level4Wave3Budget: 0,
        level5Wave1Budget: 0,
        level5Wave2Budget: 0,
        level5Wave3Budget: 0,
        meleeWaveCost: 0,
        rangedWaveCost: 0,
        crusherWaveCost: 0,
        droneWaveCost:0,
        hijackerWaveCost:0,
        enemyHealthIncreasePerLevel:0,
        enemyDamageIncreasePerLevel:0
    }
};
