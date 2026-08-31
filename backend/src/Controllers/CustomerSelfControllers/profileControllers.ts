import { Response } from "express";
import { AuthRequest } from "../../Middlewares/authMiddlewares";
import * as profileLayers from "../../Services/CustomerSelfService/profileLayers";

export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user!.id;
    const profile = await profileLayers.getMyProfile(customerId);

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil profil customer",
      data: profile,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user!.id;
    const updated = await profileLayers.updateMyProfile(customerId, req.body);

    res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Gagal memperbarui profil",
    });
  }
};
