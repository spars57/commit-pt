import { createResponder, ResponderType } from '#base';
import { brBuilder } from '@magicyan/discord';
import {
  ComponentType,
  ContainerBuilder,
  inlineCode,
  MessageFlags,
  PermissionFlagsBits,
} from 'discord.js';

createResponder({
  customId: 'profile/perms/:targetId',
  types: [ResponderType.Button],
  cache: 'cached',
  async run(interaction, { targetId }) {
    const { guild } = interaction;
    if (!guild) return;

    const requester = await guild.members.fetch(interaction.user.id).catch(() => null);
    const isAdmin = requester?.permissions?.has(PermissionFlagsBits.Administrator) ?? false;

    if (interaction.user.id !== targetId && !isAdmin) {
      await interaction.reply({
        content: 'Seu maroto... deves achar que podes ver as perms de outra pessoa 😛',
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    let member;
    try {
      member = await guild.members.fetch(targetId);
    } catch {
      return;
    }

    // Permissões do membro (array de nomes)
    const perms = member.permissions ? member.permissions.toArray() : [];
    const permsText = perms.length
      ? perms.map((p) => `${inlineCode(p)}`).join(', ')
      : '*Nenhuma permissão*';

    // Cargos do membro, ordenados por posição decrescente, excluindo @everyone (role id == guild.id)
    const roles = member.roles.cache
      .filter((r) => r.id !== guild.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => `${r.toString()}`);
    const rolesText = roles.length ? roles.join(', ') : '*Sem cargos*';

    const permsContainer = new ContainerBuilder({
      components: [
        {
          type: ComponentType.TextDisplay,
          content: brBuilder(
            `# Permissões do Membro`,
            ``,
            `**Permissões:**`,
            permsText,
            ``,
            `**Cargos:**`,
            rolesText
          ),
        },
      ],
    });

    await interaction.reply({
      components: [permsContainer],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
    });
  },
});
