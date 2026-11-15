import { Router } from "express";
import { UploadController } from "./upload.controller";
import { upload } from "../../middleware/multer";

const router = Router();
const controller = new UploadController();

// Single image upload (accepts multipart 'image' or 'file', or JSON { image })
router.post(
  "/",
  upload.single("image"),
  controller.handleSingleUpload.bind(controller)
);

// Multiple images upload (accepts multipart 'images', up to 10 files, or JSON { images: [...] })
router.post(
  "/multiple",
  upload.array("images", 10),
  controller.handleMultipleUpload.bind(controller)
);

export const uploadRouter = router;
