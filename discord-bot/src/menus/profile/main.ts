import { brBuilder } from '@magicyan/discord';
import {
  ComponentType,
  ContainerBuilder,
  Guild,
  inlineCode,
  InteractionReplyOptions,
  MediaGalleryBuilder,
  MessageFlags,
  time,
  User,
} from 'discord.js';

export async function profileMainMenu<R>(user: User, guild: Guild): Promise<R> {
  // Coloco o '!' porque já verifico no proprio comando (src/discord/commands/public/profile.ts) antes de enviar este menú
  const member = guild.members.cache.get(user.id)!;
  await member.fetch(); // Para garantir que o membro está carregado, geralmente sem isto o bot não consegue ver o banner do usuário

  const bannerURL = member.displayBannerURL({ size: 4096, extension: 'png' });

  const rolesList = member.roles.cache
    .filter((role) => role.id !== guild.id) // Filtra o @everyone
    .map((role) => role.toString())
    .join(', ');

  const profileContainer = new ContainerBuilder({
    components: [
      {
        type: ComponentType.Section,
        components: [
          {
            type: ComponentType.TextDisplay,
            content: brBuilder(
              `# Perfil de ${member} (@${member.user.username})`,
              `**ID:** ${inlineCode(member!.id)}`,
              `**Entrou no servidor em:** ${time(Math.floor(member.joinedTimestamp! / 1000), 'R')}`,
              '**Cargos:**',
              `${rolesList || '-# *Nenhum*'}`
            ),
          },
        ],
        accessory: {
          type: ComponentType.Thumbnail,
          media: {
            url: user.displayAvatarURL({
              size: 256,
              extension: 'png',
            }),
          },
        },
      },
    ],
  });

  if (bannerURL) {
    const mediaGalleryContainer = new MediaGalleryBuilder().addItems((item) =>
      item.setURL(bannerURL).setDescription(`${member.user.username} banner`)
    );
    profileContainer.addMediaGalleryComponents(mediaGalleryContainer);
  }

  return {
    components: [profileContainer],
    flags: [MessageFlags.IsComponentsV2],
    allowedMentions: {
      repliedUser: false,
      roles: [],
      users: [],
      parse: [],
    },
  } satisfies InteractionReplyOptions as R;
}
