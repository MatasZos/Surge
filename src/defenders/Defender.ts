
import Phaser from "phaser";
import type { Enemy } from "../enemies/Enemy.ts";
import { BossEnemy } from "../enemies/BossEnemy.ts";
import { DefenderUpgradeIndicator } from "../ui/DefenderUpgradeIndicator.ts";

export class Defender extends Phaser.GameObjects.Sprite {

    health: number;
    damage: number;
    upgradeLevel: number = 1;

    private maxHealth: number;
    private healthBar: Phaser.GameObjects.Graphics;
    private upgradeIndicator: DefenderUpgradeIndicator;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string
    ) {
        super(scene, x, y, texture);

        scene.add.existing(this);

        this.health = 100;
        this.damage = 20;
        this.maxHealth = this.health;

        this.healthBar = scene.add.graphics();
        this.healthBar.setDepth(10);

        this.updateHealthBar();
        this.upgradeIndicator = new DefenderUpgradeIndicator(scene, this);
    }

    protected setDefenderHealth(health: number) {
        this.health = health;
        this.maxHealth = health;

        this.updateHealthBar();
    }

   upgrade(): boolean {
        if (!this.canUpgrade()) {
            return false;
        }

        this.upgradeLevel = 2;
        this.upgradeIndicator.show();
        return true;
    }

    canUpgrade(): boolean {
        return this.active && this.upgradeLevel < 2;
    }

    private updateHealthBar() {

        this.healthBar.clear();

        const width = 60;
        const height = 7;

        const x = this.x - width / 2;
        const y = this.y - this.displayHeight / 2 - 12;

        // Red background
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(x, y, width, height);

        // Green remaining health
        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(
            x,
            y,
            width * (this.health / this.maxHealth),
            height
        );
    }


    protected hasEnemyInRow(enemies: Enemy[]): boolean {
        return enemies.some(enemy => {
            if (!enemy.active || enemy.x <= this.x) {
                return false;
            }

            // Boss spans across all five lanes
            if (enemy instanceof BossEnemy) {
                const bounds = enemy.getBounds();

                return (
                    this.y >= bounds.top &&
                    this.y <= bounds.bottom
                );
            }
            //normal enemies stay in their own lane
            return Math.abs(enemy.y - this.y) < 20;
        });
    }
    takeDamage(amount: number) {

        if (!this.active) return;

        this.health -= amount;
        this.health = Math.max(0, this.health);

        this.updateHealthBar();

        console.log("Defender health:", this.health);

        if (this.health <= 0) {
            this.setActive(false);
            this.healthBar.setVisible(false);

            const startScale = this.scaleX;

            let step = 0;

            const shrink = setInterval(() => {
                step++;

                this.setScale(startScale * (1 - step / 10));

                if (step >= 10) {
                    clearInterval(shrink);
                    this.destroy();
                }
            }, 20);
        }
    }

    destroy(fromScene?: boolean) {

        if (this.healthBar?.active) {
            this.healthBar.destroy();
        }

        super.destroy(fromScene);
    }
}
