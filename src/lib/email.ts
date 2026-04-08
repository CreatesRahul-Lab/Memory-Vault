import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_NAME = process.env.EMAIL_FROM_NAME || "Memory OS";
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@memoryos.app";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

// ─── The Cheesy Tagline Engine ────────────────────────────────────────────────

const CHEESY_GREETINGS = [
  "Your brain called. It said thanks for the backup.",
  "Another day, another memory safely hoarded.",
  "Your future self is already high-fiving you.",
  "Saving the internet, one link at a time. You legend.",
  "You're basically a digital squirrel. And we love it.",
  "Roses are red, violets are blue, you saved some stuff, and we're proud of you.",
  "Plot twist: you'll actually find this later.",
  "Hoarding? We prefer 'curating with passion'.",
  "Your bookmarks bar could never.",
  "The internet is vast. Your taste? Impeccable.",
];

const DIGEST_SUBJECT_LINES = [
  "Your brain's highlight reel is ready",
  "Hot off the memory press",
  "What your big beautiful brain saved this week",
  "Your digital treasure chest just got an update",
  "Memory lane called - it misses you",
  "This is your memory speaking. Come visit.",
  "Your saved goodies, served fresh",
  "A love letter to your saved content",
  "Remember when you saved all this cool stuff? We do.",
  "Your past self was a genius. Here's proof.",
];

const WELCOME_SUBJECT_LINES = [
  "Welcome aboard the Memory Express",
  "Your second brain just got activated",
  "You + Memory OS = unstoppable knowledge machine",
  "Pop the confetti - your memory vault is live!",
  "Say goodbye to 'I swear I bookmarked that'",
];

const ITEM_SAVED_SUBJECT_LINES = [
  "Saved! Your future self sends thanks",
  "Another gem for your collection",
  "Memory banked successfully",
  "Cha-ching! Knowledge deposited",
  "One more treasure in your vault",
];

const RESURFACE_INTROS = [
  "Remember this golden oldie?",
  "Blast from your bookmarked past!",
  "This deserves a second look:",
  "Your past self thought this was fire. Were they right?",
  "Dusting off the archives for you:",
  "From the 'you forgot about this but it slaps' vault:",
];

const REVIEW_NUDGES = [
  "Your brain muscles need a workout!",
  "Time to flex that memory muscle",
  "Spaced repetition waits for no one",
  "Quick review sesh? Your neurons will thank you.",
  "Use it or lose it! (Your saved knowledge, that is.)",
];

const TASK_NUDGES = [
  "These tasks are giving you puppy eyes",
  "Your to-do list is feeling neglected",
  "Tick tick tick... tasks are waiting!",
  "Your tasks miss you. Just saying.",
];

const SIGN_OFFS = [
  "Stay curious, you beautiful knowledge goblin.",
  "Keep saving. Keep thriving. Keep being awesome.",
  "Your memory is in good hands. Ours. And yours.",
  "Until next time, you magnificent bookmark hoarder.",
  "Remember: forgetting is for people without Memory OS.",
  "With love and zero forgotten bookmarks,",
  "Cheesily yours,",
  "May your links never 404,",
  "Ctrl+S-ing our love for you,",
  "Your biggest fan (besides your browser history),",
];

// ─── Utility: Pick random from array ──────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Public Tagline API ───────────────────────────────────────────────────────

export const taglines = {
  greeting: () => pickRandom(CHEESY_GREETINGS),
  digestSubject: () => pickRandom(DIGEST_SUBJECT_LINES),
  welcomeSubject: () => pickRandom(WELCOME_SUBJECT_LINES),
  itemSavedSubject: () => pickRandom(ITEM_SAVED_SUBJECT_LINES),
  resurfaceIntro: () => pickRandom(RESURFACE_INTROS),
  reviewNudge: () => pickRandom(REVIEW_NUDGES),
  taskNudge: () => pickRandom(TASK_NUDGES),
  signOff: () => pickRandom(SIGN_OFFS),
};

// ─── Type-safe emoji map for content types ────────────────────────────────────

const TYPE_EMOJI: Record<string, string> = {
  page: "📄",
  video: "🎬",
  tweet: "🐦",
  pdf: "📕",
  note: "📝",
  screenshot: "📸",
  transcript: "🎙️",
};

export function emojiForType(type: string): string {
  return TYPE_EMOJI[type] || "🔗";
}

// ─── Core Send Function ──────────────────────────────────────────────────────

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const { data, error } = await resend.emails.send({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  if (error) {
    throw error;
  }

  return data;
}

export { APP_URL, FROM_NAME };
