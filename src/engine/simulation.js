import { employees, statusLabels, chatTemplates, taskTemplates, meetingTopics, terminalLogTemplates } from '../data/employees.js';
import { uid, pick, rand, timestamp } from '../utils/helpers.js';
import { io } from 'socket.io-client';

export class SimulationEngine {
    constructor() {
        this.employees = employees.map(e => ({ ...e }));
        this.messages = [];
        this.tasks = this._initTasks();
        this.meetings = this._initMeetings();
        this.logs = [];
        this.stats = {
            tasksCompleted: rand(5, 12),
            activeAgents: this.employees.length,
            messagesPerHour: rand(15, 30),
            uptime: '99.97%',
            totalMessages: 0,
        };

        this.listeners = {
            chat: [],
            task: [],
            status: [],
            meeting: [],
            log: [],
            stats: [],
            taskAssign: [],
            weeklyReport: [],
            notification: [],
            world_agent_move: [],
            hire_employee: [],
            fire_employee: [],
            edit_employee: [],
        };

        this.intervals = [];
        this._typingEmployee = null;

        // Weekly cycle tracking
        this.weekNumber = 1;
        this.weekTimer = 0;
        this.WEEK_DURATION = 60; // seconds per "week"
        this.weekStartTime = Date.now();

        // Task assignment queue
        this._pendingAssignments = [];

        this.isRunning = false;

        // Socket.IO Connection
        this.socket = null;
    }

    // ---- Task System with Kanban Flow ----
    _initTasks() {
        const columns = { backlog: [], assigned: [], inProgress: [], review: [], done: [] };
        const shuffled = [...taskTemplates].sort(() => Math.random() - 0.5);

        // Start with some tasks already in progress
        shuffled.slice(0, 3).forEach(t => {
            const assignee = this.employees.find(e => e.id === t.defaultAssignee) || pick(this.employees);
            columns.backlog.push({
                id: uid(), ...t, assignee, createdAt: timestamp(), progress: 0,
                deadline: this._generateDeadline(), createdBy: 'cong',
                checklist: t.checklist || [
                    { id: uid(), text: 'Review requirements', done: false },
                    { id: uid(), text: 'Draft implementation', done: false }
                ],
                isUserTask: false
            });
        });
        shuffled.slice(3, 5).forEach(t => {
            const assignee = this.employees.find(e => e.id === t.defaultAssignee) || pick(this.employees);
            columns.assigned.push({
                id: uid(), ...t, assignee, createdAt: timestamp(), progress: 0,
                deadline: this._generateDeadline(), assignedBy: 'quan',
                checklist: t.checklist || [
                    { id: uid(), text: 'Setup project', done: true },
                    { id: uid(), text: 'Begin coding', done: false }
                ],
                isUserTask: false
            });
        });
        shuffled.slice(5, 7).forEach(t => {
            const assignee = this.employees.find(e => e.id === t.defaultAssignee) || pick(this.employees);
            columns.inProgress.push({
                id: uid(), ...t, assignee, createdAt: timestamp(), progress: rand(20, 70),
                deadline: this._generateDeadline(), assignedBy: 'quan',
                checklist: t.checklist || [
                    { id: uid(), text: 'Implement core logic', done: true },
                    { id: uid(), text: 'Write unit tests', done: false }
                ],
                isUserTask: false
            });
        });
        shuffled.slice(7, 8).forEach(t => {
            const assignee = this.employees.find(e => e.id === t.defaultAssignee) || pick(this.employees);
            columns.review.push({
                id: uid(), ...t, assignee, createdAt: timestamp(), progress: rand(85, 95),
                deadline: this._generateDeadline(), reviewer: 'quan',
                checklist: t.checklist || [
                    { id: uid(), text: 'Code review', done: true },
                    { id: uid(), text: 'Fix PR comments', done: false }
                ],
                isUserTask: false
            });
        });
        shuffled.slice(8, 10).forEach(t => {
            const assignee = this.employees.find(e => e.id === t.defaultAssignee) || pick(this.employees);
            columns.done.push({
                id: uid(), ...t, assignee, createdAt: timestamp(), progress: 100,
                deadline: this._generateDeadline(), completedAt: timestamp(),
                checklist: t.checklist || [
                    { id: uid(), text: 'Deploy to production', done: true },
                    { id: uid(), text: 'Monitor logs', done: true }
                ],
                isUserTask: false
            });
        });

        return columns;
    }

