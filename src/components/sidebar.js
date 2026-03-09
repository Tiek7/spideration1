export function createSidebar(onNavigate) {
  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'chat', icon: '💬', label: 'Live Chat' },
    { id: 'tasks', icon: '📋', label: 'Task Board' },
    { id: 'team', icon: '👥', label: 'Team' },
    { id: 'meetings', icon: '🏢', label: 'Meetings' },
    { id: 'terminal', icon: '🖥️', label: 'Terminal' },
  ];

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">🧠</div>
      <span class="sidebar-logo-text">AI Dept.</span>
    </div>
    <nav class="sidebar-nav">
      ${navItems.map(item => `
        <button class="sidebar-nav-item ${item.id === 'dashboard' ? 'active' : ''}" data-panel="${item.id}">
          <span class="sidebar-nav-icon">${item.icon}</span>
          <span class="sidebar-nav-label">${item.label}</span>
        </button>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-status">
        <div class="status-dot status-dot--pulse"></div>
        <span>System Online</span>
      </div>
    </div>
  `;

  sidebar.querySelectorAll('.sidebar-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      sidebar.querySelectorAll('.sidebar-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onNavigate(btn.dataset.panel);
    });
  });

  return sidebar;
}
