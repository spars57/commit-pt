import { Schema } from 'mongoose';

const mappingSchema = new Schema({
  emojiKey: { type: String, required: true }, // normalized unique key for emoji (unicode or custom)
  emojiRaw: { type: String, required: true }, // original user input to show in UIs
  roleId: { type: String, required: true },
  description: { type: String, default: '' },
});

export const reactionRolePanelSchema = new Schema(
  {
    guildId: { type: String, index: true, required: true },
    channelId: { type: String },
    messageId: { type: String },
    title: { type: String, required: true, unique: true },
    content: { type: String, default: '' },
    mutuallyExclusive: { type: Boolean, default: false },
    mappings: { type: [mappingSchema], default: [] },
    createdBy: { type: String, required: true },
  },
  {
    statics: {
      async createPanel(guildId: string, title: string, createdBy: string) {
        // Verifica se já existe um painel com o mesmo título no mesmo servidor
        const existing = await this.findOne({ guildId, title }).exec();
        if (existing) {
          const err = new Error('PanelTitleExists') as Error & { code: string };
          err.code = 'PANEL_TITLE_EXISTS';
          throw err;
        }

        // Ensure new drafts have a unique placeholder messageId so they don't
        // collide with an existing unique index that treats null/undefined as a value.
        // This is a defensive fix for deployments where the DB index hasn't been
        // converted to a partial index yet.
        const draftMessageId = `draft:${Date.now()}:${Math.random().toString(36).slice(2)}`;

        const query = { guildId, title, createdBy, messageId: draftMessageId };
        return await this.create(query);
      },
      async findByTitle(title: string) {
        return await this.findOne({ title }).exec();
      },
      async findById(id: string) {
        return await this.findOne({ _id: id }).exec();
      },
    },
  }
);

// Ensure messageId is unique only when it exists and is not null.
// This avoids duplicate-key errors when multiple draft documents don't have a messageId yet.
// Note: If your database already has a unique index on messageId that allows nulls,
// you'll need to drop it and recreate it as a partial index in MongoDB:
// db.reactionRolePanels.dropIndex("messageId_1");
// db.reactionRolePanels.createIndex({ messageId: 1 }, { unique: true, partialFilterExpression: { messageId: { $exists: true, $ne: null } } });
reactionRolePanelSchema.index(
  { messageId: 1 },
  { unique: true, partialFilterExpression: { messageId: { $exists: true, $ne: null } } }
);
