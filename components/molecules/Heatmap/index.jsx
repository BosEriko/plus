'use client';

import React, { useMemo } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'antd';
import 'react-calendar-heatmap/dist/styles.css';

const WEEKDAYLABEL_LEFT = 5;

CalendarHeatmap.prototype.getTransformForWeekdayLabels = function () {
  if (this.props.horizontal) {
    return `translate(${WEEKDAYLABEL_LEFT}, ${this.getMonthLabelSize()})`;
  }
  return null;
}

CalendarHeatmap.prototype.getHeight = function () {
  return this.getWeekWidth() + (this.getMonthLabelSize() - this.props.gutterSize);
};

const Heatmap = ({ content = {}, type = 'discord', showWeekdayLabels = true }) => {
  const values = useMemo(() => {
    const dates = [];
    const today = new Date();
    const start = new Date(today);
    start.setFullYear(start.getFullYear() - 1);

    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      dates.push({
        date: dateStr,
        count: content[dateStr]?.[`${type}MessageCount`] || 0
      });
    }

    return dates;
  }, [content, type]);

  const totalCount = values.reduce((sum, day) => sum + (day.count || 0), 0);
  const maxCount = Math.max(...values.map(v => v.count));

  const getColor = (count) => {
    if (!count || count === 0) return '#eeeeee';

    const ratio = count / maxCount;
    if (ratio < 0.2) return '#fff1b8';
    if (ratio < 0.4) return '#ffe58f';
    if (ratio < 0.6) return '#ffd666';
    if (ratio < 0.8) return '#f7b43d';
    return '#d48806';
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-2">{totalCount} contributions in the last year on <span className="capitalize">{type}</span></h3>
      <CalendarHeatmap
        startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
        endDate={new Date()}
        values={values}
        className="custom-heatmap"
        classForValue={() => ''}
        gutterSize={1}
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
              width: rect.props.width - 1,
              height: rect.props.height - 1
            })}
          </Tooltip>
        )}
        showWeekdayLabels={showWeekdayLabels}
      />

      <style jsx global>{`
        .custom-heatmap text {
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default Heatmap;
