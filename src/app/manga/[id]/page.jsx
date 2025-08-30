'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { Parallax } from 'react-parallax';
import env from '@utilities/env';
import Template from '@template';
import useAuthStore from '@stores/useAuthStore';

export default function MangaProfile() {
  const params = useParams();
  const mangaId = params.id;

  const { token, loading: userLoading } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (userLoading) return;
    if (!token) {
      setError('Unauthorized');
      setLoading(false);
      return;
    }

    if (!mangaId) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${env.server}/api/manga/profile/${mangaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) throw new Error('Unauthorized');
        if (!res.ok) throw new Error('Failed to fetch manga profile');

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
  }, [mangaId, token, userLoading]);

  if (loading) return <Template.Profile>Loading...</Template.Profile>;
  if (error) return <Template.Profile>Error: {error}</Template.Profile>;

  const info = data?.information;

  return (
    <Template.Profile>
      <div className="container mx-auto pb-5">
        <div className="relative w-full bg-gray-200 rounded-xl">
          {info?.coverPhoto ? (
            <div className="overflow-hidden rounded-b-xl">
              <Parallax bgImage={info.coverPhoto} bgImageAlt="Manga Cover" blur={2}>
                <div className="aspect-[16/4] flex items-center justify-center">
                  <div className="flex flex-col gap-3 items-center justify-center">
                    <img
                      src={info?.displayPicture || ''}
                      alt={info?.name || 'Manga'}
                      className="w-32 h-32 rounded-full border-5 border-white shadow-lg"
                    />
                    <h1
                      className="text-3xl font-bold text-white"
                      style={{ textShadow: '0 0 5px rgba(0, 0, 0, 0.6)' }}
                    >
                      {info?.name || 'Unknown Manga'}
                    </h1>
                  </div>
                </div>
              </Parallax>
            </div>
          ) : (
            <div className="aspect-[16/4] bg-[#f7b43d] flex items-center justify-center">
              <h1 className="text-3xl font-bold text-white">{info?.name || 'Unknown Manga'}</h1>
            </div>
          )}
        </div>

        <div className="mt-5 px-5">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="text-gray-700 mt-2">
            {info?.description || 'No synopsis available.'}
          </p>
        </div>

        {timeLeft !== null && timeLeft > 0 && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Data will be updated in {Math.floor(timeLeft / 1000)}s.
          </p>
        )}
      </div>
    </Template.Profile>
  );
}