    _generateDeadline() {
        const days = ['T2', 'T3', 'T4', 'T5', 'T6'];
        return `${pick(days)} tuần ${this.weekNumber || 1}`;
    }

    _initMeetings() {
        const meetings = [];
        const shuffledTopics = [...meetingTopics].sort(() => Math.random() - 0.5);
        for (let i = 0; i < 2; i++) {
            const topic = shuffledTopics[i];
            const participants = [...this.employees].sort(() => Math.random() - 0.5).slice(0, rand(3, 5));
            meetings.push({
                id: uid(),
                ...topic,
                participants,
                startedAt: timestamp(),
                elapsed: rand(1, 10),
                active: i === 0,
            });
        }
        return meetings;
    }

    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    // Called by ThreeRenderer when a character wanders, to sync to other clients
    emitAgentMove(id, x, y) {
        if (this.socket?.connected) {
            this.socket.emit('agent_move', { id, x, y });
        }
    }

    // ---- Excel Import ----
    bulkAddTasks(parsedTasks) {
        let added = 0;
        for (const t of parsedTasks) {
            const id = uid();
            const task = {
                id,
                title: t.title,
                assignee: t.assignee || this.employees[0],
                createdAt: timestamp(),
                progress: t.progress || 0,
                deadline: t.deadline || this._generateDeadline(),
                priority: t.priority || 'medium',
                description: t.description || '',
                checklist: [],
                isUserTask: true,
                createdBy: 'user',
            };
            const col = t.status || 'backlog';
            if (this.tasks[col]) {
                this.tasks[col].push(task);
                added++;
            }
        }
        this.emit('task', this.tasks);
        this.emit('log', { level: 'SUCCESS', message: `📂 Import thành công ${added} công việc từ Excel` });
        return added;
    }

    // ---- User Chat (Boss sends a message) ----
    addUserMessage(text) {
        if (!text?.trim()) return;
        const msg = {
            id: uid(),
            employee: { id: 'boss', name: 'Boss', role: 'Quản lý', avatar: '👑' },
            text: text.trim(),
            time: timestamp(),
            isUser: true,
        };
        this.messages.unshift(msg);
        this.emit('chat', { type: 'message', message: msg });
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        this._initSocket();
        // Generate initial messages
        for (let i = 0; i < 4; i++) {
            this._generateMessage(true);
        }
        // Generate initial logs
        for (let i = 0; i < 6; i++) {
            this._generateLog(true);
        }

        // Chat messages every 4-10 seconds
        this.intervals.push(setInterval(() => {
            this._showTypingThenMessage();
        }, rand(4000, 10000)));

        // Status changes every 8-20 seconds
        this.intervals.push(setInterval(() => {
            this._changeStatus();
        }, rand(8000, 20000)));

        // Task flow every 12-25 seconds
        this.intervals.push(setInterval(() => {
            this._advanceTaskFlow();
        }, rand(12000, 25000)));

        // Terminal logs every 3-6 seconds
        this.intervals.push(setInterval(() => {
            this._generateLog();
        }, rand(3000, 6000)));

        // Meeting updates every 20-40 seconds
        this.intervals.push(setInterval(() => {
            this._updateMeeting();
        }, rand(20000, 40000)));

        // Stats update every 5 seconds
        this.intervals.push(setInterval(() => {
            this._updateStats();
        }, 5000));

        // Weekly reminder check every second
        this.intervals.push(setInterval(() => {
            this._checkWeeklyReminder();
        }, 1000));

        // Task assignment by CEO/Lead every 15-30 seconds
        this.intervals.push(setInterval(() => {
            this._simulateTaskAssignment();
        }, rand(15000, 30000)));
    }

