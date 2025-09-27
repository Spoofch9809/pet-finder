import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../globals.css";
import styles from "./Shell.module.css";
import type { Metadata } from "next";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";


export const metadata: Metadata = { title: "PetFinder • Mock", description: "Next.js + Bootstrap mock" };


export default function RootLayout({ children }: { children: React.ReactNode }) {
// Load Bootstrap JS only on client
useEffect(() => {
// @ts-ignore
import("bootstrap/dist/js/bootstrap.bundle.min.js");
}, []);


const [sidebarOpen, setSidebarOpen] = useState(false);


return (
<html lang="en">
<body>
<div className={styles.app}>
<Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
<main className={styles.content}>
<Topbar onMenu={() => setSidebarOpen((v) => !v)} />
{children}
</main>
</div>
</body>
</html>
);
}