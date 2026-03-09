// =============================================
// PIXEL ART SPRITE DATA
// All sprites defined as 2D pixel arrays
// Each pixel = hex color string or null (transparent)
// =============================================

const _ = null; // transparent

// ---- ISOMETRIC FLOOR TILE (32x16) ----
export const TILE_W = 96;
export const TILE_H = 48;

// ---- COLOR PALETTES ----
export const PALETTE = {
    floor: { dark: '#1a1a2e', light: '#16213e', grid: '#0f3460', accent: '#533483' },
    wall: { main: '#2d2d44', dark: '#1e1e30', highlight: '#3f3f5c', glass: 'rgba(100,180,255,0.15)' },
    desk: { top: '#3a3a5c', leg: '#2a2a42', screen: '#0a0a1a', screenGlow: '#00ff88' },
    server: { rack: '#2a2a42', led_on: '#00ff41', led_off: '#1a1a2e', led_warn: '#ffaa00', led_err: '#ff4444' },
    coffee: { machine: '#4a4a6a', cup: '#f5f5dc', water: '#4488cc' },
    ui: { bubble_bg: '#1e1e30', bubble_border: '#533483', text: '#e0e0e0' },
};

// ---- ROBOT CHARACTER SPRITE (16x20 pixel grid, rendered at 2x) ----
// Directions: 'down-right' (default isometric), 'down-left', 'up-right', 'up-left'
// Frames: idle, typing, walking1, walking2

