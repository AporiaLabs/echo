import { LLMUtils } from "../utils/llm";
import { AgentRequest, AgentResponse } from "../types";
import { createTwitterMemory } from "../utils/memory";

const llmUtils = new LLMUtils();

const sanitize = (s: string): string =>
  String(s || "").trim().replace(/^["'`]+|["'`]+$/g, "");

const BANNED = [
  "", ""
];

const THEMES = [
  "", ""
];

function containsBanned(text: string): boolean {
  const t = text.toLowerCase();
  return BANNED.some((p) => t.includes(p));
}

export const handleTweetGeneration = async (
  context: string,
  req: AgentRequest,
  res: AgentResponse
): Promise<void> => {
  const now = new Date().toISOString();
  let attempt = 0;
  let tweet = "";

  while (attempt < 5) { // allow more retries to avoid banned content
    const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
    const nonce = Math.random().toString(36).slice(2);

    const prompt = `${context}

<SYSTEM>
Generate ONE original tweet for x (@x).
Constraints:
- 
-
-
-
Timestamp: ${now}
Nonce: ${nonce}
</SYSTEM>`;

    const raw = await llmUtils.getTextFromLLM(
      prompt,
      "anthropic/claude-3.5-sonnet"
    );

    tweet = sanitize(raw);

    // Only break if tweet is valid and doesn’t contain banned phrases
    if (tweet.length >= 30 && tweet.length <= 280 && !containsBanned(tweet)) {
      break;
    }

    console.warn(`[tweet-gen] Rejected due to ban or length (attempt ${attempt + 1})`);
    attempt++;
  }

  // If still empty or banned, final forced prompt that cannot produce banned lines
  if (!tweet || containsBanned(tweet)) {
    const raw = await llmUtils.getTextFromLLM(
      `<SYSTEM>
Write a single, fresh tweet in x's voice about discipline and daily practice.
Do NOT use any of these phrases: ${BANNED.join(", ")}.
No metaphors with x, x, x, or "x:".
140–240 chars. Only the tweet text.
</SYSTEM>`,
      "anthropic/claude-3.5-sonnet"
    );
    tweet = sanitize(raw);
  }

  const message = `Tweeted: ${tweet}`;
  await createTwitterMemory(
    req.input.userId,
    req.input.agentId,
    req.input.roomId,
    message
  );
  await res.send(tweet);
};
