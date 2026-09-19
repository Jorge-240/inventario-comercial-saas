import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function CustomersPage() {
  const session = await getSession();
  if (!session) return null;

  const customers = await db.customer.findMany({ where: { companyId: session.companyId }, orderBy: { name: 'asc' } });

  return (
    <div className="p-6 md:p-10">
      <p className="text-sm font-semibold text-brand-600">Clientes</p>
      <h1 className="mt-1 text-3xl font-bold">Lista de clientes</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {customers.map((customer) => (
          <div key={customer.id} className="rounded-2xl bg-white p-5 shadow-soft">
            <h2 className="text-lg font-bold">{customer.name}</h2>
            <p className="mt-2 text-sm text-slate-500">{customer.email || 'Sin correo'}</p>
            <p className="text-sm text-slate-500">{customer.phone || 'Sin teléfono'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
