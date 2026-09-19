import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

function invalid(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const movements = await db.stockMovement.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { product: { select: { name: true, sku: true } } },
  });

  return NextResponse.json(movements);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const body = await request.json();
    const productId = String(body.productId || '');
    const type = String(body.type || '');
    const quantity = Number(body.quantity);
    const reason = body.reason ? String(body.reason).trim() : null;

    if (!productId || !['entrada', 'salida', 'ajuste'].includes(type)) return invalid('Selecciona un producto y un tipo válido.');
    if (!Number.isInteger(quantity) || quantity <= 0) return invalid('La cantidad debe ser un entero mayor que cero.');

    const result = await db.$transaction(async (tx) => {
      const product = await tx.product.findFirst({ where: { id: productId, companyId: session.companyId, isActive: true } });
      if (!product) throw new Error('PRODUCT_NOT_FOUND');

      const change = type === 'salida' ? -quantity : quantity;
      if (type === 'salida' && product.stock < quantity) throw new Error('INSUFFICIENT_STOCK');

      const updated = await tx.product.update({ where: { id: product.id }, data: { stock: { increment: change } } });
      const movement = await tx.stockMovement.create({ data: { companyId: session.companyId, userId: session.userId, productId: product.id, type, quantity, reason: reason || `Movimiento manual: ${type}` } });
      return { updated, movement };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') return invalid('El producto no pertenece a tu empresa o está inactivo.');
    if (error instanceof Error && error.message === 'INSUFFICIENT_STOCK') return invalid('No hay stock suficiente para realizar la salida.');
    return NextResponse.json({ error: 'No se pudo registrar el movimiento.' }, { status: 500 });
  }
}
