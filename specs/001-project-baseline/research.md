# Research: Base del proyecto alineada con la constitución

Fuentes: esquemas y código de `@angular/build` 22.2.6 instalados en `node_modules`, locale de
`@angular/common` 22 (`es-CO`), documentación de pnpm 12 (vía Context7) y `npm view`. No quedan
elementos `NEEDS CLARIFICATION`.

## R1. Salida estática sin SSR

- **Decisión**: en el target `build`, eliminar `server`, `ssr` y `security.allowedHosts`, y fijar
  `"outputMode": "static"`. Quitar `@angular/platform-server`, `@angular/ssr`, `express`,
  `@types/express`, el script `serve:ssr:mi-restaurante-ui`, los archivos `src/server.ts`,
  `src/main.server.ts`, `src/app/app.config.server.ts`, `src/app/app.routes.server.ts` y
  `provideClientHydration()` de `app.config.ts`.
- **Justificación**: el builder valida que `server` y `ssr.entry` sean obligatorios solo con
  `outputMode: "server"` (`options.js`); con `"static"` y sin `server` genera únicamente el
  paquete de navegador. `outputMode: "static"` es lo que exige el Principio III.
- **Alternativas**: omitir `outputMode` (válido, pero la constitución pide fijarlo); mantener
  prerender (prohibido).
- **Verificación**: `pnpm build` deja solo `dist/mi-restaurante-ui/browser/`; servir con un
  servidor estático genérico (ver quickstart).

## R2. Proxy de desarrollo a `/api`

- **Decisión**: `proxy.conf.json` con clave regex `"^/api([/?]|$)"`, `target`
  `http://localhost:5110`; referenciado en `serve.options.proxyConfig`.
- **Justificación**: el dev-server usa Vite; una clave sin `^` se compara como prefijo y
  reenviaría `/apiario`. Las claves que empiezan por `^` se tratan como expresión regular y
  `normalizeProxyConfiguration` no las altera. `[/?]|$` cubre `/api`, `/api/...` y `/api?x=1`.
  Con el backend apagado, el proxy responde con error 5xx sin detener el servidor (comportamiento
  estándar de Vite).
- **Alternativas**: clave `"/api"` (falla el caso `/apiario`); `proxy.conf.js` (innecesario).
- **Sin** `changeOrigin`/`secure`: el destino es `http` local.

## R3. Exigir Node.js 26

- **Decisión**: `"engines": { "node": "^26.0.0" }` en `package.json`; `@types/node` `^26`
  (hoy 26.6.x). Sin `.nvmrc`, `.node-version` ni `engineStrict`.
- **Justificación**: la documentación de pnpm indica que, independientemente de `engineStrict`,
  la instalación siempre falla si el **proyecto raíz** declara un `engines` incompatible. `^26.0.0`
  acepta 26.x (cualquier minor/patch) y rechaza 24 y 27. Angular 22 exige `>=26.0.0` para 26, por
  lo que es compatible.
- **Nota de entorno**: la máquina del equipo usa Node 22.15 por defecto; Node 26.13 existe vía
  nvm (`nvm use 26`). La verificación de FR-008 se hace cambiando de versión con nvm.
- **Resultado de la implementación (T014)**: con pnpm 12.16.1 el `engines` del proyecto raíz NO
  hizo fallar `pnpm install` por sí solo (Node 22 instaló sin error); solo falló con
  `--engine-strict`. Se añadió `engineStrict: true` en `pnpm-workspace.yaml` (no declara la
  versión; esta sigue solo en `engines`). Con Node 22 falla con `ERR_PNPM_UNSUPPORTED_ENGINE`
  citando `^26.0.0`; con Node 26 instala. No existe Node 24 en la máquina; se comprobó con 22.
- **Alternativas**: `>=26 <27` (equivalente, más largo); `engineStrict` (innecesario).

## R4. Idioma `es-CO` en build

- **Decisión**: `"i18n": { "sourceLocale": "es-CO" }` en `angular.json` (nivel proyecto) y
  `<html lang="es-CO">`.
- **Justificación**: cuando hay `sourceLocale` definido y no se inlinea, el builder antepone
  `angular:locale/data:es-CO` a los polyfills y ejecuta `$localize.locale = "es-CO"`
  (`application-code-bundle.js`); no hace falta `registerLocaleData` ni `provideLocale`. `es-CO`
  existe en `@angular/common/locales`.
- **Alternativas**: `registerLocaleData` + `LOCALE_ID` manual (más piezas); `localize: true`
  (no necesario: una sola lengua).

## R5. Moneda por defecto COP

- **Decisión**: `{ provide: DEFAULT_CURRENCY_CODE, useValue: 'COP' }` en `appConfig`.
- **Justificación**: `CurrencyPipe` usa `DEFAULT_CURRENCY_CODE`, cuyo valor por defecto es
  `USD`, no la moneda del locale. El Principio VIII exige COP con `CurrencyPipe`.

## R6. Precios sin decimales

- **Hallazgo**: la tabla de monedas de Angular define `COP: [undefined, "$", 2]` (2 decimales);
  el patrón es-CO es `¤ #,##0.00`. Sin intervención, 25000 → `$ 25.000,00`.
- **Decisión**: usar siempre `CurrencyPipe` con `digitsInfo` `'1.0-0'`
  (`| currency:undefined:'symbol':'1.0-0'`). No se crea una pipe propia: el Principio VIII y la
  simplicidad piden `CurrencyPipe`; la regla se documenta en el contrato
  [shell-ui.md](./contracts/shell-ui.md) y la prueba de formato la hace cumplir.
