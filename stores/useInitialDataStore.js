'use client';

import { create } from 'zustand';
import env from '@utilities/env';

const CACHE_KEY = "initialData";

const useInitialDataStore = create((set, get) => ({
  initialData: null,
  loading: false,
  error: null,

  fetchInitialData: async (token) => {
    if (!token) return;

    const { initialData } = get();
    if (initialData) return initialData;

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const now = Date.now();

      if (parsed.expiresAt && now < parsed.expiresAt) {
        set({ initialData: parsed.data });
        return parsed.data;
      } else {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    try {
      set({ loading: true, error: null });

      const res = await fetch(`${env.server}/api/data/initial`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch initial data");
      const data = await res.json();

      set({ initialData: data, loading: false });

      localStorage.setItem(
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

  clearCache: () => {
    localStorage.removeItem(CACHE_KEY);
    set({ initialData: null });
  },
}));

export default useInitialDataStore;
