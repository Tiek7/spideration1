// =============================================
// ISOMETRIC PIXEL RENDERER — CYBERPUNK STYLE
// 3D room box with walls, raised floor, detailed furniture
// =============================================

import {
    TILE_W, TILE_H, getRobotSprites, renderSpriteToCanvas, ROBOT_COLORS,
    PALETTE
} from '../data/sprites.js';
import {
    OFFICE_GRID, GRID_COLS, GRID_ROWS, TILE, DESK_ASSIGNMENTS,
    AREAS, MEETING_WALLS, WALL_HEIGHT
} from '../data/office-layout.js';

const SPRITE_SCALE = 3;

// Wall height in pixels
const WALL_PX = WALL_HEIGHT * TILE_H;

// Colors for the room
const WALL_COLOR = {
    backLeft: '#2a2040',
    backLeftDk: '#1e1830',
    backRight: '#352a50',
    backRightDk: '#251a3a',
    floorSide: '#18122a',
    floorEdge: '#2a2040',
    panelLight: '#3a2f55',
    panelDark: '#1e1830',
    windowGlow: 'rgba(6, 182, 212, 0.15)',
    windowFrame: '#4a3f6a',
};

export class PixelRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        // Camera
        this.camera = { x: 0, y: 0, zoom: 1 };

        // Agents state
        this.agents = {};

        // Chat bubbles
        this.chatBubbles = [];

        // Sprite caches
        this._spriteCache = {};

        // Animation
        this.frameCount = 0;
        this.time = 0;

        // Interaction
        this.hoveredAgent = null;
        this.selectedAgent = null;

        // Pre-render static sprites
        this._initSpriteCaches();

        // Resize
        this._resize();
        window.addEventListener('resize', () => this._resize());

        // Mouse interaction
        this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
        this.canvas.addEventListener('click', (e) => this._onClick(e));
    }

    _resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.imageSmoothingEnabled = false;

        // Center the office (account for walls above)
        const officePixelW = (GRID_COLS + GRID_ROWS) * TILE_W / 2;
        const officePixelH = (GRID_COLS + GRID_ROWS) * TILE_H / 2;
        this.camera.x = (this.canvas.width - officePixelW) / 2 + GRID_ROWS * TILE_W / 2;
        this.camera.y = (this.canvas.height - officePixelH) / 2 + WALL_PX * 0.5 + 40;
    }

    _initSpriteCaches() {
        // Pre-render robot sprites for each employee
        this._spriteCache.robots = {};
        for (const [id, colors] of Object.entries(ROBOT_COLORS)) {
            const frames = getRobotSprites(id);
            this._spriteCache.robots[id] = {
                idle: renderSpriteToCanvas(frames.idle, SPRITE_SCALE),
                typing: renderSpriteToCanvas(frames.typing, SPRITE_SCALE),
                walk1: renderSpriteToCanvas(frames.walk1, SPRITE_SCALE),
                walk2: renderSpriteToCanvas(frames.walk2, SPRITE_SCALE),
            };
        }
    }

    // ---- Coordinate transforms ----
    gridToScreen(gx, gy) {
        const sx = (gx - gy) * (TILE_W / 2) + this.camera.x;
        const sy = (gx + gy) * (TILE_H / 2) + this.camera.y;
        return { x: sx, y: sy };
    }

    screenToGrid(sx, sy) {
        const rx = sx - this.camera.x;
        const ry = sy - this.camera.y;
        const gx = (rx / (TILE_W / 2) + ry / (TILE_H / 2)) / 2;
        const gy = (ry / (TILE_H / 2) - rx / (TILE_W / 2)) / 2;
        return { x: gx, y: gy };
    }

    // ---- Initialize agents from employee data ----
    initAgents(employees) {
        employees.forEach(emp => {
            const desk = DESK_ASSIGNMENTS.find(d => d.employeeId === emp.id);
            if (desk) {
                this.agents[emp.id] = {
                    ...emp,
                    gridX: desk.gridX,
                    gridY: desk.gridY,
                    targetX: desk.gridX,
                    targetY: desk.gridY,
                    deskX: desk.gridX,
                    deskY: desk.gridY,
                    animState: 'idle',
                    animFrame: 0,
                    animTimer: 0,
                    moving: false,
                    moveProgress: 0,
                    startX: desk.gridX,
                    startY: desk.gridY,
                };
            }
        });
    }

    // ---- Update agent status ----
    updateAgentStatus(employeeId, status) {
        const agent = this.agents[employeeId];
        if (!agent) return;

        agent.status = status;
        const desk = DESK_ASSIGNMENTS.find(d => d.employeeId === employeeId);

        switch (status) {
            case 'meeting':
                this._moveAgentTo(employeeId, AREAS.meeting.gridX + (Math.random() - 0.5), AREAS.meeting.gridY + (Math.random() - 0.5));
                break;
            case 'break':
                this._moveAgentTo(employeeId, AREAS.break.gridX + (Math.random() - 0.5) * 0.8, AREAS.break.gridY + (Math.random() - 0.5) * 0.8);
                break;
            case 'deploying':
                this._moveAgentTo(employeeId, AREAS.server.gridX + (Math.random() - 0.5), AREAS.server.gridY + (Math.random() - 0.5));
                break;
            case 'coding':
            case 'working':
            case 'reviewing':
            case 'thinking':
            default:
                if (desk) {
                    this._moveAgentTo(employeeId, desk.gridX, desk.gridY);
                }
                agent.animState = status === 'coding' ? 'typing' : 'idle';
                break;
        }
    }

    _moveAgentTo(employeeId, targetX, targetY) {
        const agent = this.agents[employeeId];
        if (!agent) return;

        const dx = targetX - agent.gridX;
        const dy = targetY - agent.gridY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.2) {
            agent.animState = agent.status === 'coding' ? 'typing' : 'idle';
            return;
        }

        agent.startX = agent.gridX;
        agent.startY = agent.gridY;
        agent.targetX = targetX;
        agent.targetY = targetY;
        agent.moving = true;
        agent.moveProgress = 0;
        agent.animState = 'walking';
    }

    // ---- Add chat bubble ----
    addChatBubble(employeeId, text) {
        this.chatBubbles = this.chatBubbles.filter(b => b.employeeId !== employeeId);

        this.chatBubbles.push({
            employeeId,
            text: text.length > 50 ? text.substring(0, 47) + '...' : text,
            life: 300,
            maxLife: 300,
        });
    }

    // ---- Add typing indicator ----
    addTypingIndicator(employeeId) {
        const agent = this.agents[employeeId];
        if (agent && !agent.moving) {
            agent.animState = 'typing';
            setTimeout(() => {
                if (agent.animState === 'typing' && agent.status !== 'coding') {
                    agent.animState = 'idle';
                }
            }, 3000);
        }
    }

    // ---- Mouse handling ----
    _onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        this.hoveredAgent = null;
        for (const [id, agent] of Object.entries(this.agents)) {
            const screenPos = this.gridToScreen(agent.gridX, agent.gridY);
            const dx = mx - screenPos.x;
            const dy = my - (screenPos.y - 30);
            if (Math.abs(dx) < 30 && Math.abs(dy) < 38) {
                this.hoveredAgent = id;
                this.canvas.style.cursor = 'pointer';
                break;
            }
        }
        if (!this.hoveredAgent) {
            this.canvas.style.cursor = 'default';
        }
    }

    _onClick(e) {
        if (this.hoveredAgent) {
            this.selectedAgent = this.selectedAgent === this.hoveredAgent ? null : this.hoveredAgent;
            if (this.onAgentSelect) {
                this.onAgentSelect(this.selectedAgent ? this.agents[this.selectedAgent] : null);
            }
        } else {
            this.selectedAgent = null;
            if (this.onAgentSelect) this.onAgentSelect(null);
        }
    }

    // ---- Main update & render loop ----
    update(dt) {
        this.frameCount++;
        this.time += dt;

        for (const agent of Object.values(this.agents)) {
            if (agent.moving) {
                agent.moveProgress += dt * 1.5;
                if (agent.moveProgress >= 1) {
                    agent.gridX = agent.targetX;
                    agent.gridY = agent.targetY;
                    agent.moving = false;
                    agent.moveProgress = 0;
                    agent.animState = agent.status === 'coding' ? 'typing' : 'idle';
                } else {
                    agent.gridX = agent.startX + (agent.targetX - agent.startX) * agent.moveProgress;
                    agent.gridY = agent.startY + (agent.targetY - agent.startY) * agent.moveProgress;
                    agent.animFrame = Math.floor(this.time * 4) % 2;
                }
            } else {
                if (agent.animState === 'typing') {
                    agent.animFrame = Math.floor(this.time * 3) % 2;
                }
            }
        }

        this.chatBubbles = this.chatBubbles.filter(b => {
            b.life--;
            return b.life > 0;
        });
    }

    render() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;

        // Clear
        ctx.fillStyle = '#08060e';
        ctx.fillRect(0, 0, W, H);

        // Ambient particles
        this._drawAmbient(ctx, W, H);

        // ======= DRAW 3D ROOM BOX =======
        this._drawRoomBox(ctx);

        // ======= DRAW FLOOR TILES + FURNITURE + AGENTS =======
        const renderList = [];

        // Floor tiles + furniture
        for (let gy = 0; gy < GRID_ROWS; gy++) {
            for (let gx = 0; gx < GRID_COLS; gx++) {
                const tile = OFFICE_GRID[gy]?.[gx] || 0;
                if (tile === TILE.EMPTY) continue;

                const screen = this.gridToScreen(gx, gy);
                const sortY = gx + gy;

                // Floor
                renderList.push({ type: 'floor', gx, gy, screen, sortY: sortY - 0.5, tile });

                // Furniture
                if (tile === TILE.DESK) {
                    renderList.push({ type: 'desk', gx, gy, screen, sortY });
                } else if (tile === TILE.SERVER) {
                    renderList.push({ type: 'server', gx, gy, screen, sortY });
                } else if (tile === TILE.COFFEE) {
                    renderList.push({ type: 'coffee', gx, gy, screen, sortY });
                } else if (tile === TILE.PLANT) {
                    renderList.push({ type: 'plant', gx, gy, screen, sortY });
                } else if (tile === TILE.CABINET) {
                    renderList.push({ type: 'cabinet', gx, gy, screen, sortY });
                } else if (tile === TILE.WHITEBOARD) {
                    renderList.push({ type: 'whiteboard', gx, gy, screen, sortY });
                }
            }
        }

        // Meeting room glass
        renderList.push({ type: 'glass_walls', sortY: 2 });

        // Agents
        for (const [id, agent] of Object.entries(this.agents)) {
            const screen = this.gridToScreen(agent.gridX, agent.gridY);
            const sortY = agent.gridX + agent.gridY;
            renderList.push({ type: 'agent', id, agent, screen, sortY });
        }

        // Sort by depth
        renderList.sort((a, b) => a.sortY - b.sortY);

        // Render
        for (const item of renderList) {
            switch (item.type) {
                case 'floor': this._drawFloorTile(ctx, item.screen.x, item.screen.y, item.tile); break;
                case 'desk': this._drawDesk(ctx, item.screen.x, item.screen.y, item.gx, item.gy); break;
                case 'server': this._drawServer(ctx, item.screen.x, item.screen.y, item.gx, item.gy); break;
                case 'coffee': this._drawCoffee(ctx, item.screen.x, item.screen.y); break;
                case 'plant': this._drawPlant(ctx, item.screen.x, item.screen.y); break;
                case 'cabinet': this._drawCabinet(ctx, item.screen.x, item.screen.y); break;
                case 'whiteboard': this._drawWhiteboard(ctx, item.screen.x, item.screen.y); break;
                case 'glass_walls': this._drawMeetingRoom(ctx); break;
                case 'agent': this._drawAgent(ctx, item.id, item.agent, item.screen.x, item.screen.y); break;
            }
        }

        // Chat bubbles on top
        for (const bubble of this.chatBubbles) {
            this._drawChatBubble(ctx, bubble);
        }

        // Agent labels
        if (this.hoveredAgent || this.selectedAgent) {
            const agentId = this.selectedAgent || this.hoveredAgent;
            const agent = this.agents[agentId];
            if (agent) this._drawAgentLabel(ctx, agent);
        }
    }

    // ======= 3D ROOM BOX =======
    _drawRoomBox(ctx) {
        const hw = TILE_W / 2;
        const hh = TILE_H / 2;

        // Get corner positions of the floor
        const topCorner = this.gridToScreen(0, 0);       // top corner (back)
        const leftCorner = this.gridToScreen(0, GRID_ROWS); // left corner
        const rightCorner = this.gridToScreen(GRID_COLS, 0); // right corner
        const bottomCorner = this.gridToScreen(GRID_COLS, GRID_ROWS); // front corner

        // -- BACK-LEFT WALL (extends upward from top-left edge) --
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(topCorner.x, topCorner.y + hh);
        ctx.lineTo(topCorner.x, topCorner.y + hh - WALL_PX);
        ctx.lineTo(leftCorner.x, leftCorner.y + hh - WALL_PX);
        ctx.lineTo(leftCorner.x, leftCorner.y + hh);
        ctx.closePath();

        const gradLeft = ctx.createLinearGradient(topCorner.x, topCorner.y, leftCorner.x, leftCorner.y);
        gradLeft.addColorStop(0, '#2d2548');
        gradLeft.addColorStop(0.5, '#231e3a');
        gradLeft.addColorStop(1, '#1a1528');
        ctx.fillStyle = gradLeft;
        ctx.fill();

        // Wall panels / details on back-left wall
        this._drawWallPanels(ctx, topCorner, leftCorner, 'left');
        ctx.restore();

        // -- BACK-RIGHT WALL (extends upward from top-right edge) --
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(topCorner.x, topCorner.y + hh);
        ctx.lineTo(topCorner.x, topCorner.y + hh - WALL_PX);
        ctx.lineTo(rightCorner.x, rightCorner.y + hh - WALL_PX);
        ctx.lineTo(rightCorner.x, rightCorner.y + hh);
        ctx.closePath();

        const gradRight = ctx.createLinearGradient(topCorner.x, topCorner.y, rightCorner.x, rightCorner.y);
        gradRight.addColorStop(0, '#362b55');
        gradRight.addColorStop(0.5, '#2a2042');
        gradRight.addColorStop(1, '#201838');
        ctx.fillStyle = gradRight;
        ctx.fill();

        // Wall panels on back-right wall
        this._drawWallPanels(ctx, topCorner, rightCorner, 'right');
        ctx.restore();

        // -- WALL EDGE LINE at top (roof line) --
        ctx.beginPath();
        ctx.moveTo(leftCorner.x, leftCorner.y + hh - WALL_PX);
        ctx.lineTo(topCorner.x, topCorner.y + hh - WALL_PX);
        ctx.lineTo(rightCorner.x, rightCorner.y + hh - WALL_PX);
        ctx.strokeStyle = '#4a3f6a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Corner highlight
        ctx.beginPath();
        ctx.moveTo(topCorner.x, topCorner.y + hh);
        ctx.lineTo(topCorner.x, topCorner.y + hh - WALL_PX);
        ctx.strokeStyle = '#5a4f7a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // -- FLOOR SIDE (left edge depth) --
        ctx.beginPath();
        ctx.moveTo(leftCorner.x, leftCorner.y + hh);
        ctx.lineTo(leftCorner.x, leftCorner.y + hh + 14);
        ctx.lineTo(bottomCorner.x, bottomCorner.y + hh + 14);
        ctx.lineTo(bottomCorner.x, bottomCorner.y + hh);
        ctx.closePath();
        ctx.fillStyle = '#14102a';
        ctx.fill();

        // -- FLOOR SIDE (right edge depth) --
        ctx.beginPath();
        ctx.moveTo(rightCorner.x, rightCorner.y + hh);
        ctx.lineTo(rightCorner.x, rightCorner.y + hh + 14);
        ctx.lineTo(bottomCorner.x, bottomCorner.y + hh + 14);
        ctx.lineTo(bottomCorner.x, bottomCorner.y + hh);
        ctx.closePath();
        ctx.fillStyle = '#1a1530';
        ctx.fill();
    }

    _drawWallPanels(ctx, from, to, side) {
        const hh = TILE_H / 2;
        const segments = 6;
        const panelStart = from.y + hh - WALL_PX + 15;
        const panelEnd = from.y + hh - 15;
        const panelH = (panelEnd - panelStart);

        for (let i = 0; i < segments; i++) {
            const t = (i + 0.5) / segments;
            const px = from.x + (to.x - from.x) * t;
            const py = from.y + (to.y - from.y) * t;
            const pw = (to.x - from.x) / segments * 0.6;

            // Wall panel (indented dark rectangle)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            const panelX = px - Math.abs(pw) / 2;
            ctx.fillRect(panelX, panelStart + py - from.y, Math.abs(pw), panelH * 0.7);

            // Occasional glowing screen/window
            if (i % 2 === 0) {
                const screenH = panelH * 0.3;
                const screenY = panelStart + py - from.y + panelH * 0.1;
                ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
                ctx.fillRect(panelX + 4, screenY, Math.abs(pw) - 8, screenH);

                // Screen border
                ctx.strokeStyle = '#4a3f6a';
                ctx.lineWidth = 1;
                ctx.strokeRect(panelX + 4, screenY, Math.abs(pw) - 8, screenH);

                // Animated scan line
                const scanY = screenY + (Math.sin(this.time * 0.8 + i) * 0.5 + 0.5) * screenH;
                ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
                ctx.fillRect(panelX + 5, scanY, Math.abs(pw) - 10, 2);
            }
        }

        // Bottom trim
        const trimY = from.y + hh - 4;
        ctx.beginPath();
        ctx.moveTo(from.x, trimY);
        ctx.lineTo(to.x, trimY + (to.y - from.y));
        ctx.strokeStyle = '#4a3f6a';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // ======= DRAWING FUNCTIONS =======

    _drawAmbient(ctx, W, H) {
        // Floating particles
        const seed = 12345;
        for (let i = 0; i < 80; i++) {
            const x = ((seed * (i + 1) * 7919) % W);
            const y = ((seed * (i + 1) * 104729) % H);
            const alpha = 0.05 + (Math.sin(this.time * 0.3 + i) * 0.5 + 0.5) * 0.15;
            const size = 1 + (i % 3);
            ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
        }
    }

    _drawFloorTile(ctx, sx, sy, tileType) {
        const hw = TILE_W / 2;
        const hh = TILE_H / 2;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + hw, sy + hh);
        ctx.lineTo(sx, sy + TILE_H);
        ctx.lineTo(sx - hw, sy + hh);
        ctx.closePath();

        switch (tileType) {
            case TILE.MEETING_FLOOR:
                ctx.fillStyle = '#181430';
                break;
            case TILE.BREAK_FLOOR:
                ctx.fillStyle = '#1e1428';
                break;
            default:
                ctx.fillStyle = '#141228';
                break;
        }
        ctx.fill();

        // Grid line — brighter for cyberpunk
        ctx.strokeStyle = 'rgba(100, 60, 180, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    _drawDesk(ctx, sx, sy, gx, gy) {
        const hw = TILE_W / 2;
        const hh = TILE_H / 2;

        // Desk body (isometric box)
        const deskH = 18;
        const deskW = hw * 0.75;

        // Top surface
        ctx.beginPath();
        ctx.moveTo(sx, sy - deskH);
        ctx.lineTo(sx + deskW, sy + hh * 0.6 - deskH);
        ctx.lineTo(sx, sy + hh * 1.2 - deskH);
        ctx.lineTo(sx - deskW, sy + hh * 0.6 - deskH);
        ctx.closePath();
        ctx.fillStyle = '#4a4270';
        ctx.fill();
        ctx.strokeStyle = '#5a5280';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Front face
        ctx.beginPath();
        ctx.moveTo(sx - deskW, sy + hh * 0.6 - deskH);
        ctx.lineTo(sx, sy + hh * 1.2 - deskH);
        ctx.lineTo(sx, sy + hh * 1.2);
        ctx.lineTo(sx - deskW, sy + hh * 0.6);
        ctx.closePath();
        ctx.fillStyle = '#3a3258';
        ctx.fill();

        // Side face
        ctx.beginPath();
        ctx.moveTo(sx, sy + hh * 1.2 - deskH);
        ctx.lineTo(sx + deskW, sy + hh * 0.6 - deskH);
        ctx.lineTo(sx + deskW, sy + hh * 0.6);
        ctx.lineTo(sx, sy + hh * 1.2);
        ctx.closePath();
        ctx.fillStyle = '#2e2848';
        ctx.fill();

        // Monitor on desk
        const monW = 22;
        const monH = 16;
        const monX = sx - 4;
        const monY = sy - deskH - monH - 4;

        // monitor back
        ctx.fillStyle = '#1e1830';
        ctx.fillRect(monX - monW / 2, monY, monW, monH);

        // Screen with dynamic color
        const screenColors = ['#00ff88', '#06B6D4', '#8B5CF6', '#F59E0B', '#EC4899'];
        const colorIdx = (gx + gy * 3) % screenColors.length;
        const screenColor = screenColors[colorIdx];

        ctx.fillStyle = '#0a0a14';
        ctx.fillRect(monX - monW / 2 + 2, monY + 2, monW - 4, monH - 4);

        // Code lines on screen
        const lineY = monY + 4;
        for (let l = 0; l < 3; l++) {
            const lw = 5 + ((gx * 3 + l * 7 + gy) % 8);
            ctx.fillStyle = screenColor;
            ctx.globalAlpha = 0.6 + Math.sin(this.time * 2 + l + gx) * 0.2;
            ctx.fillRect(monX - monW / 2 + 4, lineY + l * 3, lw, 1);
        }
        ctx.globalAlpha = 1;

        // Monitor glow
        ctx.save();
        ctx.shadowColor = screenColor;
        ctx.shadowBlur = 12;
        ctx.fillStyle = 'transparent';
        ctx.fillRect(monX - monW / 2, monY, monW, monH);
        ctx.restore();

        // Monitor stand
        ctx.fillStyle = '#2a2442';
        ctx.fillRect(monX - 2, monY + monH, 4, 4);
        ctx.fillRect(monX - 5, monY + monH + 3, 10, 2);

        // Keyboard (small stripes)
        ctx.fillStyle = '#2a2442';
        ctx.fillRect(sx - 8, sy - deskH + 3, 14, 6);
        for (let k = 0; k < 3; k++) {
            ctx.fillStyle = '#3a3458';
            ctx.fillRect(sx - 6 + k * 4, sy - deskH + 4, 3, 1);
            ctx.fillRect(sx - 6 + k * 4, sy - deskH + 6, 3, 1);
        }

        // Chair (behind desk)
        this._drawChair(ctx, sx - deskW + 5, sy + hh * 0.3 + 4);
    }

    _drawChair(ctx, cx, cy) {
        // Chair seat (small isometric box)
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10);
        ctx.lineTo(cx + 10, cy - 5);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx - 10, cy - 5);
        ctx.closePath();
        ctx.fillStyle = '#3a3060';
        ctx.fill();

        // Chair back
        ctx.fillStyle = '#4a4075';
        ctx.fillRect(cx - 6, cy - 20, 12, 11);
        ctx.strokeStyle = '#5a5085';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 6, cy - 20, 12, 11);

        // Wheels (small dots)
        ctx.fillStyle = '#2a2442';
        ctx.fillRect(cx - 4, cy + 1, 2, 2);
        ctx.fillRect(cx + 2, cy + 1, 2, 2);
    }

    _drawServer(ctx, sx, sy, gx, gy) {
        const hw = TILE_W / 2;
        const hh = TILE_H / 2;

        // Tall server rack (isometric box)
        const rackH = 55;
        const rackW = hw * 0.5;

        // Front face
        ctx.beginPath();
        ctx.moveTo(sx - rackW, sy + hh * 0.4 - rackH);
        ctx.lineTo(sx, sy + hh * 0.8 - rackH);
        ctx.lineTo(sx, sy + hh * 0.8);
        ctx.lineTo(sx - rackW, sy + hh * 0.4);
        ctx.closePath();
        ctx.fillStyle = '#2a2545';
        ctx.fill();
        ctx.strokeStyle = '#3a3555';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Side face
        ctx.beginPath();
        ctx.moveTo(sx, sy + hh * 0.8 - rackH);
        ctx.lineTo(sx + rackW, sy + hh * 0.4 - rackH);
        ctx.lineTo(sx + rackW, sy + hh * 0.4);
        ctx.lineTo(sx, sy + hh * 0.8);
        ctx.closePath();
        ctx.fillStyle = '#201a3a';
        ctx.fill();

        // Top face
        ctx.beginPath();
        ctx.moveTo(sx, sy - rackH + hh * 0.1);
        ctx.lineTo(sx + rackW, sy + hh * 0.4 - rackH);
        ctx.lineTo(sx, sy + hh * 0.8 - rackH);
        ctx.lineTo(sx - rackW, sy + hh * 0.4 - rackH);
        ctx.closePath();
        ctx.fillStyle = '#3a3560';
        ctx.fill();

        // LED lights on front face (animated)
        const numLeds = 6;
        const ledStartY = sy + hh * 0.4 - rackH + 8;
        for (let i = 0; i < numLeds; i++) {
            const ly = ledStartY + i * 7;
            const lx = sx - rackW + 6;
            const ledOn = Math.sin(this.time * (2 + i * 0.7) + gx * 3 + gy * 5) > -0.3;
            const ledColor = i === 4 ? (ledOn ? '#ffaa00' : '#1e1830') : (ledOn ? '#00ff41' : '#1e1830');

            ctx.fillStyle = ledColor;
            ctx.fillRect(lx, ly, 3, 2);
            ctx.fillRect(lx + 5, ly, 3, 2);

            if (ledOn) {
                ctx.save();
                ctx.shadowColor = ledColor;
                ctx.shadowBlur = 4;
                ctx.fillRect(lx, ly, 3, 2);
                ctx.restore();
            }

            // Divider line
            ctx.fillStyle = '#3a3555';
            ctx.fillRect(sx - rackW + 3, ly + 4, rackW * 1.5, 1);
        }
    }

    _drawCoffee(ctx, sx, sy) {
        const hh = TILE_H / 2;

        // Water cooler body
        ctx.fillStyle = '#5a5a7a';
        ctx.fillRect(sx - 8, sy - 30 + hh, 16, 26);
        ctx.strokeStyle = '#6a6a8a';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx - 8, sy - 30 + hh, 16, 26);

        // Water tank (top)
        ctx.fillStyle = 'rgba(100, 180, 255, 0.3)';
        ctx.fillRect(sx - 6, sy - 42 + hh, 12, 14);
        ctx.strokeStyle = 'rgba(100, 180, 255, 0.5)';
        ctx.strokeRect(sx - 6, sy - 42 + hh, 12, 14);

        // Water shimmer
        const shimmer = Math.sin(this.time * 1.5) * 2;
        ctx.fillStyle = 'rgba(100, 180, 255, 0.2)';
        ctx.fillRect(sx - 4, sy - 38 + hh + shimmer, 8, 3);

        // Tap
        ctx.fillStyle = '#888';
        ctx.fillRect(sx - 2, sy - 5 + hh, 4, 3);
    }

    _drawPlant(ctx, sx, sy) {
        const hh = TILE_H / 2;
        const sway = Math.sin(this.time * 0.8) * 1.5;

        // Pot
        ctx.fillStyle = '#6B4423';
        ctx.fillRect(sx - 7, sy + hh - 10, 14, 10);
        ctx.fillStyle = '#8B5E3C';
        ctx.fillRect(sx - 8, sy + hh - 12, 16, 4);

        // Leaves (multiple circles)
        const leafColors = ['#0b9060', '#10B981', '#15d694', '#0d8550'];
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + sway * 0.05;
            const dist = 5 + (i % 2) * 3;
            const lx = sx + Math.cos(angle) * dist + sway;
            const ly = sy + hh - 18 + Math.sin(angle) * 3 - (i % 3) * 4;
            const lr = 5 + (i % 2) * 2;

            ctx.fillStyle = leafColors[i % leafColors.length];
            ctx.beginPath();
            ctx.arc(lx, ly, lr, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawCabinet(ctx, sx, sy) {
        const hw = TILE_W / 2;
        const hh = TILE_H / 2;

        // Small storage cabinet
        const cabH = 25;
        const cabW = hw * 0.5;

        // Front
        ctx.beginPath();
        ctx.moveTo(sx - cabW, sy + hh * 0.5 - cabH);
        ctx.lineTo(sx, sy + hh - cabH);
        ctx.lineTo(sx, sy + hh);
        ctx.lineTo(sx - cabW, sy + hh * 0.5);
        ctx.closePath();
        ctx.fillStyle = '#352a50';
        ctx.fill();

        // Side
        ctx.beginPath();
        ctx.moveTo(sx, sy + hh - cabH);
        ctx.lineTo(sx + cabW, sy + hh * 0.5 - cabH);
        ctx.lineTo(sx + cabW, sy + hh * 0.5);
        ctx.lineTo(sx, sy + hh);
        ctx.closePath();
        ctx.fillStyle = '#2a2040';
        ctx.fill();

        // Top
        ctx.beginPath();
        ctx.moveTo(sx, sy - cabH + hh * 0.2);
        ctx.lineTo(sx + cabW, sy + hh * 0.5 - cabH);
        ctx.lineTo(sx, sy + hh - cabH);
        ctx.lineTo(sx - cabW, sy + hh * 0.5 - cabH);
        ctx.closePath();
        ctx.fillStyle = '#4a3f6a';
        ctx.fill();

        // Handles
        ctx.fillStyle = '#6a5f8a';
        ctx.fillRect(sx - cabW + 5, sy + hh * 0.5 - cabH + 8, 2, 4);
        ctx.fillRect(sx - cabW + 5, sy + hh * 0.5 - cabH + 18, 2, 4);
    }

    _drawWhiteboard(ctx, sx, sy) {
        const hh = TILE_H / 2;

        // Board frame
        ctx.fillStyle = '#3a3258';
        ctx.fillRect(sx - 18, sy - 30 + hh, 36, 24);
        ctx.strokeStyle = '#5a5080';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx - 18, sy - 30 + hh, 36, 24);

        // White surface
        ctx.fillStyle = 'rgba(200, 200, 220, 0.08)';
        ctx.fillRect(sx - 15, sy - 27 + hh, 30, 18);

        // Doodle lines (charts)
        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx - 10, sy - 15 + hh);
        ctx.lineTo(sx - 5, sy - 20 + hh);
        ctx.lineTo(sx + 2, sy - 17 + hh);
        ctx.lineTo(sx + 8, sy - 24 + hh);
        ctx.stroke();

        // Bar chart
        ctx.fillStyle = '#8B5CF6';
        ctx.fillRect(sx - 10, sy - 12 + hh, 3, 4);
        ctx.fillStyle = '#10B981';
        ctx.fillRect(sx - 5, sy - 14 + hh, 3, 6);
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(sx, sy - 11 + hh, 3, 3);
        ctx.fillStyle = '#EC4899';
        ctx.fillRect(sx + 5, sy - 16 + hh, 3, 8);
    }

    _drawMeetingRoom(ctx) {
        for (const wall of MEETING_WALLS) {
            const from = this.gridToScreen(wall.from.x, wall.from.y);
            const to = this.gridToScreen(wall.to.x, wall.to.y);

            // Thick glass wall
            ctx.beginPath();
            ctx.moveTo(from.x, from.y + TILE_H / 2);
            ctx.lineTo(to.x, to.y + TILE_H / 2);
            ctx.strokeStyle = 'rgba(100, 220, 255, 0.5)';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Inner glow
            ctx.beginPath();
            ctx.moveTo(from.x, from.y + TILE_H / 2);
            ctx.lineTo(to.x, to.y + TILE_H / 2);
            ctx.strokeStyle = 'rgba(100, 220, 255, 0.12)';
            ctx.lineWidth = 14;
            ctx.stroke();

            // Shine highlight
            ctx.beginPath();
            ctx.moveTo(from.x, from.y + TILE_H / 2 - 1);
            ctx.lineTo(to.x, to.y + TILE_H / 2 - 1);
            ctx.strokeStyle = 'rgba(200, 240, 255, 0.25)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Holographic display inside meeting room
        this._drawHologram(ctx);
    }

    _drawHologram(ctx) {
        // Position inside meeting room
        const screen = this.gridToScreen(3.5, 0.8);
        const hx = screen.x;
        const hy = screen.y - 10;

        // Hologram base
        ctx.fillStyle = '#2a2545';
        ctx.fillRect(hx - 4, hy + 15, 8, 3);

        // Floating hologram triangle
        const bob = Math.sin(this.time * 1.2) * 3;

        ctx.save();
        ctx.globalAlpha = 0.5 + Math.sin(this.time * 2) * 0.15;

        // Pie chart hologram
        const cx = hx;
        const cy = hy - 5 + bob;
        const r = 12;

        // Segments
        const segments = [
            { start: 0, end: 1.5, color: 'rgba(139, 92, 246, 0.6)' },
            { start: 1.5, end: 3.2, color: 'rgba(6, 182, 212, 0.6)' },
            { start: 3.2, end: 5, color: 'rgba(16, 185, 129, 0.6)' },
            { start: 5, end: 6.28, color: 'rgba(245, 158, 11, 0.6)' },
        ];

        for (const seg of segments) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, seg.start + this.time * 0.3, seg.end + this.time * 0.3);
            ctx.closePath();
            ctx.fillStyle = seg.color;
            ctx.fill();
        }

        // Glow
        ctx.shadowColor = '#06B6D4';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();

        // Bar chart next to pie
        const bx = hx + 22;
        const by = hy + bob;
        ctx.globalAlpha = 0.4 + Math.sin(this.time * 1.8) * 0.1;
        const barColors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];
        for (let i = 0; i < 4; i++) {
            const bh = 6 + Math.sin(this.time * 1.5 + i * 1.2) * 4;
            ctx.fillStyle = barColors[i];
            ctx.fillRect(bx + i * 5, by + 10 - bh, 3, bh);
        }
        ctx.globalAlpha = 1;
    }

    _drawAgent(ctx, id, agent, sx, sy) {
        const robots = this._spriteCache.robots[id];
        if (!robots) return;

        let sprite;
        if (agent.moving) {
            sprite = agent.animFrame === 0 ? robots.walk1 : robots.walk2;
        } else if (agent.animState === 'typing') {
            sprite = agent.animFrame === 0 ? robots.typing : robots.idle;
        } else {
            sprite = robots.idle;
        }

        ctx.save();

        // Shadow — larger glow shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(sx, sy + TILE_H / 2 - 2, 22, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glow beneath robot
        const agentColor = ROBOT_COLORS[id]?.body || '#8B5CF6';
        ctx.fillStyle = agentColor.replace(')', ',0.08)').replace('rgb', 'rgba');
        // Simple glow circle — using hex to rgba
        ctx.globalAlpha = 0.15 + Math.sin(this.time * 1.5 + id.charCodeAt(0)) * 0.05;
        ctx.beginPath();
        ctx.ellipse(sx, sy + TILE_H / 2 - 2, 28, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = agentColor;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Bounce
        let bounceY = 0;
        if (!agent.moving && agent.animState === 'idle') {
            bounceY = Math.sin(this.time * 1.5 + id.charCodeAt(0)) * 1.5;
        }

        // Robot sprite
        const drawX = sx - sprite.width / 2;
        const drawY = sy - sprite.height + TILE_H / 2 - 4 + bounceY;
        ctx.drawImage(sprite, drawX, drawY);

        // Highlight
        if (id === this.hoveredAgent || id === this.selectedAgent) {
            ctx.strokeStyle = ROBOT_COLORS[id]?.body || '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(drawX - 2, drawY - 2, sprite.width + 4, sprite.height + 4);
        }

        // Status dot
        const statusColors = {
            working: '#10B981', coding: '#06B6D4', reviewing: '#F59E0B',
            meeting: '#8B5CF6', break: '#6B7280', thinking: '#EC4899', deploying: '#EF4444',
        };
        const dotColor = statusColors[agent.status] || '#10B981';
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(sx + 18, drawY + 6, 4, 0, Math.PI * 2);
        ctx.fill();

        // Pulse
        const pulse = Math.sin(this.time * 3) * 0.5 + 0.5;
        ctx.globalAlpha = pulse * 0.4;
        ctx.beginPath();
        ctx.arc(sx + 18, drawY + 6, 7, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.restore();
    }

    _drawAgentLabel(ctx, agent) {
        const screen = this.gridToScreen(agent.gridX, agent.gridY);
        const x = screen.x;
        const y = screen.y - 70;

        ctx.save();
        const name = agent.name;
        const role = agent.role;
        const status = agent.status;
        const textW = Math.max(name.length, role.length) * 9 + 30;

        ctx.fillStyle = 'rgba(10, 10, 20, 0.9)';
        ctx.strokeStyle = ROBOT_COLORS[agent.id]?.body || '#8B5CF6';
        ctx.lineWidth = 2;

        const boxX = x - textW / 2;
        const boxY = y - 40;
        ctx.fillRect(boxX, boxY, textW, 55);
        ctx.strokeRect(boxX, boxY, textW, 55);

        ctx.font = '12px "Press Start 2P", "Courier New", monospace';
        ctx.textAlign = 'center';

        ctx.fillStyle = ROBOT_COLORS[agent.id]?.accent || '#fff';
        ctx.fillText(name, x, y - 20);

        ctx.font = '10px "Courier New", monospace';
        ctx.fillStyle = '#8888aa';
        ctx.fillText(role, x, y - 6);

        ctx.fillStyle = '#aaaacc';
        ctx.fillText(status.toUpperCase(), x, y + 5);

        ctx.restore();
    }

    _drawChatBubble(ctx, bubble) {
        const agent = this.agents[bubble.employeeId];
        if (!agent) return;

        const screen = this.gridToScreen(agent.gridX, agent.gridY);
        const x = screen.x;
        const y = screen.y - 85;

        const alpha = Math.min(1, bubble.life / 50);
        const rise = (1 - bubble.life / bubble.maxLife) * 8;

        ctx.save();
        ctx.globalAlpha = alpha;

        const text = bubble.text;
        ctx.font = '11px "Courier New", monospace';
        const metrics = ctx.measureText(text);
        const tw = Math.min(metrics.width + 20, 300);
        const th = 28;
        const bx = x - tw / 2;
        const by = y - th - rise;

        // Bubble background with border matching agent color
        ctx.fillStyle = 'rgba(30, 30, 48, 0.95)';
        ctx.fillRect(bx, by, tw, th);
        ctx.strokeStyle = ROBOT_COLORS[bubble.employeeId]?.body || '#8B5CF6';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, tw, th);

        // Tail
        ctx.fillStyle = 'rgba(30, 30, 48, 0.95)';
        ctx.beginPath();
        ctx.moveTo(x - 4, by + th);
        ctx.lineTo(x, by + th + 6);
        ctx.lineTo(x + 4, by + th);
        ctx.fill();

        // Text
        ctx.fillStyle = '#e0e0e0';
        ctx.textAlign = 'center';
        ctx.fillText(text, x, by + 18, tw - 10);

        ctx.restore();
    }
}
