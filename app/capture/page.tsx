"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import Toast, { showToast } from "@/components/Toast";

interface CollectionData {
  _id: string;
  name: string;
  color: string;
}

export default function CapturePage() {
  const router = useRouter();
  const [captureType, setCaptureType] = useState<"url" | "note" | "screenshot" | "transcript">("url");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [collection, setCollection] = useState("");
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [isTask, setIsTask] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [saving, setSaving] = useState(false);

  // Screenshot/image paste
  const [pastedImage, setPastedImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/collections").then((r) => r.json()).then((d) => {
      setCollections(Array.isArray(d) ? d : []);
    }).catch(() => {});
  }, []);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => {
            setPastedImage(reader.result as string);
            setCaptureType("screenshot");
          };
          reader.readAsDataURL(blob);
        }
        return;
      }
    }
  };

  const save = async () => {
    if (captureType === "url" && !url.trim()) {
      showToast("Please enter a URL", "error");
      return;
    }
    if (captureType !== "url" && !title.trim()) {
      showToast("Please enter a title", "error");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        type: captureType === "url" ? "page" : captureType,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        notes,
        isTask,
        favorite,
      };

      if (captureType === "url") {
        body.url = url;
        body.title = title || url;
      } else {
        body.url = `memory://local/${captureType}/${Date.now()}`;
        body.title = title;
        body.content = content;
        body.domain = "Local Capture";
      }

      if (collection) body.collection = collection;
      if (pastedImage) body.content = pastedImage;

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        showToast("Saved successfully!", "success");
        router.push(`/items/${data._id}`);
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to save", "error");
      }
    } catch {
      showToast("Connection error", "error");
    } finally {
      setSaving(false);
    }
  };

  const typeOptions = [
    { key: "url", label: "Save URL", icon: "\u{1F517}", desc: "Save a webpage by URL" },
    { key: "note", label: "Quick Note", icon: "\u{1F4DD}", desc: "Capture a text note" },
    { key: "screenshot", label: "Screenshot", icon: "\u{1F4F7}", desc: "Paste an image or screenshot" },
    { key: "transcript", label: "Transcript", icon: "\u{1F399}", desc: "Paste a transcript or text" },
  ] as const;

  return (
    <>
      <Topbar />
      <div className="main-container" onPaste={handlePaste}>
        <div className="welcome-section">
          <h1>Quick Capture</h1>
          <p>Save URLs, notes, screenshots, and transcripts directly from the web app. Paste images with Ctrl+V.</p>
        </div>

        {/* Capture Type Selector */}
        <div className="capture-types">
          {typeOptions.map((t) => (
            <button
              key={t.key}
              className={`capture-type-btn ${captureType === t.key ? "active" : ""}`}
              onClick={() => setCaptureType(t.key)}
            >
              <span className="capture-type-icon">{t.icon}</span>
              <span className="capture-type-label">{t.label}</span>
              <span className="capture-type-desc">{t.desc}</span>
            </button>
          ))}
        </div>

        <div className="capture-form">
          <div className="capture-form-main">
            {/* URL input */}
            {captureType === "url" && (
              <div className="form-group">
                <label>URL</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article" />
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label>Title{captureType === "url" ? " (optional - auto-fetched)" : ""}</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder={captureType === "url" ? "Leave blank to auto-detect" : "Give it a title"} />
            </div>

            {/* Content area for notes/transcript */}
            {(captureType === "note" || captureType === "transcript") && (
              <div className="form-group">
                <label>{captureType === "note" ? "Note Content" : "Transcript Text"}</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  placeholder={captureType === "note"
                    ? "Write your note here..."
                    : "Paste your transcript, meeting notes, or text content here..."}
                  className="capture-textarea"
                />
              </div>
            )}

            {/* Screenshot paste area */}
            {captureType === "screenshot" && (
              <div className="form-group">
                <label>Screenshot</label>
                {pastedImage ? (
                  <div className="capture-screenshot-preview">
                    <img src={pastedImage} alt="Pasted screenshot" />
                    <button className="btn btn-secondary btn-sm"
                      style={{ position: "absolute", top: 8, right: 8 }}
                      onClick={() => setPastedImage(null)}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="capture-paste-zone">
                    <div className="capture-paste-icon">{"\u{1F4CB}"}</div>
                    <p>Press <kbd>Ctrl+V</kbd> to paste a screenshot</p>
                    <p className="capture-paste-hint">Or take a screenshot and paste it here</p>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add any notes about this item..."
              />
            </div>
          </div>

          {/* Sidebar options */}
          <div className="capture-form-sidebar">
            <div className="detail-card">
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                  placeholder="research, ai, important" />
              </div>

              <div className="form-group">
                <label>Collection</label>
                <select className="filter-select" style={{ width: "100%" }} value={collection}
                  onChange={(e) => setCollection(e.target.value)}>
                  <option value="">No collection</option>
                  {collections.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" id="capture-task" checked={isTask}
                  onChange={(e) => setIsTask(e.target.checked)} />
                <label htmlFor="capture-task" style={{ marginBottom: 0 }}>Mark as task</label>
              </div>

              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" id="capture-fav" checked={favorite}
                  onChange={(e) => setFavorite(e.target.checked)} />
                <label htmlFor="capture-fav" style={{ marginBottom: 0 }}>Add to favorites</label>
              </div>

              <button className="btn btn-primary" onClick={save} disabled={saving}
                style={{ marginTop: 12 }}>
                {saving ? "Saving..." : "Save Item"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toast />
    </>
  );
}
