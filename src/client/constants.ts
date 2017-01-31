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

let id = 0;
function generateId() {
    return ++id;
}

export default {
    BACKGROUND_COLOR: 0x222222,
    COLORS,
    generateId,
    MIN_SCALE: 0.3,
    MAX_SCALE: 8,
    PAN_BOUNDARY_RADIUS_PERCENT: 0.65,
    ZOOM_FACTOR: 1.25
};