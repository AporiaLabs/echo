import { prisma } from "./db";

/**
 * Interface representing Twitter data structure
 */
export interface TweetData {
	id: string;
	text: string;
	userId: string;
	username: string;
	conversationId?: string;
	inReplyToId?: string;
	permanentUrl?: string;
}

/**
 * Creates a new Twitter memory entry in the database
 */
export async function createTwitterMemory(
	userId: string,
	agentId: string,
	roomId: string,
	message: string,
	generator: string = "llm"
) {
	await prisma.memory.create({
		data: {
			userId,
			agentId,
			roomId,
			type: "tweet",
			generator: generator,
			content: JSON.stringify({ text: message }),
		},
	});
}

/**
 * Checks if a tweet with the given ID exists in the database
 */
export async function doesTweetExist(tweetId: string): Promise<boolean> {
	const count = await prisma.tweet.count({
		where: { id: tweetId },
	});
	return count > 0;
}

export async function storeTweetIfNotExists(
	tweet: TweetData
): Promise<boolean> {
	const exists = await doesTweetExist(tweet.id);

	if (!exists) {
		await prisma.tweet.create({
			data: {
				id: tweet.id,
				text: tweet.text,
				userId: tweet.userId,
				username: tweet.username,
				conversationId: tweet.conversationId,
				inReplyToId: tweet.inReplyToId,
				permanentUrl: tweet.permanentUrl,
			},
		});
		return true; // Indicates we stored a new tweet
	}

	return false; // Indicates tweet already existed
}
export async function getTweetById(tweetId: string) {
	return prisma.tweet.findUnique({
		where: { id: tweetId },
	});
}

export async function getTweetThread(conversationId: string) {
	return prisma.tweet.findMany({
		where: { conversationId },
		orderBy: { createdAt: "asc" },
	});
}

export async function getRecentTweets(userId: string, limit: number = 10) {
	return prisma.tweet.findMany({
		where: { userId },
		orderBy: { createdAt: "desc" },
		take: limit,
	});
}

/**
 * Interface representing Discord message data structure
 */
export interface DiscordMessageData {
	id: string;
	content: string;
	userId: string;
	username: string;
	channelId: string;
	guildId?: string;
}

export async function createDiscordMemory(
	userId: string,
	agentId: string,
	roomId: string,
	message: string,
	generator: string = "llm"
) {
	await prisma.memory.create({
		data: {
			userId,
			agentId,
			roomId,
			type: "discord",
			generator: generator,
			content: JSON.stringify({ text: message }),
		},
	});
}
