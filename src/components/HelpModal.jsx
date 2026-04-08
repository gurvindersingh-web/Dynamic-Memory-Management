import React from 'react';
import { motion } from 'framer-motion';

export default function HelpModal({ onClose }) {
  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause simulation' },
    { key: '→', desc: 'Step forward' },
    { key: '←', desc: 'Step backward' },
    { key: 'R', desc: 'Reset simulation' },
    { key: '1', desc: 'Switch to FIFO' },
    { key: '2', desc: 'Switch to LRU' },
    { key: '3', desc: 'Switch to OPT' },
    { key: '4', desc: 'Switch to LFU' },
    { key: '5', desc: 'Switch to CLOCK' },
    { key: 'H / ?', desc: 'Toggle this help modal' },
  ];

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="modal-title">Keyboard Shortcuts</div>

        <div style={{ marginBottom: 24 }}>
          {shortcuts.map(({ key, desc }) => (
            <div className="shortcut-row" key={key}>
              <span className="shortcut-key">{key}</span>
              <span className="shortcut-desc">{desc}</span>
            </div>
          ))}
        </div>

        <div className="modal-title" style={{ fontSize: 16 }}>About</div>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
          <strong>MEM//VISUALIZER</strong> is an interactive tool for understanding
          dynamic memory management page replacement algorithms. It visualizes how
          FIFO, LRU, Optimal, LFU, and Clock (Second Chance) algorithms handle page faults and manage physical
          memory frames.
        </p>
        <br />
        <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
          <strong>Concepts visualized:</strong>
          <br />
          • <strong>Page Faults</strong> — When a requested page isn't in physical memory
          <br />
          • <strong>Page Table</strong> — Virtual-to-physical address mapping
          <br />
          • <strong>TLB</strong> — Translation Lookaside Buffer for fast lookups
          <br />
          • <strong>Working Set</strong> — Pages actively being used
          <br />
          • <strong>Temporal Locality</strong> — Tendency to re-access recent pages
          <br />
          • <strong>Thrashing</strong> — When working set exceeds available frames
          <br />
          • <strong>Belady's Anomaly</strong> — FIFO paradox where more frames = more faults
        </p>
      </motion.div>
    </motion.div>
  );
}
