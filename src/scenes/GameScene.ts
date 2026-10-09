
import Phaser from "phaser";

import { Grid } from "../grid/Grid";
import { Defender } from "../defenders/Defender";
import { Shooter } from "../defenders/Shooter";
import { Generator } from "../defenders/Generator";
import { Enemy } from "../enemies/Enemy";
import { MeleeEnemy } from "../enemies/MeleeEnemy";
import { Projectile } from "../objects/projectile";
import { Stronghold } from "../objects/Stronghold";

import { EnergyManager } from "../managers/EnergyManager";

import { CollisionSystem } from "../systems/CollisionSystem";
import { DefenderToolbar } from "../ui/DefenderToolbar";

import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GRID_ROWS,
  GRID_COLS,
  CELL_WIDTH,
  CELL_HEIGHT,
  GRID_X,
  GRID_Y,
  DEFENDER_COSTS,
  DEFENDER_COOLDOWNS,
  SIDEBAR_WIDTH,
  BATTLEFIELD_WIDTH

} from "../constants";

export class GameScene extends Phaser.Scene {

  private grid!: Grid;
  private selectedDefender: string | null = null;

  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private defenders: Defender[] = [];

  private stronghold!: Stronghold;
  private collisionSystem!: CollisionSystem;
  
  private energyManager!: EnergyManager;
  private energyText!: Phaser.GameObjects.Text;

  private lastPlaced: Record<string, number> = {};

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("shooter", "assets/defenders/shooterdefender.png");
    this.load.image("generator", "assets/defenders/generator.png");

    this.load.image("meleeEnemy", "assets/enemies/meleerobot.png");

    this.load.image("laser", "assets/effects/projectile.png");
    this.load.image("energy", "assets/effects/energy.png");

    this.load.image("stronghold", "assets/stronghold/stronghold.png");
    this.load.image("battlefield", "assets/backgrounds/battlefield.png");
  }

  private drawGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 0.5);

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        graphics.strokeRect(
          GRID_X + col * CELL_WIDTH,
          GRID_Y + row * CELL_HEIGHT,
          CELL_WIDTH,
          CELL_HEIGHT
        );
      }
    }
  }

  private updateEnergyText() {
    this.energyText.setText("Energy: " + this.energyManager.getEnergy());
}

  private handleGridClick(pointer: Phaser.Input.Pointer) {
    const col = Math.floor((pointer.x - GRID_X) / CELL_WIDTH);
    const row = Math.floor((pointer.y - GRID_Y) / CELL_HEIGHT);

    if (
      row < 0 || row >= GRID_ROWS ||
      col < 0 || col >= GRID_COLS
    ) return;

    if (!this.grid.getCell(row, col).isEmpty()) return;
    if (this.selectedDefender === null) return;

    const type = this.selectedDefender;
    const cost = DEFENDER_COSTS[type];

    if (cost === undefined) return;

    if (!this.energyManager.canAfford(cost)) {
    console.log("Not enough energy");
    return;
}

    const now = this.time.now;
    const last = this.lastPlaced[type];

    if (
      last !== undefined &&
      now - last < DEFENDER_COOLDOWNS[type]
    ) {
      console.log("Defender on cooldown");
      return;
    }

    const x = GRID_X + col * CELL_WIDTH + CELL_WIDTH / 2;
    const y = GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

    let defender: Defender;

    if (type === "generator") {
      defender = new Generator(this, x, y);
    } else {
      defender = new Shooter(this, x, y);
    }

    this.grid.placeHuman(row, col, defender);

    defender.setData("gridRow", row);
    defender.setData("gridCol", col);

    this.defenders.push(defender);

    this.energyManager.spendEnergy(cost);
    this.updateEnergyText();

    this.lastPlaced[type] = now;
  }

  private spawnEnemy() {
    const row = Phaser.Math.Between(0, GRID_ROWS - 1);

    const x = GRID_X + GRID_COLS * CELL_WIDTH + 50;
    const y = GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

    this.enemies.push(new MeleeEnemy(this, x, y));
  }

  create() {

    document.body.classList.remove("menu-active");
    // Reset game state
    this.energyManager = new EnergyManager(200);
    this.selectedDefender = null;
    this.enemies = [];
    this.projectiles = [];
    this.defenders = [];
    this.lastPlaced = {};
    const background = this.add.image(SIDEBAR_WIDTH + BATTLEFIELD_WIDTH / 2,GAME_HEIGHT / 2,"battlefield");
    background.setDisplaySize(BATTLEFIELD_WIDTH,GAME_HEIGHT);
    background.setDepth(-10);
    
    this.add.rectangle(SIDEBAR_WIDTH / 2,GAME_HEIGHT / 2,SIDEBAR_WIDTH,GAME_HEIGHT,0x1b2838).setDepth(-9);


    this.grid = new Grid(GRID_ROWS, GRID_COLS);

    this.events.on("projectile-created", (projectile: Projectile) => {
        this.projectiles.push(projectile);
        });

    this.events.on("energy-collected", (amount: number) => {
        this.energyManager.addEnergy(amount);
        this.updateEnergyText();
        });
        
    this.drawGrid();

    new DefenderToolbar(this, (defender: string) => {
      this.selectedDefender = defender;
    });

    this.energyText = this.add.text(100,350,"Energy: 200",{ fontSize: "22px",color: "#00ccff", backgroundColor: "#162536",padding: { x: 10, y: 8 }});
    
    this.energyText.setOrigin(0.5);

    this.energyText.setDepth(20);

    this.stronghold = new Stronghold(this, SIDEBAR_WIDTH + 110, 405, "stronghold");

    const strongholdScale = Math.min(
      180 / this.stronghold.width,
      430 / this.stronghold.height
    );

    this.stronghold.setScale(strongholdScale);
    this.stronghold.setDepth(2);

    this.collisionSystem = new CollisionSystem(
      this,
      this.grid,
      this.enemies,
      this.projectiles,
      this.defenders,
      this.stronghold
    );

    this.input.on("pointerdown", this.handleGridClick, this);

    // First enemy after 20 seconds
    this.time.delayedCall(20000, () => {

      this.spawnEnemy();

      // Spawn another enemy every 15 seconds
      this.time.addEvent({
        delay: 15000,
        callback: this.spawnEnemy,
        callbackScope: this,
        loop: true
      });

    });
  }

  update(_time: number, delta: number) {
    for (const enemy of this.enemies) {
      if (enemy.active) enemy.move(delta);
    }

    for (const projectile of this.projectiles) {
      if (projectile.active) projectile.move(delta);
    }

    this.collisionSystem.update();
  }
}
