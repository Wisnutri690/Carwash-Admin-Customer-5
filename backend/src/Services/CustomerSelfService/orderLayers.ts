import prisma from "../../Config/prisma";
import { CustomerCreateOrderInput } from "../../Validations/CustomerSelfValidations/customerSelfServiceValidation";
import { emitOrderStatusUpdated } from "../../Config/socket";

export const calculateQueueInfo = async (orderId: number) => {
  const targetOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: { include: { service: true } },
    },
  });

  if (!targetOrder) return null;

  if (targetOrder.status === "COMPLETED" || targetOrder.status === "CANCELLED") {
    return {
      orderId: targetOrder.id,
      status: targetOrder.status,
      queuePosition: 0,
      ahead: 0,
      estimatedMinutes: 0,
    };
  }

  const inProgressOrders = await prisma.order.findMany({
    where: { status: "IN_PROGRESS" },
    include: { orderItems: { include: { service: true } } },
  });

  const waitingOrders = await prisma.order.findMany({
    where: { status: "WAITING" },
    orderBy: { checkInTime: "asc" },
    include: { orderItems: { include: { service: true } } },
  });

  if (targetOrder.status === "IN_PROGRESS") {
    const duration = targetOrder.orderItems.reduce(
      (sum, item) => sum + (item.service.duration || 20) * item.quantity,
      0
    );
    return {
      orderId: targetOrder.id,
      status: targetOrder.status,
      queuePosition: 1,
      ahead: 0,
      estimatedMinutes: duration,
    };
  }

  const waitingIndex = waitingOrders.findIndex((o) => o.id === targetOrder.id);
  const queuePosition = waitingIndex !== -1 ? waitingIndex + 1 : 1;
  const ahead = inProgressOrders.length + (waitingIndex !== -1 ? waitingIndex : 0);
  let estimatedMinutes = 0;

  for (const order of inProgressOrders) {
    const duration = order.orderItems.reduce(
      (sum, item) => sum + (item.service.duration || 20) * item.quantity,
      0
    );
    estimatedMinutes += duration;
  }

  for (let i = 0; i < waitingIndex; i++) {
    const order = waitingOrders[i];
    const duration = order.orderItems.reduce(
      (sum, item) => sum + (item.service.duration || 20) * item.quantity,
      0
    );
    estimatedMinutes += duration;
  }

  return {
    orderId: targetOrder.id,
    status: targetOrder.status,
    queuePosition,
    ahead,
    estimatedMinutes,
  };
};

export const createCustomerOrder = async (
  customerId: number,
  data: CustomerCreateOrderInput
) => {
  return await prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findFirst({
      where: { id: data.vehicleId, customerId },
    });
    if (!vehicle) {
      throw new Error("Kendaraan tidak ditemukan atau bukan milik Anda");
    }

    const activeOrder = await tx.order.findFirst({
      where: {
        vehicleId: data.vehicleId,
        status: { in: ["WAITING", "IN_PROGRESS"] },
      },
    });
    if (activeOrder) {
      throw new Error(
        "Kendaraan ini sudah terdaftar dalam antrean aktif. Selesaikan pesanan sebelumnya terlebih dahulu."
      );
    }

    const serviceIds = data.services.map((s) => s.serviceId);
    const services = await tx.service.findMany({
      where: { id: { in: serviceIds }, isActive: true },
    });

    if (services.length !== data.services.length) {
      throw new Error("Beberapa layanan yang dipilih tidak aktif atau tidak ditemukan");
    }

    let totalPrice = 0;
    for (const item of data.services) {
      const s = services.find((srv) => srv.id === item.serviceId);
      totalPrice += Number(s!.price) * item.quantity;
    }

    const order = await tx.order.create({
      data: {
        customerId,
        vehicleId: data.vehicleId,
        totalPrice,
        status: "WAITING",
        paymentStatus: "UNPAID",
        notes: data.notes,
      },
    });

    for (const item of data.services) {
      const s = services.find((srv) => srv.id === item.serviceId);
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          serviceId: item.serviceId,
          quantity: item.quantity,
          price: s!.price,
          subtotal: Number(s!.price) * item.quantity,
        },
      });
    }

    emitOrderStatusUpdated(order);

    return order;
  });
};

export const getMyActiveOrders = async (customerId: number) => {
  const orders = await prisma.order.findMany({
    where: {
      customerId,
      status: { in: ["WAITING", "IN_PROGRESS"] },
    },
    include: {
      vehicle: true,
      staff: true,
      orderItems: { include: { service: true } },
    },
    orderBy: { id: "desc" },
  });

  const ordersWithQueue = await Promise.all(
    orders.map(async (order) => {
      const queueInfo = await calculateQueueInfo(order.id);
      return {
        ...order,
        queueInfo,
      };
    })
  );

  return ordersWithQueue;
};

export const getMyOrderHistory = async (customerId: number) => {
  return await prisma.order.findMany({
    where: {
      customerId,
      status: { in: ["COMPLETED", "CANCELLED"] },
    },
    include: {
      vehicle: true,
      staff: true,
      invoice: true,
      orderItems: { include: { service: true } },
    },
    orderBy: { id: "desc" },
  });
};

export const cancelMyOrder = async (customerId: number, orderId: number) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId },
  });

  if (!order) {
    throw new Error("Order tidak ditemukan atau bukan milik Anda");
  }

  if (order.status !== "WAITING") {
    throw new Error(
      "Order tidak dapat dibatalkan karena sudah dalam proses pencucian atau telah selesai"
    );
  }

  const cancelled = await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  emitOrderStatusUpdated(cancelled);

  return cancelled;
};
