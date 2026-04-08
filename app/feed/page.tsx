"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";

interface FeedItem {
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

interface FeedResponse {
  items: FeedItem[];
  pages: number;
}

export default function FeedPage() {
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);

      const res = await fetch(`/api/feed?${params.toString()}`, { credentials: "include" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data: FeedResponse | { error: string } = await res.json();
      const response = data as FeedResponse;
      setItems(Array.isArray(response.items) ? response.items : []);
      setTotalPages(typeof response.pages === "number" && response.pages > 0 ? response.pages : 1);
    } catch {
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, router]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

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

  return (
    <>
      <Topbar />
      <main className="main-container">
        <div className="welcome-section">
          <h1>Anonymous Feed</h1>
          <p>Discover what the community is saving. User identity is hidden for every item.</p>
        </div>

        <div className="items-section">
          <div className="toolbar">
            <div className="search-wrapper">
              <span className="search-icon">{"\u{1F50D}"}</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search feed..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Types</option>
              <option value="page">Pages</option>
              <option value="video">Videos</option>
              <option value="tweet">Tweets</option>
              <option value="pdf">PDFs</option>
              <option value="note">Notes</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">{"\u23F3"}</div>
              <h3>Loading feed...</h3>
            </div>
          ) : items.length > 0 ? (
            <div className="items-grid">
              {items.map((item) => (
                <div className="item-card" key={item._id}>
                  <div className="item-header">
                    {item.favicon && (
                      <img
                        className="item-favicon"
                        src={item.favicon}
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <div className="item-title">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                    </div>
                    <span className={`item-type ${item.type}`}>{item.type}</span>
                  </div>
                  <div className="item-domain">{item.domain || "Unknown source"}</div>
                  {item.description && <div className="item-description">{item.description}</div>}
                  {item.tags?.length > 0 && (
                    <div className="item-tags">
                      {item.tags.map((t) => (
                        <span className="tag" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="item-footer">
                    <span className="item-date">{formatDate(item.createdAt)}</span>
                    <span className="feed-anon-pill">Anonymous</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">{"\u{1F4F0}"}</div>
              <h3>No feed items yet</h3>
              <p>As users save items, they will appear here anonymously.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                &larr; Prev
              </button>
              <span className="page-info">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
