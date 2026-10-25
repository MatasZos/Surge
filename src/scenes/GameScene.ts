import Phaser from "phaser";
import { SETTINGS } from "../config/settings";
import { GRID_ROWS, GRID_COLS, CELL_WIDTH, CELL_HEIGHT, GRID_X, GRID_Y } from "../constants";

import { loadGameAssets } from "../helpers/GameAssets";
import { BattlefieldView } from "../helpers/BattlefieldView";
import { DefenderPlacement } from "../helpers/DefenderPlacement";
import { EnemySpawner } from "../helpers/EnemySpawner";

import { EnergyDrops } from "../helpers/EnergyDrops";

import { Grid } from "../grid/Grid";
import { Defender } from "../defenders/Defender";
import { Enemy } from "../enemies/Enemy";
import { BossEnemy } from "../enemies/BossEnemy";

import { EnemyProjectile } from "../objects/EnemyProjectile";
import { Projectile } from "../objects/projectile";
import { Stronghold } from "../objects/Stronghold";
import { EnergyManager } from "../managers/EnergyManager";
import { WaveManager } from "../managers/WaveManager";
import { CollisionSystem } from "../systems/CollisionSystem";
import { DefenderToolbar } from "../ui/DefenderToolbar";

export class GameScene extends Phaser.Scene {
    private grid!: Grid;
    private selectedDefender: string | null = null;
    private draggedDefender: string | null = null;
    private dragImage: Phaser.GameObjects.Image | null = null;
    private dragHighlight: Phaser.GameObjects.Rectangle | null = null;

    private enemies: Enemy[] = [];
    private enemyProjectiles: EnemyProjectile[] = [];
    private projectiles: Projectile[] = [];
    private defenders: Defender[] = [];

    private stronghold!: Stronghold;
    private collisionSystem!: CollisionSystem;
    private energyManager!: EnergyManager;
    private energyText!: Phaser.GameObjects.Text;
    private waveText!: Phaser.GameObjects.Text;
    private defenderToolbar!: DefenderToolbar;
    private defenderPlacement!: DefenderPlacement;
    private enemySpawner!: EnemySpawner;
    private lastPlaced: Record<string, number> = {};
    private waveManager = new WaveManager();
    private currentLevel = 1;

    private intermissionActive = false;
    private intermissionCountdown?: Phaser.Time.TimerEvent;
    private intermissionEnd?: Phaser.Time.TimerEvent;

    private notificationQueue: string[] = [];
    private notificationShowing = false;

    //final boss enemy encounter
    private bossEnemy: BossEnemy | null = null;
    private bossWaveActive = false;
    private bossAttackTimer?: Phaser.Time.TimerEvent;
    private bossAttackLane = 0;

    constructor() {
        super("GameScene");
    }

    init(data: {level?: number}){
        this.currentLevel = data.level ?? 1;
    }

    preload(): void {
        loadGameAssets(this);
    }

    private resetGameState(): void {
        this.energyManager = new EnergyManager();
        this.selectedDefender = null;
        this.waveManager.reset();
        console.log( "Enemies per wave:",SETTINGS.waves.startingEnemiesPerWave);
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.defenders = [];
        this.lastPlaced = {};

        this.intermissionCountdown?.remove();
        this.intermissionEnd?.remove();
        this.intermissionCountdown= undefined;
        this.intermissionEnd = undefined;
        this.intermissionActive = false;
        this.notificationQueue = [];
        this.notificationShowing = false;

        //reset boss encounter state
        this.bossAttackTimer?.remove();
        this.bossAttackTimer = undefined;
        this.bossEnemy = null;
        this.bossWaveActive = false;
        this.bossAttackLane = 0;
    }

