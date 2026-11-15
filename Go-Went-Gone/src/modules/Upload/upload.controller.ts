import { Request, Response } from "express";
import { uploadBufferToCloudinary, uploadFileOrUrlToCloudinary } from "../../cofig/cloudinaryConfig";
import { ApiResponse } from "../../Base/Base_Class/response";

export class UploadController {
  // Single image upload (file or base64/url)
  async handleSingleUpload(req: Request, res: Response) {
    try {
      const folder = (req.body?.folder as string) || "airbnb_stays";

      // Case 1: Multer uploaded file buffer
      if (req.file) {
        const result = await uploadBufferToCloudinary(req.file.buffer, folder);
        return ApiResponse.success(
          res,
          "Image uploaded successfully to Cloudinary",
          {
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
          },
          201
        );
      }

      // Case 2: Base64 data string or external URL in request body
      const imagePayload = req.body?.image || req.body?.url;
      if (imagePayload && typeof imagePayload === "string") {
        const result = await uploadFileOrUrlToCloudinary(imagePayload, folder);
        return ApiResponse.success(
          res,
          "Image uploaded successfully to Cloudinary",
          {
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
          },
          201
        );
      }

      return ApiResponse.error(res, "No image file or image string provided", 400);
    } catch (error: any) {
      console.error("Cloudinary single upload error:", error);
      return ApiResponse.error(res, "Failed to upload image to Cloudinary", 500, error.message);
    }
  }

  // Multiple images upload
  async handleMultipleUpload(req: Request, res: Response) {
    try {
      const folder = (req.body?.folder as string) || "airbnb_stays";
      const uploadedResults: any[] = [];

      // Case 1: Multer files
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const uploadPromises = (req.files as Express.Multer.File[]).map((file) =>
          uploadBufferToCloudinary(file.buffer, folder)
        );
        const results = await Promise.all(uploadPromises);
        results.forEach((res) => {
          uploadedResults.push({
            url: res.secure_url,
            public_id: res.public_id,
            format: res.format,
          });
        });
      }

      // Case 2: Array of base64/URLs in body
      else if (req.body?.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
        const uploadPromises = req.body.images.map((img: string) =>
          uploadFileOrUrlToCloudinary(img, folder)
        );
        const results = await Promise.all(uploadPromises);
        results.forEach((res) => {
          uploadedResults.push({
            url: res.secure_url,
            public_id: res.public_id,
            format: res.format,
          });
        });
      } else {
        return ApiResponse.error(res, "No image files provided for multiple upload", 400);
      }

      return ApiResponse.success(
        res,
        `Successfully uploaded ${uploadedResults.length} images to Cloudinary`,
        uploadedResults,
        201
      );
    } catch (error: any) {
      console.error("Cloudinary multiple upload error:", error);
      return ApiResponse.error(res, "Failed to upload multiple images", 500, error.message);
    }
  }
}
