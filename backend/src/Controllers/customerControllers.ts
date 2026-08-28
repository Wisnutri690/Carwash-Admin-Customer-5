import { Request, Response } from "express";
import * as customerLayers from "../Services/customerLayers";

export const getAllCustomers = async ( req: Request, res: Response ): Promise<void> => {
  try {
    const customers = await customerLayers.getAllCustomers();

    res.status(200).json({
      success: true,
      message: "Berhasil ambil data Customer",
      data: customers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

export const getCustomerById = async ( req: Request, res: Response ): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const customer = await customerLayers.getCustomerById(id);

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCustomer = async ( req: Request,res: Response): Promise<void> => {
  try {
    const customer = await customerLayers.createCustomer(req.body);

    res.status(201).json({
      success: true,
      message: "Customer berhasil ditambahkan",
      data: customer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCustomer = async ( req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const customer = await customerLayers.updateCustomer(id, req.body);

    res.status(200).json({
      success: true,
      message: "Customer berhasil diupdate",
      data: customer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCustomer = async ( req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    await customerLayers.deleteCustomer(id);

    res.status(200).json({
      success: true,
      message: "Customer berhasil dihapus",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};