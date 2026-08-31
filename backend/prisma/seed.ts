import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const services = [
    { name: "Signature Ceramic Coating", description: "Proteksi nano ceramic 9H multi-layer untuk bodi sport car", price: 2500000, duration: 180 },
    { name: "Full Body Paint Correction", description: "Poles 3-tahap menghilangkan swirl mark dan baret halus", price: 1200000, duration: 120 },
    { name: "Hyper Wash & Wax", description: "Cuci hidrofobik busa salju pH netral dan proteksi carnauba wax", price: 150000, duration: 45 },
    { name: "Underbody & Chassis Wash", description: "Pembersihan kolong mobil sport dan suspensi tekanan tinggi", price: 95000, duration: 30 },
    { name: "Interior Deep Detail & Leather Care", description: "Pembersihan jok kulit Alcantara/Nappa & ozone disinfectant", price: 350000, duration: 60 },
    { name: "Engine Bay & Caliper Detailing", description: "Detailing ruang mesin supercar dan velg/kaliper rem", price: 250000, duration: 45 },
  ];

  const staffList = [
    { name: "Bambang Pamungkas", phone: "081234567801", isActive: true },
    { name: "Joko Widodo", phone: "081234567802", isActive: true },
    { name: "Agus Setiawan", phone: "081234567803", isActive: true },
    { name: "Doni Pratama", phone: "081234567804", isActive: true },
    { name: "Rizky Ramadhan", phone: "081234567805", isActive: true },
    { name: "Eko Prasetyo", phone: "081234567806", isActive: true },
    { name: "Fajar Nugraha", phone: "081234567807", isActive: true },
    { name: "Hendra Wijaya", phone: "081234567808", isActive: false },
  ];

  const sportCustomers = [
    {
      name: "Arya Wicaksana",
      email: "arya.wicaksana@apexgarage.id",
      phone: "08119876543",
      vehicles: [
        { plateNumber: "B 911 RS", brand: "Porsche", model: "911 GT3 RS", color: "GT Silver Metallic", year: 2024 },
        { plateNumber: "B 911 TY", brand: "Porsche", model: "Taycan Turbo S", color: "Frozen Blue Metallic", year: 2023 },
      ],
    },
    {
      name: "Jessica Tan",
      email: "jessica.tan@supercar.co.id",
      phone: "08128765432",
      vehicles: [
        { plateNumber: "B 1 STR", brand: "Ferrari", model: "SF90 Stradale", color: "Rosso Corsa", year: 2023 },
        { plateNumber: "B 2 RMA", brand: "Ferrari", model: "Roma Spider", color: "Grigio Silverstone", year: 2024 },
      ],
    },
    {
      name: "Reza Pratama",
      email: "reza.pratama@speedclub.id",
      phone: "08137654321",
      vehicles: [
        { plateNumber: "B 7 TEC", brand: "Lamborghini", model: "Huracán Tecnica", color: "Verde Mantis", year: 2024 },
        { plateNumber: "B 8 URU", brand: "Lamborghini", model: "Urus Performante", color: "Nero Noctis", year: 2023 },
      ],
    },
    {
      name: "David Kurniawan",
      email: "david.k@mclarenclub.id",
      phone: "08146543210",
      vehicles: [
        { plateNumber: "B 720 MCL", brand: "McLaren", model: "720S Spider", color: "Papaya Orange", year: 2023 },
      ],
    },
    {
      name: "Kevin Sanjaya",
      email: "kevin.sanjaya@apexmotors.id",
      phone: "08155432109",
      vehicles: [
        { plateNumber: "B 4 MCOMP", brand: "BMW", model: "M4 Competition", color: "Isle of Man Green", year: 2024 },
        { plateNumber: "B 8 MGRN", brand: "BMW", model: "M8 Gran Coupe", color: "Dravit Grey Metallic", year: 2023 },
      ],
    },
    {
      name: "Dennis Santoso",
      email: "dennis.gtr@nismo.id",
      phone: "08164321098",
      vehicles: [
        { plateNumber: "B 35 GTR", brand: "Nissan", model: "GT-R Nismo R35", color: "Pearl White", year: 2024 },
      ],
    },
  ];

  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@carwash.com" },
    update: {},
    create: {
      name: "Administrator APEX",
      email: "admin@carwash.com",
      password: hashedPassword,
    },
  });

  const createdServices: any[] = [];
  for (const service of services) {
    const s = await prisma.service.upsert({
      where: { name: service.name },
      update: service,
      create: service,
    });
    createdServices.push(s);
  }

  const createdStaffs: any[] = [];
  for (const staff of staffList) {
    let s = await prisma.staff.findFirst({
      where: { name: staff.name },
    });
    if (!s) {
      s = await prisma.staff.create({ data: staff });
    }
    createdStaffs.push(s);
  }

  const createdCustomers: any[] = [];
  const createdVehicles: any[] = [];

  for (const cust of sportCustomers) {
    const existingCust = await prisma.customer.upsert({
      where: { email: cust.email },
      update: { name: cust.name, phone: cust.phone },
      create: {
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
      },
    });
    createdCustomers.push(existingCust);

    for (const v of cust.vehicles) {
      const veh = await prisma.vehicle.upsert({
        where: { plateNumber: v.plateNumber },
        update: {
          brand: v.brand,
          model: v.model,
          color: v.color,
          year: v.year,
          customerId: existingCust.id,
        },
        create: {
          plateNumber: v.plateNumber,
          brand: v.brand,
          model: v.model,
          color: v.color,
          year: v.year,
          customerId: existingCust.id,
        },
      });
      createdVehicles.push(veh);
    }
  }

  const porscheOrder = await prisma.order.findFirst({
    where: { vehicle: { plateNumber: "B 911 RS" } },
  });

  if (!porscheOrder) {
    const porscheVeh = createdVehicles.find((v) => v.plateNumber === "B 911 RS");
    const porscheCust = createdCustomers.find((c) => c.email === "arya.wicaksana@apexgarage.id");
    const hyperWash = createdServices.find((s) => s.name === "Hyper Wash & Wax") || createdServices[0];
    const coating = createdServices.find((s) => s.name === "Signature Ceramic Coating") || createdServices[0];

    const order1 = await prisma.order.create({
      data: {
        customerId: porscheCust.id,
        vehicleId: porscheVeh.id,
        adminId: admin.id,
        staffId: createdStaffs[0].id,
        status: "IN_PROGRESS",
        paymentStatus: "PAID",
        paymentMethod: "QRIS",
        totalPrice: Number(hyperWash.price) + Number(coating.price),
        notes: "Gunakan busa pH netral khusus bodi ceramic coating Porsche",
      },
    });

    await prisma.orderItem.createMany({
      data: [
        { orderId: order1.id, serviceId: hyperWash.id, quantity: 1, price: hyperWash.price, subtotal: hyperWash.price },
        { orderId: order1.id, serviceId: coating.id, quantity: 1, price: coating.price, subtotal: coating.price },
      ],
    });
  }

  const ferrariOrder = await prisma.order.findFirst({
    where: { vehicle: { plateNumber: "B 1 STR" } },
  });

  if (!ferrariOrder) {
    const ferrariVeh = createdVehicles.find((v) => v.plateNumber === "B 1 STR");
    const ferrariCust = createdCustomers.find((c) => c.email === "jessica.tan@supercar.co.id");
    const paintCorrection = createdServices.find((s) => s.name === "Full Body Paint Correction") || createdServices[0];

    const order2 = await prisma.order.create({
      data: {
        customerId: ferrariCust.id,
        vehicleId: ferrariVeh.id,
        adminId: admin.id,
        staffId: createdStaffs[1].id,
        status: "WAITING",
        paymentStatus: "UNPAID",
        totalPrice: Number(paintCorrection.price),
        notes: "Fokus bersihkan velg forged Rosso Corsa",
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order2.id,
        serviceId: paintCorrection.id,
        quantity: 1,
        price: paintCorrection.price,
        subtotal: paintCorrection.price,
      },
    });
  }

  console.log("Database successfully seeded with Sport Cars, Customers, Services, Staff, and Active Orders.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
