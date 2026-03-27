# AquaForum AI

Foro de debate multi-agente impulsado por IA para analizar el impacto de la inteligencia artificial en la industria del agua. Panelistas virtuales con perfiles especializados debaten en tiempo real, moderados por IA, con análisis experto integrado.

## Arquitectura

```
┌─────────────┐        Supabase Realtime        ┌─────────────────┐
│  Next.js 16  │ ◄──────────────────────────────► │   FastAPI + 	  │
│  React 19    │         WebSocket               │   LangGraph     │
│  Tailwind v4 │ ──── HTTP ────────────────────► │   Claude API    │
└─────────────┘                                  └────────┬────────┘
     Vercel                                           Railway
                                                         │
                                                   ┌─────▼─────┐
                                                   │  Supabase  │
                                                   │  Postgres  │
                                                   └───────────┘
```

**Flujo:** Landing → Setup (tema + panelistas) → Foro en vivo → Exportar (Word/Markdown)

**Motor de debate (LangGraph):**
`moderator_open → agent_turn → handle_challenge → moderator_check → expert_analysis → integration → round_summary → final_summary`

## Stack

| Capa | Tecnologías |
|------|-------------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, Zustand, Framer Motion, Shadcn |
| Backend | FastAPI, LangGraph, langchain-anthropic (Claude), Pydantic |
| Base de datos | Supabase (Postgres + Realtime) |
| Búsqueda web | Tavily |
| TTS | Edge TTS (voces nativas en español) |
| Exportación | python-docx (Word), Markdown |
| Monorepo | Turborepo |

## Requisitos previos

- Node.js 24+
- Python 3.11+
- Proyecto en [Supabase](https://supabase.com)
- API keys: Anthropic, Tavily, Supabase

## Inicio rápido

### 1. Clonar y configurar variables de entorno

```bash
git clone <repo-url> && cd Aquaforum
cp .env.example .env
# Editar .env con tus API keys
```

### 2. Frontend

```bash
npm install
npm run dev          # http://localhost:3000
```

### 3. Backend

```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env  # Configurar API keys
uvicorn app.main:app --reload --port 8000
```

### 4. Ambos a la vez (Turborepo)

```bash
npm run dev          # Lanza frontend y backend en paralelo
```

## Estructura del proyecto

```
Aquaforum/
├── apps/
│   ├── web/                  # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/          # Rutas (landing, setup, forum)
│   │   │   ├── components/   # UI (message-bubble, typing-indicator, etc.)
│   │   │   ├── hooks/        # use-forum-realtime
│   │   │   ├── store/        # Zustand (forum-store)
│   │   │   └── lib/          # API client, Supabase client
│   │   └── package.json
│   └── api/                  # Backend FastAPI
│       ├── app/
│       │   ├── engine/       # LangGraph: graph, nodes, prompts, routing, state
│       │   ├── routers/      # Endpoints REST
│       │   ├── services/     # Supabase, TTS, export Word
│       │   └── models/       # Schemas Pydantic
│       ├── pyproject.toml
│       └── Dockerfile
├── turbo.json
├── railway.json
└── .env.example
```

## API endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/forum/start` | Iniciar sesión de debate |
| `POST` | `/forum/{id}/next-cycle` | Ejecutar siguiente ronda |
| `GET` | `/forum/{id}/state` | Estado de la sesión |
| `POST` | `/forum/{id}/export` | Exportar a Markdown |
| `GET` | `/forum/{id}/export-docx` | Exportar a Word |
| `GET` | `/forum/{id}/audio/{msg_id}` | Generar audio TTS |
| `GET` | `/health` | Health check |

## Deploy

- **Frontend:** Vercel (root directory: `apps/web`)
- **Backend:** Railway (Dockerfile en `apps/api/Dockerfile`, puerto 8000)

## Base de datos (Supabase)

Tablas principales: `forum_sessions`, `forum_messages`, `pipeline_status`, `round_analyses`, `agent_memory`, `reports`

## Licencia

MIT
