import { STATUS_LABEL } from "../lib/queue.js";

export default function StatusPill({ status }) {
  const classes = {
    waiting: "status-waiting",
    called: "status-called",
    in_progress: "status-inprogress",
    completed: "status-completed",
    skipped: "status-skipped",
    cancelled: "status-cancelled",
  };
  return <span className={`pill ${classes[status] || "status-waiting"}`}>{STATUS_LABEL[status]}</span>;
}
