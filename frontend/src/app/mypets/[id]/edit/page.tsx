"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import styles from "../../../(shell)/Shell.module.css";
import { useStore, Species, fileToDataUrl } from "../../../(shell)/Store";

export default function EditPet() {
  const { getPet, updatePet } = useStore();
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const pet = params?.id ? getPet(params.id) : undefined;

  const [form, setForm] = React.useState({
    name: pet?.name ?? "",
    species: (pet?.species ?? "Dog") as Species,
    color: pet?.color ?? "",
    age: pet?.age ?? "",
    breed: pet?.breed ?? "",
    notes: pet?.notes ?? "",
  });
  const [photoPreview, setPhotoPreview] = React.useState<string | undefined>(pet?.photoUrl);
  const [newPhotoData, setNewPhotoData] = React.useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!pet && params?.id) {
      router.replace("/mypets");
    }
  }, [pet, params?.id, router]);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setPhotoPreview(dataUrl);
    setNewPhotoData(dataUrl);
    setRemovePhoto(false);
  }

  function clearPhoto() {
    setPhotoPreview(undefined);
    setNewPhotoData(null);
    setRemovePhoto(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!params?.id) return;
    if (!form.name.trim()) {
      alert("Please enter a name");
      return;
    }

    setSaving(true);
    try {
      await updatePet(params.id, {
        name: form.name.trim(),
        species: form.species,
        color: form.color?.trim() || undefined,
        age: form.age?.trim() || undefined,
        breed: form.breed?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
        photoUrl: newPhotoData || undefined,
        removePhoto,
      });
      router.push("/mypets");
    } catch (err) {
      console.error("Failed to update pet", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to update pet: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  if (!pet) {
    return (
      <section className="p-3">
        <div className={styles.panel}>
          <p className="mb-0">We couldn’t find that pet. It may have been deleted.</p>
          <Link href="/mypets" className="btn btn-link px-0">
            Back to My Pets
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="p-3">
      <div className={styles.panel}>
        <form className="row g-3" onSubmit={submit}>
          <div className="col-12">
            <div className="ratio ratio-21x9 mb-3 bg-light rounded-4 d-flex align-items-center justify-content-center border">
              {photoPreview ? (
                <img src={photoPreview} alt="preview" className="w-100 h-100 object-fit-cover rounded-4" />
              ) : (
                <div className="text-muted">No photo selected</div>
              )}
            </div>
          </div>
          <div className="col-md-8">
            <label className="form-label">Photo</label>
            <input type="file" accept="image/*" className="form-control" onChange={onFile} />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={clearPhoto}
              disabled={removePhoto && !photoPreview}
            >
              Remove Photo
            </button>
          </div>
          <div className="col-md-6">
            <label className="form-label">Name</label>
            <input className="form-control" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Species</label>
            <select
              className="form-select"
              value={form.species}
              onChange={(e) => updateField("species", e.target.value as Species)}
            >
              <option>Dog</option>
              <option>Cat</option>
              <option>Other</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Breed</label>
            <input className="form-control" value={form.breed} onChange={(e) => updateField("breed", e.target.value)} placeholder="Mixed" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Color</label>
            <input className="form-control" value={form.color} onChange={(e) => updateField("color", e.target.value)} placeholder="Brown" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Age</label>
            <input className="form-control" value={form.age} onChange={(e) => updateField("age", e.target.value)} placeholder="2" />
          </div>
          <div className="col-12">
            <label className="form-label">Notes</label>
            <textarea className="form-control" rows={3} value={form.notes} onChange={(e) => updateField("notes", e.target.value)} />
          </div>
          <div className="col-12 d-flex justify-content-end gap-2">
            <Link href="/mypets" className="btn btn-outline-secondary">
              Cancel
            </Link>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
