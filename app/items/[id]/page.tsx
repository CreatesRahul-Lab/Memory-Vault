"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  collection: { _id: string; name: string; color: string } | null;
  duplicateOf: string | null;
  isTask: boolean;
  taskDone: boolean;
  favorite: boolean;
  reviewCount: number;
  nextReviewDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CommentData {
  _id: string;
  user: { _id: string; name: string; email: string };
  text: string;
  createdAt: string;
}

interface VersionData {
  _id: string;
  version: number;
  changeNote: string;
  snapshot: Record<string, unknown>;
  createdAt: string;
}

interface RelatedItem {
  _id: string;
  title: string;
  url: string;
  domain: string;
  type: string;
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<ItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"content" | "comments" | "versions" | "related">("content");

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editTags, setEditTags] = useState("");

  // Comments
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Versions
  const [versions, setVersions] = useState<VersionData[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  // Related
  const [related, setRelated] = useState<RelatedItem[]>([]);

  const loadItem = useCallback(async () => {
    try {
      const res = await fetch(`/api/items/${id}`);
      if (res.status === 401) { router.push("/login"); return; }
      if (res.status === 404) { router.push("/"); return; }
      const data = await res.json();
      setItem(data);
      setEditTitle(data.title);
      setEditNotes(data.notes || "");
      setEditTags([...data.tags, ...data.aiTags].join(", "));
    } catch {
      showToast("Failed to load item", "error");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const loadComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/comments?itemId=${id}`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch { /* */ }
    finally { setCommentsLoading(false); }
  }, [id]);

  const loadVersions = useCallback(async () => {
    setVersionsLoading(true);
    try {
      const res = await fetch(`/api/versions/${id}`);
      const data = await res.json();
      setVersions(Array.isArray(data) ? data : []);
    } catch { /* */ }
    finally { setVersionsLoading(false); }
  }, [id]);

  const loadRelated = useCallback(async () => {
    try {
      const res = await fetch(`/api/items/related?itemId=${id}`);
      const data = await res.json();
      setRelated(Array.isArray(data) ? data : []);
    } catch { /* */ }
  }, [id]);

  useEffect(() => { loadItem(); }, [loadItem]);
  useEffect(() => {
    if (tab === "comments") loadComments();
    if (tab === "versions") loadVersions();
    if (tab === "related") loadRelated();
  }, [tab, loadComments, loadVersions, loadRelated]);

  const saveEdit = async () => {
    if (!item) return;
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          notes: editNotes,
          tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        showToast("Item updated!", "success");
        setEditing(false);
        loadItem();
      }
    } catch {
      showToast("Failed to update", "error");
    }
  };

  const toggleFavorite = async () => {
    if (!item) return;
    await fetch(`/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: !item.favorite }),
    });
    loadItem();
  };

  const toggleTask = async () => {
    if (!item) return;
    if (item.isTask) {
      await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskDone: !item.taskDone }),
      });
    } else {
      await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTask: true }),
      });
    }
    loadItem();
  };

  const summarize = async () => {
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id }),
      });
      if (res.ok) {
        showToast("AI summary generated!", "success");
        loadItem();
      }
    } catch {
      showToast("Failed to summarize", "error");
    }
  };

  const deleteItem = async () => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    showToast("Item deleted", "success");
    router.push("/");
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id, text: newComment }),
      });
      if (res.ok) {
        setNewComment("");
        loadComments();
        showToast("Comment added!", "success");
      }
    } catch {
      showToast("Failed to add comment", "error");
    }
  };

  const deleteComment = async (commentId: string) => {
    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    loadComments();
    showToast("Comment deleted", "success");
  };

  const restoreVersion = async (versionId: string) => {
    if (!confirm("Restore this version? Current state will be saved as a new version first.")) return;
    try {
      const res = await fetch(`/api/versions/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      if (res.ok) {
        showToast("Version restored!", "success");
        loadItem();
        loadVersions();
      }
    } catch {
      showToast("Failed to restore", "error");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  const typeIcons: Record<string, string> = {
    page: "\u{1F4C4}", video: "\u{1F3A5}", tweet: "\u{1F4AC}", pdf: "\u{1F4D1}",
    note: "\u{1F4DD}", screenshot: "\u{1F4F7}", transcript: "\u{1F399}",
  };

  if (loading) {
    return (
      <>
        <Topbar />
        <div className="main-container">
          <div className="empty-state">
            <div className="empty-icon">{"\u23F3"}</div>
            <h3>Loading...</h3>
          </div>
        </div>
      </>
    );
  }

  if (!item) return null;

  return (
    <>
      <Topbar />
      <div className="main-container">
        {/* Breadcrumb */}
        <div className="detail-breadcrumb">
          <button className="btn btn-secondary btn-sm" onClick={() => router.push("/")}>
            &larr; Dashboard
          </button>
          {item.collection && (
            <span className="detail-collection-badge" style={{ borderColor: item.collection.color }}>
              <span className="collection-color" style={{ background: item.collection.color }} />
              {item.collection.name}
            </span>
          )}
        </div>

        {/* Item Header */}
        <div className="detail-header">
          <div className="detail-header-main">
            <span className="detail-type-icon">{typeIcons[item.type] || "\u{1F4C4}"}</span>
            <div className="detail-header-text">
              {editing ? (
                <input
                  type="text"
                  className="detail-title-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              ) : (
                <h1 className="detail-title">{item.title}</h1>
              )}
              <div className="detail-meta">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="detail-url">
                  {item.favicon && <img src={item.favicon} alt="" className="item-favicon" />}
                  {item.domain}
                </a>
                <span className="detail-meta-sep">&middot;</span>
                <span>{formatDate(item.createdAt)}</span>
                <span className="detail-meta-sep">&middot;</span>
                <span className={`item-type ${item.type}`}>{item.type}</span>
                {item.reviewCount > 0 && (
                  <>
                    <span className="detail-meta-sep">&middot;</span>
                    <span>Reviewed {item.reviewCount}x</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="detail-actions">
            <button className={`btn-icon ${item.favorite ? "active-icon" : ""}`} onClick={toggleFavorite} title="Favorite">
              {item.favorite ? "\u2733" : "\u2734"}
            </button>
            <button className={`btn-icon ${item.isTask ? "active-icon" : ""}`} onClick={toggleTask}
              title={item.isTask ? (item.taskDone ? "Reopen task" : "Complete task") : "Make task"}>
              {item.isTask ? (item.taskDone ? "\u2705" : "\u2B1C") : "\u2610"}
            </button>
            {!item.summary && (
              <button className="btn btn-secondary btn-sm" onClick={summarize}>AI Summarize</button>
            )}
            {editing ? (
              <>
                <button className="btn btn-primary btn-sm" style={{ width: "auto" }} onClick={saveEdit}>Save</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>Edit</button>
            )}
            <button className="btn btn-danger btn-sm" onClick={deleteItem}>Delete</button>
          </div>
        </div>

        {/* Tags */}
        {(item.tags.length > 0 || item.aiTags.length > 0) && !editing && (
          <div className="detail-tags">
            {item.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
            {item.aiTags.map((t) => <span className="tag ai-tag" key={`ai-${t}`}>{t}</span>)}
          </div>
        )}
        {editing && (
          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Tags (comma-separated)</label>
            <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)} />
          </div>
        )}

        {/* Tab Bar */}
        <div className="review-tabs" style={{ marginTop: 20 }}>
          {([
            { key: "content", label: "Content" },
            { key: "comments", label: "Comments", count: comments.length },
            { key: "versions", label: "History", count: versions.length },
            { key: "related", label: "Related", count: related.length },
          ] as const).map((t) => (
            <button key={t.key} className={`review-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}>
              {t.label}
              {"count" in t && t.count > 0 && <span className="review-tab-badge">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Content Tab */}
        {tab === "content" && (
          <div className="detail-content-area">
            {/* AI Summary */}
            {item.summary && (
              <div className="detail-card detail-summary-card">
                <div className="detail-card-header">
                  <span className="ai-badge">AI</span>
                  <strong>Summary</strong>
                </div>
                <p>{item.summary}</p>
                {item.keyPoints.length > 0 && (
                  <div className="detail-key-points">
                    <strong>Key Points</strong>
                    <ul>
                      {item.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Highlights */}
            {item.highlights.length > 0 && (
              <div className="detail-card">
                <div className="detail-card-header">
                  <strong>Highlights ({item.highlights.length})</strong>
                </div>
                <div className="detail-highlights">
                  {item.highlights.map((h, i) => (
                    <div key={i} className="detail-highlight" style={{ borderLeftColor: h.color }}>
                      <div className="detail-highlight-text">&ldquo;{h.text}&rdquo;</div>
                      {h.note && <div className="detail-highlight-note">{h.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {editing ? (
              <div className="detail-card">
                <div className="detail-card-header"><strong>Notes</strong></div>
                <textarea
                  className="detail-notes-input"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={5}
                  placeholder="Add your notes..."
                />
              </div>
            ) : item.notes ? (
              <div className="detail-card">
                <div className="detail-card-header"><strong>Notes</strong></div>
                <p className="detail-notes">{item.notes}</p>
              </div>
            ) : null}

            {/* Full Content */}
            {item.content && (
              <div className="detail-card">
                <div className="detail-card-header"><strong>Saved Content</strong></div>
                <div className="detail-full-content">{item.content}</div>
              </div>
            )}

            {/* Description fallback */}
            {!item.content && item.description && (
              <div className="detail-card">
                <div className="detail-card-header"><strong>Description</strong></div>
                <p>{item.description}</p>
              </div>
            )}

            {/* Task status */}
            {item.isTask && (
              <div className={`detail-card ${item.taskDone ? "detail-task-done" : "detail-task-pending"}`}>
                <div className="detail-card-header">
                  <strong>{item.taskDone ? "\u2705 Task Completed" : "\u2B1C Task Pending"}</strong>
                </div>
              </div>
            )}

            {item.duplicateOf && (
              <div className="detail-card" style={{ borderColor: "var(--danger)" }}>
                <p style={{ color: "var(--danger)", fontSize: 13 }}>This item may be a duplicate of another saved item.</p>
              </div>
            )}
          </div>
        )}

        {/* Comments Tab */}
        {tab === "comments" && (
          <div className="detail-content-area">
            <div className="detail-card">
              <div className="detail-comment-input">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="detail-notes-input"
                />
                <button className="btn btn-primary btn-sm" style={{ width: "auto", marginTop: 8 }}
                  onClick={addComment} disabled={!newComment.trim()}>
                  Post Comment
                </button>
              </div>
            </div>

            {commentsLoading ? (
              <div className="empty-state" style={{ padding: "30px 0" }}>
                <p>Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              <div className="detail-comments-list">
                {comments.map((c) => (
                  <div className="detail-comment" key={c._id}>
                    <div className="detail-comment-header">
                      <div className="detail-comment-avatar">
                        {c.user.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="detail-comment-meta">
                        <strong>{c.user.name}</strong>
                        <span>{formatDateTime(c.createdAt)}</span>
                      </div>
                      <button className="btn-icon" style={{ marginLeft: "auto", fontSize: 14 }}
                        onClick={() => deleteComment(c._id)} title="Delete">
                        {"\u{1F5D1}"}
                      </button>
                    </div>
                    <div className="detail-comment-text">{c.text}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "40px 0" }}>
                <div className="empty-icon">{"\u{1F4AC}"}</div>
                <h3>No comments yet</h3>
                <p>Be the first to add a comment to this item.</p>
              </div>
            )}
          </div>
        )}

        {/* Versions Tab */}
        {tab === "versions" && (
          <div className="detail-content-area">
            {versionsLoading ? (
              <div className="empty-state" style={{ padding: "30px 0" }}>
                <p>Loading version history...</p>
              </div>
            ) : versions.length > 0 ? (
              <div className="detail-versions-list">
                {versions.map((v) => (
                  <div className="detail-version" key={v._id}>
                    <div className="detail-version-header">
                      <div className="detail-version-num">v{v.version}</div>
                      <div className="detail-version-info">
                        <div className="detail-version-note">{v.changeNote}</div>
                        <div className="detail-version-date">{formatDateTime(v.createdAt)}</div>
                      </div>
                      <div className="detail-version-actions">
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => setExpandedVersion(expandedVersion === v._id ? null : v._id)}>
                          {expandedVersion === v._id ? "Hide" : "Preview"}
                        </button>
                        <button className="btn btn-primary btn-sm" style={{ width: "auto" }}
                          onClick={() => restoreVersion(v._id)}>
                          Restore
                        </button>
                      </div>
                    </div>
                    {expandedVersion === v._id && (
                      <div className="detail-version-preview">
                        <div className="detail-version-field">
                          <strong>Title:</strong> {(v.snapshot.title as string) || "Untitled"}
                        </div>
                        {(v.snapshot.notes as string) && (
                          <div className="detail-version-field">
                            <strong>Notes:</strong> {v.snapshot.notes as string}
                          </div>
                        )}
                        {(v.snapshot.tags as string[])?.length > 0 && (
                          <div className="detail-version-field">
                            <strong>Tags:</strong>{" "}
                            {(v.snapshot.tags as string[]).map((t) => (
                              <span className="tag" key={t} style={{ marginRight: 4 }}>{t}</span>
                            ))}
                          </div>
                        )}
                        {(v.snapshot.summary as string) && (
                          <div className="detail-version-field">
                            <strong>Summary:</strong> {v.snapshot.summary as string}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "40px 0" }}>
                <div className="empty-icon">{"\u{1F4C3}"}</div>
                <h3>No version history</h3>
                <p>Edit the item&apos;s title, notes, or tags to create version snapshots.</p>
              </div>
            )}
          </div>
        )}

        {/* Related Tab */}
        {tab === "related" && (
          <div className="detail-content-area">
            {related.length > 0 ? (
              <div className="items-grid">
                {related.map((r) => (
                  <div className="item-card" key={r._id}
                    onClick={() => router.push(`/items/${r._id}`)}
                    style={{ cursor: "pointer" }}>
                    <div className="item-header">
                      <div className="item-title">{r.title}</div>
                      <span className={`item-type ${r.type}`}>{r.type}</span>
                    </div>
                    <div className="item-domain">{r.domain}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "40px 0" }}>
                <div className="empty-icon">{"\u{1F517}"}</div>
                <h3>No related items found</h3>
                <p>Save more items with similar tags or content to see relations.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Toast />
    </>
  );
}
