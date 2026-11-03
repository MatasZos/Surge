
import Phaser from "phaser";
import { BossEnemy } from "../enemies/BossEnemy.ts";

export class OverlordEffects {
    private shield: Phaser.GameObjects.Graphics;
    private previousPhase = 1;
    private previousShield = false;

    constructor(
        private scene: Phaser.Scene,
        private boss: BossEnemy
    ) {
        this.shield = scene.add.graphics();
        this.shield.setDepth(boss.depth + 1);
        this.update();
    }

    update(): void {
        if (!this.boss.active) {
            this.destroy();
            return;
        }

        const phase = this.boss.phases.phase;
        const shieldActive = this.boss.phases.shieldActive;

        if (
            phase !== this.previousPhase ||
            shieldActive !== this.previousShield
        ) {
            this.scene.tweens.add({
                targets: this.boss,
                alpha: 0.4,
                duration: 150,
                yoyo: true,
                repeat: 2
            });

            this.previousPhase = phase;
            this.previousShield = shieldActive;
        }

        if (shieldActive) {
            this.boss.setTint(0x66ccff);
        } else {
            switch (phase) {
                case 2:
                    this.boss.setTint(0xffcc66);
                    break;
                case 3:
                    this.boss.setTint(0xff8844);
                    break;
                case 4:
                    this.boss.setTint(0xff3333);
                    break;
                default:
                    this.boss.clearTint();
            }
        }

        this.shield.clear();

        if (shieldActive) {
            this.shield.lineStyle(5, 0x00ccff, 0.9);

            this.shield.strokeRoundedRect(
                this.boss.x - this.boss.displayWidth / 2 - 10,
                this.boss.y - this.boss.displayHeight / 2 - 10,
                this.boss.displayWidth + 20,
                this.boss.displayHeight + 20,
                20
            );
        }
    }

    destroy(): void {
        if (this.shield.active) {
            this.shield.destroy();
        }
    }
}
