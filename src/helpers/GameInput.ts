import Phaser from "phaser";
import { DevMenu } from "../ui/DevMenu.ts";

export function setupGameInput(
    scene: Phaser.Scene,
    onGridClick: (pointer: Phaser.Input.Pointer) => void,
    onPointerMove: (pointer: Phaser.Input.Pointer) => void,
    onPointerUp: (pointer: Phaser.Input.Pointer) => void
): void {
    const devMenu = new DevMenu(scene, (level: number) => {
        scene.scene.restart({ level });
    });

    const toggleDevMenu = () => {
        devMenu.toggle();
    };

    scene.input.keyboard?.on("keydown-F2", toggleDevMenu);
    scene.input.on("pointerdown", onGridClick);
    scene.input.on("pointermove", onPointerMove);
    scene.input.on("pointerup", onPointerUp);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        scene.input.keyboard?.off("keydown-F2", toggleDevMenu);
        scene.input.off("pointerdown", onGridClick);
        scene.input.off("pointermove", onPointerMove);
        scene.input.off("pointerup", onPointerUp);
    });
}