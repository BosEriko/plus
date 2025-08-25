'use client';

import { create } from 'zustand';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@utilities/firebase';
import useInitialDataStore from './useInitialDataStore';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: true,

  initAuth: () => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        set({
          user: firebaseUser,
          token,
          loading: false,
        });
      } else {
        useInitialDataStore.getState().clearCache();
        set({
          user: null,
          token: null,
          loading: false,
        });
      }
    });
  },

  logout: async () => {
    await signOut(auth);
    useInitialDataStore.getState().clearCache();
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
