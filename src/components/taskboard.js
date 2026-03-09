export function createTaskBoard(engine) {
    const panel = document.createElement('div');
    panel.className = 'panel panel-tasks';
    panel.id = 'panel-tasks';
    panel.style.display = 'none';

    const priorityColors = {
        high: '#EF4444',
        medium: '#F59E0B',
        low: '#10B981',
    };

    function renderColumn(title, icon, tasks, colClass) {
        return `
      <div class="kanban-column ${colClass}">
        <div class="kanban-column-header">
          <span class="kanban-column-icon">${icon}</span>
          <span class="kanban-column-title">${title}</span>
          <span class="kanban-column-count">${tasks.length}</span>
        </div>
        <div class="kanban-column-body">
          ${tasks.map(t => `
            <div class="kanban-card">
              <div class="kanban-card-top">
                <span class="kanban-card-priority" style="background: ${priorityColors[t.priority]}20; color: ${priorityColors[t.priority]}">
                  ${t.priority.toUpperCase()}
                </span>
                <span class="kanban-card-category">${t.category}</span>
              </div>
              <div class="kanban-card-title">${t.title}</div>
              <div class="kanban-card-bottom">
                <span class="kanban-card-assignee" title="${t.assignee.name}">
                  ${t.assignee.avatar} ${t.assignee.name}
                </span>
                ${t.progress !== undefined ? `
                  <div class="kanban-card-progress">
                    <div class="kanban-card-progress-bar" style="width: ${t.progress}%"></div>
                  </div>
                  <span class="kanban-card-progress-text">${t.progress}%</span>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    }

    function render() {
        panel.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">📋 Task Board</h2>
        <span class="panel-badge">Kanban</span>
      </div>
      <div class="kanban-board">
        ${renderColumn('To Do', '📝', engine.tasks.todo, 'kanban-col-todo')}
        ${renderColumn('In Progress', '🔄', engine.tasks.inProgress, 'kanban-col-progress')}
        ${renderColumn('Review', '🔍', engine.tasks.review, 'kanban-col-review')}
        ${renderColumn('Done', '✅', engine.tasks.done, 'kanban-col-done')}
      </div>
    `;
    }

    render();

    engine.on('task', () => {
        // Add animation class before re-render
        render();
        panel.querySelectorAll('.kanban-card').forEach((card, i) => {
            card.style.animationDelay = `${i * 0.05}s`;
        });
    });

    return panel;
}
