import Phaser from "phaser";
import { EnergyManager } from "../managers/EnergyManager.ts";

export class EnergyHUD {

    private energyText: Phaser.GameObjects.Text;

    private displayedEnergy = {value:0}

    private pendingPickupEnergy=0;


    constructor(
        private scene: Phaser.Scene,
        private energyManager: EnergyManager
    ) {
        this.displayedEnergy.value = energyManager.getEnergy();

        //hud background
        this.scene.add.rectangle(161, 61, 290, 75, 0x101b2a)
            .setStrokeStyle(3, 0x647589).setDepth(10);

        this.scene.add.rectangle(161, 61, 280, 65, 0x243348)
            .setStrokeStyle(1, 0x0c131e).setDepth(11);

        //energy icon
        this.scene.add.text(41, 61, "⚡", {
            fontSize: "27px",
            color: "#38cfff"
        }).setOrigin(0.5).setDepth(20);

        //energy counter
        this.energyText = this.scene.add.text(
            179, 61,
            "Energy: " + this.energyManager.getEnergy(),
            { fontSize: "22px", color: "#00ccff" }
        ).setOrigin(0.5).setDepth(20);
    }

    private renderEnergy(): void{
        this.energyText.setText("Energy: " + Math.round(this.displayedEnergy.value));
    }

    update(): void {
        this.scene.tweens.killTweensOf(this.displayedEnergy);

        this.displayedEnergy.value = Math.max(0,this.energyManager.getEnergy() - this.pendingPickupEnergy);

        this.renderEnergy();
    }

    //function called when clickable energy pickup is collected
    animatePickup(amount:number, x:number, y:number):void{
        this.pendingPickupEnergy += amount;
        this.update();

        const flyingEnergy = this.scene.add.image(x,y,"energy");
        flyingEnergy.setDisplaySize(35,35);
        flyingEnergy.setDepth(100);

        const originalScaleX = flyingEnergy.scaleX;
        const originalScaleY = flyingEnergy.scaleY;

        //animate pickup tavelling to the hud
        this.scene.tweens.add({
            targets:flyingEnergy,
            x:41,
            y:61,
            scaleX: originalScaleX*0.4,
            scaleY: originalScaleY*0.4,
            alpha: 0.6,
            duration:550,
            ease:"Cubic.easeInOut",

            onComplete:()=>{
                flyingEnergy.destroy();
                this.pendingPickupEnergy=Math.max(0,this.pendingPickupEnergy-amount);

                this.animateCounter();
                this.pulseEnergyText();
            }
        });
    }

    private animateCounter():void{
        this.scene.tweens.killTweensOf(this.displayedEnergy);

        const targetEnergy=Math.max(0,this.energyManager.getEnergy()-this.pendingPickupEnergy);

        this.scene.tweens.add({
            targets:this.displayedEnergy,
            value:targetEnergy,
            duration:350,
            ease:"Cubic.easeOut",

            onUpdate:()=>{
                this.renderEnergy();
            },

            onComplete:()=>{
                this.renderEnergy();
            }
        });
    }

    //enlarges the counter when energy arrives
    private pulseEnergyText():void{
        this.scene.tweens.killTweensOf(this.energyText);
        this.energyText.setScale(1);

        this.scene.tweens.add({
            targets:this.energyText,
            scaleX:1.35,
            scaleY:1.35,
            duration:220,
            yoyo:true,
            ease:"Sine.easeOut"
        });
    }
}