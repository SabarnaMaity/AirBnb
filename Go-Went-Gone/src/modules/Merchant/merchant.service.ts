import { Document, Types } from "mongoose";
import { BaseService } from "../../Base/Base_Class/Base.service";
import { Property, PropertyModel } from "./merchant.model";
import { Room, RoomModel } from "./room.model";
import { ApiResponse } from "../../Base/Base_Class/response";
import { uploadFileOrUrlToCloudinary } from "../../cofig/cloudinaryConfig";

export class propertyServics extends BaseService<Property> {
    constructor() {
        super(PropertyModel)
    }
}

export class roomServics extends BaseService<Room> {
    constructor() {
        super(RoomModel)
    }

    async handleCreateRoom(data: Partial<Room>) {
        if (!data.property) {
            console.log(data)
            throw new Error("Property ID is required");
        }
        if (!Types.ObjectId.isValid(data.property.toString())) {
            throw new Error("Invalid Property ID");
        }

        try {
            // Process and upload any base64 images to Cloudinary
            if (data.images && Array.isArray(data.images)) {
                const processedImages: string[] = [];
                for (const img of data.images) {
                    if (img && typeof img === "string" && img.startsWith("data:image/")) {
                        try {
                            const cldRes = await uploadFileOrUrlToCloudinary(img, "airbnb_rooms");
                            processedImages.push(cldRes.secure_url);
                        } catch (cldErr) {
                            console.error("Cloudinary upload failed for room image:", cldErr);
                            processedImages.push(img);
                        }
                    } else if (img) {
                        processedImages.push(img);
                    }
                }
                data.images = processedImages;
            }

            const createRoom = await this.model.create(data);
            const updatedProperty = await PropertyModel.findByIdAndUpdate(
                data.property,
                { $push: { rooms: createRoom._id } },
                { new: true }
            );

            if (!updatedProperty) {
                throw new Error("Property not found");
            }
            return createRoom;
        } catch (error: any) {
            console.error("Error creating room:", error.message || error);
            throw error; 
        }
    }

    async addImage(data: { roomId?: string; images?: string[] } | any) {
        try {
            const id = data.roomId;
            const imagesToPush: string[] = [];
            if (data.images && Array.isArray(data.images)) {
                for (const img of data.images) {
                    if (img && typeof img === "string" && img.startsWith("data:image/")) {
                        try {
                            const cldRes = await uploadFileOrUrlToCloudinary(img, "airbnb_rooms");
                            imagesToPush.push(cldRes.secure_url);
                        } catch (cldErr) {
                            console.error("Cloudinary upload failed:", cldErr);
                            imagesToPush.push(img);
                        }
                    } else if (img) {
                        imagesToPush.push(img);
                    }
                }
            }
            const res = await RoomModel.findByIdAndUpdate(
                id,
                { $push: { images: { $each: imagesToPush } } },
                { new: true }
            );
            return res;
        } catch (error: any) {
            console.error("Error adding images to room:", error);
            throw error;
        }
    }
}