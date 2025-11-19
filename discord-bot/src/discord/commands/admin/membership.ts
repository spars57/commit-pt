import { createCommand } from '#base';
import { db } from '#database';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ApplicationIntegrationType,
  inlineCode,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
} from 'discord.js';

createCommand({
  name: 'membership',
  description: 'Gerir memberships persistentes de utilizadores',
  type: ApplicationCommandType.ChatInput,
  contexts: [InteractionContextType.Guild],
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
  global: false,
  defaultMemberPermissions: [PermissionFlagsBits.Administrator],
  options: [
    {
      name: 'add',
      description: 'Adicionar roles persistentes a um utilizador',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'user',
          description: 'Utilizador a quem atribuir os roles',
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: 'role',
          description: 'Role a atribuir',
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
      ],
    },
    {
      name: 'remove',
      description: 'Remover roles persistentes de um utilizador',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'user',
          description: 'Utilizador de quem remover os roles',
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: 'role',
          description: 'Role a remover',
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
      ],
    },
    {
      name: 'list',
      description: 'Listar roles persistentes de um utilizador',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'user',
          description: 'Utilizador a verificar',
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
    },
  ],
  async run(interaction) {
    const { options, guild } = interaction;

    if (!guild) return;

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const targetUser = options.getUser('user', true);
    const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);

    if (!targetMember) {
      await interaction.editReply({
        content: `❌ Não foi possível encontrar o membro ${inlineCode(targetUser.tag)} no servidor.`,
      });
      return;
    }

    const memberDoc = await db.members.get({
      id: targetUser.id,
      guild: { id: guild.id },
    });

    switch (options.getSubcommand()) {
      case 'add': {
        const role = options.getRole('role', true);

        if (memberDoc.persistentRoles.includes(role.id)) {
          await interaction.editReply({
            content: `ℹ️ O role ${role.toString()} já está atribuído como persistente a ${targetUser.toString()}.`,
          });
          return;
        }

        memberDoc.persistentRoles.push(role.id);
        await memberDoc.save();

        if (!targetMember.roles.cache.has(role.id)) {
          await targetMember.roles.add(role).catch(() => null);
        }

        await interaction.editReply({
          content: `✅ Role persistente ${role.toString()} adicionado a ${targetUser.toString()}.\n\nO role será restaurado automaticamente se o utilizador sair e voltar ao servidor.`,
        });
        return;
      }

      case 'remove': {
        const role = options.getRole('role', true);

        if (!memberDoc.persistentRoles.includes(role.id)) {
          await interaction.editReply({
            content: `ℹ️ O role ${role.toString()} não está atribuído como persistente a ${targetUser.toString()}.`,
          });
          return;
        }

        memberDoc.persistentRoles = memberDoc.persistentRoles.filter(
          (roleId) => roleId !== role.id
        );
        await memberDoc.save();

        await interaction.editReply({
          content: `✅ Role persistente ${role.toString()} removido de ${targetUser.toString()}.`,
        });
        return;
      }

      case 'list': {
        if (memberDoc.persistentRoles.length === 0) {
          await interaction.editReply({
            content: `ℹ️ ${targetUser.toString()} não tem roles persistentes atribuídos.`,
          });
          return;
        }

        const rolesList = memberDoc.persistentRoles
          .map((roleId) => {
            const role = guild.roles.cache.get(roleId);
            return role ? role.toString() : inlineCode(roleId);
          })
          .join(', ');

        await interaction.editReply({
          content: `📋 Roles persistentes de ${targetUser.toString()}:\n${rolesList}`,
        });
        return;
      }
    }
  },
});
