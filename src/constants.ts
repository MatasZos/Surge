
export const GAME_WIDTH = 1400;
export const GAME_HEIGHT = 800;

// Width for toolbar
export const SIDEBAR_WIDTH = 200;

// Width battlefield
export const BATTLEFIELD_WIDTH = 1200;

export const GRID_ROWS = 5;
export const GRID_COLS = 7;

export const CELL_WIDTH = 107;
export const CELL_HEIGHT = 100;

export const GRID_X = 235 + SIDEBAR_WIDTH;
export const GRID_Y = 145;

export const DEFENDER_COSTS: Record<string, number> = {
    shooter: 100,
    generator: 50
};

//Defender placement cooldowns
export const DEFENDER_COOLDOWNS: Record<string, number>= {
    shooter: 7500,
    generator: 7500
}