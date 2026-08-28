import prisma from "../Config/prisma";
import { updateStaffStatusSchemaInput } from "../Validations/staffValidation";

export const getAllStaff = async () => {
    return await prisma.staff.findMany({
        orderBy: {
            id: 'asc',
        },
    });
};

export const updateStaffStatus = async ( id: number, data: updateStaffStatusSchemaInput ) => {
    const staff = await prisma.staff.findUnique({
        where: {
            id,
        },
    });

    if(!staff) {
        throw new Error('Staff tidak ditemukan');
    }

    return await prisma.staff.update({
        where: {
            id,
        },
        data,
    });
};