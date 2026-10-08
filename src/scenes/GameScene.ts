
import Phaser from "phaser";

import { Grid } from "../grid/Grid";
import { Shooter } from "../defenders/Shooter";
import { Enemy } from "../enemies/Enemy";
import { MeleeEnemy } from "../enemies/MeleeEnemy";
import { Projectile } from "../objects/projectile";
import { Stronghold } from "../objects/Stronghold";

import { CollisionSystem } from "../systems/CollisionSystem";
import { DefenderToolbar } from "../ui/DefenderToolbar";

// Shared game settings
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GRID_ROWS,
  GRID_COLS,
  CELL_WIDTH,
  CELL_HEIGHT,
  GRID_X,
  GRID_Y
} from "../constants";

// Main gameplay scene
export class GameScene extends Phaser.Scene {

  private grid!: Grid;
  private selectedDefender: string | null = null;

  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private defenders: Shooter[] = [];

  private stronghold!: Stronghold;
  private collisionSystem!: CollisionSystem;

  constructor() {
    super("GameScene");
  }

  // Load game assets
  preload() {
    this.load.image(
      "shooter",
      "assets/defenders/shooterdefender.png"
    );

    this.load.image(
      "meleeEnemy",
      "assets/enemies/meleerobot.png"
    );

    this.load.image(
      "laser",
      "assets/effects/projectile.png"
    );

    this.load.image(
      "stronghold",
      "assets/stronghold/stronghold.png"
    );

    this.load.image(
      "battlefield",
      "assets/backgrounds/battlefield.png"
    );
  }

  // Draw the battlefield grid
  private drawGrid() {
    const graphics = this.add.graphics();

    graphics.lineStyle(2, 0xffffff, 0.5);

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {

        const x = GRID_X + col * CELL_WIDTH;
        const y = GRID_Y + row * CELL_HEIGHT;

        graphics.strokeRect(
          x,
          y,
          CELL_WIDTH,
          CELL_HEIGHT
        );
      }
    }
  }

  // Handle defender placement on the grid
  private handleGridClick(
    pointer: Phaser.Input.Pointer
  ) {

    // Convert mouse position to grid coordinates
    const col = Math.floor(
      (pointer.x - GRID_X) / CELL_WIDTH
    );

    const row = Math.floor(
      (pointer.y - GRID_Y) / CELL_HEIGHT
    );

    // Ignore clicks outside the grid
    if (
      row < 0 ||
      row >= GRID_ROWS ||
      col < 0 ||
      col >= GRID_COLS
    ) {
      return;
    }

    const cell = this.grid.getCell(row, col);

    // Prevent two defenders in the same cell
    if (!cell.isEmpty()) {
      return;
    }

    // Nothing selected
    if (this.selectedDefender === null) {
      return;
    }

    // Calculate centre of selected grid cell
    const defenderX =
      GRID_X + col * CELL_WIDTH + CELL_WIDTH / 2;

    const defenderY =
      GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

    // Create Shooter
    const defender = new Shooter(
      this,
      defenderX,
      defenderY
    );

    // Store Shooter in grid
    this.grid.placeHuman(
      row,
      col,
      defender
    );

    // Remember grid position
    defender.setData("gridRow", row);
    defender.setData("gridCol", col);

    // Add Shooter to shared defender list
    this.defenders.push(defender);
  }

  // Spawn enemy in a random lane
  private spawnEnemy() {

    const row = Phaser.Math.Between(
      0,
      GRID_ROWS - 1
    );

    const enemyX =
      GRID_X + GRID_COLS * CELL_WIDTH + 50;

    const enemyY =
      GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

    // Create melee enemy
    const enemy = new MeleeEnemy(
      this,
      enemyX,
      enemyY
    );

    this.enemies.push(enemy);
  }

  // Set up the game scene
  create() {

    // Battlefield background
    const background = this.add.image(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      "battlefield"
    );

    background.setDisplaySize(
      GAME_WIDTH,
      GAME_HEIGHT
    );

    background.setDepth(-10);

    // Create battlefield grid
    this.grid = new Grid(
      GRID_ROWS,
      GRID_COLS
    );

    // Store projectiles created by Shooters
    this.events.on(
      "projectile-created",
      (projectile: Projectile) => {
        this.projectiles.push(projectile);
      }
    );

    // Draw battlefield grid
    this.drawGrid();

    // Create defender selection toolbar
    new DefenderToolbar(
      this,
      (defender: string) => {
        this.selectedDefender = defender;
      }
    );

    // Create Stronghold
    this.stronghold = new Stronghold(
      this,
      110,
      405,
      "stronghold"
    );

    // Scale Stronghold without stretching
    const strongholdScale = Math.min(
      180 / this.stronghold.width,
      430 / this.stronghold.height
    );

    this.stronghold.setScale(strongholdScale);
    this.stronghold.setDepth(2);

    // Initialise collision system
    this.collisionSystem = new CollisionSystem(
      this,
      this.grid,
      this.enemies,
      this.projectiles,
      this.defenders,
      this.stronghold
    );

    // Enable grid clicking
    this.input.on(
      "pointerdown",
      this.handleGridClick,
      this
    );

    // Spawn first enemy
    this.spawnEnemy();

    // Spawn an enemy every 3 seconds
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  // Main game loop
  update(
    _time: number,
    delta: number
  ) {

    // Move active enemies
    for (const enemy of this.enemies) {
      if (enemy.active) {
        enemy.move(delta);
      }
    }

    // Move active projectiles
    for (const projectile of this.projectiles) {
      if (projectile.active) {
        projectile.move(delta);
      }
    }

    // Handle all collisions
    this.collisionSystem.update();
  }
}