    private startBackgroundMusic(): void {
        if (!this.cache.audio.exists("backgroundMusic")) return;

        const music = this.sound.add("backgroundMusic", {
            volume: 0.04,
            loop: true
        });

        const startMusic = () => {
            if (!music.isPlaying) music.play();
        };

        if (this.sound.locked) {
            this.sound.once(Phaser.Sound.Events.UNLOCKED, startMusic);
        } else {
            startMusic();
        }

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.sound.off(Phaser.Sound.Events.UNLOCKED, startMusic);
            music.stop();
            music.destroy();
        });
    }

    private startPassiveEnergy(): void {
        this.time.addEvent({
            delay: SETTINGS.energy.passiveEnergyIntervalMs,
            callback: () => {
                const amount = SETTINGS.energy.passiveEnergyValue;

                this.energyManager.addEnergy(amount);
                this.updateEnergyText();

                const bonus = this.add.text(
                    179, 25,
                    "+" + amount + " ⚡",
                    {
                        fontSize: "18px",
                        color: "#00ff99",
                        fontStyle: "bold"
                    }
                ).setOrigin(0.5).setDepth(30);

                this.time.delayedCall(1200, () => {
                    bonus.destroy();
                });
            },
            loop: true
        });
    }

    private updateEnergyText(): void {
        this.energyText.setText("Energy: " + this.energyManager.getEnergy());
    }

    private showNotification(message: string): void{
        this.notificationQueue.push(message);
        this.displayNextNotification();

    }

    private displayNextNotification():void{
        //wait until last notification is finished
        if(this.notificationShowing){
            return;
        }

        const message = this.notificationQueue.shift();

        if(!message){
            return
        }

        //notification banner
        const notification = this.add.text(this.scale.width/2,110,
        message,
        {fontSize: "26px",
        color:"#ffffff",
        fontStyle:"bold",
        backgroundColor:"#1012ba",
        padding:{
            x:25,
            y:15
        },
        align:"center"
        });

        notification.setOrigin(0.5);
        notification.setDepth(100);
        notification.setScrollFactor(0);
        notification.setAlpha(0);

        //fade in and fade out animation for the notification
        this.tweens.add({
            targets:notification,
            alpha:1,
            duration:250,
            hold:1800,
            yoyo:true,

            onComplete: () => {
                notification.destroy();

                this.notificationShowing = false;

                //display the next queued message
                this.displayNextNotification();
            }
        });
    
    }

    private createUI(): void {
        this.defenderToolbar = new DefenderToolbar(this,
            (defender: string) => {this.selectedDefender = defender;},
            (type: string, pointer: Phaser.Input.Pointer) => {this.startDefenderDrag(type, pointer);}
        );

        // Compact HUD separate from the defender-card panel.
        // Matching metallic energy HUD; kept separate from the defender toolbar.
        this.add.rectangle(161, 61, 290, 75, 0x101b2a)
            .setStrokeStyle(3, 0x647589).setDepth(10);
        this.add.rectangle(161, 61, 280, 65, 0x243348)
            .setStrokeStyle(1, 0x0c131e).setDepth(11);
        this.add.text(41, 61, "⚡", { fontSize: "27px", color: "#38cfff" })
            .setOrigin(0.5).setDepth(20);
        this.energyText = this.add.text(
            179, 61, "Energy: " + this.energyManager.getEnergy(),
            { fontSize: "22px", color: "#00ccff" }
        );
        this.energyText.setOrigin(0.5);
        this.energyText.setDepth(20);

        this.waveText = this.add.text(
            this.scale.width - 25,
            this.scale.height - 25,
            "Wave " + this.waveManager.getWave() + "/" + this.waveManager.getMaxWaves(),
            {
                fontSize: "22px",
                color: "#00ccff",
                backgroundColor: "#162536",
                padding: { x: 12, y: 8 }
            }
        );
        this.waveText.setOrigin(1, 1);
        this.waveText.setDepth(20);
    }

    private createStronghold(): void {
        const strongholdWidth = 150;
        const strongholdHeight = GRID_ROWS * CELL_HEIGHT + 40;

        this.stronghold = new Stronghold(this,GRID_X - strongholdWidth / 2,GRID_Y + (GRID_ROWS * CELL_HEIGHT) / 2,"stronghold");
        this.stronghold.setDisplaySize(strongholdWidth, strongholdHeight);
        this.stronghold.setDepth(2);

        this.events.once("stronghold-destroyed", () => {
            this.scene.start("GameOver");
        });
    }

    private setupGameEvents(): void {
        this.events.on("next-level", (level:number) =>{
            this.currentLevel = level;
            this.waveManager.startLevel(level)

            this.waveText.setText("Wave " + this.waveManager.getWave() +"/" + this.waveManager.getMaxWaves());

            //new level notif
             this.showNotification(`LEVEL ${level} — WAVE ${this.waveManager.getWave()}/${this.waveManager.getMaxWaves()}`);

             // first ranged enemy notif
             if (level === 2) {
                this.showNotification("NEW ENEMY: RANGED ROBOT!");
            }
            // first crusher notif
            if (level === 3) {
                this.showNotification("WARNING: CRUSHER INCOMING!");
            }
        });

        this.events.on("projectile-created", (projectile: Projectile) => {
            this.projectiles.push(projectile);
        });

        this.events.on("enemy-projectile-created", (projectile: EnemyProjectile) => {
            this.enemyProjectiles.push(projectile);
        });

        this.events.on("energy-collected", (amount: number) => {
            this.energyManager.addEnergy(amount);
            this.updateEnergyText();
        });

        new EnergyDrops(this).setup();
    }

    
    private startDefenderDrag(
        type: string,
        pointer: Phaser.Input.Pointer
    ): void {
        this.draggedDefender = type;

        this.dragImage = this.add.image(pointer.x, pointer.y, type)
            .setDisplaySize(65, 65)
            .setDepth(100);

        this.dragHighlight = this.add.rectangle(
            0, 0, CELL_WIDTH, CELL_HEIGHT, 0x00ff99, 0.25
        ).setDepth(3).setVisible(false);
    }

    private moveDefenderDrag(pointer: Phaser.Input.Pointer): void {
        if (!this.dragImage || !this.dragHighlight) return;

        this.dragImage.setPosition(pointer.x, pointer.y);

        const col = Math.floor((pointer.x - GRID_X) / CELL_WIDTH);
        const row = Math.floor((pointer.y - GRID_Y) / CELL_HEIGHT);

        if (
            row < 0 || row >= GRID_ROWS ||
            col < 0 || col >= this.grid.cols ||
            !this.grid.getCell(row, col).isEmpty()
        ) {
            this.dragHighlight.setVisible(false);
            return;
        }

        this.dragHighlight.setPosition(
            GRID_X + col * CELL_WIDTH + CELL_WIDTH / 2,
            GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2
        );

        this.dragHighlight.setVisible(true);
    }

    private finishDefenderDrag(pointer: Phaser.Input.Pointer): void {
        if (!this.draggedDefender) return;

        this.selectedDefender = null;

        this.defenderPlacement.place(pointer, this.draggedDefender);

        this.dragImage?.destroy();
        this.dragHighlight?.destroy();

        this.dragImage = null;
        this.dragHighlight = null;
        this.draggedDefender = null;
    }


    private handleGridClick(pointer: Phaser.Input.Pointer): void {

        if (this.draggedDefender) return;

        if (this.selectedDefender === "recall") {
            this.defenderPlacement.recall(pointer);
        }
    }

    private spawnEnemy(): void {
        //dont spawn enemies during intermission
        if(this.intermissionActive || this.bossWaveActive){
            return;
        }
        this.enemySpawner.spawnEnemy();
    }



    private startWaveIntermission(bossNext = false): void{
        //prevent intermission from starting twice
        if(this.intermissionActive){
            return;
        }

        this.intermissionActive = true;
        this.showNotification(`WAVE ${this.waveManager.getWave()} CLEARED!`);

        //read the duration from excel

        const configuredDelay = SETTINGS.waves.waveIntermissionMs;

        //this fallback prevenmts broken config from freezing progress
        const durationMs = Number.isFinite(configuredDelay) && configuredDelay > 0 ? configuredDelay: 10000;

        let secondsRemaining = Math.ceil(durationMs / 1000)

        const completedWave = this.waveManager.getWave();

        //show countdown using wave hud
        const updateCountdown = () => { 
            this.waveText.setText( bossNext ? `BOSS IN ${secondsRemaining}s`:`Wave ${completedWave}/${this.waveManager.getMaxWaves()} - Next in ${secondsRemaining}s`);
        };
        updateCountdown();

        //update countdown once per second
        this.intermissionCountdown = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if(!this.intermissionActive){
                    return;
                }
                secondsRemaining = Math.max(0, secondsRemaining - 1);

                if (secondsRemaining > 0){
                    updateCountdown();
                }
            }
        });

        //start the next wave after the intermission
        this.intermissionEnd = this.time.delayedCall(durationMs, () => {
            this.intermissionCountdown?.remove();
            this.intermissionCountdown = undefined;
            this.intermissionEnd = undefined;
            
            if (bossNext) {
                this.startBossWave();
            } 
            else {
                this.waveManager.nextWave();
                this.showNotification(`WAVE ${this.waveManager.getWave()} INCOMING!` );
                this.waveText.setText("Wave " + this.waveManager.getWave() +"/" + this.waveManager.getMaxWaves());
            }
            this.intermissionActive = false;
        });
    }
    
    

    
