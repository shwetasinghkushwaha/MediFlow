import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    patientName: { type: String, required: true, trim: true },
    patientPhone: { type: String, default: "" },
    reason: { type: String, default: "" },
    visitDate: { type: String, required: true, index: true },
    tokenNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ["waiting", "called", "in_progress", "completed", "skipped", "cancelled"],
      default: "waiting",
      index: true,
    },
    calledAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, visitDate: 1, tokenNumber: 1 }, { unique: true });

appointmentSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  const last = await mongoose.model("Appointment").findOne(
    { doctorId: this.doctorId, visitDate: this.visitDate },
    {},
    { sort: { tokenNumber: -1 } }
  );
  this.tokenNumber = last ? last.tokenNumber + 1 : 1;
  next();
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
