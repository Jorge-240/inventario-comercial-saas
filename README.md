# Inventario Comercial SaaS

Aplicación base de inventario comercial multi-tenant construida con Next.js, TypeScript, Tailwind CSS y Prisma.

## Inicio rápido

```bash
npm install
cp .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

Abre `http://localhost:3000` y usa:

- Correo: `admin@demo.com`
- Contraseña: `admin123`

## Multi-tenant

Cada empresa tiene un `companyId`. Las rutas protegidas obtienen la empresa desde la sesión firmada, nunca desde el navegador. Los productos, clientes, proveedores, ventas, compras y movimientos siempre se consultan filtrando por ese identificador.

Para producción, usa PostgreSQL, cambia `DATABASE_URL`, `JWT_SECRET` y configura HTTPS. También se recomienda activar Row-Level Security como defensa adicional.

## Estructura sencilla

- `app/`: páginas y API.
- `components/`: componentes visuales reutilizables.
- `lib/auth.ts`: sesión segura en cookie HttpOnly.
- `lib/db.ts`: cliente Prisma.
- `prisma/schema.prisma`: modelos y relaciones.
