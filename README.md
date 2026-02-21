# 24/7 Nganggur

A Discord selfbot that:
1. **Keeps voice channel timestamp running** - Auto-joins voice channel with auto-reconnect
2. **Sends daily Ramadan meme reminders** - Generates and sends motivational fasting memes on schedule

![Preview](.docs/Screenshot%202026-02-21%20at%2004.41.39.png)

## Features

- 🎙️ Auto-join voice channel with auto-reconnect
- 🖼️ Auto-generate memes with fasting day counter
- ⏰ Flexible scheduling using cron expressions
- 🌏 Timezone support (default: Asia/Jakarta)
- 🔇 Configurable self-mute and self-deaf

## Prerequisites

- Node.js v18+
- pnpm (or npm/yarn)

## Installation

1. Clone this repository
```bash
git clone https://git.fdvky.me/Fd/rtrt.git
cd rtrt
```

2. Install dependencies
```bash
pnpm install
```

3. Create `.env` file:
```env
TOKEN=your_discord_token_here
CHANNEL_ID=your_voice_channel_id
START_DATE=2026-02-28
CRON=0 3 * * *
TZ=Asia/Jakarta
SELF_MUTE=true
SELF_DEAF=false
```

4. Run the bot
```bash
pnpm start
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TOKEN` | Discord account token ([How to get token](https://gist.github.com/MarvNC/e601f3603df22f36ebd3102c501116c6)) | `MTIz...` |
| `CHANNEL_ID` | Target voice/text channel ID | `123456789012345678` |
| `START_DATE` | Ramadan start date (ISO format) | `2026-02-28` |
| `CRON` | Meme sending schedule (cron expression) | `0 3 * * *` (daily at 3 AM) |
| `TZ` | Timezone | `Asia/Jakarta` |
| `SELF_MUTE` | Mute microphone when joining VC | `true` / `false` |
| `SELF_DEAF` | Deafen audio when joining VC | `true` / `false` |

## Cron Expression

Format: `minute hour day month weekday`

Examples:
- `0 3 * * *` - Daily at 03:00
- `30 4 * * *` - Daily at 04:30
- `0 */6 * * *` - Every 6 hours

## Docker

```bash
docker build -t rtrt .
docker run -d --env-file .env rtrt
```

## Project Structure

```
RTRT/
├── index.js          # Entry point & Discord client
├── meme.js           # Meme generator using canvas
├── assets/
│   ├── fonts/        # Impact font for memes
│   └── images/       # Meme image templates
├── Dockerfile
├── package.json
└── .env
```

## How It Works

1. Bot logs in using Discord token and joins the specified voice channel
2. On each cron schedule:
   - Calculates the fasting day number from `START_DATE`
   - Generates meme with "SEMANGAT PUASA HARI KE-X" text
   - Sends meme to the specified channel

## ⚠️ Disclaimer

Selfbots violate Discord ToS. Use at your own risk. This bot is made for educational purposes and internal communities.

## License

MIT
