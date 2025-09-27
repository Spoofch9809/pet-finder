"use client";

import styles from "../(shell)/Shell.module.css";
import { useStore, Species, Status, fileToDataUrl } from "../(shell)/Store";
import { useRouter } from "next/navigation";
import React from "react";
import { Loader } from "@googlemaps/js-api-loader";

export default function Create() {
  const { addPost } = useStore();
  const router = useRouter();

  const [form, setForm] = React.useState({
    name: "",
    color: "",
    species: "Dog" as Species,
    breed: "",
    // keep a free-text location label for display/search
    location: "",
    status: "Lost" as Status,
    description: "",
    photoUrl: "",
    // NEW: coordinates for map picker
    locationLat: undefined as number | undefined,
    locationLng: undefined as number | undefined,
  });

  const [fileName, setFileName] = React.useState<string>("");

  // --- helpers ---
  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const url = await fileToDataUrl(f);
    update("photoUrl", url);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return alert("Please enter a name");
    if (form.status === "Lost" && (form.locationLat == null || form.locationLng == null)) {
      return alert("Please drop a pin on the map for the lost location.");
    }
    const id = addPost({ ...form });
    router.push(`/posts/${id}`);
  }

  // === Map Picker ===
  const mapBox = React.useRef<HTMLDivElement | null>(null);
  const map = React.useRef<google.maps.Map | null>(null);
  const marker = React.useRef<google.maps.Marker | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);

  React.useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) return;

    if (map.current || !mapBox.current) return;

    new Loader({ apiKey: key, version: "weekly", libraries: ["places"] })
      .load()
      .then(() => {
        // init map
        map.current = new google.maps.Map(mapBox.current!, {
          center: { lat: 13.7563, lng: 100.5018 }, // Bangkok default
          zoom: 12,
          streetViewControl: false,
          mapTypeControl: false,
        });

        // click to place/move marker
        map.current.addListener("click", (ev: google.maps.MapMouseEvent) => {
          if (!ev.latLng) return;
          placeMarker(ev.latLng.lat(), ev.latLng.lng());
        });

        // Places autocomplete
        if (searchInputRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(
            searchInputRef.current,
            { fields: ["geometry", "formatted_address", "name"] }
          );
          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current!.getPlace();
            const loc = place.geometry?.location;
            if (loc) {
              map.current!.panTo(loc);
              map.current!.setZoom(15);
              placeMarker(loc.lat(), loc.lng());
              // set a human-readable label if available
              update("location", place.formatted_address || place.name || "");
            }
          });
        }
      })
      .catch((e) => console.error("Maps load error", e));
  }, []);

  function placeMarker(lat: number, lng: number) {
    if (!map.current) return;
    if (!marker.current) {
      marker.current = new google.maps.Marker({
        map: map.current,
        position: { lat, lng },
        draggable: true,
        title: "Lost spot",
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          fillColor: "#d32f2f",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 1,
          scale: 6,
        },
      });
      marker.current.addListener("dragend", () => {
        const p = marker.current!.getPosition();
        if (p) updateCoords(p.lat(), p.lng());
      });
    } else {
      marker.current.setPosition({ lat, lng });
    }
    updateCoords(lat, lng);
  }

  function updateCoords(lat: number, lng: number) {
    update("locationLat", lat);
    update("locationLng", lng);
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        map.current?.panTo({ lat, lng });
        map.current?.setZoom(15);
        placeMarker(lat, lng);
      },
      (err) => alert(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <section className="p-3">
      <div className="row g-3">
        <div className="col-lg-7">
          <div className={styles.panel}>
            <form onSubmit={submit} className="row g-3">
              {/* Photo preview */}
              <div className="col-12">
                <div className="ratio ratio-21x9 mb-3 bg-light rounded-4 d-flex align-items-center justify-content-center border">
                  {form.photoUrl ? (
                    <img
                      src={form.photoUrl}
                      alt="preview"
                      className="w-100 h-100 object-fit-cover rounded-4"
                    />
                  ) : (
                    <div className="text-muted">Upload a photo or paste an image URL</div>
                  )}
                </div>
              </div>

              {/* File + URL */}
              <div className="col-md-8">
                <label className="form-label">Photo (file)</label>
                <input type="file" accept="image/*" className="form-control" onChange={onFile} />
                <div className="form-text text-truncate">{fileName}</div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Or Image URL</label>
                <input
                  className="form-control"
                  value={form.photoUrl}
                  onChange={(e) => update("photoUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>

              {/* Basic info */}
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Ricky"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Color</label>
                <input
                  className="form-control"
                  value={form.color}
                  onChange={(e) => update("color", e.target.value)}
                  placeholder="Golden"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Species</label>
                <select
                  className="form-select"
                  value={form.species}
                  onChange={(e) => update("species", e.target.value as any)}
                >
                  <option>Dog</option>
                  <option>Cat</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Breed</label>
                <input
                  className="form-control"
                  value={form.breed}
                  onChange={(e) => update("breed", e.target.value)}
                  placeholder="Golden Retriever"
                />
              </div>

              {/* Location label (free text) */}
              <div className="col-md-12">
                <label className="form-label">Location label (optional)</label>
                <input
                  className="form-control"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="e.g., Fountain area in the park"
                />
              </div>

              {/* Map picker */}
              <div className="col-12">
                <label className="form-label">Pick lost spot on the map</label>
                <div className="d-flex gap-2 mb-2">
                  <input
                    ref={searchInputRef}
                    className="form-control"
                    placeholder="Search a place"
                    style={{ maxWidth: 480 }}
                  />
                  <button type="button" className="btn btn-outline-primary" onClick={useMyLocation}>
                    <i className="bi bi-geo-alt-fill me-1" />
                    Use my location
                  </button>
                </div>
                <div
                  ref={mapBox}
                  style={{
                    width: "100%",
                    height: 320,
                    border: "1px solid #e1e1e1",
                    borderRadius: 12,
                  }}
                />
                <div className="form-text mt-1">
                  {form.locationLat != null && form.locationLng != null ? (
                    <>
                      Pin set at <strong>{form.locationLat.toFixed(6)}</strong>,{" "}
                      <strong>{form.locationLng.toFixed(6)}</strong>
                    </>
                  ) : (
                    "Click the map to drop a pin."
                  )}
                </div>
              </div>

              {/* Status + Description */}
              <div className="col-md-4">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value as any)}
                >
                  <option>Lost</option>
                  <option>Found</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Friendly, microchipped, blue collar..."
                />
              </div>

              <div className="col-12 d-flex justify-content-end">
                <button className="btn btn-primary px-4" type="submit">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right panel (unchanged) */}
        <div className="col-lg-5">
          <div className={styles.panel}>
            <h5 className="mb-3">Contact Owner</h5>
            <div className="d-grid gap-2">
              <button className="btn btn-info" type="button" onClick={() => alert("Calling owner (mock)")}>
                Call Owner
              </button>
              <button className="btn btn-success" type="button" onClick={() => alert("Message sent (mock)")}>
                Send Message
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => alert("Marked as Found (mock)")}>
                Mark As Found
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
