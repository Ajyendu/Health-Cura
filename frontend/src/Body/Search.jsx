import React, { useState, useEffect } from "react";

const Search = () => {
  const [input, setInput] = useState("");
  const [realDoctors, setRealDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch real doctors from your backend
  const bookAppointment = async (doctorId) => {
    try {
      const res = await fetch("/appointment/request", {
        method: "POST",
        credentials: "include", // 🔥 sends userToken cookie
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId,
          date: "2025-01-10",
          time: "10:30 AM",
          reason: "General Consultation",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to book appointment");
        return;
      }

      alert("✅ Appointment request sent!");
    } catch (err) {
      console.error(err);
      alert("❌ Server error");
    }
  };

  useEffect(() => {
    const fetchRealDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch("/doctor/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch doctors");
        }

        const data = await response.json();
        console.log("Fetched real doctors:", data);

        // Format real doctors with proper structure
        const formattedDoctors = data.map((doctor) => ({
          _id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization || "General Practitioner",
          experience: doctor.experience || "5+ years",
          location: doctor.location || "Various Locations",
          rating: doctor.rating || 4.5,
          reviews: doctor.reviews || 50,
          hospital: doctor.hospital || "Associated Hospital",
          contact: doctor.contact || doctor.email || "Contact via portal",
          availability: doctor.availability || "Mon-Fri, 9AM-5PM",
          isDemo: false,
          isReal: true,
          email: doctor.email,
        }));

        setRealDoctors(formattedDoctors);
        setError("");
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(
          "Could not load doctors from database. Showing demo data only."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRealDoctors();
  }, []);

  // Combine demo and real doctors

  const filteredResults = realDoctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(input.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(input.toLowerCase()) ||
      doctor.location.toLowerCase().includes(input.toLowerCase())
  );

  if (loading) {
    return (
      <div
        style={{
          marginTop: "50px",
          padding: "20px",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-block",
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #2c5aa0",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "20px",
            }}
          ></div>
          <p>Loading doctors...</p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: "50px",
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Search Header */}
      <div
        style={{ textAlign: "center", marginTop: "50px", marginBottom: "30px" }}
      >
        <h1 style={{ color: "#2c5aa0", marginBottom: "10px" }}>
          🔍 Find Doctors
        </h1>
        <p style={{ color: "#666", fontSize: "18px" }}>
          Search from {realDoctors.length} medical professionals
        </p>

        {error && (
          <div
            style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "6px",
              padding: "10px",
              margin: "10px auto",
              maxWidth: "500px",
              color: "#856404",
            }}
          >
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Search Input */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "30px",
        }}
      >
        <input
          type="text"
          value={input}
          placeholder="Search by name, specialization, or location..."
          onChange={(e) => setInput(e.target.value)}
          style={{
            padding: "15px 20px",
            borderRadius: "8px",
            border: "2px solid #ddd",
            width: "100%",
            maxWidth: "500px",
            fontSize: "16px",
            outline: "none",
            transition: "border-color 0.3s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#2c5aa0";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#ddd";
          }}
        />
      </div>

      {/* Results Count with Filter Info */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h3 style={{ color: "#333" }}>
          {filteredResults.length}{" "}
          {filteredResults.length === 1 ? "doctor" : "doctors"} found
          {input && ` for "${input}"`}
        </h3>
      </div>

      {/* Results Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredResults.map((doctor, index) => (
          <div
            key={index}
            style={{
              padding: "20px",
              border: "1px solid #e0e0e0",
              borderRadius: "12px",
              backgroundColor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
          >
            {/* Demo/Real Badge */}
            {doctor.isDemo ? (
              <span
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                Demo
              </span>
            ) : (
              <span
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                ✅ Registered
              </span>
            )}

            <h3
              style={{
                color: "#2c5aa0",
                marginBottom: "15px",
                fontSize: "20px",
                paddingRight: "60px",
              }}
            >
              {doctor.name}
            </h3>

            <div style={{ marginBottom: "15px" }}>
              <p style={{ margin: "5px 0", color: "#555" }}>
                <span style={{ fontWeight: "bold", color: "#333" }}>
                  Specialization:
                </span>{" "}
                {doctor.specialization}
              </p>
              <p style={{ margin: "5px 0", color: "#555" }}>
                <span style={{ fontWeight: "bold", color: "#333" }}>
                  Experience:
                </span>{" "}
                {doctor.experience}
              </p>
              <p style={{ margin: "5px 0", color: "#555" }}>
                <span style={{ fontWeight: "bold", color: "#333" }}>
                  Location:
                </span>{" "}
                {doctor.location}
              </p>
              <p style={{ margin: "5px 0", color: "#555" }}>
                <span style={{ fontWeight: "bold", color: "#333" }}>
                  Rating:
                </span>{" "}
                ⭐ {doctor.rating} ({doctor.reviews} reviews)
              </p>
            </div>

            <div style={{ borderTop: "1px solid #eee", paddingTop: "15px" }}>
              <p style={{ margin: "5px 0", color: "#555", fontSize: "14px" }}>
                <span style={{ fontWeight: "bold", color: "#333" }}>
                  Hospital:
                </span>{" "}
                {doctor.hospital}
              </p>
              <p style={{ margin: "5px 0", color: "#555", fontSize: "14px" }}>
                <span style={{ fontWeight: "bold", color: "#333" }}>
                  Contact:
                </span>{" "}
                {doctor.contact}
              </p>
              <p style={{ margin: "5px 0", color: "#555", fontSize: "14px" }}>
                <span style={{ fontWeight: "bold", color: "#333" }}>
                  Availability:
                </span>{" "}
                {doctor.availability}
              </p>

              {doctor.isReal && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "6px",
                  }}
                >
                  <button
                    onClick={() => bookAppointment(doctor._id)}
                    style={{
                      backgroundColor: "#C62828",
                      color: "white",
                      padding: "12px 26px",
                      fontSize: "16px",
                      fontWeight: "600",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      boxShadow: "0 6px 14px rgba(198, 40, 40, 0.35)",
                    }}
                  >
                    Book Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No results message */}
      {filteredResults.length === 0 && input && (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          <p style={{ fontSize: "18px", marginBottom: "10px" }}>
            No doctors found matching "{input}"
          </p>
          <p>Try searching with different keywords or browse all doctors</p>
        </div>
      )}

      {/* Empty state */}
      {filteredResults.length === 0 && !input && (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          <p style={{ fontSize: "18px" }}>Start typing to search for doctors</p>
          <p>You can search by name, specialization, or location</p>
        </div>
      )}
    </div>
  );
};

export default Search;
