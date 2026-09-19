import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const allProducts = await db.product.findMany({
    where: { companyId: session.companyId, isActive: true },
    select: { stock: true, minStock: true, name: true },
    orderBy: { name: 'asc' },
  });

  const lowStockCount = allProducts.filter((p) => p.stock <= p.minStock).length;

  const [products, sales, purchases, movements] = await Promise.all([
    db.product.findMany({
      where: { companyId: session.companyId, isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { category: true },
    }),
    db.sale.aggregate({
      where: { companyId: session.companyId },
      _sum: { total: true },
      _count: true,
    }),
    db.purchase.aggregate({
      where: { companyId: session.companyId },
      _sum: { total: true },
      _count: true,
    }),
    db.stockMovement.findMany({
      where: { companyId: session.companyId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { product: true },
    }),
  ]);

  return NextResponse.json({
    products,
    lowStockCount,
    totalStock: allProducts.reduce((sum, p) => sum + p.stock, 0),
    sales,
    purchases,
    movements,
  });
}
