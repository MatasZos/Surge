import Phaser from 'phaser';
import { Grid } from "./grid/Grid";
import { Shooter } from "./defenders/Shooter";
import { Enemy } from "./enemies/Enemy";
import { MeleeEnemy } from "./enemies/MeleeEnemy";
import { Projectile } from "./objects/projectile";
import { Stronghold } from "./objects/Stronghold";


const GAME_WIDTH = 1200
const GAME_HEIGHT = 800;

const GRID_ROWS = 5;
const GRID_COLS = 7;

const CELL_WIDTH = 107;
const CELL_HEIGHT = 100;

const GRID_X = 235;
const GRID_Y = 145;

class MainScene extends Phaser.Scene {
  private grid!: Grid;
  private selectedDefender: string | null = null;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private defenders: Shooter[] = [];
  private stronghold!:Stronghold;

  constructor() {
    super('MainScene');
  }

  preload() {
    // Assets
    this.load.image("shooter","assets/defenders/shooterdefender.png");
    this.load.image("meleeEnemy", "assets/enemies/meleerobot.png");
    this.load.image("laser","assets/effects/projectile.png");
    this.load.image("stronghold","assets/stronghold/stronghold.png");
    this.load.image("battlefield","assets/backgrounds/battlefield.png")
  }

  private drawGrid() {
    const graphics = this.add.graphics();

    graphics.lineStyle(2, 0xffffff, 0.5);

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = GRID_X + col * CELL_WIDTH;
        const y = GRID_Y + row * CELL_HEIGHT;

        graphics.strokeRect(
          x,y,CELL_WIDTH,CELL_HEIGHT
        );
      }
    }
  }

  private drawToolbar() {
    const toolbarX = 150;
    const toolbarY = 55;
   

    const button = this.add.rectangle(
      toolbarX,toolbarY,150,40,0x333333
    );

    const label = this.add.text(
      toolbarX,toolbarY,"Shooter",{
        fontSize: "18px",
        color: "#ffffff"
      }
    );

    label.setOrigin(0.5);

    button.setInteractive({
      useHandCursor: true
    });

    button.on("pointerdown", () => {
      this.selectedDefender = "shooter";
      label.setColor("#00ff00");
    });
  }

  private handleGridClick(
    pointer: Phaser.Input.Pointer
  ) {

    // Convert mouse position into grid position
    const col = Math.floor(
      (pointer.x - GRID_X) / CELL_WIDTH
    );

    const row = Math.floor(
      (pointer.y - GRID_Y) / CELL_HEIGHT
    );

    // Ignore clicks outside grid
    if (
      row < 0 ||
      row >= GRID_ROWS ||
      col < 0 ||
      col >= GRID_COLS
    ) {
      return;
    }

    const cell = this.grid.getCell(row,col);

    // Dont allow two defenders in same cell
    if (!cell.isEmpty()) {
      return;
    }

    // Nothing selected
    if (this.selectedDefender === null) {
      return;
    }

    // Centre of selected grid cell
    const defenderX =
      GRID_X + col * CELL_WIDTH + CELL_WIDTH / 2;

    const defenderY =
      GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

    // Create shooter
    const defender = new Shooter(
      this,
      defenderX,
      defenderY
    );

    // Store shooter in grid
    this.grid.placeHuman(
      row,
      col,
      defender
    );

    // Remember grid position
    defender.setData("gridRow",row);
    defender.setData("gridCol",col);

    this.defenders.push(defender);
  }

  private spawnEnemy() {

    // Pick random lane
    const row = Phaser.Math.Between(0, GRID_ROWS - 1);
    const enemyX =GRID_X + GRID_COLS * CELL_WIDTH + 50;
    const enemyY =GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

    // Create enemy
    const enemy = new MeleeEnemy( this, enemyX, enemyY);
    this.enemies.push(enemy);
  }

  // Check projectile and enemy collisions
  private handleProjectileEnemyCollision() {

    for (const projectile of this.projectiles) {

      // Ignore destroyed projectiles
      if (!projectile.active) {
        continue;
      }

      for (const enemy of this.enemies) {

        // Ignore destroyed enemies
        if (!enemy.active) {
          continue;
        }

        const hit =
          Phaser.Geom.Intersects.RectangleToRectangle(
            projectile.getBounds(),
            enemy.getBounds()
          );

        if (hit) {

          // Damage enemy
          enemy.takeDamage(projectile.damage);

          // Remove projectile
          projectile.destroy();

          break;
        }
      }
    }
  }

  // Check enemy and defender collisions
  private handleEnemyDefenderCollision() {

    for (const enemy of this.enemies) {

      if (!enemy.active) {
        continue;
      }

      for (const defender of this.defenders) {

        if (!defender.active) {
          continue;
        }

        const hit =
          Phaser.Geom.Intersects.RectangleToRectangle(
            enemy.getBounds(),
            defender.getBounds()
          );

        if (hit && !enemy.isAttacking) {

          // Stop enemy
          enemy.isAttacking = true;

          const row = defender.getData("gridRow");
          const col = defender.getData("gridCol");

          // Attack every second
          this.time.addEvent({
            delay: 1000,

            callback: () => {

              // Defender already dead
              if (!defender.active) {
                enemy.isAttacking = false;
                return;
              }

              // Enemy already dead
              if (!enemy.active) {
                return;
              }

              // Damage defender
              defender.takeDamage(enemy.damage);

              // Defender has died
              if (!defender.active) {

                // Clear grid cell
                this.grid.removeOccupant(row,col);

                // Remove defender from list
                this.defenders =
                  this.defenders.filter(
                    d => d !== defender
                  );

                // Enemy moves again
                enemy.isAttacking = false;
              }
            },

            loop: true
          });

          break;
        }
      }
    }
  }

  private handleEnemyStrongholdCollision(){
    for (const enemy of this.enemies){

        if(!enemy.active){
            continue;

        }

        if (enemy.isAttacking){
            continue;
        }

        const hit = Phaser.Geom.Intersects.RectangleToRectangle(
            enemy.getBounds(),
            this.stronghold.getCollisionBounds()
            );

        if(hit){
            enemy.isAttacking=true;
            console.log("Enemy reached Stronghold")
        }
    }
  }

  create() {
    const background = this.add.image(
        GAME_WIDTH/2,
        GAME_HEIGHT/2,
        "battlefield"
    )

    background.setDisplaySize(
        GAME_WIDTH,
        GAME_HEIGHT
    );
     background.setDepth(-10)

     this.grid = new Grid(GRID_ROWS, GRID_COLS);

    

    // Store projectiles created by shooters
    this.events.on(
      "projectile-created",
      (projectile: Projectile) => {
        this.projectiles.push(projectile);
      }
    );

    // Draw game
    this.drawGrid();
    this.drawToolbar();

    this.stronghold = new Stronghold(this, 110, 405, "stronghold");

    const strongholdScale = Math.min( 180/ this.stronghold.width, 430/ this.stronghold.height);

    this.stronghold.setScale(strongholdScale);
    this.stronghold.setDepth(2);
    // Grid clicking
    this.input.on("pointerdown",this.handleGridClick,this);

    // First enemy
    this.spawnEnemy();

    // Spawn enemies
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  update(
    _time: number,
    delta: number
  ) {

    // Move enemies
    for (const enemy of this.enemies) {
      if (enemy.active) {
        enemy.move(delta);
      }
    }

    // Move projectiles
    for (const projectile of this.projectiles) {
      if (projectile.active) {
        projectile.move(delta);
      }
    }

    // Check projectile/enemy collisions
    this.handleProjectileEnemyCollision();

    // Check enemy/defender collisions
    this.handleEnemyDefenderCollision();

    //Check enemy/stronghold collisions
    this.handleEnemyStrongholdCollision();
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1b1b1b',
  parent: 'game-container',

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },

  scene: [MainScene]
});