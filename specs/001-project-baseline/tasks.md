---

description: "Lista de tareas para la base del proyecto alineada con la constitución"
---

# Tasks: Base del proyecto alineada con la constitución

**Input**: Documentos de diseño en `/specs/001-project-baseline/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Solicitadas por la constitución (Principio VII, TDD en la lógica) y por la spec (FR-017, FR-021). Las pruebas de `locale.spec.ts` y `app.spec.ts` se escriben primero y deben fallar antes de la implementación. Sin snapshots.

**Organization**: Tareas agrupadas por historia de usuario. Proyecto único Angular en la raíz del repositorio; no se crean carpetas nuevas bajo `src/app/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia a la que pertenece la tarea (US1…US6)
- Rutas relativas a la raíz del repositorio `/media/wills/Diplomado Universidad FET/proyecto/mi-restaurante-ui`
- Responder y documentar siempre en español; comandos con `pnpm` (nunca `npm`/`yarn`)

> **Archivos compartidos**: `angular.json`, `package.json` y `src/app/app.config.ts` los tocan varias historias. Esas tareas NO llevan `[P]` y deben aplicarse en el orden indicado.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dejar el entorno y la spec listos antes de tocar la base técnica

> **Orden**: T033 y T002a se numeran fuera de secuencia, pero se ejecutan en esta fase, antes de T003.

- [X] T001 Cambiar a Node 26 en la terminal (`nvm use 26`) y comprobar `node -v` (v26.x); el resto de tareas se ejecutan con esa versión
- [X] T002 [P] Confirmar que el «Independent Test» de US2 en `specs/001-project-baseline/spec.md` ya usa una ruta `/api/v1/...` existente en el backend y no `/openapi/v1.json` (que no pasa por el proxy; ver `contracts/dev-proxy.md`); sin cambios si ya es así
- [X] T002a Confirmar que se trabaja en la rama `001-project-baseline` (`git branch --show-current`); al terminar, integrar a `main` mediante pull request con commits Conventional Commits en español, incluyendo en la descripción el resultado local de lint, pruebas con cobertura, build y `pnpm audit` (el CI se crea en una feature posterior)
- [X] T033 [US6] Instalar la skill con `pnpm dlx skills add anthropics/skills@frontend-design` dirigida a Claude Code y copiada (no enlace simbólico) a `.claude/skills/frontend-design/`; conservar solo los archivos necesarios (revisar lockfiles o carpetas `.agents/` generados y eliminarlos) y dejarlos versionables. Va en Setup para poder apoyar las decisiones visuales de T021 y T022 (Principio VIII)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Línea base verificada antes de modificar nada

**⚠️ CRITICAL**: Ninguna historia empieza hasta completar esta fase

- [X] T003 Ejecutar `pnpm install` y registrar el resultado de `pnpm build` y `pnpm test` actuales (línea base antes de los cambios) usando `package.json` y `angular.json` sin modificar

**Checkpoint**: Línea base conocida; las historias pueden comenzar

---

## Phase 3: User Story 1 - Compilar la aplicación como sitio estático (Priority: P1) 🎯 MVP

**Goal**: La compilación de producción genera solo archivos estáticos para el navegador, sin SSR, prerender ni hidratación.

**Independent Test**: `pnpm build` deja solo `dist/mi-restaurante-ui/browser/` (sin `server/`), respeta los presupuestos y se sirve con un servidor estático genérico mostrando el shell sin errores en consola.

### Implementation for User Story 1

- [X] T004 [US1] En `angular.json` (target `build.options`) eliminar `server`, `ssr` y `security.allowedHosts`, y fijar `"outputMode": "static"`; dejar los presupuestos de `production` sin cambios (inicial: aviso `500kB` / error `1MB`; `anyComponentStyle`: aviso `4kB` / error `8kB`)
- [X] T005 [P] [US1] Eliminar los archivos `src/server.ts`, `src/main.server.ts`, `src/app/app.config.server.ts` y `src/app/app.routes.server.ts`
- [X] T006 [US1] En `src/app/app.config.ts` quitar `provideClientHydration()` y su import de `@angular/platform-browser`
- [X] T007 [US1] En `package.json` quitar las dependencias `@angular/platform-server`, `@angular/ssr`, `express`, `@types/express` y el script `serve:ssr:mi-restaurante-ui`; luego ejecutar `pnpm install` para regenerar `pnpm-lock.yaml`
- [X] T008 [US1] Verificar US1: `pnpm build` termina sin errores, `ls dist/mi-restaurante-ui` muestra solo `browser/`, `grep -rEn "platform-server|@angular/ssr|express|provideClientHydration|serve:ssr" package.json angular.json src` no devuelve resultados, y la salida cargada con `pnpm dlx serve dist/mi-restaurante-ui/browser` muestra el shell sin errores de consola

