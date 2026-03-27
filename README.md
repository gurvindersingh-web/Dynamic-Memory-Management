# Dynamic Memory Management Visualizer

An interactive visualization tool that demonstrates how memory management works inside an operating system. It simulates **paging**, **segmentation**, and **virtual memory** concepts, allowing users to understand how memory is allocated, accessed, and replaced.

## Features

- 🔵 **FIFO** page replacement algorithm
- 🟢 **LRU** (Least Recently Used) page replacement algorithm
- 🟣 **Optimal** page replacement algorithm
- ⚡ **TLB simulation** (Translation Lookaside Buffer hit/miss tracking)
- 📊 **Working set** tracking with adjustable window size (Δ)
- 🚨 **Belady's anomaly detection** (FIFO)
- 🔢 **Real-time page fault and hit ratio statistics**
- 🎬 **Step-through animation** with play/pause/prev/next controls
- 📋 **Full step-by-step trace table** (click any row to jump to that step)
- �� **Side-by-side algorithm comparison** panel
- 🖥️ **User-defined inputs** — memory frame count, page reference string, animation speed

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- System fonts (no external font dependencies)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Choose a page replacement **algorithm** (FIFO / LRU / Optimal)
2. Set the **number of memory frames** using the slider
3. Enter a **page reference string** (e.g. `7 0 1 2 0 3 0 4 2 3`)
4. Click **▶ Run Simulation**
5. Use the playback controls to step through the simulation frame-by-frame or watch it animate automatically

## Algorithm Correctness

Using the classic OS textbook example (`7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1`, 3 frames):

| Algorithm | Page Faults |
|-----------|-------------|
| FIFO      | 15          |
| LRU       | 12          |
| Optimal   | 9           |

## Deploy on Vercel

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new).
