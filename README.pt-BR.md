# Job Portal - Projeto de Portfólio

> 🌐 Leia em: **Português (BR)** | [English](README.md) | [Español](README.es.md)

Uma aplicação full-stack de portal de empregos construída com Spring Boot 3.x e React 18. Recursos incluem autenticação RBAC, busca full-text, pipeline de candidaturas estilo Kanban, limitação de taxa, uploads de arquivos e seed automático de dados demonstrativos.

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

## 🚀 Funcionalidades

### Autenticação & Segurança
- **RBAC** - Três perfis: Candidato, Recrutador, Admin com rotas protegidas
- **JWT** - Autenticação stateless com tokens Bearer
- **Rate Limiting** - Filtro Bucket4j (100 req/min por IP)
- **CORS** - Configurado para proxy frontend

### Busca & Descoberta de Vagas
- **Busca Full-Text** - PostgreSQL `tsvector` + `plainto_tsquery`
- **Busca Fuzzy** - Similaridade trigram `pg_trgm` para títulos/descrições
- **Filtros Facetados** - Remoto, tipo de vaga, nível, faixa salarial
- **Paginação** - Baseada em cursor com contagem total

### Funcionalidades do Candidato
- **Wizard de Perfil** - Construtor multi-etapas (dados → experiência → skills → preferências)
- **Upload de Arquivos** - Upload de CV/Resume PDF com armazenamento local
- **Candidatura 1-Clique** - Candidate-se com perfil + CV padrão
- **Dashboard** - Acompanhe todas as candidaturas com status colorido
- **Vagas Salvas** - Favoritar/bookmark de vagas
- **Alertas de Vaga** - Configure critérios de busca (logados no console)

### Funcionalidades do Recrutador
- **Gestão de Empresas** - CRUD com upload de logo
- **Publicação de Vagas** - Criar, editar, pausar, fechar, duplicar vagas
- **Quadro Kanban** - Drag-and-drop do pipeline de candidaturas (Applied → Screening → Interview → Offer → Hired)
- **Busca Reversa** - Encontre candidatos por skills + localização (operador `&&` de arrays PostgreSQL)
- **Notas por Candidato** - Adicione notas por candidatura
- **Analytics** - Visualizações, candidaturas, funil de conversão por vaga

### Funcionalidades do Admin
- **Métricas da Plataforma** - Total de usuários, vagas ativas, candidaturas, empresas
- **Moderação de Vagas** - Aprovar/pausar/fechar qualquer listing
- **Reset de Dados Demo** - Regenerar dados seed com um clique
- **Gráficos** - Visualização em gráfico de barras das métricas

### Infraestrutura
- **Seed Automático** - 50 vagas, 10 empresas, 30 candidatos, 100 aplicações via JavaFaker
- **Dockerizado** - Stack completa com Docker Compose (PostgreSQL, Redis, Backend, Frontend)
- **Swagger UI** - Documentação OpenAPI 3.0 completa
- **Flyway** - Schema versionado (3 migrações)
- **Notificações In-App** - Bell de notificações com contador de não lidas

## 🏁 Início Rápido

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

## 🏗️ Arquitetura

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

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Backend | Spring Boot 3.2, Java 21, Spring Security, JWT, Bucket4j |
| Frontend | React 18, Vite, Tailwind CSS, Zustand, TanStack Query, Chart.js |
| Banco | PostgreSQL 16 com JSONB, Full-Text Search, pg_trgm |
| Infra | Docker Compose, Flyway, Maven, Nginx |
| Testes | JUnit 5, Mockito, H2 (perfil de teste) |

## 📋 Contas Demo

Após o seed, use estas credenciais:
- **Admin**: `admin@jobportal.com` / `admin123`
- **Candidato**: Qualquer email de candidato seedado / `password123`
- **Recrutador**: Qualquer email de recrutador seedado / `password123`

## 📁 Estrutura do Projeto

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

## 🧪 Testes

```bash
cd backend
mvn test                    # Executar todos os testes unitários
mvn test -Dtest=AuthServiceTest   # Executar teste específico
```

## 📄 Licença

MIT - Projeto de Portfólio
