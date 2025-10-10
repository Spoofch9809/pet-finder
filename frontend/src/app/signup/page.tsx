'use client';

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "../services/api";
import { AUTH_EVENT_NAME } from "../(shell)/Store";

type FormState = {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
};

const initialState: FormState = {
  username: "",
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
};

export default function SignUp() {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.username || !form.firstname || !form.lastname || !form.password) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const phoneValue = form.phone.trim();
    if (phoneValue && Number.isNaN(Number(phoneValue))) {
      setError("Phone number must contain digits only.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: form.username.trim(),
        password: form.password,
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        email: form.email.trim() || undefined,
        phone: phoneValue ? Number(phoneValue) : undefined,
        address: form.address.trim() || undefined,
      };

      const response = await authAPI.signup(payload);

      if (typeof window !== "undefined") {
        localStorage.setItem("pfAuthToken", response.access_token);
        localStorage.setItem("pfAuthUser", JSON.stringify(response.user));
        window.dispatchEvent(new Event(AUTH_EVENT_NAME));
      }

      router.push("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create your account right now.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="p-4 rounded-4 bg-white shadow-sm">
            <div className="text-center mb-3">
              <div className="fs-1">PF</div>
              <h4 className="fw-bold mb-0">Create Your Account</h4>
              <div className="text-muted small">Join Pet Finder to track and share updates about your pets.</div>
            </div>
            <form className="vstack gap-3" onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small text-muted">Username *</label>
                  <input
                    className="form-control"
                    value={form.username}
                    onChange={handleChange("username")}
                    autoComplete="username"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange("email")}
                    autoComplete="email"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted">First name *</label>
                  <input
                    className="form-control"
                    value={form.firstname}
                    onChange={handleChange("firstname")}
                    autoComplete="given-name"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted">Last name *</label>
                  <input
                    className="form-control"
                    value={form.lastname}
                    onChange={handleChange("lastname")}
                    autoComplete="family-name"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={form.phone}
                    onChange={handleChange("phone")}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted">Address</label>
                  <textarea
                    className="form-control"
                    rows={1}
                    value={form.address}
                    onChange={handleChange("address")}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted">Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange("password")}
                    autoComplete="new-password"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted">Confirm password *</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              {error && (
                <div className="alert alert-danger small mb-0" role="alert">
                  {error}
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
              <div className="small text-center">
                Already a member? <Link href="/signin">Sign in here</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
