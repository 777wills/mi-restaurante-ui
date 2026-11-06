# Contrato: interfaz del shell de la aplicación

Interfaz observable que ve el comensal y que verifican las pruebas (`app.spec.ts`).

## Documento (`src/index.html`)

- `<html lang="es-CO">`
- `<title>Mi Restaurante</title>`
- `<app-root>` como único punto de montaje

## Estructura del shell (`App`)

| Elemento | Requisito |
| --- | --- |
| `<header>` | contiene un único `<h1>` con el texto «Mi Restaurante» |
| `<main>` | región principal que contiene `<router-outlet />` |
| Contenido de ejemplo | ninguno (sin texto en inglés, sin plantilla del scaffolding) |

## Estilos

- Solo utilidades de Tailwind en la plantilla / `host`; sin `app.css`.
- Mobile-first; tema claro y oscuro por `prefers-color-scheme` (`dark:`), sin JavaScript.
- Contraste AA en ambos temas; 0 incidencias en axe DevTools.

## Formato regional para vistas futuras

- Precios: `CurrencyPipe` con moneda por defecto COP y `digitsInfo` `'1.0-0'`:
  `{{ price | currency:undefined:'symbol':'1.0-0' }}`.
- Números: `DecimalPipe`; fechas: `DatePipe`. No se fija `locale` a mano en las plantillas.

## Pruebas obligatorias (una por criterio de aceptación)

| Criterio (spec) | Prueba |
| --- | --- |
| US4-2 encabezado y región principal | `app.spec.ts`: `h1` con «Mi Restaurante» y `main` presentes |
| US4-3 precio | `locale.spec.ts`: `25000` → `$ 25.000` |
| US4-4 número | `locale.spec.ts`: `1234.5` → `1.234,5` |
| US4-5 fecha | `locale.spec.ts`: mes en español, orden día-mes-año |
| US5-5 sin snapshots | revisión: no hay `toMatchSnapshot` |
| US1, US2, US3, US4-1/6, US5-1..4, US6 | verificación reproducible en [quickstart.md](../quickstart.md) |
