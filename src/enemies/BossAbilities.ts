import { BossEnemy } from "./BossEnemy";

/**
 * Overlord ability controller. Defining this class does NOT activate the boss.
 * No timers, spawns, or defender changes happen until another system creates
 * this controller and explicitly calls update() during the final boss fight.
 */
export interface BossAbilityHandlers {
    /** Final-boss integration must implement disabling affected defenders. */
    onEMP: (durationMs: number) => void;
    /** Final-boss integration must implement spawning two regular enemies. */
    onReinforcements: (count: number) => void;
}

export class BossAbilities {
    private lastEMP: number;
    private lastReinforcements: number;

    constructor(
        private readonly boss: BossEnemy,
        private readonly handlers: BossAbilityHandlers,
        startTimeMs: number
    ) {
        this.lastEMP = startTimeMs;
        this.lastReinforcements = startTimeMs;
    }

    /** Call ONLY while the final boss fight is active. */
    update(nowMs: number): void {
        if (!this.boss.active || this.boss.health <= 0) return;

        if (nowMs - this.lastEMP >= BossEnemy.EMP_COOLDOWN_MS) {
            this.lastEMP = nowMs;
            this.handlers.onEMP(BossEnemy.EMP_DURATION_MS);
        }

        // Overdrive summons reinforcements 50% more frequently.
        const reinforcementCooldown = this.boss.isOverdrive
            ? BossEnemy.REINFORCEMENT_COOLDOWN_MS / 1.5
            : BossEnemy.REINFORCEMENT_COOLDOWN_MS;

        if (nowMs - this.lastReinforcements >= reinforcementCooldown) {
            this.lastReinforcements = nowMs;
            this.handlers.onReinforcements(2);
        }
    }

    /** The eventual ranged-attack system can read this interval. */
    getAttackIntervalMs(): number {
        return this.boss.isOverdrive
            ? BossEnemy.ATTACK_INTERVAL_MS / 1.5
            : BossEnemy.ATTACK_INTERVAL_MS;
    }
}
