import './style.css';
import { SimulationEngine } from './src/engine/simulation.js';
import { ThreeRenderer } from './src/engine/three-renderer.js';
import { AvatarCustomizer } from './src/engine/avatar-customizer.js';
import {
    createHUD, updateClock, updateWeekProgress, updateStats, updateTaskBoard,
    addChatMessage, addLogMessage, showNotification, showWeeklyReport,
    showAgentPanel, updateTeamBar, setTeamBarAvatarCustomizer
} from './src/components/hud.js';

function init() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.className = 'pixel-app';

    // ---- Canvas ----
    const canvas = document.createElement('canvas');
    canvas.id = 'game-canvas';
    app.appendChild(canvas);

    // ---- HUD ----
    const hud = createHUD();
    app.appendChild(hud);

    // ---- Simulation Engine ----
    const engine = new SimulationEngine();

    // ---- 3D Renderer ----
    const renderer = new ThreeRenderer(canvas);
    renderer.initAgents(engine.employees);

    // ---- Avatar Customizer ----
    const avatarCustomizer = new AvatarCustomizer(engine.employees, (empId, cfg) => {
        // Called when user saves avatar => refresh the renderer label + team bar
        renderer.refreshAvatar(empId);
        updateTeamBar(engine.employees);
    });
    renderer.setAvatarCustomizer(avatarCustomizer);
    setTeamBarAvatarCustomizer(avatarCustomizer);


    // Agent click handler
    renderer.onAgentSelect = (agent) => {
        showAgentPanel(agent);
    };

    // ---- Connect engine events to renderer ----

    engine.on('chat', (data) => {
        if (data.type === 'typing') {
            renderer.addTypingIndicator(data.employee.id);
        } else if (data.type === 'message') {
            renderer.addChatBubble(data.message.employee.id, data.message.text);
            addChatMessage(data.message);
        }
    });

    engine.on('status', (data) => {
        renderer.updateAgentStatus(data.employee.id, data.status);
        updateTeamBar(engine.employees);
    });

    engine.on('stats', (stats) => {
        updateStats(stats, engine.getTaskSummary());
    });

    engine.on('log', (log) => {
        addLogMessage(log);
    });

    engine.on('task', (tasks) => {
        updateTaskBoard(tasks);
    });

    engine.on('notification', (notif) => {
        showNotification(notif);
    });

    engine.on('weeklyReport', (report) => {
        showWeeklyReport(report);
    });

    engine.on('hire_employee', (emp) => {
        renderer.addAgent(emp);
        updateTeamBar(engine.employees);
    });

    engine.on('fire_employee', (emp) => {
        renderer.removeAgent(emp.id);
        updateTeamBar(engine.employees);
    });

    engine.on('edit_employee', (emp) => {
        updateTeamBar(engine.employees);
    });

    // ---- Initialize HUD data ----
    updateStats(engine.stats, engine.getTaskSummary());
    updateTeamBar(engine.employees);
    updateTaskBoard(engine.tasks);
    engine.messages.forEach(msg => addChatMessage(msg));
    engine.logs.forEach(log => addLogMessage(log));

    // ---- Avatar Customizer Panel ----
    document.addEventListener('openAvatarCustomizer', (e) => {
        avatarCustomizer.openPanel(e.detail.empId);
    });

    // ---- Interactive Task Modals ----
    document.addEventListener('openTaskModal', (e) => {
        const { task, currentCol } = e.detail;
        showTaskDetailsModal(task, currentCol, engine);
    });

    document.addEventListener('openCreateTaskModal', (e) => {
        const { assigneeId } = e.detail || {};
        showCreateTaskModal(assigneeId, engine);
    });

    document.getElementById('hud-add-task-btn')?.addEventListener('click', () => {
        showCreateTaskModal(null, engine);
    });

    // ---- Clock & Week progress ----
    setInterval(() => {
        updateClock();
        updateWeekProgress(engine.weekNumber, engine.getWeekProgress());
    }, 1000);
    updateClock();

    // ---- Start simulation ----
    engine.start();

    // ---- Render loop ----
    let lastTime = performance.now();
    function gameLoop(timestamp) {
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        renderer.update(dt);
        renderer.render();
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}

// ==========================================
// MODAL LOGIC
// ==========================================

