// src/app/MapView.tsx
"use client";

import * as React from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useRouter } from "next/navigation";
import { useFilteredPosts, useStore } from "./(shell)/Store";

// Small helper for robust lat/lng extraction from your post shape
function getLatLng(p: any): { lat?: number; lng?: number } {
  const lat =
    p?.locationLat ?? p?.lat ?? p?.coords?.lat ?? p?.location?.lat ?? undefined;
  const lng =
    p?.locationLng ?? p?.lng ?? p?.coords?.lng ?? p?.location?.lng ?? undefined;
  return { lat, lng };
}

// Haversine distance (in kilometers)
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MapView() {
  const router = useRouter();

  // Posts already filtered by your topbar filters (search, status, species, etc.)
  const basePosts = useFilteredPosts();

  // From the store: user location & current radius
  const { userLocation, radiusKm } = useStore();

  // Refs for Google Map & objects
  const mapBox = React.useRef<HTMLDivElement | null>(null);
  const map = React.useRef<google.maps.Map | null>(null);
  const userMarker = React.useRef<google.maps.Marker | null>(null);
  const circle = React.useRef<google.maps.Circle | null>(null);
  const postMarkers = React.useRef<google.maps.Marker[]>([]);

  // 1) Initialize Google Maps once
  React.useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      console.warn("Maps key missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
      return;
    }
    if (map.current || !mapBox.current) return;

    new Loader({ apiKey: key, version: "weekly", libraries: ["places"] })
      .load()
      .then(() => {
        map.current = new google.maps.Map(mapBox.current!, {
          center: { lat: 13.7563, lng: 100.5018 }, // Bangkok default
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
      })
      .catch((e) => console.error("Google Maps load error", e));
  }, []);

  // 2) User location marker & circle (center only when userLocation changes)
  React.useEffect(() => {
    if (!map.current || !userLocation) return;

    if (!userMarker.current) {
      userMarker.current = new google.maps.Marker({
        map: map.current,
        position: userLocation,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#1e88e5",
          fillOpacity: 1,
          scale: 8,
          strokeColor: "white",
          strokeWeight: 2,
        },
        title: "Your location",
        zIndex: 9999,
      });
    } else {
      userMarker.current.setPosition(userLocation);
    }

    if (!circle.current) {
      circle.current = new google.maps.Circle({
        map: map.current,
        center: userLocation,
        radius: (radiusKm || 0) * 1000,
        fillColor: "#1e88e5",
        fillOpacity: 0.1,
        strokeColor: "#1e88e5",
        strokeOpacity: 0.6,
        strokeWeight: 1,
        clickable: false,
      });
    } else {
      circle.current.setCenter(userLocation);
    }

    // Center ONLY because user location changed
    map.current.setCenter(userLocation);
  }, [userLocation]);

  // 3) Radius change -> only resize circle (no recenters)
  React.useEffect(() => {
    if (!circle.current) return;
    circle.current.setRadius((radiusKm || 0) * 1000);
  }, [radiusKm]);

  // 4) Render markers for posts, filtered by radius if we have a userLocation
  React.useEffect(() => {
    if (!map.current) return;

    // Clear old markers
    postMarkers.current.forEach((m) => m.setMap(null));
    postMarkers.current = [];

    // Filter by distance if we know the user's location and a radius
    const visiblePosts = basePosts.filter((p: any) => {
      const { lat, lng } = getLatLng(p);
      if (typeof lat !== "number" || typeof lng !== "number") return false;

      if (!userLocation || !radiusKm || radiusKm <= 0) {
        return true; // If no user location or no radius set -> show all
      }

      const dist = getDistanceKm(userLocation.lat, userLocation.lng, lat, lng);
      return dist <= radiusKm;
    });

    // Add markers for visible posts
    visiblePosts.forEach((p: any) => {
      const { lat, lng } = getLatLng(p);
      if (typeof lat !== "number" || typeof lng !== "number") return;

      // Different color by status (optional)
      const status = (p?.status as "Lost" | "Found" | undefined) ?? "Lost";
      const color = status === "Found" ? "#2e7d32" : "#d32f2f";

      const marker = new google.maps.Marker({
        map: map.current!,
        position: { lat, lng },
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 1,
          scale: 5.5,
        },
        title: p?.name || "Pet",
      });

      // Navigate to details on click
      marker.addListener("click", () => {
        // must exist for navigation
        if (p?.id) router.push(`/posts/${p.id}`);
      });

      postMarkers.current.push(marker);
    });

    // If there is NO user location, fit to markers once so user sees them
    if (!userLocation && postMarkers.current.length) {
      const bounds = new google.maps.LatLngBounds();
      postMarkers.current.forEach((m) => bounds.extend(m.getPosition()!));
      map.current.fitBounds(bounds);
    }
  }, [basePosts, userLocation, radiusKm]);

  return (
    <div
      ref={mapBox}
      style={{
        width: "100%",
        height: 480,
        border: "2px dashed #cfe1ff",
        borderRadius: 12,
      }}
    />
  );
}
