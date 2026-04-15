# 🚀 Documentación DevOps - Sonrisa Norte

## 📋 Índice

1. [Arquitectura](#arquitectura)
2. [Pipeline CI/CD](#pipeline-cicd)
3. [Ambientes](#ambientes)
4. [Tests Automatizados](#tests-automatizados)
5. [Containerización](#containerización)
6. [Monitoreo](#monitoreo)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura

### Stack Tecnológico

```
┌─────────────────────────────────────────┐
│           CAPA DE PRESENTACIÓN          │
│  HTML5 + Tailwind CSS + JavaScript      │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│            CAPA DE HOSTING              │
│          GitHub Pages (CDN)             │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│           CAPA DE BACKEND               │
│      Google Apps Script (REST API)      │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│          CAPA DE DATOS                  │
│         Google Sheets (DB)              │
└─────────────────────────────────────────┘
```

### Flujo de Deploy

```
Desarrollador
    ↓
git push origin main
    ↓
GitHub Actions (CI/CD)
    ↓
Validación HTML
    ↓
Tests E2E
    ↓
Deploy a GitHub Pages
    ↓
Sitio en Producción
```

---

## 🔄 Pipeline CI/CD

### Workflow Principal: `deploy.yml`

**Trigger:** Push o Pull Request a `main`

**Stages:**

1. **Checkout** - Descarga código del repositorio
2. **Validate HTML** - Verifica que index.html existe y no está vacío
3. **Check Syntax** - Valida estructura HTML básica (DOCTYPE, html, head, body)
4. **Check Version** - Extrae y verifica número de versión
5. **Check API URLs** - Verifica que las URLs de Google Apps Script estén presentes
6. **Check Assets** - Verifica carga de Tailwind CSS y Font Awesome
7. **File Size Check** - Alerta si el archivo supera 100KB
8. **Generate Report** - Crea reporte con información del build
9. **Deploy** - Despliega a GitHub Pages (solo en push a main)

### Ejemplo de Ejecución

```bash
📥 Checkout code
✅ Validate HTML
✅ index.html encontrado
✅ index.html no está vacío
🔎 Check HTML syntax
✅ DOCTYPE correcto
✅ Tag <html> presente
✅ Tag <head> presente
✅ Tag <body> presente
✅ Tag de cierre </html> presente
🏷️ Check version
✅ Versión encontrada: v3.5
🔗 Check API URLs
✅ URL de Google Apps Script encontrada
📦 Check external assets
✅ Tailwind CSS encontrado
✅ Font Awesome encontrado
📊 File size check
📏 Tamaño del archivo: 85432 bytes
✅ Tamaño de archivo aceptable
🚀 Deploy to GitHub Pages
✅ GitHub Pages se actualizará automáticamente
```

---

## 🌍 Ambientes

### Production

- **URL:** https://quorbitintelligence.github.io/SonrisaNorte/
- **Branch:** `main`
- **Auto-deploy:** ✅ Sí
- **Hosting:** GitHub Pages
- **SSL:** ✅ Automático (GitHub)

### Development (Local)

- **URL:** http://localhost:8080
- **Branch:** `develop` o feature branches
- **Método:** Docker Compose
- **Comando:** `docker-compose up -d`

### Staging (Futuro)

- **URL:** TBD
- **Branch:** `staging`
- **Hosting:** Netlify o Vercel
- **Auto-deploy:** ✅ Sí

---

## 🧪 Tests Automatizados

### Workflow: `tests.yml`

**Trigger:**
- Push a `main` o `develop`
- Pull Request a `main`
- Cron diario a las 9 AM

**Tests Incluidos (10 total):**

| # | Test | Descripción |
|---|------|-------------|
| 1 | Homepage load | Verifica que el sitio cargue y tenga título correcto |
| 2 | Navegación visible | Verifica que el navbar esté presente |
| 3 | Botón agendar | Verifica existencia del botón principal |
| 4 | Modal funcional | Verifica que el modal de citas se abra |
| 5 | Campos de formulario | Verifica todos los inputs requeridos |
| 6 | Servicios | Verifica que se muestren los 6 servicios |
| 7 | Formulario contacto | Verifica presencia de FormSubmit |
| 8 | WhatsApp flotante | Verifica botón de contacto directo |
| 9 | Footer | Verifica información en pie de página |
| 10 | Versión | Verifica que sea v3.5 o superior |

### Ejecutar Tests Localmente

```bash
# Instalar Playwright
npm install -D @playwright/test
npx playwright install chromium

# Ejecutar todos los tests
npx playwright test

# Ejecutar en modo UI (interactivo)
npx playwright test --ui

# Ejecutar un test específico
npx playwright test -g "Homepage"

# Ver reporte
npx playwright show-report
```

### Interpretación de Resultados

```bash
✅ Passed  - Test exitoso
❌ Failed  - Test falló
⏭️ Skipped - Test omitido
⏱️ Timeout - Excedió tiempo límite
```

---

## 🐳 Containerización

### Dockerfile

**Base Image:** `nginx:alpine` (5 MB)

**Características:**
- Imagen ligera basada en Alpine Linux
- Nginx como servidor web
- Headers de seguridad configurados
- Compresión gzip activada
- Health check incluido

### Docker Compose

**Servicios:**
- `sonrisa-norte-web`: Servidor web principal

**Puertos:**
- `8080:80` - HTTP

**Volúmenes:**
- `./index.html` → `/usr/share/nginx/html/index.html` (read-only)

**Networks:**
- `sonrisa-network` (bridge)

### Comandos Docker

```bash
# Desarrollo
docker-compose up -d              # Iniciar en background
docker-compose logs -f            # Ver logs en tiempo real
docker-compose ps                 # Ver estado
docker-compose restart            # Reiniciar servicios
docker-compose down               # Detener y eliminar

# Reconstruir
docker-compose build --no-cache   # Rebuild completo
docker-compose up -d --build      # Rebuild y start

# Troubleshooting
docker-compose exec sonrisa-norte-web sh   # Entrar al contenedor
docker-compose logs sonrisa-norte-web      # Ver logs específicos
```

### Health Checks

El contenedor verifica su salud cada 30 segundos:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/
```

Estados:
- `healthy` - Funcionando correctamente
- `unhealthy` - Falló 3 health checks consecutivos
- `starting` - Iniciando (primeros 5 segundos)

---

## 📊 Monitoreo

### Métricas Clave

| Métrica | Valor Objetivo | Actual |
|---------|---------------|--------|
| Uptime | 99.9% | ✅ 99.9% |
| Tiempo de carga | < 3s | ✅ ~2s |
| Tiempo de deploy | < 5 min | ✅ ~2 min |
| Tests passing | 100% | ✅ 10/10 |

### GitHub Actions

**Ver estado de workflows:**
```
Repositorio → Actions → Select workflow
```

**Badges de estado:**
```markdown
![CI/CD](https://github.com/QuorbitIntelligence/SonrisaNorte/workflows/deploy/badge.svg)
![Tests](https://github.com/QuorbitIntelligence/SonrisaNorte/workflows/tests/badge.svg)
```

### Logs

**GitHub Pages logs:**
- Settings → Pages → Ver último deploy

**Docker logs:**
```bash
docker-compose logs -f sonrisa-norte-web
```

**GitHub Actions logs:**
- Actions → Click en workflow run → Ver detalles

---

## 🔧 Troubleshooting

### Problema: Pipeline falla en validación HTML

**Síntoma:** ❌ Error en step "Validate HTML"

**Solución:**
```bash
# Verificar que index.html existe y no está vacío
ls -lh index.html
cat index.html | wc -l

# Verificar sintaxis básica
grep "<!DOCTYPE html>" index.html
grep "</html>" index.html
```

---

### Problema: Tests E2E fallan

**Síntoma:** ❌ Tests timeout o no encuentran elementos

**Solución:**
```bash
# Verificar que el sitio está accesible
curl -I https://quorbitintelligence.github.io/SonrisaNorte/

# Ejecutar tests localmente en modo debug
npx playwright test --debug

# Ver screenshots de fallos
ls -lh test-results/
```

---

### Problema: Docker no inicia

**Síntoma:** Container exits inmediatamente

**Solución:**
```bash
# Ver logs
docker-compose logs sonrisa-norte-web

# Verificar configuración
docker-compose config

# Verificar puertos disponibles
netstat -tuln | grep 8080

# Reconstruir sin cache
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

### Problema: Cambios no se reflejan en GitHub Pages

**Síntoma:** Sitio no actualiza después de push

**Solución:**
1. Espera 2-3 minutos (puede tardar)
2. Verifica que el workflow terminó: Actions → deploy.yml
3. Fuerza refresh: Ctrl + Shift + R
4. Limpia caché del navegador
5. Verifica en modo incógnito

```bash
# Verificar último deploy
curl -I https://quorbitintelligence.github.io/SonrisaNorte/
# Ver header "last-modified"
```

---

### Problema: API de Google Apps Script falla

**Síntoma:** Error CORS o "Failed to fetch"

**Solución:**
1. Verifica URL en `index.html`:
```javascript
const URL_API_CITAS = 'https://script.google.com/macros/s/[TU_ID]/exec';
```

2. Verifica permisos en Apps Script:
   - Implementar → Administrar implementaciones
   - "Quién tiene acceso": **"Cualquier persona"**

3. Prueba la URL directamente:
```bash
curl "https://script.google.com/macros/s/[TU_ID]/exec?accion=ping"
```

---

## 📈 Mejoras Futuras (Nivel Intermedio)

### Próximos Pasos

- [ ] **Múltiples ambientes** (dev/staging/prod)
- [ ] **Tests de performance** (Lighthouse CI)
- [ ] **Code coverage** (mínimo 80%)
- [ ] **Secrets management** (GitHub Secrets)
- [ ] **Rollback automático** en caso de fallo
- [ ] **Notificaciones** (Slack/Discord)
- [ ] **Métricas avanzadas** (Sentry, DataDog)

---

## 📞 Soporte

**Issues:** https://github.com/QuorbitIntelligence/SonrisaNorte/issues

**Equipo DevOps:**
- Joshua Juarez - 3070595
- Emilio Jaimes - 2931433
- Daniela Cevedo - 3070394

---

**Última actualización:** Marzo 2026  
**Versión:** 3.5  
**Estado:** ✅ Producción
