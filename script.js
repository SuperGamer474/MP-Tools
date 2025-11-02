// script.js – MP Tools (full, readable version)
// ------------------------------------------------
// 1. Create / remove the floating panel
// 2. Speedrunner auto-clicker
// 3. Right-click unblocker
// 4. Draggable panel (mouse + touch)
// ------------------------------------------------

(function () {
    // ------------------------------------------------
    // Public entry point – the bookmarklet calls this
    // ------------------------------------------------
    window.MP_Tools = function () {
        if (document.getElementById('mp-tools-panel')) {
            document.getElementById('mp-tools-panel').remove();
            return;
        }
        buildPanel();
    };

    // ------------------------------------------------
    // Build the whole UI
    // ------------------------------------------------
    function buildPanel() {
        const panel = document.createElement('div');
        panel.id = 'mp-tools-panel';
        panel.style.cssText = `
            position:fixed;right:12px;top:12px;width:420px;z-index:2147483647;
            background:#0f1724;color:#e6eef8;padding:12px;border-radius:10px;
            box-shadow:0 8px 32px rgba(2,6,23,.7);font-family:Arial,Helvetica,sans-serif;
            font-size:13px;box-sizing:border-box;user-select:none;
        `;

        // ----- header (title + close) -----
        const header = document.createElement('div');
        header.style.cssText = `
            font-weight:700;margin-bottom:8px;display:flex;
            justify-content:space-between;align-items:center;cursor:grab;
        `;
        header.textContent = 'MP Tools';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'X';
        closeBtn.title = 'Close';
        closeBtn.style.cssText = `
            background:transparent;border:0;color:inherit;
            cursor:pointer;font-size:14px;
        `;
        closeBtn.onclick = () => panel.remove();
        header.appendChild(closeBtn);
        panel.appendChild(header);

        // ----- info line -----
        const info = document.createElement('div');
        info.textContent = 'Choose a tool:';
        info.style.marginBottom = '8px';
        panel.appendChild(info);

        // ----- two columns -----
        const cols = document.createElement('div');
        cols.style.cssText = 'display:flex;gap:10px;';

        const col1 = column();
        const col2 = column();

        // ----- Speedrunner buttons -----
        const startSpeed = button('Start Speedrunner', '#16a34a', '#fff');
        const stopSpeed  = button('Stop Speedrunner',  '#ef4444', '#fff');
        col1.appendChild(startSpeed);
        col1.appendChild(stopSpeed);

        // ----- Right-click buttons -----
        const enableRC = button('Enable Right Click', '#16a34a', '#fff');
        const disableRC = button('Disable Right Click', '#ef4444', '#fff');
        col2.appendChild(enableRC);
        col2.appendChild(disableRC);

        cols.appendChild(col1);
        cols.appendChild(col2);
        panel.appendChild(cols);

        // ----- footer -----
        const footer = document.createElement('div');
        footer.style.cssText = 'margin-top:8px;font-size:11px;opacity:.85;';
        footer.textContent = 'Drag the header to move. Use X to close.';
        panel.appendChild(footer);

        document.body.appendChild(panel);

        // ----- wire everything -----
        attachSpeedrunner(startSpeed, stopSpeed);
        attachRightClick(enableRC, disableRC);
        makeDraggable(panel, header);
    }

    // ------------------------------------------------
    // Helpers
    // ------------------------------------------------
    function column() {
        const c = document.createElement('div');
        c.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:8px;';
        return c;
    }

    function button(text, bg, fg) {
        const b = document.createElement('button');
        b.textContent = text;
        b.style.cssText = `
            width:100%;padding:10px;border-radius:8px;border:0;
            cursor:pointer;box-sizing:border-box;font-weight:700;
            font-size:12px;background:${bg};color:${fg};
        `;
        return b;
    }

    // ------------------------------------------------
    // Speedrunner
    // ------------------------------------------------
    function attachSpeedrunner(startBtn, stopBtn) {
        startBtn.onclick = async function () {
            if (window.__autoClickerRunning) {
                console.log('Speedrunner already running');
                return;
            }
            window.__autoClickerStopRequested = false;
            window.__autoClickerRunning = true;

            const wait = async (sel, txt, to = 10000) => {
                const start = Date.now();
                return new Promise((res, rej) => {
                    const iv = setInterval(() => {
                        const els = [...document.querySelectorAll(sel)];
                        for (const el of els) {
                            if (el.textContent.trim() === txt) {
                                clearInterval(iv);
                                res(el);
                                return;
                            }
                        }
                        if (Date.now() - start > to) {
                            clearInterval(iv);
                            rej(new Error('Timeout: ' + txt));
                        }
                    }, 200);
                });
            };

            const sleep = ms => new Promise(r => setTimeout(r, ms));

            try {
                while (!window.__autoClickerStopRequested) {
                    try {
                        (await wait('div.bottom-button.card-button.check-button.flex.items-center.relative.right-button.round-button',
                                    'Check my answer')).click();
                        (await wait('div.next-button.ph3.pv2.card-button.round-button.bottom-button.left-button.flex.items-center.mr2',
                                    'Complete question')).click();
                        await sleep(3000);
                    } catch (e) {
                        await sleep(1000);
                    }
                }
            } finally {
                window.__autoClickerRunning = false;
                console.log('Speedrunner stopped');
            }
        };

        stopBtn.onclick = function () {
            window.__autoClickerStopRequested = true;
            window.__autoClickerRunning = false;
            console.log('Stop requested');
        };
    }

    // ------------------------------------------------
    // Right-click unblocker
    // ------------------------------------------------
    function attachRightClick(enableBtn, disableBtn) {
        enableBtn.onclick = function () {
            if (window.__allowRClickInterval) {
                console.log('Right-click unblocker already running');
                return;
            }

            window.__allowRClick_handler = e => {
                try { e.stopImmediatePropagation(); } catch (_) {}
            };

            window.__allowRClick_purge = () => {
                try {
                    document.oncontextmenu = null;
                    document.onmousedown = null;
                    document.onmouseup = null;

                    document.querySelectorAll('*').forEach(el => {
                        el.oncontextmenu = null;
                        el.onmousedown = null;
                        el.onmouseup = null;
                    });

                    ['contextmenu', 'mousedown', 'mouseup'].forEach(evt => {
                        window.addEventListener(evt, window.__allowRClick_handler, true);
                        document.addEventListener(evt, window.__allowRClick_handler, true);
                    });

                    window.__allowRClick_installed = true;
                } catch (_) {}
            };

            window.__allowRClickInterval = setInterval(window.__allowRClick_purge, 50);
            console.log('Right-click unblocker started');
        };

        disableBtn.onclick = function () {
            if (window.__allowRClickInterval) clearInterval(window.__allowRClickInterval);

            if (window.__allowRClick_installed && window.__allowRClick_handler) {
                ['contextmenu', 'mousedown', 'mouseup'].forEach(evt => {
                    try { window.removeEventListener(evt, window.__allowRClick_handler, true); } catch (_) {}
                    try { document.removeEventListener(evt, window.__allowRClick_handler, true); } catch (_) {}
                });
            }

            window.__allowRClick_installed = false;
            window.__allowRClick_handler = null;
            window.__allowRClick_purge = null;
            window.__allowRClickInterval = null;
            console.log('Right-click unblocker stopped');
        };
    }

    // ------------------------------------------------
    // Draggable panel
    // ------------------------------------------------
    function makeDraggable(panel, handle) {
        let dragging = false, offsetX = 0, offsetY = 0;

        const move = e => {
            const x = e.clientX ?? e.touches?.[0]?.clientX;
            const y = e.clientY ?? e.touches?.[0]?.clientY;
            if (!dragging || x == null) return;
            panel.style.left = (x - offsetX) + 'px';
            panel.style.top  = (y - offsetY) + 'px';
            panel.style.right = '';
        };

        const up = () => {
            dragging = false;
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('touchend', up);
        };

        handle.addEventListener('mousedown', e => {
            dragging = true;
            const r = panel.getBoundingClientRect();
            offsetX = e.clientX - r.left;
            offsetY = e.clientY - r.top;
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        });

        handle.addEventListener('touchstart', e => {
            dragging = true;
            const t = e.touches[0];
            const r = panel.getBoundingClientRect();
            offsetX = t.clientX - r.left;
            offsetY = t.clientY - r.top;
            document.addEventListener('touchmove', move);
            document.addEventListener('touchend', up);
        });
    }
})();
