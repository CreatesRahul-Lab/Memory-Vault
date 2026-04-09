"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError(data.error);
      }
    } catch {
      setError("Connection error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <h2>Your second brain,<br />always organized.</h2>
          <p>
            Save articles, videos, tweets, and anything you find on the web.
            Access them anytime from your personal dashboard.
          </p>
          <div className="auth-features">
            {[
              { icon: "\u{1F4DA}", text: "Save pages with one click" },
              { icon: "\u{1F50D}", text: "Search & filter your memory" },
              { icon: "\u{1F511}", text: "API keys for browser extension" },
              { icon: "\u{1F3F7}", text: "Organize with tags & favorites" },
            ].map((f, i) => (
              <div className="auth-feature" key={i}>
                <div className="auth-feature-icon">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="logo">
            <h1>Memory<span>OS</span></h1>
            <p>Sign in to your dashboard</p>
          </div>

          {error && <div className="error-msg visible">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            Don&apos;t have an account? <a href="/register">Create one</a>
          </div>
        </div>
      </div>
    </div>
  );
}
