import Phaser from "phaser";

export class SoundManager {
    private static volume = 1;
    private static muted = false;
    private static lastPlayed = new Map<string, number>();
    private static loops = new Set<Phaser.Sound.BaseSound>();

    private static sharedLoops = new Map<string, {
        sound: Phaser.Sound.BaseSound;
        users: number;
    }>();

    // Individual sound volumes
    // Minimum time between repeated sounds (milliseconds)
    private static readonly volumes: Record<string, number> = {
    sfx_robot_hit: 0.2,
    sfx_robot_destroy: 0.4,
    sfx_generator_produce: 0.18,
    sfx_energy_spawn: 0.2,
    sfx_ui_hover: 0.12,
    sfx_ui_click: 0.25,
    sfx_ui_error: 0.22,
    sfx_ui_upgrade: 0.35,
    sfx_defender_pickup: 0.2,
    sfx_defender_place: 0.25,
    sfx_energy_collect: 0.25,

    sfx_shooter_fire: 0.25,
    sfx_shooter_fire_alt: 0.25,
    sfx_dualbarrel_fire_1: 0.2,
    sfx_dualbarrel_fire_2: 0.2,
    sfx_cryogunner_fire: 0.18,
    sfx_barricade_hit: 0.16,
    sfx_landmine_arm: 0.2,
    sfx_landmine_explosion: 0.3,
    sfx_scrapper_attack: 0.25,

    sfx_ranged_fire: 0.25,
    sfx_hijacker_grab: 0.1,
    sfx_boss_cannon: 0.35,
    sfx_boss_shield_hit: 0.15,
    sfx_boss_death: 0.5,
    sfx_boss_shield_break: 0.4,
    sfx_boss_phase_change: 0.4,
    sfx_boss_entrance: 0.5,
    sfx_boss_shield_activate: 0.4,
    sfx_boss_reinforcements: 0.35,
    sfx_melee_attack: 0.25,
    sfx_crusher_smash: 0.25,
    sfx_stronghold_hit: 0.3,
    sfx_boss_laser_charge: 0.3,
    sfx_boss_laser_fire: 0.45,
    sfx_drone_engine: 0.1,
    backgroundMusic: 0.1,
    bossMusic: 0.15

    };

    private static readonly cooldowns: Record<string, number> = {
    sfx_shooter_fire: 90,
    sfx_shooter_fire_alt: 90,
    sfx_dualbarrel_fire_1: 90,
    sfx_dualbarrel_fire_2: 90,
    sfx_cryogunner_fire: 120,
    sfx_robot_hit: 120,
    sfx_robot_destroy: 120,
    sfx_barricade_hit: 180,
    sfx_landmine_arm: 100,
    sfx_landmine_explosion: 100,
    sfx_scrapper_attack: 150,
    sfx_boss_shield_hit: 200,
    sfx_generator_produce: 200,
    sfx_energy_spawn: 150,
    sfx_ui_hover: 180,
    sfx_ui_click: 120,
    sfx_ui_error: 180,
    sfx_ui_upgrade: 180,
    sfx_defender_pickup: 100,
    sfx_defender_place: 100,
    sfx_energy_collect: 120,

    sfx_ranged_fire: 120,
    sfx_hijacker_grab: 200,
    sfx_boss_cannon: 250,
    sfx_boss_death: 500,
    sfx_boss_shield_break: 350,
    sfx_boss_phase_change: 350,
    sfx_boss_entrance: 500,
    sfx_boss_shield_activate: 350,
    sfx_boss_reinforcements: 350,
    sfx_melee_attack: 150,
    sfx_crusher_smash: 220,
    sfx_stronghold_hit: 200,
    sfx_boss_laser_charge: 400,
    sfx_boss_laser_fire: 400

    };

    static play(scene: Phaser.Scene, key: string): void {
        if (this.muted || !scene.cache.audio.exists(key)) return;

        const now = scene.game.loop.time;
        const cooldown = this.cooldowns[key] ?? 0;
        const last = this.lastPlayed.get(key) ?? -Infinity;

        // Ignore sounds that play too frequently
        if (now - last < cooldown) return;

        this.lastPlayed.set(key, now);

        const baseVolume = this.volumes[key] ?? 0.3;

        scene.sound.play(key, {
            volume: baseVolume * this.volume
        });
    }

    // Create a looping sound
static createLoop(scene: Phaser.Scene, key: string): Phaser.Sound.BaseSound | undefined {
    if (!scene.cache.audio.exists(key)) return;

    const sound = scene.sound.add(key, {
        volume: this.getVolume(key),
        loop: true
    });

    this.loops.add(sound);

    sound.once(Phaser.Sound.Events.DESTROY, () => {
        this.loops.delete(sound);
    });

    return sound;
}

// Share one sound between multiple enemies
static acquireLoop(scene: Phaser.Scene, key: string): boolean {
    const existing = this.sharedLoops.get(key);

    if (existing) {
        existing.users++;
        return true;
    }

    const sound = this.createLoop(scene, key);
    if (!sound) return false;

    this.sharedLoops.set(key, { sound, users: 1 });

    sound.once(Phaser.Sound.Events.DESTROY, () => {
        this.sharedLoops.delete(key);
    });

    sound.play();
    return true;
}

    // Stop the sound when no enemies need it
    static releaseLoop(key: string): void {
        const existing = this.sharedLoops.get(key);
        if (!existing) return;

        existing.users--;

        if (existing.users <= 0) {
         this.sharedLoops.delete(key);
          existing.sound.stop();
         existing.sound.destroy();
        }
    }

    // Get the correct sound volume
    private static getVolume(key: string): number {
        if (this.muted) return 0;

         return (this.volumes[key] ?? 0.3) * this.volume;
    }

    // Update volumes of currently playing loops
    private static updateLoopVolumes(): void {
        for (const sound of this.loops) {
             if ("setVolume" in sound && typeof sound.setVolume === "function") {
                sound.setVolume(this.getVolume(sound.key));
            }
        }
    }

    static setVolume(volume: number): void {
        this.volume = Phaser.Math.Clamp(volume, 0, 1);
        this.updateLoopVolumes();
    }

    static setMuted(muted: boolean): void {
        this.muted = muted;
        this.updateLoopVolumes();

    }
}