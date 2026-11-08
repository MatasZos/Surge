
import Phaser from "phaser";

export function startGameMusic(scene: Phaser.Scene): void {
    if (!scene.cache.audio.exists("backgroundMusic")) {
        return;
    }

    const music = scene.sound.add("backgroundMusic", {
        volume: 0.1,
        loop: true
    });

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
