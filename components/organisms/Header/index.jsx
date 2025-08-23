'use client';

import { useState } from 'react';
import useAuthStore from '@stores/useAuthStore';
import Link from 'next/link';
import env from '@utilities/env';
import Atom from '@atom';
import { Pixelify_Sans } from 'next/font/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';

const pixelify = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['700'],
});

const Header = () => {
  const { user, loading, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = () => {
    window.location.href = `${env.server}/api/authentication/twitch/login`;
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
    <header className="bg-white text-black border-b-1 border-gray-200">
      <div className="container mx-auto flex justify-between items-center py-3 px-4 md:px-6">
        <Link href="/">
          <h2 className={`${pixelify.className} text-3xl md:text-4xl font-bold text-[#f7b43d]`}>
            BE+
          </h2>
        </Link>

        <div className="hidden md:flex items-center gap-3">
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
        <div className="md:hidden bg-white border-t-1 border-gray-200">
          <div className="flex flex-col p-4 gap-3">
            <AuthButtons isMobile />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
