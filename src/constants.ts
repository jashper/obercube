enum COLORS {
    TAN = 0xFFEE99,
    LAVENDER = 0xFF80F4,
    WHITE = 0xFFFFFF,
    RADICAL_RED = 0xF92672,
    LIGHT_BLUE = 0x66D9EF,
    LIME_GREEN = 0xA6E22E,
    ORANGE = 0xFD971F,
    SEAFOAM_GREEN = 0x08FDCC
}

// maps each available playerId to a unique color to represent the player's drawables
const COLOR_MAP = new Map<number, number>();
Object.keys(COLORS)
    .map(k => COLORS[k as any])
    .filter(v => (typeof v === 'number'))
    .forEach((value, idx) => {
        COLOR_MAP.set(idx + 1, value as any);
    });

const GAME_TICK_DELTA = (1 / 60) * 1000; // milliseconds

// convert time in milliseconds to an equivalent amount of ticks
function DeltaToTicks(delta: number) {
    return Math.round(delta / GAME_TICK_DELTA);
}

export default {
    BACKGROUND_COLOR: 0x0,
    COLORS,
    COLOR_MAP,
    DeltaToTicks,
    GAME_TICK_DELTA,
    OUTPOST_RADIUS: 20,
    OUTPOST_TEXT_BUFFER: 15,
    PAN_BOUNDARY_PIXELS: 50,

    ZOOM_PER_WHEEL: 0.01,
    ZOOM_MIN_SCALE: 0.3,
    ZOOM_MAX_SCALE: 8,
    PAN_RATE: 100,

    ORTHO_MIN_DEPTH: -20000,
    ORTHO_MAX_DEPTH: 20000,
    ORTHO_UNIT_SCALE: 300,
    ORTHO_DISTANCE: 100
};
