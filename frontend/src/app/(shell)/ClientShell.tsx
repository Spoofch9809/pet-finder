// src/app/(shell)/ClientShell.tsx
"use client";
import * as React from "react";
import StoreProvider from "./Store";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import styles from "./Shell.module.css";
import ChatWidget from "./ChatWidget";
import { initCometChat } from "../../lib/cometchat";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  React.useEffect(() => { import("bootstrap/dist/js/bootstrap.bundle.min.js"); }, []);
  // Pre-initialize chat provider in the background (best-effort)
  React.useEffect(() => {
    let cancelled = false;
    if (typeof window === "undefined") return;
    (async () => {
      try {
        await initCometChat();
      } catch {
        // ignore; widget will handle login/init as needed
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <StoreProvider>
      <div className={styles.app}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={styles.content}>
          <Topbar onMenu={() => setSidebarOpen((v) => !v)} />
          {children}
        </main>
      </div>
      <ChatWidget />
    </StoreProvider>
  );
}
