# Job Portal - Proyecto de Portafolio

> 🌐 Lea en: [Português (BR)](README.pt-BR.md) | [English](README.md) | **Español**

> 🌐 Lea en: [Português (BR)](README.pt-BR.md) | [English](README.md) | **Español**

Una aplicación full-stack de portal de empleos construida con Spring Boot 3.x y React 18. Incluye autenticación RBAC, búsqueda de texto completo, pipeline de postulaciones estilo Kanban, limitación de tasa, carga de archivos y seed automático de datos demostrativos.

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

## 🚀 Funcionalidades

### Autenticación & Seguridad
- **RBAC** - Tres perfiles: Candidato, Reclutador, Admin con rutas protegidas
- **JWT** - Autenticación stateless con tokens Bearer
- **Rate Limiting** - Filtro Bucket4j (100 req/min por IP)
- **CORS** - Configurado para proxy frontend

### Búsqueda & Descubrimiento de Empleos
- **Búsqueda Full-Text** - PostgreSQL `tsvector` + `plainto_tsquery`
- **Búsqueda Fuzzy** - Similitud trigram `pg_trgm` para títulos/descripciones
- **Filtros Facetados** - Remoto, tipo de empleo, nivel, rango salarial
- **Paginación** - Basada en cursor con conteo total

### Funcionalidades del Candidato
- **Wizard de Perfil** - Constructor multi-etapas (datos → experiencia → skills → preferencias)
- **Carga de Archivos** - Upload de CV/Resume PDF con almacenamiento local
- **Postulación 1-Clic** - Postúlate con perfil + CV por defecto
- **Dashboard** - Seguimiento de todas las postulaciones con estado colorido
- **Empleos Guardados** - Favoritar/bookmark de empleos
- **Alertas de Empleo** - Configura criterios de búsqueda (registrados en consola)

### Funcionalidades del Reclutador
- **Gestión de Empresas** - CRUD con upload de logo
- **Publicación de Empleos** - Crear, editar, pausar, cerrar, duplicar empleos
- **Tablero Kanban** - Drag-and-drop del pipeline de postulaciones (Applied → Screening → Interview → Offer → Hired)
- **Búsqueda Inversa** - Encuentra candidatos por skills + ubicación (operador `&&` de arrays PostgreSQL)
- **Notas por Candidato** - Agrega notas por postulación
- **Analytics** - Visualizaciones, postulaciones, funnel de conversión por empleo

### Funcionalidades del Admin
- **Métricas de la Plataforma** - Total de usuarios, empleos activos, postulaciones, empresas
- **Moderación de Empleos** - Aprobar/pausar/cerrar cualquier listing
- **Reset de Datos Demo** - Regenerar datos seed con un clic
- **Gráficos** - Visualización en gráfico de barras de las métricas

### Infraestructura
- **Seed Automático** - 50 empleos, 10 empresas, 30 candidatos, 100 aplicaciones vía JavaFaker
- **Dockerizado** - Stack completa con Docker Compose (PostgreSQL, Redis, Backend, Frontend)
- **Swagger UI** - Documentación OpenAPI 3.0 completa
- **Flyway** - Schema versionado (3 migraciones)
- **Notificaciones In-App** - Campana de notificaciones con contador de no leídas

## 🏁 Inicio Rápido

```bash
# Opción 1: Docker Compose (recomendado)
chmod +x start.sh
./start.sh

# Opción 2: Manual
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev
cd frontend && npm install && npm run dev
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

## 🏗️ Arquitectura

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React 18  │────▶│ Spring Boot  │────▶│ PostgreSQL  │
│   + Vite    │     │   3.x + JWT  │     │     16      │
│   + Tailwind│     │ + Bucket4j   │     │ + pg_trgm   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                     ┌─────────────┐
                     │    Redis    │
                     │  (cache)    │
                     └─────────────┘
```

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Spring Boot 3.2, Java 21, Spring Security, JWT, Bucket4j |
| Frontend | React 18, Vite, Tailwind CSS, Zustand, TanStack Query, Chart.js |
| Base de Datos | PostgreSQL 16 con JSONB, Full-Text Search, pg_trgm |
| Infra | Docker Compose, Flyway, Maven, Nginx |
| Pruebas | JUnit 5, Mockito, H2 (perfil de prueba) |

## 📋 Cuentas Demo

Después del seed, usa estas credenciales:
- **Admin**: `admin@jobportal.com` / `admin123`
- **Candidato**: Cualquier email de candidato seedado / `password123`
- **Reclutador**: Cualquier email de reclutador seedado / `password123`

## 📁 Estructura del Proyecto

```
job-portal/
├── backend/                          # Spring Boot (66 archivos Java)
│   └── src/main/java/com/jobportal/
│       ├── admin/controller/         # Endpoints admin
│       ├── application/              # Pipeline de postulaciones
│       ├── auth/                     # Autenticación JWT
│       ├── candidate/                # Perfiles de candidatos
│       ├── common/                   # Utilidades compartidas
│       ├── company/                  # Empresas y reclutadores
│       ├── config/                   # Security, CORS, Swagger, Rate limiting
│       ├── job/                      # Empleos, empleos guardados, alertas
│       ├── notification/             # Notificaciones in-app
│       ├── seed/                     # Datos demo JavaFaker
│       └── user/                     # Entidad User y auth
├── frontend/                         # React + Vite (15 componentes)
│   └── src/
│       ├── features/                 # Módulos por feature
│       ├── components/               # Componentes compartidos
│       ├── lib/                      # Cliente API Axios
│       └── store/                    # Zustand auth store
├── docker-compose.yml                # Orquestación full stack
├── start.sh                          # Script de inicio
└── README.md
```

## 🧪 Pruebas

```bash
cd backend
mvn test                    # Ejecutar todas las pruebas unitarias
mvn test -Dtest=AuthServiceTest   # Ejecutar prueba específica
```

## 📄 Licencia

MIT - Proyecto de Portafolio
