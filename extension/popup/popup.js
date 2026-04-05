let pageData = null;

// Elements
const mainView = document.getElementById("main-view");
const settingsView = document.getElementById("settings-view");
const settingsBtn = document.getElementById("settings-btn");
const backBtn = document.getElementById("back-btn");
const pageTitle = document.getElementById("page-title");
const pageDomain = document.getElementById("page-domain");
const tagsInput = document.getElementById("tags-input");
const notesInput = document.getElementById("notes-input");
const selectedTextGroup = document.getElementById("selected-text-group");
const selectedTextEl = document.getElementById("selected-text");
const saveBtn = document.getElementById("save-btn");
const statusEl = document.getElementById("status");
const apiUrlInput = document.getElementById("api-url");
const apiKeyInput = document.getElementById("api-key");
const saveSettingsBtn = document.getElementById("save-settings");

// Toggle settings
settingsBtn.addEventListener("click", () => {
  mainView.style.display = "none";
  settingsView.style.display = "block";
  loadSettings();
});

backBtn.addEventListener("click", () => {
  settingsView.style.display = "none";
  mainView.style.display = "block";
});

// Load settings
async function loadSettings() {
  const { apiUrl, apiKey } = await chrome.storage.sync.get(["apiUrl", "apiKey"]);
  apiUrlInput.value = apiUrl || "http://localhost:3000";
  apiKeyInput.value = apiKey || "";
}

// Save settings
saveSettingsBtn.addEventListener("click", async () => {
  await chrome.storage.sync.set({
    apiUrl: apiUrlInput.value.replace(/\/$/, ""),
    apiKey: apiKeyInput.value,
  });
  settingsView.style.display = "none";
  mainView.style.display = "block";
});

// Get page data from content script
async function getPageData() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    const response = await chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_DATA" });
    pageData = response;

    pageTitle.textContent = response.title || "Untitled";
    pageDomain.textContent = response.domain || "";

    if (response.selectedText) {
      selectedTextGroup.style.display = "block";
      selectedTextEl.textContent = response.selectedText;
    }
  } catch (err) {
    pageTitle.textContent = "Unable to read page data";
    pageDomain.textContent = "Make sure you're on a regular webpage";
  }
}

// Save item
saveBtn.addEventListener("click", async () => {
  if (!pageData) return;

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";
  statusEl.textContent = "";
  statusEl.className = "status";

  const tags = tagsInput.value
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const data = {
    ...pageData,
    tags,
    notes: notesInput.value || undefined,
    content: pageData.selectedText || undefined,
  };
  delete data.selectedText;

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
      statusEl.textContent = "Saved successfully!";
      statusEl.className = "status success";
      saveBtn.textContent = "Saved!";
      setTimeout(() => window.close(), 1500);
    } else {
      const err = await res.json();
      statusEl.textContent = err.error || "Failed to save";
      statusEl.className = "status error";
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Page";
    }
  } catch (err) {
    statusEl.textContent = "Connection error. Check settings.";
    statusEl.className = "status error";
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Page";
  }
});

// Keyboard shortcut
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    saveBtn.click();
  }
});

// Init
getPageData();
