import { Response } from "express";
import { AuthRequest } from "../../Middlewares/authMiddlewares";
import * as vehicleLayers from "../../Services/CustomerSelfService/vehicleLayers";

export const getMyVehicles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user!.id;
    const vehicles = await vehicleLayers.getVehicles(customerId);

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil data kendaraan",
      data: vehicles,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const addMyVehicle = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user!.id;
    const vehicle = await vehicleLayers.addMyVehicle(customerId, req.body);
    res.status(201).json({
      success: true,
      message: "Kendaraan berhasil ditambahkan",
      data: vehicle,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Gagal menambahkan kendaraan",
    });
  }
};

export const updateMyVehicle = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user!.id;
    const vehicleId = Number(req.params.id);
    const updated = await vehicleLayers.updateMyVehicle(customerId, vehicleId, req.body);
    res.status(200).json({
      success: true,
      message: "Data kendaraan berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Gagal memperbarui kendaraan",
    });
  }
};

export const deleteMyVehicle = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const customerId = req.user!.id;
    const vehicleId = Number(req.params.id);
    await vehicleLayers.deleteMyVehicle(customerId, vehicleId);
    res.status(200).json({
      success: true,
      message: "Kendaraan berhasil dihapus",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Gagal menghapus kendaraan",
    });
  }
};