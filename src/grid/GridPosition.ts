import { CELL_HEIGHT, CELL_WIDTH, GRID_X, GRID_Y } from "../constants.ts";

export function getGridPosition(x: number, y: number): { row: number; col: number } {
    const row = Math.floor((y - GRID_Y) / CELL_HEIGHT);
    const col = Math.floor((x - GRID_X) / CELL_WIDTH);
    return { row, col };
}

export function getCellCenter(row: number, col: number): { x: number; y: number } {
    const x = GRID_X + col * CELL_WIDTH + CELL_WIDTH / 2;
    const y = getRowCenterY(row);
    return { x, y };
}

export function getRowCenterY(row: number): number {
    return GRID_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;
}
