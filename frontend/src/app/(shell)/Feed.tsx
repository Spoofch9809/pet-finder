"use client";
import { useStore } from "./Store";
import React from "react";

export default function Feed() {
  const { posts, addLike, addComment } = useStore();
  const [commentInput, setCommentInput] = React.useState<{ [key:string]: string }>({});

  if (posts.length === 0) return <div className="text-center text-muted mt-4">No posts yet.</div>;

  return (
    <div className="mt-4">
      {posts.map((p) => (
        <div key={p.id} className="card mb-4 shadow-sm">
          {p.photoUrl && <img src={p.photoUrl} className="card-img-top" alt={p.name} />}
          <div className="card-body">
            <h5 className="card-title mb-1">
              {p.name} <span className={`badge bg-${p.status === "Found" ? "success" : "danger"} ms-2`}>{p.status}</span>
            </h5>
            <small className="text-muted">{p.location || "Unknown location"} · {new Date(p.createdAt).toLocaleString()}</small>
            <p className="mt-2 mb-2">{p.description || "No description provided."}</p>

            {/* Actions */}
            <div className="d-flex gap-3 mb-2">
              <button className="btn btn-sm btn-outline-primary" onClick={() => addLike(p.id)}>
                <i className="bi bi-heart"></i> Like {p.likes || 0}
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => alert("Share feature coming soon!")}
              >
                <i className="bi bi-share"></i> Share
              </button>
              <button
                className="btn btn-sm btn-outline-success"
                onClick={() => alert("Report submitted: Found Pet!")}
              >
                <i className="bi bi-flag"></i> Report Found
              </button>
            </div>

            {/* Comments */}
            <div className="mb-2">
              {(p.comments || []).map((c, idx) => (
                <div key={idx} className="border p-1 rounded mb-1 bg-light small">
                  {c}
                </div>
              ))}
            </div>

            <div className="input-group input-group-sm">
              <input
                type="text"
                className="form-control"
                placeholder="Add a comment..."
                value={commentInput[p.id] || ""}
                onChange={(e) =>
                  setCommentInput({ ...commentInput, [p.id]: e.target.value })
                }
              />
              <button
                className="btn btn-outline-primary"
                onClick={() => {
                  if (!commentInput[p.id]) return;
                  addComment(p.id, commentInput[p.id]);
                  setCommentInput({ ...commentInput, [p.id]: "" });
                }}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
