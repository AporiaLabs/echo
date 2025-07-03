/**
 * Builds a thread of tweets from a given tweet by traversing up through reply chains
 * @param {Object} tweet - The tweet object to start building the thread from
 * @param {TwitterBase} client - The Twitter client instance
 * @param {number} [maxReplies=5] - Maximum number of replies to include in the thread
 * @returns {Promise<Array<{
 *   id: string,
 *   name: string,
 *   username: string,
 *   text: string,
 *   timestamp: number,
 *   userId: string,
 *   conversationId: string,
 *   inReplyToStatusId: string,
 *   permanentUrl: string
 * }>>} Array of tweets in chronological order
 */
async function buildConversationThread(tweet, client, maxReplies = 5) {
    const thread = [];
    const visited = new Set();

    async function processThread(currentTweet, depth = 0) {
        if (!currentTweet || depth >= maxReplies || visited.has(currentTweet.id)) {
            return;
        }

        visited.add(currentTweet.id);
        thread.unshift(currentTweet);

        if (currentTweet.inReplyToStatusId) {
            try {
                const parentTweet = await client.getTweet(currentTweet.inReplyToStatusId);
                if (parentTweet) {
                    await processThread(parentTweet, depth + 1);
                }
            } catch (error) {
                console.error('Error fetching parent tweet:', error);
            }
        }
    }

    await processThread(tweet);
    return thread;
}
