import { statusLabels } from '../data/employees.js';

export function createDashboard(engine) {
  const panel = document.createElement('div');
  panel.className = 'panel panel-dashboard';
  panel.id = 'panel-dashboard';

  function render() {
    const s = engine.stats;
    panel.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">📊 Dashboard Overview</h2>
        <span class="panel-badge">Real-time</span>
      </div>
      <div class="dashboard-stats">
        <div class="stat-card stat-card--purple">
          <div class="stat-card-icon">🤖</div>
          <div class="stat-card-content">
            <div class="stat-card-value" id="stat-agents">${s.activeAgents}</div>
            <div class="stat-card-label">Active Agents</div>
          </div>
          <div class="stat-card-glow"></div>
        </div>
        <div class="stat-card stat-card--cyan">
          <div class="stat-card-icon">✅</div>
          <div class="stat-card-content">
            <div class="stat-card-value" id="stat-tasks">${s.tasksCompleted}</div>
            <div class="stat-card-label">Tasks Completed</div>
          </div>
          <div class="stat-card-glow"></div>
        </div>
        <div class="stat-card stat-card--pink">
          <div class="stat-card-icon">💬</div>
          <div class="stat-card-content">
            <div class="stat-card-value" id="stat-messages">${s.messagesPerHour}</div>
            <div class="stat-card-label">Messages / hr</div>
          </div>
          <div class="stat-card-glow"></div>
        </div>
        <div class="stat-card stat-card--green">
          <div class="stat-card-icon">⏱️</div>
          <div class="stat-card-content">
            <div class="stat-card-value" id="stat-uptime">${s.uptime}</div>
            <div class="stat-card-label">System Uptime</div>
          </div>
          <div class="stat-card-glow"></div>
        </div>
      </div>
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3 class="dashboard-card-title">🏃 Active Tasks</h3>
          <div class="mini-task-list">
            ${engine.tasks.inProgress.slice(0, 4).map(t => `
              <div class="mini-task">
                <span class="mini-task-avatar">${t.assignee.avatar}</span>
                <span class="mini-task-title">${t.title}</span>
                <div class="mini-task-progress">
                  <div class="mini-task-progress-bar" style="width: ${t.progress || 0}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="dashboard-card">
          <h3 class="dashboard-card-title">💬 Recent Messages</h3>
          <div class="mini-chat-list">
            ${engine.messages.slice(-4).map(m => `
              <div class="mini-chat">
                <span class="mini-chat-avatar">${m.employee.avatar}</span>
                <div class="mini-chat-content">
                  <span class="mini-chat-name">${m.employee.name}</span>
                  <span class="mini-chat-text">${m.text.substring(0, 60)}...</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="dashboard-card">
          <h3 class="dashboard-card-title">👥 Team Status</h3>
          <div class="mini-team-grid">
            ${engine.employees.map(e => `
              <div class="mini-team-member">
                <span class="mini-team-avatar">${e.avatar}</span>
                <span class="mini-team-name">${e.name}</span>
                <span class="mini-team-status" style="background: ${(statusLabels[e.status]?.color || '#6B7280')}20; color: ${statusLabels[e.status]?.color || '#6B7280'}">
                  ${statusLabels[e.status]?.icon || '💼'} ${statusLabels[e.status]?.label || e.status}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="dashboard-card">
          <h3 class="dashboard-card-title">🖥️ System Logs</h3>
          <div class="mini-log-list">
            ${engine.logs.slice(-5).map(l => `
              <div class="mini-log mini-log--${l.level.toLowerCase()}">
                <span class="mini-log-level">[${l.level}]</span>
                <span class="mini-log-msg">${l.message.substring(0, 50)}${l.message.length > 50 ? '...' : ''}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  render();

  // Listen for updates
  engine.on('stats', () => {
    const agentsEl = panel.querySelector('#stat-agents');
    const tasksEl = panel.querySelector('#stat-tasks');
    const msgsEl = panel.querySelector('#stat-messages');
    if (agentsEl) agentsEl.textContent = engine.stats.activeAgents;
    if (tasksEl) tasksEl.textContent = engine.stats.tasksCompleted;
    if (msgsEl) msgsEl.textContent = engine.stats.messagesPerHour;
  });

  // Re-render periodically to keep dashboard fresh
  setInterval(render, 8000);

  return panel;
}
