'use client';

import { create } from 'zustand';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@utilities/firebase';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  initAuth: () => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        set({
          user: firebaseUser,
          loading: false,
        });
      } else {
        set({
          user: null,
          loading: false,
        });
      }
    });
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },
}));

export default useAuthStore;
