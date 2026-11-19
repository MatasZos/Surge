
import Phaser from "phaser";
import type { Defender } from "../defenders/Defender.ts";

export class DefenderUpgradeIndicator {
    private levelText: Phaser.GameObjects.Text;
    private aura: Phaser.GameObjects.Sprite;

    constructor(
        private scene: Phaser.Scene,
        private defender: Defender
    ) {
        this.levelText = scene.add.text(
            0, 0, "LVL 2",
            {
                fontSize: "14px",
                color: "#299dff",
                fontStyle: "bold",
                backgroundColor: "#162536",
                padding: { x: 4, y: 2 }
            }
        );
        

        this.levelText.setOrigin(0.5);
        this.levelText.setDepth(30);
        this.levelText.setVisible(false);

        //create animated aura at the defender's feet
        this.aura = scene.add.sprite(0, 0, "defenderAura");
        this.aura.setDisplaySize(55, 55);
        this.aura.setDepth(10);
        this.aura.setVisible(false);

        //level 2 blue animation
        if (!scene.anims.exists("blueAura")) {
            scene.anims.create({key: "blueAura", frames: scene.anims.generateFrameNumbers("defenderAura", {start: 24, end: 35}),
                frameRate: 12,
                repeat: -1
            });
        }

        //level 3 purple animation
        if (!scene.anims.exists("purpleAura")) {
            scene.anims.create({key: "purpleAura",frames: scene.anims.generateFrameNumbers("defenderAura", {start: 12, end: 23}),
                frameRate: 12,
                repeat: -1
            });
        }

        defender.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.levelText.destroy();
            this.aura.destroy();
        });

    }

    show(): void {
        if (!this.defender.active) return;

        this.levelText.setText("LVL " + this.defender.upgradeLevel);

        this.levelText.setColor(this.defender.upgradeLevel === 3 ? "#b46aff" : "#299dff");

       //choose animation based on defender level
        const animation = this.defender.upgradeLevel === 3
            ? "purpleAura"
            : "blueAura";

        if (this.aura.anims.currentAnim?.key !== animation) {
            this.aura.play(animation);
        }

        this.aura.setPosition(this.defender.x, this.defender.y + this.defender.displayHeight / 2 - 12);

        //position the level text above the defender
        this.levelText.setPosition(this.defender.x, this.defender.y - this.defender.displayHeight / 2 - 35);

        this.aura.setVisible(true);
        this.levelText.setVisible(true);
    }

    //play the upgrade animation
    playUpgradeEffect(): void {
        if (!this.scene.textures.exists("upgradeEffect")) return;

        const animationKey = "defenderUpgradeAnimation";

        if (!this.scene.anims.exists(animationKey)) {
            this.scene.anims.create({
                key: animationKey,
                frames: this.scene.anims.generateFrameNumbers(
                    "upgradeEffect",
                    { start: 0, end: 9 }
                ),
                frameRate: 15,
                repeat: 0
            });
        }

        const effect = this.scene.add.sprite(
            this.defender.x,
            this.defender.y,
            "upgradeEffect"
        );

        effect.setDisplaySize(100, 100);
        effect.setDepth(40);
        effect.play(animationKey);

        //remove the effect after the animation finishes
        effect.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            effect.destroy();
        });
    }
}
