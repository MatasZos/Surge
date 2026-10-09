
import Phaser from "phaser";
import {DEFENDER_COSTS} from "../constants"

export class DefenderToolbar {
  private scene: Phaser.Scene;
  private onSelect: (defender: string) => void;
  private buttons: Phaser.GameObjects.Rectangle[] = [];

  constructor(
    scene: Phaser.Scene,
    onSelect: (defender: string) => void
  ) {
    this.scene = scene;
    this.onSelect = onSelect;

    this.drawToolbar();
  }

  private drawToolbar() {

    const toolbarX = 65
    this.scene.add.rectangle(toolbarX,170,120,255,0x263447,0.95).setDepth(10);

    this.scene.add.text(toolbarX,65,"DEFENDERS", {fontSize: "14px", color:"#ffffff"}).setOrigin(0.5).setDepth(11);

    this.addButton(toolbarX,125,"Shooter" , "shooter");

    this.addButton(toolbarX, 235,"Generator","generator");

  }

  private addButton(
    x: number,
    y: number,
    name: string,
    type:string
    
  ) {
    //Button background
    const button = this.scene.add.rectangle(
      x, y, 100, 100, 0x40536b
    );

    button.setDepth(11);
    button.setInteractive({useHandCursor:true })
    this.buttons.push(button);

    //Defender image for icon
    const icon = this.scene.add.image( x, y -17, type);
    icon.setDisplaySize(55,55);
    icon.setDepth(12);

    //Defender name 
    this.scene.add.text(x, y +22, name, {fontSize:"14px", color: "#ffffff"}).setOrigin(0.5).setDepth(12);

    //Energy cost
    this.scene.add.text(x , y +40, DEFENDER_COSTS[type] + " Energy", {fontSize: "12px", color: "#00ccff"}).setOrigin(0.5).setDepth(12);

    //Selection handling
    button.on("pointerdown", () => { this.onSelect(type);
    //reset button colours
    for(const item of this.buttons){
        item.setFillStyle(0x40536b);
        item.setStrokeStyle();

        }

    button.setFillStyle(0x286b55);
    button.setStrokeStyle(2, 0x00ff99);
    });
  }
}

