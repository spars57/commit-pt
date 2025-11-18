import { createCommand } from '#base';
import { db } from '#database';
import { menus } from '#menus';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ApplicationIntegrationType,
  inlineCode,
  InteractionContextType,
  MessageFlags,
} from 'discord.js';

// autocomplete helper
async function panelAutocomplete(interaction: any) {
  const guildId = interaction.guild?.id;
  if (!guildId) return [];
  const q = await db.reactionRolePanel.find({ guildId }).limit(25).exec();
  return q.map((p) => ({
    name: p.title ?? String(p._id),
    value: String(p._id),
  }));
}

createCommand({
  name: 'reaction-role',
  description: 'reactionRole module',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.Guild],
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
  global: false,
  options: [
    {
      name: 'create',
      description: 'Create a reaction role panel',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'name',
          description: 'Name of the reaction role panel',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: 'edit',
      description: 'Edit an existing panel',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'panel',
          description: 'Select panel to edit',
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: panelAutocomplete,
        },
      ],
    },
    {
      name: 'send',
      description: 'Send an existing panel to the current channel',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'panel',
          description: 'Select panel to send',
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: panelAutocomplete,
        },
      ],
    },
  ],
  //defaultMemberPermissions: [PermissionFlagsBits.ManageRoles],
  async run(interaction) {
    const { options, user, guild } = interaction;

    if (interaction.user.id !== '629734543867379732') return;
    if (!guild) return;

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    switch (options.getSubcommand()) {
      case 'create': {
        await interaction.editReply(
          await menus.reactionPanel.config.create(user, guild, options.getString('name', true))
        );

        return;
      }

      case 'edit': {
        const panelId = options.getString('panel', true);
        const panel = await db.reactionRolePanel.findById(panelId);

        if (!panel) {
          await interaction.editReply({
            content: `Painel com o ID ${inlineCode(panelId)} não encontrado.`,
          });
          return;
        }

        await interaction.editReply(
          await menus.reactionPanel.config.create(user, guild, panel.title)
        );
        return;
      }
    }
  },
});
