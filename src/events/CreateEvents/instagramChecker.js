const Parser = require('rss-parser');
const parser = new Parser();
const igNotifSchema = require('../../schemas/ignotif');

module.exports = {
  name: 'ready',
  async execute(client) {
    const checkInstagramFeeds = async () => {
      const configs = await igNotifSchema.find();

      for (const config of configs) {
        try {
          const rssUrl = `https://rss.app/feeds/${config.instagramUsername}`; // ganti dengan layanan RSS yang kamu pakai
          const feed = await parser.parseURL(rssUrl);
          const latest = feed.items?.[0];

          if (!latest || latest.id === config.lastPostId) continue;

          const channel = await client.channels.fetch(config.channelId).catch(() => null);
          if (!channel || !channel.isTextBased()) continue;

          await channel.send({
            content: `📸 Postingan baru dari **@${config.instagramUsername}**:\n${latest.link}`
          });

          config.lastPostId = latest.id;
          await config.save();
        } catch (err) {
          console.error(`[IG Notif] Gagal cek feed @${config.instagramUsername}:`, err.message);
        }
      }
    };

    // Jalankan tiap 5 menit
    setInterval(checkInstagramFeeds, 5 * 60 * 1000);
  }
};