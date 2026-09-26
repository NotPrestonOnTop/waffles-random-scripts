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

    /* ---------------------------------------------------------
       one-time styles (keyframes only live here)
    --------------------------------------------------------- */
    var style = document.createElement('style');
    style.id = 'poly-mod-style';
    style.textContent =
        '@keyframes pm-ring{0%{transform:scale(0.7);opacity:.9}70%{transform:scale(1.35);opacity:0}100%{transform:scale(1.35);opacity:0}}' +
        '@keyframes pm-dot{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}' +
        '@keyframes pm-sweep{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}' +
        '@keyframes pm-fadeup{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}';
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
    m.style.cssText = 'position:fixed;top:100px;left:100px;width:300px;min-width:260px;min-height:0;background:' + thm.def.bg + ';color:' + thm.def.txt + ';border:1px solid ' + thm.def.border + ';border-radius:10px;box-shadow:0 20px 48px rgba(0,0,0,0.55);z-index:99999;font-family:' + FONT_UI + ';user-select:none;overflow:hidden;transform:scale(0.96);opacity:0;transition:transform .3s cubic-bezier(0.16,1,0.3,1),opacity .25s ease;display:flex;flex-direction:column;';
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
        m.style.transform = 'scale(0.96)'; m.style.opacity = '0';
        setTimeout(function(){ m.remove(); }, 220);
    };
    hBtns.appendChild(minBtn);
    hBtns.appendChild(closeBtn);
    h.appendChild(hLeft);
    h.appendChild(hBtns);
    m.appendChild(h);

    /* ---- body wrapper (collapses on minimize) ---- */
    var body = document.createElement('div');
    body.style.cssText = 'display:flex;flex-direction:column;overflow:hidden;transition:max-height .25s ease,opacity .2s ease;max-height:600px;opacity:1;';

    minBtn.onclick = function(){
        collapsed = !collapsed;
        body.style.maxHeight = collapsed ? '0px' : '600px';
        body.style.opacity = collapsed ? '0' : '1';
        minBtn.innerText = collapsed ? '\u25a1' : '\u2212';
    };

    /* ---- tabs ---- */
    var tabDefs = [
        { id: 'settings', label: 'settings' }
        // add more tabs here later, e.g. { id: 'extra', label: 'extra' }
    ];
    var activeTab = tabDefs[0].id;

    var tabBar = document.createElement('div');
    tabBar.style.cssText = 'display:flex;gap:6px;padding:10px 14px;background:' + thm.def.bg + ';border-bottom:1px solid ' + thm.def.border + ';flex-shrink:0;';

    var tabBtns = {};
    tabDefs.forEach(function(td){
        var t = document.createElement('button');
        t.innerText = td.label;
        t.style.cssText = 'padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;font-size:11px;text-transform:lowercase;border:1px solid transparent;transition:all .15s ease;';
        t.onclick = function(){ activeTab = td.id; renderTabs(); };
        tabBtns[td.id] = t;
        tabBar.appendChild(t);
    });

    /* ---- content ---- */
    var ca = document.createElement('div');
    ca.style.cssText = 'padding:14px;display:flex;flex-direction:column;gap:12px;';

    function group(label){
        var g = document.createElement('div');
        g.style.cssText = 'background:' + thm[curThm].panel + ';border:1px solid ' + thm[curThm].border + ';border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:10px;';
        var lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:11px;color:' + thm[curThm].sub + ';font-family:' + FONT_MONO + ';text-transform:lowercase;letter-spacing:.3px;';
        lbl.innerText = label;
        g.appendChild(lbl);
        return g;
    }

    function renderSettingsPanel(){
        var wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

        // appearance group
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

        // effects group
        var gEffects = group('effects');
        var toggleRow = document.createElement('div');
        toggleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';
        var toggleLabel = document.createElement('span');
        toggleLabel.style.cssText = 'font-size:12px;color:' + thm[curThm].txt + ';text-transform:lowercase;';
        toggleLabel.innerText = 'rgb lighting';

        var toggle = document.createElement('button');
        toggle.style.cssText = 'width:36px;height:20px;border-radius:999px;border:1px solid ' + thm[curThm].border + ';background:' + (rgbOn ? '#22c55e' : thm[curThm].panelAlt) + ';cursor:pointer;position:relative;transition:background .2s ease;flex-shrink:0;';
        var knob = document.createElement('span');
        knob.style.cssText = 'position:absolute;top:1px;left:' + (rgbOn ? '17px' : '1px') + ';width:16px;height:16px;border-radius:50%;background:#fff;transition:left .2s ease;box-shadow:0 1px 3px rgba(0,0,0,.4);';
        toggle.appendChild(knob);
        toggle.onclick = function(){
            rgbOn = !rgbOn;
            knob.style.left = rgbOn ? '17px' : '1px';
            toggle.style.background = rgbOn ? '#22c55e' : thm[curThm].panelAlt;
            if(rgbOn){
                rgbTimer = setInterval(function(){
                    rgbH = (rgbH + 2) % 360;
                    var col = 'hsl(' + rgbH + ',85%,55%)';
                    m.style.borderColor = col;
                }, 30);
            } else {
                clearInterval(rgbTimer);
                m.style.borderColor = thm[curThm].border;
            }
            updateFooter();
        };
        toggleRow.appendChild(toggleLabel);
        toggleRow.appendChild(toggle);
        gEffects.appendChild(toggleRow);
        wrap.appendChild(gEffects);

        return wrap;
    }

    var panelRenderers = { settings: renderSettingsPanel };

    function renderTabs(){
        Object.keys(tabBtns).forEach(function(id){
            var t = tabBtns[id];
            var active = id === activeTab;
            t.style.background = active ? thm[curThm].acc : thm[curThm].panel;
            t.style.color = active ? thm[curThm].accTxt : thm[curThm].sub;
            t.style.borderColor = active ? thm[curThm].acc : thm[curThm].border;
        });
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
    body.appendChild(footer);
    m.appendChild(body);
    document.body.appendChild(m);

    renderTabs();
    updateFooter();

    /* ---- drag ---- */
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
