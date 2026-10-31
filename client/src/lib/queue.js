export const ACTIVE_STATUSES = ["waiting", "called", "in_progress"];

export const STATUS_LABEL = {
  waiting: "Waiting",
  called: "Called",
  in_progress: "In consultation",
  completed: "Completed",
  skipped: "Skipped",
  cancelled: "Cancelled",
};

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function queuePosition(queue, appointmentId) {
  const active = queue
    .filter((a) => ACTIVE_STATUSES.includes(a.status))
    .sort((a, b) => a.tokenNumber - b.tokenNumber);
  return active.findIndex((a) => a._id === appointmentId || a.id === appointmentId) + 1;
}

export function peopleAhead(queue, appointmentId) {
  const pos = queuePosition(queue, appointmentId);
  return Math.max(0, pos - 1);
}

export function estimatedWaitMinutes(position, avgConsultMinutes) {
  if (position <= 0) return 0;
  return Math.max(0, (position - 1) * (avgConsultMinutes || 10));
}

export function formatMinutes(minutes) {
  if (minutes <= 0) return "Now";
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `~${h} hr` : `~${h} hr ${m} min`;
}
