'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import env from '@utilities/env';
import Template from '@template';
import Atom from '@atom';
import useAuthStore from '@stores/useAuthStore';
import useInitialDataStore from '@stores/useInitialDataStore';

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
    <Atom.Card>
      <h3 className="font-semibold text-gray-800 mb-2">TETR.IO</h3>
      {connected ? (
        <div className="flex gap-2 items-center">
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
            className="border px-4 py-2 rounded flex-1"
          />
          <button
            onClick={handleConnect}
            disabled={loading || !tetrioUsername}
            className="ml-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      )}
      {message && (
        <p className={`mt-2 text-sm ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </Atom.Card>
  );
};

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
    <Atom.Card>
      <h3 className="font-semibold text-gray-800 mb-2">Discord</h3>
      {discordId ? (
        <div className="flex gap-2 items-center">
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={loading}
          >
            {loading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Connect
        </button>
      )}
    </Atom.Card>
  );
};

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
    <Atom.Card>
      <h3 className="font-semibold text-gray-800 mb-2">{env.siteName}</h3>
      <button
        onClick={handleDeactivate}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
      >
        {loading ? 'Deactivating...' : 'Deactivate'}
      </button>
    </Atom.Card>
  );
};

function SettingSuspense() {
  const searchParams = useSearchParams();
  const { initialData, updateInitialDataField } = useInitialDataStore();

  useEffect(() => {
    const discordId = searchParams.get('discord');
    if (!discordId) return;
    if (initialData?.connection?.attributes?.discord === discordId) return;
    updateInitialDataField('connection.attributes.discord', discordId);
    window.history.replaceState({}, '', window.location.pathname);
  }, [searchParams, initialData, updateInitialDataField]);

  return (
    <Template.Profile>
      <div className="container mx-auto my-4">
        <div className="flex flex-col md:flex-row md:gap-4 gap-4">
          <div className="flex-1">
            <TetrioButton />
          </div>
          <div className="flex-1">
            <DiscordButton />
          </div>
          <div className="flex-1">
            <DeactivateButton />
          </div>
        </div>
      </div>
    </Template.Profile>
  );
}

export default function Setting() {
  const { token, loading: authLoading } = useAuthStore();
  const { loading: dataLoading } = useInitialDataStore();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/');
    }
  }, [authLoading, token, router]);

  if (authLoading || dataLoading) return <Template.Profile>Loading...</Template.Profile>;

  return (
    <Suspense fallback={<div>Loading settings...</div>}>
      <SettingSuspense />
    </Suspense>
  );
}
