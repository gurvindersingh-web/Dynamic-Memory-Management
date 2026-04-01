import React from 'react';
import {
  RadarChart as RechartsRadar,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * Multi-metric radar chart for algorithm performance comparison.
 * Themed with CSS variables for warm-white light theme support.
 *
 * @param {Array} data - Array of { metric, ...algorithmValues }
 * @param {Array} series - Array of { key, name, color }
 * @param {Object} themeColors - { border, text2 }
 */
export default function RadarChartWrapper({
  data = [],
  series = [],
  themeColors = {},
}) {
  if (data.length === 0 || series.length === 0) return null;

  return (
    <div className="radar-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={data} margin={{ top: 16, right: 32, bottom: 16, left: 32 }}>
          <PolarGrid stroke={themeColors.border || 'var(--border)'} strokeDasharray="4 4" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              fill: themeColors.text2 || 'var(--text2)',
            }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          {series.map((s) => (
            <Radar
              key={s.key}
              name={s.name}
              dataKey={s.key}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          ))}
          <Tooltip
            contentStyle={{
              background: 'var(--bg2)',
              border: '1px solid var(--border2)',
              borderRadius: 10,
              boxShadow: '0 4px 12px rgba(28, 25, 23, 0.10)',
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
              color: 'var(--text)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text2)' }} />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
