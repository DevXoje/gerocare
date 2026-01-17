# Documentación del Sistema de Gestión para Centros Geriátricos

A continuación se describe de forma detallada la documentación requerida para el proyecto de gestión de residencias de mayores. El sistema, con frontend en **Vue.js**, backend en **Express** y base de datos **Firestore**, facilitará al personal de enfermería la organización de cuidados, registros médicos y tareas administrativas, garantizando escalabilidad y cumplimiento normativo.

## 1. BRD (Documento de Requisitos de Negocio)

La atención en residencias de mayores exige una gestión rigurosa de cuidados, medicaciones y actividades diarias. El documento de requisitos de negocio (**BRD**) introduce el proyecto resumidamente: define el problema de gestión manual (errores en registros, falta de trazabilidad, retrasos administrativos) y los objetivos de negocio (mejorar la calidad asistencial y eficiencia operativa). Por ejemplo, se busca cumplir exigencias normativas de calidad (p.ej. la norma **UNE 158301** para planes individualizados de atención) mediante una plataforma digital. El BRD enumera beneficios clave, como estandarizar el **PAI** de cada residente, unificar el historial clínico digital y reducir tiempos de papeleo. Según las mejores prácticas, el BRD incluye una *"breve descripción del proyecto, resumiendo su propósito, objetivos y beneficios previstos"*. 

Entre los objetivos comerciales se destacan:

- **Estandarización de procesos asistenciales**: Automatizar la creación y seguimiento de planes de cuidados individuales (**PAI**) para cada residente, de forma acorde a sus necesidades sanitarias.

- **Integridad de registros médicos**: Centralizar datos clínicos, incidentes y evolución de cada residente, accesible por el equipo multidisciplinar.

- **Eficiencia operativa**: Optimizar tareas administrativas (p.ej. asignación de turnos, gestión de medicación) para liberar tiempo al personal sanitario.

- **Cumplimiento normativo**: Garantizar la trazabilidad de la atención (informes de PAI, controles diarios, administración de fármacos) y cumplir la normativa vigente, facilitando auditorías de calidad.

- **Mejora de la satisfacción de pacientes y familiares**: A través de una atención más organizada y la posibilidad de comunicarse mediante un portal familiar.

El BRD sirve como guía inicial alineando a los stakeholders sobre *"qué se debe construir, el público objetivo y cómo debe funcionar el producto"*. En resumen, la problemática de negocio es clara: digitalizar la gestión geriátrica para mejorar la seguridad, calidad y eficiencia en la atención, logrando beneficios tangibles para la residencia y sus pacientes.

## 2. PRD (Documento de Requisitos del Producto)

El documento de requisitos del producto (**PRD**) traduce las metas del negocio en funcionalidades concretas y criterios de éxito. Según la definición, un PRD es *"un documento integral y estructurado que describe los objetivos, las características, la funcionalidad y las limitaciones de un producto"*. En esta sección se detallan las funciones clave del sistema, flujos principales de usuario, restricciones técnicas y criterios de aceptación.

### Funcionalidades principales

- **Gestión de residentes**: Registro y edición de perfiles (datos personales, historial clínico, contactos familiares). Por ejemplo, el sistema permitirá al enfermero/a crear un nuevo residente con nombre, edad y antecedentes médicos.

- **Planes de Atención Individual (PAI)**: Creación y seguimiento de planes de cuidados personalizados para cada residente. El enfermero/a podrá definir objetivos (rehabilitación, movilidad, nutrición) y programar actividades diarias (baño, ejercicios, terapia). El sistema avisará para revisar los objetivos periódicamente.

- **Gestión de medicación**: Programación de tratamientos (fármacos, dosis y horarios) y registro de la administración. El personal anotará cuándo entrega cada dosis al residente, generando historial de medicación.

- **Registro de actividades e incidencias**: Planificación de tareas diarias (alimentación, higiene, fisioterapia) y registro de su cumplimiento. Además, permitirá reportar incidencias (caídas, urgencias) asociadas a un residente.

- **Organización de turnos**: Módulo de planificación de turnos de enfermería; los enfermeros/as consultan su calendario de trabajo.

- **Reportes y seguimiento**: Generación de informes de evolución (cumplimiento de PAI, estadísticas de incidentes, etc.) para evaluar resultados asistenciales.

- **Seguridad y acceso**: Autenticación de usuarios y control de acceso por roles. Sólo usuarios autorizados podrán ver o editar información sensible.

### Flujos clave de usuario

Se describirán flujos típicos como:

- `login → seleccionar residente → completar formulario → confirmar`
- `login → ver lista de tareas diarias → marcar actividad realizada`

