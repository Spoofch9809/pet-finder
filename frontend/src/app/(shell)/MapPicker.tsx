"use client";

import * as React from "react";
import { Loader } from "@googlemaps/js-api-loader";

type LatLng = { lat: number; lng: number };
type Value = { coords?: LatLng; address?: string };

export default function MapPicker({
  value,
  onChange,
  height = 360,
  showSearch = true,
  defaultCenter = { lat: 13.7563, lng: 100.5018 }, // Bangkok
}: {
  value: Value;
  onChange: (v: Value) => void;
  height?: number;
  showSearch?: boolean;
  defaultCenter?: LatLng;
}) {
  const mapDiv = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const mapRef = React.useRef<google.maps.Map | null>(null);
  const markerRef = React.useRef<google.maps.Marker | null>(null);
  const geocoderRef = React.useRef<google.maps.Geocoder | null>(null);

  React.useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key || !mapDiv.current) return;

    new Loader({ apiKey: key, version: "weekly", libraries: ["places"] })
      .load()
      .then((google) => {
        // init services
        geocoderRef.current = new google.maps.Geocoder();

        // init map
        mapRef.current = new google.maps.Map(mapDiv.current!, {
          center: value.coords || defaultCenter,
          zoom: value.coords ? 14 : 12,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        // init marker (draggable)
        markerRef.current = new google.maps.Marker({
          map: mapRef.current,
          position: value.coords || undefined,
          draggable: true,
        });

        // click to place/relocate
        mapRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
          setPosition(e.latLng!.toJSON());
        });

        // drag end → update
        markerRef.current.addListener("dragend", () => {
          const pos = markerRef.current!.getPosition()!.toJSON();
          setPosition(pos);
        });

        // optional: Places search box
        if (showSearch && inputRef.current) {
          const ac = new google.maps.places.Autocomplete(inputRef.current, {
            fields: ["formatted_address", "geometry"],
          });
          ac.addListener("place_changed", () => {
            const p = ac.getPlace();
            const lat = p.geometry?.location?.lat();
            const lng = p.geometry?.location?.lng();
            if (typeof lat === "number" && typeof lng === "number") {
              const pos = { lat, lng };
              mapRef.current!.setCenter(pos);
              mapRef.current!.setZoom(15);
              setPosition(pos, p.formatted_address);
            }
          });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper: set marker position + reverse geocode if needed
  async function setPosition(pos: LatLng, knownAddress?: string) {
    const map = mapRef.current!;
    const marker = markerRef.current!;
    marker.setPosition(pos);
    marker.setMap(map);
    map.panTo(pos);

    let address = knownAddress || value.address;
    if (!address && geocoderRef.current) {
      try {
        const res = await geocoderRef.current.geocode({ location: pos });
        address = res.results?.[0]?.formatted_address;
      } catch {
        // ignore
      }
    }
    onChange({ coords: pos, address });
  }

  return (
    <div className="d-flex flex-column gap-2">
      {showSearch && (
        <input
          ref={inputRef}
          placeholder="Search a place"
          className="form-control"
          defaultValue={value.address || ""}
        />
      )}
      <div
        ref={mapDiv}
        style={{ width: "100%", height }}
        className="rounded-4 border"
      />
      {value.coords && (
        <div className="text-muted small">
          Selected: {value.address || "Unnamed"} · {value.coords.lat.toFixed(6)},{" "}
          {value.coords.lng.toFixed(6)}
        </div>
      )}
      {!value.coords && (
        <div className="text-muted small">
          Tip: click the map to drop a pin, or search above.
        </div>
      )}
    </div>
  );
}
