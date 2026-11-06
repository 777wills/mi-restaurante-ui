# Data Model: Base del proyecto alineada con la constitución

Esta feature no introduce entidades de dominio (`Dish`, `Order`, `Cart` llegan con features
posteriores), no persiste datos y no consume el backend. Lo único que se modela es la
configuración que condiciona el comportamiento observable.

## Configuración regional (`LocaleConfig`)

| Elemento | Valor | Origen | Validación |
| --- | --- | --- | --- |
| Locale de origen | `es-CO` | `angular.json` → `i18n.sourceLocale` | Prueba de formato (número, fecha, precio) |
| Idioma del documento | `es-CO` | `src/index.html` → `<html lang>` | Revisión del DOM / comprobación manual |
| Moneda por defecto | `COP` | `appConfig` → `DEFAULT_CURRENCY_CODE` | Precio sin código de moneda se muestra en COP |
| Decimales de precio | 0 | `digitsInfo` `'1.0-0'` en cada uso de `currency` | `25000` → `$ 25.000` |

Reglas de formato esperadas (locale `es-CO`, Angular 22):

| Entrada | Pipe | Salida |
| --- | --- | --- |
| `25000` | `currency:undefined:'symbol':'1.0-0'` | `$ 25.000` (espacio posiblemente U+00A0) |
| `0` | idem | `$ 0` |
| `1234.5` | `number` | `1.234,5` |
| una fecha | `date` | nombres de mes en español, orden día-mes-año |

## Contrato de dev-proxy (`ProxyRule`)

| Campo | Valor |
| --- | --- |
| Patrón | `^/api([/?]|$)` (regex) |
| Destino | `http://localhost:5110` |
| Alcance | solo `ng serve`; no existe en producción |

Detalle en [contracts/dev-proxy.md](./contracts/dev-proxy.md).

## Puerta de calidad (`QualityGate`)

| Puerta | Comando | Criterio |
| --- | --- | --- |
| Lint | `pnpm lint` | 0 errores (`recommended` + `templateAccessibility`) |
| Pruebas con cobertura | `pnpm test:coverage` | todas pasan y líneas ≥ 80 % (si no, el comando falla) |
| Build | `pnpm build` | solo archivos estáticos; presupuestos respetados |
| Auditoría | `pnpm audit --prod --audit-level high` | sin vulnerabilidades altas o críticas |

No hay transiciones de estado ni relaciones entre elementos.
