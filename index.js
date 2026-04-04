const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const moment = require('moment-timezone');
const axios = require('axios');

const db = { users: {} };
const ownerNumber = "393927483420@s.whatsapp.net";

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ["Fredbot", "Chrome", "110.0.5481.178"], 
        printQRInTerminal: false,
    });

    if (!sock.authState.creds.registered) {
        const num = "393927483420"; 
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(num);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log('\n' + '🐺'.repeat(15) + `\n👉 CÓDIGO FRED: ${code}\n` + '🐺'.repeat(15));
            } catch (err) { console.log("❌ Error"); }
        }, 8000); 
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const isOwner = msg.key.remoteJid === ownerNumber || msg.key.participant === ownerNumber;
        const pushName = msg.pushName || "Fred";
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase();
        const command = text.split(" ")[0];

        const hora = moment().tz('Europe/Rome').format('HH:mm:ss');
        const fecha = moment().tz('Europe/Rome').format('D [de] MMMM [de] YYYY');
        const dia = moment().tz('Europe/Rome').format('dddd');

        if (!db.users[from]) db.users[from] = { coins: 100, exp: 95, nivel: 4, ban: false };

        let rango = "Cachorro 🐾";
        if (db.users[from].nivel >= 30) rango = "Lobo Alfa 👺";
        if (isOwner || db.users[from].nivel >= 100) rango = "Lobo Supremo ⚡🌩️";

        switch (command) {
            case '#menu':
                const menu = `
╔══════════════════════╗
   🐺  𝐅𝐑𝐄𝐃𝐁𝐎𝐓 - 𝟎𝟑𝟎  🐺
╚══════════════════════╝

ʙᴜᴇɴᴀs ᴛᴀʀᴅᴇs 🌤️ *@${pushName}*

────────────────
👤 🄸🄽🄵🄾 🄳🄴🄻 🅄🅂🄴🅁
────────────────
👤 𝐔𝐒𝐄𝐑: ${pushName}
💎 𝐍𝐈𝐕𝐄𝐋: ${db.users[from].nivel}
🗿 𝐄𝐗𝐏𝐄𝐑𝐈𝐄𝐍𝐂𝐈𝐀: ${db.users[from].exp}
🥵 𝐑𝐀𝐍𝐆𝐎: ${rango}

────────────────
🤖 🄸🄽🄵🄾 🄳🄴🄻 🄱🄾🅃
────────────────
🥭 𝐎𝐖𝐍𝐄𝐑: Fred (393927483420)
🎧 𝐄𝐒𝐓𝐀𝐃𝐎: LOBO SUPREMO ⚡
🎉 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒: 250+
👥 𝐔𝐒𝐔𝐀𝐑𝐈𝐎𝐒: 43203
⏳ 𝐔𝐏𝐓𝐈𝐌𝐄: Activo

────────────────
⏰ 🄵🄴🄲🄷🄰 🅈 🄷🄾🅁🄰 
────────────────
🕝 𝐇𝐎𝐑𝐀: ${hora}
📅 𝐅𝐄𝐂𝐇𝐀: ${fecha}
🏙️ 𝐃𝐈𝐀: ${dia}
────────────────

╭━━🌕 OWNER SUPREMO 👑━⬣
┃ ➩ #addcoin | #addprem | #addxp
┃ ➩ #autoadmin | #backup | #copia
┃ ➩ #restart | #update | #resetuser
┃ ➩ #setppbot | #prefix | #vaciartmp
╰━🐾〔 🐺 〕🐾━⬣

╭━━🌕 GROUP & MODS 🛡️━⬣
┃ ➩ #abrir | #cerrar | #admins
┃ ➩ #kick | #promote | #demote
┃ ➩ #hidetag | #link | #infogrupo
┃ ➩ #ban | #unban | #block
╰━🐾〔 🐺 〕🐾━⬣

╭━━🌕 RPG & ECONOMY 💰━⬣
┃ ➩ #adventure | #minar | #trabajar
┃ ➩ #cazar | #pescar | #ruleta
┃ ➩ #cofre | #bal | #pay | #rob
┃ ➩ #crimen | #slot | #daily
╰━🐾〔 🐺 〕🐾━⬣

╭━━🌕 GACHA & ANIME 🌸━⬣
┃ ➩ #claim | #rollwaifu | #harem
┃ ➩ #waifu | #loli | #hug | #kiss
┃ ➩ #kill | #slap | #dance | #bite
╰━🐾〔 🐺 〕🐾━⬣

╭━━🌕 DOWNLOADS 📥━⬣
┃ ➩ #ytmp3 | #ytmp4 | #play | #play2
┃ ➩ #tiktok | #fb | #ig | #twitter
┃ ➩ #mediafire | #mega | #apkmod
╰━🐾〔 🐺 〕🐾━⬣

╭━━🌕 IA & SEARCH 🔍━⬣
┃ ➩ #chatgpt | #bard | #gemini
┃ ➩ #dalle | #flux | #ia | #openai
┃ ➩ #google | #wikipedia | #lyrics
╰━🐾〔 🐺 〕🐾━⬣

╭━━🌕 SOCKET & STALK 🔌━⬣
┃ ➩ #public | #self | #salir | #join
┃ ➩ #setpfp | #setbio | #setstatus
┃ ➩ #tiktokstalk | #githubstalk | #gitclone
╰━🐾〔 🐺 〕🐾━⬣

╭━━🌕 TOOLS & CHANNELS ⚙️━⬣
┃ ➩ #hd | #sticker | #toimg | #url
┃ ➩ #ssweb | #translate | #cal
┃ ➩ #nuevafotochannel | #seguircanal
╰━🐾〔 🐺 〕🐾━⬣

╭━━🌕 NSFW 🔞━⬣
┃ ➩ #hentai | #xnxx | #xvideos
┃ ➩ #rule34 | #anal | #pack
╰━🐾〔 🐺 〕🐾━⬣`;
                await sock.sendMessage(from, { text: menu, mentions: [msg.key.participant || from] });
                break;

            case '#autoadmin':
                if (!isOwner) return;
                try {
                    await sock.groupParticipantsUpdate(from, [ownerNumber], "promote");
                    await sock.sendMessage(from, { text: '🌩️ *PODER TOTAL:* Fred ahora es administrador.' });
                } catch (e) {
                    await sock.sendMessage(from, { text: '❌ El bot necesita ser admin primero.' });
                }
                break;

            case '#cheats':
                if (!isOwner) return;
                db.users[from].coins = 999999999;
                db.users[from].nivel = 100;
                await sock.sendMessage(from, { text: '🌩️ *SISTEMA HACKEADO POR EL LOBO*' });
                break;
        }
    });
}

startBot();
