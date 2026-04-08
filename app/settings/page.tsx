"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import Toast, { showToast } from "@/components/Toast";

interface ApiKeyData {
  _id: string; name: string; key: string; fullKey: string; active: boolean; lastUsed: string | null; createdAt: string;
}
interface WebhookData {
  _id: string; name: string; url: string; events: string[]; active: boolean; lastTriggered: string | null; failCount: number; secret?: string;
}
interface ClipRuleData {
  _id: string; name: string; pattern: string; matchType: string; autoTags: string[]; captureFullPage: boolean; active: boolean; hitCount: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [keyName, setKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keysLoading, setKeysLoading] = useState(true);
  const [tab, setTab] = useState<"profile" | "webhooks" | "clips" | "data">("profile");

  // Digest settings
  const [digestFreq, setDigestFreq] = useState("off");
  const [digestHour, setDigestHour] = useState(9);
  const [spacedRep, setSpacedRep] = useState(false);

  // Webhooks
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [whName, setWhName] = useState("");
  const [whUrl, setWhUrl] = useState("");
  const [whEvents, setWhEvents] = useState<string[]>(["item.created"]);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  // Clip rules
  const [clipRules, setClipRules] = useState<ClipRuleData[]>([]);
  const [crName, setCrName] = useState("");
  const [crPattern, setCrPattern] = useState("");
  const [crMatchType, setCrMatchType] = useState("domain");
  const [crAutoTags, setCrAutoTags] = useState("");

