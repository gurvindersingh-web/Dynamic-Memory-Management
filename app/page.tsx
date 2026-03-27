import MemorySimulator from "@/components/MemorySimulator";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow">
              M
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Dynamic Memory Management
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Interactive OS Memory Visualizer
              </p>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            {["FIFO", "LRU", "Optimal", "TLB", "Working Set", "Belady's"].map(
              (tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MemorySimulator />
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-gray-400 dark:text-gray-600">
        Dynamic Memory Management Visualizer &mdash; Built with Next.js &amp; Tailwind CSS
      </footer>
    </div>
  );
}

