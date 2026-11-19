
import Phaser from "phaser";
import {
    GRID_X,
    GRID_Y,
    GRID_ROWS,
    CELL_HEIGHT
} from "../constants.ts";
import { SETTINGS } from "../config/settings.ts";

export class Stronghold extends Phaser.GameObjects.Sprite {
    health: number;

    private maxHealth: number;
    private healthFrame: Phaser.GameObjects.Image;
    private healthBar:Phaser.GameObjects.Image;
    private healthText: Phaser.GameObjects.Text;
    private healthLabel: Phaser.GameObjects.Text;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string
    ) {
        super(scene, x, y, texture);

        scene.add.existing(this);

        // Stronghold health remains unchanged
        this.health = SETTINGS.stronghold.startingHealth;
        this.maxHealth = this.health;
 
       
        const newHeight = GRID_ROWS * CELL_HEIGHT + 40;
        const newWidth = 320;

        this.setDisplaySize(newWidth, newHeight);
        this.x -= (newWidth - 150) / 2;
        this.x += 20;
        this.setDepth(2);

         // Health bar
        const meterX=GRID_X-42;
        const meterY=GRID_Y+90;

        // Health label
        this.healthLabel = scene.add.text(meterX,meterY-14,"BASE",{fontSize:"14px",color:"#ffffff"}).setOrigin(0.5).setDepth(20);

        this.healthFrame = scene.add.image(meterX,meterY,"stronghold-hp-frame").setOrigin(0.5,0).setScale(3,8).setDepth(20);

        this.healthBar = scene.add.image(meterX,meterY,"stronghold-hp-fill").setOrigin(0.5,0).setScale(3,8).setDepth(21);

        // Health text
        this.healthText = scene.add.text(meterX-20, meterY+274,"", {fontSize:"16px",color: "#ffffff"}).setOrigin(0.5).setDepth(20);

        this.updateHealthBar();
    }

    private updateHealthBar() {
        const ratio = this.maxHealth>0?Phaser.Math.Clamp(this.health/this.maxHealth,0,1):0;

        const fillHeight = Math.round(24*ratio);
        this.healthBar.setVisible(fillHeight>0);

        if(fillHeight >0){
            this.healthBar.setCrop(0,28 - fillHeight,16,fillHeight);
        }
        this.healthText.setText(`${this.health} / ${this.maxHealth} HP`);
    }

    // All five lanes share one Stronghold collision boundary
    getCollisionBounds(): Phaser.Geom.Rectangle {
        return new Phaser.Geom.Rectangle(
            GRID_X - 15,
            GRID_Y,
            15,
            GRID_ROWS * CELL_HEIGHT
        );
    }

    takeDamage(amount: number) {
        if (this.health <= 0) {
            return;
        }

        
    // Play sound when Stronghold takes damage
    if (amount > 0 && this.scene.cache.audio.exists("sfx_stronghold_hit")) {
        this.scene.sound.play("sfx_stronghold_hit", {
            volume: 0.3
        });
    }

    this.health -= amount;
        this.health = Math.max(0, this.health);

        this.updateHealthBar();

        console.log("Stronghold health:", this.health);

        if (this.health <= 0) {
            console.log("Stronghold destroyed!");

            this.scene.events.emit("stronghold-destroyed");
        }
    }

    destroy(fromScene?: boolean) {
        this.healthFrame?.destroy();
        this.healthBar?.destroy();
        this.healthText?.destroy();
        this.healthLabel?.destroy();

        super.destroy(fromScene);
    }
}