    stop() {
        this.intervals.forEach(i => clearInterval(i));
        this.intervals = [];
    }

    // ---- Task Assignment Flow ----
    _initSocket() {
        try {
            const backendUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
            this.socket = io(backendUrl);

            this.socket.on('connect', () => {
                this.emit('log', { level: 'INFO', message: 'Connected to Command Center (Telegram)' });
            });

            // ---- Realtime World Sync ----
            this.socket.on('world_state', (state) => {
                // Sync week from server on connect
                if (state.weekNumber && state.weekNumber > this.weekNumber) {
                    this.weekNumber = state.weekNumber;
                    this.weekTimer = 0;
                    this.emit('stats', this.stats);
                }
                // Apply agent positions from server (other clients' moves)
                if (state.agentPositions) {
                    for (const [id, pos] of Object.entries(state.agentPositions)) {
                        this.emit('world_agent_move', { id, x: pos.x, y: pos.y });
                    }
                }
            });

            // Another client's character moved — relay to renderer
            this.socket.on('agent_move', (data) => {
                this.emit('world_agent_move', data);
            });

            // Another client's status changed — relay to renderer
            this.socket.on('status_change', (data) => {
                const emp = this.employees.find(e => e.id === data.id);
                if (emp) {
                    emp.status = data.status;
                    this.emit('status', { employeeId: data.id, status: data.status });
                }
            });

            // Server ticked the week
            this.socket.on('week_tick', (data) => {
                this.weekNumber = data.weekNumber;
                this.weekTimer = 0;
                this.emit('log', { level: 'INFO', message: `📅 Bắt đầu tuần ${data.weekNumber}` });
                this.emit('stats', this.stats);
            });

            this.socket.on('add_task', (data) => {
                const assignee = this.employees.find(e => e.name.toLowerCase().includes(data.assigneeName.toLowerCase())) || this.employees[0];
                this.addUserTask(data.title, assignee.id, data.priority || 'medium', null, []);
            });

            this.socket.on('update_task', (data) => {
                let foundTask = null;
                let currentCol = null;
                for (const col of ['backlog', 'assigned', 'inProgress', 'review', 'done']) {
                    foundTask = this.tasks[col].find(t => t.title.toLowerCase().includes(data.title.toLowerCase()));
                    if (foundTask) {
                        currentCol = col;
                        break;
                    }
                }
                if (foundTask && currentCol !== data.status) {
                    this.updateTaskStatus(foundTask.id, data.status);
                    this.emit('log', { level: 'INFO', message: `Telegram: Task "${data.title}" -> ${data.status}` });
                }
            });

            this.socket.on('hire_employee', (data) => {
                const newEmp = {
                    id: uid(),
                    name: data.name,
                    role: data.role,
                    status: 'online',
                    avatar: '🧑‍💻',
                    skills: [data.role]
                };
                this.employees.push(newEmp);
                this.emit('hire_employee', newEmp);
                this.emit('log', { level: 'SUCCESS', message: `🎉 ${data.name} joined as ${data.role}` });
            });

            this.socket.on('fire_employee', (data) => {
                const index = this.employees.findIndex(e => e.name.toLowerCase() === data.name.toLowerCase());
                if (index !== -1) {
                    const emp = this.employees[index];
                    this.employees.splice(index, 1);
                    this.emit('fire_employee', emp);
                    this.logs.unshift({ level: 'WARN', text: `[SYSTEM] ${emp.name} has been removed from the office.`, time: timestamp() });
                    this.emit('log', this.logs[0]);
                }
            });

            this.socket.on('edit_employee_role', (data) => {
                const emp = this.employees.find(e => e.name.toLowerCase() === data.name.toLowerCase() || e.id === data.name.toLowerCase());
                if (emp) {
                    const oldRole = emp.role;
                    emp.role = data.newRole;
                    // Also update skills heuristically just for display
                    emp.skills = [data.newRole];
                    this.emit('edit_employee', emp);
                    this.logs.unshift({ level: 'INFO', text: `[SYSTEM] ${emp.name} changed role from ${oldRole} to ${data.newRole}.`, time: timestamp() });
                    this.emit('log', this.logs[0]);
                }
            });

            this.socket.on('telegram_chat', (data) => {
                const emp = this.employees.find(e => e.id === data.employeeId);
                if (emp) {
                    // Truncate if too long to fit in bubble happily
                    const msg = data.text.length > 80 ? data.text.substring(0, 80) + '...' : data.text;
                    this._generateMessage(false, emp, `${msg}`);
                }
            });
        } catch (e) {
            console.error('Socket connect err', e);
        }
    }

