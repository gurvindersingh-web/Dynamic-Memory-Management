import React from 'react';
import { motion } from 'framer-motion';
import MagicRings from '../component/MagicRings';
import Shuffle from '../component/Shuffle';
import heroImg from '../assets/vite.svg';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function IntroPage({ onStart }) {
  return (
    <motion.div
      className="intro-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* MagicRings animated background */}
      <div className="intro-bg">
        <MagicRings
          color="#2f81f7"
          colorTwo="#a371f7"
          speed={0.6}
          ringCount={6}
          attenuation={8}
          lineThickness={2.5}
          baseRadius={0.25}
          radiusStep={0.09}
          scaleRate={0.12}
          opacity={0.5}
          blur={0}
          noiseAmount={0.05}
          rotation={15}
          ringGap={1.4}
          fadeIn={0.7}
          fadeOut={0.5}
          followMouse={true}
          mouseInfluence={0.15}
          hoverScale={1.1}
          parallax={0.04}
          clickBurst={true}
        />
      </div>

      {/* Dot-grid texture overlay */}
      <div className="dot-grid-pattern" />

      {/* Navbar */}
      <nav className="intro-nav">
        <div className="intro-nav-left">
          <img src={heroImg} alt="DMMVisualiser" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span className="intro-nav-title">DMMVisualiser</span>
          <span className="intro-nav-version">v2.0</span>
        </div>
        <div className="intro-nav-right">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="intro-nav-link">
            GitHub
          </a>
          <span className="intro-nav-link" style={{ cursor: 'default', opacity: 0.5 }}>Docs</span>
        </div>
      </nav>

      {/* Content */}
      <div className="intro-content">
        <div className="intro-center">
          {/* Editorial Title */}
          <div className="intro-title-wrap">
            <Shuffle
              text="Dynamic Memory Management"
              tag="h1"
              className="intro-title-line"
              style={{
                color: 'var(--text)',
                lineHeight: 1.35,
              }}
              shuffleDirection="up"
              duration={0.5}
              stagger={0.02}
              shuffleTimes={2}
              triggerOnce={true}
              triggerOnHover={false}
              threshold={0}
              rootMargin="0px"
            />
            <Shuffle
              text="Visualiser"
              tag="h1"
              className="intro-title-line intro-title-accent"
              style={{
                color: 'var(--fifo)',
                lineHeight: 1.35,
              }}
              shuffleDirection="up"
              duration={0.6}
              stagger={0.03}
              shuffleTimes={3}
              triggerOnce={true}
              triggerOnHover={true}
              colorFrom="var(--fifo)"
              colorTo="var(--lru)"
              threshold={0}
              rootMargin="0px"
            />
          </div>

          {/* Description */}
          <motion.p
            className="intro-desc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
          >
            Explore how your operating system manages memory in real-time.
            Visualise{' '}
            <a href="https://www.geeksforgeeks.org/page-replacement-algorithms-in-operating-systems/" target="_blank" rel="noopener noreferrer" className="intro-highlight intro-link">FIFO</a>,{' '}
            <a href="https://www.geeksforgeeks.org/lru-cache-implementation/" target="_blank" rel="noopener noreferrer" className="intro-highlight lru intro-link">LRU</a>, and{' '}
            <a href="https://www.geeksforgeeks.org/optimal-page-replacement-algorithm/" target="_blank" rel="noopener noreferrer" className="intro-highlight opt intro-link">Optimal</a>,{' '}
            <span className="intro-highlight" style={{ color: 'var(--lfu)' }}>LFU</span>, and{' '}
            <span className="intro-highlight" style={{ color: 'var(--clock)' }}>Clock (Second Chance)</span>{' '}
            page replacement algorithms with stunning animations, TLB simulation, working set tracking,
            and Belady&apos;s anomaly detection — all in one interactive tool.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            className="intro-features"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            {[
              '5 Algorithms',
              'Live TLB',
              'Page Table',
              'Thrashing Detection',
              'PDF Export',
              'Theme Options',
            ].map((feat, i) => (
              <motion.span
                key={i}
                className="intro-pill"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1, duration: 0.4 }}
              >
                {feat}
              </motion.span>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.button
            className="intro-cta"
            onClick={onStart}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.6, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15), 0 8px 32px rgba(37, 99, 235, 0.2)' }}
            whileTap={{ scale: 0.98 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}>
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
            Start Simulation
          </motion.button>

          {/* Keyboard hint */}
          <motion.div
            className="intro-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            Press <kbd>Enter</kbd> to begin · <kbd>H</kbd> for help
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
