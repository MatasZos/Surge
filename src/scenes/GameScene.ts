import { SurgeSpriteAnimations } from "../animations/SurgeSpriteAnimations.ts";
import Phaser from "phaser";
import { SETTINGS } from "../config/settings.ts";
import { GRID_ROWS, GRID_COLS, CELL_HEIGHT, GRID_X, GRID_Y } from "../constants.ts";
import { loadGameAssets } from "../helpers/GameAssets.ts";
import { startGameMusic } from "../helpers/GameMusic.ts";
import { prepareHijackerSteal } from "../helpers/HijackerSteal.ts";
import { BossEncounter } from "../helpers/BossEncounter.ts";
import { BattlefieldView } from "../helpers/BattlefieldView.ts";
import { DefenderPlacement } from "../helpers/DefenderPlacement.ts";
import { EnemySpawner } from "../helpers/EnemySpawner.ts";
import { setupGameEvents } from "../helpers/GameEvents.ts";
import { Grid } from "../grid/Grid.ts";
import { Defender } from "../defenders/Defender.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { HijackerEnemy } from "../enemies/HijackerEnemy.ts";
import { EnemyProjectile } from "../objects/EnemyProjectile.ts";
import { Projectile } from "../objects/projectile.ts";
import { Stronghold } from "../objects/Stronghold.ts";
import { EnergyManager } from "../managers/EnergyManager.ts";
import { WaveManager } from "../managers/WaveManager.ts";
import { CollisionSystem } from "../systems/CollisionSystem.ts";
import { PassiveEnergy } from "../helpers/PassiveEnergy.ts";
import { DefenderDrag } from "../helpers/DefenderDrag.ts";
import { DefenderUpgradeMenu } from "../ui/DefenderUpgradeMenu.ts";
import { GameNotifications } from "../ui/GameNotifications.ts";
import { GameUI } from "../ui/GameUI.ts";
import { DefenderMovement } from "../helpers/DefenderMovement.ts";
import { WaveIntermission } from "../helpers/WaveIntermission.ts";
import { setupGameInput } from "../helpers/GameInput.ts";
import { setupGameDefenders } from "../helpers/GameDefenderSetup.ts";
import { updateEnemies, updateProjectiles } from "../helpers/GameEntityUpdates.ts";

export class GameScene extends Phaser.Scene {
    private spriteAnimations!: SurgeSpriteAnimations;
    private grid!: Grid;
    private battlefieldView!: BattlefieldView;
    private selectedDefender: string | null = null;
    private defenderMovement!: DefenderMovement;
    private enemies: Enemy[] = [];
    private enemyProjectiles: EnemyProjectile[] = [];
    private projectiles: Projectile[] = [];
    private defenders: Defender[] = [];
    private defenderDrag!: DefenderDrag;
    private upgradeMenu!: DefenderUpgradeMenu;
    private stronghold!: Stronghold;
    private collisionSystem!: CollisionSystem;
    private energyManager!: EnergyManager;
    private gameUI!: GameUI;
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
        if (type === "recall" || type === "move"){
            return true;
        }

        const requiredLevel = this.defenderUnlockLevels[type];

