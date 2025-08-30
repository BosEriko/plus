'use client';

import { useSearchParams } from 'next/navigation';
import useAuthStore from '@stores/useAuthStore';
import React, { useEffect, useState, Suspense } from 'react';
import env from '@utilities/env';
import Template from '@template';

function SearchSuspense() {
  const { token } = useAuthStore();
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setGames([]);
      return;
    }

    const fetchGames = async () => {
      setLoading(true);
      setError('');

      try {
        if (!token) {
          setError('User is not authenticated.');
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${env.server}/api/data/search?search=${encodeURIComponent(query)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!data.success) {
          setError(data.message || 'Something went wrong.');
        } else {
          setGames(data.results || []);
        }
      } catch (err) {
        setError('Failed to fetch search results.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [query, token]);

  return (
    <Template.Search>
      <h1 className="text-2xl font-bold mb-4">Search Results</h1>

      {/* Loading State */}
      {loading && <p className="text-blue-500">Searching for games...</p>}

      {/* Error State */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Results */}
      {!loading && !error && games.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="p-4 border rounded-lg shadow hover:shadow-lg transition duration-200 bg-white"
            >
              <h3 className="text-lg font-semibold">{game.name}</h3>
              {game.url && (
                <a
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View on IGDB
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && query && games.length === 0 && (
        <p className="text-gray-500">No games found for "{query}".</p>
      )}
    </Template.Search>
  );
}

export default function Search() {
  return (
    <Suspense fallback={<div>Loading settings...</div>}>
      <SearchSuspense />
    </Suspense>
  );
}