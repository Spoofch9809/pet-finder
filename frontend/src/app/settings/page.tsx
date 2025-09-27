"use client";
import styles from "../(shell)/Shell.module.css";
import { useStore } from "../(shell)/Store";

export default function Settings(){
  const { profile, setProfile } = useStore();
  return (
    <section className="p-3">
      <div className="row g-3">
        <div className="col-lg-7">
          <div className={styles.panel}>
            <h5 className="mb-3">Profile Information</h5>
            <div className="row g-3 align-items-center">
              <div className="col-auto"><img src="https://i.pravatar.cc/100?img=32" className={`border ${styles.avatar}`} alt="avatar"/></div>
              <div className="col-md-5"><label className="form-label">Full Name</label><input className="form-control" value={profile.fullName || ""} onChange={e=>setProfile({ fullName: e.target.value })}/></div>
              <div className="col-md-5"><label className="form-label">Email</label><input type="email" className="form-control" value={profile.email || ""} onChange={e=>setProfile({ email: e.target.value })}/></div>
              <div className="col-md-5"><label className="form-label">City</label><input className="form-control" value={profile.city || ""} onChange={e=>setProfile({ city: e.target.value })}/></div>
              <div className="col-md-5"><label className="form-label">Phone Number</label><input className="form-control" value={profile.phone || ""} onChange={e=>setProfile({ phone: e.target.value })}/></div>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className={styles.panel}>
            <h5 className="mb-3">Notification Setting</h5>
            <label className="form-label">Alert Radius for Nearby Posts: {profile.radiusKm || 0} km</label>
            <input type="range" className="form-range" min={1} max={15} value={profile.radiusKm || 5} onChange={(e)=> setProfile({ radiusKm: Number(e.target.value) }) }/>
            <div className="form-check form-switch mt-3">
              <input className="form-check-input" type="checkbox" id="pushSwitch" checked={!!profile.pushEnabled} onChange={(e)=> setProfile({ pushEnabled: e.target.checked }) }/>
              <label className="form-check-label" htmlFor="pushSwitch">Push Notifications</label>
            </div>
          </div>
        </div>
      </div>
      <div className="text-end mt-3"><button className="btn btn-success" onClick={()=> alert("Profile saved (mock)")}>Save changes</button></div>
    </section>
  );
}