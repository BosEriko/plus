'use client';

import { useEffect } from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import useAuthStore from '@stores/useAuthStore';
import useInitialDataStore from '@stores/useInitialDataStore';
import '@ant-design/v5-patch-for-react-19';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const initAuth = useAuthStore((state) => state.initAuth);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const fetchInitialData = useInitialDataStore((state) => state.fetchInitialData);

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  useEffect(() => {
    if (user && token) {
      fetchInitialData(token);
    }
  }, [user, token, fetchInitialData]);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
