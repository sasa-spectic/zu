import { connect } from 'cloudflare:sockets';

// ==========================================
// 1. DEFAULT SETTINGS & CONSTANTS
// ==========================================
const DEFAULT_SETTINGS = {
    name: "teriak panel",
    clean_ip: "",
    port: "443",
    uuid: "", 
    path: "/nab",
    proxy_ip: "proxyip.cmliussss.net",
    frag_length: "20-30",
    frag_interval: "1-2"
};

// Advanced Connection Management Constants
const UPSTREAM_BUNDLE_TARGET_BYTES = 16 * 1024;
const UPSTREAM_QUEUE_MAX_BYTES = 16 * 1024 * 1024;
const UPSTREAM_QUEUE_MAX_ITEMS = 4096;
const DOWNSTREAM_GRAIN_BYTES = 32 * 1024;
const DOWNSTREAM_GRAIN_TAIL_THRESHOLD = 512;
const DOWNSTREAM_GRAIN_SILENT_MS = 1;
const TCP_CONCURRENCY = 2;
const PRELOAD_RACE_DIAL = true;
const DOH_RESOLVER = "https://cloudflare-dns.com/dns-query";

// ==========================================
// 2. HTML DASHBOARD (CYBERPUNK UI)
// ==========================================
const getHtmlPage = () => `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تریاک پنل | Teriak Panel</title>
    <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.0.0/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />
<script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
                <style>
        :root {
            --bg-color: #050508;
            --panel-bg: #0c0c14;
            --primary: #00f3ff;
            --secondary: #ff007b;
            --text: #f1f5f9;
            --text-muted: #94a3b8;
            --border: rgba(255, 255, 255, 0.06);
        }
        * { box-sizing: border-box; }
                *, body, input, select, button, option, pre, span, div, h1, h2, label, textarea {
            font-family: 'Vazirmatn', sans-serif !important;
        }
        body {
            background-color: var(--bg-color);
            color: var(--text);
            margin: 0; padding: 20px;
            display: flex; justify-content: center; align-items: center;
            min-height: 100vh;
            background-image: 
                radial-gradient(circle at 50% 0%, rgba(120, 0, 255, 0.08) 0%, transparent 60%);
            position: relative;
            overflow-x: hidden;
        }
        .rgb-glow {
            display: none;
        }
        body::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background-image: linear-gradient(rgba(255, 255, 255, 0.003) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255, 255, 255, 0.003) 1px, transparent 1px);
            background-size: 24px 24px;
            pointer-events: none;
            z-index: 0;
        }
        .container {
            background: var(--panel-bg);
            border: 1px solid rgba(0, 243, 255, 0.15);
            box-shadow: 
                0 20px 50px rgba(0, 0, 0, 0.6),
                inset 0 1px 0 rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            width: 100%; max-width: 650px;
            padding: 40px;
            position: relative; 
            z-index: 1;
            overflow: hidden;
        }
        .container::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, transparent, var(--primary), var(--secondary), transparent);
        }
        .header-area {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            padding-bottom: 20px;
        }
        .sys-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.75rem;
            color: var(--primary);
            background: rgba(0, 243, 255, 0.08);
            padding: 4px 12px;
            border-radius: 20px;
            border: 1px solid rgba(0, 243, 255, 0.15);
            font-family: monospace;
            margin-bottom: 12px;
        }
        .sys-badge .dot {
            width: 6px; height: 6px;
            background: var(--primary);
            border-radius: 50%;
            box-shadow: 0 0 8px var(--primary);
            animation: pulse 1.8s infinite;
        }
        @keyframes pulse {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
        }
        h1 {
            font-size: 1.85rem;
            font-weight: 900;
            margin: 0;
            background: linear-gradient(135deg, #ffffff 40%, var(--primary) 75%, var(--secondary) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: var(--text-muted); font-size: 0.85em; font-weight: 600; letter-spacing: 0.5px; }
                input, select, textarea {
            width: 100%; padding: 12px 16px;
            background: #07070c;
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #fff;
            border-radius: 8px; outline: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 0.95em;
            resize: vertical;
        }
        select option {
            background-color: #07070c !important;
            color: #ffffff !important;
        }
        input:focus, select:focus {
            border-color: var(--primary);
            background: rgba(0, 243, 255, 0.01);
            box-shadow: 0 0 0 3px rgba(0, 243, 255, 0.12);
        }
        .row { display: flex; gap: 15px; }
        .row .form-group { flex: 1; }
        button {
            font-family: 'Vazirmatn', sans-serif !important;
            width: 100%; padding: 14px; margin-top: 10px;
            border: none; border-radius: 8px; cursor: pointer;
            font-weight: 800; font-size: 0.95em;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-submit {
            background: linear-gradient(135deg, var(--primary) 0%, #00bfff 100%);
            color: #020205;
            box-shadow: 0 4px 20px rgba(0, 243, 255, 0.2);
        }
        .btn-submit:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 25px rgba(0, 243, 255, 0.35);
        }
        .btn-submit:active { transform: translateY(1px); }
        .btn-reset {
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--text-muted);
        }
        .btn-reset:hover {
            border-color: var(--secondary);
            background: rgba(255, 0, 123, 0.04);
            color: var(--secondary);
            box-shadow: 0 4px 15px rgba(255, 0, 123, 0.12);
            transform: translateY(-1px);
        }
        
        .output-box {
            margin-top: 30px; padding: 20px;
            background: #050509;
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            position: relative;
        }
        .output-header {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 12px; padding-bottom: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .output-header span {
            color: var(--primary);
            font-size: 0.85em; font-weight: bold;
            letter-spacing: 0.5px;
            display: flex; align-items: center; gap: 6px;
        }
        .output-header span::before {
            content: '';
            width: 5px; height: 5px;
            background: var(--primary);
            border-radius: 50%;
        }
        pre {
            color: #10b981;
            margin: 0; white-space: pre-wrap; word-break: break-all;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.85em; direction: ltr; text-align: left;
            max-height: 250px; overflow-y: auto;
            background: rgba(0, 0, 0, 0.35);
            padding: 15px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.03);
        }
        .btn-copy {
            width: auto; padding: 6px 14px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: var(--text);
            font-size: 0.75em; margin: 0; border-radius: 6px;
        }
        .btn-copy:hover {
            background: var(--secondary);
            border-color: var(--secondary);
            color: #fff;
            box-shadow: 0 4px 12px rgba(255, 0, 123, 0.35);
        }
        
        .footer {
            text-align: center; margin-top: 30px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 20px;
            display: flex; justify-content: center; gap: 15px;
        }
        .footer a {
            color: var(--text-muted);
            display: flex; align-items: center; justify-content: center;
            transition: all 0.3s;
            width: 40px; height: 40px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .footer a:hover {
            color: var(--primary);
            border-color: var(--primary);
            background: rgba(0, 243, 255, 0.05);
            box-shadow: 0 0 15px rgba(0, 243, 255, 0.15);
            transform: translateY(-2px);
        }
        .footer svg { width: 18px; height: 18px; fill: currentColor; }
        
                .blur-bg {
            opacity: 0.15;
            pointer-events: none;
            user-select: none;
            transition: opacity 0.3s ease;
        }
        body.no-scroll {
            overflow: hidden;
        }
        .modal-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(3, 3, 5, 0.95);
            display: flex; justify-content: center; align-items: center;
            z-index: 10000;
        }
        .modal-box {
            background: #0c0c14;
            border: 1px solid rgba(0, 243, 255, 0.25);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
            padding: 40px;
            border-radius: 16px;
            width: 90%; max-width: 420px;
            text-align: center;
        }

        /* RESPONSIVE MEDIA QUERIES FOR MOBILE */
        @media (max-width: 640px) {
            body {
                padding: 10px;
            }
            .container {
                padding: 20px 15px;
                border-radius: 12px;
            }
            .row {
                flex-direction: column;
                gap: 0;
            }
            .row .form-group {
                margin-bottom: 20px;
            }
            .row .form-group:last-child {
                margin-bottom: 0;
            }
            .modal-box {
                padding: 25px 15px;
                width: 95%;
            }
            h1 {
                font-size: 1.5rem;
            }
            .output-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
                padding-bottom: 12px;
            }
            .output-header div {
                width: 100%;
                justify-content: flex-start;
                gap: 6px;
            }
            .btn-copy {
                flex: 1;
                text-align: center;
                padding: 8px 10px;
                font-size: 0.8em;
            }
            .row[style*="border"] {
                flex-direction: column !important;
                gap: 15px !important;
                padding: 15px 10px !important;
            }
        }
    </style>
</head>
<body>
    <div class="rgb-glow"></div>
    <div class="container">
        <div class="header-area">
            <div class="sys-badge">
                <span class="dot"></span>
                <span>STATUS: OPERATIONAL</span>
            </div>
            <h1>تریاک پنل <span style="font-size: 0.75em; color: var(--secondary); font-weight: bold; margin-right: 8px;"> 0.6</span></h1>
        </div>
        <form id="settingsForm">
            <div class="form-group">
                <label>نام پنل / کانفیگ</label>
                <input type="text" id="name" required>
            </div>
                        <div class="form-group">
                <label>آی‌پی‌های تمیز (هر خط یک آی‌پی)</label>
                <textarea id="clean_ip" dir="ltr" rows="3" placeholder="104.17.121.0&#10;104.17.122.0" required></textarea>
            </div>
            <div class="row">
                <div class="form-group">
                    <label>پورت کلودفلر</label>
                    <select id="port" dir="ltr">
                        <option value="443">443</option>
                        <option value="8443">8443</option>
                        <option value="2053">2053</option>
                        <option value="2083">2083</option>
                        <option value="2087">2087</option>
                        <option value="2096">2096</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>مسیر (Path)</label>
                    <input type="text" id="path" dir="ltr" required>
                </div>
            </div>
            <div class="form-group">
                <label>UUID</label>
                <input type="text" id="uuid" dir="ltr" required>
            </div>
            <div class="form-group">
                <label>پروکسی آی‌پی (Proxy IP)</label>
                <input type="text" id="proxy_ip" dir="ltr" required>
            </div>
                        <div class="row" style="border: 1px solid rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin-bottom: 20px; background: rgba(0,0,0,0.25);">
                <div class="form-group" style="margin: 0;">
                    <label>Fragment Length</label>
                    <input type="text" id="frag_length" dir="ltr" placeholder="10-20" required>
                </div>
                <div class="form-group" style="margin: 0;">
                    <label>Fragment Interval</label>
                    <input type="text" id="frag_interval" dir="ltr" placeholder="1-2" required>
                </div>
            </div>

            <button type="submit" class="btn-submit">💾 ثبت و تولید کانفیگ</button>
            <button type="button" class="btn-reset" onclick="resetDefaults()">🔄 بازگشت به پیش‌فرض</button>
        </form>

                <div class="output-box" id="outputBox" style="display: none;">
            <div class="output-header">
                <span>لینک VLESS عادی:</span>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-copy" onclick="copyText('vlessOutput')">کپی لینک</button>
                    <button type="button" class="btn-copy" style="background: rgba(0, 243, 255, 0.1); border-color: rgba(0, 243, 255, 0.3);" onclick="showQr('vlessOutput')">📱 کد QR</button>
                </div>
            </div>
            <pre id="vlessOutput" style="margin-bottom: 20px; color: #fff;"></pre>

                                                <div class="output-header">
                <span>کانفیگ کامل (JSON + Fragment):</span>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-copy" onclick="copyText('jsonOutput')">کپی JSON</button>
                </div>
            </div>
            <pre id="jsonOutput" style="margin-bottom: 20px;"></pre>

                        <div class="output-header">
                <span>لینک ساب عادی (Base64):</span>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-copy" onclick="copyText('subOutput')">کپی لینک ساب</button>
                    <button type="button" class="btn-copy" style="background: rgba(0, 243, 255, 0.1); border-color: rgba(0, 243, 255, 0.3);" onclick="showQr('subOutput')">📱 کد QR</button>
                </div>
            </div>
            <pre id="subOutput" style="margin-bottom: 20px; color: #fff;"></pre>

            
        </div>

        <div class="footer">
            <a href="https://t.me/teriakvpn" target="_blank" title="کانال تلگرام">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.96 1.25-5.54 3.67-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.29-.48.79-.74 3.08-1.34 5.14-2.23 6.17-2.67 2.93-1.24 3.54-1.45 3.94-1.46.09 0 .28.02.39.11.09.08.13.19.14.3z"/></svg>
            </a>
            <a href="https://github.com/AG-Morgan/Teriak-Panel" target="_blank" title="گیت‌هاب">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
            </a>
                </div>
    </div>

        <div id="authModal" class="modal-overlay" style="display: none;">
        <div class="modal-box">
            <h2 id="modalTitle" style="color: var(--primary); margin-top: 0;">تعیین رمز عبور</h2>
            <p id="modalDesc" style="color: var(--text); font-size: 0.9em; margin-bottom: 20px;">برای اولین ورود، لطفا رمز عبور پنل خود را تعیین کنید.</p>
            <div class="form-group" id="pwdGroup">
                <label>رمز عبور</label>
                <input type="password" id="panelPwd" dir="ltr" required>
            </div>
            <div class="form-group" id="pwdConfirmGroup">
                <label>تکرار رمز عبور</label>
                <input type="password" id="panelPwdConfirm" dir="ltr" required>
            </div>
            <button id="btnAuthSubmit" class="btn-submit">ثبت رمز عبور</button>
        </div>
    </div>

        <div id="qrModal" class="modal-overlay" style="display: none;">
        <div class="modal-box" style="max-width: 480px; width: 95%;">
            <h2 style="color: var(--primary); margin-top: 0; font-size: 1.25rem;">اسکن کد QR</h2>
            <div style="background: white; padding: 15px; border-radius: 12px; display: inline-block; margin-bottom: 20px; box-shadow: 0 0 20px rgba(0,243,255,0.25); width: 100%; max-width: 400px; box-sizing: border-box;">
                <img id="qrImage" src="" alt="QR Code" style="display: block; width: 100%; height: auto; aspect-ratio: 1/1;">
            </div>
            <button type="button" onclick="closeQrModal()" class="btn-reset" style="width: 100%; margin-top: 0;">🔙 بازگشت</button>
        </div>
    </div>

    <script>
        const host = window.location.hostname;
        
                async function loadSettings() {
            const pwd = sessionStorage.getItem('panel_password') || '';
            try {
                const res = await fetch('/panel/api', {
                    headers: { 'X-Panel-Password': pwd }
                });
                if (res.status === 401) {
                    showLoginModal();
                    return;
                }
                const data = await res.json();
                document.getElementById('name').value = data.name;
                document.getElementById('clean_ip').value = data.clean_ip;
                document.getElementById('port').value = data.port;
                document.getElementById('uuid').value = data.uuid || crypto.randomUUID();
                document.getElementById('path').value = data.path;
                document.getElementById('proxy_ip').value = data.proxy_ip;
                document.getElementById('frag_length').value = data.frag_length;
                document.getElementById('frag_interval').value = data.frag_interval;
                generateOutput(data);
            } catch (e) {
                alert('خطا در بارگزاری تنظیمات');
            }
        }

                async function resetDefaults() {
            if(confirm('آیا از بازگشت به تنظیمات کارخانه مطمئن هستید؟')) {
                document.getElementById('name').value = 'teriak panel';
                document.getElementById('clean_ip').value = window.location.hostname;
                document.getElementById('port').value = '443';
                document.getElementById('uuid').value = crypto.randomUUID();
                document.getElementById('path').value = '/nab';
                document.getElementById('proxy_ip').value = 'proxyip.cmliussss.net';
                document.getElementById('frag_length').value = '20-30';
                document.getElementById('frag_interval').value = '1-2';
            }
        }

                function showSetupModal() {
            document.querySelector('.container').classList.add('blur-bg');
            document.getElementById('authModal').style.display = 'flex';
            document.body.classList.add('no-scroll');
            document.getElementById('modalTitle').textContent = 'تعیین رمز عبور';
            document.getElementById('modalDesc').textContent = 'برای اولین ورود، لطفا رمز عبور پنل خود را تعیین کنید.';
            document.getElementById('pwdConfirmGroup').style.display = 'block';
            document.getElementById('btnAuthSubmit').textContent = 'ثبت رمز عبور';
            
            document.getElementById('btnAuthSubmit').onclick = async () => {
                const pwd = document.getElementById('panelPwd').value;
                const pwdConf = document.getElementById('panelPwdConfirm').value;
                if (!pwd) { alert('لطفا رمز عبور را وارد کنید'); return; }
                if (pwd !== pwdConf) { alert('رمز عبور و تکرار آن یکسان نیستند'); return; }
                if (pwd.length < 4) { alert('رمز عبور باید حداقل ۴ کاراکتر باشد'); return; }
                
                const res = await fetch('/panel/set-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: pwd })
                });
                if (res.ok) {
                    sessionStorage.setItem('panel_password', pwd);
                    document.querySelector('.container').classList.remove('blur-bg');
                    document.getElementById('authModal').style.display = 'none';
                    document.body.classList.remove('no-scroll');
                    loadSettings();
                } else {
                    alert('خطا در ثبت رمز عبور');
                }
            };
        }

        function showLoginModal() {
            document.querySelector('.container').classList.add('blur-bg');
            document.getElementById('authModal').style.display = 'flex';
            document.body.classList.add('no-scroll');
            document.getElementById('modalTitle').textContent = 'ورود به پنل مدیریت';
            document.getElementById('modalDesc').textContent = 'لطفا رمز عبور خود را وارد کنید.';
            document.getElementById('pwdConfirmGroup').style.display = 'none';
            document.getElementById('btnAuthSubmit').textContent = 'ورود';
            
            document.getElementById('btnAuthSubmit').onclick = async () => {
                const pwd = document.getElementById('panelPwd').value;
                if (!pwd) { alert('لطفا رمز عبور را وارد کنید'); return; }
                
                const res = await fetch('/panel/api', {
                    headers: { 'X-Panel-Password': pwd }
                });
                
                if (res.status === 200) {
                    sessionStorage.setItem('panel_password', pwd);
                    document.querySelector('.container').classList.remove('blur-bg');
                    document.getElementById('authModal').style.display = 'none';
                    document.body.classList.remove('no-scroll');
                    const data = await res.json();
                    document.getElementById('name').value = data.name;
                    document.getElementById('clean_ip').value = data.clean_ip;
                    document.getElementById('port').value = data.port;
                    document.getElementById('uuid').value = data.uuid || crypto.randomUUID();
                    document.getElementById('path').value = data.path;
                    document.getElementById('proxy_ip').value = data.proxy_ip;
                    document.getElementById('frag_length').value = data.frag_length;
                    document.getElementById('frag_interval').value = data.frag_interval;
                    generateOutput(data);
                } else {
                    alert('رمز عبور نادرست است!');
                }
            };
        }

        async function checkAuth() {
            const savedPwd = sessionStorage.getItem('panel_password');
            if (savedPwd) {
                loadSettings();
            } else {
                // نمایش آنی و فاقد تأخیر فرم ورود (با فرض این که قبلاً رمز تعیین شده)
                showLoginModal();
                
                // بررسی وضعیت تنظیم رمز عبور در پس‌زمینه بدون بلاک کردن رابط کاربری
                try {
                    const statusRes = await fetch('/panel/status');
                    const statusData = await statusRes.json();
                    if (!statusData.hasPassword) {
                        // اگر رمزی ثبت نشده بود، فرم را به حالت تعیین رمز تغییر جهت می‌دهد
                        showSetupModal();
                    }
                } catch (e) {
                    console.warn('عدم امکان بررسی وضعیت رمز در پس زمینه', e);
                }
            }
        }

        document.getElementById('settingsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('name').value,
                clean_ip: document.getElementById('clean_ip').value,
                port: document.getElementById('port').value,
                uuid: document.getElementById('uuid').value,
                path: document.getElementById('path').value,
                proxy_ip: document.getElementById('proxy_ip').value,
                frag_length: document.getElementById('frag_length').value,
                frag_interval: document.getElementById('frag_interval').value
            };

            const pwd = sessionStorage.getItem('panel_password') || '';
            const res = await fetch('/panel/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Panel-Password': pwd
                },
                body: JSON.stringify(data)
            });
            
            if (res.status === 401) {
                alert('عدم دسترسی! لطفا مجددا وارد شوید.');
                showLoginModal();
                return;
            }
            
            generateOutput(data);
            alert('✅ تنظیمات در سرور کلودفلر ذخیره شد.');
        });

                function generateOutput(data) {
            if(!data.uuid) return;
                        const outputBox = document.getElementById('outputBox');
            
            const ips = data.clean_ip.split('\\n').map(ip => ip.trim()).filter(ip => ip);
            const primaryIP = ips[0] || window.location.hostname;
            data.clean_ip = primaryIP;
            
            // 1. تولید لینک Vless
            const vlessLink = \`vless://\${data.uuid}@\${data.clean_ip}:\${data.port}?path=\${encodeURIComponent(data.path)}&security=tls&encryption=none&insecure=0&host=\${host}&fp=chrome&type=ws&allowInsecure=0&sni=\${host}#\${data.name}\`;
                        document.getElementById('vlessOutput').textContent = vlessLink;

                                    const subLink = \`\${window.location.protocol}//\${host}/sub/\${data.uuid}\`;
            document.getElementById('subOutput').textContent = subLink;

            // 2. تولید فرمت جدید و دقیق JSON بر اساس تمپلیت دریافتی
            const jsonConfig = {
                "remarks": data.name,
                "version": {
                    "min": "25.10.15"
                },
                "log": {
                    "loglevel": "none"
                },
                "dns": {
                    "servers": [
                        {
                            "address": "https://8.8.8.8/dns-query",
                            "tag": "remote-dns"
                        },
                        {
                            "address": "8.8.8.8",
                            "domains": [
                                "full:" + host
                            ],
                            "skipFallback": true
                        }
                    ],
                    "queryStrategy": "UseIP",
                    "tag": "dns"
                },
                "inbounds": [
                    {
                        "listen": "127.0.0.1",
                        "port": 10808,
                        "protocol": "socks",
                        "settings": {
                            "auth": "noauth",
                            "udp": true
                        },
                        "sniffing": {
                            "destOverride": [
                                "http",
                                "tls"
                            ],
                            "enabled": true,
                            "routeOnly": true
                        },
                        "tag": "mixed-in"
                    },
                    {
                        "listen": "127.0.0.1",
                        "port": 10853,
                        "protocol": "dokodemo-door",
                        "settings": {
                            "address": "1.1.1.1",
                            "network": "tcp,udp",
                            "port": 53
                        },
                        "tag": "dns-in"
                    }
                ],
                "outbounds": [
                    {
                        "protocol": "vless",
                        "settings": {
                            "vnext": [
                                {
                                    "address": data.clean_ip,
                                    "port": parseInt(data.port),
                                    "users": [
                                        {
                                            "id": data.uuid,
                                            "encryption": "none"
                                        }
                                    ]
                                }
                            ]
                        },
                        "streamSettings": {
                            "network": "ws",
                            "wsSettings": {
                                "host": host,
                                "path": data.path
                            },
                            "security": "tls",
                            "tlsSettings": {
                                "serverName": host,
                                "fingerprint": "chrome",
                                "alpn": [
                                    "http/1.1"
                                ],
                                "allowInsecure": false
                            },
                            "sockopt": {
                                "dialerProxy": "fragment"
                            }
                        },
                        "tag": "proxy"
                    },
                    {
                        "protocol": "freedom",
                        "settings": {
                            "fragment": {
                                "packets": "tlshello",
                                "length": data.frag_length,
                                "interval": data.frag_interval
                            }
                        },
                        "streamSettings": {
                            "sockopt": {
                                "domainStrategy": "UseIP",
                                "happyEyeballs": {
                                    "tryDelayMs": 250,
                                    "prioritizeIPv6": false,
                                    "interleave": 2,
                                    "maxConcurrentTry": 4
                                }
                            }
                        },
                        "tag": "fragment"
                    },
                    {
                        "protocol": "dns",
                        "settings": {
                            "nonIPQuery": "reject"
                        },
                        "tag": "dns-out"
                    },
                    {
                        "protocol": "freedom",
                        "settings": {
                            "domainStrategy": "UseIP"
                        },
                        "tag": "direct"
                    },
                    {
                        "protocol": "blackhole",
                        "settings": {
                            "response": {
                                "type": "http"
                            }
                        },
                        "tag": "block"
                    }
                ],
                "routing": {
                    "domainStrategy": "IPIfNonMatch",
                    "rules": [
                        {
                            "inboundTag": [
                                "mixed-in"
                            ],
                            "port": 53,
                            "outboundTag": "dns-out",
                            "type": "field"
                        },
                        {
                            "inboundTag": [
                                "dns-in"
                            ],
                            "outboundTag": "dns-out",
                            "type": "field"
                        },
                        {
                            "inboundTag": [
                                "remote-dns"
                            ],
                            "outboundTag": "proxy",
                            "type": "field"
                        },
                        {
                            "inboundTag": [
                                "dns"
                            ],
                            "outboundTag": "direct",
                            "type": "field"
                        },
                        {
                            "domain": [
                                "geosite:private"
                            ],
                            "outboundTag": "direct",
                            "type": "field"
                        },
                        {
                            "ip": [
                                "geoip:private"
                            ],
                            "outboundTag": "direct",
                            "type": "field"
                        },
                        {
                            "network": "udp",
                            "outboundTag": "block",
                            "type": "field"
                        },
                                                {
                            "network": "tcp",
                            "outboundTag": "proxy",
                            "type": "field"
                        }
                    ]
                }
            };

            document.getElementById('jsonOutput').textContent = JSON.stringify(jsonConfig, null, 2);
            outputBox.style.display = 'block';
        }

                function copyText(elementId) {
            const text = document.getElementById(elementId).textContent;
            navigator.clipboard.writeText(text).then(() => {
                alert('✅ با موفقیت کپی شد!');
            }).catch(() => {
                alert('خطا در کپی کردن!');
            });
        }

                                                                function showQr(elementId) {
            let text = document.getElementById(elementId).textContent;

                        const qrImg = document.getElementById('qrImage');
            qrImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2300f3ff'>در حال تولید...</text></svg>";
            document.querySelector('.container').classList.add('blur-bg');
            document.getElementById('qrModal').style.display = 'flex';
            document.body.classList.add('no-scroll');

            setTimeout(() => {
                QRCode.toDataURL(text, {
                    width: 600,
                    margin: 2,
                    errorCorrectionLevel: 'L'
                }, function (err, url) {
                    if (err) {
                        alert('تولید QR کد با خطا مواجه شد. احتمالا حجم کاراکترهای داده بیش از حد مجاز است.');
                        console.error(err);
                        closeQrModal();
                        return;
                    }
                    qrImg.src = url;
                });
            }, 50);
        }

                function closeQrModal() {
            document.querySelector('.container').classList.remove('blur-bg');
            document.getElementById('qrModal').style.display = 'none';
            document.body.classList.remove('no-scroll');
        }

                window.onload = checkAuth;
    </script>
</body>
</html>
`;

