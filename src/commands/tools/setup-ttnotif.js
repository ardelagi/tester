const { SlashCommandBuilder, ChannelType } = require('discord.js');
const ttNotifSchema = require('../../schemas/ttnotif');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-ttnotif')
    .setDescription('Setup notifikasi postingan TikTok')
    .addStringOption(opt =>
      opt.setName('username')
        .setDescription('Username TikTok (tanpa @)')
        .setRequired(true))
    .addChannelOption(opt =>
      opt.setName('target_channel')
        .setDescription('Channel untuk mengirim notifikasi')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)),

  async execute(interaction) {
    const username = interaction.options.getString('username');
    const targetChannel = interaction.options.getChannel('target_channel');

    await ttNotifSchema.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        guildId: interaction.guild.id,
        channelId: targetChannel.id,
        tiktokUsername: username
      },
      { upsert: true }
    );

    await interaction.reply(`✅ Notifikasi TikTok untuk **@${username}** diatur ke ${targetChannel}`);
  }
};