function createRobotFrames(bodyColor, accentColor, eyeColor) {
    const B = bodyColor;
    const A = accentColor;
    const E = eyeColor;
    const D = '#1a1a2e'; // dark
    const M = '#3a3a5c'; // metal
    const W = '#e0e0e0'; // white/light

    // Idle frame (facing down-right for isometric)
    const idle = [
        [_, _, _, _, _, D, D, D, D, D, D, _, _, _, _, _],
        [_, _, _, _, D, M, M, M, M, M, M, D, _, _, _, _],
        [_, _, _, D, M, M, M, M, M, M, M, M, D, _, _, _],
        [_, _, _, D, M, E, E, M, M, E, E, M, D, _, _, _],
        [_, _, _, D, M, E, W, M, M, E, W, M, D, _, _, _],
        [_, _, _, D, M, M, M, A, A, M, M, M, D, _, _, _],
        [_, _, _, _, D, M, M, M, M, M, M, D, _, _, _, _],
        [_, _, _, _, _, D, D, D, D, D, D, _, _, _, _, _],
        [_, _, _, _, D, B, B, B, B, B, B, D, _, _, _, _],
        [_, _, _, D, B, B, B, B, B, B, B, B, D, _, _, _],
        [_, _, D, B, B, B, A, A, A, A, B, B, B, D, _, _],
        [_, _, D, B, B, B, A, A, A, A, B, B, B, D, _, _],
        [_, _, D, B, B, B, B, B, B, B, B, B, B, D, _, _],
        [_, _, _, D, B, B, B, B, B, B, B, B, D, _, _, _],
        [_, _, _, D, B, B, B, B, B, B, B, B, D, _, _, _],
        [_, _, _, D, D, D, D, _, _, D, D, D, D, _, _, _],
        [_, _, _, D, M, M, D, _, _, D, M, M, D, _, _, _],
        [_, _, D, D, M, M, D, _, _, D, M, M, D, D, _, _],
        [_, _, D, D, D, D, D, _, _, D, D, D, D, D, _, _],
    ];

    // Typing frame (arms forward)
    const typing = [
        [_, _, _, _, _, D, D, D, D, D, D, _, _, _, _, _],
        [_, _, _, _, D, M, M, M, M, M, M, D, _, _, _, _],
        [_, _, _, D, M, M, M, M, M, M, M, M, D, _, _, _],
        [_, _, _, D, M, E, E, M, M, E, E, M, D, _, _, _],
        [_, _, _, D, M, E, W, M, M, E, W, M, D, _, _, _],
        [_, _, _, D, M, M, M, A, A, M, M, M, D, _, _, _],
        [_, _, _, _, D, M, M, M, M, M, M, D, _, _, _, _],
        [_, _, _, _, _, D, D, D, D, D, D, _, _, _, _, _],
        [_, _, _, _, D, B, B, B, B, B, B, D, _, _, _, _],
        [_, _, _, D, B, B, B, B, B, B, B, B, D, _, _, _],
        [_, D, D, B, B, B, A, A, A, A, B, B, B, D, D, _],
        [D, M, D, B, B, B, A, A, A, A, B, B, B, D, M, D],
        [D, M, D, B, B, B, B, B, B, B, B, B, B, D, M, D],
        [_, D, _, D, B, B, B, B, B, B, B, B, D, _, D, _],
        [_, _, _, D, B, B, B, B, B, B, B, B, D, _, _, _],
        [_, _, _, D, D, D, D, _, _, D, D, D, D, _, _, _],
        [_, _, _, D, M, M, D, _, _, D, M, M, D, _, _, _],
        [_, _, D, D, M, M, D, _, _, D, M, M, D, D, _, _],
        [_, _, D, D, D, D, D, _, _, D, D, D, D, D, _, _],
    ];

    // Walking frame 1 (left leg forward)
    const walk1 = [
        [_, _, _, _, _, D, D, D, D, D, D, _, _, _, _, _],
        [_, _, _, _, D, M, M, M, M, M, M, D, _, _, _, _],
        [_, _, _, D, M, M, M, M, M, M, M, M, D, _, _, _],
        [_, _, _, D, M, E, E, M, M, E, E, M, D, _, _, _],
        [_, _, _, D, M, E, W, M, M, E, W, M, D, _, _, _],
        [_, _, _, D, M, M, M, A, A, M, M, M, D, _, _, _],
        [_, _, _, _, D, M, M, M, M, M, M, D, _, _, _, _],
        [_, _, _, _, _, D, D, D, D, D, D, _, _, _, _, _],
        [_, _, _, _, D, B, B, B, B, B, B, D, _, _, _, _],
        [_, _, _, D, B, B, B, B, B, B, B, B, D, _, _, _],
        [_, _, D, B, B, B, A, A, A, A, B, B, B, D, _, _],
        [_, _, D, B, B, B, A, A, A, A, B, B, B, D, _, _],
        [_, _, D, B, B, B, B, B, B, B, B, B, B, D, _, _],
        [_, _, _, D, B, B, B, B, B, B, B, B, D, _, _, _],
        [_, _, _, D, B, B, B, B, B, B, B, B, D, _, _, _],
        [_, _, D, D, D, D, _, _, _, _, D, D, D, D, _, _],
        [_, D, M, M, D, _, _, _, _, _, _, D, M, D, _, _],
        [_, D, M, M, D, _, _, _, _, _, _, D, M, D, _, _],
        [_, D, D, D, D, _, _, _, _, _, D, D, D, D, _, _],
    ];

    // Walking frame 2 (right leg forward)
    const walk2 = [
        [_, _, _, _, _, D, D, D, D, D, D, _, _, _, _, _],
        [_, _, _, _, D, M, M, M, M, M, M, D, _, _, _, _],
        [_, _, _, D, M, M, M, M, M, M, M, M, D, _, _, _],
        [_, _, _, D, M, E, E, M, M, E, E, M, D, _, _, _],
        [_, _, _, D, M, E, W, M, M, E, W, M, D, _, _, _],
        [_, _, _, D, M, M, M, A, A, M, M, M, D, _, _, _],
        [_, _, _, _, D, M, M, M, M, M, M, D, _, _, _, _],
        [_, _, _, _, _, D, D, D, D, D, D, _, _, _, _, _],
        [_, _, _, _, D, B, B, B, B, B, B, D, _, _, _, _],
        [_, _, _, D, B, B, B, B, B, B, B, B, D, _, _, _],
        [_, _, D, B, B, B, A, A, A, A, B, B, B, D, _, _],
        [_, _, D, B, B, B, A, A, A, A, B, B, B, D, _, _],
        [_, _, D, B, B, B, B, B, B, B, B, B, B, D, _, _],
        [_, _, _, D, B, B, B, B, B, B, B, B, D, _, _, _],
        [_, _, _, D, B, B, B, B, B, B, B, B, D, _, _, _],
        [_, _, _, D, D, D, _, _, _, _, D, D, D, D, _, _],
        [_, _, _, D, M, D, _, _, _, _, D, M, M, D, _, _],
        [_, _, _, D, M, D, _, _, _, _, D, M, M, D, _, _],
        [_, _, D, D, D, D, _, _, _, _, D, D, D, D, _, _],
    ];

    return { idle, typing, walk1, walk2 };
}

