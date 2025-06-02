'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../_utilities/firebase';
import ActivityCalendar from 'react-activity-calendar';

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
            filled.push({ date: iso, count: 0, level: 0 });
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
                
                if (messagesSnap.exists()) {
                    const content = messagesSnap.data().content || [];
                    
                    const startDateStr = '2024-06-03';
                    const endDateStr = '2025-06-02';
                    
                    if (content.length > 0) {
                        const counts = content.map(item => item.twitchMessageCount);
                        const max = Math.max(...counts);
                        const min = Math.min(...counts);
                        const range = max - min || 1;
                        const step = range / 4;
                        
                        const transformed = content.map(item => {
                            const count = item.twitchMessageCount;
                            let level = 0;
                            if (count > 0) level = 1;
                            if (count >= min + step * 2) level = 2;
                            if (count >= min + step * 3) level = 3;
                            if (count >= min + step * 4) level = 4;
                            
                            return {
                                date: new Date(item.timestamp).toISOString().split('T')[0],
                                count,
                                level,
                            };
                        });
                        
                        const fullYearData = fillMissingDates(transformed, startDateStr, endDateStr);
                        setCalendarData(fullYearData);
                    } else {
                        // No content - fill full year with zeros
                        setCalendarData(fillMissingDates([], startDateStr, endDateStr));
                    }
                } else {
                    const startDateStr = '2024-06-03';
                    const endDateStr = '2025-06-02';
                    setCalendarData(fillMissingDates([], startDateStr, endDateStr));
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };
        
        fetchData();
    }, [userId]);
    
    return (
        <div className="p-4 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">User ID: {userId}</h1>
            
            <section className="mb-8 p-4 bg-gray-800 rounded-md text-white flex items-center gap-4">
                {userData ? (
                    <>
                        <img
                            src={userData.profileImage}
                            alt={`${userData.displayName}'s profile`}
                            className="w-20 h-20 rounded-full object-cover border-2 border-green-400"
                        />
                        <div>
                            <h2 className="text-xl font-semibold">{userData.displayName}</h2>
                            <p>Points: <span className="font-medium">{userData.points}</span></p>
                            <p>Twitch Messages: <span className="font-medium">{userData.twitchMessageCount}</span></p>
                        </div>
                    </>
                ) : (
                    <p>Loading user info...</p>
                )}
            </section>
            
            <h2 className="mb-2 font-semibold text-gray-900">Raw User Data</h2>
            <pre className="bg-gray-100 p-4 rounded mb-8 overflow-x-auto max-h-60">
                {userData ? JSON.stringify(userData, null, 2) : 'Loading...'}
            </pre>
            
            <h2 className="mb-2 font-semibold">Activity Calendar</h2>
            {calendarData.length > 0 ? (
                <ActivityCalendar
                    data={calendarData}
                    blockSize={14}
                    blockRadius={3}
                    blockMargin={4}
                    colorScheme="dark"
                    showWeekdayLabels={true}
                    year={2025} // Use 2025 because your end date is 2025-06-02
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
