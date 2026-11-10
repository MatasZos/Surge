
import Phaser from "phaser";

import { BossEnemy } from "../enemies/BossEnemy.ts";
import { BossAbilities } from "../enemies/BossAbilities.ts";
import { Enemy } from "../enemies/Enemy.ts";
import { Defender } from "../defenders/Defender.ts";
import { Stronghold } from "../objects/Stronghold.ts";
import { Grid } from "../grid/Grid.ts";

import { OverlordReinforcements } from "../boss/OverlordReinforcements.ts";
import { OverlordEffects } from "../boss/OverlordEffects.ts";
import { BossMusic } from "./BossMusic.ts";

import {
    GRID_X,
    GRID_Y,
    GRID_ROWS,
    GRID_COLS,
    CELL_WIDTH,
    CELL_HEIGHT
} from "../constants.ts";

export class BossEncounter {
    private bossEnemy: BossEnemy | null = null;
    private active = false;

    private reinforcements?: OverlordReinforcements;
    private abilities?: BossAbilities;
    private effects?: OverlordEffects;
    private music?: BossMusic;

    constructor(
        private scene: Phaser.Scene,
        private enemies: Enemy[],
        private defenders: Defender[],
        private stronghold: Stronghold,
        private grid: Grid,
        private waveText: Phaser.GameObjects.Text,
        private showNotification: (message: string) => void
    ) {
        // Clean up when the scene closes or restarts
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.stop();
        });
    }

    // Start the Overlord encounter
    public start(): void {
        if (this.active) {
            return;
        }

        // Create the boss outside the grid
        const x = GRID_X + GRID_COLS * CELL_WIDTH + 15;
        const y = GRID_Y + GRID_ROWS * CELL_HEIGHT / 2;

        const boss = new BossEnemy(this.scene, x, y);
        boss.setDepth(5);

        this.bossEnemy = boss;
        this.active = true;

        // Create the boss visual effects
        this.effects = new OverlordEffects(this.scene, boss);

        // Start boss music
        this.music = new BossMusic(this.scene);
        this.music.start();

        // Add the boss to the enemies list
        this.enemies.push(boss);

        // Prepare reinforcement enemies
        this.reinforcements = new OverlordReinforcements(
            this.scene,
            boss,
            this.enemies,
            this.defenders,
            this.stronghold
        );

        // Spawn reinforcements when a shield phase begins
        this.scene.events.on(
            "boss-shield-activated",
            this.handleShieldActivated,
            this
        );

        // Update the wave display
        this.waveText.setText("BOSS WAVE");
        this.showNotification("WARNING: OVERLORD INCOMING!");

        // Create the boss attack abilities
        this.abilities = new BossAbilities(
            this.scene,
            boss,
            () => {},
            this.defenders,
            this.grid
        );
    }

    // Update the boss during gameplay
    public update(delta: number): void {
        if (!this.active) {
            return;
        }

        if (this.stronghold.health > 0) {
            this.abilities?.update(delta);
        }

        this.reinforcements?.update();
        this.effects?.update();
    }

    // Check whether the boss encounter is running
    public isActive(): boolean {
        return this.active;
    }

    // Check whether the player defeated the boss
    public isDefeated(): boolean {
        if (!this.active || !this.bossEnemy) {
            return false;
        }

        if (this.stronghold.health <= 0) {
            return false;
        }

        return !this.bossEnemy.active;
    }

    // Spawn the enemies for a new shield phase
    private handleShieldActivated(phase: number): void {
        this.reinforcements?.spawn(phase);
    }

    // Stop the encounter and clean up
    public stop(): void {
        this.active = false;

        this.scene.events.off(
            "boss-shield-activated",
            this.handleShieldActivated,
            this
        );

        this.music?.stop();
        this.music = undefined;

        this.effects?.destroy();
        this.effects = undefined;

        this.reinforcements?.destroy();
        this.reinforcements = undefined;
        this.abilities = undefined;
        this.bossEnemy = null;
    }
}
