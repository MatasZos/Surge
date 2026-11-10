import Phaser from "phaser";
import { BossEnemy } from "../enemies/BossEnemy.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { MeleeEnemy } from "../enemies/MeleeEnemy.ts";
import { RangedEnemy } from "../enemies/RangedEnemy.ts";
import { CrusherEnemy } from "../enemies/CrusherEnemy.ts";
import { Defender } from "../defenders/Defender.ts";
import { Stronghold } from "../objects/Stronghold.ts";
import { GRID_X, GRID_Y, GRID_ROWS, GRID_COLS, CELL_WIDTH, CELL_HEIGHT } from "../constants.ts";

type RobotType = "melee" | "ranged" | "crusher";

export class OverlordReinforcements {
    private summonedEnemies: Enemy[] = [];
    private pending = 0;
    private summoningFinished = false;
    private timers: Phaser.Time.TimerEvent[] = [];

    constructor(
        private scene: Phaser.Scene,
        private boss: BossEnemy,
        private enemies: Enemy[],
        private defenders: Defender[],
        private stronghold: Stronghold
    ) {}

    spawn(phase: number): void {
        this.cancelTimers();
        this.summonedEnemies = [];

        const waves: Record<number, RobotType[]> = {
            1: ["melee", "melee", "melee", "melee", "ranged", "ranged"],
            2: ["melee", "melee", "melee", "melee", "ranged", "ranged", "ranged", "crusher", "crusher"],
            3: ["melee", "melee", "melee", "melee", "melee", "ranged", "ranged", "ranged", "ranged", "crusher", "crusher", "crusher"]
        };

        const robots = waves[phase] ?? [];
        this.pending = robots.length;
        this.summoningFinished = false;

        for (let i = 0; i < robots.length; i++) {
            const type = robots[i];
            const row = (i * 3 + phase) % GRID_ROWS;
            const x = Math.min(GRID_X + GRID_COLS * CELL_WIDTH - 60, this.boss.x - 140)
                - Math.floor(i / GRID_ROWS) * 7;
            const y = GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

            const timer = this.scene.time.delayedCall(220 + i * 280, () => {
                if (!this.boss.active || !this.boss.phases.shieldActive) {
                    this.pending = Math.max(0, this.pending - 1);
                    return;
                }

                this.scene.events.emit("boss-summon-position", x, y);
                this.showDropEffect(x, y);

                this.timers.push(this.scene.time.delayedCall(360, () => {
                    if (this.boss.active && this.boss.phases.shieldActive) {
                        const enemy = this.createRobot(type, x, y);
                        enemy.setDepth(this.boss.depth + 3);
                        enemy.setAlpha(0);
                        enemy.y -= 55;
                        this.scene.tweens.add({
                            targets: enemy, y, alpha: 1, duration: 300, ease: "Back.Out"
                        });
                        this.enemies.push(enemy);
                        this.summonedEnemies.push(enemy);
                        this.showLandingEffect(x, y);
                    }
                    this.pending = Math.max(0, this.pending - 1);
                    if (this.pending === 0 && !this.summoningFinished) {
                        this.summoningFinished = true;
                        this.scene.events.emit("boss-summoning-finished");
                    }
                }));
            });

            this.timers.push(timer);
        }
    }

    private createRobot(type: RobotType, x: number, y: number): Enemy {
        if (type === "melee") return new MeleeEnemy(this.scene, x, y);
        if (type === "ranged") {
            return new RangedEnemy(this.scene, x, y, this.defenders, this.stronghold);
        }
        return new CrusherEnemy(this.scene, x, y);
    }

    private showDropEffect(x: number, y: number): void {
        const pod = this.scene.add.container(this.boss.x - 85, this.boss.y - 55);
        pod.setDepth(this.boss.depth + 6);
        pod.add([
            this.scene.add.ellipse(0, 2, 36, 22, 0x162535).setStrokeStyle(3, 0xbac9d3),
            this.scene.add.rectangle(0, -11, 28, 25, 0x405261).setStrokeStyle(3, 0x111e2a),
            this.scene.add.circle(0, -16, 8, 0xff5962).setStrokeStyle(2, 0xffced0),
            this.scene.add.rectangle(-16, 6, 7, 14, 0x9eacb9),
            this.scene.add.rectangle(16, 6, 7, 14, 0x9eacb9)
        ]);
        this.scene.tweens.add({
            targets: pod, x, y: y - 14, angle: 20,
            duration: 320, ease: "Cubic.In",
            onComplete: () => pod.destroy()
        });

        const ring = this.scene.add.circle(x, y + 20, 24, 0xff314d, 0.08)
            .setStrokeStyle(3, 0xff4f61, 0.95).setDepth(35);
        const beam = this.scene.add.rectangle(x, y - 70, 11, 125, 0xff4f63, 0.48)
            .setDepth(35);
        const spark = this.scene.add.circle(x, y - 36, 12, 0xffd7bf, 0.85).setDepth(36);

        this.scene.tweens.add({
            targets: ring, scale: 1.8, alpha: 0, duration: 550,
            onComplete: () => ring.destroy()
        });
        this.scene.tweens.add({
            targets: beam, scaleX: 3, alpha: 0, duration: 480,
            onComplete: () => beam.destroy()
        });
        this.scene.tweens.add({
            targets: spark, y: y + 15, scale: 0.5, alpha: 0, duration: 330,
            onComplete: () => spark.destroy()
        });
    }

    private showLandingEffect(x: number, y: number): void {
        const halo = this.scene.add.circle(x, y + 15, 22, 0xff8067, 0)
            .setStrokeStyle(4, 0xff6a52, 0.9).setDepth(35);
        this.scene.tweens.add({
            targets: halo, scale: 2.4, alpha: 0, duration: 500,
            onComplete: () => halo.destroy()
        });
        for (let n = 0; n < 8; n++) {
            const angle = Math.PI * 2 * n / 8;
            const particle = this.scene.add.circle(x, y + 12, 2.5, 0xff9f64, 0.9).setDepth(36);
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 33,
                y: y + Math.sin(angle) * 22,
                alpha: 0, duration: 350,
                onComplete: () => particle.destroy()
            });
        }
    }

    update(): void {
        if (!this.boss.active || !this.boss.phases.shieldActive) return;
        if (this.pending > 0 || this.summonedEnemies.length === 0) return;

        if (this.summonedEnemies.every(enemy => !enemy.active || enemy.health <= 0)) {
            this.summonedEnemies = [];
            this.boss.completeShield();
            this.scene.events.emit("boss-shield-ended");
        }
    }

    destroy(): void {
        this.cancelTimers();
        this.summonedEnemies = [];
        this.pending = 0;
        this.summoningFinished = false;
    }

    private cancelTimers(): void {
        for (const timer of this.timers) timer.remove(false);
        this.timers = [];
    }
}
