const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const { LINKING_CODE, CREATOR_NUMBER, CREATOR_NAME } = require('./linkingCode');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['FredBot', 'Safari', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n🔐 ESCANEA ESTE QR:\n');
            qrcode.generate(qr, { small: true });
            console.log('\n📱 Código: ' + LINKING_CODE);
            console.log('📞 Teléfono: ' + CREATOR_NUMBER + '\n');
        }

        if (connection === 'open') {
            console.log('\n✅ ¡FREDBOT CONECTADO!\n');
            console.log('👑 Creador: ' + CREATOR_NAME);
            console.log('⚡ Estado: Listo y servicial\n');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexión cerrada. Reconectando en 5 segundos...');
            if (shouldReconnect) {
                setTimeout(() => startBot(), 5000);
            } else {
                console.log('Sesión finalizada. Borra la carpeta auth_info y escanea de nuevo.');
            }
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const sender = msg.key.remoteJid;

        console.log(`📩 Mensaje: "${text}" de ${sender}`);

        if (text === '#menu') {
            await sock.sendMessage(sender, { text: '¡Buenas! Soy FREDBOT 🤖\n\n📜 COMANDOS:\n#creditos\n#codigo' });
        }
        
        if (text === '#creditos') {
            await sock.sendMessage(sender, { text: `👑 Mi creador el crack: ${CREATOR_NAME}` });
        }
    });
}

startBot();

