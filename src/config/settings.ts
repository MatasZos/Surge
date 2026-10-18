
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

        dualbarrel: {
            health: 300,
            damage: 40,
            cost: 200,
            cooldownMs: 12000,
            fireIntervalMs: 1000,
        projectileSpeed: 300,
        projectileDamage: 20
        }

    },

    energy: {
        startingEnergy: 0,
        generatorPickupValue: 0,
        generatorFirstProductionMs: 0,
        generatorProductionIntervalMs: 0,
        pickupLifetimeMs: 0,
        enemyDropChance: 0,
        enemyDropValue: 0

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
        crusherSpawnProbability: 0.0
    }
};
