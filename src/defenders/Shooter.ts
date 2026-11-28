
import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { Projectile } from "../objects/projectile.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { SETTINGS } from "../config/settings.ts";
import { SoundManager } from "../helpers/SoundManager.ts";


export class Shooter extends Defender {

    private shootTimer: Phaser.Time.TimerEvent;
    private enemies: Enemy[];
    private shotCount = 0;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        enemies: Enemy[]
    ) {
        super(scene,x,y,"shooter")

        this.setDisplaySize(80,85);
        this.setOrigin(0.5,0.5);

        this.setDefenderHealth(SETTINGS.defenders.shooter.health);
        this.damage=SETTINGS.defenders.shooter.damage;
        this.enemies=enemies;

        //animations
        //idle animation
        if(!scene.anims.exists("shooter-idle")){
            scene.anims.create({
                key:"shooter-idle",
                frames:scene.anims.generateFrameNumbers(
                    "shooter",
                    {start:0, end:6}
                ),
                frameRate:6,
                repeat:-1
            });
        }

        //shooting animation
        if(!scene.anims.exists("shooter-fire")){
            scene.anims.create({
                key:"shooter-fire",
                frames:scene.anims.generateFrameNumbers(
                    "shooter-shot",
                    {start:0, end: 3}
                ),
                frameRate:12,
                repeat:0
            });
        }

        //hurt animation
        if(!scene.anims.exists("shooter-hurt")){
            scene.anims.create({
                key:"shooter-hurt",
                frames:scene.anims.generateFrameNumbers(
                    "shooter-hurt",
                    {start:0, end: 2}
                ),
                frameRate:10,
                repeat:0
            });
        }

        
        //return to idle after shooting
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "shooter-fire",()=>{
            if(this.active){
                this.play("shooter-idle");
            }
        });

        //return to idle after taking damage
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "shooter-hurt",()=>{
            if(this.active){
                this.play("shooter-idle");
            }
        });

        //start idle animation
        this.play("shooter-idle");

        this.shootTimer=scene.time.addEvent({
            delay:Math.max(1,SETTINGS.defenders.shooter.fireIntervalMs),
            callback:()=>{
                if(this.active && this.hasEnemyInRow(this.enemies)){
                    this.shoot()
                }
            },
            loop:true
        });
    }


        private shoot() {
        if (!this.active) return;
        this.play("shooter-fire",true);

        
        // Randomly alternate between two rifle sounds
        const soundKey = Math.random() < 0.5
            ? "sfx_shooter_fire"
            : "sfx_shooter_fire_alt";

        SoundManager.play(this.scene, soundKey);


        const projectile = new Projectile(this.scene, this.x + 25, this.y - 2);
        // Level 3 electric shot every third projectile
        if (this.upgradeLevel === 3) {
            this.shotCount++;

            if (this.shotCount % SETTINGS.defenders.shooter.chainEveryShots === 0) {
                projectile.chainShot = true;
            }
        }

        if (this.upgradeLevel >= 2) {
            projectile.damage *= SETTINGS.defenders.shooter.upgradeDamageMultiplier;
        }
    }

    override takeDamage(amount:number):void{
        if(!this.active){
            return;
        }

        //preserve existing health and healthbar
        super.takeDamage(amount);

        if(this.health<=0){
            //stop shared shrinking animation
            this.scene.tweens.killTweensOf(this);
            this.anims.stop();

            //show first death frame
            this.setTexture("shooter-dead",0)
            let frame=0;

            this.scene.time.addEvent({
                delay:250,
                repeat:3,
                callback:()=>{
                    frame++;

                    if(frame<4){
                        this.setFrame(frame);
                    }else{
                        this.destroy();
                    }
                }
            });
            return;
        }
        this.play("shooter-hurt",true)
    }


    override destroy(fromScene?: boolean):void {
        this.shootTimer?.destroy();
        super.destroy(fromScene);
    }
}
