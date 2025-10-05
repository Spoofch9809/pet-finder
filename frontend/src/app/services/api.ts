// frontend/src/app/services/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ===== Types matching your backend =====
export interface User {
  user_id?: number;
  username: string;
  password?: string; // don't expose in responses
  firstname: string;
  lastname: string;
  email?: string;
  phone?: number;
  address?: string;
}

export interface Pet {
  pet_id?: number;
  owner_id: number;
  name: string;
  breed_id: number;
  species_id: number;
  color: string;
  age?: number;
  description?: string;
}

export interface Post {
  post_id?: number;
  user_id: number;
  pet_id: number;
  description?: string;
  location?: string;
  share_location?: string;
  lost_time?: string;
  time_stamp?: string;
  status: boolean; // true = Found (1), false = Lost (0)
  pictures?: PostPicture[];
}

export interface PostPicture {
  post_picture_id?: number;
  post_id: number;
  picture: string;
  content_type?: string;
}

export interface Breed {
  breed_id?: number;
  breed: string;
}

export interface Species {
  species_id?: number;
  species: string;
}

// ===== Generic fetch wrapper =====
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  console.log('API Request:', url, options?.method || 'GET');
  
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    console.error('API Error:', err);
    throw new Error(err.detail || `Request failed with status ${res.status}`);
  }

  const data = await res.json();
  console.log('API Response:', data);
  return data;
}

// ===== USERS API =====
export const usersAPI = {
  list: () => apiFetch<User[]>("/users/"),
  get: (id: number) => apiFetch<User>(`/users/${id}`),
  create: (data: Omit<User, 'user_id'>) => 
    apiFetch<User>("/users/", { 
      method: "POST", 
      body: JSON.stringify(data) 
    }),
  update: (id: number, data: Omit<User, 'user_id'>) => 
    apiFetch<User>(`/users/${id}`, { 
      method: "PUT", 
      body: JSON.stringify(data) 
    }),
  delete: (id: number) => 
    apiFetch<User>(`/users/${id}`, { method: "DELETE" }),
};

// ===== PETS API =====
export const petsAPI = {
  list: () => apiFetch<Pet[]>("/pets/"),
  get: (id: number) => apiFetch<Pet>(`/pets/${id}`),
  create: (data: Omit<Pet, 'pet_id'>) => 
    apiFetch<Pet>("/pets/", { 
      method: "POST", 
      body: JSON.stringify(data) 
    }),
  update: (id: number, data: Partial<Omit<Pet, 'pet_id'>>) => 
    apiFetch<Pet>(`/pets/${id}`, { 
      method: "PUT", 
      body: JSON.stringify(data) 
    }),
  delete: (id: number) => 
    apiFetch<Pet>(`/pets/${id}`, { method: "DELETE" }),
};

// ===== BREEDS API =====
export const breedsAPI = {
  list: () => apiFetch<Breed[]>("/breeds/"),
  get: (id: number) => apiFetch<Breed>(`/breeds/${id}`),
  create: (data: Omit<Breed, 'breed_id'>) => 
    apiFetch<Breed>("/breeds/", { 
      method: "POST", 
      body: JSON.stringify(data) 
    }),
  update: (id: number, data: Omit<Breed, 'breed_id'>) => 
    apiFetch<Breed>(`/breeds/${id}`, { 
      method: "PUT", 
      body: JSON.stringify(data) 
    }),
  delete: (id: number) => 
    apiFetch<Breed>(`/breeds/${id}`, { method: "DELETE" }),
};

// ===== SPECIES API =====
export const speciesAPI = {
  list: () => apiFetch<Species[]>("/species/"),
  get: (id: number) => apiFetch<Species>(`/species/${id}`),
  create: (data: Omit<Species, 'species_id'>) => 
    apiFetch<Species>("/species/", { 
      method: "POST", 
      body: JSON.stringify(data) 
    }),
  update: (id: number, data: Omit<Species, 'species_id'>) => 
    apiFetch<Species>(`/species/${id}`, { 
      method: "PUT", 
      body: JSON.stringify(data) 
    }),
  delete: (id: number) => 
    apiFetch<Species>(`/species/${id}`, { method: "DELETE" }),
};

// ===== POSTS API =====
export const postsAPI = {
  list: () => apiFetch<Post[]>("/posts/"),
  get: (id: number) => apiFetch<Post>(`/posts/${id}`),
  create: (data: Omit<Post, 'post_id' | 'time_stamp' | 'pictures'>) =>
    apiFetch<Post>("/posts/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => 
    apiFetch<void>(`/posts/${id}`, { method: "DELETE" }),
};

export const postPicturesAPI = {
  add: (postId: number, pictureBase64: string, contentType?: string) =>
    apiFetch<PostPicture>(`/posts/${postId}/pictures`, {
      method: "POST",
      body: JSON.stringify({ picture: pictureBase64, content_type: contentType }),
    }),
};

export const petPhotosAPI = {
  list: () => apiFetch<PetPhoto[]>("/pet-photos/"),
  add: (petId: number, pictureBase64: string) =>
    apiFetch<PetPhoto>("/pet-photos/", {
      method: "POST",
      body: JSON.stringify({ pet_id: petId, picture: pictureBase64 }),
    }),
  remove: (photoId: number) =>
    apiFetch<PetPhoto>(`/pet-photos/${photoId}`, {
      method: "DELETE",
    }),
};

// ===== Helper: Test connection =====
export async function testConnection() {
  try {
    const res = await fetch('http://localhost:8000/health');
    const data = await res.json();
    console.log('✅ Backend connection successful:', data);
    return data;
  } catch (err) {
    console.error('❌ Backend connection failed:', err);
    throw err;
  }
}

export interface BackendSnapshot {
  posts: Post[];
  pets: Pet[];
  petPhotos: PetPhoto[];
  breeds: Breed[];
  species: Species[];
  petsById: Record<number, Pet>;
  petPhotosByPetId: Record<number, PetPhoto[]>;
  breedsById: Record<number, Breed>;
  speciesById: Record<number, Species>;
}

export async function fetchBackendSnapshot(): Promise<BackendSnapshot> {
  const [posts, pets, petPhotos, breeds, species] = await Promise.all([
    postsAPI.list(),
    petsAPI.list(),
    petPhotosAPI.list(),
    breedsAPI.list(),
    speciesAPI.list(),
  ]);

  const petsById = pets.reduce<Record<number, Pet>>((acc, pet) => {
    if (typeof pet.pet_id === "number") {
      acc[pet.pet_id] = pet;
    }
    return acc;
  }, {});

  const petPhotosByPetId = petPhotos.reduce<Record<number, PetPhoto[]>>((acc, photo) => {
    if (typeof photo.pet_id === "number") {
      (acc[photo.pet_id] ||= []).push(photo);
    }
    return acc;
  }, {});

  const breedsById = breeds.reduce<Record<number, Breed>>((acc, breed) => {
    if (typeof breed.breed_id === "number") {
      acc[breed.breed_id] = breed;
    }
    return acc;
  }, {});

  const speciesById = species.reduce<Record<number, Species>>((acc, speciesItem) => {
    if (typeof speciesItem.species_id === "number") {
      acc[speciesItem.species_id] = speciesItem;
    }
    return acc;
  }, {});

  return { posts, pets, petPhotos, breeds, species, petsById, petPhotosByPetId, breedsById, speciesById };
}

