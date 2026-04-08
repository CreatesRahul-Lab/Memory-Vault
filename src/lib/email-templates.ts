import { taglines, emojiForType, APP_URL, FROM_NAME } from "./email";

// ─── Shared Layout ────────────────────────────────────────────────────────────

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f14;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#1a1a24;border-radius:16px;overflow:hidden;border:1px solid #2a2a3a;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6c5ce7,#a855f7);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                🧠 ${FROM_NAME}
              </h1>
              <p style="margin:8px 0 0;color:#e2d9ff;font-size:14px;font-style:italic;">
                ${taglines.greeting()}
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;color:#e0e0e8;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #2a2a3a;text-align:center;">
              <p style="margin:0 0 8px;color:#a78bfa;font-size:14px;font-style:italic;">
                ${taglines.signOff()}
              </p>
              <p style="margin:0;color:#666680;font-size:12px;">
                The ${FROM_NAME} Team &bull;
                <a href="${APP_URL}" style="color:#a78bfa;text-decoration:none;">Open Dashboard</a>
              </p>
              <p style="margin:8px 0 0;color:#44445a;font-size:11px;">
                You're receiving this because you have a ${FROM_NAME} account.
                <a href="${APP_URL}/settings" style="color:#44445a;">Manage email preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Stat Badge ───────────────────────────────────────────────────────────────

