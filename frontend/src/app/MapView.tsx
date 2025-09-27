"use client";

import * as React from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useFilteredPosts, useStore } from "./(shell)/Store";
import { useRouter } from "next/navigation";

export default function MapView() {
  const posts = useFilteredPosts();
  const { userLocation, radiusKm } = useStore();
  const router = useRouter();

  const mapBox = React.useRef<HTMLDivElement | null>(null);
  const map = React.useRef<google.maps.Map | null>(null);
  const userMarker = React.useRef<google.maps.Marker | null>(null);
  const circle = React.useRef<google.maps.Circle | null>(null);
  const postMarkers = React.useRef<google.maps.Marker[]>([]);

  // 1) Init Google Maps once
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

  // 2) Place/move the user location marker (and center ONLY when userLocation changes)
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

    map.current.setCenter(userLocation);
  }, [userLocation, radiusKm]); // radius in dep list is fine; center won't change when only radius changes

  // 3) When radius changes, just resize the circle — DO NOT recenter the map
  React.useEffect(() => {
    if (!circle.current) return;
    circle.current.setRadius((radiusKm || 0) * 1000);
  }, [radiusKm]);

  // 4) Render post markers (+ click to go to details)
  React.useEffect(() => {
    if (!map.current) return;

    // clear previous markers
    postMarkers.current.forEach((m) => m.setMap(null));
    postMarkers.current = [];

    // If you want *only* Lost posts, uncomment next line:
    // const visiblePosts = posts.filter(p => (p as any).status === "Lost");
    const visiblePosts = posts;

    visiblePosts.forEach((p) => {
      // --- Normalize lat/lng from your post shape ---
      const lat =
        (p as any).locationLat ??
        (p as any).lat ??
        (p as any).coords?.lat ??
        (p as any).location?.lat;

      const lng =
        (p as any).locationLng ??
        (p as any).lng ??
        (p as any).coords?.lng ??
        (p as any).location?.lng;

      if (typeof lat !== "number" || typeof lng !== "number") return;

      const status = (p as any).status as "Lost" | "Found" | undefined;
      const color = status === "Found" ? "#2e7d32" : "#d32f2f";

      const m = new google.maps.Marker({
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
        title: (p as any).name || "Pet",
      });

      // 👉 Navigate to details on click
      m.addListener("click", () => {
        const id = (p as any).id;
        if (id) router.push(`/posts/${id}`);
      });

      postMarkers.current.push(m);
    });

    // Auto-fit only when we don't yet have a user location
    if (!userLocation && postMarkers.current.length) {
      const b = new google.maps.LatLngBounds();
      postMarkers.current.forEach((m) => b.extend(m.getPosition()!));
      map.current.fitBounds(b);
    }
  }, [posts, userLocation, router]);

  return (
    <div
      ref={mapBox}
      style={{
        width: "100%",
        height: 480,
        border: "2px dashed #cfe1ff",
        borderRadius: 12,
        cursor: "default",
      }}
    />
  );
}
