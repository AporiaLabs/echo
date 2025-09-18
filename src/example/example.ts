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
		all: ["direct", "professional", "clear", "action-oriented", "concise"],
		chat: ["analytical", "supportive", "Socratic", "focused"],
		post: ["structured", "insightful", "step-by-step", "pragmatic"],
	},
	adjectives: ["efficient", "practical", "disciplined", "no-nonsense"],
	routes: [],
};

// Initialize agent
const echo = new BaseAgent(echoCharacter);
const agents = [echo];

// Add the default routes
routes.forEach((r) => echo.addRoute(r));

// Express endpoint for agent input
app.post("/agent/input", (req: Request, res: Response) => {
	try {
		const bodyInput = req.body.input;
		const agentId = bodyInput.agentId;
		const agent = agents.find((agent) => agent.getAgentId() === agentId);

		if (!agent) {
			return res.status(404).json({ error: "Agent not found" });
		}

		// Construct an InputObject for the framework
		const input: InputObject = {
			source: InputSource.NETWORK,
			userId: bodyInput.userId,
			agentId: agent.getAgentId(),
			roomId: bodyInput.roomId || `${agentId}_${bodyInput.userId}`,
			type:
				bodyInput.type === "text" ? InputType.TEXT : InputType.TEXT_AND_IMAGE,
			text: bodyInput.text,
			imageUrls: bodyInput.imageUrls,
		};

		framework.process(input, agent, res);
	} catch (error) {
		console.error("Server error:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
});

// CLI for local testing
async function startCLI() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	console.log("\nEcho Business Advisor CLI");
	console.log("=========================");

	async function prompt() {
		rl.question("\nYou: ", async (text) => {
			try {
				const response = await axios.post("http://localhost:3000/agent/input", {
					input: {
						agentId: "echo",
						userId: "cli_user",
						text: text,
					},
				});

				const data = response.data;
				console.log("\nEcho:", data);
				prompt();
			} catch (error) {
				console.error("\nError:", error);
				prompt();
			}
		});
	}

	prompt();
}

let server: any;

// Initialize and start Twitter client
async function startTwitterClient() {
	// Gather config from .env or fallback
	const username = process.env.TWITTER_USERNAME || "";
	const password = process.env.TWITTER_PASSWORD || "";
	const email = process.env.TWITTER_EMAIL || "";
	const twoFactorSecret = process.env.TWITTER_2FA_SECRET || "";
	const dryRun = process.env.TWITTER_DRY_RUN === "true";
	const postIntervalHours = process.env.TWITTER_POST_INTERVAL_HOURS
		? parseInt(process.env.TWITTER_POST_INTERVAL_HOURS, 10)
		: 4;
	const pollingInterval = process.env.TWITTER_POLLING_INTERVAL
		? parseInt(process.env.TWITTER_POLLING_INTERVAL, 10)
		: 5;

	const config = {
		username,
		password,
		email,
		twoFactorSecret: twoFactorSecret || undefined,
		retryLimit: 3,
		postIntervalHours,
		enableActions: false,
		pollingInterval,
		dryRun,
	};

	const twitterClient = new TwitterClient(echo, config);
	await twitterClient.start(); // Start intervals for checking mentions & posting
}

async function start() {
	server = app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
		startCLI();

		// Start Twitter client after server is up
		startTwitterClient().catch((err) => {
			console.error("Error starting Twitter client:", err);
		});
	});
}

if (require.main === module) {
	start().catch(console.error);
}
