import "dotenv/config";
import cron from "node-cron";
import { Client } from 'discord.js-selfbot-v13';
import { joinVoiceChannel } from "@discordjs/voice";
import { DateTime } from "luxon";
import generateMeme from "./meme.js";

const TOKEN = process.env.TOKEN;
const channelId = process.env.CHANNEL_ID;
const TIMEZONE = process.env.TZ || "Asia/Jakarta";

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

const joinVoice = async (client, channelId, config) => {
    try {
        const channel = await client.channels.fetch(channelId).catch(() => null);
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: config.selfDeaf || false,
            selfMute: config.selfMute || false, // Use selfMute from config
        });

        connection.on('error', error => {
            console.error(`[${client.user.username}] Error voice connection: ${error}`);
            setTimeout(() => joinVoice(client, channelId, config), 10000);
        });
        
        connection.on('disconnect', () => {
            console.log(`[${client.user.username}] Voice connection terputus. Mencoba terhubung kembali...`);
            setTimeout(() => joinVoice(client, channelId, config), 10000);
        });
    } catch(e) {
        console.error(`[${client.user.username}] Failed to join voice channel: ${e}`);
        setTimeout(() => joinVoice(client, channelId, config), 10000);
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