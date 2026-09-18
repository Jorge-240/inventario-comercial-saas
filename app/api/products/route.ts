import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const url = new URL(request.url); const q = url.searchParams.get('q') || '';
  const products = await db.product.findMany({ where: { companyId: session.companyId, isActive: true, OR: [{ name: { contains: q } }, { sku: { contains: q } }] }, orderBy: { name: 'asc' }, include: { category: true } });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const body = await request.json();
    const product = await db.product.create({ data: { companyId: session.companyId, name: String(body.name), sku: String(body.sku), brand: body.brand || null, unitPrice: Number(body.unitPrice) || 0, costPrice: Number(body.costPrice) || 0, stock: Number(body.stock) || 0, minStock: Number(body.minStock) || 0, categoryId: body.categoryId || null } });
    return NextResponse.json(product, { status: 201 });
  } catch { return NextResponse.json({ error: 'No se pudo crear el producto. Verifica el SKU.' }, { status: 400 }); }
}
