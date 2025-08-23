'use client';

import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'antd';
import 'react-calendar-heatmap/dist/styles.css';

const getColor = (count) => {
  if (!count || count === 0) return '#fff8e7';
  if (count < 5) return '#fff1b8';
  if (count < 15) return '#ffe58f';
  if (count < 30) return '#ffd666';
  return '#f7b43d';
};

const Heatmap = ({ values = [], title = '', showWeekdayLabels = true }) => {
  const totalCount = (arr) => arr.reduce((sum, day) => sum + (day.count || 0), 0);

  return (
    <div>
      {title && <h3 className="font-semibold text-gray-800 mb-2">{title} — Total: {totalCount(values)}</h3>}
      <CalendarHeatmap
        startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
        endDate={new Date()}
        values={values}
        classForValue={() => ''}
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
                rx: 10,
                ry: 10,
              },
            })}
          </Tooltip>
        )}
        showWeekdayLabels={showWeekdayLabels}
      />
    </div>
  );
};

export default Heatmap;
