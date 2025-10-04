"use client";
import Link from "next/link";
import { useStore } from "../(shell)/Store";

export default function NotificationsPage() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  } = useStore();

  return (
    <section className="p-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="mb-0">Notifications</h4>
        {notifications.some((n) => !n.read) && (
          <button className="btn btn-sm btn-outline-primary" onClick={markAllNotificationsRead}>
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="text-muted">No notifications yet.</div>
      )}

      <div className="list-group">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start ${!n.read ? "bg-light" : ""}`}
            onClick={() => markNotificationRead(n.id)}
            style={{ cursor: "pointer" }}
          >
            <div className="me-3">
              <div className="fw-semibold">{n.title}</div>
              {n.body && <div className="small text-muted">{n.body}</div>}
              <div className="small text-muted mt-1">
                {new Date(n.createdAt).toLocaleString()}
                {n.postId && (
                  <>
                    {" · "}
                    <Link href={`/posts/${n.postId}`} className="text-decoration-none">
                      View post
                    </Link>
                  </>
                )}
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
              aria-label="Delete"
              title="Delete"
            >
              <i className="bi bi-trash" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
