'use client'

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@utilities/firebase";
import env from "@utilities/env";
import Link from "next/link";

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
          setDiscordId(data.discordId ?? null);
        }
      } else {
        setDiscordId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    window.location.href = `${env.server}/api/authentication/twitch/login`;
  };

  const handleConnectDiscord = async () => {
    const firebaseToken = await user.getIdToken();
    window.location.href = `${env.server}/api/authentication/discord/connect?token=${encodeURIComponent(firebaseToken)}`;
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
          <Link
            href={`/user/${user.uid}`}
            className="ml-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 inline-block"
          >
            Profile
          </Link>
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
