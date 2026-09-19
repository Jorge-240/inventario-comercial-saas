import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function SalesPage() {
  const session = await getSession();
  if (!session) return null;

  const sales = await db.sale.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { customer: true, items: { include: { product: true } } },
  });

  return (
    <div className="p-6 md:p-10">
      <p className="text-sm font-semibold text-brand-600">Ventas</p>
      <h1 className="mt-1 text-3xl font-bold">Registro de ventas</h1>
      <div className="mt-8 space-y-4">
        {sales.map((sale) => (
          <div key={sale.id} className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">{sale.customer?.name || 'Cliente general'}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">${sale.total.toFixed(2)}</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              {sale.items.map((item) => (
                <li key={item.id}>• {item.product.name} — {item.quantity} uds.</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
