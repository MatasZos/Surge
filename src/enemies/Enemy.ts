
import Phaser from "phaser";

export class Enemy extends Phaser.GameObjects.Sprite {

    health: number;
    speed: number;
    damage: number;
    isAttacking: boolean = false;

    private slowMultiplier = 1;
    private slowedUntil = 0;

    applySlow(multiplier: number, durationMs: number): void {
    if (!this.active) return;

    this.slowMultiplier = Math.min(this.slowMultiplier, multiplier);

    this.slowedUntil = Math.max(
        this.slowedUntil,
        this.scene.time.now + durationMs
    );
}

    private maxHealth: number;
    private healthBar: Phaser.GameObjects.Graphics;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        health: number,
        speed: number,
        damage: number
    ) {
        super(scene, x, y, texture);

        scene.add.existing(this);

        // Give enemy a physics body
        scene.physics.add.existing(this);

        this.setDisplaySize(60, 60);

        // Enemy stats
        this.health = health;
        this.speed = speed;
        this.damage = damage;
        this.maxHealth = health;
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();
    }

    private updateHealthBar() {

        this.healthBar.clear();

        const width = 60;
        const height = 7;
        const x = this.x - width / 2;
        const y = this.y - 45;

        // Red background
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(x, y, width, height);

        // Green remaining health
        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(
            x, y,
            width * (this.health / this.maxHealth),
            height
        );
    }

    takeDamage(amount: number) {

        if (!this.active) return;

        this.health -= amount;
        this.health = Math.max(0, this.health);
        this.updateHealthBar();

        console.log("Enemy health:", this.health);

        if (this.health <= 0) {

            this.health = 0;

            //informs gamescene that an enemy was killed
            this.scene.events.emit("enemy-killed", this.x, this.y);

            // Play explosion sound when enemy dies
            if (this.scene.cache.audio.exists("explosionSound")) {
                this.scene.sound.play("explosionSound", { volume: 0.5 });
            }

            this.setActive(false);
            this.isAttacking = false;
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
        
            const explosion = this.scene.add.circle(
                this.x,
                this.y,
                20,
                0xff3300
            );

            explosion.setDepth(this.depth - 1);

            this.scene.time.delayedCall(150, () => {
                explosion.destroy();
            });

        } else {

            // Play sound when enemy takes damage
            if (this.scene.cache.audio.exists("enemyHitSound")) {
                this.scene.sound.play("enemyHitSound", { volume: 0.3 });
            }
        }
    }

    move(delta: number) {

        // Stop while attacking
        if (this.isAttacking) {
            return;
        }

        if (this.scene.time.now >= this.slowedUntil) {
        this.slowMultiplier = 1;
        }

        this.x -= this.speed * this.slowMultiplier * (delta / 1000);
        this.updateHealthBar();
        }

    destroy(fromScene?: boolean) {
        if (this.healthBar?.active) {
            this.healthBar.destroy();
        }

        super.destroy(fromScene);
    }
}
