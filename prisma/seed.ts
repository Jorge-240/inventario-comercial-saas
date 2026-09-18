const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { slug: 'demo-empresa' },
    update: {},
    create: {
      name: 'Demo Empresa',
      slug: 'demo-empresa',
    },
  });

  const passwordHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      companyId: company.id,
      name: 'Administrador Demo',
      email: 'admin@demo.com',
      passwordHash,
      role: 'admin',
    },
  });

  const categoryA = await prisma.category.upsert({
    where: { id: 'seed-category-electro' },
    update: {},
    create: {
      id: 'seed-category-electro',
      companyId: company.id,
      name: 'Electrónica',
    },
  });

  const categoryB = await prisma.category.upsert({
    where: { id: 'seed-category-accesorios' },
    update: {},
    create: {
      id: 'seed-category-accesorios',
      companyId: company.id,
      name: 'Accesorios',
    },
  });

  const supplier = await prisma.supplier.upsert({
    where: { id: 'seed-supplier' },
    update: {},
    create: {
      id: 'seed-supplier',
      companyId: company.id,
      name: 'Distribuidora ProMarket',
      phone: '+502 1234-5678',
      email: 'ventas@promarket.gt',
      address: 'Zona 10, Guatemala',
    },
  });

  const customer = await prisma.customer.upsert({
    where: { id: 'seed-customer' },
    update: {},
    create: {
      id: 'seed-customer',
      companyId: company.id,
      name: 'Tienda Valeria',
      phone: '+502 8888-9999',
      email: 'ventas@tiendavaleria.com',
      address: 'Zona 4, Guatemala',
    },
  });

  const products = [
    {
      name: 'Laptop Pro 14',
      sku: 'LTP-014',
      brand: 'Dell',
      unitPrice: 1299.0,
      costPrice: 980.0,
      stock: 18,
      minStock: 5,
      categoryId: categoryA.id,
    },
    {
      name: 'Monitor 27" IPS',
      sku: 'MON-027',
      brand: 'Acer',
      unitPrice: 399.0,
      costPrice: 290.0,
      stock: 14,
      minStock: 4,
      categoryId: categoryA.id,
    },
    {
      name: 'Teclado Mecánico RGB',
      sku: 'TEC-RGB',
      brand: 'Redragon',
      unitPrice: 149.0,
      costPrice: 86.0,
      stock: 42,
      minStock: 10,
      categoryId: categoryB.id,
    },
    {
      name: 'Mouse Inalámbrico',
      sku: 'MOU-001',
      brand: 'Logitech',
      unitPrice: 75.0,
      costPrice: 40.0,
      stock: 35,
      minStock: 8,
      categoryId: categoryB.id,
    },
    {
      name: 'Impresora Multifuncional',
      sku: 'IMP-320',
      brand: 'HP',
      unitPrice: 289.0,
      costPrice: 210.0,
      stock: 9,
      minStock: 3,
      categoryId: categoryA.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        companyId_sku: {
          companyId: company.id,
          sku: product.sku,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        ...product,
      },
    });
  }

  const stockProducts = await prisma.product.findMany({
    where: { companyId: company.id },
  });

  for (const product of stockProducts) {
    await prisma.stockMovement.upsert({
      where: { id: `seed-movement-${product.sku}` },
      update: {},
      create: {
        id: `seed-movement-${product.sku}`,
        companyId: company.id,
        userId: admin.id,
        productId: product.id,
        type: 'entrada',
        quantity: product.stock,
        reason: 'Inventario inicial',
      },
    });
  }

  const sale = await prisma.sale.upsert({
    where: { id: 'seed-sale' },
    update: {},
    create: {
      id: 'seed-sale',
      companyId: company.id,
      customerId: customer.id,
      userId: admin.id,
      total: 1248.0,
    },
  });

  const saleProduct = await prisma.product.findFirst({
    where: { companyId: company.id, sku: 'LTP-014' },
  });

  await prisma.saleItem.upsert({
    where: { id: 'seed-sale-item' },
    update: {},
    create: {
      id: 'seed-sale-item',
      saleId: sale.id,
      productId: saleProduct.id,
      quantity: 1,
      unitPrice: 1248.0,
      total: 1248.0,
    },
  });

  const purchase = await prisma.purchase.upsert({
    where: { id: 'seed-purchase' },
    update: {},
    create: {
      id: 'seed-purchase',
      companyId: company.id,
      supplierId: supplier.id,
      userId: admin.id,
      total: 1980.0,
    },
  });

  const buyProduct = await prisma.product.findFirst({
    where: { companyId: company.id, sku: 'MON-027' },
  });

  await prisma.purchaseItem.upsert({
    where: { id: 'seed-purchase-item' },
    update: {},
    create: {
      id: 'seed-purchase-item',
      purchaseId: purchase.id,
      productId: buyProduct.id,
      quantity: 5,
      unitCost: 290.0,
      total: 1450.0,
    },
  });

  console.log('Database seeded with demo company and products.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
