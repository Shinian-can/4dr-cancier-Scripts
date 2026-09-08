// ==UserScript==
// @name         番茄小说阅读增强
// @namespace    https://github.com/Shinian-can/4dr-cancier-Scripts
// @version      1.0.3
// @description  使用了AI，与原有的网页夜间模式冲突
// @author       4dr-cancier
// @match        https://fanqienovel.com/reader/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fanqienovel.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ========== 1. 创建悬浮窗按钮 ==========
    const floatBtn = document.createElement('div');
    floatBtn.id = 'my-float-btn';
    floatBtn.textContent = 'C';
    floatBtn.style.cssText = `
        position: fixed; bottom: 100px; right: 20px; width: 50px; height: 50px;
        background: #fbc6d7; color: #955066; font-size: 24px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center; cursor: move;
        z-index: 999999; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        user-select: none; transition: transform 0.2s;
    `;
    document.body.appendChild(floatBtn);

    // ========== 2. 创建主面板 ==========
    const panel = document.createElement('div');
    panel.id = 'my-panel';
    panel.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 400px; max-width: 90%; background: white; z-index: 1000000;
        display: none; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #333; max-height: 80vh; overflow: auto;
    `;
    panel.innerHTML = `
        <div style="padding:20px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin:0; font-size:18px;">阅读增强设置</h3>
            <button id="panel-close-btn" style="background:none; border:none; font-size:24px; cursor:pointer; color:#999; padding:0 8px;">✕</button>
        </div>
        <div style="padding:20px; max-height:70vh; overflow-y:auto;">

            <!-- 宽度滑块 -->
            <div style="margin:16px 0; padding:12px; background:#f5f5f5; border-radius:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <label style="font-weight:500;"> 阅读区域宽度</label>
                    <span id="width-value" style="background:#fbc6d7; color:white; padding:2px 12px; border-radius:12px; font-size:14px; font-weight:bold; width:55px; text-align:center;">80%</span>
                </div>
                <input type="range" id="width-slider" min="50" max="100" value="80" style="width:100%; height:6px; -webkit-appearance:none; appearance:none; background:#fbc6d7; border-radius:3px; outline:none; cursor:pointer;">
                <div style="display:flex; justify-content:space-between; font-size:12px; color:#999; margin-top:4px;"><span>50%</span><span>100%</span></div>
            </div>

            <!-- 边距滑块 -->
            <div style="margin:16px 0; padding:12px; background:#f5f5f5; border-radius:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <label style="font-weight:500;">文字左右边距</label>
                    <span id="padding-value" style="background:#fbc6d7; color:white; padding:2px 12px; border-radius:12px; font-size:14px; font-weight:bold; width:55px; text-align:center;">80px</span>
                </div>
                <input type="range" id="padding-slider" min="0" max="100" value="80" style="width:100%; height:6px; -webkit-appearance:none; appearance:none; background:#fbc6d7; border-radius:3px; outline:none; cursor:pointer;">
                <div style="display:flex; justify-content:space-between; font-size:12px; color:#999; margin-top:4px;"><span>0px</span><span>100px</span></div>
            </div>

            <!-- 颜色设置 -->
            <div style="margin:16px 0; padding:12px; background:#f5f5f5; border-radius:8px;">
                <div style="font-weight:500; margin-bottom:12px;"> 颜色设置</div>
                <hr/>
                ${['文字颜色', 'color-text', '#252525', '小说背景', 'color-bg', '#f2f2f2', '外部背景', 'color-margin', '#e0e0e0'].map((_, i, arr) => i % 3 === 0 ? `
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;${i===0?'padding-top:10px;':''}">
                    <label style="cursor:pointer; font-size:14px;">${arr[i]}</label>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="color" id="${arr[i+1]}" value="${arr[i+2]}" style="width:36px; height:36px; border:2px solid #ddd; cursor:pointer; background:white; padding:2px;">
                        <span id="${arr[i+1]}-value" style="font-size:12px; color:#999; min-width:50px;">${arr[i+2]}</span>
                    </div>
                </div>` : '').join('')}
            </div>

            <!-- 占位 -->
            <div style="margin:16px 0; padding:12px; background:#f9f9f9; border-radius:8px; border:1px dashed #ddd; text-align:center; color:#999;">⏳ 更多功能开发中...</div>

            <button id="reset-btn" style="width:100%; padding:10px; background:#ff6b6b; color:white; border:none; border-radius:8px; font-size:14px; cursor:pointer; margin-top:8px;">↺ 重置默认</button>
            <p style="font-size:12px; color:#aaa; margin-top:16px; text-align:center;">💡 拖动按钮可移动 | 设置自动保存</p>
        </div>
    `;
    document.body.appendChild(panel);

    // ========== 3. 获取 DOM 引用 ==========
    const $ = (id) => document.getElementById(id);
    const slider = $('width-slider');
    const paddingSlider = $('padding-slider');
    const colorText = $('color-text');
    const colorBg = $('color-bg');
    const colorMargin = $('color-margin');
    const colorTextValue = $('color-text-value');
    const colorBgValue = $('color-bg-value');
    const colorMarginValue = $('color-margin-value');

    // ========== 4. 核心功能函数 ==========
    function setReaderWidth(val) {
        const p = val / 100;
        const inner = document.querySelector('.muye-reader .muye-reader-inner');
        if (inner) { inner.style.width = p * 100 + '%'; inner.style.maxWidth = p * 100 + '%'; }
        const nav = document.querySelector('.muye-reader-nav');
        if (nav) { nav.style.maxWidth = p * 100 + '%'; }
        let style = document.getElementById('my-reader-width-style') || (() => {
            const s = document.createElement('style');
            s.id = 'my-reader-width-style';
            document.head.appendChild(s);
            return s;
        })();
        style.textContent = `.muye-reader .muye-reader-inner { width: ${p*100}% !important; max-width: ${p*100}% !important; } .muye-reader-nav { max-width: ${p*100}% !important; }`;
        console.log(`宽度: ${val}%`);
    }

    function setReaderPadding(val) {
        const px = val + 'px';
        document.querySelectorAll('.muye-reader-box-header, .muye-reader-content, .muye-reader-nav').forEach(el => {
            el.style.paddingLeft = px; el.style.paddingRight = px;
        });
        let style = document.getElementById('my-reader-padding-style') || (() => {
            const s = document.createElement('style');
            s.id = 'my-reader-padding-style';
            document.head.appendChild(s);
            return s;
        })();
        style.textContent = `.muye-reader-box-header, .muye-reader-content, .muye-reader-nav { padding-left: ${px} !important; padding-right: ${px} !important; }`;
        console.log(`边距: ${val}px`);
    }

    function applyAllColors(text, bg, margin) {
        const inner = document.querySelector('.muye-reader .muye-reader-inner');
        if (inner) { inner.style.setProperty('--web-text', text); inner.style.color = text; inner.style.setProperty('--web-bg', bg); inner.style.backgroundColor = bg; }
        const reader = document.querySelector('.muye-reader');
        if (reader) { reader.style.setProperty('--web-margin', margin); reader.style.backgroundColor = margin; }
    }

    // ========== 5. 滑块统一处理 ==========
    const sliderConfigs = [
        { el: slider, display: $('width-value'), set: setReaderWidth, bg: (v) => `linear-gradient(to right, #fbc6d7 0%, #fbc6d7 ${((v-50)/50)*100}%, #ddd ${((v-50)/50)*100}%, #ddd 100%)`, unit: '%' },
        { el: paddingSlider, display: $('padding-value'), set: setReaderPadding, bg: (v) => `linear-gradient(to right, #fbc6d7 0%, #fbc6d7 ${(v/100)*100}%, #ddd ${(v/100)*100}%, #ddd 100%)`, unit: 'px' }
    ];

    sliderConfigs.forEach(({ el, display, set, bg, unit }) => {
        el.addEventListener('input', function() {
            const v = parseInt(this.value);
            display.textContent = v + unit;
            this.style.background = bg(v);
            set(v);
            saveConfig();
        });
    });

    // ========== 6. 颜色统一处理 ==========
    const colorConfigs = [
        { el: colorText, display: colorTextValue, apply: (v) => { const inner = document.querySelector('.muye-reader .muye-reader-inner'); if (inner) { inner.style.setProperty('--web-text', v); inner.style.color = v; } } },
        { el: colorBg, display: colorBgValue, apply: (v) => { const inner = document.querySelector('.muye-reader .muye-reader-inner'); if (inner) { inner.style.setProperty('--web-bg', v); inner.style.backgroundColor = v; } } },
        { el: colorMargin, display: colorMarginValue, apply: (v) => { const reader = document.querySelector('.muye-reader'); if (reader) { reader.style.setProperty('--web-margin', v); reader.style.backgroundColor = v; } } }
    ];

    colorConfigs.forEach(({ el, display, apply }) => {
        el.addEventListener('input', function() {
            const v = this.value;
            display.textContent = v;
            apply(v);
            saveConfig();
        });
    });

    // ========== 7. 配置存储 ==========
    const CONFIG_KEY = 'fanqienovel_config';
    const DEFAULTS = {
        width: 80,
        padding: 80,
        textColor: '#252525',
        bgColor: '#f2f2f2',
        marginColor: '#e0e0e0' };

    function saveConfig() {
        const config = { width: parseInt(slider.value)||80, padding: parseInt(paddingSlider.value)||80, textColor: colorText.value, bgColor: colorBg.value, marginColor: colorMargin.value };
        try { localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); } catch(e) {}
    }

    function loadConfig() {
        try { const s = localStorage.getItem(CONFIG_KEY); if (s) return JSON.parse(s); } catch(e) {}
        return null;
    }

    function applyConfig(c) {
        if (!c) return;
        slider.value = c.width; $('width-value').textContent = c.width + '%'; slider.style.background = `linear-gradient(to right, #fbc6d7 0%, #fbc6d7 ${((c.width-50)/50)*100}%, #ddd ${((c.width-50)/50)*100}%, #ddd 100%)`; setReaderWidth(c.width);
        paddingSlider.value = c.padding; $('padding-value').textContent = c.padding + 'px'; paddingSlider.style.background = `linear-gradient(to right, #fbc6d7 0%, #fbc6d7 ${(c.padding/100)*100}%, #ddd ${(c.padding/100)*100}%, #ddd 100%)`; setReaderPadding(c.padding);
        colorText.value = c.textColor; colorTextValue.textContent = c.textColor;
        colorBg.value = c.bgColor; colorBgValue.textContent = c.bgColor;
        colorMargin.value = c.marginColor; colorMarginValue.textContent = c.marginColor;
        applyAllColors(c.textColor, c.bgColor, c.marginColor);
    }

    // ========== 8. 拖拽逻辑 + 窗口变化自适应 ==========
