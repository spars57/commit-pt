import { createEvent } from '#base';
import { ActivityType } from 'discord.js';

createEvent({
  name: 'status',
  event: 'clientReady',
  once: true,
  async run(client) {
    client.user.setActivity({
      name: `${client.users.cache.size} Membros na comunidade!`,
      type: ActivityType.Custom,
    });
  },
});
