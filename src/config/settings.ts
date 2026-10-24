
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
            projectileDamage: 0
        },

        generator: {
            health: 0,
            damage: 0,
            cost: 0,
            cooldownMs: 0,
            fireIntervalMs: 0,
            projectileSpeed: 0,
            projectileDamage: 0
        },

        barricade: {
            health: 0,
            damage: 0,
            cost: 0,
            cooldownMs: 0,
            fireIntervalMs: 0,
            projectileSpeed: 0,
            projectileDamage: 0
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
            slowDurationMs: 0
        },

        landmine: {
            health: 0,
            damage: 0,
            cost: 0,
            cooldownMs: 0,
            armingMs: 0,
            blastRadius: 0
        },

        dualbarrel: {
            health: 0,
            damage: 0,
            cost: 0,
            cooldownMs: 0,
            fireIntervalMs: 0,
        projectileSpeed: 0,
        projectileDamage: 0
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
        meleeSpawnProbability: 0.0,
        rangedSpawnProbability: 0.0,
        crusherSpawnProbability: 0.0,
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
    }
};
