import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const body = await request.json();
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (!rawItems.length) return NextResponse.json({ error: 'Agrega al menos un producto.' }, { status: 400 });
    const items = rawItems.map((item: { productId?: string; quantity?: number; unitCost?: number }) => ({ productId: String(item.productId || ''), quantity: Number(item.quantity), unitCost: Number(item.unitCost) }));
    if (items.some((item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.unitCost) || item.unitCost < 0)) return NextResponse.json({ error: 'Revisa productos, cantidades y costos.' }, { status: 400 });

    const supplierId = body.supplierId ? String(body.supplierId) : null;
    const total = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

    const purchase = await db.$transaction(async (tx) => {
      if (supplierId) {
        const supplier = await tx.supplier.findFirst({ where: { id: supplierId, companyId: session.companyId } });
        if (!supplier) throw new Error('SUPPLIER_NOT_FOUND');
      }
      const products = await tx.product.findMany({ where: { companyId: session.companyId, isActive: true, id: { in: items.map((item) => item.productId) } } });
      if (products.length !== new Set(items.map((item) => item.productId)).size) throw new Error('PRODUCT_NOT_FOUND');

      const created = await tx.purchase.create({ data: { companyId: session.companyId, supplierId, userId: session.userId, total, items: { create: items.map((item) => ({ productId: item.productId, quantity: item.quantity, unitCost: item.unitCost, total: item.quantity * item.unitCost })) } }, include: { items: true } });
      for (const item of items) {
        await tx.product.updateMany({ where: { id: item.productId, companyId: session.companyId }, data: { stock: { increment: item.quantity }, costPrice: item.unitCost } });
        await tx.stockMovement.create({ data: { companyId: session.companyId, userId: session.userId, productId: item.productId, type: 'entrada', quantity: item.quantity, reason: `Compra ${created.id}` } });
      }
      return created;
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'SUPPLIER_NOT_FOUND') return NextResponse.json({ error: 'El proveedor no pertenece a tu empresa.' }, { status: 400 });
    if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') return NextResponse.json({ error: 'Uno de los productos no pertenece a tu empresa.' }, { status: 400 });
    return NextResponse.json({ error: 'No se pudo registrar la compra.' }, { status: 500 });
  }
}