    _simulateTaskAssignment() {
        const actions = [
            () => this._ceoCreatesTask(),
            () => this._leadAssignsTask(),
            () => this._leadAssignsTask(),
        ];
        pick(actions)();
    }

    _ceoCreatesTask() {
        const ceo = this.employees.find(e => e.id === 'cong');
        const template = pick(taskTemplates);
        const assignee = this.employees.find(e => e.id === template.defaultAssignee) || pick(this.employees.filter(e => e.id !== 'cong'));

        const task = {
            id: uid(),
            ...template,
            assignee,
            createdAt: timestamp(),
            progress: 0,
            deadline: this._generateDeadline(),
            createdBy: 'cong',
            checklist: template.checklist || [],
            isUserTask: false,
        };

        this.tasks.backlog.push(task);

        // CEO announces in chat
        const announcements = [
            `Task mới: "${task.title}". ${assignee.name} phụ trách nhé.`,
            `Tôi vừa tạo task "${task.title}". Deadline: ${task.deadline}.`,
            `Priority ${task.priority}: "${task.title}". Quân phân công giúp.`,
        ];
        this._generateMessage(false, ceo, pick(announcements));

        this.emit('task', this.tasks);
        this.emit('notification', {
            type: 'task_created',
            title: 'Task mới',
            message: `${ceo.name} tạo: ${task.title}`,
            color: ceo.color,
        });
    }

    _leadAssignsTask() {
        if (this.tasks.backlog.length === 0) return;

        const lead = this.employees.find(e => e.id === 'quan');
        const task = this.tasks.backlog.shift();
        task.assignedBy = 'quan';
        this.tasks.assigned.push(task);

        // Lead announces assignment
        const messages = [
            `${task.assignee.name}, task "${task.title}" đã assign cho bạn. Deadline: ${task.deadline}.`,
            `Phân công: ${task.assignee.name} → "${task.title}". Priority: ${task.priority}.`,
        ];
        this._generateMessage(false, lead, pick(messages));

        this.emit('task', this.tasks);
        this.emit('taskAssign', { task, assignedBy: lead });
        this.emit('notification', {
            type: 'task_assigned',
            title: 'Task assigned',
            message: `${task.assignee.name} ← ${task.title}`,
            color: lead.color,
        });
    }

