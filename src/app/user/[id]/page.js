'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../_utilities/firebase';
import ActivityCalendar from 'react-activity-calendar';

export default function UserPage() {
  const params = useParams();
  const userId = params.id;

  const [calendarData, setCalendarData] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        const userRef = doc(db, 'users', userId);
        const messagesRef = doc(db, 'messages_counts', userId);

        const [userSnap, messagesSnap] = await Promise.all([
          getDoc(userRef),
          getDoc(messagesRef),
        ]);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }

        if (messagesSnap.exists()) {
          const content = messagesSnap.data().content || [];

          if (content.length > 0) {
            const counts = content.map(item => item.twitchMessageCount);
            const max = Math.max(...counts);
            const min = Math.min(...counts);
            const range = max - min || 1;
            const step = range / 4;

            const transformed = content.map(item => {
              const count = item.twitchMessageCount;
              let level = 0;
              if (count >= min + step) level = 1;
              if (count >= min + step * 2) level = 2;
              if (count >= min + step * 3) level = 3;
              if (count >= min + step * 4) level = 4;

              return {
                date: item.timestamp,
                count,
                level,
              };
            });

            setCalendarData(transformed);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">User ID: {userId}</h1>

      <h2 className="mt-4 font-semibold">User Info</h2>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(userData, null, 2)}</pre>

      <h2 className="mt-4 font-semibold">Activity Calendar</h2>
      <ActivityCalendar
        data={calendarData}
        blockSize={14}
        blockRadius={3}
        blockMargin={4}
        labels={{
          totalCount: '{{count}} messages in {{year}}',
        }}
        theme={{
          light: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
          dark: ['#1c1c1c', '#003f1f', '#007733', '#00b352', '#00e36f'],
        }}
      />
    </div>
  );
}
