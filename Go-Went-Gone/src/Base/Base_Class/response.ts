import { Response } from "express";

export class ApiResponse {
    static success(res: Response, message: any, data?: any, statusCode: number = 200) {
        let msg = "Success";
        let resData = data;
        if (typeof message === "string") {
            msg = message;
        } else if (data === undefined) {
            resData = message;
        }
        return res.status(statusCode).json({
            success: true,
            message: msg,
            data: resData,
            timestamp: new Date().toISOString()
        });
    }

    static error(res: Response, message: string, statusCode: number = 500, error?: any) {
        return res.status(statusCode).json({
            success: false,
            message,
            error:  error ,
            timestamp: new Date().toISOString()
        });
    }
}