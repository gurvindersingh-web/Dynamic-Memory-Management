import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dynamic Memory Management Visualizer",
  description:
    "Interactive OS memory management simulator — FIFO, LRU, and Optimal page replacement algorithms with TLB simulation, working set tracking, and Belady's anomaly detection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
