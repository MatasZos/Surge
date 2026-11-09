import Phaser from "phaser";

type Unit = "shooter" | "dualbarrel" | "cryogunner" | "generator" | "landmine" | "scrapper"
    | "meleeEnemy" | "rangedEnemy" | "crusherEnemy" | "drone" | "hijacker" | "overlord";

const keys: Record<Unit, string> = {
    shooter: "surge_shooter", dualbarrel: "surge_dualbarrel", cryogunner: "surge_cryogunner",
    generator: "surge_generator", landmine: "surge_landmine", scrapper: "surge_scrapper",
    meleeEnemy: "surge_meleeEnemy", rangedEnemy: "surge_rangedEnemy",
    crusherEnemy: "surge_crusherEnemy", drone: "surge_drone", hijacker: "surge_hijacker",
    overlord: "surge_overlord"
};
const idle: Record<Unit, string> = Object.fromEntries(
    Object.keys(keys).map(k => [k, "surge-" + k + "-idle"])
) as Record<Unit, string>;

type Tracked = {
    type: Unit;
    sprite: Phaser.GameObjects.Sprite;
    health: number;
    level: number;
    recovering: boolean;
};

export class SurgeSpriteAnimations {
    private units = new Map<Phaser.GameObjects.Sprite, Tracked>();
    private pickups = new Set<Phaser.GameObjects.Image>();
    private elapsed = 0;

    constructor(private scene: Phaser.Scene) {
        this.register();
        scene.events.on("projectile-created", this.friendlyShot, this);
        scene.events.on("enemy-projectile-created", this.enemyShot, this);
        scene.events.on("enemy-killed", this.enemyKilled, this);
        scene.events.on("landmine-detonated", this.mineDetonated, this);
        scene.events.on("surge-projectile-hit", this.projectileHit, this);
        scene.events.on("boss-shield-activated", this.shield, this);
        scene.input.on("gameobjectdown", this.collect, this);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    }

    private register(): void {
        const add = (type: Unit, suffix: string, start: number, end: number, fps: number, repeat = -1) => {
            const sheet = keys[type], name = "surge-" + type + "-" + suffix;
            if (!this.scene.textures.exists(sheet) || this.scene.anims.exists(name)) return;
            this.scene.anims.create({
                key: name, frames: this.scene.anims.generateFrameNumbers(sheet, { start, end }),
                frameRate: fps, repeat
            });
        };
        for (const type of ["shooter", "dualbarrel", "cryogunner"] as Unit[]) {
            add(type, "idle", 0, 2, 5);
            add(type, "shoot", 2, 7, 16, 0);
        }
        add("generator", "idle", 0, 3, 5);
        add("landmine", "idle", 0, 1, 3);
        add("landmine", "armed", 2, 3, 5);
        add("landmine", "explode", 4, 7, 12, 0);
        add("scrapper", "idle", 0, 1, 4);
        add("scrapper", "bite", 2, 4, 12, 0);
        add("scrapper", "recover", 5, 7, 4);
        for (const type of ["meleeEnemy", "rangedEnemy", "overlord"] as Unit[]) {
            add(type, "idle", 0, 3, 7);
            add(type, "attack", 4, 7, 10);
            add(type, "death", 8, 11, 10, 0);
        }
        add("crusherEnemy", "idle", 0, 1, 6);
        add("crusherEnemy", "attack", 2, 3, 8);
        add("drone", "idle", 0, 3, 9);
        add("hijacker", "idle", 0, 3, 8);
    }

    update(delta: number): void {
        this.elapsed += Math.min(delta, 50);
        this.discover();
        for (const [sprite, state] of this.units) {
            if (!sprite.active) {
                this.units.delete(sprite);
                continue;
            }
            const props = sprite as unknown as {
                health?: number; upgradeLevel?: number; recovering?: boolean;
                isAttacking?: boolean; armed?: boolean;
            };
            if (typeof props.health === "number" && props.health < state.health && props.health > 0) {
                this.sparks(sprite.x, sprite.y, 4, 0xff6b4c);
                sprite.setTintFill(0xffffff);
                this.scene.time.delayedCall(80, () => { if (sprite.active) sprite.clearTint(); });
            }
            state.health = props.health ?? state.health;
            if ((props.upgradeLevel ?? 1) > state.level) {
                this.ring(sprite.x, sprite.y, state.level >= 2 ? 0xffd65b : 0x4ceaff);
                this.sparks(sprite.x, sprite.y, 10, 0x55ecff);
            }
            state.level = props.upgradeLevel ?? 1;
            if (state.type === "scrapper" && props.recovering && !state.recovering) {
                this.once(sprite, "surge-scrapper-bite", "surge-scrapper-recover");
            }
            state.recovering = props.recovering ?? false;
            if (this.shotPlaying(sprite)) continue;
            let target = idle[state.type];
            if (state.type === "landmine" && props.armed) target = "surge-landmine-armed";
            else if (state.type === "scrapper" && props.recovering) target = "surge-scrapper-recover";
            else if (props.isAttacking && ["meleeEnemy", "rangedEnemy", "crusherEnemy", "overlord"].includes(state.type)) {
                target = "surge-" + state.type + "-attack";
            }
            this.loop(sprite, target);
        }
    }

