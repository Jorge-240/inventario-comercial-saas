import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const categories = await db.category.findMany({ where: { companyId: session.companyId }, orderBy: { name: 'asc' } });
  return NextResponse.json(categories);
}
