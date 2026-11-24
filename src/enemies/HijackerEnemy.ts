import Phaser from "phaser";
import { Enemy } from "./Enemy.ts";
import { SoundManager } from "../helpers/SoundManager.ts";

export class HijackerEnemy extends Enemy {
    private phase: "waiting" | "descending" | "grabbing" | "awaitingRemoval" | "ascending" | "escaped" = "waiting";
    private targetY = 0;
    private readonly descentSpeed = 180;
    private readonly ascentSpeed = 240;
    private readonly grabDelayMs = 1000;
    private grabElapsedMs = 0;

    onGrabReady?: (hijacker: HijackerEnemy) => void;

    constructor(scene: Phaser.Scene, x: number, y: number, health = 450) {
        // Hijackers do not walk horizontally or deal melee damage.
        super(scene, x, y, "hijacker", health, 0, 0);
    }

    // Start descending towards the selected defender
    startDescent(targetX: number, targetY: number): void {
        if (!this.active || this.phase !== "waiting") return;

        this.x = targetX;
        this.targetY = targetY;
        this.grabElapsedMs = 0;
        this.phase = "descending";
    }

    updateHijacker(delta: number): void {
        if (!this.active) return;

        const seconds = delta / 1000;

        // Move down towards the defender
        if (this.phase === "descending") {
            this.y = Math.min(
                this.targetY,
                this.y + this.descentSpeed * seconds
            );

            // Start grabbing when the Hijacker reaches the defender
            if (this.y >= this.targetY) {
                this.phase = "grabbing";
                this.grabElapsedMs = 0;
            }

        } else if (this.phase === "grabbing") {
            this.grabElapsedMs += delta;

            // Wait 1 second before stealing
            if (this.grabElapsedMs >= this.grabDelayMs) {
                this.phase = "awaitingRemoval";

                // Play grab sound once
                SoundManager.play(this.scene, "sfx_hijacker_grab");

                // Tell the stealing system to remove the defender
                this.onGrabReady?.(this);
            }

        } else if (this.phase === "ascending") {
            // Fly upwards after stealing
            this.y -= this.ascentSpeed * seconds;

            if (this.y < -80) {
                this.phase = "escaped";
                this.destroy();
                return;
            }
        }

        super.move(0);
    }

    // Escape after the defender has been stolen
    beginEscape(): void {
        if (!this.active || this.phase !== "awaitingRemoval") return;

        this.phase = "ascending";
    }

    // Escape if the target disappears before stealing
    cancelGrab(): void {
        if (!this.active || this.phase === "ascending" || this.phase === "escaped") return;

        this.phase = "ascending";
    }
}