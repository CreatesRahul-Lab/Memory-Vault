"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

interface CollectionInfo {
  name: string;
  description: string;
  color: string;
  owner: string;
}

interface SharedItem {
  _id: string;
  url: string;
  title: string;
  description: string;
  domain: string;
  favicon: string;
  type: string;
  tags: string[];
  createdAt: string;
}

export default function SharedCollectionPage() {
  const params = useParams();
  const token = params.token as string;
  const [collection, setCollection] = useState<CollectionInfo | null>(null);
  const [items, setItems] = useState<SharedItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  const loadShared = useCallback(async () => {
    try {
      const res = await fetch(`/api/shared/${token}?page=${page}`);
      if (!res.ok) {
        setError("Collection not found or is private.");
        return;
      }
      const data = await res.json();
      setCollection(data.collection);
      setItems(data.items || []);
      setTotalPages(data.pages || 1);
    } catch {
      setError("Failed to load collection.");
    }
  }, [token, page]);

  useEffect(() => { loadShared(); }, [loadShared]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (error) {
    return (
      <div className="main-container" style={{ textAlign: "center", paddingTop: 80 }}>
        <div className="empty-icon" style={{ fontSize: 48, marginBottom: 20 }}>{"\u{1F512}"}</div>
        <h2>{error}</h2>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="main-container" style={{ textAlign: "center", paddingTop: 80 }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <header className="topbar">
        <div className="topbar-logo">Memory<span>OS</span></div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Shared Collection</div>
      </header>

      <div className="main-container">
        <div className="welcome-section">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: collection.color }} />
            <h1>{collection.name}</h1>
          </div>
          {collection.description && <p>{collection.description}</p>}
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Shared by {collection.owner}</p>
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
                {item.description && <div className="item-description">{item.description}</div>}
                {item.tags?.length > 0 && (
                  <div className="item-tags">
                    {item.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                  </div>
                )}
                <div className="item-footer">
                  <span className="item-date">{formatDate(item.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">{"\u{1F4C2}"}</div>
            <h3>This collection is empty</h3>
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
  );
}
