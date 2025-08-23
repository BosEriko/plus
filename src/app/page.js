'use client'

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@utilities/firebase";
import env from "@utilities/env";
import Link from "next/link";

import Template from "@template";

export default function Home() {
  const [user, setUser] = useState(null);
  const [discordId, setDiscordId] = useState(null);
  const [tetrioId, setTetrioId] = useState(null);
  const [tetrioUsername, setTetrioUsername] = useState("");
  const [loadingTetrio, setLoadingTetrio] = useState(false);
  const [tetrioMessage, setTetrioMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setDiscordId(data.discordId ?? null);
          setTetrioId(data.tetrioId ?? null);
        }
      } else {
        setDiscordId(null);
        setTetrioId(null);
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

  const handleConnectTetrio = async () => {
    try {
      setLoadingTetrio(true);
      setTetrioMessage("");

      const firebaseToken = await user.getIdToken();

      const response = await fetch(`${env.server}/api/authentication/tetrio/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({ username: tetrioUsername }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTetrioMessage("✅ " + data.message);
        setTetrioId(data.tetrio_id);
      } else {
        setTetrioMessage("❌ " + data.message);
      }
    } catch (error) {
      console.error("TETR.IO connection failed:", error);
      setTetrioMessage("❌ Something went wrong. Please try again later.");
    } finally {
      setLoadingTetrio(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <Template.Dashboard>
          <div className="mb-2 text-green-600">Logged in</div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>

          {/* Discord Connection */}
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

          {/* TETR.IO Connection */}
          <div className="mt-4">
            {tetrioId ? (
              <span className="text-green-600 font-semibold">TETR.IO Connected</span>
            ) : (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Enter TETR.IO username"
                  value={tetrioUsername}
                  onChange={(e) => setTetrioUsername(e.target.value)}
                  className="border px-3 py-2 rounded"
                />
                <button
                  onClick={handleConnectTetrio}
                  disabled={loadingTetrio || !tetrioUsername}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {loadingTetrio ? "Connecting..." : "Connect TETR.IO"}
                </button>
              </div>
            )}
            {tetrioMessage && (
              <p
                className={`mt-2 text-sm ${
                  tetrioMessage.startsWith("✅") ? "text-green-600" : "text-red-600"
                }`}
              >
                {tetrioMessage}
              </p>
            )}
          </div>

          {/* Profile Link */}
          <Link
            href={`/user/${user.uid}`}
            className="ml-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 inline-block"
          >
            Profile
          </Link>
        </Template.Dashboard>
      ) : (
        <Template.Landing>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Login with Twitch
          </button>
        </Template.Landing>
      )}
    </div>
  );
}
