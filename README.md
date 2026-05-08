# Job Portal — Portfolio Project

<p align="center">
  <a href="#-english">🇺🇸 English</a> |
  <a href="#-português">🇧🇷 Português</a> |
  <a href="#-español">🇪🇸 Español</a>
</p>

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

---

## 🇺🇸 English

<details open>
<summary><b>Click to collapse / expand</b></summary>

A full-stack job portal application built with Spring Boot 3.x and React 18. Features RBAC authentication, full-text search, Kanban-style application pipeline, rate limiting, file uploads, and automatic demo data seeding.

### Features

#### Authentication & Security
- **RBAC** — Three roles: Candidate, Recruiter, Admin with protected routes
- **JWT Authentication** — Stateless auth with Bearer tokens
- **Rate Limiting** — Bucket4j filter (100 req/min per IP)
- **CORS** — Configured for frontend proxy

#### Job Search & Discovery
- **Full-Text Search** — PostgreSQL `tsvector` + `plainto_tsquery`
- **Fuzzy Search** — `pg_trgm` trigram similarity for titles/descriptions
- **Faceted Filters** — Remote, job type, level, salary range
- **Pagination** — Cursor-based with total count

#### Candidate Features
- **Profile Wizard** — Multi-step profile builder (data → experience → skills → preferences)
- **File Upload** — CV/Resume PDF upload with local storage
- **1-Click Apply** — Apply with profile + default CV
- **Application Dashboard** — Track all applications with color-coded status
- **Saved Jobs** — Bookmark/favorite jobs
- **Job Alerts** — Configure search criteria alerts (logged to console)

#### Recruiter Features
- **Company Management** — CRUD with logo upload
- **Job Posting** — Create, edit, pause, close, duplicate jobs
- **Kanban Board** — Drag-and-drop application pipeline (Applied → Screening → Interview → Offer → Hired)
- **Reverse Search** — Find candidates by skills + location (PostgreSQL `&&` array operator)
- **Candidate Notes** — Add notes per application
- **Analytics** — Views, applications, conversion funnel per job

#### Admin Features
- **Platform Metrics** — Total users, active jobs, applications, companies
- **Job Moderation** — Approve/pause/close any job listing
- **Demo Data Reset** — Regenerate seed data with one click
- **Charts** — Bar chart visualization of platform metrics

#### Infrastructure
- **Auto Seed** — 50 jobs, 10 companies, 30 candidates, 100 applications via JavaFaker
- **Dockerized** — Full stack with Docker Compose (PostgreSQL, Redis, Backend, Frontend)
- **Swagger UI** — Complete OpenAPI 3.0 documentation
- **Flyway Migrations** — Versioned database schema (3 migrations)
- **In-App Notifications** — Real-time notification bell with unread count

### Quick Start

