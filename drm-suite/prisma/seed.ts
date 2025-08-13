import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test company
  const company = await prisma.company.create({
    data: {
      name: 'テスト建設株式会社',
      code: 'TEST001',
      plan: 'premium',
      settings: JSON.stringify({
        theme: 'default',
        language: 'ja',
      }),
    },
  });

  console.log(`Created company: ${company.name}`);

  // Create a test store
  const store = await prisma.store.create({
    data: {
      companyId: company.id,
      name: '東京支店',
      code: 'TOKYO001',
      address: '東京都新宿区西新宿1-1-1',
      location: JSON.stringify({
        lat: 35.689487,
        lng: 139.691706,
      }),
      settings: JSON.stringify({}),
    },
  });

  console.log(`Created store: ${store.name}`);

  // Create test users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        companyId: company.id,
        storeId: store.id,
        email: 'sales@test.com',
        name: '営業太郎',
        role: 'sales',
        permissions: JSON.stringify(['read', 'write']),
        passwordHash: 'hash_password_here',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        companyId: company.id,
        storeId: store.id,
        email: 'manager@test.com',
        name: 'マネージャー花子',
        role: 'manager',
        permissions: JSON.stringify(['read', 'write', 'approve']),
        passwordHash: 'hash_password_here',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        companyId: company.id,
        email: 'executive@test.com',
        name: '経営陣次郎',
        role: 'executive',
        permissions: JSON.stringify(['read', 'write', 'approve', 'admin']),
        passwordHash: 'hash_password_here',
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create test customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        companyId: company.id,
        storeId: store.id,
        customerNumber: '202408001',
        name: '田中太郎',
        companyName: '田中建設株式会社',
        email: 'tanaka@example.com',
        phone: '090-1234-5678',
        address: '東京都渋谷区渋谷1-1-1',
        status: 'customer',
        priority: 5,
        tags: JSON.stringify(['外壁塗装', 'リピーター']),
        industry: '建設業',
        employees: 50,
        revenue: 100000000,
        lifeTimeValue: 5000000,
        acquisitionCost: 50000,
        preferredContact: 'email',
        communicationHistory: JSON.stringify([]),
        metadata: JSON.stringify({}),
        notes: 'VIP顧客、丁寧な対応を心がける',
        createdBy: users[0].id,
        assignee: users[0].id,
        firstContact: new Date('2024-01-15'),
        lastContact: new Date('2024-08-10'),
        nextActionDate: new Date('2024-08-20'),
        nextAction: '見積もりフォローアップ',
      },
    }),
    prisma.customer.create({
      data: {
        companyId: company.id,
        storeId: store.id,
        customerNumber: '202408002',
        name: '佐藤美咲',
        email: 'sato@example.com',
        phone: '080-9876-5432',
        address: '東京都新宿区新宿2-2-2',
        status: 'prospect',
        priority: 3,
        tags: JSON.stringify(['屋根工事', '新規']),
        lifeTimeValue: 0,
        acquisitionCost: 10000,
        preferredContact: 'phone',
        communicationHistory: JSON.stringify([]),
        metadata: JSON.stringify({}),
        createdBy: users[0].id,
        assignee: users[0].id,
        firstContact: new Date('2024-08-01'),
        lastContact: new Date('2024-08-12'),
        nextActionDate: new Date('2024-08-15'),
        nextAction: '初回訪問予定',
      },
    }),
    prisma.customer.create({
      data: {
        companyId: company.id,
        storeId: store.id,
        customerNumber: '202408003',
        name: '鈴木一郎',
        companyName: '鈴木商事株式会社',
        email: 'suzuki@example.com',
        phone: '03-1234-5678',
        address: '東京都港区港1-1-1',
        status: 'lead',
        priority: 4,
        tags: JSON.stringify(['法人', '大型案件']),
        industry: '卸売業',
        employees: 200,
        revenue: 500000000,
        lifeTimeValue: 0,
        acquisitionCost: 30000,
        preferredContact: 'email',
        communicationHistory: JSON.stringify([]),
        metadata: JSON.stringify({}),
        notes: '大型案件の可能性あり',
        createdBy: users[0].id,
        assignee: users[1].id,
        firstContact: new Date('2024-08-05'),
        lastContact: new Date('2024-08-08'),
        nextActionDate: new Date('2024-08-18'),
        nextAction: '資料送付',
      },
    }),
  ]);

  console.log(`Created ${customers.length} customers`);

  // Create test customer interactions
  const interactions = await Promise.all([
    prisma.customerInteraction.create({
      data: {
        customerId: customers[0].id,
        type: 'meeting',
        direction: 'outbound',
        subject: '見積もり内容について打ち合わせ',
        content:
          '外壁塗装の見積もり内容について詳細を説明。予算調整の相談あり。次回までに修正案を提示予定。',
        outcome: 'follow_up_scheduled',
        nextAction: '修正見積もりの提示',
        scheduledAt: new Date('2024-08-20'),
        completedAt: new Date('2024-08-10'),
        createdBy: users[0].id,
        metadata: JSON.stringify({}),
      },
    }),
    prisma.customerInteraction.create({
      data: {
        customerId: customers[1].id,
        type: 'email',
        direction: 'outbound',
        subject: '見積書送付のご案内',
        content:
          '屋根工事の見積書を送付いたしました。ご不明な点がございましたらお気軽にお問い合わせください。',
        outcome: 'quote_requested',
        completedAt: new Date('2024-08-12'),
        createdBy: users[0].id,
        metadata: JSON.stringify({}),
      },
    }),
  ]);

  console.log(`Created ${interactions.length} customer interactions`);

  // Create test estimates
  const estimates = await Promise.all([
    prisma.estimate.create({
      data: {
        companyId: company.id,
        storeId: store.id,
        userId: users[0].id,
        estimateNumber: 'EST-2024-0001',
        version: 1,
        status: 'approved',
        customerName: customers[0].name,
        customerEmail: customers[0].email,
        customerPhone: customers[0].phone,
        propertyType: 'house',
        constructMethod: 'reform',
        structure: 'wood',
        location: JSON.stringify({
          address: customers[0].address,
          lat: 35.658581,
          lng: 139.745433,
        }),
        totalAmount: 2500000,
        taxAmount: 250000,
        discountAmount: 0,
        profitMargin: 0.3,
        validUntil: new Date('2024-09-30'),
        notes: '外壁塗装工事の見積もり',
        approvalFlow: JSON.stringify({
          steps: ['sales', 'manager'],
          currentStep: 'completed',
        }),
        metadata: JSON.stringify({}),
      },
    }),
    prisma.estimate.create({
      data: {
        companyId: company.id,
        storeId: store.id,
        userId: users[0].id,
        estimateNumber: 'EST-2024-0002',
        version: 1,
        status: 'draft',
        customerName: customers[1].name,
        customerEmail: customers[1].email,
        customerPhone: customers[1].phone,
        propertyType: 'house',
        constructMethod: 'reform',
        structure: 'wood',
        totalAmount: 1800000,
        taxAmount: 180000,
        discountAmount: 50000,
        validUntil: new Date('2024-09-15'),
        notes: '屋根工事の見積もり（初回提案）',
        metadata: JSON.stringify({}),
      },
    }),
  ]);

  console.log(`Created ${estimates.length} estimates`);

  // Create test estimate items
  await Promise.all([
    prisma.estimateItem.create({
      data: {
        estimateId: estimates[0].id,
        itemCode: 'EXT-001',
        name: '外壁塗装工事',
        description: '高耐久シリコン塗料使用',
        category: '塗装工事',
        quantity: 150,
        unit: '㎡',
        unitPrice: 12000,
        totalPrice: 1800000,
        costPrice: 8000,
        metadata: JSON.stringify({}),
      },
    }),
    prisma.estimateItem.create({
      data: {
        estimateId: estimates[0].id,
        itemCode: 'SCAFFOLD-001',
        name: '足場設置・撤去',
        description: '安全対策込み',
        category: '仮設工事',
        quantity: 200,
        unit: '㎡',
        unitPrice: 1500,
        totalPrice: 300000,
        costPrice: 1000,
        metadata: JSON.stringify({}),
      },
    }),
  ]);

  console.log('Created estimate items');

  console.log('✅ Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