// ==========================================
// 3. ADVANCED CONNECTION UTILITIES (PORTED FROM SCRIPT 1)
// ==========================================

function isIPv4(value) {
    const parts = String(value || '').split('.');
    return parts.length === 4 && parts.every(part => /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
}

function stripIPv6Brackets(hostname = '') {
    const host = String(hostname || '').trim();
    return host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host;
}

function isIPHostname(hostname = '') {
    const host = stripIPv6Brackets(hostname);
    if (isIPv4(host)) return true;
    if (!host.includes(':')) return false;
    try {
        new URL(`http://[${host}]/`);
        return true;
    } catch (e) {
        return false;
    }
}

function convertToUint8Array(data) {
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    return new Uint8Array(data || 0);
}

function concatBytes(...chunkList) {
    const chunks = chunkList.map(convertToUint8Array);
    const total = chunks.reduce((sum, c) => sum + c.byteLength, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
        result.set(c, offset);
        offset += c.byteLength;
    }
    return result;
}

function closeSocketQuietly(socket) {
    try {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CLOSING) {
            socket.close();
        }
    } catch (e) {}
}

// ------------------------------------------
// DoH QUERY ENGINE & DNS CACHE
// ------------------------------------------
const DNS_CACHE = new Map();
const DNS_CACHE_TTL = 5 * 60 * 1000; // 5 Minutes in milliseconds

