import { Telegraf, Markup } from 'telegraf';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const token = process.env.BOT_TOKEN || '8653414429:AAFDJLdxvfdMVxT8xFGf1-Q2kU-y5g1NQMM';
const PORT = process.env.PORT || 3000;
const bot = new Telegraf(token);

const app = express();
app.use(cors());

// Serve the built Vite frontend
const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/(.*)', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let connectedClients = 0;

io.on('connection', (socket) => {
    connectedClients++;
    console.log(`Client connected. Total: ${connectedClients}`);
    socket.on('disconnect', () => {
        connectedClients--;
        console.log(`Client disconnected. Total: ${connectedClients}`);
    });
});

const broadcast = (event, data) => {
    io.emit(event, data);
};

// --- Utils for Matching Names ---
const normalizeText = (text) => text ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

function matchEmployeeByName(telegramName, username) {
    const combined = normalizeText(telegramName) + " " + normalizeText(username);
    const names = [
        { id: 'cong', keywords: ['cong', 'ceo'] },
        { id: 'quan', keywords: ['quan', 'lead'] },
        { id: 'son', keywords: ['son', 'artist'] },
        { id: 'thinh', keywords: ['thinh', 'artist'] },
        { id: 'kiet', keywords: ['kiet', 'bao ve'] }
    ];

    for (const emp of names) {
        for (const kw of emp.keywords) {
            if (combined.includes(kw)) return emp.id;
        }
    }
    return null;
}

// --- Bot Commands ---
bot.start((ctx) => {
    ctx.reply('Welcome to Spideration Command Center!\nAdd me to your company group and give me Admin rights so I can see group messages.',
        Markup.inlineKeyboard([
            [Markup.button.callback('📝 Menu Lệnh Nhanh', 'show_menu')]
        ])
    );
});

bot.command('menu', (ctx) => {
    ctx.reply('Tùy chọn tương tác:', Markup.inlineKeyboard([
        [Markup.button.callback('➕ Tạo Task', 'btn_task'), Markup.button.callback('🔄 Cập nhật tiến độ', 'btn_progress')],
        [Markup.button.callback('✨ Hoàn thành Task', 'btn_done')],
        [Markup.button.callback('🧑‍💼 Hire (Tuyển)', 'btn_hire'), Markup.button.callback('🔥 Fire (Đuổi)', 'btn_fire')],
        [Markup.button.callback('✏️ Đổi Role', 'btn_editrole')]
    ]));
});

// Interactive Button Callbacks
bot.action('show_menu', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Tùy chọn tương tác:', Markup.inlineKeyboard([
        [Markup.button.callback('➕ Tạo Task', 'btn_task'), Markup.button.callback('🔄 Cập nhật tiến độ', 'btn_progress')],
        [Markup.button.callback('✨ Hoàn thành Task', 'btn_done')],
        [Markup.button.callback('🧑‍💼 Hire (Tuyển)', 'btn_hire'), Markup.button.callback('🔥 Fire (Đuổi)', 'btn_fire')],
        [Markup.button.callback('✏️ Đổi Role', 'btn_editrole')]
    ]));
});

bot.action('btn_task', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Để giao việc, hãy type cú pháp:\n`/task Tiêu đề công việc @[Tên_Người_Nhận]`\nVD: `/task Dựng hình 3D @Son`', { parse_mode: 'Markdown' });
});

bot.action('btn_progress', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Để cập nhật task sang Đang Làm, type:\n`/doing [Tên Task]`\nVD: `/doing Dựng hình 3D`', { parse_mode: 'Markdown' });
});

bot.action('btn_done', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Để hoàn thành task, type:\n`/done [Tên Task]`', { parse_mode: 'Markdown' });
});

bot.action('btn_hire', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Để tuyển thêm người, type:\n`/hire [Tên] | [Role]`', { parse_mode: 'Markdown' });
});

bot.action('btn_fire', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Để sa thải ai đó, type:\n`/fire [Tên]`', { parse_mode: 'Markdown' });
});

bot.action('btn_editrole', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Để đổi chức danh, type:\n`/editrole [Tên] | [Role Mới]`\nVD: `/editrole Kiet | Giám Đốc An Ninh`', { parse_mode: 'Markdown' });
});

