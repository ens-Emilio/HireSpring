# Mock API

Dados mock para desenvolvimento frontend sem backend.

## Como Usar

### Ativar Mocks
Crie um arquivo `.env.local` no diretório `frontend/` com:
```
VITE_USE_MOCKS=true
```

Ou defina a variável de ambiente antes de rodar:
```bash
VITE_USE_MOCKS=true npm run dev
```

### Desativar Mocks
Remova a variável ou defina como `false`:
```
VITE_USE_MOCKS=false
```

## Dados Disponíveis

- **Jobs**: 12 vagas mock com diferentes tipos, níveis e localidades
- **Usuários**: Mock para Candidate, Recruiter e Admin
- **Aplicações**: Candidaturas em diferentes estágios do Kanban
- **Notificações**: Notificações mock para testes
- **Empresas**: Dados de empresas para testes
- **Estatísticas Admin**: Métricas mock para dashboard

## Credenciais Mock

| Email | Senha | Role |
|-------|-------|------|
| admin@jobportal.com | qualquer | ADMIN |
| candidate@example.com | qualquer | CANDIDATE |
| recruiter@example.com | qualquer | RECRUITER |

## Endpoints Suportados

- `GET/POST /auth/login`, `/auth/register`, `/auth/me`
- `GET /jobs` (com filtros: search, remote, jobType, level, page)
- `GET /jobs/:id`
- `GET/POST /applications`
- `GET/PUT /applications/:id/stage`
- `GET/POST /saved-jobs`
- `GET /notifications`
- `GET /candidates/profile`
- `GET /companies`
- `GET /recruiter/jobs`
- `GET /admin/stats`
