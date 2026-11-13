
import Phaser from "phaser";

export class Enemy extends Phaser.GameObjects.Sprite {

    health: number;
    speed: number;
    damage: number;
    projectileDamageMultiplier = 1;
    isAttacking: boolean = false;

    private slowMultiplier = 1;
    private slowedUntil = 0;

    applySlow(multiplier: number, durationMs: number): void {
    if (!this.active) return;   

    const now = this.scene.time.now;

    // Don't let normal slow attacks extend a freeze
    if (this.slowMultiplier === 0 && now < this.slowedUntil && multiplier > 0) {
        return;
    }

    // Reset expired effects
    if (now >= this.slowedUntil) {
        this.slowMultiplier = 1;
    }

    this.slowMultiplier = Math.min(this.slowMultiplier, multiplier);
    this.slowedUntil = Math.max(this.slowedUntil, this.scene.time.now + durationMs
    );
}

    private maxHealth: number;
    private healthBar: Phaser.GameObjects.Graphics;
    private displayedHealthPercent = 1;

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

    applyLevelDifficulty(healthMultiplier: number, damageMultiplier: number): void {
            this.maxHealth = Math.max(1, Math.round(this.maxHealth*healthMultiplier));
            this.health = this.maxHealth;
            this.displayedHealthPercent = 1;
            this.damage = Math.round(this.damage * damageMultiplier);
            this.projectileDamageMultiplier = damageMultiplier;
            this.updateHealthBar();
    }

    private updateHealthBar() {
        this.healthBar.clear();

        const width = 62;
        const height = 9;
        const x = this.x - width / 2;
        const y = this.y - this.displayHeight / 2 - 14;

        const targetPercent = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
            //smoothly animate health changes
            this.displayedHealthPercent += (targetPercent - this.displayedHealthPercent) * 0.18;

            if (Math.abs(targetPercent - this.displayedHealthPercent) < 0.005) {this.displayedHealthPercent = targetPercent;}

        let color = 0x29f4a0;

        if (targetPercent <= 0.3) {
            color = 0xff485c;
        } else if (targetPercent <= 0.6) {
            color = 0xffd04a;
        }

        //soft outer glow
        this.healthBar.fillStyle(color, 0.16);
        this.healthBar.fillRoundedRect(x - 3, y - 3, width + 6, height + 6, 5);

        //dark background
        this.healthBar.fillStyle(0x101b2b);
        this.healthBar.fillRoundedRect(x, y, width, height, 4);

        //remaining health
        this.healthBar.fillStyle(color);
        this.healthBar.fillRoundedRect(x + 1, y + 1, Math.max(0, (width - 2) * this.displayedHealthPercent), height - 2, 3);

        //subtle border
        this.healthBar.lineStyle(1, 0x7896b8, 0.8);
        this.healthBar.strokeRoundedRect(x, y, width, height, 4);
    }

    protected preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        if (this.active) {
            this.updateHealthBar();
        }
    }

    takeDamage(amount: number) {

        if (!this.active) return;

        this.health -= amount;
        this.health = Math.max(0, this.health);
        this.updateHealthBar();

        //small health bar shake when hit
        this.scene.tweens.killTweensOf(this.healthBar);
        this.healthBar.setPosition(0, 0);

        if (this.health > 0) {
            this.scene.tweens.add({
                targets: this.healthBar,
                x: 3,
                duration: 40,
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                    if (this.healthBar.active) {
                        this.healthBar.setPosition(0, 0);
                    }
                }
            });
        }

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
        }

    destroy(fromScene?: boolean) {
        this.scene.tweens.killTweensOf(this.healthBar);
        if (this.healthBar?.active) {
            this.healthBar.destroy();
        }

        super.destroy(fromScene);
    }
}
