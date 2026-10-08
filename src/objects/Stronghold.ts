import Phaser from "phaser";

export class Stronghold extends Phaser.GameObjects.Sprite {
    health:number;
    constructor(
        scene:Phaser.Scene,
        x: number,
        y:number,
        texture:string
    ){
        super(scene,x,y,texture);

        scene.add.existing(this);

        this.health = 500;
    }

    takeDamage(amount: number){
        this.health -= amount;

        console.log("Stronghold health: " + this.health);
        
        if(this.health <= 0){
            this.health = 0;
            console.log("Stronghold destroyed!");
        }
    }
}