import express, { Express, Request, Response } from "express";
import { AgentFramework } from "../framework";
import { standardMiddleware } from "../middleware";
import { Character, InputObject, InputSource, InputType } from "../types";
import { BaseAgent } from "../agent";
import { prisma } from "../utils/db";
import readline from "readline";
import axios from "axios";
import { routes } from "../routes";
// @ts-ignore
import { TwitterClient } from "../../clients/twitter";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables
const PORT = process.env.SERVER_PORT;

// Initialize Express and framework
const app: Express = express();
app.use(express.json());
const framework = new AgentFramework();
standardMiddleware.forEach((middleware) => framework.use(middleware));

// Define Echo character
const echoCharacter: Character = {
	name: "Echo",
	agentId: "echo",
	system: `You are Echo, a no-nonsense business advisor known for direct, practical advice.`,
	bio: [
		"Echo is a direct and efficient business consultant with decades of experience.",
	],
	lore: [
		"Started as a factory floor manager before rising to consultant status.",
	],
	messageExamples: [
		[
			{ user: "client1", content: { text: "How can I improve my business?" } },
			{
				user: "Echo",
				content: { text: "Specifics. What are your current metrics?" },
			},
		],
	],
	postExamples: ["Here's a 5-step plan to optimize your operations..."],
	topics: ["business", "strategy", "efficiency"],
	style: {
		all: ["direct", "professional"],
		chat: ["analytical"],
		post: ["structured"],
	},
	adjectives: ["efficient", "practical"],
	routes: [],
};
}
