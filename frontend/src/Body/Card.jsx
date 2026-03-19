const Card = ({ doctor }) => {
  return (
    <div
      className="outercard"
      style={{
        padding: "10px",
        margin: "10px",
        width: "280px",
        border: "1px solid #000",
        borderRadius: "8px",
      }}
    >
      <h3>{doctor.name}</h3>
      <p>
        <b>Specialization:</b> {doctor.specialization}
      </p>
      <p>
        <b>Experience:</b> {doctor.experience}
      </p>
      <p>
        <b>Location:</b> {doctor.location}
      </p>
      <p>
        <b>Rating:</b> {doctor.rating}
      </p>
      <p>
        <b>Reviews:</b> {doctor.reviews}
      </p>
      <p>
        <b>Hospital:</b> {doctor.hospital}
      </p>
      <p>
        <b>Contact:</b> {doctor.contact}
      </p>
      <p>
        <b>Availability:</b> {doctor.availability}
      </p>
    </div>
  );
};

export default Card;
