<!--
Informe de impacto de sincronización (Sync Impact Report)
- Versión: plantilla sin versión → 1.0.0 (ratificación inicial).
- Principios: todos nuevos (I a IX).
- Secciones añadidas: Restricciones técnicas; Flujo de desarrollo y puertas de calidad;
  Fuera del alcance actual; Gobernanza.
- Secciones eliminadas: ninguna.
- Plantillas revisadas:
  ✅ .specify/templates/plan-template.md: «Constitution Check» y «Complexity Tracking»
     son compatibles con la sección de Gobernanza.
  ⚠ .specify/templates/tasks-template.md: marca las pruebas como OPCIONALES; en este
     proyecto son obligatorias (Principio VII). La constitución prevalece; la plantilla
     no se modifica.
- Pendientes de implementación (no constitucionales; ver «Next Actions» de la sesión):
  quitar SSR (express, @angular/ssr, @angular/platform-server, src/server.ts,
  src/main.server.ts, app.config.server.ts, app.routes.server.ts) y usar
  outputMode «static»; engines Node 26 y @types/node ^26; i18n.sourceLocale «es-CO»
  y lang="es-CO"; proxyConfig a http://localhost:5110; angular-eslint;
  @vitest/coverage-v8 con umbral del 80 %; workflow de GitHub Actions; instalar la skill
  anthropics/skills@frontend-design; actualizar CLAUDE.md y README.md; reemplazar el
  boilerplate de app.html y app.spec.ts.
-->
# Constitución de Mi Restaurante UI

## Principios fundamentales

### I. Simplicidad (principio rector, NO NEGOCIABLE)

- Ante dos opciones válidas se DEBE elegir la que tenga menos piezas, dependencias y
  conceptos.
- Toda dependencia, capa, abstracción o herramienta nueva DEBE justificarse por escrito en
  la tabla «Complexity Tracking» del plan de la feature que la introduce.
- NO DEBEN crearse carpetas, servicios, abstracciones ni configuraciones «por si acaso»;
  algo existe solo cuando una spec aprobada lo necesita.
- Ante una duda que esta constitución no resuelva, se DEBE preguntar al desarrollador en
  lugar de suponer.

**Razón:** el producto es pequeño; cada pieza extra cuesta mantenimiento, pruebas y
conocimiento sin aportar valor proporcional.

### II. Alcance acotado del producto

- La aplicación DEBE atender solo a comensales: ver el menú y hacer pedidos.
- El pedido DEBE hacerse como invitado (sin cuenta) y en una única modalidad: **en
  mesa**, identificada por el número de mesa.
- NO DEBE haber pagos en línea; el pago ocurre fuera de la aplicación.
- Cualquier funcionalidad fuera de este alcance DEBE pasar primero por una enmienda de
  esta constitución (ver «Fuera del alcance actual»).

**Razón:** acotar usuarios, flujos y datos evita autenticación, roles, pasarelas de pago y
formularios que hoy no se necesitan.

### III. Aplicación cliente estática (CSR)

- La aplicación DEBE compilarse como sitio estático (`outputMode: "static"`) y renderizarse
  solo en el navegador.
- NO DEBEN usarse SSR, prerenderizado, hidratación ni un servidor Node propio.
- El acceso a APIs del navegador DEBERÍA hacerse mediante abstracciones de Angular
  (`DOCUMENT`, `inject()`) cuando existan.

**Razón:** con acceso por QR en la mesa el SEO aporta poco; CSR elimina Express, las
restricciones de plataforma y los problemas de hidratación.

### IV. Arquitectura por feature y estado con signals

- `src/app/` DEBE organizarse por feature (p. ej. `menu/`, `cart/`), cada una cargada con
  lazy loading desde `app.routes.ts`.
