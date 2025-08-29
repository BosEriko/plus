'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@stores/useAuthStore';
import React, { useEffect, useState } from 'react';
import env from '@utilities/env';
import Template from '@template';

export default function Game() {
  const { token } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.id;

  // Get the search query from the URL, if any
  const searchQueryFromUrl = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(searchQueryFromUrl);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch games from API when search query changes
  useEffect(() => {
    if (!searchQueryFromUrl.trim()) {
      setGames([]);
      return;
    }

    const fetchGames = async () => {
      setLoading(true);
      setError('');

      try {
        // Retrieve Firebase token
        if (!token) {
          setError('User is not authenticated.');
          setLoading(false);
          return;
        }

        // Fetch search results
        const response = await fetch(
          `${env.server}/api/game/search?search=${encodeURIComponent(searchQueryFromUrl)}`,
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
  }, [searchQueryFromUrl]);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setGames([]);
      setError('');
      router.push(`/game/${userId}`);
      return;
    }

    // Update URL with the new search term
    router.push(`/game/${userId}?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <Template.Profile>
      <h1 className="text-2xl font-bold mb-4">Profile: {userId}</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a game..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition duration-200"
        >
          Search
        </button>
      </form>

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
      {!loading && !error && searchQueryFromUrl && games.length === 0 && (
        <p className="text-gray-500">No games found.</p>
      )}
    </Template.Profile>
  );
}