Por ejemplo, el flujo de **Alta de Residente** sería:

1. El enfermero inicia sesión y pulsa "Nuevo Residente"
2. El sistema muestra un formulario
3. El enfermero introduce datos obligatorios y envía
4. El sistema guarda la ficha y confirma la creación

Como indica la metodología ágil, cada flujo se desglosará en historias de usuario y casos de uso detallados.

### Restricciones técnicas

- **Tecnología**: Frontend desarrollado en **Vue.js**, backend en **Express** (Node.js) y base de datos **Firestore** (NoSQL en la nube). Esta pila permite una interfaz web dinámica y escalable, con sincronización en tiempo real y fácil escalabilidad horizontal.

- **Rendimiento**: Se exigirá que el sistema soporte múltiples usuarios simultáneos (p.ej. concurrencia de turnos) con tiempos de respuesta breves (<2 segundos bajo carga moderada).

- **Seguridad**: Uso de **HTTPS**, cifrado de contraseñas y reglas de seguridad en Firestore. Integración posible con **Firebase Auth** para gestión de usuarios.

- **Compatibilidad**: Navegadores modernos (Chrome/Firefox/Edge) y diseño responsive para tabletas o dispositivos móviles usados en planta.

### Criterios de éxito

El PRD incluye criterios de aceptación claros. Por ejemplo:

- El 100% de los flujos principales (registro de residentes, PAI, administración de medicación) debe completarse sin errores
- La interfaz debe ser usable por personal con mínima formación
- Las pruebas piloto con personal real muestran mejora en la gestión (encuestas de satisfacción)

En conjunto, estos criterios alinean al equipo en métricas alcanzables, tal como exige un PRD bien elaborado. Una hoja de ruta con hitos (MVP operativo, pilotaje, iteraciones) servirá para medir el avance y validar cada funcionalidad contra los objetivos definidos.

## 3. ERS (Especificación de Requisitos del Software)

El **ERS** (equivalente al SRS) documenta en detalle todos los requisitos del sistema. Según la norma, la ERS es *"una descripción completa del comportamiento del sistema que se va a desarrollar"* e incluye casos de uso y requisitos no funcionales que imponen restricciones de diseño. A continuación se listan los requisitos funcionales, no funcionales y la política de roles y accesos:

### Requisitos funcionales clave

*(qué debe hacer el sistema)*

- **Autenticación y usuarios**: El sistema debe permitir que usuarios registrados inicien sesión con usuario/contraseña. Debe soportar roles diferenciados (por ejemplo, Administrador, Enfermero/a, Médico/a). Cada rol tendrá permisos específicos (v.g. sólo el Administrador puede crear o desactivar usuarios nuevos).

- **Gestión de residentes**: Permitir crear, editar y consultar el perfil de cada residente (incluyendo datos personales, alergias, diagnósticos y contacto de familiares). Incorporar foto y documentación adjunta.

- **PAI (Planes Individuales de Atención)**: Para cada residente, el sistema debe permitir asociar un PAI con objetivos terapéuticos y actividades planificadas. El enfermero/a podrá crear o modificar un PAI, registrando actividades diarias (p.ej. baño, fisioterapia, ejercicio) y fechas de revisión. Al finalizar un ciclo, podrá reabrir o generar uno nuevo.

- **Registro de medicación**: Debe gestionarse un registro de prescripciones médicas por residente. El enfermero/a podrá documentar cada vez que administra medicación (fecha, hora, dosis). El sistema generará alertas si falta administrar una dosis o si se produce un evento (p.ej. cambio de medicación).

- **Planificación de actividades e incidencias**: Registro de tareas rutinarias (alimentación, paseos, terapias) y anotación de su cumplimiento. Adicionalmente, el enfermero/a debe poder reportar incidencias clínicas (caída, emergencia, síntoma anormal) asociadas a un residente con descripción y fecha/hora.

- **Turnos de personal**: El sistema debe permitir al administrador asignar turnos a cada profesional de enfermería y que los enfermeros/as puedan consultar su calendario.

- **Reportes y estadísticas**: Generación de informes por residente (historial clínico completo, evolución de objetivos) y resúmenes generales (p.ej. número de altas, promedio de caídas mensuales). Permitir exportar datos en formatos comunes.

- **Multiplataforma**: La interfaz web debe ser accesible desde cualquier navegador sin instalación adicional, con adaptabilidad para tabletas.

### Requisitos no funcionales

*(cómo debe funcionar)*

- **Seguridad**: El sistema debe usar cifrado **SSL/TLS** en comunicaciones, almacenar contraseñas cifradas (hash seguro) y aplicar control de acceso granular. Debe registrar en un log las acciones críticas (auditoría de seguridad).

