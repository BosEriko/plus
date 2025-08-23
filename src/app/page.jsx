'use client';

import { useState } from 'react';
import env from '@utilities/env';
import Template from '@template';
import useAuthStore from '@stores/useAuthStore';

export default function Home() {
  const { user, loading } = useAuthStore();
  const [discordId, setDiscordId] = useState(null);
  const [tetrioId, setTetrioId] = useState(null);
  const [tetrioUsername, setTetrioUsername] = useState('');
  const [loadingTetrio, setLoadingTetrio] = useState(false);
  const [tetrioMessage, setTetrioMessage] = useState('');

  const handleConnectDiscord = async () => {
    const firebaseToken = await user.getIdToken();
    window.location.href = `${env.server}/api/authentication/discord/connect?token=${encodeURIComponent(firebaseToken)}`;
  };

  const handleConnectTetrio = async () => {
    try {
      setLoadingTetrio(true);
      setTetrioMessage('');

      const firebaseToken = await user.getIdToken();

      const response = await fetch(`${env.server}/api/authentication/tetrio/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({ username: tetrioUsername }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTetrioMessage('✅ ' + data.message);
        setTetrioId(data.tetrio_id);
      } else {
        setTetrioMessage('❌ ' + data.message);
      }
    } catch (error) {
      console.error('TETR.IO connection failed:', error);
      setTetrioMessage('❌ Something went wrong. Please try again later.');
    } finally {
      setLoadingTetrio(false);
    }
  };

  if (loading) {
    return <div className="text-gray-600 p-4">Loading...</div>;
  }

  if (user) {
    return (
      <Template.Dashboard>
        <div className="mb-2 text-green-600">Logged in</div>
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
                {loadingTetrio ? 'Connecting...' : 'Connect TETR.IO'}
              </button>
            </div>
          )}
          {tetrioMessage && (
            <p
              className={`mt-2 text-sm ${
                tetrioMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {tetrioMessage}
            </p>
          )}
        </div>
      </Template.Dashboard>
    );
  }

  return (
    <Template.Landing>
      logged out
    </Template.Landing>
  );
}
