export function createHeader() {
    const header = document.createElement('header');
    header.className = 'main-header';
    header.innerHTML = `
    <div class="header-left">
      <h1 class="header-title">
        <span class="header-title-icon">🤖</span>
        AI Department Simulator
      </h1>
      <span class="header-subtitle">Neural Network Division — Real-time Operations</span>
    </div>
    <div class="header-right">
      <div class="header-clock">
        <span class="clock-icon">🕐</span>
        <span class="clock-time" id="header-clock">${new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
      </div>
      <div class="header-sim-speed">
        <span class="speed-label">SIM Speed</span>
        <div class="speed-indicator">
          <div class="speed-bar speed-bar--active"></div>
          <div class="speed-bar speed-bar--active"></div>
          <div class="speed-bar speed-bar--active"></div>
          <div class="speed-bar"></div>
          <div class="speed-bar"></div>
        </div>
      </div>
      <div class="header-status-badge">
        <div class="status-dot status-dot--pulse"></div>
        LIVE
      </div>
    </div>
  `;

    // Update clock every second
    setInterval(() => {
        const el = header.querySelector('#header-clock');
        if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
    }, 1000);

    return header;
}
