# 🧠 Dynamic Memory Management Visualizer

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-orange)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=three.js)

> An interactive, cinematic OS education platform that makes memory management **visible, intuitive, and beautiful** — built for Operating Systems coursework.

---

## 📌 Overview

The **Dynamic Memory Management Visualizer** is a multi-simulator web platform that brings Operating Systems memory concepts to life through real-time animation, 3D rendering, and interactive step-by-step execution. It covers everything from page replacement algorithms and segmentation to virtual memory, dynamic partitioning, and thrashing — each with algorithm decision explanations, locality heatmaps, and cinematic transitions.

Built with **React 19, Framer Motion, GSAP, Three.js, and Recharts** — this is not a textbook diagram. It's a living OS.

---

## 🎥 Demo

<img width="1919" height="951" alt="Screenshot from 2026-03-29 13-48-50" src="https://github.com/user-attachments/assets/0fc2d34a-a89a-4980-8082-11fabd06d67d" />

```
[Watch Live Demo](https://your-demo-link.com)
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔄 **6 Full Simulators** | Page Replacement, Paging, Segmentation, Virtual Memory, Dynamic Partitioning, Thrashing |
| 🎬 **Cinematic Animations** | GSAP + Framer Motion with spring physics (stiffness/damping/mass tuned per simulator) |
| 🌐 **3D Memory Visualization** | Three.js scenes for virtual memory address space mapping |
| 📊 **Live Charts** | Recharts-powered fault rate graphs, working set indicators, frame utilization |
| 🌡️ **Locality Heatmaps** | Visual access frequency overlays showing temporal & spatial locality |
| 🔔 **Belady's Anomaly Detection** | Automatic detection and visual alert when FIFO exhibits the anomaly |
| 📄 **PDF Export** | Export simulation results and reports via jsPDF |
| ⌨️ **Keyboard Shortcuts** | Full keyboard nav (Step: `→`, Reset: `R`, Speed: `+/-`, Fullscreen: `F`) |
| 🎨 **Dark Luxury Theme** | Semantic CSS variable system, 4px base spacing scale, 3 sub-themes |
| 🧮 **Algorithm Explainer** | Inline decision explanations for every page replacement step |
| ♿ **Accessibility** | ARIA roles, focus traps, reduced-motion fallbacks |
| 📱 **Responsive** | Fully responsive across desktop, tablet, and mobile |

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **UI Framework** | React 19 | Component architecture, concurrent rendering |
| **Build Tool** | Vite 8 | Fast HMR, optimized bundling |
| **Routing** | React Router v6 | Multi-page SPA navigation across simulators |
| **Animation** | Framer Motion | Page transitions, layout animations, spring physics |
| **Timeline Animation** | GSAP | Complex multi-step animation sequencing |
| **3D Rendering** | Three.js (r128) | Virtual memory address space 3D scenes |
| **Charts** | Recharts | Page fault graphs, frame utilization, thrashing curves |
| **PDF Export** | jsPDF | Export simulation reports |
| **Styling** | CSS Variables + Tailwind (core) | Semantic design tokens, dark luxury theme |
| **State Management** | React Hooks (useState, useReducer, useRef) | Simulation state, step control, history |

---

## 🚀 Simulators

### 1. 🔁 Page Replacement
Simulate **FIFO, LRU, OPT, LFU, MRU, Clock** algorithms with frame-by-frame step control.
- Hit/Miss color coding with animated frame swaps
- Belady's Anomaly auto-detection for FIFO
- Inline algorithm decision explanation per step
- Page fault rate graph (Recharts)

### 2. 🗂 Paging
Visualize logical-to-physical address translation via page tables.
- Multi-level page table support
- TLB hit/miss simulation with latency delta display
- Address bit decomposition (page number + offset) shown visually

### 3. 🧱 Segmentation
Segment table management with base-limit bound checking.
- Segment fault visualization
- External fragmentation indicator
- Named segment rendering (Code, Stack, Heap, Data)

### 4. 🌐 Virtual Memory
3D Three.js scene mapping virtual address space to physical frames.
- Demand paging walkthrough
- Page-in / Page-out animation
- Working Set window indicator with set size graph

### 5. 📦 Dynamic Partitioning
Best Fit, First Fit, Worst Fit, Next Fit memory allocation simulation.
- Animated block allocation and deallocation
- External fragmentation visualization
- Compaction simulation with before/after comparison

### 6. 🌪 Thrashing
Live demonstration of thrashing onset as degree of multiprogramming increases.
- CPU utilization vs. process count curve
- Working set vs. allocation gap indicator
- Threshold marker with recovery simulation

---

## 📂 Project Structure

```
memory-visualizer/
│
├── public/
│   └── assets/                    # Static assets, fonts
│
├── src/
│   ├── components/
│   │   ├── common/                # Navbar, Sidebar, FrameGrid, Tooltip
│   │   ├── charts/                # Recharts wrappers (FaultRateChart, UtilizationChart)
│   │   ├── heatmap/               # Locality heatmap overlay
│   │   └── three/                 # Three.js canvas components
│   │
│   ├── pages/
│   │   ├── Home.jsx               # Landing / simulator selector
│   │   ├── PageReplacement.jsx    # Simulator 1
│   │   ├── Paging.jsx             # Simulator 2
│   │   ├── Segmentation.jsx       # Simulator 3
│   │   ├── VirtualMemory.jsx      # Simulator 4
│   │   ├── DynamicPartitioning.jsx# Simulator 5
│   │   └── Thrashing.jsx          # Simulator 6
│   │
│   ├── hooks/
│   │   ├── useSimulator.js        # Core step/play/reset/speed control
│   │   ├── usePageReplacement.js  # Algorithm engine (FIFO/LRU/OPT/LFU)
│   │   ├── usePartitioning.js     # Fit algorithm engine
│   │   └── useThrashing.js        # MPD / utilization curve logic
│   │
│   ├── utils/
│   │   ├── algorithms.js          # Pure algorithm implementations
│   │   ├── pdfExport.js           # jsPDF export utility
│   │   └── beladyDetector.js      # Belady's anomaly detection
│   │
│   ├── styles/
│   │   ├── tokens.css             # CSS variables (colors, spacing, radii)
│   │   └── global.css             # Base resets, typography
│   │
│   ├── App.jsx                    # Router setup
│   └── main.jsx                   # React 19 root
│
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/memory-visualizer.git
```

### 2. Navigate to project
```bash
cd memory-visualizer
```

### 3. Install dependencies
```bash
npm install
```

### 4. Start development server
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
```

