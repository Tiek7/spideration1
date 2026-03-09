export function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick(arr) {
    return arr[rand(0, arr.length - 1)];
}

export function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function timestamp() {
    const d = new Date();
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
