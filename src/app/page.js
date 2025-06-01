'use client'

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./_utilities/firebase";
import env from "./_utilities/env";

export default function Home() {
  const [user, setUser] = useState(null);
  const [discordId, setDiscordId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log(data);
          setDiscordId(data.discordId ?? null);
        }
      } else {
        setDiscordId(null);
      }
    });

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

  const handleConnectDiscord = async () => {
    if (!user) return alert("You must be logged in to connect Discord");

    const firebaseToken = await user.getIdToken();

    const params = new URLSearchParams({
      client_id: env.discordClientId,
      redirect_uri: `${window.location.origin}/api/discord/callback`,
      response_type: 'code',
      scope: 'identify',
      state: firebaseToken,
    });

    window.location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
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
          <div className="mb-2 text-green-600">Logged in</div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
          {discordId ? (
            <span className="ml-4 text-blue-600 font-semibold">Discord Connected</span>
          ) : (
            <button
              onClick={handleConnectDiscord}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Connect Discord
            </button>
          )}
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
