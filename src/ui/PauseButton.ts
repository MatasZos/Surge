import Phaser from "phaser";
import { SoundManager } from "../helpers/SoundManager.ts";

export function createPauseButton(scene: Phaser.Scene): void {
    const pauseButton = scene.add.text(
        90,
        145,
        "II  PAUSE",
        {
            fontSize: "21px",
            color: "#ffffff",
            backgroundColor: "#244b73",
            padding: { x: 14, y: 10 },
        },
    );

    pauseButton.setOrigin(0.5);
    pauseButton.setDepth(200);
    pauseButton.setInteractive({
        useHandCursor: true,
    });

    pauseButton.on("pointerover", () => {
        pauseButton.setBackgroundColor("#087d92");
    });

    pauseButton.on("pointerout", () => {
        pauseButton.setBackgroundColor("#244b73");
    });

    pauseButton.on("pointerdown", (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
    ) => {
        event.stopPropagation();

        scene.scene.launch("PauseScene");
        scene.scene.pause();
        scene.sound.pauseAll();

        // Play pause sound after pausing existing audio
        SoundManager.play(scene, "sfx_ui_pause");
    });
}
