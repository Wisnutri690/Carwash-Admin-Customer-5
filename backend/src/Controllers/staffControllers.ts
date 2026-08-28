import { Request, Response } from "express";
import *as staffLayers from '../Services/staffLayers';
import { success } from "zod";

export const getAllStaff = async ( req: Request, res:Response ): Promise<void> => {
    try {
        const staff = await staffLayers.getAllStaff();

        res.status(200).json({
            success: true,
            message: 'Berhasil menampilkan semua Staff',
            data: staff,
        });

    } catch (error) {
        res.status(200).json({
            success: false,
            message: 'Internal Server Error!',
        });
    }
}; 

export const updateStaffStatus = async ( req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const staff = await staffLayers.updateStaffStatus(
        id,
        req.body
        );

        res.status(200).json({
        success: true,
        message: "Status Staff berhasil diperbaharui",
        data: staff,
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: "Internal Server Error",
        });
    }
};