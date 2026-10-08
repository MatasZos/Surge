
import Phaser from "phaser";

export class DefenderToolbar {

  private scene: Phaser.Scene;
  private onSelect: (defender: string) => void;

  constructor(
    scene: Phaser.Scene,
    onSelect: (defender: string) => void
  ) {
    this.scene = scene;
    this.onSelect = onSelect;

    this.drawToolbar();
  }

  // Draw the defender selection toolbar
  private drawToolbar() {

    const toolbarX = 150;
    const toolbarY = 55;

    // Shooter button background
    const button = this.scene.add.rectangle(
      toolbarX,
      toolbarY,
      150,
      40,
      0x333333
    );

    // Shooter button label
    const label = this.scene.add.text(
      toolbarX,
      toolbarY,
      "Shooter",
      {
        fontSize: "18px",
        color: "#ffffff"
      }
    );

    label.setOrigin(0.5);

    // Make button clickable
    button.setInteractive({
      useHandCursor: true
    });

    // Select Shooter when clicked
    button.on("pointerdown", () => {

      // Tell GameScene which defender was selected
      this.onSelect("shooter");

      // Highlight selected defender
      label.setColor("#00ff00");

    });
  }
}
