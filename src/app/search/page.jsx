'use client';

import { useSearchParams } from 'next/navigation';
import useAuthStore from '@stores/useAuthStore';
import React, { useEffect, useState, Suspense } from 'react';
import env from '@utilities/env';
import Template from '@template';

// Helper function to remove duplicates based on a unique key
const uniqueBy = (array, keyFn) => {
  const seen = new Set();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

function SearchSuspense() {
  const { token } = useAuthStore();
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  const [results, setResults] = useState({
    games: [],
    anime: [],
    manga: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults({ games: [], anime: [], manga: [] });
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError('');

      try {
        if (!token) {
          setError('User is not authenticated.');
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${env.server}/api/data/search?query=${encodeURIComponent(query)}`,
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
          // Special handling for rate limit error
          if (data.status === '429' || data.type === 'RateLimitException') {
            setError(
              'You are being rate-limited. Please wait a few seconds and try again.'
            );
          } else {
            setError(data.message || 'Something went wrong.');
          }
        } else {
          // Deduplicate results before setting state
          setResults({
            games: uniqueBy(data.results.games || [], (g) => g.id),
            anime: uniqueBy(data.results.anime || [], (a) => a.mal_id),
            manga: uniqueBy(data.results.manga || [], (m) => m.mal_id),
          });
        }
      } catch (err) {
        setError('Failed to fetch search results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, token]);

  return (
    <Template.Search>
      <h1 className="text-2xl font-bold mb-4 text-center">Search Results</h1>

      {/* Loading State */}
      {loading && <p className="text-blue-500">Searching for results...</p>}

      {/* Error State */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Results */}
      {!loading && !error && (
        <div className="container mx-auto space-y-8">
          {/* Games */}
          {results.games.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">
                Games ({results.games.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.games.map((game) => (
                  <div
                    key={`game-${game.id}`}
                    className="p-4 border rounded-lg shadow hover:shadow-lg transition duration-200 bg-white"
                  >
                    <h3 className="text-lg font-semibold">{game.name}</h3>
                    {game.slug && (
                      <a
                        href={`https://www.igdb.com/games/${game.slug}`}
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
            </div>
          )}

          {/* Anime */}
          {results.anime.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">
                Anime ({results.anime.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.anime.map((anime) => (
                  <div
                    key={`anime-${anime.mal_id}`}
                    className="p-4 border rounded-lg shadow hover:shadow-lg transition duration-200 bg-white"
                  >
                    <h3 className="text-lg font-semibold">{anime.title}</h3>
                    {anime.url && (
                      <a
                        href={anime.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View on MyAnimeList
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manga */}
          {results.manga.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">
                Manga ({results.manga.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.manga.map((manga) => (
                  <div
                    key={`manga-${manga.mal_id}`}
                    className="p-4 border rounded-lg shadow hover:shadow-lg transition duration-200 bg-white"
                  >
                    <h3 className="text-lg font-semibold">{manga.title}</h3>
                    {manga.url && (
                      <a
                        href={manga.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View on MyAnimeList
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!loading &&
        !error &&
        query &&
        results.games.length === 0 &&
        results.anime.length === 0 &&
        results.manga.length === 0 && (
          <p className="text-gray-500 text-center">
            No results found for "{query}".
          </p>
        )}
    </Template.Search>
  );
}

export default function Search() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchSuspense />
    </Suspense>
  );
}
