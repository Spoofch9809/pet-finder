// src/app/posts/[id]/page.tsx
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../../(shell)/Shell.module.css";
import { useStore } from "../../(shell)/Store";

export default function PostDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getPost, deletePost, markFound } = useStore();

  const post = getPost(id);

  if (!post) {
    return (
      <section className="p-3">
        <div className={styles.panel}>
          <h5 className="mb-2">Post not found</h5>
          <p className="text-muted mb-0">
            We couldn’t find a record for this id. It may have been deleted.
          </p>
        </div>
      </section>
    );
  }

  const createdText = post.createdAt
    ? new Date(post.createdAt).toLocaleString()
    : "—";

  const lat =
    (post as any).locationLat ??
    (post as any).lat ??
    (post as any).coords?.lat ??
   (post as any).location?.lat;

  const lng =
    (post as any).locationLng ??
    (post as any).lng ??
    (post as any).coords?.lng ??
    (post as any).location?.lng;

  // Lightweight embedded map (no API key required).
  const mapSrc =
    typeof lat === "number" && typeof lng === "number"
      ? `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`
      : "";

  function onMarkFound() {
    if (post) {
      markFound(post.id);
      alert("Marked as Found");
    }
  }

  function onDelete() {
    if (post && confirm("Delete this post?")) {
      deletePost(post.id);
      router.push("/myposts");
    }
  }

  return (
    <section className="p-3">
      <div className="row g-3">
        {/* LEFT: hero + summary card */}
        <div className="col-lg-7">
          <div className={styles.panel}>
            {/* Hero image */}
            <div className="ratio ratio-21x9 rounded-4 overflow-hidden mb-3 bg-light">
              {post.photoUrl ? (
                <img
                  src={post.photoUrl}
                  alt={post.name || "Pet"}
                  className="w-100 h-100 object-fit-cover"
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center text-muted">
                  No photo
                </div>
              )}
            </div>

            {/* Summary card */}
            <div className="p-2">
              <h4 className="mb-2">{post.name || "—"}</h4>
              <div className="small text-muted mb-2">
                <i className="bi bi-geo-alt me-1" />
                {post.location || "Unknown location"}
              </div>
              <div className="small text-muted mb-3">
                <i className="bi bi-calendar-event me-1" />
                Posted: {createdText}
              </div>

              {/* Small map preview */}
              {mapSrc ? (
                <div className="ratio ratio-16x9 rounded-4 overflow-hidden">
                  <iframe
                    title="Pet location"
                    src={mapSrc}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* RIGHT: detail panel */}
        <div className="col-lg-5">
          <div className={styles.panel}>
            <h5 className="mb-3">Pet Details</h5>

            <dl className="row mb-0">
              <dt className="col-4 col-sm-3 text-muted">Status</dt>
              <dd className="col-8 col-sm-9">
                <span
                  className={`badge ${
                    post.status === "Found" ? "text-bg-success" : "text-bg-danger"
                  }`}
                >
                  {post.status}
                </span>
              </dd>

              <dt className="col-4 col-sm-3 text-muted">Species</dt>
              <dd className="col-8 col-sm-9">{post.species || "—"}</dd>

              <dt className="col-4 col-sm-3 text-muted">Breed</dt>
              <dd className="col-8 col-sm-9">{post.breed || "—"}</dd>

              <dt className="col-4 col-sm-3 text-muted">Color</dt>
              <dd className="col-8 col-sm-9">{post.color || "—"}</dd>

              {/* Optional custom fields (safe to show if you later add them) */}
              {(post as any).age && (
                <>
                  <dt className="col-4 col-sm-3 text-muted">Age</dt>
                  <dd className="col-8 col-sm-9">{(post as any).age}</dd>
                </>
              )}
              {(post as any).weight && (
                <>
                  <dt className="col-4 col-sm-3 text-muted">Weight</dt>
                  <dd className="col-8 col-sm-9">{(post as any).weight}</dd>
                </>
              )}
              {(post as any).marks && (
                <>
                  <dt className="col-4 col-sm-3 text-muted">Special Marks</dt>
                  <dd className="col-8 col-sm-9">{(post as any).marks}</dd>
                </>
              )}

              <dt className="col-12 text-muted mt-3">Description</dt>
              <dd className="col-12">{post.description || "—"}</dd>
            </dl>
          </div>

          {/* Actions */}
          <div className={`${styles.panel} mt-3`}>
            <h5 className="mb-3">Contact Owner</h5>
            <div className="d-grid gap-2">
              <button
                className="btn btn-info"
                type="button"
                onClick={() => alert("Calling owner (mock)")}
              >
                Call Owner
              </button>
              <button
                className="btn btn-success"
                type="button"
                onClick={() => alert("Message sent (mock)")}
              >
                Send Message
              </button>

              <button className="btn btn-secondary" onClick={onMarkFound}>
                Mark As Found
              </button>

              <button className="btn btn-outline-danger" onClick={onDelete}>
                Delete Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
