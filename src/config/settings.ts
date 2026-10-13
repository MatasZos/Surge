//default values for everything in SURGE (for right now)
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
        }
    },

    energy: {
        startingEnergy: 0,
        generatorPickupValue: 0,
        generatorFirstProductionMs: 0,
        generatorProductionIntervalMs: 0,
        pickupLifetimeMs: 0
    },

    stronghold: {
        startingHealth: 0,
        meleeAttackIntervalMs: 0
    },

    waves: {
        firstEnemyDelayMs:  0,
        enemySpawnIntervalMs: 0,
        meleeSpawnProbability: 0.0,
        rangedSpawnProbability: 0.0
    }
};
