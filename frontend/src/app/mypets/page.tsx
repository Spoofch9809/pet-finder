"use client";
import styles from "../(shell)/Shell.module.css";
import { useStore } from "../(shell)/Store";
import Link from "next/link";

export default function MyPets(){
  const { pets, deletePet } = useStore();
  return (
    <section className="p-3">
      <div className="row g-3">
        <div className="col-md-6 col-xl-4">
          <Link href="/mypets/new" className="text-decoration-none">
            <div className="card h-100" style={{ border:"2px dashed #d1d1d1" }}>
              <div className="card-body d-flex align-items-center justify-content-center text-muted">
                <div className="text-center">
                  <i className="bi bi-plus-circle fs-2"/>
                  <div className="mt-2">Add New Pet</div>
                </div>
              </div>
            </div>
          </Link>
        </div>
        {pets.map(p => (
          <div className="col-md-6 col-xl-4" key={p.id}>
            <div className="card h-100">
              {p.photoUrl && <img className={styles.petCardImg + " card-img-top"} src={p.photoUrl} alt={p.name}/>} 
              <div className="card-body">
                <h6 className="mb-1">{p.name}</h6>
                <div className="small text-muted">
                  <div><i className="bi bi-shield-check me-1"/>{p.breed || p.species}</div>
                  {p.color && <div><i className="bi bi-palette me-1"/>{p.color}</div>}
                  {p.age && <div><i className="bi bi-calendar2 me-1"/>{p.age}</div>}
                </div>
              </div>
              <div className="card-footer bg-white d-flex gap-2">
                <button className="btn btn-sm btn-outline-danger" onClick={()=> deletePet(p.id)}><i className="bi bi-trash"/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}