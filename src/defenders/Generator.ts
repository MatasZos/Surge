
import Phaser from "phaser";
import { Defender } from "./Defender";
import { SETTINGS } from "../config/settings";

export class Generator extends Defender {
  private energyTimer?: Phaser.Time.TimerEvent;

  //keep track of energy pickups belonging to this generator
  private energyPickups: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "generator");

    this.setDisplaySize(60, 60);
    this.setDefenderHealth(SETTINGS.defenders.generator.health);
    this.damage = SETTINGS.defenders.generator.damage;

    // First energy after 7 seconds
    this.energyTimer = scene.time.delayedCall(SETTINGS.energy.generatorFirstProductionMs, () => {
      if (!this.active) return;

      this.generateEnergy();

      // Produce energy every 24 seconds
      this.energyTimer = scene.time.addEvent({
        delay: SETTINGS.energy.generatorProductionIntervalMs,
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

    //remember which pickup belongs to this generator
    this.energyPickups.push(energy);

    //then remove destroyed pickups from the tracker list
    energy.once("destroy", () => {
        const index = this.energyPickups.indexOf(energy);

        if(index != -1){
            this.energyPickups.splice(index, 1);
        }

    })

    energy.on("pointerdown", () => {
      if (!energy.active) return;

      this.scene.events.emit("energy-collected", SETTINGS.energy.generatorPickupValue);
      energy.destroy();
    });

    // Energy disappears if not collected
    this.scene.time.delayedCall(SETTINGS.energy.pickupLifetimeMs, () => {
      if (energy.active) energy.destroy();
    });
  }

  destroy(fromScene?: boolean) {
    if (this.energyTimer) {
      this.energyTimer.remove();
    }

    //remove all uncollected energy pickups from this generator
    for(const energy of [...this.energyPickups]){
        if(energy.active){
            energy.destroy();
        }
    }

    this.energyPickups = [];

    super.destroy(fromScene);
  }
}
