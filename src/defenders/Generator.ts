
import Phaser from "phaser";
import { Defender } from "./Defender";

export class Generator extends Defender {
  private energyTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "generator");

    this.setDisplaySize(60, 60);
    this.health = 300;
    this.damage = 0;

    // First energy after 7 seconds
    this.energyTimer = scene.time.delayedCall(7000, () => {
      if (!this.active) return;

      this.generateEnergy();

      // Produce energy every 24 seconds
      this.energyTimer = scene.time.addEvent({
        delay: 24000,
        callback: this.generateEnergy,
        callbackScope: this,
        loop: true
      });
    });
  }

  private generateEnergy() {
    if (!this.active) return;

    const energy = this.scene.add.image(
      this.x,
      this.y - 25,
      "energy"
    );

    energy.setDisplaySize(35, 35);
    energy.setDepth(5);
    energy.setInteractive({ useHandCursor: true });

    energy.on("pointerdown", () => {
      if (!energy.active) return;

      this.scene.events.emit("energy-collected", 25);
      energy.destroy();
    });

    // Energy disappears if not collected
    this.scene.time.delayedCall(15000, () => {
      if (energy.active) energy.destroy();
    });
  }

  destroy(fromScene?: boolean) {
    if (this.energyTimer) {
      this.energyTimer.remove();
    }

    super.destroy(fromScene);
  }
}
