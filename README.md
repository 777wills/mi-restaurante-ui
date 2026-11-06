# Mi Restaurante UI

Frontend de «Mi Restaurante»: aplicación Angular cliente (CSR), compilada como sitio estático, para que
los comensales vean el menú y hagan pedidos en mesa.

## Requisitos

- Node.js 26 (la instalación falla con otra versión mayor). Con nvm: `nvm use 26`.
- [pnpm](https://pnpm.io/) como gestor de paquetes.
- Backend local `mi-restaurante-ms` escuchando en `http://localhost:5110`.

## Puesta en marcha

```bash
pnpm install
pnpm start
```

Abre `http://localhost:4200/`. En desarrollo, las solicitudes a `/api` se reenvían al backend en
`http://localhost:5110` mediante `proxy.conf.json`; el código usa siempre rutas relativas `/api/v1/...`.

## Comandos

| Comando              | Descripción                                                          |
| -------------------- | -------------------------------------------------------------------- |
| `pnpm install`       | Instala las dependencias                                             |
| `pnpm start`         | Servidor de desarrollo con proxy a `/api`                            |
| `pnpm lint`          | Lint de TypeScript y plantillas (incluye accesibilidad)              |
| `pnpm test`          | Pruebas con Vitest (modo observador)                                 |
| `pnpm test:coverage` | Pruebas con cobertura; falla si las líneas están por debajo del 80 % |
| `pnpm build`         | Compilación de producción en `dist/mi-restaurante-ui/browser/`       |

## Reglas del proyecto

La fuente única de verdad es la [constitución](.specify/memory/constitution.md). Toda funcionalidad
sigue el flujo de Spec Kit (spec, plan, tareas e implementación).
