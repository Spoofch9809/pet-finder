"use client";
import {
  fetchBackendSnapshot,
  postsAPI,
  petsAPI,
  breedsAPI,
  speciesAPI,
  postPicturesAPI,
  usersAPI,
  commentsAPI,
  type User as BackendUser,
  type Comment as BackendComment,
} from "../services/api";

import * as React from "react";

export const AUTH_EVENT_NAME = "pf-auth-changed";
export const AUTH_STORAGE_KEYS = [
  "pf.posts",
  "pf.pets",
  "pf.profile",
  "pf.filters",
  "pf.radiusKm",
  "pf.userLocation",
  "pf.notifications",
] as const;
export const AUTH_META_KEYS = ["pfAuthUser", "pfAuthToken"] as const;

/* =======================
   Types
======================= */
export type Status = "Lost" | "Found";
export type Species = "Dog" | "Cat" | "Other";

export type PostComment = {
  id: string;
  userId: number | null;
  text: string;
  createdAt?: string;
};

export type Post = {
  id: string;
  ownerId?: number | null;
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
  likes?: number; // basic like counter placeholder
  comments?: PostComment[];
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
  authUser: BackendUser | null;
  isAuthenticated: boolean;
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

  addPost: (p: Omit<Post, "id" | "createdAt">) => Promise<string>;
  deletePost: (id: string) => void;
  markFound: (id: string) => void;
  getPost: (id: string) => Post | undefined;

  addPet: (p: Omit<Pet, "id">) => string;
  getPet: (id: string) => Pet | undefined;
  updatePet: (
    id: string,
    data: {
      name: string;
      species: Species;
      color?: string;
      age?: string;
      breed?: string;
      notes?: string;
      photoUrl?: string;
      removePhoto?: boolean;
    }
  ) => Promise<void>;
  deletePet: (id: string) => void;

  setProfile: (p: Partial<Profile>) => void;
  setFilters: (f: Partial<Filters>) => void;

  // NEW feed methods
  addLike: (id: string) => void;
  addComment: (id: string, text: string) => void;
};

const StoreCtx = React.createContext<Store | null>(null);


function persistJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`pf: failed to persist ${key}`, error);
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      try {
        localStorage.removeItem(key);
        console.warn(`pf: cleared cached ${key} to stay under storage limits.`);
      } catch (cleanupError) {
        console.warn(`pf: failed to clear cached ${key}`, cleanupError);
      }
      console.warn("pf: browser storage quota exceeded; data will stay for this session only.");
    }
  }
}

function persistString(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`pf: failed to persist ${key}`, error);
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      try {
        localStorage.removeItem(key);
        console.warn(`pf: cleared cached ${key} to stay under storage limits.`);
      } catch (cleanupError) {
        console.warn(`pf: failed to clear cached ${key}`, cleanupError);
      }
      console.warn("pf: browser storage quota exceeded; data will stay for this session only.");
    }
  }
}

function clearAuthCaches() {
  if (typeof window === "undefined") return;
  try {
    AUTH_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  } catch (error) {
    console.warn("pf: failed to clear cached auth data", error);
  }
}

type BackendSnapshot = Awaited<ReturnType<typeof fetchBackendSnapshot>>;

const DEFAULT_BREED_NAME = "Mixed Breed";

function normalizePhoto(raw: unknown): string | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const value = raw.trim();
  if (value.startsWith('data:')) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `data:image/jpeg;base64,${value}`;
}

function normalizeSpeciesName(name?: string | null): Species {
  if (!name) return "Other";
  const normalized = name.toLowerCase();
  if (normalized.includes("dog")) return "Dog";
  if (normalized.includes("cat")) return "Cat";
  return "Other";
}

