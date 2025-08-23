'use client';

import useAuthStore from '@stores/useAuthStore';
import Link from 'next/link';
import env from '@utilities/env';
import Atom from '@atom';
import { Pixelify_Sans } from 'next/font/google';

const pixelify = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['700'],
});

const Header = () => {
  const { user, loading, logout } = useAuthStore();

  const handleLogin = () => {
    window.location.href = `${env.server}/api/authentication/twitch/login`;
  };

  return (
    <header className="bg-white text-black">
      <div className="container mx-auto flex justify-between py-2 items-center">
        <Link href="/">
          <h2 className={`${pixelify.className} text-4xl font-bold text-[#f7b43d]`}>BE+</h2>
        </Link>
        <div>
          {loading ? (
            <div>loading...</div>
          ) : (
            <div>
              {user ? (
                <div className="flex items-center gap-1">
                  <Link href={`/user/${user.uid}`} className="ml-4">
                    <Atom.Button color="theme">
                      Profile
                    </Atom.Button>
                  </Link>
                  <Atom.Button onClick={logout} color="danger">
                    Logout
                  </Atom.Button>
                </div>
              ) : (
                <Atom.Button onClick={handleLogin} color="twitch">
                  Login
                </Atom.Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;