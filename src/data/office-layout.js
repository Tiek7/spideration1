// =============================================
// CG PRODUCTION OFFICE LAYOUT
// Expanded 14x11 grid — cyberpunk isometric room
// 5 desks: CEO, CG Lead, 2 3D Artists, AI Gen
// =============================================

export const TILE = {
    EMPTY: 0,
    FLOOR: 1,
    DESK: 2,
    MEETING_FLOOR: 3,
    MEETING_WALL: 4,
    SERVER: 5,
    COFFEE: 6,
    PLANT: 7,
    BREAK_FLOOR: 8,
    CABINET: 9,
    WHITEBOARD: 10,
};

export const GRID_COLS = 14;
export const GRID_ROWS = 11;

// Wall heights (in tile-heights) for the 3D room box
export const WALL_HEIGHT = 5;

export const OFFICE_GRID = [
    // 0  1  2  3  4  5  6  7  8  9 10 11 12 13
    [0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0],  // Row 0: meeting room
    [0, 0, 3, 3, 3, 3, 0, 1, 1, 5, 5, 5, 5, 0],  // Row 1: meeting + servers
    [0, 2, 10, 1, 1, 1, 0, 1, 1, 5, 5, 5, 5, 0],  // Row 2: CEO desk + whiteboard + servers
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // Row 3: corridor
    [0, 7, 2, 1, 2, 1, 1, 2, 1, 2, 1, 9, 7, 0],  // Row 4: workstations
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // Row 5: corridor
    [0, 1, 2, 1, 1, 7, 1, 1, 7, 1, 2, 1, 1, 0],  // Row 6: extra workstations
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // Row 7: corridor
    [0, 7, 1, 1, 1, 1, 1, 1, 1, 8, 6, 8, 7, 0],  // Row 8: break area
    [0, 1, 1, 1, 1, 7, 1, 1, 1, 8, 7, 8, 1, 0],  // Row 9: bottom
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // Row 10: border
];

// Desk assignments — same 5 staff
export const DESK_ASSIGNMENTS = [
    { employeeId: 'cong', gridX: 1, gridY: 2, label: 'Công (CEO)' },
    { employeeId: 'quan', gridX: 2, gridY: 4, label: 'Quân (CG Lead)' },
    { employeeId: 'son', gridX: 4, gridY: 4, label: 'Sơn (3D Artist)' },
    { employeeId: 'thinh', gridX: 7, gridY: 4, label: 'Thịnh (3D Artist)' },
    { employeeId: 'kiet', gridX: 9, gridY: 4, label: 'Kiệt (Bảo vệ)' },
];

export const AREAS = {
    meeting: { gridX: 3.5, gridY: 1, label: 'Phòng họp' },
    break: { gridX: 10, gridY: 8.5, label: 'Khu nghỉ' },
    server: { gridX: 10.5, gridY: 1.5, label: 'Server/Render Farm' },
};

export const MEETING_WALLS = [
    { from: { x: 2, y: 0 }, to: { x: 2, y: 3 }, type: 'glass' },
    { from: { x: 2, y: 0 }, to: { x: 6, y: 0 }, type: 'glass' },
    { from: { x: 6, y: 0 }, to: { x: 6, y: 3 }, type: 'glass' },
    { from: { x: 2, y: 3 }, to: { x: 4, y: 3 }, type: 'glass' },
    { from: { x: 5, y: 3 }, to: { x: 6, y: 3 }, type: 'glass' },
];
