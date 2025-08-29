'use client';

import { useState } from 'react';
import useAuthStore from '@stores/useAuthStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import env from '@utilities/env';
import Atom from '@atom';
import { Pixelify_Sans } from 'next/font/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faBars, faTimes, faCog, faSearch } from '@fortawesome/free-solid-svg-icons';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';

const pixelify = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['700'],
});

const Header = () => {
  const { user, loading, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    window.location.href = `${env.server}/api/authentication/twitch/login`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      if (menuOpen) setMenuOpen(false);
    }
  };

  const AuthButtons = ({ isMobile = false }) => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (user) {
      return (
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center gap-2'}`}>
          <Link
            href={`/user/${user.uid}`}
            onClick={() => isMobile && setMenuOpen(false)}
            className={isMobile ? 'w-full' : ''}
          >
            <Atom.Button color="theme" className={isMobile ? 'w-full' : ''}>
              <div className="flex gap-1 items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="mr-1" />
                <div>Profile</div>
              </div>
            </Atom.Button>
          </Link>

          <Link
            href={`/setting`}
            onClick={() => isMobile && setMenuOpen(false)}
            className={isMobile ? 'w-full' : ''}
          >
            <Atom.Button color="primary" className={isMobile ? 'w-full' : ''}>
              <div className="flex gap-1 items-center justify-center">
                <FontAwesomeIcon icon={faCog} className="mr-1" />
                <div>Setting</div>
              </div>
            </Atom.Button>
          </Link>

          <Atom.Button
            onClick={() => {
              logout();
              if (isMobile) setMenuOpen(false);
            }}
            color="danger"
            className={isMobile ? 'w-full' : ''}
          >
            <div className="flex gap-1 items-center justify-center">
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
              <div>Logout</div>
            </div>
          </Atom.Button>
        </div>
      );
    }

    return (
      <Atom.Button
        onClick={() => {
          handleLogin();
          if (isMobile) setMenuOpen(false);
        }}
        color="twitch"
        className={isMobile ? 'w-full' : ''}
      >
        <div className="flex gap-1 items-center justify-center">
          <FontAwesomeIcon icon={faTwitch} />
          <div>Login</div>
        </div>
      </Atom.Button>
    );
  };

  return (
    <header className="bg-white text-black border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center py-3 px-4 md:px-6">
        <Link href="/">
          <h2 className={`${pixelify.className} text-3xl md:text-4xl font-bold text-[#f7b43d]`}>
            BE+
          </h2>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search BosEriko+"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f7b43d] w-64"
            />
            <button
              type="submit"
              className="absolute right-2 text-gray-500 hover:text-black"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </form>
          <AuthButtons />
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-600 text-2xl focus:outline-none"
          >
            <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="flex flex-col p-4 gap-3">
            <form onSubmit={handleSearch} className="relative flex items-center mb-3">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f7b43d]"
              />
              <button
                type="submit"
                className="absolute right-3 text-gray-500 hover:text-black"
              >
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </form>
            <AuthButtons isMobile />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
