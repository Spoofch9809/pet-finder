"use client";

import React from "react";

/* =========================
   Types
========================= */
export type Status = "Lost" | "Found";
export type Species = "Dog" | "Cat" | "Other";
export type LatLng = { lat: number; lng: number };

export type Post = {
  id: string;
  name: string;
  color?: string;
  species: Species;
  breed?: string;
  location?: string; // human friendly address
  locationLat?: number;
  locationLng?: number;
  status: "Lost" | "Found";
  description?: string;
  photoUrl?: string; // data URL or remote URL
  createdAt: string; // ISO
};

export type Pet = {
  id: string;
  name: string;
  species: Species;
  color?: string;
  age?: string;
  breed?: string;
  photoUrl?: string;
  notes?: string;
};

export type Profile = {
  fullName?: string;
  email?: string;
  city?: string;
  phone?: string;
  radiusKm?: number;   // settings page radius (kept for UI)
  pushEnabled?: boolean;
};

type Filters = { query: string; status: "All" | Status; species: "All" | Species };

type Store = {
  /* data */
  posts: Post[];
  pets: Pet[];
  profile: Profile;

  /* search/filter */
  filters: Filters;

  /* radius filter state */
  userLocation: LatLng | null;
  radiusKm: number;

  /* post ops */
  addPost: (p: Omit<Post, "id" | "createdAt">) => string;
  deletePost: (id: string) => void;
  markFound: (id: string) => void;
  getPost: (id: string) => Post | undefined;

  /* pet ops */
  addPet: (p: Omit<Pet, "id">) => string;
  deletePet: (id: string) => void;

  /* profile + filters */
  setProfile: (p: Partial<Profile>) => void;
  setFilters: (f: Partial<Filters>) => void;

  /* radius + geoloc */
  setRadius: (km: number) => void;
  setUserLoc: (loc: LatLng | null) => void;
};

const StoreCtx = React.createContext<Store | null>(null);

/* =========================
   Defaults
========================= */
const DEFAULT_POSTS: Post[] = [
  {
    id: crypto.randomUUID?.() || String(Math.random()),
    name: "Ty",
    species: "Dog",
    status: "Found",
    location: "Kmitl",
    photoUrl:
      "https://images.unsplash.com/photo-1507149833265-60c372daea22?q=80&w=1200&auto=format&fit=crop",
    createdAt: new Date().toISOString(),
    locationLat: 13.729, // sample coords around BKK
    locationLng: 100.778,
  },
  {
    id: crypto.randomUUID?.() || String(Math.random()),
    name: "Tee",
    species: "Dog",
    status: "Lost",
    location: "Rama 3",
    photoUrl:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1200&auto=format&fit=crop",
    createdAt: new Date().toISOString(),
    locationLat: 13.692,
    locationLng: 100.533,
  },
];

const DEFAULT_PETS: Pet[] = [
  {
    id: crypto.randomUUID?.() || String(Math.random()),
    name: "Peam",
    species: "Dog",
    breed: "Dachshund",
    color: "Brown",
    age: "2 years",
    photoUrl:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop",
  },
];

const DEFAULT_PROFILE: Profile = { radiusKm: 5, pushEnabled: false };

/* =========================
   Utilities
========================= */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Haversine distance (km)
function haversine(a: LatLng, b: LatLng) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* =========================
   Provider
