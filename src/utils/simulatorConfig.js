import { RefreshCw, FileText, Puzzle, HardDrive, Layers, AlertTriangle } from 'lucide-react';

export const simulatorConfigs = [
  {
    id: 'page-replacement',
    path: '/page-replacement',
    title: 'Page Replacement',
    icon: RefreshCw,
    color: '#2f81f7',
    colorDim: '#1f4a8a',
    colorGlow: 'rgba(47,129,247,0.5)',
    description: 'Visualize FIFO, LRU, Optimal, LFU, and Clock (Second Chance) page replacement algorithms with live fault tracking and performance comparison.',
    features: [
      'Algorithm Comparison',
      'Live Fault Tracking',
      'Step-by-Step Playback'
    ],
    difficulty: 'Intermediate',
    estimatedTime: '15 min'
  },
  {
    id: 'paging',
    path: '/paging',
    title: 'Paging',
    icon: FileText,
    color: '#a371f7',
    colorDim: '#4a2b8a',
    colorGlow: 'rgba(163,113,247,0.5)',
    description: 'Understand how logical addresses map to physical frames through page tables with visual address translation.',
    features: [
      'Address Translation',
      'Page Table Visualization',
      'Frame Allocation'
    ],
    difficulty: 'Beginner',
    estimatedTime: '10 min'
  },
  {
    id: 'segmentation',
    path: '/segmentation',
    title: 'Segmentation',
    icon: Puzzle,
    color: '#39c5cf',
    colorDim: '#1a5a5f',
    colorGlow: 'rgba(57,197,207,0.5)',
    description: 'Learn segment-based memory management with base-limit registers and logical program structure.',
    features: [
      'Segment Tables',
      'Base-Limit Registers',
      'Protection Mechanisms'
    ],
    difficulty: 'Intermediate',
    estimatedTime: '12 min'
  },
  {
    id: 'virtual-memory',
    path: '/virtual-memory',
    title: 'Virtual Memory',
    icon: HardDrive,
    color: '#3fb950',
    colorDim: '#1a4a22',
    colorGlow: 'rgba(63,185,80,0.5)',
    description: 'Explore TLB, multi-level page tables, and demand paging with swap space visualization.',
    features: [
      'TLB Simulation',
      'Multi-level Page Tables',
      'Demand Paging'
    ],
    difficulty: 'Advanced',
    estimatedTime: '20 min'
  },
  {
    id: 'partitioning',
    path: '/partitioning',
    title: 'Dynamic Partitioning',
    icon: Layers,
    color: '#d29922',
    colorDim: '#5a3e0a',
    colorGlow: 'rgba(210,153,34,0.5)',
    description: 'Compare First Fit, Best Fit, Worst Fit, and Next Fit allocation strategies with fragmentation analysis.',
    features: [
      '4 Allocation Algorithms',
      'Fragmentation Metrics',
      'Process Queue'
    ],
    difficulty: 'Intermediate',
    estimatedTime: '15 min'
  },
  {
    id: 'thrashing',
    path: '/thrashing',
    title: 'Thrashing Visualization',
    icon: AlertTriangle,
    color: '#f85149',
    colorDim: '#5a1a18',
    colorGlow: 'rgba(248,81,73,0.5)',
    description: 'Observe thrashing behavior with working set monitoring and multiprogramming level effects.',
    features: [
      'Working Set Analysis',
      'Page Fault Rate',
      'CPU Utilization'
    ],
    difficulty: 'Advanced',
    estimatedTime: '18 min'
  }
];