    // ---- Task Flow (Kanban Movement) ----
    _advanceTaskFlow() {
        const flows = [
            { from: 'assigned', to: 'inProgress', action: 'start' },
            { from: 'assigned', to: 'inProgress', action: 'start' },
            { from: 'inProgress', to: 'review', action: 'submit' },
            { from: 'review', to: 'done', action: 'approve' },
            { from: 'review', to: 'inProgress', action: 'revise' },
        ];

        const flow = pick(flows);
        // Do not pick a user task for automatic advancement
        const validTasks = this.tasks[flow.from].filter(t => !t.isUserTask);
        if (validTasks.length === 0) return;

        const taskIndex = this.tasks[flow.from].findIndex(t => t.id === validTasks[0].id);
        const task = this.tasks[flow.from].splice(taskIndex, 1)[0];

        switch (flow.action) {
            case 'start':
                task.progress = rand(10, 30);
                this.tasks.inProgress.push(task);
                this._generateLog(false, `Task started: "${task.title}" by ${task.assignee.name}`);
                break;

            case 'submit':
                task.progress = rand(85, 98);
                task.reviewer = 'quan';
                this.tasks.review.push(task);
                this._generateMessage(false, task.assignee, `Đã hoàn thành "${task.title}". Gửi review cho Quân.`);
                this.emit('notification', {
                    type: 'task_review',
                    title: 'Cần review',
                    message: `${task.assignee.name}: ${task.title}`,
                    color: '#F59E0B',
                });
                break;

            case 'approve':
                task.progress = 100;
                task.completedAt = timestamp();
                this.tasks.done.push(task);
                this.stats.tasksCompleted++;
                const lead = this.employees.find(e => e.id === 'quan');
                this._generateMessage(false, lead, `✅ Approved: "${task.title}". Good job ${task.assignee.name}!`);
                this.emit('notification', {
                    type: 'task_done',
                    title: 'Task hoàn thành',
                    message: task.title,
                    color: '#10B981',
                });
                break;

            case 'revise':
                task.progress = rand(40, 60);
                this.tasks.inProgress.push(task);
                const reviewer = this.employees.find(e => e.id === 'quan');
                this._generateMessage(false, reviewer, `🔄 Revise: "${task.title}". ${task.assignee.name} check lại nhé.`);
                break;
        }

        // Update in-progress task progress
        this.tasks.inProgress.forEach(t => {
            t.progress = Math.min(95, t.progress + rand(3, 10));
        });

        this.emit('task', this.tasks);
        this.emit('stats', this.stats);
    }

    // ---- Manual User Interaction ----
    addUserTask(title, assigneeId, priority, deadline, checklistTexts = []) {
        const assignee = this.employees.find(e => e.id === assigneeId) || pick(this.employees);
        const task = {
            id: uid(),
            title,
            priority,
            assignee,
            createdAt: timestamp(),
            progress: 0,
            deadline: deadline || this._generateDeadline(),
            createdBy: 'User (You)',
            checklist: checklistTexts.map(text => ({ id: uid(), text, done: false })),
            isUserTask: true, // IMPORTANT: Prevents automatic movement
        };

        this.tasks.backlog.push(task);
        this.emit('task', this.tasks);
        this.emit('notification', {
            type: 'user_task_created',
            title: 'Created Manual Task',
            message: `Assigned "${title}" to ${assignee.name}`,
            color: '#10B981',
        });
        return task.id;
    }

    updateTaskStatus(taskId, newCol) {
        // Find task across all columns
        let foundTask = null;
        let oldCol = null;

        for (const col of ['backlog', 'assigned', 'inProgress', 'review', 'done']) {
            const idx = this.tasks[col].findIndex(t => t.id === taskId);
            if (idx !== -1) {
                foundTask = this.tasks[col].splice(idx, 1)[0];
                oldCol = col;
                break;
            }
        }

        if (!foundTask) return false;

        // Update progress based on column
        if (newCol === 'done') foundTask.progress = 100;
        else if (newCol === 'review') foundTask.progress = 90;
        else if (newCol === 'inProgress' && foundTask.progress === 0) foundTask.progress = 10;
        else if (newCol === 'backlog' || newCol === 'assigned') foundTask.progress = 0;

        // Ensure user tasks don't get stuck if they change columns
        this.tasks[newCol].push(foundTask);
        this.emit('task', this.tasks);
        return true;
    }

    toggleTaskChecklist(taskId, checkId, isDone) {
        // Find task
        let foundTask = null;
        for (const col of ['backlog', 'assigned', 'inProgress', 'review', 'done']) {
            foundTask = this.tasks[col].find(t => t.id === taskId);
            if (foundTask) break;
        }

        if (foundTask && foundTask.checklist) {
            const item = foundTask.checklist.find(c => c.id === checkId);
            if (item) {
                item.done = isDone;
                // Auto-update progress based on checklist
                const total = foundTask.checklist.length;
                const doneCount = foundTask.checklist.filter(c => c.done).length;
                if (total > 0 && foundTask.progress < 100) {
                    foundTask.progress = Math.round((doneCount / total) * 90); // Max 90% via checklist
                }
                this.emit('task', this.tasks);
                return true;
            }
        }
        return false;
    }

