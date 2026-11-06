# Contrato: comandos del proyecto

Interfaz del proyecto para el desarrollador (`package.json`). Todos se ejecutan con Node.js 26 y
pnpm.

| Comando | Acción | Éxito | Fallo |
| --- | --- | --- | --- |
| `pnpm install` | instala dependencias | con Node 26.x | con otra versión mayor: error de pnpm que cita `engines` (`^26.0.0`) |
| `pnpm start` | `ng serve` en `http://localhost:4200` con proxy `/api` | servidor activo | — |
| `pnpm lint` | `ng lint` (`recommended` + `templateAccessibility`) | 0 errores | cualquier error de lint |
| `pnpm test` | `ng test` (Vitest + jsdom), sin cobertura | pruebas pasan | alguna prueba falla |
| `pnpm test:coverage` | `ng test --coverage --no-watch` | pruebas pasan y líneas ≥ 80 % | prueba falla o cobertura < 80 % (indica el umbral) |
| `pnpm build` | build de producción | `dist/mi-restaurante-ui/browser/` solo estáticos | presupuesto excedido (error a 1 MB) |

## Reglas

- Se elimina `serve:ssr:mi-restaurante-ui`; no existe ningún comando de servidor propio.
- Node.js 26 se declara únicamente en `engines.node` (`^26.0.0`); `@types/node` es `^26`.
- `@vitest/coverage-v8` tiene exactamente la misma versión que `vitest`.
- El umbral vive en `angular.json` (`test.options.coverageThresholds.lines = 80`), no en los
  scripts.
- No hay comando de formato ni hooks de Git (fuera de alcance).
