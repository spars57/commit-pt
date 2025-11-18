import { env } from '#env';
import chalk from 'chalk';
import mongoose, { InferSchemaType, model } from 'mongoose';
import { guildSchema } from './schemas/guild.js';
import { memberSchema } from './schemas/member.js';
import { userSchema } from './schemas/user.js';
import { reactionRolePanelSchema } from './schemas/reactionPanel.js';

try {
  console.log(chalk.blue('Connecting to MongoDB...'));
  await mongoose.connect(env.MONGO_URI, {
    dbName: env.DATABASE_NAME || 'database',
  });
  console.log(chalk.green('MongoDB connected'));
} catch (err) {
  console.error(err);
  process.exit(1);
}

export const db = {
  guilds: model('guild', guildSchema, 'guilds'),
  members: model('member', memberSchema, 'members'),
  users: model('user', userSchema, 'users'),
  reactionRolePanel: model('reactionRolePanel', reactionRolePanelSchema, 'reactionRolePanels'),
};

export type GuildSchema = InferSchemaType<typeof guildSchema>;
export type MemberSchema = InferSchemaType<typeof memberSchema>;
export type UserSchema = InferSchemaType<typeof userSchema>;
export type ReactionRolePanelSchema = InferSchemaType<typeof reactionRolePanelSchema>;
