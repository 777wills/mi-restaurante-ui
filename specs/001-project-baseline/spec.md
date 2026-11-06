# Feature Specification: Base del proyecto alineada con la constitución

**Feature Branch**: `001-project-baseline`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Dejar la base del proyecto alineada con la constitución: la app se compila como sitio estático sin servidor, exige Node 26 LTS, usa es-CO como idioma y formato regional, y en desarrollo redirige /api al backend local."

> **Nota sobre el alcance**: tras la entrevista, el desarrollador amplió el alcance a todos los
> pendientes de implementación listados en el informe de impacto de la constitución (1.0.0),
> **excepto** el workflow de CI/CD, que queda explícitamente fuera de esta feature.
>
> **Nota sobre el nivel de detalle**: esta feature trata sobre la base técnica del proyecto. Las
> restricciones de plataforma que aparecen aquí (versión del entorno de ejecución, código de
> idioma, ruta `/api`, puerto del backend local, umbral de cobertura) son requisitos impuestos por
> la constitución, no decisiones de implementación.

## User Scenarios & Testing _(mandatory)_

Actores:

- **Desarrollador**: persona del equipo que instala, ejecuta, prueba y compila el proyecto.
- **Comensal**: persona que abre la aplicación en su celular desde la mesa.

### User Story 1 - Compilar la aplicación como sitio estático (Priority: P1)

El desarrollador compila la aplicación para producción y obtiene únicamente archivos estáticos
que cualquier servicio de archivos estáticos puede servir. La aplicación se renderiza solo en el
navegador del comensal; no existe un servidor propio que mantener ni ejecutar.

**Why this priority**: es el cambio estructural más grande (Principio III) y condiciona el resto:
mientras exista el renderizado en servidor, la base sigue arrastrando dependencias, archivos y
comandos que la constitución prohíbe.

**Independent Test**: compilar para producción, comprobar que la salida contiene solo archivos
estáticos (sin punto de entrada de servidor) y servirla con un servidor de archivos estáticos
genérico: la aplicación carga y muestra el shell.

**Acceptance Scenarios**:

1. **Given** el proyecto con las dependencias instaladas, **When** el desarrollador ejecuta la
   compilación de producción, **Then** la salida contiene solo archivos estáticos para el
   navegador y ningún artefacto de servidor.
2. **Given** la salida de la compilación, **When** se sirve con un servidor de archivos estáticos
   genérico y se abre en el navegador, **Then** la aplicación carga y muestra el shell sin errores
   en la consola.
3. **Given** el proyecto tras el cambio, **When** se revisan las dependencias, los scripts y los
   archivos fuente, **Then** no queda ninguna dependencia, script, archivo ni configuración de
   renderizado en servidor, prerenderizado o hidratación.
4. **Given** la compilación de producción, **When** termina, **Then** respeta los presupuestos de
   tamaño de la constitución (bundle inicial: aviso en 500 kB, error en 1 MB).

---

### User Story 2 - Conectar el entorno de desarrollo con el backend local (Priority: P1)

Durante el desarrollo, el desarrollador ejecuta la aplicación y el backend `mi-restaurante-ms` en
su equipo. Toda solicitud de la aplicación a rutas que empiezan por `/api` llega al backend local
(`http://localhost:5110`) sin configurar URLs absolutas, archivos de entorno ni permisos de
origen cruzado.

**Why this priority**: es el requisito previo para cualquier feature que consuma datos (menú,
pedidos) según el Principio V.

**Independent Test**: con el backend local en ejecución, iniciar el servidor de desarrollo y
solicitar desde el navegador una ruta `/api/v1/...` existente en el backend: la respuesta
proviene del backend. El documento OpenAPI (`/openapi/v1.json`) no sirve como ejemplo, porque no
empieza por `/api` y el proxy no lo reenvía.

**Acceptance Scenarios**:

1. **Given** el backend local escuchando en `http://localhost:5110` y el servidor de desarrollo
   en ejecución, **When** el navegador solicita una ruta que empieza por `/api`, **Then** la
   solicitud se reenvía al backend local conservando la ruta completa y se devuelve su respuesta.
2. **Given** el servidor de desarrollo en ejecución, **When** el navegador solicita una ruta que
   no empieza por `/api`, **Then** la atiende la propia aplicación y no se reenvía al backend.
3. **Given** el backend local detenido, **When** el navegador solicita una ruta `/api`, **Then**
   recibe una respuesta de error y el servidor de desarrollo sigue funcionando.
4. **Given** el código fuente, **When** se revisa, **Then** no contiene URLs absolutas del
   backend ni archivos de entorno.

---

