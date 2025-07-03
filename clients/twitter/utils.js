
/**
 * Splits a long text into multiple tweet-sized chunks
 * @param {string} text - The text content to split
 * @param {number} [maxLength=280] - Maximum length of each tweet
 * @returns {string[]} Array of tweet-sized text chunks
 */
function splitTweetContent(text, maxLength = 280) {
    if (text.length <= maxLength) return [text];

    const tweets = [];
    let currentTweet = '';

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    for (const sentence of sentences) {
        if ((currentTweet + sentence).length <= maxLength) {
            currentTweet += sentence;
        } else {
            if (currentTweet) tweets.push(currentTweet.trim());
            
            if (sentence.length > maxLength) {
                const words = sentence.split(' ');
                currentTweet = words[0];
                
                for (let i = 1; i < words.length; i++) {
                    if ((currentTweet + ' ' + words[i]).length <= maxLength) {
                        currentTweet += ' ' + words[i];
                    } else {
                        tweets.push(currentTweet.trim());
                        currentTweet = words[i];
                    }
                }
            } else {
                currentTweet = sentence;
            }
        }
    }

    if (currentTweet) tweets.push(currentTweet.trim());
    return tweets;
}