function statBadge(label: string, value: string | number, emoji: string): string {
  return `<td style="text-align:center;padding:12px;">
    <div style="font-size:28px;">${emoji}</div>
    <div style="font-size:24px;font-weight:700;color:#ffffff;margin:4px 0;">${value}</div>
    <div style="font-size:12px;color:#9999aa;text-transform:uppercase;letter-spacing:1px;">${label}</div>
  </td>`;
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function itemRow(item: {
  title: string;
  url: string;
  domain?: string;
  type?: string;
  tags?: string[];
  summary?: string;
}): string {
  const emoji = emojiForType(item.type || "page");
  const tagsHtml = (item.tags || [])
    .slice(0, 3)
    .map(
      (t) =>
        `<span style="display:inline-block;background:#2a2a3e;color:#a78bfa;padding:2px 8px;border-radius:12px;font-size:11px;margin-right:4px;">#${t}</span>`
    )
    .join("");

  return `<tr>
    <td style="padding:12px 0;border-bottom:1px solid #222233;">
      <a href="${item.url}" style="color:#e0e0e8;text-decoration:none;font-size:15px;font-weight:600;">
        ${emoji} ${item.title || "Untitled"}
      </a>
      ${item.domain ? `<div style="color:#666680;font-size:12px;margin-top:2px;">${item.domain}</div>` : ""}
      ${item.summary ? `<div style="color:#9999aa;font-size:13px;margin-top:4px;line-height:1.4;">${item.summary.slice(0, 120)}${item.summary.length > 120 ? "..." : ""}</div>` : ""}
      ${tagsHtml ? `<div style="margin-top:6px;">${tagsHtml}</div>` : ""}
    </td>
  </tr>`;
}

// ─── Section Header ───────────────────────────────────────────────────────────

function sectionHeader(title: string, subtitle?: string): string {
  return `<h2 style="margin:28px 0 12px;color:#ffffff;font-size:18px;font-weight:700;border-bottom:2px solid #6c5ce7;padding-bottom:8px;">
    ${title}
  </h2>
  ${subtitle ? `<p style="margin:0 0 12px;color:#9999aa;font-size:13px;font-style:italic;">${subtitle}</p>` : ""}`;
}

// ─── CTA Button ───────────────────────────────────────────────────────────────

function ctaButton(text: string, url: string): string {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#6c5ce7,#a855f7);color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
      ${text}
    </a>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE: Welcome Email
// ═══════════════════════════════════════════════════════════════════════════════

export function welcomeEmail(userName: string): { subject: string; html: string } {
  const subject = `🧠 ${taglines.welcomeSubject()}`;
  const body = `
    <h2 style="color:#ffffff;font-size:22px;margin:0 0 16px;">
      Hey ${userName}! 🎉
    </h2>
    <p style="color:#ccccdd;font-size:15px;line-height:1.6;">
      Welcome to <strong style="color:#a78bfa;">Memory OS</strong> &mdash; your second brain that actually remembers things
      (unlike your first one after 2 AM doom-scrolling).
    </p>
    <p style="color:#ccccdd;font-size:15px;line-height:1.6;">
      Here's what you can do now:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:12px 0;">
          <span style="font-size:20px;">🔌</span>
          <strong style="color:#ffffff;margin-left:8px;">Install the Chrome Extension</strong>
          <div style="color:#9999aa;font-size:13px;margin-top:4px;margin-left:36px;">
            Save pages, tweets, videos &mdash; anything your heart desires, with one click.
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;">
          <span style="font-size:20px;">🏷️</span>
          <strong style="color:#ffffff;margin-left:8px;">Tag &amp; Organize</strong>
          <div style="color:#9999aa;font-size:13px;margin-top:4px;margin-left:36px;">
            Create collections, add tags, and let our AI auto-categorize your saves.
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;">
          <span style="font-size:20px;">🔁</span>
          <strong style="color:#ffffff;margin-left:8px;">Review &amp; Remember</strong>
          <div style="color:#9999aa;font-size:13px;margin-top:4px;margin-left:36px;">
            Spaced repetition means you'll actually remember what you save. Revolutionary.
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;">
          <span style="font-size:20px;">📬</span>
          <strong style="color:#ffffff;margin-left:8px;">Get Digest Emails</strong>
          <div style="color:#9999aa;font-size:13px;margin-top:4px;margin-left:36px;">
            Daily or weekly recaps of your saves, with cheesy taglines included at no extra charge.
          </div>
        </td>
      </tr>
    </table>
    ${ctaButton("Open Your Dashboard", APP_URL)}
    <p style="color:#666680;font-size:13px;text-align:center;font-style:italic;">
      Pro tip: Set up your digest preferences in Settings so we can spam you with love.
    </p>`;

  return { subject, html: layout(subject, body) };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE: Digest Email (Daily / Weekly)
// ═══════════════════════════════════════════════════════════════════════════════

export interface DigestData {
  userName: string;
  period: "daily" | "weekly";
  stats: {
    totalSaved: number;
    favoritedCount: number;
    reviewDue: number;
    tasksPending: number;
  };
  topTags: { tag: string; count: number }[];
  recentItems: {
    title: string;
    url: string;
    domain?: string;
    type?: string;
    tags?: string[];
    summary?: string;
  }[];
  resurfaced: {
    title: string;
    url: string;
    domain?: string;
    type?: string;
    tags?: string[];
  }[];
}

export function digestEmail(data: DigestData): { subject: string; html: string } {
  const subject = `🧠 ${taglines.digestSubject()} (${data.period})`;
  const periodLabel = data.period === "daily" ? "today" : "this week";

  // Stats row
  const statsHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12121a;border-radius:12px;margin:16px 0;">
      <tr>
        ${statBadge("Saved", data.stats.totalSaved, "💾")}
        ${statBadge("Favorited", data.stats.favoritedCount, "⭐")}
        ${statBadge("To Review", data.stats.reviewDue, "🔁")}
        ${statBadge("Tasks", data.stats.tasksPending, "✅")}
      </tr>
    </table>`;

  // Top tags
  const tagsHtml =
    data.topTags.length > 0
      ? `${sectionHeader("🏷️ Your Hot Tags " + periodLabel)}
         <div style="margin-bottom:16px;">
           ${data.topTags
             .map(
               (t) =>
                 `<span style="display:inline-block;background:#2a2a3e;color:#a78bfa;padding:4px 12px;border-radius:16px;font-size:13px;margin:3px 4px 3px 0;">#${t.tag} <span style="color:#666680;">(${t.count})</span></span>`
             )
             .join("")}
         </div>`
      : "";

  // Recent items
  const recentHtml =
    data.recentItems.length > 0
      ? `${sectionHeader("📥 Recently Saved", `Here's what you hoarded ${periodLabel}:`)}
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
           ${data.recentItems.slice(0, 10).map(itemRow).join("")}
         </table>`
      : `<p style="color:#9999aa;font-size:14px;text-align:center;padding:24px;">
           Nothing saved ${periodLabel}? The internet is full of treasures, go forth and collect!
         </p>`;

  // Resurfaced items
  const resurfacedHtml =
    data.resurfaced.length > 0
      ? `${sectionHeader(`🕰️ ${taglines.resurfaceIntro()}`)}
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
           ${data.resurfaced.map(itemRow).join("")}
         </table>`
      : "";

  // Review nudge
  const reviewHtml =
    data.stats.reviewDue > 0
      ? `<div style="background:#1e1a2e;border:1px solid #6c5ce7;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
           <p style="margin:0 0 8px;color:#a78bfa;font-size:16px;font-weight:700;">
             ${taglines.reviewNudge()}
           </p>
           <p style="margin:0 0 12px;color:#ccccdd;font-size:14px;">
             You have <strong style="color:#ffffff;">${data.stats.reviewDue}</strong> items waiting for review.
           </p>
           ${ctaButton("Start Review Session", `${APP_URL}/review`)}
         </div>`
      : "";

  // Task nudge
  const taskHtml =
    data.stats.tasksPending > 0
      ? `<div style="background:#1a1e2e;border:1px solid #3b82f6;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
           <p style="margin:0 0 8px;color:#60a5fa;font-size:16px;font-weight:700;">
             ${taglines.taskNudge()}
           </p>
           <p style="margin:0;color:#ccccdd;font-size:14px;">
             <strong style="color:#ffffff;">${data.stats.tasksPending}</strong> tasks are still pending. You got this!
           </p>
         </div>`
      : "";

  const body = `
    <h2 style="color:#ffffff;font-size:22px;margin:0 0 8px;">
      Hey ${data.userName}! Here's your ${data.period} brain dump:
    </h2>
    ${statsHtml}
    ${tagsHtml}
    ${recentHtml}
    ${resurfacedHtml}
    ${reviewHtml}
    ${taskHtml}
    ${ctaButton("Open Dashboard", APP_URL)}`;

  return { subject, html: layout(subject, body) };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE: Item Saved Notification
// ═══════════════════════════════════════════════════════════════════════════════

export interface ItemSavedData {
  userName: string;
  item: {
    title: string;
    url: string;
    domain?: string;
    type?: string;
    tags?: string[];
    summary?: string;
  };
  totalSavedAllTime: number;
}

export function itemSavedEmail(data: ItemSavedData): { subject: string; html: string } {
  const subject = `${emojiForType(data.item.type || "page")} ${taglines.itemSavedSubject()}`;
  const emoji = emojiForType(data.item.type || "page");

  const milestoneMessages: Record<number, string> = {
    10: "Double digits! You're on a roll! 🎳",
    25: "25 saves! You're a quarter-centurion of knowledge! 🏛️",
    50: "Half a century of saves! Historians would be proud! 📚",
    100: "TRIPLE DIGITS! You absolute memory machine! 🤖",
    250: "250?! You're basically building a personal Wikipedia! 📖",
    500: "500 saves! Your brain's external hard drive is THICC! 💾",
    1000: "ONE THOUSAND SAVES. You are the chosen one. 👑",
  };

  const milestone = milestoneMessages[data.totalSavedAllTime] || "";

  const body = `
    <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">
      ${emoji} Saved to your vault, ${data.userName}!
    </h2>
    <div style="background:#12121a;border-radius:12px;padding:20px;border-left:4px solid #6c5ce7;">
      <a href="${data.item.url}" style="color:#ffffff;text-decoration:none;font-size:17px;font-weight:700;">
        ${data.item.title || "Untitled"}
      </a>
      ${data.item.domain ? `<div style="color:#666680;font-size:12px;margin-top:4px;">${data.item.domain}</div>` : ""}
      ${data.item.summary ? `<p style="color:#9999aa;font-size:14px;line-height:1.5;margin:12px 0 0;">${data.item.summary.slice(0, 200)}${data.item.summary.length > 200 ? "..." : ""}</p>` : ""}
      ${
        (data.item.tags || []).length > 0
          ? `<div style="margin-top:10px;">
               ${data.item.tags!
                 .slice(0, 5)
                 .map(
                   (t) =>
                     `<span style="display:inline-block;background:#2a2a3e;color:#a78bfa;padding:3px 10px;border-radius:12px;font-size:12px;margin:2px 4px 2px 0;">#${t}</span>`
                 )
                 .join("")}
             </div>`
          : ""
      }
    </div>
    <p style="color:#666680;font-size:13px;text-align:center;margin-top:16px;">
      That's save #<strong style="color:#a78bfa;">${data.totalSavedAllTime}</strong> in your collection. Keep going!
    </p>
    ${milestone ? `<div style="background:#1e1a2e;border-radius:12px;padding:16px;text-align:center;margin:12px 0;"><p style="margin:0;color:#fbbf24;font-size:16px;font-weight:700;">${milestone}</p></div>` : ""}
    ${ctaButton("View in Dashboard", `${APP_URL}`)}`;

  return { subject, html: layout(subject, body) };
}
