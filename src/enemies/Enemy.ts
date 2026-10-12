
import Phaser from "phaser";

export class Enemy extends Phaser.GameObjects.Sprite {

    health: number;
    speed: number;
    damage: number;
    isAttacking: boolean = false;

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
        //this.updateHealthBar();

        console.log("Enemy health:", this.health);

        if (this.health <= 0) {

            this.health = 0;

            // Play explosion sound when enemy dies
            if (this.scene.cache.audio.exists("explosionSound")) {
                this.scene.sound.play("explosionSound", { volume: 0.5 });
            }

            this.destroy();

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

        this.x -= this.speed * (delta / 1000);
        this.updateHealthBar();
    }

    destroy(fromScene?: boolean) {
        if (this.healthBar?.active) {
            this.healthBar.destroy();
        }

        super.destroy(fromScene);
    }
}
