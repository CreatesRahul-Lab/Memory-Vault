"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";
import Toast, { showToast } from "@/components/Toast";

interface MemberData {
  user: { _id: string; name: string; email: string };
  role: string;
  joinedAt: string;
}

interface TeamData {
  _id: string;
  name: string;
  description: string;
  color: string;
  owner: { _id: string; name: string; email: string };
  members: MemberData[];
  collections: string[];
  isPublic: boolean;
  inviteCode: string | null;
  createdAt: string;
}

interface CollectionData {
  _id: string;
  name: string;
  color: string;
  itemCount: number;
}

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [selected, setSelected] = useState<TeamData | null>(null);
  const [teamCollections, setTeamCollections] = useState<CollectionData[]>([]);
  const [userCollections, setUserCollections] = useState<CollectionData[]>([]);

  // Create team
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("#e8b931");

  // Add member
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("viewer");

  // Join team
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  // Add collection
  const [showAddCollection, setShowAddCollection] = useState(false);

  const loadTeams = useCallback(async () => {
    try {
      const res = await fetch("/api/teams");
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch { /* */ }
  }, [router]);

  const loadTeamDetails = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/teams/${id}`);
      const data = await res.json();
      if (data.team) {
        setSelected(data.team);
        setTeamCollections(data.collections || []);
      }
    } catch { /* */ }
  }, []);

  const loadUserCollections = useCallback(async () => {
    try {
      const res = await fetch("/api/collections");
      const data = await res.json();
      setUserCollections(Array.isArray(data) ? data : []);
    } catch { /* */ }
  }, []);

  useEffect(() => { loadTeams(); loadUserCollections(); }, [loadTeams, loadUserCollections]);

  const createTeam = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc, color: newColor }),
      });
      if (res.ok) {
        showToast("Team created!", "success");
        setShowCreate(false);
        setNewName("");
        setNewDesc("");
        loadTeams();
      }
    } catch {
      showToast("Failed to create team", "error");
    }
  };

  const deleteTeam = async (id: string) => {
    if (!confirm("Delete this team? Members will lose access.")) return;
    await fetch(`/api/teams/${id}`, { method: "DELETE" });
    if (selected?._id === id) { setSelected(null); setTeamCollections([]); }
    loadTeams();
    showToast("Team deleted", "success");
  };

  const addMember = async () => {
    if (!selected || !memberEmail) return;
    const res = await fetch(`/api/teams/${selected._id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: memberEmail, role: memberRole }),
    });
    if (res.ok) {
      showToast("Member added!", "success");
      setMemberEmail("");
      setShowAddMember(false);
      loadTeamDetails(selected._id);
      loadTeams();
    } else {
      const err = await res.json();
      showToast(err.error || "Failed to add member", "error");
    }
  };

  const removeMember = async (userId: string) => {
    if (!selected || !confirm("Remove this member?")) return;
    await fetch(`/api/teams/${selected._id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    loadTeamDetails(selected._id);
    loadTeams();
    showToast("Member removed", "success");
  };

  const joinTeam = async () => {
    if (!joinCode.trim()) return;
    const res = await fetch("/api/teams/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: joinCode }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast("Joined team!", "success");
      setShowJoin(false);
      setJoinCode("");
      loadTeams();
    } else {
      showToast(data.error || "Failed to join", "error");
    }
  };

  const addCollectionToTeam = async (collId: string) => {
    if (!selected) return;
    await fetch(`/api/teams/${selected._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addCollection: collId }),
    });
    loadTeamDetails(selected._id);
    setShowAddCollection(false);
    showToast("Collection added to team!", "success");
  };

  const removeCollectionFromTeam = async (collId: string) => {
    if (!selected) return;
    await fetch(`/api/teams/${selected._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removeCollection: collId }),
    });
    loadTeamDetails(selected._id);
    showToast("Collection removed", "success");
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast("Invite code copied!", "success");
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const colors = ["#e8b931", "#ef4444", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#06b6d4"];

  const roleColors: Record<string, string> = { admin: "#ef4444", editor: "#3b82f6", viewer: "#6b7280" };

  return (
    <>
      <Topbar />
      <div className="main-container">
        <div className="welcome-section">
          <h1>Team Spaces</h1>
          <p>Collaborate with others. Share collections, assign roles, and work together on curated knowledge.</p>
        </div>

        <div className="teams-actions">
          <button className="btn btn-primary" style={{ width: "auto" }} onClick={() => setShowCreate(true)}>
            + Create Team
          </button>
          <button className="btn btn-secondary" onClick={() => setShowJoin(true)}>
            Join with Code
          </button>
        </div>

        <div className="collections-layout" style={{ marginTop: 20 }}>
          {/* Sidebar */}
          <div className="collections-sidebar">
            <div className="collection-list">
              {teams.map((t) => (
                <div
                  key={t._id}
                  className={`collection-item ${selected?._id === t._id ? "active" : ""}`}
                  onClick={() => { setSelected(t); loadTeamDetails(t._id); }}
                >
                  <div className="collection-color" style={{ background: t.color }} />
                  <div className="collection-item-info">
                    <div className="collection-item-name">{t.name}</div>
                    <div className="collection-item-meta">
                      {t.members.length} member{t.members.length !== 1 ? "s" : ""}
                      {" \u00B7 "}
                      {t.collections.length} collection{t.collections.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              ))}
              {teams.length === 0 && (
                <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0", fontSize: 13 }}>
                  No teams yet. Create one or join with a code.
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
                    {selected.description && (
                      <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
                        {selected.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowAddMember(true)}>
                      Add Member
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowAddCollection(true)}>
                      Add Collection
                    </button>
                    <button className="btn btn-secondary btn-sm"
                      onClick={() => deleteTeam(selected._id)}>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Invite Code */}
                {selected.inviteCode && (
                  <div className="team-invite-bar">
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Invite code:</span>
                    <code className="team-invite-code">{selected.inviteCode}</code>
                    <button className="btn btn-secondary btn-sm"
                      onClick={() => copyInviteCode(selected.inviteCode!)}>
                      Copy
                    </button>
                  </div>
                )}

                {/* Members */}
                <div className="detail-card" style={{ marginTop: 16 }}>
                  <div className="detail-card-header">
                    <strong>Members ({selected.members.length})</strong>
                  </div>
                  <div className="team-members-list">
                    {selected.members.map((m) => (
                      <div className="team-member" key={m.user._id}>
                        <div className="detail-comment-avatar">
                          {m.user.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{m.user.name}</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.user.email}</div>
                        </div>
                        <span className="team-role-badge" style={{ background: roleColors[m.role] || "#6b7280" }}>
                          {m.role}
                        </span>
                        {String(m.user._id) !== String(selected.owner._id) && (
                          <button className="btn-icon" style={{ fontSize: 14 }}
                            onClick={() => removeMember(m.user._id)} title="Remove">
                            {"\u{1F5D1}"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shared Collections */}
                <div className="detail-card" style={{ marginTop: 16 }}>
                  <div className="detail-card-header">
                    <strong>Shared Collections ({teamCollections.length})</strong>
                  </div>
                  {teamCollections.length > 0 ? (
                    <div className="team-collections-grid">
                      {teamCollections.map((c) => (
                        <div className="team-collection-card" key={c._id}>
                          <div className="collection-color" style={{ background: c.color, width: 12, height: 12, borderRadius: "50%" }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.itemCount} items</div>
                          </div>
                          <button className="btn-icon" style={{ fontSize: 14 }}
                            onClick={() => removeCollectionFromTeam(c._id)} title="Remove">
                            {"\u{1F5D1}"}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "12px 0" }}>
                      No collections shared yet. Add one above.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">{"\u{1F465}"}</div>
                <h3>Select a team</h3>
                <p>Choose a team from the sidebar or create a new one.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Team Modal */}
      <div className={`modal-overlay ${showCreate ? "visible" : ""}`}>
        <div className="modal">
          <h3>New Team Space</h3>
          <div className="form-group">
            <label>Team Name</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder="My Research Team" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
              placeholder="What is this team about?" />
          </div>
          <div className="form-group">
            <label>Color</label>
            <div style={{ display: "flex", gap: 8 }}>
              {colors.map((c) => (
                <div key={c} onClick={() => setNewColor(c)}
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
            <button className="btn btn-primary" style={{ width: "auto" }} onClick={createTeam}>Create Team</button>
          </div>
        </div>
      </div>

      {/* Join Team Modal */}
      <div className={`modal-overlay ${showJoin ? "visible" : ""}`}>
        <div className="modal">
          <h3>Join a Team</h3>
          <div className="form-group">
            <label>Invite Code</label>
            <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter invite code" />
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowJoin(false)}>Cancel</button>
            <button className="btn btn-primary" style={{ width: "auto" }} onClick={joinTeam}>Join</button>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <div className={`modal-overlay ${showAddMember ? "visible" : ""}`}>
        <div className="modal">
          <h3>Add Team Member</h3>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="user@email.com" />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="filter-select" style={{ width: "100%" }} value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}>
              <option value="viewer">Viewer - Can view shared collections</option>
              <option value="editor">Editor - Can add/edit items</option>
              <option value="admin">Admin - Full team management</option>
            </select>
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowAddMember(false)}>Cancel</button>
            <button className="btn btn-primary" style={{ width: "auto" }} onClick={addMember}>Add Member</button>
          </div>
        </div>
      </div>

      {/* Add Collection Modal */}
      <div className={`modal-overlay ${showAddCollection ? "visible" : ""}`}>
        <div className="modal">
          <h3>Add Collection to Team</h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
            Choose a collection to share with the team.
          </p>
          <div className="team-collections-grid">
            {userCollections.map((c) => (
              <div className="team-collection-card" key={c._id}
                onClick={() => addCollectionToTeam(c._id)}
                style={{ cursor: "pointer" }}>
                <div className="collection-color"
                  style={{ background: c.color, width: 12, height: 12, borderRadius: "50%" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.itemCount} items</div>
                </div>
              </div>
            ))}
            {userCollections.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                No collections yet. Create one from the Collections page.
              </p>
            )}
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowAddCollection(false)}>Close</button>
          </div>
        </div>
      </div>

      <Toast />
    </>
  );
}
