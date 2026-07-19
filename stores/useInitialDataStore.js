'use client';

import { create } from 'zustand';
import env from '@utilities/env';

const CACHE_KEY = "initialData";

const safeLocalStorage = {
  getItem: (key) => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  removeItem: (key) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

const useInitialDataStore = create((set, get) => ({
  initialData: null,
  loading: false,
  error: null,

  fetchInitialData: async (token) => {
    if (!token) return;

    const { initialData } = get();
    if (initialData) return initialData;

    const cached = safeLocalStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const now = Date.now();

      if (parsed.expiresAt && now < parsed.expiresAt) {
        set({ initialData: parsed.data });
        return parsed.data;
      } else {
        safeLocalStorage.removeItem(CACHE_KEY);
      }
    }

    try {
      set({ loading: true, error: null });

      const res = await fetch(`${env.server}/legacy/data/initial`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch initial data");
      const data = await res.json();

      set({ initialData: data, loading: false });

      safeLocalStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data,
          expiresAt: Date.now() + data.cacheExpiresIn,
        })
      );

      return data;
    } catch (err) {
      console.error("Initial Data Fetch Error:", err);
      set({ error: err.message, loading: false });
      return null;
    }
  },

  updateInitialDataField: (path, value) => {
    const { initialData } = get();
    if (!initialData) return;

    const updatedData = structuredClone(initialData);
    const keys = path.split(".");
    let ref = updatedData;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in ref)) ref[keys[i]] = {};
      ref = ref[keys[i]];
    }

    ref[keys[keys.length - 1]] = value;

    set({ initialData: updatedData });

    const cached = JSON.parse(safeLocalStorage.getItem(CACHE_KEY) || "{}");
    safeLocalStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data: updatedData,
        expiresAt: cached.expiresAt || Date.now(),
      })
    );
  },

  clearCache: () => {
    safeLocalStorage.removeItem(CACHE_KEY);
    set({ initialData: null });
  },
}));

export default useInitialDataStore;
