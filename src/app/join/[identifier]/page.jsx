'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';

import env from '@utilities/env';
import Template from '@template';
import Atom from '@atom';

export default function Join() {
  const params = useParams();
  const identifier = params.identifier;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogin = () => {
    window.location.href = `${env.server}/legacy/authentication/twitch/login`;
  };

  useEffect(() => {
    if (!identifier) return;

    async function fetchUser() {
      try {
        setLoading(true);
        const queryParam = /^\d+$/.test(identifier) ? `id=${identifier}` : `username=${identifier}`;
        const res = await fetch(`${env.server}/legacy/detail/twitch?${queryParam}`);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [identifier]);

  useEffect(() => {
    if (user) {
      document.title = `Join ${env.siteName} as ${user.display_name}`;
    }
  }, [user]);

  if (loading) {
    return (
      <Template.Join>
        <div className="flex items-center justify-center h-full text-gray-300">
          Loading Twitch user...
        </div>
      </Template.Join>
    );
  }

  if (error) {
    return (
      <Template.Join>
        <div className="flex items-center justify-center h-full text-red-400">
          Error: {error}
        </div>
      </Template.Join>
    );
  }

  if (!user) {
    return (
      <Template.Join>
        <div className="flex items-center justify-center h-full text-gray-400">
          No user found.
        </div>
      </Template.Join>
    );
  }

  return (
    <Template.Join background={user.offline_image_url}>
      <Atom.Card className="max-w-full w-[400px] overflow-hidden shadow flex flex-col items-center gap-5" color="theme">
        <img src={user.profile_image_url} className="rounded-full border border-3 border-[#f7b43d] bg-[#f7b43d] w-20 h-20" />
        <div className="flex flex-col gap-1 items-center">
          <div>You've been invite to join</div>
          <div className="font-bold text-[#f7b43d] text-xl">{env.siteName}</div>
        </div>
        <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-lg bg-[#9146FF] text-white font-semibold shadow-md hover:bg-[#772ce8] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:ring-offset-2 cursor-pointer">
          <div><FontAwesomeIcon icon={faTwitch} /></div>
          <div>Continue as {user.display_name}</div>
        </button>
      </Atom.Card>
    </Template.Join>
  );
}
