export function createChat(engine) {
    const panel = document.createElement('div');
    panel.className = 'panel panel-chat';
    panel.id = 'panel-chat';
    panel.style.display = 'none';

    panel.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">💬 Live Chat — #general</h2>
      <span class="panel-badge panel-badge--live">
        <span class="status-dot status-dot--pulse"></span>
        Live Feed
      </span>
    </div>
    <div class="chat-messages" id="chat-messages"></div>
    <div class="chat-typing" id="chat-typing" style="display: none;">
      <span class="typing-avatar" id="typing-avatar"></span>
      <span class="typing-indicator">
        <span class="typing-name" id="typing-name"></span> is thinking
        <span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>
      </span>
    </div>
  `;

    const messagesContainer = panel.querySelector('#chat-messages');
    const typingEl = panel.querySelector('#chat-typing');

    // Render initial messages
    engine.messages.forEach(msg => {
        appendMessage(msg, false);
    });

    function appendMessage(msg, animate = true) {
        const div = document.createElement('div');
        div.className = `chat-msg ${animate ? 'chat-msg--animate' : ''}`;
        div.innerHTML = `
      <div class="chat-msg-avatar" style="background: ${msg.employee.color}20; border-color: ${msg.employee.color}">
        ${msg.employee.avatar}
      </div>
      <div class="chat-msg-body">
        <div class="chat-msg-header">
          <span class="chat-msg-name" style="color: ${msg.employee.color}">${msg.employee.name}</span>
          <span class="chat-msg-role">${msg.employee.role}</span>
          <span class="chat-msg-time">${msg.timestamp}</span>
        </div>
        <div class="chat-msg-text">${animate ? '' : msg.text}</div>
      </div>
    `;
        messagesContainer.appendChild(div);

        if (animate) {
            // Typewriter effect
            const textEl = div.querySelector('.chat-msg-text');
            typeWriter(textEl, msg.text, 0);
        }

        // Auto scroll
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function typeWriter(el, text, i) {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            setTimeout(() => typeWriter(el, text, i + 1), 12 + Math.random() * 18);
        }
    }

    engine.on('chat', (data) => {
        if (data.type === 'typing') {
            typingEl.style.display = 'flex';
            panel.querySelector('#typing-avatar').textContent = data.employee.avatar;
            panel.querySelector('#typing-name').textContent = data.employee.name;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } else if (data.type === 'message') {
            typingEl.style.display = 'none';
            appendMessage(data.message, true);
        }
    });

    return panel;
}