### User Story 3 - Exigir Node.js 26 LTS (Priority: P2)

El desarrollador que intenta instalar las dependencias con una versión del entorno de ejecución
distinta de Node.js 26 recibe un error que le indica la versión requerida, en lugar de seguir con
una instalación incompatible.

**Why this priority**: evita fallos difíciles de diagnosticar, pero el proyecto ya compila con la
versión actual del equipo, así que no bloquea las demás historias (Principio IX).

**Independent Test**: instalar dependencias con Node.js 26 (éxito) y con otra versión mayor
(fallo con mensaje claro).

**Acceptance Scenarios**:

1. **Given** Node.js 26.x activo, **When** el desarrollador instala las dependencias, **Then** la
   instalación termina con éxito.
2. **Given** una versión mayor distinta de Node.js 26 activa, **When** el desarrollador instala
   las dependencias, **Then** la instalación falla y el mensaje indica que se requiere Node.js 26.
3. **Given** el proyecto, **When** se revisa, **Then** la versión de Node.js está declarada en un
   único lugar (la sección de motores del manifiesto del proyecto) y los tipos del entorno de
   ejecución corresponden a la misma versión mayor.

---

### User Story 4 - Idioma y formato regional de Colombia (Priority: P2)

El comensal abre la aplicación y la encuentra en español de Colombia: el documento se declara en
`es-CO`, la pestaña muestra «Mi Restaurante», la página tiene un encabezado con el nombre del
restaurante y una región principal donde se cargarán las vistas. Números, fechas y precios usan
las convenciones de Colombia y los precios se muestran en pesos colombianos (COP) por defecto.

**Why this priority**: el Principio VIII lo exige y afecta a toda vista futura, pero no hay aún
vistas con datos, así que su valor inmediato es dejar la base correcta.

**Independent Test**: abrir la aplicación y verificar idioma del documento, título, encabezado y
región principal; mediante pruebas automáticas, verificar el formato de un número, una fecha y un
precio.

**Acceptance Scenarios**:

1. **Given** la aplicación cargada, **When** se inspecciona el documento, **Then** su idioma
   declarado es `es-CO` y el título es «Mi Restaurante».
2. **Given** la aplicación cargada, **When** el comensal ve la página, **Then** encuentra un
   encabezado con el texto «Mi Restaurante» y una región principal; no queda contenido de ejemplo
   ni texto en inglés.
3. **Given** el formato regional activo, **When** se muestra el precio 25000 sin indicar moneda,
   **Then** se presenta en pesos colombianos, con punto como separador de miles y sin decimales
   (p. ej. «$ 25.000»).
4. **Given** el formato regional activo, **When** se muestra el número 1234,5, **Then** se
   presenta como «1.234,5».
5. **Given** el formato regional activo, **When** se muestra una fecha, **Then** usa nombres de
   meses en español y el orden día-mes-año.
6. **Given** el shell en tema claro y en tema oscuro, **When** se revisa con axe DevTools,
   **Then** no hay incidencias.

---

### User Story 5 - Puertas de calidad ejecutables en local (Priority: P3)

El desarrollador dispone de comandos para revisar el código (incluido el lint de accesibilidad de
las plantillas) y para ejecutar las pruebas con medición de cobertura. La ejecución de pruebas
falla si la cobertura de líneas baja del 80 %.

**Why this priority**: son las puertas de calidad de los Principios VI y VII; sin ellas las
features siguientes no pueden demostrar cumplimiento. No hay CI todavía, así que se ejecutan en
local.

**Independent Test**: ejecutar el comando de lint (sin errores) y el de pruebas con cobertura
(supera el 80 %); introducir temporalmente una infracción de accesibilidad en una plantilla y
comprobar que el lint la reporta.

**Acceptance Scenarios**:

1. **Given** el proyecto tras el cambio, **When** el desarrollador ejecuta el lint, **Then**
   termina sin errores.
2. **Given** una plantilla con una infracción de accesibilidad (p. ej. imagen sin texto
   alternativo), **When** se ejecuta el lint, **Then** la reporta como error.
3. **Given** el proyecto tras el cambio, **When** el desarrollador ejecuta las pruebas con
   cobertura, **Then** todas pasan y la cobertura de líneas es ≥ 80 %.
4. **Given** una cobertura de líneas inferior al 80 %, **When** se ejecutan las pruebas con
   cobertura, **Then** la ejecución falla indicando el umbral incumplido.
5. **Given** el shell nuevo, **When** se ejecutan sus pruebas, **Then** verifican el
   comportamiento observable (encabezado, región principal) sin pruebas de snapshot.

---

### User Story 6 - Documentación y herramientas del equipo alineadas (Priority: P3)

