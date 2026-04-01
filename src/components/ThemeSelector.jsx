import React from 'react';
import { motion } from 'framer-motion';

const DARK_THEMES = [
  {
    id: 'midnight',
    name: 'Midnight',
    mode: 'dark',
    colors: {
      '--void': '#000000',
      '--bg': '#080c14',
      '--bg2': '#0d1117',
      '--bg3': '#161b22',
      '--bg4': '#1c2333',
      '--bg5': '#242c3e',
      '--border': '#21262d',
      '--border2': '#30363d',
      '--border3': '#484f58',
      '--text': '#e6edf3',
      '--text2': '#9ca5af',
      '--text3': '#6e7681',
      '--text4': '#484f58',
      '--glass': 'rgba(22, 27, 34, 0.85)',
      '--glass-border': 'rgba(48, 54, 61, 0.5)',
    },
    preview: 'linear-gradient(135deg, #080c14, #161b22)',
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    mode: 'dark',
    colors: {
      '--void': '#000408',
      '--bg': '#041020',
      '--bg2': '#081828',
      '--bg3': '#0c2236',
      '--bg4': '#122c44',
      '--bg5': '#1a3a56',
      '--border': '#1a3050',
      '--border2': '#204060',
      '--border3': '#2e5a80',
      '--text': '#d4e8ff',
      '--text2': '#8fb8de',
      '--text3': '#5a8ab0',
      '--text4': '#3a6a90',
      '--glass': 'rgba(4, 16, 32, 0.85)',
      '--glass-border': 'rgba(26, 48, 80, 0.5)',
    },
    preview: 'linear-gradient(135deg, #041020, #0c2236)',
  },
  {
    id: 'purple',
    name: 'Nebula',
    mode: 'dark',
    colors: {
      '--void': '#050008',
      '--bg': '#0c0618',
      '--bg2': '#120a22',
      '--bg3': '#1a1030',
      '--bg4': '#24183e',
      '--bg5': '#2e2050',
      '--border': '#2a1a48',
      '--border2': '#3a2a5e',
      '--border3': '#504078',
      '--text': '#e8dcff',
      '--text2': '#b0a0d0',
      '--text3': '#7a68a0',
      '--text4': '#5a4880',
      '--glass': 'rgba(12, 6, 24, 0.85)',
      '--glass-border': 'rgba(42, 26, 72, 0.5)',
    },
    preview: 'linear-gradient(135deg, #0c0618, #1a1030)',
  },
  {
    id: 'forest',
    name: 'Matrix',
    mode: 'dark',
    colors: {
      '--void': '#000800',
      '--bg': '#041408',
      '--bg2': '#081e0e',
      '--bg3': '#0e2a16',
      '--bg4': '#163620',
      '--bg5': '#1e422a',
      '--border': '#1a3820',
      '--border2': '#264e30',
      '--border3': '#3a7048',
      '--text': '#d4ffd8',
      '--text2': '#8fd894',
      '--text3': '#5a9860',
      '--text4': '#3a7848',
      '--glass': 'rgba(4, 20, 8, 0.85)',
      '--glass-border': 'rgba(26, 56, 32, 0.5)',
    },
    preview: 'linear-gradient(135deg, #041408, #0e2a16)',
  },
  {
    id: 'crimson',
    name: 'Crimson',
    mode: 'dark',
    colors: {
      '--void': '#080000',
      '--bg': '#140408',
      '--bg2': '#1e0810',
      '--bg3': '#2a0e18',
      '--bg4': '#361622',
      '--bg5': '#42202e',
      '--border': '#381420',
      '--border2': '#4e2232',
      '--border3': '#703848',
      '--text': '#ffd4d8',
      '--text2': '#d89098',
      '--text3': '#9a5a64',
      '--text4': '#7a3a44',
      '--glass': 'rgba(20, 4, 8, 0.85)',
      '--glass-border': 'rgba(56, 20, 32, 0.5)',
    },
    preview: 'linear-gradient(135deg, #140408, #2a0e18)',
  },
  {
    id: 'warm',
    name: 'Ember',
    mode: 'dark',
    colors: {
      '--void': '#080400',
      '--bg': '#140e04',
      '--bg2': '#1e1608',
      '--bg3': '#2a200e',
      '--bg4': '#362c16',
      '--bg5': '#423820',
      '--border': '#382e14',
      '--border2': '#4e4222',
      '--border3': '#706038',
      '--text': '#fff0d4',
      '--text2': '#d8b880',
      '--text3': '#9a8850',
      '--text4': '#7a6838',
      '--glass': 'rgba(20, 14, 4, 0.85)',
      '--glass-border': 'rgba(56, 46, 20, 0.5)',
    },
    preview: 'linear-gradient(135deg, #140e04, #2a200e)',
  },
];

