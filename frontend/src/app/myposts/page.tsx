"use client";
import styles from "../(shell)/Shell.module.css";
import { useFilteredPosts } from "../(shell)/Store";
import Link from "next/link";

export default function MyPosts(){
  const posts = useFilteredPosts();
  return (
    <section className="p-3">
      <div className="row g-3">
        {posts.map((c) => (
          <div className="col-md-6 col-xl-4" key={c.id}>
            <div className="card h-100">
              <span className={`position-absolute top-0 start-0 m-2 badge text-bg-${c.status === "Found" ? "success" : "danger"}`}>{c.status}</span>
              {c.photoUrl && <img className={styles.petCardImg + " card-img-top"} src={c.photoUrl} alt="pet"/>}
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <h6 className="mb-0">{c.name}</h6>
                </div>
                <div className="text-muted small">{c.location || "Unknown"}</div>
              </div>
              <div className="card-footer bg-white">
                <Link className="btn btn-sm w-100 btn-outline-secondary" href={`/posts/${c.id}`}>View Details</Link>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && <div className="text-center text-muted">No posts match current filters.</div>}
      </div>
    </section>
  );
}