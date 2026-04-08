// Context menu for right-click save
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-memory-os",
    title: "Save to Memory OS",
    contexts: ["page", "link", "selection"],
  });

  chrome.contextMenus.create({
    id: "save-selection",
    title: "Save selection to Memory OS",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "save-highlight",
    title: "Highlight & Save to Memory OS",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "save-full-page",
    title: "Save full page content to Memory OS",
    contexts: ["page"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === "save-to-memory-os") {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageData,
    });

    if (result?.result) {
      const data = result.result;
      if (info.linkUrl) {
        data.url = info.linkUrl;
      }
      await saveItem(data);
    }
  } else if (info.menuItemId === "save-selection" && info.selectionText) {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageData,
    });

    if (result?.result) {
      const data = result.result;
      data.content = info.selectionText;
      await saveItem(data);
    }
  } else if (info.menuItemId === "save-highlight" && info.selectionText) {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageData,
    });

    if (result?.result) {
      const data = result.result;
      data.highlights = [{ text: info.selectionText.substring(0, 1000), color: "#e8b931", note: "" }];
      data.content = info.selectionText;
      await saveItem(data);
    }
  } else if (info.menuItemId === "save-full-page") {
    const [metaResult] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageData,
    });
    const [contentResult] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractFullPageContent,
    });

    if (metaResult?.result) {
      const data = metaResult.result;
      data.content = contentResult?.result?.content || "";
      await saveItem(data);
    }
  }
});

function extractPageData() {
  const getMeta = (name) => {
    const el =
      document.querySelector(`meta[property="${name}"]`) ||
      document.querySelector(`meta[name="${name}"]`);
    return el?.getAttribute("content") || "";
  };

  const favicon =
    document.querySelector('link[rel="icon"]')?.href ||
    document.querySelector('link[rel="shortcut icon"]')?.href ||
    `${window.location.origin}/favicon.ico`;

  let type = "page";
  const url = window.location.href;
  if (url.includes("youtube.com") || url.includes("youtu.be")) type = "video";
  else if (url.includes("twitter.com") || url.includes("x.com")) type = "tweet";
  else if (url.endsWith(".pdf") || url.includes("/pdf")) type = "pdf";

  return {
    url,
    title: document.title,
    description: getMeta("og:description") || getMeta("description"),
    domain: window.location.hostname,
    favicon,
    type,
  };
}

function extractFullPageContent() {
  const article = document.querySelector("article") || document.querySelector("main") || document.querySelector('[role="main"]') || document.body;
  return { content: (article.innerText || "").substring(0, 10000) };
}

async function saveItem(data) {
  const { apiUrl, apiKey } = await chrome.storage.sync.get(["apiUrl", "apiKey"]);
  const baseUrl = apiUrl || "http://localhost:3000";

  // Check clip rules by getting them from the API
  try {
    const rulesRes = await fetch(`${baseUrl}/api/clips`, {
      headers: { Authorization: `Bearer ${apiKey || ""}` },
    });
    if (rulesRes.ok) {
      const rules = await rulesRes.json();
      for (const rule of rules) {
        if (!rule.active) continue;
        let matches = false;
        if (rule.matchType === "domain" && data.domain && data.domain.includes(rule.pattern)) matches = true;
        if (rule.matchType === "url_contains" && data.url.includes(rule.pattern)) matches = true;
        if (rule.matchType === "title_contains" && data.title && data.title.toLowerCase().includes(rule.pattern.toLowerCase())) matches = true;

        if (matches) {
          data.tags = [...(data.tags || []), ...rule.autoTags];
          if (rule.autoCollection) data.collection = rule.autoCollection;
          if (rule.captureFullPage && !data.content) {
            // Will be captured on server side
          }
        }
      }
    }
  } catch {
    // Clip rules are optional, don't block save
  }

  // Check for duplicates
  try {
    const dupeRes = await fetch(`${baseUrl}/api/items/duplicates?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title || "")}`, {
      headers: { Authorization: `Bearer ${apiKey || ""}` },
    });
    if (dupeRes.ok) {
      const dupes = await dupeRes.json();
      if (dupes.length > 0) {
        // Still save but badge will show warning
        chrome.action.setBadgeText({ text: "2x" });
        chrome.action.setBadgeBackgroundColor({ color: "#f59e0b" });
        setTimeout(() => chrome.action.setBadgeText({ text: "" }), 3000);
      }
    }
  } catch {
    // Duplicate check is optional
  }

  try {
    const res = await fetch(`${baseUrl}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey || ""}`,
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      chrome.action.setBadgeText({ text: "\u2713" });
      chrome.action.setBadgeBackgroundColor({ color: "#22c55e" });
      setTimeout(() => chrome.action.setBadgeText({ text: "" }), 2000);
    } else {
      chrome.action.setBadgeText({ text: "!" });
      chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
      setTimeout(() => chrome.action.setBadgeText({ text: "" }), 3000);
    }
  } catch (err) {
    console.error("Memory OS save error:", err);
    chrome.action.setBadgeText({ text: "!" });
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
    setTimeout(() => chrome.action.setBadgeText({ text: "" }), 3000);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SAVE_ITEM") {
    saveItem(msg.data).then(() => sendResponse({ success: true }));
    return true;
  }
});
