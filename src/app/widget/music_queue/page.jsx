'use client';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Pixelify_Sans } from 'next/font/google';
import { useWebSocket } from '@hooks/useWebsocket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClock, faPlay, faPause, faMusic, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';

const pixelify = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['700'],
});

/* ---------- helpers: shallow-ish equality to avoid redundant state updates ---------- */
function queuesEqual(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    if (!x || !y) return false;
    // compare stable fields you care about
    if (
      x.id !== y.id ||
      x.status !== y.status ||
      x.timestamp !== y.timestamp ||
      x.username !== y.username
    ) return false;

    const xm = x.music || {}, ym = y.music || {};
    if (
      xm.id !== ym.id ||
      xm.title !== ym.title ||
      xm.singer !== ym.singer ||
      xm.length !== ym.length ||
      xm.albumCoverUrl !== ym.albumCoverUrl ||
      xm.spotifyUrl !== ym.spotifyUrl
    ) return false;
  }
  return true;
}

function detailsEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    a.title === b.title &&
    a.singer === b.singer &&
    a.length === b.length &&
    a.albumCoverUrl === b.albumCoverUrl &&
    a.spotifyUrl === b.spotifyUrl &&
    a.currentTime === b.currentTime && // we still update this locally with the timer
    a.progress === b.progress &&
    a.isPlaying === b.isPlaying
  );
}

/* ---------- components ---------- */

