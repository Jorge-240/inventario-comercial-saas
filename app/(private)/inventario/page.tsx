'use client';
import { useState } from 'react';

export default function InventoryPage() {
  const [tab, setTab] = useState<'entradas' | 'salidas' | 'ajustes'>('entradas');

  return (
    <div className="p-6 md:p-10">
      <p className="text-sm font-semibold text-brand-600">Operaciones</p>
      <h1 className="mt-1 text-3xl font-bold">Movimientos de inventario</h1>

      <div className="mt-8 rounded-2xl bg-white p-5 shadow-soft">
        <div className="mb-6 flex flex-wrap gap-3">
          {['entradas', 'salidas', 'ajustes'].map((option) => (
            <button
              key={option}
              onClick={() => setTab(option as 'entradas' | 'salidas' | 'ajustes')}
              className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === option ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm text-slate-500">Módulo activo:</p>
          <h2 className="mt-2 text-2xl font-bold capitalize">{tab}</h2>
          <p className="mt-4 text-slate-600">
            Registra {tab} del inventario para mantener el control real del stock por empresa.
          </p>
        </div>
      </div>
    </div>
  );
}
