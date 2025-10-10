"use client";

import Link from "next/link";
import React from "react";
import { useStore } from "./Store";
import { formatLocationLabel } from "./location";

export default function Feed() {
  const { posts, addLike, addComment, isAuthenticated } = useStore();
  const [commentInput, setCommentInput] = React.useState<Record<string, string>>({});

  if (posts.length === 0) {
    return <div className="text-center text-muted mt-4">No posts yet.</div>;
  }

  return (
    <div className="mt-4">
      <div className="row g-4">
        {posts.map((post) => {
          const postedAt = new Date(post.createdAt).toLocaleString();
          const badgeColor = post.status === "Found" ? "success" : "danger";

          return (
            <div className="col-12 col-md-6 col-xl-4" key={post.id}>
              <div className="card h-100 shadow-sm">
                <Link
                  href={`/posts/${post.id}`}
                  className="text-decoration-none text-reset"
                >
                  {post.photoUrl && (
                    <div className="ratio ratio-4x3 bg-light">
                      <img
                        src={post.photoUrl}
                        alt={post.name}
                        className="rounded-top object-fit-cover"
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                  )}
                  <div className="card-body pb-2">
                    <div className="d-flex align-items-start justify-content-between mb-2">
                      <h5 className="card-title mb-0">{post.name}</h5>
                      <span className={`badge bg-${badgeColor}`}>{post.status}</span>
                    </div>
                    <div className="small text-muted mb-2">
                      {formatLocationLabel(post)}
                      <br />
                      <span>{postedAt}</span>
                    </div>
                    <p className="card-text text-truncate" style={{ maxHeight: "3.5rem" }}>
                      {post.description || "No description provided."}
                    </p>
                  </div>
                </Link>

                <div className="card-body pt-0">
                  <div className="d-flex gap-2 flex-wrap mb-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => addLike(post.id)}
                    >
                      <i className="bi bi-heart" /> Like {post.likes || 0}
                    </button>
                    <Link
                      href={`/posts/${post.id}`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      View Details
                    </Link>
                  </div>

                  {(post.comments || []).length > 0 && (
                    <div className="mb-2 small text-muted">
                      <strong>Recent comments</strong>
                      <div className="mt-1">
                        {(post.comments || []).slice(-2).map((comment) => (
                          <div key={comment.id} className="border rounded px-2 py-1 mb-1 bg-light">
                            {comment.text}
                          </div>
                        ))}
                        {post.comments && post.comments.length > 2 && (
                          <div className="text-end">
                            <Link href={`/posts/${post.id}`} className="small">
                              View all comments
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add a comment..."
                      disabled={!isAuthenticated}
                      value={commentInput[post.id] || ""}
                      onChange={(event) =>
                        setCommentInput((prev) => ({
                          ...prev,
                          [post.id]: event.target.value,
                        }))
                      }
                    />
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => {
                        const text = commentInput[post.id];
                        if (!text?.trim()) return;
                        addComment(post.id, text.trim());
                        setCommentInput((prev) => ({ ...prev, [post.id]: "" }));
                      }}
                    >
                      Post
                    </button>
                  </div>
                  {!isAuthenticated && (
                    <div className="form-text text-muted mt-1">
                      Sign in to leave a comment.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