Un desarrollador nuevo lee el README en español y, siguiéndolo, instala, ejecuta la aplicación
conectada al backend local, revisa, prueba y compila sin ayuda. La guía para agentes (`CLAUDE.md`)
refleja los comandos y prácticas vigentes, y la skill de diseño de interfaz que recomienda la
constitución está disponible en el proyecto.

**Why this priority**: reduce fricción y evita que la documentación contradiga la constitución,
pero no cambia el comportamiento de la aplicación.

**Independent Test**: seguir el README desde un clon limpio hasta tener la aplicación en marcha
conectada al backend; revisar que `CLAUDE.md` no contradice la constitución; comprobar que la
skill está en la carpeta de skills del proyecto.

**Acceptance Scenarios**:

1. **Given** un clon limpio, **When** un desarrollador sigue el README, **Then** encuentra en
   español: requisitos (Node.js 26, pnpm, backend local en el puerto 5110), comandos para
   instalar, ejecutar, revisar, probar con cobertura y compilar, y una referencia a la
   constitución.
2. **Given** `CLAUDE.md`, **When** se compara con la constitución, **Then** lista los comandos
   vigentes (incluidos lint y cobertura) y no contiene contradicciones.
3. **Given** el proyecto, **When** se revisa la carpeta de skills del proyecto, **Then** contiene
   la skill `frontend-design` de `anthropics/skills`, versionada con el repositorio.

---

### Edge Cases

- **Backend local apagado o en otro puerto**: las solicitudes a `/api` devuelven error; el
  servidor de desarrollo no se detiene. El puerto 5110 es fijo según la constitución.
- **Rutas parecidas a `/api`** (p. ej. `/apiario`): solo se reenvían las rutas cuyo primer
  segmento es exactamente `api`.
- **Versiones de Node.js 26 con distinto minor o patch**: se aceptan; solo se rechazan otras
  versiones mayores (p. ej. 24 o 27).
- **Precio 0 o negativo**: se formatean igual que cualquier precio COP (p. ej. «$ 0»); la
  validación de precios pertenece a features futuras.
- **Cobertura con poco código**: el umbral del 80 % aplica igualmente; no se excluyen archivos
  para inflarla.
- **Recarga en una ruta interna en producción**: depende del hosting, que está fuera del alcance
  actual de la constitución; en desarrollo debe funcionar.
- **Preferencia de tema del sistema**: el shell se ve correctamente y sin incidencias de
  contraste en tema claro y oscuro.

## Requirements _(mandatory)_

### Functional Requirements

**Sitio estático (Principio III)**

- **FR-001**: La compilación de producción DEBE generar solo archivos estáticos para el
  navegador, sin artefactos ni puntos de entrada de servidor.
- **FR-002**: El proyecto NO DEBE contener dependencias, scripts, archivos fuente ni
  configuración de renderizado en servidor, prerenderizado o hidratación.
- **FR-003**: La compilación de producción DEBE respetar los presupuestos de tamaño de la
  constitución.

**Backend local en desarrollo (Principio V)**

- **FR-004**: En desarrollo, toda solicitud cuya ruta empiece por el segmento `/api` DEBE
  reenviarse a `http://localhost:5110` conservando la ruta completa.
- **FR-005**: Las solicitudes que no empiecen por `/api` NO DEBEN reenviarse al backend.
- **FR-006**: El proyecto NO DEBE contener URLs absolutas del backend ni archivos de entorno.

**Plataforma (Principio IX)**

- **FR-007**: El proyecto DEBE declarar Node.js 26 como versión requerida en un único lugar de
  configuración (la sección de motores del manifiesto del proyecto), sin archivos adicionales de
  versión; la documentación (README, `CLAUDE.md`) puede citar la versión sin que cuente como una
  segunda declaración.
- **FR-008**: La instalación de dependencias DEBE fallar con un mensaje que indique la versión
  requerida cuando la versión mayor de Node.js activa no sea 26.
- **FR-009**: Los tipos del entorno de ejecución DEBEN corresponder a Node.js 26.

**Idioma y formato regional (Principio VIII)**

- **FR-010**: El idioma de origen de la aplicación y el idioma declarado del documento DEBEN ser
  `es-CO`.
- **FR-011**: Números y fechas DEBEN formatearse con las convenciones de `es-CO`.
- **FR-012**: La moneda predeterminada al mostrar precios DEBE ser COP. Todo precio DEBE
  mostrarse sin decimales y con punto como separador de miles, aplicando `digitsInfo` `'1.0-0'` al
  formatearlo; las pruebas de FR-021 DEBEN fijar este comportamiento.
