// =============================================
// HUD OVERLAY — CG Production Department
// Task Board, Weekly Report, Chat, Terminal
// =============================================

import { statusLabels } from '../data/employees.js';
import { ROBOT_COLORS } from '../data/sprites.js';

export function createHUD() {
  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = `
    <div class="hud-top">
      <div class="hud-title">
        <span class="hud-logo">🎬</span>
        <span class="hud-title-text">SPIDERATION</span>
        <span class="hud-subtitle">Post Production Department</span>
      </div>
      <div class="hud-info">
        <div class="hud-week" id="hud-week">
          <span class="hud-week-label">TUẦN</span>
          <span class="hud-week-num" id="hud-week-num">1</span>
          <div class="hud-week-bar"><div class="hud-week-fill" id="hud-week-fill"></div></div>
        </div>
        <div class="hud-clock" id="hud-clock">00:00:00</div>
        <div class="hud-live">
          <span class="hud-live-dot"></span> LIVE
        </div>
        <button class="hud-settings-btn" id="hud-settings-btn" title="Cài đặt">⚙️</button>
      </div>
    </div>

    <div class="hud-stats" id="hud-stats">
      <div class="hud-stat">
        <span class="hud-stat-value" id="stat-agents">5</span>
        <span class="hud-stat-label">TEAM</span>
      </div>
      <div class="hud-stat">
        <span class="hud-stat-value" id="stat-tasks">0</span>
        <span class="hud-stat-label">DONE</span>
      </div>
      <div class="hud-stat">
        <span class="hud-stat-value" id="stat-pending">0</span>
        <span class="hud-stat-label">PENDING</span>
      </div>
      <div class="hud-stat">
        <span class="hud-stat-value" id="stat-uptime">99.97%</span>
        <span class="hud-stat-label">UPTIME</span>
      </div>
    </div>

    <div class="hud-agent-panel" id="hud-agent-panel" style="display:none">
      <div class="hud-agent-header">
        <span class="hud-agent-close" id="hud-agent-close">✕</span>
        <span class="hud-agent-name" id="hud-agent-name"></span>
        <span class="hud-agent-role" id="hud-agent-role"></span>
      </div>
      <div class="hud-agent-status" id="hud-agent-status"></div>
      <div class="hud-agent-skills" id="hud-agent-skills"></div>
    </div>

    <div class="hud-notification-area" id="hud-notification-area"></div>

    <div class="hud-bottom">
      <div class="hud-panel-toggle">
        <button class="hud-tab active" data-panel="tasks">📋 TASKS</button>
        <button class="hud-tab" data-panel="chat">💬 CHAT</button>
        <button class="hud-tab" data-panel="log">🖥️ TERMINAL</button>
      </div>
      <div class="hud-panel-content">
        <div class="hud-tasks-panel" id="hud-tasks-panel">
          <div class="hud-kanban" id="hud-kanban">
            <div class="hud-kanban-col" data-col="backlog">
              <div class="hud-kanban-header">
                📥 Backlog <span class="hud-kanban-count" id="count-backlog">0</span>
                <div class="hud-backlog-actions">
                  <button class="hud-add-task-btn" id="hud-add-task-btn" title="Thêm task">+</button>
                  <button class="hud-import-btn" id="hud-import-btn" title="Import Excel">📂</button>
                  <input type="file" id="hud-excel-input" accept=".xlsx,.xls,.csv" style="display:none">
                </div>
              </div>
              <div class="hud-kanban-cards" id="cards-backlog"></div>
            </div>
            <div class="hud-kanban-col" data-col="assigned">
              <div class="hud-kanban-header">📌 Assigned <span class="hud-kanban-count" id="count-assigned">0</span></div>
              <div class="hud-kanban-cards" id="cards-assigned"></div>
            </div>
            <div class="hud-kanban-col" data-col="inProgress">
              <div class="hud-kanban-header">🔨 In Progress <span class="hud-kanban-count" id="count-inProgress">0</span></div>
              <div class="hud-kanban-cards" id="cards-inProgress"></div>
            </div>
            <div class="hud-kanban-col" data-col="review">
              <div class="hud-kanban-header">🔍 Review <span class="hud-kanban-count" id="count-review">0</span></div>
              <div class="hud-kanban-cards" id="cards-review"></div>
            </div>
            <div class="hud-kanban-col" data-col="done">
              <div class="hud-kanban-header">✅ Done <span class="hud-kanban-count" id="count-done">0</span></div>
              <div class="hud-kanban-cards" id="cards-done"></div>
            </div>
          </div>
        </div>
        <div class="hud-chat-panel" id="hud-chat-panel" style="display:none">
          <div class="hud-chat-messages" id="hud-chat-messages"></div>
          <div class="hud-chat-input-bar">
            <input class="hud-chat-input" id="hud-chat-input" type="text" placeholder="Nhắn tin với team... (Enter để gửi)" maxlength="200">
            <button class="hud-chat-send" id="hud-chat-send">Gửi</button>
          </div>
        </div>
        <div class="hud-log-panel" id="hud-log-panel" style="display:none">
          <div class="hud-log-messages" id="hud-log-messages"></div>
        </div>
      </div>
    </div>

    <div class="hud-team-bar" id="hud-team-bar"></div>

    <!-- Settings Panel (character scale) -->
    <div class="hud-settings-panel" id="hud-settings-panel" style="display:none">
      <div class="hud-settings-header">
        <span>⚙️ Cài đặt</span>
        <button class="hud-settings-close" id="hud-settings-close">✕</button>
      </div>
      <div class="hud-settings-row">
        <label class="hud-settings-label">🧑 Kích thước nhân vật</label>
        <div class="hud-slider-row">
          <span class="hud-slider-val">Nhỏ</span>
          <input type="range" id="char-scale-slider" min="0.5" max="2.0" step="0.05" value="1.0" class="hud-slider">
          <span class="hud-slider-val">To</span>
        </div>
        <div class="hud-slider-current" id="char-scale-current">1.0×</div>
      </div>
    </div>

    <div class="hud-weekly-modal" id="hud-weekly-modal" style="display:none">
      <div class="hud-weekly-content" id="hud-weekly-content"></div>
    </div>

    <!-- Task Details / Edit Modal -->
    <div class="hud-task-modal" id="hud-task-modal" style="display:none">
      <div class="hud-task-modal-bg" id="hud-task-modal-bg"></div>
      <div class="hud-task-modal-content" id="hud-task-modal-content">
        <!-- Injected via JS -->
      </div>
    </div>
  `;

  // Tab switching
  hud.querySelectorAll('.hud-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      hud.querySelectorAll('.hud-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const panel = tab.dataset.panel;
      document.getElementById('hud-tasks-panel').style.display = panel === 'tasks' ? 'block' : 'none';
      // Chat panel uses class for flex display so input bar works
      const chatPanel = document.getElementById('hud-chat-panel');
      chatPanel.style.display = 'none';
      chatPanel.classList.toggle('chat-active', panel === 'chat');
      if (panel === 'chat') chatPanel.style.display = '';
      document.getElementById('hud-log-panel').style.display = panel === 'log' ? 'block' : 'none';
    });
  });

  // Close agent panel + settings + scale slider + chat send + excel import
  setTimeout(() => {
    // Agent panel close
    document.getElementById('hud-agent-close')?.addEventListener('click', () => {
      document.getElementById('hud-agent-panel').style.display = 'none';
    });

    // Modal Background Close
    document.getElementById('hud-task-modal-bg')?.addEventListener('click', () => {
      document.getElementById('hud-task-modal').style.display = 'none';
    });

    // ⚙️ Settings panel toggle
    document.getElementById('hud-settings-btn')?.addEventListener('click', () => {
      const p = document.getElementById('hud-settings-panel');
      p.style.display = p.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('hud-settings-close')?.addEventListener('click', () => {
      document.getElementById('hud-settings-panel').style.display = 'none';
    });

    // Scale slider → dispatch event so main.js can call renderer.setCharacterScale
    document.getElementById('char-scale-slider')?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      document.getElementById('char-scale-current').textContent = `${val.toFixed(2)}×`;
      document.dispatchEvent(new CustomEvent('charScaleChange', { detail: { scale: val } }));
    });

    // Excel import
    document.getElementById('hud-import-btn')?.addEventListener('click', () => {
      document.getElementById('hud-excel-input')?.click();
    });
    document.getElementById('hud-excel-input')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        document.dispatchEvent(new CustomEvent('excelImport', { detail: { file } }));
        e.target.value = ''; // reset so same file can be re-imported
      }
    });

    // Chat input send (button + Enter key)
    function sendChat() {
      const input = document.getElementById('hud-chat-input');
      if (!input?.value.trim()) return;
      document.dispatchEvent(new CustomEvent('userChatSend', { detail: { text: input.value } }));
      input.value = '';
    }
    document.getElementById('hud-chat-send')?.addEventListener('click', sendChat);
    document.getElementById('hud-chat-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendChat();
    });
  }, 100);

  return hud;
}