let isDragging = false, offsetX, offsetY, startX, startY, hasDragged = false;
// 记录悬浮窗在视口中的相对位置（百分比）
let posX = 0; // 距离右侧的百分比 (0=贴右, 1=贴左)
let posY = 0; // 距离底部的百分比 (0=贴底, 1=贴顶)

// 更新悬浮窗位置（基于相对百分比）
function updateFloatBtnPosition() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const btnW = floatBtn.offsetWidth || 50;
    const btnH = floatBtn.offsetHeight || 50;
    // 用百分比计算位置
    const left = vw - btnW - posX * (vw - btnW);
    const top = vh - btnH - posY * (vh - btnH);
    floatBtn.style.left = Math.max(0, Math.min(vw - btnW, left)) + 'px';
    floatBtn.style.top = Math.max(0, Math.min(vh - btnH, top)) + 'px';
    floatBtn.style.right = 'auto';
    floatBtn.style.bottom = 'auto';
}

// 从当前 CSS 位置计算百分比
function calcPositionFromStyle() {
    const rect = floatBtn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const btnW = rect.width;
    const btnH = rect.height;
    posX = (vw - btnW - rect.left) / (vw - btnW);
    posY = (vh - btnH - rect.top) / (vh - btnH);
    // 限制范围 0-1
    posX = Math.max(0, Math.min(1, posX));
    posY = Math.max(0, Math.min(1, posY));
}

