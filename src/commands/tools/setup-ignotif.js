const { SlashCommandBuilder, ChannelType } = require('discord.js');
const igNotifSchema = require('../../schemas/ignotif');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-ignotif')
    .setDescription('Setup notifikasi postingan Instagram')
    .addStringOption(opt =>
      opt.setName('username')
        .setDescription('Username Instagram (tanpa @)')
        .setRequired(true))
    .addChannelOption(opt =>
      opt.setName('target_channel')
        .setDescription('Channel untuk mengirim notifikasi')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)),

  async execute(interaction) {
    const username = interaction.options.getString('username');
    const targetChannel = interaction.options.getChannel('target_channel');

    await igNotifSchema.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        guildId: interaction.guild.id,
        channelId: targetChannel.id,
        instagramUsername: username
      },
      { upsert: true }
    );

    await interaction.reply(`✅ Notifikasi Instagram untuk **@${username}** diatur ke ${targetChannel}`);
  }
};