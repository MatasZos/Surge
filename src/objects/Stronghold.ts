import Phaser from "phaser";
import { SIDEBAR_WIDTH } from "../constants";

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

    getCollisionBounds():Phaser.Geom.Rectangle {
        return new Phaser.Geom.Rectangle(175 + SIDEBAR_WIDTH,145,15,500);
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