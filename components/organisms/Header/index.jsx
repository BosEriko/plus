'use client';

import useAuthStore from '@stores/useAuthStore';
import Link from 'next/link';
import env from '@utilities/env';
import Atom from '@atom';
import { Pixelify_Sans } from 'next/font/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';

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
    <header className="bg-white text-black border-b-1 border-gray-200">
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
                <div className="flex items-center gap-2">
                  <Link href={`/user/${user.uid}`}>
                    <Atom.Button color="theme">
                      <div className="flex gap-1 items-center">
                        <FontAwesomeIcon icon={faUser} className="mr-1" />
                        <div>Profile</div>
                      </div>
                    </Atom.Button>
                  </Link>

                  <Atom.Button onClick={logout} color="danger">
                    <div className="flex gap-1 items-center">
                      <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
                      <div>Logout</div>
                    </div>
                  </Atom.Button>
                </div>
              ) : (
                <Atom.Button onClick={handleLogin} color="twitch">
                  <div className="flex gap-1 items-center">
                    <FontAwesomeIcon icon={faTwitch} />
                    <div>Login</div>
                  </div>
                </Atom.Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
