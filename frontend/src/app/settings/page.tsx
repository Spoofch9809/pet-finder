"use client";
import * as React from "react";
import styles from "../(shell)/Shell.module.css";
import { useStore, AUTH_EVENT_NAME } from "../(shell)/Store";
import { usersAPI, type User as BackendUser } from "../services/api";
import Link from "next/link";

export default function Settings() {
  const { profile, setProfile, authUser, isAuthenticated } = useStore();

  const [form, setForm] = React.useState<{
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    password?: string;
  }>({ username: "", firstname: "", lastname: "", email: "", phone: "", address: "", password: "" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState<string | null>(null);

  // Hydrate from backend user on mount/auth change
  React.useEffect(() => {
    setError(null); setSaved(null);
    if (!authUser?.user_id) return;
    let cancelled = false;
    (async () => {
      try {
        const latest = await usersAPI.get(authUser.user_id!);
        if (cancelled) return;
        const phone = latest.phone !== undefined && latest.phone !== null ? String(latest.phone) : "";
        setForm({
          username: latest.username || "",
          firstname: latest.firstname || "",
          lastname: latest.lastname || "",
          email: latest.email || "",
          phone,
          address: latest.address || "",
          password: "",
        });
        // Keep local auth snapshot fresh
        try {
          localStorage.setItem("pfAuthUser", JSON.stringify(latest));
          window.dispatchEvent(new Event(AUTH_EVENT_NAME));
        } catch {}
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load profile");
      }
    })();
    return () => { cancelled = true; };
  }, [authUser?.user_id]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((cur) => ({ ...cur, [key]: value }));
  }

  async function handleSave() {
    setError(null); setSaved(null);
    if (!authUser?.user_id) {
      setError("Please sign in.");
      return;
    }
    setLoading(true);
    try {
      const payload: Partial<BackendUser> & { password?: string } = {
        username: form.username,
        firstname: form.firstname,
        lastname: form.lastname,
        email: form.email || undefined,
        address: form.address || undefined,
      } as any;
      const phoneNum = Number(form.phone);
      if (!Number.isNaN(phoneNum)) (payload as any).phone = phoneNum;
      if (form.password && form.password.trim()) payload.password = form.password.trim();

      const updated = await usersAPI.update(authUser.user_id!, payload as any);
      try {
        localStorage.setItem("pfAuthUser", JSON.stringify(updated));
        window.dispatchEvent(new Event(AUTH_EVENT_NAME));
      } catch {}
      setSaved("Profile updated");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save changes");
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated || !authUser) {
    return (
      <section className="p-5 text-center text-muted">
        <div className="mb-3 fw-semibold fs-5">Sign in to manage your profile</div>
        <p className="mb-4">Update your account details and notification settings after signing in.</p>
        <Link href="/signin" className="btn btn-primary">Go to Sign In</Link>
      </section>
    );
  }

  return (
    <section className="p-3">
      <div className="row g-3">
        <div className="col-lg-7">
          <div className={styles.panel}>
            <h5 className="mb-3">Account Information</h5>
            <div className="row g-3 align-items-center">
              <div className="col-auto">
                <img src="https://i.pravatar.cc/100?img=12" className={`border ${styles.avatar}`} alt="avatar"/>
              </div>
              <div className="col-md-6">
                <label className="form-label">Username</label>
                <input className="form-control" value={form.username} onChange={(e)=>update("username", e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={form.email} onChange={(e)=>update("email", e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">First name</label>
                <input className="form-control" value={form.firstname} onChange={(e)=>update("firstname", e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Last name</label>
                <input className="form-control" value={form.lastname} onChange={(e)=>update("lastname", e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={(e)=>update("phone", e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Address</label>
                <input className="form-control" value={form.address} onChange={(e)=>update("address", e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">New Password (optional)</label>
                <input type="password" className="form-control" value={form.password || ""} onChange={(e)=>update("password", e.target.value)} />
              </div>
            </div>
            {error && (<div className="alert alert-danger mt-3 mb-0 small">{error}</div>)}
            {saved && !error && (<div className="alert alert-success mt-3 mb-0 small">{saved}</div>)}
          </div>
        </div>

        <div className="col-lg-5">
          <div className={styles.panel}>
            <h5 className="mb-3">Notification Settings</h5>
            <label className="form-label">
              Alert Radius for Nearby Posts: {profile.radiusKm || 0} km
            </label>
            <input
              type="range"
              className="form-range"
              min={0}
              max={20}
              value={profile.radiusKm || 0}
              onChange={(e) => setProfile({ radiusKm: Number(e.target.value) })}
            />
            <div className="form-check form-switch mt-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="pushSwitch"
                checked={!!profile.pushEnabled}
                onChange={(e) => setProfile({ pushEnabled: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="pushSwitch">
                Push Notifications
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="text-end mt-3">
        <button className="btn btn-success" disabled={loading} onClick={handleSave}>
          {loading ? "Saving..." : "Save changes"}
        </button>
      </div>
    </section>
  );
}
