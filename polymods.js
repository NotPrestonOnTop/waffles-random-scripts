(function(){
    if(document.getElementById('poly-mod-console') || document.getElementById('poly-mod-boot')) return;

    /* ---------------------------------------------------------
       tokens
    --------------------------------------------------------- */
    var thm = {
        def: { bg:'#0b0c0e', panel:'#131418', panelAlt:'#191b20', border:'#242629', txt:'#e7e8ea', sub:'#7d8590', acc:'#ffffff', accTxt:'#0b0c0e' },
        che: { bg:'#100c0c', panel:'#1c1414', panelAlt:'#241717', border:'#3a2222', txt:'#f2e6e6', sub:'#b58787', acc:'#ef4444', accTxt:'#ffffff' }
    };
    var FONT_UI = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
    var FONT_MONO = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';

    var curThm = 'def', rgbOn = false, rgbH = 0, rgbTimer = null, collapsed = false;
    var lastHeight = '460px';

    /* page-affecting display state (all local, cosmetic, reversible) */
    var pageState = { zoom: 100, fontScale: 100, reduceMotion: false, invert: false };
    var swStyle = null; // stopwatch interval
    var swElapsed = 0, swRunning = false, swStart = 0;
    var clockTimer = null;
    var motionStyleTag = null;

    /* ---------------------------------------------------------
       one-time keyframes
    --------------------------------------------------------- */
    var style = document.createElement('style');
    style.id = 'poly-mod-style';
    style.textContent =
        '@keyframes pm-ring{0%{transform:scale(0.7);opacity:.9}70%{transform:scale(1.35);opacity:0}100%{transform:scale(1.35);opacity:0}}' +
        '@keyframes pm-dot{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}' +
        '@keyframes pm-sweep{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}' +
        '@keyframes pm-fadeup{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}' +
        '#poly-mod-console *{box-sizing:border-box;}' +
        '#poly-mod-console ::-webkit-scrollbar{width:8px;height:8px;}' +
        '#poly-mod-console ::-webkit-scrollbar-thumb{background:#33363c;border-radius:4px;}' +
        '#poly-mod-console ::-webkit-scrollbar-track{background:transparent;}';
    document.head.appendChild(style);

    /* ===========================================================
       BOOT / STARTUP ANIMATION  (~2.6s total)
    =========================================================== */
    var boot = document.createElement('div');
    boot.id = 'poly-mod-boot';
    boot.style.cssText = 'position:fixed;inset:0;z-index:100000;background:' + thm.def.bg + ';display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;opacity:1;transition:opacity .35s ease;font-family:' + FONT_UI + ';';

    var bootCore = document.createElement('div');
    bootCore.style.cssText = 'position:relative;width:46px;height:46px;display:flex;align-items:center;justify-content:center;';
    bootCore.innerHTML =
        '<span style="position:absolute;width:100%;height:100%;border-radius:50%;border:1px solid ' + thm.def.txt + ';animation:pm-ring 1.6s ease-out infinite;"></span>' +
        '<span style="position:absolute;width:100%;height:100%;border-radius:50%;border:1px solid ' + thm.def.txt + ';animation:pm-ring 1.6s ease-out .5s infinite;"></span>' +
        '<span style="width:10px;height:10px;border-radius:50%;background:' + thm.def.txt + ';animation:pm-dot 1.6s ease-in-out infinite;"></span>';

    var bootLabel = document.createElement('div');
    bootLabel.style.cssText = 'color:' + thm.def.sub + ';font-size:11px;letter-spacing:1.5px;text-transform:lowercase;opacity:0;animation:pm-fadeup .4s ease .3s forwards;';
    bootLabel.innerText = 'polymods';

    var bootBar = document.createElement('div');
    bootBar.style.cssText = 'width:120px;height:2px;background:' + thm.def.border + ';border-radius:2px;overflow:hidden;opacity:0;animation:pm-fadeup .4s ease .45s forwards;';
    var bootBarFill = document.createElement('div');
    bootBarFill.style.cssText = 'width:100%;height:100%;background:' + thm.def.txt + ';transform-origin:left;transform:scaleX(0);animation:pm-sweep 1.5s cubic-bezier(0.4,0,0.2,1) .5s forwards;';
    bootBar.appendChild(bootBarFill);

    boot.appendChild(bootCore);
    boot.appendChild(bootLabel);
    boot.appendChild(bootBar);
    document.body.appendChild(boot);

    setTimeout(function(){
        boot.style.opacity = '0';
        setTimeout(function(){ boot.remove(); buildConsole(); }, 350);
    }, 2200);

    /* ===========================================================
       CONSOLE
    =========================================================== */
    function buildConsole(){

    var m = document.createElement('div');
    m.id = 'poly-mod-console';
    m.style.cssText = 'position:fixed;top:100px;left:100px;width:340px;height:' + lastHeight + ';min-width:280px;min-height:200px;max-width:90vw;max-height:90vh;background:' + thm.def.bg + ';color:' + thm.def.txt + ';border:1px solid ' + thm.def.border + ';border-radius:10px;box-shadow:0 20px 48px rgba(0,0,0,0.55);z-index:99999;font-family:' + FONT_UI + ';user-select:none;overflow:hidden;resize:both;transform:scale(0.96);opacity:0;transition:transform .3s cubic-bezier(0.16,1,0.3,1),opacity .25s ease;display:flex;flex-direction:column;';
    requestAnimationFrame(function(){ m.style.transform = 'scale(1)'; m.style.opacity = '1'; });

    /* ---- header ---- */
    var h = document.createElement('div');
    h.style.cssText = 'padding:12px 14px;background:' + thm.def.panel + ';cursor:move;border-bottom:1px solid ' + thm.def.border + ';display:flex;justify-content:space-between;align-items:center;flex-shrink:0;';

    var hLeft = document.createElement('div');
    hLeft.style.cssText = 'display:flex;align-items:center;gap:8px;min-width:0;';
    hLeft.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:' + thm.def.txt + ';flex-shrink:0;"></span>' +
        '<span style="font-weight:600;font-size:12px;letter-spacing:.2px;color:' + thm.def.txt + ';">polymods</span>' +
        '<span style="font-size:11px;color:' + thm.def.sub + ';font-family:' + FONT_MONO + ';">console</span>';

    var hBtns = document.createElement('div');
    hBtns.style.cssText = 'display:flex;gap:4px;flex-shrink:0;';

    function mkIconBtn(txt){
        var bt = document.createElement('button');
        bt.innerText = txt;
        bt.style.cssText = 'width:20px;height:20px;background:transparent;border:none;color:' + thm.def.sub + ';cursor:pointer;font-size:12px;line-height:1;border-radius:5px;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s;';
        bt.onmouseover = function(){ bt.style.background = thm[curThm].panelAlt; bt.style.color = thm[curThm].txt; };
        bt.onmouseout = function(){ bt.style.background = 'transparent'; bt.style.color = thm[curThm].sub; };
        return bt;
    }

    var minBtn = mkIconBtn('\u2212');
    var closeBtn = mkIconBtn('\u2715');
    closeBtn.onclick = function(){
        resetPageEffects();
        m.style.transform = 'scale(0.96)'; m.style.opacity = '0';
        setTimeout(function(){ m.remove(); }, 220);
    };
    hBtns.appendChild(minBtn);
    hBtns.appendChild(closeBtn);
    h.appendChild(hLeft);
    h.appendChild(hBtns);
    m.appendChild(h);

    /* ---- body wrapper (hides on minimize) ---- */
    var body = document.createElement('div');
    body.style.cssText = 'display:flex;flex-direction:column;flex:1;min-height:0;';

    minBtn.onclick = function(){
        collapsed = !collapsed;
        if(collapsed){
            lastHeight = m.style.height;
            body.style.display = 'none';
            m.style.resize = 'none';
            m.style.height = 'auto';
        } else {
            body.style.display = 'flex';
            m.style.resize = 'both';
            m.style.height = lastHeight;
        }
        minBtn.innerText = collapsed ? '\u25a1' : '\u2212';
    };

    /* ---- tabs ---- */
    var tabDefs = [
        { id: 'settings', label: 'settings' },
        { id: 'display',  label: 'display'  },
        { id: 'utility',  label: 'utility'  },
        { id: 'notes',    label: 'notes'    }
        // add more tabs here later, e.g. { id: 'extra', label: 'extra' }
    ];
    var activeTab = tabDefs[0].id;

    var tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;padding:10px 14px;background:' + thm.def.bg + ';border-bottom:1px solid ' + thm.def.border + ';flex-shrink:0;';

    var tabBtns = {};
    tabDefs.forEach(function(td){
        var t = document.createElement('button');
        t.innerText = td.label;
        t.style.cssText = 'padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;font-size:11px;text-transform:lowercase;border:1px solid transparent;transition:all .15s ease;';
        t.onclick = function(){ activeTab = td.id; renderTabs(); };
        tabBtns[td.id] = t;
        tabBar.appendChild(t);
    });

    /* ---- content (scrolls independently so resize works cleanly) ---- */
    var ca = document.createElement('div');
    ca.style.cssText = 'padding:14px;display:flex;flex-direction:column;gap:12px;flex:1;overflow-y:auto;min-height:0;';

    function group(label){
        var g = document.createElement('div');
        g.style.cssText = 'background:' + thm[curThm].panel + ';border:1px solid ' + thm[curThm].border + ';border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:10px;flex-shrink:0;';
        var lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:11px;color:' + thm[curThm].sub + ';font-family:' + FONT_MONO + ';text-transform:lowercase;letter-spacing:.3px;';
        lbl.innerText = label;
        g.appendChild(lbl);
        return g;
    }

    function rowLabel(text){
        var s = document.createElement('span');
        s.style.cssText = 'font-size:12px;color:' + thm[curThm].txt + ';text-transform:lowercase;';
        s.innerText = text;
        return s;
    }

    function mkToggle(initial, onChange){
        var on = initial;
        var toggle = document.createElement('button');
        toggle.style.cssText = 'width:36px;height:20px;border-radius:999px;border:1px solid ' + thm[curThm].border + ';background:' + (on ? '#22c55e' : thm[curThm].panelAlt) + ';cursor:pointer;position:relative;transition:background .2s ease;flex-shrink:0;';
        var knob = document.createElement('span');
        knob.style.cssText = 'position:absolute;top:1px;left:' + (on ? '17px' : '1px') + ';width:16px;height:16px;border-radius:50%;background:#fff;transition:left .2s ease;box-shadow:0 1px 3px rgba(0,0,0,.4);';
        toggle.appendChild(knob);
        toggle.onclick = function(){
            on = !on;
            knob.style.left = on ? '17px' : '1px';
            toggle.style.background = on ? '#22c55e' : thm[curThm].panelAlt;
            onChange(on);
        };
        return toggle;
    }

    function mkSlider(min, max, value, onInput){
        var s = document.createElement('input');
        s.type = 'range';
        s.min = min; s.max = max; s.value = value;
        s.style.cssText = 'flex:1;accent-color:' + thm[curThm].acc + ';cursor:pointer;';
        s.oninput = function(){ onInput(parseInt(s.value, 10)); };
        return s;
    }

    /* ---- settings panel (appearance + rgb) ---- */
    function renderSettingsPanel(){
        var wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

        var gAppearance = group('appearance');
        var swatchRow = document.createElement('div');
        swatchRow.style.cssText = 'display:flex;gap:8px;';

        function mkSwatch(name, label){
            var t = thm[name];
            var sw = document.createElement('button');
            sw.style.cssText = 'flex:1;display:flex;align-items:center;gap:8px;padding:8px 10px;background:' + t.panelAlt + ';border:1px solid ' + (curThm === name ? t.txt : t.border) + ';border-radius:6px;cursor:pointer;transition:border-color .15s;';
            sw.innerHTML = '<span style="width:14px;height:14px;border-radius:50%;background:' + t.acc + ';border:1px solid ' + t.border + ';flex-shrink:0;"></span>' +
                '<span style="font-size:11px;color:' + t.txt + ';text-transform:lowercase;">' + label + '</span>';
            sw.onclick = function(){ curThm = name; applyTheme(); };
            return sw;
        }
        swatchRow.appendChild(mkSwatch('def', 'default'));
        swatchRow.appendChild(mkSwatch('che', 'cherry'));
        gAppearance.appendChild(swatchRow);
        wrap.appendChild(gAppearance);

        var gEffects = group('effects');
        var toggleRow = document.createElement('div');
        toggleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';
        toggleRow.appendChild(rowLabel('rgb lighting'));
        toggleRow.appendChild(mkToggle(rgbOn, function(on){
            rgbOn = on;
            if(rgbOn){
                rgbTimer = setInterval(function(){
                    rgbH = (rgbH + 2) % 360;
                    m.style.borderColor = 'hsl(' + rgbH + ',85%,55%)';
                }, 30);
            } else {
                clearInterval(rgbTimer);
                m.style.borderColor = thm[curThm].border;
            }
            updateFooter();
        }));
        gEffects.appendChild(toggleRow);
        wrap.appendChild(gEffects);

        return wrap;
    }

    /* ---- display panel: purely cosmetic, local-only page comfort tweaks ---- */
    function renderDisplayPanel(){
        var wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

        var gZoom = group('page zoom');
        var zoomRow = document.createElement('div');
        zoomRow.style.cssText = 'display:flex;align-items:center;gap:10px;';
        var zoomVal = document.createElement('span');
        zoomVal.style.cssText = 'font-family:' + FONT_MONO + ';font-size:11px;color:' + thm[curThm].sub + ';width:38px;text-align:right;flex-shrink:0;';
        zoomVal.innerText = pageState.zoom + '%';
        var zoomSlider = mkSlider(50, 150, pageState.zoom, function(v){
            pageState.zoom = v;
            zoomVal.innerText = v + '%';
            document.documentElement.style.zoom = (v / 100);
        });
        zoomRow.appendChild(zoomSlider);
        zoomRow.appendChild(zoomVal);
        gZoom.appendChild(zoomRow);
        wrap.appendChild(gZoom);

        var gFont = group('text size');
        var fontRow = document.createElement('div');
        fontRow.style.cssText = 'display:flex;align-items:center;gap:10px;';
        var fontVal = document.createElement('span');
        fontVal.style.cssText = 'font-family:' + FONT_MONO + ';font-size:11px;color:' + thm[curThm].sub + ';width:38px;text-align:right;flex-shrink:0;';
        fontVal.innerText = pageState.fontScale + '%';
        var fontSlider = mkSlider(80, 150, pageState.fontScale, function(v){
            pageState.fontScale = v;
            fontVal.innerText = v + '%';
            document.documentElement.style.fontSize = v + '%';
        });
        fontRow.appendChild(fontSlider);
        fontRow.appendChild(fontVal);
        gFont.appendChild(fontRow);
        wrap.appendChild(gFont);

        var gComfort = group('comfort');
        var motionRow = document.createElement('div');
        motionRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';
        motionRow.appendChild(rowLabel('reduce page motion'));
        motionRow.appendChild(mkToggle(pageState.reduceMotion, function(on){
            pageState.reduceMotion = on;
            if(on){
                motionStyleTag = document.createElement('style');
                motionStyleTag.id = 'poly-mod-reduce-motion';
                motionStyleTag.textContent = '*{animation-duration:0.001ms !important;animation-iteration-count:1 !important;transition-duration:0.001ms !important;scroll-behavior:auto !important;}';
                document.head.appendChild(motionStyleTag);
            } else if(motionStyleTag){
                motionStyleTag.remove();
                motionStyleTag = null;
            }
        }));
        gComfort.appendChild(motionRow);

        var invertRow = document.createElement('div');
        invertRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';
        invertRow.appendChild(rowLabel('dark filter'));
        invertRow.appendChild(mkToggle(pageState.invert, function(on){
            pageState.invert = on;
            document.documentElement.style.filter = on ? 'invert(1) hue-rotate(180deg)' : '';
        }));
        gComfort.appendChild(invertRow);
        wrap.appendChild(gComfort);

        var resetBtn = document.createElement('button');
        resetBtn.innerText = 'reset display';
        resetBtn.style.cssText = 'width:100%;padding:8px;background:' + thm[curThm].panel + ';color:' + thm[curThm].sub + ';border:1px solid ' + thm[curThm].border + ';border-radius:6px;cursor:pointer;font-size:11px;text-transform:lowercase;';
        resetBtn.onclick = function(){ resetPageEffects(); renderTabs(); };
        wrap.appendChild(resetBtn);

        return wrap;
    }

    function resetPageEffects(){
        pageState = { zoom: 100, fontScale: 100, reduceMotion: false, invert: false };
        document.documentElement.style.zoom = '';
        document.documentElement.style.fontSize = '';
        document.documentElement.style.filter = '';
        if(motionStyleTag){ motionStyleTag.remove(); motionStyleTag = null; }
    }

    /* ---- utility panel: clock + stopwatch, no automation ---- */
    function renderUtilityPanel(){
        var wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

        var gClock = group('clock');
        var clockVal = document.createElement('div');
        clockVal.style.cssText = 'font-family:' + FONT_MONO + ';font-size:22px;font-weight:600;color:' + thm[curThm].txt + ';text-align:center;letter-spacing:1px;';
        function tickClock(){
            var d = new Date();
            function pad(n){ return (n < 10 ? '0' : '') + n; }
            clockVal.innerText = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
        }
        tickClock();
        clearInterval(clockTimer);
        clockTimer = setInterval(tickClock, 1000);
        gClock.appendChild(clockVal);
        wrap.appendChild(gClock);

        var gStopwatch = group('stopwatch');
        var swVal = document.createElement('div');
        swVal.style.cssText = 'font-family:' + FONT_MONO + ';font-size:22px;font-weight:600;color:' + thm[curThm].txt + ';text-align:center;letter-spacing:1px;';
        function fmt(ms){
            var totalSec = Math.floor(ms / 1000);
            var mm = Math.floor(totalSec / 60);
            var ss = totalSec % 60;
            return (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
        }
        function renderSw(){ swVal.innerText = fmt(swElapsed + (swRunning ? Date.now() - swStart : 0)); }
        renderSw();
        gStopwatch.appendChild(swVal);

        var swBtnRow = document.createElement('div');
        swBtnRow.style.cssText = 'display:flex;gap:8px;';

        function mkSmallBtn(label){
            var b = document.createElement('button');
            b.innerText = label;
            b.style.cssText = 'flex:1;padding:7px;background:' + thm[curThm].panelAlt + ';color:' + thm[curThm].txt + ';border:1px solid ' + thm[curThm].border + ';border-radius:6px;cursor:pointer;font-size:11px;text-transform:lowercase;';
            return b;
        }

        var startStopBtn = mkSmallBtn(swRunning ? 'stop' : 'start');
        var resetSwBtn = mkSmallBtn('reset');

        startStopBtn.onclick = function(){
            if(swRunning){
                swElapsed += Date.now() - swStart;
                swRunning = false;
                startStopBtn.innerText = 'start';
                if(swStyle) clearInterval(swStyle);
            } else {
                swStart = Date.now();
                swRunning = true;
                startStopBtn.innerText = 'stop';
                swStyle = setInterval(renderSw, 250);
            }
        };
        resetSwBtn.onclick = function(){
            swElapsed = 0; swRunning = false;
            if(swStyle) clearInterval(swStyle);
            startStopBtn.innerText = 'start';
            renderSw();
        };

        swBtnRow.appendChild(startStopBtn);
        swBtnRow.appendChild(resetSwBtn);
        gStopwatch.appendChild(swBtnRow);
        wrap.appendChild(gStopwatch);

        var gCopy = group('page info');
        var copyBtn = document.createElement('button');
        copyBtn.innerText = 'copy current url';
        copyBtn.style.cssText = 'width:100%;padding:8px;background:' + thm[curThm].panelAlt + ';color:' + thm[curThm].txt + ';border:1px solid ' + thm[curThm].border + ';border-radius:6px;cursor:pointer;font-size:11px;text-transform:lowercase;';
        copyBtn.onclick = function(){
            navigator.clipboard.writeText(window.location.href).then(function(){
                var old = copyBtn.innerText;
                copyBtn.innerText = 'copied';
                setTimeout(function(){ copyBtn.innerText = old; }, 1000);
            });
        };
        gCopy.appendChild(copyBtn);
        wrap.appendChild(gCopy);

        return wrap;
    }

    /* ---- notes panel: private scratchpad, saved locally in this browser ---- */
    function renderNotesPanel(){
        var wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;gap:12px;flex:1;min-height:0;';

        var gNotes = group('scratchpad');
        gNotes.style.flex = '1';
        gNotes.style.minHeight = '0';

        var ta = document.createElement('textarea');
        ta.placeholder = 'jot anything down here...';
        ta.style.cssText = 'flex:1;min-height:100px;resize:none;background:' + thm[curThm].panelAlt + ';color:' + thm[curThm].txt + ';border:1px solid ' + thm[curThm].border + ';border-radius:6px;padding:8px;font-family:' + FONT_UI + ';font-size:12px;outline:none;';
        try { ta.value = localStorage.getItem('poly-mod-notes') || ''; } catch(e){}
        ta.oninput = function(){
            try { localStorage.setItem('poly-mod-notes', ta.value); } catch(e){}
        };
        gNotes.appendChild(ta);
        wrap.appendChild(gNotes);

        return wrap;
    }

    var panelRenderers = {
        settings: renderSettingsPanel,
        display: renderDisplayPanel,
        utility: renderUtilityPanel,
        notes: renderNotesPanel
    };

    function renderTabs(){
        Object.keys(tabBtns).forEach(function(id){
            var t = tabBtns[id];
            var active = id === activeTab;
            t.style.background = active ? thm[curThm].acc : thm[curThm].panel;
            t.style.color = active ? thm[curThm].accTxt : thm[curThm].sub;
            t.style.borderColor = active ? thm[curThm].acc : thm[curThm].border;
        });
        if(activeTab !== 'utility'){ clearInterval(clockTimer); clockTimer = null; }
        ca.innerHTML = '';
        var content = panelRenderers[activeTab]();
        content.style.opacity = '0';
        ca.appendChild(content);
        requestAnimationFrame(function(){ content.style.transition = 'opacity .18s ease'; content.style.opacity = '1'; });
    }

    /* ---- footer ---- */
    var footer = document.createElement('div');
    footer.style.cssText = 'padding:8px 14px;background:' + thm.def.panel + ';border-top:1px solid ' + thm.def.border + ';font-size:10px;font-family:' + FONT_MONO + ';color:' + thm.def.sub + ';text-transform:lowercase;letter-spacing:.2px;flex-shrink:0;';

    function updateFooter(){
        footer.innerHTML = 'theme: ' + (curThm === 'def' ? 'default' : 'cherry') +
            ' <span style="opacity:.4;">/</span> rgb: ' + (rgbOn ? 'on' : 'off');
        footer.style.background = thm[curThm].panel;
        footer.style.borderTop = '1px solid ' + thm[curThm].border;
        footer.style.color = thm[curThm].sub;
    }

    /* ---- theming ---- */
    function applyTheme(){
        var t = thm[curThm];
        m.style.background = t.bg;
        if(!rgbOn) m.style.borderColor = t.border;
        m.style.color = t.txt;
        h.style.background = t.panel;
        h.style.borderBottom = '1px solid ' + t.border;
        hLeft.querySelectorAll('span')[0].style.background = t.txt;
        hLeft.querySelectorAll('span')[1].style.color = t.txt;
        hLeft.querySelectorAll('span')[2].style.color = t.sub;
        tabBar.style.background = t.bg;
        tabBar.style.borderBottom = '1px solid ' + t.border;
        renderTabs();
        updateFooter();
    }

    body.appendChild(tabBar);
    body.appendChild(ca);
    m.appendChild(body);
    m.appendChild(footer);
    document.body.appendChild(m);

    renderTabs();
    updateFooter();

    /* ---- drag (header only; native resize handle covers resizing) ---- */
    var isDrg = false, sX = 0, sY = 0, rAF = null;
    h.onmousedown = function(e){
        if(e.target === closeBtn || e.target === minBtn) return;
        isDrg = true;
        sX = e.clientX - m.offsetLeft;
        sY = e.clientY - m.offsetTop;
        e.preventDefault();
    };
    document.addEventListener('mousemove', function(e){
        if(!isDrg) return;
        if(rAF) cancelAnimationFrame(rAF);
        rAF = requestAnimationFrame(function(){
            m.style.left = (e.clientX - sX) + 'px';
            m.style.top = (e.clientY - sY) + 'px';
        });
    });
    document.addEventListener('mouseup', function(){
        isDrg = false;
        if(rAF) cancelAnimationFrame(rAF);
    });

    } // end buildConsole
})();
