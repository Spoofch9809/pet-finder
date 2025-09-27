"use client";
import Link from "next/link";
import styles from "./Shell.module.css";
import clsx from "clsx";


export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
return (
<aside className={clsx(styles.sidebar, open && styles.show, "p-3 d-flex flex-column")}>
<div className="d-flex align-items-center mb-4">
<div className="me-2 fs-3">🐾</div>
<div className={styles.brand}>PetFinder</div>
</div>
<nav className="nav nav-pills flex-column gap-2">
<Link className="nav-link" href="/"><i className="bi bi-house-door me-2"/>Home</Link>
<Link className="nav-link" href="/create"><i className="bi bi-plus-circle me-2"/>Create Post</Link>
<Link className="nav-link" href="/myposts"><i className="bi bi-journal-text me-2"/>My Posts</Link>
<Link className="nav-link" href="/mypets"><i className="bi bi-heart-pulse me-2"/>My Pets</Link>
<Link className="nav-link" href="/settings"><i className="bi bi-gear me-2"/>Settings</Link>
</nav>
<div className="mt-auto small text-muted pt-4">Bootstrap mock • v0.1</div>
</aside>
);
}