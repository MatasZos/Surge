
import Phaser from "phaser";

export class GameNotifications {
    private scene: Phaser.Scene;
    private queue: string[] = [];
    private showing = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
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
