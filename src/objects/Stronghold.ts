
import Phaser from "phaser";
import { SIDEBAR_WIDTH } from "../constants";
import { SETTINGS } from "../config/settings";

export class Stronghold extends Phaser.GameObjects.Sprite {
    health:number;

    private maxHealth: number;
    private healthBar: Phaser.GameObjects.Graphics;
    private healthText: Phaser.GameObjects.Text;
    private healthLabel: Phaser.GameObjects.Text;

    constructor(
        scene:Phaser.Scene,
        x: number,
        y:number,
        texture:string
    ){
        super(scene,x,y,texture);

        scene.add.existing(this);

        //csv health for stronghold
        this.health = SETTINGS.stronghold.startingHealth;
        this.maxHealth = this.health;

        // label for stronghold
        this.healthLabel = scene.add.text(this.x,this.y - 280,"STRONGHOLD",{fontSize: "14px",color: "#ffffff"});

        this.healthLabel.setOrigin(0.5);
        this.healthLabel.setDepth(20);

        // Health bar
        this.healthBar = scene.add.graphics();
        this.healthBar.setDepth(20);

        // healh text
        this.healthText = scene.add.text(this.x,this.y - 228,"",{fontSize: "16px",color: "#ffffff"});

        this.healthText.setOrigin(0.5);
        this.healthText.setDepth(20);

        this.updateHealthBar();
    }

    private updateHealthBar() {

        this.healthBar.clear();

        const width = 140;
        const height = 14;

        const x = this.x - width / 2;
        const y = this.y - 255;

        //  background for healthbar (red)
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(x, y, width, height);

        //  remaining health
        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(x, y,width * (this.health / this.maxHealth),height);

        // Current health display
        this.healthText.setText(this.health + " / " + this.maxHealth + " HP");
    }

    getCollisionBounds():Phaser.Geom.Rectangle {
        return new Phaser.Geom.Rectangle(175 + SIDEBAR_WIDTH,145,15,500);
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
            this.health = 0;
            console.log("Stronghold destroyed!");
            //gamescne knows if stronghold is destroyed
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
