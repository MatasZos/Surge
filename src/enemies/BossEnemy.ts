import Phaser from "phaser";
import { Enemy } from "./Enemy.ts";
import { OverlordPhases } from "../boss/OverlordPhases.ts";


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
        if (!this.active || amount <= 0 || this.phases.shieldActive) return;

        const threshold = BossEnemy.HEALTH * (1 - this.phases.phase * 0.25);

        const damage = this.phases.phase < 4
            ? Math.min(amount, Math.max(0, this.health - threshold))
            : amount;

        if (damage > 0) {
            super.takeDamage(damage);
        }

        if (this.active && this.phases.update(this.health, BossEnemy.HEALTH)) {
            this.scene.events.emit("boss-shield-activated", this.phases.phase);
        }

        this.isOverdrive = this.phases.phase >= 3;
    }

    completeShield(): void {
        this.phases.completeShield();
        this.isOverdrive = this.phases.phase >= 3;
    }
}
