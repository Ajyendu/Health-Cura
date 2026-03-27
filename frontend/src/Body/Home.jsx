import { Link } from "react-router-dom";

function Home() {
  const highlights = [
    "Discover doctors by specialization and distance",
    "Book slots for self or family profiles",
    "Manage appointments and medical records in one dashboard",
  ];

  const specialties = [
    "General Physician",
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Neurology",
    "Orthopedics",
  ];

  return (
    <div className="app-page">
      <section className="p-4 p-md-5 rounded-4 border bg-white mb-3">
        <h1 className="display-6 fw-bold mb-2">Healthcare booking made simple</h1>
        <p className="text-muted mb-3">
          A complete patient and doctor platform for search, booking, profile and records.
        </p>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/search" className="btn btn-primary">
            Find Doctors
          </Link>
          <Link to="/appointments" className="btn btn-outline-primary">
            My Appointments
          </Link>
        </div>
      </section>

      <section className="row g-3 mb-3">
        {highlights.map((item) => (
          <div className="col-md-4" key={item}>
            <div className="h-100 rounded-4 border bg-white p-3">
              <p className="mb-0">{item}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-4 border bg-white p-3 p-md-4">
        <h5 className="mb-3">Popular specialties</h5>
        <div className="d-flex flex-wrap gap-2">
          {specialties.map((item) => (
            <span key={item} className="badge text-bg-light border px-3 py-2">
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
