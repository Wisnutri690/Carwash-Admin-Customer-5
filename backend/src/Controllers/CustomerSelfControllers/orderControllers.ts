import { Response } from "express";
import { AuthRequest } from "../../Middlewares/authMiddlewares";
import * as orderLayers from "../../Services/CustomerSelfService/orderLayers";

export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user!.id;
    const order = await orderLayers.createCustomerOrder(customerId, req.body);

    res.status(201).json({
      success: true,
      message: "Pesanan cuci berhasil dibuat dan masuk ke antrean",
      data: order,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Gagal membuat pesanan",
    });
  }
};

export const getMyActiveOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user!.id;
    const orders = await orderLayers.getMyActiveOrders(customerId);

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil antrean aktif",
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getMyOrderHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user!.id;
    const history = await orderLayers.getMyOrderHistory(customerId);

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil riwayat pesanan",
      data: history,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const cancelMyOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user!.id;
    const orderId = Number(req.params.id);

    const order = await orderLayers.cancelMyOrder(customerId, orderId);

    res.status(200).json({
      success: true,
      message: "Pesanan berhasil dibatalkan",
      data: order,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Gagal membatalkan pesanan",
    });
  }
};
