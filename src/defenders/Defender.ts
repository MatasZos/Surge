
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
    private displayedHealthPercent = 1;
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

    // Restore health without going over maximum health
    protected heal(amount: number): void {
        if (!this.active) return;

        this.health = Math.min(this.health + amount, this.maxHealth);
        this.updateHealthBar();
    }

    protected increaseMaxHealth(multiplier: number): void {
        const extraHealth = this.maxHealth * (multiplier - 1);

        this.maxHealth += extraHealth;
        this.health += extraHealth;
        this.updateHealthBar();
    }

   upgrade(): boolean {
        if (!this.canUpgrade()) return false;

        this.upgradeLevel++;
        this.upgradeIndicator.show();
        return true;
    }

    canUpgrade(): boolean {
        return this.active && this.upgradeLevel < 3;
    }

    //reposition defender to new cell
    public repositionTo(x:number, y:number): void{
        this.setPosition(x,y);
        this.updateHealthBar();

        if(this.upgradeLevel>1){
            this.upgradeIndicator.show();
        }

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

            this.scene.tweens.add({
                targets:this,
                scaleX: 0,
                scaleY: 0,
                duration:200,
                ease:"Linear",
                onComplete:()=>{
                    this.destroy();
                }
            })
        }
    }

    destroy(fromScene?: boolean) {

        if (this.healthBar?.active) {
            this.healthBar.destroy();
        }

        super.destroy(fromScene);
    }
}