async function dohQuery(domain, recordType) { 
    const cacheKey = `${domain}:${recordType}`;
    if (DNS_CACHE.has(cacheKey)) {
        const cached = DNS_CACHE.get(cacheKey);
        if (Date.now() < cached.expires) {
            return cached.data;
        }
        DNS_CACHE.delete(cacheKey);
    }
    try {
        const typeMap = { 'A': 1, 'AAAA': 28 };
        const qtype = typeMap[recordType.toUpperCase()] || 1;

        const encodeDomain = (name) => {
            const parts = name.endsWith('.') ? name.slice(0, -1).split('.') : name.split('.');
            const bufs = [];
            for (const label of parts) {
                const enc = new TextEncoder().encode(label);
                bufs.push(new Uint8Array([enc.length]), enc);
            }
            bufs.push(new Uint8Array([0]));
            return concatBytes(...bufs);
        };

        const qname = encodeDomain(domain);
        const query = new Uint8Array(12 + qname.length + 4);
        const qview = new DataView(query.buffer);
        qview.setUint16(0, crypto.getRandomValues(new Uint16Array(1))[0]);
        qview.setUint16(2, 0x0100); 
        qview.setUint16(4, 1); 
        query.set(qname, 12);
        qview.setUint16(12 + qname.length, qtype);
        qview.setUint16(12 + qname.length + 2, 1);

        const response = await fetch(DOH_RESOLVER, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/dns-message',
                'Accept': 'application/dns-message',
            },
            body: query,
        });

        if (!response.ok) return [];

        const buf = new Uint8Array(await response.arrayBuffer());
        const dv = new DataView(buf.buffer);
        const qdcount = dv.getUint16(4);
        const ancount = dv.getUint16(6);

        const parseName = (pos) => {
            const labels = [];
            let p = pos, jumped = false, endPos = -1, safe = 128;
            while (p < buf.length && safe-- > 0) {
                const len = buf[p];
                if (len === 0) { if (!jumped) endPos = p + 1; break; }
                if ((len & 0xC0) === 0xC0) {
                    if (!jumped) endPos = p + 2;
                    p = ((len & 0x3F) << 8) | buf[p + 1];
                    jumped = true;
                    continue;
                } 
                labels.push(new TextDecoder().decode(buf.slice(p + 1, p + 1 + len)));
                p += len + 1;
            }
            if (endPos === -1) endPos = p + 1;
            return [labels.join('.'), endPos];
        };

                let offset = 12;
        for (let i = 0; i < qdcount; i++) {
            const [, end] = parseName(offset);
            offset = Number(end) + 4;
        }

        const answers = [];
        for (let i = 0; i < ancount && offset < buf.length; i++) {
            const [name, nameEnd] = parseName(offset);
            offset = Number(nameEnd);
            const type = dv.getUint16(offset); offset += 2;
            offset += 2; 
            const ttl = dv.getUint32(offset); offset += 4;
            const rdlen = dv.getUint16(offset); offset += 2;
            const rdata = buf.slice(offset, offset + rdlen);
            offset += rdlen;

            let data;
            if (type === 1 && rdlen === 4) {
                data = `${rdata[0]}.${rdata[1]}.${rdata[2]}.${rdata[3]}`;
            } else if (type === 28 && rdlen === 16) {
                const segs = [];
                for (let j = 0; j < 16; j += 2) segs.push(((rdata[j] << 8) | rdata[j + 1]).toString(16));
                data = segs.join(':');
            } else {
                data = Array.from(rdata).map(b => b.toString(16).padStart(2, '0')).join('');
            }
            answers.push({ name, type, TTL: ttl, data });
        }
        DNS_CACHE.set(cacheKey, { data: answers, expires: Date.now() + DNS_CACHE_TTL });
        return answers;
    } catch (e) {
        return [];
    }
}