// Robot colors per employee (CG Production team)
export const ROBOT_COLORS = {
    cong: { body: '#8B5CF6', accent: '#C4B5FD', eye: '#06B6D4' },  // CEO - Purple
    quan: { body: '#06B6D4', accent: '#67E8F9', eye: '#F59E0B' },  // CG Lead - Cyan
    son: { body: '#10B981', accent: '#6EE7B7', eye: '#F59E0B' },  // 3D Artist - Green
    thinh: { body: '#F59E0B', accent: '#FDE68A', eye: '#8B5CF6' },  // 3D Artist - Yellow
    kiet: { body: '#EC4899', accent: '#F9A8D4', eye: '#06B6D4' },  // Bảo vệ - Pink
};

// Cache of generated sprite frames per employee
const spriteCache = {};

export function getRobotSprites(employeeId) {
    if (!spriteCache[employeeId]) {
        const colors = ROBOT_COLORS[employeeId];
        if (!colors) return null;
        spriteCache[employeeId] = createRobotFrames(colors.body, colors.accent, colors.eye);
    }
    return spriteCache[employeeId];
}

// ---- FURNITURE SPRITES ----

// Isometric desk (top-down view, ~24x20)
export const DESK_SPRITE = [
    [_, _, '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', _, _],
    [_, '#4a4a6a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#4a4a6a', _],
    ['#3a3a5c', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#3a3a5c'],
    ['#3a3a5c', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#3a3a5c'],
    ['#2a2a42', _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, '#2a2a42'],
    ['#2a2a42', _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, '#2a2a42'],
    ['#2a2a42', _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, '#2a2a42'],
    ['#2a2a42', _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, '#2a2a42'],
];

// Monitor on desk (12x10)
export const MONITOR_SPRITE = [
    [_, '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', _],
    ['#1e1e30', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#1e1e30'],
    ['#1e1e30', '#0a0a14', '#00ff88', '#0a0a14', '#00ff88', '#00ff88', '#0a0a14', '#00ff88', '#0a0a14', '#00ff88', '#0a0a14', '#1e1e30'],
    ['#1e1e30', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#1e1e30'],
    ['#1e1e30', '#0a0a14', '#00ff88', '#00ff88', '#00ff88', '#0a0a14', '#00ff88', '#00ff88', '#0a0a14', '#0a0a14', '#0a0a14', '#1e1e30'],
    ['#1e1e30', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#0a0a14', '#1e1e30'],
    ['#1e1e30', '#0a0a14', '#00ff88', '#0a0a14', '#00ff88', '#00ff88', '#00ff88', '#0a0a14', '#00ff88', '#0a0a14', '#0a0a14', '#1e1e30'],
    [_, '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', _],
    [_, _, _, _, _, '#2a2a42', '#2a2a42', _, _, _, _, _],
    [_, _, _, _, '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', _, _, _, _],
];

// Chair (8x8)
export const CHAIR_SPRITE = [
    [_, _, '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', _, _],
    [_, '#3a3a5c', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#3a3a5c', _],
    [_, '#3a3a5c', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#3a3a5c', _],
    [_, '#3a3a5c', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#3a3a5c', _],
    [_, _, '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', _, _],
    [_, _, '#2a2a42', _, _, '#2a2a42', _, _],
    [_, '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', _],
    [_, '#2a2a42', _, _, _, _, '#2a2a42', _],
];

// Server rack (10x20)
export const SERVER_SPRITE = [
    ['#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42'],
    ['#2a2a42', '#1e1e30', '#1e1e30', '#1e1e30', '#00ff41', '#00ff41', '#1e1e30', '#1e1e30', '#1e1e30', '#2a2a42'],
    ['#2a2a42', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#2a2a42'],
    ['#2a2a42', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#2a2a42'],
    ['#2a2a42', '#1e1e30', '#1e1e30', '#1e1e30', '#ffaa00', '#00ff41', '#1e1e30', '#1e1e30', '#1e1e30', '#2a2a42'],
    ['#2a2a42', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#2a2a42'],
    ['#2a2a42', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#2a2a42'],
    ['#2a2a42', '#1e1e30', '#1e1e30', '#1e1e30', '#00ff41', '#00ff41', '#1e1e30', '#1e1e30', '#1e1e30', '#2a2a42'],
    ['#2a2a42', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#2a2a42'],
    ['#2a2a42', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#2a2a42'],
    ['#2a2a42', '#1e1e30', '#1e1e30', '#1e1e30', '#ff4444', '#00ff41', '#1e1e30', '#1e1e30', '#1e1e30', '#2a2a42'],
    ['#2a2a42', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#2a2a42'],
    ['#2a2a42', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#2a2a42'],
    ['#2a2a42', '#1e1e30', '#1e1e30', '#1e1e30', '#00ff41', '#00ff41', '#1e1e30', '#1e1e30', '#1e1e30', '#2a2a42'],
    ['#2a2a42', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#1e1e30', '#2a2a42'],
    ['#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42', '#2a2a42'],
    ['#2a2a42', _, _, _, _, _, _, _, _, '#2a2a42'],
    ['#2a2a42', _, _, _, _, _, _, _, _, '#2a2a42'],
];

// Coffee machine (8x14)
export const COFFEE_SPRITE = [
    [_, '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', _],
    ['#4a4a6a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#4a4a6a'],
    ['#4a4a6a', '#5a5a7a', '#00ff41', '#5a5a7a', '#5a5a7a', '#ff4444', '#5a5a7a', '#4a4a6a'],
    ['#4a4a6a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#5a5a7a', '#4a4a6a'],
    ['#4a4a6a', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#4a4a6a'],
    ['#4a4a6a', _, _, '#6B4423', '#6B4423', _, _, '#4a4a6a'],
    ['#4a4a6a', _, _, '#6B4423', '#6B4423', _, _, '#4a4a6a'],
    ['#4a4a6a', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#3a3a5c', '#4a4a6a'],
    ['#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a', '#4a4a6a'],
    [_, '#2a2a42', _, _, _, _, '#2a2a42', _],
    [_, '#2a2a42', _, _, _, _, '#2a2a42', _],
];

// Plant pot (6x10)
export const PLANT_SPRITE = [
    [_, _, '#10B981', _, '#10B981', _],
    [_, '#10B981', '#10B981', '#10B981', '#10B981', _],
    ['#10B981', '#10B981', '#10B981', '#10B981', '#10B981', '#10B981'],
    [_, '#10B981', '#10B981', '#10B981', '#10B981', _],
    [_, _, '#10B981', '#10B981', _, _],
    [_, '#6B4423', '#6B4423', '#6B4423', '#6B4423', _],
    ['#6B4423', '#8B5E3C', '#8B5E3C', '#8B5E3C', '#8B5E3C', '#6B4423'],
    ['#6B4423', '#8B5E3C', '#8B5E3C', '#8B5E3C', '#8B5E3C', '#6B4423'],
    [_, '#6B4423', '#6B4423', '#6B4423', '#6B4423', _],
];

// ---- UTILITY: Render sprite to offscreen canvas ----
export function renderSpriteToCanvas(spriteData, scale = 2) {
    const rows = spriteData.length;
    const cols = spriteData[0].length;
    const canvas = document.createElement('canvas');
    canvas.width = cols * scale;
    canvas.height = rows * scale;
    const ctx = canvas.getContext('2d');

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const color = spriteData[y][x];
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }
    }
    return canvas;
}
