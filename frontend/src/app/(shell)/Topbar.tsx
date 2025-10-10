"use client";
import { useStore, AUTH_EVENT_NAME, AUTH_STORAGE_KEYS } from "./Store";
import Link from "next/link";
import styles from "./Shell.module.css";
import React from "react";
import { useRouter } from "next/navigation";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const {
    filters,
    setFilters,
    radiusKm,
    setRadiusKm,
    userLocation,
    setUserLocation,
    unreadCount,
    authUser,
    isAuthenticated,
  } = useStore();
  const router = useRouter();

  const handleLogout = React.useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("pfAuthToken");
    window.localStorage.removeItem("pfAuthUser");
    AUTH_STORAGE_KEYS.forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.warn("pf: failed to clear cache on logout", error);
      }
    });
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
    router.push("/signin");
  }, [router]);

  // Try to get current browser location
  async function handleSetMyLocation() {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => alert("Failed to get location: " + err.message)
    );
  }

  return (
    <div className={`${styles.toolbar} py-2 px-3`}>
      <div className="d-flex gap-2 align-items-center w-100">
        {/* Mobile Menu Button */}
        <button className="btn btn-outline-secondary d-lg-none" onClick={onMenu}>
          <i className="bi bi-list"></i>
        </button>

        {/* Search Bar */}
        <div className="input-group" style={{ maxWidth: 320 }}>
          <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
          <input
            className="form-control"
            placeholder="Search posts..."
            value={filters.query}
            onChange={(e) => setFilters({ query: e.target.value })}
          />
        </div>

        {/* Status Dropdown */}
        <div className="dropdown ms-2">
          <button className="btn btn-light border dropdown-toggle" data-bs-toggle="dropdown">
            {filters.status === "All" ? "All Status" : filters.status}
          </button>
          <ul className="dropdown-menu">
            {["All","Lost","Found"].map((opt)=> (
              <li key={opt}>
                <button className="dropdown-item" onClick={()=> setFilters({ status: opt as any })}>{opt}</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Species Dropdown */}
        <div className="dropdown ms-2">
          <button className="btn btn-light border dropdown-toggle" data-bs-toggle="dropdown">
            {filters.species === "All" ? "All Species" : filters.species}
          </button>
          <ul className="dropdown-menu">
            {["All","Dog","Cat","Other"].map((opt)=> (
              <li key={opt}>
                <button className="dropdown-item" onClick={()=> setFilters({ species: opt as any })}>{opt}</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Radius Slider */}
        <div className="d-flex align-items-center ms-3">
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="form-range"
            style={{ width: 120 }}
          />
          <span className="ms-2 small text-muted">{radiusKm} km</span>
          <button
            className="btn btn-sm btn-outline-primary ms-2"
            title="Set My Location"
            onClick={handleSetMyLocation}
          >
            <i className="bi bi-geo-alt-fill"></i>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-grow-1"></div>

        {/* Notifications */}
        <Link href="/notifications" className="btn position-relative btn-outline-secondary me-2">
          <i className="bi bi-bell"></i>
          {unreadCount > 0 && (
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style={{ fontSize: "0.65rem" }}
            >
              {unreadCount}
              <span className="visually-hidden">unread notifications</span>
            </span>
          )}
        </Link>

        {/* Profile / Auth */}
        {isAuthenticated && authUser ? (
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2"
              data-bs-toggle="dropdown"
            >
              <img
                src="https://i.pravatar.cc/80?img=12"
                className={`border ${styles.avatar}`}
                alt="avatar"
              />
              <span className="text-truncate" style={{ maxWidth: 140 }}>
                {authUser.firstname
                  ? `${authUser.firstname} ${authUser.lastname || ""}`.trim()
                  : authUser.username || "Profile"}
              </span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item" onClick={() => router.push("/myposts")}>
                  My Posts
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() => router.push("/mypets")}>
                  My Pets
                </button>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  Log out
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="d-flex gap-2">
            <Link href="/signin" className="btn btn-outline-primary">
              Sign In
            </Link>
            <Link href="/signup" className="btn btn-primary">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
