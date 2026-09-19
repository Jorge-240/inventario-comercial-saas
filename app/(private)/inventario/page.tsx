'use client';
import { useEffect, useState } from 'react';

type Product = { id: string; name: string; sku: string; stock: number; unitPrice: number };
type Movement = { id: string; type: string; quantity: number; reason: string | null; createdAt: string; product: { name: string; sku: string } };

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [type, setType] = useState('entrada');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const [productsRes, movementsRes] = await Promise.all([fetch('/api/products'), fetch('/api/movements')]);
    setProducts(await productsRes.json());
    setMovements(await movementsRes.json());
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMessage(''); setError('');
    const res = await fetch('/api/movements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, productId, quantity, reason }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setMessage('Movimiento registrado correctamente.'); setQuantity(''); setReason(''); await load();
  }

  return <div className="p-6 md:p-10"><p className="text-sm font-semibold text-brand-600">Operaciones</p><h1 className="mt-1 text-3xl font-bold">Movimientos de inventario</h1><div className="mt-8 grid gap-6 xl:grid-cols-3"><form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-soft"><h2 className="text-lg font-bold">Registrar movimiento</h2><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Tipo<select value={type} onChange={e => setType(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3"><option value="entrada">Entrada</option><option value="salida">Salida</option><option value="ajuste">Ajuste positivo</option></select></label><label className="block text-sm font-semibold">Producto<select required value={productId} onChange={e => setProductId(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3"><option value="">Selecciona un producto</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} · {p.stock} uds.</option>)}</select></label><label className="block text-sm font-semibold">Cantidad<input required min="1" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3" /></label><label className="block text-sm font-semibold">Motivo<input value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej. recepción de mercancía" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3" /></label></div>{error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}{message && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600">{message}</p>}<button className="mt-5 w-full rounded-xl bg-brand-600 py-3 font-bold text-white hover:bg-brand-700">Guardar movimiento</button></form><section className="rounded-2xl bg-white p-6 shadow-soft xl:col-span-2"><h2 className="text-lg font-bold">Historial reciente</h2><div className="mt-5 space-y-3">{movements.map(m => <div key={m.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><div><p className="font-semibold">{m.product.name} <span className="text-xs font-normal text-slate-400">{m.product.sku}</span></p><p className="text-xs text-slate-500">{m.reason || 'Sin motivo'} · {new Date(m.createdAt).toLocaleString('es')}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${m.type === 'entrada' || m.type === 'ajuste' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{m.type === 'salida' ? '-' : '+'}{m.quantity}</span></div>)}{!movements.length && <p className="text-sm text-slate-400">No hay movimientos registrados.</p>}</div></section></div></div>;
}
