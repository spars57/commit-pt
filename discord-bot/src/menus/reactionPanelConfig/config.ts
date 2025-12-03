import { db } from '#database';
import { brBuilder, createRow, hexToRgb } from '@magicyan/discord';
import {
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ContainerBuilder,
  Guild,
  channelMention,
  inlineCode,
  MessageFlags,
  type InteractionReplyOptions,
} from 'discord.js';

export async function reactionPanelConfig_ConfigMenu<R>(guild: Guild, title: string): Promise<R> {
  let panel = await db.reactionRolePanel.findByTitle(title);
  if (!panel) {
    const notFound = new ContainerBuilder({
      accent_color: hexToRgb(constants.colors.danger),
      components: [
        {
          type: ComponentType.TextDisplay,
          content: brBuilder(
            `# Painel não encontrado`,
            '',
            `Painel de reação com o título ${inlineCode(title)} não foi encontrado neste servidor.`
          ),
        },
      ],
    });

    return {
      components: [notFound],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
    } satisfies InteractionReplyOptions as R;
  }

  const header = new ContainerBuilder({
    accent_color: hexToRgb(constants.colors.primary),
    components: [
      {
        type: ComponentType.Section,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: brBuilder(
              `# Configuração do Painel de Reação`,
              '',
              `**Título:** ${inlineCode(panel.title)}`,
              `**Canal:** ${panel.channelId ? channelMention(panel.channelId) : '`Não configurado`'}`,
              `**Exclusivo:** ${panel.mutuallyExclusive ? '`Sim`' : '`Não`'}`,
              `**Mapeamentos:** ${panel.mappings?.length ?? 0}`
            ),
          },
        ],
        accessory: {
          type: ComponentType.Thumbnail,
          media: {
            url: guild.iconURL() || '',
          },
        },
      },
    ],
  });

  const contentContainer = new ContainerBuilder({
    accent_color: hexToRgb(constants.colors.success),
    components: [
      {
        type: ComponentType.TextDisplay,
        content: `${panel.content || '*Sem mensagem configurada.*'}`,
      },
    ],
  });

  const mappingsContainer = new ContainerBuilder({
    components: [],
  });

  if (!panel.mappings || panel.mappings.length === 0) {
    mappingsContainer.addTextDisplayComponents({
      type: ComponentType.TextDisplay,
      content: brBuilder('# Mapeamentos', '', '*Nenhum mapeamento configurado ainda.*'),
    });
  } else {
    // Build a textual list of mappings
    const lines: string[] = ['# Mapeamentos', ''];
    for (let i = 0; i < panel.mappings.length; i++) {
      const m = panel.mappings[i];
      const role = guild.roles.cache.get(m.roleId);
      const roleLabel = role ? role.toString() : inlineCode(m.roleId);
      lines.push(
        `${i + 1}. ${m.emojiKey} → ${roleLabel}`
      );
    }

    mappingsContainer.addTextDisplayComponents({
      type: ComponentType.TextDisplay,
      content: brBuilder(...lines),
    });
  }

  const mainRow = createRow(
    new ButtonBuilder({
      customId: `rr/config/addMap/${title}`,
      label: 'Adicionar Mapeamento',
      style: ButtonStyle.Primary,
    }),
    new ButtonBuilder({
      customId: `rr/config/editMap/${title}`,
      label: 'Editar Mapeamento',
      style: ButtonStyle.Secondary,
    }),
    new ButtonBuilder({
      customId: `rr/config/removeMap/${title}`,
      label: 'Remover Mapeamento',
      style: ButtonStyle.Danger,
    }),
    new ButtonBuilder({
      customId: `rr/config/toggle_exclusive/${title}`,
      label: panel.mutuallyExclusive ? 'Exclusivo: ON' : 'Exclusivo: OFF',
      style: panel.mutuallyExclusive ? ButtonStyle.Success : ButtonStyle.Secondary,
    }),
    new ButtonBuilder({
      customId: `rr/config/change_content/${title}`,
      label: 'Editar mensagem',
      style: ButtonStyle.Primary,
    }),
  );

  const actionRow = createRow(
    new ButtonBuilder({
      customId: `rr/config/publish/${title}`,
      label: 'Publicar',
      style: ButtonStyle.Success,
    }),
    new ButtonBuilder({
      customId: `rr/config/back/${title}`,
      label: 'Voltar',
      style: ButtonStyle.Secondary,
    })
  );

  return {
    components: [header, contentContainer, mappingsContainer, mainRow, actionRow],
    flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
  } satisfies InteractionReplyOptions as R;
}