Open `http://localhost:5173` in your browser.

---

## ▶️ Usage

1. Open the app and select any simulator from the **Home** page
2. Configure parameters (frame count, page reference string, algorithm type)
3. Use **Step** (`→`) to walk through one operation at a time, or **Play** to auto-run
4. Watch the memory state update with animated frame swaps and fault indicators
5. Read the **Algorithm Explainer** panel to understand each decision
6. View the **Page Fault Rate Chart** and **Locality Heatmap** in real-time
7. Export results as **PDF** using the export button

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `→` | Step forward |
| `←` | Step back |
| `Space` | Play / Pause |
| `R` | Reset simulation |
| `+` / `-` | Increase / Decrease speed |
| `F` | Toggle fullscreen |

---

## 🎓 Educational Use Cases

- **CSE / Computer Science Students** — Visualize concepts from OS textbooks (Silberschatz, Galvin)
- **Algorithm Comparison** — Run FIFO vs LRU vs OPT on the same reference string side-by-side
- **Exam Prep** — Step through examples frame-by-frame before exams
- **Belady's Anomaly Lab** — Reproduce the anomaly interactively and observe fault count increase with more frames
- **Teaching Tool** — Instructors can use this as a live classroom demonstration

---

## 🚧 Future Work

- [ ] Side-by-side algorithm comparison mode (dual-panel)
- [ ] Custom reference string generator (random / Zipf / sequential)
- [ ] Multi-level page table (2-level, inverted) visualizer
- [ ] MLFQ (Multi-Level Feedback Queue) scheduler integration
- [ ] Export simulation as shareable URL
- [ ] Mobile-optimized touch gesture controls
- [ ] Dark / Light theme toggle

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
git commit -m "feat: describe your change"
git push origin feature/your-feature
# Open a Pull Request
```

---

## 📄 License

This Project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Webpage

(https://dynamic-memory-management.vercel.app/)
---

> Built with 🧠 for Operating Systems — because memory management deserves better than textbook diagrams.
