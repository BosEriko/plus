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
                date: new Date(item.timestamp).toISOString().split('T')[0],
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
      <pre className="bg-gray-100 p-4 rounded">
        {userData ? JSON.stringify(userData, null, 2) : 'Loading...'}
      </pre>

      <h2 className="mt-4 font-semibold">Activity Calendar</h2>
      {calendarData.length > 0 ? (
        <ActivityCalendar
            data={calendarData}
            blockSize={14}
            blockRadius={3}
            blockMargin={4}
            colorScheme="dark"
            showWeekdayLabels={true}
            labels={{
                months: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ],
                weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                totalCount: '{{count}} messages in {{year}}',
                legend: {
                less: 'Less',
                more: 'More',
                },
            }}
            theme={{
                dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
            }}
        />
      ) : (
        <p className="text-gray-500 italic">No activity data found.</p>
      )}
    </div>
  );
}