    addTaskChecklistItem(taskId, text) {
        // Find task
        let foundTask = null;
        for (const col of ['backlog', 'assigned', 'inProgress', 'review', 'done']) {
            foundTask = this.tasks[col].find(t => t.id === taskId);
            if (foundTask) break;
        }

        if (foundTask) {
            if (!foundTask.checklist) foundTask.checklist = [];
            foundTask.checklist.push({ id: uid(), text, done: false });
            this.emit('task', this.tasks);
            return true;
        }
        return false;
    }

    // ---- Weekly Reminder ----
    _checkWeeklyReminder() {
        const elapsed = (Date.now() - this.weekStartTime) / 1000;
        this.weekTimer = elapsed;

        if (elapsed >= this.WEEK_DURATION) {
            this._generateWeeklyReport();
            this.weekNumber++;
            this.weekStartTime = Date.now();
            this.weekTimer = 0;
        }
    }

    _generateWeeklyReport() {
        const totalDone = this.tasks.done.length;
        const totalInProgress = this.tasks.inProgress.length + this.tasks.review.length;
        const totalPending = this.tasks.backlog.length + this.tasks.assigned.length;

        // Count tasks per person
        const perPerson = {};
        this.employees.forEach(e => {
            perPerson[e.id] = { name: e.name, role: e.role, completed: 0, inProgress: 0 };
        });
        this.tasks.done.forEach(t => {
            if (perPerson[t.assignee.id]) perPerson[t.assignee.id].completed++;
        });
        this.tasks.inProgress.forEach(t => {
            if (perPerson[t.assignee.id]) perPerson[t.assignee.id].inProgress++;
        });
        this.tasks.review.forEach(t => {
            if (perPerson[t.assignee.id]) perPerson[t.assignee.id].inProgress++;
        });

        // Upcoming deadlines
        const upcoming = [...this.tasks.inProgress, ...this.tasks.review, ...this.tasks.assigned]
            .slice(0, 5)
            .map(t => ({ title: t.title, assignee: t.assignee.name, deadline: t.deadline }));

        const report = {
            weekNumber: this.weekNumber,
            summary: {
                completed: totalDone,
                inProgress: totalInProgress,
                pending: totalPending,
                completionRate: totalDone > 0 ? Math.round((totalDone / (totalDone + totalInProgress + totalPending)) * 100) : 0,
            },
            perPerson: Object.values(perPerson),
            upcomingDeadlines: upcoming,
            timestamp: timestamp(),
        };

        this.emit('weeklyReport', report);

        // CEO comments on the report
        const ceo = this.employees.find(e => e.id === 'cong');
        const comments = [
            `📊 Tuần ${this.weekNumber} kết thúc. Hoàn thành ${totalDone} tasks. Team đang làm rất tốt!`,
            `📊 Weekly report: ${report.summary.completionRate}% completion rate. Tiếp tục phát huy!`,
            `📊 Tuần ${this.weekNumber}: ${totalDone} done, ${totalInProgress} đang làm, ${totalPending} pending.`,
        ];
        this._generateMessage(false, ceo, pick(comments));

        // Clear done tasks partially to prevent overflow
        if (this.tasks.done.length > 8) {
            this.tasks.done = this.tasks.done.slice(-5);
        }
    }

    // ---- Chat ----
    _showTypingThenMessage() {
        const emp = pick(this.employees);
        this._typingEmployee = emp;
        this.emit('chat', { type: 'typing', employee: emp });

        setTimeout(() => {
            this._typingEmployee = null;
            this._generateMessage();
        }, rand(1000, 3000));
    }