        return requiredLevel !== undefined && this.currentLevel >= requiredLevel;
    }

    private waveIntermission!: WaveIntermission;
    private notifications!: GameNotifications;


    //final boss enemy encounter
    private bossEncounter!: BossEncounter;


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
        this.waveManager.startLevel(this.currentLevel)
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.defenders = [];
        this.lastPlaced = {};

        //reset boss encounter state  
        this.bossEncounter?.stop();
      }


    private updateEnergyText(): void {
        this.gameUI.updateEnergy();
    }

    private showNotification(message: string): void {
        this.notifications.show(message);
        }


    private createUI(): void {
        this.gameUI = new GameUI(
            this,
            this.energyManager,
            this.waveManager,
            this.currentLevel,

            // Handle defender selection
            (defender: string) => {
                if (!this.isDefenderUnlocked(defender)) {
                    this.showNotification("DEFENDER LOCKED!");
                    return;
                }

                if (defender !== "move") {
                    this.defenderMovement.cancel();
                }

                this.selectedDefender = defender;
            },

            // Handle defender dragging
            (type: string, pointer: Phaser.Input.Pointer) => {
                if (!this.isDefenderUnlocked(type)) {
                    this.showNotification("DEFENDER LOCKED!");
                    return;
                }

                this.defenderDrag.start(type, pointer);
            },

            // Get the level needed to unlock a defender
            (type: string) => this.defenderUnlockLevels[type] ?? 99
        );
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
        setupGameEvents(
            this,
            (level:number) =>{
                this.currentLevel = level;
                this.waveManager.startLevel(level)
                this.gameUI.updateUnlocks(level);
                this.battlefieldView.updateLevelIndicator(level);
                this.gameUI.updateWaveText();

                //new level notif
                this.showNotification(`LEVEL ${level} — WAVE ${this.waveManager.getWave()}/${this.waveManager.getMaxWaves()}`);

                //first ranged enemy notif
                if (level === 2) {
                    this.showNotification("NEW ENEMY: RANGED ROBOT!");
                }

                //first crusher notif
                if (level === 3) {
                    this.showNotification("WARNING: CRUSHER INCOMING!");
                }
            },
            this.projectiles,
            this.enemyProjectiles,
            (amount: number) => {
                this.energyManager.addEnergy(amount);
                this.updateEnergyText();
            }
        );
    }

    private handleGridClick(pointer: Phaser.Input.Pointer): void {

        if (this.defenderDrag.isDragging()) return;

        if (this.selectedDefender === "recall") {
            this.upgradeMenu.close();
            this.defenderPlacement.recall(pointer);
            return;
        }

        if (this.selectedDefender === "move") {
            this.upgradeMenu.close();
            this.defenderMovement.move(pointer);
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

   public prepareHijackerSteal(hijacker: HijackerEnemy, target: Defender): void {
    prepareHijackerSteal(hijacker,target,this.defenders,this.grid);
}

    private spawnEnemy(): void {
        //dont spawn enemies during intermission
        if(this.waveIntermission.isActive() || this.bossEncounter.isActive()){
            return;
        }
        this.enemySpawner.spawnEnemy();
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

    private setupBattlefield(): void {
        this.battlefieldView = new BattlefieldView(this);
        this.battlefieldView.setupGridHighlight();
        this.battlefieldView.createBackground();
        this.battlefieldView.drawGrid();
        this.battlefieldView.createLevelIndicator(this.currentLevel);
        this.battlefieldView.createWaveProgressBar();

        this.grid = new Grid(GRID_ROWS, GRID_COLS);
    }

    private setupDefenders(): void {
         const systems = setupGameDefenders(
            this,
            this.grid,
            this.defenders,
            this.enemies,
            this.energyManager,
            this.lastPlaced,
            () => this.selectedDefender,
            (value) => { this.selectedDefender = value; },
            () => this.updateEnergyText(),
            (message) => this.showNotification(message),
            (type) => this.isDefenderUnlocked(type)
        );

        this.defenderMovement = systems.defenderMovement;
        this.upgradeMenu = systems.upgradeMenu;
        this.defenderPlacement = systems.defenderPlacement;
        this.defenderDrag = systems.defenderDrag;
    }
       
    private setupCombat(): void {
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
    }

    private setupInput(): void {
        setupGameInput(
            this,
            (pointer) => this.handleGridClick(pointer),
            (pointer) => this.defenderDrag.move(pointer),
            (pointer) => this.defenderDrag.finish(pointer)
        );
    }

    create(): void {
        document.body.classList.remove("menu-active");
        this.resetGameState();
        this.notifications = new GameNotifications(this);
        startGameMusic(this);

        this.setupBattlefield();
        this.setupDefenders();
        
        this.setupGameEvents();
        this.createUI();
        this.createStronghold();

        //boss encounter
        this.bossEncounter = new BossEncounter(
            this,
            this.enemies,
            this.defenders,
            this.stronghold,
            this.grid,
            this.gameUI.waveText,
            (message: string) => this.showNotification(message)
        );

        //wave intermission
        this.waveIntermission = new WaveIntermission(
            this,
            this.gameUI.waveText,
            this.waveManager,
            this.energyManager,
            () => this.updateEnergyText(),
            (message: string) => this.showNotification(message),
            () => this.bossEncounter.start(),
            () => this.battlefieldView.updateWaveProgressBar(0)
        );

        new PassiveEnergy(this,this.energyManager,() => this.updateEnergyText()).start();

        this.setupCombat();
        this.setupInput();
        
        this.spriteAnimations = new SurgeSpriteAnimations(this);
        this.startEnemySpawning();
        this.showNotification(`LEVEL ${this.currentLevel} — WAVE ${this.waveManager.getWave()}/${this.waveManager.getMaxWaves()}`);
    }

    private updateWaveProgress(): void {
        if (this.bossEncounter.isActive()) {
            if (this.bossEncounter.isDefeated()) {
                this.bossEncounter.stop();

                this.scene.launch("LevelComplete", {
                    completedLevel: 5
                });

                this.scene.pause();
            }
            return;
        }
        
        if (this.waveIntermission.isActive()) {
            return;
        }
        if (!this.waveManager.isWaveFinished() ||!this.enemies.every(enemy => !enemy.active) ||this.stronghold.health <= 0) {
            return;
        }

        if (this.waveManager.isLevelComplete()) {
            if (this.currentLevel === 5) {
                this.waveIntermission.start(true);

            } else {
                //level 1-4
                this.scene.launch("LevelComplete", { completedLevel: this.currentLevel});
                this.scene.pause();
            }

        } else {
            this.waveIntermission.start();
        }
    }


    update(_time: number, delta: number): void {
        this.gameUI.updateToolbar(this.time.now, this.lastPlaced);

        updateEnemies(this.enemies, delta);
        updateProjectiles(this.projectiles, this.enemyProjectiles, delta);

        this.collisionSystem.update();
        this.bossEncounter.update(delta);
        this.updateWaveProgress();

        //update wave progress bar
        this.battlefieldView.updateWaveProgressBar(
            this.waveManager.getWaveProgress()
        );
        this.spriteAnimations.update(delta);
    }
}
