import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../constants";

export class MainMenu extends Phaser.Scene {

    constructor() {
        super("MainMenu");
    }

    create() {

        // Background
        this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2,
            GAME_WIDTH, GAME_HEIGHT, 0x0a1220
        );

        // Game title
        this.add.text(
            GAME_WIDTH / 2, 250,
            "MACHINE UPRISING",
            {
                fontSize: "60px",
                color: "#49dcef",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        // Subtitle
        this.add.text(
            GAME_WIDTH / 2, 330,
            "DEFEND YOUR STRONGHOLD",
            { fontSize: "22px", color: "#aaaaaa" }
        ).setOrigin(0.5);

        // Play button
        const playButton = this.add.text(
            GAME_WIDTH / 2, 460,
            "PLAY",
            {
                fontSize: "32px",
                color: "#ffffff",
                backgroundColor: "#087d92",
                padding: { x: 50, y: 20 }
            }
        ).setOrigin(0.5);

        playButton.setInteractive({ useHandCursor: true });

        // Hover effect
        playButton.on("pointerover", () => {
            playButton.setBackgroundColor("#11a5bd");
        });

        playButton.on("pointerout", () => {
            playButton.setBackgroundColor("#087d92");
        });

        // Start game
        playButton.on("pointerdown", () => {
            this.scene.start("GameScene");
        });
    }
}