- **Disponibilidad**: Se buscará una alta disponibilidad (p.ej. >99% uptime), con copias de respaldo automáticas de la base de datos.

- **Escalabilidad**: La arquitectura (Firestore) permitirá escalar la cantidad de datos y usuarios sin degradar el rendimiento, soportando crecimiento de la residencia o multi-sedes futuras.

- **Rendimiento**: Los tiempos de respuesta de las operaciones típicas (guardar formulario, cargar dashboard) deben ser inferiores a 2 segundos bajo carga normal.

- **Usabilidad**: La interfaz debe ser intuitiva para personal no técnico. Habrá ayudas contextuales y la posibilidad de customizar menús. Se usarán colores y layouts claros para minimizar errores.

- **Compatibilidad**: Soporte para navegadores actuales en Windows y macOS; diseño adaptable (responsive) para tablets en uso en la residencia.

- **Mantenimiento y soporte**: El código seguirá buenas prácticas (documentación interna, control de versiones) para facilitar futuras iteraciones. Se planificará monitorización de errores y actualizaciones periódicas.

### Roles y accesos

Se implementará control de acceso basado en roles (**RBAC**). Por ejemplo:

- **Administrador**: crea y gestiona cuentas de usuario, configura parámetros generales del sistema y accede a reportes globales.

- **Enfermero/a**: administra información clínica: puede registrar nuevos residentes, editar datos de pacientes, cargar medicaciones y actividades.

- **Médico/a**: (si se incluye) visualizará y aportará notas médicas en expedientes, pero sin modificar planificación de enfermería.

- **Familiar/Invitado**: (opcional) sólo consulta información limitada a través de un portal externo.

Cada acción de escritura/edición quedará registrada con usuario y fecha.

En conjunto, estos requisitos garantizan que el sistema cumpla tanto con las necesidades operativas (funcionales) como con criterios de calidad y seguridad (no funcionales).

## 4. Backlog ágil y Historias de Usuario

El desarrollo seguirá un enfoque ágil, organizando el producto en un backlog de historias de usuario priorizadas. Cada historia se redactará en primera persona: *"Como [rol] quiero [acción] para [beneficio]"*. Así, el equipo definirá funcionalidades pequeñas e iterativas, centradas en el personal de enfermería, la gestión de residentes y las tareas diarias. 

Algunos ejemplos de historias iniciales (épicas y desgloses) son:

> "Como Enfermero, quiero crear un nuevo residente con su ficha completa para iniciar su seguimiento clínico." *(Roles: Enfermero/Admin)*

> "Como Enfermero, quiero planificar un Plan de Cuidados (PAI) para un residente indicando objetivos y actividades diarias, para mejorar su atención personalizada."

> "Como Enfermero, quiero registrar la administración de un medicamento (fecha, hora, dosis) para llevar un control exacto del tratamiento de cada residente."

> "Como Enfermero, quiero reportar una incidencia médica (p.ej. caída, urgencia) asociada a un residente con detalles, para que el equipo responda rápidamente."

> "Como Enfermero, quiero consultar el historial clínico completo de un residente (incidencias, medicaciones, notas de evolución) para evaluar su estado y planificar cuidados."

> "Como Enfermero, quiero marcar como completadas las actividades diarias (baño, alimentación, terapia) en el sistema, para asegurar el seguimiento de cada tarea."

> "Como Administrador, quiero crear y asignar roles a nuevos usuarios (p.ej. enfermeros, médicos) para controlar quién puede acceder al sistema."

> "Como Enfermero, quiero recibir alertas automáticas cuando un objetivo del PAI requiera revisión, para no olvidar evaluaciones periódicas."

> "Como Administrador, quiero generar reportes estadísticos (p.ej. tasa de caídas mensual, cumplimiento de PAI) para analizar la calidad de la atención."

Estas historias guiarán la elaboración de las tareas técnicas y su priorización. Durante las sprints, cada historia incluirá criterios de aceptación claros (por ejemplo, *"al registrar un residente, todos los campos obligatorios deben validarse"*), garantizando que el producto evolucione atendiendo las necesidades del usuario real.

## 5. Casos de Uso Principales

La ERS incorpora casos de uso para detallar la interacción de los actores con el sistema. A continuación se ejemplifican los casos de uso más relevantes, incluyendo actores, flujo normal y flujos alternativos:

### Caso de Uso: Registrar/Actualizar Residente

**Actores**: Enfermero/a (primario), Administrador.

**Precondición**: Usuario autenticado con rol adecuado.

**Flujo principal**:

