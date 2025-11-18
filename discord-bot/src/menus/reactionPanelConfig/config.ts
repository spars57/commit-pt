import { db } from '#database';
import { brBuilder, hexToRgb } from '@magicyan/discord';
import {
  ComponentType,
  ContainerBuilder,
  Guild,
  inlineCode,
  MessageFlags,
  type InteractionReplyOptions,
} from 'discord.js';

export async function reactionPanelConfig_ConfigMenu<R>(guild: Guild, title: string): Promise<R> {
  let panel = await db.reactionRolePanel.findByTitle(title);

  if (!panel) {
    const panelNotFoundContainer = new ContainerBuilder({
      accent_color: hexToRgb(constants.colors.danger),
      components: [
        {
          type: ComponentType.TextDisplay,
          content: brBuilder(
            `# Erro ao criar painel de reação`,
            '',
            `Já existe um painel com o título ${inlineCode(title)} neste servidor. Escolha outro título.`
          ),
        },
      ],
    });

    return {
      components: [panelNotFoundContainer],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
    } satisfies InteractionReplyOptions as R;
  }

  const configContainer = new ContainerBuilder({
    accent_color: hexToRgb(constants.colors.primary),
    components: [
      {
        type: ComponentType.Section,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: brBuilder('Em desenvolvimento...'),
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

  return {
    components: [configContainer],
    flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
  } satisfies InteractionReplyOptions as R;
}
