'use client';

export default function Home() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const apiBaseFront = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

  return (
    <main className="container mt-5">
      <h1 className="text-primary">This Page is for Frontend</h1>
      <h2 className="mb-4">Pet Finder</h2>
      <p>API base: {apiBase}</p>
      <p>API base (Frontend): {apiBaseFront}</p>
      <a
        href={`${apiBase}/docs`}
        target="_blank"
        rel="noreferrer"
        className="btn btn-success mt-3"
      >
        Open FastAPI docs
      </a>
    </main>
  );
}
