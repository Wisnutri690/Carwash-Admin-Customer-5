import { Request, Response, NextFunction } from "express";

export const validate = (schema: any) => {
return ( req: Request, res: Response, next: NextFunction ) => {

    console.log("BODY:", req.body);
    
    const result = schema.safeParse(req.body);

    if(!result.success) {
        return res.status(400).json({
            success: false,
            message: "Data tidak valid",
            error: result.error.issues,
        }); 
    }

    req.body = result.data;

    next();
};
};