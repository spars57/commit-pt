import { createResponder, ResponderType } from '#base';
import { db } from '#database';
import { menus } from '#menus';
import { brBuilder, hexToRgb } from '@magicyan/discord';
import { ChannelType, ComponentType, ContainerBuilder, inlineCode, MessageFlags, ModalBuilder, TextInputStyle } from 'discord.js';

createResponder({
  customId: 'rr/:option/:params/:title',
  types: [ResponderType.Button, ResponderType.ChannelSelect, ResponderType.ModalComponent],
  cache: 'cached',
  async run(interaction, { option, params, title }) {
    switch (option) {
      case 'create': {
        switch (params) {
          case 'select_channel': {
            const selectChannelContainer = new ContainerBuilder({
              components: [
                {
                  type: ComponentType.TextDisplay,
                  content: '# Seleciona um canal',
                },
                {
                  type: ComponentType.ActionRow,
                  components: [
                    {
                      type: ComponentType.ChannelSelect,
                      custom_id: `rr/create/selectChannelComponent/${title}`,
                      min_values: 1,
                      max_values: 1,
                      channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
                    },
                  ],
                },
              ],
            });

            interaction.update({
              components: [selectChannelContainer],
              flags: [MessageFlags.IsComponentsV2],
            });

            return;
          }

          case 'selectChannelComponent': {
            if (!interaction.isChannelSelectMenu()) return;

            const channelId = interaction.values[0];
            const reactionPanel = await db.reactionRolePanel.findByTitle(title);

            const errorContainer = new ContainerBuilder({
              accent_color: hexToRgb(constants.colors.danger),
            });

            if (!reactionPanel) {
              errorContainer.addTextDisplayComponents({
                type: ComponentType.TextDisplay,
                content: brBuilder(
                  `# Erro ao selecionar canal`,
                  '',
                  '',
                  `Painel de reação com o título ${inlineCode(title)} não encontrado.`
                ),
              });
              return;
            }

            reactionPanel.channelId = channelId;
            await reactionPanel.save();

            interaction.update(
              await menus.reactionPanel.config.create(interaction.user, interaction.guild!, title)
            );
            return;
          }

          case 'config': {
            interaction.update(await menus.reactionPanel.config.config(interaction.guild!, title));
            return;
          }

          case 'delete': {
            const reactionPanel = await db.reactionRolePanel.findByTitle(title);
            if (!reactionPanel) {
              const errorContainer = new ContainerBuilder({
                accent_color: hexToRgb(constants.colors.danger),
                components: [
                  {
                    type: ComponentType.TextDisplay,
                    content: brBuilder(
                      `# Erro ao apagar painel de reação`,
                      '',
                      '',
                      `Painel de reação com o título ${inlineCode(title)} não encontrado.`
                    ),
                  },
                ],
              });
              await interaction.update({
                components: [errorContainer],
              });
              return;
            }

            await reactionPanel.deleteOne();

            const confirmContainer = new ContainerBuilder({
              accent_color: hexToRgb(constants.colors.success),
              components: [
                {
                  type: ComponentType.TextDisplay,
                  content: brBuilder(
                    `# Painel de reação apagado com sucesso`,
                    '',
                    `O painel de reação com o título ${inlineCode(title)} foi apagado.`
                  ),
                },
              ],
            });

            await interaction.update({
              components: [confirmContainer],
            });
            return;
          }
        }

        return;
      }

      case 'config': {
        switch (params) {
          case 'back': {
            if (!interaction.isButton()) return;
            interaction.update(await menus.reactionPanel.config.create(interaction.user, interaction.guild!, title));
            return;
          }
          case 'toggle_exclusive': {
            if (!interaction.isButton()) return;
            let panel = await db.reactionRolePanel.findByTitle(title);
            if (!panel) {
              const errorContainer = new ContainerBuilder({
                accent_color: hexToRgb(constants.colors.danger),
                components: [
                  {
                    type: ComponentType.TextDisplay,
                    content: brBuilder(
                      `# Erro ao alterar configuração`,
                      '',
                      '',
                      `Painel de reação com o título ${inlineCode(title)} não encontrado.`
                    ),
                  },
                ],
              });
              await interaction.update({
                components: [errorContainer],
              });
              return;
            }

            panel.mutuallyExclusive = !panel.mutuallyExclusive;
            await panel.save();

            interaction.update(
              await menus.reactionPanel.config.config(interaction.guild!, title)
            );
            return;
          }
          case 'change_content': {
            if (!interaction.isButton()) return;
            
            const changeContentModal = new ModalBuilder({
              custom_id: `rr/config/changeContentModal/${title}`,
              title: 'Editar mensagem do painel de reação',
              components: [
                {
                  type: ComponentType.ActionRow,
                  components: [
                    {
                      type: ComponentType.TextInput,
                      custom_id: 'contentInput',
                      label: 'Mensagem do painel',
                      style: TextInputStyle.Paragraph,
                      required: true,
                      min_length: 0,
                      max_length: 2000,
                      placeholder: 'Escreve/edita a mensagem para o painel de reação',
                      value: (await db.reactionRolePanel.findByTitle(title))?.content || '',
                    },
                  ],
                },
              ],
            });

            await interaction.showModal(changeContentModal);

            return;
          }
          case 'changeContentModal': {
            if (!interaction.isModalSubmit()) return;

            const contentInput = interaction.fields.getTextInputValue('contentInput');
            let panel = await db.reactionRolePanel.findByTitle(title);
            if (!panel) {
              const errorContainer = new ContainerBuilder({
                accent_color: hexToRgb(constants.colors.danger),
                components: [
                  {
                    type: ComponentType.TextDisplay,
                    content: brBuilder(
                      `# Erro ao alterar mensagem`,
                      '',
                      '',
                      `Painel de reação com o título ${inlineCode(title)} não encontrado.`
                    ),
                  },
                ],
              });
              await interaction.update({
                components: [errorContainer],
              });
              return;
            }

            panel.content = contentInput;
            await panel.save();

            await interaction.update(
              await menus.reactionPanel.config.config(interaction.guild!, title)
            );
            return;
          }
          case 'addMap': {
            if (!interaction.isButton()) return;
            
            const addMapModal = new ModalBuilder({
              custom_id: `rr/config/addMapModal/${title}`,
              title: 'Adicionar mapeamento de reação',
              components: [
                {
                  type: ComponentType.ActionRow,
                  components: [
                    {
                      type: ComponentType.TextInput,
                      custom_id: 'emojiInput',
                      label: 'Emoji',
                      style: TextInputStyle.Short,
                      required: true,
                      min_length: 1,
                      max_length: 200,
                      placeholder: 'Coloca o emoji para o react',
                    },
                  ],
                },
                {
                  type: ComponentType.ActionRow,
                  components: [
                    {
                      type: ComponentType.TextInput,
                      custom_id: 'roleInput',
                      label: 'ID do cargo',
                      style: TextInputStyle.Short,
                      required: true,
                      min_length: 1,
                      max_length: 200,
                      placeholder: 'Coloca o ID do cargo para o role',
                    },
                  ],
                },
              ],
            });

            await interaction.showModal(addMapModal); 

            return;
          }
          case 'addMapModal': {
            if (!interaction.isModalSubmit()) return;

            const emojiInput = interaction.fields.getTextInputValue('emojiInput');
            const roleInput = interaction.fields.getTextInputValue('roleInput');
            let panel = await db.reactionRolePanel.findByTitle(title);
            if (!panel) {
              const errorContainer = new ContainerBuilder({
                accent_color: hexToRgb(constants.colors.danger),
                components: [
                  {
                    type: ComponentType.TextDisplay,
                    content: brBuilder(
                      `# Erro ao adicionar mapeamento`,
                      '',
                      '',
                      `Painel de reação com o título ${inlineCode(title)} não encontrado.`
                    ),
                  },
                ],
              });
              await interaction.update({
                components: [errorContainer],
              });
              return;
            }

            panel.mappings.push({ emojiKey: emojiInput, roleId: roleInput });
            await panel.save();

            await interaction.update(
              await menus.reactionPanel.config.config(interaction.guild!, title)
            );
            return;
          }
        }
        return;
      }
    }
  },
});
