import Phaser from "phaser";

/**
 * Animated visual layer for SURGE's existing one-frame PNG sprites.
 * No art replacement, collision logic, health or balance changes.
 * Effects are cosmetic, and every temporary effect cleans itself up.
 */
const ENEMIES = new Set(["meleeEnemy", "rangedEnemy", "crusherEnemy", "drone", "hijacker", "overlord"]);
const DEFENDERS = new Set(["shooter", "dualbarrel", "cryogunner", "generator", "landmine", "scrapper"]);
const SHOOTERS = new Set(["shooter", "dualbarrel", "cryogunner"]);

type UnitState = {
    sprite: Phaser.GameObjects.Sprite;
    texture: string;
    scaleX: number;
    scaleY: number;
    angle: number;
    phase: number;
    elapsed: number;
    lastHealth: number;
    lastLevel: number;
    lastRecovering: boolean;
    recoil: number;
    nextFX: number;
};

type EnergyState = {
    image: Phaser.GameObjects.Image;
    nextSparkle: number;
};

export class SurgeAnimations {
    private units = new Map<Phaser.GameObjects.Sprite, UnitState>();
    private pickups = new Map<Phaser.GameObjects.Image, EnergyState>();
    private elapsed = 0;

    constructor(private scene: Phaser.Scene) {
        scene.events.on("projectile-created", this.onFriendlyProjectile, this);
        scene.events.on("enemy-projectile-created", this.onEnemyProjectile, this);
        scene.events.on("enemy-killed", this.onEnemyKilled, this);
        scene.events.on("boss-shield-activated", this.onBossShield, this);
        scene.input.on("gameobjectdown", this.onGameObjectDown, this);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    }

    /** Call once from GameScene.update(), after movement and collisions. */
    update(delta: number): void {
        const dt = Math.min(delta, 50);
        this.elapsed += dt;
        this.watchNewObjects();

        for (const [sprite, state] of this.units) {
            if (!sprite.active) {
                if (DEFENDERS.has(state.texture)) {
                    this.burst(sprite.x, sprite.y, 0x44ddff, 10, 35);
                }
                this.units.delete(sprite);
                continue;
            }

            state.elapsed += dt;
            state.recoil = Math.max(0, state.recoil - dt / 185);
            const hp = (sprite as unknown as { health?: number }).health;
            if (typeof hp === "number" && hp < state.lastHealth) {
                if (state.texture !== "overlord") {
                    this.hitSparks(sprite.x, sprite.y, ENEMIES.has(state.texture) ? 0xff5533 : 0x53cfff);
                }
            }
            if (typeof hp === "number") state.lastHealth = hp;

            const level = (sprite as unknown as { upgradeLevel?: number }).upgradeLevel ?? 1;
            if (level > state.lastLevel) {
                this.upgradeRing(sprite.x, sprite.y, level === 3 ? 0xffd749 : 0x44f5c7);
            }
            state.lastLevel = level;

            const recovering = (sprite as unknown as { recovering?: boolean }).recovering === true;
            if (state.texture === "scrapper" && recovering && !state.lastRecovering) {
                this.burst(sprite.x + 26, sprite.y, 0xffb347, 8, 24);
                state.recoil = 1;
            }
            state.lastRecovering = recovering;

            const attacking = (sprite as unknown as { isAttacking?: boolean }).isAttacking === true;
            const frequency = state.texture === "crusherEnemy" ? 0.004 : 0.008;
            state.phase += dt * frequency;

            // These subtle sprite poses preserve the original artwork and existing mechanics.
            if (ENEMIES.has(state.texture)) {
                const hover = state.texture === "drone" || state.texture === "hijacker";
                const amplitude = state.texture === "overlord" ? 0.018 : hover ? 0.028 : 0.035;
                const wave = Math.sin(state.phase);
                sprite.setAngle(state.angle + (attacking ? wave * 5.5 : wave * (hover ? 3 : 2.8)) - state.recoil * 5);
                sprite.setScale(
                    state.scaleX * (1 + amplitude * Math.sin(state.phase * 0.8)),
                    state.scaleY * (1 + amplitude * Math.cos(state.phase * 0.8))
                );
                if (this.elapsed >= state.nextFX && state.texture !== "overlord") {
                    state.nextFX = this.elapsed + (hover ? 520 : 750);
                    if (hover) this.pulse(sprite.x, sprite.y + 22, 0xff3344, 9, 480);
                    else if (!attacking) this.dust(sprite.x, sprite.y + sprite.displayHeight / 2 - 5);
                    else if (state.texture === "crusherEnemy") this.pulse(sprite.x - 25, sprite.y, 0xff7a36, 10, 260);
                }
                if (state.texture === "overlord" && this.elapsed >= state.nextFX) {
                    state.nextFX = this.elapsed + 1200;
                    this.pulse(sprite.x, sprite.y, 0xff314c, 48, 800);
                }
            } else if (DEFENDERS.has(state.texture)) {
                const mine = state.texture === "landmine";
                const generator = state.texture === "generator";
                const breath = generator ? 0.026 : mine ? 0.03 : 0.014;
                sprite.setAngle(state.angle + Math.sin(state.phase) * (generator ? 0.8 : mine ? 0 : 1.1) - state.recoil * 4);
                sprite.setScale(
                    state.scaleX * (1 + Math.sin(state.phase) * breath),
                    state.scaleY * (1 + Math.cos(state.phase) * breath)
                );
                if (this.elapsed >= state.nextFX && (mine || generator)) {
                    state.nextFX = this.elapsed + (mine ? 900 : 1150);
                    this.pulse(sprite.x, sprite.y + (generator ? -12 : 0), generator ? 0x4eeeff : 0xff9a28, mine ? 12 : 17, 520);
                }
            } else if (state.texture === "laser") {
                sprite.setScale(state.scaleX, state.scaleY * (1 + Math.sin(state.phase * 3) * 0.09));
                if (this.elapsed >= state.nextFX) {
                    state.nextFX = this.elapsed + 80;
                    this.pulse(sprite.x - 16, sprite.y, 0x69dcff, 3.5, 150);
                }
            }
        }

        for (const [image, state] of this.pickups) {
            if (!image.active) {
                this.pickups.delete(image);
                continue;
            }
            if (this.elapsed >= state.nextSparkle) {
                state.nextSparkle = this.elapsed + 650;
                this.pulse(image.x + Phaser.Math.Between(-12, 12), image.y - 8, 0x4ceaff, 3, 420);
            }
        }
    }

