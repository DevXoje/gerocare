# Testing de Accesibilidad - GeroCare

## Fecha de Creación: 2026-01-18

## Objetivo

Este documento describe cómo ejecutar y usar las pruebas automatizadas de accesibilidad en GeroCare usando axe-core y Lighthouse.

---

## Herramientas Utilizadas

### 1. axe-core con Playwright (`@axe-core/playwright`)

**Qué es:**
- Motor de análisis de accesibilidad integrado con Playwright
- Verifica compliance con WCAG 2.1 (A, AA)
- Identifica violaciones específicas con recomendaciones

**Uso:**
- Tests automatizados en CI/CD
- Feedback rápido durante desarrollo
- Detección de problemas antes de merge

### 2. Lighthouse

**Qué es:**
- Herramienta de Google para auditorías de páginas web
- Proporciona métricas de accesibilidad, performance, SEO, etc.
- Genera reportes HTML detallados

**Uso:**
- Auditorías completas de páginas principales
- Reportes visuales para stakeholders
- Métricas cuantificables de accesibilidad

---

## Ejecutar Pruebas de Accesibilidad

### Tests con axe-core

**Ejecutar todos los tests de accesibilidad:**
```bash
npm run test:a11y
```

**Ejecutar un test específico:**
```bash
npx playwright test e2e/accessibility.spec.ts -g "Dashboard"
```

**Ejecutar en modo UI (interactivo):**
```bash
npx playwright test e2e/accessibility.spec.ts --ui
```

**Archivo de tests:** `e2e/accessibility.spec.ts`

**Páginas testeadas:**
- `/login` - Página de inicio de sesión
- `/dashboard` - Dashboard principal
- `/residents` - Lista de residentes
- `/medication` - Gestión de medicación

### Auditorías con Lighthouse

**Ejecutar auditoría completa:**
```bash
npm run audit:lighthouse
```

**Ejecutar ambas auditorías (axe + Lighthouse):**
```bash
npm run audit:a11y
```

**Reportes generados:**
- `lighthouse-reports/login-report.html`
- `lighthouse-reports/dashboard-report.html`
- `lighthouse-reports/residents-report.html`

**Thresholds configurados:**
- Accessibility Score mínimo: **90/100** (WCAG AA)
- El script fallará si alguna página no cumple el threshold

---

## Interpretar Resultados

### Tests con axe-core

**Resultado exitoso:**
```
✓ Accessibility Tests › Login page should not have accessibility violations (Xms)
✓ Accessibility Tests › Dashboard should not have accessibility violations (Xms)
```

**Resultado con violaciones:**
```
✗ Accessibility Tests › Dashboard should not have accessibility violations

Accessibility violations found on /dashboard:
- color-contrast: Elements must have sufficient color contrast
  Impact: serious
  Nodes affected: 3
```

**Acciones:**
1. Revisar la consola para ver violaciones específicas
2. Cada violación incluye:
   - **ID**: Identificador de la regla violada
   - **Description**: Descripción del problema
   - **Impact**: serious, moderate, o minor
   - **Nodes**: Elementos afectados en el DOM

### Auditorías Lighthouse

**Resultado exitoso:**
```
✅ All pages meet the minimum accessibility score of 90/100
```

**Resultado con violaciones:**
```
❌ FAIL | Dashboard            | Score: 85/100
❌ Some pages did not meet the minimum accessibility score of 90/100
💡 Check the HTML reports in lighthouse-reports/ for detailed information
```

**Acciones:**
1. Abrir el reporte HTML en `lighthouse-reports/`
2. Revisar sección "Accessibility" para ver:
   - Score detallado por categoría
   - Oportunidades de mejora
   - Problemas detectados con descripción

---

## Configuración

### Thresholds y Reglas

**En `e2e/accessibility.spec.ts`:**
- Tags WCAG: `wcag2a`, `wcag2aa`, `wcag21aa`
- Todas las violaciones son consideradas críticas (fail si hay alguna)

**En `src/scripts/lighthouse-audit.ts`:**
- Accessibility Score mínimo: `90/100`
- Se puede ajustar cambiando `MIN_ACCESSIBILITY_SCORE`

### Variables de Entorno

**Para Lighthouse:**
```bash
BASE_URL=http://localhost:5173 npm run audit:lighthouse
```

Por defecto usa `http://localhost:5173` (dev server)

---

## Integración con CI/CD

### Ejecutar en CI

**En GitHub Actions u otro CI:**
```yaml
- name: Run accessibility tests
  run: npm run test:a11y

- name: Run Lighthouse audit
  run: npm run audit:lighthouse
```

**Recomendaciones:**
- Ejecutar en build antes de merge
- Fallar el build si hay violaciones críticas
- Subir reportes HTML como artifacts para revisión

### Reportes en CI

**Guardar reportes:**
- Los reportes HTML se guardan en `lighthouse-reports/`
- Pueden subirse como artifacts en CI para revisión manual

---

## Resolver Problemas Comunes

### Test falla porque página requiere autenticación

**Problema:**
```
Dashboard test skipped - redirected to login
```

**Solución:**
- Añadir setup de autenticación en tests cuando esté disponible
- Por ahora, los tests se saltan si detectan redirección a login

### Lighthouse no puede conectar al servidor

**Problema:**
```
Error: Unable to connect to http://localhost:5173
```

**Solución:**
1. Asegurar que el dev server está corriendo: `npm run dev`
2. O usar build de preview: `npm run build && npm run preview`
3. Ajustar `BASE_URL` si es necesario

### Violaciones de color-contrast

**Problema:**
```
color-contrast: Elements must have sufficient color contrast
```

**Solución:**
1. Revisar contraste de texto en componentes
2. Usar herramientas como [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
3. Ajustar colores en `src/assets/themes/semantic.css`
4. Objetivo: mínimo 4.5:1 para texto normal (WCAG AA)

### Violaciones de aria-labels faltantes

**Problema:**
```
button-name: Buttons must have accessible text
```

**Solución:**
1. Añadir `aria-label` a botones sin texto visible
2. O asegurar que hay texto asociado visualmente

---

## Mejores Prácticas

### Durante Desarrollo

1. **Ejecutar tests frecuentemente:**
   ```bash
   npm run test:a11y
   ```

2. **Revisar reportes Lighthouse antes de PR:**
   ```bash
   npm run audit:lighthouse
   ```

3. **Corregir violaciones inmediatamente:**
   - Evita acumulación de problemas
   - Facilita revisión de código

### Antes de Merge

1. **Ejecutar ambas auditorías:**
   ```bash
   npm run audit:a11y
   ```

2. **Verificar que todos los tests pasen:**
   - axe-core: 0 violaciones
   - Lighthouse: Score ≥ 90/100

3. **Revisar reportes HTML si hay dudas**

---

## Recursos Adicionales

### Documentación Oficial

- [axe-core Playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/overview/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Herramientas de Verificación Manual

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [axe DevTools Extension](https://chrome.google.com/webstore/detail/axe-devtools/lhdoppojpmngadmnindnejefpokejbdd)

---

**Última actualización:** 2026-01-18
**Mantenedor:** Equipo de desarrollo GeroCare
