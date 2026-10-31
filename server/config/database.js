import mongoose from "mongoose";

export async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/queuecare";
  await mongoose.connect(mongoUri);
  console.log("QueueCare connected to MongoDB");
}