// 初始化位置（默认右下角：posX=0, posY=0）
function initFloatBtnPosition() {
    posX = 0.05;
    posY = 0.05;
    updateFloatBtnPosition();
}

// 拖拽事件
floatBtn.addEventListener('mousedown', (e) => {
    isDragging = true;
    hasDragged = false;
    startX = e.clientX;
    startY = e.clientY;
    offsetX = e.clientX - floatBtn.getBoundingClientRect().left;
    offsetY = e.clientY - floatBtn.getBoundingClientRect().top;
    floatBtn.style.cursor = 'grabbing';
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.sqrt(dx*dx + dy*dy) > 5) hasDragged = true;

    // 计算新位置（像素）
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const btnW = floatBtn.offsetWidth || 50;
    const btnH = floatBtn.offsetHeight || 50;
    x = Math.max(0, Math.min(vw - btnW, x));
    y = Math.max(0, Math.min(vh - btnH, y));
    floatBtn.style.left = x + 'px';
    floatBtn.style.top = y + 'px';
    floatBtn.style.right = 'auto';
    floatBtn.style.bottom = 'auto';

    // 更新相对位置百分比（用于窗口resize时恢复）
    posX = (vw - btnW - x) / (vw - btnW);
    posY = (vh - btnH - y) / (vh - btnH);
    posX = Math.max(0, Math.min(1, posX));
    posY = Math.max(0, Math.min(1, posY));
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        floatBtn.style.cursor = 'move';
    }
});

