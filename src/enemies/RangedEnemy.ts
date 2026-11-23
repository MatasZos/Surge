
import Phaser from "phaser";
import { Enemy } from "./Enemy.ts";
import { Defender } from "../defenders/Defender.ts";
import { Landmine } from "../defenders/Landmine.ts";
import { Stronghold } from "../objects/Stronghold.ts";
import { EnemyProjectile } from "../objects/EnemyProjectile.ts";
import { SETTINGS } from "../config/settings.ts";

export class RangedEnemy extends Enemy {

    private shootTimer: Phaser.Time.TimerEvent;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        private defenders: Defender[],
        private stronghold: Stronghold
    ) {
        super(scene,x,y,"rangedEnemy",SETTINGS.enemies.ranged.health,SETTINGS.enemies.ranged.speed,SETTINGS.enemies.ranged.damage);

        this.setDisplaySize(100,100);

        //fly and idle animations
        if(!scene.anims.exists("wizard-fly")){
            scene.anims.create({
                key:"wizard-fly",
                frames: scene.anims.generateFrameNumbers("wizard-fly-sheet",{
                    start:3,
                    end:5,
                }),
                frameRate: 8,
                repeat:-1
            });
            scene.anims.create({
                key:"wizard-idle",
                frames:scene.anims.generateFrameNumbers("rangedEnemy",{
                    start:0,
                    end:9
                }),
                frameRate:6,
                repeat:-1
            });
        }

        // Shoot using the interval from the spreadsheet
        if(!scene.anims.exists("wizard-attack")){
            scene.anims.create({
                key:"wizard-attack",
                frames:scene.anims.generateFrameNumbers("wizard-attack-sheet",{
                    start:0,
                    end:7
                }),
                frameRate:16,
                repeat:0
            });
        }

        this.on(Phaser.Animations.Events.ANIMATION_UPDATE,(animation:Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame)=>{
            if(animation.key !== "wizard-attack" || frame.index !==7){
                return;
            }
            if(!this.active || !this.isAttacking){
                return;
            }
            if(this.scene.cache.audio.exists("sfx_ranged_fire")){
                this.scene.sound.play("sfx_ranged_fire",{volume:0.25});
            }
            const projectile = new EnemyProjectile(this.scene, this.x -30, this.y);
            projectile.damage = Math.round(projectile.damage * this.projectileDamageMultiplier);
        });
        
        this.shootTimer = scene.time.addEvent({
            delay:SETTINGS.enemies.ranged.attackIntervalMs, callback:() => {
                if(this.active && this.isAttacking){
                    this.play("wizard-attack",true)
                }
            },
            loop:true
        });
    }

    move(delta: number) {

        // Check for defenders in shooting range
        const defenderInRange = this.defenders.some(defender =>
            defender.active &&
            !(defender instanceof Landmine) &&
            defender.x < this.x &&
            Math.abs(defender.y - this.y) < 30 &&
            this.x - defender.x <= SETTINGS.enemies.ranged.attackRange
        );

        // Check for stronghold in shooting range
        const strongholdX = this.stronghold.getCollisionBounds().right;

        const strongholdInRange =
            this.x > strongholdX &&
            this.x - strongholdX <= SETTINGS.enemies.ranged.attackRange;

        // Stop and shoot
        this.isAttacking = defenderInRange || strongholdInRange;

        if(this.isAttacking){
            if(!this.anims.isPlaying || this.anims.currentAnim?.key !== "wizard-attack"){
                this.play("wizard-idle",true)
            }
        } else{
            this.play("wizard-fly", true);
            super.move(delta);
        }
    }

    protected override playDeathEffect(): void{
        const scene = this.scene;

        if(!scene.anims.exists("wizard-dead")){
            scene.anims.create({
                key:"wizard-dead",
                frames: scene.anims.generateFrameNumbers("wizard-dead-sheet",{
                    start:0,
                    end:9
                }),
                frameRate: 14,
                repeat:0
            });
        }

        const deathSprite = scene.add.sprite(this.x,this.y,"wizard-dead-sheet",0).setDisplaySize(this.displayWidth, this.displayHeight).setDepth(this.depth);

        deathSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () =>{
            deathSprite.destroy();
        });
        deathSprite.play("wizard-dead");
        this.destroy();
    }
    destroy(fromScene?: boolean) {
        this.shootTimer?.destroy();
        super.destroy(fromScene);
    }
}
