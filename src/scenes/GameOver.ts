import Phaser from "phaser"
import { GAME_WIDTH, GAME_HEIGHT } from "../constants";

export class GameOver extends Phaser.Scene{
    constructor(){
        super("GameOver")
    }

    create(){
        //gameplay page layout
        document.body.classList.remove("menu-active")

        //dark background
        this.add.rectangle(
            GAME_WIDTH/2,
            GAME_HEIGHT/2,
            GAME_WIDTH,
            GAME_HEIGHT,
            0x101827
        );

        //game over title
        this.add.text(GAME_WIDTH/2, 230, "GAME OVER", {fontSize:"64px", color:"#ff5555", fontStyle: "bold"}
        ).setOrigin(0.5);

        //message 
        this.add.text(GAME_WIDTH/2, 320, "Your Stronghold has been destroyed!", {fontSize: "26px", color: "#ffffff"}
        ).setOrigin(0.5);

        //restart button
        const restartButton = this.add.text(GAME_WIDTH/2,430,"RESTART", {fontSize: "28px", color: "#ffffff", backgroundColor:"#087d92", padding: {x:30, y:15}}
        ).setOrigin(0.5);

        restartButton.setInteractive({useHandCursor:true});

        restartButton.on("pointerdown",() => {this.scene.start("GameScene");
        });

        //main menu button

        const menuButton = this.add.text(GAME_WIDTH/2, 530, "MAIN MENU",{fontSize:"26px", color:"#ffffff", backgroundColor:"#40536b", padding: {x: 30, y:15}}
        ).setOrigin(0.5)
        
        menuButton.setInteractive({ useHandCursor: true });

        menuButton.on("pointerdown", () => {this.scene.start("MainMenu");
        });
    }
}