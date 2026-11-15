import * as dotenv from "dotenv";
dotenv.config();

interface Config {
  port: number | string;
  mongourl: string;
  cloudinary: {
    cloud_name: string;
    api_key: string;
    api_secret: string;
  };
}

const rawUri = process.env.MONGO_URI || "NA";
const sanitizedUri = rawUri.replace("w=majorit", "w=majority");

export const config: Config = {
  port: process.env.PORT || 3000,
  mongourl: sanitizedUri,
  cloudinary: {
    cloud_name: process.env.cloud_name || process.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.api_key || process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.api_secret || process.env.CLOUDINARY_API_SECRET || "",
  },
};
