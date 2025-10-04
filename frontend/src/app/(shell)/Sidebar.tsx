"use client";

import Link from "next/link";
import styles from "./Shell.module.css";
import clsx from "clsx";
import { usePathname } from "next/navigation";

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: "bi-house-door" },
    { href: "/create", label: "Create Post", icon: "bi-plus-circle" },
    { href: "/myposts", label: "My Posts", icon: "bi-journal-text" },
    { href: "/mypets", label: "My Pets", icon: "bi-heart-pulse" },
    { href: "/settings", label: "Settings", icon: "bi-gear" },
  ];

  return (
    <aside className={clsx(styles.sidebar, open && styles.show, "p-3 d-flex flex-column")}>
      <div className="d-flex align-items-center mb-4">
        <div className="me-2 fs-3">🐾</div>
        <div className={styles.brand}>PetFinder</div>
      </div>

      <nav className="nav nav-pills flex-column gap-2">
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              styles.navLink,
              pathname === href && styles.navActive, // ✅ Highlight current page
              "nav-link d-flex align-items-center"
            )}
          >
            <i className={`bi ${icon} me-2`} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto small text-muted pt-4">Bootstrap mock • v0.1</div>
    </aside>
  );
}
