
import Phaser from "phaser";
import { SETTINGS } from "../config/settings";

import { Grid } from "../grid/Grid";
import { Defender } from "../defenders/Defender";
import { Shooter } from "../defenders/Shooter";
import { Generator } from "../defenders/Generator";
import { Barricade } from "../defenders/Barricade";

import { Enemy } from "../enemies/Enemy";
import { MeleeEnemy } from "../enemies/MeleeEnemy";
import { RangedEnemy } from "../enemies/RangedEnemy";

import { EnemyProjectile } from "../objects/EnemyProjectile";
import { Projectile } from "../objects/projectile";
import { Stronghold } from "../objects/Stronghold";

import { EnergyManager } from "../managers/EnergyManager";
import { CollisionSystem } from "../systems/CollisionSystem";
import { DefenderToolbar } from "../ui/DefenderToolbar";

import {
    GAME_HEIGHT,
    GRID_ROWS,
    GRID_COLS,
    CELL_WIDTH,
    CELL_HEIGHT,
    GRID_X,
    GRID_Y,
    SIDEBAR_WIDTH,
    BATTLEFIELD_WIDTH
} from "../constants";

export class GameScene extends Phaser.Scene {

    private grid!: Grid;
    private selectedDefender: string | null = null;

    private enemies: Enemy[] = [];
    private enemyProjectiles: EnemyProjectile[] = [];
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

        // Defender images
        this.load.image(
            "shooter",
            "assets/defenders/shooterdefender.png"
        );

        this.load.image(
            "generator",
            "assets/defenders/generator.png"
        );

        this.load.image(
            "barricade",
            "assets/defenders/barricade.png"
        );

        // Enemy images
        this.load.image(
            "meleeEnemy",
            "assets/enemies/meleerobot.png"
        );

        // Effects
        this.load.image("laser", "assets/effects/projectile.png");
        this.load.image("energy", "assets/effects/energy.png");

        // Stronghold and battlefield
        this.load.image(
            "stronghold",
            "assets/stronghold/stronghold.png"
        );

        this.load.image(
            "battlefield",
            "assets/backgrounds/battlefield.png"
        );

        // Audio
        this.load.audio(
            "backgroundMusic",
            "assets/sounds/backgroundMusic.m4a"
        );

        this.load.audio(
            "laserSound",
            "assets/sounds/laser.m4a"
        );

        this.load.audio(
            "enemyHitSound",
            "assets/sounds/enemyhit.m4a"
        );

