import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, MessageFlags } from "discord.js";
import cooldowns from "../bot_modules/cooldowns";
import economy from "../bot_modules/economy";
import job from "../bot_modules/job";
import fs from "fs";
import path from "path";
import ms from "ms";
import { getRep, addRep } from "../bot_modules/reputation";

export default {
    data: new SlashCommandBuilder()
        .setName("job").setDescription("Job commands")
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(sub => sub.setName("apply").setDescription("Apply for a job"))
        .addSubcommand(sub => sub.setName("see").setDescription("See your current job"))
        .addSubcommand(sub => sub.setName("quit").setDescription("Quit your job"))
        .addSubcommand(sub => sub.setName("shift").setDescription("Do your job and get paid"))
        .addSubcommand(sub => sub.setName("list").setDescription("See the list of jobs per category.")),

    async execute(interacion: ChatInputCommandInteraction) {
        
    }
}