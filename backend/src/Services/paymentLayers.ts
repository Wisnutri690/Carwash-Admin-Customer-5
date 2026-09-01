import prisma from "../Config/prisma";
import { snap } from "../Config/midtrans";
import { emitOrderStatusUpdated } from "../Config/socket";
import { PaymentMethod } from "@prisma/client";


export const createSnapTransaction = async (orderId: number, customerId: number) => {
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            customerId,
        },
        include: {
            customer: true,
            orderItems: {
                include: { service: true,},
            },
        },
    });

    if(!order) {
        throw new Error('Pesanan tidak ditemukan atau bukan milik Anda');
    }

    if(order.paymentStatus === "PAID") {
        throw new Error('Pesanan ini sudah dibayar');
    }
    const itemDetails = order.orderItems.map((item) => ({
        id: `svc-${item.serviceId}`,
        price: Math.round(Number(item.price)),
        quantity: item.quantity,
        name: item.service.name.substring(0, 50,)
    }));

    const midtranOrderId = `CW-${order.id}-${Date.now()}`;
    const grossAmount = Math.round(Number(order.totalPrice));

    const parameter = {
        transaction_details: {
            order_id: midtranOrderId, 
            gross_amount: grossAmount,
        },
        item_details: itemDetails,
        customer_details: {
            first_name: order.customer.name,
            email: order.customer.email,
            phone: order.customer.phone,
        },
    };

    const transaction = await snap.createTransaction(parameter);
        return {
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
        orderId: order.id,
  };
}
export const handleMidtransNotification = async (notificationPayload: any) => {
  const statusResponse = await snap.transaction.notification(notificationPayload);

  const orderIdStr = statusResponse.order_id;
  const transactionStatus = statusResponse.transaction_status;
  const fraudStatus = statusResponse.fraud_status;
  const paymentType = statusResponse.payment_type;

  const orderIdParts = orderIdStr.split("-");
  const orderId = parseInt(orderIdParts[1], 10);

  if (isNaN(orderId)) {
    throw new Error("Format Order ID Midtrans tidak valid");
  }

  let mappedPaymentMethod: PaymentMethod = PaymentMethod.QRIS;
  if (paymentType === "bank_transfer" || paymentType === "echannel") {
    mappedPaymentMethod = PaymentMethod.TRANSFER;
  }

  const isPaid =
    transactionStatus === "settlement" ||
    (transactionStatus === "capture" && fraudStatus === "accept");

  if (isPaid) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { invoice: true },
      });

      if (!order) {
        throw new Error(`Order #${orderId} tidak ditemukan`);
      }

      if (order.paymentStatus === "PAID") {
        return order;
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          paymentMethod: mappedPaymentMethod,
        },
      });

      if (!order.invoice) {
        const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${order.id}`;
        await tx.invoice.create({
          data: {
            invoiceNumber,
            orderId: order.id,
          },
        });
      }

      emitOrderStatusUpdated(updatedOrder);

      return updatedOrder;
    });
  }

  return null;
};
