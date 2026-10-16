
import Phaser from "phaser";

export class Defender extends Phaser.GameObjects.Sprite {

    health: number;
    damage: number;

    private maxHealth: number;
    private healthBar: Phaser.GameObjects.Graphics;

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
    }

    protected setDefenderHealth(health: number) {
        this.health = health;
        this.maxHealth = health;

        this.updateHealthBar();
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
