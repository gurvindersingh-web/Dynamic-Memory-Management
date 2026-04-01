import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

/**
 * Recharts area chart wrapper for fault/hit accumulation.
 * Themed with CSS variables for dynamic light/dark support.
 *
 * @param {Array} data - Array of { step, faults, hits } objects
 * @param {Object} themeColors - { text3, border, glass, border2, text, text2 }
 */
export default function FaultChart({ data = [], themeColors = {} }) {
  if (data.length === 0) {
    return (
      <div className="chart-container chart-container--empty">
        No data yet
      </div>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="faultGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--fault)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--fault)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="hitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--hit)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--hit)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={themeColors.border || 'var(--border)'}
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="step"
            tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: themeColors.text3 || 'var(--text3)' }}
            axisLine={{ stroke: themeColors.border || 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: themeColors.text3 || 'var(--text3)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: themeColors.glass || 'var(--bg2)',
              border: `1px solid ${themeColors.border2 || 'var(--border2)'}`,
              borderRadius: 10,
              boxShadow: '0 4px 12px rgba(28, 25, 23, 0.10)',
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
              color: themeColors.text || 'var(--text)',
            }}
            labelStyle={{ color: themeColors.text2 || 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
          />
          <Area
            type="monotone"
            dataKey="faults"
            stroke="var(--fault)"
            strokeWidth={2}
            fill="url(#faultGrad)"
            name="Faults"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--fault)' }}
          />
          <Area
            type="monotone"
            dataKey="hits"
            stroke="var(--hit)"
            strokeWidth={2}
            fill="url(#hitGrad)"
            name="Hits"
            dot={false}
            activeDot={{ r: 4, fill: 'var(--hit)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
