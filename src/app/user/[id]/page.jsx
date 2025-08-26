'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { Parallax } from 'react-parallax';
import env from '@utilities/env';
import Template from '@template';
import Atom from '@atom';
import Molecule from '@molecule';

export default function User() {
  const params = useParams();
  const userId = params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${env.server}/api/user/profile/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch profile');

        const json = await res.json();
        setData(json);

        if (json.cacheExpiresIn !== undefined) {
          setTimeLeft(json.cacheExpiresIn);

          if (intervalRef.current) clearInterval(intervalRef.current);

          intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
              if (prev <= 1000) {
                clearInterval(intervalRef.current);
                window.location.reload();
                return 0;
              }
              return prev - 1000;
            });
          }, 1000);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId]);

  useEffect(() => {
    if (data) {
      document.title = `${data?.user?.attributes?.displayName || 'User'}'s Profile | ${env.siteName}`;
    }
  }, [data]);

  if (loading) return <Template.Profile>Loading...</Template.Profile>;
  if (error) return <Template.Profile>Error: {error}</Template.Profile>;

  const user = data?.user;
  const connection = data?.connection;
  const wallet = data?.wallet;
  const statistic = data?.statistic;
  const daily = data?.daily;
  const tetrio = data?.tetrio;

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Template.Profile>
      <div className="container mx-auto pb-5">
        <div className="relative w-full bg-gray-200 rounded-xl">
          {user?.attributes?.coverPhoto && (
            <div className="overflow-hidden rounded-b-xl">
              <Parallax bgImage={user.attributes.coverPhoto} bgImageAlt="Cover Photo" blur={2}>
                <div className="aspect-[16/4] flex items-center justify-center">
                  <div className="flex flex-col gap-3 items-center justify-center">
                    <img
                      src={user?.attributes?.profileImage || ''}
                      alt={user?.attributes?.displayName || 'User'}
                      className="w-32 h-32 rounded-full border-5 border-white shadow-lg"
                    />
                    <h1
                      className="text-3xl font-bold text-white"
                      style={{ textShadow: '0 0 5px rgba(0, 0, 0, 0.6)' }}
                    >
                      {user?.attributes?.displayName || 'Unknown User'}
                    </h1>
                  </div>
                </div>
              </Parallax>
            </div>
          )}
        </div>

        <div className="mt-5 px-5 flex flex-col md:flex-row md:justify-between md:items-start gap-5">
          <div className="flex-1 flex gap-2 flex-col">
            {connection?.attributes && (
              <div className="flex gap-2 mb-2">
                {connection.attributes?.discord && (
                  <Atom.Button
                    color="pink"
                    style={{ width: "100%" }}
                    onClick={() =>
                      window.open(`https://discord.com/users/${connection.attributes.discord}`, "_blank")
                    }
                  >
                    Send Discord Message
                  </Atom.Button>
                )}

                {tetrio && (
                  <Atom.Button
                    color="purple"
                    style={{ width: "100%" }}
                    onClick={() =>
                      window.open(`https://ch.tetr.io/u/${tetrio?.username}`, "_blank")
                    }
                  >
                    View TETR.IO Profile
                  </Atom.Button>
                )}
              </div>
            )}

            {daily?.attributes?.content && (
              <>
                {connection?.attributes?.discord && (
                  <Atom.Card>
                    <Molecule.Heatmap
                      content={daily.attributes.content}
                      type="discord"
                      title="Discord Activity"
                    />
                  </Atom.Card>
                )}

                <Atom.Card>
                  <Molecule.Heatmap
                    content={daily.attributes.content}
                    type="twitch"
                    title="Twitch Activity"
                  />
                </Atom.Card>
              </>
            )}
          </div>

          <div className="flex flex-col gap-4 md:w-64">
            {wallet?.attributes && (
              <Atom.Card>
                <h3 className="font-semibold text-gray-800">Wallet</h3>
                <p className="text-xl font-bold text-[#f7b43d]">{wallet.attributes.coins ?? 0} coins</p>
              </Atom.Card>
            )}

            {statistic?.attributes && (
              <Atom.Card>
                <h3 className="font-semibold text-gray-800">Statistics</h3>
                {connection?.attributes?.discord && <p>Discord Messages: {statistic.attributes.discordMessageCount ?? 0}</p>}
                <p>Twitch Messages: {statistic.attributes.twitchMessageCount ?? 0}</p>
              </Atom.Card>
            )}

            {timeLeft !== null && timeLeft > 0 && <p className="text-sm text-gray-500 text-center">Data will be updated {formatTime(timeLeft)}.</p>}
          </div>
        </div>
      </div>
    </Template.Profile>
  );
}
