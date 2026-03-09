// =============================================
// AVATAR CUSTOMIZER ENGINE
// Manages pixel-person avatar appearance per employee
// Supports: custom image upload, color pickers, preset skins
// Persists config to localStorage
// =============================================

const STORAGE_KEY = 'spideration_avatars';

// Preset skins
const PRESET_SKINS = {
    formal: { bodyColor: '#2c3e50', shirtColor: '#fff', hairColor: '#3d2b1f', pantsColor: '#1a252f', label: 'Formal 🤵' },
    casual: { bodyColor: '#e67e22', shirtColor: '#3498db', hairColor: '#1a1a1a', pantsColor: '#2c3e50', label: 'Casual 👕' },
    hoodie: { bodyColor: '#8e44ad', shirtColor: '#9b59b6', hairColor: '#0d0d0d', pantsColor: '#2c3e50', label: 'Hoodie 🧥' },
    kimono: { bodyColor: '#e74c3c', shirtColor: '#ffffff', hairColor: '#000000', pantsColor: '#c0392b', label: 'Kimono 🎎' },
    security: { bodyColor: '#2c3e50', shirtColor: '#2c3e50', hairColor: '#5d4037', pantsColor: '#1c2e3d', label: 'Bảo Vệ 👮' },
};

export class AvatarCustomizer {
    constructor(employees, onUpdate) {
        this.employees = employees;
        this.onUpdate = onUpdate; // called when any avatar changes
        this.config = this._loadFromStorage();
        this.panel = null;
        this.currentEmpId = null;
        this._initMissingConfigs();
    }

    _initMissingConfigs() {
        for (const emp of this.employees) {
            if (!this.config[emp.id]) {
                this.config[emp.id] = this._defaultConfig(emp);
            }
        }
        this._saveToStorage();
    }

    _defaultConfig(emp) {
        const preset = emp.role === 'Bảo vệ' ? PRESET_SKINS.security :
            emp.role === 'CEO' ? PRESET_SKINS.formal :
                emp.role === 'CG Lead' ? PRESET_SKINS.hoodie :
                    PRESET_SKINS.casual;
        return {
            ...preset,
            skinColor: '#f4c9a4',
            customImage: null, // base64 dataURL
            useCustomImage: false,
        };
    }

    getConfig(empId) {
        return this.config[empId] || null;
    }