function showTaskDetailsModal(task, currentCol, engine) {
    const modal = document.getElementById('hud-task-modal');
    const content = document.getElementById('hud-task-modal-content');
    if (!modal || !content) return;

    const cols = [
        { id: 'backlog', name: '📥 Backlog' },
        { id: 'assigned', name: '📌 Assigned' },
        { id: 'inProgress', name: '🔨 In Progress' },
        { id: 'review', name: '🔍 Review' },
        { id: 'done', name: '✅ Done' }
    ];

    const isDone = currentCol === 'done';

    content.innerHTML = `
        <div class="hud-modal-header">
            <h3>${task.title}</h3>
            <span class="hud-modal-tag ${task.priority}">${task.priority}</span>
        </div>
        <div class="hud-modal-body">
            <div class="hud-modal-row">
                <label>Assignee:</label>
                <span>${task.assignee?.name || 'Unassigned'}</span>
            </div>
            <div class="hud-modal-row">
                <label>Status Column:</label>
                <select id="modal-task-col" class="hud-modal-input">
                    ${cols.map(c => `<option value="${c.id}" ${c.id === currentCol ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="hud-modal-row">
                <label>Checklist:</label>
                <div class="hud-modal-checklist" id="modal-checklist">
                    ${(task.checklist || []).map((c, idx) => `
                        <label class="hud-check-item ${c.done ? 'done' : ''}">
                            <input type="checkbox" data-id="${c.id}" ${c.done ? 'checked' : ''} ${isDone ? 'disabled' : ''}>
                            <span>${c.text}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            ${!isDone ? `
            <div class="hud-modal-add-check">
                <input type="text" id="new-check-text" placeholder="Add checklist item..." class="hud-modal-input">
                <button id="add-check-btn" class="hud-modal-btn">+</button>
            </div>
            ` : ''}
        </div>
        <div class="hud-modal-footer">
            <button id="modal-close-btn" class="hud-modal-btn ghost">Close</button>
            <button id="modal-save-btn" class="hud-modal-btn primary">Save Changes</button>
        </div>
    `;

    modal.style.display = 'flex';

    // Checklist toggles
    content.querySelectorAll('#modal-checklist input[type="checkbox"]').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const checkId = e.target.getAttribute('data-id');
            engine.toggleTaskChecklist(task.id, checkId, e.target.checked);
            if (e.target.checked) {
                e.target.closest('label').classList.add('done');
            } else {
                e.target.closest('label').classList.remove('done');
            }
        });
    });

    // Add Checklist item
    const addCheckBtn = document.getElementById('add-check-btn');
    if (addCheckBtn) {
        addCheckBtn.addEventListener('click', () => {
            const text = document.getElementById('new-check-text').value.trim();
            if (text) {
                engine.addTaskChecklistItem(task.id, text);
                showTaskDetailsModal(task, currentCol, engine); // Re-render
            }
        });
    }

    // Save
    document.getElementById('modal-save-btn').addEventListener('click', () => {
        const newCol = document.getElementById('modal-task-col').value;
        if (newCol !== currentCol) {
            engine.updateTaskStatus(task.id, newCol);
        }
        modal.style.display = 'none';
    });

    document.getElementById('modal-close-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

function showCreateTaskModal(defaultAssigneeId, engine) {
    const modal = document.getElementById('hud-task-modal');
    const content = document.getElementById('hud-task-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
        <div class="hud-modal-header">
            <h3>Create New Task</h3>
        </div>
        <div class="hud-modal-body">
            <div class="hud-modal-row vertical">
                <label>Task Title</label>
                <input type="text" id="new-task-title" class="hud-modal-input full" placeholder="E.g. Fix 3D lighting bugs" required>
            </div>
            <div class="hud-modal-row">
                <label>Assignee</label>
                <select id="new-task-assignee" class="hud-modal-input">
                    ${engine.employees.map(e => `<option value="${e.id}" ${e.id === defaultAssigneeId ? 'selected' : ''}>${e.name} (${e.role})</option>`).join('')}
                </select>
            </div>
            <div class="hud-modal-row">
                <label>Priority</label>
                <select id="new-task-priority" class="hud-modal-input">
                    <option value="high">High</option>
                    <option value="medium" selected>Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>
            <div class="hud-modal-row vertical">
                <label>Checklist (comma separated)</label>
                <input type="text" id="new-task-checks" class="hud-modal-input full" placeholder="E.g. Check models, Run tests">
            </div>
        </div>
        <div class="hud-modal-footer">
            <button id="modal-cancel-btn" class="hud-modal-btn ghost">Cancel</button>
            <button id="modal-create-btn" class="hud-modal-btn primary">Create Task</button>
        </div>
    `;

    modal.style.display = 'flex';

    document.getElementById('modal-create-btn').addEventListener('click', () => {
        const title = document.getElementById('new-task-title').value.trim();
        const assigneeId = document.getElementById('new-task-assignee').value;
        const priority = document.getElementById('new-task-priority').value;
        const checksRaw = document.getElementById('new-task-checks').value;
        const checklist = checksRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);

        if (title) {
            engine.addUserTask(title, assigneeId, priority, null, checklist);
            modal.style.display = 'none';
        } else {
            document.getElementById('new-task-title').style.border = '1px solid #EF4444';
        }
    });

    document.getElementById('modal-cancel-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
