import { brBuilder } from '@magicyan/discord';
import { type CommandInteraction } from 'discord.js';
import { CommandManager } from './commands/manager.js';
import { EventManager } from './events/manager.js';
import { EventPropData } from './events/types.js';
import { ResponderManager } from './responders/manager.js';
import { GenericResponderInteraction } from './responders/types.js';

export interface BaseCommandsConfig {
  guilds?: string[];
  verbose?: boolean;
  middleware?(interaction: CommandInteraction, block: () => void): Promise<void>;
  onNotFound?(interaction: CommandInteraction): void;
  onError?(error: unknown, interaction: CommandInteraction): void;
}

export interface BaseRespondersConfig {
  middleware?(
    interaction: GenericResponderInteraction,
    block: () => void,
    params: object
  ): Promise<void>;
  onNotFound?(interaction: GenericResponderInteraction): void;
  onError?(error: unknown, interaction: GenericResponderInteraction, params: object): void;
}

export interface BaseEventsConfig {
  middleware?(event: EventPropData, block: (...tags: string[]) => void): Promise<void>;
  onError?(error: unknown, event: EventPropData): void;
}

interface BaseConfig {
  commands: BaseCommandsConfig;
  events: BaseEventsConfig;
  responders: BaseRespondersConfig;
}

export class Bot {
  private static instance: Bot | null = null;

  public readonly commands: CommandManager;
  public readonly events: EventManager;
  public readonly responders: ResponderManager;
  public readonly config: BaseConfig;

  private constructor() {
    this.events = new EventManager();
    this.commands = new CommandManager();
    this.responders = new ResponderManager();

    this.config = {
      commands: {},
      events: {},
      responders: {},
    };
  }
  public static getInstance() {
    if (!Bot.instance) {
      Bot.instance = new Bot();
    }
    return Bot.instance;
  }
  public printLoadLogs() {
    console.log(brBuilder(...this.commands.logs, ...this.responders.logs, ...this.events.logs));
  }
}
