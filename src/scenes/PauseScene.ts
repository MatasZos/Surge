import Phaser from "phaser";

export class PauseScene extends Phaser.Scene {

    constructor() {
        super("PauseScene");
    }

    create(): void {
        const x = this.scale.width / 2;
        const y = this.scale.height / 2;

        this.add.rectangle(
            x, y,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.65
        ).setInteractive();

        const panel = this.add.rectangle(
            x, y, 480, 320, 0x1b2838
        );

        panel.setStrokeStyle(3, 0x00ccff);

        this.add.text(x, y - 105, "GAME PAUSED", {
            fontSize: "42px",
            color: "#00ccff",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const resumeButton = this.add.text(
            x, y - 10, "RESUME", {
                fontSize: "28px",
                color: "#ffffff",
                backgroundColor: "#087d92",
                padding: { x: 50, y: 15 }
            }
        ).setOrigin(0.5);

        resumeButton.setInteractive({
            useHandCursor: true
        });

        resumeButton.on("pointerdown", () => {
            this.sound.resumeAll();
            this.scene.resume("GameScene");
            this.scene.stop();
        });

        const menuButton = this.add.text(
            x, y + 90, "MAIN MENU", {
                fontSize: "26px",
                color: "#ffffff",
                backgroundColor: "#40536b",
                padding: { x: 35, y: 15 }
            }
        ).setOrigin(0.5);

        menuButton.setInteractive({
            useHandCursor: true
        });

        menuButton.on("pointerdown", () => {
            this.scene.stop("GameScene");
            this.sound.stopAll();
            this.scene.start("MainMenu");
        });
    }
}
