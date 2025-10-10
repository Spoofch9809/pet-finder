"use client";

import styles from "../(shell)/Shell.module.css";
import { useMyPosts, useStore } from "../(shell)/Store";
import { formatLocationLabel } from "../(shell)/location";
import Link from "next/link";

export default function MyPosts() {
  const { isAuthenticated } = useStore();
  const posts = useMyPosts();

  if (!isAuthenticated) {
    return (
      <section className="p-5 text-center text-muted">
        <div className="mb-3 fw-semibold fs-5">Sign in to see your posts</div>
        <p className="mb-4">
          Once you log in, any pets you report will appear here for quick access.
        </p>
        <Link href="/signin" className="btn btn-primary">
          Go to Sign In
        </Link>
      </section>
    );
  }

  return (
    <section className="p-3">
      <div className="row g-3">
        {posts.map((post) => (
          <div className="col-md-6 col-xl-4" key={post.id}>
            <div className="card h-100">
              <span
                className={`position-absolute top-0 start-0 m-2 badge text-bg-${post.status === "Found" ? "success" : "danger"}`}
              >
                {post.status}
              </span>
              {post.photoUrl && (
                <img
                  className={`${styles.petCardImg} card-img-top`}
                  src={post.photoUrl}
                  alt="pet"
                />
              )}
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <h6 className="mb-0">{post.name}</h6>
                </div>
                <div className="text-muted small">{formatLocationLabel(post)}</div>
              </div>
              <div className="card-footer bg-white">
                <Link className="btn btn-sm w-100 btn-outline-secondary" href={`/posts/${post.id}`}>
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="text-center text-muted">You have not posted any updates yet.</div>
        )}
      </div>
    </section>
  );
}