    private discover(): void {
        for (const object of this.scene.children.list) {
            if (object instanceof Phaser.GameObjects.Sprite && object.active && !this.units.has(object)) {
                const type = object.texture.key as Unit;
                const sheet = keys[type];
                if (!sheet || !this.scene.textures.exists(sheet)) continue;
                const width = object.displayWidth, height = object.displayHeight;
                object.setTexture(sheet, 0);
                object.setDisplaySize(width, height);
                const stats = object as unknown as { health?: number; upgradeLevel?: number };
                this.units.set(object, {
                    type, sprite: object, health: stats.health ?? 0,
                    level: stats.upgradeLevel ?? 1, recovering: false
                });
                this.loop(object, idle[type]);
            } else if (object instanceof Phaser.GameObjects.Image && object.active
                && object.texture.key === "energy" && !this.pickups.has(object)) {
                this.pickups.add(object);
                const width = object.displayWidth, height = object.displayHeight;
                if (this.scene.textures.exists("surge_energy")) {
                    object.setTexture("surge_energy", 0);
                    object.setDisplaySize(width, height);
                    const animationTimer = this.scene.time.addEvent({
                        delay: 120, loop: true,
                        callback: () => {
                            if (object.active) object.setFrame((Number(object.frame.name) + 1) % 8);
                        }
                    });
                    object.once(Phaser.GameObjects.Events.DESTROY, () => animationTimer.remove());
                }
                this.scene.tweens.add({ targets: object, y: object.y - 13, duration: 550,
                    yoyo: true, repeat: -1, ease: "Sine.InOut" });
                object.once(Phaser.GameObjects.Events.DESTROY, () => {
                    this.pickups.delete(object);
                    this.scene.tweens.killTweensOf(object);
                });
            }
        }
    }

    private friendlyShot(projectile: Phaser.GameObjects.Sprite): void {
        this.discover();
        const src = this.nearest(projectile.x - 25, projectile.y + 2,
            ["shooter", "dualbarrel", "cryogunner"], 58);
        if (!src) return;
        this.once(src.sprite, "surge-" + src.type + "-shoot", idle[src.type]);
        this.flash(projectile.x, projectile.y, src.type === "cryogunner" ? 0x66dfff : 0xffe394);
    }

    private enemyShot(projectile: Phaser.GameObjects.Rectangle): void {
        this.discover();
        const src = this.nearest(projectile.x + 30, projectile.y, ["rangedEnemy"], 75);
        if (src) this.loop(src.sprite, "surge-rangedEnemy-attack");
        this.flash(projectile.x, projectile.y, 0xff604c);
    }

