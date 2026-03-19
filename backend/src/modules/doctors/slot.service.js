const Appointment = require("../appointments/appointment.model");

const toDate = (date, time) => {
  const [hh, mm] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);
  return d;
};

const formatTime = (date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;

const generateDoctorSlots = async (doctor, date) => {
  const requestDate = new Date(date);
  if (Number.isNaN(requestDate.getTime())) {
    return [];
  }

  const day = requestDate.getDay();
  const windows = doctor.availabilityWeekly.filter((slot) => slot.dayOfWeek === day);
  if (!windows.length) {
    return [];
  }

  const booked = await Appointment.find({
    doctorId: doctor._id,
    startAt: {
      $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
    },
    status: { $in: ["upcoming", "rescheduled"] },
  })
    .select("startAt")
    .lean();

  const bookedSet = new Set(booked.map((item) => new Date(item.startAt).toISOString()));
  const slots = [];

  windows.forEach((window) => {
    const start = toDate(date, window.start);
    const end = toDate(date, window.end);
    const step = doctor.slotDurationMinutes * 60 * 1000;

    for (let t = start.getTime(); t + step <= end.getTime(); t += step) {
      const slotStart = new Date(t);
      const slotEnd = new Date(t + step);
      slots.push({
        startAt: slotStart.toISOString(),
        endAt: slotEnd.toISOString(),
        label: `${formatTime(slotStart)} - ${formatTime(slotEnd)}`,
        isAvailable: !bookedSet.has(slotStart.toISOString()),
      });
    }
  });

  return slots;
};

module.exports = { generateDoctorSlots };
