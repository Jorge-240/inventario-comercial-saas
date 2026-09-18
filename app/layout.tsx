import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Stockly | Inventario comercial', description: 'Gestión de inventario para empresas modernas' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="es"><body>{children}</body></html>; }
