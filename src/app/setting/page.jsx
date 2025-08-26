'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import env from '@utilities/env';
import Template from '@template';
import useAuthStore from '@stores/useAuthStore';
import useInitialDataStore from '@stores/useInitialDataStore';

// TetrioButton handles its own state and token
const TetrioButton = () => {
  const { token } = useAuthStore();
  const { initialData, updateInitialDataField } = useInitialDataStore();

  const [tetrioUsername, setTetrioUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const tetrioId = initialData?.connection?.attributes?.tetrio || null;
  const connected = !!tetrioId;

  const handleConnect = async () => {
    if (!token) return setMessage('❌ Please log in first');
    try {
      setLoading(true);
      setMessage('');
      const res = await fetch(`${env.server}/api/authentication/tetrio/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: tetrioUsername }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('✅ ' + data.message);
        updateInitialDataField('connection.attributes.tetrio', data.id);
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch {
      setMessage('❌ Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${env.server}/api/tetrio/disconnect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        updateInitialDataField('connection.attributes.tetrio', null);
        setMessage('✅ TETR.IO Disconnected');
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch {
      setMessage('❌ Failed to disconnect TETR.IO');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {connected ? (
        <div className="flex gap-2 items-center">
          <span className="text-green-600 font-semibold">TETR.IO Connected</span>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={loading}
          >
            {loading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
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
            onClick={handleConnect}
            disabled={loading || !tetrioUsername}
            className="ml-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
          >
            {loading ? 'Connecting...' : 'Connect TETR.IO'}
          </button>
        </div>
      )}
      {message && (
        <p className={`mt-2 text-sm ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

// DiscordButton handles its own state and token
const DiscordButton = () => {
  const { token } = useAuthStore();
  const { initialData, updateInitialDataField } = useInitialDataStore();
  const [loading, setLoading] = useState(false);

  const discordId = initialData?.connection?.attributes?.discord || null;

  const handleConnect = () => {
    if (!token) return;
    window.location.href = `${env.server}/api/authentication/discord/connect?token=${encodeURIComponent(token)}`;
  };

  const handleDisconnect = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${env.server}/api/discord/disconnect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        updateInitialDataField('connection.attributes.discord', null);
      }
    } catch {} 
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {discordId ? (
        <>
          <span className="text-blue-600 font-semibold">Discord Connected</span>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={loading}
          >
            {loading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </>
      ) : (
        <button
          onClick={handleConnect}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Connect Discord
        </button>
      )}
    </div>
  );
};

// DeactivateButton manages its own state and token
const DeactivateButton = () => {
  const { token, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleDeactivate = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${env.server}/api/user/deactivate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) logout();
    } catch {} 
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-red-600 font-semibold">Deactivate Account</span>
      <button
        onClick={handleDeactivate}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
      >
        {loading ? 'Deactivating...' : 'Deactivate'}
      </button>
    </div>
  );
};

function SettingSuspense() {
  const searchParams = useSearchParams();
  const { initialData, updateInitialDataField } = useInitialDataStore();

  // Keep the discord query param logic
  useEffect(() => {
    const discordId = searchParams.get('discord');
    if (!discordId) return;
    if (initialData?.connection?.attributes?.discord === discordId) return;
    updateInitialDataField('connection.attributes.discord', discordId);
    window.history.replaceState({}, '', window.location.pathname);
  }, [searchParams, initialData, updateInitialDataField]);

  return (
    <div className="container mx-auto my-4 flex flex-col gap-4">
      <TetrioButton />
      <DiscordButton />
      <DeactivateButton />
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
