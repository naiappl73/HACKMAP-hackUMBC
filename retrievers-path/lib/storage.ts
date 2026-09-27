"use client";
import { useCallback, useEffect, useState } from "react";
import type { ItemKind, Plan, Profile } from "@/lib/plan";

// Everything is saved in this browser only (no accounts or backend database yet).
const KEYS = { profile: "rp-profile-v2", plan: "rp-plan-v2", done: "rp-done-v2", custom: "rp-custom-v2", hidden: "rp-hidden-v2" };
// Remove data from the first prototype so it can't confuse the new format.
const OLD_KEYS = ["rp-profile", "rp-done"];

export type CustomItem = { id: string; yearIndex: number; title: string; kind: ItemKind; detail: string };

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

export function saveNewPlan(profile: Profile, plan: Plan) {
  write(KEYS.profile, profile);
  write(KEYS.plan, plan);
  write(KEYS.done, []);
  write(KEYS.custom, []);
  write(KEYS.hidden, []);
}

export function loadProfile(): Profile | null {
  return read<Profile | null>(KEYS.profile, null);
}

export function clearEverything() {
  for (const k of [...Object.values(KEYS), ...OLD_KEYS]) write(k, null);
}

// One hook for the whole roadmap: plan, checkmarks, student-added items, removed items.
export function useRoadmap() {
  const [state, setState] = useState<{
    ready: boolean; profile: Profile | null; plan: Plan | null; done: string[]; custom: CustomItem[]; hidden: string[];
  }>({ ready: false, profile: null, plan: null, done: [], custom: [], hidden: [] });

  useEffect(() => {
    for (const k of OLD_KEYS) write(k, null);
    setState({
      ready: true,
      profile: read<Profile | null>(KEYS.profile, null),
      plan: read<Plan | null>(KEYS.plan, null),
      done: read<string[]>(KEYS.done, []),
      custom: read<CustomItem[]>(KEYS.custom, []),
      hidden: read<string[]>(KEYS.hidden, []),
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setState((s) => {
      const done = s.done.includes(id) ? s.done.filter((d) => d !== id) : [...s.done, id];
      write(KEYS.done, done);
      return { ...s, done };
    });
  }, []);

  const addItem = useCallback((item: Omit<CustomItem, "id">) => {
    setState((s) => {
      const custom = [...s.custom, { ...item, id: `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}` }];
      write(KEYS.custom, custom);
      return { ...s, custom };
    });
  }, []);

  // Student-added items are deleted; planner items are hidden (and can be restored).
  const removeItem = useCallback((id: string) => {
    setState((s) => {
      if (id.startsWith("c")) {
        const custom = s.custom.filter((c) => c.id !== id);
        write(KEYS.custom, custom);
        return { ...s, custom };
      }
      const hidden = [...s.hidden, id];
      write(KEYS.hidden, hidden);
      return { ...s, hidden };
    });
  }, []);

  const restoreAll = useCallback(() => {
    setState((s) => {
      write(KEYS.hidden, []);
      return { ...s, hidden: [] };
    });
  }, []);

  const reset = useCallback(() => {
    clearEverything();
    setState({ ready: true, profile: null, plan: null, done: [], custom: [], hidden: [] });
  }, []);

  return { ...state, toggle, addItem, removeItem, restoreAll, reset };
}