const LIGHT_THEMES = [
  {
    id: 'snowfall',
    name: 'Snowfall',
    mode: 'light',
    colors: {
      '--void': '#f0f3f8',
      '--bg': '#f6f8fa',
      '--bg2': '#ffffff',
      '--bg3': '#f0f2f5',
      '--bg4': '#e8ecf0',
      '--bg5': '#dce1e8',
      '--border': '#d0d5dd',
      '--border2': '#bcc3ce',
      '--border3': '#a0a8b4',
      '--text': '#1a1e2c',
      '--text2': '#57606a',
      '--text3': '#8b949e',
      '--text4': '#b0b8c2',
      '--glass': 'rgba(255, 255, 255, 0.88)',
      '--glass-border': 'rgba(0, 0, 0, 0.08)',
      '--fifo': '#0969da',
      '--fifo-dim': '#b6d4f2',
      '--fifo-glow': 'rgba(9, 105, 218, 0.15)',
      '--lru': '#8250df',
      '--lru-dim': '#d4c0f0',
      '--lru-glow': 'rgba(130, 80, 223, 0.15)',
      '--opt': '#0e8a93',
      '--opt-dim': '#b0dfe3',
      '--opt-glow': 'rgba(14, 138, 147, 0.15)',
      '--hit': '#1a7f37',
      '--hit-dim': '#b4e6c0',
      '--hit-glow': 'rgba(26, 127, 55, 0.15)',
      '--fault': '#cf222e',
      '--fault-dim': '#f0c0c2',
      '--fault-glow': 'rgba(207, 34, 46, 0.15)',
      '--evict': '#9a6700',
      '--evict-dim': '#f0dca8',
      '--evict-glow': 'rgba(154, 103, 0, 0.15)',
      '--locality': '#d63384',
      '--working': '#1a7f37',
      '--thrash': '#cf222e',
    },
    preview: 'linear-gradient(135deg, #f6f8fa, #e8ecf2)',
  },
  {
    id: 'paper',
    name: 'Ivory',
    mode: 'light',
    colors: {
      '--void': '#F4F3EF',
      '--bg': '#FAFAF8',
      '--bg2': '#FFFFFF',
      '--bg3': '#F4F3EF',
      '--bg4': '#EEECEA',
      '--bg5': '#E8E6E1',
      '--border': '#E8E6E1',
      '--border2': '#D4D0C8',
      '--border3': '#B8B3A8',
      '--text': '#1C1917',
      '--text2': '#57534E',
      '--text3': '#A8A29E',
      '--text4': '#D6D3CD',
      '--glass': 'rgba(250, 250, 248, 0.92)',
      '--glass-border': 'rgba(28, 25, 23, 0.06)',
      '--fifo': '#2563EB',
      '--fifo-dim': '#DBEAFE',
      '--fifo-glow': 'rgba(37, 99, 235, 0.15)',
      '--lru': '#7C3AED',
      '--lru-dim': '#EDE9FE',
      '--lru-glow': 'rgba(124, 58, 237, 0.15)',
      '--opt': '#0891B2',
      '--opt-dim': '#CFFAFE',
      '--opt-glow': 'rgba(8, 145, 178, 0.15)',
      '--hit': '#16A34A',
      '--hit-dim': '#DCFCE7',
      '--hit-glow': 'rgba(22, 163, 74, 0.15)',
      '--fault': '#DC2626',
      '--fault-dim': '#FEE2E2',
      '--fault-glow': 'rgba(220, 38, 38, 0.15)',
      '--evict': '#D97706',
      '--evict-dim': '#FEF3C7',
      '--evict-glow': 'rgba(217, 119, 6, 0.15)',
      '--locality': '#DB2777',
      '--working': '#16A34A',
      '--thrash': '#DC2626',
    },
    preview: 'linear-gradient(135deg, #FAFAF8, #EEECEA)',
  },
  {
    id: 'lavender',
    name: 'Lavender Mist',
    mode: 'light',
    colors: {
      '--void': '#f0eef6',
      '--bg': '#f5f3fa',
      '--bg2': '#ffffff',
      '--bg3': '#eeeaf4',
      '--bg4': '#e4ddef',
      '--bg5': '#d8d0e6',
      '--border': '#cdc4da',
      '--border2': '#b8acc8',
      '--border3': '#9a8cb0',
      '--text': '#201e30',
      '--text2': '#5a5470',
      '--text3': '#8a82a0',
      '--text4': '#b8b0ca',
      '--glass': 'rgba(245, 243, 250, 0.90)',
      '--glass-border': 'rgba(0, 0, 0, 0.06)',
      '--fifo': '#2563eb',
      '--fifo-dim': '#c8d8f8',
      '--fifo-glow': 'rgba(37, 99, 235, 0.15)',
      '--lru': '#7c3aed',
      '--lru-dim': '#d4c0f8',
      '--lru-glow': 'rgba(124, 58, 237, 0.15)',
      '--opt': '#0891b2',
      '--opt-dim': '#b4e0ec',
      '--opt-glow': 'rgba(8, 145, 178, 0.15)',
      '--hit': '#16a34a',
      '--hit-dim': '#b4e4c0',
      '--hit-glow': 'rgba(22, 163, 74, 0.15)',
      '--fault': '#dc2626',
      '--fault-dim': '#f0c0c0',
      '--fault-glow': 'rgba(220, 38, 38, 0.15)',
      '--evict': '#ca8a04',
      '--evict-dim': '#f0dca0',
      '--evict-glow': 'rgba(202, 138, 4, 0.15)',
      '--locality': '#db2777',
      '--working': '#16a34a',
      '--thrash': '#dc2626',
    },
    preview: 'linear-gradient(135deg, #f5f3fa, #e4ddef)',
  },
];

