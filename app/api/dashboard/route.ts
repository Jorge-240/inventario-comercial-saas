import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const [products, lowStock, sales, purchases, movements] = await Promise.all([
    db.product.findMany({ where: { companyId: session.companyId, isActive: true }, orderBy: { createdAt: 'desc' }, take: 6, include: { category: true } }),
    db.product.count({ where: { companyId: session.companyId, isActive: true, stock: { lte: db.product.fields?.minStock as never } } }).catch(() => 0),
    db.sale.aggregate({ where: { companyId: session.companyId }, _sum: { total: true }, _count: true }),
    db.purchase.aggregate({ where: { companyId: session.companyId }, _sum: { total: true } }),
    db.stockMovement.findMany({ where: { companyId: session.companyId }, orderBy: { createdAt: 'desc' }, take: 5, include: { product: true } })
  ]);
  const allProducts = await db.product.findMany({ where: { companyId: session.companyId, isActive: true }, select: { stock: true, minStock: true } });
  return NextResponse.json({ products, lowStock: allProducts.filter(p => p.stock <= p.minStock).length, sales, purchases, movements });
}
