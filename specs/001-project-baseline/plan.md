# Implementation Plan: Base del proyecto alineada con la constitución

**Branch**: `001-project-baseline` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-project-baseline/spec.md`

## Summary

Dejar el proyecto Angular generado por el CLI conforme a la constitución 1.0.0, sin añadir
funcionalidad de producto. El enfoque técnico, resuelto en [research.md](./research.md), es:

- **Sitio estático (P1)**: quitar SSR (dependencias, archivos y opciones del builder) y fijar
  `outputMode: "static"` sin `server`; la salida es solo `dist/mi-restaurante-ui/browser`.
- **Proxy de desarrollo (P1)**: `proxy.conf.json` con la clave regex `^/api([/?]|$)` hacia
  `http://localhost:5110`, enlazado en `serve.options.proxyConfig`.
- **Node 26 (P2)**: `engines.node = "^26.0.0"` en `package.json`; pnpm falla la instalación por sí
  solo cuando el proyecto raíz declara un `engines` incompatible (sin `engineStrict` ni archivos
  extra). `@types/node` pasa a `^26`.
- **es-CO (P2)**: `i18n.sourceLocale = "es-CO"` (el builder registra los datos del locale y fija
  `LOCALE_ID`), `lang="es-CO"`, `DEFAULT_CURRENCY_CODE = "COP"` y `CurrencyPipe` con
  `digitsInfo` `1.0-0` (Angular trae COP con 2 decimales; ver R6).
- **Shell (P2)**: `App` con `<header>` + `<h1>Mi Restaurante</h1>` y `<main>` con `<router-outlet />`,
  estilos solo con utilidades de Tailwind (`dark:` por `prefers-color-scheme`), sin `app.css`.
- **Puertas de calidad (P3)**: `angular-eslint` (`recommended` + `templateAccessibility`) con
  `ng lint`; `@vitest/coverage-v8` y `coverageThresholds.lines = 80` en el target `test`.
- **Documentación y skill (P3)**: README en español, `CLAUDE.md` actualizado e instalación de
  `anthropics/skills@frontend-design` en `.claude/skills/`.

CI/CD queda fuera de alcance por decisión del desarrollador.

## Technical Context

**Language/Version**: TypeScript ~6.0 (`strict` y `strictTemplates`), Angular 22.2.x, Node.js 26 LTS

**Primary Dependencies**: `@angular/{common,compiler,core,forms,platform-browser,router}`, `rxjs`,
`tslib`; dev: `@angular/build`, `@angular/cli`, `tailwindcss` + `@tailwindcss/postcss`, `vitest` +
`jsdom`. Se **añaden** (dev): `eslint`, `angular-eslint`, `typescript-eslint`,
`@vitest/coverage-v8`. Se **quitan**: `@angular/platform-server`, `@angular/ssr`, `express`,
`@types/express`.

**Storage**: N/A

**Testing**: Vitest 5.1 + jsdom vía `ng test` (`@angular/build:unit-test`); `TestBed` para
componentes; cobertura con `@vitest/coverage-v8` (versión exactamente igual a `vitest`).
**Criterios de verificación manual**: US1-US3 (compilación estática, proxy, versión de Node) y
US4-6 (axe) se verifican con los pasos del quickstart por no ser automatizables con Vitest; el
resto de los criterios de aceptación tiene al menos una prueba automática (Principio VII).

**Target Platform**: navegadores modernos, móvil primero; salida estática servible por cualquier
hosting de archivos estáticos (el hosting está fuera de alcance)

**Project Type**: web (frontend SPA/CSR; el backend `mi-restaurante-ms` es un sistema externo)

**Performance Goals**: presupuesto de `angular.json` sin cambios (inicial: aviso 500 kB / error
1 MB; estilos por componente: aviso 4 kB / error 8 kB)

**Constraints**: sin SSR/prerender/hidratación; sin `environment.ts` ni URLs absolutas del backend;
sin hooks de Git; sin `tailwind.config.js`; sin exclusiones de cobertura para inflar el umbral

**Scale/Scope**: 1 componente raíz, 0 rutas, 0 features; ~10 archivos de configuración tocados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Estado |
| --- | --- | --- |
| I. Simplicidad | La feature elimina piezas (Express, SSR, 4 archivos). Las 4 dependencias nuevas las exige la constitución y se justifican en Complexity Tracking. No se crean `core/`, `shared/` ni tokens. | Pasa |
| II. Alcance acotado | Sin funcionalidad de producto; solo base técnica. | Pasa |
| III. CSR estático | Núcleo de la feature: `outputMode: "static"`, sin SSR ni hidratación. | Pasa |
| IV. Arquitectura por feature | Sin features nuevas; `App` standalone (por defecto) sin `standalone: true` ni `OnPush` explícitos. `app.routes.ts` queda vacío. | Pasa |
| V. Contrato con el backend | Proxy `/api` → `localhost:5110`; sin URLs absolutas ni `environment.ts`. No se inventan endpoints. | Pasa |
| VI. Accesibilidad WCAG 2.2 AA | `<header>`/`<main>`/`<h1>` nativos; lint `templateAccessibility`; revisión con axe en ambos temas (manual, en quickstart). | Pasa |
| VII. Pruebas primero | TDD para formato regional y shell (tests antes que `app.html`/config); cobertura ≥ 80 % con umbral que falla; sin snapshots. | Pasa |
| VIII. Tailwind + es-CO | Solo utilidades Tailwind y tema por `prefers-color-scheme`; `sourceLocale` es-CO, `lang="es-CO"`, COP con `CurrencyPipe`. Sin `@theme` propio: el shell usa la paleta por defecto (nada que tokenizar aún). | Pasa |
| IX. Plataforma | Node 26 en `engines` (único lugar), `@types/node ^26`, TS ~6.0, pnpm. | Pasa |
| Seguridad | Sin secretos; `pnpm audit` se ejecuta en local (CI pospuesto). | Pasa |
| Flujo / CI | La constitución exige que el CI ejecute lint, pruebas con cobertura, build y `pnpm audit`. Esta feature no lo crea (decisión del desarrollador, registrada en la spec). Es una excepción puntual justificada en Complexity Tracking. | Excepción justificada |