    _loadFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    }

    _saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
        } catch (e) { console.warn('Avatar save failed:', e); }
    }

    // ---- Open the customizer panel for an employee ----
    openPanel(empId) {
        this.currentEmpId = empId;
        const emp = this.employees.find(e => e.id === empId);
        if (!emp) return;

        // Remove existing panel
        if (this.panel) this.panel.remove();

        const cfg = this.config[empId];
        this.panel = this._buildPanel(emp, cfg);
        document.body.appendChild(this.panel);
        this._makeDraggable(this.panel);
        this._updatePreview(empId);
    }

    closePanel() {
        if (this.panel) {
            this.panel.style.transform = 'scale(0.8)';
            this.panel.style.opacity = '0';
            setTimeout(() => { this.panel?.remove(); this.panel = null; }, 200);
        }
    }

    _buildPanel(emp, cfg) {
        const panel = document.createElement('div');
        panel.id = 'avatar-customizer-panel';
        panel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 320px;
            background: linear-gradient(135deg, #0f0c1e 0%, #1a1035 100%);
            border: 1.5px solid #8B5CF6;
            border-radius: 16px;
            box-shadow: 0 0 40px rgba(139,92,246,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset;
            z-index: 9999;
            padding: 0;
            font-family: 'JetBrains Mono', monospace;
            transition: transform 0.2s ease, opacity 0.2s ease;
            transform: scale(1);
            opacity: 1;
        `;

        panel.innerHTML = `
            <!-- Header -->
            <div id="customizer-drag-handle" style="
                background: linear-gradient(90deg, #8B5CF6 0%, #06B6D4 100%);
                padding: 12px 16px;
                border-radius: 14px 14px 0 0;
                cursor: grab;
                display: flex;
                align-items: center;
                justify-content: space-between;
            ">
                <span style="font-size:13px; font-weight:bold; color:#fff; letter-spacing:1px;">✏️ CUSTOM NHÂN VẬT</span>
                <button id="customizer-close" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: #fff;
                    border-radius: 50%;
                    width: 24px; height: 24px;
                    cursor: pointer;
                    font-size: 14px;
                    line-height: 1;
                ">✕</button>
            </div>

            <!-- Body -->
            <div style="padding: 16px;">
                <!-- Employee name -->
                <div style="color:#a78bfa; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin-bottom:4px;">Nhân Viên</div>
                <div id="customizer-emp-name" style="color:#fff; font-size:16px; font-weight:bold; margin-bottom:16px;">${emp.avatar} ${emp.name} — ${emp.role}</div>

                <!-- Preview canvas -->
                <div style="display:flex; justify-content:center; margin-bottom:16px;">
                    <div style="position:relative;">
                        <canvas id="customizer-preview" width="80" height="100" style="
                            image-rendering: pixelated;
                            border: 2px solid #8B5CF6;
                            border-radius: 12px;
                            background: #0a0820;
                            display: block;
                        "></canvas>
                        <div style="position:absolute; bottom:-22px; left:50%; transform:translateX(-50%); color:#a78bfa; font-size:9px; white-space:nowrap;">PREVIEW</div>
                    </div>
                </div>

                <!-- Divider -->
                <div style="height:1px; background:linear-gradient(90deg, transparent, #8B5CF6, transparent); margin: 24px 0 16px;"></div>

                <!-- Preset Skins -->
                <div style="color:#a78bfa; font-size:10px; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:8px;">⚡ Preset Skins</div>
                <div id="preset-buttons" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:16px;">
                    ${Object.entries(PRESET_SKINS).map(([key, skin]) => `
                        <button data-preset="${key}" style="
                            background: rgba(139,92,246,0.15);
                            border: 1px solid #533483;
                            color: #c4b5fd;
                            border-radius: 8px;
                            padding: 4px 8px;
                            font-size: 10px;
                            cursor: pointer;
                            transition: all 0.2s;
                            font-family: 'JetBrains Mono', monospace;
                        ">${skin.label}</button>
                    `).join('')}
                </div>

                <!-- Color Pickers -->
                <div style="color:#a78bfa; font-size:10px; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:8px;">🎨 Màu Sắc</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px;">
                    ${this._colorRow('skinColor', 'Da mặt 👤', cfg.skinColor)}
                    ${this._colorRow('hairColor', 'Tóc 💈', cfg.hairColor)}
                    ${this._colorRow('shirtColor', 'Áo 👕', cfg.shirtColor)}
                    ${this._colorRow('bodyColor', 'Thân 🧥', cfg.bodyColor)}
                    ${this._colorRow('pantsColor', 'Quần 👖', cfg.pantsColor)}
                </div>

                <!-- Custom Image Upload -->
                <div style="color:#a78bfa; font-size:10px; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:8px;">📷 Ảnh Đại Diện</div>
                <div style="display:flex; gap:8px; align-items:center; margin-bottom:16px;">
                    <label id="upload-label" style="
                        display: inline-flex; align-items: center; gap: 6px;
                        background: rgba(6,182,212,0.15);
                        border: 1px solid #06B6D4;
                        color: #67e8f9;
                        border-radius: 8px;
                        padding: 8px 14px;
                        font-size: 11px;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-family: 'JetBrains Mono', monospace;
                    ">📁 Upload ảnh
                        <input id="avatar-file-input" type="file" accept="image/*" style="display:none;"/>
                    </label>
                    <button id="clear-image-btn" style="
                        background: rgba(239,68,68,0.15);
                        border: 1px solid #ef4444;
                        color: #fca5a5;
                        border-radius: 8px;
                        padding: 8px 10px;
                        font-size: 11px;
                        cursor: pointer;
                        font-family: 'JetBrains Mono', monospace;
                        display: ${cfg.useCustomImage ? 'block' : 'none'};
                    ">🗑 Xóa</button>
                </div>
                <div id="use-image-toggle" style="display:${cfg.customImage ? 'flex' : 'none'}; align-items:center; gap:8px; margin-bottom:16px;">
                    <input type="checkbox" id="use-custom-image-check" ${cfg.useCustomImage ? 'checked' : ''} style="width:16px;height:16px;accent-color:#8B5CF6;" />
                    <label for="use-custom-image-check" style="color:#c4b5fd; font-size:11px; cursor:pointer;">Dùng ảnh đại diện này</label>
                </div>

                <!-- Save button -->
                <button id="customizer-save" style="
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(90deg, #8B5CF6, #06B6D4);
                    border: none;
                    border-radius: 10px;
                    color: #fff;
                    font-size: 13px;
                    font-weight: bold;
                    cursor: pointer;
                    letter-spacing: 1px;
                    font-family: 'JetBrains Mono', monospace;
                    transition: opacity 0.2s;
                ">💾 LƯU THAY ĐỔI</button>
            </div>
        `;

        // ---- Wire up events ----
        panel.querySelector('#customizer-close').onclick = () => this.closePanel();

        // Preset buttons
        panel.querySelectorAll('[data-preset]').forEach(btn => {
            btn.onmouseenter = () => btn.style.background = 'rgba(139,92,246,0.35)';
            btn.onmouseleave = () => btn.style.background = 'rgba(139,92,246,0.15)';
            btn.onclick = () => {
                const preset = PRESET_SKINS[btn.dataset.preset];
                Object.assign(this.config[this.currentEmpId], preset);
                // Update color picker values
                ['bodyColor', 'shirtColor', 'hairColor', 'pantsColor'].forEach(k => {
                    const el = panel.querySelector(`#colorpick-${k}`);
                    if (el) el.value = preset[k] || this.config[this.currentEmpId][k];
                });
                this._updatePreview(this.currentEmpId);
            };
        });

        // Color pickers
        ['skinColor', 'hairColor', 'shirtColor', 'bodyColor', 'pantsColor'].forEach(k => {
            const picker = panel.querySelector(`#colorpick-${k}`);
            if (picker) {
                picker.oninput = () => {
                    this.config[this.currentEmpId][k] = picker.value;
                    this._updatePreview(this.currentEmpId);
                };
            }
        });

        // File upload
        const fileInput = panel.querySelector('#avatar-file-input');
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                this.config[this.currentEmpId].customImage = ev.target.result;
                this.config[this.currentEmpId].useCustomImage = true;
                panel.querySelector('#use-image-toggle').style.display = 'flex';
                panel.querySelector('#use-custom-image-check').checked = true;
                panel.querySelector('#clear-image-btn').style.display = 'block';
                this._updatePreview(this.currentEmpId);
            };
            reader.readAsDataURL(file);
        };

        // Clear image
        panel.querySelector('#clear-image-btn').onclick = () => {
            this.config[this.currentEmpId].customImage = null;
            this.config[this.currentEmpId].useCustomImage = false;
            panel.querySelector('#use-image-toggle').style.display = 'none';
            panel.querySelector('#clear-image-btn').style.display = 'none';
            this._updatePreview(this.currentEmpId);
        };

        // Use image toggle
        const checkEl = panel.querySelector('#use-custom-image-check');
        if (checkEl) {
            checkEl.onchange = () => {
                this.config[this.currentEmpId].useCustomImage = checkEl.checked;
                this._updatePreview(this.currentEmpId);
            };
        }

        // Save
        panel.querySelector('#customizer-save').onclick = () => {
            this._saveToStorage();
            if (this.onUpdate) this.onUpdate(this.currentEmpId, this.config[this.currentEmpId]);
            this._flashSave(panel.querySelector('#customizer-save'));
        };

        return panel;
    }

    _colorRow(key, label, value) {
        return `
            <div style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.04); padding:6px 8px; border-radius:8px;">
                <input type="color" id="colorpick-${key}" value="${value || '#888888'}" style="width:28px;height:28px;border:none;border-radius:6px;cursor:pointer;background:none;" />
                <span style="color:#c4b5fd; font-size:10px;">${label}</span>
            </div>
        `;
    }

    _flashSave(btn) {
        btn.textContent = '✅ ĐÃ LƯU!';
        btn.style.background = 'linear-gradient(90deg, #10B981, #06B6D4)';
        setTimeout(() => {
            btn.textContent = '💾 LƯU THAY ĐỔI';
            btn.style.background = 'linear-gradient(90deg, #8B5CF6, #06B6D4)';
        }, 1500);
    }

    // ---- Draw pixel person preview ----
    _updatePreview(empId) {
        const canvas = document.getElementById('customizer-preview');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this._drawPixelPerson(ctx, 40, 50, empId, 2.5);
    }

    // Core pixel person drawing function — used both for preview and for 3D overlay sprites
    drawPixelPerson(ctx, cx, cy, empId, scale = 1, facing = 'down') {
        this._drawPixelPerson(ctx, cx, cy, empId, scale, facing);
    }

    _drawPixelPerson(ctx, cx, cy, empId, scale = 1, facing = 'down') {
        const cfg = this.config[empId];
        if (!cfg) return;

        const s = scale; // pixel scale
        const skin = cfg.skinColor || '#f4c9a4';
        const hair = cfg.hairColor || '#3d2b1f';
        const shirt = cfg.shirtColor || '#4a4a8a';
        const body = cfg.bodyColor || '#2c3e50';
        const pants = cfg.pantsColor || '#1a252f';

        if (cfg.useCustomImage && cfg.customImage) {
            this._drawPersonWithPhoto(ctx, cx, cy, cfg, scale);
        } else {
            this._drawDefaultPerson(ctx, cx, cy, { skin, hair, shirt, body, pants }, scale);
        }
    }

    _drawDefaultPerson(ctx, cx, cy, colors, s) {
        const { skin, hair, shirt, body, pants } = colors;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 10 * s, 7 * s, 3 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.fillStyle = pants;
        this._px(ctx, cx - 3 * s, cy + 4 * s, 3 * s, 6 * s);
        this._px(ctx, cx + 1 * s, cy + 4 * s, 3 * s, 6 * s);

        // Shoes
        ctx.fillStyle = '#1a1a1a';
        this._px(ctx, cx - 4 * s, cy + 9 * s, 4 * s, 2 * s);
        this._px(ctx, cx + 1 * s, cy + 9 * s, 4 * s, 2 * s);

        // Body / Shirt
        ctx.fillStyle = shirt;
        this._px(ctx, cx - 4 * s, cy - 2 * s, 9 * s, 8 * s);

        // Jacket layer
        ctx.fillStyle = body;
        this._px(ctx, cx - 4 * s, cy - 2 * s, 3 * s, 7 * s);
        this._px(ctx, cx + 2 * s, cy - 2 * s, 3 * s, 7 * s);

        // Arms
        ctx.fillStyle = body;
        this._px(ctx, cx - 7 * s, cy - 1 * s, 3 * s, 5 * s);
        this._px(ctx, cx + 5 * s, cy - 1 * s, 3 * s, 5 * s);

        // Hands (skin)
        ctx.fillStyle = skin;
        this._px(ctx, cx - 7 * s, cy + 4 * s, 3 * s, 2 * s);
        this._px(ctx, cx + 5 * s, cy + 4 * s, 3 * s, 2 * s);

        // Neck
        ctx.fillStyle = skin;
        this._px(ctx, cx - 1 * s, cy - 3 * s, 3 * s, 2 * s);

        // Head
        ctx.fillStyle = skin;
        this._px(ctx, cx - 5 * s, cy - 11 * s, 11 * s, 10 * s);

        // Hair
        ctx.fillStyle = hair;
        this._px(ctx, cx - 5 * s, cy - 11 * s, 11 * s, 4 * s);
        this._px(ctx, cx - 5 * s, cy - 11 * s, 2 * s, 8 * s);
        this._px(ctx, cx + 4 * s, cy - 11 * s, 2 * s, 7 * s);

        // Eyes
        ctx.fillStyle = '#1a1a1a';
        this._px(ctx, cx - 3 * s, cy - 6 * s, 2 * s, 2 * s);
        this._px(ctx, cx + 2 * s, cy - 6 * s, 2 * s, 2 * s);

        // Mouth
        ctx.fillStyle = '#c0706a';
        this._px(ctx, cx - 1 * s, cy - 3 * s, 3 * s, 1 * s);
    }

    _drawPersonWithPhoto(ctx, cx, cy, cfg, s) {
        // Draw the body skeleton first (without face)
        const colors = {
            skin: cfg.skinColor || '#f4c9a4',
            hair: cfg.hairColor || '#3d2b1f',
            shirt: cfg.shirtColor || '#4a4a8a',
            body: cfg.bodyColor || '#2c3e50',
            pants: cfg.pantsColor || '#1a252f',
        };
        this._drawDefaultPerson(ctx, cx, cy, colors, s);

        // Overlay the custom photo on the head region
        const img = new Image();
        img.onload = () => {
            const headW = 11 * s;
            const headH = 10 * s;
            const headX = cx - 5 * s;
            const headY = cy - 11 * s;

            ctx.save();
            // Clip to rounded head shape
            ctx.beginPath();
            const r = 3 * s;
            ctx.moveTo(headX + r, headY);
            ctx.lineTo(headX + headW - r, headY);
            ctx.quadraticCurveTo(headX + headW, headY, headX + headW, headY + r);
            ctx.lineTo(headX + headW, headY + headH - r);
            ctx.quadraticCurveTo(headX + headW, headY + headH, headX + headW - r, headY + headH);
            ctx.lineTo(headX + r, headY + headH);
            ctx.quadraticCurveTo(headX, headY + headH, headX, headY + headH - r);
            ctx.lineTo(headX, headY + r);
            ctx.quadraticCurveTo(headX, headY, headX + r, headY);
            ctx.closePath();
            ctx.clip();

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, headX, headY, headW, headH);
            ctx.restore();
        };
        img.src = cfg.customImage;
    }

    _px(ctx, x, y, w, h) {
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }

    // ---- Draggable panel ----
    _makeDraggable(panel) {
        const handle = panel.querySelector('#customizer-drag-handle');
        let isDragging = false, startX = 0, startY = 0, origX = 0, origY = 0;

        handle.onmousedown = (e) => {
            if (e.target.id === 'customizer-close') return;
            isDragging = true;
            startX = e.clientX; startY = e.clientY;
            const rect = panel.getBoundingClientRect();
            origX = rect.left; origY = rect.top;
            panel.style.right = 'auto';
            handle.style.cursor = 'grabbing';
        };
        document.onmousemove = (e) => {
            if (!isDragging) return;
            panel.style.left = (origX + e.clientX - startX) + 'px';
            panel.style.top = (origY + e.clientY - startY) + 'px';
        };
        document.onmouseup = () => {
            isDragging = false;
            handle.style.cursor = 'grab';
        };
    }
}