- `core/` y `shared/` DEBEN crearse solo cuando exista algo real que poner en ellas.
- El estado compartido (p. ej. el carrito) DEBE vivir en servicios singleton con signals,
  `computed()` y `linkedSignal()`. NO DEBEN usarse librerías de estado (NgRx u otras).
- El carrito DEBE mantenerse solo en memoria; NO DEBE persistirse en `localStorage` ni
  `sessionStorage`.
- Las lecturas HTTP DEBEN hacerse con `httpResource`; las mutaciones (`POST`, `PUT`,
  `DELETE`) DEBEN hacerse con `HttpClient`.
- Los componentes DEBEN ser standalone y seguir las prácticas de Angular descritas en
  `CLAUDE.md`.

**Razón:** signals y `httpResource` (estable desde Angular 22) cubren el estado y la carga
de datos con APIs nativas, sin dependencias adicionales.

### V. Integración con el backend basada en contrato

- El backend es `mi-restaurante-ms` (.NET), un sistema externo. Su documento OpenAPI
  (`/openapi/v1.json`, disponible en Development) DEBE ser la fuente de verdad del
  contrato.
- El frontend DEBE llamar al backend con rutas relativas `/api/v1/...`. En desarrollo,
  el proxy del dev-server (`proxyConfig`) DEBE redirigir `/api` a
  `http://localhost:5110`.
- NO DEBEN usarse archivos `environment.ts` ni URLs absolutas del backend en el código.
- Los tipos del contrato DEBEN escribirse a mano como interfaces TypeScript en camelCase,
  verificadas contra el OpenAPI. NO DEBE añadirse validación en tiempo de ejecución.
- NO DEBEN inventarse endpoints ni campos: todo endpoint DEBE existir en el backend o
  estar acordado en la spec antes de implementarse. La funcionalidad de pedidos DEBE
  esperar a que el backend publique su contrato.
- Los mocks de HTTP DEBEN limitarse a las pruebas (`provideHttpClientTesting` /
  `HttpTestingController`).
- Los errores (ProblemDetails, RFC 9457) DEBEN mostrarse en la vista donde ocurren, con
  un mensaje en español anunciado a tecnologías de asistencia (`role="alert"`) y una
  acción para reintentar. NO DEBEN usarse interceptores globales de errores ni toasts.

**Razón:** las rutas relativas evitan CORS y archivos de entorno; respetar el contrato
real evita retrabajo entre repositorios.

### VI. Accesibilidad WCAG 2.2 AA (NO NEGOCIABLE)

- Toda la interfaz DEBE cumplir WCAG 2.2 nivel AA, incluidos el contraste, la gestión
  del foco, el tamaño mínimo de objetivos táctiles y el uso correcto de ARIA.
- Se DEBEN preferir elementos HTML nativos (`button`, `a`, `input`, `label`, listas)
  antes que roles ARIA sobre elementos genéricos.
- Las plantillas DEBEN pasar el lint de accesibilidad (`angular-eslint`,
  `templateAccessibility`).
- Toda vista nueva o modificada DEBE revisarse con axe DevTools en ambos temas (claro y
  oscuro) y quedar sin incidencias antes de integrarse.

**Razón:** WCAG 2.2 es el estándar vigente (ISO/IEC 40500:2025); el comensal usa su
propio celular y cualquier barrera le impide pedir.

### VII. Pruebas primero en la lógica (NO NEGOCIABLE)

- La lógica (servicios, estado, cálculos como totales del carrito, mapeo de errores)
  DEBE desarrollarse con TDD: prueba que falla → implementación → refactorización.
- Todo componente con comportamiento DEBE tener pruebas de comportamiento (interacción y
  renderizado observable). NO DEBEN usarse pruebas de snapshot.
- Cada criterio de aceptación de una spec DEBE tener al menos una prueba.
- La cobertura de líneas DEBE ser ≥ 80 %, medida con `@vitest/coverage-v8`.
- Las pruebas DEBEN usar Vitest con jsdom mediante `ng test`, y `TestBed` para los
  componentes.

