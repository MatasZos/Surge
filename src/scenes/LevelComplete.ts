
import Phaser from "phaser";

export class LevelComplete extends Phaser.Scene {

    private completedLevel = 1;

    constructor() {
        super("LevelComplete");
    }

    init(data: {completedLevel?: number}) {
        this.completedLevel = data.completedLevel ?? 1;
    }

    create() {
        const x = this.scale.width / 2;
        const y = this.scale.height / 2;

        // Background
        this.cameras.main.setBackgroundColor("#101b2a");

        // Main panel
        const panel = this.add.rectangle(
            x, y, 600, 350, 0x1b2838
        );

        panel.setStrokeStyle(3, 0x00ccff);

        // Title
        this.add.text(x, y - 110, "LEVEL COMPLETE!", {
            fontSize: "46px",
            color: "#00ccff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Message
        this.add.text(x, y - 25, "Stronghold successfully defended!", {
            fontSize: "22px",
            color: "#ffffff"
        }).setOrigin(0.5);

        // Button background
        const button = this.add.rectangle(
            x, y + 85, 240, 60, 0x0077aa
        );

        button.setStrokeStyle(2, 0x00ccff);
        button.setInteractive({ useHandCursor: true });

        // Button text
        this.add.text(x, y + 85, "NEXT LEVEL", {
            fontSize: "26px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Button hover
        button.on("pointerover", () => {
            button.setFillStyle(0x0099cc);
        });

        button.on("pointerout", () => {
            button.setFillStyle(0x0077aa);
        })

        //advance to the next level
        button.on("pointerdown", () => {

            const gameScene = this.scene.get("GameScene");

            gameScene.events.emit("next-level",this.completedLevel + 1);

            this.scene.resume("GameScene");
            this.scene.stop();
        });
    }
}