  // Import
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (r) => { if (r.status === 401) { router.push("/login"); return null; } return r.json(); })
      .then((d) => {
        if (d?.user) {
          setProfileName(d.user.name);
          setProfileEmail(d.user.email);
          setDigestFreq(d.user.digestFrequency || "off");
          setDigestHour(d.user.digestHour ?? 9);
          setSpacedRep(d.user.spacedRepetition || false);
        }
      })
      .catch(() => {});
    loadApiKeys();
    loadWebhooks();
    loadClipRules();
  }, []);

  const loadApiKeys = async () => {
    try {
      const res = await fetch("/api/keys", { credentials: "include" });
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setKeys(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load API keys", "error"); } finally { setKeysLoading(false); }
  };

  const loadWebhooks = async () => {
    try { const res = await fetch("/api/webhooks"); const data = await res.json(); setWebhooks(Array.isArray(data) ? data : []); } catch { /* */ }
  };

  const loadClipRules = async () => {
    try { const res = await fetch("/api/clips"); const data = await res.json(); setClipRules(Array.isArray(data) ? data : []); } catch { /* */ }
  };

  const generateKey = async () => {
    if (!keyName.trim()) { showToast("Please enter a key name", "error"); return; }
    try {
      const res = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ name: keyName }) });
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      if (res.ok) { setNewKey(data.key); setKeyName(""); showToast("API key generated!", "success"); loadApiKeys(); }
      else showToast(data.error || "Failed to create key", "error");
    } catch { showToast("Connection error", "error"); }
  };

  const copyKey = async (key: string) => {
    try { await navigator.clipboard.writeText(key); showToast("Copied to clipboard!", "success"); } catch { showToast("Failed to copy", "error"); }
  };

  const toggleKey = async (id: string) => {
    await fetch(`/api/keys/${id}`, { method: "PATCH", credentials: "include" });
    loadApiKeys(); showToast("Key updated", "success");
  };

  const deleteKey = async (id: string) => {
    if (!confirm("Delete this API key?")) return;
    await fetch(`/api/keys/${id}`, { method: "DELETE", credentials: "include" });
    loadApiKeys(); showToast("Key deleted", "success");
  };

  const createWebhook = async () => {
    if (!whName || !whUrl) { showToast("Name and URL required", "error"); return; }
    const res = await fetch("/api/webhooks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: whName, url: whUrl, events: whEvents }) });
    if (res.ok) {
      const data = await res.json();
      setNewSecret(data.secret);
      setWhName(""); setWhUrl(""); setWhEvents(["item.created"]);
      loadWebhooks(); showToast("Webhook created!", "success");
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm("Delete this webhook?")) return;
    await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
    loadWebhooks(); showToast("Webhook deleted", "success");
  };

  const toggleWebhook = async (id: string, active: boolean) => {
    await fetch(`/api/webhooks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
    loadWebhooks();
  };

  const createClipRule = async () => {
    if (!crName || !crPattern) { showToast("Name and pattern required", "error"); return; }
    const res = await fetch("/api/clips", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: crName, pattern: crPattern, matchType: crMatchType, autoTags: crAutoTags.split(",").map((t) => t.trim()).filter(Boolean) }),
    });
    if (res.ok) { setCrName(""); setCrPattern(""); setCrAutoTags(""); loadClipRules(); showToast("Clip rule created!", "success"); }
  };

  const deleteClipRule = async (id: string) => {
    if (!confirm("Delete this clip rule?")) return;
    await fetch(`/api/clips/${id}`, { method: "DELETE" });
    loadClipRules(); showToast("Rule deleted", "success");
  };

  const exportData = async (format: string) => {
    window.open(`/api/items/export?format=${format}`, "_blank");
    showToast("Export started!", "success");
  };

  const handleImport = async () => {
    if (!importFile) return;
    try {
      const text = await importFile.text();
      const data = JSON.parse(text);
      const res = await fetch("/api/items/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await res.json();
      setImportResult(`Imported: ${result.imported}, Skipped: ${result.skipped}, Collections: ${result.collectionsCreated}`);
      showToast("Import complete!", "success");
    } catch {
      showToast("Failed to import - invalid file", "error");
    }
  };

  const deleteAllItems = async () => {
    if (!confirm("DELETE ALL ITEMS? This cannot be undone!")) return;
    if (!confirm("Are you really sure?")) return;
    try {
      const res = await fetch("/api/items?limit=1000");
      const data = await res.json();
      for (const item of data.items) { await fetch(`/api/items/${item._id}`, { method: "DELETE" }); }
      showToast("All items deleted", "success");
    } catch { showToast("Failed to delete items", "error"); }
  };

  const handleLogout = async () => {
    if (!confirm("Sign out?")) return;
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const allEvents = ["item.created", "item.updated", "item.deleted", "collection.updated"];

  return (
    <>
      <Topbar />
      <main className="main-container">
        <div className="welcome-section">
          <h1>Settings</h1>
          <p>Manage your profile, integrations, automation rules, and data.</p>
        </div>

        {/* Settings Tabs */}
        <div className="review-tabs" style={{ marginBottom: 24 }}>
          {([
            { key: "profile", label: "Profile & Keys" },
            { key: "webhooks", label: "Webhooks" },
            { key: "clips", label: "Clip Rules" },
            { key: "data", label: "Data & Export" },
          ] as const).map((t) => (
            <button key={t.key} className={`review-tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === "profile" && (
          <div className="settings-grid">
            <div className="settings-left">
              <div className="settings-section">
                <h3>Profile</h3>
                <form onSubmit={(e) => { e.preventDefault(); showToast("Profile updated!", "success"); }}>
                  <div className="form-group">
                    <label htmlFor="profile-name">Name</label>
                    <input type="text" id="profile-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="profile-email">Email</label>
                    <input type="email" id="profile-email" value={profileEmail} disabled style={{ opacity: 0.6 }} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ maxWidth: 200 }}>Update Profile</button>
                </form>
              </div>

              <div className="settings-section">
                <h3>Review & Digest</h3>
                <div className="form-group">
                  <label>Digest Frequency</label>
                  <select className="filter-select" style={{ width: "100%" }} value={digestFreq} onChange={(e) => setDigestFreq(e.target.value)}>
                    <option value="off">Off</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                {digestFreq !== "off" && (
                  <div className="form-group">
                    <label>Digest Hour</label>
                    <select className="filter-select" style={{ width: "100%" }} value={digestHour} onChange={(e) => setDigestHour(Number(e.target.value))}>
                      {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i}:00</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={spacedRep} onChange={(e) => setSpacedRep(e.target.checked)} id="spaced-rep" />
                  <label htmlFor="spaced-rep" style={{ marginBottom: 0 }}>Enable spaced repetition reviews</label>
                </div>
              </div>

              <div className="settings-section">
                <h3>Browser Extension Setup</h3>
                <div className="setup-steps">
                  {[
                    "Install the Memory OS browser extension",
                    "Click the extension icon and go to Settings",
                    <>Set the <strong>API URL</strong> to: <code className="code-inline">{typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}</code></>,
                    <>Paste your <strong>API Key</strong> from the panel on the right</>,
                    "Save and start saving pages!",
                  ].map((step, i) => (
                    <div className="setup-step" key={i}>
                      <span className="setup-step-num">{i + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="settings-section settings-danger">
                <h3>Danger Zone</h3>
                <p className="settings-desc">Delete all your saved items. This cannot be undone.</p>
                <div className="settings-danger-actions">
                  <button className="btn btn-danger btn-sm" onClick={deleteAllItems}>Delete All Items</button>
                  <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Sign Out</button>
                </div>
              </div>
            </div>

            <div className="settings-right">
              <div className="settings-section">
                <h3>API Keys</h3>
                <p className="settings-desc">Use API keys to authenticate the browser extension or integrate with other tools.</p>
                <div className="create-key-form">
                  <input type="text" placeholder='Key name (e.g., Chrome Extension)' value={keyName} onChange={(e) => setKeyName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generateKey()} />
                  <button className="btn btn-primary" style={{ minWidth: 150, maxWidth: 150 }} onClick={generateKey}>Generate Key</button>
                </div>
                {newKey && (
                  <div className="key-new-value">
                    <span className="label">New API Key &mdash; Copy it now!</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <code style={{ flex: 1, wordBreak: "break-all" }}>{newKey}</code>
                      <button className="btn btn-secondary btn-sm" onClick={() => copyKey(newKey)}>Copy</button>
                    </div>
                  </div>
                )}
                <div className="api-key-list">
                  {keysLoading ? (
                    <p className="settings-desc" style={{ textAlign: "center", padding: "20px 0" }}>Loading keys...</p>
                  ) : keys.length === 0 ? (
                    <p className="settings-desc" style={{ textAlign: "center", padding: "20px 0" }}>No API keys yet.</p>
                  ) : (
                    keys.map((k) => (
                      <div className="api-key-item" key={k._id}>
                        <div className="key-info">
                          <div className="key-name">{k.name}</div>
                          <div className="key-value">{k.key}</div>
                          <div className="key-meta">Created {formatDate(k.createdAt)}{k.lastUsed ? ` \u00B7 Last used ${formatDate(k.lastUsed)}` : " \u00B7 Never used"}</div>
                        </div>
                        <div className="key-actions">
                          <span className={`status-badge ${k.active ? "active" : "inactive"}`}>{k.active ? "Active" : "Inactive"}</span>
                          <button className="btn btn-secondary btn-sm" onClick={() => copyKey(k.fullKey)}>Copy</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => toggleKey(k._id)}>{k.active ? "Disable" : "Enable"}</button>
                          <button className="btn-icon" onClick={() => deleteKey(k._id)} title="Delete">{"\u{1F5D1}"}</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Webhooks Tab */}
        {tab === "webhooks" && (
          <div className="settings-section" style={{ maxWidth: 800 }}>
            <h3>Webhooks</h3>
            <p className="settings-desc">Get notified when items are created, updated, or deleted. Webhooks send POST requests with signed payloads.</p>

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <input type="text" value={whName} onChange={(e) => setWhName(e.target.value)} placeholder="Webhook name" style={{ flex: 1, minWidth: 150, padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 14 }} />
              <input type="url" value={whUrl} onChange={(e) => setWhUrl(e.target.value)} placeholder="https://your-endpoint.com/hook" style={{ flex: 2, minWidth: 250, padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 14 }} />
              <button className="btn btn-primary" style={{ width: "auto" }} onClick={createWebhook}>Create</button>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {allEvents.map((ev) => (
                <label key={ev} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                  <input type="checkbox" checked={whEvents.includes(ev)} onChange={(e) => { if (e.target.checked) setWhEvents([...whEvents, ev]); else setWhEvents(whEvents.filter((x) => x !== ev)); }} />
                  {ev}
                </label>
              ))}
            </div>

            {newSecret && (
              <div className="key-new-value" style={{ marginTop: 16 }}>
                <span className="label">Webhook Secret &mdash; Save it now!</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                  <code style={{ flex: 1, wordBreak: "break-all", fontSize: 11 }}>{newSecret}</code>
                  <button className="btn btn-secondary btn-sm" onClick={() => copyKey(newSecret)}>Copy</button>
                </div>
              </div>
            )}

            <div className="api-key-list" style={{ marginTop: 20 }}>
              {webhooks.map((wh) => (
                <div className="api-key-item" key={wh._id}>
                  <div className="key-info">
                    <div className="key-name">{wh.name}</div>
                    <div className="key-value">{wh.url}</div>
                    <div className="key-meta">Events: {wh.events.join(", ")} {wh.lastTriggered ? ` \u00B7 Last: ${formatDate(wh.lastTriggered)}` : ""} {wh.failCount > 0 ? ` \u00B7 Fails: ${wh.failCount}` : ""}</div>
                  </div>
                  <div className="key-actions">
                    <span className={`status-badge ${wh.active ? "active" : "inactive"}`}>{wh.active ? "Active" : "Inactive"}</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => toggleWebhook(wh._id, wh.active)}>{wh.active ? "Disable" : "Enable"}</button>
                    <button className="btn-icon" onClick={() => deleteWebhook(wh._id)} title="Delete">{"\u{1F5D1}"}</button>
                  </div>
                </div>
              ))}
              {webhooks.length === 0 && <p className="settings-desc" style={{ textAlign: "center", padding: "20px 0" }}>No webhooks configured.</p>}
            </div>
          </div>
        )}

        {/* Clip Rules Tab */}
        {tab === "clips" && (
          <div className="settings-section" style={{ maxWidth: 800 }}>
            <h3>Auto-Clip Rules</h3>
            <p className="settings-desc">Automatically tag and organize items based on URL patterns. When you save a page that matches a rule, tags and collection are applied automatically.</p>

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <input type="text" value={crName} onChange={(e) => setCrName(e.target.value)} placeholder="Rule name" style={{ flex: 1, minWidth: 120, padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 14 }} />
              <select className="filter-select" value={crMatchType} onChange={(e) => setCrMatchType(e.target.value)}>
                <option value="domain">Domain</option>
                <option value="url_contains">URL Contains</option>
                <option value="title_contains">Title Contains</option>
              </select>
              <input type="text" value={crPattern} onChange={(e) => setCrPattern(e.target.value)} placeholder="e.g. github.com" style={{ flex: 2, minWidth: 200, padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 14 }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <input type="text" value={crAutoTags} onChange={(e) => setCrAutoTags(e.target.value)} placeholder="Auto-tags (comma-separated)" style={{ flex: 1, padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 14 }} />
              <button className="btn btn-primary" style={{ width: "auto" }} onClick={createClipRule}>Create Rule</button>
            </div>

            <div className="api-key-list" style={{ marginTop: 20 }}>
              {clipRules.map((rule) => (
                <div className="api-key-item" key={rule._id}>
                  <div className="key-info">
                    <div className="key-name">{rule.name}</div>
                    <div className="key-value">{rule.matchType}: {rule.pattern}</div>
                    <div className="key-meta">Tags: {rule.autoTags.join(", ") || "none"} &middot; Hits: {rule.hitCount}</div>
                  </div>
                  <div className="key-actions">
                    <span className={`status-badge ${rule.active ? "active" : "inactive"}`}>{rule.active ? "Active" : "Inactive"}</span>
                    <button className="btn-icon" onClick={() => deleteClipRule(rule._id)} title="Delete">{"\u{1F5D1}"}</button>
                  </div>
                </div>
              ))}
              {clipRules.length === 0 && <p className="settings-desc" style={{ textAlign: "center", padding: "20px 0" }}>No clip rules yet.</p>}
            </div>
          </div>
        )}

        {/* Data Tab */}
        {tab === "data" && (
          <div style={{ maxWidth: 800 }}>
            <div className="settings-section" style={{ marginBottom: 20 }}>
              <h3>Export Data</h3>
              <p className="settings-desc">Download all your saved items and collections. Your data belongs to you.</p>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button className="btn btn-primary" style={{ width: "auto" }} onClick={() => exportData("json")}>Export as JSON</button>
                <button className="btn btn-secondary" onClick={() => exportData("csv")}>Export as CSV</button>
              </div>
            </div>

            <div className="settings-section" style={{ marginBottom: 20 }}>
              <h3>Import Data</h3>
              <p className="settings-desc">Import items from a previously exported JSON file. Duplicates (same URL) will be skipped.</p>
              <div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "center" }}>
                <input type="file" accept=".json" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                <button className="btn btn-primary" style={{ width: "auto" }} onClick={handleImport} disabled={!importFile}>Import</button>
              </div>
              {importResult && (
                <div className="key-new-value" style={{ marginTop: 12 }}>
                  <span className="label">Import Result</span>
                  <p style={{ marginTop: 4, fontSize: 13 }}>{importResult}</p>
                </div>
              )}
            </div>

            <div className="settings-section">
              <h3>Version History</h3>
              <p className="settings-desc">
                Every time you edit an item&apos;s title, notes, content, or tags, a version snapshot is automatically saved.
                You can view and restore previous versions from each item&apos;s detail view.
              </p>
            </div>
          </div>
        )}
      </main>
      <Toast />
    </>
  );
}