**Razón:** mantiene el rigor del backend donde más aporta (la lógica) sin forzar
test-first sobre el maquetado visual.

### VIII. UI con Tailwind, tokens y localización es-CO

- Los estilos DEBEN hacerse con utilidades de Tailwind CSS 4 en las plantillas. El CSS
  por componente es una excepción y DEBE justificarse.
- Los tokens de diseño (colores, tipografía, espaciados) DEBEN definirse en `@theme`
  dentro de `src/styles.css`. NO DEBE crearse `tailwind.config.js`.
- NO DEBEN usarse librerías de componentes con sistema visual propio (p. ej. Angular
  Material). `@angular/aria` NO DEBE adoptarse salvo que una spec requiera un patrón
  complejo (combobox, menú, tabs, etc.) y lo justifique.
- El diseño DEBE ser mobile-first, con tema claro y oscuro según `prefers-color-scheme`
  (variante `dark:` por defecto de Tailwind, sin JavaScript). Ambas paletas DEBEN cumplir
  el contraste AA.
- La interfaz DEBE estar solo en español de Colombia: `i18n.sourceLocale` = `es-CO`,
  `lang="es-CO"` y precios en COP formateados con `CurrencyPipe`.
- Toda imagen DEBE usar `NgOptimizedImage` con `width`/`height` o `fill`.
- Las decisiones visuales DEBERÍAN apoyarse en la skill
  `anthropics/skills@frontend-design`.

**Razón:** una sola fuente de tokens da coherencia visual; seguir la preferencia del
sistema da tema oscuro sin estado ni JavaScript.

### IX. Plataforma y versiones vigentes

- El proyecto DEBE ejecutarse con Node.js 26 LTS, declarado únicamente en `engines` de
  `package.json`. `@types/node` DEBE coincidir con esa versión mayor.
- TypeScript DEBE mantenerse en la versión que admita Angular (hoy `~6.0`; Angular 22
  exige `>=6.0 <6.1`). NO DEBE adoptarse TypeScript 7 hasta que Angular lo soporte.
- El proyecto DEBE permanecer en una versión mayor de Angular con soporte, y actualizarse
  con `ng update`.
- Toda dependencia nueva DEBE verificarse contra su documentación oficial vigente y NO
  DEBE estar deprecada ni abandonada.
- El gestor de paquetes DEBE ser pnpm.

**Razón:** las versiones con soporte reciben correcciones de seguridad, y `ng update`
aplica las migraciones oficiales.

## Restricciones técnicas

### Stack (verificado el 2026-11-05)

| Pieza | Versión | Nota |
| --- | --- | --- |
| Angular (`@angular/*`) | 22.2.x | Componentes standalone, signals, `httpResource` |
| Angular CLI / `@angular/build` | 22.2.x | Builder `application`, dev-server con proxy |
| TypeScript | ~6.0 | `strict` y `strictTemplates` activos por defecto |
| Node.js | 26 LTS | Angular 22 exige `^22.22.3 \|\| ^24.15.0 \|\| >=26` |
| pnpm | 12.x | Gestor único |
| Tailwind CSS (`@tailwindcss/postcss`) | 4.x | Configuración CSS-first con `@theme` |
| Vitest + jsdom | 5.x | Builder `@angular/build:unit-test` |
| `@vitest/coverage-v8` | 5.x | Umbral ≥ 80 % |
| `angular-eslint` + ESLint | 22.x / 10.x | `recommended` + `templateAccessibility` |
| Prettier | 3.x | `printWidth: 100`, comillas simples |

`pnpm-lock.yaml` es la autoridad sobre las versiones exactas.

### Idioma

- El código DEBE escribirse en inglés: identificadores, archivos, carpetas y términos de
  dominio (`Dish`, `Order`, `Cart`).
- Los textos de la UI, comentarios, documentación y mensajes de commit DEBEN escribirse
  en español.

