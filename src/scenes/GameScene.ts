import Phaser from "phaser";
import { DEFENDER_DETAILS } from "../config/defenderUnlocks.ts";
import { SETTINGS } from "../config/settings.ts";
import { GRID_COLS, GRID_ROWS } from "../constants.ts";
import { loadGameAssets } from "../helpers/GameAssets.ts";
import { startGameMusic } from "../helpers/GameMusic.ts";
import { prepareHijackerSteal } from "../helpers/HijackerSteal.ts";
import { BossEncounter } from "../helpers/BossEncounter.ts";
import { BattlefieldView } from "../helpers/BattlefieldView.ts";
import { DefenderPlacement } from "../helpers/DefenderPlacement.ts";
import { EnemySpawner } from "../helpers/EnemySpawner.ts";
import { EnemySpawnTimer } from "../helpers/EnemySpawnTimer.ts";
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
import { WaveProgress } from "../helpers/WaveProgress.ts";
import { setupGameInput } from "../helpers/GameInput.ts";
import { setupGameDefenders } from "../helpers/GameDefenderSetup.ts";
import { updateEnemies, updateProjectiles } from "../helpers/GameEntityUpdates.ts";
import { createPauseButton } from "../ui/PauseButton.ts";
import { SoundManager } from "../helpers/SoundManager.ts";

export class GameScene extends Phaser.Scene {
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
    private enemySpawnTimer?: EnemySpawnTimer;
    private lastPlaced: Record<string, number> = {};
    private waveManager = new WaveManager();
    private currentLevel = 1;
    private waveIntermission!: WaveIntermission;
    private waveProgress!: WaveProgress;
    private notifications!: GameNotifications;
    private bossEncounter!: BossEncounter;

    private isDefenderUnlocked(type: string): boolean {
        if (type === "recall" || type === "move") {
            return true;
        }

        const requiredLevel = DEFENDER_DETAILS[type]?.unlockLevel;

        return requiredLevel !== undefined && this.currentLevel >= requiredLevel;
    }

    constructor() {
        super("GameScene");
    }

    init(data: { level?: number }): void {
        this.currentLevel = data.level ?? 1;
    }

    preload(): void {
        loadGameAssets(this);
    }

    private resetGameState(): void {
        this.enemySpawnTimer = undefined;
        this.energyManager = new EnergyManager();
        this.selectedDefender = null;

        this.waveManager.reset();
        this.waveManager.startLevel(this.currentLevel);
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.defenders = [];
        this.lastPlaced = {};

        this.bossEncounter?.stop();
    }

    private updateEnergyText(): void {
        this.gameUI.updateEnergy();
    }

    private showNotification(message: string): void {
        this.notifications.show(message);
    }

    private announceWave(level: number): void {
        const wave = this.waveManager.getWave();
        const totalWaves = this.waveManager.getMaxWaves();
        this.notifications.announceWave(level, wave, totalWaves);
    }

    private canSelectDefender(type: string): boolean {
        if (this.isDefenderUnlocked(type)) return true;
        this.showNotification("DEFENDER LOCKED!");
        return false;
    }

    private createUI(): void {
        this.gameUI = new GameUI(
            this,
            this.energyManager,
            this.waveManager,
            this.currentLevel,
            // Handle defender selection
            (defender: string) => {
                if (!this.canSelectDefender(defender)) return;

                if (defender !== "move") {
                    this.defenderMovement.cancel();
                }

                this.selectedDefender = defender;
            },
            // Handle defender dragging
            (type: string, pointer: Phaser.Input.Pointer) => {
                if (!this.canSelectDefender(type)) return;

                this.defenderDrag.start(type, pointer);
            },
            // Get the level needed to unlock a defender
            (type: string) => DEFENDER_DETAILS[type]?.unlockLevel ?? 99,
        );
    }

