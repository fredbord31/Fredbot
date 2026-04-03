const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');

const db = { users: {} };

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.0.4"],
        printQRInTerminal: false
    });

    if (!sock.authState.creds.registered) {
        const num = "393927483420";
        // ESPERA DE 1 MINUTO Y MEDIO (90000 ms)
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(num);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log('\n' + '═'.repeat(30));
                console.log(`👉 TU CÓDIGO ES: ${code}`);
                console.log('═'.repeat(30) + '\n');
            } catch (err) { 
                console.log("❌ Error al generar código. Reintenta node index.js"); 
            }
        }, 90000); 
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (u) => { 
        if (u.connection === 'open') console.log('\n✅ ¡FREDBOT ONLINE! 🐺\n'); 
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const pushName = msg.pushName || "Usuario";
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase();
        const command = text.split(" ")[0];
        const args = text.split(" ").slice(1);

        if (!db.users[from]) db.users[from] = { coins: 100, exp: 0, level: 1 };

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
            case '#cartera':
                await sock.sendMessage(from, { text: `🏦 *BANCO FREDBOT*\n\n👤: ${pushName}\n🪙: ${db.users[from].coins}\n📊: ${db.users[from].level}` });
                break;
            case '#ruleta':
                let bet = parseInt(args[0]) || 10;
                if (bet > db.users[from].coins) return sock.sendMessage(from, { text: '❌ Coins insuficientes.' });
                let win = Math.random() > 0.6;
                db.users[from].coins += win ? bet : -bet;
                await sock.sendMessage(from, { text: win ? `✅ +${bet} 🎉` : `💀 -${bet}` });
                break;
            case '#factos':
                const f = ["El que madruga, tiene sueño.", "Fred el lobo manda.", "Maracaibo 030."];
                await sock.sendMessage(from, { text: `🗿 ${f[Math.floor(Math.random() * f.length)]}` });
                break;
            case '#menu':
                const menu = `
╔════ 🐺 *FREDBOT 030* ════╗
║  *USUARIO:* ${pushName}
╠═══════════════════════════
║ #neko, #waifu, #hug
║ #cartera, #ruleta, #factos
║ #menu
╚═══════════════════════════`;
                await sock.sendMessage(from, { text: menu });
                break;
        }
    });
}

startBot();
