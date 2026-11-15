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
    },
     () => {scene.events.emit("dev-add-energy");} //add energy in dev menuy
    );

    const toggleDevMenu = () => {
        devMenu.toggle();
    };

    const handlePointerDown = (pointer: Phaser.Input.Pointer) => {
        devMenu.closeIfOutside(pointer);
        onGridClick(pointer);
    };

    scene.input.keyboard?.on("keydown-F2", toggleDevMenu);
    scene.input.on("pointerdown", handlePointerDown);
    scene.input.on("pointermove", onPointerMove);
    scene.input.on("pointerup", onPointerUp);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        scene.input.keyboard?.off("keydown-F2", toggleDevMenu);
        scene.input.off("pointerdown", handlePointerDown);
        scene.input.off("pointermove", onPointerMove);
        scene.input.off("pointerup", onPointerUp);
    });
}