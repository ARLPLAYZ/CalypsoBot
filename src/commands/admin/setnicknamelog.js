const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { oneLine } = require('common-tags');

/**
 * Calypso's SetNicknameLog command
 * @extends Command
 */
class SetNicknameLog extends Command {

  /**
   * Creates instance of SetNicknameLog command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setnicknamelog',
      aliases: ['setnnl', 'snnl'],
      usage: 'setnicknamelog <channel mention/ID>',
      description: oneLine`
        Sets the nickname change log text channel for your server. 
        Provide no channel to clear the current \`nickname log\`.
      `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setnicknamelog #bot-log']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message, args) {

    const { client, guild, channel, member, author } = message;
    const none = '`None`';

    const nicknameLogChannelId = client.configs.get(guild.id).nicknameLogChannelId;
    const oldNicknameLogChannel = guild.channels.cache.get(nicknameLogChannelId) || none;

    let nicknameLogChannel;
    if (args.length === 0) nicknameLogChannel = none; // Clear if no args provided
    else nicknameLogChannel = this.getChannelFromMention(message, args[0]) || guild.channels.cache.get(args[0]);

    if (!client.isAllowed(nicknameLogChannel) && nicknameLogChannel != none) {
      return this.sendErrorMessage(
        message,
        this.errorTypes.INVALID_ARG,
        'Please mention an accessible text or announcement channel or provide a valid text or announcement channel ID'
      );
    }

    // Update config
    await client.db.updateConfig(guild.id, 'nicknameLogChannelId', nicknameLogChannel.id || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `Logging`')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`The \`nickname log\` was successfully updated. ${success}`)
      .addField('Nickname Log', `${oldNicknameLogChannel} ➔ ${nicknameLogChannel}`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetNicknameLog;
