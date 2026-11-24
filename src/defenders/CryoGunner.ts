import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { CryoProjectile } from "../objects/CryoProjectile.ts";
import { SETTINGS } from "../config/settings.ts";
import { SoundManager } from "../helpers/SoundManager.ts";


export class CryoGunner extends Defender {
    private shootTimer: Phaser.Time.TimerEvent;
    private shotCount = 0;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        private enemies: Enemy[]
    ) {
      
        super(scene, x, y, "cryogunner");
        if(!scene.anims.exists("cryogunner-idle")){
            scene.anims.create({
                key:"cryogunner-idle",
                frames:scene.anims.generateFrameNumbers("cryogunner",{
                    start:0,
                    end:4
                }),
                frameRate:6,
                repeat:-1
            });
        }

        if(!scene.anims.exists("cryogunner-shoot")){
            scene.anims.create({
                key:"cryogunner-shoot",
                frames:scene.anims.generateFrameNumbers("cryogunner-shoot-sheet",{
                    start:0,
                    end:12
                }),
                frameRate:18,
                repeat:0
            })
        }
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "cryogunner-shoot", ()=>{
            if(this.active){
                this.play("cryogunner-idle");
            }
        });

        if(!scene.anims.exists("cryogunner-hurt")){
            scene.anims.create({
                key:"cryogunner-hurt",
                frames:scene.anims.generateFrameNumbers("cryogunner-hurt-sheet",{
                    start:0,
                    end:3
                }),
                frameRate: 14,
                repeat:0
            });
        }
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "cryogunner-hurt", () => {
            if(this.active){
                this.play("cryogunner-idle");
            }
        });
        this.play("cryogunner-idle");

        this.setDisplaySize(100, 100);
        this.setDefenderHealth(SETTINGS.defenders.cryogunner.health);
        this.damage = SETTINGS.defenders.cryogunner.projectileDamage;

        this.shootTimer = scene.time.addEvent({
            delay: SETTINGS.defenders.cryogunner.fireIntervalMs,
            callback: () => {
                if (this.active && this.hasEnemyInRow(this.enemies)) {
                    this.shoot();
                }
            },
            loop: true
        });
    }

    private shoot(): void {
        if(!this.anims.isPlaying || this.anims.currentAnim?.key !== "cryogunner-hurt"){
            this.play("cryogunner-shoot",true)
        }
        
        // Play the Cryo Gunner's ice weapon sound
        SoundManager.play(this.scene, "sfx_cryogunner_fire");

        const projectile = new CryoProjectile(this.scene, this.x + 25, this.y - 2);

        // Level 2 damage upgrade
        if (this.upgradeLevel >= 2) {
            projectile.damage *= SETTINGS.defenders.cryogunner.upgradeDamageMultiplier;
        }

        // Level 3 Frozen Shock every 8 shot
        if (this.upgradeLevel === 3) {
            this.shotCount++;

            if (this.shotCount % 8 === 0) {
                projectile.frozenShock = true;
            }
        }
    }

    override takeDamage(amount:number): void{
        if(!this.active) return;
        super.takeDamage(amount);
        if(this.active && amount >0){
            this.play("cryogunner-hurt",true)
        }
    }

    destroy(fromScene?: boolean): void {
        this.shootTimer?.remove();
        super.destroy(fromScene);
    }
}