**Re-evaluación tras el diseño (Phase 1)**: sin cambios; el diseño no introduce piezas adicionales
a las ya listadas. Gate superado.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-baseline/
├── plan.md              # Este archivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
│   ├── dev-proxy.md
│   ├── project-commands.md
│   └── shell-ui.md
└── tasks.md             # Phase 2 (/speckit-tasks; no lo crea este comando)
```

### Source Code (repository root)

```text
angular.json             # build: outputMode static, sin server/ssr/security; serve.proxyConfig;
                         # i18n.sourceLocale es-CO; test.coverageThresholds; lint target
proxy.conf.json          # NUEVO: ^/api([/?]|$) → http://localhost:5110
eslint.config.js         # NUEVO: recommended + templateAccessibility (flat config)
package.json             # engines, scripts (lint, test:coverage), deps añadidas/quitadas
pnpm-lock.yaml           # regenerado por pnpm
README.md                # reescrito en español
CLAUDE.md                # comandos vigentes (lint, cobertura, Node 26)
.claude/skills/frontend-design/   # NUEVO (anthropics/skills), versionado
src/
├── index.html           # lang="es-CO", <title>Mi Restaurante</title>
├── main.ts              # sin cambios
├── styles.css           # sin cambios (solo @import 'tailwindcss')
├── main.server.ts       # ELIMINADO
├── server.ts            # ELIMINADO
└── app/
    ├── app.ts           # sin styleUrl ni title signal
    ├── app.html         # reescrito: header + h1 + main + router-outlet
    ├── app.css          # ELIMINADO
    ├── app.spec.ts      # reescrito: comportamiento del shell
    ├── app.config.ts    # sin provideClientHydration; DEFAULT_CURRENCY_CODE 'COP'
    ├── app.routes.ts    # sin cambios
    ├── app.config.server.ts  # ELIMINADO
    ├── app.routes.server.ts  # ELIMINADO
    └── locale.spec.ts   # NUEVO: número, fecha y precio con CurrencyPipe/DecimalPipe/DatePipe
```

**Structure Decision**: proyecto único Angular en la raíz del repositorio (estructura ya
existente). No se crean carpetas nuevas bajo `src/app/`; `locale.spec.ts` verifica la
configuración de la aplicación y no justifica una carpeta propia.

## Complexity Tracking

> Las únicas adiciones son herramientas que la constitución exige explícitamente; se registran por
> el Principio I.

| Adición | Por qué es necesaria | Alternativa más simple rechazada porque |
| --- | --- | --- |
| `eslint` + `angular-eslint` | Principio VI exige lint `templateAccessibility`. | Sin lint no hay forma automática de hacer cumplir la accesibilidad de plantillas. |
| `typescript-eslint` | Peer dependency obligatoria de `angular-eslint` para linting de `.ts`. | No se puede omitir: `angular-eslint` no funciona sin ella. |
| `@vitest/coverage-v8` | Principio VII exige cobertura ≥ 80 % medida con ella. | Medir a mano no puede fallar un comando automáticamente. |
| `eslint.config.js` y `proxy.conf.json` | Configuración requerida por ESLint y por el proxy del dev-server (Principio V). | `angular.json` no admite el proxy en línea ni la configuración de ESLint. |
| Excepción: sin workflow de CI | El desarrollador acotó esta feature a la base técnica; las puertas (lint, pruebas con cobertura, build, `pnpm audit`) se ejecutan en local (T030, T035, T036). | Incluir el CI aquí amplía el alcance y mezcla GitHub Actions con la migración a estático. El PR de esta feature se integra con las puertas ejecutadas en local y su resultado anotado en la descripción del PR (T030, T036, T037). La feature de CI es la siguiente y es obligatoria antes de integrar código de producto. |
| Excepción: sin tokens `@theme` | El shell solo usa `bg-stone-*` y `text-stone-*` con `dark:`; aún no hay una paleta de marca que tokenizar. | Definir tokens ahora sería diseñar «por si acaso» (Principio I). Se crean con la primera feature visual que los necesite, que también sustituye las clases `stone-*` del shell. |
