const subscribers = new Set();

const sendSse = (res, event, payload) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const addAppointmentSubscriber = ({ id, role, authId, res }) => {
  const subscriber = { id, role, authId, res };
  subscribers.add(subscriber);
  return () => {
    subscribers.delete(subscriber);
  };
};

const publishAppointmentEvent = ({
  type,
  appointmentId,
  status,
  userId,
  doctorId,
}) => {
  for (const subscriber of subscribers) {
    const isTargetUser =
      subscriber.role === "user" && String(subscriber.authId) === String(userId);
    const isTargetDoctor =
      subscriber.role === "doctor" && String(subscriber.authId) === String(doctorId);
    if (!isTargetUser && !isTargetDoctor) continue;

    sendSse(subscriber.res, "appointment-update", {
      type,
      appointmentId,
      status,
      userId,
      doctorId,
      at: new Date().toISOString(),
    });
  }
};

module.exports = {
  addAppointmentSubscriber,
  publishAppointmentEvent,
  sendSse,
};
