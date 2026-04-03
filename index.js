const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.0.4"]
    });

    if (!sock.authState.creds.registered) {
        const num = "393927483420"; 
        setTimeout(async () => {
            let code = await sock.requestPairingCode(num);
            console.log(`\n\n👉 TU CÓDIGO ES: ${code}\n\n`);
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        
        if (text === 'hola') {
            await sock.sendMessage(msg.key.remoteJid, { text: '¡Fredbot activo! 🐺' });
        }
    });
}

startBot();
