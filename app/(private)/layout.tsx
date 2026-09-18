import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Shell from '@/components/Shell';
export default async function PrivateLayout({ children }: { children: React.ReactNode }) { const session = await getSession(); if (!session) redirect('/login'); return <Shell user={session}>{children}</Shell>; }
