"use client";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "../../(shell)/Store";
import styles from "../../(shell)/Shell.module.css";

export default function PostDetails(){
  const { id } = useParams<{ id: string }>();
  const { getPost, deletePost, markFound } = useStore();
  const router = useRouter();
  const post = getPost(id);

  if(!post) return <div className="p-4">Post not found.</div>;

  return (
    <section className="p-3">
      <div className="row g-3">
        <div className="col-lg-7">
          <div className={styles.panel}>
            <div className="ratio ratio-21x9 rounded-4 overflow-hidden mb-3 bg-light">
              {post.photoUrl && <img src={post.photoUrl} alt={post.name} className="w-100 h-100 object-fit-cover"/>}
            </div>
            <h4 className="mb-1">{post.name} <span className={`badge ms-2 text-bg-${post.status === "Found" ? "success" : "danger"}`}>{post.status}</span></h4>
            <div className="text-muted">{post.location || "Unknown location"}</div>
            <p className="mt-3 mb-0">{post.description || "No description."}</p>
          </div>
        </div>
        <div className="col-lg-5">
          <div className={styles.panel}>
            <h5 className="mb-3">Actions</h5>
            <div className="d-grid gap-2">
              <button className="btn btn-success" onClick={()=> { markFound(post.id); alert("Marked as Found"); }}>Mark as Found</button>
              <button className="btn btn-danger" onClick={()=> { if(confirm("Delete this post?")){ deletePost(post.id); router.push("/myposts"); } }}>Delete</button>
              <button className="btn btn-secondary" onClick={()=> router.back()}>Back</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}