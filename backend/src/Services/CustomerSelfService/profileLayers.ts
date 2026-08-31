import prisma from "../../Config/prisma";

export const getMyProfile = async (customerId: number) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      vehicles: {
        orderBy: { id: "desc" },
      },
      orders: {
        include: {
          orderItems: {
            include: {
              service: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) {
    throw new Error("Data customer tidak ditemukan");
  }

  const totalOrders = customer.orders.length;
  const completedOrders = customer.orders.filter((o) => o.status === "COMPLETED").length;
  const totalSpent = customer.orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + Number(o.totalPrice), 0);

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    createdAt: customer.createdAt,
    vehicles: customer.vehicles,
    stats: {
      totalOrders,
      completedOrders,
      totalSpent,
      totalVehicles: customer.vehicles.length,
      membershipTier: "VIP Supercar Club Member",
    },
  };
};

export const updateMyProfile = async (
  customerId: number,
  data: {
    name?: string;
    phone?: string;
  }
) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new Error("Customer tidak ditemukan");
  }

  if (data.phone && data.phone !== customer.phone) {
    const existingPhone = await prisma.customer.findUnique({
      where: { phone: data.phone },
    });
    if (existingPhone && existingPhone.id !== customerId) {
      throw new Error("Nomor telepon sudah terdaftar pada akun lain");
    }
  }

  return await prisma.customer.update({
    where: { id: customerId },
    data: {
      name: data.name,
      phone: data.phone,
    },
  });
};
