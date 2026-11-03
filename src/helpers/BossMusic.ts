
import Phaser from "phaser";

export class BossMusic {
    private music?: Phaser.Sound.BaseSound;

    constructor(private scene: Phaser.Scene) {}

    start(): void {
        this.scene.sound.getAll("backgroundMusic").forEach(sound => {
            sound.stop();
        });

        if (!this.scene.cache.audio.exists("bossMusic")) return;

        this.stop();

        this.music = this.scene.sound.add("bossMusic", {
            volume: 0.15,
            loop: true
        });

        this.music.play();
    }

    stop(): void {
        if (this.music) {
            this.music.stop();
            this.music.destroy();
            this.music = undefined;
        }
    }
}
