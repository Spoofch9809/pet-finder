'use client';

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "../services/api";
import { AUTH_EVENT_NAME } from "../(shell)/Store";

export default function SignIn() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!identifier || !password) {
      setError("Please enter both email or username and password.");
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.login(identifier.trim(), password);
      if (typeof window !== "undefined") {
        localStorage.setItem("pfAuthToken", response.access_token);
        localStorage.setItem("pfAuthUser", JSON.stringify(response.user));
        window.dispatchEvent(new Event(AUTH_EVENT_NAME));
      }
      router.push("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to sign in right now.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="p-4 rounded-4 bg-white shadow-sm">
            <div className="text-center mb-3">
              <div className="fs-1">PF</div>
              <h4 className="fw-bold mb-0">Welcome Back</h4>
              <div className="text-muted small">Sign in to your account</div>
            </div>
            <form className="vstack gap-3" onSubmit={handleSubmit}>
              <input
                type="text"
                className="form-control"
                placeholder="Email or username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoComplete="username"
              />
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
              {error && (
                <div className="alert alert-danger small mb-0" role="alert">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
              <div className="small text-center">
                <Link href="/signup">Need an account? Sign Up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