export default function MusicQueueWidget() {
  const [musicQueue, setMusicQueue] = useState([]);
  const [musicDetail, setMusicDetail] = useState(null);
  const { wsData } = useWebSocket();
  const intervalRef = useRef(null);

  // ingest websocket updates, but only set state when data actually changed
  useEffect(() => {
    if (!wsData) return;

    if (wsData?.type === 'MUSIC_QUEUE') {
      const incoming = wsData.musicQueue || [];
      setMusicQueue(prev => (queuesEqual(prev, incoming) ? prev : incoming));
    }

    if (wsData?.type === 'MUSIC_DETAIL') {
      const incoming = wsData.musicDetails || null;
      setMusicDetail(prev => (detailsEqual(prev, incoming) ? prev : incoming));
    }
  }, [wsData]);

  // Smooth progress updater (keeps UI moving between WS pushes)
  useEffect(() => {
    if (!musicDetail) return;
    clearInterval(intervalRef.current);

    if (musicDetail.isPlaying) {
      intervalRef.current = setInterval(() => {
        setMusicDetail(prev => {
          if (!prev) return prev;

          const [cm, cs] = (prev.currentTime || '0:00').split(':').map(Number);
          const [lm, ls] = (prev.length || '0:00').split(':').map(Number);

          const currentSec = (cm * 60 + cs) + 1;
          const lengthSec = (lm * 60 + ls) || 1;

          if (currentSec >= lengthSec) {
            // finish
            return { ...prev, currentTime: prev.length, progress: 100 };
          }

          const mm = Math.floor(currentSec / 60);
          const ss = String(currentSec % 60).padStart(2, '0');

          // only update the minimal fields to avoid changing identity too much
          return {
            ...prev,
            currentTime: `${mm}:${ss}`,
            progress: (currentSec / lengthSec) * 100,
          };
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [musicDetail?.isPlaying, musicDetail?.length, musicDetail?.currentTime]);

  // document title
  useEffect(() => {
    if (musicDetail) {
      document.title = `🎵 Now Playing: ${musicDetail.title} - ${musicDetail.singer}`;
    } else {
      document.title = 'Music Player Queue';
    }
  }, [musicDetail]);

  // derive lists (memoized)
  const sortedQueue = useMemo(() => {
    return [...musicQueue].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [musicQueue]);

  const queued = useMemo(
    () => sortedQueue.filter((item) => item.status === 'QUEUED'),
    [sortedQueue]
  );
  const completed = useMemo(
    () =>
      [...sortedQueue]
        .filter(item => item.status === 'COMPLETED')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [sortedQueue]
  );

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage: `url('https://i.imgur.com/HJbSDHE.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Blurred/dim overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 container mx-auto p-4 space-y-6">
        {/* Playing */}
        <section>
          <h2 className={`${pixelify.className} text-xl font-bold text-yellow-100 mb-3 drop-shadow-[1px_1px_2px_black] flex items-center justify-center gap-2`}>
            <FontAwesomeIcon icon={faMusic} className="text-yellow-200" />
            Now Playing
          </h2>
          <div className="space-y-3">
            {!musicDetail ? (
              <p className="text-yellow-100/80 italic">No song is playing right now.</p>
            ) : (
              <NowPlayingCard detail={musicDetail} />
            )}
          </div>
        </section>

        {/* Pending */}
        <section>
          <h2 className={`${pixelify.className} text-xl font-bold text-yellow-100 mb-3 drop-shadow-[1px_1px_2px_black] flex items-center justify-center gap-2`}>
            <FontAwesomeIcon icon={faHourglassHalf} className="text-yellow-200" />
            Pending Songs
          </h2>
          <div className="space-y-3">
            {queued.length === 0 ? (
              <p className="text-yellow-100/80 italic">No pending songs.</p>
            ) : (
              queued.map((item) => (
                <SongCard key={item.timestamp} item={item} />
              ))
            )}
          </div>
        </section>

        {/* Played */}
        <section>
          <h2 className={`${pixelify.className} text-xl font-bold text-yellow-100 mb-3 drop-shadow-[1px_1px_2px_black] flex items-center justify-center gap-2`}>
            <FontAwesomeIcon icon={faCheck} className="text-yellow-200" />
            Played Songs
          </h2>
          <div className="space-y-3">
            {completed.length === 0 ? (
              <p className="text-yellow-100/80 italic">No songs played yet.</p>
            ) : (
              completed.map((item) => (
                <SongCard key={item.timestamp} item={item} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- SongCard (memoized) ---------- */
const SongCard = React.memo(function SongCard({ item }) {
  let statusLabel = '';
  let statusIcon = null;

  switch (item.status) {
    case 'COMPLETED':
      statusIcon = faCheck;
      statusLabel = 'Played';
      break;
    default:
      statusIcon = faClock;
      statusLabel = 'Pending';
  }

  const Wrapper = item.music?.spotifyUrl ? 'a' : 'div';

  return (
    <Wrapper
      href={item.music?.spotifyUrl || undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <div className="flex items-center gap-4 p-3 bg-yellow-300 rounded-[10px] shadow-xl border-[4px] border-yellow-500 cursor-pointer transform-gpu will-change-transform transition-transform duration-200 hover:scale-[1.02]">
        <img
          src={item.music?.albumCoverUrl}
          alt={item.music?.title}
          className="w-16 h-16 rounded-[5px] object-cover border-[3px] border-yellow-500 bg-yellow-500"
        />
        <div className="flex-1">
          <p className="font-bold text-yellow-900 truncate">{item.music?.title}</p>
          <p className="text-yellow-700 text-sm font-bold truncate">{item.music?.singer}</p>
          <p className="text-yellow-600 text-xs">{item.music?.length}</p>
          <p className="text-yellow-800 text-xs italic">Added by {item.username}</p>
        </div>
        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-800 text-yellow-200">
          <FontAwesomeIcon icon={statusIcon} />
          {statusLabel}
        </span>
      </div>
    </Wrapper>
  );
}, (prevProps, nextProps) => {
  // shallow compare the fields we render to avoid re-renders during WS heartbeats
  const a = prevProps.item, b = nextProps.item;
  if (a === b) return true;
  if (!a || !b) return false;

  const am = a.music || {}, bm = b.music || {};
  return (
    a.id === b.id &&
    a.status === b.status &&
    a.username === b.username &&
    a.timestamp === b.timestamp &&
    am.id === bm.id &&
    am.title === bm.title &&
    am.singer === bm.singer &&
    am.length === bm.length &&
    am.albumCoverUrl === bm.albumCoverUrl &&
    am.spotifyUrl === bm.spotifyUrl
  );
});

/* ---------- NowPlayingCard (memoized) ---------- */
const NowPlayingCard = React.memo(function NowPlayingCard({ detail }) {
  const Wrapper = detail.spotifyUrl ? 'a' : 'div';

  return (
    <Wrapper
      href={detail.spotifyUrl || undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <div className="flex items-center gap-4 p-3 bg-yellow-300 rounded-[10px] shadow-xl border-[5px] border-yellow-500 cursor-pointer transform-gpu will-change-transform transition-transform duration-200 hover:scale-[1.02]">
        <img
          src={detail.albumCoverUrl}
          alt={detail.title}
          className="w-20 h-20 rounded-[5px] object-cover border-[3px] border-yellow-500 bg-yellow-500"
        />
        <div className="flex flex-col flex-1">
          <p className="text-xl font-bold text-yellow-900 truncate">{detail.title}</p>
          <p className="text-sm text-yellow-700 font-bold truncate">{detail.singer}</p>
          {detail.username && (<p className="text-yellow-800 text-xs italic">Added by {detail.username}</p>)}

          <ProgressBar currentTime={detail.currentTime} length={detail.length} progress={detail.progress} />

        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-800 text-yellow-200">
            <FontAwesomeIcon icon={detail.isPlaying ? faPlay : faPause} />
            {detail.isPlaying ? 'Playing' : 'Paused'}
          </span>
        </div>
      </div>
    </Wrapper>
  );
}, (a, b) => detailsEqual(a.detail, b.detail));

function ProgressBar({ currentTime, length, progress }) {
  return (
    <>
      <div className="w-full h-2 bg-yellow-400 rounded-full mt-2 overflow-hidden">
        <div
          className="h-2 bg-yellow-800 transition-all duration-500 ease-linear"
          style={{ width: `${progress ?? 0}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-yellow-700 font-bold mt-1">
        <span>{currentTime}</span>
        <span>{length}</span>
      </div>
    </>
  );
}
