'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import env from '@utilities/env';
import Template from '@template';
import useAuthStore from '@stores/useAuthStore';
import useInitialDataStore from '@stores/useInitialDataStore';

export default function Setting() {
  const searchParams = useSearchParams();
  const { token, loading: authLoading } = useAuthStore();
  const { initialData, updateInitialDataField, loading: dataLoading } = useInitialDataStore();
  const [tetrioId, setTetrioId] = useState(null);
  const [tetrioUsername, setTetrioUsername] = useState('');
  const [loadingTetrio, setLoadingTetrio] = useState(false);
  const [tetrioMessage, setTetrioMessage] = useState('');

  const handleConnectDiscord = async () => {
    if (!token) {
      alert('Please log in first');
      return;
    }

    window.location.href = `${env.server}/api/authentication/discord/connect?token=${encodeURIComponent(token)}`;
  };

  const handleConnectTetrio = async () => {
    if (!token) {
      setTetrioMessage('❌ Please log in first');
      return;
    }

    try {
      setLoadingTetrio(true);
      setTetrioMessage('');

      const response = await fetch(`${env.server}/api/authentication/tetrio/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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

  const DiscordButton = () => (
    <button
      onClick={handleConnectDiscord}
      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
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
        <p
          className={`mt-2 text-sm ${
            tetrioMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {tetrioMessage}
        </p>
      )}
    </div>
  );

  useEffect(() => {
    const discordId = searchParams.get('discord');
    if (!discordId) return;
    if (initialData?.connection?.attributes?.discord === discordId) return;
    updateInitialDataField('connection.attributes.discord', discordId);
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);
  }, [searchParams, initialData, updateInitialDataField]);

  if (authLoading || dataLoading) {
    return <div className="text-gray-600 p-4">Loading...</div>;
  }

  if (!token) {
    return <div className="text-gray-600 p-4">Please log in first</div>;
  }

  return (
    <Template.Profile>
      <div className="container mx-auto my-4">
        <div className="flex items-center">
          <TetrioButton />
          {initialData?.connection?.attributes?.discord}
          <DiscordButton />
        </div>
      </div>
    </Template.Profile>
  );
}
