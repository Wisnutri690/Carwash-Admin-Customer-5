import { Request, Response } from "express";
import *as vehicleLayers from '../Services/vehicleLayers';


export const getAllVehicles = async ( req: Request, res: Response ): Promise <void> => {
    try {
        const vehicles = await vehicleLayers.getAllVehicles();

        res.status(200).json({
            success: true,
            message: 'Berhasil ambil data vehicle',
            data: vehicles
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
};

export const getVehicleById = async ( req: Request, res: Response ): Promise <void> => {
    try {
        const id = Number ( req.params.id );
        const vehicle = await vehicleLayers.getVehicleById(id);

        if (!vehicle) {
        res.status(404).json({
            succes: false,
            message: 'Vehicle tidak ditemukan!'
        });
        return;
    }
        res.status(200).json({
            success:true,
            data:vehicle
        });

    } catch (error) {
        res.status(500).json({
            success:false,
            message: 'Internal Server Error'
        });
    }
};

export const createVehicle = async ( req: Request, res: Response ): Promise <void> => {
    try {
        const vehicle = await vehicleLayers.createVehicle(req.body);

        res.status(201).json({
            success: true,
            message: 'Vehicle berhasil ditambahkan',
            data: vehicle
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
};

export const updateVehicle = async ( req: Request, res: Response ): Promise <void> => {
    try {
        const id = Number (req.params.id);
        const vehicle = await vehicleLayers.updateVehicle(id, req.body);

        res.status(200).json({
        success: true,
        message: 'Vehicle berhasil diupdate',
        data: vehicle
    });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

export const deleteVehicle = async ( req: Request, res: Response ): Promise <void> => {
    try {
        const id = Number(req.params.id);
        const vehicle = await vehicleLayers.deleteVehicle(id);

        res.status(200).json({
            success: true,
            message: 'Vehicle berhasil didelete'
        });

    } catch (error) {
        res.status(500).json({
            succes: true,
            message: 'Internal Server Error!'
        });
    }
};