```bash
# Option 1: Docker Compose (recommended)
chmod +x start.sh
./start.sh

# Option 2: Manual
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev
cd frontend && npm install && npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

### Architecture

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

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Java 21, Spring Security, JWT, Bucket4j |
| Frontend | React 18, Vite, Tailwind CSS, Zustand, TanStack Query, Chart.js |
| Database | PostgreSQL 16 with JSONB, Full-Text Search, pg_trgm |
| Infra | Docker Compose, Flyway, Maven, Nginx |
| Testing | JUnit 5, Mockito, H2 (test profile) |

### Demo Accounts

After seeding, use these credentials:
- **Admin**: `admin@jobportal.com` / `admin123`
- **Candidate**: Any seeded candidate email / `password123`
- **Recruiter**: Any seeded recruiter email / `password123`

### Project Structure

```
job-portal/
├── backend/                          # Spring Boot (66 Java files)
│   └── src/main/java/com/jobportal/
│       ├── admin/controller/         # Admin endpoints
│       ├── application/              # Application pipeline
│       ├── auth/                     # JWT authentication
│       ├── candidate/                # Candidate profiles
│       ├── common/                   # Shared utilities
│       ├── company/                  # Companies & recruiters
│       ├── config/                   # Security, CORS, Swagger, Rate limiting
│       ├── job/                      # Jobs, saved jobs, alerts
│       ├── notification/             # In-app notifications
│       ├── seed/                     # JavaFaker demo data
│       └── user/                     # User entity & auth
├── frontend/                         # React + Vite (15 components)
│   └── src/
│       ├── features/                 # Feature modules
│       ├── components/               # Shared components
│       ├── lib/                      # Axios API client
│       └── store/                    # Zustand auth store
├── docker-compose.yml                # Full stack orchestration
├── start.sh                          # One-command startup
└── README.md
```

### Testing

```bash
cd backend
mvn test                    # Run all unit tests
mvn test -Dtest=AuthServiceTest   # Run specific test
```

### License

MIT — Portfolio Project

</details>

---

## 🇧🇷 Português

<details>
<summary><b>Clique para expandir</b></summary>

Uma aplicação full-stack de portal de empregos construída com Spring Boot 3.x e React 18. Recursos incluem autenticação RBAC, busca full-text, pipeline de candidaturas estilo Kanban, limitação de taxa, uploads de arquivos e seed automático de dados demonstrativos.

### Funcionalidades

#### Autenticação & Segurança
- **RBAC** — Três perfis: Candidato, Recrutador, Admin com rotas protegidas
- **JWT** — Autenticação stateless com tokens Bearer
- **Rate Limiting** — Filtro Bucket4j (100 req/min por IP)
- **CORS** — Configurado para proxy frontend

#### Busca & Descoberta de Vagas
- **Busca Full-Text** — PostgreSQL `tsvector` + `plainto_tsquery`
- **Busca Fuzzy** — Similaridade trigram `pg_trgm` para títulos/descrições
- **Filtros Facetados** — Remoto, tipo de vaga, nível, faixa salarial
- **Paginação** — Baseada em cursor com contagem total

#### Funcionalidades do Candidato
- **Wizard de Perfil** — Construtor multi-etapas (dados → experiência → skills → preferências)
- **Upload de Arquivos** — Upload de CV/Resume PDF com armazenamento local
- **Candidatura 1-Clique** — Candidate-se com perfil + CV padrão
- **Dashboard** — Acompanhe todas as candidaturas com status colorido
- **Vagas Salvas** — Favoritar/bookmark de vagas
- **Alertas de Vaga** — Configure critérios de busca (logados no console)

#### Funcionalidades do Recrutador
- **Gestão de Empresas** — CRUD com upload de logo
- **Publicação de Vagas** — Criar, editar, pausar, fechar, duplicar vagas
- **Quadro Kanban** — Drag-and-drop do pipeline de candidaturas (Applied → Screening → Interview → Offer → Hired)
- **Busca Reversa** — Encontre candidatos por skills + localização (operador `&&` de arrays PostgreSQL)
- **Notas por Candidato** — Adicione notas por candidatura
- **Analytics** — Visualizações, candidaturas, funil de conversão por vaga

#### Funcionalidades do Admin
- **Métricas da Plataforma** — Total de usuários, vagas ativas, candidaturas, empresas
- **Moderação de Vagas** — Aprovar/pausar/fechar qualquer listing
- **Reset de Dados Demo** — Regenerar dados seed com um clique
- **Gráficos** — Visualização em gráfico de barras das métricas

#### Infraestrutura
- **Seed Automático** — 50 vagas, 10 empresas, 30 candidatos, 100 aplicações via JavaFaker
- **Dockerizado** — Stack completa com Docker Compose (PostgreSQL, Redis, Backend, Frontend)
- **Swagger UI** — Documentação OpenAPI 3.0 completa
- **Flyway** — Schema versionado (3 migrações)
- **Notificações In-App** — Bell de notificações com contador de não lidas

### Início Rápido

```bash
# Opção 1: Docker Compose (recomendado)
chmod +x start.sh
./start.sh

# Opção 2: Manual
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev
cd frontend && npm install && npm run dev
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

### Arquitetura

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

### Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Backend | Spring Boot 3.2, Java 21, Spring Security, JWT, Bucket4j |
| Frontend | React 18, Vite, Tailwind CSS, Zustand, TanStack Query, Chart.js |
| Banco | PostgreSQL 16 com JSONB, Full-Text Search, pg_trgm |
| Infra | Docker Compose, Flyway, Maven, Nginx |
| Testes | JUnit 5, Mockito, H2 (perfil de teste) |

### Contas Demo

Após o seed, use estas credenciais:
- **Admin**: `admin@jobportal.com` / `admin123`
- **Candidato**: Qualquer email de candidato seedado / `password123`
- **Recrutador**: Qualquer email de recrutador seedado / `password123`

### Estrutura do Projeto

```
job-portal/
├── backend/                          # Spring Boot (66 arquivos Java)
│   └── src/main/java/com/jobportal/
│       ├── admin/controller/         # Endpoints admin
│       ├── application/              # Pipeline de candidaturas
│       ├── auth/                     # Autenticação JWT
│       ├── candidate/                # Perfis de candidatos
│       ├── common/                   # Utilitários compartilhados
│       ├── company/                  # Empresas e recrutadores
│       ├── config/                   # Security, CORS, Swagger, Rate limiting
│       ├── job/                      # Vagas, vagas salvas, alertas
│       ├── notification/             # Notificações in-app
│       ├── seed/                     # Dados demo JavaFaker
│       └── user/                     # Entidade User e auth
├── frontend/                         # React + Vite (15 componentes)
│   └── src/
│       ├── features/                 # Módulos por feature
│       ├── components/               # Componentes compartilhados
│       ├── lib/                      # Cliente API Axios
│       └── store/                    # Zustand auth store
├── docker-compose.yml                # Orquestração full stack
├── start.sh                          # Script de início
└── README.md
```

