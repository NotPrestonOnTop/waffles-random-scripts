(function(){
    if(document.getElementById('poly-mod-console')) return;
    
    var thm = {
        def: { bg: '#141515', card: '#1b1c24', border: '#23262d', acc: '#ffffff', txt: '#111216', sub: '#9ca3af' },
        che: { bg: '#181212', card: '#241616', border: '#3d2222', acc: '#ef4444', txt: '#ffffff', sub: '#d18888' }
    };
    
    var curThm = 'def', rgbOn = false, rgbH = 0, rgbTimer = null, plusState = 0; // 0: Off, 1: Plus, 2: Deluxe
    
    var m = document.createElement('div');
    m.id = 'poly-mod-console';
    m.style.cssText = 'position:fixed;top:100px;left:100px;width:320px;min-width:260px;min-height:220px;background:' + thm.def.bg + ';color:#fff;border:1px solid ' + thm.def.border + ';border-radius:8px;box-shadow:0 12px 32px rgba(0,0,0,0.8);z-index:99999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;user-select:none;resize:both;overflow:hidden;transform:scale(0.95);opacity:0;transition:transform 0.25s cubic-bezier(0.16,1,0.3,1),opacity 0.2s ease;display:flex;flex-direction:column;';
    
    setTimeout(function(){ m.style.transform = 'scale(1)'; m.style.opacity = '1'; }, 10);
    
    var h = document.createElement('div');
    h.style.cssText = 'padding:10px 14px;background:' + thm.def.card + ';cursor:move;font-weight:600;font-size:12px;letter-spacing:0.5px;border-bottom:1px solid ' + thm.def.border + ';display:flex;justify-content:space-between;align-items:center;color:' + thm.def.sub + ';flex-shrink:0;';
    h.innerHTML = '<span>polymods // console</span>';
    
    var b = document.createElement('button');
    b.innerText = '\u2715';
    b.style.cssText = 'background:transparent;border:none;color:' + thm.def.sub + ';cursor:pointer;font-size:13px;padding:2px;display:flex;align-items:center;justify-content:center;transition:color 0.2s;';
    b.onmouseover = function(){ b.style.color = '#fff'; };
    b.onmouseout = function(){ b.style.color = thm[curThm].sub; };
    b.onclick = function(){ 
        m.style.transform = 'scale(0.95)'; m.style.opacity = '0'; 
        setTimeout(function(){ m.remove(); }, 200); 
    };
    h.appendChild(b);
    m.appendChild(h);
    
    var tb = document.createElement('div');
    tb.style.cssText = 'display:flex;gap:6px;padding:10px 14px;background:' + thm.def.bg + ';border-bottom:1px solid ' + thm.def.border + ';flex-shrink:0;';
    
    var ca = document.createElement('div');
    ca.style.cssText = 'flex:1;padding:14px;overflow-y:auto;position:relative;background:' + thm.def.bg + ';display:flex;flex-direction:column;';
    
    function mkTab(txt, act) {
        var t = document.createElement('button');
        t.innerText = txt;
        t.style.cssText = 'padding:6px 12px;background:' + (act ? thm.def.acc : thm.def.card) + ';color:' + (act ? thm.def.txt : thm.def.sub) + ';border:1px solid ' + (act ? thm.def.acc : thm.def.border) + ';border-radius:6px;cursor:pointer;font-weight:600;font-size:11px;transition:all 0.2s ease;text-transform:lowercase;';
        return t;
    }
    
    var t1 = mkTab('main', true);
    var t2 = mkTab('settings', false);
    
    var p1 = document.createElement('div');
    p1.style.cssText = 'display:flex;flex-direction:column;gap:10px;opacity:1;transition:opacity 0.2s ease;width:100%;';
    
    // Max Currency Button
    var btn = document.createElement('button');
    btn.innerText = 'max currency';
    btn.style.cssText = 'width:100%;padding:10px 12px;background:' + thm.def.acc + ';color:' + thm.def.txt + ';border:none;border-radius:6px;cursor:pointer;font-weight:700;font-size:12px;text-transform:lowercase;letter-spacing:0.5px;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:background 0.2s,transform 0.1s;';
    btn.onclick = function() {
        document.querySelectorAll('*').forEach(function(el) {
            let prev = el.previousElementSibling;
            if (prev && (prev.tagName === 'IMG' || prev.tagName === 'I' || prev.tagName === 'SVG' || prev.className.includes('icon') || prev.innerHTML.includes('svg'))) {
                let txt = el.innerText ? el.innerText.trim() : '';
                if (/^\d+$/.test(txt)) {
                    let pHTML = prev.outerHTML.toLowerCase();
                    if (!pHTML.includes('fire') && !pHTML.includes('flame')) {
                        el.innerText = '999,999,999';
                    }
                }
            }
            if (el.children.length === 0 && el.innerText) {
                let t = el.innerText.trim();
                if (/^\d+\s*(Bricks|Studs)$/i.test(t)) {
                    el.innerText = t.replace(/^\d+/, '999,999,999');
                }
            }
        });
    };
    p1.appendChild(btn);

    // Membership Switcher Button
    var btnPlus = document.createElement('button');
    btnPlus.innerText = 'membership: [off]';
    btnPlus.style.cssText = 'width:100%;padding:10px 12px;background:' + thm.def.card + ';color:' + thm.def.sub + ';border:1px solid ' + thm.def.border + ';border-radius:6px;cursor:pointer;font-weight:600;font-size:12px;text-transform:lowercase;letter-spacing:0.5px;transition:all 0.2s ease;';
    
    function updateMembership() {
        var badgeId = 'poly-mod-native-badge';
        document.querySelectorAll('#' + badgeId).forEach(function(el){ el.remove(); });

        if (plusState === 0) {
            btnPlus.innerText = 'membership: [off]';
            btnPlus.style.background = thm[curThm].card;
            btnPlus.style.color = thm[curThm].sub;
            btnPlus.style.borderColor = thm[curThm].border;
        } else if (plusState === 1) {
            btnPlus.innerText = 'membership: [polytoria plus]';
            btnPlus.style.background = '#2563eb';
            btnPlus.style.color = '#ffffff';
            btnPlus.style.borderColor = '#3b82f6';
            injectBadges('PLUS', 'linear-gradient(135deg, #2563eb, #1d4ed8)', 'rgba(37, 99, 235, 0.4)');
        } else if (plusState === 2) {
            btnPlus.innerText = 'membership: [plus deluxe]';
            btnPlus.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            btnPlus.style.color = '#ffffff';
            btnPlus.style.borderColor = '#fbbf24';
            injectBadges('DELUXE', 'linear-gradient(135deg, #f59e0b, #b45309)', 'rgba(245, 158, 11, 0.6)');
        }
    }

    function injectBadges(text, bgGrad, shadowCol) {
        var badgeId = 'poly-mod-native-badge';
        document.querySelectorAll('a, h1, h2, h3, span, div').forEach(function(el) {
            if (el.getAttribute && el.getAttribute('href') && el.getAttribute('href').includes('/users/')) {
                if (el.innerText && el.innerText.trim().length > 0 && !el.querySelector('#' + badgeId)) {
                    var badge = document.createElement('span');
                    badge.id = badgeId;
                    badge.innerHTML = '★ ' + text;
                    badge.style.cssText = 'background:' + bgGrad + ';color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:4px;margin-left:6px;vertical-align:middle;box-shadow:0 0 10px ' + shadowCol + ';letter-spacing:0.5px;display:inline-block;text-transform:uppercase;';
                    el.appendChild(badge);
                }
            }
        });
    }

    btnPlus.onclick = function() {
        plusState = (plusState + 1) % 3;
        updateMembership();
    };
    p1.appendChild(btnPlus);
    
    var p2 = document.createElement('div');
    p2.style.cssText = 'display:none;flex-direction:column;gap:10px;opacity:0;transition:opacity 0.2s ease;width:100%;';
    p2.innerHTML = '<div style="font-size:11px;color:' + thm.def.sub + ';font-weight:600;margin-bottom:2px;text-transform:lowercase;letter-spacing:0.5px;">theme preset</div>' +
                   '<div style="display:flex;gap:8px;"><button id="thm-def" style="flex:1;padding:8px;background:' + thm.def.card + ';color:#fff;border:1px solid ' + thm.def.acc + ';border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;text-transform:lowercase;">default</button>' +
                   '<button id="thm-che" style="flex:1;padding:8px;background:' + thm.che.card + ';color:#fff;border:1px solid ' + thm.che.border + ';border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;text-transform:lowercase;">cherry</button></div>' +
                   '<div style="font-size:11px;color:' + thm.def.sub + ';font-weight:600;margin-top:6px;margin-bottom:2px;text-transform:lowercase;letter-spacing:0.5px;">rgb mode</div>' +
                   '<button id="rgb-tgl" style="width:100%;padding:8px;background:' + thm.def.card + ';color:#ef4444;border:1px solid ' + thm.def.border + ';border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;text-transform:lowercase;display:flex;justify-content:space-between;align-items:center;padding-left:12px;padding-right:12px;"><span>RGB Lighting</span><span id="rgb-st">[ off ]</span></button>';

    function applyTheme(name) {
        curThm = name;
        var t = thm[name];
        m.style.background = t.bg;
        m.style.border = '1px solid ' + (rgbOn ? 'hsl(' + rgbH + ',100%,50%)' : t.border);
        h.style.background = t.card;
        h.style.borderBottom = '1px solid ' + t.border;
        h.style.color = t.sub;
        b.style.color = t.sub;
        tb.style.background = t.bg;
        tb.style.borderBottom = '1px solid ' + t.border;
        ca.style.background = t.bg;
        btn.style.background = rgbOn ? 'hsl(' + rgbH + ',100%,50%)' : t.acc;
        btn.style.color = t.txt;
        if (plusState === 0) {
            btnPlus.style.background = t.card;
            btnPlus.style.color = t.sub;
            btnPlus.style.borderColor = t.border;
        }
    }

    t1.onclick = function() {
        t1.style.background = rgbOn ? 'hsl(' + rgbH + ',100%,50%)' : thm[curThm].acc;
        t1.style.color = thm[curThm].txt;
        t1.style.borderColor = rgbOn ? 'hsl(' + rgbH + ',100%,50%)' : thm[curThm].acc;
        t2.style.background = thm[curThm].card;
        t2.style.color = thm[curThm].sub;
        t2.style.borderColor = thm[curThm].border;
        p2.style.opacity = '0';
        setTimeout(function(){ p2.style.display = 'none'; p1.style.display = 'flex'; setTimeout(function(){ p1.style.opacity = '1'; }, 10); }, 150);
    };

    t2.onclick = function() {
        t2.style.background = rgbOn ? 'hsl(' + rgbH + ',100%,50%)' : thm[curThm].acc;
        t2.style.color = thm[curThm].txt;
        t2.style.borderColor = rgbOn ? 'hsl(' + rgbH + ',100%,50%)' : thm[curThm].acc;
        t1.style.background = thm[curThm].card;
        t1.style.color = thm[curThm].sub;
        t1.style.borderColor = thm[curThm].border;
        p1.style.opacity = '0';
        setTimeout(function(){ p1.style.display = 'none'; p2.style.display = 'flex'; setTimeout(function(){ p2.style.opacity = '1'; }, 10); }, 150);
    };

    tb.appendChild(t1);
    tb.appendChild(t2);
    m.appendChild(tb);
    ca.appendChild(p1);
    ca.appendChild(p2);
    m.appendChild(ca);
    document.body.appendChild(m);

    setTimeout(function(){
        document.getElementById('thm-def').onclick = function(){ applyTheme('def'); };
        document.getElementById('thm-che').onclick = function(){ applyTheme('che'); };
        document.getElementById('rgb-tgl').onclick = function(){
            rgbOn = !rgbOn;
            var st = document.getElementById('rgb-st');
            if(rgbOn){
                st.innerText = '[ on ]';
                st.style.color = '#22c55e';
                rgbTimer = setInterval(function(){
                    rgbH = (rgbH + 2) % 360;
                    var col = 'hsl(' + rgbH + ',100%,50%)';
                    m.style.borderColor = col;
                    btn.style.background = col;
                }, 30);
            } else {
                st.innerText = '[ off ]';
                st.style.color = '#ef4444';
                clearInterval(rgbTimer);
                applyTheme(curThm);
            }
        };
    }, 50);

    var isDrg = false, sX = 0, sY = 0, rAF = null;
    h.onmousedown = function(e){
        if(e.target === b) return;
        isDrg = true;
        sX = e.clientX - m.offsetLeft;
        sY = e.clientY - m.offsetTop;
        e.preventDefault();
    };
    document.onmousemove = function(e){
        if(!isDrg) return;
        if(rAF) cancelAnimationFrame(rAF);
        rAF = requestAnimationFrame(function(){
            m.style.left = (e.clientX - sX) + 'px';
            m.style.top = (e.clientY - sY) + 'px';
        });
    };
    document.onmouseup = function(){
        isDrg = false;
        if(rAF) cancelAnimationFrame(rAF);
    };
})();
