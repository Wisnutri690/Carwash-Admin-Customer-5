import prisma from '../Config/prisma';
import { CreateServiceInput, UpdateServiceInput, } from "../Validations/serviceValidation";

export const getAllServices = async () => {
    return await prisma.service.findMany({
        orderBy: {
            id: 'asc',
        },
    });
};

export const getServicesById = async (id: number) => {
    return await prisma.service.findUnique({
        where: {
            id,
        },
    });
};

export const createServices = async (data: CreateServiceInput) => {
    return await prisma.service.create({
        data,
    });
};

export const updateServices = async (
    id: number,
    data: UpdateServiceInput) => {
    return await prisma.service.update({
        where: {
            id,
        },
        data,
    });
};

export const deleteServices = async (id: number) => {
    return await prisma.service.delete({
        where: {
            id,
        },
    });
};