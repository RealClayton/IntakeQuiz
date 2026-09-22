// Local spreadsheet capture. No participant data leaves this computer.
const BoothStorage = (() => {
    const key = 'intake_audit_leads';
    const columns = ['Submission ID', 'Submitted At', 'Email', 'Score', 'Monthly Inquiries', 'Monthly Hires', 'Average Retainer', 'Grade', 'Diagnosis', 'Hire Rate', 'Monthly Revenue', 'Top Priorities', 'Response Time', 'After Hours', 'Follow Up', 'Scripts', 'Call Coaching'];
    let handle = null;
    let busy = false;
    const cell = value => {
        let text = String(value ?? '');
        if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
        return '"' + text.replace(/"/g, '""') + '"';
    };
    const header = columns.map(cell).join(',');
    function read() {
        const rows = JSON.parse(localStorage.getItem(key) || '[]');
        if (!Array.isArray(rows)) throw new Error('Browser backup cannot be read. Do not clear browser data.');
        for (const row of rows) if (!row.id) row.id = crypto.randomUUID();
        localStorage.setItem(key, JSON.stringify(rows));
        return rows;
    }
    function line(row) {
        return [row.id, row.timestamp, row.email, row.score, row.monthlyInquiries, row.monthlyHires, row.averageRetainer,
            row.report?.grade, row.report?.diagnosis, row.report?.hireRate, row.report?.currentMonthlyRevenue,
            row.report?.priorities?.map(p => p.title).join('; '), ...(row.responses || [])].map(cell).join(',');
    }
    function status(message) {
        document.getElementById('booth-status').textContent = message;
    }
    async function sync() {
        if (!handle) throw new Error('Browser backup saved. Choose or reconnect a spreadsheet to save it to your computer.');
        const rows = read();
        const file = await handle.getFile();
        let text = (await file.text()).replace(/^\uFEFF/, '');
        if (text && !text.startsWith(header + '\r\n')) throw new Error('This file is not a quiz spreadsheet. Choose a new CSV file.');
        const missing = rows.filter(row => !text.includes(cell(row.id) + ','));
        if (missing.length || !text) {
            text = text || header + '\r\n';
            if (!text.endsWith('\n')) text += '\r\n';
            const stream = await handle.createWritable();
            try {
                await stream.write('\uFEFF' + text + missing.map(line).join('\r\n') + (missing.length ? '\r\n' : ''));
                await stream.close();
            } catch (error) {
                try { await stream.abort(); } catch (_) { /* Stream may already be closed. */ }
                throw error;
            }
        }
        status(`Saved to ${handle.name}. All ${rows.length} browser records are backed up in this file.`);
    }
    function chooseFile() {
        if (!window.showSaveFilePicker) throw new Error('Automatic updates require desktop Chrome or Edge. Use Spreadsheet backup below to download your responses.');
        return window.showSaveFilePicker({
            suggestedName: 'intake-booth.csv',
            startIn: 'downloads',
            types: [{ description: 'Excel-compatible CSV', accept: { 'text/csv': ['.csv'] } }]
        });
    }
    async function connect(existing = false) {
        if (busy) return;
        if (!window.showSaveFilePicker) {
            status('Automatic file updates need desktop Chrome or Edge. You can still download the browser backup.');
            return;
        }
        busy = true;
        try {
            const types = [{ description: 'Excel-compatible CSV', accept: { 'text/csv': ['.csv'] } }];
            const selected = existing
                ? (await window.showOpenFilePicker({ types, multiple: false }))[0]
                : await chooseFile();
            if (existing && await selected.requestPermission({ mode: 'readwrite' }) !== 'granted') throw new Error('Allow file updates to connect this spreadsheet.');
            handle = selected;
            await sync();
        } catch (error) {
            if (error.name !== 'AbortError') status(`File not updated: ${error.message}`);
        } finally { busy = false; }
    }
    async function save(row) {
        if (busy) throw new Error('Spreadsheet is busy. Wait a moment and submit again.');
        busy = true;
        try {
            const rows = read();
            if (!rows.some(item => item.id === row.id)) rows.push(row);
            localStorage.setItem(key, JSON.stringify(rows));
            try {
                // Called directly from Submit so the browser can show its save dialog.
                if (!handle) handle = await chooseFile();
                await sync();
                return true;
            }
            catch (error) { status(`File not updated. Browser backup kept. ${error.message}`); return false; }
        } finally { busy = false; }
    }
    function download() {
        try {
            const rows = read();
            const url = URL.createObjectURL(new Blob(['\uFEFF' + header + '\r\n' + rows.map(line).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `intake-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        } catch (error) { status(`Backup download failed: ${error.message}`); }
    }
    return { connect, save, download };
})();
