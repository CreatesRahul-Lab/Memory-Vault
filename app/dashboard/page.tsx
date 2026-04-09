"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import Toast, { showToast } from "@/components/Toast";

interface ItemData {
  _id: string;
  url: string;
  title: string;
  description: string;
  domain: string;
  favicon: string;
  type: string;
  tags: string[];
  aiTags: string[];
  notes: string;
  content: string;
  summary: string;
  keyPoints: string[];
  highlights: { text: string; color: string; note: string }[];
  collection: string | null;
  duplicateOf: string | null;
  isTask: boolean;
  taskDone: boolean;
  favorite: boolean;
  reviewCount: number;
  createdAt: string;
}

interface StatsData {
  total: number;
  favorites: number;
  types: Record<string, number>;
}

interface TagData {
  tag: string;
  count: number;
}

interface CollectionData {
  _id: string;
  name: string;
  color: string;
  itemCount: number;
}

interface RelatedItem {
  _id: string;
  title: string;
  url: string;
  domain: string;
  type: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("...");
  const [userInitial, setUserInitial] = useState("?");
  const [stats, setStats] = useState<StatsData>({ total: 0, favorites: 0, types: {} });
  const [tags, setTags] = useState<TagData[]>([]);
  const [items, setItems] = useState<ItemData[]>([]);
  const [recentItems, setRecentItems] = useState<ItemData[]>([]);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [favFilter, setFavFilter] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dashboardLoaded, setDashboardLoaded] = useState(false);

  // AI features
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<{ answer: string; sources: { title: string; url: string; snippet: string }[] } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [relatedItems, setRelatedItems] = useState<RelatedItem[]>([]);
  const [reminderItemId, setReminderItemId] = useState<string | null>(null);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderMsg, setReminderMsg] = useState("");

  // Load cached name instantly on mount
  useEffect(() => {
    const cached = localStorage.getItem("mos_userName");
    if (cached) {
      setUserName(cached);
      setUserInitial(cached.charAt(0).toUpperCase());
    }
  }, []);

  // Single API call to load all dashboard data
  const loadDashboard = useCallback(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return;
        if (d.user) {
          setUserName(d.user.name);
          setUserInitial(d.user.name.charAt(0).toUpperCase());
          localStorage.setItem("mos_userName", d.user.name);
        }
        if (d.stats) setStats(d.stats);
        if (d.tags) setTags(d.tags);
        if (d.recentItems) setRecentItems(d.recentItems);
        if (d.collections) setCollections(d.collections);
        setDashboardLoaded(true);
      })
      .catch(() => {});
  }, []);

  const loadStats = useCallback(() => {
    fetch("/api/items/stats").then((r) => r.json()).then((d) => setStats(d)).catch(() => {});
  }, []);

  const loadRecent = useCallback(() => {
    fetch("/api/items?limit=5&page=1").then((r) => r.json()).then((d) => setRecentItems(d.items || [])).catch(() => {});
  }, []);

  const loadItems = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);
    if (tagFilter) params.set("tag", tagFilter);
    if (favFilter) params.set("favorite", "true");
    if (collectionFilter) params.set("collection", collectionFilter);

    fetch(`/api/items?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || []);
        setTotalPages(d.pages || 1);
      })
      .catch(() => {});
  }, [page, search, typeFilter, tagFilter, favFilter, collectionFilter]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  useEffect(() => { loadItems(); }, [loadItems]);

  const toggleFavorite = async (id: string, value: boolean) => {
    await fetch(`/api/items/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ favorite: value }) });
    loadItems();
    loadStats();
    loadRecent();
  };

  const toggleTask = async (id: string, isTask: boolean) => {
    await fetch(`/api/items/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isTask }) });
    loadItems();
    showToast(isTask ? "Marked as task" : "Unmarked as task", "success");
  };

  const toggleTaskDone = async (id: string, done: boolean) => {
    await fetch(`/api/items/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskDone: done }) });
    loadItems();
    showToast(done ? "Task completed!" : "Task reopened", "success");
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/items/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    showToast("Item deleted", "success");
    loadItems(); loadStats(); loadRecent();
  };

  const summarizeItem = async (id: string) => {
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id }),
      });
      if (res.ok) {
        showToast("AI summary generated!", "success");
        loadItems();
      }
    } catch {
      showToast("Failed to summarize", "error");
    }
  };

  const askQuestion = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: aiQuestion }),
      });
      const data = await res.json();
      setAiAnswer(data);
    } catch {
      showToast("Failed to get answer", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const loadRelated = async (id: string) => {
    if (expandedItem === id) { setExpandedItem(null); setRelatedItems([]); return; }
    setExpandedItem(id);
    try {
      const res = await fetch(`/api/items/related?itemId=${id}`);
      const data = await res.json();
      setRelatedItems(Array.isArray(data) ? data : []);
    } catch { setRelatedItems([]); }
  };

  const addToCollection = async (itemId: string, collId: string) => {
    await fetch(`/api/collections/${collId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds: [itemId], action: "add" }),
    });
    showToast("Added to collection!", "success");
    loadItems();
  };

  const setReminder = async () => {
    if (!reminderItemId || !reminderDate) return;
    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: reminderItemId, triggerAt: reminderDate, message: reminderMsg }),
    });
    setReminderItemId(null);
    setReminderDate("");
    setReminderMsg("");
    showToast("Reminder set!", "success");
  };

  const todayCount = recentItems.filter(
    (i) => new Date(i.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const pages = stats.types?.page || 0;
  const videos = stats.types?.video || 0;
  const maxStat = Math.max(pages, videos, stats.favorites, 1);
  const total = stats.total || 0;
  const maxItems = Math.max(total, 100);
  const pct = total / maxItems;
  const circumference = 2 * Math.PI * 68;
  const offset = circumference * (1 - pct);

  const typeIcons: Record<string, string> = { page: "\uD83D\uDCC4", video: "\uD83C\uDFA5", tweet: "\uD83D\uDCAC", pdf: "\uD83D\uDCD1", screenshot: "\uD83D\uDCF7", transcript: "\uD83C\uDF99" };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      <Topbar />
      <div className="main-container">
        {/* Welcome */}
        <div className="welcome-section">
          <h1>Welcome in, <span>{userName}</span></h1>
          <p>Here&apos;s what&apos;s happening with your saved memory today.</p>
        </div>

        {/* AI Ask Bar */}
        <div className="ai-ask-bar">
          <div className="ai-ask-icon">{"\uD83E\uDDE0"}</div>
          <input
            type="text"
            className="ai-ask-input"
            placeholder="Ask a question across your entire library..."
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askQuestion()}
          />
          <button className="btn btn-primary" style={{ width: "auto", padding: "10px 20px" }} onClick={askQuestion} disabled={aiLoading}>
            {aiLoading ? "Thinking..." : "Ask AI"}
          </button>
        </div>

        {aiAnswer && (
          <div className="ai-answer-card">
            <div className="ai-answer-text">{aiAnswer.answer}</div>
            {aiAnswer.sources.length > 0 && (
              <div className="ai-answer-sources">
                <strong style={{ fontSize: 12, color: "var(--text-muted)" }}>Sources:</strong>
                {aiAnswer.sources.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="ai-source-link">
                    {s.title}
                  </a>
                ))}
              </div>
            )}
            <button className="btn-icon" style={{ position: "absolute", top: 12, right: 12 }} onClick={() => setAiAnswer(null)}>&times;</button>
          </div>
        )}

        {/* Stats Bar Row */}
        <div className="stats-bar-row">
          <div className="stats-bar-group">
            {[
              { label: "Pages", value: pages, accent: "accent-1" },
              { label: "Videos", value: videos, accent: "accent-2" },
              { label: "Favorites", value: stats.favorites, accent: "accent-3" },
            ].map((s) => (
              <div className="stat-bar-item" key={s.label}>
                <div className="stat-bar-label">{s.label}</div>
                <div className="stat-bar-track">
                  <div className={`stat-bar-fill ${s.accent}`} style={{ width: `${Math.max((s.value / maxStat) * 100, 8)}%` }}>
                    {s.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="big-stats">
            <div className="big-stat">
              <div className="big-stat-value">{total}</div>
              <div className="big-stat-label"><span className="big-stat-icon">{"\uD83D\uDCC4"}</span>Total</div>
            </div>
            <div className="big-stat">
              <div className="big-stat-value">{stats.favorites}</div>
              <div className="big-stat-label"><span className="big-stat-icon">{"\u2B50"}</span>Favorites</div>
            </div>
            <div className="big-stat">
              <div className="big-stat-value">{tags.length}</div>
              <div className="big-stat-label"><span className="big-stat-icon">{"\uD83C\uDFF7"}</span>Tags</div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Profile Card */}
          <div className="card profile-card">
            <div className="profile-card-bg">
              <div className="profile-avatar">{userInitial}</div>
            </div>
            <div className="profile-card-info">
              <div className="profile-card-name">{userName}</div>
              <div className="profile-card-role">Memory Keeper</div>
              <div className="profile-card-badge">{total} items</div>
            </div>
          </div>

          {/* Activity Card */}
          <div className="card progress-card">
            <div className="card-header"><span className="card-title">Activity</span></div>
            <div className="progress-value">{total}</div>
            <div className="progress-sub">Total items saved</div>
            <div className="bar-chart">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div className="bar-chart-col" key={i}>
                  <div className="bar-group">
                    <div className="bar" style={{ height: `${20 + i * 8}px` }} />
                    <div className="bar active" style={{ height: `${30 + i * 10}px` }} />
                  </div>
                  <div className="bar-label">{day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="card timer-card">
            <div className="card-header"><span className="card-title">Quick Stats</span></div>
            <div className="timer-circle-container">
              <div className="timer-circle">
                <svg viewBox="0 0 160 160">
                  <circle className="circle-bg" cx="80" cy="80" r="68" />
                  <circle className="circle-progress" cx="80" cy="80" r="68" strokeDasharray="427.26" strokeDashoffset={offset} />
                </svg>
                <div className="timer-text">
                  <div className="timer-value">{total}</div>
                  <div className="timer-label">Saved</div>
                </div>
              </div>
            </div>
            <div className="timer-controls">
              <button className="timer-btn" title="Pages">{"\uD83D\uDCC4"}</button>
              <button className="timer-btn primary" title="All Items">{"\uD83D\uDCDA"}</button>
              <button className="timer-btn" title="Videos">{"\uD83C\uDFA5"}</button>
            </div>
          </div>

          {/* Recent Saves Card */}
          <div className="card card-dark tasks-card">
            <div className="card-header"><span className="card-title">Recent Saves</span></div>
            <div className="tasks-counter">
              <span className="tasks-counter-value">{todayCount}</span>
              <span style={{ color: "#999", fontSize: "13px" }}>items today</span>
            </div>
            <div className="task-list">
              {recentItems.length === 0 ? (
                <div className="task-item">
                  <div className="task-info">
                    <div className="task-name" style={{ color: "#999" }}>No items yet</div>
                  </div>
                </div>
              ) : (
                recentItems.map((item) => (
                  <div className="task-item" key={item._id}>
                    <div className="task-icon">{typeIcons[item.type] || "\uD83D\uDCC4"}</div>
                    <div className="task-info">
                      <div className="task-name">
                        {item.title.substring(0, 35)}{item.title.length > 35 ? "..." : ""}
                      </div>
                      <div className="task-meta">{item.domain} &middot; {formatDateShort(item.createdAt)}</div>
                    </div>
                    <div className={`task-check ${item.favorite ? "done" : ""}`} onClick={() => toggleFavorite(item._id, !item.favorite)}>
                      {item.favorite ? "\u2713" : ""}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="items-section">
          <div className="items-section-header"><h3>All Saved Items</h3></div>

          <div className="toolbar">
            <div className="search-wrapper">
              <span className="search-icon">{"\uD83D\uDD0D"}</span>
              <input type="text" className="search-input" placeholder="Search your memory..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="filter-select" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
              <option value="">All Types</option>
              <option value="page">Pages</option>
              <option value="video">Videos</option>
              <option value="tweet">Tweets</option>
              <option value="pdf">PDFs</option>
              <option value="screenshot">Screenshots</option>
              <option value="transcript">Transcripts</option>
            </select>
            <select className="filter-select" value={tagFilter} onChange={(e) => { setTagFilter(e.target.value); setPage(1); }}>
              <option value="">All Tags</option>
              {tags.map((t) => <option key={t.tag} value={t.tag}>{t.tag} ({t.count})</option>)}
            </select>
            <select className="filter-select" value={collectionFilter} onChange={(e) => { setCollectionFilter(e.target.value); setPage(1); }}>
              <option value="">All Collections</option>
              {collections.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.itemCount})</option>)}
            </select>
            <button className={`filter-btn ${favFilter ? "active" : ""}`} onClick={() => { setFavFilter(!favFilter); setPage(1); }}>
              {"\u2733"} Favorites
            </button>
          </div>

          {/* Items Grid */}
          {items.length > 0 ? (
            <div className="items-grid">
              {items.map((item) => (
                <div className={`item-card ${item.duplicateOf ? "item-card-dupe" : ""}`} key={item._id}>
                  <div className="item-header">
                    {item.favicon && <img className="item-favicon" src={item.favicon} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                    <div className="item-title">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                    </div>
                    <span className={`item-type ${item.type}`}>{item.type}</span>
                  </div>
                  <div className="item-domain">{item.domain}</div>
                  {item.duplicateOf && <div className="item-dupe-badge">Possible duplicate</div>}
                  {item.summary && (
                    <div className="item-ai-summary">
                      <span className="ai-badge">AI</span> {item.summary}
                    </div>
                  )}
                  {item.keyPoints && item.keyPoints.length > 0 && (
                    <ul className="item-key-points">
                      {item.keyPoints.slice(0, 3).map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  )}
                  {item.description && !item.summary && <div className="item-description">{item.description}</div>}
                  {(item.tags?.length > 0 || item.aiTags?.length > 0) && (
                    <div className="item-tags">
                      {item.tags?.map((t) => <span className="tag" key={t}>{t}</span>)}
                      {item.aiTags?.map((t) => <span className="tag ai-tag" key={`ai-${t}`}>{t}</span>)}
                    </div>
                  )}
                  {item.highlights && item.highlights.length > 0 && (
                    <div className="item-highlights">
                      {item.highlights.map((h, i) => (
                        <div key={i} className="highlight-item" style={{ borderLeftColor: h.color }}>
                          &ldquo;{h.text}&rdquo;
                          {h.note && <span className="highlight-note">{h.note}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {item.notes && <div className="item-description" style={{ fontStyle: "italic" }}>{item.notes}</div>}
                  <div className="item-footer">
                    <span className="item-date">{formatDate(item.createdAt)}</span>
                    <div className="item-actions">
                      <button className="btn-icon" onClick={() => router.push(`/items/${item._id}`)} title="View Details">{"\uD83D\uDC41"}</button>
                      {!item.summary && (
                        <button className="btn-icon" onClick={() => summarizeItem(item._id)} title="AI Summarize">{"\uD83E\uDDE0"}</button>
                      )}
                      <button className="btn-icon" onClick={() => loadRelated(item._id)} title="Related Items">{"\uD83D\uDD17"}</button>
                      <button className={`btn-icon ${item.isTask ? "active-icon" : ""}`}
                        onClick={() => item.isTask ? toggleTaskDone(item._id, !item.taskDone) : toggleTask(item._id, true)}
                        title={item.isTask ? (item.taskDone ? "Reopen task" : "Complete task") : "Make task"}>
                        {item.isTask ? (item.taskDone ? "\u2705" : "\u2B1C") : "\u2610"}
                      </button>
                      <button className="btn-icon" onClick={() => setReminderItemId(item._id)} title="Set Reminder">{"\uD83D\uDD14"}</button>
                      {collections.length > 0 && (
                        <select className="mini-select" value="" onChange={(e) => { if (e.target.value) addToCollection(item._id, e.target.value); }} title="Add to collection">
                          <option value="">+</option>
                          {collections.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      )}
                      <button className={`favorite-btn ${item.favorite ? "active" : ""}`} onClick={() => toggleFavorite(item._id, !item.favorite)} title="Favorite">
                        {item.favorite ? "\u2733" : "\u2734"}
                      </button>
                      <button className="btn-icon" onClick={() => setDeleteId(item._id)} title="Delete">{"\uD83D\uDDD1"}</button>
                    </div>
                  </div>
                  {/* Related Items Panel */}
                  {expandedItem === item._id && relatedItems.length > 0 && (
                    <div className="related-panel">
                      <strong style={{ fontSize: 12, color: "var(--text-muted)" }}>Related Items</strong>
                      {relatedItems.map((r) => (
                        <a key={r._id} href={r.url} target="_blank" rel="noopener noreferrer" className="related-link">
                          <span className={`item-type ${r.type}`} style={{ fontSize: 10 }}>{r.type}</span>
                          {r.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">{"\uD83D\uDCDA"}</div>
              <h3>No items saved yet</h3>
              <p>Install the browser extension and start saving pages, articles, and videos to your memory.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>&larr; Prev</button>
              <span className="page-info">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next &rarr;</button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <div className={`modal-overlay ${deleteId ? "visible" : ""}`}>
        <div className="modal">
          <h3>Delete Item</h3>
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
          </div>
        </div>
      </div>

      {/* Reminder Modal */}
      <div className={`modal-overlay ${reminderItemId ? "visible" : ""}`}>
        <div className="modal">
          <h3>Set Reminder</h3>
          <div className="form-group">
            <label>When</label>
            <input type="datetime-local" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Message (optional)</label>
            <input type="text" value={reminderMsg} onChange={(e) => setReminderMsg(e.target.value)} placeholder="Review this article" />
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setReminderItemId(null)}>Cancel</button>
            <button className="btn btn-primary" style={{ width: "auto" }} onClick={setReminder}>Set Reminder</button>
          </div>
        </div>
      </div>

      <Toast />
    </>
  );
}