private startBossWave(): void {
    const x = GRID_X + GRID_COLS * CELL_WIDTH + 15;
    const y = GRID_Y + GRID_ROWS * CELL_HEIGHT / 2;

    const boss = new BossEnemy(this, x, y);
    boss.setDepth(5);

    this.bossEnemy = boss;
    this.bossWaveActive = true;

    this.enemies.push(boss);
    this.waveText.setText("BOSS WAVE");

    this.showNotification("WARNING: OVERLORD INCOMING!");
    this.bossAttackLane = 0;

    this.bossAttackTimer?.remove();

    this.bossAttackTimer = this.time.addEvent({delay: BossEnemy.ATTACK_INTERVAL_MS,callback: () => {
        if (!boss.active || this.stronghold.health <= 0) {
            return;
        }
        const row = this.bossAttackLane % GRID_ROWS;
        this.bossAttackLane++;
        
        const shotY =GRID_Y +row * CELL_HEIGHT +CELL_HEIGHT / 2;
        const projectile = new EnemyProjectile(this,boss.x - boss.displayWidth / 2,shotY);projectile.damage = BossEnemy.DAMAGE;
        
        },
        loop: true
    });
}


    private startEnemySpawning(): void {
        this.time.delayedCall(SETTINGS.waves.firstEnemyDelayMs, () => {
            this.spawnEnemy();
            this.time.addEvent({
                delay: Math.max(1000, SETTINGS.waves.enemySpawnIntervalMs),
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });
        });
    }

    create(): void {
        document.body.classList.remove("menu-active");
        this.resetGameState();
        this.startBackgroundMusic();

        const battlefieldView = new BattlefieldView(this);
        battlefieldView.setupGridHighlight();
        battlefieldView.createBackground();
        battlefieldView.drawGrid();

        this.grid = new Grid(GRID_ROWS, GRID_COLS);
        this.defenderPlacement = new DefenderPlacement(
            this,
            this.grid,
            this.defenders,
            this.enemies,
            this.energyManager,
            this.lastPlaced,
            () => this.updateEnergyText()
        );

        this.setupGameEvents();
        this.createUI();
        this.createStronghold();
        this.startPassiveEnergy();

        this.enemySpawner = new EnemySpawner(
            this,
            this.enemies,
            this.defenders,
            this.stronghold,
            this.waveManager
        );

        this.collisionSystem = new CollisionSystem(
            this,
            this.grid,
            this.enemies,
            this.projectiles,
            this.defenders,
            this.stronghold,
            this.enemyProjectiles
        );

        this.input.on("pointerdown", this.handleGridClick, this);
        this.input.on("pointermove", this.moveDefenderDrag, this);
        this.input.on("pointerup", this.finishDefenderDrag, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off("pointerdown", this.handleGridClick, this);
            this.input.off("pointermove", this.moveDefenderDrag, this);
            this.input.off("pointerup", this.finishDefenderDrag, this);
        });
        this.startEnemySpawning();
        this.showNotification(`LEVEL ${this.currentLevel} — WAVE ${this.waveManager.getWave()}/${this.waveManager.getMaxWaves()}`);
    }

    
