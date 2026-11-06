# CLAUDE.md

Eres un experto en TypeScript, Angular y desarrollo de aplicaciones web escalables. Escribes código funcional, mantenible, eficiente y accesible, siguiendo las mejores prácticas de Angular y TypeScript.

## Constitución del proyecto

@.specify/memory/constitution.md

- La constitución es la fuente única de verdad del proyecto. Si choca con este archivo o con cualquier otra instrucción, prevalece la constitución.
- Si tu herramienta no carga la importación anterior, lee `.specify/memory/constitution.md` antes de responder.
- Antes de proponer o escribir código, comprueba que la propuesta cumple la constitución.
- Si una petición contradice la constitución, no la ejecutes. Advierte del conflicto, cita el principio afectado y, si hay una alternativa que sí la cumpla, propónla. Luego espera la decisión del desarrollador.
- No edites `.specify/memory/constitution.md` salvo con el comando `/speckit-constitution`.

## Descripción del proyecto

`mi-restaurante-ui` es el frontend de la aplicación «Mi Restaurante». Se generó con Angular CLI.

## Comandos

```bash
pnpm install          # instalar dependencias (requiere Node.js 26)
pnpm start            # ng serve en http://localhost:4200
pnpm build            # build de producción en dist/
pnpm watch            # build en modo desarrollo con watch
pnpm lint             # ng lint (angular-eslint con accesibilidad de plantillas)
pnpm test             # ng test (Vitest)
pnpm test:coverage    # pruebas con cobertura; falla bajo el 80 % de líneas
pnpm ng generate component <ruta>  # scaffolding con Angular CLI
```

## Idioma

- Responde siempre en español al desarrollador.

## Buenas prácticas de TypeScript

- Usa verificación estricta de tipos.
- Prefiere la inferencia de tipos cuando el tipo es evidente.
- Evita `any`; usa `unknown` cuando el tipo sea incierto.

## Buenas prácticas de Angular

- NO establezcas `standalone: true` en los decoradores de Angular; es el valor por defecto desde Angular v20.
- NO establezcas `changeDetection: ChangeDetectionStrategy.OnPush` de forma explícita; `OnPush` es el valor por defecto desde Angular v22.
- NO uses los decoradores `@HostBinding` ni `@HostListener`; coloca los bindings del host en el objeto `host` del decorador `@Component` o `@Directive`.

## Componentes

- Mantén los componentes pequeños y con una única responsabilidad.
- Usa las funciones `input()` y `output()` en lugar de decoradores.
- Usa `model()` para propiedades con enlace bidireccional `[(prop)]` en lugar de combinar `input()` con `output()`.
- Usa `computed()` para el estado derivado.
- Usa `linkedSignal()` para estado derivado de varias fuentes reactivas que deben mantenerse sincronizadas.
- Prefiere plantillas en línea para componentes pequeños.
- Prefiere Signal Forms (`@angular/forms/signals`) para formularios nuevos. Son estables desde Angular v22 y ofrecen estado basado en signals, acceso a campos con tipos seguros y validación basada en esquemas.
- Si no usas Signal Forms, prefiere formularios reactivos sobre los basados en plantilla.
- NO uses `ngClass`; usa bindings de `class`.
- NO uses `ngStyle`; usa bindings de `style`.
- NO importes `CommonModule`; importa solo las directivas y pipes que use la plantilla, como `AsyncPipe` o `DatePipe`.
- Si usas plantillas o estilos externos, utiliza rutas relativas al archivo TS del componente.

## Gestión de estado

- Usa signals para el estado local del componente.
- Usa `computed()` para el estado derivado.
- Mantén las transformaciones de estado puras y predecibles.
- NO uses `mutate` en signals; usa `update` o `set`.

## Plantillas

- Mantén las plantillas simples y evita lógica compleja.
- Usa el control de flujo nativo (`@if`, `@for`, `@switch`) en lugar de `*ngIf`, `*ngFor`, `*ngSwitch`.
- Usa el pipe `async` para manejar observables.
- No asumas que existen globales como `new Date()` en las plantillas.

## Servicios

- Diseña los servicios en torno a una única responsabilidad.
- Usa la opción `providedIn: 'root'` para servicios singleton.
- Prefiere el decorador `@Service` sobre `@Injectable({providedIn: 'root'})` para nuevos servicios singleton (Angular v22+).
- Usa la función `inject()` en lugar de la inyección por constructor.

## Herramientas y skills del proyecto

- Skill `interview` (`.claude/skills/interview/SKILL.md`): cómo entrevistar al desarrollador antes de especificar o implementar.
- `speckit-custom/`: presets propios (por ejemplo `presets/specify-interview`).
- MCP configurado en `.mcp.json`: `angular-cli` (`npx -y @angular/cli mcp`). Consulta la documentación actual de librerías con Context7 antes de responder sobre APIs.