### Seguridad

- NO DEBEN incluirse secretos, claves ni tokens en el código: todo el bundle es público.
- NO DEBEN usarse `bypassSecurityTrust*` ni `innerHTML` con datos externos; los datos del
  backend DEBEN renderizarse por interpolación.
- Las imágenes externas DEBEN cargarse solo por HTTPS.
- El CI DEBE ejecutar `pnpm audit --prod --audit-level high` y fallar ante
  vulnerabilidades altas o críticas.

### Rendimiento

- Los presupuestos de `angular.json` son obligatorios: bundle inicial con aviso en
  500 kB y error en 1 MB, y estilos por componente con aviso en 4 kB y error en 8 kB.
  Superarlos DEBE justificarse en el plan.
- Toda feature DEBE cargarse con lazy loading.

## Flujo de desarrollo y puertas de calidad

- Toda funcionalidad DEBE seguir el flujo de Spec Kit (spec → plan → tasks →
  implementación). Antes de especificar, DEBE entrevistarse al desarrollador con la
  skill `interview`.
- El plan DEBE incluir el «Constitution Check» con cada principio aplicable. Toda
  violación DEBE justificarse en «Complexity Tracking»; si no se puede justificar, DEBE
  simplificarse el diseño.
- Git: DEBE trabajarse en una rama por feature e integrarse a `main` mediante pull request.
  Los commits DEBEN seguir Conventional Commits, con la descripción en español. NO DEBEN
  añadirse hooks de Git (el CI hace cumplir las reglas).
- El CI (GitHub Actions) DEBE ejecutar en cada pull request: lint, pruebas con cobertura
  (≥ 80 %), build de producción y `pnpm audit`. Un pull request NO DEBE integrarse con el
  CI en rojo.
- Antes de integrar, la revisión DEBE confirmar: pruebas por criterio de aceptación,
  revisión con axe de las vistas tocadas y ausencia de contradicciones con esta
  constitución.

## Fuera del alcance actual

Estas decisiones se pospusieron; no se descartan. Incorporarlas requiere enmendar esta
constitución.

- Panel de administración o del personal del restaurante.
- Cuentas de usuario, inicio de sesión y roles.
- Pagos en línea.
- Pedidos para recoger y a domicilio.
- SSR y prerenderizado (SEO).
- Persistencia del carrito (`sessionStorage`).
- Generación de tipos desde OpenAPI.
- Servidor de mocks en desarrollo (MSW u otros).
- Interceptor global de errores y notificaciones tipo toast.
- Angular Material o `@angular/aria` como base por defecto.
- Interfaz multilenguaje.
- Selector manual de tema claro/oscuro.
- Pruebas E2E con Playwright y `@axe-core/playwright`.
- Hooks de Git (husky, lefthook, commitlint).
- Despliegue, hosting y enrutamiento de `/api` en producción.
- Métricas de Core Web Vitals con Lighthouse CI.

## Gobernanza

- Esta constitución prevalece sobre cualquier otra guía del repositorio. `CLAUDE.md` es
  la guía operativa para agentes (comandos y prácticas de código), DEBE remitir a esta
  constitución, y ante una contradicción DEBE corregirse `CLAUDE.md`.
- Las enmiendas DEBEN aprobarse de forma explícita por el desarrollador, registrarse en
  el informe de impacto al inicio de este archivo y versionarse con SemVer: MAYOR al
  eliminar o redefinir principios, MENOR al añadir principios o secciones, PARCHE para
  aclaraciones de redacción.
- Las excepciones puntuales DEBEN justificarse en «Complexity Tracking» del plan de la
  feature; una excepción recurrente DEBE convertirse en enmienda.
- Cada spec, plan y pull request DEBE verificar el cumplimiento de esta constitución.

**Version**: 1.0.0 | **Ratified**: 2026-11-05 | **Last Amended**: 2026-11-05
