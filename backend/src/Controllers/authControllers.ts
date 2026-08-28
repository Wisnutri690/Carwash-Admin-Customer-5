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

export const customerLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authlayers.customerLogin(req.body);

    if (!result.exists) {
      res.status(200).json({
        success: true,
        exists: false,
        message: result.message,
      });
      return;
    }

    res.status(200).json({
      success: true,
      exists: true,
      message: "Login customer berhasil",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Terjadi kesalahan saat login customer",
    });
  }
};

export const customerRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authlayers.customerRegister(req.body);

    res.status(201).json({
      success: true,
      message: "Registrasi customer berhasil",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Terjadi kesalahan saat registrasi customer",
    });
  }
};
