
import Phaser from "phaser";
import { Enemy } from "./Enemy.ts";
import { SETTINGS } from "../config/settings.ts";

// Heavy, slow melee robot. CollisionSystem handles its mace attacks.
export class CrusherEnemy extends Enemy {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(
            scene, x, y, "crusherEnemy",
            SETTINGS.enemies.crusher.health,
            SETTINGS.enemies.crusher.speed,
            SETTINGS.enemies.crusher.damage
        );

        if(!scene.anims.exists("crusher-walk")){
            scene.anims.create({
                key:"crusher-walk",
                frames:scene.anims.generateFrameNumbers("crusher-walk-sheet",{
                    start:0,
                    end:15
                }),
                frameRate:10,
                repeat:-1
            });
            scene.anims.create({
                key:"crusher-idle",
                frames:scene.anims.generateFrameNumbers("crusherEnemy",{
                    start:0,
                    end:15
                }),
                frameRate:8,
                repeat:-1
            });
        }

        if(!scene.anims.exists("crusher-attack")){
            scene.anims.create({
                key:"crusher-attack",
                frames:scene.anims.generateFrameNumbers("crusher-attack-sheet",{
                    start:0,
                    end:15
                }),
                frameRate:16,
                repeat:0
            });
        }
        this.setDisplaySize(170, 136);
        this.setFlipX(true);
    }

    override move(delta:number):void{
        if(!this.anims.isPlaying || this.anims.currentAnim?.key !== "crusher-attack"){
            this.play(this.isAttacking?"crusher-idle":"crusher-walk",true)
        }

        super.move(delta)
    }
}
