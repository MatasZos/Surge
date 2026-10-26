import Phaser from "phaser";
import { Enemy } from "./Enemy.ts";

/**
 * Bungee-style enemy. Prepared only: this class does not spawn itself,
 * choose targets, modify the grid, or register with WaveManager.
 */
export class HijackerEnemy extends Enemy {
    private phase: "waiting" | "descending" | "grabbing" | "awaitingRemoval" | "ascending" | "escaped" = "waiting";
    private targetY = 0;
    private readonly descentSpeed = 180;
    private readonly ascentSpeed = 240;
    private readonly grabDelayMs = 1000;
    private grabElapsedMs = 0;

    /**
     * The future stealing system receives this callback after the grab delay.
     * It must check that the target still exists, remove it from the defender
     * array and grid, then call beginEscape().
     */
    onGrabReady?: (hijacker: HijackerEnemy) => void;

    constructor(scene: Phaser.Scene, x: number, y: number, health = 450) {
        // Hijackers do not walk horizontally or deal melee damage.
        super(scene, x, y, "hijacker", health, 0, 0);
    }

    /** Called by a future spawner with the chosen defender's position. */
    startDescent(targetX: number, targetY: number): void {
        if (!this.active || this.phase !== "waiting") return;
        this.x = targetX;
        this.targetY = targetY;
        this.grabElapsedMs = 0;
        this.phase = "descending";
    }

    /** Called by the future scene update loop only when Hijackers are enabled. */
    updateHijacker(delta: number): void {
        if (!this.active) return;
        const seconds = delta / 1000;

        if (this.phase === "descending") {
            this.y = Math.min(this.targetY, this.y + this.descentSpeed * seconds);
            if (this.y >= this.targetY) {
                this.phase = "grabbing";
                this.grabElapsedMs = 0;
            }
        } else if (this.phase === "grabbing") {
            this.grabElapsedMs += delta;
            if (this.grabElapsedMs >= this.grabDelayMs) {
                // Fire once; wait for the stealing system to confirm removal.
                this.phase = "awaitingRemoval";
                this.onGrabReady?.(this);
            }
        } else if (this.phase === "ascending") {
            this.y -= this.ascentSpeed * seconds;
            if (this.y < -80) {
                this.phase = "escaped";
                this.destroy();
                return;
            }
        }

        // Refresh inherited health-bar position without horizontal movement.
        super.move(0);
    }

    /** Called once the future stealing system has removed the target. */
    beginEscape(): void {
        if (!this.active || this.phase !== "awaitingRemoval") return;
        this.phase = "ascending";
    }

    /** If the target disappears before theft, leave without stealing. */
    cancelGrab(): void {
        if (!this.active || this.phase === "ascending" || this.phase === "escaped") return;
        this.phase = "ascending";
    }
}
