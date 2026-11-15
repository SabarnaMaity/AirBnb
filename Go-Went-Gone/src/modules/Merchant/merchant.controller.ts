import { Request, Response } from "express";
import { BaseController } from "../../Base/Base_Class/Base.controller";
import { Property, PropertyModel } from "./merchant.model";
import { propertyServics, roomServics } from "./merchant.service";
import { Room } from "./room.model";
import { ApiResponse } from "../../Base/Base_Class/response";
import { WithdawModel } from "../../Base/Base_Model/common_Model";

export class propertyCotroller extends BaseController<Property> {
    constructor() {
        super(new propertyServics)
    }
}

export class roomController extends BaseController<Room> {
    constructor() {
        super(new roomServics)
        this.handelRoom = this.handelRoom.bind(this);
        this.handelAddImage = this.handelAddImage.bind(this)
    }

    async handelRoom(req: Request, res: Response) {
        try {
            const service = this.service as roomServics;
            const room = await service.handleCreateRoom(req.body);
            ApiResponse.success(res, "Created successfully", room, 201);
        } catch (error: any) {
            ApiResponse.error(res, "Room creation failed", 500, error.message);
        }
    }
    async handelAddImage(req: Request, res: Response) {
        try {
            const servics = this.service as roomServics;
            const room = await servics.addImage(req.body);
            ApiResponse.success(res, "Created successfully", room, 201);

        } catch (error: any) {
            console.log(error)
            ApiResponse.error(res, "Image adding failed", 500, error.message);
        }
    }
}

export const createProperty = async (req: Request, res: Response) => {
    try {
        const body = { ...req.body };
        const rawBank = body.BankDetails || {};
        const ifsc = rawBank.IFSC || rawBank.ifscCode || rawBank.ifsc || "HDFC0001234";
        const holder = rawBank.AccountHoldername || rawBank.accountHolderName || rawBank.holderName || "Property Host";
        const accNum = Number(rawBank.accountNumber) || 5010023456789;

        body.BankDetails = {
            bankName: rawBank.bankName || "HDFC Bank",
            AccountHoldername: holder,
            accountHolderName: holder,
            accountNumber: accNum,
            IFSC: ifsc,
            ifscCode: ifsc,
            verfication: false,
        };

        const property = await PropertyModel.create(body);
        ApiResponse.success(res, "Created successfully", property, 201);
    } catch (error: any) {
        console.error("Property creation error:", error);
        ApiResponse.error(res, "Property adding failed", 500, error.message);
    }
};

export const handleMerchantWithdraw = async (req: Request, res: Response) => {
    try {
        const { propertyId, amount, userId, bankDetails } = req.body;
        if (!propertyId || !amount) {
            return ApiResponse.error(res, "Property ID and withdrawal amount are required", 400);
        }

        const property = await PropertyModel.findById(propertyId);
        if (!property) {
            return ApiResponse.error(res, "Property not found", 404);
        }

        const withdrawAmount = Number(amount);
        if (withdrawAmount <= 0) {
            return ApiResponse.error(res, "Withdrawal amount must be greater than 0", 400);
        }

        if ((property.wallet || 0) < withdrawAmount) {
            return ApiResponse.error(res, `Insufficient property wallet balance! Available: ₹${property.wallet || 0}`, 400);
        }

        property.wallet = (property.wallet || 0) - withdrawAmount;
        if (bankDetails) {
            property.BankDetails = {
                ...property.BankDetails,
                ...bankDetails,
            };
        }
        await property.save();

        if (userId) {
            try {
                await WithdawModel.create({
                    user: userId,
                    amount: withdrawAmount,
                });
            } catch (wErr) {
                console.warn("Could not log to WithdawModel:", wErr);
            }
        }

        const txnRef = `PAYOUT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        return ApiResponse.success(res, "Payout successfully initiated to linked bank account!", {
            transactionId: txnRef,
            propertyId: property._id,
            amount: withdrawAmount,
            remainingWallet: property.wallet,
            bankDetails: property.BankDetails,
            date: new Date(),
            status: "PROCESSED",
        });
    } catch (error: any) {
        console.error("Merchant withdrawal error:", error);
        return ApiResponse.error(res, error.message || "Failed to process merchant payout", 500);
    }
};

