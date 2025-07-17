import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test company
  const company = await prisma.company.create({
    data: {
      name: 'デモ建設株式会社',
      logoUrl: null,
      planId: 1,
    },
  });

  console.log('Created company:', company);

  // Create admin user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'admin@crm.com',
      password: hashedPassword,
      name: '管理者',
      role: 'ADMIN',
      locale: 'ja',
      timezone: 'Asia/Tokyo',
    },
  });

  console.log('Created admin user:', adminUser);

  // Create manager user
  const managerUser = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'manager@crm.com',
      password: hashedPassword,
      name: '店長',
      role: 'MANAGER',
      locale: 'ja',
      timezone: 'Asia/Tokyo',
    },
  });

  console.log('Created manager user:', managerUser);

  // Create some test customers
  const customer1 = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: '田中太郎',
      email: 'tanaka@example.com',
      phone: '090-1234-5678',
      address: '東京都渋谷区恵比寿1-2-3',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      companyId: company.id,
      name: '佐藤花子',
      email: 'sato@example.com',
      phone: '090-8765-4321',
      address: '東京都新宿区西新宿2-3-4',
    },
  });

  // Create test projects
  const project1 = await prisma.project.create({
    data: {
      companyId: company.id,
      customerId: customer1.id,
      assigneeId: managerUser.id,
      name: '田中邸新築工事',
      address: '東京都渋谷区恵比寿1-2-3',
      latitude: 35.6464,
      longitude: 139.7100,
      status: 'CONTRACTED',
      contractDate: new Date('2025-01-15'),
      startDate: new Date('2025-02-01'),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      companyId: company.id,
      customerId: customer2.id,
      assigneeId: managerUser.id,
      name: '佐藤邸リフォーム',
      address: '東京都新宿区西新宿2-3-4',
      latitude: 35.6896,
      longitude: 139.6922,
      status: 'PROSPECT',
    },
  });

  console.log('Created projects:', { project1, project2 });

  // Create test orders
  const order1 = await prisma.order.create({
    data: {
      id: BigInt(12345678),
      companyId: company.id,
      projectId: project1.id,
      supplierId: BigInt(1001),
      orderDate: new Date('2025-02-01'),
      originalAmount: 1500000,
      statusCode: 10,
    },
  });

  console.log('Created order:', order1);

  // Create test KPI snapshot
  const kpiSnapshot = await prisma.kpiSnapshot.create({
    data: {
      companyId: company.id,
      snapshotDate: new Date(),
      period: 'daily',
      dealCount: 2,
      contractCount: 1,
      salesAmount: 1500000,
      grossProfit: 450000,
    },
  });

  console.log('Created KPI snapshot:', kpiSnapshot);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });