# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CLE Local** — A local events and attractions aggregator for Cleveland, Ohio. Surfaces what's happening around the city: theme parks, zoos (Cleveland Metroparks Zoo), museums, festivals, concerts, and other attractions.

## Architecture

Full-stack application with three layers:

### Frontend (React + TypeScript + Vite)
- Run locally with `npm run dev` (NOT in Docker)
- Located in project root (`src/`)
- Talks to the FastAPI backend via REST API at `http://localhost:8000`

### Backend (FastAPI + Python)
- Located in `backend/`
- Runs in Docker via `docker-compose up`
- Provides REST API endpoints for events, venues, and categories
- Uses SQLAlchemy ORM with Pydantic schemas

### Database (PostgreSQL)
- Runs in Docker via `docker-compose up`
- Accessed only by the backend, never directly by the frontend

## Development Commands

### Frontend
- `npm run dev` — Start the Vite dev server with HMR
- `npm run build` — Build for production (TypeScript compiler + Vite build)
- `npm run lint` — Run ESLint
- `npm run preview` — Preview the production build

### Backend
- `docker-compose up` — Start FastAPI + PostgreSQL containers
- `docker-compose up --build` — Rebuild and start (after dependency changes)
- `docker-compose down` — Stop containers
- `docker-compose down -v` — Stop containers and remove volumes (resets DB)

## Project Structure

```
/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components (EventCard, Header, Filters, etc.)
│   ├── views/              # Page-level components (Home, EventDetail, Search)
│   ├── services/           # API client functions (calls FastAPI)
│   └── types/              # Shared TypeScript interfaces
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app entry point + CORS config
│   │   ├── routers/        # API route modules (events, venues, categories)
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/       # Business logic, scrapers, data ingestion
│   │   └── db.py           # Database session and connection
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml      # Dev only — runs FastAPI + PostgreSQL
├── package.json            # Frontend dependencies
└── CLAUDE.md
```

## Key Conventions

- **Styling**: Tailwind CSS utility-first approach
- **API Communication**: Frontend uses fetch/axios to call FastAPI; never accesses DB directly
- **Security**: External links use `rel="noopener noreferrer"`; API inputs validated via Pydantic
- **Docker**: Dev-only. Frontend runs locally outside Docker for fast HMR
- **Database**: PostgreSQL with SQLAlchemy ORM. Migrations tracked (Alembic when needed)
- **Environment Variables**: Stored in `.env` (git-ignored). Backend reads DB credentials and API keys from environment

## Data Sources (Cleveland, OH)

Target sources for local events and attractions:
- Cleveland Metroparks Zoo
- Cedar Point / regional theme parks
- Rock & Roll Hall of Fame
- Cleveland Museum of Art
- Playhouse Square
- Local festivals and seasonal events
- Public APIs: Eventbrite, Google Places, Yelp (as applicable)