// ------------------------------------------
// ADVANCED UPSTREAM WRITE QUEUE
// ------------------------------------------
function createUpstreamQueue({ getWriter, releaseWriter, retryConnect, closeConnection, name = 'UpstreamQueue' }) {
    let chunks = [];
    let head = 0;
    let queuedBytes = 0;
    let draining = false;
    let closed = false;
    let bundleBuffer = null;
    let idleResolvers = [];
    let activeCompletions = null;

    const settleCompletions = (completions, err = null) => {
        if (!completions) return;
        for (const comp of completions) {
            if (comp) {
                if (err) comp.reject(err);
                else comp.resolve();
            }
        }
    };

    const rejectQueued = (err) => {
        for (let i = head; i < chunks.length; i++) {
            const item = chunks[i];
            if (item && item.completions) settleCompletions(item.completions, err);
        }
    };

    const compact = () => {
        if (head > 32 && head * 2 >= chunks.length) {
            chunks = chunks.slice(head);
            head = 0;
        }
    };

    const resolveIdle = () => {
        if (queuedBytes || draining || !idleResolvers.length) return;
        const resolvers = idleResolvers;
        idleResolvers = [];
        for (const resolve of resolvers) resolve();
    };

    const clear = (err = null) => {
        const closeErr = err || (closed ? new Error(`${name}: queue closed`) : null);
        if (closeErr) {
            rejectQueued(closeErr);
            settleCompletions(activeCompletions, closeErr);
            activeCompletions = null;
        }
        chunks = [];
        head = 0;
        queuedBytes = 0;
        resolveIdle();
    };

    const shift = () => {
        if (head >= chunks.length) return null;
        const item = chunks[head];
        chunks[head++] = undefined;
        queuedBytes -= item.chunk.byteLength;
        compact();
        return item;
    };

    const bundle = () => {
        const first = shift();
        if (!first) return null;
        if (head >= chunks.length || first.chunk.byteLength >= UPSTREAM_BUNDLE_TARGET_BYTES) return first;

        let byteLength = first.chunk.byteLength;
        let end = head;
        let allowRetry = first.allowRetry;
        let completions = first.completions || null;
        while (end < chunks.length) {
            const next = chunks[end];
            const nextLength = byteLength + next.chunk.byteLength;
            if (nextLength > UPSTREAM_BUNDLE_TARGET_BYTES) break;
            byteLength = nextLength;
            allowRetry = allowRetry && next.allowRetry;
            if (next.completions) completions = completions ? completions.concat(next.completions) : next.completions;
            end++;
        }
        if (end === head) return first;

        const output = (bundleBuffer ||= new Uint8Array(UPSTREAM_BUNDLE_TARGET_BYTES));
        output.set(first.chunk);
        let offset = first.chunk.byteLength;
        while (head < end) {
            const next = chunks[head];
            chunks[head++] = undefined;
            queuedBytes -= next.chunk.byteLength;
            output.set(next.chunk, offset);
            offset += next.chunk.byteLength;
        }
        compact();
        return { chunk: output.subarray(0, byteLength), allowRetry, completions };
    };

    const drain = async () => {
        if (draining || closed) return;
        draining = true;
        try {
            for (; ;) {
                if (closed) break;
                const item = bundle();
                if (!item) break;
                let writer = getWriter();
                if (!writer) throw new Error(`${name}: remote writer unavailable`);
                const completions = item.completions || null;
                activeCompletions = completions;
                try {
                    try {
                        await writer.write(item.chunk);
                    } catch (err) {
                        releaseWriter?.();
                        if (!item.allowRetry || typeof retryConnect !== 'function') throw err;
                        await retryConnect();
                        writer = getWriter();
                        if (!writer) throw err;
                        await writer.write(item.chunk);
                    }
                    settleCompletions(completions);
                } catch (err) {
                    settleCompletions(completions, err);
                    throw err;
                } finally {
                    if (activeCompletions === completions) activeCompletions = null;
                }
            }
        } catch (err) {
            closed = true;
            clear(err);
            try { closeConnection?.(err); } catch (_) {}
        } finally {
            draining = false;
            if (!closed && head < chunks.length) queueMicrotask(drain);
            else resolveIdle();
        }
    };

    const enqueue = (data, allowRetry = true, waitForFlush = false) => {
        if (closed) return false;
        if (!getWriter()) return false;
        const chunk = convertToUint8Array(data);
        if (!chunk.byteLength) return true;
        const nextBytes = queuedBytes + chunk.byteLength;
        const nextItems = chunks.length - head + 1;
        if (nextBytes > UPSTREAM_QUEUE_MAX_BYTES || nextItems > UPSTREAM_QUEUE_MAX_ITEMS) {
            closed = true;
            const err = Object.assign(new Error(`${name}: upload queue overflow (${nextBytes}B/${nextItems})`), { isQueueOverflow: true });
            clear(err);
            try { closeConnection?.(err); } catch (_) {}
            throw err;
        }
        let completionPromise = null;
        let completions = null;
        if (waitForFlush) {
            completions = [];
            completionPromise = new Promise((resolve, reject) => completions.push({ resolve, reject }));
        }
        chunks.push({ chunk, allowRetry, completions });
        queuedBytes = nextBytes;
        if (!draining) queueMicrotask(drain);
        return waitForFlush ? completionPromise.then(() => true) : true;
    };

    return {
        write(data, allowRetry = true) {
            return enqueue(data, allowRetry, false);
        },
        writeAndAwait(data, allowRetry = true) {
            return enqueue(data, allowRetry, true);
        },
        async awaitEmpty() {
            if (!queuedBytes && !draining) return;
            await new Promise(resolve => idleResolvers.push(resolve));
        },
        clear() {
            closed = true;
            clear();
        }
    };
}

