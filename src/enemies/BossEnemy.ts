import Phaser from "phaser";
import { Enemy } from "./Enemy.ts";
import { OverlordPhases } from "../boss/OverlordPhases.ts";
import { SoundManager } from "../helpers/SoundManager.ts";


export class BossEnemy extends Enemy {
    static readonly HEALTH = 15000;
    static readonly SPEED = 0;
    static readonly DAMAGE = 200;
    static readonly ATTACK_INTERVAL_MS = 2000;
    static readonly EMP_COOLDOWN_MS = 20000;
    static readonly EMP_DURATION_MS = 4000;
    static readonly REINFORCEMENT_COOLDOWN_MS = 25000;
    
     readonly phases = new OverlordPhases();
    isOverdrive = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "overlord", BossEnemy.HEALTH, 0, BossEnemy.DAMAGE);
        this.setDisplaySize(300, 300);
    }


    // The Overlord must never walk towards the stronghold.
    override move(_delta: number): void {
        // Stationary boss.
    }

     override takeDamage(amount: number): void {
    if (!this.active || amount <= 0) return;

    // Shield blocks damage
    if (this.phases.shieldActive) {
        SoundManager.play(this.scene, "sfx_boss_shield_hit");

        return;
    }

        const threshold = BossEnemy.HEALTH * (1 - this.phases.phase * 0.25);

        const damage = this.phases.phase < 4
            ? Math.min(amount, Math.max(0, this.health - threshold))
            : amount;

        if (damage > 0) {
            const wasAlive = this.active;

            super.takeDamage(damage);

            // Play boss death sound only once
            if (wasAlive && !this.active) {
                SoundManager.play(this.scene, "sfx_boss_death");
        }
    }

        if (this.active && this.phases.update(this.health, BossEnemy.HEALTH)) {
            this.scene.events.emit("boss-shield-activated", this.phases.phase);
        }

        this.isOverdrive = this.phases.phase >= 3;
    }

    completeShield(): void {

    // Shield breaking
    SoundManager.play(this.scene, "sfx_boss_shield_break");

    this.phases.completeShield();

    // New boss phase
    SoundManager.play(this.scene, "sfx_boss_phase_change");

    this.isOverdrive = this.phases.phase >= 3;
    }
}
