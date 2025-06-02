'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../_utilities/firebase';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import ReactTooltip from 'react-tooltip';

function fillMissingDates(data, startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const dateMap = new Map(data.map(d => [d.date, d]));

  const filled = [];
  let current = new Date(start);

  while (current <= end) {
    const iso = current.toISOString().slice(0, 10);
    if (dateMap.has(iso)) {
      filled.push(dateMap.get(iso));
    } else {
      filled.push({ date: iso, count: 0 });
    }
    current.setDate(current.getDate() + 1);
  }

  return filled;
}

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

        const startDateStr = '2024-06-03';
        const endDateStr = '2025-06-02';

        if (messagesSnap.exists()) {
          const content = messagesSnap.data().content || [];

          if (content.length > 0) {
            const counts = content.map(item => item.twitchMessageCount);
            const max = Math.max(...counts);
            const min = Math.min(...counts);
            const range = max - min || 1;
            const step = range / 4;

            // Transform data to react-calendar-heatmap format
            const transformed = content.map(item => {
              const count = item.twitchMessageCount;
              return {
                date: new Date(item.timestamp).toISOString().slice(0, 10),
                count,
              };
            });

            const fullYearData = fillMissingDates(transformed, startDateStr, endDateStr);
            setCalendarData(fullYearData);
          } else {
            setCalendarData(fillMissingDates([], startDateStr, endDateStr));
          }
        } else {
          setCalendarData(fillMissingDates([], startDateStr, endDateStr));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [userId]);

  // Function to return CSS class for heatmap color based on count
  const classForValue = (value) => {
    if (!value || value.count === 0) return 'color-empty';
    if (value.count >= 4) return 'color-scale-4';
    if (value.count >= 3) return 'color-scale-3';
    if (value.count >= 2) return 'color-scale-2';
    return 'color-scale-1';
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">User ID: {userId}</h1>

      <h2 className="mt-4 font-semibold">User Info</h2>
      <pre className="bg-gray-100 p-4 rounded">
        {userData ? JSON.stringify(userData, null, 2) : 'Loading...'}
      </pre>

      <h2 className="mt-4 font-semibold">Activity Calendar</h2>
      {calendarData.length > 0 ? (
        <>
          <CalendarHeatmap
            startDate={calendarData[0].date}
            endDate={calendarData[calendarData.length - 1].date}
            values={calendarData}
            classForValue={classForValue}
            showWeekdayLabels
            tooltipDataAttrs={value => ({
              'data-tip': value
                ? `${value.date}: ${value.count} messages`
                : 'No messages',
            })}
          />
          <ReactTooltip />
        </>
      ) : (
        <p className="text-gray-500 italic">No activity data found.</p>
      )}

      {/* Color scale legend */}
      <div className="mt-4 flex space-x-2 text-sm">
        <div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded" />
        <div className="w-6 h-6 bg-green-100 rounded" />
        <div className="w-6 h-6 bg-green-300 rounded" />
        <div className="w-6 h-6 bg-green-500 rounded" />
        <div className="w-6 h-6 bg-green-700 rounded" />
        <span className="ml-2">Messages intensity</span>
      </div>

      <style jsx>{`
        .color-empty {
          fill: #ebedf0;
        }
        .color-scale-1 {
          fill: #c6e48b;
        }
        .color-scale-2 {
          fill: #7bc96f;
        }
        .color-scale-3 {
          fill: #239a3b;
        }
        .color-scale-4 {
          fill: #196127;
        }
      `}</style>
    </div>
  );
}