    private enemyKilled(x: number, y: number): void {
        const src = this.nearest(x, y,
            ["meleeEnemy", "rangedEnemy", "crusherEnemy", "drone", "hijacker", "overlord"], 90);
        const anim = src ? "surge-" + src.type + "-death" : "";
        if (src && this.scene.anims.exists(anim)) {
            const image = this.scene.add.sprite(x, y, keys[src.type], 8)
                .setDepth(src.sprite.depth + 2).setDisplaySize(src.sprite.displayWidth, src.sprite.displayHeight);
            image.play(anim);
            image.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => image.destroy());
            src.sprite.setVisible(false);
        } else this.effect(x, y, 2, 70);
        this.sparks(x, y, 11, 0xff694e);
    }

    private projectileHit(x: number, y: number, type: string): void {
        if (type === "cryo" || type === "freeze") {
            this.ring(x, y, 0x77dfff, type === "freeze" ? 55 : 24);
            this.sparks(x, y, type === "freeze" ? 14 : 5, 0x9ceeff);
        } else if (type === "electric") {
            this.ring(x, y, 0x4fffff, 28);
            this.sparks(x, y, 8, 0x66eaff);
        } else if (type === "explosive") {
            this.effect(x, y, 2, 105);
            this.sparks(x, y, 12, 0xffac48);
        } else {
            this.sparks(x, y, 3, 0xffd873);
        }
    }

    private mineDetonated(x: number, y: number): void {
        this.effect(x, y, 2, 110);
        this.sparks(x, y, 15, 0xffad48);
    }

    private shield(): void {
        const boss = [...this.units.values()].find(t => t.type === "overlord" && t.sprite.active);
        if (boss) {
            this.ring(boss.sprite.x, boss.sprite.y, 0x47dfff, 85);
            this.sparks(boss.sprite.x, boss.sprite.y, 18, 0x5ceaff);
        }
    }

    private collect(_pointer: Phaser.Input.Pointer, target: Phaser.GameObjects.GameObject): void {
        if (!(target instanceof Phaser.GameObjects.Image) || !this.pickups.has(target)) return;
        const orb = this.scene.add.image(target.x, target.y, target.texture.key, target.frame.name)
            .setDisplaySize(30, 30).setDepth(150);
        this.scene.tweens.add({
            targets: orb, x: 179, y: 61, alpha: 0.25, scaleX: 0.1, scaleY: 0.1,
            duration: 620, ease: "Cubic.In", onComplete: () => {
                orb.destroy(); this.ring(179, 61, 0x55eaff, 25);
            }
        });
    }

    private nearest(x: number, y: number, types: Unit[], max: number): Tracked | undefined {
        let found: Tracked | undefined;
        for (const unit of this.units.values()) {
            if (!types.includes(unit.type) || !unit.sprite.active) continue;
            const dist = Phaser.Math.Distance.Between(x, y, unit.sprite.x, unit.sprite.y);
            if (dist < max) { max = dist; found = unit; }
        }
        return found;
    }

    private loop(sprite: Phaser.GameObjects.Sprite, key: string): void {
        if (this.scene.anims.exists(key) && sprite.anims.currentAnim?.key !== key) sprite.play(key, true);
    }

    private shotPlaying(sprite: Phaser.GameObjects.Sprite): boolean {
        const key = sprite.anims.currentAnim?.key ?? "";
        return sprite.anims.isPlaying && (key.endsWith("-shoot") || key.endsWith("-bite"));
    }

    private once(sprite: Phaser.GameObjects.Sprite, key: string, restore: string): void {
        if (!this.scene.anims.exists(key)) return;
        sprite.play(key, true);
        sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            if (sprite.active) this.loop(sprite, restore);
        });
    }

    private flash(x: number, y: number, color: number): void {
        const flash = this.scene.add.circle(x, y, 7, color, 0.88).setDepth(100);
        this.scene.tweens.add({ targets: flash, alpha: 0, scale: 2.1,
            duration: 160, onComplete: () => flash.destroy() });
    }

    private ring(x: number, y: number, color: number, size = 34): void {
        const circle = this.scene.add.circle(x, y, size / 2, color, 0)
            .setStrokeStyle(2, color, 0.95).setDepth(95);
        this.scene.tweens.add({ targets: circle, scale: 2.4, alpha: 0,
            duration: 510, onComplete: () => circle.destroy() });
    }

    private sparks(x: number, y: number, count: number, color: number): void {
        for (let n = 0; n < count; n++) {
            const a = 2 * Math.PI * n / count, distance = Phaser.Math.Between(14, 40);
            const spark = this.scene.add.circle(x, y, Phaser.Math.Between(2, 4), color, 0.9).setDepth(100);
            this.scene.tweens.add({ targets: spark, x: x + distance * Math.cos(a),
                y: y + distance * Math.sin(a), alpha: 0, scale: 0.1,
                duration: Phaser.Math.Between(300, 550), onComplete: () => spark.destroy() });
        }
    }

    private effect(x: number, y: number, frame: number, size: number): void {
        if (!this.scene.textures.exists("surge_fx")) {
            this.ring(x, y, 0xff8c43, size / 2); return;
        }
        const fx = this.scene.add.image(x, y, "surge_fx", frame)
            .setDisplaySize(size, size).setDepth(100);
        this.scene.tweens.add({ targets: fx, alpha: 0, scaleX: fx.scaleX * 1.7,
            scaleY: fx.scaleY * 1.7, duration: 400, onComplete: () => fx.destroy() });
    }

    destroy(): void {
        this.scene.events.off("projectile-created", this.friendlyShot, this);
        this.scene.events.off("enemy-projectile-created", this.enemyShot, this);
        this.scene.events.off("enemy-killed", this.enemyKilled, this);
        this.scene.events.off("landmine-detonated", this.mineDetonated, this);
        this.scene.events.off("surge-projectile-hit", this.projectileHit, this);
        this.scene.events.off("boss-shield-activated", this.shield, this);
        this.scene.input.off("gameobjectdown", this.collect, this);
        this.units.clear();
        this.pickups.clear();
    }
}
