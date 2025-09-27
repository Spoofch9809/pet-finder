"use client";
import { useStore, Species, fileToDataUrl } from "../../(shell)/Store";
import styles from "../../(shell)/Shell.module.css";
import { useRouter } from "next/navigation";
import React from "react";

export default function NewPet(){
  const { addPet } = useStore();
  const router = useRouter();
  const [form, setForm] = React.useState({ name:"", species:"Dog" as Species, color:"", age:"", breed:"", photoUrl:"", notes:"" });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]){ setForm((f)=> ({...f, [k]: v})); }
  async function onFile(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0];
    if(!f) return;
    update("photoUrl", await fileToDataUrl(f));
  }

  function submit(e: React.FormEvent){
    e.preventDefault();
    if(!form.name) return alert("Please enter a name");
    addPet({ ...form });
    router.push("/mypets");
  }

  return (
    <section className="p-3">
      <div className={styles.panel}>
        <form className="row g-3" onSubmit={submit}>
          <div className="col-12">
            <div className="ratio ratio-21x9 mb-3 bg-light rounded-4 d-flex align-items-center justify-content-center border">
              {form.photoUrl ? <img src={form.photoUrl} alt="preview" className="w-100 h-100 object-fit-cover rounded-4"/> : <div className="text-muted">Upload a pet photo</div>}
            </div>
          </div>
          <div className="col-md-8"><label className="form-label">Photo</label><input type="file" accept="image/*" className="form-control" onChange={onFile}/></div>
          <div className="col-md-4"><label className="form-label">Or Image URL</label><input className="form-control" value={form.photoUrl} onChange={e=>update("photoUrl", e.target.value)} placeholder="https://..."/></div>
          <div className="col-md-6"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={e=>update("name", e.target.value)} /></div>
          <div className="col-md-6"><label className="form-label">Species</label><select className="form-select" value={form.species} onChange={e=>update("species", e.target.value as any)}><option>Dog</option><option>Cat</option><option>Other</option></select></div>
          <div className="col-md-6"><label className="form-label">Breed</label><input className="form-control" value={form.breed} onChange={e=>update("breed", e.target.value)} /></div>
          <div className="col-md-3"><label className="form-label">Color</label><input className="form-control" value={form.color} onChange={e=>update("color", e.target.value)} /></div>
          <div className="col-md-3"><label className="form-label">Age</label><input className="form-control" value={form.age} onChange={e=>update("age", e.target.value)} placeholder="2 years"/></div>
          <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows={3} value={form.notes} onChange={e=>update("notes", e.target.value)} /></div>
          <div className="col-12 d-flex justify-content-end"><button className="btn btn-primary" type="submit">Add Pet</button></div>
        </form>
      </div>
    </section>
  );
}