// ------------------------------------------
// ADVANCED DOWNSTREAM GRAIN SENDER
// ------------------------------------------
function createDownstreamSender(webSocket, headerData = null) {
    const packetCap = DOWNSTREAM_GRAIN_BYTES;
    const tailBytes = DOWNSTREAM_GRAIN_TAIL_THRESHOLD;
    const lowWaterBytes = Math.max(4096, tailBytes << 3);
    let header = headerData;
    let pendingBuffer = new Uint8Array(packetCap);
    let pendingBytes = 0;
    let flushTimer = null;
    let microtaskQueued = false;
    let generation = 0;
    let scheduledGeneration = 0;
    let waitRounds = 0;
    let flushPromise = null;

    const sendRawChunk = async (chunk) => {
        if (webSocket.readyState !== WebSocket.OPEN) throw new Error('ws.readyState is not open');
        webSocket.send(chunk);
    };

    const attachResponseHeader = (chunk) => {
        if (!header) return chunk;
        const merged = new Uint8Array(header.length + chunk.byteLength);
        merged.set(header, 0);
        merged.set(chunk, header.length);
        header = null;
        return merged;
    };

    const flush = async () => {
        while (flushPromise) await flushPromise;
        if (flushTimer) clearTimeout(flushTimer);
        flushTimer = null;
        microtaskQueued = false;
        if (!pendingBytes) return;
        const output = pendingBuffer.subarray(0, pendingBytes).slice();
        pendingBuffer = new Uint8Array(packetCap);
        pendingBytes = 0;
        waitRounds = 0;
        flushPromise = sendRawChunk(output).finally(() => { flushPromise = null; });
        return flushPromise;
    };

    const scheduleFlush = () => {
        if (flushTimer || microtaskQueued) return;
        microtaskQueued = true;
        scheduledGeneration = generation;
        queueMicrotask(() => {
            microtaskQueued = false;
            if (!pendingBytes || flushTimer) return;
            if (packetCap - pendingBytes < tailBytes) {
                flush().catch(() => closeSocketQuietly(webSocket));
                return;
            }
            flushTimer = setTimeout(() => {
                flushTimer = null;
                if (!pendingBytes) return;
                if (packetCap - pendingBytes < tailBytes) {
                    flush().catch(() => closeSocketQuietly(webSocket));
                    return;
                }
                if (waitRounds < 2 && (generation !== scheduledGeneration || pendingBytes < lowWaterBytes)) {
                    waitRounds++;
                    scheduledGeneration = generation;
                    scheduleFlush();
                    return;
                }
                flush().catch(() => closeSocketQuietly(webSocket));
            }, Math.max(DOWNSTREAM_GRAIN_SILENT_MS, 1));
        });
    };

    return {
        async sendDirect(data) {
            let chunk = convertToUint8Array(data);
            if (!chunk.byteLength) return;
            chunk = attachResponseHeader(chunk);
            await sendRawChunk(chunk);
        },
        async send(data) {
            let chunk = convertToUint8Array(data);
            if (!chunk.byteLength) return;
            chunk = attachResponseHeader(chunk);
            let offset = 0;
            const totalBytes = chunk.byteLength;
            while (offset < totalBytes) {
                if (!pendingBytes && totalBytes - offset >= packetCap) {
                    const sendBytes = Math.min(packetCap, totalBytes - offset);
                    const view = offset || sendBytes !== totalBytes ? chunk.subarray(offset, offset + sendBytes) : chunk;
                    await sendRawChunk(view);
                    offset += sendBytes;
                    continue;
                }
                const copyBytes = Math.min(packetCap - pendingBytes, totalBytes - offset);
                pendingBuffer.set(chunk.subarray(offset, offset + copyBytes), pendingBytes);
                pendingBytes += copyBytes;
                offset += copyBytes;
                generation++;
                if (pendingBytes === packetCap || packetCap - pendingBytes < tailBytes) await flush();
                else scheduleFlush();
            }
        },
        flush
    };
}

