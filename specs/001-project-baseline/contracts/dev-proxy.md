# Contrato: proxy de desarrollo hacia el backend

Interfaz entre el dev-server (`pnpm start`) y `mi-restaurante-ms`. Solo existe en desarrollo.

## Configuración

`proxy.conf.json` (raíz del repositorio), enlazado con `serve.options.proxyConfig` en
`angular.json`:

```json
{
  "^/api([/?]|$)": {
    "target": "http://localhost:5110"
  }
}
```

## Comportamiento

| Solicitud del navegador | Resultado |
| --- | --- |
| `/api` | se reenvía a `http://localhost:5110/api` |
| `/api/v1/...` | se reenvía conservando la ruta completa |
| `/api?x=1` | se reenvía conservando la consulta |
| `/apiario`, `/apis/x` | NO se reenvía; la atiende la aplicación |
| `/` y cualquier otra ruta | la atiende la aplicación |
| `/api/...` con el backend apagado | respuesta de error (5xx); el dev-server sigue activo |

## Reglas

- El código fuente usa solo rutas relativas `/api/v1/...`; no hay URLs absolutas ni
  `environment.ts` (FR-006).
- El puerto 5110 es fijo (Principio V).
- Verificación: el documento OpenAPI está en `/openapi/v1.json` (constitución, Principio V), que
  NO empieza por `/api` y por tanto no pasa por el proxy. Para comprobar el reenvío hay que usar
  una ruta `/api/...` real del backend; la spec (US2) menciona el OpenAPI como ejemplo y debe
  corregirse o aclararse antes de las tareas.
