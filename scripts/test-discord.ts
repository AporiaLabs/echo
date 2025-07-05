import { DiscordClient } from "../clients/discord/client";
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Configure logging
const DEBUG = process.env.DEBUG === 'true';
function log(message: string, ...args: any[]) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}


const config = {
  botToken: process.env.DISCORD_BOT_TOKEN!,
  agentId: "test-agent",
  retryLimit: 3,
  pollingInterval: 1,
  dryRun: false
};
