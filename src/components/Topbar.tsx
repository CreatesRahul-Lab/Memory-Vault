"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState("User");
  const [initial, setInitial] = useState("U");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Load cached name instantly, then refresh from API
    const cached = localStorage.getItem("mos_userName");
    if (cached) {
      setName(cached);
      setInitial(cached.charAt(0).toUpperCase());
    }

    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.name) {
          const safeName = String(d.user.name).trim();
          if (safeName) {
            setName(safeName);
            setInitial(safeName.charAt(0).toUpperCase());
            localStorage.setItem("mos_userName", safeName);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem("mos_userName");
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const firstName = name.split(" ")[0] || name;

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/capture", label: "Capture" },
    { href: "/collections", label: "Collections" },
    { href: "/teams", label: "Teams" },
    { href: "/review", label: "Review" },
    { href: "/feed", label: "Feed" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <header className="topbar">
      <div className="topbar-logo">
        Memory<span>OS</span>
      </div>
      <nav className="topbar-nav">
        {navItems.map((item) => (
          <a key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="topbar-right">
        <div className="topbar-user-menu">
          <button
            className="topbar-user-trigger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title="Account menu"
          >
            <span className="topbar-user-name">{firstName}</span>
            <span className="topbar-avatar">{initial}</span>
          </button>

          {menuOpen && (
            <div className="topbar-dropdown" role="menu">
              <div className="topbar-dropdown-name">{name}</div>
              <button className="topbar-dropdown-item danger" onClick={handleSignOut} role="menuitem">
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
