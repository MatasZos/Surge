
import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { Projectile } from "../objects/projectile.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { SETTINGS } from "../config/settings.ts";


export class DualBarrel extends Defender {

    private shootTimer: Phaser.Time.TimerEvent;
    private enemies: Enemy[];

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        enemies: Enemy[]
    ) {
        super(scene, x, y, "dualbarrel");

        //idle animation
        if (!scene.anims.exists("dualbarrel-idle")) {scene.anims.create({
                key: "dualbarrel-idle",
                frames: scene.anims.generateFrameNumbers("dualbarrel-idle-sheet",{start: 0,end: 5}),frameRate: 6,repeat: -1
            });
        }
        //attack animation
        if(!scene.anims.exists("dualbarrel-attack")){
            scene.anims.create({
                key:"dualbarrel-attack",
                frames:scene.anims.generateFrameNumbers("dualbarrel-attack-sheet",{start:0, end:7}), frameRate:16,repeat:0
            });
        }
        //return to idle after attack
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +"dualbarrel-attack",()=>{
            if(this.active) this.play("dualbarrel-idle");
        });

        //hurt animation
        if(!scene.anims.exists("dualbarrel-hurt")){
            scene.anims.create({
                key:"dualbarrel-hurt",
                frames:scene.anims.generateFrameNumbers("dualbarrel-hurt-sheet",{start:0, end:3}), frameRate:14,repeat:0
            });
        }

        //death animation
        if(!scene.anims.exists("dualbarrel-dead")){
            scene.anims.create({
                key:"dualbarrel-dead",
                frames:scene.anims.generateFrameNumbers("dualbarrel-dead-sheet",{start:0, end:11}), frameRate:16,repeat:0
            });
        }

        //return to idle after being hurt
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +"dualbarrel-hurt",()=>{
            if(this.active) this.play("dualbarrel-idle");
        });
        

        this.play("dualbarrel-idle");

        this.setDisplaySize(65, 65);

        this.setDefenderHealth(
            SETTINGS.defenders.dualbarrel.health
        );

        this.damage = SETTINGS.defenders.dualbarrel.damage;
        this.enemies = enemies;

        // Fires two shots every second
        this.shootTimer = scene.time.addEvent({
            delay: Math.max(
                1,
                SETTINGS.defenders.dualbarrel.fireIntervalMs
            ),
            callback: () => {
                if (this.active && this.hasEnemyInRow(this.enemies)) {
                    this.play("dualbarrel-attack",true)
                    this.shoot();

                    // Second shot after 150ms
                    this.scene.time.delayedCall(150, () => {
                        if (this.active && this.hasEnemyInRow(this.enemies)) {
                            this.shoot();
                        }
                    });
                }
            },
            loop: true
        });
    }

    private shoot() {
        if (!this.active) return;

        if (this.scene.cache.audio.exists("laserSound")) {
            this.scene.sound.play("laserSound", {
                volume: 0.3
            });
        }

        const projectile = new Projectile(
            this.scene,
            this.x + 25,
            this.y - 2
        );

        //use dual barrel own projectile stats
        projectile.damage = SETTINGS.defenders.dualbarrel.projectileDamage;
        projectile.speed = SETTINGS.defenders.dualbarrel.projectileSpeed;
        
        // Level 2 damage upgrade
        if (this.upgradeLevel >= 2) {
            projectile.damage *= SETTINGS.defenders.dualbarrel.upgradeDamageMultiplier;
        }
        // Level 3 explosive rounds
        if (this.upgradeLevel === 3 && Math.random() < 0.25) {
            projectile.explosiveShot = true;
        }
    }

    override takeDamage(amount:number):void{
        if(!this.active){
            return;
        }

        //preserve existing health and healthbar
        super.takeDamage(amount);

        if(this.health>0){
            this.play("dualbarrel-hurt",true);
            return;
        }
        const deathSprite = this.scene.add.sprite(this.x,this.y,"dualbarrel-dead-sheet",0).setDisplaySize(this.displayWidth, this.displayHeight).setDepth(this.depth);

        this.setVisible(false);

        deathSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE,()=>{
            deathSprite.destroy();
        });
        deathSprite.play("dualbarrel-dead");
    }

    

    destroy(fromScene?: boolean) {
        this.shootTimer?.destroy();
        super.destroy(fromScene);
    }
}
