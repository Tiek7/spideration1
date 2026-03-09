export function createTerminal(engine) {
    const panel = document.createElement('div');
    panel.className = 'panel panel-terminal';
    panel.id = 'panel-terminal';
    panel.style.display = 'none';

    panel.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">🖥️ System Terminal</h2>
      <span class="panel-badge panel-badge--terminal">AI-DEPT-PROD</span>
    </div>
    <div class="terminal-window">
      <div class="terminal-bar">
        <div class="terminal-dots">
          <span class="terminal-dot terminal-dot--red"></span>
          <span class="terminal-dot terminal-dot--yellow"></span>
          <span class="terminal-dot terminal-dot--green"></span>
        </div>
        <span class="terminal-title">ai-department@prod:~$</span>
      </div>
      <div class="terminal-body" id="terminal-body">
        <div class="terminal-line terminal-line--system">
          <span class="terminal-prompt">$</span>
          <span>ai-department-monitor --watch --verbose</span>
        </div>
        <div class="terminal-line terminal-line--system">
          <span class="terminal-info">[SYSTEM]</span>
          <span>Monitoring started. Watching 8 AI agents across 6 services...</span>
        </div>
        <div class="terminal-line terminal-line--system">
          <span class="terminal-separator">──────────────────────────────────────────────</span>
        </div>
      </div>
    </div>
  `;

    const terminalBody = panel.querySelector('#terminal-body');

    // Render initial logs
    engine.logs.forEach(log => appendLog(log, false));

    function appendLog(log, animate = true) {
        const levelColors = {
            INFO: '#06B6D4',
            WARN: '#F59E0B',
            ERROR: '#EF4444',
            SUCCESS: '#10B981',
        };

        const div = document.createElement('div');
        div.className = `terminal-line ${animate ? 'terminal-line--animate' : ''}`;
        div.innerHTML = `
      <span class="terminal-time">${log.timestamp}</span>
      <span class="terminal-level" style="color: ${levelColors[log.level] || '#06B6D4'}">[${log.level}]</span>
      <span class="terminal-message">${log.message}</span>
    `;
        terminalBody.appendChild(div);
        terminalBody.scrollTop = terminalBody.scrollHeight;

        // Keep terminal lines manageable
        while (terminalBody.children.length > 60) {
            terminalBody.removeChild(terminalBody.children[3]); // Keep header lines
        }
    }

    engine.on('log', (log) => {
        appendLog(log, true);
    });

    return panel;
}
