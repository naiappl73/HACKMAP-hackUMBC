"use client";
import { useCallback, useEffect, useState } from "react";

// Saves the student's choices in this browser only (no accounts or backend yet).
export type Profile = { major: string; year: string; slug: string };

const PROFILE_KEY = "rp-profile";
const DONE_KEY = "rp-done";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked (private mode etc.): the page still works, it just won't remember.
  }
}

export function saveProfile(p: Profile) {
  write(PROFILE_KEY, p);
}

// `ready` is false until we've read storage, so pages don't flash the empty state.
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { setProfile(read<Profile | null>(PROFILE_KEY, null)); setReady(true); }, []);
  const clear = useCallback(() => { write(PROFILE_KEY, null); write(DONE_KEY, null); setProfile(null); }, []);
  return { profile, ready, clear };
}

export function useDone() {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => { setDone(read<string[]>(DONE_KEY, [])); }, []);
  const toggle = useCallback((id: string) => {
    setDone((prev) => {
      const next = prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id];
      write(DONE_KEY, next);
      return next;
    });
  }, []);
  return { done, toggle };
}
