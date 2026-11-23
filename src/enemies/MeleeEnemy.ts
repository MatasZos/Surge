
import Phaser from "phaser";
import { Enemy } from "./Enemy.ts";
import { SETTINGS } from "../config/settings.ts";

export class MeleeEnemy extends Enemy {

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number
    ) {
        super(scene,x,y,"meleeEnemy",SETTINGS.enemies.melee.health,SETTINGS.enemies.melee.speed,SETTINGS.enemies.melee.damage);

        this.setDisplaySize(120,120);

        if(!scene.anims.exists("executioner-idle")){
            scene.anims.create({
                key:"executioner-idle",
                frames:scene.anims.generateFrameNumbers("meleeEnemy",{
                    start:0,
                    end: 3
                }),
                frameRate:6,
                repeat:-1
            });
        }

        if(!scene.anims.exists("executioner-attack")){
            scene.anims.create({
                key:"executioner-attack",
                frames:scene.anims.generateFrameNumbers("executioner-attack-sheet",{
                    start:2,
                    end:5
                }),
                frameRate:14,
                repeat:0
            });
        }
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "executioner-attack", () =>{
            if(this.active){
                this.play("executioner-idle");
            }
        });

        this.play("executioner-idle");

    }

    protected override playDeathEffect(): void{
        const scene = this.scene;
        
        if(!scene.anims.exists("executioner-dead")){
            scene.anims.create({
                key:"executioner-dead",
                frames: scene.anims.generateFrameNumbers("executioner-dead-sheet",{
                    start:0,
                    end:17
                }),
                frameRate:20,
                repeat:0
            });
        }

        const deathSprite = scene.add.sprite(this.x,this.y,"executioner-dead-sheet",0).setDisplaySize(this.displayWidth, this.displayHeight).setDepth(this.depth);

        deathSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, ()=>{
            deathSprite.destroy();
        });
        deathSprite.play("executioner-dead");
        this.destroy();
    }
}
