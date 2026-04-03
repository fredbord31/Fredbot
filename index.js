const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, jidDecode } = require('@whiskeysockets/baileys');
const pino = require('pino');

// Base de datos temporal
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
        connectTimeoutMs: 120000,
        keepAliveIntervalMs: 30000
    });

    // --- VINCULACIÓN POR CÓDIGO ---
    if (!sock.authState.creds.registered) {
        const num = "393927483420"; 
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(num);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log('\n' + '═'.repeat(30));
                console.log(`👉 TU CÓDIGO ES: ${code}`);
                console.log('═'.repeat(30));
                console.log('Vincúlalo en tu WhatsApp ⏳\n');
            } catch (err) { 
                console.log("❌ Error al generar código."); 
            }
        }, 10000); 
    }

    sock.ev.on('creds.update', saveCreds);

    // --- EVENTOS DE GRUPO (BIENVENIDA Y DESPEDIDA) ---
    sock.ev.on('group-participants.update', async (anu) => {
        const { id, participants, action } = anu;
        for (let num of participants) {
            let user = num.split('@')[0];
            if (action === 'add') {
                await sock.sendMessage(id, { 
                    text: `👋 ¡Hola @${user}!\n\n*Bienvenido a este maravilloso lugar de estar.* 🎉\n\nDisfruta tu estancia en el grupo. Soy *Fredbot*, creado por Fred el lobo.`,
                    mentions: [num]
                });
            } else if (action === 'remove') {
                await sock.sendMessage(id, { 
                    text: `👋 ¡Adiós @${user}!\n\nEsperamos que vuelvas pronto. 🐺030`,
                    mentions: [num]
                });
            }
        }
    });

    sock.ev.on('connection.update', (u) => { 
        const { connection, lastDisconnect } = u;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('\n✅ ¡FREDBOT ONLINE! 🐺030\n');
        }
    });

    // --- COMANDOS ---
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const pushName = msg.pushName || "Usuario";
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase();
        const command = text.split(" ")[0];

        if (!db.users[from]) db.users[from] = { coins: 100 };

        switch (command) {
            case '#menu':
                const menu = `
╔════ 🐺 *FREDBOT* ════╗
║  *CREADOR:* Fred el lobo
║  *NÚMERO:* +39 392 748 3420
╠═══════════════════════
║ ✨ *COMANDOS*
║ #neko, #waifu, #hug
║ #cartera, #factos, #ping
║
║ 🗿 *CRÉDITOS*
║ Fred el lobo 030
╚═══════════════════════`;
                await sock.sendMessage(from, { text: menu });
                break;

            case '#neko':
                await sock.sendMessage(from, { image: { url: 'https://waifu.pics/api/sfw/neko' }, caption: '🐾' });
                break;

            case '#cartera':
                await sock.sendMessage(from, { text: `🏦 *BANCO FREDBOT*\n👤: ${pushName}\n🪙: ${db.users[from].coins} Fredcoins` });
                break;

            case '#factos':
                const f = ["Fred el lobo manda.", "030 es la clave.", "Maracaibo en la casa."];
                await sock.sendMessage(from, { text: `🗿 *FACTO:* ${f[Math.floor(Math.random() * f.length)]}` });
                break;

            case '#ping':
                await sock.sendMessage(from, { text: '🚀 ¡Pong! Fredbot está activo.' });
                break;
        }
    });
}

startBot();
