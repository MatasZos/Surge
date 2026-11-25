import Phaser from "phaser";

export class HitEffect {

    static play(
        scene: Phaser.Scene,
        x: number,
        y: number,
        isEnemy: boolean,
        size: number = 65,
        color: number = 0xffffff
    ): void {

        if (!scene.textures.exists("hitEffect")) return;

        const key = "impactSpark";

        //create the hit animation
        if (!scene.anims.exists(key)) {scene.anims.create({key: key,frames: scene.anims.generateFrameNumbers(
                    "hitEffect",
                    { start: 0, end: 11 }
                ),
                frameRate: 40,
                repeat: 0
            });
        }

        //display sparks at the impact position
        const effect = scene.add.sprite(x + (isEnemy ? -10 : 10), y,"hitEffect");

        effect.setDisplaySize(size, size);
        //change particle colour
        effect.setTint(color);
        effect.setDepth(100);
        effect.play(key);

        //remove effect after animation finishes
        effect.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            effect.destroy();
        });
    }
}