**Checkpoint**: US1 funcional y verificable por sí sola (MVP)

---

## Phase 4: User Story 2 - Conectar el entorno de desarrollo con el backend local (Priority: P1)

**Goal**: En desarrollo, toda solicitud cuyo primer segmento es exactamente `/api` llega a `http://localhost:5110` con la ruta completa; el resto lo atiende la aplicación.

**Independent Test**: Con `pnpm start` y el backend en `:5110`, `curl -i http://localhost:4200/api/<ruta-existente>` devuelve la respuesta del backend y `curl -i http://localhost:4200/apiario` lo atiende la aplicación.

### Implementation for User Story 2

- [X] T009 [P] [US2] Crear `proxy.conf.json` en la raíz con la clave regex `"^/api([/?]|$)"` y `"target": "http://localhost:5110"` (sin `changeOrigin` ni `secure`), según `specs/001-project-baseline/contracts/dev-proxy.md`
- [X] T010 [US2] En `angular.json` añadir `"options": { "proxyConfig": "proxy.conf.json" }` al target `serve` (junto a sus `configurations`)
- [X] T011 [US2] Verificar US2 según `specs/001-project-baseline/quickstart.md` §2: con el backend arriba `/api/...` se reenvía, `/apiario` no, y con el backend apagado `/api/...` responde error 5xx sin detener `pnpm start`; comprobar que `grep -rn "localhost:5110" src` no devuelve resultados y que no existe `src/environments`

**Checkpoint**: US1 y US2 funcionan de forma independiente

---

## Phase 5: User Story 3 - Exigir Node.js 26 LTS (Priority: P2)

**Goal**: Instalar con una versión mayor de Node distinta de 26 falla con un mensaje que cita la versión requerida.

**Independent Test**: `nvm use 26 && pnpm install` tiene éxito; `nvm use 24 && pnpm install` falla citando `engines` `^26.0.0`.

### Implementation for User Story 3

- [X] T012 [US3] En `package.json` añadir `"engines": { "node": "^26.0.0" }` (único lugar donde se declara la versión de Node; sin `.nvmrc`, `.node-version` ni `engineStrict`) y cambiar `@types/node` a `^26` en `devDependencies`
- [X] T013 [US3] Ejecutar `pnpm install` con Node 26 para actualizar `pnpm-lock.yaml` y comprobar que termina con éxito
- [X] T014 [US3] Verificar US3: `nvm use 24 && pnpm install` falla con un mensaje que cita `node ^26.0.0`; volver con `nvm use 26`; confirmar que no existen `.nvmrc` ni `.node-version`

**Checkpoint**: US3 verificada; las demás tareas siguen ejecutándose con Node 26

---

## Phase 6: User Story 4 - Idioma y formato regional de Colombia (Priority: P2)

**Goal**: Documento y aplicación en `es-CO`, con shell accesible (encabezado + región principal) y números, fechas y precios con formato colombiano (COP sin decimales por defecto).

**Independent Test**: `pnpm test` pasa (`locale.spec.ts` y `app.spec.ts`); el documento tiene `lang="es-CO"` y título «Mi Restaurante»; axe DevTools reporta 0 incidencias en tema claro y oscuro.

### Tests for User Story 4 (escribir PRIMERO; deben FALLAR antes de implementar) ⚠️

- [X] T015 [P] [US4] Crear `src/app/locale.spec.ts` con `TestBed` y las pipes `CurrencyPipe`, `DecimalPipe` y `DatePipe` sin registrar el locale a mano y con `TestBed` configurado con `providers: appConfig.providers` (sin los providers del router) para que el precio sin moneda explícita salga en COP: `25000 | currency:undefined:'symbol':'1.0-0'` → `$ 25.000` (comparar el espacio contra U+00A0), `0` → `$ 0`, `1234.5 | number` → `1.234,5`, una fecha con `date` → nombre de mes en español y orden día-mes-año (US4-3, US4-4, US4-5; FR-021)
- [X] T016 [P] [US4] Reescribir `src/app/app.spec.ts` para verificar comportamiento sin snapshots: existe un `<header>` con un único `<h1>` con el texto «Mi Restaurante», existe un `<main>` que contiene `<router-outlet>`, el texto del shell no contiene palabras de la plantilla de ejemplo (p. ej. «Hello»), y `src/index.html` (leído con `node:fs`) contiene `lang="es-CO"` y `<title>Mi Restaurante</title>`; eliminar la prueba de «Hello, mi-restaurante-ui» (US4-1, US4-2, FR-010, FR-013, FR-015, FR-017)
- [X] T017 [US4] Ejecutar `pnpm test` y confirmar que las pruebas nuevas FALLAN (rojo). Si `locale.spec.ts` falla por `en-US`, registrar `es-CO` una sola vez en el `providersFile`/`setupFiles` del target `test` de `angular.json` en lugar de en cada prueba, y anotar el resultado en la sección R7 de `specs/001-project-baseline/research.md`; ese registro es el único provider adicional permitido

