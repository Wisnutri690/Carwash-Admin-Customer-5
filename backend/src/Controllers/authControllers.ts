import { Request, Response } from "express";
import *as authlayers from '../Services/authlayers';

export const login = async (req: Request, res: Response): Promise <void> => {
    try {
        const {email, password} = req.body;

        const result = await authlayers.login(req.body);

        res.status(200).json({
            success: true, 
            message: 'Login berhasil',
            data: result
        });
        
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};