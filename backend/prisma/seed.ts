import "dotenv/config";
import bcrypt from 'bcrypt';

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
    {
      name: "Premium Wash",
      description: "Cuci mobil premium",
      price: 50000,
      duration: 30,
    },
    {
      name: "Express Wash",
      description: "Cuci mobil express",
      price: 30000,
      duration: 20,
    },
    {
      name: "Vacuum Interior",
      description: "Membersihkan interior mobil",
      price: 25000,
      duration: 20,
    },
    {
      name: "Wax",
      description: "Pelapisan wax pada bodi mobil",
      price: 60000,
      duration: 30,
    },
    {
      name: "Polish",
      description: "Poles bodi mobil",
      price: 80000,
      duration: 45,
    },
    {
      name: "Engine Cleaning",
      description: "Membersihkan ruang mesin",
      price: 70000,
      duration: 30,
    },
    {
      name: "Fogging (Disinfectant)",
      description: "Disinfeksi interior kendaraan",
      price: 40000,
      duration: 20,
    },
  ];

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.admin.upsert({
    where: {
      email: "admin@carwash.com",
    },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@carwash.com",
      password: hashedPassword,
    },
  });

  for (const service of services) {
    await prisma.service.upsert({
      where: {
        name: service.name,
      },
      update: service,
      create: service,
    });
  }

  console.log("✅ Service berhasil di-seed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });