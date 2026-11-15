import type { Application } from "express";
import { userRoutes } from "./User/user.router";
import { MerchnatRouter } from "./Merchant/merchant.router";
import { uploadRouter } from "./Upload/upload.router";

export default function initializeModules(app: Application): void {
  app.use("/api/user", userRoutes);
  app.use("/api/merchant", MerchnatRouter);
  app.use("/api/upload", uploadRouter);
}
