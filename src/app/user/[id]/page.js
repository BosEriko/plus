'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../_utilities/firebase';

export default function UserPage() {
  const params = useParams();
  const userId = params.id;

  const [userData, setUserData] = useState(null);
  const [messagesData, setMessagesData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        const userDocRef = doc(db, 'users', userId);
        const messagesDocRef = doc(db, 'messages_counts', userId);

        const [userSnap, messagesSnap] = await Promise.all([
          getDoc(userDocRef),
          getDoc(messagesDocRef),
        ]);

        setUserData(userSnap.exists() ? userSnap.data() : null);
        setMessagesData(messagesSnap.exists() ? messagesSnap.data() : null);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <div>
      <h1>User ID: {userId}</h1>
      <h2 className="mt-4 font-bold">User Data</h2>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(userData, null, 2)}</pre>

      <h2 className="mt-4 font-bold">Messages Count</h2>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(messagesData, null, 2)}</pre>
    </div>
  );
}
