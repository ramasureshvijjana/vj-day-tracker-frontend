import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Login() {
  const [mode, setMode] = useState("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Account created! Check your email to confirm, then sign in.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <span className="page-eyebrow">Bloomday</span>
        <h1 className="auth-title">{mode === "sign-in" ? "Welcome back" : "Create your account"}</h1>
        <p>Track your day, your meals and your workouts in one calm place.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 22 }}>
          <div className="field field-full">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field field-full">
            <label>Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="error-text">{error}</p>}
          {info && <p style={{ color: "var(--mint-700)", fontSize: 13 }}>{info}</p>}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === "sign-in" ? (
            <>
              <span>New here?</span>
              <button onClick={() => setMode("sign-up")}>Create an account</button>
            </>
          ) : (
            <>
              <span>Already have an account?</span>
              <button onClick={() => setMode("sign-in")}>Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
