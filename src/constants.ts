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

export default {
    BACKGROUND_COLOR: 0x222222,
    COLORS,
    COLOR_MAP,
    MIN_SCALE: 0.3,
    MAX_SCALE: 8,
    PAN_BOUNDARY_PIXELS: 75,
    ZOOM_FACTOR: 1.25
};
