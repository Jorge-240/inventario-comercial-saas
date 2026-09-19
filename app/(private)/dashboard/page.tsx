import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';

function money(value: number) {
  return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'USD' }).format(value);
}

const statClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-emerald-100 text-emerald-600',
  purple: 'bg-violet-100 text-violet-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [products, sales, purchases, movements, allProducts] = await Promise.all([
    db.product.findMany({
      where: { companyId: session.companyId, isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { category: true },
    }),
    db.sale.aggregate({ where: { companyId: session.companyId }, _sum: { total: true }, _count: true }),
    db.purchase.aggregate({ where: { companyId: session.companyId }, _sum: { total: true }, _count: true }),
    db.stockMovement.findMany({
      where: { companyId: session.companyId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { product: true },
    }),
    db.product.findMany({
      where: { companyId: session.companyId, isActive: true },
      select: { stock: true, minStock: true },
    }),
  ]);

  const lowStockCount = allProducts.filter((p) => p.stock <= p.minStock).length;
  const totalStock = allProducts.reduce((sum, p) => sum + p.stock, 0);

  const cards = [
    { title: 'Productos activos', value: String(allProducts.length), icon: '▦', color: 'blue' },
    { title: 'Unidades en stock', value: String(totalStock), icon: '◉', color: 'green' },
    { title: 'Ventas registradas', value: money(Number(sales._sum.total || 0)), icon: '$', color: 'purple' },
    { title: 'Stock bajo', value: String(lowStockCount), icon: '!', color: 'orange' },
  ];

  return (
    <div className="p-6 md:p-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-600">Resumen general</p>
          <h1 className="mt-1 text-3xl font-bold">Hola, {session.name.split(' ')[0]} 👋</h1>
          <p className="mt-2 text-slate-500">Esto es lo que está pasando en tu negocio.</p>
        </div>
        <Link href="/productos" className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700">
          + Nuevo producto
        </Link>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="rounded-2xl bg-white p-5 shadow-soft">
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${statClasses[card.color as keyof typeof statClasses]}`}>
              {card.icon}
            </div>
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className="mt-1 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl bg-white p-6 shadow-soft xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Productos recientes</h2>
            <Link href="/productos" className="text-sm font-semibold text-brand-600">Ver todos →</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Producto</th>
                  <th className="pb-3">SKU</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3 text-right">Precio</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50">
                    <td className="py-4 font-semibold">
                      {p.name}
                      <span className="block text-xs font-normal text-slate-400">{p.category?.name || 'Sin categoría'}</span>
                    </td>
                    <td className="py-4 text-slate-500">{p.sku}</td>
                    <td className={`py-4 font-bold ${p.stock <= p.minStock ? 'text-orange-500' : 'text-emerald-500'}`}>
                      {p.stock} uds.
                    </td>
                    <td className="py-4 text-right font-semibold">{money(p.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="mb-5 text-lg font-bold">Últimos movimientos</h2>
          <div className="space-y-4">
            {movements.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-semibold">{m.product.name}</p>
                  <p className="text-xs text-slate-400">{m.reason || m.type}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${m.type === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {m.type === 'entrada' ? '+' : '-'}{m.quantity}
                </span>
              </div>
            ))}

            {!movements.length && <p className="text-sm text-slate-400">Aún no hay movimientos.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