// ---- Update functions ----

export function updateClock() {
  const el = document.getElementById('hud-clock');
  if (!el) return;
  const d = new Date();
  el.textContent = d.toLocaleTimeString('en-US', { hour12: false });
}

export function updateWeekProgress(weekNumber, progress) {
  const numEl = document.getElementById('hud-week-num');
  const fillEl = document.getElementById('hud-week-fill');
  if (numEl) numEl.textContent = weekNumber;
  if (fillEl) fillEl.style.width = `${Math.round(progress * 100)}%`;
}

export function updateStats(stats, taskSummary) {
  const agents = document.getElementById('stat-agents');
  const tasks = document.getElementById('stat-tasks');
  const pending = document.getElementById('stat-pending');
  const uptime = document.getElementById('stat-uptime');
  if (agents) agents.textContent = stats.activeAgents;
  if (tasks) tasks.textContent = stats.tasksCompleted;
  if (pending && taskSummary) pending.textContent = taskSummary.backlog + taskSummary.assigned + taskSummary.inProgress + taskSummary.review;
  if (uptime) uptime.textContent = stats.uptime;
}

export function updateTaskBoard(tasks) {
  const columns = ['backlog', 'assigned', 'inProgress', 'review', 'done'];

  columns.forEach(col => {
    const container = document.getElementById(`cards-${col}`);
    const countEl = document.getElementById(`count-${col}`);
    if (!container) return;

    const items = tasks[col] || [];
    if (countEl) countEl.textContent = items.length;

    container.innerHTML = items.map(task => {
      const color = ROBOT_COLORS[task.assignee?.id]?.body || '#888';
      const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
      const pColor = priorityColors[task.priority] || '#888';

      return `
        <div class="hud-task-card ${task.isUserTask ? 'user-task' : ''}" data-task-id="${task.id}" data-task-col="${col}">
          <div class="hud-task-priority" style="background:${pColor}"></div>
          <div class="hud-task-title">${task.title}</div>
          <div class="hud-task-meta">
            <span class="hud-task-assignee" style="color:${color}">${task.assignee?.name || '—'}</span>
            <span class="hud-task-deadline">${task.deadline || ''}</span>
            ${task.isUserTask ? '<span class="hud-task-manual-icon" title="Manual Task">👤</span>' : ''}
          </div>
          ${task.progress > 0 && task.progress < 100 ? `
            <div class="hud-task-progress">
              <div class="hud-task-progress-fill" style="width:${task.progress}%;background:${color}"></div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Attach click listeners to new cards
    setTimeout(() => {
      const renderedCards = container.querySelectorAll('.hud-task-card');
      renderedCards.forEach(card => {
        card.addEventListener('click', () => {
          const taskId = card.getAttribute('data-task-id');
          const colId = card.getAttribute('data-task-col');
          const task = tasks[colId]?.find(t => t.id === taskId);
          if (task) {
            // Dispatch custom event to be picked up by main.js
            const evt = new CustomEvent('openTaskModal', { detail: { task, currentCol: colId } });
            document.dispatchEvent(evt);
          }
        });
      });
    }, 10);
  });
}

export function addChatMessage(msg) {
  const container = document.getElementById('hud-chat-messages');
  if (!container) return;
  if (!msg?.employee) return;

  const isBoss = msg.employee.id === 'boss' || msg.isUser;
  const color = isBoss ? '#06B6D4' : (ROBOT_COLORS[msg.employee.id]?.body || '#8B5CF6');
  const avatar = msg.employee.avatar || '🤖';
  const time = msg.time || msg.timestamp || '';
  const text = (msg.text || '').length > 120 ? msg.text.substring(0, 117) + '…' : (msg.text || '');

  const div = document.createElement('div');
  div.className = `hud-chat-bubble ${isBoss ? 'hud-chat-bubble--boss' : ''}`;
  div.innerHTML = isBoss
    ? `
      <div class="hud-chat-row hud-chat-row--right">
        <div class="hud-chat-content hud-chat-content--right">
          <div class="hud-chat-name" style="color:${color};text-align:right">${msg.employee.name}</div>
          <div class="hud-chat-text-bubble hud-chat-text-bubble--boss">${text}</div>
          <div class="hud-chat-time">${time}</div>
        </div>
        <div class="hud-chat-avatar" style="background:${color}22;border-color:${color}">${avatar}</div>
      </div>
    `
    : `
      <div class="hud-chat-row">
        <div class="hud-chat-avatar" style="background:${color}22;border-color:${color}">${avatar}</div>
        <div class="hud-chat-content">
          <div class="hud-chat-name" style="color:${color}">${msg.employee.name} <span class="hud-chat-role">${msg.employee.role || ''}</span></div>
          <div class="hud-chat-text-bubble">${text}</div>
          <div class="hud-chat-time">${time}</div>
        </div>
      </div>
    `;

  container.appendChild(div);
  while (container.children.length > 50) container.removeChild(container.firstChild);
  container.scrollTop = container.scrollHeight;
}

export function addLogMessage(log) {
  const container = document.getElementById('hud-log-messages');
  if (!container) return;

  const colors = { INFO: '#06B6D4', WARN: '#F59E0B', SUCCESS: '#10B981', ERROR: '#EF4444' };
  const div = document.createElement('div');
  div.className = 'hud-log-msg';
  div.innerHTML = `
    <span class="hud-log-level" style="color:${colors[log.level] || '#888'}">[${log.level}]</span>
    <span class="hud-log-text">${log.message}</span>
  `;
  container.appendChild(div);
  while (container.children.length > 40) container.removeChild(container.firstChild);
  container.scrollTop = container.scrollHeight;
}

export function showNotification(notification) {
  const area = document.getElementById('hud-notification-area');
  if (!area) return;

  const div = document.createElement('div');
  div.className = 'hud-notification';
  div.style.borderLeftColor = notification.color || '#8B5CF6';
  div.innerHTML = `
    <div class="hud-notif-title">${notification.title}</div>
    <div class="hud-notif-msg">${notification.message}</div>
  `;
  area.appendChild(div);

  // Auto-remove after 5s
  setTimeout(() => {
    div.classList.add('hud-notif-exit');
    setTimeout(() => div.remove(), 500);
  }, 5000);

  // Keep max 4
  while (area.children.length > 4) area.removeChild(area.firstChild);
}

export function showWeeklyReport(report) {
  const modal = document.getElementById('hud-weekly-modal');
  const content = document.getElementById('hud-weekly-content');
  if (!modal || !content) return;

  const personRows = report.perPerson.map(p => {
    const color = ROBOT_COLORS[Object.keys(ROBOT_COLORS).find(k =>
      k === p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    )]?.body || '#888';
    return `
      <div class="hud-weekly-person">
        <span class="hud-weekly-pname" style="color:${color}">${p.name}</span>
        <span class="hud-weekly-prole">${p.role}</span>
        <span class="hud-weekly-pcount">✅ ${p.completed} | 🔨 ${p.inProgress}</span>
      </div>
    `;
  }).join('');

  const deadlineRows = report.upcomingDeadlines.map(d => `
    <div class="hud-weekly-deadline">
      <span>📌 ${d.title}</span>
      <span style="color:#F59E0B">${d.assignee} — ${d.deadline}</span>
    </div>
  `).join('');

  content.innerHTML = `
    <div class="hud-weekly-header">
      <span class="hud-weekly-icon">📊</span>
      <span>BÁO CÁO TUẦN ${report.weekNumber}</span>
      <button class="hud-weekly-close" id="weekly-close">✕</button>
    </div>
    <div class="hud-weekly-summary">
      <div class="hud-weekly-stat">
        <span class="hud-ws-value" style="color:#10B981">${report.summary.completed}</span>
        <span class="hud-ws-label">Hoàn thành</span>
      </div>
      <div class="hud-weekly-stat">
        <span class="hud-ws-value" style="color:#F59E0B">${report.summary.inProgress}</span>
        <span class="hud-ws-label">Đang làm</span>
      </div>
      <div class="hud-weekly-stat">
        <span class="hud-ws-value" style="color:#6B7280">${report.summary.pending}</span>
        <span class="hud-ws-label">Chờ</span>
      </div>
      <div class="hud-weekly-stat">
        <span class="hud-ws-value" style="color:#8B5CF6">${report.summary.completionRate}%</span>
        <span class="hud-ws-label">Tỉ lệ</span>
      </div>
    </div>
    <div class="hud-weekly-section-title">👥 Tiến độ theo người</div>
    <div class="hud-weekly-persons">${personRows}</div>
    ${report.upcomingDeadlines.length > 0 ? `
      <div class="hud-weekly-section-title">⏰ Deadline sắp tới</div>
      <div class="hud-weekly-deadlines">${deadlineRows}</div>
    ` : ''}
  `;

  modal.style.display = 'flex';

  // Close button
  document.getElementById('weekly-close')?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Auto-close after 12s
  setTimeout(() => { modal.style.display = 'none'; }, 12000);
}

export function showAgentPanel(agent) {
  const panel = document.getElementById('hud-agent-panel');
  if (!panel) return;
  if (!agent) { panel.style.display = 'none'; return; }

  panel.style.display = 'block';
  const color = ROBOT_COLORS[agent.id]?.body || '#8B5CF6';
  document.getElementById('hud-agent-name').textContent = agent.name;
  document.getElementById('hud-agent-name').style.color = color;
  document.getElementById('hud-agent-role').textContent = agent.role;
  const statusInfo = statusLabels[agent.status];
  document.getElementById('hud-agent-status').innerHTML = `
    <span style="color:${statusInfo?.color || '#888'}">${statusInfo?.icon || '💼'} ${statusInfo?.label || agent.status}</span>
  `;
  document.getElementById('hud-agent-skills').innerHTML = agent.skills
    .map(s => `<span class="hud-skill-tag">${s}</span>`).join('');

  // Add direct assignment button
  const currentHtml = document.getElementById('hud-agent-skills').innerHTML;
  document.getElementById('hud-agent-skills').innerHTML = currentHtml + `
    <button class="hud-agent-assign-btn" data-agent-id="${agent.id}">+ Giao việc</button>
  `;

  // Attach listener to button
  setTimeout(() => {
    const btn = document.querySelector('.hud-agent-assign-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const evt = new CustomEvent('openCreateTaskModal', { detail: { assigneeId: agent.id } });
        document.dispatchEvent(evt);
      });
    }
  }, 10);
}

