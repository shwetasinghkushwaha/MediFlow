import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    room: { type: String, default: "" },
    avgConsultMinutes: { type: Number, default: 10, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
