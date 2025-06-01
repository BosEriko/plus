'use client'

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./_utilities/firebase";
import env from "./_utilities/env";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    const params = new URLSearchParams({
      client_id: env.twitchClientId,
      redirect_uri: `${window.location.origin}/api/twitch/callback`,
      response_type: 'code',
      scope: 'user:read:email'
    });

    window.location.href = `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div>
      <div className="mb-4">{env.siteName}</div>
      {user ? (
        <>
          <div className="mb-2 text-green-600">Welcome, {user.email}</div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Login with Twitch
        </button>
      )}
    </div>
  );
}