### Implementation for User Story 4

- [X] T018 [US4] En `angular.json` añadir a nivel de proyecto `"i18n": { "sourceLocale": "es-CO" }` (sin `localize`)
- [X] T019 [US4] En `src/app/app.config.ts` añadir el provider `{ provide: DEFAULT_CURRENCY_CODE, useValue: 'COP' }` (import desde `@angular/core`)
- [X] T020 [P] [US4] En `src/index.html` cambiar `<html lang="en">` por `<html lang="es-CO">` y `<title>MiRestauranteUi</title>` por `<title>Mi Restaurante</title>`
- [X] T021 [P] [US4] Reescribir `src/app/app.html` con `<header><h1>Mi Restaurante</h1></header>` y `<main><router-outlet /></main>`; solo utilidades de Tailwind (mobile-first), sin contenido de ejemplo ni texto en inglés; mantener la plantilla en `app.html` (ya existe) en lugar de pasarla a línea para no ampliar el cambio
- [X] T022 [US4] En `src/app/app.ts` quitar `styleUrl` y el signal `title`, y añadir al objeto `host` del `@Component` las clases `bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-50` (sin `@HostBinding`, sin `standalone: true` ni `OnPush` explícitos); eliminar `src/app/app.css`
- [X] T023 [US4] Ejecutar `pnpm test` y confirmar que todo pasa (verde); no usar `toMatchSnapshot`
- [X] T024 [US4] Verificar US4 manualmente con `pnpm start`: `lang="es-CO"`, título «Mi Restaurante», `h1` y `main` visibles, sin contenido de ejemplo; revisar con axe DevTools el shell en tema claro y oscuro (emulando `prefers-color-scheme`) con 0 incidencias

**Checkpoint**: US4 funcional; el shell y el formato regional quedan cubiertos por pruebas

---

## Phase 7: User Story 5 - Puertas de calidad ejecutables en local (Priority: P3)

**Goal**: Comandos `pnpm lint` (con reglas de accesibilidad de plantillas) y `pnpm test:coverage` que falla bajo el 80 % de líneas.

**Independent Test**: `pnpm lint` termina con 0 errores; `pnpm test:coverage` pasa con líneas ≥ 80 %; una infracción temporal de accesibilidad hace fallar el lint y un umbral temporal de 100 hace fallar la cobertura.

### Implementation for User Story 5

- [X] T025 [US5] Ejecutar `pnpm ng add angular-eslint` para instalar `eslint`, `angular-eslint` y `typescript-eslint`, crear `eslint.config.js` (flat config) y el target `lint` en `angular.json`
- [X] T026 [US5] En `eslint.config.js` asegurar `tseslint.configs.recommended` y `angular.configs.tsRecommended` para `.ts`, y `angular.configs.templateRecommended` y `angular.configs.templateAccessibility` para `.html`
- [X] T027 [US5] Ejecutar `pnpm add -D @vitest/coverage-v8@<versión exacta de vitest>` (comprobar con `pnpm why vitest`; deben ser idénticas, p. ej. `5.1.0`)
- [X] T028 [US5] En `angular.json` añadir al target `test` `"options": { "coverageThresholds": { "lines": 80 } }` sin `coverageExclude`
- [X] T029 [US5] En `package.json` añadir los scripts `"lint": "ng lint"` y `"test:coverage": "ng test --coverage --no-watch"`
- [X] T030 [US5] Verificar US5: `pnpm lint` (0 errores) y `pnpm test:coverage` (pasan, líneas ≥ 80 %, informe incluye `src/app`); pruebas negativas temporales (revertir después): `<img src="x">` en `src/app/app.html` hace fallar `pnpm lint` por `alt-text`, y subir el umbral a `100` en `angular.json` hace fallar `pnpm test:coverage` indicando el umbral

**Checkpoint**: Puertas de calidad operativas

---

## Phase 8: User Story 6 - Documentación y herramientas del equipo alineadas (Priority: P3)

**Goal**: README en español, `CLAUDE.md` actualizado y skill `frontend-design` versionada en el proyecto.

**Independent Test**: Seguir el README desde un clon limpio hasta tener la app conectada al backend; `CLAUDE.md` sin contradicciones con la constitución; `git ls-files .claude/skills/frontend-design` lista archivos.

### Implementation for User Story 6

