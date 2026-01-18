# Guía de Manejo de Errores

## Arquitectura

El sistema de manejo de errores en GeroCare sigue una arquitectura en capas que garantiza consistencia, trazabilidad y una buena experiencia de usuario.

### Componentes Principales

1. **AppError** - Tipo base para todos los errores
2. **Error Logger** - Sistema centralizado de logging
3. **Result Type** - Patrón funcional para manejo de errores
4. **Error Boundary Global** - Captura de errores no manejados
5. **Mensajes de Error** - Utilidades para mensajes amigables

## Tipos de Error

### AppError

Todos los errores en la aplicación extienden `AppError`:

```typescript
interface AppError {
  code: string
  message: string
  details?: unknown
  timestamp: Date
}
```

### Códigos de Error Estándar

- `VALIDATION_ERROR` - Error de validación de datos
- `NOT_FOUND` - Recurso no encontrado
- `PERMISSION_ERROR` - Error de permisos
- `REPOSITORY_ERROR` - Error en acceso a datos
- `NETWORK_ERROR` - Error de red
- `AUTH_ERROR` - Error de autenticación
- `UNKNOWN_ERROR` - Error desconocido
- `CREATE_FAILED` - Error al crear
- `UPDATE_FAILED` - Error al actualizar
- `DELETE_FAILED` - Error al eliminar

## Uso en Repositorios

Los repositorios deben:

1. Capturar errores originales
2. Loguear con contexto
3. Retornar `Result<T, E>`

```typescript
async function create(data: T): Promise<Result<T, ErrorType>> {
  try {
    // ... operación
    return Ok(result)
  } catch (error) {
    const appError = toAppError(error, 'Error al crear')
    logError(appError, { operation: 'create', data })
    return Err(createError(appError.message))
  }
}
```

## Uso en Stores

Los stores deben:

1. Usar factory functions para crear errores
2. Loguear errores en catch blocks
3. Manejar `Result` types correctamente

```typescript
async function fetchData() {
  try {
    const result = await repository.findAll()
    if (result.success) {
      data.value = result.value
    } else {
      error.value = result.error
    }
  } catch (err) {
    const appError = toAppError(err, 'Error al cargar')
    logError(appError, { operation: 'fetchData' })
    error.value = createUnknownError(appError.message)
  }
}
```

## Uso en Composables

Los composables deben:

1. Usar `mapZodErrorToAppError` para errores de validación
2. Mostrar errores al usuario con `useNotifications`
3. Manejar errores del store correctamente

```typescript
const validation = Schema.safeParse(data)
if (!validation.success) {
  const errorMessage = getZodErrorMessage(validation.error)
  notifications.error(errorMessage)
  return
}
```

## Logging

### Niveles de Log

- `logError` - Errores que requieren atención
- `logWarning` - Advertencias
- `logInfo` - Información general
- `logDebug` - Información de debugging (solo en desarrollo)

### Contexto

Siempre incluir contexto relevante:

```typescript
logError(error, {
  operation: 'createUser',
  userId: user.id,
  email: user.email
})
```

## Error Boundary Global

El error boundary captura:

- Errores de componentes Vue
- Errores de JavaScript no manejados
- Promesas rechazadas no manejadas

Configurado en `src/main.ts` y `src/shared/error/errorHandler.ts`.

## Mensajes de Error

### Para Usuarios

Usar `getUserFriendlyMessage` para convertir errores a mensajes amigables:

```typescript
const message = getUserFriendlyMessage(error)
notifications.error(message)
```

### Para Desarrolladores

Los errores incluyen:
- Código de error
- Mensaje descriptivo
- Detalles técnicos (en `details`)
- Timestamp
- Stack trace (en desarrollo)

## Mejores Prácticas

1. **Siempre loguear errores** - No silenciar errores sin logging
2. **Preservar stack traces** - Usar `toAppError` para convertir errores
3. **Incluir contexto** - Agregar información relevante al log
4. **Mensajes claros** - Errores en español, mensajes amigables
5. **Usar factory functions** - No crear errores directamente
6. **Manejar Result types** - Verificar `success` antes de usar `value`
7. **No lanzar errores sin capturar** - Siempre usar try-catch o Result

## Ejemplos

### Crear un Error de Dominio

```typescript
// En domain/EntityErrors.ts
export function createEntityNotFoundError(id?: string): EntityError {
  return createAppError(
    'NOT_FOUND',
    id ? `Entidad con id ${id} no encontrada` : 'Entidad no encontrada',
    id ? { entityId: id } : undefined
  )
}
```

### Manejar Result en un Store

```typescript
const result = await repository.findById(id)
if (result.success) {
  entity.value = result.value
} else {
  error.value = result.error
  logError(result.error, { operation: 'fetchEntity', id })
}
```

### Validar con Zod

```typescript
const validation = EntitySchema.safeParse(data)
if (!validation.success) {
  const errorMessage = getZodErrorMessage(validation.error)
  notifications.error(errorMessage)
  return
}
```

## Testing

Los tests deben verificar:

1. Que los errores se crean correctamente
2. Que se loguean apropiadamente
3. Que los mensajes son correctos
4. Que el contexto se incluye

Ver `src/shared/error/__tests__/` para ejemplos.
