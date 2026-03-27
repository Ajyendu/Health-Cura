function Help() {
  return (
    <div className="app-page">
      <section className="rounded-4 border bg-white p-4">
        <h3 className="mb-2">Help & Support</h3>
        <p className="text-muted mb-3">
          Need assistance with booking, profile updates, or records upload? We are here to help.
        </p>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="rounded-4 border p-3 h-100">
              <h6>Booking support</h6>
              <p className="mb-0 text-muted">Find slots, reschedule visits, or cancel appointments.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="rounded-4 border p-3 h-100">
              <h6>Account support</h6>
              <p className="mb-0 text-muted">Login, password, role access, and profile management help.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="rounded-4 border p-3 h-100">
              <h6>Records support</h6>
              <p className="mb-0 text-muted">Upload issues, file format questions, and report downloads.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Help;
