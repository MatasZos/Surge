
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
            health: 0,
            speed: 0,
            damage: 0,
            attackIntervalMs: 0,
            attackRange: 0,
            projectileSpeed: 0,
            projectileDamage: 0
        },

        drone: {
            health: 0,
            speed: 0,
            damage: 0,
            attackIntervalMs: 0,
            attackRange: 0,
            projectileSpeed: 0,
            projectileDamage: 0
        },

        hijacker: {
            health: 450,
            descentSpeed: 180,
            ascentSpeed: 240,
            grabDelayMs: 1000,
            speed: 40,
            damage: 0,
            attackIntervalMs: 0,
            attackRange: 0,
            projectileSpeed: 0,
            projectileDamage: 0
        },
    

        boss: {
            health: 15000,
            shield: 4000,
            speed: 0,
            damage: 200,
            attackIntervalMs: 2000,
            empCooldownMs: 20000,
            empDurationMs: 4000,
            reinforcementCooldownMs: 25000,
            shieldRechargeDelayMs: 15000,
            overdriveThreshold: 0.5,
            shieldHealthStep: 0.25,
            phase2AttackIntervalMs: 1700,
            phase3AttackIntervalMs: 1400,
            phase4AttackIntervalMs: 1000,
            phase2AttackDamage: 250,
            phase3AttackDamage: 300,
            phase4AttackDamage: 400,
            laserIntervalMs: 15000,
            overdriveLaserIntervalMs: 10000,
            laserChargeMs: 2000,
            overdriveLaserChargeMs: 1500,
            laserDamage: 200,
            overdriveLaserDamage: 350,
            reinforcementSpawnGapMs: 280,
            reinforcementsPhase1: ["melee", "melee", "melee", "melee", "ranged", "ranged"] as const,
            reinforcementsPhase2: ["melee", "melee", "melee", "melee", "ranged", "ranged", "ranged", "crusher", "crusher"] as const,
            reinforcementsPhase3: ["melee", "melee", "melee", "melee", "melee","ranged", "ranged", "ranged", "ranged","crusher", "crusher", "crusher"] as const
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
            upgradeDamageMultiplier: 0,
            upgradeLevel3Cost: 0,
            chainEveryShots: 3,
            chainRange: 120,
            chainDamageMultiplier: 0.5
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
            upgradeEnergyMultiplier: 0,
            upgradedProductionIntervalMultiplier: 2 / 3,
            upgradeLevel3Cost: 0
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
            upgradeHealthMultiplier: 0,
            healIntervalMs: 3000,
            healAmount: 50,
            upgradeLevel3Cost: 0
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
            freezeEveryShots: 8,
            freezeDurationMs: 2000,
            upgradeCost: 0,
            upgradeDamageMultiplier: 0,
            upgradeLevel3Cost: 0
        },

        landmine: {
            health: 0,
            damage: 0,
            cost: 0,
            cooldownMs: 0,
            armingMs: 0,
            blastRadius: 0,
            upgradeRadiusMultiplier: 1.5,
            upgradeCost: 0,
            upgradeDamageMultiplier: 0,
            upgradeLevel3Cost: 0
        },

        scrapper: {
            health: 0,
            damage: 0,
            cost: 0,
            cooldownMs: 0,
            recoveryMs: 0,
            biteRange: 85,
            biteLaneTolerance: 35,
            biteBehindTolerance: 12,
            upgradedRecoveryMultiplier: 0.5,
            upgradeCost: 0,
            upgradeDamageMultiplier: 0,
            upgradeEnergyMultiplier: 0,
            upgradeHealthMultiplier: 0,
            upgradeLevel3Cost: 0
        },

        dualbarrel: {
            secondShotDelayMs: 150,
            explosiveShotChance: 0.25,
            explosionRadius: 80,
            explosionDamageMultiplier: 0.5,
            health: 0,
            damage: 0,
            cost: 0,
            cooldownMs: 0,
            fireIntervalMs: 0,
            projectileSpeed: 0,
            projectileDamage: 0,
            upgradeCost: 0,
            upgradeDamageMultiplier: 0,
            upgradeLevel3Cost: 0
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
        passiveEnergyIntervalMs: 0,
        sellRefundMultiplier: 0,
        moveCost: 50,
        developerEnergyBonus: 500
    },

    combat: {
        defaultDefenderHealth: 100,
        defaultDefenderDamage: 20,
        defenderTargetLaneTolerance: 20,
        rangedTargetLaneTolerance: 30,
        meleeLaneTolerance: 45,
        meleeBehindTolerance: 12,
        meleeRange: 75,
        meleeStandOffDistance: 34,
        bossProjectileHitLeft: 105,
        bossProjectileHitRight: 100
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
        earlyWaveBonusEnergy:0,
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
