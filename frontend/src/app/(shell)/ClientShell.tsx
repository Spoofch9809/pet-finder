// src/app/(shell)/ClientShell.tsx
"use client";
import * as React from "react";
import StoreProvider from "./Store";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import styles from "./Shell.module.css";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  React.useEffect(() => { import("bootstrap/dist/js/bootstrap.bundle.min.js"); }, []);
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
    </StoreProvider>
  );
}
