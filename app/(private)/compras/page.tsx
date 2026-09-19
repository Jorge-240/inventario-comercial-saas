import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function PurchasesPage() {
  const session = await getSession();
  if (!session) return null;

  const purchases = await db.purchase.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { supplier: true, items: { include: { product: true } } },
  });

  return (
    <div className="p-6 md:p-10">
      <p className="text-sm font-semibold text-brand-600">Compras</p>
      <h1 className="mt-1 text-3xl font-bold">Compras del proveedor</h1>
      <div className="mt-8 space-y-4">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">{purchase.supplier?.name || 'Proveedor'}</span>
              <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-bold text-brand-600">${purchase.total.toFixed(2)}</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              {purchase.items.map((item) => (
                <li key={item.id}>• {item.product.name} — {item.quantity} uds.</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
