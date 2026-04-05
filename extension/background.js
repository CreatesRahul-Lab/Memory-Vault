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
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === "save-to-memory-os") {
    // Get page metadata from content script
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
  else if (url.endsWith(".pdf")) type = "pdf";

  return {
    url,
    title: document.title,
    description: getMeta("og:description") || getMeta("description"),
    domain: window.location.hostname,
    favicon,
    type,
  };
}

async function saveItem(data) {
  const { apiUrl, apiKey } = await chrome.storage.sync.get(["apiUrl", "apiKey"]);
  const baseUrl = apiUrl || "http://localhost:3000";

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
      // Show success badge
      chrome.action.setBadgeText({ text: "✓" });
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
    return true; // async response
  }
});
