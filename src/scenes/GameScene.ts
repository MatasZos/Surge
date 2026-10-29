import Phaser from "phaser";
import { SETTINGS } from "../config/settings.ts";
import { GRID_ROWS, GRID_COLS, CELL_WIDTH, CELL_HEIGHT, GRID_X, GRID_Y } from "../constants.ts";

import { loadGameAssets } from "../helpers/GameAssets.ts";
import { BattlefieldView } from "../helpers/BattlefieldView.ts";
import { DefenderPlacement } from "../helpers/DefenderPlacement.ts";
import { EnemySpawner } from "../helpers/EnemySpawner.ts";

import { EnergyDrops } from "../helpers/EnergyDrops.ts";

import { Grid } from "../grid/Grid.ts";
import { Defender } from "../defenders/Defender.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { BossEnemy } from "../enemies/BossEnemy.ts";
import { HijackerEnemy } from "../enemies/HijackerEnemy.ts";

import { EnemyProjectile } from "../objects/EnemyProjectile.ts";
import { Projectile } from "../objects/projectile.ts";
import { Stronghold } from "../objects/Stronghold.ts";
import { EnergyManager } from "../managers/EnergyManager.ts";
import { WaveManager } from "../managers/WaveManager.ts";
import { CollisionSystem } from "../systems/CollisionSystem.ts";
import { DefenderToolbar } from "../ui/DefenderToolbar.ts";
import { PassiveEnergy } from "../helpers/PassiveEnergy.ts";
import { DefenderDrag } from "../helpers/DefenderDrag.ts";
import { EnergyHUD } from "../ui/EnergyHUD.ts";
import { DefenderUpgradeMenu } from "../ui/DefenderUpgradeMenu.ts";

export class GameScene extends Phaser.Scene {
    private grid!: Grid;
    private selectedDefender: string | null = null;

    private enemies: Enemy[] = [];
    private enemyProjectiles: EnemyProjectile[] = [];
    private projectiles: Projectile[] = [];
    private defenders: Defender[] = [];
    private defenderDrag!: DefenderDrag;
    private upgradeMenu!: DefenderUpgradeMenu;

    private stronghold!: Stronghold;
    private collisionSystem!: CollisionSystem;
    private energyManager!: EnergyManager;
    private energyHUD!: EnergyHUD;
    private waveText!: Phaser.GameObjects.Text;
    private defenderToolbar!: DefenderToolbar;
    private defenderPlacement!: DefenderPlacement;
    private enemySpawner!: EnemySpawner;
    private lastPlaced: Record<string, number> = {};
    private waveManager = new WaveManager();
    private currentLevel = 1;

    private readonly defenderUnlockLevels: Record<string,number> = {
        shooter:1,
        generator: 1,
        barricade: 1,
        dualbarrel: 2,
        cryogunner: 3,
        landmine: 4,
        scrapper:5
    };

    private isDefenderUnlocked(type: string): boolean{
        if (type === "recall"){
            return true;
        }

        const requiredLevel = this.defenderUnlockLevels[type];

        return requiredLevel !== undefined && this.currentLevel >= requiredLevel;
    }

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
            volume: 0.1,
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

    private updateEnergyText(): void {
        this.energyHUD.update();
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
            (defender: string) => {
                if (!this.isDefenderUnlocked(defender)){
                    this.showNotification("DEFENDER LOCKED!");
                    return;
                }

                this.selectedDefender = defender;
            },
            (type: string, pointer: Phaser.Input.Pointer) =>{
                if (!this.isDefenderUnlocked(type)){
                    this.showNotification("DEFENDER LOCKED!");
                    return;
                }

                this.defenderDrag.start(type,pointer);
            },
            (type:string) => this.defenderUnlockLevels[type] ?? 99
        );
        this.defenderToolbar.updateUnlocks(this.currentLevel)

        this.energyHUD = new EnergyHUD(this, this.energyManager);

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
            this.defenderToolbar.updateUnlocks(level);

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

    private handleGridClick(pointer: Phaser.Input.Pointer): void {

        if (this.defenderDrag.isDragging()) return;

        if (this.selectedDefender === "recall") {
            this.upgradeMenu.close();
            this.defenderPlacement.recall(pointer);
            return;
        }

        // Check if the player clicked on a defender
        const clickedDefender = this.defenders.some(defender =>
            defender.active &&
            defender.getBounds().contains(pointer.worldX, pointer.worldY)
        );

        // Close menu only when clicking outside a defender and the menu
        if (!clickedDefender && !this.upgradeMenu.isPointerInside(pointer)) {
            this.upgradeMenu.close();
        }

    }

    /**
     * Prepare a Hijacker to steal a specific defender.
     * Not called by any existing wave or spawner: Hijackers remain inactive.
     */
    public prepareHijackerSteal(hijacker: HijackerEnemy, target: Defender): void {
        if (!hijacker.active || !target.active || !this.defenders.includes(target)) return;

        hijacker.onGrabReady = (attacker: HijackerEnemy) => {
            // The defender might have been destroyed or recalled during descent.
            if (!attacker.active || !target.active || !this.defenders.includes(target)) {
                attacker.cancelGrab();
                return;
            }

            const row = target.getData("gridRow") as number;
            const col = target.getData("gridCol") as number;
            if (!Number.isInteger(row) || !Number.isInteger(col) ||
                row < 0 || row >= GRID_ROWS || col < 0 || col >= this.grid.cols) {
                attacker.cancelGrab();
                return;
            }

            const index = this.defenders.indexOf(target);
            this.defenders.splice(index, 1);
            this.grid.removeOccupant(row, col);
            target.destroy();
            attacker.beginEscape();
        };

        hijacker.startDescent(target.x, target.y);
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
        this.upgradeMenu = new DefenderUpgradeMenu(
            this,
            this.energyManager,
            () => this.updateEnergyText()
        );
        this.defenderPlacement = new DefenderPlacement(
            this,
            this.grid,
            this.defenders,
            this.enemies,
            this.energyManager,
            this.lastPlaced,
            () => this.updateEnergyText(),
            (defender: Defender) => {
                if (this.selectedDefender !== "recall" &&
                    !this.defenderDrag?.isDragging()) {
                    this.upgradeMenu.show(defender);
                }
            },
            (type:string) => this.isDefenderUnlocked(type)
        );

        this.defenderDrag = new DefenderDrag(
            this,
            this.grid,
            this.defenderPlacement,
            () => { this.selectedDefender = null; }
        );

        this.setupGameEvents();
        this.createUI();
        this.createStronghold();

        new PassiveEnergy(this,this.energyManager,() => this.updateEnergyText()).start();

        this.enemySpawner = new EnemySpawner(
            this,
            this.enemies,
            this.defenders,
            this.stronghold,
            this.waveManager,
            (hijacker, target) => this.prepareHijackerSteal(hijacker,target)
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
        this.input.on("pointermove", this.defenderDrag.move, this.defenderDrag);
        this.input.on("pointerup", this.defenderDrag.finish, this.defenderDrag);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.input.off("pointerdown", this.handleGridClick, this);
            this.input.off("pointermove", this.defenderDrag.move, this.defenderDrag);
            this.input.off("pointerup", this.defenderDrag.finish, this.defenderDrag);
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
            if(!enemy.active){
                continue;
            }
            if(enemy instanceof HijackerEnemy){
                enemy.updateHijacker(delta);
            }else{
                enemy.move(delta);
            }
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