    _generateMessage(silent = false, specificEmployee = null, specificText = null) {
        const emp = specificEmployee || pick(this.employees);
        const templates = chatTemplates[emp.role] || chatTemplates['3D Artist'];
        const msg = {
            id: uid(),
            employee: emp,
            text: specificText || pick(templates),
            timestamp: timestamp(),
            isNew: !silent,
        };
        this.messages.push(msg);
        this.stats.totalMessages++;
        if (this.messages.length > 50) this.messages.shift();
        if (!silent) this.emit('chat', { type: 'message', message: msg });
    }

    _changeStatus() {
        const emp = pick(this.employees);
        const statuses = Object.keys(statusLabels);
        let newStatus = pick(statuses);

        // CEO mostly works/reviews/meeting
        if (emp.id === 'cong') {
            newStatus = pick(['working', 'reviewing', 'meeting', 'thinking']);
        }
        // AI Gen specific status
        if (emp.id === 'kiet') {
            newStatus = pick(['coding', 'working', 'thinking', 'rendering']);
        }

        emp.status = newStatus;
        this.stats.activeAgents = this.employees.filter(e => e.status !== 'break').length;
        this.emit('status', { employee: emp, status: newStatus });
        this.emit('stats', this.stats);
    }

    _generateLog(silent = false, customMsg = null) {
        const levelGroup = pick(terminalLogTemplates);
        const template = customMsg || pick(levelGroup.messages);
        const msg = template
            .replace('{count}', rand(10, 500))
            .replace('{time}', rand(15, 250))
            .replace('{p99}', rand(100, 400))
            .replace('{mem}', rand(1200, 3500))
            .replace('{pct}', rand(30, 92))
            .replace('{active}', rand(3, 8));

        const log = {
            id: uid(),
            level: customMsg ? 'INFO' : levelGroup.level,
            message: msg,
            timestamp: timestamp(),
            isNew: !silent,
        };
        this.logs.push(log);
        if (this.logs.length > 100) this.logs.shift();
        if (!silent) this.emit('log', log);
    }

    _updateMeeting() {
        const activeMeeting = this.meetings.find(m => m.active);
        if (activeMeeting) {
            activeMeeting.elapsed += rand(1, 5);
            const durationMin = parseInt(activeMeeting.duration);
            if (activeMeeting.elapsed >= durationMin) {
                activeMeeting.active = false;
                const inactiveMeeting = this.meetings.find(m => !m.active);
                if (inactiveMeeting) {
                    inactiveMeeting.active = true;
                    inactiveMeeting.elapsed = 0;
                    inactiveMeeting.startedAt = timestamp();
                    const participants = [...this.employees].sort(() => Math.random() - 0.5).slice(0, rand(3, 5));
                    inactiveMeeting.participants = participants;
                } else {
                    const topic = pick(meetingTopics);
                    const participants = [...this.employees].sort(() => Math.random() - 0.5).slice(0, rand(3, 5));
                    this.meetings.push({
                        id: uid(), ...topic, participants,
                        startedAt: timestamp(), elapsed: 0, active: true,
                    });
                }
                const newActive = this.meetings.find(m => m.active);
                if (newActive) {
                    newActive.participants.forEach(p => {
                        const emp = this.employees.find(e => e.id === p.id);
                        if (emp) emp.status = 'meeting';
                    });
                }
            }
        }
        this.emit('meeting', this.meetings);
    }

    _updateStats() {
        this.stats.messagesPerHour = Math.min(60, this.stats.messagesPerHour + rand(-2, 3));
        if (this.stats.messagesPerHour < 10) this.stats.messagesPerHour = 10;
        this.emit('stats', this.stats);
    }

    // ---- Getters ----
    getWeekProgress() {
        return Math.min(1, this.weekTimer / this.WEEK_DURATION);
    }

    getTaskSummary() {
        return {
            backlog: this.tasks.backlog.length,
            assigned: this.tasks.assigned.length,
            inProgress: this.tasks.inProgress.length,
            review: this.tasks.review.length,
            done: this.tasks.done.length,
        };
    }
}
