"use client";

import { useEffect, useState, useCallback } from "react";
import Topbar from "@/components/Topbar";
import Toast, { showToast } from "@/components/Toast";

interface ReviewItem {
  _id: string;
  title: string;
  url: string;
  domain: string;
  type: string;
  tags: string[];
  summary: string;
  keyPoints?: string[];
  notes: string;
  createdAt: string;
  nextReviewDate?: string;
  reviewCount?: number;
}

interface DigestData {
  period: string;
  stats: { totalSaved: number; favoritedCount: number; reviewDue: number; tasksPending: number };
  topTags: { tag: string; count: number }[];
  recentItems: ReviewItem[];
  resurfaced: ReviewItem[];
}

interface ReminderData {
  _id: string;
  item: { _id: string; title: string; url: string; type: string };
  triggerAt: string;
  message: string;
  fired: boolean;
}

export default function ReviewPage() {
  const [tab, setTab] = useState<"review" | "digest" | "reminders" | "tasks">("digest");
  const [dueItems, setDueItems] = useState<ReviewItem[]>([]);
  const [resurfaced, setResurfaced] = useState<ReviewItem[]>([]);
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [reminders, setReminders] = useState<ReminderData[]>([]);
  const [dueReminders, setDueReminders] = useState<ReminderData[]>([]);
  const [tasks, setTasks] = useState<ReviewItem[]>([]);
  const [currentReview, setCurrentReview] = useState(0);

  const loadReview = useCallback(async () => {
    try {
      const res = await fetch("/api/review");
      const data = await res.json();
      setDueItems(data.dueItems || []);
      setResurfaced(data.resurfaced || []);
    } catch { /* */ }
  }, []);

  const loadDigest = useCallback(async () => {
    try {
      const res = await fetch("/api/digest?period=daily");
      const data = await res.json();
      setDigest(data);
    } catch { /* */ }
  }, []);

  const loadReminders = useCallback(async () => {
    try {
      const res = await fetch("/api/reminders");
      const data = await res.json();
      setReminders(data.reminders || []);
      setDueReminders(data.due || []);
    } catch { /* */ }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/items?isTask=true&taskDone=false&limit=50");
      const data = await res.json();
      setTasks(data.items || []);
    } catch { /* */ }
  }, []);

  useEffect(() => {
    loadDigest();
    loadReview();
    loadReminders();
    loadTasks();
  }, [loadDigest, loadReview, loadReminders, loadTasks]);

  const submitReview = async (itemId: string, quality: number) => {
    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quality }),
      });
      showToast("Review submitted!", "success");
      setCurrentReview((prev) => prev + 1);
      loadReview();
    } catch {
      showToast("Failed to submit review", "error");
    }
  };

  const toggleTask = async (itemId: string, done: boolean) => {
    await fetch(`/api/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskDone: done }),
    });
    loadTasks();
    showToast(done ? "Task completed!" : "Task reopened", "success");
  };

  const deleteReminder = async (id: string) => {
    await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    loadReminders();
    showToast("Reminder deleted", "success");
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (d: string) => new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  const currentItem = dueItems[currentReview];

  return (
    <>
      <Topbar />
      <div className="main-container">
        <div className="welcome-section">
          <h1>Review & Digest</h1>
          <p>Stay on top of your saved knowledge with spaced repetition, digests, reminders, and tasks.</p>
        </div>

        {/* Tab Bar */}
        <div className="review-tabs">
          {([
            { key: "digest", label: "Daily Digest", count: digest?.stats.totalSaved },
            { key: "review", label: "Spaced Review", count: dueItems.length },
            { key: "tasks", label: "Tasks", count: tasks.length },
            { key: "reminders", label: "Reminders", count: dueReminders.length },
          ] as const).map((t) => (
            <button
              key={t.key}
              className={`review-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && <span className="review-tab-badge">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Digest Tab */}
        {tab === "digest" && digest && (
          <div className="review-content">
            <div className="digest-stats">
              {[
                { label: "Saved", value: digest.stats.totalSaved, icon: "\u{1F4C4}" },
                { label: "Favorited", value: digest.stats.favoritedCount, icon: "\u2B50" },
                { label: "Due for Review", value: digest.stats.reviewDue, icon: "\u{1F504}" },
                { label: "Tasks Pending", value: digest.stats.tasksPending, icon: "\u2705" },
              ].map((s) => (
                <div className="digest-stat-card" key={s.label}>
                  <div className="digest-stat-icon">{s.icon}</div>
                  <div className="digest-stat-value">{s.value}</div>
                  <div className="digest-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {digest.topTags.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header"><span className="card-title">Top Tags Today</span></div>
                <div className="item-tags">
                  {digest.topTags.map((t) => (
                    <span className="tag" key={t.tag}>{t.tag} ({t.count})</span>
                  ))}
                </div>
              </div>
            )}

            {digest.recentItems.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header"><span className="card-title">Recent Saves</span></div>
                <div className="task-list">
                  {digest.recentItems.map((item) => (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="task-item" key={item._id} style={{ textDecoration: "none", background: "var(--surface-alt)" }}>
                      <div className="task-info">
                        <div className="task-name" style={{ color: "var(--text)" }}>{item.title}</div>
                        <div className="task-meta">{item.domain} &middot; {formatDate(item.createdAt)}</div>
                      </div>
                      <span className={`item-type ${item.type}`}>{item.type}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {digest.resurfaced.length > 0 && (
              <div className="card">
                <div className="card-header"><span className="card-title">From Your Archive</span></div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>Rediscover items you saved a while ago.</p>
                <div className="task-list">
                  {digest.resurfaced.map((item) => (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="task-item" key={item._id} style={{ textDecoration: "none", background: "var(--surface-alt)" }}>
                      <div className="task-info">
                        <div className="task-name" style={{ color: "var(--text)" }}>{item.title}</div>
                        <div className="task-meta">{item.domain} &middot; Saved {formatDate(item.createdAt)}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Review Tab */}
        {tab === "review" && (
          <div className="review-content">
            {currentItem ? (
              <div className="review-card">
                <div className="review-card-progress">
                  {currentReview + 1} / {dueItems.length} items
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{currentItem.title}</h2>
                <a href={currentItem.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--primary)" }}>
                  {currentItem.domain}
                </a>
                {currentItem.summary && (
                  <div style={{ marginTop: 16, padding: 16, background: "var(--surface-alt)", borderRadius: 12 }}>
                    <strong style={{ fontSize: 12, color: "var(--text-muted)" }}>AI Summary</strong>
                    <p style={{ fontSize: 14, marginTop: 4, lineHeight: 1.6 }}>{currentItem.summary}</p>
                  </div>
                )}
                {currentItem.keyPoints && currentItem.keyPoints.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <strong style={{ fontSize: 12, color: "var(--text-muted)" }}>Key Points</strong>
                    <ul style={{ marginTop: 4, paddingLeft: 20, fontSize: 13, lineHeight: 1.8 }}>
                      {currentItem.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
                {currentItem.notes && (
                  <div style={{ marginTop: 12, fontStyle: "italic", fontSize: 13, color: "var(--text-secondary)" }}>
                    Your notes: {currentItem.notes}
                  </div>
                )}
                <div className="review-rating">
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>How well do you remember this?</p>
                  <div className="review-buttons">
                    {[
                      { q: 1, label: "Forgot", color: "#ef4444" },
                      { q: 2, label: "Hard", color: "#f97316" },
                      { q: 3, label: "Okay", color: "#eab308" },
                      { q: 4, label: "Good", color: "#22c55e" },
                      { q: 5, label: "Easy", color: "#3b82f6" },
                    ].map((r) => (
                      <button
                        key={r.q}
                        className="review-rating-btn"
                        style={{ borderColor: r.color, color: r.color }}
                        onClick={() => submitReview(currentItem._id, r.q)}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">{"\u2705"}</div>
                <h3>All caught up!</h3>
                <p>No items due for review right now.</p>
              </div>
            )}

            {resurfaced.length > 0 && (
              <div className="card" style={{ marginTop: 24 }}>
                <div className="card-header"><span className="card-title">Resurface: Remember These?</span></div>
                <div className="items-grid">
                  {resurfaced.map((item) => (
                    <div className="item-card" key={item._id}>
                      <div className="item-title">
                        <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                      </div>
                      <div className="item-domain">{item.domain}</div>
                      <div className="item-footer">
                        <span className="item-date">Saved {formatDate(item.createdAt)}</span>
                        <button className="btn btn-secondary btn-sm" onClick={() => submitReview(item._id, 3)}>
                          Start Reviewing
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {tab === "tasks" && (
          <div className="review-content">
            {tasks.length > 0 ? (
              <div className="task-list">
                {tasks.map((item) => (
                  <div className="task-item" key={item._id} style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div
                      className="task-check"
                      onClick={() => toggleTask(item._id, true)}
                      style={{ borderColor: "var(--primary)", cursor: "pointer" }}
                    />
                    <div className="task-info">
                      <div className="task-name" style={{ color: "var(--text)" }}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                      </div>
                      <div className="task-meta">{item.domain} &middot; {formatDate(item.createdAt)}</div>
                    </div>
                    <span className={`item-type ${item.type}`}>{item.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">{"\u2705"}</div>
                <h3>No pending tasks</h3>
                <p>Mark items as tasks from the dashboard to track them here.</p>
              </div>
            )}
          </div>
        )}

        {/* Reminders Tab */}
        {tab === "reminders" && (
          <div className="review-content">
            {dueReminders.length > 0 && (
              <div className="card" style={{ marginBottom: 20, borderColor: "var(--primary)" }}>
                <div className="card-header"><span className="card-title">Due Now</span></div>
                <div className="task-list">
                  {dueReminders.map((r) => (
                    <div className="task-item" key={r._id} style={{ background: "var(--primary-light)" }}>
                      <div className="task-info">
                        <div className="task-name" style={{ color: "var(--text)" }}>
                          {r.item?.title || "Unknown item"}
                        </div>
                        <div className="task-meta">{r.message || "Reminder"} &middot; {formatTime(r.triggerAt)}</div>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => deleteReminder(r._id)}>Dismiss</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reminders.length > 0 ? (
              <div className="task-list">
                {reminders.map((r) => (
                  <div className="task-item" key={r._id} style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="task-info">
                      <div className="task-name" style={{ color: "var(--text)" }}>
                        {r.item?.title || "Unknown item"}
                      </div>
                      <div className="task-meta">{r.message || "Reminder"} &middot; {formatTime(r.triggerAt)}</div>
                    </div>
                    <button className="btn-icon" onClick={() => deleteReminder(r._id)} title="Delete">{"\u{1F5D1}"}</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">{"\u{1F514}"}</div>
                <h3>No reminders</h3>
                <p>Set reminders on items from the dashboard.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Toast />
    </>
  );
}
