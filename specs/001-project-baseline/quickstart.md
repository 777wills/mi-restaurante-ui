# Quickstart: validación de la base del proyecto

Guía de validación de extremo a extremo. Detalles en [data-model.md](./data-model.md) y en
[contracts/](./contracts/). Se ejecuta tras la implementación.

## Requisitos

- Node.js 26 (`nvm use 26`), pnpm 12 y `curl`.
- Backend `mi-restaurante-ms` en `http://localhost:5110` (solo para el escenario 2).

## 1. Sitio estático (US1)

```bash
pnpm install
pnpm build
ls dist/mi-restaurante-ui          # esperado: solo `browser/` (y sin `server/`)
npx serve dist/mi-restaurante-ui/browser    # cualquier servidor de archivos estáticos
```

Esperado: el build respeta los presupuestos; la página carga y muestra el shell sin errores en
la consola. Comprobar que no quedan referencias a SSR:

```bash
grep -rEn "platform-server|@angular/ssr|express|provideClientHydration|serve:ssr" package.json angular.json src
```

Esperado: sin resultados.

## 2. Proxy `/api` (US2)

```bash
pnpm start
curl -i http://localhost:4200/api/<ruta-existente>   # backend arriba: respuesta del backend
curl -i http://localhost:4200/apiario                # la atiende la aplicación (no el backend)
```

Esperado: lo descrito en [contracts/dev-proxy.md](./contracts/dev-proxy.md); con el backend
apagado, `/api/...` responde error y `pnpm start` sigue activo. Comprobar que no hay URLs
absolutas del backend ni `environment*.ts`:

```bash
grep -rn "localhost:5110" src; ls src/environments 2>&1
```

## 3. Node.js 26 (US3)

```bash
nvm use 26 && pnpm install      # éxito
nvm use 24 && pnpm install      # falla; el mensaje de pnpm cita engines node ^26.0.0
nvm use 26
```

Esperado: la versión solo aparece en `engines.node` (y `@types/node` ^26); no hay `.nvmrc`.

## 4. Idioma y formato (US4)

- Con `pnpm start`, inspeccionar el documento: `lang="es-CO"`, título «Mi Restaurante», `h1` y
  `main` visibles, sin contenido de ejemplo.
- `pnpm test`: las pruebas de `locale.spec.ts` y `app.spec.ts` pasan.
- Revisar con axe DevTools el shell en tema claro y oscuro (emulación de
  `prefers-color-scheme`): 0 incidencias.

## 5. Puertas de calidad (US5)

```bash
pnpm lint                       # 0 errores
pnpm test:coverage              # pasan y líneas >= 80 %
```

Comprobaciones negativas (revertir después):

1. Añadir `<img src="x">` en `src/app/app.html` → `pnpm lint` falla (`alt-text`).
2. Subir temporalmente el umbral a `100` en `angular.json` (o añadir código sin pruebas) →
   `pnpm test:coverage` falla indicando el umbral.

Además: `pnpm audit --prod --audit-level high` sin vulnerabilidades altas o críticas.

## 6. Documentación y skill (US6)

- Seguir el README desde un clon limpio hasta tener la aplicación conectada al backend.
- Comparar `CLAUDE.md` y README con la constitución: 0 contradicciones.
- Verificar `.claude/skills/frontend-design/` versionada (`git ls-files .claude/skills/frontend-design`).