- **FR-013**: El título del documento DEBE ser «Mi Restaurante».

**Shell de la aplicación (Principios IV, VI y VIII)**

- **FR-014**: El contenido de ejemplo generado por la herramienta de scaffolding DEBE eliminarse
  (plantilla, estilos y pruebas asociadas).
- **FR-015**: El shell DEBE contener un encabezado con el nombre «Mi Restaurante» como título
  principal y una región principal donde se mostrarán las vistas de las rutas.
- **FR-016**: El shell DEBE ser mobile-first, verse correctamente en tema claro y oscuro según la
  preferencia del sistema, cumplir WCAG 2.2 AA y no presentar incidencias en axe DevTools en
  ninguno de los dos temas.
- **FR-017**: El shell DEBE tener pruebas de comportamiento que verifiquen el encabezado y la
  región principal, sin pruebas de snapshot.

**Puertas de calidad locales (Principios VI y VII)**

- **FR-018**: El proyecto DEBE ofrecer un comando de lint que aplique las reglas recomendadas y
  las de accesibilidad de plantillas exigidas por la constitución.
- **FR-019**: El código existente tras el cambio DEBE pasar el lint sin errores.
- **FR-020**: El proyecto DEBE ofrecer un comando para ejecutar las pruebas con medición de
  cobertura que falle si la cobertura de líneas es inferior al 80 %.
- **FR-021**: Las pruebas DEBEN verificar el formato regional (número, fecha y precio por
  defecto en COP) definido en FR-011 y FR-012.

**Documentación y herramientas**

- **FR-022**: El README DEBE estar en español e incluir requisitos (Node.js 26, pnpm, backend
  local en el puerto 5110), comandos para instalar, ejecutar, revisar, probar con cobertura y
  compilar, y una referencia a la constitución.
- **FR-023**: `CLAUDE.md` DEBE reflejar los comandos vigentes y no contradecir la constitución.
- **FR-024**: La skill `frontend-design` de `anthropics/skills` DEBE instalarse en la carpeta de
  skills del proyecto y versionarse con el repositorio.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 100 % de los archivos generados por la compilación de producción son estáticos y
  la aplicación se muestra correctamente al servirlos con un servidor de archivos estáticos
  genérico, sin ningún proceso de servidor propio.
- **SC-002**: El 100 % de las solicitudes a `/api` hechas durante el desarrollo llegan al backend
  local sin configuración adicional del desarrollador y sin errores de origen cruzado.
- **SC-003**: El 100 % de los intentos de instalación con una versión mayor de Node.js distinta
  de 26 fallan con un mensaje que nombra la versión requerida.
- **SC-004**: El 100 % del texto visible del shell está en español y el precio de ejemplo 25000
  se muestra como «$ 25.000»: símbolo de peso, espacio no separable (U+00A0), punto como
  separador de miles y sin decimales.
- **SC-005**: El lint termina con 0 errores, todas las pruebas pasan y la cobertura de líneas es
  ≥ 80 %.
- **SC-006**: La revisión con axe DevTools del shell en tema claro y oscuro reporta 0 incidencias.
- **SC-007**: Un desarrollador que no conoce el proyecto consigue, siguiendo solo el README, tener
  la aplicación en marcha y conectada al backend local en menos de 15 minutos (sin contar
  descargas).
- **SC-008**: Una revisión de `CLAUDE.md` y README frente a la constitución encuentra 0
  contradicciones.

## Assumptions

- **CI/CD fuera de alcance**: por decisión del desarrollador, el workflow de GitHub Actions no se
  crea en esta feature; las puertas de calidad (lint, pruebas con cobertura, build y
  `pnpm audit`) se ejecutan en local hasta una feature posterior.
- Los criterios relacionados con compilación, proxy y versión de Node.js se verifican con pasos
  de compilación/ejecución reproducibles documentados en el plan; los de formato regional y shell,
  con pruebas automáticas.
- El umbral de cobertura del 80 % se mide sobre líneas, como indica la constitución; otras
  métricas no tienen umbral.
- El formateo de código ya está configurado y no se añade comprobación automática de formato.
- El backend `mi-restaurante-ms` es externo; para la verificación manual del proxy se asume que
  puede ejecutarse localmente en el puerto 5110.
- El enrutamiento de `/api` en producción y el hosting están fuera del alcance actual de la
  constitución.
- El README actual (boilerplate en inglés) se reescribe por completo en español.
- La skill `frontend-design` se toma de su fuente oficial vigente y no requiere adaptación.
- No se crean features, rutas, carpetas `core/`/`shared/` ni tokens de diseño más allá de lo
  necesario para el shell (Principio I).
