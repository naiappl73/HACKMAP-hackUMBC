"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Account created. Check your email to confirm your account.");
    }

    setLoading(false);
  }

  async function handleSignIn() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Signed in successfully.");
    }

    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 420, margin: "4rem auto", padding: "1rem" }}>
      <h1>RetrieversPath Account</h1>

      <form onSubmit={handleSignUp}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
          <button type="button" onClick={handleSignIn} disabled={loading}>
            Sign In
          </button>

          <button type="submit" disabled={loading}>
            Sign Up
          </button>
        </div>
      </form>

      {message && <p>{message}</p>}
    </main>
  );
}