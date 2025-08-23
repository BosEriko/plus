'use client';

import useAuthStore from '@stores/useAuthStore';
import Link from 'next/link';
import env from '@utilities/env';
import { Button } from 'antd';

const Header = () => {
  const { user, loading, logout } = useAuthStore();

  const handleLogin = () => {
    window.location.href = `${env.server}/api/authentication/twitch/login`;
  };

  return (
    <header className="bg-white text-black">
      <div className="container mx-auto flex justify-between py-2 items-center">
        <Link href="/">{env.siteName}</Link>
        <div>
          {loading ? (
            <div>loading...</div>
          ) : (
            <div>
              {user ? (
                <div className="flex items-center gap-1">
                  <Link
                    href={`/user/${user.uid}`}
                    className="ml-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 inline-block"
                  >
                    Profile
                  </Link>
                  <Button
                    onClick={logout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Login
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;