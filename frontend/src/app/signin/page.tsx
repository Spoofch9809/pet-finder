export default function SignIn() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="p-4 rounded-4 bg-white shadow-sm">
            <div className="text-center mb-3">
              <div className="fs-1">🐾</div>
              <h4 className="fw-bold mb-0">Welcome Back</h4>
              <div className="text-muted small">Sign in to your account</div>
            </div>
            <div className="vstack gap-2">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
              />
              <input
                type="password"
                className="form-control"
                placeholder="Password"
              />
              <button className="btn btn-primary">Sign In</button>
              <div className="small text-center">
                <a href="#">Sign Up</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