    private watchNewObjects(): void {
        for (const child of this.scene.children.list) {
            if (!child.active) continue;
            if (child instanceof Phaser.GameObjects.Sprite) {
                const key = child.texture.key;
                if ((!ENEMIES.has(key) && !DEFENDERS.has(key) && key !== "laser") || this.units.has(child)) continue;
                const health = (child as unknown as { health?: number }).health;
                this.units.set(child, {
                    sprite: child, texture: key,
                    scaleX: child.scaleX, scaleY: child.scaleY, angle: child.angle,
                    phase: Phaser.Math.FloatBetween(0, Math.PI * 2), elapsed: 0,
                    lastHealth: typeof health === "number" ? health : 0,
                    lastLevel: (child as unknown as { upgradeLevel?: number }).upgradeLevel ?? 1,
                    lastRecovering: false, recoil: 0, nextFX: this.elapsed + 550
                });
                // Do not animate the Barricade, as requested.
            } else if (child instanceof Phaser.GameObjects.Image && child.texture.key === "energy" && !this.pickups.has(child)) {
                const energy = child;
                this.pickups.set(energy, { image: energy, nextSparkle: this.elapsed + 350 });
                this.pulse(energy.x, energy.y, 0x29d8ff, 14, 520);
                const landingY = energy.y;
                energy.y -= 14;
                this.scene.tweens.add({ targets: energy, y: landingY, duration: 460, ease: "Bounce.Out" });
                // Drop / float / sparkle: additive to existing position, never changes energy value.
                this.scene.tweens.add({ targets: energy, scaleX: energy.scaleX * 1.12, scaleY: energy.scaleY * 1.12,
                    duration: 620, yoyo: true, repeat: -1, ease: "Sine.InOut" });
                energy.once(Phaser.GameObjects.Events.DESTROY, () => this.scene.tweens.killTweensOf(energy));
            }
        }
    }

    private onFriendlyProjectile(projectile: Phaser.GameObjects.Sprite): void {
        const source = [...this.units.values()].find(state =>
            SHOOTERS.has(state.texture) && state.sprite.active &&
            Phaser.Math.Distance.Between(state.sprite.x + 25, state.sprite.y - 2, projectile.x, projectile.y) < 37
        );
        if (source) source.recoil = 1;
        this.muzzle(projectile.x - 4, projectile.y, 0x55d9ff);
    }