- **Resultado esperado**: `$ 25.000` (símbolo, espacio, punto de miles, sin decimales). El
  espacio del patrón puede ser no separable (U+00A0); la prueba debe compararlo con ese carácter.
- **Alternativas**: pipe/utilidad propia (una pieza más), `provideCurrency…` (no existe en
  Angular), cambiar los dígitos globalmente (no hay API pública).

## R7. Locale en las pruebas

- **Incógnita**: si `@angular/build:unit-test` aplica `i18n.sourceLocale` al compilar el
  paquete de pruebas (la ruta `application-code-bundle.js` se usa para el `buildTarget`).
- **Decisión**: escribir primero las pruebas de formato (TDD) usando `CurrencyPipe`,
  `DecimalPipe` y `DatePipe` instanciados en `TestBed` **sin** registrar el locale a mano. Si
  fallan por `en-US`, registrar `es-CO` en el `providersFile`/`setupFiles` del target `test`
  (una sola vez) en lugar de en cada prueba. Verificar en la implementación y registrar el
  resultado aquí.
- **Alternativas**: probar solo manualmente (incumple FR-021).
- **Resultado de la implementación (T017/T023)**: antes de `i18n.sourceLocale` las pruebas fallaron
  con formato `en-US` (`$25,000`, `1,234.5`, `November 5, 2026`); tras configurarlo pasaron sin
  registrar el locale en el target `test`. No hace falta `providersFile` ni `setupFiles`.
  Además se añadió `node` a `types` en `tsconfig.spec.json` para leer `src/index.html` con
  `node:fs` en `app.spec.ts`.

## R8. Lint: `angular-eslint` + ESLint

- **Decisión**: añadir `eslint` (10.x), `angular-eslint` (22.6.x) y `typescript-eslint` (8.x, peer
  requerida) con `ng add angular-eslint`, que crea `eslint.config.js` (flat config) y el target
  `lint`. Reglas: `tseslint.configs.recommended` + `angular.configs.tsRecommended` para `.ts`;
  `angular.configs.templateRecommended` + `angular.configs.templateAccessibility` para `.html`.
  Script `"lint": "ng lint"`.
- **Justificación**: `angular-eslint` 22.6 declara peers `eslint ^9 || ^10`, `typescript-eslint
  ^8`, y es el paquete oficial exigido por el Principio VI.
- **Alternativas**: `@angular/cli` sin lint (incumple), Biome/oxlint (no soportan las reglas de
  plantillas Angular).
- **Verificación**: introducir temporalmente `<img src="x">` sin `alt` y comprobar que
  `ng lint` falla (`@angular-eslint/template/alt-text`).

## R9. Cobertura ≥ 80 % de líneas

- **Decisión**: añadir `@vitest/coverage-v8` con versión **exactamente igual** a `vitest`
  (5.1.0; peer `vitest: 5.1.0`) y configurar en `angular.json`
  `test.options.coverageThresholds: { "lines": 80 }`. Scripts: `"test:coverage": "ng test
  --coverage --no-watch"`. Sin `coverageExclude`.
- **Justificación**: el esquema del builder documenta `coverageThresholds` («if thresholds are not
  met, the builder will exit with an error»). Solo se aplica con `--coverage`, por eso existe un
  script dedicado y `pnpm test` queda rápido.
- **Alternativas**: `vitest.config` propio (`runnerConfig`, una pieza más).
- **Cuidado**: comprobar que el informe incluya los archivos relevantes de `src/app` (sin
  excluir nada para inflar el porcentaje).

## R10. Shell accesible, móvil primero, con tema claro/oscuro

- **Decisión**: `App` sin `styleUrl` ni signal `title`; plantilla con
  `<header><h1>Mi Restaurante</h1></header><main><router-outlet /></main>`; el host de `App`
  lleva las clases de fondo y texto (`bg-stone-50 text-stone-900 dark:bg-stone-900
  dark:text-stone-50`) mediante el objeto `host`. Se elimina `app.css`.
- **Justificación**: HTML nativo (Principio VI); Tailwind 4 aplica `dark:` por
  `prefers-color-scheme` sin JavaScript (Principio VIII); sin `@theme` hasta que una spec
  necesite tokens (Principio I). Stone-900 sobre stone-50 y viceversa superan 4,5:1.
- **Pruebas**: `app.spec.ts` verifica con `TestBed` que existe un `h1` con «Mi Restaurante» y un
  `main`, sin snapshot. El contraste y axe se revisan manualmente (quickstart).

## R11. Skill `frontend-design`

- **Decisión**: `npx skills add anthropics/skills@frontend-design` en el proyecto, dirigido a
  Claude Code y **copiado** (no enlace simbólico) a `.claude/skills/frontend-design/`; versionar
  los archivos resultantes.
- **Justificación**: las skills del proyecto ya viven en `.claude/skills/`; la copia asegura que el
  repositorio sea autocontenido.
- **Cuidado**: revisar qué archivos extra genera el CLI (p. ej. un lockfile de skills o
  `.agents/`) y conservar solo lo necesario.

## R12. Documentación

- `README.md` en español: requisitos (Node 26, pnpm, backend en `:5110`), comandos (instalar,
  ejecutar, revisar, probar con cobertura, compilar), referencia a la constitución.
- `CLAUDE.md`: añadir `pnpm lint` y `pnpm test:coverage` y la nota de Node 26; el resto no
  contradice la constitución y no se toca. Debe seguir remitiendo a ella.
