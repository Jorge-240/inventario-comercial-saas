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

    const items = rawItems.map((item: { productId?: string; quantity?: number; unitPrice?: number }) => ({
      productId: String(item.productId || ''),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }));
    if (items.some((item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.unitPrice) || item.unitPrice < 0)) {
      return NextResponse.json({ error: 'Revisa productos, cantidades y precios.' }, { status: 400 });
    }

    const customerId = body.customerId ? String(body.customerId) : null;
    const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const sale = await db.$transaction(async (tx) => {
      if (customerId) {
        const customer = await tx.customer.findFirst({ where: { id: customerId, companyId: session.companyId } });
        if (!customer) throw new Error('CUSTOMER_NOT_FOUND');
      }

      const products = await tx.product.findMany({ where: { companyId: session.companyId, isActive: true, id: { in: items.map((item) => item.productId) } } });
      if (products.length !== new Set(items.map((item) => item.productId)).size) throw new Error('PRODUCT_NOT_FOUND');
      for (const item of items) {
        const product = products.find((candidate) => candidate.id === item.productId);
        if (!product || product.stock < item.quantity) throw new Error(`INSUFFICIENT_STOCK:${product?.name || item.productId}`);
      }

      const created = await tx.sale.create({ data: { companyId: session.companyId, customerId, userId: session.userId, total, items: { create: items.map((item) => ({ productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice, total: item.quantity * item.unitPrice })) } }, include: { items: true } });
      for (const item of items) {
        const updated = await tx.product.updateMany({ where: { id: item.productId, companyId: session.companyId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
        if (updated.count !== 1) throw new Error('INSUFFICIENT_STOCK');
        await tx.stockMovement.create({ data: { companyId: session.companyId, userId: session.userId, productId: item.productId, type: 'salida', quantity: item.quantity, reason: `Venta ${created.id}` } });
      }
      return created;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'CUSTOMER_NOT_FOUND') return NextResponse.json({ error: 'El cliente no pertenece a tu empresa.' }, { status: 400 });
    if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') return NextResponse.json({ error: 'Uno de los productos no pertenece a tu empresa.' }, { status: 400 });
    if (error instanceof Error && error.message.startsWith('INSUFFICIENT_STOCK')) return NextResponse.json({ error: `Stock insuficiente: ${error.message.split(':')[1] || 'producto'}.` }, { status: 400 });
    return NextResponse.json({ error: 'No se pudo registrar la venta.' }, { status: 500 });
  }
}
