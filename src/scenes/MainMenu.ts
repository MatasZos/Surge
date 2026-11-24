import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "../constants.ts";
import { SoundManager } from "../helpers/SoundManager.ts";

export class MainMenu extends Phaser.Scene {

    constructor() {
        super("MainMenu");
    }

     preload() {
        this.load.image(
            "menuBackground",
            "./assets/mainmenu/menu-background.png"
        );

        this.load.image("menuPanel","./assets/mainmenu/menu-panel.png")

        this.load.image("newGameButton", "./assets/mainmenu/new-game.png");

        this.load.image("optionsButton","./assets/mainmenu/options.png");

        this.load.image("howToPlayButton", "./assets/mainmenu/how-to-play.png");
    }

    create() {
        document.body.classList.add("menu-active");

        // Background
        const background = this.add.image(
            GAME_WIDTH / 2, GAME_HEIGHT / 2,
            "menuBackground"
        );

        background.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        background.setDepth(-10);       

        this.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            0x000000,
            0.25
        ).setDepth(-5);

        // Simple background 
        this.add.image(GAME_WIDTH/2,370,"menuPanel").setDisplaySize(GAME_WIDTH,GAME_HEIGHT).setAlpha(0.55).setDepth(0);

        // Game title
        this.add.text(GAME_WIDTH / 2, 110,"SURGE",{
                fontSize: "60px",
                color: "#49dcef",
                fontStyle: "bold"
            }).setOrigin(0.5);

        // Subtitle
        this.add.text(
            GAME_WIDTH / 2, 180,
            "DEFEND YOUR STRONGHOLD",
            { fontSize: "22px", color: "#aaaaaa" }
        ).setOrigin(0.5);

        // Play button
        const playButton = this.add.image(110, 330,"newGameButton").setOrigin(0,0.5).setDisplaySize(260,47.5).setAlpha(0.8);

        //options button
        const optionsButton = this.add.image(110,420,"optionsButton").setOrigin(0,0.5).setDisplaySize(205,55).setAlpha(0.8);

        //howtoplaybutton
        const howToPlayButton =this.add.image(98, 510, "howToPlayButton").setOrigin(0, 0.5).setDisplaySize(280, 93.33).setAlpha(0.8);

        playButton.setInteractive({ useHandCursor: true });

        playButton.on("pointerover",()=>{
            playButton.setAlpha(1);

            SoundManager.play(this, "sfx_ui_hover");

        playButton.on("pointerout", ()=>{
            playButton.setAlpha(0.8);
        });

        // Start game
       playButton.on("pointerdown", () => {

        // Play click sound
         SoundManager.play(this, "sfx_ui_click");

            this.scene.start("GameScene");
        });
    }
}