async function waitForBackpressure(ws) {
    if (typeof ws.bufferedAmount === 'number') {
        while (ws.bufferedAmount > 256 * 1024) {
            await new Promise(r => setTimeout(r, 100));
        }
    }
}

async function connectStreams(remoteSocket, webSocket, headerData, retryFunc) {
    let header = headerData, hasData = false, reader, useBYOB = false;
    const BYOB_LIMIT = 64 * 1024;
    const downstreamSender = createDownstreamSender(webSocket, header);
    header = null;

    try { 
        reader = remoteSocket.readable.getReader({ mode: 'byob' }); 
        useBYOB = true; 
    } catch (e) { 
        reader = remoteSocket.readable.getReader(); 
    }

    try {
        if (!useBYOB) {
            while (true) {
                await waitForBackpressure(webSocket);
                const { done, value } = await reader.read();
                if (done) break;
                if (!value || value.byteLength === 0) continue;
                hasData = true;
                await downstreamSender.send(value);
            }
        } else {
            let readBuffer = new ArrayBuffer(BYOB_LIMIT);
            while (true) {
                await waitForBackpressure(webSocket);
                const { done, value } = await reader.read(new Uint8Array(readBuffer, 0, BYOB_LIMIT));
                if (done) break;
                if (!value || value.byteLength === 0) continue;
                hasData = true;
                if (value.byteLength >= DOWNSTREAM_GRAIN_BYTES) {
                    await downstreamSender.flush();
                    await downstreamSender.sendDirect(value);
                    readBuffer = new ArrayBuffer(BYOB_LIMIT);
                } else {
                    await downstreamSender.send(value);
                    readBuffer = value.buffer.byteLength >= BYOB_LIMIT ? value.buffer : new ArrayBuffer(BYOB_LIMIT);
                }
            }
        }
        await downstreamSender.flush();
    } catch (err) { 
        closeSocketQuietly(webSocket);
    } finally { 
        try { reader.cancel(); } catch (e) {} 
        try { reader.releaseLock(); } catch (e) {} 
    }
    if (!hasData && retryFunc) await retryFunc();
}

// ------------------------------------------
// CONCURRENT TCP DIALING & RACING (RACING CONNECT)
// ------------------------------------------
async function buildRaceCandidates(address, port) {
    if (!PRELOAD_RACE_DIAL || isIPHostname(address)) return null;
    const [aRecords, aaaaRecords] = await Promise.all([
        dohQuery(address, 'A'),
        dohQuery(address, 'AAAA')
    ]);
    const ipv4List = [...new Set(aRecords.flatMap(r => {
        return r.type === 1 && typeof r.data === 'string' && isIPv4(r.data) ? [r.data] : [];
    }))];
    const ipv6List = [...new Set(aaaaRecords.flatMap(r => {
        return r.type === 28 && typeof r.data === 'string' && isIPHostname(r.data) ? [r.data] : [];
    }))];
    const limit = Math.max(1, TCP_CONCURRENCY | 0);
    const ipList = ipv4List.length >= limit
        ? ipv4List.slice(0, limit)
        : ipv4List.concat(ipv6List.slice(0, limit - ipv4List.length));
    if (ipList.length === 0) return null;
    return ipList.map((hostname, attempt) => ({ hostname, port, attempt, resolvedFrom: address }));
}

async function connectDirect(address, port, initialData = null) {
    const raceCandidates = await buildRaceCandidates(address, port);
    const candidates = raceCandidates || Array.from({ length: TCP_CONCURRENCY }, () => ({ hostname: address, port }));

    const openConnection = async (host, prt) => {
        const socket = connect({ hostname: host, port: prt });
        await Promise.race([
            socket.opened,
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
        ]);
        return socket;
    };

    if (candidates.length === 1) {
        const s = await openConnection(candidates[0].hostname, candidates[0].port);
        if (initialData && initialData.byteLength > 0) {
            const w = s.writable.getWriter();
            await w.write(convertToUint8Array(initialData));
            w.releaseLock();
        }
        return s;
    }

    const attempts = candidates.map(c => openConnection(c.hostname, c.port).then(socket => ({ socket, candidate: c })));
    let winner = null;
    try {
        winner = await Promise.any(attempts);
        if (initialData && initialData.byteLength > 0) {
            const w = winner.socket.writable.getWriter();
            await w.write(convertToUint8Array(initialData));
            w.releaseLock();
        }
        return winner.socket;
    } finally {
        if (winner) {
            for (const attempt of attempts) {
                attempt.then(({ socket }) => {
                    if (socket !== winner.socket) {
                        try { socket.close(); } catch (e) {}
                    }
                }).catch(() => {});
            }
        }
    }
}

// ------------------------------------------
// VLESS UDP DNS FORWARDER (UDP OVER TCP AT 8.8.4.4:53)
// ------------------------------------------
async function forwardVlessUDP(udpChunk, webSocket, respHeader) {
    const requestData = convertToUint8Array(udpChunk);
    try {
        const tcpSocket = connect({ hostname: '8.8.4.4', port: 53 });
        let vlessHeader = respHeader;
        const writer = tcpSocket.writable.getWriter();
        await writer.write(requestData);
        writer.releaseLock();

        await tcpSocket.readable.pipeTo(new WritableStream({
            async write(chunk) {
                const response = convertToUint8Array(chunk);
                if (webSocket.readyState !== WebSocket.OPEN) return;
                if (vlessHeader) {
                    const merged = new Uint8Array(vlessHeader.length + response.byteLength);
                    merged.set(vlessHeader, 0);
                    merged.set(response, vlessHeader.length);
                    webSocket.send(merged.buffer);
                    vlessHeader = null;
                } else {
                    webSocket.send(response);
                }
            }
        }));
    } catch (e) {}
}

