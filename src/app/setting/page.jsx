'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import env from '@utilities/env';
import Template from '@template';
import useAuthStore from '@stores/useAuthStore';
import useInitialDataStore from '@stores/useInitialDataStore';

function SettingSuspense() {
  const searchParams = useSearchParams();
  const { token } = useAuthStore();
  const { initialData, updateInitialDataField } = useInitialDataStore();
  const [tetrioId, setTetrioId] = useState(null);
  const [tetrioUsername, setTetrioUsername] = useState('');
  const [loadingTetrio, setLoadingTetrio] = useState(false);
  const [tetrioMessage, setTetrioMessage] = useState('');

  useEffect(() => {
    const discordId = searchParams.get('discord');
    if (!discordId) return;
    if (initialData?.connection?.attributes?.discord === discordId) return;
    updateInitialDataField('connection.attributes.discord', discordId);
    window.history.replaceState({}, '', window.location.pathname);
  }, [searchParams, initialData, updateInitialDataField]);

  const handleConnectDiscord = async () => {
    if (!token) return;
    window.location.href = `${env.server}/api/authentication/discord/connect?token=${encodeURIComponent(token)}`;
  };

  const handleConnectTetrio = async () => {
    if (!token) return setTetrioMessage('❌ Please log in first');
    try {
      setLoadingTetrio(true);
      setTetrioMessage('');

      const res = await fetch(`${env.server}/api/authentication/tetrio/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: tetrioUsername }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTetrioMessage('✅ ' + data.message);
        setTetrioId(data.tetrio_id);
      } else {
        setTetrioMessage('❌ ' + data.message);
      }
    } catch {
      setTetrioMessage('❌ Something went wrong. Please try again later.');
    } finally {
      setLoadingTetrio(false);
    }
  };

  const DiscordButton = () => (
    <button onClick={handleConnectDiscord} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Connect Discord
    </button>
  );

  const TetrioButton = () => (
    <div>
      {tetrioId ? (
        <span className="text-green-600 font-semibold">TETR.IO Connected</span>
      ) : (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Enter TETR.IO username"
            value={tetrioUsername}
            onChange={(e) => setTetrioUsername(e.target.value)}
            className="border px-4 py-2 rounded"
          />
          <button
            onClick={handleConnectTetrio}
            disabled={loadingTetrio || !tetrioUsername}
            className="ml-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
          >
            {loadingTetrio ? 'Connecting...' : 'Connect TETR.IO'}
          </button>
        </div>
      )}
      {tetrioMessage && (
        <p className={`mt-2 text-sm ${tetrioMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {tetrioMessage}
        </p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto my-4">
      <div>{!!initialData?.connection?.attributes?.tetrio ? 'Disconnect TETR.IO' : <TetrioButton />}</div>
      <div>{!!initialData?.connection?.attributes?.discord ? 'Disconnect Discord' : <DiscordButton />}</div>
    </div>
  );
}

export default function Setting() {
  const { token, loading: authLoading } = useAuthStore();
  const { loading: dataLoading } = useInitialDataStore();

  if (authLoading || dataLoading) return <div className="text-gray-600 p-4">Loading...</div>;
  if (!token) return <div className="text-gray-600 p-4">Please log in first</div>;

  return (
    <Template.Profile>
      <Suspense fallback={<div>Loading settings...</div>}>
        <SettingSuspense />
      </Suspense>
    </Template.Profile>
  );
}