// avatarCustomizer is optional — passed from main.js after init
let _teamBarAvatarCustomizer = null;
export function setTeamBarAvatarCustomizer(ac) {
  _teamBarAvatarCustomizer = ac;
}

export function updateTeamBar(employees) {
  const bar = document.getElementById('hud-team-bar');
  if (!bar) return;
  bar.innerHTML = employees.map(emp => {
    const color = ROBOT_COLORS[emp.id]?.body || '#8B5CF6';
    const statusInfo = statusLabels[emp.status];
    const statusColor = statusInfo?.color || '#888';
    return `
      <div class="hud-team-member" title="${emp.name} \u2014 ${statusInfo?.label || emp.status}" data-emp-id="${emp.id}">
        <div style="position:relative;">
          <canvas id="team-avatar-${emp.id}" width="40" height="50"
            style="image-rendering:pixelated; border-radius:8px; background:#0a0820; border:2px solid ${color}; display:block;"></canvas>
          <div class="hud-team-dot" style="background:${statusColor}; position:absolute; bottom:2px; right:2px;"></div>
        </div>
        <div class="hud-team-name">${emp.name}</div>
        <div class="hud-team-role" style="color:#88a; font-size:9px; text-align:center;">${emp.role}</div>
        <button class="hud-avatar-edit-btn" data-emp-id="${emp.id}" title="Custom hóa nhân vật">✏️</button>
      </div>
    `;
  }).join('');

  // Draw pixel persons after DOM insert
  if (_teamBarAvatarCustomizer) {
    for (const emp of employees) {
      const c = document.getElementById(`team-avatar-${emp.id}`);
      if (c) {
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        _teamBarAvatarCustomizer.drawPixelPerson(ctx, 20, 36, emp.id, 1.2);
      }
    }
  } else {
    // Fallback: emoji avatar if no customizer
    for (const emp of employees) {
      const c = document.getElementById(`team-avatar-${emp.id}`);
      if (c) {
        const ctx = c.getContext('2d');
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.fillText(emp.avatar || '🤖', 20, 36);
      }
    }
  }

  // Wire up Edit buttons
  bar.querySelectorAll('.hud-avatar-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const empId = btn.dataset.empId;
      const evt = new CustomEvent('openAvatarCustomizer', { detail: { empId } });
      document.dispatchEvent(evt);
    });
  });
}
