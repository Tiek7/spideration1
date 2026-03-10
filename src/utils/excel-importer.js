// =============================================
// Excel / CSV Importer  (uses SheetJS via CDN)
// =============================================

// Dynamically load SheetJS once
let XLSXLib = null;
async function getXLSX() {
    if (XLSXLib) return XLSXLib;
    // SheetJS CDN — safe for browser; no bundler needed
    await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
    XLSXLib = window.XLSX;
    return XLSXLib;
}

/**
 * parseExcelToTasks(file, employees) → Promise<task[]>
 *
 * Supported columns (case-insensitive):
 *   Task / Title / Tên
 *   Assignee / Người thực hiện
 *   Priority / Ưu tiên       → low | medium | high
 *   Status / Trạng thái      → backlog | assigned | inProgress | review | done
 *   Progress / Tiến độ       → 0-100
 *   Deadline / Hạn           → string
 *   Description / Mô tả
 */
export async function parseExcelToTasks(file, employees = []) {
    const XLSX = await getXLSX();

    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

    const normalize = (s) => String(s || '').toLowerCase().trim();

    // Column key detection (maps our internal key → detected header)
    function pick(row, candidates) {
        for (const key of Object.keys(row)) {
            if (candidates.some(c => normalize(key).includes(c))) {
                return String(row[key]).trim();
            }
        }
        return '';
    }

    const statusMap = {
        'backlog': 'backlog', 'chưa nhận': 'backlog',
        'assigned': 'assigned', 'đã nhận': 'assigned', 'nhận': 'assigned',
        'inprogress': 'inProgress', 'in progress': 'inProgress', 'đang làm': 'inProgress', 'doing': 'inProgress',
        'review': 'review', 'kiểm tra': 'review',
        'done': 'done', 'xong': 'done', 'hoàn thành': 'done', 'completed': 'done',
    };
    const priorityMap = {
        'low': 'low', 'thấp': 'low',
        'medium': 'medium', 'trung bình': 'medium', 'normal': 'medium',
        'high': 'high', 'cao': 'high', 'urgent': 'high', 'khẩn': 'high',
    };

    const tasks = [];
    for (const row of rows) {
        const title = pick(row, ['task', 'title', 'tên', 'công việc', 'name']);
        if (!title) continue; // skip empty rows

        const assigneeName = pick(row, ['assignee', 'người', 'thực hiện', 'assign', 'nhân viên']);
        const assignee = employees.find(e =>
            e.name.toLowerCase().includes(assigneeName.toLowerCase()) ||
            assigneeName.toLowerCase().includes(e.name.toLowerCase())
        ) || employees[0];

        const rawStatus = normalize(pick(row, ['status', 'trạng thái', 'state']));
        const status = statusMap[rawStatus] || 'backlog';

        const rawPriority = normalize(pick(row, ['priority', 'ưu tiên', 'độ ưu tiên']));
        const priority = priorityMap[rawPriority] || 'medium';

        const rawProgress = pick(row, ['progress', 'tiến độ', 'percent', '%']);
        const progress = Math.min(100, Math.max(0, parseInt(rawProgress) || 0));

        const deadline = pick(row, ['deadline', 'hạn', 'due', 'ngày']);
        const description = pick(row, ['description', 'mô tả', 'note', 'ghi chú']);

        tasks.push({ title, assignee, status, priority, progress, deadline, description });
    }

    return tasks;
}
