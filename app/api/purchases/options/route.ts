import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const [products, suppliers] = await Promise.all([
    db.product.findMany({ where: { companyId: session.companyId, isActive: true }, select: { id: true, name: true, sku: true, costPrice: true }, orderBy: { name: 'asc' } }),
    db.supplier.findMany({ where: { companyId: session.companyId }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);
  return NextResponse.json({ products, suppliers });
}
