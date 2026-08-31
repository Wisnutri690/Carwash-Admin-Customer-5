import prisma from "../Config/prisma";
import { CreateOrderInput, UpdateOrderInput, } from "../Validations/orderValidation";
import { PaymentInput } from "../Validations/paymentValidation";
import { io } from "../server";

export const createOrder = async ( data: CreateOrderInput, adminId: number) => {

    return await prisma.$transaction(async(tx) => {

        const customer = await tx.customer.findUnique({
            where: {
                id: data.customerId,
            },
        });

        if(!customer) {
            throw new Error ('Customer tidak ditemukan');
        }

        const vehicle = await tx.vehicle.findUnique({
            where: {
                id: data.vehicleId,
            },
        });

        if (!vehicle) {
            throw new Error ('Vehicle tidak ditemukan')
        }

        if (vehicle.customerId !== customer.id) {
            throw new Error('Vehicle bukan milik user tersebut')
        }
        
        const staff = await tx.staff.findUnique({
            where: {
                id: data.staffId,
            },
        });
    

        if(!staff) {
            throw new Error ('Staff tidak ditemukan')
        }

        if(!staff.isActive){
            throw new Error('Staff sedang tidak aktif');
        }

        const serviceId = data.services.map((item) => item.serviceId);
        const services = await tx.service.findMany({
            where: {
                id: {
                    in: serviceId,
                },
                isActive: true,
            },
        });
        if (services.length !== data.services.length) {
            throw new Error('Beberapa service tidak ditemukan atau tidak aktif')
        }

        let totalPrice = 0;

        for (const item of data.services) {
            
            const service = services.find ( (service) => service.id === item.serviceId)
        

            const subTotal = Number (service!.price) * item.quantity;

        totalPrice += subTotal

        }

            const order = await tx.order.create({
                data: {
                    customerId : data.customerId,
                    vehicleId: data.vehicleId,
                    adminId,
                    staffId: data.staffId,
                    totalPrice,
                },
        });

        for (const item of data.services) {

            const service = services.find(
                (service) => service.id === item.serviceId
            );

            const subTotal = Number (service!.price) * item.quantity;

            await tx.orderItem.create({
                data: {
                    orderId: order.id,
                    serviceId: item.serviceId,
                    quantity: item.quantity,
                    price: service!.price,
                    subtotal: subTotal,
                },
            });
        }

        return order;

    });

};
    
    export const getAllOrders = async() => {
        return await prisma.order.findMany({
            include: {
                customer: true,
                vehicle: true,
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                staff:true,
                orderItems: {
                    include: {
                        service: true,
                    },
                },
            },
            orderBy: {
            id: 'asc',
        },
    });
};

    export const getOrderById = async (id: number) => {
        return await prisma.order.findUnique({
            where: {
                id,
            },
            include: {
                customer: true,
                vehicle: true,
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                staff: true,
                orderItems: {
                    include: {
                        service: true,
                    },
                },
            },
        });
    };

    export const updateOrder = async ( id: number, data: UpdateOrderInput) => {
            const order = await prisma.order.findUnique({
                where: {
                    id,
                },
            });

            if(!order) {
                throw new Error('Order tidak ditemukan');
            }

            if(data.status === 'COMPLETED') {
                data.completedAt = new Date();
            }

            // 1. Simpan perubahan ke Database
            const updatedOrder = await prisma.order.update({
                where: {
                    id,
                },
                data,
                include: {
                    staff: true,
                    vehicle: true,
                    customer: true,
                },
            });

            // 🌟 Pancarkan event perubahan status ke seluruh client
            io.emit("ORDER_STATUS_UPDATED", updatedOrder);

            return updatedOrder;
    };

    export const deleteOrder = async (id: number) => {
        return await prisma.$transaction(async(tx) => {
            const order = await tx.order.findUnique({
                where : {
                    id,
                },
            });

            if(!order) {
                throw new Error('Order tidak ditemukan');
            }

            await tx.orderItem.deleteMany({
                where: {
                    orderId: id,
                },
            });

            return await tx.order.delete({
                where: {
                    id,
                },
            });
        });
    };

    export const payOrder = async ( id:number, data: PaymentInput ) => {
        return await prisma.$transaction(async(tx) => {
            
            const order = await tx.order.findUnique({
                where: {
                    id,
                },
            });

            if(!order) {
                throw new Error("Order tidak ditemukan");
            }

            if(order.status !== 'COMPLETED') {
                throw new Error ("Order belum selesai");
            }
            
            if(order.paymentStatus === "PAID") {
                throw new Error("Order sudah di bayar")
            }

            const updateOrder = await tx.order.update({
                where: {
                    id,
                },
                data: {
                    paymentStatus: "PAID",
                    paymentMethod: data.paymentMethod,
                },
            });

            const invoiceNumber = `INV-${new Date() .toISOString() .slice(0, 10) .replace(/-/g, "")}-${order.id}`;

            const invoice = await tx.invoice.create({
                data: {
                    invoiceNumber,
                    orderId: order.id,
                },
            });

            return {
                order: updateOrder, invoice,
            };
        });
    };

    export const getInvoiceByOrderId = async(orderId: number) => {
        const invoice = await prisma.invoice.findUnique({
            where : {
                orderId,
            },
            include : {
                order : {
                    include : {
                        customer : true,
                        vehicle : true,
                        staff : true,
                        orderItems: {
                            include: {
                                service : true,
                            },
                        },
                    },
                },
            },
        });

        if(!invoice) {
            throw new Error("Invoice tidak ditemukan");
        }

        return invoice;
    };