        this.load.audio(
            "explosionSound",
            "assets/sounds/explosion.m4a"
        );
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
        this.energyText.setText(
            "Energy: " + this.energyManager.getEnergy()
        );
    }

    private handleGridClick(pointer: Phaser.Input.Pointer) {

        const col = Math.floor(
            (pointer.x - GRID_X) / CELL_WIDTH
        );

        const row = Math.floor(
            (pointer.y - GRID_Y) / CELL_HEIGHT
        );

        if (
            row < 0 || row >= GRID_ROWS ||
            col < 0 || col >= GRID_COLS
        ) return;

        if (!this.grid.getCell(row, col).isEmpty()) return;
        if (this.selectedDefender === null) return;

        const type = this.selectedDefender;

        // Allowed defenders
        if (
            type !== "shooter" &&
            type !== "generator" &&
            type !== "barricade"
        ) return;

        // Stats loaded from CSV
        const cost = SETTINGS.defenders[type].cost;
        const cooldown = SETTINGS.defenders[type].cooldownMs;

        if (!this.energyManager.canAfford(cost)) {
            console.log("Not enough energy");
            return;
        }

        const now = this.time.now;
        const last = this.lastPlaced[type];

        if (
            last !== undefined &&
            now - last < cooldown
        ) {
            console.log("Defender on cooldown");
            return;
        }

        const x = GRID_X + col * CELL_WIDTH + CELL_WIDTH / 2;
        const y = GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

        let defender: Defender;

        // Create selected defender
        if (type === "generator") {

            defender = new Generator(this, x, y);

        } else if (type === "barricade") {

            defender = new Barricade(this, x, y);

        } else {

            defender = new Shooter(
                this,
                x,
                y,
                this.enemies
            );
        }

        // Place defender on grid
        this.grid.placeHuman(row, col, defender);

        defender.setData("gridRow", row);
        defender.setData("gridCol", col);

        this.defenders.push(defender);

        // Spend energy
        this.energyManager.spendEnergy(cost);
        this.updateEnergyText();

        // Start cooldown
        this.lastPlaced[type] = now;
    }

    private spawnEnemy() {

        const row = Phaser.Math.Between(0, GRID_ROWS - 1);

        const x = GRID_X + GRID_COLS * CELL_WIDTH + 50;
        const y = GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;

        // Enemy spawn probabilities from CSV
        if (
            Math.random() <
            SETTINGS.waves.meleeSpawnProbability
        ) {

            this.enemies.push(
                new MeleeEnemy(this, x, y)
            );

        } else {

            this.enemies.push(
                new RangedEnemy(
                    this,
                    x,
                    y,
                    this.defenders,
                    this.stronghold
                )
            );
        }
    }

    create() {

        // Background music
        if (this.cache.audio.exists("backgroundMusic")) {

            const music = this.sound.add("backgroundMusic", {
                volume: 0.2,
                loop: true
            });

            const startMusic = () => {
                if (!music.isPlaying) {
                    music.play();
                }
            };

            if (this.sound.locked) {
                this.sound.once(
                    Phaser.Sound.Events.UNLOCKED,
                    startMusic
                );
            } else {
                startMusic();
            }

            this.events.once(
                Phaser.Scenes.Events.SHUTDOWN,
                () => {
                    this.sound.off(
                        Phaser.Sound.Events.UNLOCKED,
                        startMusic
                    );

                    music.stop();
                    music.destroy();
                }
            );
        }

        document.body.classList.remove("menu-active");

        // Reset game state
        this.energyManager = new EnergyManager();
        this.selectedDefender = null;

        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.defenders = [];
        this.lastPlaced = {};

        // Battlefield background
        const background = this.add.image(
            SIDEBAR_WIDTH + BATTLEFIELD_WIDTH / 2,
            GAME_HEIGHT / 2,
            "battlefield"
        );

        background.setDisplaySize(
            BATTLEFIELD_WIDTH,
            GAME_HEIGHT
        );

        background.setDepth(-10);

        // Sidebar background
        this.add.rectangle(
            SIDEBAR_WIDTH / 2,
            GAME_HEIGHT / 2,
            SIDEBAR_WIDTH,
            GAME_HEIGHT,
            0x1b2838
        ).setDepth(-9);

        // Create grid
        this.grid = new Grid(GRID_ROWS, GRID_COLS);

        // Track player projectiles
        this.events.on(
            "projectile-created",
            (projectile: Projectile) => {
                this.projectiles.push(projectile);
            }
        );

        // Track enemy projectiles
        this.events.on(
            "enemy-projectile-created",
            (projectile: EnemyProjectile) => {
                this.enemyProjectiles.push(projectile);
            }
        );

        // Collect generator energy
        this.events.on(
            "energy-collected",
            (amount: number) => {
                this.energyManager.addEnergy(amount);
                this.updateEnergyText();
            }
        );

        this.drawGrid();

        // Defender selection toolbar
        new DefenderToolbar(
            this,
            (defender: string) => {
                this.selectedDefender = defender;
            }
        );

        // Energy display
        this.energyText = this.add.text(
            100,
            460,
            "Energy: " + this.energyManager.getEnergy(),
            {
                fontSize: "22px",
                color: "#00ccff",
                backgroundColor: "#162536",
                padding: { x: 10, y: 8 }
            }
        );

        this.energyText.setOrigin(0.5);
        this.energyText.setDepth(20);

        // Stronghold
        this.stronghold = new Stronghold(
            this,
            SIDEBAR_WIDTH + 110,
            405,
            "stronghold"
        );

        const strongholdScale = Math.min(
            180 / this.stronghold.width,
            430 / this.stronghold.height
        );

        this.stronghold.setScale(strongholdScale);
        this.stronghold.setDepth(2);

        // Game over when stronghold is destroyed
        this.events.once(
            "stronghold-destroyed",
            () => {
                this.scene.start("GameOver");
            }
        );

        // Collision system
        this.collisionSystem = new CollisionSystem(
            this,
            this.grid,
            this.enemies,
            this.projectiles,
            this.defenders,
            this.stronghold,
            this.enemyProjectiles
        );

        // Grid placement
        this.input.on(
            "pointerdown",
            this.handleGridClick,
            this
        );

        // First enemy spawn
        this.time.delayedCall(
            SETTINGS.waves.firstEnemyDelayMs,
            () => {

                this.spawnEnemy();

                // Repeated enemy spawning
                this.time.addEvent({
                    delay: SETTINGS.waves.enemySpawnIntervalMs,
                    callback: this.spawnEnemy,
                    callbackScope: this,
                    loop: true
                });
            }
        );
    }

    update(_time: number, delta: number) {

        // Move enemies
        for (const enemy of this.enemies) {
            if (enemy.active) {
                enemy.move(delta);
            }
        }

        // Move player projectiles
        for (const projectile of this.projectiles) {
            if (projectile.active) {
                projectile.move(delta);
            }
        }

        // Move enemy projectiles
        for (const projectile of this.enemyProjectiles) {
            if (projectile.active) {
                projectile.move(delta);
            }
        }

        // Handle collisions
        this.collisionSystem.update();
    }
}
