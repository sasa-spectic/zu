import { connect } from 'cloudflare:sockets';

// ==========================================
// 1. DEFAULT SETTINGS
// ==========================================
const DEFAULT_SETTINGS = {
    name: "teriak panel",
    clean_ip: "104.17.121.0",
    port: "443",
    uuid: "", 
    path: "/nab",
    proxy_ip: "bpb.yousef.isegaro.com",
    frag_length: "20-30",
    frag_interval: "1-2"
};

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
    <style>
        :root {
            --bg-color: #050505;
            --panel-bg: #0d0d14;
            --primary: #00f3ff;
            --secondary: #ff00ea;
            --text: #e0e0e0;
            --border: #1f1f2e;
        }
        * { box-sizing: border-box; font-family: 'Vazirmatn', sans-serif; }
        body {
            background-color: var(--bg-color);
            color: var(--text);
            margin: 0; padding: 20px;
            display: flex; justify-content: center; align-items: center;
            min-height: 100vh;
            background-image: radial-gradient(circle at 50% 0%, #1a0033 0%, transparent 70%);
        }
        .container {
            background: var(--panel-bg);
            border: 1px solid var(--primary);
            box-shadow: 0 0 15px rgba(0, 243, 255, 0.2), inset 0 0 10px rgba(255, 0, 234, 0.1);
            border-radius: 12px;
            width: 100%; max-width: 650px;
            padding: 30px;
            position: relative;
            overflow: hidden;
        }
        h1 {
            text-align: center; color: var(--primary);
            text-shadow: 0 0 10px var(--primary);
            margin-top: 0; border-bottom: 1px dashed var(--secondary); padding-bottom: 15px;
        }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; color: var(--secondary); font-size: 0.9em; }
        input, select {
            width: 100%; padding: 10px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid var(--border);
            color: var(--primary);
            border-radius: 5px; outline: none; transition: 0.3s;
        }
        input:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 8px var(--primary); }
        .row { display: flex; gap: 10px; }
        .row .form-group { flex: 1; }
        button {
            width: 100%; padding: 12px; margin-top: 10px;
            border: none; border-radius: 5px; cursor: pointer;
            font-weight: bold; font-size: 1em; transition: 0.3s;
        }
        .btn-submit { background: var(--primary); color: #000; box-shadow: 0 0 10px var(--primary); }
        .btn-submit:hover { background: #00c3cc; }
        .btn-reset { background: transparent; border: 1px solid var(--secondary); color: var(--secondary); }
        .btn-reset:hover { background: var(--secondary); color: #fff; box-shadow: 0 0 10px var(--secondary); }
        
        .output-box {
            margin-top: 25px; padding: 15px;
            background: #000; border: 1px solid #333; border-radius: 5px;
            position: relative;
        }
        .output-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #222; padding-bottom: 5px;}
        .output-header span { color: var(--primary); font-size: 0.9em; }
        pre { color: #0f0; margin: 0; white-space: pre-wrap; word-break: break-all; font-family: monospace; font-size: 0.85em; direction: ltr; text-align: left; max-height: 250px; overflow-y: auto;}
        .btn-copy { width: auto; padding: 4px 10px; background: var(--secondary); color: #fff; font-size: 0.8em; margin: 0; border-radius: 3px;}
        
        .footer { text-align: center; margin-top: 20px; border-top: 1px dashed #333; padding-top: 15px; display: flex; justify-content: center; gap: 20px;}
        .footer a { color: var(--text); display: flex; align-items: center; justify-content: center; transition: 0.3s; width: 35px; height: 35px; border-radius: 50%; background: #1a1a24; border: 1px solid #333;}
        .footer a:hover { color: var(--primary); border-color: var(--primary); box-shadow: 0 0 10px var(--primary); transform: scale(1.1);}
        .footer svg { width: 18px; height: 18px; fill: currentColor; }
    </style>
</head>
<body>
    <div class="container">
        <h1>تریاک پنل</h1>
        <form id="settingsForm">
            <div class="form-group">
                <label>نام پنل / کانفیگ</label>
                <input type="text" id="name" required>
            </div>
            <div class="form-group">
                <label>آی‌پی تمیز (Clean IP)</label>
                <input type="text" id="clean_ip" dir="ltr" required>
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
            <div class="row" style="border: 1px solid #1f1f2e; padding: 15px; border-radius: 5px; margin-bottom: 15px; background: rgba(0,0,0,0.3);">
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
                <button class="btn-copy" onclick="copyText('vlessOutput')">کپی لینک</button>
            </div>
            <pre id="vlessOutput" style="margin-bottom: 20px; color: #fff;"></pre>

            <div class="output-header">
                <span>کانفیگ کامل (JSON + Fragment):</span>
                <button class="btn-copy" onclick="copyText('jsonOutput')">کپی JSON</button>
            </div>
            <pre id="jsonOutput"></pre>
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

    <script>
        const host = window.location.hostname;
        
        async function loadSettings() {
            try {
                const res = await fetch('/panel/api');
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
                document.getElementById('clean_ip').value = '104.17.121.0';
                document.getElementById('port').value = '443';
                document.getElementById('uuid').value = crypto.randomUUID();
                document.getElementById('path').value = '/nab';
                document.getElementById('proxy_ip').value = 'bpb.yousef.isegaro.com';
                document.getElementById('frag_length').value = '20-30';
                document.getElementById('frag_interval').value = '1-2';
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

            await fetch('/panel/api', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            
            generateOutput(data);
            alert('✅ تنظیمات در سرور کلودفلر ذخیره شد.');
        });

        function generateOutput(data) {
            if(!data.uuid) return;
            const outputBox = document.getElementById('outputBox');
            
            // 1. تولید لینک Vless
            const vlessLink = \`vless://\${data.uuid}@\${data.clean_ip}:\${data.port}?path=\${encodeURIComponent(data.path)}&security=tls&encryption=none&insecure=0&host=\${host}&fp=chrome&type=ws&allowInsecure=0&sni=\${host}#\${data.name}\`;
            document.getElementById('vlessOutput').textContent = vlessLink;

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
                },
                "policy": {
                    "levels": {
                        "0": {
                            "connIdle": 300,
                            "handshake": 4,
                            "uplinkOnly": 1,
                            "downlinkOnly": 1
                        }
                    },
                    "system": {
                        "statsOutboundUplink": true,
                        "statsOutboundDownlink": true
                    }
                },
                "stats": {}
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

        window.onload = loadSettings;
    </script>
</body>
</html>
`;

// ==========================================
// 3. CORE PROXY (VLESS) & PROXY-IP BYPASS
// ==========================================

function extractUUIDFromVless(data) {
    if (data.byteLength < 17) return null;
    const hex = [...data.slice(1, 17)].map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;
}

async function connectTCP(addr, port, proxyIP) {
    try {
        const socket = connect({ hostname: addr, port });
        await socket.opened;
        return socket;
    } catch (e) {
        if (proxyIP) {
            const proxySocket = connect({ hostname: proxyIP, port });
            await proxySocket.opened;
            return proxySocket;
        }
        throw new Error('TCP Connect failed');
    }
}

async function handleVLESS(request, env) {
    const WS套接字对 = new WebSocketPair();
    const [clientSock, serverSock] = Object.values(WS套接字对);
    serverSock.accept();
    serverSock.binaryType = 'arraybuffer';
    
    let remoteSocket = null;
    let reqUUID = null;
    let isHeaderParsed = false;
    let chunkBuffer = new Uint8Array(0);

    let storedData = await env.TERIAK_KV.get("settings", "json");
    if (!storedData) storedData = DEFAULT_SETTINGS;
    
    const validUUID = storedData.uuid;
    const proxyIP = storedData.proxy_ip;

    serverSock.addEventListener('message', async (event) => {
        const chunk = new Uint8Array(event.data);
        
        if (!isHeaderParsed) {
            chunkBuffer = new Uint8Array([...chunkBuffer, ...chunk]);
            if (chunkBuffer.byteLength < 24) return;
            
            reqUUID = extractUUIDFromVless(chunkBuffer);
            if (!reqUUID) {
                serverSock.close(); 
                return;
            }

            if (reqUUID !== validUUID) {
                serverSock.close(); 
                return;
            }

            isHeaderParsed = true;

            try {
                let offset = 17; 
                const optLen = chunkBuffer[offset++];
                offset += optLen;
                const cmd = chunkBuffer[offset++];
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
                
                remoteSocket = await connectTCP(addr, port, proxyIP);
                const writer = remoteSocket.writable.getWriter();
                await writer.write(rawData);
                writer.releaseLock();
                
                serverSock.send(new Uint8Array([chunkBuffer[0], 0]));
                
                remoteSocket.readable.pipeTo(new WritableStream({
                    write(data) { serverSock.send(data); },
                    close() { serverSock.close(); }
                }));

            } catch (e) {
                serverSock.close();
            }
            return;
        }

        if (remoteSocket && remoteSocket.writable) {
            const writer = remoteSocket.writable.getWriter();
            await writer.write(chunk);
            writer.releaseLock();
        }
    });

    serverSock.addEventListener('close', () => {
        if (remoteSocket) {
            try { remoteSocket.close(); } catch (e) {}
        }
    });

    return new Response(null, { status: 101, webSocket: clientSock });
}

// ==========================================
// 4. MAIN ROUTER
// ==========================================
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const upgradeHeader = (request.headers.get('Upgrade') || '').toLowerCase();
        
        if (upgradeHeader === 'websocket') {
            return handleVLESS(request, env);
        }

        if (url.pathname === '/panel') {
            return new Response(getHtmlPage(), {
                status: 200,
                headers: { 'Content-Type': 'text/html; charset=UTF-8' }
            });
        }
        
        if (url.pathname === '/panel/api') {
            if (request.method === 'GET') {
                let data = await env.TERIAK_KV.get("settings", "json");
                if (!data) {
                    data = DEFAULT_SETTINGS;
                    data.uuid = crypto.randomUUID(); 
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