========================= */
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [pets, setPets] = React.useState<Pet[]>([]);
  const [profile, setProfileState] = React.useState<Profile>(DEFAULT_PROFILE);
  const [filters, setFiltersState] = React.useState<Filters>({
    query: "",
    status: "All",
    species: "All",
  });

  // NEW: radius & user location for filtering
  const [radiusKm, setRadiusKm] = React.useState<number>(
    Number(localStorage.getItem("pf.radiusKm") || 0)
  );
  const [userLocation, setUserLocation] = React.useState<LatLng | null>(
    JSON.parse(localStorage.getItem("pf.userLocation") || "null")
  );

  // Hydrate
  React.useEffect(() => {
    try {
      setPosts(JSON.parse(localStorage.getItem("pf.posts") || "null") || DEFAULT_POSTS);
      setPets(JSON.parse(localStorage.getItem("pf.pets") || "null") || DEFAULT_PETS);
      setProfileState(
        JSON.parse(localStorage.getItem("pf.profile") || "null") || DEFAULT_PROFILE
      );
      const rf = localStorage.getItem("pf.filters");
      if (rf) setFiltersState(JSON.parse(rf));
    } catch {
      // ignore
    }
  }, []);

  // Persist
  React.useEffect(() => {
    localStorage.setItem("pf.posts", JSON.stringify(posts));
  }, [posts]);
  React.useEffect(() => {
    localStorage.setItem("pf.pets", JSON.stringify(pets));
  }, [pets]);
  React.useEffect(() => {
    localStorage.setItem("pf.profile", JSON.stringify(profile));
  }, [profile]);
  React.useEffect(() => {
    localStorage.setItem("pf.filters", JSON.stringify(filters));
  }, [filters]);
  React.useEffect(() => {
    localStorage.setItem("pf.radiusKm", String(radiusKm));
  }, [radiusKm]);
  React.useEffect(() => {
    if (userLocation) {
      localStorage.setItem("pf.userLocation", JSON.stringify(userLocation));
    } else {
      localStorage.removeItem("pf.userLocation");
    }
  }, [userLocation]);

  // Auto-detect user location once (if not already set)
  React.useEffect(() => {
    if (!userLocation && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // silently ignore (user denied)
        }
      );
    }
  }, [userLocation]);

  /* ====== Actions ====== */
  const addPost: Store["addPost"] = (p) => {
    const id = crypto.randomUUID?.() || String(Math.random());
    setPosts((cur) => [{ id, createdAt: new Date().toISOString(), ...p }, ...cur]);
    return id;
  };
  const deletePost: Store["deletePost"] = (id) =>
    setPosts((cur) => cur.filter((p) => p.id !== id));
  const markFound: Store["markFound"] = (id) =>
    setPosts((cur) => cur.map((p) => (p.id === id ? { ...p, status: "Found" } : p)));
  const getPost: Store["getPost"] = (id) => posts.find((p) => p.id === id);

  const addPet: Store["addPet"] = (p) => {
    const id = crypto.randomUUID?.() || String(Math.random());
    setPets((cur) => [{ id, ...p }, ...cur]);
    return id;
  };
  const deletePet: Store["deletePet"] = (id) =>
    setPets((cur) => cur.filter((p) => p.id !== id));

  const setProfile: Store["setProfile"] = (p) =>
    setProfileState((cur) => ({ ...cur, ...p }));
  const setFilters: Store["setFilters"] = (f) =>
    setFiltersState((cur) => ({ ...cur, ...f }));

  const setRadius: Store["setRadius"] = (km) => setRadiusKm(km);
  const setUserLoc: Store["setUserLoc"] = (loc) => setUserLocation(loc);

  const value: Store = {
    posts,
    pets,
    profile,
    filters,
    userLocation,
    radiusKm,
    addPost,
    deletePost,
    markFound,
    getPost,
    addPet,
    deletePet,
    setProfile,
    setFilters,
    setRadius,
    setUserLoc,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

/* =========================
   Hooks
========================= */
export function useStore() {
  const ctx = React.useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useFilteredPosts() {
  const { posts, filters, userLocation, radiusKm } = useStore();
  const q = filters.query.toLowerCase();

  return posts.filter((p) => {
    // status/species
    if (filters.status !== "All" && p.status !== filters.status) return false;
    if (filters.species !== "All" && p.species !== filters.species) return false;

    // radius (only if radius > 0 and both locations exist)
    if (radiusKm > 0 && userLocation && typeof p.locationLat === "number" && typeof p.locationLng === "number") {
      const d = haversine(userLocation, { lat: p.locationLat, lng: p.locationLng });
      if (d > radiusKm) return false;
    }

    // text search
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.location || "").toLowerCase().includes(q) ||
      (p.breed || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );
  });
}
