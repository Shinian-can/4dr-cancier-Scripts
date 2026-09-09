// ==UserScript==
// @name         番茄小说阅读增强
// @namespace    https://github.com/Shinian-can/4dr-cancier-Scripts
// @version      1.0.4
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
    document.body.appendChild(floatBtn);

    // ========== 2. 创建主面板 ==========
    const panel = document.createElement('div');
    panel.id = 'my-panel';
    panel.innerHTML = `
        <style id="my-script-styles">
            /* ===== 悬浮窗按钮 ===== */
            #my-float-btn {
                position: fixed;
                bottom: 100px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: #f38faf;
                color: #cf537b;
                font-size: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: move;
                z-index: 999999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                user-select: none;
                transition: transform 0.2s;
            }
            #my-float-btn:hover {
                transform: scale(1.05);
            }

            /* ===== 主面板 ===== */
            #my-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 400px;
                max-width: 90%;
                background: white;
                z-index: 1000000;
                display: none;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                color: #333;
                max-height: 80vh;
                overflow: hidden;
            }

            /* ===== 面板标题栏 ===== */
            #my-panel .panel-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: white;
                flex-shrink: 0;
            }
            #my-panel .panel-header h3 {
                margin: 0;
                font-size: 18px;
            }
            #my-panel .panel-close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
                padding: 0 8px;
                transition: color 0.2s;
            }
            #my-panel .panel-close-btn:hover {
                color: #333;
            }

            /* ===== 面板内容区（滚动） ===== */
            #my-panel .panel-content {
                padding: 20px;
                max-height: 70vh;
                overflow-y: auto;
            }

            /* ===== 滚动条美化 ===== */
            #my-panel .panel-content::-webkit-scrollbar {
                width: 4px;
                background: transparent;
            }
            #my-panel .panel-content::-webkit-scrollbar-track {
                background: #f5f5f5;
            }
            #my-panel .panel-content::-webkit-scrollbar-thumb {
                background: #f38faf;
                transition: background 0.3s;
            }
            #my-panel .panel-content::-webkit-scrollbar-thumb:hover {
                background: #f7a5bc;
            }
            #my-panel .panel-content::-webkit-scrollbar-corner {
                background: transparent;
            }
            #my-panel .panel-content {
                scrollbar-width: thin;
                scrollbar-color: #f38faf #f5f5f5;
            }

            /* ===== 设置卡片 ===== */
            #my-panel .setting-card {
                margin: 16px 0;
                padding: 12px;
                background: #f5f5f5ec;
            }
            #my-panel .setting-card .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            #my-panel .setting-card .card-header label {
                font-weight: 500;
                cursor: pointer;
            }
            #my-panel .setting-card .value-badge {
                background: #f38faf;
                color: white;
                padding: 2px 12px;
                font-size: 14px;
                font-weight: bold;
                width: 65px;
                text-align: center;
                margin-left: auto;
            }
            #my-panel .setting-card .range-labels {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: #999;
                margin-top: 4px;
            }

            /* ===== 滑块统一样式 ===== */
            #my-panel input[type="range"] {
                width: 100%;
                height: 6px;
                -webkit-appearance: none;
                appearance: none;
                background: #f38faf;
                outline: none;
                cursor: pointer;
            }
            #my-panel input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                background: #f38faf;
                border-radius: 50%;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }
            #my-panel input[type="range"]::-webkit-slider-thumb:hover {
                background: #f7a5bc;
            }
            #my-panel input[type="range"]::-moz-range-thumb {
                width: 16px;
                height: 16px;
                background: #f38faf;
                border-radius: 50%;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }

            /* ===== 颜色选择器 ===== */
            #my-panel .color-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            #my-panel .color-row:first-of-type {
                padding-top: 10px;
            }
            #my-panel .color-row label {
                cursor: pointer;
                font-size: 14px;
            }
            #my-panel .color-row .color-picker-wrapper {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            #my-panel .color-row input[type="color"] {
                width: 36px;
                height: 36px;
                border: 2px solid #ddd;
                cursor: pointer;
                background: white;
                padding: 2px;
            }
            #my-panel .color-row .color-hex {
                font-size: 12px;
                color: #999;
                min-width: 50px;
            }

            /* ===== 开关样式 ===== */
            #my-panel .toggle-switch {
                width: 44px;
                height: 24px;
                background: #ccc;
                cursor: pointer;
                position: relative;
                transition: background 0.3s;
                flex-shrink: 0;
            }
            #my-panel .toggle-switch .toggle-dot {
                width: 18px;
                height: 18px;
                background: white;
                position: absolute;
                top: 3px;
                left: 3px;
                transition: transform 0.3s;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            #my-panel .toggle-switch.active {
                background: #f38faf;
            }
            #my-panel .toggle-switch.active .toggle-dot {
                transform: translateX(20px);
            }

            /* ===== 占位区域 ===== */
            #my-panel .placeholder {
                margin: 16px 0;
                padding: 12px;
                background: #f9f9f9;
                border: 1px dashed #ddd;
                text-align: center;
                color: #999;
            }

            /* ===== 重置按钮 ===== */
            #my-panel .reset-btn {
                width: 100%;
                padding: 10px;
                background: #ff6b6b;
                color: white;
                border: none;
                font-size: 14px;
                cursor: pointer;
                margin-top: 8px;
                transition: background 0.2s;
            }
            #my-panel .reset-btn:hover {
                background: #e55a5a;
            }

            /* ===== 底部提示 ===== */
            #my-panel .footer-tip {
                font-size: 12px;
                color: #aaa;
                margin-top: 16px;
                text-align: center;
            }

            /* ===== 侧边栏设置卡片 ===== */
            #my-panel .sidebar-toggle-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
            }
            #my-panel .sidebar-toggle-row label {
                font-size: 14px;
                cursor: pointer;
            }
            
        </style>

        <div class="panel-header">
            <h3>阅读增强设置</h3>
            <button class="panel-close-btn" id="panel-close-btn">X</button>
        </div>
        <div class="panel-content">

            <!-- 宽度滑块 -->
            <div class="setting-card">
                <div class="card-header">
                    <label>阅读区域宽度</label>
                    <span class="value-badge" id="width-value">80%</span>
                </div>
                <input type="range" id="width-slider" min="50" max="100" value="80">
                <div class="range-labels"><span>50%</span><span>100%</span></div>
            </div>

            <!-- 边距滑块 -->
            <div class="setting-card">
                <div class="card-header">
                    <label>文字左右边距</label>
                    <span class="value-badge" id="padding-value">80px</span>
                </div>
                <input type="range" id="padding-slider" min="0" max="100" value="80">
                <div class="range-labels"><span>0px</span><span>100px</span></div>
            </div>

            <!-- 字体大小滑块 -->
            <div class="setting-card">
                <div class="card-header">
                    <label>字体大小</label>
                    <span class="value-badge" id="fontsize-value">2.4rem</span>
                </div>
                <input type="range" id="fontsize-slider" min="12" max="36" value="24" step="1">
                <div class="range-labels"><span>1.2rem</span><span>3.6rem</span></div>
            </div>

            <!-- 颜色设置 -->
            <div class="setting-card">
                <div style="font-weight:500; margin-bottom:12px;">颜色设置</div>
                <hr/>
                ${['文字颜色', 'color-text', '#252525', '小说背景', 'color-bg', '#f2f2f2', '外部背景', 'color-margin', '#e0e0e0'].map((_, i, arr) => i % 3 === 0 ? `
                <div class="color-row">
                    <label>${arr[i]}</label>
                    <div class="color-picker-wrapper">
                        <input type="color" id="${arr[i+1]}" value="${arr[i+2]}">
                        <span class="color-hex" id="${arr[i+1]}-value">${arr[i+2]}</span>
                    </div>
                </div>` : '').join('')}
            </div>

            <!-- 侧边栏设置 -->
            <div class="setting-card">
                <div style="font-weight:500; margin-bottom:12px;">侧边栏设置</div>
                <hr style="margin:4px 0 12px 0;"/>

                <!-- 功能二：侧边栏开关 -->
                <div class="sidebar-toggle-row">
                    <label>启用侧边栏</label>
                    <div class="toggle-switch active" id="toolbar-toggle">
                        <div class="toggle-dot" id="toolbar-toggle-dot"></div>
                    </div>
                </div>

                <!-- 功能三：侧边栏透明度 -->
                <div style="margin:12px 0 8px 0;">
                    <div class="card-header">
                        <label style="font-size:14px;">侧边栏透明度</label>
                        <span class="value-badge" id="opacity-value">100%</span>
                    </div>
                    <input type="range" id="opacity-slider" min="10" max="100" value="100">
                    <div class="range-labels"><span>10%</span><span>100%</span></div>
                </div>

                <!-- 功能一：侧边栏X位置 -->
                <div style="margin:12px 0 0 0;">
                    <div class="card-header">
                        <label style="font-size:14px;">侧边栏X位置</label>
                        <span class="value-badge" id="toolbar-x-value">52px</span>
                    </div>
                    <input type="range" id="toolbar-x-slider" min="20" max="100" value="52">
                    <div class="range-labels"><span>20px</span><span>100px</span></div>
                </div>
            </div>

            <!-- 占位 -->
            <div class="placeholder">更多功能开发中...</div>

            <button class="reset-btn" id="reset-btn">重置默认</button>
            <p class="footer-tip">拖动按钮可移动 | 设置自动保存</p>
        </div>
    `;
    document.body.appendChild(panel);

    // ========== 3. 获取 DOM 引用 ==========
    const $ = (id) => document.getElementById(id);
    const slider = $('width-slider');
    const paddingSlider = $('padding-slider');
    const fontsizeSlider = $('fontsize-slider');
    const colorText = $('color-text');
    const colorBg = $('color-bg');
    const colorMargin = $('color-margin');
    const colorTextValue = $('color-text-value');
    const colorBgValue = $('color-bg-value');
    const colorMarginValue = $('color-margin-value');
    const toolbarToggle = $('toolbar-toggle');
    const toolbarToggleDot = $('toolbar-toggle-dot');
    const opacitySlider = $('opacity-slider');
    const toolbarXSlider = $('toolbar-x-slider');

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
        style.textContent = '.muye-reader .muye-reader-inner { width: ' + (p*100) + '% !important; max-width: ' + (p*100) + '% !important; } .muye-reader-nav { max-width: ' + (p*100) + '% !important; }';
        console.log('宽度: ' + val + '%');
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
        style.textContent = '.muye-reader-box-header, .muye-reader-content, .muye-reader-nav { padding-left: ' + px + ' !important; padding-right: ' + px + ' !important; }';
        console.log('边距: ' + val + 'px');
    }

    function setReaderFontSize(val) {
        const rem = (val / 10).toFixed(1);
        document.querySelectorAll('.muye-reader-content-24 p, .muye-reader-content p, .reader-content p').forEach(el => {
            el.style.fontSize = rem + 'rem';
            el.style.lineHeight = (rem * 1.9) + 'rem';
            el.style.textIndent = (rem * 2) + 'rem';
        });
        let style = document.getElementById('my-reader-fontsize-style') || (() => {
            const s = document.createElement('style');
            s.id = 'my-reader-fontsize-style';
            document.head.appendChild(s);
            return s;
        })();
        style.textContent = '.muye-reader-content-24 p, .muye-reader-content p, .reader-content p { font-size: ' + rem + 'rem !important; line-height: ' + (rem * 1.9) + 'rem !important; text-indent: ' + (rem * 2) + 'rem !important; }';
        console.log('字体大小: ' + rem + 'rem (' + val + 'px基准)');
    }

    function applyAllColors(text, bg, margin) {
        const inner = document.querySelector('.muye-reader .muye-reader-inner');
        if (inner) { inner.style.setProperty('--web-text', text); inner.style.color = text; inner.style.setProperty('--web-bg', bg); inner.style.backgroundColor = bg; }
        const reader = document.querySelector('.muye-reader');
        if (reader) { reader.style.setProperty('--web-margin', margin); reader.style.backgroundColor = margin; }
    }

    // ===== 侧边栏核心功能 =====
    let toolbarEnabled = true;

    function setToolbarEnabled(enabled) {
        toolbarEnabled = enabled;
        const toolbar = document.querySelector('.reader-toolbar');
        if (toolbar) {
            if (enabled) {
                toolbar.style.display = '';
                const opacity = parseInt(opacitySlider.value) || 100;
                const x = parseInt(toolbarXSlider.value) || 52;
                applyToolbarOpacity(opacity);
                applyToolbarX(x);
            } else {
                toolbar.style.display = 'none';
            }
        }
        if (enabled) {
            toolbarToggle.classList.add('active');
        } else {
            toolbarToggle.classList.remove('active');
        }
        saveConfig();
    }

    function applyToolbarOpacity(val) {
        const opacity = val / 100;
        const toolbar = document.querySelector('.reader-toolbar');
        if (toolbar) {
            toolbar.style.opacity = opacity;
        }
        let style = document.getElementById('my-toolbar-opacity-style') || (() => {
            const s = document.createElement('style');
            s.id = 'my-toolbar-opacity-style';
            document.head.appendChild(s);
            return s;
        })();
        style.textContent = '.reader-toolbar { opacity: ' + opacity + ' !important; }';
        console.log('侧边栏透明度: ' + val + '%');
    }

    function applyToolbarX(val) {
        const px = val + 'px';
        const toolbar = document.querySelector('.reader-toolbar');
        if (toolbar) {
            toolbar.style.right = px;
        }
        let style = document.getElementById('my-toolbar-x-style') || (() => {
            const s = document.createElement('style');
            s.id = 'my-toolbar-x-style';
            document.head.appendChild(s);
            return s;
        })();
        style.textContent = '.reader-toolbar { right: ' + px + ' !important; }';
        console.log('侧边栏X位置: ' + px);
    }

    // ========== 5. 滑块统一处理 ==========
    const sliderConfigs = [
        { 
            el: slider, 
            display: $('width-value'), 
            set: setReaderWidth, 
            bg: function(v) { return 'linear-gradient(to right, #f38faf 0%, #f38faf ' + ((v-50)/50)*100 + '%, #ddd ' + ((v-50)/50)*100 + '%, #ddd 100%)'; }, 
            unit: '%',
            format: function(v) { return v + '%'; }
        },
        { 
            el: paddingSlider, 
            display: $('padding-value'), 
            set: setReaderPadding, 
            bg: function(v) { return 'linear-gradient(to right, #f38faf 0%, #f38faf ' + (v/100)*100 + '%, #ddd ' + (v/100)*100 + '%, #ddd 100%)'; }, 
            unit: 'px',
            format: function(v) { return v + 'px'; }
        },
        { 
            el: fontsizeSlider, 
            display: $('fontsize-value'), 
            set: setReaderFontSize, 
            bg: function(v) { return 'linear-gradient(to right, #f38faf 0%, #f38faf ' + ((v-12)/24)*100 + '%, #ddd ' + ((v-12)/24)*100 + '%, #ddd 100%)'; },
            unit: 'rem',
            format: function(v) { return (v / 10).toFixed(1) + 'rem'; }
        }
    ];

    sliderConfigs.forEach(function(item) {
        item.el.addEventListener('input', function() {
            const v = parseInt(this.value);
            item.display.textContent = item.format(v);
            this.style.background = item.bg(v);
            item.set(v);
            saveConfig();
        });
    });

    // ========== 6. 颜色统一处理 ==========
    var colorConfigs = [
        { el: colorText, display: colorTextValue, apply: function(v) { var inner = document.querySelector('.muye-reader .muye-reader-inner'); if (inner) { inner.style.setProperty('--web-text', v); inner.style.color = v; } } },
        { el: colorBg, display: colorBgValue, apply: function(v) { var inner = document.querySelector('.muye-reader .muye-reader-inner'); if (inner) { inner.style.setProperty('--web-bg', v); inner.style.backgroundColor = v; } } },
        { el: colorMargin, display: colorMarginValue, apply: function(v) { var reader = document.querySelector('.muye-reader'); if (reader) { reader.style.setProperty('--web-margin', v); reader.style.backgroundColor = v; } } }
    ];

    colorConfigs.forEach(function(item) {
        item.el.addEventListener('input', function() {
            var v = this.value;
            item.display.textContent = v;
            item.apply(v);
            saveConfig();
        });
    });

    // ========== 7. 侧边栏事件绑定 ==========
    toolbarToggle.addEventListener('click', function() {
        setToolbarEnabled(!toolbarEnabled);
    });

    opacitySlider.addEventListener('input', function() {
        var v = parseInt(this.value);
        $('opacity-value').textContent = v + '%';
        var percent = ((v - 10) / 90) * 100;
        this.style.background = 'linear-gradient(to right, #f38faf 0%, #f38faf ' + percent + '%, #ddd ' + percent + '%, #ddd 100%)';
        applyToolbarOpacity(v);
        saveConfig();
    });

    toolbarXSlider.addEventListener('input', function() {
        var v = parseInt(this.value);
        $('toolbar-x-value').textContent = v + 'px';
        var percent = ((v - 20) / 80) * 100;
        this.style.background = 'linear-gradient(to right, #f38faf 0%, #f38faf ' + percent + '%, #ddd ' + percent + '%, #ddd 100%)';
        applyToolbarX(v);
        saveConfig();
    });

    // ========== 8. 配置存储 ==========
    var CONFIG_KEY = 'fanqienovel_config';
    var DEFAULTS = {
        width: 80,
        padding: 80,
        fontSize: 24,
        textColor: '#252525',
        bgColor: '#f2f2f2',
        marginColor: '#e0e0e0',
        toolbarEnabled: true,
        toolbarOpacity: 100,
        toolbarX: 52
    };

    function saveConfig() {
        var config = { 
            width: parseInt(slider.value) || 80, 
            padding: parseInt(paddingSlider.value) || 80,
            fontSize: parseInt(fontsizeSlider.value) || 24,
            textColor: colorText.value, 
            bgColor: colorBg.value, 
            marginColor: colorMargin.value,
            toolbarEnabled: toolbarEnabled,
            toolbarOpacity: parseInt(opacitySlider.value) || 100,
            toolbarX: parseInt(toolbarXSlider.value) || 52
        };
        try { localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); } catch(e) {}
    }

    function loadConfig() {
        try { var s = localStorage.getItem(CONFIG_KEY); if (s) return JSON.parse(s); } catch(e) {}
        return null;
    }

    function applyConfig(c) {
        if (!c) return;
        // 宽度
        slider.value = c.width; 
        $('width-value').textContent = c.width + '%'; 
        slider.style.background = 'linear-gradient(to right, #f38faf 0%, #f38faf ' + ((c.width-50)/50)*100 + '%, #ddd ' + ((c.width-50)/50)*100 + '%, #ddd 100%)'; 
        setReaderWidth(c.width);
        // 边距
        paddingSlider.value = c.padding; 
        $('padding-value').textContent = c.padding + 'px'; 
        paddingSlider.style.background = 'linear-gradient(to right, #f38faf 0%, #f38faf ' + (c.padding/100)*100 + '%, #ddd ' + (c.padding/100)*100 + '%, #ddd 100%)'; 
        setReaderPadding(c.padding);
        // 字体大小
        var fontSize = c.fontSize || 24;
        fontsizeSlider.value = fontSize;
        $('fontsize-value').textContent = (fontSize / 10).toFixed(1) + 'rem';
        fontsizeSlider.style.background = 'linear-gradient(to right, #f38faf 0%, #f38faf ' + ((fontSize-12)/24)*100 + '%, #ddd ' + ((fontSize-12)/24)*100 + '%, #ddd 100%)';
        setReaderFontSize(fontSize);
        // 颜色
        colorText.value = c.textColor; colorTextValue.textContent = c.textColor;
        colorBg.value = c.bgColor; colorBgValue.textContent = c.bgColor;
        colorMargin.value = c.marginColor; colorMarginValue.textContent = c.marginColor;
        applyAllColors(c.textColor, c.bgColor, c.marginColor);

        // 侧边栏设置
        var enabled = c.toolbarEnabled !== undefined ? c.toolbarEnabled : true;
        var opacity = c.toolbarOpacity || 100;
        var x = c.toolbarX || 52;
        
        toolbarEnabled = enabled;
        if (enabled) {
            toolbarToggle.classList.add('active');
        } else {
            toolbarToggle.classList.remove('active');
        }
        setToolbarEnabled(enabled);
        
        opacitySlider.value = opacity;
        $('opacity-value').textContent = opacity + '%';
        var opacityPercent = ((opacity - 10) / 90) * 100;
        opacitySlider.style.background = 'linear-gradient(to right, #f38faf 0%, #f38faf ' + opacityPercent + '%, #ddd ' + opacityPercent + '%, #ddd 100%)';
        applyToolbarOpacity(opacity);
        
        toolbarXSlider.value = x;
        $('toolbar-x-value').textContent = x + 'px';
        var xPercent = ((x - 20) / 80) * 100;
        toolbarXSlider.style.background = 'linear-gradient(to right, #f38faf 0%, #f38faf ' + xPercent + '%, #ddd ' + xPercent + '%, #ddd 100%)';
        applyToolbarX(x);
    }

    // ========== 9. 拖拽逻辑 ==========
    var isDragging = false, offsetX, offsetY, startX, startY, hasDragged = false;
    var posX = 0, posY = 0;

    function updateFloatBtnPosition() {
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var btnW = floatBtn.offsetWidth || 50;
        var btnH = floatBtn.offsetHeight || 50;
        var left = vw - btnW - posX * (vw - btnW);
        var top = vh - btnH - posY * (vh - btnH);
        floatBtn.style.left = Math.max(0, Math.min(vw - btnW, left)) + 'px';
        floatBtn.style.top = Math.max(0, Math.min(vh - btnH, top)) + 'px';
        floatBtn.style.right = 'auto';
        floatBtn.style.bottom = 'auto';
    }

    function initFloatBtnPosition() {
        posX = 0.05;
        posY = 0.05;
        updateFloatBtnPosition();
    }

    floatBtn.addEventListener('mousedown', function(e) {
        isDragging = true;
        hasDragged = false;
        startX = e.clientX;
        startY = e.clientY;
        offsetX = e.clientX - floatBtn.getBoundingClientRect().left;
        offsetY = e.clientY - floatBtn.getBoundingClientRect().top;
        floatBtn.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        if (Math.sqrt(dx*dx + dy*dy) > 5) hasDragged = true;
        var x = e.clientX - offsetX;
        var y = e.clientY - offsetY;
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var btnW = floatBtn.offsetWidth || 50;
        var btnH = floatBtn.offsetHeight || 50;
        x = Math.max(0, Math.min(vw - btnW, x));
        y = Math.max(0, Math.min(vh - btnH, y));
        floatBtn.style.left = x + 'px';
        floatBtn.style.top = y + 'px';
        floatBtn.style.right = 'auto';
        floatBtn.style.bottom = 'auto';
        posX = (vw - btnW - x) / (vw - btnW);
        posY = (vh - btnH - y) / (vh - btnH);
        posX = Math.max(0, Math.min(1, posX));
        posY = Math.max(0, Math.min(1, posY));
    });

    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            floatBtn.style.cursor = 'move';
        }
    });

    window.addEventListener('resize', updateFloatBtnPosition);

    // ========== 10. 面板控制 ==========
    floatBtn.addEventListener('click', function(e) { e.stopPropagation(); if (hasDragged) { hasDragged = false; return; } panel.style.display = 'block'; });
    $('panel-close-btn').addEventListener('click', function() { panel.style.display = 'none'; });
    panel.addEventListener('click', function(e) { if (e.target === panel) panel.style.display = 'none'; });

    // ========== 11. 重置 ==========
    $('reset-btn').addEventListener('click', function() {
        var d = { 
            width: 80, 
            padding: 80, 
            fontSize: 24, 
            textColor: '#252525', 
            bgColor: '#f2f2f2', 
            marginColor: '#e0e0e0',
            toolbarEnabled: true,
            toolbarOpacity: 100,
            toolbarX: 52
        };
        applyConfig(d);
        ['my-reader-width-style', 'my-reader-padding-style', 'my-reader-fontsize-style', 
         'my-toolbar-opacity-style', 'my-toolbar-x-style'].forEach(function(id) {
            var s = document.getElementById(id); if (s) s.remove();
        });
        document.querySelectorAll('.muye-reader .muye-reader-inner, .muye-reader-nav, .muye-reader-box-header, .muye-reader-content, .muye-reader-content-24 p, .muye-reader-content p, .reader-content p').forEach(function(el) {
            el.style.width = ''; el.style.maxWidth = ''; el.style.paddingLeft = ''; el.style.paddingRight = '';
            el.style.fontSize = ''; el.style.lineHeight = ''; el.style.textIndent = '';
        });
        saveConfig();
    });

    // ========== 12. 初始化 ==========
    function init() {
        initFloatBtnPosition();
        var c = loadConfig();
        if (c) {
            applyConfig(c);
        } else {
            applyConfig(DEFAULTS);
        }
    }
    if (document.readyState === 'complete') init(); else window.addEventListener('load', init);

    console.log('========番茄小说阅读增强已加载========');
})();
