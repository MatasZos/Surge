import Phaser from "phaser";

export class Enemy extends Phaser.GameObjects.Sprite {

    health: number;
    speed: number;
    damage: number;
    isAttacking: boolean = false;

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
    }

    takeDamage(amount: number) {
        this.health -= amount;

        console.log("Enemy health:", this.health);

        if (this.health <= 0) {
            this.destroy();
        }
    }

    move(delta: number) {

        // Stop while attacking
        if (this.isAttacking) {
            return;
        }

        this.x -= this.speed * (delta / 1000);
    }
}