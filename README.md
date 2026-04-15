# 🦷 Sonrisa Norte - Sitio Web Oficial

Sistema de gestión de citas dentales para Clínica Sonrisa Norte.

![Version](https://img.shields.io/badge/version-3.5-blue)
![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Tabla de Contenidos

- [Características](#características)
- [Demo](#demo)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Uso con Docker](#uso-con-docker)
- [DevOps](#devops)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Contribuir](#contribuir)
- [Equipo](#equipo)

## ✨ Características

- ✅ **Agendamiento de Citas Online** - Sistema completo de reservas
- ✅ **Consulta de Horarios** - Visualización en tiempo real de disponibilidad
- ✅ **Formulario de Contacto** - Integrado con FormSubmit
- ✅ **Diseño Responsivo** - Funciona en móviles y desktop
- ✅ **Integración WhatsApp** - Botón flotante de contacto directo
- ✅ **Google Sheets Backend** - Base de datos gratuita y accesible

## 🌐 Demo

**Producción:** [https://quorbitintelligence.github.io/SonrisaNorte/](https://quorbitintelligence.github.io/SonrisaNorte/)

## 🛠️ Tecnologías

### Frontend
- HTML5
- CSS3 / Tailwind CSS
- JavaScript (Vanilla)
- Font Awesome Icons

### Backend
- Google Apps Script (API REST)
- Google Sheets (Base de datos)

### DevOps
- GitHub Actions (CI/CD)
- Docker / Docker Compose
- Playwright (Tests E2E)
- GitHub Pages (Hosting)

## 📦 Instalación

### Opción 1: Local (Sin Docker)

```bash
# 1. Clonar repositorio
git clone https://github.com/QuorbitIntelligence/SonrisaNorte.git
cd SonrisaNorte

# 2. Abrir con servidor HTTP
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080

# Node.js (si tienes http-server instalado)
npx http-server -p 8080

# 3. Abrir en navegador
# http://localhost:8080
```

### Opción 2: Con Docker

```bash
# 1. Clonar repositorio
git clone https://github.com/QuorbitIntelligence/SonrisaNorte.git
cd SonrisaNorte

# 2. Construir y ejecutar
docker-compose up -d

# 3. Verificar que está corriendo
docker-compose ps

# 4. Ver logs
docker-compose logs -f

# 5. Abrir en navegador
# http://localhost:8080

# 6. Detener
docker-compose down
```

## 🐳 Uso con Docker

### Comandos Básicos

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Ver estado
docker-compose ps

# Reconstruir imagen
docker-compose build --no-cache
```

### Solo Docker (sin Compose)

```bash
# Construir imagen
docker build -t sonrisa-norte:latest .

# Ejecutar contenedor
docker run -d -p 8080:80 --name sonrisa-norte sonrisa-norte:latest

# Ver logs
docker logs -f sonrisa-norte

# Detener
docker stop sonrisa-norte

# Eliminar
docker rm sonrisa-norte
```

## 🚀 DevOps

### CI/CD Pipeline

Este proyecto usa **GitHub Actions** para automatización:

- ✅ Validación de HTML en cada push
- ✅ Tests E2E automatizados
- ✅ Deploy automático a GitHub Pages
- ✅ Verificación de sintaxis y estructura

### Workflows Activos

1. **deploy.yml** - CI/CD principal
   - Se ejecuta en push a `main`
   - Valida HTML
   - Verifica URLs y assets
   - Despliega a producción

2. **tests.yml** - Tests automatizados
   - 10 tests E2E con Playwright
   - Se ejecuta diariamente
   - Guarda reportes por 30 días

### Ver Estado de CI/CD

Badges en tiempo real:

```markdown
![CI/CD](https://github.com/QuorbitIntelligence/SonrisaNorte/workflows/CI/CD%20-%20Deploy%20Sonrisa%20Norte/badge.svg)
![Tests](https://github.com/QuorbitIntelligence/SonrisaNorte/workflows/E2E%20Tests/badge.svg)
```

## 📁 Estructura del Proyecto

```
SonrisaNorte/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # Pipeline CI/CD
│       └── tests.yml           # Tests automatizados
├── index.html                   # Sitio web principal
├── Dockerfile                   # Imagen Docker
├── docker-compose.yml           # Orquestación Docker
├── .dockerignore               # Archivos excluidos de Docker
├── README.md                   # Este archivo
└── DEVOPS.md                   # Documentación DevOps

Archivos en Google Apps Script:
└── Google_Apps_Script_CitasNuevas.gs
```

## 🧪 Tests

### Ejecutar Tests Localmente

```bash
# 1. Instalar dependencias
npm init -y
npm install -D @playwright/test

# 2. Instalar navegadores
npx playwright install

# 3. Ejecutar tests
npx playwright test

# 4. Ver reporte HTML
npx playwright show-report
```

### Tests Incluidos

1. Homepage debe cargar correctamente
2. Navegación debe estar presente
3. Botón "Agendar Cita" debe existir
4. Modal de citas debe abrirse
5. Formulario debe tener campos requeridos
6. Sección de servicios debe mostrar 6 servicios
7. Formulario de contacto debe existir
8. WhatsApp flotante debe estar presente
9. Footer debe contener información
10. Versión debe ser 3.5 o superior

## 🔧 Configuración

### Variables de Entorno

```bash
# URL de Google Apps Script
URL_API_CITAS=https://script.google.com/macros/s/[TU_ID]/exec

# Email para FormSubmit
CONTACT_EMAIL=emilio.jaimes.mtz2@gmail.com

# WhatsApp
WHATSAPP_NUMBER=5215582281999
```

### Google Apps Script

1. Crea una copia del archivo `Google_Apps_Script_CitasNuevas.gs`
2. Implementa como Web App
3. Configura acceso: "Cualquier persona"
4. Copia la URL generada
5. Actualiza `URL_API_CITAS` en `index.html`

### Google Sheets

Estructura requerida - Hoja "CitasNuevas":

| Columna | Campo |
|---------|-------|
| A | ID |
| B | FechaHoraRegistro |
| C | NombrePaciente |
| D | EmailPaciente |
| E | TelefonoPaciente |
| F | ServicioSolicitado |
| G | FechaCita |
| H | HorarioCita |
| I | MotivoConsulta |
| J | EstadoCita |
| K | IPCliente |
| L | Navegador |

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Commits Convencionales

```
feat: nueva característica
fix: corrección de bug
docs: cambios en documentación
style: formateo, sin cambios de código
refactor: refactorización de código
test: agregar tests
chore: actualizar dependencias
```

## 👥 Equipo

**TecMilenio - Proyecto Integrador DevOps**

- **Joshua Juarez Rueda** - 3070595
- **Emilio Jaimes Martínez** - 2931433
- **Daniela Cevedo Gonzales** - 3070394

**Profesor:** Héctor Antonio Aguilar Mogollan

## 📄 Licencia

Este proyecto es un proyecto académico para TecMilenio.

## 📞 Contacto

- **Email:** contacto@sonrisanorte.com
- **WhatsApp:** +52 55 8228 1999
- **Sitio Web:** [https://quorbitintelligence.github.io/SonrisaNorte/](https://quorbitintelligence.github.io/SonrisaNorte/)

---

## 📊 Métricas del Proyecto

- **Uptime:** 99.9% (GitHub Pages)
- **Tiempo de carga:** < 2 segundos
- **Tiempo de deploy:** ~2 minutos
- **Tests:** 10 tests E2E automatizados
- **Cobertura:** 100% de funcionalidades críticas

---

**Desarrollado con ❤️ por el equipo Sonrisa Norte**
