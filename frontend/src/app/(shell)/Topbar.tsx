"use client";

import Link from "next/link";
import styles from "./Shell.module.css";
import { useStore } from "./Store";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  // NOTE: userLocation (not userLoc)
  const {
    filters,
    setFilters,
    radiusKm,
    setRadius,
    userLocation,
    setUserLoc,
  } = useStore();

  function locateMe() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.warn("Geolocation error:", err);
        alert("Couldn't get your location. Please allow location access.");
      }
    );
  }

  return (
    <div className={`${styles.toolbar} py-2 px-3`}>
      <div className="d-flex gap-2 align-items-center">
        {/* hamburger (mobile) */}
        <button
          className="btn btn-outline-secondary d-lg-none"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <i className="bi bi-list" />
        </button>

        {/* search */}
        <div className="input-group" style={{ maxWidth: 520 }}>
          <span className="input-group-text bg-white">
            <i className="bi bi-search" />
          </span>
          <input
            className="form-control"
            placeholder="Hinted search text"
            value={filters.query}
            onChange={(e) => setFilters({ query: e.target.value })}
          />
        </div>

        {/* right-side controls */}
        <div className="ms-auto d-flex align-items-center gap-2">
          {/* status */}
          <div className="dropdown">
            <button
              className="btn btn-light border dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              {filters.status === "All" ? "All Post" : filters.status}
            </button>
            <ul className="dropdown-menu">
              {["All", "Lost", "Found"].map((opt) => (
                <li key={opt}>
                  <button
                    className="dropdown-item"
                    onClick={() => setFilters({ status: opt as any })}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* species */}
          <div className="dropdown">
            <button
              className="btn btn-light border dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              {filters.species === "All" ? "All Species" : filters.species}
            </button>
            <ul className="dropdown-menu">
              {["All", "Dog", "Cat", "Other"].map((opt) => (
                <li key={opt}>
                  <button
                    className="dropdown-item"
                    onClick={() => setFilters({ species: opt as any })}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* radius filter + locate me */}
          <div className="dropdown">
            <button
              className="btn btn-light border dropdown-toggle"
              data-bs-toggle="dropdown"
              title="Filter by distance from your location"
            >
              Radius: {radiusKm === 0 ? "Off" : `${radiusKm} km`}
            </button>
            <div className="dropdown-menu p-3" style={{ width: 240 }}>
              <label className="form-label w-100">
                Show posts within <strong>{radiusKm}</strong> km
              </label>
              <input
                type="range"
                className="form-range"
                min={0}
                max={20}
                step={1}
                value={radiusKm}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
              <div className="d-flex justify-content-between mt-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  type="button"
                  onClick={() => setRadius(0)}
                >
                  Turn off
                </button>
                <button
                  className={`btn btn-sm ${
                    userLocation ? "btn-success" : "btn-primary"
                  }`}
                  type="button"
                  onClick={locateMe}
                  title="Use my current location"
                >
                  <i
                    className={`bi ${
                      userLocation ? "bi-geo-alt-fill" : "bi-geo-alt"
                    } me-1`}
                  />
                  {userLocation ? "Location set" : "Locate me"}
                </button>
              </div>
            </div>
          </div>

          {/* bell */}
          <button className="btn btn-outline-secondary" title="Notifications">
            <i className="bi bi-bell" />
          </button>

          {/* avatar */}
          <Link href="/signin" title="Account">
            <img
              src="https://i.pravatar.cc/80?img=12"
              className={`border ${styles.avatar}`}
              alt="avatar"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
