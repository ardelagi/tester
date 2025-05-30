const Parser = require('rss-parser');
const parser = new Parser();
const ttNotifSchema = require('../../schemas/ttnotif');

module.exports = {
  name: 'ready',
  async execute(client) {
    const checkTikTokFeeds = async () => {
      const configs = await ttNotifSchema.find();

      for (const config of configs) {
        try {
          const rssUrl = `https://rsshub.app/tiktok/user/${config.tiktokUsername}`;
          const feed = await parser.parseURL(rssUrl);
          const latest = feed.items?.[0];

          if (!latest || latest.id === config.lastPostId) continue;

          const channel = await client.channels.fetch(config.channelId).catch(() => null);
          if (!channel || !channel.isTextBased()) continue;

          await channel.send({
            content: `🎵 Postingan baru dari **@${config.tiktokUsername}**:\n${latest.link}`
          });

          config.lastPostId = latest.id;
          await config.save();
        } catch (err) {
          console.error(`[TT Notif] Gagal cek feed @${config.tiktokUsername}:`, err.message);
        }
      }
    };

    setInterval(checkTikTokFeeds, 5 * 60 * 1000); // 5 menit sekali
  }
};