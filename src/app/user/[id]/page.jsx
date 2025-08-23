'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Template from '@template';
import env from '@utilities/env';
import Atom from '@atom';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'antd';
import 'react-calendar-heatmap/dist/styles.css';

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

  const discordData = Array.isArray(daily?.discord) ? daily.discord : [];
  const twitchData = Array.isArray(daily?.twitch) ? daily.twitch : [];

  // Helper to compute total
  const totalCount = (arr) => arr.reduce((sum, day) => sum + (day.count || 0), 0);

  // Function to map count to gold color
  const getColor = (count) => {
    if (!count || count === 0) return '#fff8e7';
    if (count < 5) return '#fff1b8';
    if (count < 15) return '#ffe58f';
    if (count < 30) return '#ffd666';
    return '#f7b43d';
  };

  return (
    <Template.Profile>
      <div className="container mx-auto py-5">
        {/* Cover Photo */}
        <div className="relative w-full h-56 bg-gray-200 rounded-xl overflow-hidden">
          {user.attributes.coverPhoto && (
            <img
              src={user.attributes.coverPhoto}
              alt="Cover Photo"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-[-40px] left-6">
            <img
              src={user.attributes.profileImage}
              alt={user.attributes.displayName}
              className="w-32 h-32 rounded-full border-4 border-white"
            />
          </div>
        </div>

        {/* User Info */}
        <div className="mt-16 px-6 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#f7b43d]">
              {user.attributes.displayName}
            </h1>

            {connection && (
              <div className="mt-4">
                <h2 className="font-semibold text-gray-800 mb-2">Connections</h2>
                {connection.attributes.discord && <p>Discord: {connection.attributes.discord}</p>}
                {connection.attributes.tetrio && <p>Tetr.io: {connection.attributes.tetrio}</p>}
              </div>
            )}

            {/* Calendar Heatmaps */}
            {(discordData.length > 0 || twitchData.length > 0) && (
              <div className="mt-6 flex flex-col gap-6">
                {/* Discord Heatmap */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Discord Activity — Total: {totalCount(discordData)}
                  </h3>
                  <CalendarHeatmap
                    startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                    endDate={new Date()}
                    values={discordData}
                    classForValue={(value) => ''}
                    style={{}}
                    gutterSize={2}
                    transformDayElement={(rect, value, index) => (
                      <Tooltip
                        key={index}
                        title={`${value?.date || 'N/A'}: ${value?.count || 0}`}
                        placement="top"
                      >
                        {React.cloneElement(rect, {
                          style: {
                            fill: getColor(value?.count),
                            stroke: '#ccc',
                          },
                        })}
                      </Tooltip>
                    )}
                    showWeekdayLabels
                  />
                </div>

                {/* Twitch Heatmap */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Twitch Activity — Total: {totalCount(twitchData)}
                  </h3>
                  <CalendarHeatmap
                    startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                    endDate={new Date()}
                    values={twitchData}
                    classForValue={(value) => ''}
                    style={{}}
                    gutterSize={2}
                    transformDayElement={(rect, value, index) => (
                      <Tooltip
                        key={index}
                        title={`${value?.date || 'N/A'}: ${value?.count || 0}`}
                        placement="top"
                      >
                        {React.cloneElement(rect, {
                          style: {
                            fill: getColor(value?.count),
                            stroke: '#ccc',
                          },
                        })}
                      </Tooltip>
                    )}
                    showWeekdayLabels
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 md:w-64">
            {wallet && (
              <Atom.Card>
                <h3 className="font-semibold text-gray-800">Wallet</h3>
                <p className="text-xl font-bold text-[#f7b43d]">{wallet.attributes.coins} coins</p>
              </Atom.Card>
            )}

            {statistic && (
              <Atom.Card>
                <h3 className="font-semibold text-gray-800">Statistics</h3>
                {statistic.attributes.discordMessageCount !== undefined && (
                  <p>Discord Messages: {statistic.attributes.discordMessageCount}</p>
                )}
                {statistic.attributes.twitchMessageCount !== undefined && (
                  <p>Twitch Messages: {statistic.attributes.twitchMessageCount}</p>
                )}
              </Atom.Card>
            )}
          </div>
        </div>
      </div>
    </Template.Profile>
  );
}
