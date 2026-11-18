
import Phaser from "phaser";

export class GameNotifications {
    private scene: Phaser.Scene;
    private queue: string[] = [];
    private showing = false;
    //guide user
    private tutorialStep = 0;
    private tutorialText?: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    //show instructions when Level 1 starts
    public showLevelHint(level: number): void {
        if (level !== 1) return;

        this.tutorialStep = 1;
        this.updateTutorialText("DRAG A GENERATOR ONTO AN EMPTY CELL");
    }

    //called after successfully placing a defender
    public defenderPlaced(type: string): void {
        if (this.tutorialStep === 1 && type === "generator") {
            this.tutorialStep = 2;
            this.updateTutorialText("COLLECT ENERGY TO BUY A SHOOTER");
        }

        if (this.tutorialStep === 3 && type === "shooter") {
            this.tutorialStep = 4;
            this.tutorialText?.destroy();
            this.tutorialText = undefined;
            this.show("TUTORIAL COMPLETE!");
        }
    }

    //check if the player has enough energy
    public checkTutorialEnergy(canAffordShooter: boolean): void {
        if (this.tutorialStep !== 2 || !canAffordShooter) return;

        this.tutorialStep = 3;
        this.updateTutorialText("DRAG A SHOOTER ONTO AN EMPTY CELL");
    }

    // Show an instruction until the player completes it
    private updateTutorialText(message: string): void {
        if (!this.tutorialText) {
            this.tutorialText = this.scene.add.text(this.scene.scale.width / 2, 165, message,
                {
                    fontSize: "22px",
                    color: "#ffffff",
                    fontStyle: "bold",
                    backgroundColor: "#1012ba",
                    padding: { x: 20, y: 12 },
                    align: "center"
                }
            ).setOrigin(0.5).setDepth(100).setScrollFactor(0);
        } else {
            this.tutorialText.setText(message);
        }
    }

    public show(message: string): void {
        this.queue.push(message);
        this.displayNext();
    }

    private displayNext(): void {
        // Only show one notification at a time
        if (this.showing) {
            return;
        }

        const message = this.queue.shift();

        if (!message) {
            return;
        }

        this.showing = true;

        // Create the notification banner
        const notification = this.scene.add.text(
            this.scene.scale.width / 2,
            110,
            message,
            {
                fontSize: "26px",
                color: "#ffffff",
                fontStyle: "bold",
                backgroundColor: "#1012ba",
                padding: {
                    x: 25,
                    y: 15
                },
                align: "center"
            }
        );

        notification.setOrigin(0.5);
        notification.setDepth(100);
        notification.setScrollFactor(0);
        notification.setAlpha(0);

        // Fade the message in and out
        this.scene.tweens.add({
            targets: notification,
            alpha: 1,
            duration: 250,
            hold: 1800,
            yoyo: true,

            onComplete: () => {
                notification.destroy();

                this.showing = false;

                // Show the next message
                this.displayNext();
            }
        });
    }
}
