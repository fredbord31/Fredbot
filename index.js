const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

const db = { users: {} };

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "110.0.5481.178"], 
        printQRInTerminal: false,
        connectTimeoutMs: 90000, 
        keepAliveIntervalMs: 30000
    });

    if (!sock.authState.creds.registered) {
        // Tu número configurado correctamente
        const num = "393927483420"; 
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(num);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log('\n' + '═'.repeat(30));
                console.log(`👉 TU CÓDIGO ES: ${code}`);
                console.log('═'.repeat(30));
                console.log('Vincúlalo ahora en tu WhatsApp ⏳\n');
            } catch (err) { 
                console.log("❌ Error. Reintenta: node index.js"); 
            }
        }, 6000); 
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (u) => { 
        const { connection, lastDisconnect } = u;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('\n✅ ¡FREDBOT ONLINE! 🐺\n');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const pushName = msg.pushName || "Usuario";
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase();
        const command = text.split(" ")[0];
        const args = text.split(" ").slice(1);

        if (!db.users[from]) db.users[from] = { coins: 100 };

        switch (command) {
            case '#neko':
                await sock.sendMessage(from, { image: { url: 'https://waifu.pics/api/sfw/neko' }, caption: '🐾' });
                break;
            case '#waifu':
                await sock.sendMessage(from, { image: { url: 'https://waifu.pics/api/sfw/waifu' }, caption: '✨' });
                break;
            case '#hug':
                await sock.sendMessage(from, { react: { text: "🫂", key: msg.key } });
                await sock.sendMessage(from, { text: `*${pushName}* envió un abrazo.` });
                break;
            case '#smoke':
                await sock.sendMessage(from, { react: { text: "🚬", key: msg.key } });
                await sock.sendMessage(from, { text: `*${pushName}* fumando... ☁️` });
                break;
            case '#cartera':
                await sock.sendMessage(from, { text: `🏦 *BANCO FREDBOT*\n👤: ${pushName}\n🪙: ${db.users[from].coins} Fredcoins` });
                break;
            case '#ruleta':
                let bet = parseInt(args[0]) || 10;
                if (bet > db.users[from].coins) return sock.sendMessage(from, { text: '❌ Coins insuficientes.' });
                let win = Math.random() > 0.6;
                db.users[from].coins += win ? bet : -bet;
                await sock.sendMessage(from, { text: win ? `✅ +${bet} 🎉` : `💀 -${bet}` });
                break;
            case '#factos':
                const f = ["El que madruga, tiene sueño.", "Fred el lobo manda.", "Maracaibo 030.", "JavaScript es vida."];
                await sock.sendMessage(from, { text: `🗿 *FACTO:* ${f[Math.floor(Math.random() * f.length)]}` });
                break;
            case '#piropo':
                await sock.sendMessage(from, { text: "Si la belleza fuera pecado, no tendrías perdón de Dios. 😉" });
                break;
            case '#menu':
                const menu = `
╔════ 🐺 *FREDBOT 030* ════╗
║  *USUARIO:* ${pushName}
╠═══════════════════════════
║ 🌸 #neko, #waifu, #hug, #smoke
║ 🎮 #cartera, #ruleta
║ 🗿 #factos, #piropo, #ping
╚═══════════════════════════`;
                await sock.sendMessage(from, { text: menu });
                break;
            case '#ping':
                await sock.sendMessage(from, { text: '🚀 ¡Pong!' });
                break;
        }
    });
}

startBot();
