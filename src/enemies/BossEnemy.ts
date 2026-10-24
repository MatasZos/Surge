import Phaser from "phaser";
import { Enemy } from "./Enemy";

/**
 * The Overlord — SURGE's final-level boss.
 *
 * IMPORTANT: This file only defines the boss. Do not register it with
 * EnemySpawner, waves, or GameScene until the final boss fight is implemented.
 * The "overlord" texture will also need loading before it is ever spawned.
 *
 * Multi-lane projectile targeting, EMP effects, reinforcements and the boss
 * health UI require separate integration; they are NOT active in this class.
 */
export class BossEnemy extends Enemy {
    static readonly HEALTH = 15000;
    static readonly MAX_SHIELD = 4000;
    static readonly SPEED = 0;
    static readonly DAMAGE = 200;
    static readonly ATTACK_INTERVAL_MS = 2000;
    static readonly EMP_COOLDOWN_MS = 20000;
    static readonly EMP_DURATION_MS = 4000;
    static readonly REINFORCEMENT_COOLDOWN_MS = 25000;
    static readonly SHIELD_RECHARGE_DELAY_MS = 15000;
    static readonly OVERDRIVE_THRESHOLD = 0.5;

    shield = BossEnemy.MAX_SHIELD;
    isOverdrive = false;
    private shieldRechargeTimer?: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "overlord", BossEnemy.HEALTH, 0, BossEnemy.DAMAGE);
        // Visual dimensions only. Actual five-lane collision logic comes later.
        this.setDisplaySize(130, 350);
    }

    // The Overlord must never walk towards the stronghold.
    override move(_delta: number): void {
        // Stationary boss.
    }

    override takeDamage(amount: number): void {
        if (!this.active || amount <= 0) return;

        const absorbed = Math.min(this.shield, amount);
        this.shield -= absorbed;
        if (this.shield === 0 && absorbed > 0 && !this.shieldRechargeTimer) {
            this.shieldRechargeTimer = this.scene.time.delayedCall(
                BossEnemy.SHIELD_RECHARGE_DELAY_MS,
                () => {
                    this.shieldRechargeTimer = undefined;
                    if (this.active) this.shield = BossEnemy.MAX_SHIELD;
                }
            );
        }
        const healthDamage = amount - absorbed;
        if (healthDamage > 0) {
            super.takeDamage(healthDamage);
        }
        if (this.active && this.health <= BossEnemy.HEALTH * BossEnemy.OVERDRIVE_THRESHOLD) {
            this.isOverdrive = true;
        }
    }

    override destroy(fromScene?: boolean): void {
        this.shieldRechargeTimer?.remove(false);
        this.shieldRechargeTimer = undefined;
        super.destroy(fromScene);
    }
}
