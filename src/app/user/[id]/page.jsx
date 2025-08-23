'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Template from '@template';
import env from '@utilities/env';
import Atom from '@atom';

export default function UserPage() {
  const params = useParams();
  const userId = params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${env.server}/api/user/profile/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch profile');

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <Template.Profile>Loading...</Template.Profile>;
  if (error) return <Template.Profile>Error: {error}</Template.Profile>;

  const { user, connection, wallet, statistic, daily } = data;

  console.log(daily);

  return (
    <Template.Profile>
      {/* Cover Photo */}
      <div className="relative w-full h-56 bg-gray-200 rounded-xl overflow-hidden">
        {user.attributes.coverPhoto && (
          <img
            src={user.attributes.coverPhoto}
            alt="Cover Photo"
            className="w-full h-full object-cover"
          />
        )}
        {/* Profile Picture */}
        <div className="absolute bottom-[-40px] left-6">
          <img
            src={user.attributes.profileImage}
            alt={user.attributes.displayName}
            className="w-32 h-32 rounded-full border-4 border-white"
          />
        </div>
      </div>

      {/* User Info */}
      <div className="mt-16 px-6 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#f7b43d]">
            {user.attributes.displayName}
          </h1>
          <p className="text-gray-700 mt-1">{user.attributes.email}</p>

          {connection && (
            <div className="mt-4">
              <h2 className="font-semibold text-gray-800 mb-2">Connections</h2>
              {connection.attributes.discord && <p>Discord: {connection.attributes.discord}</p>}
              {connection.attributes.tetrio && <p>Tetr.io: {connection.attributes.tetrio}</p>}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 md:w-64">
          {wallet && (
            <Atom.Card className="p-4 rounded-xl shadow-md">
              <h3 className="font-semibold text-gray-800">Wallet</h3>
              <p className="text-xl font-bold text-[#f7b43d]">{wallet.attributes.coins} coins</p>
            </Atom.Card>
          )}

          {statistic && (
            <Atom.Card className="p-4 rounded-xl shadow-md">
              <h3 className="font-semibold text-gray-800">Statistics</h3>
              {statistic.attributes.discordMessageCount !== undefined && (
                <p>Discord Messages: {statistic.attributes.discordMessageCount}</p>
              )}
              {statistic.attributes.twitchMessageCount !== undefined && (
                <p>Twitch Messages: {statistic.attributes.twitchMessageCount}</p>
              )}
            </Atom.Card>
          )}
        </div>
      </div>
    </Template.Profile>
  );
}
