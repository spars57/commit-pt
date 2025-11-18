import { Schema } from 'mongoose';
import { t } from '../utils.js';

export const userSchema = new Schema(
  {
    id: t.string,
  },
  {
    statics: {
      async get(user: { id: string }) {
        const query = { id: user.id };
        return (await this.findOne(query)) ?? this.create(query);
      },
    },
  }
);
