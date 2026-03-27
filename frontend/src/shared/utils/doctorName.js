export const withDrPrefix = (name) => {
  const trimmed = String(name || "Doctor").trim();
  if (!trimmed) return "Dr. Doctor";
  if (/^dr\.?\s/i.test(trimmed)) {
    return trimmed.replace(/^dr\.?\s*/i, "Dr. ");
  }
  return `Dr. ${trimmed}`;
};