function mapBackendPosts(snapshot: BackendSnapshot): Post[] {
  return snapshot.posts
    .map((post) => {
      const pet = snapshot.petsById[post.pet_id];
      const speciesName = pet ? snapshot.speciesById[pet.species_id]?.species : undefined;
      const breedName = pet ? snapshot.breedsById[pet.breed_id]?.breed : undefined;
      const postPic = post.pictures?.[0]?.picture as unknown;
      const petPhotos = snapshot.petPhotosByPetId[post.pet_id];
      const petPic = Array.isArray(petPhotos) && petPhotos.length > 0 ? petPhotos[0].picture : undefined;
      const photoUrl = normalizePhoto((postPic as string) || (petPic as string));
      const backendComments = Array.isArray((post as any).comments)
        ? ((post as any).comments as BackendComment[])
        : [];
      const comments: PostComment[] = backendComments.map((comment) => ({
        id:
          comment.comment_id !== undefined
            ? String(comment.comment_id)
            : crypto.randomUUID?.() || String(Math.random()),
        userId: comment.user_id ?? null,
        text: comment.comment,
        createdAt: comment.time_stamp
          ? new Date(comment.time_stamp).toISOString()
          : undefined,
      }));

      let locationLat: number | undefined;
      let locationLng: number | undefined;
      if (typeof post.share_location === "string") {
        try {
          if (post.share_location.trim().startsWith("{")) {
            const parsed = JSON.parse(post.share_location);
            if (typeof parsed.lat === "number") locationLat = parsed.lat;
            if (typeof parsed.lng === "number") locationLng = parsed.lng;
          } else if (post.share_location.includes(",")) {
            const [latStr, lngStr] = post.share_location.split(",");
            const latNum = Number(latStr);
            const lngNum = Number(lngStr);
            if (Number.isFinite(latNum)) locationLat = latNum;
            if (Number.isFinite(lngNum)) locationLng = lngNum;
          }
        } catch (err) {
          console.warn("pf: failed to parse share_location", err);
        }
      }

      const status: Status = post.status ? "Found" : "Lost";

      let ownerId: number | undefined;
      if (typeof post.user_id === "number") {
        ownerId = post.user_id;
      } else {
        const userIdAny = (post as any).user_id;
        if (typeof userIdAny === "string" && userIdAny.trim() !== "") {
          const parsedOwner = Number(userIdAny);
          if (Number.isFinite(parsedOwner)) {
            ownerId = parsedOwner;
          }
        }
      }

      return {
        id: String(post.post_id),
        ownerId,
        name: pet?.name || `Pet #${post.pet_id}`,
        color: pet?.color || undefined,
        species: normalizeSpeciesName(speciesName),
        breed: breedName || undefined,
        location: post.location || undefined,
        locationLat,
        locationLng,
        status,
        description: post.description || pet?.description || undefined,
        photoUrl,
        createdAt: post.time_stamp ? new Date(post.time_stamp).toISOString() : new Date().toISOString(),
        likes: comments.length,
        comments,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function ensureSpeciesId(name: string | undefined, snapshot: BackendSnapshot) {
  const fallback = Object.values(snapshot.speciesById)[0];
  const target = name?.trim();
  if (!target) {
    return fallback?.species_id ?? 1;
  }
  const normalized = target.toLowerCase();
  const existing = Object.values(snapshot.speciesById).find((item) =>
    item.species?.toLowerCase() === normalized
  );
  if (existing?.species_id) return existing.species_id;
  const created = await speciesAPI.create({ species: target });
  const createdId =
    typeof created.species_id === "number"
      ? created.species_id
      : fallback?.species_id ?? 1;
  if (typeof created.species_id === "number") {
    snapshot.speciesById[created.species_id] = created;
  }
  snapshot.species.push(created);
  return createdId;
}


async function ensureOwnerId(preferredOwnerId?: number | null): Promise<number> {
  if (typeof preferredOwnerId === "number" && Number.isFinite(preferredOwnerId)) {
    return preferredOwnerId;
  }
  try {
    const users = await usersAPI.list();
    const existing = users.find((u) => typeof u.user_id === "number");
    if (existing?.user_id) return existing.user_id;
    const username = `demo${Date.now()}`;
    const created = await usersAPI.create({
      username,
      password: "changeme",
      firstname: "Demo",
      lastname: "User",
    });
    if (typeof created.user_id === "number") return created.user_id;
  } catch (error) {
    console.error("pf: ensureOwnerId failed", error);
  }
  return 1;
}

async function ensureBreedId(name: string | undefined, snapshot: BackendSnapshot) {
  const label = name?.trim() || DEFAULT_BREED_NAME;
  const normalized = label.toLowerCase();

  const existing = Object.values(snapshot.breedsById).find((item) =>
    item.breed?.toLowerCase() === normalized
  );
  if (existing?.breed_id) return existing.breed_id;

  try {
    const created = await breedsAPI.create({ breed: label });
    if (typeof created.breed_id === "number") {
      snapshot.breedsById[created.breed_id] = created;
      snapshot.breeds.push(created);
      return created.breed_id;
    }
  } catch (error) {
    console.warn('pf: falling back to default breed', error);
  }

  const fallback = Object.values(snapshot.breedsById).find((item) =>
    item.breed?.toLowerCase() === DEFAULT_BREED_NAME.toLowerCase()
  );
  if (fallback?.breed_id) return fallback.breed_id;

  try {
    const created = await breedsAPI.create({ breed: DEFAULT_BREED_NAME });
    if (typeof created.breed_id === "number") {
      snapshot.breedsById[created.breed_id] = created;
      snapshot.breeds.push(created);
      return created.breed_id;
    }
  } catch (error) {
    console.error('pf: unable to create fallback breed', error);
  }

  const first = Object.values(snapshot.breedsById)[0];
  return first?.breed_id ?? 1;
}

function extractBase64FromDataUrl(url: string | undefined) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith("data:")) return null;
  const match = /^data:([^;]+);base64,(.+)$/i.exec(trimmed);
  if (!match) return null;
  return { contentType: match[1], base64: match[2] };
}

/* =======================
   Defaults
======================= */
const DEFAULT_PETS: Pet[] = [];

const DEFAULT_PROFILE: Profile = { radiusKm: 5, pushEnabled: false };
const DEFAULT_FILTERS: Filters = { query: "", status: "All", species: "All" };

/** A few mock notifications shown on first run */
const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: crypto.randomUUID?.() || String(Math.random()),
    title: "User 1 has found a dog near KMITL",
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
  const [authUser, setAuthUser] = React.useState<BackendUser | null>(null);
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

  const isMounted = React.useRef(true);

  const loadPostsFromBackend = React.useCallback(async () => {
    try {
      const snapshot = await fetchBackendSnapshot();
      if (!isMounted.current) return;
      const mapped = mapBackendPosts(snapshot);
      setPosts(mapped);
    } catch (error) {
      console.error("pf: failed to load posts from backend", error);
      if (typeof window !== "undefined") {
        try {
          const cached = JSON.parse(window.localStorage.getItem("pf.posts") || "null");
          if (Array.isArray(cached)) {
            setPosts(cached);
          }
        } catch (fallbackError) {
          console.warn("pf: failed to hydrate posts from local cache", fallbackError);
        }
      }
    }
  }, []);


const syncPostToBackend = React.useCallback(
  async (post: Post) => {
    let backendId: string | null = null;
    try {
      const snapshot = await fetchBackendSnapshot();
      const speciesId = await ensureSpeciesId(post.species, snapshot);
      const breedId = await ensureBreedId(post.breed, snapshot);

      const ownerId = await ensureOwnerId(authUser?.user_id);

      const pet = await petsAPI.create({
        owner_id: ownerId,
        name: post.name,
        breed_id: breedId,
        species_id: speciesId,
        color: post.color || "Unknown",
        description: post.description || undefined,
      });

      const shareLocation =
        typeof post.locationLat === "number" && typeof post.locationLng === "number"
          ? JSON.stringify({ lat: post.locationLat, lng: post.locationLng })
          : post.location || undefined;

      const createdPost = await postsAPI.create({
        user_id: ownerId,
        pet_id: pet.pet_id ?? (pet as any)?.id ?? 1,
        description: post.description || undefined,
        location: post.location || undefined,
        share_location: shareLocation,
        lost_time: post.createdAt,
        status: post.status === "Found",
      });

      const photo = extractBase64FromDataUrl(post.photoUrl);
      if (photo && typeof createdPost.post_id === "number") {
        await postPicturesAPI.add(
          createdPost.post_id,
          photo.base64,
          photo.contentType
        );
      }

      const backendPostId =
        typeof createdPost.post_id === "number"
          ? String(createdPost.post_id)
          : post.id;
      backendId = backendPostId;
      const backendCreatedAt = createdPost.time_stamp
        ? new Date(createdPost.time_stamp).toISOString()
        : post.createdAt;
      setPosts((cur) =>
        cur.map((item) =>
          item.id === post.id
            ? {
                ...item,
                id: backendPostId,
                createdAt: backendCreatedAt,
                ownerId,
              }
            : item
        )
      );
    } catch (error) {
      console.error("pf: failed to sync post to backend", error);
    } finally {
      loadPostsFromBackend();
    }
    return backendId;
  },
  [authUser?.user_id, loadPostsFromBackend]
);


  // ----- Hydrate (client only) -----
  React.useEffect(() => {
    loadPostsFromBackend();
  }, [loadPostsFromBackend]);

  React.useEffect(() => () => {
    isMounted.current = false;
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
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

const resetAuthScopedState = React.useCallback(() => {
    setPosts([]);
    setPets([]);
    setNotifications([]);
    setProfileState({ ...DEFAULT_PROFILE });
    setFiltersState({ ...DEFAULT_FILTERS });
    setRadiusKm(DEFAULT_PROFILE.radiusKm ?? 0);
    setUserLocation(null);
    setAuthUser(null);
  }, []);

  const refreshAuthState = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("pfAuthUser");
    if (!stored) {
      resetAuthScopedState();
      clearAuthCaches();
      return;
    }
    try {
      const parsed = JSON.parse(stored) as BackendUser;
      setAuthUser(parsed);
    } catch (error) {
      console.warn("pf: failed to parse stored auth user", error);
      resetAuthScopedState();
      clearAuthCaches();
      return;
    }
    loadPostsFromBackend();
  }, [loadPostsFromBackend, resetAuthScopedState]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAuthEvent = () => refreshAuthState();
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || AUTH_META_KEYS.includes(event.key as (typeof AUTH_META_KEYS)[number])) {
        refreshAuthState();
      }
    };

    window.addEventListener(AUTH_EVENT_NAME, handleAuthEvent);
    window.addEventListener("storage", handleStorage);

    refreshAuthState();

    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, handleAuthEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshAuthState]);

  // ----- Persist -----
  React.useEffect(() => {
    persistJSON("pf.posts", posts);
  }, [posts]);
  React.useEffect(() => {
    persistJSON("pf.pets", pets);
  }, [pets]);
  React.useEffect(() => {
    persistJSON("pf.profile", profile);
  }, [profile]);
  React.useEffect(() => {
    persistJSON("pf.filters", filters);
  }, [filters]);
  React.useEffect(() => {
    persistString("pf.radiusKm", String(radiusKm));
  }, [radiusKm]);
  React.useEffect(() => {
    persistJSON("pf.userLocation", userLocation);
  }, [userLocation]);
  React.useEffect(() => {
    persistJSON("pf.notifications", notifications);
  }, [notifications]);

  // ----- Post/Pet mutations -----
  const addPost: Store["addPost"] = async (p) => {
    const id = crypto.randomUUID?.() || String(Math.random());
    const createdAt = new Date().toISOString();
    const post: Post = {
      id,
      createdAt,
      likes: 0,
      comments: [],
      ...p,
      ownerId: authUser?.user_id ?? null,
    };
    setPosts((cur) => [post, ...cur]);
    const backendId = await syncPostToBackend(post);
    if (!backendId) {
      console.warn("pf: post saved locally but backend sync failed");
    }
    return backendId ?? id;
  };

  const deletePost: Store["deletePost"] = (id) => {
    setPosts((cur) => cur.filter((p) => p.id !== id));
    const numericId = Number(id);
    if (!Number.isNaN(numericId)) {
      postsAPI
        .delete(numericId)
        .then(() => loadPostsFromBackend())
        .catch((error) => {
          console.error("pf: failed to delete post via API", error);
          loadPostsFromBackend();
        });
    }
  };

  const markFound: Store["markFound"] = (id) => {
    setPosts((cur) =>
      cur.map((p) => (p.id === id ? { ...p, status: "Found" } : p))
    );
    // Optional: drop a celebratory notification
    const post = posts.find((p) => p.id === id);
    if (post && authUser?.user_id && post.ownerId === authUser.user_id) {
      addNotification({
        title: `${post.name} was marked as Found`,
        body: "Great news! Your report has been updated.",
        postId: id,
      });
    }
    const numericId = Number(id);
    if (!Number.isNaN(numericId)) {
      postsAPI
        .update(numericId, { status: true })
        .then(() => loadPostsFromBackend())
        .catch((error) => {
          console.error("pf: failed to update post status", error);
          loadPostsFromBackend();
        });
    }
  };

  const getPost: Store["getPost"] = (id) => posts.find((p) => p.id === id);

  const addPet: Store["addPet"] = (p) => {
    const id = crypto.randomUUID?.() || String(Math.random());
    setPets((cur) => [{ id, ...p }, ...cur]);
    return id;
  };
  const getPet: Store["getPet"] = (id) => pets.find((p) => p.id === id);
  const updatePet: Store["updatePet"] = async (
    id,
    { name, species, color, age, breed, notes, photoUrl, removePhoto }
  ) => {
    setPets((cur) =>
      cur.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p } as Pet;
        next.name = name;
        next.species = species;
        next.color = color;
        next.age = age;
        next.breed = breed;
        next.notes = notes;
        if (removePhoto) {
          next.photoUrl = undefined;
        } else if (photoUrl) {
          next.photoUrl = photoUrl;
        }
        return next;
      })
    );
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
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!authUser?.user_id) {
      alert("Please sign in to leave a comment.");
      return;
    }

    const optimisticComment: PostComment = {
      id: crypto.randomUUID?.() || String(Math.random()),
      userId: authUser.user_id,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    setPosts((cur) =>
      cur.map((p) =>
        p.id === id
          ? { ...p, comments: [...(p.comments || []), optimisticComment] }
          : p
      )
    );

    const numericId = Number(id);
    if (!Number.isNaN(numericId)) {
      commentsAPI
        .add(numericId, { user_id: authUser.user_id, comment: trimmed })
        .then(() => loadPostsFromBackend())
        .catch((error) => {
          console.error("pf: failed to post comment", error);
          loadPostsFromBackend();
        });
    }
  };

  const isAuthenticated = Boolean(authUser?.user_id);

  const value: Store = {
    authUser,
    isAuthenticated,
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
    getPet,
    updatePet,
    deletePet,
    setProfile,
    setFilters,

    // NEW feed methods
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

export function useMyPosts() {
  const { authUser, posts } = useStore();
  // Intentionally ignore global text/species/status/radius filters for "My Posts"
  // so users always see everything they created.
  return React.useMemo(() => {
    if (!authUser?.user_id) return [];
    const uid = Number(authUser.user_id);
    return posts.filter((post) => Number(post.ownerId) === uid);
  }, [posts, authUser?.user_id]);
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
