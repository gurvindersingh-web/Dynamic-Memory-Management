import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const COLORS = [
  '#2f81f7', '#a371f7', '#39c5cf', '#3fb950', '#f85149',
  '#d29922', '#ff79c6', '#50fa7b', '#ff5555',
];

function Particle({ x, color, delay }) {
  const startY = -20;
  const endY = window.innerHeight + 20;
  const drift = (Math.random() - 0.5) * 200;
  const size = 4 + Math.random() * 8;
  const rotation = Math.random() * 720 - 360;

  return (
    <motion.div
      className="confetti-particle"
      style={{
        left: x,
        top: startY,
        width: size,
        height: size,
        background: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
      initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
      animate={{
        y: endY,
        x: drift,
        rotate: rotation,
        opacity: [1, 1, 1, 0],
      }}
      transition={{
        duration: 2 + Math.random() * 1.5,
        delay,
        ease: 'easeOut',
      }}
    />
  );
}

export default function ConfettiEffect() {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
    }))
  );

  return (
    <>
      {particles.map((p) => (
        <Particle key={p.id} x={p.x} color={p.color} delay={p.delay} />
      ))}
    </>
  );
}
