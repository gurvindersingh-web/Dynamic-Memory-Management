import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BookOpen, GraduationCap } from 'lucide-react';
import { simulatorConfigs } from '../utils/simulatorConfig';
import ThemeSelector, { THEMES } from '../components/ThemeSelector';
import HelpModal from '../components/HelpModal';

export default function AppLayout() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [theme, setTheme] = useState('midnight');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Apply theme CSS variables
  useEffect(() => {
    const t = THEMES.find((t) => t.id === theme);
    if (t) {
      Object.entries(t.colors).forEach(([prop, val]) => {
        document.documentElement.style.setProperty(prop, val);
      });
    }
  }, [theme]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      switch (e.key) {
        case 'h':
        case 'H':
        case '?':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setShowHelp((prev) => !prev);
          }
          break;
        case 't':
        case 'T':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setShowTheme((prev) => !prev);
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={18} />, color: '#8b949e', end: true },
    ...simulatorConfigs.map((sim) => {
      const Icon = sim.icon;
      return {
        path: sim.path,
        label: sim.title,
        icon: <Icon size={18} />,
        color: sim.color,
        end: false,
      };
    }),
  ];

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <button
            className="sidebar-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen((prev) => !prev);
            }}
            title="Toggle sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 2.75A.75.75 0 011.75 2h12.5a.75.75 0 010 1.5H1.75A.75.75 0 011 2.75zm0 5A.75.75 0 011.75 7h12.5a.75.75 0 010 1.5H1.75A.75.75 0 011 7.75zM1.75 12a.75.75 0 000 1.5h12.5a.75.75 0 000-1.5H1.75z" />
            </svg>
          </button>
          <svg className="app-logo" width="32" height="32" viewBox="0 0 32 32">
            <rect x="4" y="4" width="24" height="24" rx="4" fill="none" stroke="var(--fifo)" strokeWidth="2" />
            <rect x="8" y="8" width="7" height="7" rx="1.5" fill="var(--fifo)" opacity="0.5" />
            <rect x="17" y="8" width="7" height="7" rx="1.5" fill="var(--lru)" opacity="0.5" />
            <rect x="8" y="17" width="7" height="7" rx="1.5" fill="var(--opt)" opacity="0.5" />
            <rect x="17" y="17" width="7" height="7" rx="1.5" fill="var(--hit)" opacity="0.5" />
            <circle cx="16" cy="16" r="3" fill="var(--fifo)" />
          </svg>
          <h1 className="app-title">Memory Management Platform</h1>
          <span className="app-version">v3.0</span>
        </div>

        <div className="app-header-right">
          <button className="header-action-btn" onClick={() => setShowTheme(true)} title="Theme (T)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 13V2a6 6 0 010 12z" />
            </svg>
          </button>
          <button className="header-action-btn" onClick={() => setShowHelp(true)} title="Help (H)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zM7 11h2v2H7v-2zm1-9a3 3 0 00-3 3h2a1 1 0 112 0c0 .55-.45 1-1 1a1 1 0 00-1 1v1h2v-.5A3 3 0 008 2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Sidebar + Main */}
      <div className="app-body">
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="nav-section">
            <h3 className="nav-section-title">SIMULATORS</h3>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
                style={({ isActive }) => ({
                  borderLeftColor: isActive ? item.color : 'transparent',
                })}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {/* No render function children for NavLink v7 */}
              </NavLink>
            ))}
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">RESOURCES</h3>
            <a
              href="https://www.geeksforgeeks.org/page-replacement-algorithms-in-operating-systems/"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              <span className="nav-icon"><BookOpen size={18} /></span>
              <span className="nav-label">Documentation</span>
            </a>
            <a
              href="https://pages.cs.wisc.edu/~remzi/OSTEP/"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              <span className="nav-icon"><GraduationCap size={18} /></span>
              <span className="nav-label">Learn OS (OSTEP)</span>
            </a>
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-footer-text">
              <span>Memory Mgmt Platform</span>
              <span className="sidebar-footer-version">v3.0 · Educational</span>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showTheme && (
          <ThemeSelector
            currentTheme={theme}
            onThemeChange={setTheme}
            isOpen={showTheme}
            onToggle={() => setShowTheme(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
