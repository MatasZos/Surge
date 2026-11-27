import type { Defender } from "../../defenders/Defender.ts";
import type { Grid } from "../../grid/Grid.ts";

export function removeDefenderFromBoard(
    grid: Grid,
    defenders: Defender[],
    defender: Defender,
    row: number,
    col: number,
): void {
    grid.removeOccupant(row, col);
    const index = defenders.indexOf(defender);
    if (index !== -1) defenders.splice(index, 1);
}
