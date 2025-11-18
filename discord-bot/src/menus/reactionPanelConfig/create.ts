import { db } from '#database';
import { brBuilder, createRow, hexToRgb } from '@magicyan/discord';
import {
  ButtonBuilder,
  ButtonStyle,
  channelMention,
  codeBlock,
  ComponentType,
  ContainerBuilder,
  Guild,
  inlineCode,
  MessageFlags,
  User,
  type InteractionReplyOptions,
} from 'discord.js';

export async function reactionPanelConfig_CreateMenu<R>(
  user: User,
  guild: Guild,
  title: string
): Promise<R> {
  let panel = await db.reactionRolePanel.findByTitle(title);

  if (!panel) {
    try {
      panel = await db.reactionRolePanel.createPanel(guild.id, title, user.id);
    } catch (err) {
      const errorContainer = new ContainerBuilder({
        accent_color: hexToRgb(constants.colors.danger),
      });

      const error = err as Error & { code?: string };

      if (error?.code === 'PANEL_TITLE_EXISTS') {
        errorContainer.addTextDisplayComponents({
          type: ComponentType.TextDisplay,
          content: brBuilder(
            `# Erro ao criar painel de reação`,
            '',
            `Já existe um painel com o título ${inlineCode(title)} neste servidor. Escolha outro título.`
          ),
        });

        return {
          components: [errorContainer],
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        } satisfies InteractionReplyOptions as R;
      } else {
        errorContainer.addTextDisplayComponents({
          type: ComponentType.TextDisplay,
          content: brBuilder(
            `# ⚠️ Erro inesperado ao criar painel de reação`,
            '',
            `${codeBlock('ascii', error?.message || String(error))}`
          ),
        });
      }

      // Re-throw para que erros inesperados sejam tratados mais acima
      throw error;
    }
  }

  const createMenuContainer = new ContainerBuilder({
    components: [
      {
        type: ComponentType.TextDisplay,
        content: brBuilder(
          `# Configuração do Painel de Reação`,
          '',
          `**Título:** ${inlineCode(panel.title)}`,
          `**Canal:** ${
            panel?.channelId ? `${channelMention(panel.channelId)}` : '`Não configurado`'
          }`,
          '',
          'Use os botões abaixo para selecionar o canal, configurar o painel (título/conteúdo) ou enviar o painel ao canal selecionado.'
        ),
      },
    ],
  });

  const buttonsRow = createRow(
    new ButtonBuilder({
      customId: `rr/create/select_channel/${title}`,
      label: 'Selecionar Canal',
      style: ButtonStyle.Primary,
    }),
    new ButtonBuilder({
      customId: `rr/create/config/${title}`,
      label: 'Configurar Painel',
      style: ButtonStyle.Secondary,
    }),
    new ButtonBuilder({
      customId: `rr/create/send/${title}`,
      label: 'Enviar',
      style: ButtonStyle.Success,
    })
  );

  // Em um row separado apenas para para estética visual (ele fica na linha de baixo)
  const deleteRow = createRow(
    new ButtonBuilder({
      customId: `rr/create/delete/${title}`,
      label: 'Apagar Painel',
      style: ButtonStyle.Danger,
    })
  );

  return {
    components: [createMenuContainer, buttonsRow, deleteRow],
    flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
  } satisfies InteractionReplyOptions as R;
}
