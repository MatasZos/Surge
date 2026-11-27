
import Phaser from "phaser";
import { Enemy } from "./Enemy.ts";
import { SETTINGS } from "../config/settings.ts";

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
        if (!scene.anims.exists("crusher-hurt")) {
            scene.anims.create({
                key: "crusher-hurt",
                frames: scene.anims.generateFrameNumbers("crusher-hurt-sheet", { start: 0, end: 2 }),
                frameRate: 14,
                repeat: 0
            });
        }

        if (!scene.anims.exists("crusher-dead")) {
            scene.anims.create({
                key: "crusher-dead",
                frames: scene.anims.generateFrameNumbers("crusher-dead-sheet", { start: 0, end: 15 }),
                frameRate: 16,
                repeat: 0
            });
        }

        this.setDisplaySize(170, 136);
        this.setFlipX(true);
    }

    override move(delta: number): void {
        if (this.anims.isPlaying) {
            const animation = this.anims.currentAnim?.key;
            if (animation === "crusher-attack" || animation === "crusher-hurt") {
                super.move(delta);
                return;
            }
        }

        if (this.isAttacking) {
            this.play("crusher-idle", true);
        } else {
            this.play("crusher-walk", true);
        }
        super.move(delta);
    }

    override takeDamage(amount: number): void {
        super.takeDamage(amount);
        if (!this.active || amount <= 0) return;
        if (this.anims.isPlaying && this.anims.currentAnim?.key === "crusher-attack") return;
        this.play("crusher-hurt", true);
    }

    protected override playDeathEffect(): void {
        const deathSprite = this.scene.add.sprite(this.x, this.y, "crusher-dead-sheet", 0);
        deathSprite.setDisplaySize(this.displayWidth, this.displayHeight);
        deathSprite.setDepth(this.depth);
        deathSprite.setFlipX(this.flipX);
        deathSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            deathSprite.destroy();
        });
        deathSprite.play("crusher-dead");
        this.destroy();
    }
}
