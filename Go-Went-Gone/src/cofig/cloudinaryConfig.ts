import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { config } from "./config";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
  secure: true,
});

export { cloudinary };

/**
 * Uploads a Buffer (from Multer memory storage) to Cloudinary
 */
export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string = "airbnb_stays"
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Uploads a Base64 data string, local file path, or remote URL to Cloudinary
 */
export const uploadFileOrUrlToCloudinary = async (
  fileOrUrl: string,
  folder: string = "airbnb_stays"
): Promise<UploadApiResponse> => {
  return await cloudinary.uploader.upload(fileOrUrl, {
    folder,
    resource_type: "auto",
  });
};

/**
 * Deletes an image from Cloudinary by its public ID
 */
export const deleteFromCloudinary = async (publicId: string) => {
  return await cloudinary.uploader.destroy(publicId);
};
