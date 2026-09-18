import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 401 });
    await createSession({ userId: user.id, companyId: user.companyId, role: user.role, name: user.name, email: user.email });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'No se pudo iniciar sesión' }, { status: 500 }); }
}