- [X] T031 [P] [US6] Reescribir `README.md` por completo en español: requisitos (Node.js 26, pnpm, backend local `mi-restaurante-ms` en el puerto 5110), comandos `pnpm install`, `pnpm start`, `pnpm lint`, `pnpm test`, `pnpm test:coverage`, `pnpm build`, y una referencia a `.specify/memory/constitution.md`
- [X] T032 [P] [US6] Actualizar la sección «Comandos» de `CLAUDE.md` con `pnpm lint` y `pnpm test:coverage` y añadir la nota de Node 26; no tocar el resto ni editar `.specify/memory/constitution.md`
- [X] T034 [US6] Verificar US6: README y `CLAUDE.md` frente a la constitución (0 contradicciones) y `git ls-files .claude/skills/frontend-design` (tras `git add`) lista los archivos de la skill

**Checkpoint**: Todas las historias completas

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Validación final de extremo a extremo

- [X] T035 Ejecutar de principio a fin `specs/001-project-baseline/quickstart.md` (secciones 1-6) con Node 26, cronometrando desde la instalación hasta la app en marcha conectada al backend (sin contar descargas) para comprobar SC-007 (menos de 15 minutos)
- [X] T036 [P] Ejecutar `pnpm audit --prod --audit-level high` y confirmar que no hay vulnerabilidades altas o críticas
- [X] T037 [P] Comprobar en `src` que no hay `toMatchSnapshot`, `environment*.ts`, ni URLs absolutas del backend, y que `ng build` no deja warnings de presupuesto
- [X] T038 Revisar `git status` para confirmar que `angular.json`, `package.json`, `pnpm-lock.yaml`, `proxy.conf.json`, `eslint.config.js`, `README.md`, `CLAUDE.md` y `.claude/skills/frontend-design/` son los únicos cambios esperados (sin `.agents/` ni lockfiles de `skills`, ver T033)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de T001; bloquea todas las historias
- **US1 y US2 (P1)**: tras la fase 2; son independientes entre sí, pero comparten `angular.json` (T004 antes de T010)
- **US3 (P2)**: tras la fase 2; comparte `package.json` con US1 (T007 antes de T012)
- **US4 (P2)**: tras la fase 2; comparte `app.config.ts` con US1 (T006 antes de T019) y `angular.json` con US1/US2 (T004/T010 antes de T018)
- **US5 (P3)**: depende de US4 (cobertura medida sobre el código final del shell y de `locale.spec.ts`)
- **US6 (P3)**: el README y `CLAUDE.md` requieren que existan los comandos de US5 (T029); T033 (skill) se hace en Setup, antes de US4
- **Polish (Fase 9)**: depende de todas las historias

### Within Each Story

- US4: pruebas (T015-T017, rojo) → configuración (T018-T019) → shell (T020-T022) → verde (T023) → revisión manual (T024)
- Tareas sobre el mismo archivo se aplican en orden numérico

### Parallel Opportunities

- T002 (Setup) en paralelo con T001
- US1: T005 en paralelo con T004
- US2: T009 en paralelo con tareas de US1
- US4: T015 y T016 en paralelo; T020 y T021 en paralelo
- US6: T031 y T032 en paralelo (T033 se ejecuta en Setup)
- Polish: T036 y T037 en paralelo

---

## Parallel Example: User Story 4

```bash
# Pruebas en paralelo (archivos distintos):
Task: "Crear src/app/locale.spec.ts con pruebas de número, fecha y precio COP"
Task: "Reescribir src/app/app.spec.ts con pruebas de header/h1 y main"

# Shell en paralelo (archivos distintos):
Task: "Cambiar lang y título en src/index.html"
Task: "Reescribir src/app/app.html con header + main + router-outlet"
```

---

## Implementation Strategy

### MVP First (US1)

1. Fase 1 (Setup) y Fase 2 (línea base)
2. Fase 3 (US1): sitio estático
3. **DETENER y VALIDAR**: build solo estático y servido con servidor genérico
4. Continuar con US2 (también P1) antes de dar la base por conectada al backend

### Incremental Delivery

1. Setup + Foundational → línea base
2. US1 → US2 (P1) → verificar cada una
3. US3 → US4 (P2) → TDD en US4
4. US5 → US6 (P3)
5. Polish: quickstart completo y auditoría

---

## Notes

- El workflow de CI/CD está fuera de alcance (decisión del desarrollador); las puertas se ejecutan en local
- No se crean `core/`, `shared/`, rutas, features, `environment.ts`, `tailwind.config.js` ni `@theme` propio
- Verificar que las pruebas fallan antes de implementar (US4)
- Hacer commit tras cada tarea o grupo lógico (Conventional Commits)
