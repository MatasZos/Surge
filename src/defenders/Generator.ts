
import Phaser from "phaser";
import { Defender } from "./Defender.ts";
import { SETTINGS } from "../config/settings.ts";

export class Generator extends Defender {
  private energyTimer?: Phaser.Time.TimerEvent;

  //keep track of energy pickups belonging to this generator
  private energyPickups: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "generator");


//generator idle animation
    if(!scene.anims.exists("generator-idle")){
        scene.anims.create({
            key:"generator-idle",
            frames: scene.anims.generateFrameNumbers("generator-idle-sheet",{start:0, end:1}), frameRate:2,repeat:-1
        });
    }

    //generator hurt animation
    if(!scene.anims.exists("generator-hurt")){
        scene.anims.create({
            key:"generator-hurt",
            frames:scene.anims.generateFrameNumbers("generator-hurt-sheet",{start:0,end:2}),frameRate:12,repeat:0
        });
    }

    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "generator-hurt",()=>{
        if(this.active) this.play("generator-idle");
    })
    this.play("generator-idle")

    this.setDisplaySize(72, 82);
    this.setDefenderHealth(SETTINGS.defenders.generator.health);
    this.damage = SETTINGS.defenders.generator.damage;


    // First energy after 7 seconds
    this.energyTimer = scene.time.delayedCall(SETTINGS.energy.generatorFirstProductionMs, () => {
      if (!this.active) return;

      this.generateEnergy();
      this.startProductionTimer();

    });
  }

  private startProductionTimer() {
    // Remove the old timer
    this.energyTimer?.remove();

    let interval = SETTINGS.energy.generatorProductionIntervalMs;

    // Level 2 and 3 generate faster
    if (this.upgradeLevel >= 2) {
        interval = 16000;
    }

    this.energyTimer = this.scene.time.addEvent({
        delay: interval,
        callback: this.generateEnergy,
        callbackScope: this,
        loop: true
    });
    }

    override upgrade(): boolean {
    // Check if upgrade was successful
    if (!super.upgrade()) {
        return false;
    }

    // Make generator faster at Level 2
    if (this.upgradeLevel === 2) {
        this.startProductionTimer();
    }

    return true;
    }

    private generateEnergy() {
        if (!this.active) return;


        // Play a sound when energy is produced
        if (this.scene.cache.audio.exists("sfx_generator_produce")) {
            this.scene.sound.play("sfx_generator_produce", {
                volume: 0.18
            });
        }

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

        let amount = 50;

        //level 3 gives more energy
        if (this.upgradeLevel === 3) {
            amount = 75;
        }

        this.scene.events.emit("energy-collected", amount, energy.x, energy.y);
        energy.destroy();
    });

    // Energy disappears if not collected
    this.scene.time.delayedCall(SETTINGS.energy.pickupLifetimeMs, () => {
      if (energy.active) energy.destroy();
    });
  }

  override takeDamage(amount:number): void{
    if(!this.active){
        return;
    }
    super.takeDamage(amount);
    if(this.health>0){
        this.play("generator-hurt",true)
        return;
    }
    const scene = this.scene

    if(!scene.anims.exists("generator-dead")){
        scene.anims.create({
            key:"generator-dead",
            frames:scene.anims.generateFrameNumbers("generator-dead-sheet",{start:0,end:3}),frameRate:10, repeat:0
        });
    }

    const deathSprite = scene.add.sprite(this.x,this.y, "generator-dead-sheet",0).setDisplaySize(this.displayWidth, this.displayHeight).setDepth(this.depth);

    this.setVisible(false)
    deathSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, ()=>{deathSprite.destroy()});
    deathSprite.play("generator-dead");
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
