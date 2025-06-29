import { Message, MessageOptions, MessagePayload } from "discord.js";
import { DiscordBase, DiscordConfig } from "./base";
import axios from "axios";
import { InputSource, InputType } from "../../src/types";
import { createDiscordMemory } from "../../src/utils/memory";

export class DiscordClient extends DiscordBase {
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(agent: any, config: DiscordConfig) {
    super(agent, config);
    this.checkInterval = null;
  }

  /**
   * Start the Discord client and begin listening for messages
   * @returns Promise that resolves when the client is ready
   */
  async start(): Promise<void> {
    await this.init();

    // Set up message listener for DMs
    this.discordClient.on("messageCreate", async (message: Message) => {
      // Ignore messages from self or other bots
      if (message.author.bot) return;
      
      // Only handle DM messages
      if (message.channel.isDMBased()) {
        await this.handleDirectMessage(message);
      }
    });

    // Set up polling interval if configured
    if (this.config.pollingInterval > 0) {
      const intervalMs = this.config.pollingInterval * 60 * 1000;
      this.checkInterval = setInterval(() => this.checkPendingTasks(), intervalMs);
      console.log(`Polling loop started. Will check every ${this.config.pollingInterval} minutes`);
    }

    console.log("Discord client started. Monitoring for DMs.");
  }

  /**
   * Stop the Discord client and clean up resources
   */
  async stop(): Promise<void> {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    await this.destroy();
    console.log("Discord client stopped");
  }

  /**
   * Handle incoming direct messages
   * @param message The Discord message object
   */
  private async handleDirectMessage(message: Message): Promise<void> {
    try {
      console.log(
        "Handling DM from:",
        `${message.author.tag} (${message.author.id}):`,
        message.content
      );

      const responseText = await this.fetchAgentResponse({
        agentId: this.config.agentId,
        userId: `discord_user_${message.author.id}`,
        roomId: `discord_dm_${message.author.id}`,
        text: message.content,
        type: InputType.TEXT,
      });

      if (responseText && !this.config.dryRun) {
        await this.sendDirectMessage(message.author.id, responseText);
        console.log("Sent response:", responseText);
      }
    } catch (error) {
      console.error("Error handling direct message:", error);
      // Optionally notify user of error
      if (!this.config.dryRun && message.channel.isTextBased() && message.channel.isDMBased()) {
        await message.reply("Sorry, I encountered an error processing your message.");
      }
    }
  }
}

  
