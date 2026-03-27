const isNonEmpty = (value) => typeof value === "string" && value.trim().length > 0;

const hasValidLocation = (doctor) => {
  const lat = Number(doctor?.location?.coordinates?.[1]);
  const lng = Number(doctor?.location?.coordinates?.[0]);
  return Number.isFinite(lat) && Number.isFinite(lng);
};

const hasValidSlots = (doctor) =>
  Array.isArray(doctor?.availabilityWeekly) &&
  doctor.availabilityWeekly.length > 0 &&
  doctor.availabilityWeekly.every((slot) => {
    const day = Number(slot?.dayOfWeek);
    const start = String(slot?.start || "");
    const end = String(slot?.end || "");
    const capacity = Number(slot?.capacity);
    return (
      Number.isInteger(day) &&
      day >= 0 &&
      day <= 6 &&
      /^\d{2}:\d{2}$/.test(start) &&
      /^\d{2}:\d{2}$/.test(end) &&
      start < end &&
      Number.isInteger(capacity) &&
      capacity > 0
    );
  });

const getDoctorBookingReadiness = (doctor) => {
  const missing = [];

  if (!isNonEmpty(doctor?.specialization)) missing.push("specialization");
  if (!isNonEmpty(doctor?.qualifications)) missing.push("qualifications");
  if (!isNonEmpty(doctor?.licenseNumber)) missing.push("license number");
  if (!(Number.isFinite(Number(doctor?.consultationFee)) && Number(doctor?.consultationFee) >= 0)) {
    missing.push("consultation fee");
  }
  if (!hasValidLocation(doctor)) missing.push("clinic location");
  if (!hasValidSlots(doctor)) missing.push("slot windows with capacity");
  if (!doctor?.verified) missing.push("team verification");

  return {
    bookable: missing.length === 0,
    missing,
  };
};

module.exports = { getDoctorBookingReadiness };