    private onEnemyProjectile(projectile: Phaser.GameObjects.Rectangle): void {
        const source = [...this.units.values()].find(state =>
            state.texture === "rangedEnemy" && state.sprite.active &&
            Phaser.Math.Distance.Between(state.sprite.x - 30, state.sprite.y, projectile.x, projectile.y) < 35
        );
        if (source) source.recoil = 1;
        this.muzzle(projectile.x, projectile.y, 0xff5544);
    }

    private onEnemyKilled(x: number, y: number): void {
        this.burst(x, y, 0xff623a, 11, 44);
        this.pulse(x, y, 0xffaa35, 24, 380);
    }

    private onBossShield(_phase: number): void {
        const boss = [...this.units.values()].find(s => s.texture === "overlord" && s.sprite.active)?.sprite;
        if (!boss) return;
        this.pulse(boss.x, boss.y, 0x44cfff, 90, 1100);
        this.burst(boss.x, boss.y, 0x29ddff, 14, 105);
    }

    private onGameObjectDown(_pointer: Phaser.Input.Pointer, object: Phaser.GameObjects.GameObject): void {
        if (!(object instanceof Phaser.GameObjects.Image) || object.texture.key !== "energy") return;
        const image = this.scene.add.image(object.x, object.y, "energy").setDepth(100).setDisplaySize(32, 32);
        this.burst(object.x, object.y, 0x37e8ff, 5, 18);
        // Cosmetic flight follows the original pickup; energy is credited by existing game logic.
        this.scene.tweens.add({
            targets: image, x: 179, y: 61, alpha: 0.45, scaleX: 0.13, scaleY: 0.13,
            duration: 580, ease: "Cubic.In", onComplete: () => {
                this.pulse(179, 61, 0x3cffff, 25, 350);
                image.destroy();
            }
        });
    }

    private hitSparks(x: number, y: number, color: number): void {
        this.burst(x, y, color, 3, 15);
    }

    private muzzle(x: number, y: number, color: number): void {
        const flash = this.scene.add.circle(x, y, 8, color, 0.88).setDepth(60);
        this.scene.tweens.add({ targets: flash, alpha: 0, scaleX: 2.2, scaleY: 1.2, duration: 120,
            onComplete: () => flash.destroy() });
    }

    private dust(x: number, y: number): void {
        const cloud = this.scene.add.circle(x, y, 2.5, 0x8b9ba9, 0.32).setDepth(3);
        this.scene.tweens.add({ targets: cloud, y: y - 8, x: x - 12, alpha: 0, scale: 2.2,
            duration: 470, onComplete: () => cloud.destroy() });
    }

    private pulse(x: number, y: number, color: number, radius: number, duration: number): void {
        const ring = this.scene.add.circle(x, y, radius, color, 0).setStrokeStyle(2.5, color, 0.82).setDepth(45);
        ring.setScale(0.45);
        this.scene.tweens.add({ targets: ring, scaleX: 1.45, scaleY: 1.45, alpha: 0,
            duration, ease: "Quad.Out", onComplete: () => ring.destroy() });
    }

    private upgradeRing(x: number, y: number, color: number): void {
        this.pulse(x, y, color, 34, 700);
        this.burst(x, y, color, 12, 48);
    }

    private burst(x: number, y: number, color: number, count: number, distance: number): void {
        for (let i = 0; i < count; i++) {
            const angle = Math.PI * 2 * (i / count) + Phaser.Math.FloatBetween(-0.15, 0.15);
            const length = distance * Phaser.Math.FloatBetween(0.55, 1.15);
            const dot = this.scene.add.circle(x, y, Phaser.Math.FloatBetween(2, 5), color, 0.95).setDepth(55);
            this.scene.tweens.add({
                targets: dot,
                x: x + Math.cos(angle) * length,
                y: y + Math.sin(angle) * length,
                alpha: 0, scale: 0.1,
                ease: "Quad.Out", duration: Phaser.Math.Between(320, 640),
                onComplete: () => dot.destroy()
            });
        }
    }

    destroy(): void {
        this.scene.events.off("projectile-created", this.onFriendlyProjectile, this);
        this.scene.events.off("enemy-projectile-created", this.onEnemyProjectile, this);
        this.scene.events.off("enemy-killed", this.onEnemyKilled, this);
        this.scene.events.off("boss-shield-activated", this.onBossShield, this);
        this.scene.input.off("gameobjectdown", this.onGameObjectDown, this);
        this.units.clear();
        this.pickups.clear();
    }
}
