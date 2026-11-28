import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { SETTINGS } from "../config/settings.ts";
import { SoundManager } from "../helpers/SoundManager.ts";

export class Barricade extends Defender {

    private repairTimer: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        
        super(scene, x, y, "barricade");

        this.setDisplaySize(96, 96);

        if(!scene.anims.exists("barricade-idle")){
            scene.anims.create({
                key:"barricade-idle",
                frames:scene.anims.generateFrameNumbers("barricade",{
                    start:0,
                    end:3
                }),
                frameRate:6,
                repeat:-1
            });

            scene.anims.create({
                key:"barricade-hurt",
                frames:scene.anims.generateFrameNumbers("barricade-hurt-sheet",{
                    start:0,
                    end:10
                }),
                frameRate: 14,
                repeat:0
            });
        }

        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "barricade-hurt",()=>{
            if(this.active){
                this.play("barricade-idle");
            }
        });

        if(!scene.anims.exists("barricade-dead")){
            scene.anims.create({
                key:"barricade-dead",
                frames:scene.anims.generateFrameNumbers("barricade-dead-sheet",{
                    start:0,
                    end:4
                }),
                frameRate:12,
                repeat:0
            });
        }



        this.play("barricade-idle")

        this.setDefenderHealth(SETTINGS.defenders.barricade.health);
        this.damage = SETTINGS.defenders.barricade.damage;

        // Level 3 automatically repairs the Barricade
        this.repairTimer = scene.time.addEvent({
            delay: SETTINGS.defenders.barricade.healIntervalMs,
            callback: () => {
                if (this.active && this.upgradeLevel === 3) {
                    this.heal(SETTINGS.defenders.barricade.healAmount);
                }
            },
            loop: true
        });
    }
    override upgrade(): boolean {
        if (!super.upgrade()) return false;

        if (this.upgradeLevel === 2) {
            this.increaseMaxHealth(
                SETTINGS.defenders.barricade.upgradeHealthMultiplier

            );
        }
        return true;
    }

    override takeDamage(amount: number): void {
        if (!this.active) return;

        // Play a metallic impact when hit
        SoundManager.play(this.scene, "sfx_barricade_hit");

        super.takeDamage(amount);
        if (this.active) {
            if (amount > 0) this.play("barricade-hurt", true);
            return;
            }
        

        const deathSprite = this.scene.add.sprite(this.x,this.y, "barricade-dead-sheet",0).setDisplaySize(this.displayWidth,this.displayHeight).setDepth(this.depth).setFlipX(this.flipX);

        this.setVisible(false);
        deathSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE,() =>{
            deathSprite.destroy();
        });
        deathSprite.play("barricade-dead");
    }


        override destroy(fromScene?: boolean): void {
        this.repairTimer?.remove(false);
        super.destroy(fromScene);
    }
}