// ====== 核心：窗口变化时重新定位 ======
window.addEventListener('resize', () => {
    updateFloatBtnPosition();
});

// ====== 页面滚动时也保持位置（可选） ======
window.addEventListener('scroll', () => {
    // 不处理，因为 position:fixed 已经相对于视口
}, { passive: true });

    // ========== 9. 面板控制 ==========
    floatBtn.addEventListener('click', (e) => { e.stopPropagation(); if (hasDragged) { hasDragged = false; return; } panel.style.display = 'block'; });
    $('panel-close-btn').addEventListener('click', () => panel.style.display = 'none');
    panel.addEventListener('click', (e) => { if (e.target === panel) panel.style.display = 'none'; });

    // ========== 10. 重置 ==========
    $('reset-btn').addEventListener('click', function() {
        const d = { width: 80, padding: 80, textColor: '#252525', bgColor: '#f2f2f2', marginColor: '#e0e0e0' };
        applyConfig(d);
        ['my-reader-width-style', 'my-reader-padding-style'].forEach(id => {
            const s = document.getElementById(id); if (s) s.remove();
        });
        document.querySelectorAll('.muye-reader .muye-reader-inner, .muye-reader-nav, .muye-reader-box-header, .muye-reader-content').forEach(el => {
            el.style.width = ''; el.style.maxWidth = ''; el.style.paddingLeft = ''; el.style.paddingRight = '';
        });
        saveConfig();
    });

   // ========== 11. 初始化 & 翻页监听 ==========
function init() {
    // 初始化悬浮窗位置（右下角）
    initFloatBtnPosition();

    const c = loadConfig();
    if (c) {
        applyConfig(c);
    } else {
        applyConfig(DEFAULTS);
    }
}
if (document.readyState === 'complete') init(); else window.addEventListener('load', init);

    console.log('✅ 番茄小说阅读增强已加载！');
})();