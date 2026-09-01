import { Request, Response } from "express";
import { AuthRequest } from "../Middlewares/authMiddlewares";
import * as paymentLayers from '../Services/paymentLayers';

export const createSnapPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user!.id;
    const orderId = Number(req.params.id);
    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        message: "ID Pesanan tidak valid",
      });
      return;
    }
    const result = await paymentLayers.createSnapTransaction(orderId, customerId);
    res.status(200).json({
      success: true,
      message: "Snap token pembayaran berhasil dibuat",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Gagal membuat transaksi pembayaran",
    });
  }
};

export const handleMidtransNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("[MIDTRANS WEBHOOK RECEIVED]:", req.body);

    const result = await paymentLayers.handleMidtransNotification(req.body);

    console.log("[MIDTRANS PROCESSED SUCCESSFULLY]:", result?.id);

    res.status(200).json({
      success: true,
      message: "Notifikasi Midtrans berhasil diproses",
      data: result,
    });
  } catch (error: any) {
    console.error("[MIDTRANS WEBHOOK ERROR]:", error.message);

    res.status(400).json({
      success: false,
      message: error.message || "Gagal memproses notifikasi Midtrans",
    });
  }
};