1. El enfermero/a accede al módulo de "Residentes" y elige "Nuevo Residente".
2. El sistema muestra un formulario con campos obligatorios (nombre, fecha de nacimiento, DNI, etc.).
3. El enfermero/a introduce los datos del residente y confirma.
4. El sistema valida la información y crea la ficha del residente en la base de datos. Aparece confirmación.

**Flujos alternativos**:

- Si faltan datos obligatorios, el sistema muestra un mensaje de error y solicita corrección antes de guardar.
- Si el residente ya existe (p.ej. mismo DNI), el sistema avisa y permite editar el registro existente en lugar de duplicar.

### Caso de Uso: Planificar Cuidados (PAI)

**Actores**: Enfermero/a (primario).

**Precondición**: El residente debe tener ficha creada.

**Flujo principal**:

1. El enfermero/a selecciona un residente y elige "Crear/Editar PAI".
2. El sistema muestra una pantalla para definir objetivos terapéuticos y añadir actividades diarias (vía checklists, horarios).
3. El enfermero/a ingresa los objetivos (p.ej. mejorar movilidad, alimentación), asigna actividades con frecuencias (p.ej. fisioterapia diaria) y guarda el plan.
4. El sistema registra el PAI asociado al residente y programa recordatorios para revisión futura.

**Flujos alternativos**:

- Si no se selecciona un residente válido, el sistema muestra un mensaje de error y vuelve al listado.
- Si se intenta guardar sin objetivos o sin actividades, el sistema advierte y exige completar la información mínima.

### Caso de Uso: Administrar Medicación

**Actores**: Enfermero/a (primario).

**Precondición**: El residente tiene un tratamiento médico activo.

**Flujo principal**:

1. El enfermero/a accede al perfil del residente y selecciona "Medicamentos".
2. El sistema muestra la lista de medicamentos programados (nombre, dosis, horarios).
3. Cuando administra una dosis, el enfermero/a marca en el sistema la fecha, hora y observaciones (p.ej. reacción).
4. El sistema actualiza el registro de medicación del residente y, si es el último tramo, notifica al médico o genera orden de compra.

**Flujos alternativos**:

- Si no hay medicación programada, el sistema indica "no hay tratamientos pendientes".
- Si el enfermero/a ingresa datos inválidos (p.ej. dosis no numérica), se muestra mensaje de validación.

### Caso de Uso: Registrar Incidencia

**Actores**: Enfermero/a (primario).

**Precondición**: Usuario en turno.

**Flujo principal**:

1. El enfermero/a pulsa "Registrar Incidencia" en el sistema.
2. El sistema despliega un formulario donde se ingresa tipo de evento (caída, urgencia médica, etc.), fecha, hora y descripción breve. Se asocia la incidencia a un residente si aplica.
3. El enfermero/a completa los campos y confirma la incidencia.
4. El sistema guarda el registro y, si es crítico, notifica a los responsables (en pantalla o por alerta interna).

**Flujos alternativos**:

- Si el formulario está incompleto o falta seleccionar tipo de evento, se bloquea envío con mensaje de error.
- Si el sistema detecta un duplicado exacto (mismo residente, fecha y tipo), puede preguntar si se trata de la misma incidencia.

### Caso de Uso: Gestión de Usuarios (Admin)

**Actores**: Administrador.

**Precondición**: El administrador ha iniciado sesión.

**Flujo principal**:

1. El administrador entra al módulo "Usuarios" y elige "Crear Usuario".
2. El sistema solicita datos (email, contraseña temporal, rol: enfermero/a, médico/a, etc.).
3. El administrador introduce la información y guarda.
4. El sistema crea la cuenta y envía un correo de activación al nuevo usuario.

**Flujos alternativos**:

- Si el email ya está registrado, el sistema advierte y no permite duplicado.
- Si faltan datos obligatorios, se muestra validación de campos incompletos.

El administrador también puede editar o desactivar usuarios existentes mediante acciones similares.

---

Cada caso de uso anterior refleja interacciones normales y escenarios de excepción. Como señala la especificación estándar, estos casos de uso detallan *"todas las interacciones que tendrán los usuarios con el software"*, asegurando que el equipo de desarrollo comprenda las necesidades concretas del personal de enfermería en su flujo diario de trabajo.

## Fuentes

Esta documentación se ha basado en estándares de análisis de requisitos y ejemplos del sector salud. Por ejemplo, el concepto de PRD y la importancia de alinear objetivos se extrae de estudios de Visure Solutions. La definición de ERS proviene de la norma IEEE/ISO y Wikipedia. Detalles sobre gestión geriátrica y PAI se inspiraron en soluciones reales de software para residencias.
