import "dotenv/config";
import cron from "node-cron";
import { Client } from 'discord.js-selfbot-v13';
import { joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { DateTime } from "luxon";
import generateMeme from "./meme.js";

const TOKEN = process.env.TOKEN;
const channelId = process.env.CHANNEL_ID;
const TIMEZONE = process.env.TZ || "Asia/Jakarta";
const RECONNECT_DELAY = Number(process.env.RECONNECT_DELAY || 10_000);
const RECONNECT_WINDOW = Number(process.env.RECONNECT_WINDOW || 60_000);

const start = DateTime.fromISO(process.env.START_DATE, { zone: TIMEZONE });

const days = {
    1: "Pertama",
    2: "Kedua",
    3: "Ketiga",
    4: "Keempat",
    5: "Kelima",
    6: "Keenam",
    7: "Ketujuh",
    8: "Kedelapan",
    9: "Kesembilan",
    10: "Kesepuluh",
}


const client = new Client();

const scheduleReconnect = (client, channelId, config, meta) => {
    const reconnectMeta = meta || { startedAt: Date.now() };
    const elapsed = Date.now() - reconnectMeta.startedAt;

    if (elapsed >= RECONNECT_WINDOW) {
        console.error(`[${client.user?.username || 'UNKNOWN'}] Reconnect window (${RECONNECT_WINDOW / 1000}s) exceeded.`);
        return;
    }

    const delay = Math.min(RECONNECT_DELAY, RECONNECT_WINDOW - elapsed);
    console.log(`[${client.user?.username || 'UNKNOWN'}] Scheduling reconnect in ${delay / 1000}s (elapsed ${Math.round(elapsed / 1000)}s).`);
    setTimeout(() => joinVoice(client, channelId, config, reconnectMeta), delay);
};

const joinVoice = async (client, channelId, config, reconnectMeta) => {
    try {
        const channel = await client.channels.fetch(channelId).catch(() => null);
        if (!channel) {
            console.error(`[${client.user?.username || 'UNKNOWN'}] Channel ${channelId} not found.`);
            return scheduleReconnect(client, channelId, config, reconnectMeta);
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: config.selfDeaf || false,
            selfMute: config.selfMute || false, // Use selfMute from config
        });

        connection.on('error', error => {
            console.error(`[${client.user.username}] Error voice connection: ${error}`);
            scheduleReconnect(client, channelId, config);
        });
        
        connection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log(`[${client.user.username}] Voice connection lost. Trying to reconnect....`);
            scheduleReconnect(client, channelId, config);
        });
    } catch(e) {
        console.error(`[${client.user.username}] Failed to join voice channel: ${e}`);
        scheduleReconnect(client, channelId, config, reconnectMeta);
    }
}

client.on('ready', async () => {
    joinVoice(client, channelId, {
        selfDeaf: process.env.SELF_DEAF === "true",
        selfMute: process.env.SELF_MUTE === "true",
    });
});


cron.schedule(process.env.CRON, async () => {
    try {
        console.log("Uploading...")
        // Use luxon for timezone-aware day calculation
        const now = DateTime.now().setZone(TIMEZONE);
        const diff = Math.floor(now.startOf('day').diff(start.startOf('day'), 'days').days) + 1;
        const image = await generateMeme("./assets/images/mr_crab.jpg", "SEMANGAT PUASA HARI " + (days[diff]?.toUpperCase() || "KE-" + diff), "YAA.... HARI " + (days[diff]?.toUpperCase() || "KE-" + diff));
        client.channels.fetch(channelId).then(channel => {
            channel.send({
                files: [{
                    attachment: image,
                    name: now.toFormat('dd-MM-yyyy') + '.jpg'
                }]
            });
        }).catch(console.error);
    }catch(e){
        console.log(e)
    }finally{
        console.log("Done");
    }
}, {
    scheduled: true,
    timezone: TIMEZONE,
});

client.login(TOKEN).then(() => {
    console.log('Logged in as ' + client.user.tag);
});