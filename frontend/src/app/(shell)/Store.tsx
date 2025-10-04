"use client";
import * as React from "react";

/* =======================
   Types
======================= */
export type Status = "Lost" | "Found";
export type Species = "Dog" | "Cat" | "Other";

export type Post = {
  id: string;
  name: string;
  color?: string;
  species: Species;
  breed?: string;
  location?: string;
  locationLat?: number;
  locationLng?: number;
  status: Status;
  description?: string;
  photoUrl?: string;
  createdAt: string;
  likes?: number; // 👈 New
  comments?: string[]; // ISO
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
  radiusKm?: number;
  pushEnabled?: boolean;
};

export type LatLng = { lat: number; lng: number };

/** New: Notification model */
export type Notification = {
  id: string;
  title: string; // e.g. "User 1 found your pet!"
  body?: string; // longer text
  postId?: string; // optional: link to a post
  createdAt: string; // ISO
  read: boolean;
};

type Filters = {
  query: string;
  status: "All" | Status;
  species: "All" | Species;
};

type Store = {
  posts: Post[];
  pets: Pet[];
  profile: Profile;
  filters: Filters;

  // radius & user location for filtering + map
  radiusKm: number;
  setRadiusKm: (km: number) => void;
  userLocation: LatLng | null;
  setUserLocation: (pos: LatLng | null) => void;

  // notifications
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    n: Omit<Notification, "id" | "createdAt" | "read"> & { read?: boolean }
  ) => string;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;

  addPost: (p: Omit<Post, "id" | "createdAt">) => string;
  deletePost: (id: string) => void;
  markFound: (id: string) => void;
  getPost: (id: string) => Post | undefined;

  addPet: (p: Omit<Pet, "id">) => string;
  deletePet: (id: string) => void;

  setProfile: (p: Partial<Profile>) => void;
  setFilters: (f: Partial<Filters>) => void;

  // 👇 NEW feed methods
  addLike: (id: string) => void;
  addComment: (id: string, text: string) => void;
};

const StoreCtx = React.createContext<Store | null>(null);

/* =======================
   Defaults
======================= */
const DEFAULT_POSTS: Post[] = [
  {
    id: crypto.randomUUID?.() || String(Math.random()),
    name: "Ty",
    species: "Dog",
    status: "Found",
    location: "Kmitl",
    locationLat: 13.731,
    locationLng: 100.778,
    photoUrl:
      "https://images.unsplash.com/photo-1507149833265-60c372daea22?q=80&w=1200&auto=format&fit=crop",
    createdAt: new Date().toISOString(),
    likes: 0,         // 👈 added
    comments: [],     // 👈 added
  },
  {
    id: crypto.randomUUID?.() || String(Math.random()),
    name: "Tee",
    species: "Dog",
    status: "Lost",
    location: "Rama 3",
    locationLat: 13.695,
    locationLng: 100.532,
    photoUrl:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1200&auto=format&fit=crop",
    createdAt: new Date().toISOString(),
    likes: 0,         // 👈 added
    comments: [],     // 👈 added
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
const DEFAULT_FILTERS: Filters = { query: "", status: "All", species: "All" };

/** A few mock notifications shown on first run */
const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: crypto.randomUUID?.() || String(Math.random()),
    title: "User 1 has found a dog near KMITL 🎉",
    body: "Tap to review the report and see if it matches your lost pet.",
    createdAt: new Date().toISOString(),
    postId: undefined,
    read: false,
  },
  {
    id: crypto.randomUUID?.() || String(Math.random()),
    title: "New sighting posted in your area",
    body: "Someone reported a brown Dachshund near Rama IX Park.",
    createdAt: new Date().toISOString(),
    postId: undefined,
    read: true,
  },
];

