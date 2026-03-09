export function createMeetings(engine) {
    const panel = document.createElement('div');
    panel.className = 'panel panel-meetings';
    panel.id = 'panel-meetings';
    panel.style.display = 'none';

    function render() {
        panel.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">🏢 Meeting Rooms</h2>
        <span class="panel-badge">${engine.meetings.filter(m => m.active).length} Active</span>
      </div>
      <div class="meetings-grid">
        ${engine.meetings.map(m => `
          <div class="meeting-card ${m.active ? 'meeting-card--active' : 'meeting-card--ended'}">
            <div class="meeting-card-header">
              <div class="meeting-card-status">
                ${m.active ? '<span class="status-dot status-dot--pulse"></span>' : ''}
                <span class="meeting-status-text">${m.active ? 'LIVE' : 'Ended'}</span>
              </div>
              <span class="meeting-type-badge meeting-type--${m.type}">${m.type}</span>
            </div>
            <h3 class="meeting-card-title">${m.title}</h3>
            <div class="meeting-card-meta">
              <span class="meeting-meta-item">⏱️ ${m.duration}</span>
              <span class="meeting-meta-item">⏳ ${m.elapsed} min elapsed</span>
              <span class="meeting-meta-item">🕐 Started: ${m.startedAt}</span>
            </div>
            <div class="meeting-participants">
              <span class="meeting-participants-label">Participants:</span>
              <div class="meeting-participants-list">
                ${m.participants.map(p => `
                  <div class="meeting-participant" title="${p.name} - ${p.role}">
                    <span class="meeting-participant-avatar" style="border-color: ${p.color}">${p.avatar}</span>
                    <span class="meeting-participant-name">${p.name}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            ${m.active ? `
              <div class="meeting-discussion">
                <div class="meeting-discussion-header">
                  <span class="meeting-discussion-icon">💭</span>
                  Live Discussion
                </div>
                <div class="meeting-discussion-snippet">
                  ${m.participants.slice(0, 2).map(p => `
                    <div class="meeting-snippet">
                      <span class="snippet-avatar">${p.avatar}</span>
                      <span class="snippet-text">${getRandomDiscussion(p.role)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
    }

    render();
    engine.on('meeting', render);

    return panel;
}

const discussionSnippets = {
    'Project Manager': [
        "We need to align on the Q2 deliverables...",
        "Let's review the timeline for the API migration.",
        "The client feedback is positive. Let's capitalize on this momentum.",
    ],
    'Senior Developer': [
        "I propose we use a microservices approach for better scalability.",
        "The technical debt in module X is becoming critical.",
        "We should implement feature flags for the next release.",
    ],
    'UI/UX Designer': [
        "The user testing revealed some navigation pain points.",
        "I'd recommend a progressive disclosure pattern here.",
        "The accessibility score needs to reach WCAG AA compliance.",
    ],
    'QA Engineer': [
        "Our test coverage dropped 3% after the last merge.",
        "I'll set up the regression suite for the new features.",
        "We need more E2E coverage on the payment flow.",
    ],
    'DevOps Engineer': [
        "The infrastructure costs can be optimized by 20%.",
        "I'll configure auto-scaling for the holiday traffic surge.",
        "The deployment pipeline needs a rollback mechanism.",
    ],
    'Data Analyst': [
        "The conversion funnel data shows a drop at step 3.",
        "I can build a predictive model for this use case.",
        "The data warehouse migration is 80% complete.",
    ],
    'Backend Developer': [
        "The new API endpoint handles 5x more throughput.",
        "I suggest adding a caching layer for frequent queries.",
        "The database sharding strategy needs revision.",
    ],
    'Tech Lead': [
        "Let's align our architecture with the industry best practices.",
        "I propose a bi-weekly knowledge sharing session.",
        "We should evaluate the new framework for our next project.",
    ],
};

function getRandomDiscussion(role) {
    const snippets = discussionSnippets[role] || discussionSnippets['Senior Developer'];
    return snippets[Math.floor(Math.random() * snippets.length)];
}
