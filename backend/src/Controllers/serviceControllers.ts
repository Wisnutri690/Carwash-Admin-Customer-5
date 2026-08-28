import { Request, Response } from "express";
import *as servicesLayers from '../Services/servicesLayers';

export const getAllServices = async ( req: Request, res: Response ): Promise<void> => {
    try {
        const services = await servicesLayers.getAllServices();

        res.status(200).json({
            success:true,
            message: "Berhasil ambil data Services",
            data: services,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        });
    }
};

export const getServicesById = async ( req: Request, res: Response ): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const service = await servicesLayers.getServicesById(id);

        if (!service) {
            res.status(404).json({
                success: false,
                message: 'Service tidak ditemukan'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: service,
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'internal Server Error!'
        });
    }
};

    export const createServices = async ( req: Request, res: Response ): Promise<void> => {
        try {
            const service = await servicesLayers.createServices(req.body);

            res.status(201).json({
                success: true,
                message: 'Service berhasil ditambahkan',
                data: service, 
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal Server Error!',
            });
        }
    };

    export const updateServices = async ( req: Request, res: Response ): Promise<void> => {
        try {
            const id = Number (req.params.id)
            const service = await servicesLayers.updateServices(id, req.body);

            res.status(200).json({
                success: true,
                message: 'Service berhasil diperbaharui',
                data: service,
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal Server Error!',
            });
        }
    };

    export const deleteServices = async ( req: Request, res: Response ): Promise<void> => {
        try {
            const id = Number (req.params.id)
            const service = await servicesLayers.deleteServices(id);

            res.status(200).json({
                success: true,
                message: 'Service berhasil didelete'
            });

        } catch (error) {
            res.status(500).json({
                success:false,
                message: 'Internal Server Error!',
            });
            
        }
    };