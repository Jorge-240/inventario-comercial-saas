# Inventario Comercial SaaS

SaaS multi-tenant para inventario, ventas, compras, contactos, usuarios, facturación y reportes.

## Estado de la siguiente etapa

La aplicación está preparada para incorporar PostgreSQL, formularios de clientes y proveedores, edición y baja lógica de productos, usuarios y roles, reportes CSV, facturación, pruebas multi-tenant y despliegue seguro.

## Producción

Configura `DATABASE_URL` y `JWT_SECRET` como secretos del proveedor de hosting. Despliega detrás de HTTPS, no subas archivos `.env`, ejecuta las migraciones durante el release y habilita backups de PostgreSQL.
