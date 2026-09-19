'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [{ href: '/dashboard', label: 'Resumen', icon: '⌂' }, { href: '/productos', label: 'Productos', icon: '▦' }, { href: '/inventario', label: 'Inventario', icon: '↕' }, { href: '/ventas', label: 'Ventas', icon: '$' }, { href: '/compras', label: 'Compras', icon: '⇅' }, { href: '/clientes', label: 'Clientes', icon: '◎' }, { href: '/proveedores', label: 'Proveedores', icon: '◫' }];

export default function Shell({ children, user }: { children: React.ReactNode; user: { name: string; email: string } }) {
  const path = usePathname();
  const router = useRouter();
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login'); router.refresh(); }
  return <div className="min-h-screen md:flex"><aside className="w-full bg-slate-950 p-5 text-white md:fixed md:inset-y-0 md:w-64"><div className="flex items-center gap-3 text-xl font-bold"><span className="rounded-xl bg-brand-500 p-2">▦</span>Stockly</div><p className="mb-8 mt-2 text-xs text-slate-400">Inventario comercial</p><nav className="space-y-2">{navItems.map(item => <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${path === item.href ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}><span>{item.icon}</span>{item.label}</Link>)}</nav><div className="mt-12 border-t border-slate-800 pt-5"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-slate-400">{user.email}</p><button onClick={logout} className="mt-4 text-sm text-slate-400 hover:text-white">Cerrar sesión</button></div></aside><main className="w-full md:ml-64">{children}</main></div>;
}
