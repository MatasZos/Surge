import Phaser from "phaser";
import { SoundManager } from "./SoundManager.ts";

export function startGameMusic(scene: Phaser.Scene): void {
    const music = SoundManager.createLoop(scene, "backgroundMusic");

    if (!music) return;

    const playMusic = () => {
        if (!music.isPlaying) {
            music.play();
        }
    };

    if (scene.sound.locked) {
        scene.sound.once(Phaser.Sound.Events.UNLOCKED, playMusic);
    } else {
        playMusic();
    }

    // Stop music when the scene closes
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        scene.sound.off(Phaser.Sound.Events.UNLOCKED, playMusic);
        music.stop();
        music.destroy();
    });
}
