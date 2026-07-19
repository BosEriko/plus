'use client';

import { useSearchParams, useRouter } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const router = useRouter();
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
        const response = await fetch(
          `${env.server}/legacy/data/search?query=${encodeURIComponent(query)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (!data.success) {
          if (data.status === '429' || data.type === 'RateLimitException') {
            setError(
              'You are being rate-limited. Please wait a few seconds and try again.'
            );
          } else {
            setError(data.message || 'Something went wrong.');
          }
        } else {
          setResults({
            games: uniqueBy(data.results.games || [], (g) => g.name),
            anime: uniqueBy(data.results.anime || [], (a) => a.name),
            manga: uniqueBy(data.results.manga || [], (m) => m.name),
          });
        }
      } catch (err) {
        setError('Failed to fetch search results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Helper: Get release year safely
  const getYear = (date) => {
    if (!date) return 'N/A';
    const parsed = new Date(date);
    return isNaN(parsed.getFullYear()) ? 'N/A' : parsed.getFullYear();
  };

  // Card UI
  const Card = ({ item, type }) => {
    const thumbnail =
      item.thumbnail?.startsWith('//') ? 'https:' + item.thumbnail : item.thumbnail;
    const year = item.year || 'N/A';

    // Handle routing when clicked
    const handleClick = () => {
      router.push(`/${type}/${item.id}`);
    };

    return (
      <div
        onClick={handleClick}
        className="flex items-center p-3 border rounded-xl shadow hover:shadow-lg transition duration-200 bg-white cursor-pointer"
      >
        <div
          className={`w-24 h-24 flex-shrink-0 rounded-lg bg-gray-200 bg-center bg-cover relative overflow-hidden ${
            item.nsfw ? 'blur-sm' : ''
          }`}
          style={{
            backgroundImage: `url(${thumbnail})`,
          }}
        >
          {item.nsfw && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-semibold rounded-lg">
              NSFW
            </div>
          )}
        </div>

        {/* Info */}
        <div className="ml-4 flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          <p className="text-sm text-gray-500">{year}</p>
        </div>
      </div>
    );
  };

  return (
    <Template.Search>
      <h1 className="text-2xl font-bold mb-4 text-center">Search Results</h1>

      {loading && <p className="text-blue-500">Searching for results...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="container mx-auto space-y-8">
          {/* Games */}
          {results.games.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">
                Games ({results.games.length})
              </h2>
              <div className="space-y-3">
                {results.games.map((game, index) => (
                  <Card key={`game-${game.id || index}`} item={game} type="game" />
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
              <div className="space-y-3">
                {results.anime.map((anime, index) => (
                  <Card key={`anime-${anime.id || index}`} item={anime} type="anime" />
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
              <div className="space-y-3">
                {results.manga.map((manga, index) => (
                  <Card key={`manga-${manga.id || index}`} item={manga} type="manga" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