    private setupGameEvents(): void {
        setupGameEvents(
            this,
            (level: number) => {
                this.currentLevel = level;
                this.waveManager.startLevel(level);
                this.enemySpawnTimer?.updateInterval();
                this.gameUI.updateUnlocks(level);
                this.battlefieldView.updateLevelIndicator(level);
                this.gameUI.updateWaveText();

                this.announceWave(level);
                this.notifications.showDefenderUnlocks(level);
                this.notifications.showNewEnemy(level);
            },
            this.projectiles,
            this.enemyProjectiles,
            (amount: number, x?: number, y?: number) => {
                //credit the energy right away
                this.energyManager.addEnergy(amount);

                if (x !== undefined && y !== undefined) {
                    //animate collected pickups towars the hud
                    this.gameUI.animateEnergyPickup(amount, x, y);
                } else {
                    //normal update for events without pickup positions
                    this.updateEnergyText();
                }
            },
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

        if (this.upgradeMenu.isPointerInside(pointer)) {
            return;
        }

        for (const defender of this.defenders) {
            if (defender.active && defender.getBounds().contains(pointer.worldX, pointer.worldY)) {
                return;
            }
        }

        this.upgradeMenu.close();
    }

    public prepareHijackerSteal(hijacker: HijackerEnemy, target: Defender): void {
        prepareHijackerSteal(hijacker, target, this.defenders, this.grid);
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
            (value) => {
                this.selectedDefender = value;
            },
            () => this.updateEnergyText(),
            (message) => this.showNotification(message),
            (type) => this.isDefenderUnlocked(type),
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
            (hijacker, target) => this.prepareHijackerSteal(hijacker, target),
        );

        this.collisionSystem = new CollisionSystem(
            this,
            this.grid,
            this.enemies,
            this.projectiles,
            this.defenders,
            this.stronghold,
            this.enemyProjectiles,
        );
    }

    private setupInput(): void {
        setupGameInput(
            this,
            (pointer) => this.handleGridClick(pointer),
            (pointer) => this.defenderDrag.move(pointer),
            (pointer) => this.defenderDrag.finish(pointer),
        );
    }

    create(): void {
        document.body.classList.remove("menu-active");
        this.resetGameState();

        this.notifications = new GameNotifications(this);
        const onDefenderPlaced = (type: string) => this.notifications.defenderPlaced(type);
        this.events.on("defender-placed", onDefenderPlaced);

        startGameMusic(this);

        this.setupBattlefield();
        this.setupDefenders();

        this.setupGameEvents();
        this.createUI();
        this.stronghold = this.battlefieldView.createStronghold();
        const onStrongholdDestroyed = () => {
            this.scene.start("GameOver");
        };
        this.events.once("stronghold-destroyed", onStrongholdDestroyed);

        const onDevAddEnergy = () => {
            this.energyManager.addEnergy(500);
            this.updateEnergyText();
            this.showNotification("+500 ENERGY");
        };
        this.events.on("dev-add-energy", onDevAddEnergy);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.events.off("defender-placed", onDefenderPlaced);
            this.events.off("stronghold-destroyed", onStrongholdDestroyed);
            this.events.off("dev-add-energy", onDevAddEnergy);
        });

        //boss encounter
        this.bossEncounter = new BossEncounter(
            this,
            this.enemies,
            this.defenders,
            this.stronghold,
            this.grid,
            this.gameUI.waveText,
            (message: string) => this.showNotification(message),
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
            () => {
                this.enemySpawnTimer?.updateInterval();
                this.battlefieldView.updateWaveProgressBar(0);
            },
        );

        this.waveProgress = new WaveProgress(
            this.waveManager,
            this.waveIntermission,
            this.bossEncounter,
            this.enemies,
            this.stronghold,
            (level) => this.completeLevel(level),
        );

        new PassiveEnergy(this, this.energyManager, () => this.updateEnergyText()).start();

        this.setupCombat();
        this.setupInput();
        createPauseButton(this);

        this.enemySpawnTimer = new EnemySpawnTimer(
            this.time,
            this.waveManager,
            this.enemySpawner,
            () => !this.waveIntermission.isActive() && !this.bossEncounter.isActive(),
        );
        this.enemySpawnTimer.start();

        // Play first wave sound
        SoundManager.play(this, "sfx_wave_start");

        this.announceWave(this.currentLevel);
        this.notifications.showLevelHint(this.currentLevel);
        this.notifications.showDefenderUnlocks(this.currentLevel);
    }

    private completeLevel(level: number): void {
        this.scene.launch("LevelComplete", { completedLevel: level });
        this.scene.pause();
    }

    update(_time: number, delta: number): void {
        this.gameUI.updateToolbar(this.time.now, this.lastPlaced);

        updateEnemies(this.enemies, delta);
        updateProjectiles(this.projectiles, this.enemyProjectiles, delta);

        this.collisionSystem.update();
        this.bossEncounter.update(delta);
        this.battlefieldView.updateMoveHighlight(this.grid, this.selectedDefender === "move");
        this.waveProgress.update(this.currentLevel);

        //update wave progress bar
        this.battlefieldView.updateWaveProgressBar(
            this.waveManager.getWaveProgress(),
        );

        //check if the player has enough energy for the tutorial
        this.notifications.checkTutorialEnergy(
            this.energyManager.canAfford(SETTINGS.defenders.shooter.cost),
        );
    }
}
