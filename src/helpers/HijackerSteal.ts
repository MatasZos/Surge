
import { HijackerEnemy } from "../enemies/HijackerEnemy.ts";
import { Defender } from "../defenders/Defender.ts";
import { Grid } from "../grid/Grid.ts";
import { GRID_ROWS } from "../constants.ts";

export function prepareHijackerSteal(
    hijacker: HijackerEnemy,
    target: Defender,
    defenders: Defender[],
    grid: Grid
): void {
    // Check that both units still exist
    if (!hijacker.active || !target.active) {
        return;
    }

    if (!defenders.includes(target)) {
        return;
    }

    hijacker.onGrabReady = (attacker: HijackerEnemy) => {
        // The defender might have been removed
        if (!attacker.active || !target.active) {
            attacker.cancelGrab();
            return;
        }

        if (!defenders.includes(target)) {
            attacker.cancelGrab();
            return;
        }

        const row = target.getData("gridRow") as number;
        const col = target.getData("gridCol") as number;

        // Check the defender's position
        if (!Number.isInteger(row) || !Number.isInteger(col) ||
            row < 0 || row >= GRID_ROWS ||
            col < 0 || col >= grid.cols) {
            attacker.cancelGrab();
            return;
        }

        // Remove the stolen defender
        const index = defenders.indexOf(target);
        defenders.splice(index, 1);

        grid.removeOccupant(row, col);
        target.destroy();

        attacker.beginEscape();
    };

    hijacker.startDescent(target.x, target.y);
}
