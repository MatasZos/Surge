
import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { SETTINGS } from "../config/settings.ts";

export class Generator extends Defender {
  private energyTimer?: Phaser.Time.TimerEvent;
  private pickupCount = 0;

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

    const produce = () => {
      if (this.active) this.spawnEnergy();
    };

    if (!this.scene.events.emit("generator-produced", this, produce)) {
      produce();
    }
  }

  private spawnEnergy() {
    if (!this.active) return;

    const energy = this.scene.add.image(
      this.x,
      this.y - 25,
      "energy"
    );

    energy.setDisplaySize(56, 56);
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

        let amount = SETTINGS.energy.generatorPickupValue;

        if (this.upgradeLevel >= 2) {
            amount *= SETTINGS.defenders.generator.upgradeEnergyMultiplier;
    }

    // Level 3 Energy Jackpot
    if (this.upgradeLevel === 3) {
        this.pickupCount++;

        if (this.pickupCount % 4 === 0) {
            amount *= 3;

            // Golden effect for jackpot
            const effect = this.scene.add.circle(
                energy.x, energy.y, 25, 0xffd700, 0.6
            );

            this.scene.tweens.add({
                targets: effect,
                alpha: 0,
                scale: 1.5,
                duration: 400,
                onComplete: () => effect.destroy()
            });
        }
    }

    console.log("Generator Level:", this.upgradeLevel, "Energy:", amount);

    const scene = this.scene;
    const x = energy.x;
    const y = energy.y;
    energy.disableInteractive();
    energy.destroy();
    if (!scene.events.emit("energy-picked-up", x, y, amount)) {
        scene.events.emit("energy-collected", amount);
    }
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
