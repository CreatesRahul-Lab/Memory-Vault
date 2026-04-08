"use client";

import { useEffect, useState, useCallback } from "react";
import Topbar from "@/components/Topbar";
import Toast, { showToast } from "@/components/Toast";

interface CollectionData {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isPublic: boolean;
  shareToken: string | null;
  itemCount: number;
  savedFilter: { search?: string; tags?: string[]; types?: string[]; favorite?: boolean } | null;
  createdAt: string;
}

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
  summary: string;
  favorite: boolean;
  createdAt: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [selected, setSelected] = useState<CollectionData | null>(null);
  const [items, setItems] = useState<ItemData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("#e8b931");
  const [showShare, setShowShare] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareInfo, setShareInfo] = useState<{ isPublic: boolean; shareUrl: string | null }>({
    isPublic: false,
    shareUrl: null,
  });

  const loadCollections = useCallback(async () => {
    try {
      const res = await fetch("/api/collections");
      const data = await res.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch { /* */ }
  }, []);

  const loadCollectionItems = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/collections/${id}?page=${page}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotalPages(data.pages || 1);
    } catch { /* */ }
  }, [page]);

  useEffect(() => { loadCollections(); }, [loadCollections]);
  useEffect(() => {
    if (selected) loadCollectionItems(selected._id);
  }, [selected, loadCollectionItems]);

  const createCollection = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc, color: newColor }),
      });
      if (res.ok) {
        showToast("Collection created!", "success");
        setShowCreate(false);
        setNewName("");
        setNewDesc("");
        loadCollections();
      }
    } catch {
      showToast("Failed to create collection", "error");
    }
  };

  const deleteCollection = async (id: string) => {
    if (!confirm("Delete this collection? Items will be unlinked but not deleted.")) return;
    await fetch(`/api/collections/${id}`, { method: "DELETE" });
    if (selected?._id === id) { setSelected(null); setItems([]); }
    loadCollections();
    showToast("Collection deleted", "success");
  };

  const togglePublic = async () => {
    if (!selected) return;
    const res = await fetch(`/api/collections/${selected._id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !shareInfo.isPublic }),
    });
    const data = await res.json();
    setShareInfo({ isPublic: data.isPublic, shareUrl: data.shareUrl });
    if (data.isPublic) showToast("Collection is now public!", "success");
    else showToast("Collection is now private", "success");
    loadCollections();
  };

  const addCollaborator = async () => {
    if (!selected || !shareEmail) return;
    const res = await fetch(`/api/collections/${selected._id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collaboratorEmail: shareEmail, role: "viewer" }),
    });
    if (res.ok) {
      showToast("Collaborator added!", "success");
      setShareEmail("");
    } else {
      const err = await res.json();
      showToast(err.error || "Failed to add collaborator", "error");
    }
  };

  const removeItem = async (itemId: string) => {
    if (!selected) return;
    await fetch(`/api/collections/${selected._id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds: [itemId], action: "remove" }),
    });
    loadCollectionItems(selected._id);
    loadCollections();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const colors = ["#e8b931", "#ef4444", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#06b6d4"];

  return (
    <>
      <Topbar />
      <div className="main-container">
        <div className="welcome-section">
          <h1>Collections</h1>
          <p>Organize your saved items into collections. Create saved filters or share with others.</p>
        </div>

        <div className="collections-layout">
          {/* Sidebar */}
          <div className="collections-sidebar">
            <button className="btn btn-primary" style={{ width: "100%", marginBottom: 16 }} onClick={() => setShowCreate(true)}>
              + New Collection
            </button>
            <div className="collection-list">
              {collections.map((c) => (
                <div
                  key={c._id}
                  className={`collection-item ${selected?._id === c._id ? "active" : ""}`}
                  onClick={() => { setSelected(c); setPage(1); setShareInfo({ isPublic: c.isPublic, shareUrl: c.shareToken ? `${window.location.origin}/shared/${c.shareToken}` : null }); }}
                >
                  <div className="collection-color" style={{ background: c.color }} />
                  <div className="collection-item-info">
                    <div className="collection-item-name">{c.name}</div>
                    <div className="collection-item-meta">
                      {c.itemCount} items {c.savedFilter ? " \u00B7 Smart Filter" : ""} {c.isPublic ? " \u00B7 Public" : ""}
                    </div>
                  </div>
                  <button className="btn-icon" onClick={(e) => { e.stopPropagation(); deleteCollection(c._id); }} title="Delete">
                    {"\u{1F5D1}"}
                  </button>
                </div>
              ))}
              {collections.length === 0 && (
                <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0", fontSize: 13 }}>
                  No collections yet
                </p>
              )}
            </div>
          </div>

          {/* Main */}
          <div className="collections-main">
            {selected ? (
              <>
                <div className="collection-header">
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700 }}>{selected.name}</h2>
                    {selected.description && <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>{selected.description}</p>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowShare(true)}>
                      Share
                    </button>
                  </div>
                </div>

                {items.length > 0 ? (
                  <div className="items-grid">
                    {items.map((item) => (
                      <div className="item-card" key={item._id}>
                        <div className="item-header">
                          {item.favicon && <img className="item-favicon" src={item.favicon} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                          <div className="item-title">
                            <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                          </div>
                          <span className={`item-type ${item.type}`}>{item.type}</span>
                        </div>
                        <div className="item-domain">{item.domain}</div>
                        {item.summary && <div className="item-description"><strong>AI:</strong> {item.summary}</div>}
                        {item.tags?.length > 0 && (
                          <div className="item-tags">
                            {item.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                            {item.aiTags?.map((t) => <span className="tag ai-tag" key={`ai-${t}`}>{t}</span>)}
                          </div>
                        )}
                        <div className="item-footer">
                          <span className="item-date">{formatDate(item.createdAt)}</span>
                          <button className="btn btn-secondary btn-sm" onClick={() => removeItem(item._id)}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">{"\u{1F4C2}"}</div>
                    <h3>No items in this collection</h3>
                    <p>Add items from the dashboard or use a saved filter.</p>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="pagination">
                    <button disabled={page <= 1} onClick={() => setPage(page - 1)}>&larr; Prev</button>
                    <span className="page-info">Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next &rarr;</button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">{"\u{1F4DA}"}</div>
                <h3>Select a collection</h3>
                <p>Choose a collection from the sidebar or create a new one.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <div className={`modal-overlay ${showCreate ? "visible" : ""}`}>
        <div className="modal">
          <h3>New Collection</h3>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="My Collection" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional description" />
          </div>
          <div className="form-group">
            <label>Color</label>
            <div style={{ display: "flex", gap: 8 }}>
              {colors.map((c) => (
                <div
                  key={c}
                  onClick={() => setNewColor(c)}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
                    border: newColor === c ? "3px solid var(--text)" : "2px solid var(--border)",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary" style={{ width: "auto" }} onClick={createCollection}>Create</button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <div className={`modal-overlay ${showShare ? "visible" : ""}`}>
        <div className="modal">
          <h3>Share Collection</h3>
          <div className="form-group">
            <label>Public Link</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className={`btn ${shareInfo.isPublic ? "btn-primary" : "btn-secondary"} btn-sm`} style={{ width: "auto" }} onClick={togglePublic}>
                {shareInfo.isPublic ? "Public" : "Make Public"}
              </button>
              {shareInfo.shareUrl && (
                <input type="text" readOnly value={shareInfo.shareUrl} style={{ flex: 1, fontSize: 12 }} onClick={(e) => { (e.target as HTMLInputElement).select(); navigator.clipboard.writeText(shareInfo.shareUrl!); showToast("Link copied!", "success"); }} />
              )}
            </div>
          </div>
          <div className="form-group">
            <label>Add Collaborator</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="user@email.com" style={{ flex: 1 }} />
              <button className="btn btn-primary btn-sm" style={{ width: "auto" }} onClick={addCollaborator}>Add</button>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowShare(false)}>Done</button>
          </div>
        </div>
      </div>

      <Toast />
    </>
  );
}
