
import Phaser from "phaser";

export class DefenderToolbar {
  private scene: Phaser.Scene;
  private onSelect: (defender: string) => void;
  private labels: Phaser.GameObjects.Text[] = [];

  constructor(
    scene: Phaser.Scene,
    onSelect: (defender: string) => void
  ) {
    this.scene = scene;
    this.onSelect = onSelect;
    this.drawToolbar();
  }

  private drawToolbar() {
    this.addButton(150, "Shooter - 100", "shooter");
    this.addButton(340, "Generator - 50", "generator");
  }

  private addButton(
    x: number,
    text: string,
    type: string
  ) {
    const button = this.scene.add.rectangle(
      x, 55, 175, 40, 0x333333
    );

    const label = this.scene.add.text(
      x, 55, text,
      { fontSize: "16px", color: "#ffffff" }
    );

    label.setOrigin(0.5);
    label.setDepth(11);
    button.setDepth(10);
    this.labels.push(label);

    button.setInteractive({ useHandCursor: true });

    button.on("pointerdown", () => {
      this.onSelect(type);

      for (const item of this.labels) {
        item.setColor("#ffffff");
      }

      label.setColor("#00ff00");
    });
  }
}