// ==========================================
// 4. MAIN ROUTER & VLESS PROXY CORE
// ==========================================
async function handleVLESS(request, env, storedData = null) {
    const socketPair = new WebSocketPair();
    const [clientSock, serverSock] = Object.values(socketPair);
    serverSock.accept();
    serverSock.binaryType = 'arraybuffer';

    const heartbeat = setInterval(() => {
        if (serverSock.readyState === WebSocket.OPEN) {
            try {
                serverSock.send(new Uint8Array(0));
            } catch (e) {}
        } else {
            clearInterval(heartbeat);
        }
    }, 30000);

    let remoteConnWrapper = { socket: null, connectingPromise: null, retryConnect: null };
    let reqUUID = null;
    let isHeaderParsed = false;
            let isDnsQuery = false;
        let chunkBuffer = new Uint8Array(0);

        if (!storedData) {
            storedData = await env.TERIAK_KV.get("settings", "json");
            if (!storedData) storedData = DEFAULT_SETTINGS;
        }

        const validUUID = storedData.uuid;
    const proxyIP = storedData.proxy_ip;

    let wsChain = Promise.resolve();
    let wsStopped = false, wsFailed = false, wsFinished = false;
    let wsQueueBytes = 0, wsQueueItems = 0;
    let currentSocketWriter = null, activeRemoteWriter = null;

    const releaseRemoteWriter = () => {
        if (activeRemoteWriter) {
            try { activeRemoteWriter.releaseLock(); } catch (e) {}
            activeRemoteWriter = null;
        }
        currentSocketWriter = null;
    };

    const getRemoteWriter = () => {
        const s = remoteConnWrapper.socket;
        if (!s) return null;
        if (s !== currentSocketWriter) {
            releaseRemoteWriter();
            currentSocketWriter = s;
            activeRemoteWriter = s.writable.getWriter();
        }
        return activeRemoteWriter;
    };

    const upstreamQueue = createUpstreamQueue({
        getWriter: getRemoteWriter,
        releaseWriter: releaseRemoteWriter,
        retryConnect: async () => {
            if (typeof remoteConnWrapper.retryConnect === 'function') {
                await remoteConnWrapper.retryConnect();
            }
        },
        closeConnection: () => {
            try { remoteConnWrapper.socket?.close(); } catch (e) {}
            closeSocketQuietly(serverSock);
        },
        name: 'VlessWSQueue'
    });

    const writeToRemote = async (chunk, allowRetry = true) => {
        return upstreamQueue.writeAndAwait(chunk, allowRetry);
    };

    const processWsMessage = async (chunk) => {
        if (isDnsQuery) {
            await forwardVlessUDP(chunk, serverSock, null);
            return;
        }

        if (await writeToRemote(chunk)) return;

        if (!isHeaderParsed) {
            chunkBuffer = concatBytes(chunkBuffer, chunk);
            if (chunkBuffer.byteLength < 24) return;

            reqUUID = extractUUIDFromVless(chunkBuffer);
            if (!reqUUID || reqUUID !== validUUID) {
                serverSock.close();
                return;
            }

            isHeaderParsed = true;

            try {
                let offset = 17;
                const optLen = chunkBuffer[offset++];
                offset += optLen;
                const cmd = chunkBuffer[offset++]; // 1: TCP, 2: UDP
                const port = (chunkBuffer[offset++] << 8) | chunkBuffer[offset++];
                const addrType = chunkBuffer[offset++];

                let addr = '';
                if (addrType === 1) {
                    addr = `${chunkBuffer[offset++]}.${chunkBuffer[offset++]}.${chunkBuffer[offset++]}.${chunkBuffer[offset++]}`;
                } else if (addrType === 2) {
                    const domainLen = chunkBuffer[offset++];
                    addr = new TextDecoder().decode(chunkBuffer.slice(offset, offset + domainLen));
                    offset += domainLen;
                } else if (addrType === 3) {
                    offset += 16;
                    addr = "ipv6-unsupported";
                }

                const rawData = chunkBuffer.slice(offset);
                const respHeader = new Uint8Array([chunkBuffer[0], 0]);

                if (cmd === 2) {
                    // UDP Session Routing (DNS/Port 53 integration)
                    if (port === 53) {
                        isDnsQuery = true;
                        await forwardVlessUDP(rawData, serverSock, respHeader);
                    } else {
                        // General UDP is fallback closed due to Cloudflare Sockets limitations.
                        serverSock.close();
                    }
                    return;
                }

                                                                // TCP Connection Flow using Racing & pre-loaded DoH candidates
                const connectTCP = async (dataPayload = null, useFallback = true) => {
                    if (remoteConnWrapper.connectingPromise) {
                        await remoteConnWrapper.connectingPromise;
                        return;
                    }
                    const task = (async () => {
                        let s = null;
                        try {
                            s = await connectDirect(addr, port, dataPayload);
                        } catch (err) {
                            if (useFallback && proxyIP) {
                                s = await connectDirect(proxyIP, port, dataPayload);
                            } else {
                                throw err;
                            }
                        }
                        remoteConnWrapper.socket = s; 
                        s.closed.catch(() => {}).finally(() => closeSocketQuietly(serverSock));
                        connectStreams(s, serverSock, respHeader, null);
                    })();
                    remoteConnWrapper.connectingPromise = task;
                    try {
                        await task;
                    } finally {
                        if (remoteConnWrapper.connectingPromise === task) {
                            remoteConnWrapper.connectingPromise = null;
                        }
                    }
                };

                remoteConnWrapper.retryConnect = async () => connectTCP(null, false);
                await connectTCP(rawData, true);

            } catch (e) {
                serverSock.close();
            }
        }
    };

    const handleWsError = (err) => {
        if (wsFailed) return;
        wsFailed = true;
        wsStopped = true;
        wsQueueBytes = 0;
        wsQueueItems = 0;
        upstreamQueue.clear();
        releaseRemoteWriter();
        closeSocketQuietly(serverSock);
    };

    const pushToChain = (task) => {
        wsChain = wsChain.then(task).catch(handleWsError);
    };

    serverSock.addEventListener('message', (event) => {
        if (wsStopped || wsFailed) return;
        const size = event.data.byteLength || 0;
        const nextBytes = wsQueueBytes + size;
        const nextItems = wsQueueItems + 1;
        if (nextBytes > UPSTREAM_QUEUE_MAX_BYTES || nextItems > UPSTREAM_QUEUE_MAX_ITEMS) {
            handleWsError(new Error('ws queue overflow'));
            return;
        }
        wsQueueBytes = nextBytes;
        wsQueueItems = nextItems;
        pushToChain(async () => {
            wsQueueBytes = Math.max(0, wsQueueBytes - size);
            wsQueueItems = Math.max(0, wsQueueItems - 1);
            if (wsFailed) return;
            await processWsMessage(event.data);
        });
    });

        serverSock.addEventListener('close', () => {
        clearInterval(heartbeat);
        closeSocketQuietly(serverSock);
        if (wsFinished) return;
        wsFinished = true;
        wsStopped = true;
        pushToChain(async () => {
            if (wsFailed) return;
            await upstreamQueue.awaitEmpty();
            releaseRemoteWriter();
        });
    });

    serverSock.addEventListener('error', (err) => {
        handleWsError(err);
    });

    return new Response(null, { status: 101, webSocket: clientSock });
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const upgradeHeader = (request.headers.get('Upgrade') || '').toLowerCase();
        
        if (upgradeHeader === 'websocket') {
            let storedData = await env.TERIAK_KV.get("settings", "json");
            if (!storedData) storedData = DEFAULT_SETTINGS;
            let configPath = storedData.path || "/nab";
            if (!configPath.startsWith('/')) {
                configPath = '/' + configPath;
            }
            if (url.pathname === configPath) {
                return handleVLESS(request, env, storedData);
            }
            return new Response(`<!DOCTYPE html><html><head><title>Welcome to nginx!</title><style>body {width: 35em;margin: 0 auto;font-family: Tahoma, Verdana, Arial, sans-serif;}</style></head><body><h1>Welcome to nginx!</h1><p>If you see this page, the nginx web server is successfully installed and working.</p></body></html>`, {
                status: 200,
                headers: { 'Content-Type': 'text/html; charset=UTF-8' }
            });
        }

                if (url.pathname === '/panel') {
            return new Response(getHtmlPage(), {
                status: 200,
                headers: { 'Content-Type': 'text/html; charset=UTF-8' }
            });
        }

                                if (url.pathname.startsWith('/sub/')) {
            const pathParts = url.pathname.split('/');
            const reqType = 'sub';
            const reqUuid = pathParts[2];
            let storedData = await env.TERIAK_KV.get("settings", "json");
            if (!storedData) storedData = DEFAULT_SETTINGS;
            
            if (reqUuid && reqUuid === storedData.uuid) {
                const cleanIpVal = storedData.clean_ip || url.hostname;
                const ips = cleanIpVal.split('\n').map(ip => ip.trim()).filter(ip => ip);
                const host = request.headers.get('host') || url.host;
                
                if (reqType === 'sub') {
                    const configs = ips.map((ip, index) => {
                        const suffix = ips.length > 1 ? ` - ${index + 1}` : '';
                        return `vless://${storedData.uuid}@${ip}:${storedData.port}?path=${encodeURIComponent(storedData.path)}&security=tls&encryption=none&insecure=0&host=${host}&fp=chrome&type=ws&allowInsecure=0&sni=${host}#${encodeURIComponent(storedData.name + suffix)}`;
                    });
                    
                    const rawSub = configs.join('\n');
                    const subContent = btoa(unescape(encodeURIComponent(rawSub)));
                    return new Response(subContent, { 
                        status: 200,
                        headers: {
                            'Content-Type': 'text/plain; charset=utf-8',
                            'Cache-Control': 'no-store'
                        }
                    });
                } else if (reqType === 'sub-json') {
                    const primaryIP = ips[0] || host;
                    const jsonConfig = {
                        "remarks": storedData.name,
                        "version": { "min": "25.10.15" },
                        "log": { "loglevel": "none" },
                        "dns": {
                            "servers": [
                                { "address": "https://8.8.8.8/dns-query", "tag": "remote-dns" },
                                { "address": "8.8.8.8", "domains": [ "full:" + host ], "skipFallback": true }
                            ],
                            "queryStrategy": "UseIP",
                            "tag": "dns"
                        },
                        "inbounds": [
                            {
                                "listen": "127.0.0.1", "port": 10808, "protocol": "socks",
                                "settings": { "auth": "noauth", "udp": true },
                                "sniffing": { "destOverride": [ "http", "tls" ], "enabled": true, "routeOnly": true },
                                "tag": "mixed-in"
                            },
                            {
                                "listen": "127.0.0.1", "port": 10853, "protocol": "dokodemo-door",
                                "settings": { "address": "1.1.1.1", "network": "tcp,udp", "port": 53 },
                                "tag": "dns-in"
                            }
                        ],
                        "outbounds": [
                            {
                                "protocol": "vless",
                                "settings": {
                                    "vnext": [{
                                        "address": primaryIP,
                                        "port": parseInt(storedData.port),
                                        "users": [{ "id": storedData.uuid, "encryption": "none" }]
                                    }]
                                },
                                "streamSettings": {
                                    "network": "ws",
                                    "wsSettings": { "host": host, "path": storedData.path },
                                    "security": "tls",
                                    "tlsSettings": {
                                        "serverName": host, "fingerprint": "chrome",
                                        "alpn": [ "http/1.1" ], "allowInsecure": false
                                    },
                                    "sockopt": { "dialerProxy": "fragment" }
                                },
                                "tag": "proxy"
                            },
                            {
                                "protocol": "freedom",
                                "settings": {
                                    "fragment": {
                                        "packets": "tlshello",
                                        "length": storedData.frag_length,
                                        "interval": storedData.frag_interval
                                    }
                                },
                                "streamSettings": {
                                    "sockopt": {
                                        "domainStrategy": "UseIP",
                                        "happyEyeballs": { "tryDelayMs": 250, "prioritizeIPv6": false, "interleave": 2, "maxConcurrentTry": 4 }
                                    }
                                },
                                "tag": "fragment"
                            },
                            { "protocol": "dns", "settings": { "nonIPQuery": "reject" }, "tag": "dns-out" },
                            { "protocol": "freedom", "settings": { "domainStrategy": "UseIP" }, "tag": "direct" },
                            { "protocol": "blackhole", "settings": { "response": { "type": "http" } }, "tag": "block" }
                        ],
                        "routing": {
                            "domainStrategy": "IPIfNonMatch",
                            "rules": [
                                { "inboundTag": [ "mixed-in" ], "port": 53, "outboundTag": "dns-out", "type": "field" },
                                { "inboundTag": [ "dns-in" ], "outboundTag": "dns-out", "type": "field" },
                                { "inboundTag": [ "remote-dns" ], "outboundTag": "proxy", "type": "field" },
                                { "inboundTag": [ "dns" ], "outboundTag": "direct", "type": "field" },
                                { "domain": [ "geosite:private" ], "outboundTag": "direct", "type": "field" },
                                { "ip": [ "geoip:private" ], "outboundTag": "direct", "type": "field" },
                                { "network": "udp", "outboundTag": "block", "type": "field" },
                                { "network": "tcp", "outboundTag": "proxy", "type": "field" }
                            ]
                        }
                    };
                    return new Response(JSON.stringify(jsonConfig, null, 2), { 
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8',
                            'Cache-Control': 'no-store'
                        }
                    });
                }
            } else {
                return new Response("Unauthorized", { status: 401 });
            }
        }
        
                if (url.pathname === '/panel/status') {
            const savedPassword = await env.TERIAK_KV.get("panel_password");
            return new Response(JSON.stringify({ hasPassword: !!savedPassword }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (url.pathname === '/panel/set-password' && request.method === 'POST') {
            const savedPassword = await env.TERIAK_KV.get("panel_password");
            if (savedPassword) {
                return new Response(JSON.stringify({ error: "Password already set" }), { status: 400 });
            }
            const body = await request.json();
            const newPassword = body.password;
            if (!newPassword || newPassword.length < 4) {
                return new Response(JSON.stringify({ error: "Password too short" }), { status: 400 });
            }
            await env.TERIAK_KV.put("panel_password", newPassword);
            return new Response(JSON.stringify({ status: "ok" }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (url.pathname === '/panel/api') {
            const savedPassword = await env.TERIAK_KV.get("panel_password");
            if (savedPassword) {
                const clientPassword = request.headers.get("X-Panel-Password");
                if (clientPassword !== savedPassword) {
                    return new Response(JSON.stringify({ error: "Unauthorized" }), {
                        status: 401,
                        headers: { 'Content-Type': 'application/json' }
                    });
                } 
            }

                        if (request.method === 'GET') {
                let data = await env.TERIAK_KV.get("settings", "json");
                if (!data) {
                    data = DEFAULT_SETTINGS;
                    data.uuid = crypto.randomUUID(); 
                    data.clean_ip = new URL(request.url).hostname;
                    await env.TERIAK_KV.put("settings", JSON.stringify(data));
                }
                return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
            }
            
            if (request.method === 'POST') {
                const newData = await request.json();
                await env.TERIAK_KV.put("settings", JSON.stringify(newData));
                return new Response('{"status": "ok"}', { headers: { 'Content-Type': 'application/json' } });
            }
        }

        return new Response(`<!DOCTYPE html><html><head><title>Welcome to nginx!</title><style>body {width: 35em;margin: 0 auto;font-family: Tahoma, Verdana, Arial, sans-serif;}</style></head><body><h1>Welcome to nginx!</h1><p>If you see this page, the nginx web server is successfully installed and working.</p></body></html>`, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=UTF-8' }
        });
    }
};

function extractUUIDFromVless(data) {
    if (data.byteLength < 17) return null;
    const hex = [...data.slice(1, 17)].map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;
}