private updateWaveProgress(): void {
    if (this.bossWaveActive) {

        if (
            this.bossEnemy &&
            !this.bossEnemy.active &&
            this.stronghold.health > 0
        ) {
            this.bossAttackTimer?.remove();
            this.bossAttackTimer = undefined;

            this.bossWaveActive = false;

            // boss defeated - level is complete
            this.scene.launch("LevelComplete", {completedLevel: 5});
            this.scene.pause();
        }

        return;
    }
    if (this.intermissionActive) {
        return;
    }
    if (!this.waveManager.isWaveFinished() ||!this.enemies.every(enemy => !enemy.active) ||this.stronghold.health <= 0) {
        return;
    }

    if (this.waveManager.isLevelComplete()) {
        if (this.currentLevel === 5) {
            this.startWaveIntermission(true);

        } else {
            //level 1-4
            this.scene.launch("LevelComplete", { completedLevel: this.currentLevel});
            this.scene.pause();
        }

    } else {
        this.startWaveIntermission();
    }
}


    update(_time: number, delta: number): void {
        this.defenderToolbar.updateCooldowns(this.time.now, this.lastPlaced);

        for (const enemy of this.enemies) {
            if (enemy.active) enemy.move(delta);
        }
        for (const projectile of this.projectiles) {
            if (projectile.active) projectile.move(delta);
        }
        for (const projectile of this.enemyProjectiles) {
            if (projectile.active) projectile.move(delta);
        }

        this.collisionSystem.update();
        this.updateWaveProgress();
    }
}
