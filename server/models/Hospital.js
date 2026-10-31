import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { timestamps: true }
);

const Hospital = mongoose.model("Hospital", hospitalSchema);
export default Hospital;
