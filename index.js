'use strict';

const makeWASocket = require('@whiskeysockets/baileys').default;
const {fetchLatestBaileysVersion} = require('@whiskeysockets/baileys');

async function startWhatsAppBot() {
    const {version} = await fetchLatestBaileysVersion();
    const sock = makeWASocket({version});

    sock.ev.on('connection.update', (update) => {
        const {connection, lastDisconnect} = update;
        if(connection === 'open') {
            console.log('WhatsApp bot connected!');
        } else if(connection === 'close') {
            console.log('Connection closed: ', lastDisconnect.error);
            // Handle reconnection logic here if needed
        }
    });

    sock.ev.on('creds.update', () => {
        // Save credentials for future use
    });

    // QR Code scanning for authentication
    sock.ev.on('qr', (qr) => {
        console.log('Scan this QR code to authenticate:', qr);
        // You can use a library like qrcode-terminal to display the QR code in the terminal
    });
}

startWhatsAppBot();