const THEMES = [...DARK_THEMES, ...LIGHT_THEMES];

export default function ThemeSelector({ currentTheme, onThemeChange, isOpen, onToggle }) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onToggle}
    >
      <motion.div
        className="modal-content theme-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onToggle}>✕</button>
        <div className="modal-title">Theme</div>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 20 }}>
          Choose a background theme for the visualiser
        </p>

        {/* Dark Themes */}
        <div className="theme-section-label">
          <span className="theme-section-icon">🌙</span> Dark
        </div>
        <div className="theme-grid">
          {DARK_THEMES.map((theme) => (
            <motion.div
              key={theme.id}
              className={`theme-card ${currentTheme === theme.id ? 'active' : ''}`}
              onClick={() => onThemeChange(theme.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="theme-preview"
                style={{ background: theme.preview }}
              />
              <span className="theme-name">{theme.name}</span>
              {currentTheme === theme.id && (
                <span className="theme-active-dot" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Light Themes */}
        <div className="theme-section-label" style={{ marginTop: 16 }}>
          <span className="theme-section-icon">☀️</span> Light
        </div>
        <div className="theme-grid">
          {LIGHT_THEMES.map((theme) => (
            <motion.div
              key={theme.id}
              className={`theme-card ${currentTheme === theme.id ? 'active' : ''}`}
              onClick={() => onThemeChange(theme.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="theme-preview"
                style={{ background: theme.preview }}
              />
              <span className="theme-name">{theme.name}</span>
              {currentTheme === theme.id && (
                <span className="theme-active-dot" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export { THEMES };