### Testes

```bash
cd backend
mvn test                    # Executar todos os testes unitários
mvn test -Dtest=AuthServiceTest   # Executar teste específico
```

### Licença

MIT — Projeto de Portfólio

</details>

---

## 🇪🇸 Español

<details>
<summary><b>Haz clic para expandir</b></summary>

Una aplicación full-stack de portal de empleos construida con Spring Boot 3.x y React 18. Incluye autenticación RBAC, búsqueda de texto completo, pipeline de postulaciones estilo Kanban, limitación de tasa, carga de archivos y seed automático de datos demostrativos.

### Funcionalidades

#### Autenticación & Seguridad
- **RBAC** — Tres perfiles: Candidato, Reclutador, Admin con rutas protegidas
- **JWT** — Autenticación stateless con tokens Bearer
- **Rate Limiting** — Filtro Bucket4j (100 req/min por IP)
- **CORS** — Configurado para proxy frontend

#### Búsqueda & Descubrimiento de Empleos
- **Búsqueda Full-Text** — PostgreSQL `tsvector` + `plainto_tsquery`
- **Búsqueda Fuzzy** — Similitud trigram `pg_trgm` para títulos/descripciones
- **Filtros Facetados** — Remoto, tipo de empleo, nivel, rango salarial
- **Paginación** — Basada en cursor con conteo total

#### Funcionalidades del Candidato
- **Wizard de Perfil** — Constructor multi-etapas (datos → experiencia → skills → preferencias)
- **Carga de Archivos** — Upload de CV/Resume PDF con almacenamiento local
- **Postulación 1-Clic** — Postúlate con perfil + CV por defecto
- **Dashboard** — Seguimiento de todas las postulaciones con estado colorido
- **Empleos Guardados** — Favoritar/bookmark de empleos
- **Alertas de Empleo** — Configura criterios de búsqueda (registrados en consola)

#### Funcionalidades del Reclutador
- **Gestión de Empresas** — CRUD con upload de logo
- **Publicación de Empleos** — Crear, editar, pausar, cerrar, duplicar empleos
- **Tablero Kanban** — Drag-and-drop del pipeline de postulaciones (Applied → Screening → Interview → Offer → Hired)
- **Búsqueda Inversa** — Encuentra candidatos por skills + ubicación (operador `&&` de arrays PostgreSQL)
- **Notas por Candidato** — Agrega notas por postulación
- **Analytics** — Visualizaciones, postulaciones, funnel de conversión por empleo

#### Funcionalidades del Admin
- **Métricas de la Plataforma** — Total de usuarios, empleos activos, postulaciones, empresas
- **Moderación de Empleos** — Aprobar/pausar/cerrar cualquier listing
- **Reset de Datos Demo** — Regenerar datos seed con un clic
- **Gráficos** — Visualización en gráfico de barras de las métricas

#### Infraestructura
- **Seed Automático** — 50 empleos, 10 empresas, 30 candidatos, 100 aplicaciones vía JavaFaker
- **Dockerizado** — Stack completa con Docker Compose (PostgreSQL, Redis, Backend, Frontend)
- **Swagger UI** — Documentación OpenAPI 3.0 completa
- **Flyway** — Schema versionado (3 migraciones)
- **Notificaciones In-App** — Campana de notificaciones con contador de no leídas

### Inicio Rápido

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

### Arquitectura

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

### Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Spring Boot 3.2, Java 21, Spring Security, JWT, Bucket4j |
| Frontend | React 18, Vite, Tailwind CSS, Zustand, TanStack Query, Chart.js |
| Base de Datos | PostgreSQL 16 con JSONB, Full-Text Search, pg_trgm |
| Infra | Docker Compose, Flyway, Maven, Nginx |
| Pruebas | JUnit 5, Mockito, H2 (perfil de prueba) |

### Cuentas Demo

Después del seed, usa estas credenciales:
- **Admin**: `admin@jobportal.com` / `admin123`
- **Candidato**: Cualquier email de candidato seedado / `password123`
- **Reclutador**: Cualquier email de reclutador seedado / `password123`

### Estructura del Proyecto

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

### Pruebas

```bash
cd backend
mvn test                    # Ejecutar todas las pruebas unitarias
mvn test -Dtest=AuthServiceTest   # Ejecutar prueba específica
```

### Licencia

MIT — Proyecto de Portafolio

</details>
