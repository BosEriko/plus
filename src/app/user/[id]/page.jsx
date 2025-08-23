'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ActivityCalendar from 'react-activity-calendar';
import Template from '@template';
import env from '@utilities/env';

export default function UserPage() {
  const params = useParams();
  const userId = params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${env.server}/api/user/profile/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch profile');

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <Template.Profile>Loading...</Template.Profile>;
  if (error) return <Template.Profile>Error: {error}</Template.Profile>;

  const { user, connection, wallet, statistic, daily } = data;

  // Transform daily data for ActivityCalendar
  const calendarData = daily
    ? Object.entries(daily.attributes.content).map(([date, counts]) => ({
        date,
        count: Object.values(counts).reduce((a, b) => a + b, 0),
      }))
    : [];

  return (
    <Template.Profile>
      <h1>{user.attributes.displayName}</h1>
      <img
        src={user.attributes.profileImage}
        alt={user.attributes.displayName}
        width={150}
        height={150}
      />
      <p>Email: {user.attributes.email}</p>

      {wallet && <p>Coins: {wallet.attributes.coins}</p>}

      {statistic && (
        <div>
          <p>Discord Messages: {statistic.attributes.discordMessageCount}</p>
          <p>Twitch Messages: {statistic.attributes.twitchMessageCount}</p>
        </div>
      )}

      {connection && (
        <div>
          <p>Discord ID: {connection.attributes.discord}</p>
          <p>Tetr.io ID: {connection.attributes.tetrio}</p>
        </div>
      )}

      <h2>Activity Calendar</h2>
      <ActivityCalendar
        data={calendarData}
        blockSize={15}
        blockMargin={5}
        fontSize={14}
        tooltipDataAttrs={(value) => ({
          'data-tip': `${value.date}: ${value.count} messages`,
        })}
      />
    </Template.Profile>
  );
}
