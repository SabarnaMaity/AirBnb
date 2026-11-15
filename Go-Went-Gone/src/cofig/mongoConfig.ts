import mongoose from "mongoose";
import { config } from "./config";

export const connectDB = async () => {
  try {
    const uri = config.mongourl.toString().replace("w=majorit", "w=majority");
    await mongoose.connect(uri, {
      writeConcern: { w: "majority" },
    });
    console.log("DB Connect");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};
