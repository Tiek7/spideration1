import * as THREE from 'three';
import { ROBOT_COLORS } from '../data/sprites.js';
import { AvatarCustomizer } from './avatar-customizer.js';
import {
    OFFICE_GRID, GRID_COLS, GRID_ROWS, TILE, DESK_ASSIGNMENTS,
    AREAS, MEETING_WALLS
} from '../data/office-layout.js';

export class ThreeRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.agents = {};
        this.chatBubbles = [];
        this.time = 0;
        this.avatarCustomizer = null; // injected after construction

        // Container for HTML overlays (Chat bubbles / Labels)
        this.overlay = document.createElement('div');
        this.overlay.style.position = 'absolute';
        this.overlay.style.pointerEvents = 'none';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
        this.overlay.style.overflow = 'hidden';
        this.canvas.parentElement.style.position = 'relative';
        this.canvas.parentElement.appendChild(this.overlay);

        // --- THREE.JS SETUP ---
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        this.renderer.setClearColor(0x08060e); // Dark space color

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x08060e, 0.02);

        // Isometric-ish Camera
        const aspect = window.innerWidth / window.innerHeight;
        // Using an Orthographic camera for true isometric style but 3D
        const d = 10;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);

        // Setup isometric angle: rotation Y 45 deg, rotation X ~35.264 deg
        this.camera.position.set(20, 20, 20);
        this.camera.lookAt(GRID_COLS / 2, 0, GRID_ROWS / 2); // Look at center of office

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xfff5f5, 4.0);
        this.scene.add(ambientLight);

        const hemiLight = new THREE.HemisphereLight(0x8B5CF6, 0x4f4f7a, 5.0);
        this.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffeebb, 6.0);
        dirLight.position.set(-15, 30, 15);
        this.scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0x06B6D4, 3.0);
        fillLight.position.set(15, 20, -15);
        this.scene.add(fillLight);

        // Groups
        this.worldGroup = new THREE.Group();
        this.scene.add(this.worldGroup);

        this.agentMeshes = {};

        this._buildEnvironment();

        this._resize();
        window.addEventListener('resize', () => this._resize());

        // Interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredAgent = null;
        this.selectedAgent = null;
        this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
        this.canvas.addEventListener('click', (e) => this._onClick(e));
    }

    _resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.renderer.setSize(w, h);

        const aspect = w / h;
        const d = 5.5; // Zoom level
        this.camera.left = -d * aspect;
        this.camera.right = d * aspect;
        this.camera.top = d;
        this.camera.bottom = -d;
        this.camera.updateProjectionMatrix();
    }

    _buildEnvironment() {
        // Shared Materials
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x141228, roughness: 0.8 });
        const floorGridMat = new THREE.MeshStandardMaterial({ color: 0x1e1830, roughness: 0.9 });
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a2040, roughness: 0.5 });
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x3a3258, roughness: 0.7 });
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x06B6D4, transparent: true, opacity: 0.2, emissive: 0x06B6D4, emissiveIntensity: 0.3
        });

        // Floor Base
        const floorGeo = new THREE.BoxGeometry(GRID_COLS, 0.5, GRID_ROWS);
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.position.set(GRID_COLS / 2 - 0.5, -0.25, GRID_ROWS / 2 - 0.5);
        this.worldGroup.add(floorMesh);

        // Walls (Back and Right)
        const wallH = 4;
        const wallBack = new THREE.Mesh(new THREE.BoxGeometry(GRID_COLS, wallH, 0.2), wallMat);
        wallBack.position.set(GRID_COLS / 2 - 0.5, wallH / 2, -0.6);
        this.worldGroup.add(wallBack);

        const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, wallH, GRID_ROWS), wallMat);
        wallRight.position.set(GRID_COLS - 0.4, wallH / 2, GRID_ROWS / 2 - 0.5);
        this.worldGroup.add(wallRight);

        // Tiles & Furniture
        for (let gy = 0; gy < GRID_ROWS; gy++) {
            for (let gx = 0; gx < GRID_COLS; gx++) {
                const tile = OFFICE_GRID[gy]?.[gx] || 0;

                // Grid lines (thin boxes on floor) //
                const gridLineMat = new THREE.MeshBasicMaterial({ color: 0x241c3a });
                if (tile !== TILE.EMPTY) {
                    const gxMesh = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.02, 0.95), gridLineMat);
                    gxMesh.position.set(gx, 0.01, gy);
                    this.worldGroup.add(gxMesh);
                }

                if (tile === TILE.MEETING_FLOOR || tile === TILE.BREAK_FLOOR) {
                    const color = tile === TILE.MEETING_FLOOR ? 0x181430 : 0x1e1428;
                    const spFloor = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 1), new THREE.MeshStandardMaterial({ color }));
                    spFloor.position.set(gx, 0.02, gy);
                    this.worldGroup.add(spFloor);
                }

                // Furniture
                if (tile === TILE.DESK) {
                    const desk = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.5), deskMat);
                    desk.position.set(gx, 0.3, gy);
                    this.worldGroup.add(desk);

                    // Monitor
                    const monMat = new THREE.MeshStandardMaterial({ color: 0x1e1830 });
                    const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.05), monMat);
                    monitor.position.set(gx, 0.7, gy - 0.1);
                    this.worldGroup.add(monitor);

                    // Screen Glow
                    const screenColors = [0x00ff88, 0x06B6D4, 0x8B5CF6, 0xF59E0B, 0xEC4899];
                    const sColor = screenColors[(gx + gy) % screenColors.length];
                    const screenMat = new THREE.MeshBasicMaterial({ color: sColor });
                    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.2), screenMat);
                    screen.position.set(gx, 0.7, gy - 0.07);
                    this.worldGroup.add(screen);

                    // Point light for screen glow
                    const pl = new THREE.PointLight(sColor, 3, 3);
                    pl.position.set(gx, 1.2, gy);
                    this.worldGroup.add(pl);
                }
                else if (tile === TILE.SERVER) {
                    const server = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.0, 0.6), new THREE.MeshStandardMaterial({ color: 0x201a30 }));
                    server.position.set(gx, 1.0, gy);
                    this.worldGroup.add(server);

                    // Add blinking LED strip
                    const ledMat = new THREE.MeshBasicMaterial({ color: 0x00ff41 });
                    const ledStrip = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 1.5), ledMat);
                    ledStrip.position.set(gx, 1.0, gy + 0.31);
                    // store ref for animation
                    ledStrip.userData = { isLed: true, type: 'server', timeOffset: gx + gy };
                    this.worldGroup.add(ledStrip);
                }
                else if (tile === TILE.PLANT) {
                    const pot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0x6B4423 }));
                    pot.position.set(gx, 0.15, gy);
                    this.worldGroup.add(pot);

                    const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 0), new THREE.MeshStandardMaterial({ color: 0x10B981, flatShading: true }));
                    bush.position.set(gx, 0.45, gy);
                    this.worldGroup.add(bush);
                }
                else if (tile === TILE.CABINET) {
                    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 0.4), new THREE.MeshStandardMaterial({ color: 0x352a50 }));
                    cab.position.set(gx, 0.5, gy);
                    this.worldGroup.add(cab);
                }
                else if (tile === TILE.WHITEBOARD) {
                    const board = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.05), new THREE.MeshStandardMaterial({ color: 0xe0e0e0 }));
                    board.position.set(gx, 1.0, gy);
                    board.rotation.y = Math.PI / 2; // face X axis usually
                    this.worldGroup.add(board);
                }
            }
        }

        // Meeting room walls
        for (const wall of MEETING_WALLS) {
            const dx = wall.to.x - wall.from.x;
            const dz = wall.to.y - wall.from.y;
            const len = Math.max(Math.abs(dx), Math.abs(dz));
            if (len > 0) {
                const cx = wall.from.x + dx / 2;
                const cz = wall.from.y + dz / 2;

                const w = dx === 0 ? 0.1 : len;
                const d = dz === 0 ? 0.1 : len;

                const glass = new THREE.Mesh(new THREE.BoxGeometry(w, 2.5, d), glassMat);
                glass.position.set(cx, 1.25, cz);
                this.worldGroup.add(glass);
            }
        }
    }

    _createRobotMesh(id) {
        const group = new THREE.Group();
        const colors = ROBOT_COLORS[id] || { body: '#8B5CF6', accent: '#fff', eye: '#06B6D4' };

        const bodyMat = new THREE.MeshStandardMaterial({ color: colors.body, roughness: 0.6 });
        const accentMat = new THREE.MeshStandardMaterial({ color: colors.accent, roughness: 0.4 });

        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), bodyMat);
        body.position.y = 0.4;
        group.add(body);

        // Head
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.7;

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.35), bodyMat);
        headGroup.add(head);

        // Eye Visor
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: 0x1a1a2e }));
        visor.position.set(0, 0, 0.18);
        headGroup.add(visor);

        // Glowing Eyes
        const eye = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.05), new THREE.MeshBasicMaterial({ color: colors.eye }));
        eye.position.set(0, 0, 0.21);
        headGroup.add(eye);

        group.add(headGroup);

        group.userData = { head: headGroup, body: body, color: colors.body };
        return group;
    }

    // ---- API Methods ----
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
                    status: 'working',
                    moving: false,
                    moveProgress: 0,
                    // DOM Label
                    labelEl: this._createDOMElement('agent-label'),
                    chatEl: this._createDOMElement('agent-chat'),
                };

                const mesh = this._createRobotMesh(emp.id);
                mesh.position.set(desk.gridX, 0, desk.gridY);
                this.worldGroup.add(mesh);
                this.agentMeshes[emp.id] = mesh;

                this._updateLabelContent(emp.id);
            }
        });
    }

    addAgent(emp) {
        if (this.agents[emp.id]) return;

        // Find an empty spot to spawn
        let gridX = Math.floor(Math.random() * 5) + 5;
        let gridY = Math.floor(Math.random() * 3) + 6;

        this.agents[emp.id] = {
            ...emp,
            gridX,
            gridY,
            targetX: gridX,
            targetY: gridY,
            status: 'online',
            moving: false,
            moveProgress: 0,
            labelEl: this._createDOMElement('agent-label'),
            chatEl: this._createDOMElement('agent-chat'),
        };

        const mesh = this._createRobotMesh(emp.id);
        mesh.position.set(gridX, 0, gridY);
        this.worldGroup.add(mesh);
        this.agentMeshes[emp.id] = mesh;

        this._updateLabelContent(emp.id);
    }

    // Called by main.js after AvatarCustomizer is created
    setAvatarCustomizer(ac) {
        this.avatarCustomizer = ac;
        // Refresh all labels immediately
        for (const id of Object.keys(this.agents)) {
            this._updateLabelContent(id);
        }
    }

    // Called when avatar config changes for empId
    refreshAvatar(empId) {
        this._updateLabelContent(empId);
    }

    removeAgent(empId) {
        if (!this.agents[empId]) return;

        const mesh = this.agentMeshes[empId];
        if (mesh) {
            this.worldGroup.remove(mesh);
        }

        const agent = this.agents[empId];
        if (agent.labelEl && agent.labelEl.parentNode) agent.labelEl.remove();
        if (agent.chatEl && agent.chatEl.parentNode) agent.chatEl.remove();

        delete this.agentMeshes[empId];
        delete this.agents[empId];
    }
    _createDOMElement(className) {
        const el = document.createElement('div');
        el.className = className;
        el.style.position = 'absolute';
        el.style.transform = 'translate(-50%, -100%)';
        el.style.display = 'none';

        // Cyberpunk styling for overlays based on pixel-renderer visuals
        el.style.fontFamily = "'JetBrains Mono', monospace";
        el.style.fontSize = '12px';
        el.style.fontWeight = 'bold';
        el.style.background = 'rgba(20, 20, 30, 0.8)';
        el.style.border = '1px solid #8B5CF6';
        el.style.padding = '4px 8px';
        el.style.color = '#fff';
        el.style.whiteSpace = 'nowrap';
        el.style.pointerEvents = 'none';
        el.style.zIndex = '10';

        this.overlay.appendChild(el);
        return el;
    }

    _updateLabelContent(id) {
        const agent = this.agents[id];
        if (!agent) return;
        const accentColor = ROBOT_COLORS[id]?.accent || '#c4b5fd';
        const bodyColor = ROBOT_COLORS[id]?.body || '#8B5CF6';

        // Pixel person canvas
        const pixelCanvasId = `pixel-person-${id}`;
        agent.labelEl.style.borderColor = bodyColor;
        agent.labelEl.style.padding = '6px 10px';
        agent.labelEl.style.borderRadius = '10px';
        agent.labelEl.style.background = 'rgba(12,10,28,0.92)';
        agent.labelEl.style.boxShadow = `0 0 12px ${bodyColor}55`;
        agent.labelEl.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px;">
                <canvas id="${pixelCanvasId}" width="36" height="44"
                    style="image-rendering:pixelated; border-radius:6px; background:#0a0820;"></canvas>
                <div>
                    <div style="color:${accentColor}; font-size:12px; font-weight:bold; margin-bottom:2px;">${agent.name}</div>
                    <div style="color:#88a; font-size:10px;">${agent.role}</div>
                    <div style="color:#aac; font-size:9px; margin-top:2px;">${(agent.status || '').toUpperCase()}</div>
                </div>
            </div>
        `;

        // Draw pocket pixel person
        if (this.avatarCustomizer) {
            const c = document.getElementById(pixelCanvasId);
            if (c) {
                const cx2 = c.getContext('2d');
                cx2.imageSmoothingEnabled = false;
                this.avatarCustomizer.drawPixelPerson(cx2, 18, 32, id, 1.0);
            }
        }
    }

    updateAgentStatus(employeeId, status) {
        const agent = this.agents[employeeId];
        if (!agent) return;

        agent.status = status;
        this._updateLabelContent(employeeId);

        const desk = DESK_ASSIGNMENTS.find(d => d.employeeId === employeeId);

        let targetX = agent.gridX;
        let targetY = agent.gridY;

        switch (status) {
            case 'meeting':
                targetX = AREAS.meeting.gridX + (Math.random() - 0.5);
                targetY = AREAS.meeting.gridY + (Math.random() - 0.5);
                break;
            case 'break':
                targetX = AREAS.break.gridX + (Math.random() - 0.5);
                targetY = AREAS.break.gridY + (Math.random() - 0.5);
                break;
            case 'deploying':
                targetX = AREAS.server.gridX + (Math.random() - 0.5);
                targetY = AREAS.server.gridY + (Math.random() - 0.5);
                break;
            default:
                if (desk) { targetX = desk.gridX; targetY = desk.gridY; }
                break;
        }

        const dx = targetX - agent.gridX;
        const dy = targetY - agent.gridY;
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            agent.startX = agent.gridX;
            agent.startY = agent.gridY;
            agent.targetX = targetX;
            agent.targetY = targetY;
            agent.moving = true;
            agent.moveProgress = 0;

            // Look direction
            const mesh = this.agentMeshes[employeeId];
            if (mesh) {
                const angle = Math.atan2(dx, dy);
                mesh.rotation.y = angle;
            }
        }
    }

    addChatBubble(employeeId, text) {
        const agent = this.agents[employeeId];
        if (!agent) return;

        const safeTxt = text.length > 50 ? text.substring(0, 47) + '...' : text;
        const color = ROBOT_COLORS[employeeId]?.body || '#8B5CF6';

        agent.chatEl.style.display = 'block';
        agent.chatEl.style.borderColor = color;
        agent.chatEl.style.fontFamily = "'JetBrains Mono', monospace";
        agent.chatEl.style.fontSize = '13px';
        agent.chatEl.innerText = safeTxt;

        agent.chatLife = 300; // frames
    }

    addTypingIndicator(employeeId) {
        const agent = this.agents[employeeId];
        if (agent) {
            agent.isTyping = true;
            clearTimeout(agent.typingTimeout);
            agent.typingTimeout = setTimeout(() => {
                agent.isTyping = false;
            }, 3000);
        }
    }

    // ---- Interaction ----
    _onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const agentMeshesList = Object.values(this.agentMeshes);
        const intersects = this.raycaster.intersectObjects(agentMeshesList, true);

        this.hoveredAgent = null;
        if (intersects.length > 0) {
            // Find parent group
            let obj = intersects[0].object;
            while (obj.parent && obj.parent !== this.worldGroup) {
                obj = obj.parent;
            }

            // Find ID
            for (const [id, m] of Object.entries(this.agentMeshes)) {
                if (m === obj) {
                    this.hoveredAgent = id;
                    break;
                }
            }
        }

        this.canvas.style.cursor = this.hoveredAgent ? 'pointer' : 'default';

        // Show/hide labels based on hover/select
        for (const [id, agent] of Object.entries(this.agents)) {
            if (id === this.hoveredAgent || id === this.selectedAgent) {
                agent.labelEl.style.display = 'block';
            } else {
                agent.labelEl.style.display = 'none';
            }
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

        // Update label visibilities instantly
        this._updateLabelsVisibility();
    }

    _updateLabelsVisibility() {
        for (const [id, agent] of Object.entries(this.agents)) {
            if (id === this.hoveredAgent || id === this.selectedAgent) {
                agent.labelEl.style.display = 'block';
            } else {
                agent.labelEl.style.display = 'none';
            }
        }
    }

    // Transform 3D pos to 2D CSS screen coords
    _toScreenPosition(obj, camera) {
        const vector = new THREE.Vector3();
        obj.getWorldPosition(vector);
        // Move up a bit for the HUD (above their head)
        vector.y += 1.2;

        vector.project(camera);

        const widthHalf = 0.5 * this.canvas.width;
        const heightHalf = 0.5 * this.canvas.height;

        return {
            x: (vector.x * widthHalf) + widthHalf,
            y: - (vector.y * heightHalf) + heightHalf
        };
    }

    // ---- Loop ----
    update(dt) {
        this.time += dt;

        // Animate Environment
        this.worldGroup.children.forEach(child => {
            if (child.userData?.isLed) {
                const on = Math.sin(this.time * 5 + child.userData.timeOffset) > 0;
                child.material.color.setHex(on ? 0x00ff41 : 0x1e1830);
            }
        });

        // Animate Agents
        for (const [id, agent] of Object.entries(this.agents)) {
            const mesh = this.agentMeshes[id];
            if (!mesh) continue;

            if (agent.moving) {
                agent.moveProgress += dt * 1.5; // speed
                if (agent.moveProgress >= 1) {
                    agent.gridX = agent.targetX;
                    agent.gridY = agent.targetY;
                    agent.moving = false;
                    agent.moveProgress = 0;
                    mesh.position.set(agent.gridX, 0, agent.gridY);
                    mesh.position.y = 0;

                    // Reset rotation if back at desk
                    if (agent.status === 'working' || agent.status === 'coding') {
                        mesh.rotation.y = 0;
                    }
                } else {
                    agent.gridX = agent.startX + (agent.targetX - agent.startX) * agent.moveProgress;
                    agent.gridY = agent.startY + (agent.targetY - agent.startY) * agent.moveProgress;
                    mesh.position.set(agent.gridX, 0, agent.gridY);

                    // Bounce walk
                    mesh.position.y = Math.abs(Math.sin(agent.moveProgress * Math.PI * 6)) * 0.2;
                }
            } else {
                // Idle / Typing animation
                mesh.position.y = 0;
                if (agent.isTyping) {
                    mesh.userData.head.rotation.x = Math.sin(this.time * 15) * 0.1;
                } else {
                    mesh.userData.head.rotation.x = Math.sin(this.time * 2 + id.charCodeAt(0)) * 0.05;
                }
            }

            // Sync HTML Overlays
            const screenPos = this._toScreenPosition(mesh, this.camera);

            if (agent.labelEl.style.display !== 'none') {
                agent.labelEl.style.left = `${screenPos.x}px`;
                agent.labelEl.style.top = `${screenPos.y - 10}px`;
            }

            if (agent.chatLife > 0) {
                agent.chatLife--;
                agent.chatEl.style.left = `${screenPos.x}px`;
                agent.chatEl.style.top = `${screenPos.y - 45}px`;
                agent.chatEl.style.opacity = Math.min(1, agent.chatLife / 50);
                if (agent.chatLife <= 0) {
                    agent.chatEl.style.display = 'none';
                }
            }
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
