import React from 'react';
import { motion } from 'framer-motion';

export default function PageTable({
  pageTableData, currentStepData, algorithm, algoColor,
  tlb, tlbHits, tlbMisses, workingSet, frameCount,
}) {
  const currentPage = currentStepData?.page;

  return (
    <div className="sim-section" style={{ flex: '0 0 auto' }}>
      <div className="sim-section-header">
        <span className="sim-section-title">Address Translation</span>
        <span className="sim-section-info">TLB: {tlbHits}H/{tlbMisses}M</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <table className="page-table">
            <thead>
              <tr>
                <th>VPN</th>
                <th>Frame</th>
                <th>Valid</th>
                <th>{
                  algorithm === 'FIFO' ? 'Queue'
                  : algorithm === 'LRU' ? 'Time'
                  : algorithm === 'OPT' ? 'Next'
                  : algorithm === 'LFU' ? 'Count'
                  : 'Ref'
                }</th>
              </tr>
            </thead>
            <tbody>
              {pageTableData.map((row) => (
                <tr
                  key={row.vpn}
                  className={row.vpn === currentPage ? 'current-row' : ''}
                  style={row.vpn === currentPage ? { boxShadow: `inset 3px 0 0 ${algoColor}` } : undefined}
                >
                  <td>{row.vpn}</td>
                  <td>{row.frame !== null ? `F${row.frame}` : '—'}</td>
                  <td>
                    {row.valid ? (
                      <span className="valid-check">✓</span>
                    ) : (
                      <span className="valid-x">✗</span>
                    )}
                  </td>
                  <td>{row.meta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          {/* TLB */}
          <div className="sim-section-header">
            <span className="sim-section-title">TLB ({tlbHits}H / {tlbMisses}M)</span>
          </div>
          <div className="tlb-grid">
            {[...tlb, ...Array(Math.max(0, 4 - tlb.length)).fill(null)].map((entry, i) => (
              <motion.div
                key={i}
                className={`tlb-entry ${!entry ? 'empty' : ''}`}
                layout
                initial={false}
                animate={{ opacity: entry ? 1 : 0.4 }}
              >
                <span>V:{entry ? entry.vpn : '—'}</span>
                <span>F:{entry ? entry.frame : '—'}</span>
              </motion.div>
            ))}
          </div>

          {/* Working Set */}
          {workingSet.size > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="sim-section-title" style={{ marginBottom: 6 }}>Working Set</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[...workingSet].map((p) => (
                  <motion.div
                    key={p}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      width: 28, height: 28,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--bg4)',
                      border: `1px solid ${workingSet.size > frameCount ? 'var(--thrash)' : 'var(--working)'}`,
                      borderRadius: 4,
                      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                      color: workingSet.size > frameCount ? 'var(--thrash)' : 'var(--working)',
                    }}
                  >
                    {p}
                  </motion.div>
                ))}
              </div>
              {workingSet.size > frameCount && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ fontSize: 10, color: 'var(--thrash)', marginTop: 4, fontFamily: 'var(--font-mono)' }}
                >
                  ⚠ WSS ({workingSet.size}) &gt; frames ({frameCount})
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
