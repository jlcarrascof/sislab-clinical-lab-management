# SisLab — Clinical Lab Management

Multi-tenant clinical laboratory management system: patients, scheduling, test catalog with reference ranges, work orders, auto-classified results, PDF reports, billing and daily cash register, plus AI-assisted interpretation. Built with NestJS, PostgreSQL, Redis, Vue 3 and Tailwind.

| Layer | Stack |
|---|---|
| API | NestJS 11 + TypeScript + PostgreSQL (TypeORM) + Redis |
| Web | Vue 3 + TypeScript + Pinia + Tailwind v4 |

## Structure

```
sislab/
├── sislab-api/        # NestJS
├── sislab-frontend/   # Vue 3
└── docker-compose.yml # PostgreSQL + Redis for local development
```

## Local development

```bash
nvm use                 # Node 22 (.nvmrc)
docker compose up -d    # PostgreSQL :5433, Redis :6380
```