bot.command('task', (ctx) => {
    let text = ctx.message.text.replace('/task', '').trim();
    // In groups, the command might be /task@bot_username, so we safely replace anything up to the first space
    if (ctx.message.text.includes('@') && ctx.message.text.split(' ')[0].includes('@')) {
        text = ctx.message.text.substring(ctx.message.text.indexOf(' ')).trim();
    }

    const parts = text.split('@');
    if (parts.length < 2) {
        return ctx.reply('Usage: /task [Task Title] @[assignee_name]');
    }
    const title = parts[0].trim();
    const assigneeName = parts[1].trim();

    broadcast('add_task', { title, assigneeName, priority: 'medium' });
    ctx.reply(`✅ Đã giao việc: "${title}" cho ${assigneeName}!`);
});

bot.command('doing', (ctx) => {
    let title = ctx.message.text.replace('/doing', '').trim();
    if (ctx.message.text.includes('@') && ctx.message.text.split(' ')[0].includes('@')) {
        title = ctx.message.text.substring(ctx.message.text.indexOf(' ')).trim();
    }
    if (!title) return ctx.reply('Usage: /doing [Task Title]');
    broadcast('update_task', { title, status: 'inProgress' });
    ctx.reply(`🔨 Đang tiến hành: "${title}"`);
});

bot.command('done', (ctx) => {
    let title = ctx.message.text.replace('/done', '').trim();
    if (ctx.message.text.includes('@') && ctx.message.text.split(' ')[0].includes('@')) {
        title = ctx.message.text.substring(ctx.message.text.indexOf(' ')).trim();
    }
    if (!title) return ctx.reply('Usage: /done [Task Title]');
    broadcast('update_task', { title, status: 'done' });
    ctx.reply(`🎉 Đã xong: "${title}"!`);
});

bot.command('hire', (ctx) => {
    let text = ctx.message.text.replace('/hire', '').trim();
    if (ctx.message.text.includes('@') && ctx.message.text.split(' ')[0].includes('@')) {
        text = ctx.message.text.substring(ctx.message.text.indexOf(' ')).trim();
    }
    const parts = text.split('|');
    const name = parts[0]?.trim();
    const role = parts[1]?.trim() || '3D Artist';
    if (!name) return ctx.reply('Usage: /hire [Name] | [Role]');

    broadcast('hire_employee', { name, role });
    ctx.reply(`👋 Welcome ${name} to Spideration as ${role}!`);
});

bot.command('fire', (ctx) => {
    let name = ctx.message.text.replace('/fire', '').trim();
    if (ctx.message.text.includes('@') && ctx.message.text.split(' ')[0].includes('@')) {
        name = ctx.message.text.substring(ctx.message.text.indexOf(' ')).trim();
    }
    if (!name) return ctx.reply('Usage: /fire [Name]');

    broadcast('fire_employee', { name });
    ctx.reply(`🔥 ${name} has left the office.`);
});

bot.command('editrole', (ctx) => {
    let text = ctx.message.text.replace('/editrole', '').trim();
    if (ctx.message.text.includes('@') && ctx.message.text.split(' ')[0].includes('@')) {
        text = ctx.message.text.substring(ctx.message.text.indexOf(' ')).trim();
    }
    const parts = text.split('|');
    const name = parts[0]?.trim();
    const newRole = parts[1]?.trim();
    if (!name || !newRole) return ctx.reply('Usage: /editrole [Name] | [New Role]');

    broadcast('edit_employee_role', { name, newRole });
    ctx.reply(`🔄 Đã cập nhật chức danh của ${name} thành: ${newRole}!`);
});

// --- Listen to all regular group messages ---
bot.on('text', (ctx) => {
    if (ctx.message.text.startsWith('/')) return; // Ignore commands that might have slipped through

    const senderFirst = ctx.from.first_name || '';
    const senderLast = ctx.from.last_name || '';
    const username = ctx.from.username || '';

    // Fallback: If we can't map their Telegram account to an employee, default to CEO (Công) or a random one
    let employeeId = matchEmployeeByName(senderFirst + " " + senderLast, username) || 'cong';

    broadcast('telegram_chat', {
        employeeId,
        text: ctx.message.text,
        senderName: senderFirst
    });
});

bot.launch()
    .then(() => console.log('Telegram Bot running...'))
    .catch((err) => console.error('Telegram bot failed to start (maybe running elsewhere?):', err.message || err));

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Spideration backend listening on port ${PORT}`);
});
process.once('SIGINT', () => {
    bot.stop('SIGINT');
    server.close();
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
    server.close();
});