/* =======================
   Provider (SSR-safe)
======================= */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Core state (hydrated on client)
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [pets, setPets] = React.useState<Pet[]>([]);
  const [profile, setProfileState] = React.useState<Profile>(DEFAULT_PROFILE);
  const [filters, setFiltersState] = React.useState<Filters>(DEFAULT_FILTERS);

  // map filter state
  const [radiusKm, setRadiusKm] = React.useState<number>(
    DEFAULT_PROFILE.radiusKm || 0
  );
  const [userLocation, setUserLocation] = React.useState<LatLng | null>(null);

  // notifications
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  // ----- Hydrate (client only) -----
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setPosts(
        JSON.parse(localStorage.getItem("pf.posts") || "null") || DEFAULT_POSTS
      );
      setPets(
        JSON.parse(localStorage.getItem("pf.pets") || "null") || DEFAULT_PETS
      );
      setProfileState(
        JSON.parse(localStorage.getItem("pf.profile") || "null") ||
          DEFAULT_PROFILE
      );
      setFiltersState(
        JSON.parse(localStorage.getItem("pf.filters") || "null") ||
          DEFAULT_FILTERS
      );

      const savedRadius =
        Number(localStorage.getItem("pf.radiusKm")) ||
        (DEFAULT_PROFILE.radiusKm ?? 0);
      setRadiusKm(savedRadius);

      const savedLoc = JSON.parse(
        localStorage.getItem("pf.userLocation") || "null"
      );
      setUserLocation(savedLoc);

      setNotifications(
        JSON.parse(localStorage.getItem("pf.notifications") || "null") ||
          DEFAULT_NOTIFICATIONS
      );
    } catch (e) {
      console.warn("Store hydration error:", e);
    }
  }, []);

  // ----- Persist -----
  React.useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("pf.posts", JSON.stringify(posts));
  }, [posts]);
  React.useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("pf.pets", JSON.stringify(pets));
  }, [pets]);
  React.useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("pf.profile", JSON.stringify(profile));
  }, [profile]);
  React.useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("pf.filters", JSON.stringify(filters));
  }, [filters]);
  React.useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("pf.radiusKm", String(radiusKm));
  }, [radiusKm]);
  React.useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("pf.userLocation", JSON.stringify(userLocation));
  }, [userLocation]);
  React.useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("pf.notifications", JSON.stringify(notifications));
  }, [notifications]);

  // ----- Post/Pet mutations -----
  const addPost: Store["addPost"] = (p) => {
    const id = crypto.randomUUID?.() || String(Math.random());
    setPosts((cur) => [
      { id, createdAt: new Date().toISOString(), likes: 0, comments: [], ...p }, // 👈 init likes/comments
      ...cur,
    ]);
    return id;
  };

  const deletePost: Store["deletePost"] = (id) =>
    setPosts((cur) => cur.filter((p) => p.id !== id));

  const markFound: Store["markFound"] = (id) => {
    setPosts((cur) =>
      cur.map((p) => (p.id === id ? { ...p, status: "Found" } : p))
    );
    // Optional: drop a celebratory notification
    const post = posts.find((p) => p.id === id);
    if (post) {
      addNotification({
        title: `${post.name} was marked as Found 🎉`,
        body: "Great news! Your report has been updated.",
        postId: id,
      });
    }
  };

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

  // ----- Notification helpers -----
  const addNotification: Store["addNotification"] = (n) => {
    const id = crypto.randomUUID?.() || String(Math.random());
    const item: Notification = {
      id,
      title: n.title,
      body: n.body,
      postId: n.postId,
      createdAt: new Date().toISOString(),
      read: !!n.read,
    };
    setNotifications((cur) => [item, ...cur]);
    return id;
  };

  const markNotificationRead: Store["markNotificationRead"] = (id) =>
    setNotifications((cur) =>
      cur.map((x) => (x.id === id ? { ...x, read: true } : x))
    );

  const markAllNotificationsRead: Store["markAllNotificationsRead"] = () =>
    setNotifications((cur) => cur.map((x) => ({ ...x, read: true })));

  const deleteNotification: Store["deleteNotification"] = (id) =>
    setNotifications((cur) => cur.filter((x) => x.id !== id));

  const clearNotifications: Store["clearNotifications"] = () =>
    setNotifications([]);

  const unreadCount = React.useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // ----- NEW feed methods -----
  const addLike: Store["addLike"] = (id) => {
    setPosts((cur) =>
      cur.map((p) => (p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p))
    );
  };

  const addComment: Store["addComment"] = (id, text) => {
    if (!text?.trim()) return;
    setPosts((cur) =>
      cur.map((p) =>
        p.id === id ? { ...p, comments: [...(p.comments || []), text] } : p
      )
    );
  };

  const value: Store = {
    posts,
    pets,
    profile,
    filters,
    radiusKm,
    setRadiusKm,
    userLocation,
    setUserLocation,

    notifications,
    unreadCount,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearNotifications,

    addPost,
    deletePost,
    markFound,
    getPost,
    addPet,
    deletePet,
    setProfile,
    setFilters,

    // 👇 NEW feed methods
    addLike,
    addComment,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

/* =======================
   Hooks
======================= */
export function useStore() {
  const ctx = React.useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

/** Text/species/status then optional radius filter */
export function useFilteredPosts() {
  const { posts, filters, radiusKm, userLocation } = useStore();
  const q = filters.query.toLowerCase();

  let res = posts.filter((p) => {
    if (filters.status !== "All" && p.status !== filters.status) return false;
    if (filters.species !== "All" && p.species !== filters.species)
      return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.location || "").toLowerCase().includes(q) ||
      (p.breed || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );
  });

  if (userLocation && radiusKm > 0) {
    const R = 6371;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const within = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c <= radiusKm;
    };
    res = res.filter((p) =>
      typeof p.locationLat === "number" && typeof p.locationLng === "number"
        ? within(
            userLocation.lat,
            userLocation.lng,
            p.locationLat,
            p.locationLng
          )
        : true
    );
  }
  return res;
}

/* =======================
   Small helper
======================= */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
