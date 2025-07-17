# CRM/ERP System with DandoriWork Integration

Construction-focused CRM/ERP system integrating with DandoriWork API for real-time project management and KPI tracking.

## 🏗️ Architecture

- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend**: React 18 + Vite + TypeScript + TanStack Query
- **Infrastructure**: Docker + GitHub Actions + Fly.io
- **Maps**: Google Maps Platform
- **Queue**: Redis + BullMQ

## 📦 Monorepo Structure

```
crm-monorepo/
├── crm-core/     # NestJS backend (API, sync workers)
├── crm-web/      # React/Vite frontend
├── crm-ops/      # IaC (Terraform/Fly.io) & GitHub Actions
└── docs/         # OpenAPI, ADRs, ER diagrams
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

### Setup

1. Clone the repository
```bash
git clone https://github.com/your-org/crm-monorepo.git
cd crm-monorepo
```

2. Install dependencies
```bash
pnpm install
```

3. Copy environment template
```bash
cp .env.template .env
```

4. Start development services
```bash
docker-compose up -d
pnpm dev
```

### Available Scripts

- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all packages
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all packages

## 🔑 Environment Variables

See `.env.template` for required environment variables.

## 📊 MVP Features (September Release)

- Multi-tenant architecture
- DandoriWork API integration (orders, bills, projects)
- Real-time KPI dashboard
- Google Maps integration with project visualization
- Role-based access control (Admin/Manager/Staff)
- Background sync workers
- Geocoding service

## 🧪 Testing

- Unit tests: Jest
- Integration tests: Supertest
- E2E tests: Playwright
- Coverage target: 70% (90% for critical services)

## 📝 Documentation

- API Documentation: `/docs/api/`
- Architecture Decision Records: `/docs/adr/`
- ER Diagrams: `/docs/erd/`

## 🤝 Contributing

Please read our contributing guidelines before submitting PRs.

## 📄 License

Proprietary - All rights reserved