import { Request, Response } from "express";
import * as orderLayers from "../Services/orderLayers";
import { AuthRequest } from "../Middlewares/authMiddlewares";

export const getAllOrders = async ( req: Request, res: Response ): Promise<void> => {
  try {

    const order = await orderLayers.getAllOrders();

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil semua order",
      data: order,
    });

  } catch (error: any) {

    res.status(500).json({
      success: false,
      message: 'Internal Server Error!'
    });

  }
};

  export const getOrderById = async (req: Request, res: Response ): Promise<void> => {
    try {
      
      const id = Number(req.params.id);
      const order = await orderLayers.getOrderById(id);

      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil Order',
        data: order,
      });

    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  };

  export const createOrder = async (req: AuthRequest, res: Response ): Promise<void> => {
    try {
      
      const order = await orderLayers.createOrder(req.body, req.admin!.id);

      res.status(201).json({
        success: true,
        message: 'Order berhasil dibuat',
        data: order,
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    try {

      const id = Number(req.params.id);
      const data = { ...req.body, completedAt: req.body.completedAt? new Date(req.body.completedAt): undefined}
      const order = await orderLayers.updateOrder(id, data);

      res.status(200).json({
        success: true,
        message: 'Order berhasil diperbaharui',
        data: order,
      });

    } catch (error: any) {
      res.status(400).json({
        success:false,
        message: error.message,
      });
    }  
  };

  export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      
      const id = Number(req.params.id);
      await orderLayers.deleteOrder(id);

      res.status(200).json({
        success: true,
        message: 'Order berhasil dihapus',        
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });    
    }
  };

  export const payOrder = async ( req: Request, res: Response ): Promise<void> => {
    try {

      const id = Number (req.params.id);

      const order = await orderLayers.payOrder(id, req.body);

      res.status(200).json({
        success: true,
        message: "Pembayaran berhasil",
        data: order,
      });

    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  export const getInvoiceByOrderId = async ( req: Request, res: Response ): Promise<void> => {
    try {

      const orderId = Number(req.params.id);

      const invoice = await orderLayers.getInvoiceByOrderId(orderId);

      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil invoice',
        data: invoice,
      });

    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message
      })
    }
  }