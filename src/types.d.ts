import { Collection, Events } from 'discord.js';
import type { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, {
      data: SlashCommandBuilder;
      execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
      cooldown: number
    }>;
    cooldowns: Collection<string, Collection<string, number>>;
  }
}
