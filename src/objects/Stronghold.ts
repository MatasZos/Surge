
import Phaser from "phaser";
import {
    GRID_X,
    GRID_Y,
    GRID_ROWS,
    CELL_HEIGHT
} from "../constants";
import { SETTINGS } from "../config/settings";

export class Stronghold extends Phaser.GameObjects.Sprite {
    health: number;

    private maxHealth: number;
    private healthBar: Phaser.GameObjects.Graphics;
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

        // The wall covers all five lanes
        this.setDisplaySize(150, GRID_ROWS * CELL_HEIGHT + 40);
        this.setDepth(2);

        // Health label
        this.healthLabel = scene.add.text(
            GRID_X - 85,
            GRID_Y - 42,
            "STRONGHOLD",
            {
                fontSize: "14px",
                color: "#ffffff"
            }
        );

        this.healthLabel.setOrigin(0.5);
        this.healthLabel.setDepth(20);

        // Health bar
        this.healthBar = scene.add.graphics();
        this.healthBar.setDepth(20);

        // Health text
        this.healthText = scene.add.text(
            GRID_X - 85,
            GRID_Y - 10,
            "",
            {
                fontSize: "16px",
                color: "#ffffff"
            }
        );

        this.healthText.setOrigin(0.5);
        this.healthText.setDepth(20);

        this.updateHealthBar();
    }

    private updateHealthBar() {
        this.healthBar.clear();

        const width = 140;
        const height = 14;

        const x = GRID_X - 85 - width / 2;
        const y = GRID_Y - 25;

        // Red background
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(x, y, width, height);

        // Remaining health
        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(
            x,
            y,
            this.maxHealth > 0
                ? width * (this.health / this.maxHealth)
                : 0,
            height
        );

        this.healthText.setText(
            this.health + " / " + this.maxHealth + " HP"
        );
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
        this.healthBar?.destroy();
        this.healthText?.destroy();
        this.healthLabel?.destroy();

        super.destroy(fromScene);
    }
}
