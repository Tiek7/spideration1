import { statusLabels } from '../data/employees.js';

export function createTeam(engine) {
    const panel = document.createElement('div');
    panel.className = 'panel panel-team';
    panel.id = 'panel-team';
    panel.style.display = 'none';

    function render() {
        panel.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">👥 Team Overview</h2>
        <span class="panel-badge">${engine.employees.length} Members</span>
      </div>
      <div class="team-grid">
        ${engine.employees.map(e => {
            const st = statusLabels[e.status] || statusLabels.working;
            return `
            <div class="team-card">
              <div class="team-card-glow" style="background: ${e.color}"></div>
              <div class="team-card-avatar" style="border-color: ${e.color}; box-shadow: 0 0 20px ${e.color}40">
                ${e.avatar}
              </div>
              <div class="team-card-name">${e.name}</div>
              <div class="team-card-role" style="color: ${e.color}">${e.role}</div>
              <div class="team-card-status">
                <span class="team-status-dot" style="background: ${st.color}"></span>
                <span class="team-status-label">${st.icon} ${st.label}</span>
              </div>
              <div class="team-card-skills">
                ${e.skills.map(s => `<span class="team-skill-tag">${s}</span>`).join('')}
              </div>
              <div class="team-card-activity">
                <div class="team-activity-bar">
                  <div class="team-activity-fill" style="width: ${Math.random() * 40 + 60}%; background: ${e.color}"></div>
                </div>
                <span class="team-activity-label">Activity</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    }

    render();
    engine.on('status', render);

    return panel;
}
