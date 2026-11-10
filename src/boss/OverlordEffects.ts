import Phaser from "phaser";
import { BossEnemy } from "../enemies/BossEnemy.ts";

export class OverlordEffects {
    private shield: Phaser.GameObjects.Graphics;
    private previousPhase = 1;
    private previousShield = false;

    constructor(private scene: Phaser.Scene, private boss: BossEnemy) {
        this.shield = scene.add.graphics().setDepth(boss.depth + 1);
        this.enter();
    }

    private enter(): void {
        const x = this.boss.x - 36;
        const y = this.boss.y + 76;
        for (let n = 0; n < 3; n++) {
            const ring = this.scene.add.circle(x, y, 55, 0xff4860, 0)
                .setStrokeStyle(3, 0xff4455, 0.8).setDepth(this.boss.depth + 2);
            ring.setScale(0.2);
            this.scene.tweens.add({
                targets: ring, scale: 2.7, alpha: 0,
                delay: n * 170, duration: 800,
                onComplete: () => ring.destroy()
            });
        }
        this.scene.cameras.main.shake(180, 0.002);
    }

    update(): void {
        if (!this.boss.active) {
            this.destroy();
            return;
        }

        const phase = this.boss.phases.phase;
        const shieldActive = this.boss.phases.shieldActive;

        if (phase !== this.previousPhase || shieldActive !== this.previousShield) {
            this.scene.tweens.add({
                targets: this.boss, alpha: 0.65, duration: 120,
                yoyo: true, repeat: 2
            });
            this.previousPhase = phase;
            this.previousShield = shieldActive;
        }

        this.shield.clear();
        if (!shieldActive) {
            if (phase >= 3) {
                const pulsing = 0.45 + 0.3 * Math.sin(this.scene.time.now / 200);
                this.shield.lineStyle(2, 0xff3b48, pulsing);
                this.shield.strokeEllipse(this.boss.x - 17, this.boss.y - 8, 300, 320);
            }
            return;
        }

        const time = this.scene.time.now * 0.001;
        const x = this.boss.x - 17;
        const y = this.boss.y - 8;
        for (let n = 0; n < 3; n++) {
            const factor = 1 + n * 0.07 + Math.sin(time * 3 + n * 2) * 0.012;
            this.shield.lineStyle(n === 0 ? 5 : 2, n === 0 ? 0x79edff : 0x36a6ff, 0.62 - n * 0.17);
            this.shield.strokeEllipse(x, y, 328 * factor, 344 * factor);
        }
        for (let n = 0; n < 8; n++) {
            const angle = time * 0.5 + Math.PI * 2 * n / 8;
            const px = x + Math.cos(angle) * 164;
            const py = y + Math.sin(angle) * 174;
            this.shield.fillStyle(n % 2 === 0 ? 0xcffbff : 0x58c9ff, 0.8);
            this.shield.fillCircle(px, py, n % 2 === 0 ? 4 : 2.5);
        }
    }

    destroy(): void {
        if (this.shield.active) this.shield.destroy();
    }
}
