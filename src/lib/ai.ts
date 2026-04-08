// AI utility: extractive summarization, key point extraction, tag generation, and Q&A
// Works without external AI APIs using TF-IDF-like keyword extraction and sentence scoring

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her",
  "was", "one", "our", "out", "has", "have", "been", "some", "them", "than",
  "its", "over", "such", "that", "this", "with", "will", "each", "from",
  "they", "were", "which", "their", "what", "there", "when", "your", "also",
  "into", "just", "about", "would", "make", "like", "could", "time", "very",
  "after", "then", "other", "more", "these", "only", "come", "made", "find",
  "here", "thing", "many", "well", "does", "being", "those", "much", "need",
  "said", "each", "tell", "every", "same", "through", "while", "where", "should",
]);

function getWordFrequency(words: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const word of words) {
    if (!STOP_WORDS.has(word)) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }
  }
  return freq;
}

function splitSentences(text: string): string[] {
  return text
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

function scoreSentence(sentence: string, wordFreq: Map<string, number>): number {
  const words = tokenize(sentence);
  if (words.length === 0) return 0;
  let score = 0;
  for (const word of words) {
    score += wordFreq.get(word) || 0;
  }
  return score / words.length;
}

export function generateSummary(text: string, maxSentences = 3): string {
  if (!text || text.length < 50) return text;

  const sentences = splitSentences(text);
  if (sentences.length <= maxSentences) return sentences.join(". ") + ".";

  const words = tokenize(text);
  const wordFreq = getWordFrequency(words);

  const scored = sentences.map((s, i) => ({
    sentence: s,
    score: scoreSentence(s, wordFreq) + (i < 3 ? 0.5 : 0), // boost early sentences
    index: i,
  }));

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, maxSentences);
  top.sort((a, b) => a.index - b.index); // restore original order

  return top.map((s) => s.sentence).join(". ") + ".";
}

export function extractKeyPoints(text: string, maxPoints = 5): string[] {
  if (!text || text.length < 30) return [];

  const sentences = splitSentences(text);
  const words = tokenize(text);
  const wordFreq = getWordFrequency(words);

  const scored = sentences.map((s, i) => ({
    sentence: s,
    score: scoreSentence(s, wordFreq),
    index: i,
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored
    .slice(0, maxPoints)
    .sort((a, b) => a.index - b.index)
    .map((s) => {
      const trimmed = s.sentence.length > 120 ? s.sentence.substring(0, 117) + "..." : s.sentence;
      return trimmed;
    });
}

export function generateTags(text: string, existingTags: string[] = [], maxTags = 5): string[] {
  if (!text) return [];

  const words = tokenize(text);
  const wordFreq = getWordFrequency(words);
  const existingSet = new Set(existingTags.map((t) => t.toLowerCase()));

  // Get top words by frequency, excluding existing tags
  const sorted = Array.from(wordFreq.entries())
    .filter(([word]) => !existingSet.has(word) && word.length > 3)
    .sort((a, b) => b[1] - a[1]);

  // Also detect two-word phrases
  const bigrams = new Map<string, number>();
  for (let i = 0; i < words.length - 1; i++) {
    if (!STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i + 1])) {
      const bigram = `${words[i]}-${words[i + 1]}`;
      if (!existingSet.has(bigram)) {
        bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
      }
    }
  }

  const topBigrams = Array.from(bigrams.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([phrase]) => phrase);

  const topWords = sorted.slice(0, maxTags - topBigrams.length).map(([word]) => word);

  return [...topBigrams, ...topWords].slice(0, maxTags);
}

export function answerQuestion(
  question: string,
  items: { title: string; content: string; notes: string; summary: string; url: string }[]
): { answer: string; sources: { title: string; url: string; snippet: string }[] } {
  const questionWords = tokenize(question);
  const questionSet = new Set(questionWords.filter((w) => !STOP_WORDS.has(w)));

  if (questionSet.size === 0) {
    return { answer: "Please ask a more specific question.", sources: [] };
  }

  // Score each item by relevance to the question
  const scored = items.map((item) => {
    const allText = `${item.title} ${item.content} ${item.notes} ${item.summary}`;
    const itemWords = tokenize(allText);
    let matchCount = 0;
    for (const word of itemWords) {
      if (questionSet.has(word)) matchCount++;
    }
    const score = itemWords.length > 0 ? matchCount / Math.sqrt(itemWords.length) : 0;

    // Find best matching sentence
    const sentences = splitSentences(allText);
    let bestSentence = "";
    let bestScore = 0;
    for (const sentence of sentences) {
      const sWords = tokenize(sentence);
      let sMatch = 0;
      for (const w of sWords) {
        if (questionSet.has(w)) sMatch++;
      }
      const sScore = sWords.length > 0 ? sMatch / sWords.length : 0;
      if (sScore > bestScore) {
        bestScore = sScore;
        bestSentence = sentence;
      }
    }

    return { item, score, snippet: bestSentence };
  });

  scored.sort((a, b) => b.score - a.score);
  const relevant = scored.filter((s) => s.score > 0).slice(0, 5);

  if (relevant.length === 0) {
    return { answer: "No relevant items found for your question.", sources: [] };
  }

  // Build answer from top relevant sentences
  const answerParts = relevant
    .slice(0, 3)
    .filter((r) => r.snippet)
    .map((r) => r.snippet);

  const answer = answerParts.length > 0
    ? `Based on your saved items: ${answerParts.join(". ")}.`
    : `Found ${relevant.length} related items. Check the sources below.`;

  const sources = relevant.map((r) => ({
    title: r.item.title,
    url: r.item.url,
    snippet: r.snippet.substring(0, 150),
  }));

  return { answer, sources };
}

export function findDuplicates(
  newUrl: string,
  newTitle: string,
  existingItems: { _id: string; url: string; title: string; domain: string }[]
): { _id: string; url: string; title: string; reason: string }[] {
  const duplicates: { _id: string; url: string; title: string; reason: string }[] = [];
  const normalizeUrl = (u: string) =>
    u.replace(/^https?:\/\//, "").replace(/\/$/, "").replace(/^www\./, "").toLowerCase();

  const normalizedNew = normalizeUrl(newUrl);
  const newTitleLower = newTitle.toLowerCase();

  for (const item of existingItems) {
    const normalizedExisting = normalizeUrl(item.url);

    if (normalizedNew === normalizedExisting) {
      duplicates.push({ _id: item._id, url: item.url, title: item.title, reason: "Exact URL match" });
    } else if (
      newTitleLower.length > 10 &&
      item.title.toLowerCase() === newTitleLower
    ) {
      duplicates.push({ _id: item._id, url: item.url, title: item.title, reason: "Same title" });
    } else {
      // Check URL similarity (same path, different params)
      const newPath = normalizedNew.split("?")[0];
      const existPath = normalizedExisting.split("?")[0];
      if (newPath === existPath && newPath.length > 10) {
        duplicates.push({ _id: item._id, url: item.url, title: item.title, reason: "Similar URL" });
      }
    }
  }

  return duplicates;
}
