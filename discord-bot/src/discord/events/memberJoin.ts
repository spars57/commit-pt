import { createEvent } from '#base';
import { db } from '#database';
import { Events, GuildMember } from 'discord.js';

createEvent({
  name: 'memberJoin',
  event: Events.GuildMemberAdd,
  async run(member: GuildMember) {
    const { guild, id: userId } = member;

    const memberDoc = await db.members
      .findOne({
        id: userId,
        guildId: guild.id,
      })
      .exec();

    if (!memberDoc || !memberDoc.persistentRoles || memberDoc.persistentRoles.length === 0) {
      return;
    }

    const botMember = await guild.members.fetchMe();
    const validRoles = memberDoc.persistentRoles.filter((roleId) => {
      const role = guild.roles.cache.get(roleId);
      if (!role) return false;

      return role.position < botMember.roles.highest.position;
    });

    if (validRoles.length === 0) {
      return;
    }

    try {
      await member.roles.add(validRoles);
    } catch (error) {
      console.error(`Erro ao restaurar roles persistentes para ${userId}:`, error);
    }
  },
});
